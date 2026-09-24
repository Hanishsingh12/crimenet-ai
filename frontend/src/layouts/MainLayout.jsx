import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, Network, Users, Clock, MapPin,
  AlertTriangle, FileText, Bot, FileCheck2, Shield, Settings,
  LogOut, Search, ChevronDown, Sparkles, Navigation
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCase } from '../context/CaseContext';
import DemoModeBanner from '../components/DemoModeBanner';
import PathFinderModal from '../components/PathFinderModal';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const { activeCaseId, cases, selectCase, setSelectedEntityId } = useCase();
  const [globalSearch, setGlobalSearch] = useState('');
  const [isPathModalOpen, setIsPathModalOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/cases', label: 'Cases', icon: FolderKanban },
    { to: '/network', label: 'Network Explorer', icon: Network },
    { to: '/entities', label: 'Entities', icon: Users },
    { to: '/timeline', label: 'Timeline', icon: Clock },
    { to: '/map', label: 'Geo Analysis', icon: MapPin },
    { to: '/alerts', label: 'Alerts', icon: AlertTriangle, badge: '4' },
    { to: '/documents', label: 'Documents & Hashes', icon: FileText },
    { to: '/ai-assistant', label: 'AI Assistant', icon: Bot, highlight: true },
    { to: '/reports', label: 'Reports', icon: FileCheck2 },
    { to: '/audit-log', label: 'Audit Trail', icon: Shield },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    const term = globalSearch.trim().toUpperCase();
    if (term.startsWith('P') || term.startsWith('V') || term.startsWith('PH')) {
      setSelectedEntityId(term);
      navigate(`/entities/${term}`);
    } else {
      navigate(`/entities?search=${encodeURIComponent(globalSearch)}`);
    }
    setGlobalSearch('');
  };

  return (
    <div className="flex h-screen bg-[#0b0f19] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0d1322] border-r border-slate-800/80 flex flex-col shrink-0 z-20">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center space-x-3 bg-slate-900/50">
          <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/40 flex items-center justify-center shadow-lg shadow-sky-500/10">
            <Network className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-wider text-white">
              CRIMENET <span className="text-sky-400">AI</span>
            </h1>
            <p className="text-[10px] text-slate-400 tracking-tight uppercase">
              Investigation Intelligence
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `
                  flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all
                  ${isActive
                    ? 'bg-sky-600/20 text-sky-300 border border-sky-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }
                  ${item.highlight ? 'bg-indigo-950/40 border border-indigo-700/30' : ''}
                `}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${item.highlight ? 'text-indigo-400' : ''}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 truncate">
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-sky-400">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-200 truncate">{user?.full_name || user?.username}</div>
                <div className="text-[10px] text-slate-400 font-mono">{user?.role || 'INVESTIGATOR'}</div>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Synthetic Data Banner */}
        <DemoModeBanner />

        {/* Top Intelligence Navbar */}
        <header className="h-14 bg-slate-900/80 border-b border-slate-800/80 px-6 flex items-center justify-between z-10 backdrop-blur-md">
          {/* Active Case Selector */}
          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Active Case:</span>
            <div className="relative">
              <select
                value={activeCaseId}
                onChange={(e) => selectCase(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-sky-300 font-mono text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:border-sky-500 cursor-pointer pr-8"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} — {c.title.split(':')[0]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Global Search and Shortcuts */}
          <div className="flex items-center space-x-3">
            <form onSubmit={handleGlobalSearch} className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Global Entity Search (P001, V001, phone)..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-64 pl-8 pr-3 py-1.5 bg-slate-800/90 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-sky-500 font-mono"
              />
            </form>

            <button
              onClick={() => setIsPathModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
            >
              <Navigation className="w-3.5 h-3.5 text-sky-400" />
              <span>Path Finder</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Views */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#0b0f19]">
          <Outlet />
        </main>
      </div>

      {/* Global Path Finder Modal */}
      <PathFinderModal
        isOpen={isPathModalOpen}
        onClose={() => setIsPathModalOpen(false)}
        onPathFound={() => navigate('/network')}
        caseId={activeCaseId}
      />
    </div>
  );
}
