import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Handle, 
  Position, 
  useNodesState, 
  useEdgesState, 
  useReactFlow, 
  ReactFlowProvider 
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  X, 
  Search, 
  CheckCircle2, 
  Circle, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Filter, 
  GitMerge, 
  BookOpen, 
  Check,
  Target,
  Sparkles
} from 'lucide-react';
import { getTopics, updateTopic } from '../services/api';

const statusColors = {
  normal: '#64748b',   // slate-500
  learning: '#eab308', // yellow-500
  complete: '#22c55e', // green-500
  blocked: '#ef4444',  // red-500
  review: '#06b6d4',   // cyan-500
  mastered: '#a855f7', // purple-500
};

// Fallback curriculum nodes when API is offline or database is empty
const DEFAULT_TOPICS = [
  { id: 'root', title: '100-Day Backend → DevOps', status: 'review', progress: 28, x: 450, y: 300, isRoot: true },
  { id: '1', title: '1. Python & Foundation', status: 'complete', progress: 100, x: 450, y: 80 },
  { id: '2', title: '2. Backend Engineering (FastAPI)', status: 'learning', progress: 65, x: 120, y: 180 },
  { id: '3', title: '3. Frontend Support (React)', status: 'normal', progress: 20, x: 780, y: 180 },
  { id: '4', title: '4. DevOps & Linux Foundation', status: 'normal', progress: 10, x: 100, y: 420 },
  { id: '5', title: '5. Containers & CI/CD (Docker)', status: 'learning', progress: 40, x: 800, y: 420 },
  { id: '6', title: '6. Cloud & Infra (AWS & Terraform)', status: 'normal', progress: 0, x: 220, y: 560 },
  { id: '7', title: '7. Production & Monitoring', status: 'normal', progress: 0, x: 450, y: 580 },
  { id: '8', title: '8. Project Ladder & Capstone', status: 'normal', progress: 0, x: 680, y: 560 },
];

const DEFAULT_EDGES = [
  { id: 'e-root-1', source: 'root', target: '1', animated: true, style: { stroke: statusColors.complete, strokeWidth: 2.5 } },
  { id: 'e-root-2', source: 'root', target: '2', animated: true, style: { stroke: statusColors.learning, strokeWidth: 2.5 } },
  { id: 'e-root-3', source: 'root', target: '3', style: { stroke: statusColors.normal, strokeWidth: 1.5 } },
  { id: 'e-root-4', source: 'root', target: '4', style: { stroke: statusColors.normal, strokeWidth: 1.5 } },
  { id: 'e-root-5', source: 'root', target: '5', animated: true, style: { stroke: statusColors.learning, strokeWidth: 2.5 } },
  { id: 'e-root-6', source: 'root', target: '6', style: { stroke: statusColors.normal, strokeWidth: 1.5 } },
  { id: 'e-root-7', source: 'root', target: '7', style: { stroke: statusColors.normal, strokeWidth: 1.5 } },
  { id: 'e-root-8', source: 'root', target: '8', style: { stroke: statusColors.normal, strokeWidth: 1.5 } },
];

// Custom Mind Map Node with Neumorphic Styling & Hover Actions
const CustomNode = ({ id, data }) => {
  const color = statusColors[data.status] || statusColors.normal;
  const [isHovered, setIsHovered] = useState(false);
  const { setNodes } = useReactFlow();

  const handleStatusChange = async (e, newStatus) => {
    e.stopPropagation();
    const newProgress = newStatus === 'complete' ? 100 : newStatus === 'learning' ? 50 : 0;
    
    // Immediate optimistic local update
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { 
            ...node, 
            data: { 
              ...node.data, 
              status: newStatus, 
              progress: newProgress 
            } 
          };
        }
        return node;
      })
    );

    // Persist to backend if possible
    try {
      await updateTopic(id, { 
        title: data.label, 
        status: newStatus, 
        progress: newProgress, 
        study_space_id: null 
      });
    } catch {
      // Offline fallback: already updated in UI state
    }
  };

  // Full segment background glow based on status
  let bgStyle = 'var(--bg-card)';
  let borderColor = 'var(--border-color)';
  if (data.status === 'learning') {
    bgStyle = 'rgba(234, 179, 8, 0.15)';
    borderColor = 'rgba(234, 179, 8, 0.6)';
  } else if (data.status === 'complete') {
    bgStyle = 'rgba(34, 197, 94, 0.18)';
    borderColor = 'rgba(34, 197, 94, 0.6)';
  }

  return (
    <div 
      className="relative rounded-2xl px-5 py-3.5 font-bold text-xs text-[color:var(--text-main)] text-center min-w-[170px] shadow-[6px_6px_14px_var(--shadow-dark),-6px_-6px_14px_var(--shadow-light)] transition-all duration-300 hover:scale-105 active:scale-95 border"
      style={{ 
        backgroundColor: bgStyle, 
        borderColor: borderColor,
        boxShadow: `6px 6px 14px var(--shadow-dark), -6px -6px 14px var(--shadow-light), 0 0 12px ${color}30` 
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      
      <div className="flex flex-col items-center gap-1.5 relative">
        <div className="flex items-center gap-2">
          <div 
            className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" 
            style={{ backgroundColor: color, color: color }}
          />
          <span className="tracking-wide text-xs font-bold leading-tight px-1">{data.label}</span>
          {data.status === 'complete' && <Check size={13} className="text-emerald-400 shrink-0" />}
        </div>
        <span className="text-[10px] font-semibold text-[color:var(--text-muted)] capitalize">
          {data.status} • {data.progress}%
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />

      {/* Hover Action Menu */}
      {isHovered && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[var(--bg-panel)] p-1.5 rounded-2xl shadow-[6px_6px_14px_var(--shadow-dark),-6px_-6px_14px_var(--shadow-light)] border border-[var(--border-color)] z-50 animate-in fade-in zoom-in-95 duration-150">
          
          <div className="group relative">
            <button 
              onClick={(e) => handleStatusChange(e, 'normal')} 
              className="p-1.5 rounded-xl hover:bg-[var(--bg-input)] text-slate-400 hover:text-slate-200 transition-colors"
              title="Reset to Normal"
            >
              <Circle size={15} />
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-[var(--bg-input)] text-[10px] font-bold text-[color:var(--text-main)] rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity text-center whitespace-nowrap border border-[var(--border-color)]">
              Normal (Not Started)
            </div>
          </div>

          <div className="group relative">
            <button 
              onClick={(e) => handleStatusChange(e, 'learning')} 
              className="p-1.5 rounded-xl hover:bg-[var(--bg-input)] text-amber-400 hover:text-amber-300 transition-colors"
              title="Mark as Studying (Yellow)"
            >
              <BookOpen size={15} />
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-[var(--bg-input)] text-[10px] font-bold text-amber-400 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity text-center whitespace-nowrap border border-[var(--border-color)]">
              Studying (Learning)
            </div>
          </div>

          <div className="group relative">
            <button 
              onClick={(e) => handleStatusChange(e, 'complete')} 
              className="p-1.5 rounded-xl hover:bg-[var(--bg-input)] text-emerald-400 hover:text-emerald-300 transition-colors"
              title="Mark as Done (Green)"
            >
              <Check size={15} />
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-[var(--bg-input)] text-[10px] font-bold text-emerald-400 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity text-center whitespace-nowrap border border-[var(--border-color)]">
              Done (Completed)
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

const nodeTypes = { custom: CustomNode };

function MindMapFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const topics = await getTopics();
        if (topics && topics.length > 0) {
          const fetchedNodes = topics.map((t, index) => ({
            id: t.id.toString(),
            type: 'custom',
            position: { 
              x: 100 + 260 * (index % 3), 
              y: 80 + 160 * Math.floor(index / 3) 
            },
            data: { 
              label: t.title, 
              status: t.status || 'normal', 
              progress: t.progress || 0 
            },
            hidden: false
          }));

          const fetchedEdges = topics.slice(1).map((t, i) => ({
            id: `edge-${topics[0].id}-${t.id}`,
            source: topics[0].id.toString(),
            target: t.id.toString(),
            animated: t.status === 'learning',
            style: { 
              stroke: statusColors[t.status] || statusColors.normal, 
              strokeWidth: 2 
            }
          }));

          setNodes(fetchedNodes);
          setEdges(fetchedEdges);
          setTimeout(() => fitView({ duration: 600, padding: 0.2 }), 200);
          return;
        }
      } catch (err) {
        console.warn("Backend offline, loading default curriculum graph", err);
      }

      // Default fallback graph
      const defaultNodes = DEFAULT_TOPICS.map((t) => ({
        id: t.id,
        type: 'custom',
        position: { x: t.x, y: t.y },
        data: { label: t.title, status: t.status, progress: t.progress },
        hidden: false
      }));

      setNodes(defaultNodes);
      setEdges(DEFAULT_EDGES);
      setTimeout(() => fitView({ duration: 600, padding: 0.2 }), 200);
    };

    fetchTopics();
  }, [setNodes, setEdges, fitView]);

  const onNodeClick = useCallback((event, node) => {
    setSelectedTopic(node.data);
    setIsDrawerOpen(true);
  }, []);

  const toggleFilter = () => {
    setIsFilterActive(!isFilterActive);
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        hidden: !isFilterActive ? n.data.status === 'complete' : false
      }))
    );
    setTimeout(() => fitView({ duration: 600 }), 100);
  };

  const autoArrange = () => {
    setNodes((nds) =>
      nds.map((n, i) => ({
        ...n,
        position: { 
          x: 100 + 260 * (i % 3), 
          y: 80 + 170 * Math.floor(i / 3) 
        }
      }))
    );
    setTimeout(() => fitView({ duration: 600, padding: 0.2 }), 100);
  };

  return (
    <div className="w-full h-[calc(100vh-8rem)] min-h-[650px] flex flex-col relative rounded-3xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-canvas)] shadow-[8px_8px_20px_var(--shadow-dark),-8px_-8px_20px_var(--shadow-light)]">
      
      {/* Neumorphic Toolbar */}
      <div className="absolute top-5 left-6 z-10 flex items-center gap-3 bg-[var(--bg-card)] p-2.5 rounded-2xl shadow-[6px_6px_14px_var(--shadow-dark),-6px_-6px_14px_var(--shadow-light)] border border-[var(--border-color)]">
        <button 
          onClick={() => zoomIn()} 
          className="p-2 rounded-xl text-[color:var(--text-muted)] hover:text-cyan-400 bg-[var(--bg-input)] shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] active:scale-95 transition-all cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <button 
          onClick={() => zoomOut()} 
          className="p-2 rounded-xl text-[color:var(--text-muted)] hover:text-cyan-400 bg-[var(--bg-input)] shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] active:scale-95 transition-all cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <button 
          onClick={() => fitView({ duration: 600, padding: 0.2 })} 
          className="p-2 rounded-xl text-[color:var(--text-muted)] hover:text-cyan-400 bg-[var(--bg-input)] shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] active:scale-95 transition-all cursor-pointer"
          title="Fit to Screen"
        >
          <Maximize size={16} />
        </button>
        
        <div className="w-px h-5 bg-[var(--border-color)] mx-1" />

        <button 
          onClick={toggleFilter} 
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
            isFilterActive 
              ? 'text-cyan-400 bg-[var(--bg-input)] shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)]' 
              : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] bg-[var(--bg-input)]'
          }`}
        >
          <Filter size={14} /> 
          <span>{isFilterActive ? 'Show All' : 'Hide Done'}</span>
        </button>

        <button 
          onClick={autoArrange} 
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-[color:var(--text-muted)] hover:text-cyan-400 bg-[var(--bg-input)] active:scale-95 transition-all cursor-pointer shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)]"
        >
          <GitMerge size={14} /> 
          <span>Auto Arrange</span>
        </button>
      </div>

      {/* Legend Top-Right */}
      <div className="absolute top-5 right-6 z-10 hidden sm:flex items-center gap-3 bg-[var(--bg-card)] px-4 py-2 rounded-2xl shadow-[4px_4px_10px_var(--shadow-dark),-4px_-4px_10px_var(--shadow-light)] border border-[var(--border-color)] text-xs font-bold">
        <span className="flex items-center gap-1.5 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-slate-400" /> Normal
        </span>
        <span className="flex items-center gap-1.5 text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-400" /> Studying
        </span>
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400" /> Done
        </span>
      </div>
      
      {/* ReactFlow Canvas */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow 
          nodes={nodes} 
          edges={edges} 
          nodeTypes={nodeTypes} 
          onNodesChange={onNodesChange} 
          onEdgesChange={onEdgesChange} 
          onNodeClick={onNodeClick}
          fitView
        >
          <Background color="#334155" gap={24} size={1.5} />
          <Controls className="!bg-[var(--bg-card)] !border-[var(--border-color)] !shadow-[4px_4px_10px_var(--shadow-dark)] !rounded-xl !overflow-hidden" />
        </ReactFlow>
      </div>

      {/* Side Drawer for Node Details */}
      <div className={`absolute top-0 right-0 h-full w-96 bg-[var(--bg-card)]/95 backdrop-blur-xl border-l border-[var(--border-color)] shadow-[-10px_0_30px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out p-6 flex flex-col gap-6 z-20 ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedTopic && (
          <>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-[color:var(--text-main)]">{selectedTopic.label}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <div 
                    className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-lg border"
                    style={{ 
                      color: statusColors[selectedTopic.status],
                      borderColor: `${statusColors[selectedTopic.status]}40`,
                      backgroundColor: `${statusColors[selectedTopic.status]}15` 
                    }}
                  >
                    {selectedTopic.status}
                  </div>
                  <span className="text-[color:var(--text-muted)] text-xs font-semibold">Progress: {selectedTopic.progress}%</span>
                </div>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-xl text-[color:var(--text-muted)] hover:text-white bg-[var(--bg-input)] shadow-[inset_2px_2px_4px_var(--shadow-dark)] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-[var(--bg-input)] rounded-full shadow-[inset_1px_1px_2px_var(--shadow-dark)] overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-700" 
                style={{ 
                  width: `${selectedTopic.progress}%`, 
                  backgroundColor: statusColors[selectedTopic.status] || statusColors.normal,
                  boxShadow: `0 0 8px ${statusColors[selectedTopic.status] || statusColors.normal}` 
                }}
              />
            </div>

            {/* Key Milestones */}
            <div className="flex flex-col gap-3 flex-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-[color:var(--text-muted)]">Core Milestones</h3>
              <div className="flex flex-col gap-2">
                {[
                  { id: 1, title: 'Foundations & Concept Review', done: true },
                  { id: 2, title: 'Hands-on Labs & Architecture', done: selectedTopic.progress >= 50 },
                  { id: 3, title: 'Production Scenarios & Quiz', done: selectedTopic.progress === 100 },
                ].map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)]">
                    <div className={`w-4 h-4 rounded flex items-center justify-center ${
                      task.done ? 'bg-emerald-500 text-slate-950' : 'border border-[var(--border-color)]'
                    }`}>
                      {task.done && <Check size={11} strokeWidth={3} />}
                    </div>
                    <span className={`text-xs font-medium ${task.done ? 'line-through text-[color:var(--text-muted)]' : 'text-[color:var(--text-main)]'}`}>
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Quick Actions in Drawer */}
            <div className="flex flex-col gap-2 mt-auto">
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-cyan-400 bg-[var(--bg-input)] border border-cyan-500/30 shadow-[inset_2px_2px_4px_var(--shadow-dark)] active:scale-95 transition-all cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  );
}

export default function MindMap() {
  return (
    <ReactFlowProvider>
      <MindMapFlow />
    </ReactFlowProvider>
  );
}
