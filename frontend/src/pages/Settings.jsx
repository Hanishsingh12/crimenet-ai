import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Bot, Network, Database, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';
import { aiService, dashboardService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [aiStatus, setAiStatus] = useState(null);
  const [selectedModel, setSelectedModel] = useState('qwen2.5:7b');
  const [health, setHealth] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    aiService.getStatus().then(res => {
      setAiStatus(res.data);
      if (res.data?.current_model) setSelectedModel(res.data.current_model);
    }).catch(e => console.error(e));

    dashboardService.getHealth().then(res => {
      setHealth(res.data);
    }).catch(e => console.error(e));
  }, []);

  const handleModelChange = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await aiService.setModel(selectedModel);
      setSavedSuccess(true);
      const res = await aiService.getStatus();
      setAiStatus(res.data);
    } catch (err) {
      alert('Failed to update model');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 font-sans">
      <div>
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-sky-400" />
          <span>System Settings & Model Configuration</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Local inference endpoints, database drivers, and security role controls.
        </p>
      </div>

      {/* AI Model Configuration Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Local Ollama LLM Configuration</h3>
          </div>
          <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
            aiStatus?.is_online ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
          }`}>
            {aiStatus?.mode || 'Local Grounded Engine'}
          </span>
        </div>

        <form onSubmit={handleModelChange} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Ollama Inference Endpoint</label>
            <input
              type="text"
              value={aiStatus?.base_url || 'http://localhost:11434'}
              disabled
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Configurable Open-Source LLM</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-sky-500"
            >
              <option value="qwen2.5:7b">Qwen2.5:7b (Recommended Primary Model)</option>
              <option value="llama3:8b">Llama3:8b (Meta Open Source)</option>
              <option value="mistral:7b">Mistral:7b (High Performance)</option>
              <option value="gemma2:9b">Gemma2:9b (Google Open Model)</option>
              <option value="qwen3:8b">Qwen3 (Upcoming)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-medium rounded-lg transition flex items-center space-x-1.5"
          >
            <span>{saving ? 'Updating Model...' : 'Switch Active AI Model'}</span>
          </button>

          {savedSuccess && (
            <div className="p-3 bg-emerald-950/30 border border-emerald-800 text-emerald-300 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Model updated to {selectedModel}. All AI queries will route through this architecture.</span>
            </div>
          )}
        </form>
      </div>

      {/* Database & Graph Architecture Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Neo4j Status */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center space-x-2 text-sky-400 font-bold text-sm">
            <Network className="w-4 h-4" />
            <span>Graph Database Driver</span>
          </div>
          <p className="text-xs text-slate-300">
            Engine: <span className="font-mono text-sky-300 font-semibold">{health?.graph_engine || 'High-Performance In-Memory NetworkX Core'}</span>
          </p>
          <div className="text-[11px] text-slate-400">
            Neo4j Bolt Driver: <span className={health?.neo4j_connected ? 'text-emerald-400' : 'text-amber-400'}>
              {health?.neo4j_connected ? 'Online (Connected)' : 'Fallback Active (Offline Standalone)'}
            </span>
          </div>
        </div>

        {/* Structured DB Status */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
            <Database className="w-4 h-4" />
            <span>Relational Store</span>
          </div>
          <p className="text-xs text-slate-300">
            Backend: <span className="font-mono text-emerald-300 font-semibold">PostgreSQL (with SQLite Fallback)</span>
          </p>
          <div className="text-[11px] text-slate-400">
            Current Status: <span className="text-emerald-400">Tables Initialized & Seeded</span>
          </div>
        </div>
      </div>

      {/* Active User Credentials Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span>Active Session & Access Permissions</span>
        </h3>
        <div className="grid grid-cols-3 gap-3 text-xs font-mono">
          <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
            <span className="text-slate-400 block text-[10px]">User</span>
            <span className="text-white font-bold">{user?.username}</span>
          </div>
          <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Assigned Role</span>
            <span className="text-purple-400 font-bold">{user?.role}</span>
          </div>
          <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Mode</span>
            <span className="text-emerald-400 font-bold">SYNTHETIC DEMO</span>
          </div>
        </div>
      </div>
    </div>
  );
}
