import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban, Users, Network, AlertTriangle, FileText,
  Boxes, ArrowUpRight, ShieldCheck, Activity, ChevronRight, Zap
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { dashboardService } from '../services/api';
import { useCase } from '../context/CaseContext';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const { selectCase } = useCase();
  const navigate = useNavigate();

  useEffect(() => {
    dashboardService.getSummary()
      .then(res => setSummary(res.data))
      .catch(err => console.error('Dashboard load failed:', err))
      .finally(() => setLoading(false));
  }, []);

  const pieColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const entityData = summary?.entity_type_breakdown
    ? Object.entries(summary.entity_type_breakdown).map(([name, value]) => ({ name, value }))
    : [
        { name: 'Persons', value: 100 },
        { name: 'Vehicles', value: 50 },
        { name: 'Phones', value: 75 },
        { name: 'Locations', value: 30 },
        { name: 'Organizations', value: 20 },
      ];

  const relationshipData = summary?.relationship_type_breakdown
    ? Object.entries(summary.relationship_type_breakdown).map(([name, count]) => ({ name, count }))
    : [
        { name: 'CALLED', count: 18 },
        { name: 'OWNS', count: 12 },
        { name: 'ASSOCIATED_WITH', count: 14 },
        { name: 'VISITED', count: 8 },
        { name: 'WORKS_FOR', count: 6 },
      ];

  const handleOpenFlagship = () => {
    selectCase('CASE-2026-001');
    navigate('/cases/CASE-2026-001');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Banner / Flagship Case Callout */}
      <div className="bg-gradient-to-r from-sky-950/80 via-slate-900 to-indigo-950/80 border border-sky-800/50 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-sky-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                FLAGSHIP INVESTIGATION
              </span>
              <span className="text-xs text-slate-400 font-mono">CASE-2026-001</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white">
              Operation Hawkeye: Inter-State Transport Contraband Network
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              25 connected persons, 10 heavy carriers, 15 phone lines, and 50+ multi-hop relationships.
              Central hub entity <span className="text-sky-300 font-mono font-bold">P001 (Rajesh Sharma)</span> bridging Cluster A & Cluster B.
            </p>
          </div>
          <button
            onClick={handleOpenFlagship}
            className="flex items-center space-x-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-sky-600/20 transition shrink-0"
          >
            <span>Launch Case Investigation</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Active Cases', val: summary?.active_cases || 3, icon: FolderKanban, color: 'text-sky-400', bg: 'bg-sky-500/10' },
          { label: 'Indexed Entities', val: summary?.total_entities || 100, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Graph Relations', val: summary?.total_relationships || 54, icon: Network, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'Active Alerts', val: summary?.total_alerts || 4, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Evidence Files', val: summary?.total_documents || 100, icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Graph Clusters', val: summary?.total_clusters || 3, icon: Boxes, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">{card.label}</span>
                <div className={`p-1.5 rounded-lg ${card.bg}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <div className="text-2xl font-black text-white font-mono mt-2">{card.val}</div>
            </div>
          );
        })}
      </div>

      {/* Middle Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart 1: Case Trajectory */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200">Investigation Ingestion Timeline</h3>
            <span className="text-xs text-sky-400 font-mono">Monthly FIRs</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary?.cases_over_time || [
                { month: 'Nov', cases: 2 },
                { month: 'Dec', cases: 3 },
                { month: 'Jan', cases: 5 },
                { month: 'Feb', cases: 8 },
                { month: 'Mar', cases: 12 }
              ]}>
                <defs>
                  <linearGradient id="caseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="cases" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#caseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Entity Types Breakdown */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200">Entity Topology Composition</h3>
            <span className="text-xs text-slate-400">100% Synthetic</span>
          </div>
          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={entityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {entityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-2 text-[10px]">
            {entityData.map((e, idx) => (
              <span key={idx} className="flex items-center gap-1 text-slate-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pieColors[idx % pieColors.length] }} />
                {e.name}: {e.value}
              </span>
            ))}
          </div>
        </div>

        {/* Chart 3: Weekly Alert Frequency */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200">Analytical Anomaly Trends</h3>
            <span className="text-xs text-amber-400 font-mono">Statistical Flags</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.alert_trends || [
                { day: 'Mon', alerts: 2 },
                { day: 'Tue', alerts: 4 },
                { day: 'Wed', alerts: 7 },
                { day: 'Thu', alerts: 5 },
                { day: 'Fri', alerts: 9 },
                { day: 'Sat', alerts: 6 },
                { day: 'Sun', alerts: 3 }
              ]}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="alerts" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section: Active Analytical Alerts Requiring Review */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Prioritized Anomaly Queue</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Explainable statistical deviations requiring investigator verification before action.
            </p>
          </div>
          <button
            onClick={() => navigate('/alerts')}
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
          >
            <span>Open Alert Center</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {(summary?.recent_alerts || [
            {
              id: 'ALT-2026-001',
              type: 'communication_anomaly',
              severity: 'MEDIUM',
              entity_id: 'P014',
              entity_name: 'Sanjay Verma',
              title: 'Statistical Communication Volume Surge (4.8x baseline)',
              reasons: ['Communication volume increased 4.8x compared to 30-day baseline', 'Off-hour burst calls with P001'],
              evidence: ['CDR-1002', 'CDR-1009'],
              status: 'Needs Review'
            },
            {
              id: 'ALT-2026-002',
              type: 'network_anomaly',
              severity: 'HIGH',
              entity_id: 'P001',
              entity_name: 'Rajesh Sharma',
              title: 'Cross-Cluster Network Bridge Formed',
              reasons: ['Entity connects two isolated graph clusters (Cluster A and Cluster B)', 'Betweenness centrality spiked to 0.42'],
              evidence: ['FIR-1023', 'FIR-1042'],
              status: 'Under Review'
            },
            {
              id: 'ALT-2026-003',
              type: 'transaction_anomaly',
              severity: 'CRITICAL',
              entity_id: 'ORG001',
              entity_name: 'Apex Logistics Pvt Ltd',
              title: 'High-Velocity Structured Financial Outflows (INR 850,000)',
              reasons: ['Multi-tier fund disbursement exceeding INR 850,000 without shipment invoices'],
              evidence: ['TX-1015', 'TX-1030'],
              status: 'New'
            }
          ]).map((alt, i) => (
            <div
              key={i}
              className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                    alt.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    alt.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  }`}>
                    {alt.severity}
                  </span>
                  <span className="font-mono text-slate-400">{alt.id}</span>
                  <span className="text-white font-semibold">{alt.title}</span>
                </div>
                <p className="text-slate-300">
                  Target Entity: <span className="font-semibold text-sky-400">{alt.entity_id} ({alt.entity_name})</span>
                  {' — '}{alt.reasons?.[0]}
                </p>
                <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                  <span>Evidence Sources:</span>
                  <span className="font-mono text-emerald-400">{alt.evidence?.join(', ')}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                  {alt.status}
                </span>
                <button
                  onClick={() => navigate('/alerts')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 font-medium rounded-lg transition"
                >
                  Review Anomaly
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
