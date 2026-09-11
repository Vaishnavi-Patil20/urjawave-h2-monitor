import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ScrollText, Shield, FileText, User, Clock } from 'lucide-react';
import { auditAPI } from '../services/api';

const AuditTrail = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try { const res = await auditAPI.list(100); setLogs(res.data || []); } catch (e) {} finally { setLoading(false); }
  };

  const getIcon = (action) => {
    if (action.includes('CASE')) return FileText;
    if (action.includes('USER')) return User;
    if (action.includes('RISK')) return Shield;
    return ScrollText;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><ScrollText size={24} className="text-sentinel-accent" />Immutable Audit Trail</h1>
      <p className="text-gray-500 text-sm">Every action is logged and immutable for compliance.</p>

      <div className="card">
        {loading && <div className="text-center py-12 text-gray-500">Loading audit logs...</div>}
        {!loading && logs.length === 0 && <div className="text-center py-12 text-gray-500">No audit logs yet</div>}
        <div className="space-y-2">
          {logs.map((log, i) => {
            const Icon = getIcon(log.action);
            return (
              <motion.div key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                className="flex items-start gap-4 p-4 bg-sentinel-900/50 rounded-lg hover:bg-sentinel-700/20 transition-all">
                <div className="p-2 bg-sentinel-accent/10 rounded-lg flex-shrink-0">
                  <Icon size={16} className="text-sentinel-accent" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-200">{log.action}</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12} />{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{log.details}</div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                    <span>Entity: {log.entity_type}</span>
                    <span>ID: {log.entity_id}</span>
                    <span>By: {log.user_name || 'System'}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AuditTrail;
