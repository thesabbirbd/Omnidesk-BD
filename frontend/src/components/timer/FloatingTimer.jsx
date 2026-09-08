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
  const [isHovered, setIsHovered] = useState(true);
  const collapseTimerRef = useRef(null);

  // Dragging state
  const [position, setPosition] = useState(() => {
    if (typeof window !== 'undefined') {
      return {
        x: Math.max(16, window.innerWidth - 300),
        y: Math.max(16, window.innerHeight - 220)
      };
    }
    return { x: 100, y: 100 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });
  const containerRef = useRef(null);

  // On mount / activation, display full card for 3 seconds then auto-collapse to circle
  useEffect(() => {
    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    collapseTimerRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 3000);

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
    collapseTimerRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 3000);
  };

  // Handle window resize bounds
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (prev.x === null) return prev;
        const currentWidth = isHovered ? 290 : 96;
        const currentHeight = isHovered ? 190 : 96;
        const maxX = window.innerWidth - currentWidth - 12;
        const maxY = window.innerHeight - currentHeight - 12;
        return {
          x: Math.min(Math.max(12, prev.x), Math.max(12, maxX)),
          y: Math.min(Math.max(12, prev.y), Math.max(12, maxY))
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isHovered]);

  // Pointer drag listeners
  const handlePointerDown = (e) => {
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a')) return;
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: position.x || (window.innerWidth - 300),
      posY: position.y || (window.innerHeight - 220)
    };
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartRef.current.mouseX;
      const deltaY = e.clientY - dragStartRef.current.mouseY;

      const currentWidth = isHovered ? 290 : 96;
      const currentHeight = isHovered ? 190 : 96;
      const maxX = window.innerWidth - currentWidth - 12;
      const maxY = window.innerHeight - currentHeight - 12;

      setPosition({
        x: Math.min(Math.max(12, dragStartRef.current.posX + deltaX), Math.max(12, maxX)),
        y: Math.min(Math.max(12, dragStartRef.current.posY + deltaY), Math.max(12, maxY))
      });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      // Restart the 3-second auto-collapse timer after dragging completes
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = setTimeout(() => {
        setIsHovered(false);
      }, 3000);
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
      className={`fixed z-50 select-none transition-all duration-300 ease-out cursor-grab active:cursor-grabbing ${
        !isHovered ? 'w-24 h-24' : 'w-72'
      }`}
    >
      {!isHovered ? (
        /* Circular Mostly-Transparent Frosted Glass Timer Badge */
        <div className="relative w-24 h-24 rounded-full bg-slate-900/40 dark:bg-slate-950/40 backdrop-blur-3xl border border-cyan-400/50 shadow-[0_12px_32px_rgba(0,0,0,0.5),0_0_20px_rgba(34,211,238,0.3)] flex flex-col items-center justify-center group overflow-hidden transition-transform duration-300 hover:scale-105">
          {/* SVG Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-1" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="43"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="43"
              stroke="url(#timerCircleGrad)"
              strokeWidth="4.5"
              fill="transparent"
              strokeDasharray={270.18}
              strokeDashoffset={270.18 * (1 - progressPct / 100)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
            <defs>
              <linearGradient id="timerCircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>

          {/* Time & Indicator */}
          <span className="font-mono text-sm font-black tracking-tight text-white drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] z-10">
            {formatTime(timeLeft)}
          </span>

          <div className="flex items-center gap-1 z-10 mt-0.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isRunning && !isPaused ? 'bg-cyan-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-[9px] font-black uppercase tracking-wider text-cyan-300/80">
              {mode === 'pomodoro' ? 'POMO' : mode === 'focus' ? 'FOCUS' : 'TIMER'}
            </span>
          </div>
        </div>
      ) : (
        /* Expanded Control Card with Full Options */
        <div className="w-72 rounded-3xl bg-slate-900/80 dark:bg-slate-950/80 backdrop-blur-3xl border border-cyan-400/40 shadow-[0_16px_40px_rgba(0,0,0,0.6),0_0_24px_rgba(34,211,238,0.25)] flex flex-col gap-3 p-4 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Top Header Bar with Drag Handle and Window Controls */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2 text-[color:var(--text-muted)]">
            <div className="flex items-center gap-1.5">
              <GripHorizontal size={14} className="text-[color:var(--text-muted)] opacity-70" />
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
                onClick={() => setIsHovered(false)}
                className="p-1 rounded-lg hover:bg-white/10 hover:text-cyan-400 cursor-pointer transition-colors"
                title="Collapse to Circle"
              >
                <Minus size={13} />
              </button>
              <button 
                onClick={hideFloatingTimer}
                className="p-1 rounded-lg hover:bg-white/10 hover:text-red-400 cursor-pointer transition-colors"
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
                <span className="text-3xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400/80">
                  {isPaused ? 'Paused' : isRunning ? 'Focusing' : 'Idle'}
                </span>
              </div>
              <div className="w-44 h-1.5 rounded-full bg-white/10 overflow-hidden mt-1.5">
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
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.4)]'
                    : presenceStatus === 'absent'
                      ? 'bg-red-500/20 border-red-500/50 text-red-300 animate-pulse'
                      : 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-white/5 border-white/10 text-[color:var(--text-muted)] hover:text-white'
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
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.5)] cursor-pointer transition-all active:scale-95"
                >
                  <Pause size={13} />
                  <span>Pause</span>
                </button>
              ) : (
                <button 
                  onClick={resumeTimer}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.5)] cursor-pointer transition-all active:scale-95"
                >
                  <Play size={13} />
                  <span>Resume</span>
                </button>
              )}

              <button 
                onClick={stopTimer}
                className="p-2 rounded-xl bg-white/5 hover:bg-red-500/25 text-[color:var(--text-muted)] hover:text-red-400 border border-white/10 cursor-pointer transition-all active:scale-95"
                title="Finish & Save Session"
              >
                <Square size={13} />
              </button>

              <button 
                onClick={() => addMinutes(5)}
                className="px-2 py-1.5 rounded-xl bg-white/5 hover:text-cyan-400 text-[color:var(--text-muted)] font-black text-xs border border-white/10 cursor-pointer transition-all active:scale-95"
                title="Add 5 Minutes"
              >
                +5m
              </button>
            </div>

            {/* Link to Fullscreen Engine */}
            <button 
              onClick={() => navigate('/os/timer')}
              className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 cursor-pointer py-1"
            >
              <span>Engine</span>
              <ChevronRight size={12} />
            </button>
          </div>

          {/* Notification toast */}
          {lastNotification && (
            <div className="text-[10px] font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1.5 rounded-lg flex items-center justify-between">
              <span className="truncate max-w-[200px]">{lastNotification.message}</span>
              <button onClick={clearNotification} className="text-[color:var(--text-muted)] hover:text-white ml-1 cursor-pointer">
                <X size={10} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
