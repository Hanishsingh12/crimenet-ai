import React, { useEffect, useState } from 'react';
import { AlertTriangle, ShieldCheck, CheckCircle2, XCircle, Clock, FileText, ArrowRight, Filter } from 'lucide-react';
import { analyticsService } from '../services/api';
import { useCase } from '../context/CaseContext';
import { useNavigate } from 'react-router-dom';

export default function AlertCenter() {
  const { activeCaseId } = useCase();
  const [anomalies, setAnomalies] = useState([]);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadAlerts = () => {
    setLoading(true);
    analyticsService.getAnomalies(activeCaseId)
      .then(res => setAnomalies(res.data.anomalies || []))
      .catch(err => console.error('Alerts load error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAlerts();
  }, [activeCaseId]);

  const handleUpdateStatus = async (alertId, newStatus) => {
    try {
      await analyticsService.updateAlertStatus(alertId, {
        status: newStatus,
        analyst_notes: `Manual status transition to ${newStatus} by investigator review.`
      });
      loadAlerts();
    } catch (e) {
      alert('Failed to update alert status');
    }
  };

  const filtered = anomalies.filter(a => {
    return severityFilter === 'ALL' || a.severity === severityFilter;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            <span>Analytical Anomaly & Alert Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Explainable statistical flags: communication surges, high-velocity disbursements, and structural bridge formations.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
          </select>
        </div>
      </div>

      {/* Alerts Grid / List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          Scanning statistical deviations across case records...
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(alt => (
            <div
              key={alt.id}
              className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <span className={`px-2.5 py-0.5 rounded font-mono font-bold text-xs ${
                    alt.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    alt.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  }`}>
                    {alt.severity}
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-400">{alt.id}</span>
                  <span className="font-bold text-white text-sm">{alt.title}</span>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-slate-400">Anomaly Score:</span>
                  <span className="font-mono font-bold text-sky-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {alt.score}
                  </span>
                  <span className="font-mono text-slate-400 text-[11px] ml-2">
                    Detected: {alt.detected_at}
                  </span>
                </div>
              </div>

              {/* Entity & Reasons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-slate-900/60 p-3.5 rounded-lg border border-slate-800/80">
                <div className="space-y-1">
                  <span className="text-slate-400 font-semibold block">Target Subject</span>
                  <button
                    onClick={() => navigate(`/entities/${alt.entity_id}`)}
                    className="font-mono text-sky-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>{alt.entity_id} ({alt.entity_name || 'Subject'})</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <span className="text-slate-400 text-[11px] block mt-1">
                    Classification: {alt.type?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <span className="text-slate-400 font-semibold block">Algorithmic Detection Rationale</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                    {alt.reasons?.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Supporting Evidentiary Records & Workflow Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
                <div className="flex items-center space-x-2">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-400 font-medium">Corroborating Dispatches:</span>
                  <div className="flex items-center space-x-1 font-mono text-emerald-400 font-semibold">
                    {alt.evidence?.map((e, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px]">
                        {e}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 mr-1">Status:</span>
                  <span className="px-2 py-1 rounded bg-slate-900 text-slate-200 font-mono text-[11px] border border-slate-800 font-bold">
                    {alt.status}
                  </span>

                  {alt.status !== 'Confirmed by Analyst' && (
                    <button
                      onClick={() => handleUpdateStatus(alt.id, 'Confirmed by Analyst')}
                      className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded transition flex items-center gap-1 font-medium"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Confirm Lead</span>
                    </button>
                  )}

                  {alt.status !== 'Dismissed' && (
                    <button
                      onClick={() => handleUpdateStatus(alt.id, 'Dismissed')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded transition flex items-center gap-1"
                    >
                      <XCircle className="w-3 h-3" />
                      <span>Dismiss</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statutory Footer */}
      <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
        <span>
          Statutory Safeguard: Anomaly detection flags statistical variance only. The system does not establish legal culpability without corroborating physical evidence.
        </span>
      </div>
    </div>
  );
}
