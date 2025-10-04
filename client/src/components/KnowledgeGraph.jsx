import { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Info } from 'lucide-react';

// Register the dagre layout
cytoscape.use(dagre);

const KnowledgeGraph = ({ selectedPaper, publications, graphData, onEntityClick, selectedEntity }) => {
  const cyRef = useRef(null);
  const containerRef = useRef(null);
  const [cy, setCy] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  // Enhanced color mapping for different categories
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

  // Use provided graphData or fallback to mock data
  const currentGraphData = graphData;

  // Helper: check if graphData is ready
  const isGraphDataReady = currentGraphData && (
    (Array.isArray(currentGraphData.entities) && currentGraphData.entities.length > 0) ||
    (Array.isArray(currentGraphData.nodes) && currentGraphData.nodes.length > 0)
  );

  useEffect(() => {
    if (!isGraphDataReady) return; // Prevent Cytoscape init if no data
    if (!containerRef.current) return;

    // Create cytoscape instance with dynamic data
    const elements = [];

    // Add nodes (entities)
    if (currentGraphData.entities || currentGraphData.nodes) {
      const nodes = currentGraphData.entities || currentGraphData.nodes;
      elements.push(...nodes.map(node => ({
        data: {
          id: node.id,
          label: node.label,
          category: node.category,
          size: node.size || 30,
          articleCount: node.articleCount || 0
        }
      })));
    }

    // Add edges (relations)
    // Add edges (relations)
    if (currentGraphData.relations || currentGraphData.edges) {
      const edges = currentGraphData.relations || currentGraphData.edges;
      elements.push(...edges.map((edge, index) => ({
        data: {
          id: `edge-${edge.source}-${edge.target}-${index}`, // ✅ unique id for each edge
          source: edge.source,
          target: edge.target,
          weight: edge.weight || 1, // ensure width > 0
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
            'background-color': (node) => categoryColors[node.data('category')] || '#6366f1',
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
            'background-color': '#d946ef',
            'border-width': 3,
            'border-color': '#f0abfc',
            'width': (node) => (node.data('size') || 30) + 10,
            'height': (node) => (node.data('size') || 30) + 10,
          }
        },
        {
          selector: 'node:hover',
          style: {
            'background-color': '#c026d3',
            'width': (node) => (node.data('size') || 30) + 5,
            'height': (node) => (node.data('size') || 30) + 5,
            'box-shadow': '0 0 20px rgba(212, 70, 239, 0.6)'
          }
        },
        {
          selector: 'node.selected-entity',
          style: {
            'background-color': '#f0abfc',
            'border-width': 4,
            'border-color': '#d946ef',
            'width': (node) => (node.data('size') || 30) + 15,
            'height': (node) => (node.data('size') || 30) + 15,
            'box-shadow': '0 0 30px rgba(240, 171, 252, 0.8)',
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
            'width': (edge) => (edge.data('weight') * 5) || 2,
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
            'width': (edge) => ((edge.data('weight') * 6) || 3) + 2,
            'line-color': '#f59e0b',
            'target-arrow-color': '#f59e0b',
            'opacity': 0.8,
            'z-index': 100
          }
        },
        {
          selector: 'edge:hover',
          style: {
            'width': (edge) => ((edge.data('weight') * 5) || 2) + 1,
            'line-color': '#94a3b8',
            'target-arrow-color': '#94a3b8',
            'opacity': 0.7
          }
        },
        {
          selector: 'edge:selected',
          style: {
            'line-color': '#d946ef',
            'target-arrow-color': '#d946ef',
            'opacity': 1,
            'width': (edge) => ((edge.data('weight') * 4) || 2) + 2,
          }
        },
        {
          selector: 'edge:hover',
          style: {
            'line-color': '#c026d3',
            'target-arrow-color': '#c026d3',
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

    // Add event listeners
    cytoscapeInstance.on('tap', 'node', (evt) => {
      const node = evt.target;
      const nodeData = {
        id: node.id(),
        label: node.data('label'),
        category: node.data('category'),
        connections: node.connectedEdges().length,
        articleCount: node.data('articleCount') || 0
      };

      setSelectedNode(nodeData);

      // Call the entity click handler to load related articles
      if (onEntityClick) {
        onEntityClick(nodeData);
      }

      // Highlight connected nodes and edges
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

    // Set better initial zoom and center
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

  // Highlight selected entity when it changes
  useEffect(() => {
    if (cy && selectedEntity) {
      cy.elements().removeClass('selected-entity');
      const node = cy.getElementById(selectedEntity.id);
      if (node.length > 0) {
        node.addClass('selected-entity');
        // Removed: cy.center(node); // Do not recenter on click
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
    <div className={`h-full flex flex-col graph-update ${isFullscreen ? 'fixed inset-0 z-50 bg-space-900' : ''}`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Knowledge Graph</h2>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomIn}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4 text-gray-400" />
            </button>

            <button
              onClick={handleZoomOut}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4 text-gray-400" />
            </button>

            <button
              onClick={handleReset}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
              title="Reset View"
            >
              <RotateCcw className="h-4 w-4 text-gray-400" />
            </button>

            <button
              onClick={handleFullscreen}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              <Maximize2 className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 text-xs">
          {Object.entries(categoryColors).slice(0, 5).map(([category, color]) => (
            <div key={category} className="flex items-center space-x-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-gray-400 capitalize">{category}</span>
            </div>
          ))}
          <span className="text-gray-500">+more</span>
        </div>
      </div>

      {/* Graph Container */}
      <div className="flex-1 relative">
        {/* Loader overlay */}
        {!isGraphDataReady && (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/60">
            <div className="flex flex-col items-center">
              <div className="loader mb-2" style={{ width: 48, height: 48 }}>
                <svg className="animate-spin" viewBox="0 0 50 50">
                  <circle className="opacity-25" cx="25" cy="25" r="20" fill="none" stroke="#6366f1" strokeWidth="6" />
                  <path className="opacity-75" fill="#d946ef" d="M25 5a20 20 0 0 1 0 40V5z" />
                </svg>
              </div>
              <span className="text-white text-sm">Loading Knowledge Graph...</span>
            </div>
          </div>
        )}
        {/* Cytoscape container only if data is ready */}
        {isGraphDataReady && (
          <div
            ref={containerRef}
            className="w-full h-full bg-gradient-to-br from-space-900/50 to-cosmic-900/30"
            style={{ minHeight: '400px', maxHeight: '600px' }}
          />
        )}
        {/* Instructions */}
        <div className="absolute bottom-4 right-4 glass-effect rounded-lg p-3">
          <p className="text-xs text-gray-400">
            Click nodes to explore • Drag to pan • Scroll to zoom
          </p>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraph;
