import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GitFork, 
  Calendar, 
  Library, 
  Bot, 
  ExternalLink, 
  ArrowRight, 
  CheckCircle2, 
  Send, 
  Target, 
  ChevronRight, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Sparkles, 
  FileText, 
  Folder, 
  Check, 
  Flame, 
  Clock, 
  Terminal, 
  Server, 
  Cloud, 
  Activity, 
  Code,
  Video
} from 'lucide-react';
import { getTopics, getSessions } from '../services/api';
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
  const [loading, setLoading] = useState(true);

  // Filter state for Mind Map preview
  const [mindMapFilter, setMindMapFilter] = useState('all');

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
      } finally {
        setLoading(false);
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

      {/* 2. MIDDLE SECTION: MIND MAP (LEFT) & TODAY'S ACTIVITY (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
        
        {/* Left Column: Interactive Mind Map (approx 65% width / col-span-8) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-[var(--bg-card)] shadow-[6px_6px_14px_var(--shadow-dark),-6px_-6px_14px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col gap-5">
          
          {/* Header & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <GitFork size={20} />
              </div>
              <h2 className="text-base font-black tracking-wide text-[color:var(--text-main)]">
                Interactive Mind Map
              </h2>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2">
              {[
                { id: 'all', label: 'All (14)', color: 'text-[color:var(--text-muted)]' },
                { id: 'normal', label: 'Normal (8)', color: 'text-slate-400' },
                { id: 'learning', label: 'Learning (3)', color: 'text-amber-400' },
                { id: 'complete', label: 'Complete (3)', color: 'text-emerald-400' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setMindMapFilter(pill.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    mindMapFilter === pill.id
                      ? 'bg-[var(--bg-input)] shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] ' + pill.color
                      : 'hover:text-[color:var(--text-main)] text-[color:var(--text-muted)]'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Zoom / Fullscreen icons */}
            <div className="flex items-center gap-1 text-[color:var(--text-muted)]">
              <button 
                onClick={() => navigate('/os/mindmap')}
                className="p-1.5 rounded-lg hover:text-[color:var(--text-main)] hover:bg-[var(--bg-input)] transition-all cursor-pointer" 
                title="Search Mind Map"
              >
                <Search size={15} />
              </button>
              <button 
                className="p-1.5 rounded-lg hover:text-[color:var(--text-main)] hover:bg-[var(--bg-input)] transition-all cursor-pointer" 
                title="Zoom Out"
              >
                <ZoomOut size={15} />
              </button>
              <span className="text-[11px] font-mono px-1 font-bold">100%</span>
              <button 
                className="p-1.5 rounded-lg hover:text-[color:var(--text-main)] hover:bg-[var(--bg-input)] transition-all cursor-pointer" 
                title="Zoom In"
              >
                <ZoomIn size={15} />
              </button>
              <button 
                onClick={() => navigate('/os/mindmap')}
                className="p-1.5 rounded-lg hover:text-cyan-400 hover:bg-[var(--bg-input)] transition-all cursor-pointer ml-1" 
                title="Full Screen Mind Map"
              >
                <Maximize2 size={15} />
              </button>
            </div>
          </div>

          {/* Interactive Mind Map Preview Canvas */}
          <div 
            onClick={() => navigate('/os/mindmap')}
            className="relative w-full h-[400px] md:h-[450px] rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)] overflow-hidden cursor-pointer group"
          >
            {/* Ambient background glow behind canvas */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none" />

            {/* SVG Connecting Bezier Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="line-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="line-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="line-green" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Center to Top (Python) */}
              <path d="M 50% 50% Q 50% 25% 45% 15%" stroke="url(#line-green)" strokeWidth="2" fill="none" strokeDasharray="3 3" />
              {/* Center to Top-Left (Backend) */}
              <path d="M 50% 50% Q 30% 45% 20% 32%" stroke="url(#line-yellow)" strokeWidth="2.5" fill="none" />
              {/* Center to Top-Right (Frontend) */}
              <path d="M 50% 50% Q 68% 45% 78% 30%" stroke="url(#line-cyan)" strokeWidth="1.5" fill="none" />
              {/* Center to Bottom-Left (DevOps) */}
              <path d="M 50% 50% Q 30% 55% 20% 68%" stroke="url(#line-cyan)" strokeWidth="1.5" fill="none" />
              {/* Center to Right (Containers) */}
              <path d="M 50% 50% Q 65% 55% 80% 60%" stroke="url(#line-yellow)" strokeWidth="2.5" fill="none" />
              {/* Center to Bottom-Center-Left (Cloud) */}
              <path d="M 50% 50% Q 35% 75% 25% 85%" stroke="url(#line-cyan)" strokeWidth="1.5" fill="none" />
              {/* Center to Bottom (Production) */}
              <path d="M 50% 50% Q 50% 75% 48% 85%" stroke="url(#line-cyan)" strokeWidth="1.5" fill="none" />
              {/* Center to Bottom-Right (Projects) */}
              <path d="M 50% 50% Q 65% 75% 75% 85%" stroke="url(#line-cyan)" strokeWidth="1.5" fill="none" />
            </svg>

            {/* Central Node */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="px-5 py-3 rounded-2xl bg-[var(--bg-card)] border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4),6px_6px_12px_var(--shadow-dark)] flex items-center gap-3 transition-transform group-hover:scale-105">
                <Target size={20} className="text-cyan-400" />
                <div className="text-left">
                  <div className="text-xs font-black text-cyan-400 leading-tight">100-Day</div>
                  <div className="text-sm font-black text-[color:var(--text-main)] whitespace-nowrap">Backend → DevOps Engineer</div>
                </div>
              </div>
            </div>

            {/* Node 1: Top (Python & Foundation - Completed) */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
              <div className="px-4 py-2.5 rounded-2xl bg-[var(--bg-card)] border border-emerald-500/60 shadow-[0_0_12px_rgba(52,211,153,0.3)] flex items-center gap-2.5">
                <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Code size={14} />
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    1. Python & Foundation <Check size={12} />
                  </div>
                  <div className="text-[9px] text-[color:var(--text-muted)] font-medium">Python • OOP • Data Structures • Git</div>
                </div>
              </div>
            </div>

            {/* Node 2: Left Top (Backend Engineering - Learning) */}
            <div className="absolute top-1/4 left-4 md:left-8 z-10">
              <div className="px-4 py-2.5 rounded-2xl bg-[var(--bg-card)] border-2 border-amber-400/80 shadow-[0_0_14px_rgba(251,191,36,0.35)] flex items-center gap-2.5">
                <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
                  <Server size={14} />
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-bold text-amber-400">2. Backend Engineering</div>
                  <div className="text-[9px] text-[color:var(--text-muted)] font-medium">FastAPI • APIs • PostgreSQL • Auth</div>
                </div>
              </div>
            </div>

            {/* Node 3: Right Top (Frontend Support - Normal) */}
            <div className="absolute top-1/4 right-4 md:right-8 z-10">
              <div className="px-4 py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[4px_4px_8px_var(--shadow-dark)] flex items-center gap-2.5">
                <div className="p-1 rounded-lg bg-slate-500/20 text-slate-400">
                  <Code size={14} />
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-bold text-[color:var(--text-main)]">3. Frontend Support</div>
                  <div className="text-[9px] text-[color:var(--text-muted)] font-medium">HTML/CSS • React • API Integration</div>
                </div>
              </div>
            </div>

            {/* Node 4: Left Mid-Bottom (DevOps Foundation - Normal) */}
            <div className="absolute bottom-1/4 left-4 md:left-8 z-10">
              <div className="px-4 py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[4px_4px_8px_var(--shadow-dark)] flex items-center gap-2.5">
                <div className="p-1 rounded-lg bg-slate-500/20 text-slate-400">
                  <Terminal size={14} />
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-bold text-[color:var(--text-main)]">4. DevOps Foundation</div>
                  <div className="text-[9px] text-[color:var(--text-muted)] font-medium">Linux • Bash • Networking • Nginx</div>
                </div>
              </div>
            </div>

            {/* Node 5: Right Mid-Bottom (Containers & Automation - Learning) */}
            <div className="absolute top-1/2 right-4 md:right-8 z-10">
              <div className="px-4 py-2.5 rounded-2xl bg-[var(--bg-card)] border-2 border-amber-400/80 shadow-[0_0_14px_rgba(251,191,36,0.35)] flex items-center gap-2.5">
                <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
                  <Activity size={14} />
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-bold text-amber-400">5. Containers & CI/CD</div>
                  <div className="text-[9px] text-[color:var(--text-muted)] font-medium">Docker • Compose • GitHub Actions</div>
                </div>
              </div>
            </div>

            {/* Node 6: Bottom Left (Cloud & Infrastructure) */}
            <div className="absolute bottom-4 left-6 md:left-14 z-10 hidden sm:block">
              <div className="px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[3px_3px_6px_var(--shadow-dark)] flex items-center gap-2">
                <Cloud size={13} className="text-cyan-400" />
                <div className="text-left">
                  <div className="text-[10px] font-bold text-[color:var(--text-main)]">6. Cloud & Infra</div>
                  <div className="text-[8px] text-[color:var(--text-muted)]">AWS • EC2 • RDS • Terraform</div>
                </div>
              </div>
            </div>

            {/* Node 7: Bottom Center (Production Engineering) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 hidden sm:block">
              <div className="px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[3px_3px_6px_var(--shadow-dark)] flex items-center gap-2">
                <Activity size={13} className="text-purple-400" />
                <div className="text-left">
                  <div className="text-[10px] font-bold text-[color:var(--text-main)]">7. Production Eng</div>
                  <div className="text-[8px] text-[color:var(--text-muted)]">Prometheus • Grafana • Reliability</div>
                </div>
              </div>
            </div>

            {/* Node 8: Bottom Right (Project Ladder) */}
            <div className="absolute bottom-4 right-6 md:right-14 z-10 hidden sm:block">
              <div className="px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[3px_3px_6px_var(--shadow-dark)] flex items-center gap-2">
                <FileText size={13} className="text-emerald-400" />
                <div className="text-left">
                  <div className="text-[10px] font-bold text-[color:var(--text-main)]">8. Project Ladder</div>
                  <div className="text-[8px] text-[color:var(--text-muted)]">CLI → API → Docker → AWS</div>
                </div>
              </div>
            </div>

            {/* Click to expand overlay tip */}
            <div className="absolute bottom-3 right-4 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-1 bg-[var(--bg-card)] px-2.5 py-1 rounded-lg border border-cyan-500/20">
                Click to open full Mind Map <ArrowRight size={10} />
              </span>
            </div>

          </div>

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

