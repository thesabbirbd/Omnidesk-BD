import React from 'react';
import { Activity, BarChart2, Flame, Target, TrendingUp, Clock, Zap } from 'lucide-react';

const heatmapData = [
  // 4 weeks, 7 days
  { day: 'Mon', active: true, intensity: 'high' },
  { day: 'Tue', active: true, intensity: 'medium' },
  { day: 'Wed', active: false, intensity: 'none' },
  { day: 'Thu', active: true, intensity: 'low' },
  { day: 'Fri', active: true, intensity: 'high' },
  { day: 'Sat', active: false, intensity: 'none' },
  { day: 'Sun', active: true, intensity: 'medium' },
];

const topicVelocity = [
  { topic: 'FastAPI Backend', days: 4, trend: '+12%' },
  { topic: 'PostgreSQL', days: 2, trend: '+5%' },
  { topic: 'React Architecture', days: 6, trend: '-2%' },
  { topic: 'System Design', days: 1, trend: '+15%' },
];

export default function Analytics() {
  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-canvas)] text-[color:var(--text-main)] overflow-y-auto p-6 md:p-10 gap-8">
      
      {/* Header */}
      <div className="flex flex-col gap-2 text-center w-full max-w-4xl mx-auto mb-4">
        <h1 className="text-3xl md:text-4xl font-black tracking-wide flex items-center justify-center gap-3">
          <BarChart2 className="text-pink-400" size={36} />
          Analytics & Insights
        </h1>
        <p className="text-[color:var(--text-muted)] font-medium">Measure your focus, track consistency, and optimize study velocity.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-6xl mx-auto w-full">
        
        {/* Study Heatmap */}
        <div className="xl:col-span-2 p-8 md:p-10 rounded-[32px] overflow-hidden bg-[var(--bg-card)] shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[color:var(--text-main)] flex items-center gap-3">
              <Flame className="text-orange-400" size={28} />
              Study Heatmap
            </h2>
            <div className="px-4 py-2 rounded-xl bg-[var(--bg-input)] shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] text-orange-400 text-sm font-bold flex items-center gap-2">
              <Activity size={16} /> 5 Day Streak
            </div>
          </div>

          <div className="grid grid-cols-7 gap-4 w-full mt-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
              <div key={day} className="flex flex-col items-center gap-4">
                <span className="text-xs font-bold text-[color:var(--text-muted)] uppercase tracking-wider">{day}</span>
                <div className={`w-full aspect-square rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  heatmapData[i].active
                    ? heatmapData[i].intensity === 'high'
                      ? 'bg-gradient-to-br from-cyan-400 to-blue-500 shadow-[0_0_15px_rgba(34,211,238,0.5),inset_2px_2px_4px_rgba(255,255,255,0.2)]'
                      : heatmapData[i].intensity === 'medium'
                        ? 'bg-gradient-to-br from-cyan-500/70 to-blue-500/70 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                        : 'bg-cyan-500/40 shadow-[0_0_5px_rgba(34,211,238,0.2)]'
                    : 'bg-[var(--bg-input)] shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)]'
                }`}>
                  {heatmapData[i].active && (
                    <Zap size={20} className="text-white drop-shadow-md opacity-80" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats Column */}
        <div className="flex flex-col gap-8">
          
          <div className="p-8 md:p-10 rounded-[32px] overflow-hidden bg-[var(--bg-card)] shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col items-center text-center gap-3 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl"></div>
            <Target className="text-pink-400 mb-2" size={32} />
            <h3 className="text-lg font-bold text-[color:var(--text-main)]">Focus Score</h3>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-pink-400 to-purple-600 drop-shadow-md">
              92
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Top 5% this week</span>
          </div>

          <div className="p-8 md:p-10 rounded-[32px] overflow-hidden bg-[var(--bg-card)] shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col items-center text-center gap-3">
            <Clock className="text-emerald-400 mb-2" size={32} />
            <h3 className="text-lg font-bold text-[color:var(--text-main)]">Total Hours</h3>
            <div className="text-4xl font-black text-[color:var(--text-main)]">
              24<span className="text-xl text-[color:var(--text-muted)]">h</span> 15<span className="text-xl text-[color:var(--text-muted)]">m</span>
            </div>
          </div>

        </div>

        {/* Topic Velocity */}
        <div className="xl:col-span-2 p-8 md:p-10 rounded-[32px] overflow-hidden bg-[var(--bg-card)] shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col gap-8">
          <h2 className="text-2xl font-bold text-[color:var(--text-main)] flex items-center gap-3">
            <TrendingUp className="text-cyan-400" size={28} />
            Topic Velocity
          </h2>
          
          <div className="flex flex-col gap-5">
            {topicVelocity.map((item, idx) => (
              <div key={idx} className="flex items-center gap-6 p-4 rounded-2xl bg-[var(--bg-card)] shadow-[inset_2px_2px_6px_var(--shadow-dark),inset_-2px_-2px_6px_var(--shadow-light)] border border-[var(--border-color)]">
                <div className="w-12 h-12 rounded-xl bg-[var(--bg-card)] shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] flex items-center justify-center font-black text-lg text-[color:var(--text-muted)]">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-[color:var(--text-main)]">{item.topic}</h4>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm font-semibold text-[color:var(--text-muted)]">{item.days} days spent</span>
                    <div className="flex-1 h-2 bg-[#090d18] rounded-full shadow-[inset_1px_1px_3px_rgba(0,0,0,0.5)]">
                      <div 
                        className="h-full rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                        style={{ width: `${Math.max(10, 100 - (item.days * 10))}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${item.trend.startsWith('+') ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
                  {item.trend}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Planned vs Actual */}
        <div className="p-8 md:p-10 rounded-[32px] overflow-hidden bg-[var(--bg-card)] shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col gap-6">
          <h2 className="text-xl font-bold text-[color:var(--text-main)] flex items-center gap-3">
            <Clock className="text-purple-400" size={24} />
            Planned vs Actual
          </h2>
          
          <div className="flex flex-col gap-8 mt-4">
            
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-end">
                <span className="font-bold text-slate-500 uppercase tracking-widest text-xs">Planned Study</span>
                <span className="font-black text-lg text-[color:var(--text-main)]">30h</span>
              </div>
              <div className="w-full h-4 bg-[var(--bg-input)] rounded-full shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)] p-1 overflow-hidden relative">
                 <div className="absolute top-1 left-1 bottom-1 rounded-full bg-[var(--bg-card)] shadow-[2px_2px_4px_var(--shadow-dark),-2px_-2px_4px_var(--shadow-light)] w-[80%]"></div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-end">
                <span className="font-bold text-slate-500 uppercase tracking-widest text-xs">Actual Study</span>
                <span className="font-black text-lg text-purple-400">24h 15m</span>
              </div>
              <div className="w-full h-4 bg-[var(--bg-input)] rounded-full shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)] p-1 overflow-hidden relative">
                 <div className="absolute top-1 left-1 bottom-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_10px_rgba(168,85,247,0.6)] w-[60%]"></div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
