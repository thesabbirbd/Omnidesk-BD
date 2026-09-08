import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  Square, 
  Plus, 
  Minus, 
  Maximize2, 
  Eye, 
  EyeOff, 
  GripHorizontal, 
  X, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useTimer } from '../../context/TimerContext';

export default function FloatingTimer() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isRunning,
    isPaused,
    timeLeft,
    durationMinutes,
    mode,
    activeTopic,
    presenceEnabled,
    presenceStatus,
    isFloatingMinimized,
    isFloatingVisible,
    lastNotification,
    clearNotification,
    pauseTimer,
    resumeTimer,
    stopTimer,
    addMinutes,
    togglePresence,
    toggleFloatingMinimized,
    hideFloatingTimer
  } = useTimer();

  // Dragging state
  const [position, setPosition] = useState({ x: null, y: null });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });
  const containerRef = useRef(null);

  // Initialize position at bottom right
  useEffect(() => {
    if (typeof window !== 'undefined' && position.x === null) {
      const defaultX = Math.max(16, window.innerWidth - 340);
      const defaultY = Math.max(16, window.innerHeight - 240);
      setPosition({ x: defaultX, y: defaultY });
    }
  }, [position.x]);

  // Handle window resize bounds
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (prev.x === null) return prev;
        const maxX = window.innerWidth - 300;
        const maxY = window.innerHeight - 150;
        return {
          x: Math.min(Math.max(16, prev.x), Math.max(16, maxX)),
          y: Math.min(Math.max(16, prev.y), Math.max(16, maxY))
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pointer drag listeners
  const handlePointerDown = (e) => {
    // Only drag from handle or card background, not buttons
    if (e.target.closest('button') || e.target.closest('input')) return;
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: position.x || (window.innerWidth - 340),
      posY: position.y || (window.innerHeight - 240)
    };
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartRef.current.mouseX;
      const deltaY = e.clientY - dragStartRef.current.mouseY;

      const maxX = window.innerWidth - (isFloatingMinimized ? 180 : 310);
      const maxY = window.innerHeight - (isFloatingMinimized ? 60 : 210);

      setPosition({
        x: Math.min(Math.max(12, dragStartRef.current.posX + deltaX), Math.max(12, maxX)),
        y: Math.min(Math.max(12, dragStartRef.current.posY + deltaY), Math.max(12, maxY))
      });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, isFloatingMinimized]);

  // Format seconds mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // If timer is completely inactive and not visible, or user is already on /os/timer, don't obstruct full engine
  const isTimerActive = isRunning || isPaused;
  if (!isTimerActive || !isFloatingVisible || location.pathname === '/os/timer') {
    return null;
  }

  const totalSecs = (durationMinutes || 25) * 60;
  const progressPct = totalSecs > 0 ? Math.min(100, Math.max(0, ((totalSecs - timeLeft) / totalSecs) * 100)) : 0;

  // Render Minimized Pill
  if (isFloatingMinimized) {
    return (
      <div 
        ref={containerRef}
        onPointerDown={handlePointerDown}
        style={{ 
          left: position.x !== null ? `${position.x}px` : 'auto', 
          top: position.y !== null ? `${position.y}px` : 'auto',
          bottom: position.y === null ? '24px' : 'auto',
          right: position.x === null ? '24px' : 'auto'
        }}
        className="fixed z-50 flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[var(--bg-card)]/90 backdrop-blur-xl border border-cyan-500/40 shadow-[0_8px_24px_rgba(0,0,0,0.35),0_0_15px_rgba(34,211,238,0.25)] select-none cursor-grab active:cursor-grabbing transition-transform"
      >
        <span className={`w-2.5 h-2.5 rounded-full ${isRunning && !isPaused ? 'bg-cyan-400 animate-pulse' : 'bg-amber-400'}`} />
        
        <span className="font-mono text-xs font-black text-[color:var(--text-main)]">
          {formatTime(timeLeft)}
        </span>

        {isRunning && !isPaused ? (
          <button 
            onClick={pauseTimer}
            className="p-1 rounded-full text-amber-400 hover:bg-[var(--bg-input)] cursor-pointer"
            title="Pause"
          >
            <Pause size={12} />
          </button>
        ) : (
          <button 
            onClick={resumeTimer}
            className="p-1 rounded-full text-cyan-400 hover:bg-[var(--bg-input)] cursor-pointer"
            title="Resume"
          >
            <Play size={12} />
          </button>
        )}

        <button 
          onClick={toggleFloatingMinimized}
          className="p-1 rounded-full text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] hover:bg-[var(--bg-input)] cursor-pointer"
          title="Expand"
        >
          <Maximize2 size={12} />
        </button>
      </div>
    );
  }

  // Render Full Floating Widget
  return (
    <div 
      ref={containerRef}
      onPointerDown={handlePointerDown}
      style={{ 
        left: position.x !== null ? `${position.x}px` : 'auto', 
        top: position.y !== null ? `${position.y}px` : 'auto',
        bottom: position.y === null ? '28px' : 'auto',
        right: position.x === null ? '28px' : 'auto'
      }}
      className="fixed z-50 w-72 rounded-2xl bg-[var(--bg-card)]/95 backdrop-blur-2xl border border-[var(--border-color)] shadow-[0_12px_32px_rgba(0,0,0,0.45),inset_1px_1px_2px_rgba(255,255,255,0.08)] flex flex-col gap-3 p-4 select-none cursor-grab active:cursor-grabbing transition-all animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Top Header Bar with Drag Handle and Window Controls */}
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2 text-[color:var(--text-muted)]">
        <div className="flex items-center gap-1.5">
          <GripHorizontal size={14} className="text-[color:var(--text-muted)] opacity-60" />
          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
            {mode}
          </span>
          <span className="text-[10px]">•</span>
          <span className="text-[10px] font-semibold text-[color:var(--text-muted)] truncate max-w-[110px]">
            {activeTopic}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={toggleFloatingMinimized}
            className="p-1 rounded-lg hover:bg-[var(--bg-input)] hover:text-[color:var(--text-main)] cursor-pointer transition-colors"
            title="Minimize"
          >
            <Minus size={13} />
          </button>
          <button 
            onClick={hideFloatingTimer}
            className="p-1 rounded-lg hover:bg-[var(--bg-input)] hover:text-red-400 cursor-pointer transition-colors"
            title="Dismiss from screen"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Clock & Status */}
      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono tracking-tight text-[color:var(--text-main)]">
              {formatTime(timeLeft)}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
              {isPaused ? 'Paused' : isRunning ? 'Focusing' : 'Idle'}
            </span>
          </div>
          <div className="w-44 h-1.5 rounded-full bg-[var(--bg-input)] overflow-hidden mt-1.5">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-1000"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Presence Badge & Toggle */}
        <button 
          onClick={() => togglePresence()}
          className={`p-2 rounded-xl border flex flex-col items-center gap-0.5 cursor-pointer transition-all ${
            presenceEnabled 
              ? presenceStatus === 'present'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]'
                : presenceStatus === 'absent'
                  ? 'bg-red-500/15 border-red-500/40 text-red-400 animate-pulse'
                  : 'bg-amber-500/15 border-amber-500/40 text-amber-400'
              : 'bg-[var(--bg-input)] border-[var(--border-color)] text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]'
          }`}
          title={presenceEnabled ? `Presence Active (${presenceStatus})` : 'Turn on Camera Presence'}
        >
          {presenceEnabled ? <Eye size={15} /> : <EyeOff size={15} />}
          <span className="text-[8px] font-bold uppercase">
            {presenceEnabled ? (presenceStatus === 'present' ? 'Face' : presenceStatus === 'absent' ? 'Away' : 'Scan') : 'Off'}
          </span>
        </button>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1.5">
          {isRunning && !isPaused ? (
            <button 
              onClick={pauseTimer}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.4)] cursor-pointer transition-all active:scale-95"
            >
              <Pause size={13} />
              <span>Pause</span>
            </button>
          ) : (
            <button 
              onClick={resumeTimer}
              className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.4)] cursor-pointer transition-all active:scale-95"
            >
              <Play size={13} />
              <span>Resume</span>
            </button>
          )}

          <button 
            onClick={stopTimer}
            className="p-2 rounded-xl bg-[var(--bg-input)] hover:bg-red-500/20 text-[color:var(--text-muted)] hover:text-red-400 border border-[var(--border-color)] cursor-pointer transition-all active:scale-95"
            title="Finish & Save Session"
          >
            <Square size={13} />
          </button>

          <button 
            onClick={() => addMinutes(5)}
            className="px-2 py-1.5 rounded-xl bg-[var(--bg-input)] hover:text-cyan-400 text-[color:var(--text-muted)] font-black text-xs border border-[var(--border-color)] cursor-pointer transition-all active:scale-95"
            title="Add 5 Minutes"
          >
            +5m
          </button>
        </div>

        {/* Link to Fullscreen Timer */}
        <button 
          onClick={() => navigate('/os/timer')}
          className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 cursor-pointer py-1"
        >
          <span>Engine</span>
          <ChevronRight size={12} />
        </button>
      </div>

      {/* Notification toast for absence */}
      {lastNotification && (
        <div className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg flex items-center justify-between">
          <span className="truncate max-w-[200px]">{lastNotification.message}</span>
          <button onClick={clearNotification} className="text-[color:var(--text-muted)] hover:text-white ml-1">
            <X size={10} />
          </button>
        </div>
      )}
    </div>
  );
}
