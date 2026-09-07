import React from 'react';
import { Calendar, ChevronRight, Check, Clock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardStudyPlanWidget({
  planWeeks = [
    { week: 'Week 1', title: 'Python Foundation & AI-Detox', progress: 100, status: 'completed', days: '7/7 days' },
    { week: 'Week 2', title: 'Core Python & Data Structures', progress: 65, status: 'in_progress', days: '4/7 days' },
    { week: 'Week 3', title: 'Web Fundamentals & FastAPI', progress: 0, status: 'upcoming', days: '0/7 days' },
    { week: 'Week 4', title: 'Database & PostgreSQL', progress: 0, status: 'upcoming', days: '0/7 days' },
    { week: 'Week 5', title: 'Authentication & Security', progress: 0, status: 'upcoming', days: '0/7 days' },
    { week: 'Week 6', title: 'Frontend Basics & React', progress: 0, status: 'upcoming', days: '0/7 days' },
    { week: 'Week 7', title: 'Linux & Networking Basics', progress: 0, status: 'upcoming', days: '0/7 days' },
    { week: 'Week 8', title: 'Docker & Containerization', progress: 0, status: 'upcoming', days: '0/7 days' },
    { week: 'Week 9', title: 'CI/CD & AWS Deployment', progress: 0, status: 'upcoming', days: '0/7 days' },
    { week: 'Week 10', title: 'Terraform & Infrastructure', progress: 0, status: 'upcoming', days: '0/7 days' },
    { week: 'Week 11', title: 'Production Eng & Capstone', progress: 0, status: 'upcoming', days: '0/7 days' },
  ]
}) {
  const navigate = useNavigate();

  return (
    <div className="p-6 rounded-3xl bg-[var(--bg-card)] shadow-[6px_6px_14px_var(--shadow-dark),-6px_-6px_14px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col justify-between gap-4 h-full min-h-[480px] transition-all">
      
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-emerald-400" />
            <h3 className="text-xs font-black tracking-wide text-[color:var(--text-main)] uppercase">
              Current Study Plan
            </h3>
          </div>
          <button 
            onClick={() => navigate('/os/study-plan')}
            className="text-[11px] font-bold text-cyan-400 hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {/* Weeks list with Micro Progress Bars and Tiny Status Indicators */}
        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
          {planWeeks.map((item, idx) => {
            const isDone = item.status === 'completed';
            const isCurrent = item.status === 'in_progress';

            return (
              <div 
                key={idx}
                onClick={() => navigate('/os/study-plan')}
                className={`flex flex-col gap-1.5 p-2.5 rounded-xl border transition-all cursor-pointer group ${
                  isCurrent 
                    ? 'bg-[var(--bg-input)] border-amber-500/40 shadow-[inset_1px_1px_3px_var(--shadow-dark)] ring-1 ring-amber-400/30' 
                    : isDone
                    ? 'bg-[var(--bg-input)]/60 border-emerald-500/30 hover:border-emerald-500/50'
                    : 'bg-[var(--bg-input)]/40 border-[var(--border-color)] hover:border-cyan-500/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <span className={`text-[10px] font-black shrink-0 ${
                      isDone ? 'text-emerald-400' : isCurrent ? 'text-amber-400' : 'text-cyan-400'
                    }`}>
                      {item.week}
                    </span>
                    <span className="text-xs font-semibold text-[color:var(--text-main)] truncate group-hover:text-cyan-400 transition-colors">
                      {item.title}
                    </span>
                  </div>

                  {/* Tiny Status Indicator */}
                  <div className="flex items-center gap-1.5 shrink-0 pl-1">
                    <span className={`text-[10px] font-bold ${
                      isDone ? 'text-emerald-400' : isCurrent ? 'text-amber-400' : 'text-[color:var(--text-muted)]'
                    }`}>
                      {item.progress}%
                    </span>
                    {isDone && <Check size={12} className="text-emerald-400" strokeWidth={2.5} />}
                    {isCurrent && <Clock size={12} className="text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />}
                  </div>
                </div>

                {/* Micro Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-700/30 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${
                      isDone 
                        ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' 
                        : isCurrent 
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_6px_rgba(251,191,36,0.8)]' 
                        : 'bg-slate-600/40'
                    }`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Footer pacing */}
      <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[color:var(--text-muted)]">
        <span className="font-semibold">Pacing: 1 Week / Topic</span>
        <span className="font-bold text-amber-400 flex items-center gap-1">
          <Sparkles size={13} />
          Week 2 Active
        </span>
      </div>

    </div>
  );
}
