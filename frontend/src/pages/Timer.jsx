import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, Brain, Coffee, Eye, EyeOff } from 'lucide-react';
import { createSession } from '../services/api';

export default function Timer() {
  const [mode, setMode] = useState('pomodoro'); // pomodoro, focus, stopwatch
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState(null);
  
  // Phase 10: Presence Service
  const [isPresenceEnabled, setIsPresenceEnabled] = useState(false);
  const [presenceIntervalSecs, setPresenceIntervalSecs] = useState(5); // default 5s
  const [notification, setNotification] = useState(null); // { message, type }
  const [mockIsAbsent, setMockIsAbsent] = useState(false); // for testing auto-pause

  // Presence Detection Scaffolding
  useEffect(() => {
    let presenceInterval;
    if (isPresenceEnabled && isActive) {
      presenceInterval = setInterval(() => {
        const isFaceDetected = !mockIsAbsent; 
        
        if (isFaceDetected) {
          setNotification({ message: 'Presence Detected! Keep focusing.', type: 'success' });
          setTimeout(() => setNotification(null), 3000);
        } else {
          setNotification({ message: 'No face detected! Auto-pausing timer.', type: 'warning' });
          setIsActive(false);
          setTimeout(() => setNotification(null), 4000);
        }
      }, presenceIntervalSecs * 1000);
    }
    return () => clearInterval(presenceInterval);
  }, [isPresenceEnabled, isActive, presenceIntervalSecs, mockIsAbsent]);
  
  const [history, setHistory] = useState([
    { id: 1, mode: 'pomodoro', duration: 25, date: new Date().toLocaleDateString() },
    { id: 2, mode: 'focus', duration: 50, date: new Date().toLocaleDateString() }
  ]);

  const timerRef = useRef(null);

  // Mode settings
  const modes = {
    pomodoro: { time: 25 * 60, label: 'Pomodoro', icon: Brain },
    focus: { time: 50 * 60, label: 'Long Focus', icon: Clock },
    stopwatch: { time: 0, label: 'Stopwatch', icon: Coffee }
  };

  const switchMode = (newMode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(modes[newMode].time);
    setStartTime(null);
  };

  useEffect(() => {
    if (isActive) {
      if (!startTime) setStartTime(new Date());

      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (mode === 'stopwatch') {
            return prevTime + 1;
          } else {
            if (prevTime <= 1) {
              handleSessionComplete();
              return 0;
            }
            return prevTime - 1;
          }
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, mode]);

  const handleSessionComplete = async () => {
    setIsActive(false);
    clearInterval(timerRef.current);
    
    const duration = mode === 'stopwatch' ? Math.floor(timeLeft / 60) : modes[mode].time / 60;
    
    if (duration > 0) {
      try {
        const newSession = await createSession({
          topic_id: null, // Global session for now
          duration_minutes: duration,
          mode: mode
        });
        
        setHistory([
          { id: newSession.id, mode: newSession.mode, duration: newSession.duration_minutes, date: new Date(newSession.start_time).toLocaleDateString() },
          ...history
        ]);
      } catch (err) {
        console.error("Failed to save session", err);
      }
    }
    
    // Reset based on mode
    setTimeLeft(modes[mode].time);
    setStartTime(null);
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(modes[mode].time);
    setStartTime(null);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate total hours today
  const totalMinutesToday = history.reduce((acc, curr) => acc + curr.duration, 0);
  const hours = Math.floor(totalMinutesToday / 60);
  const mins = totalMinutesToday % 60;

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-canvas)] text-[color:var(--text-main)] overflow-y-auto p-6 md:p-12 items-center gap-12 relative">
      
      {/* Top Right Notification */}
      {notification && (
        <div className={`fixed top-8 right-8 z-50 px-6 py-4 rounded-2xl shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)] border border-[var(--border-color)] flex items-center gap-3 transition-all duration-300 transform translate-y-0 opacity-100 ${
          notification.type === 'success' ? 'bg-[var(--bg-card)]' : 'bg-red-500/10 border-red-500/30'
        }`}>
          {notification.type === 'success' ? <Eye className="text-green-400" size={24}/> : <EyeOff className="text-red-400" size={24}/>}
          <span className={`font-bold ${notification.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {notification.message}
          </span>
        </div>
      )}

      {/* Mode Selector */}
      <div className="flex gap-4 p-2 bg-[var(--bg-panel)] rounded-2xl shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)]">
        {Object.keys(modes).map(m => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
              mode === m 
                ? 'bg-[var(--bg-card)] text-cyan-400 shadow-[4px_4px_10px_var(--shadow-dark),-4px_-4px_10px_var(--shadow-light)]' 
                : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]'
            }`}
          >
            {React.createElement(modes[m].icon, { size: 18 })}
            <span className="hidden sm:inline">{modes[m].label}</span>
          </button>
        ))}
      </div>

      {/* Main Timer Display */}
      <div className="relative w-80 h-80 flex items-center justify-center bg-[var(--bg-panel)] rounded-full shadow-[8px_8px_20px_var(--shadow-dark),-8px_-8px_20px_var(--shadow-light)] border-[4px] border-[var(--bg-canvas)] group">
        <div className="absolute inset-4 rounded-full bg-[var(--bg-card)] shadow-[inset_6px_6px_12px_var(--shadow-dark),inset_-6px_-6px_12px_var(--shadow-light)] flex items-center justify-center flex-col">
          
          <span 
            className="text-7xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 to-blue-600"
            style={{ textShadow: '0 0 40px rgba(34,211,238,0.4)' }}
          >
            {formatTime(timeLeft)}
          </span>
          <span className="text-[color:var(--text-muted)] font-semibold tracking-widest uppercase mt-4 text-sm">
            {mode === 'stopwatch' ? 'Elapsed' : 'Remaining'}
          </span>
          
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-8">
        <button 
          onClick={toggleTimer}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
            isActive 
              ? 'bg-[var(--bg-panel)] shadow-[inset_6px_6px_12px_var(--shadow-dark),inset_-6px_-6px_12px_var(--shadow-light)] text-orange-400' 
              : 'bg-[var(--bg-card)] shadow-[6px_6px_12px_var(--shadow-dark),-6px_-6px_12px_var(--shadow-light)] text-cyan-400 hover:scale-105'
          }`}
        >
          {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-2" />}
        </button>

        <button 
          onClick={resetTimer}
          className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 bg-[var(--bg-card)] shadow-[6px_6px_12px_var(--shadow-dark),-6px_-6px_12px_var(--shadow-light)] active:shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)] text-[color:var(--text-muted)] hover:text-slate-200"
        >
          <RotateCcw size={28} />
        </button>
        
        {/* Stop Button (only for stopwatch to end manually) */}
        {mode === 'stopwatch' && isActive && (
          <button 
            onClick={handleSessionComplete}
            className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 bg-[var(--bg-card)] shadow-[6px_6px_12px_var(--shadow-dark),-6px_-6px_12px_var(--shadow-light)] active:shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)] text-red-400 hover:scale-105"
          >
            <div className="w-6 h-6 bg-red-400 rounded-sm"></div>
          </button>
        )}
      </div>

      {/* Presence Service Toggle */}
      <div className="mt-8 p-6 md:p-8 rounded-[32px] overflow-hidden bg-[var(--bg-card)] shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col items-center justify-center text-center gap-4 overflow-hidden w-full max-w-md">
        <h3 className="text-lg font-bold text-[color:var(--text-main)] flex items-center gap-3 justify-center w-full">
          {isPresenceEnabled ? <Eye className="text-cyan-400" size={24} /> : <EyeOff className="text-[color:var(--text-muted)]" size={24} />}
          Camera Presence
        </h3>
        <p className="text-sm font-medium text-[color:var(--text-muted)] max-w-[280px]">
          Auto-pause the timer when you step away from the keyboard.
        </p>
        
        <button 
          onClick={() => setIsPresenceEnabled(!isPresenceEnabled)}
          className={`relative w-20 h-10 rounded-full mt-2 transition-all duration-300 flex items-center px-1 ${
            isPresenceEnabled 
              ? 'bg-cyan-500 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5),0_0_10px_rgba(34,211,238,0.5)]' 
              : 'bg-[var(--bg-input)] shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)]'
          }`}
        >
          <div className={`w-8 h-8 rounded-full bg-[var(--bg-card)] shadow-[2px_2px_4px_var(--shadow-dark),-2px_-2px_4px_var(--shadow-light)] transition-all duration-300 ${
            isPresenceEnabled ? 'translate-x-10' : 'translate-x-0'
          }`}></div>
        </button>

        {isPresenceEnabled && (
          <div className="flex flex-col w-full gap-4 mt-2">
            <div className="flex flex-col gap-2 mt-4 items-center">
              <label className="text-xs font-bold uppercase text-[color:var(--text-muted)]">Check Interval</label>
              <select 
                value={presenceIntervalSecs} 
                onChange={(e) => setPresenceIntervalSecs(Number(e.target.value))}
                className="bg-[var(--bg-input)] border border-[var(--border-color)] text-[color:var(--text-main)] rounded-xl px-4 py-2 text-sm font-semibold shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] focus:outline-none focus:border-cyan-500/50"
              >
                <option value={5}>5 Seconds (Test)</option>
                <option value={10}>10 Seconds</option>
                <option value={30}>30 Seconds</option>
                <option value={60}>1 Minute</option>
                <option value={120}>2 Minutes</option>
                <option value={300}>5 Minutes</option>
                <option value={600}>10 Minutes</option>
              </select>
            </div>
            
            {/* Mock testing toggle */}
            <div className="flex justify-between items-center px-5 py-3 rounded-xl bg-orange-500/10 border border-orange-500/30 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)]">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                <EyeOff size={14} /> Simulate Absence
              </span>
              <input 
                type="checkbox" 
                checked={mockIsAbsent} 
                onChange={(e) => setMockIsAbsent(e.target.checked)} 
                className="w-4 h-4 accent-orange-500 cursor-pointer" 
              />
            </div>
          </div>
        )}
      </div>

      {/* Session History Widget */}
      <div className="w-full max-w-2xl mt-8 flex flex-col gap-6 p-8 bg-[var(--bg-panel)] rounded-3xl shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)] border border-[var(--border-color)]">
        <div className="flex justify-between items-center pb-4 border-b border-[var(--border-color)]">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Clock className="text-cyan-400" /> Session History
          </h3>
          <div className="text-right">
            <span className="block text-2xl font-black text-cyan-400">{hours}h {mins}m</span>
            <span className="text-xs uppercase tracking-widest text-[color:var(--text-muted)]">Today</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {history.length === 0 ? (
            <p className="text-center text-[color:var(--text-muted)] py-4">No sessions yet. Start focusing!</p>
          ) : (
            history.slice(0, 5).map((session, idx) => (
              <div key={idx} className="flex justify-between items-center p-4 bg-[var(--bg-input)] rounded-2xl shadow-[inset_2px_2px_6px_var(--shadow-dark),inset_-2px_-2px_6px_var(--shadow-light)]">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-[var(--bg-card)] rounded-xl shadow-[2px_2px_4px_var(--shadow-dark),-2px_-2px_4px_var(--shadow-light)] text-cyan-400">
                    {session.mode === 'pomodoro' ? <Brain size={18} /> : session.mode === 'focus' ? <Clock size={18} /> : <Coffee size={18} />}
                  </div>
                  <span className="font-semibold capitalize text-[color:var(--text-main)]">{session.mode}</span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-[color:var(--text-muted)] text-sm">{session.date}</span>
                  <span className="font-bold text-lg text-cyan-400">+{session.duration}m</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
