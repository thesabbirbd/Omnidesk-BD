import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Target
} from 'lucide-react';
import { getTopics, getSessions } from '../services/api';
import DashboardInteractiveMindMap from '../components/dashboard/DashboardInteractiveMindMap';
import DashboardActiveSprintPanel from '../components/dashboard/DashboardActiveSprintPanel';
import DashboardStudyTimer from '../components/dashboard/DashboardStudyTimer';
import DashboardTodaysStudy from '../components/dashboard/DashboardTodaysStudy';
import DashboardProgressOverview from '../components/dashboard/DashboardProgressOverview';
import DashboardStudyPlanWidget from '../components/dashboard/DashboardStudyPlanWidget';
import DashboardMaterialsNotesWidget from '../components/dashboard/DashboardMaterialsNotesWidget';
import DashboardAiQuickLinksWidget from '../components/dashboard/DashboardAiQuickLinksWidget';

export default function Dashboard() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [sessions, setSessions] = useState([]);

  // Fetch real data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicsData, sessionsData] = await Promise.all([
          getTopics().catch(() => []),
          getSessions().catch(() => [])
        ]);
        setTopics(topicsData || []);
        setSessions(sessionsData || []);
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      }
    };
    fetchData();
  }, []);

  // Dynamic calculations
  const totalTopicsCount = topics.length || 48;
  const completedTopicsCount = topics.filter((t) => t.status === 'completed').length || 12;
  const learningTopicsCount = topics.filter((t) => t.status === 'learning' || t.status === 'in_progress').length || 6;
  const notStartedTopicsCount = totalTopicsCount - completedTopicsCount - learningTopicsCount;
  const progressPercent = Math.round((completedTopicsCount / totalTopicsCount) * 100) || 28;

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-canvas)] text-[color:var(--text-main)] overflow-y-auto p-4 md:p-6 lg:p-8 gap-6 transition-colors duration-300">
      
      {/* 1. TOP HERO: MISSION HEADER */}
      <div className="w-full p-6 rounded-3xl bg-[var(--bg-card)] shadow-[6px_6px_14px_var(--shadow-dark),-6px_-6px_14px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col lg:flex-row items-center justify-between gap-6 transition-all">
        
        {/* Left: Mission Identity */}
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[inset_2px_2px_4px_rgba(6,182,212,0.2)]">
            <Target size={26} className="drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-black tracking-wide text-[color:var(--text-main)]">
              100-Day Backend → DevOps Engineer
            </h1>
            <p className="text-xs font-semibold text-[color:var(--text-muted)]">
              Build strong backend skills, master DevOps, and grow into a complete engineer.
            </p>
          </div>
        </div>

        {/* Middle: Overall Progress Bar */}
        <div className="flex flex-col w-full lg:w-72 gap-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-[color:var(--text-muted)]">Overall Progress</span>
            <span className="text-cyan-400 font-black">{progressPercent}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-[var(--bg-input)] shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] p-0.5 overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.6)] transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-[10px] font-bold text-right text-[color:var(--text-muted)]">
            Day 28 of 100
          </div>
        </div>

        {/* Right: 100-Day Challenge Card */}
        <div className="flex items-center justify-between gap-4 w-full lg:w-auto px-5 py-3 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)]">
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-amber-400" />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">100-Day Challenge</span>
              <span className="text-xs font-black text-[color:var(--text-main)]">72 days remaining</span>
            </div>
          </div>

          {/* Mini gauge */}
          <div className="relative w-8 h-8 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-700/40"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-cyan-400 transition-all duration-1000"
                strokeDasharray={`${progressPercent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        </div>

      </div>

      {/* 2. MIDDLE SECTION: INTERACTIVE MIND MAP & SPRINT LAB (LEFT) & TODAY'S ACTIVITY (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
        
        {/* Left Column: Interactive Mind Map + Active Sprint Panel (approx 65% width / col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Fully Interactive React Flow Mind Map */}
          <DashboardInteractiveMindMap />

          {/* Active Sprint & Telemetry Panel (Fills the gap with live, interactive execution) */}
          <DashboardActiveSprintPanel />
        </div>

        {/* Right Column: Activity & Control Stack (approx 35% width / col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <DashboardTodaysStudy />
          <DashboardProgressOverview 
            topicsCount={{ 
              completed: completedTopicsCount, 
              learning: learningTopicsCount, 
              notStarted: notStartedTopicsCount, 
              blocked: 2 
            }} 
          />
        </div>

      </div>

      {/* 3. BOTTOM ROW: 4 CONTEXTUAL WIDGET CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full items-stretch">
        
        {/* Card 1: Current Study Plan */}
        <DashboardStudyPlanWidget />

        {/* Card 2: Learning Materials & Recent Notes */}
        <DashboardMaterialsNotesWidget />

        {/* Card 3: Study Timer (State Isolated) */}
        <DashboardStudyTimer />

        {/* Card 4: AI Assistant & Quick Links */}
        <DashboardAiQuickLinksWidget />

      </div>

    </div>
  );
}
