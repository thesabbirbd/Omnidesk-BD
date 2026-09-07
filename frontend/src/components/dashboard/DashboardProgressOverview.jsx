import React, { useState } from 'react';
import { Activity, ChevronRight, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardProgressOverview({ 
  topicsCount = { completed: 14, learning: 6, notStarted: 26, blocked: 2 } 
}) {
  const navigate = useNavigate();
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);

  const total = topicsCount.completed + topicsCount.learning + topicsCount.notStarted + topicsCount.blocked || 48;
  const compPct = Math.round((topicsCount.completed / total) * 100);
  const learnPct = Math.round((topicsCount.learning / total) * 100);
  const notStartPct = Math.round((topicsCount.notStarted / total) * 100);
  const blockPct = 100 - compPct - learnPct - notStartPct;

  const segments = [
    { key: 'completed', label: 'Completed', count: topicsCount.completed, pct: compPct, color: '#22c55e', textClass: 'text-emerald-400', bgClass: 'bg-emerald-500' },
    { key: 'learning', label: 'Learning', count: topicsCount.learning, pct: learnPct, color: '#eab308', textClass: 'text-amber-400', bgClass: 'bg-amber-400' },
    { key: 'notStarted', label: 'Not Started', count: topicsCount.notStarted, pct: notStartPct, color: '#64748b', textClass: 'text-slate-400', bgClass: 'bg-slate-500' },
    { key: 'blocked', label: 'Blocked', count: topicsCount.blocked, pct: blockPct, color: '#ef4444', textClass: 'text-red-400', bgClass: 'bg-red-500' },
  ];

  // Circumference for r=15.9155 is exactly 100
  let cumulativeOffset = 0;
  const donutSegments = segments.map((seg) => {
    const strokeDasharray = `${seg.pct} ${100 - seg.pct}`;
    const strokeDashoffset = -cumulativeOffset;
    cumulativeOffset += seg.pct;
    return { ...seg, strokeDasharray, strokeDashoffset };
  });

  // Mock GitHub-Style Heatmap data for past 4 weeks (Mon-Sun)
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const heatmapWeeks = [
    [
      { day: 'Mon', date: 'Aug 17', hours: 3.5, level: 3 },
      { day: 'Tue', date: 'Aug 18', hours: 2.0, level: 2 },
      { day: 'Wed', date: 'Aug 19', hours: 4.5, level: 4 },
      { day: 'Thu', date: 'Aug 20', hours: 3.0, level: 3 },
      { day: 'Fri', date: 'Aug 21', hours: 5.0, level: 4 },
      { day: 'Sat', date: 'Aug 22', hours: 1.5, level: 1 },
      { day: 'Sun', date: 'Aug 23', hours: 0, level: 0 },
    ],
    [
      { day: 'Mon', date: 'Aug 24', hours: 4.0, level: 4 },
      { day: 'Tue', date: 'Aug 25', hours: 4.2, level: 4 },
      { day: 'Wed', date: 'Aug 26', hours: 3.8, level: 3 },
      { day: 'Thu', date: 'Aug 27', hours: 2.5, level: 2 },
      { day: 'Fri', date: 'Aug 28', hours: 4.5, level: 4 },
      { day: 'Sat', date: 'Aug 29', hours: 3.0, level: 3 },
      { day: 'Sun', date: 'Aug 30', hours: 1.0, level: 1 },
    ],
    [
      { day: 'Mon', date: 'Aug 31', hours: 3.0, level: 3 },
      { day: 'Tue', date: 'Sep 01', hours: 4.8, level: 4 },
      { day: 'Wed', date: 'Sep 02', hours: 2.2, level: 2 },
      { day: 'Thu', date: 'Sep 03', hours: 3.5, level: 3 },
      { day: 'Fri', date: 'Sep 04', hours: 4.0, level: 4 },
      { day: 'Sat', date: 'Sep 05', hours: 2.0, level: 2 },
      { day: 'Sun', date: 'Sep 06', hours: 0, level: 0 },
    ],
    [
      { day: 'Mon', date: 'Sep 07 (Today)', hours: 2.5, level: 3 },
      { day: 'Tue', date: 'Sep 08', hours: 0, level: 0, future: true },
      { day: 'Wed', date: 'Sep 09', hours: 0, level: 0, future: true },
      { day: 'Thu', date: 'Sep 10', hours: 0, level: 0, future: true },
      { day: 'Fri', date: 'Sep 11', hours: 0, level: 0, future: true },
      { day: 'Sat', date: 'Sep 12', hours: 0, level: 0, future: true },
      { day: 'Sun', date: 'Sep 13', hours: 0, level: 0, future: true },
    ]
  ];

  return (
    <div className="p-6 rounded-3xl bg-[var(--bg-card)] shadow-[6px_6px_14px_var(--shadow-dark),-6px_-6px_14px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col gap-5 transition-all">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
        <div className="flex items-center gap-2.5">
          <Activity size={18} className="text-indigo-400" />
          <h3 className="text-sm font-black tracking-wide text-[color:var(--text-main)]">
            Progress Overview
          </h3>
        </div>
        <button 
          onClick={() => navigate('/os/analytics')}
          className="text-[color:var(--text-muted)] hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
          title="View Full Analytics"
        >
          <span>Analytics</span>
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Donut Chart & Breakdown with Hover Tooltip */}
      <div className="flex items-center justify-between gap-4 relative">
        
        {/* SVG Donut */}
        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="rgba(51, 65, 85, 0.3)" strokeWidth="3.8" />
            {donutSegments.map((seg) => (
              <circle
                key={seg.key}
                cx="18"
                cy="18"
                r="15.9155"
                fill="transparent"
                stroke={seg.color}
                strokeWidth={hoveredSegment?.key === seg.key ? "5.2" : "3.8"}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredSegment(seg)}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            ))}
          </svg>

          {/* Center text of Donut */}
          <div className="absolute flex flex-col items-center pointer-events-none">
            <span className="text-xl font-black text-[color:var(--text-main)] leading-none tracking-tight">
              {hoveredSegment ? `${hoveredSegment.pct}%` : `${compPct}%`}
            </span>
            <span className="text-[9px] font-bold text-[color:var(--text-muted)] mt-0.5">
              {hoveredSegment ? hoveredSegment.label : 'Completed'}
            </span>
          </div>
        </div>

        {/* Breakdown Legend */}
        <div className="flex flex-col gap-2 flex-1 pl-2">
          {segments.map((item) => (
            <div 
              key={item.key}
              onMouseEnter={() => setHoveredSegment(item)}
              onMouseLeave={() => setHoveredSegment(null)}
              className={`flex items-center justify-between text-xs px-2 py-1 rounded-lg transition-all cursor-pointer ${
                hoveredSegment?.key === item.key 
                  ? 'bg-[var(--bg-input)] shadow-[inset_1px_1px_3px_var(--shadow-dark)] scale-105' 
                  : 'hover:bg-[var(--bg-input)]/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${item.bgClass} shadow-[0_0_6px_currentColor]`} style={{ color: item.color }} />
                <span className="font-semibold text-[color:var(--text-muted)]">{item.label}</span>
              </div>
              <span className={`font-black ${item.textClass}`}>
                {item.count} <span className="text-[10px] opacity-70">({item.pct}%)</span>
              </span>
            </div>
          ))}
        </div>

        {/* Hover Tooltip Overlay for Donut */}
        {hoveredSegment && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--bg-input)] text-xs font-black rounded-xl border border-[var(--border-color)] shadow-lg pointer-events-none animate-in fade-in zoom-in-95 duration-150 z-30" style={{ color: hoveredSegment.color }}>
            {hoveredSegment.label}: {hoveredSegment.count} topics ({hoveredSegment.pct}%)
          </div>
        )}
      </div>

      {/* GitHub-Style Study Heatmap Grid */}
      <div className="flex flex-col gap-2 pt-3 border-t border-[var(--border-color)] relative">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="text-[color:var(--text-muted)] uppercase tracking-wider text-[10px]">
            Study Heatmap (Last 4 Weeks)
          </span>
          <span className="text-cyan-400">18 Active Days</span>
        </div>

        {/* Day-of-week header */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-[9px] font-bold text-[color:var(--text-muted)]">
          {daysOfWeek.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>

        {/* 4 Weeks of glowing cells */}
        <div className="flex flex-col gap-1.5">
          {heatmapWeeks.map((week, wIdx) => (
            <div key={wIdx} className="grid grid-cols-7 gap-1.5">
              {week.map((day, dIdx) => {
                const isHovered = hoveredCell?.date === day.date;
                return (
                  <div
                    key={dIdx}
                    onMouseEnter={() => setHoveredCell(day)}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={`h-5 rounded-md transition-all duration-150 cursor-pointer ${
                      day.level === 4 ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)] hover:scale-110' :
                      day.level === 3 ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)] hover:scale-110' :
                      day.level === 2 ? 'bg-emerald-500/60 hover:scale-110' :
                      day.level === 1 ? 'bg-emerald-500/30 hover:scale-110' :
                      day.future ? 'bg-[var(--bg-input)]/40 border border-dashed border-[var(--border-color)]' :
                      'bg-[var(--bg-input)] hover:border hover:border-slate-500'
                    } ${isHovered ? 'ring-2 ring-cyan-400 scale-110 z-20' : ''}`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Interactive Heatmap Tooltip */}
        {hoveredCell && (
          <div className="absolute -bottom-2 right-0 px-3 py-1.5 bg-[var(--bg-input)]/95 backdrop-blur-md rounded-xl border border-cyan-500/40 shadow-xl text-[11px] font-bold text-[color:var(--text-main)] pointer-events-none z-30 animate-in fade-in duration-100 flex items-center gap-2">
            <span className="text-cyan-400">{hoveredCell.date}:</span>
            <span>{hoveredCell.hours > 0 ? `${hoveredCell.hours} hrs focused` : 'Rest day'}</span>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-between pt-2 text-[10px] text-[color:var(--text-muted)] font-medium">
          <span>Less</span>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-[var(--bg-input)]" />
            <span className="w-3 h-3 rounded-sm bg-emerald-500/30" />
            <span className="w-3 h-3 rounded-sm bg-emerald-500/60" />
            <span className="w-3 h-3 rounded-sm bg-emerald-400" />
            <span className="w-3 h-3 rounded-sm bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
          </div>
          <span>More</span>
        </div>

      </div>

    </div>
  );
}
