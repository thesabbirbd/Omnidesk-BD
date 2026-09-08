import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Terminal, 
  CheckCircle2, 
  Circle, 
  Play, 
  Activity, 
  Server, 
  Database, 
  Cpu, 
  ArrowRight, 
  Sparkles, 
  RefreshCw, 
  Plus, 
  X,
  Zap
} from 'lucide-react';
import { useTimer } from '../../context/TimerContext';

const DEFAULT_SPRINT_TASKS = [
  { id: 'task-1', title: 'FastAPI Async Database Connection Pool (asyncpg)', completed: true, tag: 'BACKEND' },
  { id: 'task-2', title: 'Celery Distributed Task Queue & Redis Broker', completed: true, tag: 'PIPELINE' },
  { id: 'task-3', title: 'Docker Compose Multi-Container Orchestration', completed: false, tag: 'DEVOPS' },
  { id: 'task-4', title: 'GitHub Actions Automated Test & Build Pipeline', completed: false, tag: 'CI/CD' },
];

export default function DashboardActiveSprintPanel() {
  const navigate = useNavigate();
  const { startTimer } = useTimer();

  // Load persisted sprint tasks or use defaults
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('studyos_sprint_tasks');
      return saved ? JSON.parse(saved) : DEFAULT_SPRINT_TASKS;
    } catch {
      return DEFAULT_SPRINT_TASKS;
    }
  });

  const [newTaskText, setNewTaskText] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [pingState, setPingState] = useState({ isPinging: false, latency: 12, status: 'HEALTHY' });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('studyos_sprint_tasks', JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks]);

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask = {
      id: `task-${Date.now()}`,
      title: newTaskText.trim(),
      completed: false,
      tag: 'CUSTOM'
    };
    setTasks((prev) => [...prev, newTask]);
    setNewTaskText('');
    setIsAddingTask(false);
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Interactive Health Ping Simulation
  const handleTriggerPing = () => {
    setPingState((prev) => ({ ...prev, isPinging: true }));
    setTimeout(() => {
      const randomLatency = Math.floor(Math.random() * 14) + 8; // 8-22ms
      setPingState({ isPinging: false, latency: randomLatency, status: 'HEALTHY (200 OK)' });
    }, 600);
  };

  // Launch Sprint Focus Timer
  const handleLaunchSprintTimer = () => {
    startTimer({
      topic: 'Sprint 04: Async Pipeline & Celery Workers',
      mode: 'focus',
      durationMinutes: 30
    });
  };

  return (
    <div className="p-6 rounded-3xl bg-[var(--bg-card)] shadow-[6px_6px_14px_var(--shadow-dark),-6px_-6px_14px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col gap-5 transition-all">
      
      {/* 1. Header with Live Pulse */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Terminal size={18} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-wide text-[color:var(--text-main)]">
                Active Sprint 04 • Async Backend & Pipeline Lab
              </h3>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>LIVE EXECUTION</span>
              </span>
            </div>
            <span className="text-[11px] font-semibold text-[color:var(--text-muted)]">
              Day 28 of 100 • 4-day intensive engineering milestone
            </span>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/os/projects')}
            className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30"
            title="Open Engineering Project Ladder"
          >
            <span>Project Lab</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* 2. Main Body Grid: Checklist (Left) & Live Telemetry (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left Column: Interactive Milestone Checklist (approx 60% / col-span-7) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          {/* Progress bar header */}
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[color:var(--text-muted)] flex items-center gap-1.5">
              <span>Sprint Milestones</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--bg-input)] text-cyan-400">
                {completedCount}/{tasks.length} Done
              </span>
            </span>
            <span className="text-cyan-400 font-black">{progressPct}%</span>
          </div>

          <div className="w-full h-2 rounded-full bg-[var(--bg-input)] shadow-[inset_1px_1px_3px_var(--shadow-dark)] overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-cyan-400 to-emerald-400 transition-all duration-700 shadow-[0_0_8px_rgba(34,211,238,0.5)]"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Interactive Checkable Task List */}
          <div className="flex flex-col gap-2 mt-1">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer select-none group ${
                  task.completed 
                    ? 'bg-emerald-500/5 border-emerald-500/30 text-[color:var(--text-muted)]' 
                    : 'bg-[var(--bg-input)] border-[var(--border-color)] hover:border-cyan-400/50 text-[color:var(--text-main)] shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                    task.completed 
                      ? 'text-emerald-400' 
                      : 'text-[color:var(--text-muted)] group-hover:text-cyan-400'
                  }`}>
                    {task.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                  </div>
                  <span className={`text-xs font-bold leading-tight ${task.completed ? 'line-through opacity-75' : ''}`}>
                    {task.title}
                  </span>
                </div>

                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md shrink-0 ml-2 ${
                  task.tag === 'BACKEND' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' :
                  task.tag === 'PIPELINE' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                  task.tag === 'DEVOPS' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30' :
                  'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                }`}>
                  {task.tag}
                </span>
              </div>
            ))}
          </div>

          {/* Inline Add Task Input */}
          {isAddingTask ? (
            <form onSubmit={handleAddTask} className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Enter milestone title..."
                autoFocus
                className="flex-1 bg-[var(--bg-input)] text-xs text-[color:var(--text-main)] px-3 py-2 rounded-xl border border-cyan-400/50 outline-none"
              />
              <button 
                type="submit"
                className="px-3 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
              >
                Add
              </button>
              <button 
                type="button" 
                onClick={() => setIsAddingTask(false)}
                className="p-2 rounded-xl hover:bg-[var(--bg-input)] text-[color:var(--text-muted)] cursor-pointer"
              >
                <X size={14} />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingTask(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-[color:var(--text-muted)] hover:text-cyan-400 p-1.5 rounded-xl hover:bg-[var(--bg-input)] transition-all cursor-pointer w-fit"
            >
              <Plus size={13} />
              <span>Add Sprint Milestone</span>
            </button>
          )}
        </div>

        {/* Right Column: Live Services Telemetry & Interactive Launchpad (col-span-5) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] shadow-[inset_2px_2px_4px_var(--shadow-dark)] gap-3.5">
          
          <div className="flex items-center justify-between pb-1 border-b border-white/5">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[color:var(--text-muted)]">
              <Cpu size={14} className="text-cyan-400" />
              <span>Services Telemetry</span>
            </div>
            <button
              onClick={handleTriggerPing}
              disabled={pingState.isPinging}
              className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
              title="Trigger Health Ping"
            >
              <RefreshCw size={10} className={pingState.isPinging ? 'animate-spin' : ''} />
              <span>{pingState.isPinging ? 'Testing...' : 'Ping Test'}</span>
            </button>
          </div>

          {/* Microservices Status Matrix */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-semibold">
              <div className="flex items-center gap-2">
                <Server size={13} className="text-cyan-400" />
                <span className="text-[color:var(--text-main)] text-[11px]">FastAPI Backend Engine</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{pingState.isPinging ? '...' : `${pingState.latency}ms • OK`}</span>
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-semibold">
              <div className="flex items-center gap-2">
                <Database size={13} className="text-indigo-400" />
                <span className="text-[color:var(--text-main)] text-[11px]">PostgreSQL Async Pool</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-cyan-400">
                5/10 Active
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-semibold">
              <div className="flex items-center gap-2">
                <Activity size={13} className="text-amber-400" />
                <span className="text-[color:var(--text-main)] text-[11px]">Redis Queue Broker</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-400">
                2 Workers Idle
              </span>
            </div>
          </div>

          {/* Interactive Fast Actions */}
          <div className="flex items-center gap-2 pt-1 border-t border-white/5">
            <button
              onClick={handleLaunchSprintTimer}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(34,211,238,0.4)] active:scale-95 transition-all cursor-pointer"
            >
              <Play size={12} fill="currentColor" />
              <span>Sprint Focus (30m)</span>
            </button>

            <button
              onClick={() => navigate('/os/ai-assistant')}
              className="p-2 rounded-xl bg-[var(--bg-card)] hover:bg-cyan-500/10 border border-[var(--border-color)] hover:border-cyan-400/40 text-[color:var(--text-muted)] hover:text-cyan-400 transition-all cursor-pointer"
              title="Ask AI about this Sprint"
            >
              <Sparkles size={14} />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
