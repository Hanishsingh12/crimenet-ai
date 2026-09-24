import React, { useState } from 'react';
import { FileCheck2, Download, Printer, ShieldCheck, CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import { reportService } from '../services/api';
import { useCase } from '../context/CaseContext';

export default function Reports() {
  const { activeCaseId, activeCase } = useCase();
  const [analystNotes, setAnalystNotes] = useState('Corroborating telecom exchanges verified against field sightings. Inter-state carrier tracking active.');
  const [loading, setLoading] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await reportService.generateReport(activeCaseId, {
        case_id: activeCaseId,
        include_network: true,
        include_timeline: true,
        include_anomalies: true,
        include_evidence: true,
        analyst_notes: analystNotes
      });
      setGeneratedReport(res.data);
    } catch (err) {
      alert('Report generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <FileCheck2 className="w-6 h-6 text-emerald-400" />
          <span>Investigation Intelligence Reports & PDF Export</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Automated generation of court-admissible analytical dossiers with network topology, timelines, and statutory safeguards.
        </p>
      </div>

      {/* Generator Configuration Form */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
          <span className="font-bold text-white">Report Target: {activeCaseId}</span>
          <span className="font-mono text-sky-400 font-bold">{activeCase?.title?.split(':')[0] || 'Operation Hawkeye'}</span>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Investigator / Analyst Field Annotations
            </label>
            <textarea
              rows="3"
              value={analystNotes}
              onChange={(e) => setAnalystNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
              placeholder="Enter official analyst observations..."
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300">
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="accent-sky-500 rounded" />
              <span>Network Topology</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="accent-sky-500 rounded" />
              <span>Centrality Scores</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="accent-sky-500 rounded" />
              <span>Statistical Anomalies</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="accent-sky-500 rounded" />
              <span>Evidence SHA-256 Hashes</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20"
          >
            <FileText className="w-4 h-4" />
            <span>{loading ? 'Compiling PDF Intelligence Dossier...' : 'Generate Official Investigation PDF Report'}</span>
          </button>
        </form>

        {generatedReport && (
          <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-emerald-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>PDF Report Successfully Compiled</span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">
                {(generatedReport.file_size_bytes / 1024).toFixed(1)} KB
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="font-mono text-xs text-slate-300">
                {generatedReport.report_id}.pdf
              </span>
              <a
                href={generatedReport.download_url}
                target="_blank"
                rel="noreferrer"
                download
                className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition shadow-md shadow-emerald-600/20"
              >
                <Download className="w-4 h-4" />
                <span>Download Report PDF</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Statutory Disclaimer Box */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
        <div className="font-bold text-slate-300 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-rose-400" />
          <span>Statutory Compliance Notice & Disclaimer</span>
        </div>
        <p className="leading-relaxed text-[11px]">
          All generated investigation reports contain analytical conclusions derived from statistical models and synthetic demonstration data.
          They are intended solely to guide investigative priority and do not constitute evidence of legal wrongdoing.
        </p>
      </div>
    </div>
  );
}
