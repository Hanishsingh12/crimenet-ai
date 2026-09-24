import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('investigator');
  const [password, setPassword] = useState('investigator123');
  const [error, setError] = useState('');
  const { login, quickDemoLogin, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(username, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error);
    }
  };

  const handleRoleQuickLogin = async (role) => {
    setError('');
    const res = await quickDemoLogin(role);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0f_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0f_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 border border-sky-500/40 shadow-xl shadow-sky-500/10 mb-3">
            <Shield className="w-7 h-7 text-sky-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">
            CRIMENET <span className="text-sky-400">AI</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            AI-Powered Criminal Network Analysis & Investigation Intelligence Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0f172a]/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl shadow-black/80">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 text-xs text-slate-400">
            <span>Secure Authentication Portal</span>
            <span className="font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SYSTEM ONLINE
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Username / Agent ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. investigator"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Passphrase
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 disabled:opacity-50 text-white font-semibold rounded-lg text-sm shadow-lg shadow-sky-600/20 transition flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Authenticating...' : 'Access Intelligence System'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins for Hackathon Evaluators */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>One-Click Role Demonstration:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleRoleQuickLogin('INVESTIGATOR')}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 text-left transition"
              >
                <div className="font-semibold text-sky-400">Investigator</div>
                <div className="text-[10px] text-slate-400 font-mono">Inspector R. K. Nair</div>
              </button>
              <button
                type="button"
                onClick={() => handleRoleQuickLogin('ANALYST')}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 text-left transition"
              >
                <div className="font-semibold text-emerald-400">Senior Analyst</div>
                <div className="text-[10px] text-slate-400 font-mono">Meera Sen</div>
              </button>
              <button
                type="button"
                onClick={() => handleRoleQuickLogin('ADMIN')}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 text-left transition"
              >
                <div className="font-semibold text-purple-400">Administrator</div>
                <div className="text-[10px] text-slate-400 font-mono">Director S. K. Verma</div>
              </button>
              <button
                type="button"
                onClick={() => handleRoleQuickLogin('VIEWER')}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 text-left transition"
              >
                <div className="font-semibold text-slate-300">Auditor / Viewer</div>
                <div className="text-[10px] text-slate-400 font-mono">Liaison Officer T. Roy</div>
              </button>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <p className="text-[11px] text-slate-500 text-center mt-4 px-4 leading-relaxed">
          CONFIDENTIAL LAW ENFORCEMENT PROTOTYPE — STRICTLY SYNTHETIC DATA.
          This system is an investigative decision-support platform and does not generate automated determinations of guilt.
        </p>
      </div>
    </div>
  );
}
