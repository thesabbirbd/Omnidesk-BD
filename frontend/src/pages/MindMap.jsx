import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Sparkles,
  AlertCircle,
  RotateCw,
  Layers,
  Play,
  FolderOpen,
  Edit3,
  MoreHorizontal,
  ChevronDown,
  Trash2
} from 'lucide-react';
import { getTopics, updateTopic } from '../services/api';
import { useTimer } from '../context/TimerContext';

export const statusConfig = {
  normal: { color: '#64748b', label: 'Normal', bg: 'rgba(100, 116, 139, 0.14)', border: 'rgba(100, 116, 139, 0.45)', glow: 'rgba(100, 116, 139, 0.3)', icon: Circle },
  learning: { color: '#eab308', label: 'Learning', bg: 'rgba(234, 179, 8, 0.16)', border: 'rgba(234, 179, 8, 0.7)', glow: 'rgba(234, 179, 8, 0.45)', icon: BookOpen },
  complete: { color: '#22c55e', label: 'Complete', bg: 'rgba(34, 197, 94, 0.16)', border: 'rgba(34, 197, 94, 0.7)', glow: 'rgba(34, 197, 94, 0.45)', icon: Check },
  blocked: { color: '#ef4444', label: 'Blocked', bg: 'rgba(239, 68, 68, 0.16)', border: 'rgba(239, 68, 68, 0.7)', glow: 'rgba(239, 68, 68, 0.45)', icon: AlertCircle },
  review: { color: '#3b82f6', label: 'Review', bg: 'rgba(59, 130, 246, 0.16)', border: 'rgba(59, 130, 246, 0.7)', glow: 'rgba(59, 130, 246, 0.45)', icon: RotateCw },
  mastered: { color: '#a855f7', label: 'Mastered', bg: 'rgba(168, 85, 247, 0.18)', border: 'rgba(168, 85, 247, 0.75)', glow: 'rgba(168, 85, 247, 0.5)', icon: Sparkles },
};

const statusColors = {
  normal: statusConfig.normal.color,
  learning: statusConfig.learning.color,
  complete: statusConfig.complete.color,
  blocked: statusConfig.blocked.color,
  review: statusConfig.review.color,
  mastered: statusConfig.mastered.color,
};

// Fallback curriculum nodes when API is offline or database is empty
const DEFAULT_TOPICS = [
  { id: 'root', title: '100-Day Backend → DevOps', status: 'review', progress: 28, x: 450, y: 300, isRoot: true },
  { id: '1', title: '1. Python & Foundation', status: 'complete', progress: 100, x: 450, y: 80 },
  { id: '2', title: '2. Backend Engineering (FastAPI)', status: 'learning', progress: 65, x: 120, y: 180 },
  { id: '3', title: '3. Frontend Support (React)', status: 'normal', progress: 20, x: 780, y: 180 },
  { id: '4', title: '4. DevOps & Linux Foundation', status: 'normal', progress: 10, x: 100, y: 420 },
  { id: '5', title: '5. Containers & CI/CD (Docker)', status: 'learning', progress: 40, x: 800, y: 420 },
  { id: '6', title: '6. Cloud & Infra (AWS & Terraform)', status: 'blocked', progress: 5, x: 220, y: 560 },
  { id: '7', title: '7. Production & Monitoring', status: 'normal', progress: 0, x: 450, y: 580 },
  { id: '8', title: '8. Project Ladder & Capstone', status: 'mastered', progress: 100, x: 680, y: 560 },
];

const DEFAULT_EDGES = [
  { id: 'e-root-1', source: 'root', target: '1', animated: true, style: { stroke: statusColors.complete, strokeWidth: 2.5 } },
  { id: 'e-root-2', source: 'root', target: '2', animated: true, style: { stroke: statusColors.learning, strokeWidth: 2.5 } },
  { id: 'e-root-3', source: 'root', target: '3', style: { stroke: statusColors.normal, strokeWidth: 1.5 } },
  { id: 'e-root-4', source: 'root', target: '4', style: { stroke: statusColors.normal, strokeWidth: 1.5 } },
  { id: 'e-root-5', source: 'root', target: '5', animated: true, style: { stroke: statusColors.learning, strokeWidth: 2.5 } },
  { id: 'e-root-6', source: 'root', target: '6', style: { stroke: statusColors.blocked, strokeWidth: 1.5 } },
  { id: 'e-root-7', source: 'root', target: '7', style: { stroke: statusColors.normal, strokeWidth: 1.5 } },
  { id: 'e-root-8', source: 'root', target: '8', animated: true, style: { stroke: statusColors.mastered, strokeWidth: 2.5 } },
];

// Floating, Premium Mind Map Node with Continuous Hover Hitbox & Full Action Suite
const CustomNode = ({ id, data, selected }) => {
  const currentStatus = statusConfig[data.status] || statusConfig.normal;
  const [isHovered, setIsHovered] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(data.label || '');
  
  const hoverTimeoutRef = useRef(null);
  const { setNodes } = useReactFlow();
  const { startTimer } = useTimer();

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      setShowStatusPicker(false);
      setShowMoreMenu(false);
    }, 280); // 280ms grace window prevents toolbar from disappearing while cursor transits
  };

  const handleStatusChange = async (e, newStatus) => {
    e.stopPropagation();
    const newProgress = 
      newStatus === 'complete' || newStatus === 'mastered' ? 100 :
      newStatus === 'learning' || newStatus === 'review' ? 50 : 0;
    
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

    setShowStatusPicker(false);

    try {
      await updateTopic(id, { 
        title: data.label, 
        status: newStatus, 
        progress: newProgress, 
        study_space_id: null 
      });
    } catch {
      // Offline fallback: already reflected in UI state
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

  const handleOpenDrawer = (e) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('studyos-open-node-drawer', { detail: { id, ...data } }));
  };

  const handleSaveEdit = async (e) => {
    if (e) e.stopPropagation();
    if (!editLabel.trim()) return;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, label: editLabel }
          };
        }
        return node;
      })
    );
    setIsEditing(false);

    try {
      await updateTopic(id, {
        title: editLabel,
        status: data.status,
        progress: data.progress,
        study_space_id: null
      });
    } catch {
      // ignore
    }
  };

  const handleDeleteNode = (e) => {
    e.stopPropagation();
    setNodes((nds) => nds.filter((n) => n.id !== id));
  };

  const handleSetProgress = (e, progress) => {
    e.stopPropagation();
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, progress } } : n))
    );
    setShowMoreMenu(false);
  };

  return (
    <div 
      className="relative group select-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Invisible seamless hit bridge spanning node and floating toolbar */}
      {isHovered && (
        <div 
          className="absolute -top-16 -bottom-4 -left-6 -right-6 pointer-events-auto z-40" 
          aria-hidden="true"
        />
      )}

      {/* Floating Action Suite Toolbar */}
      {isHovered && (
        <div 
          className="absolute -top-14 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-50 animate-in fade-in zoom-in-95 duration-150 whitespace-nowrap"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Main Actions Bar */}
          <div className="flex items-center gap-1 bg-[var(--bg-card)]/95 backdrop-blur-2xl px-2 py-1.5 rounded-2xl shadow-[0_12px_28px_rgba(0,0,0,0.45),inset_1px_1px_2px_rgba(255,255,255,0.1)] border border-[var(--border-color)]">
            {/* Action 1: Open Drawer */}
            <button
              onClick={handleOpenDrawer}
              className="flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-bold text-[color:var(--text-muted)] hover:text-cyan-400 hover:bg-[var(--bg-input)] transition-all cursor-pointer"
              title="Open Node Details"
            >
              <FolderOpen size={13} />
              <span>Open</span>
            </button>

            <div className="w-px h-3.5 bg-[var(--border-color)]" />

            {/* Action 2: Start Study Session */}
            <button
              onClick={handleStartStudy}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.5)] transition-all cursor-pointer"
              title="Start 25m Focus Timer for this topic"
            >
              <Play size={11} fill="currentColor" />
              <span>Study</span>
            </button>

            <div className="w-px h-3.5 bg-[var(--border-color)]" />

            {/* Action 3: Status Selector Toggle */}
            <button
              onClick={() => {
                setShowStatusPicker(!showStatusPicker);
                setShowMoreMenu(false);
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                showStatusPicker 
                  ? 'bg-[var(--bg-input)] text-amber-400 ring-1 ring-amber-400/50' 
                  : 'text-[color:var(--text-muted)] hover:text-amber-400 hover:bg-[var(--bg-input)]'
              }`}
              title="Change Status (6 States)"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentStatus.color }} />
              <span>Status</span>
              <ChevronDown size={11} />
            </button>

            <div className="w-px h-3.5 bg-[var(--border-color)]" />

            {/* Action 4: Edit */}
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-xl text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] hover:bg-[var(--bg-input)] transition-all cursor-pointer"
              title="Edit Topic Title"
            >
              <Edit3 size={13} />
            </button>

            {/* Action 5: More Options */}
            <button
              onClick={() => {
                setShowMoreMenu(!showMoreMenu);
                setShowStatusPicker(false);
              }}
              className="p-1.5 rounded-xl text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] hover:bg-[var(--bg-input)] transition-all cursor-pointer"
              title="More Options"
            >
              <MoreHorizontal size={13} />
            </button>
          </div>

          {/* Sub-Bar: 6-Status Picker */}
          {showStatusPicker && (
            <div className="flex items-center gap-1 bg-[var(--bg-card)]/95 backdrop-blur-2xl p-1.5 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.45)] border border-[var(--border-color)] animate-in fade-in slide-in-from-top-1 duration-150">
              {Object.entries(statusConfig).map(([statusKey, cfg]) => {
                const Icon = cfg.icon;
                const isActive = data.status === statusKey;
                return (
                  <button
                    key={statusKey}
                    onClick={(e) => handleStatusChange(e, statusKey)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[var(--bg-input)] ring-1 ring-cyan-400 scale-105' 
                        : 'hover:bg-[var(--bg-input)] opacity-80 hover:opacity-100'
                    }`}
                    style={{ color: cfg.color }}
                    title={`Set status to ${cfg.label}`}
                  >
                    <Icon size={12} />
                    <span>{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Sub-Bar: More Menu */}
          {showMoreMenu && (
            <div className="flex items-center gap-1 bg-[var(--bg-card)]/95 backdrop-blur-2xl p-1.5 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.45)] border border-[var(--border-color)] text-[10px] font-bold animate-in fade-in slide-in-from-top-1 duration-150">
              <button
                onClick={(e) => handleSetProgress(e, 0)}
                className="px-2 py-1 rounded-lg text-[color:var(--text-muted)] hover:text-white hover:bg-[var(--bg-input)] cursor-pointer"
              >
                Reset (0%)
              </button>
              <button
                onClick={(e) => handleSetProgress(e, 100)}
                className="px-2 py-1 rounded-lg text-emerald-400 hover:bg-[var(--bg-input)] cursor-pointer"
              >
                Done (100%)
              </button>
              <button
                onClick={handleDeleteNode}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-red-400 hover:bg-red-500/20 cursor-pointer"
              >
                <Trash2 size={11} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Node Card Body with Visually Distinct 6 Statuses */}
      <div 
        className={`relative rounded-2xl px-5 py-3.5 font-bold text-xs text-[color:var(--text-main)] text-center min-w-[190px] max-w-[240px] transition-all duration-150 ease-out border backdrop-blur-md cursor-pointer ${
          selected 
            ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-[var(--bg-canvas)] scale-105 shadow-[0_0_24px_rgba(34,211,238,0.6)]' 
            : 'hover:-translate-y-0.5'
        } ${data.status === 'complete' ? 'opacity-90' : 'opacity-100'}`}
        style={{ 
          backgroundColor: currentStatus.bg, 
          borderColor: currentStatus.border,
          boxShadow: selected 
            ? `0 0 25px ${currentStatus.glow}, 6px 6px 14px var(--shadow-dark)`
            : `6px 6px 14px var(--shadow-dark), -6px -6px 14px var(--shadow-light), 0 0 14px ${currentStatus.glow}` 
        }}
      >
        <Handle type="target" position={Position.Top} className="opacity-0" />
        
        <div className="flex flex-col items-center gap-1.5 relative">
          {/* Status Glow Dot & Label */}
          <div className="flex items-center gap-2 w-full justify-center">
            <div 
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${data.status === 'learning' ? 'animate-pulse' : ''}`} 
              style={{ backgroundColor: currentStatus.color, boxShadow: `0 0 8px ${currentStatus.color}` }}
            />
            
            {isEditing ? (
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}
                className="flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  autoFocus
                  className="bg-[var(--bg-input)] text-xs font-bold rounded px-1.5 py-0.5 border border-cyan-400 outline-none w-28 text-center"
                />
                <button type="submit" className="p-0.5 text-cyan-400 hover:text-cyan-300">
                  <Check size={12} />
                </button>
              </form>
            ) : (
              <span className="tracking-wide text-xs font-bold leading-tight px-0.5 truncate max-w-[150px]">
                {data.label}
              </span>
            )}

            {data.status === 'complete' && <Check size={13} className="text-emerald-400 shrink-0" />}
            {data.status === 'mastered' && <Sparkles size={13} className="text-purple-400 shrink-0" />}
            {data.status === 'blocked' && <AlertCircle size={13} className="text-red-400 shrink-0" />}
          </div>
          
          {/* Metadata & Progress Subtitle */}
          <div className="flex items-center gap-2 text-[10px] font-semibold text-[color:var(--text-muted)]">
            <span 
              className="px-1.5 py-0.2 rounded font-black uppercase tracking-wider text-[9px]"
              style={{ color: currentStatus.color }}
            >
              {currentStatus.label}
            </span>
            <span>•</span>
            <span>{data.progress}%</span>
          </div>

          {/* Micro Progress Track */}
          <div className="w-full h-1 rounded-full bg-[var(--bg-input)] overflow-hidden mt-0.5">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${data.progress}%`,
                backgroundColor: currentStatus.color,
                boxShadow: `0 0 6px ${currentStatus.color}`
              }}
            />
          </div>
        </div>

        <Handle type="source" position={Position.Bottom} className="opacity-0" />
      </div>
    </div>
  );
};

const nodeTypes = { custom: CustomNode };

function MindMapFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // all, normal, learning, complete
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { startTimer } = useTimer();

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
            animated: t.status === 'learning' || t.status === 'review',
            style: { 
              stroke: (statusConfig[t.status] && statusConfig[t.status].color) || statusColors.normal, 
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

  // Listen for toolbar 'Open' click from CustomNode
  useEffect(() => {
    const handleDrawerEvent = (e) => {
      if (e.detail) {
        setSelectedTopic(e.detail);
        setIsDrawerOpen(true);
      }
    };
    window.addEventListener('studyos-open-node-drawer', handleDrawerEvent);
    return () => window.removeEventListener('studyos-open-node-drawer', handleDrawerEvent);
  }, []);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        hidden: filter === 'all' ? false : n.data.status !== filter
      }))
    );
    setTimeout(() => fitView({ duration: 600, padding: 0.2 }), 100);
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
      
      {/* Compact Floating Glass/Clay Toolbar */}
      <div className="absolute top-5 left-6 z-10 flex flex-wrap items-center gap-2 bg-[var(--bg-card)]/90 backdrop-blur-xl p-2 rounded-2xl shadow-[6px_6px_16px_var(--shadow-dark),-6px_-6px_16px_var(--shadow-light)] border border-[var(--border-color)]">
        
        {/* Filter Pills: All, Normal, Learning, Complete */}
        <div className="flex items-center gap-1 bg-[var(--bg-input)] p-1 rounded-xl shadow-[inset_1px_1px_3px_var(--shadow-dark)]">
          {[
            { id: 'all', label: 'All' },
            { id: 'normal', label: 'Normal', color: 'text-slate-400' },
            { id: 'learning', label: 'Learning', color: 'text-amber-400' },
            { id: 'complete', label: 'Complete', color: 'text-emerald-400' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleFilterChange(item.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === item.id
                  ? 'bg-[var(--bg-card)] text-cyan-400 shadow-[2px_2px_6px_var(--shadow-dark)]'
                  : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-[var(--border-color)] mx-0.5" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => zoomIn()} 
            className="p-1.5 rounded-lg text-[color:var(--text-muted)] hover:text-cyan-400 hover:bg-[var(--bg-input)] active:scale-95 transition-all cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button 
            onClick={() => zoomOut()} 
            className="p-1.5 rounded-lg text-[color:var(--text-muted)] hover:text-cyan-400 hover:bg-[var(--bg-input)] active:scale-95 transition-all cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <button 
            onClick={() => fitView({ duration: 600, padding: 0.2 })} 
            className="p-1.5 rounded-lg text-[color:var(--text-muted)] hover:text-cyan-400 hover:bg-[var(--bg-input)] active:scale-95 transition-all cursor-pointer"
            title="Fit to Screen"
          >
            <Maximize size={16} />
          </button>
          <button 
            onClick={autoArrange} 
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[color:var(--text-muted)] hover:text-cyan-400 hover:bg-[var(--bg-input)] active:scale-95 transition-all cursor-pointer"
            title="Auto Arrange Layout"
          >
            <GitMerge size={14} /> 
            <span className="hidden md:inline">Arrange</span>
          </button>
        </div>
      </div>

      {/* 6-Status Visual Legend Top-Right */}
      <div className="absolute top-5 right-6 z-10 hidden xl:flex items-center gap-3 bg-[var(--bg-card)]/90 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-[4px_4px_12px_var(--shadow-dark),-4px_-4px_12px_var(--shadow-light)] border border-[var(--border-color)] text-[11px] font-bold">
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <span key={key} className="flex items-center gap-1.5" style={{ color: cfg.color }}>
            <span className="w-2 h-2 rounded-full shadow-[0_0_6px_currentColor]" style={{ backgroundColor: cfg.color }} />
            {cfg.label}
          </span>
        ))}
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
            <div className="flex flex-col gap-2.5 mt-auto">
              <button 
                onClick={() => {
                  startTimer({
                    topic: selectedTopic.label,
                    mode: 'pomodoro',
                    durationMinutes: 25
                  });
                  setIsDrawerOpen(false);
                }}
                className="w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.5)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Play size={13} fill="currentColor" />
                <span>Start 25m Focus Session</span>
              </button>

              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] bg-[var(--bg-input)] border border-[var(--border-color)] shadow-[inset_2px_2px_4px_var(--shadow-dark)] active:scale-95 transition-all cursor-pointer"
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
