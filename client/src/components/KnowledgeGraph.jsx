import { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Info } from 'lucide-react';

cytoscape.use(dagre);

const KnowledgeGraph = ({
  graphData,
  onEntityClick,
  selectedEntity,
  eyebrow = 'Explore',
  title = 'Knowledge Graph',
  subtitle,
}) => {
  const cyRef = useRef(null);
  const containerRef = useRef(null);
  const [cy, setCy] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  const categoryColors = {
    biology: '#10b981',
    health: '#ef4444',
    physics: '#3b82f6',
    psychology: '#a855f7',
    medicine: '#ec4899',
    engineering: '#f97316',
    space: '#6366f1',
    biochemistry: '#14b8a6',
    genetics: '#eab308'
  };

  const currentGraphData = graphData;

  const isGraphDataReady = currentGraphData && (
    (Array.isArray(currentGraphData.entities) && currentGraphData.entities.length > 0) ||
    (Array.isArray(currentGraphData.nodes) && currentGraphData.nodes.length > 0)
  );

  useEffect(() => {
    if (!isGraphDataReady) return; 
    if (!containerRef.current) return;
    
    const elements = [];

    if (currentGraphData.entities || currentGraphData.nodes) {
      const nodes = currentGraphData.entities || currentGraphData.nodes;
      elements.push(...nodes.map(node => ({
        data: {
          id: node.id,
          label: node.label,
          category: node.category,
          size: node.size || 30,
          articleCount: node.articleCount || 0,
          articleIds: node.articleIds || []
        }
      })));
    }

    // Add edges (relations)
    if (currentGraphData.relations || currentGraphData.edges) {
      const edges = currentGraphData.relations || currentGraphData.edges;
      elements.push(...edges.map((edge, index) => ({
        data: {
          id: `edge-${edge.source}-${edge.target}-${index}`, 
          source: edge.source,
          target: edge.target,
          weight: edge.weight || 1, 
          type: edge.type || 'relates'
        }
      })));
    }

    const cytoscapeInstance = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': (node) => categoryColors[node.data('category')] || '#3b74f5',
            'label': 'data(label)',
            'width': (node) => node.data('size') || 30,
            'height': (node) => node.data('size') || 30,
            'color': '#ffffff',
            'text-outline-color': '#000000',
            'text-outline-width': 1,
            'font-size': '12px',
            'font-weight': 'bold',
            'text-valign': 'center',
            'text-halign': 'center',
            'overlay-opacity': 0,
            'transition-property': 'background-color, width, height',
            'transition-duration': '0.3s'
          }
        },
        {
          selector: 'node:selected',
          style: {
            'background-color': '#3b74f5',
            'border-width': 3,
            'border-color': '#93bbfd',
            'width': (node) => (node.data('size') || 30) + 10,
            'height': (node) => (node.data('size') || 30) + 10,
          }
        },
        {
          selector: 'node:hover',
          style: {
            'background-color': '#2559ea',
            'width': (node) => (node.data('size') || 30) + 5,
            'height': (node) => (node.data('size') || 30) + 5,
            'box-shadow': '0 0 20px rgba(59, 116, 245, 0.6)'
          }
        },
        {
          selector: 'node.selected-entity',
          style: {
            'background-color': '#17ac90',
            'border-width': 4,
            'border-color': '#6fddc4',
            'width': (node) => (node.data('size') || 30) + 15,
            'height': (node) => (node.data('size') || 30) + 15,
            'box-shadow': '0 0 30px rgba(23, 172, 144, 0.8)',
            'z-index': 999
          }
        },
        {
          selector: 'node.highlighted',
          style: {
            'background-color': '#fbbf24',
            'border-width': 2,
            'border-color': '#f59e0b',
            'box-shadow': '0 0 15px rgba(251, 191, 36, 0.5)'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': (edge) => Math.max(1.2, Math.min(1 + Math.log2((edge.data('weight') || 1) + 1), 6)),
            'line-color': '#64748b',
            'target-arrow-color': '#64748b',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'opacity': 0.4,
            'transition-property': 'line-color, width, opacity',
            'transition-duration': '0.3s'
          }
        },
        {
          selector: 'edge.highlighted',
          style: {
            'width': (edge) => Math.max(2, Math.min(2 + Math.log2((edge.data('weight') || 1) + 1), 7)),
            'line-color': '#f59e0b',
            'target-arrow-color': '#f59e0b',
            'opacity': 0.8,
            'z-index': 100
          }
        },
        {
          selector: 'edge:hover',
          style: {
            'width': (edge) => Math.max(1.5, Math.min(1.5 + Math.log2((edge.data('weight') || 1) + 1), 6.5)),
            'line-color': '#94a3b8',
            'target-arrow-color': '#94a3b8',
            'opacity': 0.7
          }
        },
        {
          selector: 'edge:selected',
          style: {
            'line-color': '#3b74f5',
            'target-arrow-color': '#3b74f5',
            'opacity': 1,
            'width': (edge) => Math.max(2, Math.min(2 + Math.log2((edge.data('weight') || 1) + 1), 7)),
          }
        },
        {
          selector: 'edge:hover',
          style: {
            'line-color': '#6094fa',
            'target-arrow-color': '#6094fa',
            'opacity': 0.8
          }
        }
      ],
      layout: {
        name: 'cose',
        directed: true,
        padding: 50,
        spacingFactor: 2,
        nodeRepulsion: 16000,
        rankDir: 'TB',
        ranker: 'tight-tree',
        animate: true,
        animationDuration: 1000
      },
      wheelSensitivity: 0.8,
      minZoom: 0.5,
      maxZoom: 4
    });
    
    cytoscapeInstance.on('tap', 'node', (evt) => {
      const node = evt.target;
      const nodeData = {
        id: node.id(),
        label: node.data('label'),
        category: node.data('category'),
        connections: node.connectedEdges().length,
        articleCount: node.data('articleCount') || 0,
        articleIds: node.data('articleIds') || []
      };

      setSelectedNode(nodeData);
      
      if (onEntityClick) {
        onEntityClick(nodeData);
      }

      cytoscapeInstance.elements().removeClass('highlighted');
      node.addClass('highlighted');
      node.connectedEdges().addClass('highlighted');
      node.connectedEdges().connectedNodes().addClass('highlighted');
    });

    cytoscapeInstance.on('tap', (evt) => {
      if (evt.target === cytoscapeInstance) {
        setSelectedNode(null);
        cytoscapeInstance.elements().removeClass('highlighted');
      }
    });

    cytoscapeInstance.fit();
    cytoscapeInstance.zoom(1.2);
    cytoscapeInstance.center();

    setCy(cytoscapeInstance);
    cyRef.current = cytoscapeInstance;

    return () => {
      if (cytoscapeInstance) {
        cytoscapeInstance.destroy();
      }
    };
  }, [currentGraphData, isGraphDataReady]);

  useEffect(() => {
    if (cy && selectedEntity) {
      cy.elements().removeClass('selected-entity');
      const node = cy.getElementById(selectedEntity.id);
      if (node.length > 0) {
        node.addClass('selected-entity');
      }
    }
  }, [cy, selectedEntity]);

  const handleZoomIn = () => {
    if (cy) {
      cy.zoom(cy.zoom() * 1.25);
      cy.center();
    }
  };

  const handleZoomOut = () => {
    if (cy) {
      cy.zoom(cy.zoom() * 0.8);
      cy.center();
    }
  };

  const handleReset = () => {
    if (cy) {
      cy.fit();
      cy.zoom(1);
      setSelectedNode(null);
      cy.elements().removeClass('highlighted');
    }
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      if (cy) {
        cy.resize();
        cy.fit();
      }
    }, 100);
  };

  return (
    <div className={`h-full flex flex-col graph-update ${isFullscreen ? 'fixed inset-0 z-50 bg-base-950' : ''}`}>
      {/* Header */}
      <div className="p-5 border-b border-white/8">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-space-300/90">
              {eyebrow}
            </p>
            <h2 className="mt-1 truncate text-lg font-semibold text-white">{title}</h2>
            {subtitle && (
              <p className="mt-0.5 max-w-[320px] truncate text-xs text-slate-400" title={subtitle}>
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleZoomIn}
              title="Zoom in"
              className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.05] text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom out"
              className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.05] text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={handleReset}
              title="Reset view"
              className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.05] text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={handleFullscreen}
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.05] text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px]">
          {(() => {
            const nodes = currentGraphData?.entities || currentGraphData?.nodes || [];
            if (nodes.length === 0) return <span className="text-slate-500">Loading entities…</span>;
            const cats = [...new Set(nodes.map((n) => n.category).filter(Boolean))];
            return (cats.length ? cats : ['biology']).map((c) => (
              <div key={c} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full ring-1 ring-white/20"
                  style={{ backgroundColor: categoryColors[c] || '#3b74f5' }}
                />
                <span className="capitalize text-slate-400">{c}</span>
              </div>
            ));
          })()}
        </div>
      </div>

      {/* Graph Container */}
      <div className="flex-1 relative">
        {/* Loader overlay */}
        {!isGraphDataReady && (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-base-950/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin" viewBox="0 0 50 50" style={{ width: 40, height: 40 }}>
                <circle className="opacity-20" cx="25" cy="25" r="20" fill="none" stroke="#3b74f5" strokeWidth="6" />
                <path className="opacity-90" fill="#17ac90" d="M25 5a20 20 0 0 1 0 40V5z" />
              </svg>
              <span className="text-sm text-slate-300">Loading knowledge graph…</span>
            </div>
          </div>
        )}
        {/* Cytoscape container only if data is ready */}
        {isGraphDataReady && (
          <div
            ref={containerRef}
            className="w-full h-full"
            style={{ minHeight: '320px' }}
          />
        )}
        {/* Instructions */}
        <div className="pointer-events-none absolute bottom-3 right-3 rounded-lg border border-white/8 bg-base-900/70 px-3 py-1.5 backdrop-blur-sm">
          <p className="text-[10px] text-slate-400">
            Click a node to explore · Drag to pan · Scroll to zoom
          </p>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraph;
