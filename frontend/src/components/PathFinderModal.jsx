import React, { useState } from 'react';
import { X, Navigation, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { graphService } from '../services/api';

export default function PathFinderModal({ isOpen, onClose, onPathFound, defaultSource = 'P001', defaultTarget = 'P023', caseId = 'CASE-2026-001' }) {
  const [sourceId, setSourceId] = useState(defaultSource);
  const [targetId, setTargetId] = useState(defaultTarget);
  const [maxDepth, setMaxDepth] = useState(4);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSearchPath = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await graphService.findPath({
        source_id: sourceId.trim().toUpperCase(),
        target_id: targetId.trim().toUpperCase(),
        max_depth: maxDepth,
        case_id: caseId
      });
      setResult(res.data);
      if (res.data.found && res.data.paths?.length > 0 && onPathFound) {
        onPathFound(res.data.paths[0]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error executing graph traversal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-sky-800/60 rounded-xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Navigation className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white">Find Shortest Relationship Path</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSearchPath} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Source Entity ID</label>
              <input
                type="text"
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                placeholder="e.g. P001"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 font-mono focus:outline-none focus:border-sky-500 uppercase"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Entity ID</label>
              <input
                type="text"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                placeholder="e.g. P023"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 font-mono focus:outline-none focus:border-sky-500 uppercase"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Max Graph Depth (Hops):</span>
            <div className="flex items-center space-x-2">
              {[2, 3, 4, 5].map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setMaxDepth(d)}
                  className={`px-2.5 py-1 rounded font-mono ${maxDepth === d ? 'bg-sky-600 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition flex items-center justify-center space-x-2"
          >
            {loading ? <span>Traversing Knowledge Graph...</span> : <span>Compute Path</span>}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="mt-4 p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs space-y-3">
            <div className="flex items-center justify-between font-semibold text-slate-200">
              <span className="flex items-center gap-1.5 text-sky-400">
                <CheckCircle2 className="w-4 h-4" />
                {result.found ? `Path Discovered (${result.paths[0].total_hops} Hops)` : 'No Path Found'}
              </span>
              <span className="text-slate-400">{result.message}</span>
            </div>

            {result.found && result.paths?.length > 0 && (
              <div className="space-y-2">
                <div className="p-2.5 bg-slate-800/60 rounded-lg flex flex-wrap items-center gap-2 font-mono text-xs">
                  {result.paths[0].nodes.map((n, i) => (
                    <React.Fragment key={n.id}>
                      <span className="px-2 py-1 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold">
                        {n.id} ({n.label?.split(' ')[0]})
                      </span>
                      {i < result.paths[0].nodes.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {result.paths[0].evidence?.length > 0 && (
                  <div className="text-[11px] text-slate-400">
                    <span className="text-slate-300 font-semibold">Supporting Evidentiary Records: </span>
                    <span className="font-mono text-emerald-400">{result.paths[0].evidence.join(', ')}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
