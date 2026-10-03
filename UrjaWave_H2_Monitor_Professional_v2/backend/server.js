import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';

const PORT=Number(process.env.PORT||5000), DB_FILE=process.env.DB_FILE||'./data/urjawave.db';
fs.mkdirSync(path.dirname(DB_FILE),{recursive:true});
const db=new Database(DB_FILE); db.pragma('journal_mode = WAL');
db.exec(`CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,name TEXT NOT NULL,password_hash TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'viewer',created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS telemetry(id INTEGER PRIMARY KEY AUTOINCREMENT,device_id TEXT NOT NULL,hydrogen_flow REAL NOT NULL,pressure REAL NOT NULL,temperature REAL NOT NULL,ph_level REAL NOT NULL,voltage REAL NOT NULL,current REAL NOT NULL,efficiency REAL NOT NULL,timestamp TEXT NOT NULL,source TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS devices(device_id TEXT PRIMARY KEY,name TEXT NOT NULL,type TEXT NOT NULL,location TEXT NOT NULL,status TEXT NOT NULL,last_seen TEXT,device_key_hash TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS alerts(id TEXT PRIMARY KEY,severity TEXT NOT NULL,metric TEXT NOT NULL,message TEXT NOT NULL,timestamp TEXT NOT NULL,acknowledged INTEGER NOT NULL DEFAULT 0,acknowledged_by TEXT,acknowledged_at TEXT,device_id TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS audit_logs(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT,action TEXT NOT NULL,entity TEXT NOT NULL,entity_id TEXT,details TEXT,timestamp TEXT NOT NULL,ip TEXT);`);
const app=express(),server=http.createServer(app),io=new Server(server,{cors:{origin:process.env.CORS_ORIGIN||'*'}});
app.use(helmet()); app.use(cors({origin:process.env.CORS_ORIGIN||true})); app.use(express.json({limit:'256kb'}));
app.use(rateLimit({windowMs:60000,max:240,standardHeaders:true,legacyHeaders:false}));
const started=Date.now(), now=()=>new Date().toISOString(), mode=()=>process.env.TELEMETRY_MODE||'demo';
const limits={pressure:18,temperature:82,efficiency:65,phLow:6.5,phHigh:7.8};
const jwtSecret=process.env.JWT_SECRET||'change-this-in-production', deviceKey=process.env.DEVICE_INGEST_KEY||'change-this-device-key';
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const audit=(u,action,entity,id,details,req)=>db.prepare('INSERT INTO audit_logs(user_id,action,entity,entity_id,details,timestamp,ip) VALUES(?,?,?,?,?,?,?)').run(u?.id||null,action,entity,id||null,details?JSON.stringify(details):null,now(),req.ip);
async function seed(){if(!db.prepare('SELECT 1 FROM users LIMIT 1').get()){const email=process.env.ADMIN_EMAIL||'admin@urjawave.local',pass=process.env.ADMIN_PASSWORD||'ChangeMe123!';db.prepare('INSERT INTO users VALUES(?,?,?,?,?,?)').run(crypto.randomUUID(),email,'System Administrator',await bcrypt.hash(pass,12),'admin',now())}}
await seed();
for(const d of [['UW-ELECTROLYZER-01','PEM Electrolyzer — Unit 01','Electrolyzer','Hydrogen Generation Bay'],['UW-WATER-01','Water Quality Module','Process Sensor','Pre-treatment Line'],['UW-POWER-01','DC Power Module','Power Monitor','Electrical Panel']]) if(!db.prepare('SELECT 1 FROM devices WHERE device_id=?').get(d[0])) db.prepare('INSERT INTO devices VALUES(?,?,?,?,?,?,?)').run(...d,'online',now(),hash(deviceKey));
function token(u){return jwt.sign({sub:u.id,email:u.email,name:u.name,role:u.role},jwtSecret,{expiresIn:'8h'})}
function auth(req,res,next){const h=req.headers.authorization||'';try{if(!h.startsWith('Bearer '))throw 0;req.user=jwt.verify(h.slice(7),jwtSecret);next()}catch{res.status(401).json({error:'Authentication required'})}}
const roles=r=>(req,res,next)=>r.includes(req.user.role)?next():res.status(403).json({error:'Insufficient permissions'});
function deviceAuth(req,res,next){if(!req.headers['x-device-key']||hash(req.headers['x-device-key'])!==hash(deviceKey))return res.status(401).json({error:'Invalid device credential'});next()}
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function reading(b={}){const t=Date.now()/1000;return {deviceId:b.deviceId||'UW-ELECTROLYZER-01',hydrogenFlow:+(b.hydrogenFlow??8.2+Math.sin(t/11)*.35),pressure:+(b.pressure??14.2+Math.sin(t/17)*.45),temperature:+(b.temperature??61+Math.sin(t/23)*2.2),phLevel:+(b.phLevel??7.05+Math.sin(t/31)*.08),voltage:+(b.voltage??48+Math.sin(t/19)*1.1),current:+(b.current??18+Math.sin(t/13)*1.4),efficiency:+(b.efficiency??81.5+Math.sin(t/29)*2.5),timestamp:b.timestamp||now(),source:b.source||'DEMO'}}
function map(r){return {deviceId:r.device_id,hydrogenFlow:r.hydrogen_flow,pressure:r.pressure,temperature:r.temperature,phLevel:r.ph_level,voltage:r.voltage,current:r.current,efficiency:r.efficiency,timestamp:r.timestamp,source:r.source}}
function evaluate(r){for(const [hit,msg,severity,metric] of [[r.pressure>19.5,'Pressure above critical limit','critical','pressure'],[r.pressure>limits.pressure,'Pressure approaching high operating limit','warning','pressure'],[r.temperature>88,'Temperature above critical limit','critical','temperature'],[r.temperature>limits.temperature,'Temperature approaching high operating limit','warning','temperature'],[r.phLevel<limits.phLow||r.phLevel>limits.phHigh,'Water quality pH outside preferred band','warning','phLevel'],[r.efficiency<limits.efficiency,'System efficiency below operating target','warning','efficiency']]) if(hit){const recent=db.prepare('SELECT 1 FROM alerts WHERE metric=? AND device_id=? AND acknowledged=0 AND timestamp>? LIMIT 1').get(metric,r.deviceId,new Date(Date.now()-30000).toISOString());if(!recent){const a={id:crypto.randomUUID(),severity,metric,message:msg,timestamp:r.timestamp,deviceId:r.deviceId};db.prepare('INSERT INTO alerts(id,severity,metric,message,timestamp,acknowledged,device_id) VALUES(?,?,?,?,?,?,0)').run(a.id,a.severity,a.metric,a.message,a.timestamp,a.deviceId);io.emit('alert',a)}}}
function save(r){db.prepare('INSERT INTO telemetry(device_id,hydrogen_flow,pressure,temperature,ph_level,voltage,current,efficiency,timestamp,source) VALUES(?,?,?,?,?,?,?,?,?,?)').run(r.deviceId,r.hydrogenFlow,r.pressure,r.temperature,r.phLevel,r.voltage,r.current,r.efficiency,r.timestamp,r.source);db.prepare('UPDATE devices SET last_seen=?,status=? WHERE device_id=?').run(r.timestamp,'online',r.deviceId);evaluate(r);io.emit('telemetry',r)}
for(let i=39;i>=0;i--)save({...reading(),timestamp:new Date(Date.now()-i*15000).toISOString()});

app.get('/health',(_,res)=>res.json({status:'ok',service:'UrjaWave H2 Monitor API',uptime:Math.round((Date.now()-started)/1000),database:'sqlite',telemetryMode:mode()}));
app.post('/api/v1/auth/register',async(req,res)=>{const {email,name,password}=req.body||{};if(!email||!name||!password||password.length<8)return res.status(400).json({error:'Name, email and 8+ character password are required'});if(db.prepare('SELECT 1 FROM users WHERE email=?').get(email.toLowerCase()))return res.status(409).json({error:'Account already exists'});const id=crypto.randomUUID(),u={id,email:email.toLowerCase(),name,role:'viewer'};db.prepare('INSERT INTO users VALUES(?,?,?,?,?,?)').run(id,u.email,name,await bcrypt.hash(password,12),'viewer',now());audit(u,'REGISTER','user',id,{},req);res.status(201).json({token:token(u),user:u})});
app.post('/api/v1/auth/login',async(req,res)=>{const row=db.prepare('SELECT * FROM users WHERE email=?').get(String(req.body?.email||'').toLowerCase());if(!row||!(await bcrypt.compare(req.body?.password||'',row.password_hash)))return res.status(401).json({error:'Invalid email or password'});const u={id:row.id,email:row.email,name:row.name,role:row.role};audit(u,'LOGIN','user',u.id,{},req);res.json({token:token(u),user:u})});
app.get('/api/v1/auth/me',auth,(req,res)=>res.json({user:req.user}));
app.use('/api/v1',(req,res,next)=>req.method==='POST'&&req.path==='/telemetry'?deviceAuth(req,res,next):auth(req,res,next));
app.get('/api/v1/overview',(_,res)=>{const r=db.prepare('SELECT * FROM telemetry ORDER BY id DESC LIMIT 1').get();res.json({plant:{name:'UrjaWave Hydrogen Generation Facility',site:'Hydrogen Generation Bay',status:'operational',operatingMode:mode()==='hardware'?'LIVE HARDWARE':'DEMO'},latest:r?map(r):null,limits})});
app.get('/api/v1/telemetry',(req,res)=>{const n=clamp(Number(req.query.limit||80),1,500);res.json({data:db.prepare('SELECT * FROM telemetry ORDER BY id DESC LIMIT ?').all(n).reverse().map(map)})});
app.get('/api/v1/devices',(_,res)=>res.json({data:db.prepare('SELECT device_id as deviceId,name,type,location,status,last_seen as lastSeen FROM devices').all()}));
app.get('/api/v1/alerts',(_,res)=>res.json({data:db.prepare('SELECT id,severity,metric,message,timestamp,acknowledged,device_id as deviceId,acknowledged_by as acknowledgedBy,acknowledged_at as acknowledgedAt FROM alerts ORDER BY timestamp DESC LIMIT 100').all().map(x=>({...x,acknowledged:!!x.acknowledged}))}));
app.post('/api/v1/alerts/:id/acknowledge',roles(['admin','operator']),(req,res)=>{const a=db.prepare('SELECT * FROM alerts WHERE id=?').get(req.params.id);if(!a)return res.status(404).json({error:'Alert not found'});const t=now();db.prepare('UPDATE alerts SET acknowledged=1,acknowledged_by=?,acknowledged_at=? WHERE id=?').run(req.user.email,t,a.id);audit(req.user,'ACKNOWLEDGE','alert',a.id,{},req);io.emit('alert-updated',{...a,acknowledged:true,acknowledgedBy:req.user.email,acknowledgedAt:t});res.json({ok:true})});
app.get('/api/v1/report.csv',(req,res)=>{const rows=db.prepare('SELECT * FROM telemetry ORDER BY id').all();const esc=v=>`"${String(v).replaceAll('"','""')}"`;const h='timestamp,deviceId,hydrogenFlow,pressure,temperature,phLevel,voltage,current,efficiency,source\n';res.setHeader('Content-Type','text/csv');res.setHeader('Content-Disposition','attachment; filename="urjawave-h2-telemetry.csv"');res.send(h+rows.map(r=>[r.timestamp,r.device_id,r.hydrogen_flow,r.pressure,r.temperature,r.ph_level,r.voltage,r.current,r.efficiency,r.source].map(esc).join(',')).join('\n'));audit(req.user,'EXPORT','telemetry',null,{format:'csv'},req)});
app.get('/api/v1/audit-logs',roles(['admin']),(req,res)=>res.json({data:db.prepare('SELECT id,user_id as userId,action,entity,entity_id as entityId,details,timestamp,ip FROM audit_logs ORDER BY id DESC LIMIT 200').all()}));
app.patch('/api/v1/devices/:id/status',roles(['admin','operator']),(req,res)=>{const s=['online','offline','maintenance'].includes(req.body?.status)?req.body.status:null;if(!s)return res.status(400).json({error:'Invalid status'});db.prepare('UPDATE devices SET status=? WHERE device_id=?').run(s,req.params.id);audit(req.user,'UPDATE_STATUS','device',req.params.id,{status:s},req);res.json({ok:true})});
app.post('/api/v1/telemetry',deviceAuth,(req,res)=>{const b=req.body||{};if(!b.deviceId)return res.status(400).json({error:'deviceId is required'});for(const k of ['hydrogenFlow','pressure','temperature','phLevel','voltage','current','efficiency'])if(b[k]!==undefined&&!Number.isFinite(Number(b[k])))return res.status(400).json({error:`${k} must be numeric`});const r=reading({...b,source:'HARDWARE'});save(r);res.status(201).json({data:r})});
io.use((s,n)=>{try{s.user=jwt.verify(s.handshake.auth?.token,jwtSecret);n()}catch{n(new Error('unauthorized'))}});
io.on('connection',s=>s.emit('snapshot',db.prepare('SELECT * FROM telemetry ORDER BY id DESC LIMIT 80').all().reverse().map(map)));
if(mode()!=='hardware')setInterval(()=>save(reading()),2000);
server.listen(PORT,()=>console.log(`UrjaWave H2 Monitor API | http://localhost:${PORT} | mode=${mode()}`));
