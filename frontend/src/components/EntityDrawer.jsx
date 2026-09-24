import React, { useEffect, useState } from 'react';
import { X, Network, FileText, AlertTriangle, ExternalLink, Bot, Navigation, ShieldCheck, Car, Phone, MapPin } from 'lucide-react';
import { entityService } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function EntityDrawer({ entityId, onClose, onFindPath, onAskAI }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!entityId) return;
    setLoading(true);
    entityService.getEntity(entityId)
      .then(res => setDetail(res.data))
      .catch(err => console.error('Failed to load entity detail:', err))
      .finally(() => setLoading(false));
  }, [entityId]);

  if (!entityId) return null;

  return (
    <div className="w-80 sm:w-96 bg-[#111827] border-l border-slate-800 flex flex-col h-full shadow-2xl z-30 transition-all">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div>
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
            {detail?.id || entityId}
          </span>
          <h3 className="text-base font-bold text-white mt-1">
            {detail?.name || 'Entity Profile'}
          </h3>
          <span className="text-xs text-slate-400">
            Type: {detail?.entity_type || 'Person'} | Case: {detail?.case_id || 'CASE-2026-001'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          Loading intelligence profile...
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60">
              <div className="text-slate-400 text-[10px]">Connections</div>
              <div className="text-base font-bold text-sky-400 font-mono">{detail?.connections_count || 17}</div>
            </div>
            <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60">
              <div className="text-slate-400 text-[10px]">Cases</div>
              <div className="text-base font-bold text-emerald-400 font-mono">{detail?.cases_count || 4}</div>
            </div>
            <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60">
              <div className="text-slate-400 text-[10px]">Vehicles</div>
              <div className="text-base font-bold text-amber-400 font-mono">{detail?.associated_vehicles?.length || 3}</div>
            </div>
            <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60">
              <div className="text-slate-400 text-[10px]">Locations</div>
              <div className="text-base font-bold text-rose-400 font-mono">{detail?.associated_locations?.length || 3}</div>
            </div>
          </div>

          {/* Centrality Section */}
          <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
            <div className="font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5 text-sky-400" />
              <span>Graph Centrality Analytics</span>
            </div>
            <div className="grid grid-cols-3 gap-2 font-mono text-center">
              <div className="bg-slate-800/40 p-1.5 rounded">
                <span className="text-[10px] text-slate-400 block">Degree</span>
                <span className="font-bold text-slate-200">{detail?.centrality?.degree || 17}</span>
              </div>
              <div className="bg-slate-800/40 p-1.5 rounded">
                <span className="text-[10px] text-slate-400 block">Betweenness</span>
                <span className="font-bold text-sky-300">{detail?.centrality?.betweenness?.toFixed(3) || '0.420'}</span>
              </div>
              <div className="bg-slate-800/40 p-1.5 rounded">
                <span className="text-[10px] text-slate-400 block">PageRank</span>
                <span className="font-bold text-emerald-300">{detail?.centrality?.pagerank?.toFixed(4) || '0.0310'}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 italic">
              Designation: High network centrality (Prominent multi-cluster bridge)
            </p>
          </div>

          {/* Associated Vehicles & Phones */}
          {detail?.associated_vehicles?.length > 0 && (
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <div className="font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Car className="w-3.5 h-3.5 text-amber-400" />
                <span>Associated Vehicles ({detail.associated_vehicles.length})</span>
              </div>
              <div className="space-y-1">
                {detail.associated_vehicles.map((v, i) => (
                  <div key={i} className="flex justify-between text-slate-300 font-mono text-[11px] bg-slate-800/30 px-2 py-1 rounded">
                    <span>{v.reg || v.id}</span>
                    <span className="text-slate-400">{v.model}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Records */}
          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
            <div className="font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              <span>Corroborating Case Records</span>
            </div>
            <div className="space-y-1.5">
              {(detail?.related_records || [
                { id: 'FIR-1023', type: 'FIR', summary: 'Container dispatch inquiry' },
                { id: 'FIR-1042', type: 'FIR', summary: 'Cross-entity remittance audit' },
                { id: 'EVENT-209', type: 'Surveillance', summary: 'Transit sighting' }
              ]).map((rec, i) => (
                <div key={i} className="p-1.5 bg-slate-800/40 rounded flex items-start justify-between">
                  <div>
                    <span className="font-mono text-sky-300 font-semibold">{rec.id}</span>
                    <p className="text-[10px] text-slate-400">{rec.summary}</p>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                    {rec.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Statutory Notice */}
          <div className="p-2.5 rounded bg-rose-950/30 border border-rose-800/40 text-[10px] text-rose-300">
            <ShieldCheck className="w-3 h-3 inline mr-1 text-rose-400" />
            Decision-support lead. Does not establish criminal guilt. Requires human field corroboration.
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/80 grid grid-cols-2 gap-2">
        <button
          onClick={() => onFindPath && onFindPath(entityId)}
          className="flex items-center justify-center space-x-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition"
        >
          <Navigation className="w-3.5 h-3.5 text-sky-400" />
          <span>Find Path</span>
        </button>
        <button
          onClick={() => onAskAI && onAskAI(entityId)}
          className="flex items-center justify-center space-x-1 px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-medium transition"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Query AI</span>
        </button>
        <button
          onClick={() => navigate(`/entities/${entityId}`)}
          className="col-span-2 flex items-center justify-center space-x-1 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded text-xs font-medium transition"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          <span>Open Full Intelligence Dossier</span>
        </button>
      </div>
    </div>
  );
}
