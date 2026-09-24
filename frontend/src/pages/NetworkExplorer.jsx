import React, { useEffect, useState } from 'react';
import { Network, Layers, Navigation, Download, RefreshCw, Sparkles, Filter } from 'lucide-react';
import CytoscapeGraph from '../components/CytoscapeGraph';
import EntityDrawer from '../components/EntityDrawer';
import PathFinderModal from '../components/PathFinderModal';
import CentralityLegend from '../components/CentralityLegend';
import { graphService, analyticsService } from '../services/api';
import { useCase } from '../context/CaseContext';
import { useNavigate } from 'react-router-dom';

export default function NetworkExplorer() {
  const { activeCaseId, selectedEntityId, setSelectedEntityId } = useCase();
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [clusters, setClusters] = useState([]);
  const [clusterMode, setClusterMode] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [highlightedPath, setHighlightedPath] = useState(null);
  const [isPathModalOpen, setIsPathModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadGraph = () => {
    setLoading(true);
    Promise.all([
      graphService.getNetwork(activeCaseId, 600),
      analyticsService.getClusters(activeCaseId)
    ])
      .then(([gRes, cRes]) => {
        setGraphData(gRes.data);
        setClusters(cRes.data.clusters || []);
        if (selectedEntityId) {
          const found = gRes.data.nodes.find(n => n.id === selectedEntityId);
          if (found) setSelectedEntity(found);
        } else if (gRes.data.nodes?.length > 0) {
          const hub = gRes.data.nodes.find(n => n.id === 'P001') || gRes.data.nodes[0];
          setSelectedEntity(hub);
        }
      })
      .catch(err => console.error('Failed to load network graph:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadGraph();
  }, [activeCaseId]);

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] max-w-7xl mx-auto space-y-3">
      {/* Top Controller Bar */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-3 shrink-0 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20">
            <Network className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Interactive Knowledge Graph Explorer</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {graphData.nodes.length} Nodes | {graphData.edges.length} Edges
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Multi-hop relational analysis, community clustering, and path traversal.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setClusterMode(!clusterMode)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border font-medium transition ${
              clusterMode
                ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{clusterMode ? 'Cluster View (Active)' : 'Color by Cluster'}</span>
          </button>

          <button
            onClick={() => setIsPathModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium transition shadow-sm"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Shortest Path Finder</span>
          </button>

          <button
            onClick={loadGraph}
            title="Refresh Network"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Graph & Drawer Area */}
      <div className="flex-1 flex gap-3 h-full min-h-0">
        <div className="flex-1 relative flex flex-col h-full min-h-0">
          <CytoscapeGraph
            nodes={graphData.nodes}
            edges={graphData.edges}
            onNodeSelect={(node) => {
              setSelectedEntity(node);
              setSelectedEntityId(node.id);
            }}
            highlightedPath={highlightedPath}
            clusterMode={clusterMode}
            className="flex-1 h-full"
          />
          <CentralityLegend className="absolute top-16 left-4 z-10 hidden sm:block max-w-xs opacity-90 hover:opacity-100 transition-opacity" />
        </div>

        {selectedEntity && (
          <EntityDrawer
            entityId={selectedEntity.id}
            onClose={() => setSelectedEntity(null)}
            onFindPath={() => setIsPathModalOpen(true)}
            onAskAI={(eid) => navigate(`/ai-assistant?entity=${eid}`)}
          />
        )}
      </div>

      {/* Path Finder Modal */}
      <PathFinderModal
        isOpen={isPathModalOpen}
        onClose={() => setIsPathModalOpen(false)}
        onPathFound={(path) => setHighlightedPath(path)}
        defaultSource={selectedEntity?.id || 'P001'}
        defaultTarget="P023"
        caseId={activeCaseId}
      />
    </div>
  );
}
