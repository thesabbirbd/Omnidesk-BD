import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GitFork, 
  Calendar, 
  Timer as TimerIcon, 
  Library, 
  Bot, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  ExternalLink, 
  ArrowRight, 
  CheckCircle2, 
  Circle, 
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

  // Today's goals state
  const [goals, setGoals] = useState([
    { id: 1, text: 'Learn Python OOP', completed: true },
    { id: 2, text: 'Build mini project', completed: false },
    { id: 3, text: 'Update notes', completed: false },
    { id: 4, text: '1 hour study session', completed: false },
  ]);

  // Bottom Timer state
  const [timerMode, setTimerMode] = useState('pomodoro');
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

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

  // Timer interval
  useEffect(() => {
    let interval = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  const toggleGoal = (id) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
    );
  };

  const handleTimerToggle = () => {
    setTimerRunning(!timerRunning);
  };

  const handleTimerReset = () => {
    setTimerRunning(false);
    if (timerMode === 'pomodoro') setTimerSeconds(25 * 60);
    else if (timerMode === 'focus') setTimerSeconds(50 * 60);
    else setTimerSeconds(15 * 60);
  };

  const handleTimerAdd5 = () => {
    setTimerSeconds((prev) => prev + 5 * 60);
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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
          
          {/* Card 1: Today's Study */}
          <div className="p-6 rounded-3xl bg-[var(--bg-card)] shadow-[6px_6px_14px_var(--shadow-dark),-6px_-6px_14px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col gap-5">
            
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2.5">
                <Calendar size={18} className="text-cyan-400" />
                <h3 className="text-sm font-black tracking-wide text-[color:var(--text-main)]">
                  Today's Study
                </h3>
              </div>
              <span className="text-[11px] font-bold text-[color:var(--text-muted)]">
                Sep 7, 2026
              </span>
            </div>

            {/* Circular Timer dial + Today's Goals checklist */}
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
                      className="text-emerald-400"
                      strokeDasharray="75, 100"
                      strokeWidth="3"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-xs font-black tracking-tight text-[color:var(--text-main)]">03:00:00</span>
                    <span className="text-[8px] font-bold text-[color:var(--text-muted)]">Focus Session</span>
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

              {/* Right: Today's Goals checklist */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-bold text-[color:var(--text-muted)] uppercase tracking-wider">
                  Today's Goals
                </span>
                {goals.map((g) => (
                  <div
                    key={g.id}
                    onClick={() => toggleGoal(g.id)}
                    className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none group"
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                      g.completed 
                        ? 'bg-cyan-500 border-cyan-500 text-slate-950' 
                        : 'border-[var(--border-color)] bg-[var(--bg-input)] group-hover:border-cyan-400'
                    }`}>
                      {g.completed && <Check size={11} strokeWidth={3} />}
                    </div>
                    <span className={`text-[11px] transition-all truncate ${
                      g.completed ? 'line-through text-[color:var(--text-muted)]' : 'text-[color:var(--text-main)]'
                    }`}>
                      {g.text}
                    </span>
                  </div>
                ))}
              </div>

            </div>

            {/* Bottom 3 Pills Stats */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--border-color)]">
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)]">
                <Clock size={14} className="text-cyan-400 mb-1" />
                <span className="text-[9px] text-[color:var(--text-muted)] font-semibold">Study Time</span>
                <span className="text-xs font-black text-[color:var(--text-main)]">2h 15m</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)]">
                <Flame size={14} className="text-amber-400 mb-1" />
                <span className="text-[9px] text-[color:var(--text-muted)] font-semibold">Streak</span>
                <span className="text-xs font-black text-amber-400">5 days</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)]">
                <CheckCircle2 size={14} className="text-emerald-400 mb-1" />
                <span className="text-[9px] text-[color:var(--text-muted)] font-semibold">Topics Done</span>
                <span className="text-xs font-black text-[color:var(--text-main)]">12/48</span>
              </div>
            </div>

          </div>

          {/* Card 2: Progress Overview Donut & Weekly Activity */}
          <div className="p-6 rounded-3xl bg-[var(--bg-card)] shadow-[6px_6px_14px_var(--shadow-dark),-6px_-6px_14px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col gap-5">
            
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2.5">
                <Activity size={18} className="text-indigo-400" />
                <h3 className="text-sm font-black tracking-wide text-[color:var(--text-main)]">
                  Progress Overview
                </h3>
              </div>
              <button 
                onClick={() => navigate('/os/analytics')}
                className="text-[color:var(--text-muted)] hover:text-cyan-400 transition-colors cursor-pointer"
                title="View Analytics"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Donut chart + Legend */}
            <div className="flex items-center justify-between gap-4">
              {/* SVG Donut */}
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Segment: Not started */}
                  <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#334155" strokeWidth="4" />
                  {/* Segment: Learning (yellow) */}
                  <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#fbbf24" strokeWidth="4" strokeDasharray="18 100" strokeDashoffset="0" />
                  {/* Segment: Completed (cyan/green) */}
                  <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#34d399" strokeWidth="4" strokeDasharray="28 100" strokeDashoffset="-18" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-sm font-black text-[color:var(--text-main)]">28%</span>
                  <span className="text-[8px] font-bold text-[color:var(--text-muted)]">Completed</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> Completed
                  </span>
                  <span className="text-[color:var(--text-main)]">46</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-400" /> Learning
                  </span>
                  <span className="text-[color:var(--text-main)]">18</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-slate-500" /> Not Started
                  </span>
                  <span className="text-[color:var(--text-main)]">112</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-rose-400">
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> Blocked
                  </span>
                  <span className="text-[color:var(--text-main)]">2</span>
                </div>
              </div>
            </div>

            {/* Weekly Activity Heatmap Grid */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[var(--border-color)]">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-[color:var(--text-muted)]">Weekly Activity</span>
                <span className="text-cyan-400 flex items-center gap-1 cursor-pointer" onClick={() => navigate('/os/analytics')}>
                  Sep 2026 <ChevronRight size={12} />
                </span>
              </div>

              {/* Mon-Sun Heatmap matrix */}
              <div className="flex flex-col gap-1 font-mono text-[9px] text-[color:var(--text-muted)]">
                <div className="flex gap-1 justify-between px-1 font-sans text-[8px]">
                  <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                </div>
                {/* 3 weeks of activity */}
                <div className="grid grid-cols-7 gap-1">
                  {[3, 2, 4, 3, 4, 1, 0].map((v, i) => (
                    <div 
                      key={i} 
                      className={`h-4 rounded-sm transition-all ${
                        v === 4 ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' :
                        v === 3 ? 'bg-emerald-500/80' :
                        v === 2 ? 'bg-amber-400/80' :
                        v === 1 ? 'bg-emerald-500/40' :
                        'bg-[var(--bg-input)]'
                      }`} 
                    />
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {[4, 4, 4, 2, 4, 3, 1].map((v, i) => (
                    <div 
                      key={i} 
                      className={`h-4 rounded-sm transition-all ${
                        v === 4 ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' :
                        v === 3 ? 'bg-emerald-500/80' :
                        v === 2 ? 'bg-amber-400/80' :
                        v === 1 ? 'bg-emerald-500/40' :
                        'bg-[var(--bg-input)]'
                      }`} 
                    />
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {[3, 4, 2, 0, 0, 0, 0].map((v, i) => (
                    <div 
                      key={i} 
                      className={`h-4 rounded-sm transition-all ${
                        v === 4 ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' :
                        v === 3 ? 'bg-emerald-500/80' :
                        v === 2 ? 'bg-amber-400/80' :
                        'bg-[var(--bg-input)] opacity-50'
                      }`} 
                    />
                  ))}
                </div>
              </div>
            </div>

          </div>

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

        {/* Card 3: Study Timer */}
        <div className="p-6 rounded-3xl bg-[var(--bg-card)] shadow-[6px_6px_14px_var(--shadow-dark),-6px_-6px_14px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col justify-between gap-4 h-full min-h-[480px]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <TimerIcon size={18} className="text-orange-400" />
                <h3 className="text-xs font-black tracking-wide text-[color:var(--text-main)] uppercase">
                  Study Timer
                </h3>
              </div>
              <button 
                onClick={() => navigate('/os/timer')}
                className="text-[color:var(--text-muted)] hover:text-orange-400 cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Mode Selector Tabs */}
            <div className="flex items-center justify-center gap-1.5 p-1 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)]">
              {[
                { id: 'pomodoro', label: 'Pomodoro', secs: 25 * 60 },
                { id: 'focus', label: 'Focus', secs: 50 * 60 },
                { id: 'custom', label: 'Custom', secs: 15 * 60 },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    setTimerMode(mode.id);
                    setTimerSeconds(mode.secs);
                    setTimerRunning(false);
                  }}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    timerMode === mode.id
                      ? 'bg-[var(--bg-card)] text-orange-400 shadow-[2px_2px_4px_var(--shadow-dark)]'
                      : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Circular Countdown Ring */}
            <div className="flex flex-col items-center justify-center gap-2.5 py-1">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#334155" strokeWidth="2.5" />
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="15.9155" 
                    fill="transparent" 
                    stroke="#fb923c" 
                    strokeWidth="2.5" 
                    strokeDasharray="100 100" 
                    strokeDashoffset={100 - (timerSeconds / (timerMode === 'focus' ? 3000 : 1500)) * 100}
                    strokeLinecap="round" 
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                    {formatTimer(timerSeconds)}
                  </span>
                  <span className="text-[8px] font-bold text-[color:var(--text-muted)] uppercase">Focus Time</span>
                </div>
              </div>

              {/* Timer Controls: Play/Pause, Reset, +5m */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleTimerToggle}
                  className="w-9 h-9 rounded-xl bg-orange-500 text-slate-950 flex items-center justify-center shadow-[0_0_10px_rgba(249,115,22,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title={timerRunning ? 'Pause' : 'Start'}
                >
                  {timerRunning ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                </button>

                <button
                  onClick={handleTimerReset}
                  className="w-9 h-9 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] flex items-center justify-center shadow-[inset_2px_2px_4px_var(--shadow-dark)] active:scale-95 transition-all cursor-pointer"
                  title="Reset Timer"
                >
                  <RotateCcw size={15} />
                </button>

                <button
                  onClick={handleTimerAdd5}
                  className="px-2.5 py-1.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[10px] font-bold text-orange-400 hover:text-orange-300 shadow-[inset_2px_2px_4px_var(--shadow-dark)] active:scale-95 transition-all cursor-pointer"
                  title="Add 5 minutes"
                >
                  +5m
                </button>
              </div>
            </div>
          </div>

          {/* Session History */}
          <div className="pt-3 border-t border-[var(--border-color)] flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-[color:var(--text-muted)]">Session History</span>
              <span className="text-[10px] font-bold text-cyan-400 cursor-pointer" onClick={() => navigate('/os/timer')}>View All</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-emerald-400 font-bold">• Focus 25m</span>
              <span className="text-[color:var(--text-main)] truncate max-w-[100px]">Python OOP</span>
              <span className="text-[9px] text-[color:var(--text-muted)]">10:24 AM</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-cyan-400 font-bold">• Study 45m</span>
              <span className="text-[color:var(--text-main)] truncate max-w-[100px]">FastAPI</span>
              <span className="text-[9px] text-[color:var(--text-muted)]">09:30 AM</span>
            </div>
          </div>
        </div>

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

