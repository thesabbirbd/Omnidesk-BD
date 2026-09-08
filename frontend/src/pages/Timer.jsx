import React from 'react';
import { Play, Pause, RotateCcw, Clock, Brain, Coffee, Eye, EyeOff, Square, Sparkles, AlertCircle, Lock } from 'lucide-react';
import { useTimer } from '../context/TimerContext';

export default function Timer() {
  const {
    mode,
    timeLeft,
    durationMinutes,
    activeTopic,
    isRunning,
    isPaused,
    presenceEnabled,
    presenceStatus,
    history,
    lastNotification,
    clearNotification,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    setTimerMode,
    togglePresence,
    presenceIntervalSecs,
    setPresenceInterval,
    modes
  } = useTimer();

  const isTimerActive = isRunning || isPaused;

  const modeDefinitions = {
    pomodoro: { label: 'Pomodoro', mins: 25, icon: Brain },
    focus: { label: 'Deep Focus', mins: 50, icon: Clock },
    short_break: { label: 'Short Break', mins: 5, icon: Coffee },
    stopwatch: { label: 'Stopwatch', mins: 0, icon: Coffee }
  };

  const handleModeChange = (newMode) => {
    if (isTimerActive) return;
    const def = modeDefinitions[newMode];
    setTimerMode(newMode, def.mins);
  };

  const handleToggle = () => {
    if (isRunning && !isPaused) {
      pauseTimer();
    } else if (isRunning && isPaused) {
      resumeTimer();
    } else {
      startTimer({ mode });
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate total focus time today
  const totalMinutesToday = (history || []).reduce((acc, curr) => acc + (curr.durationMinutes || curr.duration || 0), 0);
  const hours = Math.floor(totalMinutesToday / 60);
  const mins = totalMinutesToday % 60;

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-canvas)] text-[color:var(--text-main)] overflow-y-auto p-4 md:p-8 lg:p-12 items-center gap-8 md:gap-12 relative">

      {/* Active Topic Tag */}
      {activeTopic && (
        <div className="px-4 py-1.5 rounded-full bg-[var(--bg-input)] border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-wide shadow-[inset_1px_1px_2px_var(--shadow-dark)]">
          Target Topic: <span className="text-[color:var(--text-main)]">{activeTopic}</span>
        </div>
      )}

      {/* Mode Selector Tabs */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-4 p-2 bg-[var(--bg-panel)] rounded-2xl shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)]">
        {Object.entries(modeDefinitions).map(([key, item]) => {
          const Icon = item.icon;
          const isActive = mode === key;
          const isBlocked = isTimerActive && !isActive;
          return (
            <button
              key={key}
              disabled={isBlocked}
              onClick={() => handleModeChange(key)}
              title={isBlocked ? 'Active timer running! Stop the timer to change modes.' : item.label}
              className={`flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-bold text-xs md:text-sm transition-all duration-300 ${
                isBlocked
                  ? 'opacity-40 cursor-not-allowed text-[color:var(--text-muted)]'
                  : 'cursor-pointer'
              } ${
                isActive 
                  ? 'bg-[var(--bg-card)] text-cyan-400 shadow-[4px_4px_10px_var(--shadow-dark),-4px_-4px_10px_var(--shadow-light)]' 
                  : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]'
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {isBlocked && <Lock size={12} className="ml-1 opacity-60" />}
            </button>
          );
        })}
      </div>

      {/* Main Circular Timer Display */}
      <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center bg-[var(--bg-panel)] rounded-full shadow-[8px_8px_20px_var(--shadow-dark),-8px_-8px_20px_var(--shadow-light)] border-[4px] border-[var(--bg-canvas)] group">
        <div className="absolute inset-4 rounded-full bg-[var(--bg-card)] shadow-[inset_6px_6px_12px_var(--shadow-dark),inset_-6px_-6px_12px_var(--shadow-light)] flex items-center justify-center flex-col">
          
          <span 
            className="text-6xl md:text-7xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 to-blue-600"
            style={{ textShadow: '0 0 40px rgba(34,211,238,0.35)' }}
          >
            {formatTime(timeLeft)}
          </span>
          <span className="text-[color:var(--text-muted)] font-semibold tracking-widest uppercase mt-3 text-xs md:text-sm">
            {mode === 'stopwatch' ? 'Elapsed' : isRunning && !isPaused ? 'Focusing...' : isPaused ? 'Paused' : 'Ready'}
          </span>
          
        </div>
      </div>

      {/* Tactical Controls */}
      <div className="flex items-center gap-6">
        <button 
          onClick={handleToggle}
          className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
            isRunning && !isPaused 
              ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)]' 
              : 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:scale-105 active:scale-95'
          }`}
          title={isRunning && !isPaused ? 'Pause' : 'Start'}
        >
          {isRunning && !isPaused ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
        </button>

        <button 
          onClick={resetTimer}
          className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-300 bg-[var(--bg-card)] shadow-[6px_6px_12px_var(--shadow-dark),-6px_-6px_12px_var(--shadow-light)] active:shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)] text-[color:var(--text-muted)] hover:text-cyan-400 cursor-pointer"
          title="Reset Timer"
        >
          <RotateCcw size={24} />
        </button>
        
        {/* Stop / Finish button */}
        {(isRunning || isPaused) && (
          <button 
            onClick={stopTimer}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-300 bg-[var(--bg-card)] shadow-[6px_6px_12px_var(--shadow-dark),-6px_-6px_12px_var(--shadow-light)] text-red-400 hover:scale-105 active:scale-95 cursor-pointer"
            title="Complete & Save Session"
          >
            <Square size={22} />
          </button>
        )}
      </div>

      {/* Camera Presence Detection Card */}
      <div className="p-6 md:p-8 rounded-[32px] bg-[var(--bg-card)] shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col items-center justify-center text-center gap-4 w-full max-w-md">
        <div className="flex items-center gap-2">
          {presenceEnabled ? <Eye className="text-cyan-400" size={22} /> : <EyeOff className="text-[color:var(--text-muted)]" size={22} />}
          <h3 className="text-base md:text-lg font-bold text-[color:var(--text-main)]">
            Local Camera Presence Detection
          </h3>
        </div>
        
        <p className="text-xs md:text-sm font-medium text-[color:var(--text-muted)] max-w-[320px]">
          Quick snapshot check every {presenceIntervalSecs}s. Camera immediately turns off after each check.
        </p>
        
        <button 
          onClick={() => togglePresence()}
          className={`relative w-16 h-8 rounded-full transition-all duration-300 flex items-center px-1 cursor-pointer ${
            presenceEnabled 
              ? 'bg-cyan-500 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5),0_0_10px_rgba(34,211,238,0.5)]' 
              : 'bg-[var(--bg-input)] shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)]'
          }`}
        >
          <div className={`w-6 h-6 rounded-full bg-white shadow-[2px_2px_4px_var(--shadow-dark)] transition-all duration-300 ${
            presenceEnabled ? 'translate-x-8' : 'translate-x-0'
          }`} />
        </button>

        {/* System Settings: Check Timer Intervals */}
        <div className="flex flex-col gap-2 w-full pt-2 border-t border-[var(--border-color)]">
          <span className="text-[10px] font-black uppercase tracking-wider text-[color:var(--text-muted)]">
            Check Frequency Setting
          </span>
          <div className="grid grid-cols-4 gap-2">
            {[
              { secs: 5, label: '5s (Def)' },
              { secs: 30, label: '30s' },
              { secs: 60, label: '60s' },
              { secs: 300, label: '5m' },
            ].map((option) => (
              <button
                key={option.secs}
                onClick={() => setPresenceInterval(option.secs)}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  presenceIntervalSecs === option.secs
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.5)] scale-105'
                    : 'bg-[var(--bg-input)] text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] border border-[var(--border-color)]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {presenceEnabled && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs font-bold">
            <span className={`w-2 h-2 rounded-full ${
              presenceStatus === 'present' ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' :
              presenceStatus === 'absent' ? 'bg-red-400 animate-pulse' : 'bg-amber-400'
            }`} />
            <span className="text-[color:var(--text-muted)]">Status:</span>
            <span className="capitalize text-[color:var(--text-main)]">{presenceStatus}</span>
          </div>
        )}
      </div>

      {/* Session History Widget */}
      <div className="w-full max-w-2xl flex flex-col gap-6 p-6 md:p-8 bg-[var(--bg-panel)] rounded-3xl shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)] border border-[var(--border-color)]">
        <div className="flex justify-between items-center pb-4 border-b border-[var(--border-color)]">
          <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
            <Clock className="text-cyan-400" /> Focus History
          </h3>
          <div className="text-right">
            <span className="block text-xl md:text-2xl font-black text-cyan-400">{hours}h {mins}m</span>
            <span className="text-[10px] uppercase tracking-widest text-[color:var(--text-muted)] font-bold">Total Recorded</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {(!history || history.length === 0) ? (
            <p className="text-center text-[color:var(--text-muted)] py-4 text-xs">No sessions yet. Start focusing!</p>
          ) : (
            history.slice(0, 6).map((session, idx) => (
              <div key={session.id || idx} className="flex justify-between items-center p-3 md:p-4 bg-[var(--bg-input)] rounded-2xl shadow-[inset_2px_2px_6px_var(--shadow-dark),inset_-2px_-2px_6px_var(--shadow-light)]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[var(--bg-card)] rounded-xl shadow-[2px_2px_4px_var(--shadow-dark),-2px_-2px_4px_var(--shadow-light)] text-cyan-400">
                    {session.mode === 'pomodoro' ? <Brain size={16} /> : session.mode === 'focus' ? <Clock size={16} /> : <Coffee size={16} />}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-xs md:text-sm text-[color:var(--text-main)] truncate max-w-[200px] md:max-w-[280px]">
                      {session.topic || session.label || 'Deep Focus'}
                    </span>
                    <span className="text-[10px] text-[color:var(--text-muted)] capitalize">{session.mode}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[color:var(--text-muted)] text-xs">
                    {session.completedAt ? new Date(session.completedAt).toLocaleDateString() : (session.date || 'Today')}
                  </span>
                  <span className="font-bold text-sm md:text-base text-cyan-400">+{session.durationMinutes || session.duration}m</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
