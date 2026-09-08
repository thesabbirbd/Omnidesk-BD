import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, { 
  Background, 
  Handle, 
  Position, 
  useNodesState, 
  useEdgesState, 
  useReactFlow, 
  ReactFlowProvider 
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  GitFork, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Play, 
  FolderOpen, 
  Check, 
  Sparkles, 
  AlertCircle, 
  RotateCw, 
  BookOpen, 
  Circle, 
  ChevronDown, 
  X,
  Target
} from 'lucide-react';
import { getTopics, updateTopic } from '../../services/api';
import { useTimer } from '../../context/TimerContext';

export const statusConfig = {
  normal: { color: '#64748b', label: 'Normal', bg: 'rgba(100, 116, 139, 0.16)', border: 'rgba(100, 116, 139, 0.45)', glow: 'rgba(100, 116, 139, 0.3)', icon: Circle },
  learning: { color: '#eab308', label: 'Learning', bg: 'rgba(234, 179, 8, 0.18)', border: 'rgba(234, 179, 8, 0.75)', glow: 'rgba(234, 179, 8, 0.5)', icon: BookOpen },
  complete: { color: '#22c55e', label: 'Complete', bg: 'rgba(34, 197, 94, 0.18)', border: 'rgba(34, 197, 94, 0.75)', glow: 'rgba(34, 197, 94, 0.5)', icon: Check },
  blocked: { color: '#ef4444', label: 'Blocked', bg: 'rgba(239, 68, 68, 0.18)', border: 'rgba(239, 68, 68, 0.75)', glow: 'rgba(239, 68, 68, 0.5)', icon: AlertCircle },
  review: { color: '#3b82f6', label: 'Review', bg: 'rgba(59, 130, 246, 0.18)', border: 'rgba(59, 130, 246, 0.75)', glow: 'rgba(59, 130, 246, 0.5)', icon: RotateCw },
  mastered: { color: '#a855f7', label: 'Mastered', bg: 'rgba(168, 85, 247, 0.20)', border: 'rgba(168, 85, 247, 0.8)', glow: 'rgba(168, 85, 247, 0.55)', icon: Sparkles },
};

// Interactive Node with Seamless Hover Action Bridge
const DashboardNode = ({ id, data, selected }) => {
  const currentStatus = statusConfig[data.status] || statusConfig.normal;
  const [isHovered, setIsHovered] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const hoverTimeoutRef = useRef(null);
  const { setNodes } = useReactFlow();
  const { startTimer } = useTimer();

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      setShowStatusMenu(false);
    }, 280);
  };

  const handleStatusSelect = async (e, newStatus) => {
    e.stopPropagation();
    const newProgress = 
      newStatus === 'complete' || newStatus === 'mastered' ? 100 :
      newStatus === 'learning' || newStatus === 'review' ? 50 : 0;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, status: newStatus, progress: newProgress }
          };
        }
        return node;
      })
    );
    setShowStatusMenu(false);

    try {
      await updateTopic(id, {
        title: data.label,
        status: newStatus,
        progress: newProgress,
        study_space_id: null
      });
    } catch {
      // offline fallback
    }
  };

  const handleStartStudy = (e) => {
    e.stopPropagation();
    startTimer({
      topic: data.label,
      mode: 'pomodoro',
      durationMinutes: 25
    });
  };

  const isDimmed = data.isDimmed;
  const isSearchMatched = data.isSearchMatched;

  return (
    <div 
      className={`relative group select-none transition-opacity duration-300 ${isDimmed ? 'opacity-25' : 'opacity-100'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Invisible Hover Hitbox Bridge */}
      {isHovered && (
        <div className="absolute -top-14 -bottom-4 -left-6 -right-6 pointer-events-auto z-40" />
      )}

      {/* Floating Action Suite Toolbar */}
      {isHovered && (
        <div 
          className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-[var(--bg-card)]/95 backdrop-blur-xl px-2 py-1 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.5)] border border-[var(--border-color)] z-50 animate-in fade-in zoom-in-95 duration-150 whitespace-nowrap"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Quick Study Timer Launch */}
          <button
            onClick={handleStartStudy}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.5)] transition-all cursor-pointer"
            title="Start 25m Timer"
          >
            <Play size={10} fill="currentColor" />
            <span>Study</span>
          </button>

          <div className="w-px h-3 bg-[var(--border-color)]" />

          {/* Status Picker Button */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10px] font-bold text-[color:var(--text-muted)] hover:text-amber-400 hover:bg-[var(--bg-input)] transition-all cursor-pointer"
              title="Change Status"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentStatus.color }} />
              <span>Status</span>
              <ChevronDown size={10} />
            </button>

            {showStatusMenu && (
              <div className="absolute top-full left-0 mt-1 flex flex-col gap-0.5 bg-[var(--bg-card)]/95 backdrop-blur-xl p-1 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.6)] border border-[var(--border-color)] z-50">
                {Object.entries(statusConfig).map(([statusKey, cfg]) => {
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={statusKey}
                      onClick={(e) => handleStatusSelect(e, statusKey)}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-bold hover:bg-[var(--bg-input)] text-left cursor-pointer transition-colors"
                      style={{ color: cfg.color }}
                    >
                      <Icon size={11} />
                      <span>{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Node Card */}
      <div 
        className={`relative rounded-2xl px-4 py-2.5 font-bold text-xs text-[color:var(--text-main)] text-center min-w-[170px] max-w-[210px] transition-all duration-200 border backdrop-blur-md cursor-grab active:cursor-grabbing ${
          selected || isSearchMatched 
            ? 'ring-2 ring-cyan-400 scale-105 shadow-[0_0_20px_rgba(34,211,238,0.7)]' 
            : 'hover:scale-102'
        }`}
        style={{ 
          backgroundColor: currentStatus.bg, 
          borderColor: currentStatus.border,
          boxShadow: `6px 6px 14px var(--shadow-dark), -6px -6px 14px var(--shadow-light), 0 0 12px ${currentStatus.glow}` 
        }}
      >
        <Handle type="target" position={Position.Top} className="opacity-0" />

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5 w-full justify-center">
            <div 
              className={`w-2 h-2 rounded-full shrink-0 ${data.status === 'learning' ? 'animate-pulse' : ''}`} 
              style={{ backgroundColor: currentStatus.color, boxShadow: `0 0 6px ${currentStatus.color}` }}
            />
            <span className="tracking-wide text-[11px] font-bold leading-tight truncate max-w-[140px]">
              {data.label}
            </span>
            {data.status === 'complete' && <Check size={12} className="text-emerald-400 shrink-0" />}
            {data.status === 'mastered' && <Sparkles size={12} className="text-purple-400 shrink-0" />}
          </div>

          {/* Progress Bar & Status Text */}
          <div className="flex items-center justify-between w-full px-1 text-[9px] font-semibold text-[color:var(--text-muted)]">
            <span style={{ color: currentStatus.color }}>{currentStatus.label}</span>
            <span>{data.progress}%</span>
          </div>

          <div className="w-full h-1 rounded-full bg-[var(--bg-input)] overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${data.progress}%`,
                backgroundColor: currentStatus.color,
                boxShadow: `0 0 4px ${currentStatus.color}`
              }}
            />
          </div>
        </div>

        <Handle type="source" position={Position.Bottom} className="opacity-0" />
      </div>
    </div>
  );
};

// Root Central Node
const RootNode = ({ data }) => {
  return (
    <div className="px-5 py-3 rounded-2xl bg-[var(--bg-card)] border-2 border-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.5),6px_6px_14px_var(--shadow-dark)] flex items-center gap-2.5 cursor-grab active:cursor-grabbing backdrop-blur-md">
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div className="p-1 rounded-xl bg-cyan-500/20 text-cyan-400">
        <Target size={18} />
      </div>
      <div className="text-left">
        <div className="text-[10px] font-black uppercase tracking-wider text-cyan-400">Roadmap Center</div>
        <div className="text-xs font-black text-[color:var(--text-main)] whitespace-nowrap">{data.label}</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

const nodeTypes = {
  custom: DashboardNode,
  root: RootNode
};

const INITIAL_NODES = [
  { id: 'root', type: 'root', position: { x: 310, y: 160 }, data: { label: '100-Day Backend → DevOps' } },
  { id: '1', type: 'custom', position: { x: 310, y: 30 }, data: { label: '1. Python & OOP', status: 'complete', progress: 100 } },
  { id: '2', type: 'custom', position: { x: 70, y: 80 }, data: { label: '2. FastAPI Backend', status: 'learning', progress: 65 } },
  { id: '3', type: 'custom', position: { x: 550, y: 80 }, data: { label: '3. React Frontend', status: 'normal', progress: 20 } },
  { id: '4', type: 'custom', position: { x: 50, y: 240 }, data: { label: '4. Linux & DevOps', status: 'normal', progress: 15 } },
  { id: '5', type: 'custom', position: { x: 570, y: 240 }, data: { label: '5. Docker & CI/CD', status: 'learning', progress: 45 } },
  { id: '6', type: 'custom', position: { x: 190, y: 310 }, data: { label: '6. AWS & Terraform', status: 'blocked', progress: 5 } },
  { id: '7', type: 'custom', position: { x: 440, y: 310 }, data: { label: '7. Monitoring & SRE', status: 'review', progress: 30 } },
];

const INITIAL_EDGES = [
  { id: 'e-root-1', source: 'root', target: '1', animated: true, style: { stroke: '#22c55e', strokeWidth: 2.5 } },
  { id: 'e-root-2', source: 'root', target: '2', animated: true, style: { stroke: '#eab308', strokeWidth: 2.5 } },
  { id: 'e-root-3', source: 'root', target: '3', animated: false, style: { stroke: '#64748b', strokeWidth: 1.5 } },
  { id: 'e-root-4', source: 'root', target: '4', animated: false, style: { stroke: '#64748b', strokeWidth: 1.5 } },
  { id: 'e-root-5', source: 'root', target: '5', animated: true, style: { stroke: '#eab308', strokeWidth: 2.5 } },
  { id: 'e-root-6', source: 'root', target: '6', animated: false, style: { stroke: '#ef4444', strokeWidth: 1.5 } },
  { id: 'e-root-7', source: 'root', target: '7', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
];

function InnerFlowCanvas() {
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  const { zoomIn, zoomOut, fitView, getZoom } = useReactFlow();

  // Center nodes on initial mount
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.2 });
    }, 150);
    return () => clearTimeout(timer);
  }, [fitView]);

  // Handle Filtering
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === 'root') return node;
        const isDimmed = newFilter !== 'all' && node.data.status !== newFilter;
        return {
          ...node,
          data: { ...node.data, isDimmed }
        };
      })
    );
  };

  // Handle Search
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    const q = query.trim().toLowerCase();
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === 'root') return node;
        const isSearchMatched = q !== '' && node.data.label.toLowerCase().includes(q);
        const isDimmed = q !== '' && !isSearchMatched;
        return {
          ...node,
          data: { ...node.data, isSearchMatched, isDimmed }
        };
      })
    );
  };

  const handleZoomIn = () => {
    zoomIn();
    setTimeout(() => {
      setZoomLevel(Math.round(getZoom() * 100));
    }, 100);
  };

  const handleZoomOut = () => {
    zoomOut();
    setTimeout(() => {
      setZoomLevel(Math.round(getZoom() * 100));
    }, 100);
  };

  const handleFitView = () => {
    fitView({ padding: 0.2, duration: 400 });
    setTimeout(() => {
      setZoomLevel(100);
    }, 450);
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      {/* Header & Interactive Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <GitFork size={18} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-black tracking-wide text-[color:var(--text-main)] flex items-center gap-2">
              <span>Interactive Mind Map</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Interactive Engine Active" />
            </h2>
            <span className="text-[10px] font-semibold text-[color:var(--text-muted)]">
              Pan, drag nodes & click Study to start focus timer
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5">
          {[
            { id: 'all', label: 'All', color: 'text-cyan-400' },
            { id: 'normal', label: 'Normal', color: 'text-slate-400' },
            { id: 'learning', label: 'Learning', color: 'text-amber-400' },
            { id: 'complete', label: 'Complete', color: 'text-emerald-400' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => handleFilterChange(pill.id)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === pill.id
                  ? 'bg-[var(--bg-input)] shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] ' + pill.color
                  : 'hover:text-[color:var(--text-main)] text-[color:var(--text-muted)]'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Zoom & Fullscreen Controls */}
        <div className="flex items-center gap-1 text-[color:var(--text-muted)]">
          {isSearchOpen ? (
            <div className="flex items-center gap-1 bg-[var(--bg-input)] px-2 py-0.5 rounded-lg border border-cyan-400/40">
              <input
                type="text"
                placeholder="Find topic..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                autoFocus
                className="bg-transparent text-xs text-[color:var(--text-main)] outline-none w-24"
              />
              <button onClick={() => { setIsSearchOpen(false); handleSearchChange(''); }} className="hover:text-red-400">
                <X size={12} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 rounded-lg hover:text-[color:var(--text-main)] hover:bg-[var(--bg-input)] transition-all cursor-pointer" 
              title="Search Mind Map"
            >
              <Search size={14} />
            </button>
          )}

          <button 
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg hover:text-[color:var(--text-main)] hover:bg-[var(--bg-input)] transition-all cursor-pointer" 
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          
          <button 
            onClick={handleFitView}
            className="text-[10px] font-mono px-1 font-bold hover:text-cyan-400 cursor-pointer"
            title="Reset View (100%)"
          >
            {zoomLevel}%
          </button>

          <button 
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg hover:text-[color:var(--text-main)] hover:bg-[var(--bg-input)] transition-all cursor-pointer" 
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>

          <button 
            onClick={() => navigate('/os/mindmap')}
            className="p-1.5 rounded-lg hover:text-cyan-400 hover:bg-[var(--bg-input)] transition-all cursor-pointer ml-1" 
            title="Open Fullscreen Mind Map Engine"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Real React Flow Canvas */}
      <div className="relative w-full h-[400px] md:h-[430px] rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] shadow-[inset_3px_3px_6px_var(--shadow-dark),inset_-3px_-3px_6px_var(--shadow-light)] overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.3}
          maxZoom={1.8}
          proOptions={{ hideAttribution: true }}
        >
          <Background 
            color="rgba(34, 211, 238, 0.15)" 
            gap={24} 
            size={1.2} 
          />
        </ReactFlow>

        {/* Interactive Floating Hint */}
        <div className="absolute bottom-2.5 right-3 pointer-events-none opacity-70">
          <span className="text-[10px] font-bold text-cyan-400/90 bg-[var(--bg-card)]/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-cyan-500/20 shadow-md">
            Double-click or drag nodes • Wheel to zoom
          </span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardInteractiveMindMap() {
  return (
    <div className="p-6 rounded-3xl bg-[var(--bg-card)] shadow-[6px_6px_14px_var(--shadow-dark),-6px_-6px_14px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col transition-all">
      <ReactFlowProvider>
        <InnerFlowCanvas />
      </ReactFlowProvider>
    </div>
  );
}
