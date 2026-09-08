import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { createSession } from '../services/api';
import { startPresenceDetection, stopPresenceDetection } from '../services/presenceDetection';

const TimerContext = createContext(null);

const STORAGE_KEY = 'studyos_global_timer';
const HISTORY_KEY = 'studyos_timer_history';

const DEFAULT_MODES = {
  pomodoro: { label: 'Pomodoro', defaultMinutes: 25 },
  focus: { label: 'Deep Focus', defaultMinutes: 50 },
  short_break: { label: 'Short Break', defaultMinutes: 5 },
  long_break: { label: 'Long Break', defaultMinutes: 15 },
  stopwatch: { label: 'Stopwatch', defaultMinutes: 0 },
};

export function TimerProvider({ children }) {
  // Saved state initializer
  const getInitialState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const now = Date.now();

        if (parsed.isRunning && parsed.targetEndTime) {
          const remainingSecs = Math.round((parsed.targetEndTime - now) / 1000);
          if (remainingSecs <= 0) {
            // Timer expired while page was closed
            return {
              ...parsed,
              isRunning: false,
              isPaused: false,
              timeLeft: 0,
            };
          }
          return {
            ...parsed,
            timeLeft: remainingSecs,
          };
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved timer state:', e);
    }

    return {
      mode: 'pomodoro',
      durationMinutes: 25,
      activeTopic: 'General Focus',
      timeLeft: 25 * 60,
      isRunning: false,
      isPaused: false,
      startTime: null,
      targetEndTime: null,
      totalPausedDurationMs: 0,
      presenceEnabled: false,
      presenceStatus: 'inactive',
      presenceIntervalSecs: 5,
      isFloatingMinimized: false,
      isFloatingVisible: true,
    };
  };

  const [state, setState] = useState(getInitialState);
  const [history, setHistory] = useState(() => {
    try {
      const savedHist = localStorage.getItem(HISTORY_KEY);
      if (savedHist) return JSON.parse(savedHist);
    } catch {
      // ignore
    }
    return [
      { id: 1, topic: 'Python OOP & Architecture', mode: 'pomodoro', durationMinutes: 25, completedAt: new Date(Date.now() - 3600000).toISOString() },
      { id: 2, topic: 'FastAPI Router & Pydantic', mode: 'focus', durationMinutes: 50, completedAt: new Date(Date.now() - 7200000).toISOString() }
    ];
  });

  const [lastNotification, setLastNotification] = useState(null);
  const tickerRef = useRef(null);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage quota issues
    }
  }, [state]);

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  // Complete session handler
  const completeSession = useCallback(async (currentSession) => {
    const elapsedMinutes = currentSession.mode === 'stopwatch'
      ? Math.max(1, Math.round((currentSession.durationMinutes * 60 - currentSession.timeLeft) / 60))
      : currentSession.durationMinutes;

    const sessionRecord = {
      id: Date.now(),
      topic: currentSession.activeTopic || 'General Focus',
      mode: currentSession.mode,
      durationMinutes: elapsedMinutes,
      startTime: currentSession.startTime ? new Date(currentSession.startTime).toISOString() : new Date().toISOString(),
      endTime: new Date().toISOString(),
      pauseDurationMs: currentSession.totalPausedDurationMs || 0,
      presenceChecked: currentSession.presenceEnabled,
      completedAt: new Date().toISOString()
    };

    setHistory((prev) => [sessionRecord, ...prev]);

    // Backend synchronization
    try {
      await createSession({
        topic_id: null,
        duration_minutes: elapsedMinutes,
        mode: currentSession.mode
      });
    } catch {
      // Offline fallback: session is safely kept in local history
    }

    setLastNotification({
      type: 'complete',
      message: `Session complete: "${sessionRecord.topic}" (${sessionRecord.durationMinutes}m)`,
      timestamp: Date.now()
    });

    setState((prev) => {
      const modeConfig = DEFAULT_MODES[prev.mode] || DEFAULT_MODES.pomodoro;
      return {
        ...prev,
        isRunning: false,
        isPaused: false,
        timeLeft: modeConfig.defaultMinutes * 60,
        startTime: null,
        targetEndTime: null,
        totalPausedDurationMs: 0,
        presenceStatus: prev.presenceEnabled ? 'inactive' : prev.presenceStatus
      };
    });
  }, []);

  // Main countdown/stopwatch ticker using accurate timestamps
  useEffect(() => {
    if (state.isRunning && !state.isPaused) {
      tickerRef.current = setInterval(() => {
        const now = Date.now();

        if (state.mode === 'stopwatch') {
          // In stopwatch mode, calculate elapsed
          const elapsedSecs = Math.floor((now - (state.startTime || now) - (state.totalPausedDurationMs || 0)) / 1000);
          setState((prev) => ({ ...prev, timeLeft: elapsedSecs }));
        } else {
          // In countdown mode, compute remaining from targetEndTime
          if (!state.targetEndTime) return;
          const remainingSecs = Math.round((state.targetEndTime - now) / 1000);

          if (remainingSecs <= 0) {
            clearInterval(tickerRef.current);
            completeSession(state);
          } else {
            setState((prev) => ({ ...prev, timeLeft: remainingSecs }));
          }
        }
      }, 1000);
    } else {
      if (tickerRef.current) {
        clearInterval(tickerRef.current);
        tickerRef.current = null;
      }
    }

    return () => {
      if (tickerRef.current) {
        clearInterval(tickerRef.current);
      }
    };
  }, [state.isRunning, state.isPaused, state.targetEndTime, state.mode, state.startTime, state.totalPausedDurationMs, completeSession, state]);

  // Presence Detection lifecycle
  useEffect(() => {
    if (state.presenceEnabled && state.isRunning && !state.isPaused) {
      setState((prev) => ({ ...prev, presenceStatus: 'checking' }));
      
      startPresenceDetection((isPresent) => {
        if (isPresent) {
          setState((prev) => ({ ...prev, presenceStatus: 'present' }));
        } else {
          // No face detected -> Auto-pause timer
          setState((prev) => {
            if (!prev.isRunning || prev.isPaused) return prev;
            return {
              ...prev,
              isPaused: true,
              presenceStatus: 'absent',
              lastPauseTimestamp: Date.now()
            };
          });

          setLastNotification({
            type: 'absence',
            message: 'Camera: No face detected. Timer paused to protect study accuracy.',
            timestamp: Date.now()
          });
        }
      }, (state.presenceIntervalSecs || 5) * 1000);
    } else {
      stopPresenceDetection();
      if (!state.presenceEnabled) {
        setState((prev) => ({ ...prev, presenceStatus: 'inactive' }));
      }
    }

    return () => {
      stopPresenceDetection();
    };
  }, [state.presenceEnabled, state.isRunning, state.isPaused, state.presenceIntervalSecs]);

  // Actions
  const startTimer = useCallback((options = {}) => {
    const mode = options.mode || state.mode || 'pomodoro';
    const topic = options.topic || state.activeTopic || 'Deep Focus';
    const modeConfig = DEFAULT_MODES[mode] || DEFAULT_MODES.pomodoro;
    const minutes = options.durationMinutes !== undefined ? options.durationMinutes : (state.durationMinutes || modeConfig.defaultMinutes);
    const now = Date.now();
    const targetEnd = mode === 'stopwatch' ? null : now + minutes * 60 * 1000;

    setState((prev) => ({
      ...prev,
      mode,
      activeTopic: topic,
      durationMinutes: minutes,
      timeLeft: mode === 'stopwatch' ? 0 : minutes * 60,
      isRunning: true,
      isPaused: false,
      startTime: now,
      targetEndTime: targetEnd,
      totalPausedDurationMs: 0,
      lastPauseTimestamp: null,
      isFloatingVisible: true,
    }));
  }, [state.mode, state.activeTopic, state.durationMinutes]);

  const pauseTimer = useCallback(() => {
    setState((prev) => {
      if (!prev.isRunning || prev.isPaused) return prev;
      return {
        ...prev,
        isPaused: true,
        lastPauseTimestamp: Date.now()
      };
    });
  }, []);

  const resumeTimer = useCallback(() => {
    setState((prev) => {
      if (!prev.isRunning || !prev.isPaused) return prev;
      const now = Date.now();
      const pauseDuration = prev.lastPauseTimestamp ? (now - prev.lastPauseTimestamp) : 0;
      const newTotalPaused = (prev.totalPausedDurationMs || 0) + pauseDuration;
      const newTargetEnd = prev.targetEndTime ? prev.targetEndTime + pauseDuration : null;

      return {
        ...prev,
        isPaused: false,
        lastPauseTimestamp: null,
        totalPausedDurationMs: newTotalPaused,
        targetEndTime: newTargetEnd,
        presenceStatus: prev.presenceEnabled ? 'checking' : prev.presenceStatus
      };
    });
  }, []);

  const stopTimer = useCallback(() => {
    if (state.isRunning || state.isPaused) {
      const plannedSecs = (state.durationMinutes || 25) * 60;
      const elapsedSecs = state.mode === 'stopwatch'
        ? (state.timeLeft || 0)
        : Math.max(0, plannedSecs - (state.timeLeft || 0));
      const elapsedMinutes = Math.floor(elapsedSecs / 60);

      if (elapsedMinutes >= 1) {
        const sessionRecord = {
          id: Date.now(),
          topic: state.activeTopic || 'General Focus',
          mode: state.mode,
          durationMinutes: elapsedMinutes,
          startTime: state.startTime ? new Date(state.startTime).toISOString() : new Date().toISOString(),
          endTime: new Date().toISOString(),
          pauseDurationMs: state.totalPausedDurationMs || 0,
          presenceChecked: state.presenceEnabled,
          completedAt: new Date().toISOString()
        };

        setHistory((prev) => [sessionRecord, ...prev]);

        createSession({
          topic_id: null,
          duration_minutes: elapsedMinutes,
          mode: state.mode
        }).catch(() => {});

        setLastNotification({
          type: 'complete',
          message: `Session saved: "${sessionRecord.topic}" (${elapsedMinutes}m focused)`,
          timestamp: Date.now()
        });
      } else {
        setLastNotification({
          type: 'info',
          message: 'Timer stopped (sessions under 1 minute are not saved).',
          timestamp: Date.now()
        });
      }
    }

    const modeConfig = DEFAULT_MODES[state.mode] || DEFAULT_MODES.pomodoro;
    setState((prev) => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      timeLeft: modeConfig.defaultMinutes * 60,
      startTime: null,
      targetEndTime: null,
      totalPausedDurationMs: 0,
      lastPauseTimestamp: null,
      presenceStatus: prev.presenceEnabled ? 'inactive' : prev.presenceStatus
    }));
  }, [state]);

  const setPresenceInterval = useCallback((secs) => {
    setState((prev) => ({ ...prev, presenceIntervalSecs: Number(secs) }));
  }, []);

  const resetTimer = useCallback(() => {
    const modeConfig = DEFAULT_MODES[state.mode] || DEFAULT_MODES.pomodoro;
    setState((prev) => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      timeLeft: prev.durationMinutes ? prev.durationMinutes * 60 : modeConfig.defaultMinutes * 60,
      startTime: null,
      targetEndTime: null,
      totalPausedDurationMs: 0,
      lastPauseTimestamp: null
    }));
  }, [state.mode]);

  const addMinutes = useCallback((extraMinutes) => {
    setState((prev) => {
      const addedMs = extraMinutes * 60 * 1000;
      return {
        ...prev,
        durationMinutes: (prev.durationMinutes || 25) + extraMinutes,
        timeLeft: prev.timeLeft + extraMinutes * 60,
        targetEndTime: prev.targetEndTime ? prev.targetEndTime + addedMs : null
      };
    });
  }, []);

  const setTimerMode = useCallback((newMode, customMinutes = null) => {
    const modeConfig = DEFAULT_MODES[newMode] || DEFAULT_MODES.pomodoro;
    const mins = customMinutes !== null ? customMinutes : modeConfig.defaultMinutes;

    setState((prev) => ({
      ...prev,
      mode: newMode,
      durationMinutes: mins,
      timeLeft: newMode === 'stopwatch' ? 0 : mins * 60,
      isRunning: false,
      isPaused: false,
      startTime: null,
      targetEndTime: null,
      totalPausedDurationMs: 0
    }));
  }, []);

  const setTopic = useCallback((topicTitle) => {
    setState((prev) => ({ ...prev, activeTopic: topicTitle }));
  }, []);

  const togglePresence = useCallback((enabled) => {
    setState((prev) => ({
      ...prev,
      presenceEnabled: enabled !== undefined ? enabled : !prev.presenceEnabled,
      presenceStatus: !prev.presenceEnabled ? 'checking' : 'inactive'
    }));
  }, []);

  const toggleFloatingMinimized = useCallback(() => {
    setState((prev) => ({ ...prev, isFloatingMinimized: !prev.isFloatingMinimized }));
  }, []);

  const hideFloatingTimer = useCallback(() => {
    setState((prev) => ({ ...prev, isFloatingVisible: false }));
  }, []);

  const showFloatingTimer = useCallback(() => {
    setState((prev) => ({ ...prev, isFloatingVisible: true }));
  }, []);

  const value = {
    ...state,
    history,
    lastNotification,
    clearNotification: () => setLastNotification(null),
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    addMinutes,
    setTimerMode,
    setTopic,
    togglePresence,
    setPresenceInterval,
    toggleFloatingMinimized,
    hideFloatingTimer,
    showFloatingTimer,
    modes: DEFAULT_MODES
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}
