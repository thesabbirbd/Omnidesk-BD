import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  Square, 
  Minus, 
  Eye, 
  EyeOff, 
  GripHorizontal, 
  X, 
  ChevronRight
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
    isFloatingVisible,
    lastNotification,
    clearNotification,
    pauseTimer,
    resumeTimer,
    stopTimer,
    addMinutes,
    togglePresence,
    hideFloatingTimer
  } = useTimer();

  // Floating hover expansion state
  const [isHovered, setIsHovered] = useState(false);
  const collapseTimerRef = useRef(null);

  // Dragging state
  const [position, setPosition] = useState(() => {
    if (typeof window !== 'undefined') {
      return {
        x: Math.max(16, window.innerWidth - 300),
        y: Math.max(16, window.innerHeight - 300)
      };
    }
    return { x: 100, y: 100 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });
  const containerRef = useRef(null);

  // Clean up collapse timer on unmount
  useEffect(() => {
    return () => {
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (isDragging) return;
    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    // Auto-close in exactly 1 second after mouse leaves
    collapseTimerRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 1000);
  };

  // Boundary clamping for window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (prev.x === null) return prev;
        const currentSize = isHovered ? 268 : 88;
        const maxX = window.innerWidth - currentSize - 16;
        const maxY = window.innerHeight - currentSize - 16;
        return {
          x: Math.min(Math.max(16, prev.x), Math.max(16, maxX)),
          y: Math.min(Math.max(16, prev.y), Math.max(16, maxY))
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isHovered]);

  // Pointer drag handling
  const handlePointerDown = (e) => {
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a')) return;
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: position.x || (window.innerWidth - 300),
      posY: position.y || (window.innerHeight - 300)
    };
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartRef.current.mouseX;
      const deltaY = e.clientY - dragStartRef.current.mouseY;

      const currentSize = isHovered ? 268 : 88;
      const maxX = window.innerWidth - currentSize - 16;
      const maxY = window.innerHeight - currentSize - 16;

      setPosition({
        x: Math.min(Math.max(16, dragStartRef.current.posX + deltaX), Math.max(16, maxX)),
        y: Math.min(Math.max(16, dragStartRef.current.posY + deltaY), Math.max(16, maxY))
      });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      // Restart the 1-second auto-collapse timer after drag release
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = setTimeout(() => {
        setIsHovered(false);
      }, 1000);
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, isHovered]);

  // Format seconds mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isTimerActive = isRunning || isPaused;
  if (!isTimerActive || !isFloatingVisible || location.pathname === '/os/timer') {
    return null;
  }

  const totalSecs = (durationMinutes || 25) * 60;
  const progressPct = totalSecs > 0 ? Math.min(100, Math.max(0, ((totalSecs - timeLeft) / totalSecs) * 100)) : 0;

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        left: position.x !== null ? `${position.x}px` : 'auto',
        top: position.y !== null ? `${position.y}px` : 'auto',
        bottom: position.y === null ? '24px' : 'auto',
        right: position.x === null ? '24px' : 'auto'
      }}
      className={`fixed z-50 select-none cursor-grab active:cursor-grabbing rounded-full overflow-hidden transition-[width,height,transform,box-shadow,background-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        !isHovered 
          ? 'w-[88px] h-[88px] bg-slate-900/40 dark:bg-slate-950/40 backdrop-blur-2xl border border-cyan-400/50 shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_18px_rgba(34,211,238,0.3)] hover:scale-105'
          : 'w-[268px] h-[268px] bg-slate-900/85 dark:bg-slate-950/90 backdrop-blur-3xl border-2 border-cyan-400/60 shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_30px_rgba(34,211,238,0.35)] scale-100'
      }`}
    >
      {/* BACKGROUND AMBIENT GLOW */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/10 via-transparent to-indigo-500/15 pointer-events-none" />

      {/* STATE 1: COLLAPSED CIRCULAR BADGE (ONLY OUTER OUTLINE RING & DIGITS) */}
      <div 
        className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-300 pointer-events-none ${
          !isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
        }`}
      >
        {/* SVG Outer Ring for Collapsed State */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 p-1" viewBox="0 0 88 88">
          {/* Track Line */}
          <circle
            cx="44"
            cy="44"
            r="38"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="3.5"
            fill="transparent"
          />
          {/* Animated Progress Line */}
          <circle
            cx="44"
            cy="44"
            r="38"
            stroke="url(#collapsedTimerGrad)"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={238.76}
            strokeDashoffset={238.76 * (1 - progressPct / 100)}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
          <defs>
            <linearGradient id="collapsedTimerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>
        </svg>

        {/* Clean Countdown Time in the Center */}
        <span className="font-mono text-base font-black tracking-tight text-white drop-shadow-[0_0_10px_rgba(34,211,238,0.9)] select-none">
          {formatTime(timeLeft)}
        </span>
      </div>

      {/* STATE 2: UNFOLDED CIRCULAR HUD DIAL (FULLY CIRCULAR WITH ORBITAL CONTROLS) */}
      <div 
        className={`absolute inset-0 flex flex-col items-center justify-between p-3.5 transition-all duration-300 ${
          isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
        }`}
      >
        {/* SVG Outer Progress Ring for Unfolded State */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-1.5" viewBox="0 0 268 268">
          <circle
            cx="134"
            cy="134"
            r="126"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="3.5"
            fill="transparent"
          />
          <circle
            cx="134"
            cy="134"
            r="126"
            stroke="url(#unfoldedTimerGrad)"
            strokeWidth="4.5"
            fill="transparent"
            strokeDasharray={791.68}
            strokeDashoffset={791.68 * (1 - progressPct / 100)}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
          <defs>
            <linearGradient id="unfoldedTimerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>

        {/* TOP ARC: DRAG HANDLE & WINDOW ACTIONS */}
        <div className="w-full flex items-center justify-between px-5 pt-2 z-20">
          <div className="flex items-center gap-1.5">
            <GripHorizontal size={13} className="text-cyan-400 opacity-80" />
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
              {mode}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsHovered(false)}
              className="p-1 rounded-full hover:bg-white/15 text-[color:var(--text-muted)] hover:text-cyan-300 transition-colors cursor-pointer"
              title="Collapse to Circle"
            >
              <Minus size={12} />
            </button>
            <button
              onClick={hideFloatingTimer}
              className="p-1 rounded-full hover:bg-white/15 text-[color:var(--text-muted)] hover:text-red-400 transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X size={12} />
            </button>
          </div>
        </div>

        {/* CENTER HUB: TIME, TOPIC & STATUS */}
        <div className="flex flex-col items-center justify-center my-auto z-20">
          <span className="text-[10px] font-semibold text-slate-300/80 truncate max-w-[170px] text-center px-2">
            {activeTopic}
          </span>
          <span className="font-mono text-3xl font-black tracking-tight text-white drop-shadow-[0_0_14px_rgba(34,211,238,0.7)] my-0.5">
            {formatTime(timeLeft)}
          </span>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isRunning && !isPaused ? 'bg-cyan-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-[9px] font-black uppercase tracking-wider text-cyan-300/90">
              {isPaused ? 'Paused' : isRunning ? 'In Focus' : 'Idle'}
            </span>
          </div>
        </div>

        {/* MIDDLE-LOWER ROW: CIRCULAR ACTION BUTTONS */}
        <div className="flex items-center justify-center gap-3 z-20 pb-1">
          {/* +5 Minutes Button */}
          <button
            onClick={() => addMinutes(5)}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-cyan-300 text-xs font-black flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
            title="Add 5 Minutes"
          >
            +5m
          </button>

          {/* Primary Play / Pause Button */}
          {isRunning && !isPaused ? (
            <button
              onClick={pauseTimer}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 flex items-center justify-center shadow-[0_0_16px_rgba(245,158,11,0.6)] active:scale-95 transition-all cursor-pointer"
              title="Pause Timer"
            >
              <Pause size={18} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={resumeTimer}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 flex items-center justify-center shadow-[0_0_18px_rgba(34,211,238,0.7)] active:scale-95 transition-all cursor-pointer"
              title="Start / Resume Timer"
            >
              <Play size={18} fill="currentColor" className="ml-0.5" />
            </button>
          )}

          {/* Stop / Reset Button */}
          <button
            onClick={stopTimer}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-red-500/20 border border-white/15 text-slate-300 hover:text-red-400 flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
            title="Stop & Save Session"
          >
            <Square size={14} fill="currentColor" />
          </button>
        </div>

        {/* BOTTOM ARC: PRESENCE TOGGLE & ENGINE LINK */}
        <div className="w-full flex items-center justify-between px-6 pb-2.5 z-20">
          <button
            onClick={() => togglePresence()}
            className={`px-2.5 py-1 rounded-full border text-[9px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
              presenceEnabled
                ? presenceStatus === 'present'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.4)]'
                  : 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-white/5 border-white/10 text-[color:var(--text-muted)] hover:text-white'
            }`}
            title="Toggle Camera Presence"
          >
            {presenceEnabled ? <Eye size={11} /> : <EyeOff size={11} />}
            <span>{presenceEnabled ? presenceStatus : 'Camera'}</span>
          </button>

          <button
            onClick={() => navigate('/os/timer')}
            className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 cursor-pointer"
            title="Open Fullscreen Timer Engine"
          >
            <span>Engine</span>
            <ChevronRight size={12} />
          </button>
        </div>

        {/* Floating Notification Toast */}
        {lastNotification && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-950/90 border border-amber-500/40 text-amber-300 text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-lg z-30 flex items-center gap-1.5 max-w-[210px]">
            <span className="truncate">{lastNotification.message}</span>
            <button onClick={clearNotification} className="hover:text-white cursor-pointer">
              <X size={10} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
