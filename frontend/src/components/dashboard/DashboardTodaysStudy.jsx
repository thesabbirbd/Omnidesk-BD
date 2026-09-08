import React, { useState, useEffect } from 'react';
import { Calendar, Play, Check, Clock, Flame, CheckCircle2, Sparkles, Target, RotateCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getWhatToStudyNow, getWeeklyRetro } from '../../services/api';
import { useTimer } from '../../context/TimerContext';

export default function DashboardTodaysStudy({ 
  initialGoals = [
    { id: 1, text: 'FastAPI dependency injection', completed: true },
    { id: 2, text: 'SQLAlchemy 2.0 async sessions', completed: true },
    { id: 3, text: 'Docker multi-stage build test', completed: false },
    { id: 4, text: 'Review Linux networking sockets', completed: false },
  ] 
}) {
  const navigate = useNavigate();
  const { startTimer } = useTimer();
  const [goals, setGoals] = useState(initialGoals);
  const [recommendations, setRecommendations] = useState([]);
  const [weeklyRetro, setWeeklyRetro] = useState(null);

  useEffect(() => {
    getWhatToStudyNow()
      .then((data) => {
        if (data?.recommendations?.length > 0) {
          setRecommendations(data.recommendations);
        }
      })
      .catch(() => {});

    getWeeklyRetro()
      .then((data) => setWeeklyRetro(data))
      .catch(() => {});
  }, []);

  const toggleGoal = (id) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
    );
  };

  const completedCount = goals.filter((g) => g.completed).length;
  const goalProgressPct = Math.round((completedCount / goals.length) * 100) || 50;

  const todayStr = new Date().toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const topRec = recommendations[0];

  const handleStartRecSession = (rec) => {
    startTimer({
      topic: rec.topic_title,
      mode: 'pomodoro',
      durationMinutes: rec.estimated_minutes || 25
    });
  };

  return (
    <div className="p-6 rounded-3xl bg-[var(--bg-card)] shadow-[6px_6px_14px_var(--shadow-dark),-6px_-6px_14px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col gap-5 transition-all">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
        <div className="flex items-center gap-2.5">
          <Calendar size={18} className="text-cyan-400" />
          <h3 className="text-sm font-black tracking-wide text-[color:var(--text-main)]">
            Command Center: Today's Focus
          </h3>
        </div>
        <span className="text-[11px] font-bold text-[color:var(--text-muted)]">
          {todayStr}
        </span>
      </div>

      {/* Top Directive: WHAT SHOULD I STUDY NOW? */}
      {topRec && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/30 to-blue-950/20 border border-cyan-500/30 flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Sparkles size={12} />
              <span>What Should I Study Now?</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-cyan-400/10 text-cyan-300 border border-cyan-400/30">
              {topRec.badge}
            </span>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[color:var(--text-main)] truncate">
              {topRec.topic_title}
            </h4>
            <p className="text-[11px] text-[color:var(--text-muted)] font-medium leading-relaxed mt-0.5">
              {topRec.reason}
            </p>
          </div>

          <div className="flex items-center justify-between mt-1 pt-2 border-t border-cyan-500/20">
            <span className="text-[10px] font-bold text-slate-400">
              Est: {topRec.estimated_minutes} mins
            </span>
            <button
              onClick={() => handleStartRecSession(topRec)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(34,211,238,0.5)] transition-all cursor-pointer active:scale-95"
            >
              <Play size={11} fill="currentColor" />
              <span>{topRec.action_label || "Start Focus Sprint"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Focus Dial + Goals Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        
        {/* Left: Circular Focus Dial */}
        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] relative">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-700/30"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-400 transition-all duration-1000"
                strokeDasharray={`${goalProgressPct}, 100`}
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center pointer-events-none select-none">
              <span className="text-xs font-black tracking-tight text-[color:var(--text-main)]">
                {weeklyRetro ? `${weeklyRetro.actual_hours}h` : '03:00'}
              </span>
              <span className="text-[8px] font-bold text-[color:var(--text-muted)]">Weekly Logged</span>
            </div>
          </div>

          <button 
            onClick={() => navigate('/os/timer')}
            className="mt-3 w-8 h-8 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-[0_0_10px_rgba(34,211,238,0.6)] hover:scale-110 active:scale-95 transition-transform cursor-pointer"
            title="Open Focus Timer"
          >
            <Play size={14} className="ml-0.5" />
          </button>
        </div>

        {/* Right: Goals Checklist */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-[11px] font-bold text-[color:var(--text-muted)]">
            <span className="uppercase tracking-wider">Today's Goals</span>
            <span className="text-cyan-400 font-bold">{completedCount}/{goals.length}</span>
          </div>

          <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
            {goals.map((g) => (
              <div
                key={g.id}
                onClick={() => toggleGoal(g.id)}
                className="flex items-center gap-2.5 text-xs font-medium cursor-pointer select-none group p-1.5 rounded-lg hover:bg-[var(--bg-input)]/50 transition-colors"
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                  g.completed 
                    ? 'bg-cyan-500 border-cyan-500 text-slate-950 shadow-[0_0_6px_rgba(34,211,238,0.5)]' 
                    : 'border-[var(--border-color)] bg-[var(--bg-input)] group-hover:border-cyan-400'
                }`}>
                  {g.completed && <Check size={11} strokeWidth={3} />}
                </div>
                <span className={`text-[11px] transition-all truncate leading-tight ${
                  g.completed ? 'line-through text-[color:var(--text-muted)]' : 'text-[color:var(--text-main)] font-semibold'
                }`}>
                  {g.text}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom 3 Pills Stats from Weekly Retro */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--border-color)]">
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)]">
          <Clock size={14} className="text-cyan-400 mb-1" />
          <span className="text-[9px] text-[color:var(--text-muted)] font-semibold">Weekly Study</span>
          <span className="text-xs font-black text-[color:var(--text-main)]">
            {weeklyRetro ? `${weeklyRetro.actual_hours}h / ${weeklyRetro.planned_hours}h` : '2h 15m'}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)]">
          <Flame size={14} className="text-amber-400 mb-1" />
          <span className="text-[9px] text-[color:var(--text-muted)] font-semibold">Focus Presence</span>
          <span className="text-xs font-black text-amber-400">
            {weeklyRetro ? `${weeklyRetro.focus_accuracy_pct}% 👁️` : '100% 👁️'}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)]">
          <CheckCircle2 size={14} className="text-emerald-400 mb-1" />
          <span className="text-[9px] text-[color:var(--text-muted)] font-semibold">Done This Wk</span>
          <span className="text-xs font-black text-[color:var(--text-main)]">
            {weeklyRetro ? `${weeklyRetro.topics_completed} topics` : '12 topics'}
          </span>
        </div>
      </div>

    </div>
  );
}
