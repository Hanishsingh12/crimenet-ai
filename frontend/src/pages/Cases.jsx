import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, Plus, Search, ShieldAlert, ArrowRight, Users, Network, AlertTriangle } from 'lucide-react';
import { useCase } from '../context/CaseContext';
import { caseService } from '../services/api';

export default function Cases() {
  const { cases, selectCase, refreshCases } = useCase();
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState('HIGH');
  const navigate = useNavigate();

  const filteredCases = cases.filter(c => {
    return filterPriority === 'ALL' || c.priority === filterPriority;
  });

  const handleCreateCase = async (e) => {
    e.preventDefault();
    try {
      await caseService.createCase({
        title: newTitle,
        description: newDesc,
        priority: newPriority,
        category: 'Inter-State Organized Crime'
      });
      setIsCreateOpen(false);
      setNewTitle('');
      setNewDesc('');
      refreshCases();
    } catch (err) {
      alert('Failed to create case');
    }
  };

  const handleOpenCase = (caseId) => {
    selectCase(caseId);
    navigate(`/cases/${caseId}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-sky-400" />
            <span>Active Investigation Cases</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Registered multi-jurisdictional intelligence files and knowledge graphs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-lg px-3 py-2 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
          </select>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg text-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Open New Case</span>
          </button>
        </div>
      </div>

      {/* Case Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCases.map((c) => (
          <div
            key={c.id}
            onClick={() => handleOpenCase(c.id)}
            className="bg-[#111827] border border-slate-800 hover:border-sky-600/60 rounded-xl p-5 shadow-sm hover:shadow-sky-500/5 cursor-pointer transition flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  {c.id}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  c.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                  c.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                }`}>
                  {c.priority}
                </span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                {c.title}
              </h3>
              <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                {c.description}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800/80">
              <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                <div className="bg-slate-900/60 p-1.5 rounded">
                  <span className="text-[10px] text-slate-400 block">Entities</span>
                  <span className="font-mono font-bold text-slate-200">{c.entities_count || 25}</span>
                </div>
                <div className="bg-slate-900/60 p-1.5 rounded">
                  <span className="text-[10px] text-slate-400 block">Relations</span>
                  <span className="font-mono font-bold text-sky-400">{c.relationships_count || 54}</span>
                </div>
                <div className="bg-slate-900/60 p-1.5 rounded">
                  <span className="text-[10px] text-slate-400 block">Alerts</span>
                  <span className="font-mono font-bold text-amber-400">{c.alerts_count || 4}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Lead: {c.lead_investigator_id || 'Inspector Nair'}</span>
                <span className="flex items-center gap-1 text-sky-400 group-hover:translate-x-1 transition-transform">
                  <span>Enter Case</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Case Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Register New Investigation Case</h3>
            <form onSubmit={handleCreateCase} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Case Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Operation Falcon Transit"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Investigation Scope / Summary</label>
                <textarea
                  rows="3"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Outline key targets, transport hubs, and suspect accounts..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none"
                >
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg"
                >
                  Register Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
