import React, { useEffect, useState } from 'react';
import { Shield, RefreshCw, Filter, CheckCircle2, Lock } from 'lucide-react';
import { auditService } from '../services/api';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = () => {
    setLoading(true);
    auditService.getLogs(60)
      .then(res => setLogs(res.data))
      .catch(err => console.error('Failed to load audit trail:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-sky-400" />
            <span>Investigation Audit Trail & Compliance Log</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Immutable chain-of-custody logging all graph queries, AI assistant prompts, and evidence verifications.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Audit Trail</span>
        </button>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="font-bold text-white">Recorded Compliance Events ({logs.length})</span>
          <span className="font-mono text-emerald-400 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" />
            IMMUTABLE AUDIT LOGGING ACTIVE
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono bg-slate-900/60">
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Operator / Agent</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="py-3 px-4 text-sky-400 font-bold">{log.username || log.user_id}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.action === 'LOGIN' ? 'bg-emerald-500/20 text-emerald-300' :
                      log.action.includes('QUERY') ? 'bg-sky-500/20 text-sky-300' :
                      log.action.includes('VERIF') ? 'bg-purple-500/20 text-purple-300' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-200">{log.resource}</td>
                  <td className="py-3 px-4 text-slate-400 max-w-xs truncate font-sans">
                    {JSON.stringify(log.metadata_json || {})}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
