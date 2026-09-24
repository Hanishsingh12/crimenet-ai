import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import { ZoomIn, ZoomOut, Maximize2, Download, Search, RefreshCw, Filter, Layers } from 'lucide-react';
import { NODE_COLORS } from './CentralityLegend';

export default function CytoscapeGraph({
  nodes = [],
  edges = [],
  onNodeSelect,
  highlightedPath = null,
  clusterMode = false,
  className = ''
}) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRelType, setSelectedRelType] = useState('ALL');
  const [minConfidence, setMinConfidence] = useState(0.70);

  // Available relationship types from edges
  const relTypes = ['ALL', ...Array.from(new Set(edges.map(e => e.type)))];

  useEffect(() => {
    if (!containerRef.current) return;

    // Filter elements
    const filteredEdges = edges.filter(e => {
      const matchType = selectedRelType === 'ALL' || e.type === selectedRelType;
      const matchConf = (e.confidence || 0.8) >= minConfidence;
      return matchType && matchConf;
    });

    const activeNodeIds = new Set();
    filteredEdges.forEach(e => {
      activeNodeIds.add(e.source);
      activeNodeIds.add(e.target);
    });

    // Also include high centrality or explicitly queried nodes
    const filteredNodes = nodes.filter(n => activeNodeIds.has(n.id) || n.id === 'P001' || n.id === 'P014' || n.id === 'P023');

    // Convert to Cytoscape elements
    const elements = [
      ...filteredNodes.map(n => {
        const typeCfg = NODE_COLORS[n.type] || { bg: '#64748b' };
        const nodeColor = clusterMode && n.cluster_color ? n.cluster_color : typeCfg.bg;
        // Size nodes according to degree centrality
        const degree = n.degree || 1;
        const size = Math.max(34, Math.min(68, 30 + degree * 2.2));

        return {
          data: {
            id: n.id,
            label: `${n.id}\n${n.label?.split(' ')[0] || ''}`,
            fullName: n.label,
            type: n.type,
            cluster: n.cluster,
            color: nodeColor,
            size: size,
            raw: n
          }
        };
      }),
      ...filteredEdges.map(e => ({
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label || e.type,
          type: e.type,
          confidence: e.confidence,
          source_document: e.source_document,
          raw: e
        }
      }))
    ];

    if (cyRef.current) {
      cyRef.current.destroy();
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(color)',
            'label': 'data(label)',
            'color': '#f8fafc',
            'font-size': '10px',
            'font-family': 'Plus Jakarta Sans, sans-serif',
            'font-weight': 600,
            'text-valign': 'center',
            'text-halign': 'center',
            'text-wrap': 'wrap',
            'width': 'data(size)',
            'height': 'data(size)',
            'border-width': 2,
            'border-color': '#ffffff',
            'border-opacity': 0.3,
            'text-outline-color': '#0b0f19',
            'text-outline-width': 2,
            'transition-property': 'background-color, border-color, width, height',
            'transition-duration': '0.2s'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#334155',
            'target-arrow-color': '#475569',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'opacity': 0.65,
            'label': 'data(label)',
            'font-size': '8px',
            'font-family': 'JetBrains Mono, monospace',
            'color': '#94a3b8',
            'text-rotation': 'autorotate',
            'text-background-opacity': 0.85,
            'text-background-color': '#0b0f19',
            'text-background-padding': 2,
            'text-background-shape': 'roundrectangle'
          }
        },
        {
          selector: ':selected',
          style: {
            'border-width': 4,
            'border-color': '#38bdf8',
            'border-opacity': 1,
            'shadow-blur': 15,
            'shadow-color': '#38bdf8',
            'shadow-opacity': 0.8
          }
        },
        {
          selector: '.highlighted',
          style: {
            'background-color': '#f43f5e',
            'line-color': '#f43f5e',
            'target-arrow-color': '#f43f5e',
            'width': 4,
            'border-color': '#ffe4e6',
            'border-width': 4,
            'opacity': 1,
            'z-index': 99
          }
        },
        {
          selector: '.dimmed',
          style: {
            'opacity': 0.15
          }
        }
      ],
      layout: {
        name: 'cose',
        animate: false,
        padding: 50,
        nodeRepulsion: () => 600000,
        idealEdgeLength: () => 100,
        edgeElasticity: () => 100,
        gravity: 80,
        numIter: 1000
      }
    });

    cyRef.current = cy;

    // Node click handler
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const rawData = node.data('raw');
      if (onNodeSelect) {
        onNodeSelect(rawData);
      }
    });

    // Background tap
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        cy.elements().removeClass('dimmed');
      }
    });

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [nodes, edges, selectedRelType, minConfidence, clusterMode]);

  // Handle path highlighting
  useEffect(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;

    cy.elements().removeClass('highlighted dimmed');

    if (highlightedPath && highlightedPath.nodes) {
      cy.elements().addClass('dimmed');

      highlightedPath.nodes.forEach(n => {
        const ele = cy.getElementById(n.id);
        ele.removeClass('dimmed').addClass('highlighted');
      });

      if (highlightedPath.relationships) {
        highlightedPath.relationships.forEach(r => {
          const edgeEle = cy.getElementById(r.id);
          if (edgeEle.length) {
            edgeEle.removeClass('dimmed').addClass('highlighted');
          }
        });
      }
    }
  }, [highlightedPath]);

  // Handle search filter
  const handleSearch = (e) => {
    e.preventDefault();
    if (!cyRef.current || !searchTerm.trim()) return;
    const cy = cyRef.current;
    const term = searchTerm.toLowerCase();

    const matches = cy.nodes().filter(n => {
      const label = (n.data('fullName') || '').toLowerCase();
      const id = (n.data('id') || '').toLowerCase();
      return label.includes(term) || id.includes(term);
    });

    if (matches.length > 0) {
      cy.elements().addClass('dimmed');
      matches.removeClass('dimmed');
      cy.center(matches);
      cy.zoom(1.4);
    }
  };

  const handleReset = () => {
    setSearchTerm('');
    if (cyRef.current) {
      cyRef.current.elements().removeClass('dimmed highlighted');
      cyRef.current.fit(null, 40);
    }
  };

  const exportImage = () => {
    if (!cyRef.current) return;
    const png64 = cyRef.current.png({ full: true, bg: '#0b0f19', scale: 2 });
    const link = document.createElement('a');
    link.download = `CRIMENET_GRAPH_${Date.now()}.png`;
    link.href = png64;
    link.click();
  };

  return (
    <div className={`relative flex flex-col bg-[#0b0f19] border border-slate-800 rounded-xl overflow-hidden ${className}`}>
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/80 border-b border-slate-800/80 z-10 backdrop-blur-md">
        <form onSubmit={handleSearch} className="flex items-center space-x-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search node (e.g. P001, Rajesh)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-800/90 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-medium"
          >
            Find
          </button>
        </form>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedRelType}
              onChange={(e) => setSelectedRelType(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-300 rounded px-2 py-1 text-xs focus:outline-none"
            >
              {relTypes.map(rt => (
                <option key={rt} value={rt}>{rt}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-slate-400">Min Conf:</span>
            <input
              type="range"
              min="0.5"
              max="0.99"
              step="0.05"
              value={minConfidence}
              onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
              className="w-16 accent-sky-500"
            />
            <span className="font-mono text-sky-400">{minConfidence}</span>
          </div>

          <button
            onClick={exportImage}
            title="Export Graph Image"
            className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded text-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export PNG</span>
          </button>
        </div>
      </div>

      {/* Main Cytoscape Container */}
      <div ref={containerRef} className="flex-1 w-full h-full min-h-[460px] bg-[#0b0f19] cursor-grab active:cursor-grabbing" />

      {/* Floating Zoom & Layout Controls */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col space-y-1.5 bg-slate-900/90 border border-slate-800 rounded-lg p-1 shadow-lg backdrop-blur-md">
        <button
          onClick={() => cyRef.current && cyRef.current.zoom(cyRef.current.zoom() * 1.25)}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => cyRef.current && cyRef.current.zoom(cyRef.current.zoom() * 0.8)}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => cyRef.current && cyRef.current.fit(null, 40)}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
          title="Fit to Screen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
          title="Reset Layout & Filter"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
