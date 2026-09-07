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

function YoutubeIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function GithubIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state for Mind Map preview
  const [mindMapFilter, setMindMapFilter] = useState('all');

  // Materials filter
  const [materialFilter, setMaterialFilter] = useState('all');

  // AI Prompt input
  const [aiPrompt, setAiPrompt] = useState('');

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

  const handleAiSubmit = (e) => {
    e?.preventDefault();
    if (aiPrompt.trim()) {
      navigate(`/os/ai-assistant?q=${encodeURIComponent(aiPrompt.trim())}`);
    }
  };

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
        <div className="p-6 rounded-3xl bg-[var(--bg-card)] shadow-[6px_6px_14px_var(--shadow-dark),-6px_-6px_14px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col justify-between gap-4 h-full min-h-[480px]">
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
                className="text-[11px] font-bold text-cyan-400 hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            {/* Weeks list */}
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
              {[
                { week: 'Week 1', title: 'Python Foundation & AI-Detox', pct: '100%', done: true },
                { week: 'Week 2', title: 'Core Python & Data Structures', pct: '50%', learning: true },
                { week: 'Week 3', title: 'Web Fundamentals & FastAPI', pct: '0%' },
                { week: 'Week 4', title: 'Database & SQL', pct: '0%' },
                { week: 'Week 5', title: 'Authentication & Security', pct: '0%' },
                { week: 'Week 6', title: 'Frontend Basics', pct: '0%' },
                { week: 'Week 7', title: 'Linux & Networking', pct: '0%' },
                { week: 'Week 8', title: 'Docker & Containerization', pct: '0%' },
                { week: 'Week 9', title: 'CI/CD & AWS Deployment', pct: '0%' },
                { week: 'Week 10', title: 'Terraform & Monitoring', pct: '0%' },
                { week: 'Week 11', title: 'Final Project & Review', pct: '0%' },
              ].map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => navigate('/os/study-plan')}
                  className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-cyan-500/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[10px] font-black text-cyan-400 shrink-0">{item.week}</span>
                    <span className="text-xs font-medium text-[color:var(--text-main)] truncate group-hover:text-cyan-400">
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    <span className={`text-[10px] font-bold ${
                      item.done ? 'text-emerald-400' : item.learning ? 'text-amber-400' : 'text-[color:var(--text-muted)]'
                    }`}>
                      {item.pct}
                    </span>
                    {item.done && <Check size={12} className="text-emerald-400" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[color:var(--text-muted)]">
            <span className="font-semibold">Pacing: 1 Week / Topic</span>
            <span className="font-bold text-cyan-400">Week 2 Active</span>
          </div>
        </div>

        {/* Card 2: Learning Materials & Recent Notes */}
        <div className="p-6 rounded-3xl bg-[var(--bg-card)] shadow-[6px_6px_14px_var(--shadow-dark),-6px_-6px_14px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col justify-between gap-4 h-full min-h-[480px]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <Library size={18} className="text-purple-400" />
                <h3 className="text-xs font-black tracking-wide text-[color:var(--text-main)] uppercase">
                  Learning Materials
                </h3>
              </div>
              <button 
                onClick={() => navigate('/os/materials')}
                className="text-[11px] font-bold text-cyan-400 hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-1 pb-1">
              {['all', 'notes', 'docs', 'videos', 'links'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setMaterialFilter(tab)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer ${
                    materialFilter === tab
                      ? 'bg-[var(--bg-input)] text-cyan-400 border border-cyan-500/30'
                      : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Materials Items */}
            <div className="flex flex-col gap-2">
              {[
                { title: 'Python OOP Basics', meta: 'Doc • 2.4 MB', icon: FileText, color: 'text-blue-400' },
                { title: 'FastAPI Official Docs', meta: 'https://fastapi.tiangolo.com', icon: ExternalLink, color: 'text-emerald-400' },
                { title: 'PostgreSQL Tutorial', meta: 'Video • 42 min', icon: Video, color: 'text-red-400' },
              ].map((mat, i) => (
                <div 
                  key={i}
                  onClick={() => navigate('/os/materials')}
                  className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-purple-500/40 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate">
                    <mat.icon size={14} className={mat.color} />
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-bold text-[color:var(--text-main)] truncate">{mat.title}</span>
                      <span className="text-[9px] text-[color:var(--text-muted)]">{mat.meta}</span>
                    </div>
                  </div>
                  <ExternalLink size={12} className="text-[color:var(--text-muted)] shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Sub-section: Recent Notes */}
          <div className="pt-3 border-t border-[var(--border-color)] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-[color:var(--text-muted)]">Recent Notes</span>
              <span className="text-[10px] font-bold text-cyan-400 cursor-pointer" onClick={() => navigate('/os/notes')}>View All</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {[
                { title: 'Why FastAPI?', date: 'Yesterday • Backend', tag: '#fastapi' },
                { title: 'PostgreSQL Indexing', date: '2 days ago • Database', tag: '#postgresql' },
                { title: 'Docker vs VM', date: '3 days ago • DevOps', tag: '#docker' },
              ].map((note, i) => (
                <div 
                  key={i} 
                  onClick={() => navigate('/os/notes')}
                  className="flex items-center justify-between text-xs cursor-pointer hover:text-cyan-400 transition-colors"
                >
                  <div className="flex flex-col truncate">
                    <span className="font-semibold text-[color:var(--text-main)] truncate">{note.title}</span>
                    <span className="text-[9px] text-[color:var(--text-muted)]">{note.date}</span>
                  </div>
                  <span className="text-[9px] font-bold text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-500/10 shrink-0">
                    {note.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Study Timer (State Isolated) */}
        <DashboardStudyTimer />

        {/* Card 4: AI Assistant & Quick Links */}
        <div className="p-6 rounded-3xl bg-[var(--bg-card)] shadow-[6px_6px_14px_var(--shadow-dark),-6px_-6px_14px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col justify-between gap-4 h-full min-h-[480px]">
          
          {/* AI Assistant Sub-widget */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <Bot size={18} className="text-sky-400" />
                <h3 className="text-xs font-black tracking-wide text-[color:var(--text-main)] uppercase">
                  AI Assistant
                </h3>
              </div>
              <button 
                onClick={() => navigate('/os/ai-assistant')}
                className="text-[color:var(--text-muted)] hover:text-sky-400 cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* AI Prompt Input */}
            <form onSubmit={handleAiSubmit} className="relative flex items-center">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ask anything about your study..."
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[color:var(--text-main)] rounded-xl py-2 pl-3 pr-10 focus:outline-none focus:border-sky-500/50 shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)]"
              />
              <button
                type="submit"
                className="absolute right-1.5 w-7 h-7 rounded-lg bg-sky-500 text-slate-950 flex items-center justify-center shadow-[0_0_8px_rgba(14,165,233,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Send size={12} />
              </button>
            </form>

            {/* Quick Action Chips */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Explain Topic', q: 'Can you explain the current topic in simple terms with code examples?' },
                { label: 'Debug Error', q: 'Help me debug this error in my code:' },
                { label: 'Generate Quiz', q: 'Generate a 3-question quick quiz on my current backend topic.' },
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(`/os/ai-assistant?q=${encodeURIComponent(chip.q)}`)}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold bg-[var(--bg-input)] border border-[var(--border-color)] text-sky-400 hover:border-sky-500/50 shadow-[inset_1px_1px_2px_var(--shadow-dark)] transition-all cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links Sub-widget */}
          <div className="pt-3 border-t border-[var(--border-color)] flex flex-col gap-2.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[color:var(--text-muted)]">
              Quick Links
            </span>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 p-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs font-bold text-[color:var(--text-main)] hover:text-red-400 hover:border-red-500/30 transition-all group"
              >
                <YoutubeIcon size={16} className="text-red-500 group-hover:scale-110 transition-transform" />
                <span className="truncate">YouTube</span>
              </a>

              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 p-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs font-bold text-[color:var(--text-main)] hover:text-cyan-400 hover:border-cyan-500/30 transition-all group"
              >
                <GithubIcon size={16} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="truncate">GitHub Repo</span>
              </a>

              <button
                onClick={() => navigate('/os/materials')}
                className="flex items-center gap-2 p-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs font-bold text-[color:var(--text-main)] hover:text-emerald-400 hover:border-emerald-500/30 transition-all group cursor-pointer"
              >
                <FileText size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="truncate">Docs (Official)</span>
              </button>

              <button
                onClick={() => navigate('/os/materials')}
                className="flex items-center gap-2 p-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs font-bold text-[color:var(--text-main)] hover:text-amber-400 hover:border-amber-500/30 transition-all group cursor-pointer"
              >
                <Folder size={16} className="text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="truncate">Local Files</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

