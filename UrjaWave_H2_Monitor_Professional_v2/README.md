# UrjaWave H₂ Monitor 

**Industrial Hydrogen Generation Monitoring & Safety Platform**

UrjaWave is a software demonstrator for monitoring hydrogen-generation systems with real-time telemetry, safety evaluation, authenticated operator access, role-based permissions, persistent local storage, audit logging and reporting.

## v2 engineering upgrades

- SQLite persistence
- bcrypt password hashing + JWT sessions
- Viewer / Operator / Admin roles
- Protected REST API + authenticated Socket.IO
- Device credential for hardware telemetry ingestion
- Server-side safety alarm evaluation and duplicate suppression
- Alert acknowledgement + audit trail
- Device status management
- CSV reporting
- Helmet security headers + rate limiting
- Docker + Docker Compose
- GitHub Actions CI
- Architecture documentation

## Architecture

```text
Sensors / PLC / DAQ
       ↓
Hardware Gateway
       ↓
Validated Telemetry API
       ↓
Safety + Persistence Layer
   ↙        ↓        ↘
SQLite    Audit     Alerts
       ↓
Socket.IO
       ↓
React Operations Console
```

## Local setup

### Backend
```powershell
cd backend
copy .env.example .env
npm install
npm start
```
API: `http://localhost:5000`  
Health: `http://localhost:5000/health`

Demo administrator: `admin@urjawave.local` / `ChangeMe123!`

**Change the password and JWT/device secrets before deployment.**

### Frontend
```powershell
cd frontend
npm install
npm run dev
```
Dashboard: `http://localhost:3000`

## Hardware telemetry

Send `POST /api/v1/telemetry` with `X-Device-Key: <DEVICE_INGEST_KEY>`.

```json
{
  "deviceId": "UW-ELECTROLYZER-01",
  "hydrogenFlow": 8.42,
  "pressure": 14.8,
  "temperature": 63.2,
  "phLevel": 7.1,
  "voltage": 48.6,
  "current": 18.4,
  "efficiency": 82.5
}
```

This is the integration boundary for an ESP32, PLC, DAQ or gateway. It does not pretend demo telemetry is physical plant data.

## Production roadmap

- MQTT / Modbus / OPC-UA protocol adapters
- PostgreSQL/TimescaleDB for multi-site deployment
- SSO/OIDC + MFA
- alert notification integrations
- device key rotation and signed device identities
- automated backup/disaster recovery
- comprehensive E2E tests
- Kubernetes deployment for multi-site operations
