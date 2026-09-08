import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Terminal, 
  Wrench, 
  CheckCircle, 
  Clock, 
  Bug, 
  Activity, 
  GitFork,
  Sparkles,
  AlertTriangle,
  FileCode,
  Check,
  ChevronDown
} from 'lucide-react';
import { getDebugJournals, createDebugJournal, getDebugHypothesis } from '../services/api';

const LIFECYCLE_STAGES = ['Idea', 'Architecture', 'In Progress', 'Code Complete', 'Deployed'];

const initialProjects = [
  {
    id: 1,
    name: "Universal Study OS Core",
    description: "Multi-theme engineering workspace with real-time face presence, graph knowledge maps, and global timer engine.",
    stage: "In Progress",
    progress: 75,
    githubUrl: "https://github.com/thesabbirbd/universal-study-os",
    tags: ["React 18", "FastAPI", "TailwindCSS", "PostgreSQL"],
    milestones: [
      { name: "Idea", status: "complete" },
      { name: "Architecture", status: "complete" },
      { name: "In Progress", status: "active" },
      { name: "Code Complete", status: "pending" },
      { name: "Deployed", status: "pending" },
    ]
  },
  {
    id: 2,
    name: "Async Celery Job Queue & Cache Gateway",
    description: "High-throughput Redis queue orchestrator with automatic exponential retries, dead-letter exchanges, and prometheus telemetry.",
    stage: "Architecture",
    progress: 35,
    githubUrl: "https://github.com/thesabbirbd/universal-study-os",
    tags: ["Python 3.12", "Redis", "Celery", "Docker"],
    milestones: [
      { name: "Idea", status: "complete" },
      { name: "Architecture", status: "active" },
      { name: "In Progress", status: "pending" },
      { name: "Code Complete", status: "pending" },
      { name: "Deployed", status: "pending" },
    ]
  },
  {
    id: 3,
    name: "Microservice Auth & Token Verifier",
    description: "Stateless RS256 JWT key rotator with Argon2 hashing and rate-limiting middleware.",
    stage: "Deployed",
    progress: 100,
    githubUrl: "https://github.com/thesabbirbd/universal-study-os",
    tags: ["FastAPI", "OAuth2", "PyJWT", "Argon2"],
    milestones: [
      { name: "Idea", status: "complete" },
      { name: "Architecture", status: "complete" },
      { name: "In Progress", status: "complete" },
      { name: "Code Complete", status: "complete" },
      { name: "Deployed", status: "complete" },
    ]
  }
];

export default function Projects() {
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState(initialProjects);
  const [stageFilter, setStageFilter] = useState('All');
  const [debugJournals, setDebugJournals] = useState([]);
  const [loadingJournals, setLoadingJournals] = useState(false);
  const [loadingHypo, setLoadingHypo] = useState(false);
  const [savingJournal, setSavingJournal] = useState(false);

  const [newJournal, setNewJournal] = useState({
    title: '',
    problem: '',
    symptom: '',
    hypothesis: '',
    command_used: '',
    output_logs: '',
    root_cause: '',
    solution: '',
    lesson_learned: '',
    project_id: ''
  });

  const fetchJournals = async () => {
    setLoadingJournals(true);
    try {
      const data = await getDebugJournals();
      setDebugJournals(data || []);
    } catch (e) {
      console.warn("Failed to load debug journals:", e);
    } finally {
      setLoadingJournals(false);
    }
  };

  useEffect(() => {
    fetchJournals();
    const handleRefresh = () => fetchJournals();
    window.addEventListener('studyos-debug-journal-added', handleRefresh);
    return () => window.removeEventListener('studyos-debug-journal-added', handleRefresh);
  }, []);

  const handleAutoHypo = async () => {
    if (!newJournal.problem && !newJournal.output_logs) {
      alert("Please provide problem or error logs first.");
      return;
    }
    setLoadingHypo(true);
    try {
      const res = await getDebugHypothesis({
        problem: newJournal.problem || newJournal.title,
        symptom: newJournal.symptom,
        output_logs: newJournal.output_logs
      });
      if (res) {
        setNewJournal((prev) => ({
          ...prev,
          hypothesis: res.hypothesis || prev.hypothesis,
          command_used: res.investigation_command || prev.command_used,
          root_cause: prev.root_cause || res.recommended_fix || ''
        }));
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoadingHypo(false);
    }
  };

  const handleSaveJournal = async (e) => {
    if (e) e.preventDefault();
    if (!newJournal.title.trim() || !newJournal.problem.trim()) {
      alert("Title and Problem description are required.");
      return;
    }
    setSavingJournal(true);
    try {
      const saved = await createDebugJournal({
        ...newJournal,
        project_id: newJournal.project_id || null
      });
      setDebugJournals((prev) => [saved, ...prev]);
      setNewJournal({
        title: '',
        problem: '',
        symptom: '',
        hypothesis: '',
        command_used: '',
        output_logs: '',
        root_cause: '',
        solution: '',
        lesson_learned: '',
        project_id: ''
      });
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to save debug entry");
    } finally {
      setSavingJournal(false);
    }
  };

  const filteredProjects = projects.filter((p) =>
    stageFilter === 'All' ? true : p.stage === stageFilter
  );

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-canvas)] text-[color:var(--text-main)] overflow-y-auto p-4 md:p-10 gap-8">
      
      {/* Header */}
      <div className="flex flex-col gap-2 text-center w-full max-w-4xl mx-auto mb-2">
        <h1 className="text-3xl md:text-4xl font-black tracking-wide flex items-center justify-center gap-3">
          <Briefcase className="text-cyan-400" size={36} />
          Engineering Lab & Projects
        </h1>
        <p className="text-[color:var(--text-muted)] font-medium text-sm md:text-base">
          Track capstone projects through the end-to-end lifecycle (Idea → Architecture → In Progress → Code Complete → Deployed).
        </p>
      </div>

      {/* Tab Switcher & Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-6xl mx-auto w-full">
        <div className="flex p-1.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[var(--card-shadow)] w-full md:w-auto">
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer text-xs uppercase tracking-wider ${
              activeTab === 'projects'
                ? 'bg-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]'
            }`}
          >
            <Briefcase size={16} /> Lifecycle Tracker
          </button>
          <button
            onClick={() => setActiveTab('debug')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer text-xs uppercase tracking-wider ${
              activeTab === 'debug'
                ? 'bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]'
                : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]'
            }`}
          >
            <Bug size={16} /> Debug Journal
          </button>
        </div>

        {activeTab === 'projects' && (
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1">
            {['All', ...LIFECYCLE_STAGES].map((stage) => (
              <button
                key={stage}
                onClick={() => setStageFilter(stage)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  stageFilter === stage
                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-400'
                    : 'bg-[var(--bg-input)] text-[color:var(--text-muted)] border-[var(--border-color)] hover:text-[color:var(--text-main)]'
                }`}
              >
                {stage}
              </button>
            ))}
          </div>
        )}
      </div>

      {activeTab === 'projects' ? (
        <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full">
          {filteredProjects.map(project => (
            <div key={project.id} className="p-6 md:p-8 rounded-[32px] overflow-hidden bg-[var(--bg-card)] shadow-[var(--card-shadow)] border border-[var(--border-color)] flex flex-col gap-6">
              
              {/* Project Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl font-bold text-[color:var(--text-main)]">
                      {project.name}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                      project.stage === 'Deployed' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                      project.stage === 'In Progress' ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' :
                      'bg-purple-500/15 text-purple-400 border-purple-500/30'
                    }`}>
                      {project.stage}
                    </span>
                  </div>
                  <p className="text-[color:var(--text-muted)] text-sm max-w-2xl">{project.description}</p>
                  
                  {/* Tech Tags */}
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    {project.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-[var(--bg-input)] text-[color:var(--text-muted)] border border-[var(--border-color)]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Actions & Completion */}
                <div className="flex items-center gap-3 shrink-0">
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:text-cyan-400 transition-colors cursor-pointer"
                    title="View GitHub Repository"
                  >
                    <GitFork size={20} />
                  </a>
                  <div className="flex items-center gap-3 bg-[var(--bg-input)] px-5 py-3 rounded-2xl border border-[var(--border-color)]">
                    <span className="font-bold text-xs uppercase text-[color:var(--text-muted)]">Progress</span>
                    <span className="text-xl font-black text-cyan-400">{project.progress}%</span>
                  </div>
                </div>
              </div>

              {/* Milestones Track */}
              <div className="flex flex-wrap md:flex-nowrap gap-3 justify-between items-center bg-[var(--bg-input)] p-5 rounded-[24px] border border-[var(--border-color)]">
                {project.milestones.map((ms, index) => {
                  const isComplete = ms.status === 'complete';
                  const isActive = ms.status === 'active';
                  
                  return (
                    <React.Fragment key={ms.name}>
                      <div className="flex flex-col items-center gap-2 relative z-10">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                          isComplete ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]' :
                          isActive ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]' :
                          'bg-[var(--bg-card)] border-transparent text-[color:var(--text-muted)] opacity-40'
                        }`}>
                          {isComplete ? <CheckCircle size={18} /> : isActive ? <Activity size={18} /> : <Clock size={18} />}
                        </div>
                        <span className={`text-[11px] font-bold uppercase tracking-wider text-center ${
                          isComplete ? 'text-emerald-400' : isActive ? 'text-cyan-400' : 'text-[color:var(--text-muted)]'
                        }`}>{ms.name}</span>
                      </div>
                      
                      {/* Connecting Line */}
                      {index < project.milestones.length - 1 && (
                        <div className="hidden md:block flex-1 h-1.5 bg-[var(--bg-card)] rounded-full overflow-hidden relative">
                          <div className={`absolute left-0 top-0 h-full transition-all duration-700 ${
                            isComplete ? 'w-full bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'w-0'
                          }`}></div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

            </div>
          ))}
        </div>
      ) : (
        /* Debug Journal Interface */
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
          
          <form 
            onSubmit={handleSaveJournal}
            className="p-8 md:p-10 rounded-[32px] overflow-hidden bg-[var(--bg-card)] shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col gap-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[color:var(--text-main)] flex items-center gap-3">
                <Terminal className="text-orange-400" size={24} />
                New Debug Entry (Root Cause Isolation)
              </h2>
              <button
                type="button"
                onClick={handleAutoHypo}
                disabled={loadingHypo}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all cursor-pointer"
              >
                <Sparkles size={13} />
                <span>{loadingHypo ? "Analyzing..." : "Auto-Diagnose (Offline AI)"}</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Title & Project Link */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Bug / Incident Title *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Postgres async checkout timeout"
                  value={newJournal.title}
                  onChange={(e) => setNewJournal({ ...newJournal, title: e.target.value })}
                  className="w-full bg-[var(--bg-input)] text-[color:var(--text-main)] border border-[var(--border-color)] rounded-xl p-3 focus:outline-none focus:border-orange-500/50 text-sm font-semibold"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Associated Project</label>
                <select
                  value={newJournal.project_id}
                  onChange={(e) => setNewJournal({ ...newJournal, project_id: e.target.value })}
                  className="w-full bg-[var(--bg-input)] text-[color:var(--text-main)] border border-[var(--border-color)] rounded-xl p-3 focus:outline-none text-xs font-semibold"
                >
                  <option value="">No Project (General Lab)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name || p.title}</option>
                  ))}
                </select>
              </div>

              {/* Problem */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Problem / What is broken? *</label>
                <textarea 
                  rows="2"
                  required
                  placeholder="What is failing? Expected vs actual result..."
                  value={newJournal.problem}
                  onChange={(e) => setNewJournal({ ...newJournal, problem: e.target.value })}
                  className="w-full bg-[var(--bg-input)] text-orange-200 border border-[var(--border-color)] rounded-xl p-3 focus:outline-none focus:border-orange-500/50 resize-none font-mono text-xs"
                />
              </div>

              {/* Hypothesis */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Hypothesis (Why did it break?)</label>
                <textarea 
                  rows="3"
                  placeholder="Why do you think it's broken?"
                  value={newJournal.hypothesis}
                  onChange={(e) => setNewJournal({ ...newJournal, hypothesis: e.target.value })}
                  className="w-full bg-[var(--bg-input)] text-blue-200 border border-[var(--border-color)] rounded-xl p-3 focus:outline-none focus:border-blue-500/50 resize-none font-mono text-xs"
                />
              </div>

              {/* Command / Action */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Command / Investigation Test</label>
                <textarea 
                  rows="3"
                  placeholder="What diagnostic command did you execute?"
                  value={newJournal.command_used}
                  onChange={(e) => setNewJournal({ ...newJournal, command_used: e.target.value })}
                  className="w-full bg-[var(--bg-input)] text-green-300 border border-[var(--border-color)] rounded-xl p-3 focus:outline-none focus:border-green-500/50 resize-none font-mono text-xs"
                />
              </div>

              {/* Output / Result */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Terminal Output / Stack Trace</label>
                <textarea 
                  rows="3"
                  placeholder="Paste error logs or terminal output..."
                  value={newJournal.output_logs}
                  onChange={(e) => setNewJournal({ ...newJournal, output_logs: e.target.value })}
                  className="w-full bg-[#05080f] text-red-300 border border-[var(--border-color)] rounded-xl p-3 focus:outline-none focus:border-red-500/50 resize-none font-mono text-xs leading-relaxed"
                />
              </div>

              {/* Root Cause & Fix */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Root Cause</label>
                <textarea 
                  rows="2"
                  placeholder="What was the actual underlying cause?"
                  value={newJournal.root_cause}
                  onChange={(e) => setNewJournal({ ...newJournal, root_cause: e.target.value })}
                  className="w-full bg-[var(--bg-input)] text-cyan-200 border border-[var(--border-color)] rounded-xl p-3 focus:outline-none focus:border-cyan-500/50 resize-none font-mono text-xs"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Solution & Lesson Learned</label>
                <textarea 
                  rows="2"
                  placeholder="How did you fix it permanently?"
                  value={newJournal.solution}
                  onChange={(e) => setNewJournal({ ...newJournal, solution: e.target.value })}
                  className="w-full bg-[var(--bg-input)] text-emerald-200 border border-[var(--border-color)] rounded-xl p-3 focus:outline-none focus:border-emerald-500/50 resize-none font-mono text-xs"
                />
              </div>

            </div>

            <div className="flex justify-end mt-2">
              <button 
                type="submit"
                disabled={savingJournal}
                className="px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider bg-orange-400 hover:bg-orange-300 text-slate-950 shadow-[0_0_15px_rgba(251,146,60,0.4)] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Wrench size={14} />
                <span>{savingJournal ? "Recording..." : "Save Debug Entry"}</span>
              </button>
            </div>
          </form>

          {/* Historical Debug Entries Section */}
          <div className="flex flex-col gap-4 mt-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-[color:var(--text-muted)] flex items-center gap-2">
              <Bug size={16} className="text-orange-400" />
              <span>Resolved Bug History ({debugJournals.length})</span>
            </h3>

            {loadingJournals ? (
              <div className="text-xs text-[color:var(--text-muted)] py-4 text-center">Loading debug journals...</div>
            ) : debugJournals.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] text-center text-xs text-[color:var(--text-muted)]">
                No debug entries recorded yet. Use the form above or click "I'm Stuck" whenever you encounter a blocking issue.
              </div>
            ) : (
              debugJournals.map((entry) => (
                <div 
                  key={entry.id}
                  className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[var(--card-shadow)] flex flex-col gap-3 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-base font-bold text-[color:var(--text-main)] flex items-center gap-2">
                        <Terminal size={15} className="text-orange-400" />
                        <span>{entry.title}</span>
                      </h4>
                      <span className="text-[10px] text-[color:var(--text-muted)]">
                        {new Date(entry.created_at).toLocaleDateString()} at {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Resolved
                    </span>
                  </div>

                  <p className="text-xs text-orange-200/90 font-mono bg-[#070b12] p-2.5 rounded-xl border border-[var(--border-color)]/50">
                    <span className="text-slate-500 font-bold uppercase text-[9px] block mb-0.5">Problem</span>
                    {entry.problem}
                  </p>

                  {entry.root_cause && (
                    <div className="text-xs text-cyan-200/90 font-mono bg-cyan-950/20 p-2.5 rounded-xl border border-cyan-500/20">
                      <span className="text-cyan-400 font-bold uppercase text-[9px] block mb-0.5">Root Cause</span>
                      {entry.root_cause}
                    </div>
                  )}

                  {entry.solution && (
                    <div className="text-xs text-emerald-200/90 font-mono bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-500/20">
                      <span className="text-emerald-400 font-bold uppercase text-[9px] block mb-0.5">Verified Solution</span>
                      {entry.solution}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

        </div>
      )}

    </div>
  );
}
