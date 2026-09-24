import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User, Network, Car, Phone, MapPin, AlertTriangle, FileText,
  Bot, Navigation, ShieldAlert, ArrowLeft, CheckCircle2, ShieldCheck, Share2
} from 'lucide-react';
import { entityService } from '../services/api';
import PathFinderModal from '../components/PathFinderModal';

export default function EntityProfile() {
  const { id } = useParams();
  const entityId = id || 'P001';
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPathModalOpen, setIsPathModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    entityService.getEntity(entityId)
      .then(res => setDetail(res.data))
      .catch(err => console.error('Failed to load entity dossier:', err))
      .finally(() => setLoading(false));
  }, [entityId]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs">
        Loading intelligence profile for {entityId}...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* Back button & Action Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Entities</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPathModalOpen(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
          >
            <Navigation className="w-3.5 h-3.5 text-sky-400" />
            <span>Trace Graph Path</span>
          </button>
          <button
            onClick={() => navigate(`/ai-assistant?entity=${entityId}`)}
            className="flex items-center space-x-1 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-medium transition"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Analytical Query</span>
          </button>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center shrink-0">
              <User className="w-8 h-8 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/20 px-2.5 py-0.5 rounded border border-sky-500/40">
                  {detail?.id || entityId}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Case: {detail?.case_id || 'CASE-2026-001'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  NORMALIZED PROFILE
                </span>
              </div>
              <h2 className="text-2xl font-black text-white mt-1">
                {detail?.name || 'Subject Name'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Occupation: <span className="text-slate-200">{detail?.attributes?.occupation || 'Transport Contractor'}</span>
                {' | '}Primary Node: <span className="text-slate-200">{detail?.attributes?.location || 'New Delhi'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center min-w-[80px]">
              <span className="text-[10px] text-slate-400 block uppercase">Links</span>
              <span className="text-xl font-bold font-mono text-sky-400">{detail?.connections_count || 17}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center min-w-[80px]">
              <span className="text-[10px] text-slate-400 block uppercase">Cases</span>
              <span className="text-xl font-bold font-mono text-emerald-400">{detail?.cases_count || 4}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center min-w-[80px]">
              <span className="text-[10px] text-slate-400 block uppercase">Alerts</span>
              <span className="text-xl font-bold font-mono text-amber-400">{detail?.alerts?.length || 2}</span>
            </div>
          </div>
        </div>

        {/* Multi-Attribute Normalization Info */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>Multi-Attribute Matching Engine:</span>
            <span className="font-mono text-sky-300 font-semibold">91% Match Confidence</span>
            <span className="text-slate-500">(Matched on phone, name variants, and carrier registry)</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Known Aliases: {detail?.aliases?.join(', ') || 'None'}
          </div>
        </div>
      </div>

      {/* 2-Column Analytical Metrics & Assets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Centrality & Related Records */}
        <div className="space-y-5">
          {/* Centrality Card */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Network className="w-4 h-4 text-sky-400" />
              <span>Graph Centrality & Influence Topology</span>
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center font-mono">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 block">Degree</span>
                <span className="text-lg font-bold text-white">{detail?.centrality?.degree || 17}</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 block">Betweenness</span>
                <span className="text-lg font-bold text-sky-400">{detail?.centrality?.betweenness?.toFixed(3) || '0.420'}</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 block">PageRank</span>
                <span className="text-lg font-bold text-emerald-400">{detail?.centrality?.pagerank?.toFixed(4) || '0.0310'}</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-sky-950/30 border border-sky-800/40 text-xs text-sky-300">
              Analytical Label: <span className="font-semibold text-white">Bridge entity (Connects Cluster A and Cluster B)</span>
            </div>
          </div>

          {/* Related Case Records */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" />
              <span>Corroborating FIRs & Intelligence Dispatches</span>
            </h3>
            <div className="space-y-2">
              {(detail?.related_records || [
                { id: 'FIR-1023', type: 'FIR', summary: 'Container dispatch inquiry regarding warehouse sector 18' },
                { id: 'FIR-1042', type: 'FIR', summary: 'Cross-entity remittance audit and freight logs' },
                { id: 'EVENT-209', type: 'Surveillance', summary: 'Checkpoint sensor match at Nhava Sheva transit facility' }
              ]).map((rec, i) => (
                <div key={i} className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-start justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-sky-400">{rec.id}</span>
                    <p className="text-slate-300 mt-0.5">{rec.summary}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">
                    {rec.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Associated Assets & Anomalies */}
        <div className="space-y-5">
          {/* Associated Vehicles & Phones */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-200">Registered Associated Infrastructure</h3>
            
            {/* Vehicles */}
            <div className="space-y-2">
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-amber-400" />
                <span>Heavy Commercial Carriers ({detail?.associated_vehicles?.length || 3})</span>
              </span>
              <div className="space-y-1.5">
                {(detail?.associated_vehicles || [
                  { id: 'V001', reg: 'DL-01-AB-1001', model: 'Tata Prima Heavy Container' },
                  { id: 'V002', reg: 'DL-01-AB-1002', model: 'Ashok Leyland Carrier' },
                  { id: 'V003', reg: 'MH-02-CD-2003', model: 'Mahindra Bolero Cargo' }
                ]).map((v, idx) => (
                  <div key={idx} className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between text-xs font-mono">
                    <span className="text-slate-200 font-bold">{v.reg || v.id}</span>
                    <span className="text-slate-400 font-sans">{v.model}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Phones */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Monitored Telecom Identifiers ({detail?.associated_phones?.length || 3})</span>
              </span>
              <div className="space-y-1.5">
                {(detail?.associated_phones || [
                  { id: 'PH001', number: '+91 980001210', carrier: 'Airtel Primary' },
                  { id: 'PH002', number: '+91 980001211', carrier: 'Jio Secondary' },
                  { id: 'PH003', number: '+91 980001212', carrier: 'Encrypted Satellite VoIP' }
                ]).map((p, idx) => (
                  <div key={idx} className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between text-xs font-mono">
                    <span className="text-slate-200 font-bold">{p.number}</span>
                    <span className="text-slate-400 font-sans">{p.carrier}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Anomalies for this Entity */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Flagged Statistical Anomalies</span>
            </h3>
            <div className="space-y-2">
              {(detail?.alerts || [
                { id: 'ALT-2026-002', title: 'Cross-Cluster Network Bridge Formed', severity: 'HIGH', score: 0.89 },
                { id: 'ALT-2026-001', title: '4.8x Communication Volume Surge', severity: 'MEDIUM', score: 0.82 }
              ]).map((a, idx) => (
                <div key={idx} className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-amber-500/20 text-amber-300 font-bold">
                        {a.severity}
                      </span>
                      <span className="text-slate-200 font-semibold">{a.title}</span>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px] mt-1 block">Score: {a.score}</span>
                  </div>
                  <button
                    onClick={() => navigate('/alerts')}
                    className="px-2.5 py-1 bg-slate-800 text-sky-400 rounded text-xs hover:bg-slate-700"
                  >
                    View Alert
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Path Finder Modal */}
      <PathFinderModal
        isOpen={isPathModalOpen}
        onClose={() => setIsPathModalOpen(false)}
        onPathFound={() => navigate('/network')}
        defaultSource={entityId}
        defaultTarget="P023"
        caseId={detail?.case_id || 'CASE-2026-001'}
      />
    </div>
  );
}
