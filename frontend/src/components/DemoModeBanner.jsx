import React, { useState } from 'react';
import { ShieldAlert, Play, CheckCircle2, ChevronRight, X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCase } from '../context/CaseContext';

export default function DemoModeBanner() {
  const [showGuide, setShowGuide] = useState(false);
  const navigate = useNavigate();
  const { selectCase, setSelectedEntityId } = useCase();

  const steps = [
    { num: 1, title: 'Open Dashboard', desc: 'Inspect synthetic case metrics, alert trends, and entity distribution.', action: () => navigate('/dashboard') },
    { num: 2, title: 'Open Flagship Case', desc: 'Select CASE-2026-001 (Operation Hawkeye) intelligence workspace.', action: () => { selectCase('CASE-2026-001'); navigate('/cases/CASE-2026-001'); } },
    { num: 3, title: 'Interactive Network Graph', desc: 'Explore 50+ multi-hop relationships with Cytoscape.js clustering.', action: () => navigate('/network') },
    { num: 4, title: 'Inspect Entity P001', desc: 'Select hub entity P001 (17 connections, 3 vehicles, betweenness=0.42).', action: () => { setSelectedEntityId('P001'); navigate('/entities/P001'); } },
    { num: 5, title: 'Find Connection Path', desc: 'Compute shortest path: P001 → P014 (Bridge) → P023 with evidence records.', action: () => navigate('/network') },
    { num: 6, title: 'Temporal Timeline', desc: 'Analyze chronological FIR filings, sensor alerts, and communication bursts.', action: () => navigate('/timeline') },
    { num: 7, title: 'Alert Center & Anomalies', desc: 'Review 4.8x communication surge and high-velocity financial outflows.', action: () => navigate('/alerts') },
    { num: 8, title: 'AI Assistant Reasoning', desc: 'Ask AI grounded questions citing supporting records without hallucinations.', action: () => navigate('/ai-assistant') },
    { num: 9, title: 'Evidence Cryptography', desc: 'Verify SHA-256 hash integrity signatures for uploaded files.', action: () => navigate('/documents') },
    { num: 10, title: 'Generate PDF Dossier', desc: 'Download official investigation intelligence report with legal disclaimer.', action: () => navigate('/reports') },
  ];

  return (
    <>


      {showGuide && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-sky-700/50 rounded-xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-sky-300 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-sky-400" />
                  Official SIH 2026 Evaluation Workflow
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Follow this structured sequence to demonstrate all 20 required capabilities:
                </p>
              </div>
              <button onClick={() => setShowGuide(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 py-4 pr-1 flex-1">
              {steps.map((s) => (
                <div
                  key={s.num}
                  onClick={() => { s.action(); setShowGuide(false); }}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 hover:bg-sky-950/40 border border-slate-800 hover:border-sky-600/50 cursor-pointer group transition-all"
                >
                  <div className="flex items-start space-x-3">
                    <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">
                      {s.num}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200 group-hover:text-sky-300">
                        {s.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowGuide(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
