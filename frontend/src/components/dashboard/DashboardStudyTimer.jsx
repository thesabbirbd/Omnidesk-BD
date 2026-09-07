import React, { useState, useEffect, useRef } from 'react';
import { Timer as TimerIcon, ChevronRight, Play, Pause, RotateCcw, Plus, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardStudyTimer() {
  const navigate = useNavigate();

  // State ISOLATED to this component to prevent full-dashboard re-renders every second
  const [timerMode, setTimerMode] = useState('pomodoro'); // pomodoro (25m), focus (50m), custom (15m)
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState([
    { id: 1, label: 'Python OOP', time: '10:24 AM', duration: '25m', mode: 'Focus' },
    { id: 2, label: 'FastAPI Router', time: '09:30 AM', duration: '45m', mode: 'Study' },
  ]);

  const maxSeconds = timerMode === 'focus' ? 50 * 60 : timerMode === 'custom' ? 15 * 60 : 25 * 60;

  useEffect(() => {
    let interval = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            // Session complete
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggle = () => {
    setTimerRunning(!timerRunning);
  };

  const handleReset = () => {
    setTimerRunning(false);
    setTimerSeconds(maxSeconds);
  };

  const handleAdd5 = () => {
    setTimerSeconds((prev) => prev + 300);
  };

  const handleModeChange = (mode, secs) => {
    setTimerMode(mode);
    setTimerSeconds(secs);
    setTimerRunning(false);
  };

  const progressPercent = Math.min(100, Math.max(0, (timerSeconds / maxSeconds) * 100));

  return (
    <div className="p-6 rounded-3xl bg-[var(--bg-card)] shadow-[6px_6px_14px_var(--shadow-dark),-6px_-6px_14px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col justify-between gap-4 h-full min-h-[480px] transition-all">
      
      {/* Top Header & Mode Tabs */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2">
            <TimerIcon size={18} className="text-orange-400" />
            <h3 className="text-xs font-black tracking-wide text-[color:var(--text-main)] uppercase">
              Study Timer
            </h3>
          </div>
          <button 
            onClick={() => navigate('/os/timer')}
            className="text-[color:var(--text-muted)] hover:text-orange-400 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
            title="Open Fullscreen Focus Engine"
          >
            <span>Full Engine</span>
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Mode Selector Tabs with Inset Pressed States */}
        <div className="flex items-center justify-center gap-1.5 p-1 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] shadow-[inset_1px_1px_3px_var(--shadow-dark)]">
          {[
            { id: 'pomodoro', label: 'Pomodoro', secs: 25 * 60 },
            { id: 'focus', label: 'Deep Focus', secs: 50 * 60 },
            { id: 'custom', label: 'Short Break', secs: 15 * 60 },
          ].map((mode) => {
            const isActive = timerMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode.id, mode.secs)}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--bg-card)] text-orange-400 shadow-[2px_2px_6px_var(--shadow-dark)] border border-orange-500/20'
                    : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] active:opacity-75'
                }`}
              >
                {mode.label}
              </button>
            );
          })}
        </div>

        {/* Circular Countdown Ring with Gradient */}
        <div className="flex flex-col items-center justify-center gap-3 py-1">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <defs>
                <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>
              <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="rgba(51, 65, 85, 0.35)" strokeWidth="2.6" />
              <circle 
                cx="18" 
                cy="18" 
                r="15.9155" 
                fill="transparent" 
                stroke="url(#timer-gradient)" 
                strokeWidth="2.8" 
                strokeDasharray="100 100" 
                strokeDashoffset={100 - progressPercent}
                strokeLinecap="round" 
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute flex flex-col items-center pointer-events-none select-none">
              <span className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                {formatTimer(timerSeconds)}
              </span>
              <span className="text-[9px] font-bold text-[color:var(--text-muted)] uppercase tracking-wider mt-0.5">
                {timerRunning ? 'Focusing...' : 'Paused'}
              </span>
            </div>
          </div>

          {/* Premium Tactile Controls (Active/Pressed Inset Clay States) */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggle}
              className="w-10 h-10 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 flex items-center justify-center shadow-[0_0_12px_rgba(249,115,22,0.6)] hover:scale-105 active:scale-95 active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.6)] transition-all cursor-pointer"
              title={timerRunning ? 'Pause' : 'Start'}
            >
              {timerRunning ? <Pause size={17} /> : <Play size={17} className="ml-0.5" />}
            </button>

            <button
              onClick={handleReset}
              className="w-10 h-10 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] flex items-center justify-center shadow-[inset_2px_2px_4px_var(--shadow-dark)] active:scale-95 active:shadow-[inset_4px_4px_8px_var(--shadow-dark)] transition-all cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw size={15} />
            </button>

            <button
              onClick={handleAdd5}
              className="px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[11px] font-black text-orange-400 hover:text-orange-300 shadow-[inset_2px_2px_4px_var(--shadow-dark)] active:scale-95 active:shadow-[inset_3px_3px_6px_var(--shadow-dark)] transition-all cursor-pointer"
              title="Add 5 minutes"
            >
              +5m
            </button>
          </div>
        </div>
      </div>

      {/* Session History */}
      <div className="pt-3 border-t border-[var(--border-color)] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-[color:var(--text-muted)]">
            Session History
          </span>
          <span 
            className="text-[10px] font-bold text-cyan-400 hover:underline cursor-pointer" 
            onClick={() => navigate('/os/timer')}
          >
            History
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          {completedSessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between text-xs px-2 py-1 rounded-lg bg-[var(--bg-input)]/40 border border-[var(--border-color)]/60">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="font-semibold text-[color:var(--text-main)] truncate max-w-[120px]">{session.label}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-emerald-400 font-bold">{session.duration}</span>
                <span className="text-[color:var(--text-muted)]">{session.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
