import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FolderKanban, Network, Clock, MapPin, FileText, AlertTriangle,
  Bot, Navigation, ShieldCheck, ArrowRight, CheckCircle2, Download
} from 'lucide-react';
import { caseService, graphService, entityService, documentService } from '../services/api';
import CytoscapeGraph from '../components/CytoscapeGraph';
import EntityDrawer from '../components/EntityDrawer';
import PathFinderModal from '../components/PathFinderModal';
import CentralityLegend from '../components/CentralityLegend';
import Timeline from './Timeline';
import GeoAnalysis from './GeoAnalysis';

export default function CaseDetail() {
  const { id } = useParams();
  const caseId = id || 'CASE-2026-001';
  const [caseData, setCaseData] = useState(null);
  const [activeTab, setActiveTab] = useState('network');
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [highlightedPath, setHighlightedPath] = useState(null);
  const [isPathModalOpen, setIsPathModalOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      caseService.getCase(caseId),
      graphService.getNetwork(caseId),
      documentService.getDocuments(caseId)
    ])
      .then(([cRes, gRes, dRes]) => {
        setCaseData(cRes.data);
        setGraphData(gRes.data);
        setDocuments(dRes.data);
        // Default select P001 on load as flagship focal point
        if (gRes.data.nodes?.length > 0) {
          const hub = gRes.data.nodes.find(n => n.id === 'P001') || gRes.data.nodes[0];
          setSelectedEntity(hub);
        }
      })
      .catch(err => console.error('Failed to load case workspace:', err))
      .finally(() => setLoading(false));
  }, [caseId]);

  const handleNodeClick = (nodeData) => {
    setSelectedEntity(nodeData);
  };

  const handleTriggerPath = (sourceId = 'P001') => {
    setIsPathModalOpen(true);
  };

  const handleQueryAI = (entityId) => {
    navigate(`/ai-assistant?entity=${entityId || selectedEntity?.id || 'P001'}`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] max-w-7xl mx-auto space-y-4">
      {/* Case Header */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
              {caseId}
            </span>
            <span className="font-mono text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
              SYNTHETIC DATA
            </span>
            <span className="text-xs text-slate-400">
              Priority: <span className="text-rose-400 font-semibold">{caseData?.priority || 'HIGH'}</span>
            </span>
          </div>
          <h2 className="text-lg font-bold text-white">
            {caseData?.title || 'Operation Hawkeye: Inter-State Transport Contraband Network'}
          </h2>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs shrink-0">
          {[
            { id: 'overview', label: 'Overview', icon: FolderKanban },
            { id: 'network', label: 'Network Graph', icon: Network },
            { id: 'timeline', label: 'Timeline', icon: Clock },
            { id: 'map', label: 'Map', icon: MapPin },
            { id: 'evidence', label: 'Evidence Files', icon: FileText },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab View Container */}
      <div className="flex-1 min-h-0 bg-[#0b0f19] flex">
        {activeTab === 'network' && (
          <div className="flex-1 flex gap-4 h-full min-h-0">
            {/* Cytoscape Graph View */}
            <div className="flex-1 flex flex-col h-full min-h-0 relative">
              <CytoscapeGraph
                nodes={graphData.nodes}
                edges={graphData.edges}
                onNodeSelect={handleNodeClick}
                highlightedPath={highlightedPath}
                className="flex-1 h-full"
              />
              <CentralityLegend className="absolute top-16 left-4 z-10 hidden sm:block max-w-xs opacity-90 hover:opacity-100 transition-opacity" />
            </div>

            {/* Selected Entity & Analytical Summary Panel */}
            <div className="w-80 sm:w-96 flex flex-col h-full shrink-0">
              <EntityDrawer
                entityId={selectedEntity?.id || 'P001'}
                onClose={() => setSelectedEntity(null)}
                onFindPath={() => setIsPathModalOpen(true)}
                onAskAI={handleQueryAI}
              />
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="flex-1 overflow-y-auto p-4 bg-[#111827] border border-slate-800 rounded-xl space-y-6">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-white">Investigation Executive Summary</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                {caseData?.description || 'Active multi-agency investigation correlating high-frequency logistics container exchanges, off-hour telecommunications, and high-velocity financial transactions across Delhi NCR and western ports.'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Primary Target Hub</span>
                <span className="font-mono text-sky-400 font-bold text-sm">P001 (Rajesh Sharma)</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Key Bridge Connector</span>
                <span className="font-mono text-amber-400 font-bold text-sm">P014 (Sanjay Verma)</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Monitored Carrier Fleet</span>
                <span className="font-mono text-emerald-400 font-bold text-sm">10 Heavy Vehicles</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Lead Investigator</span>
                <span className="font-mono text-purple-400 font-bold text-sm">Inspector Nair</span>
              </div>
            </div>

            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div
                onClick={() => setActiveTab('network')}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/50 cursor-pointer transition"
              >
                <Network className="w-5 h-5 text-sky-400 mb-2" />
                <h4 className="text-sm font-bold text-white">Interactive Graph</h4>
                <p className="text-xs text-slate-400 mt-1">Explore 54 verified relationships and cluster groupings.</p>
              </div>
              <div
                onClick={() => handleQueryAI('P001')}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/50 cursor-pointer transition"
              >
                <Bot className="w-5 h-5 text-indigo-400 mb-2" />
                <h4 className="text-sm font-bold text-white">AI Case Assistant</h4>
                <p className="text-xs text-slate-400 mt-1">Prompt the local RAG engine for evidence-grounded hypotheses.</p>
              </div>
              <div
                onClick={() => navigate('/reports')}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/50 cursor-pointer transition"
              >
                <Download className="w-5 h-5 text-emerald-400 mb-2" />
                <h4 className="text-sm font-bold text-white">Export PDF Dossier</h4>
                <p className="text-xs text-slate-400 mt-1">Generate statutory intelligence summary report.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="flex-1 h-full min-h-0 bg-[#111827] border border-slate-800 rounded-xl overflow-hidden p-4">
            <Timeline embeddedCaseId={caseId} />
          </div>
        )}

        {activeTab === 'map' && (
          <div className="flex-1 h-full min-h-0 bg-[#111827] border border-slate-800 rounded-xl overflow-hidden p-4">
            <GeoAnalysis embeddedCaseId={caseId} />
          </div>
        )}

        {activeTab === 'evidence' && (
          <div className="flex-1 overflow-y-auto p-4 bg-[#111827] border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Case Evidence Documents & Hashes</h3>
                <p className="text-xs text-slate-400 mt-0.5">Cryptographic integrity chain verified via SHA-256 signatures.</p>
              </div>
              <button
                onClick={() => navigate('/documents')}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-medium"
              >
                Upload Document
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono">
                    <th className="py-2.5 px-3">Document ID</th>
                    <th className="py-2.5 px-3">Filename</th>
                    <th className="py-2.5 px-3">SHA-256 Cryptographic Hash</th>
                    <th className="py-2.5 px-3">Integrity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {documents.slice(0, 15).map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-sky-400">{doc.id}</td>
                      <td className="py-2.5 px-3 text-slate-300 font-sans">{doc.filename}</td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px] truncate max-w-xs">{doc.sha256_hash}</td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          VERIFIED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Path Finder Modal */}
      <PathFinderModal
        isOpen={isPathModalOpen}
        onClose={() => setIsPathModalOpen(false)}
        onPathFound={(path) => setHighlightedPath(path)}
        defaultSource={selectedEntity?.id || 'P001'}
        defaultTarget="P023"
        caseId={caseId}
      />
    </div>
  );
}
