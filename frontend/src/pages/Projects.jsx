import React, { useState } from 'react';
import { Briefcase, Terminal, Wrench, CheckCircle, Clock, Bug, Activity, GitFork } from 'lucide-react';

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
          
          <div className="p-8 md:p-10 rounded-[32px] overflow-hidden bg-[var(--bg-card)] shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col gap-6">
            <h2 className="text-xl font-bold text-[color:var(--text-main)] flex items-center gap-3">
              <Terminal className="text-orange-400" size={24} />
              New Debug Entry
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Problem */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Problem / Symptom</label>
                <textarea 
                  rows="2"
                  placeholder="What is broken?"
                  className="w-full bg-[#0a0f18] text-orange-100 border border-[var(--border-color)] rounded-2xl p-4 focus:outline-none focus:border-orange-500/50 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.8),inset_-2px_-2px_4px_rgba(255,255,255,0.05)] resize-none font-mono text-sm"
                ></textarea>
              </div>

              {/* Hypothesis */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Hypothesis</label>
                <textarea 
                  rows="3"
                  placeholder="Why do you think it's broken?"
                  className="w-full bg-[#0a0f18] text-blue-100 border border-[var(--border-color)] rounded-2xl p-4 focus:outline-none focus:border-blue-500/50 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.8),inset_-2px_-2px_4px_rgba(255,255,255,0.05)] resize-none font-mono text-sm"
                ></textarea>
              </div>

              {/* Command / Action */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Command / Action</label>
                <textarea 
                  rows="3"
                  placeholder="What did you run or change to test?"
                  className="w-full bg-[#0a0f18] text-green-100 border border-[var(--border-color)] rounded-2xl p-4 focus:outline-none focus:border-green-500/50 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.8),inset_-2px_-2px_4px_rgba(255,255,255,0.05)] resize-none font-mono text-sm"
                ></textarea>
              </div>

              {/* Output / Result */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Output / Error Log</label>
                <textarea 
                  rows="4"
                  placeholder="Paste error trace here..."
                  className="w-full bg-[#05080f] text-red-300 border border-[var(--border-color)] rounded-2xl p-4 focus:outline-none focus:border-red-500/50 shadow-[inset_6px_6px_12px_rgba(0,0,0,0.9),inset_-2px_-2px_4px_rgba(255,255,255,0.02)] resize-none font-mono text-sm leading-relaxed"
                ></textarea>
              </div>

              {/* Root Cause & Fix */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Root Cause & Fix</label>
                <textarea 
                  rows="3"
                  placeholder="What was the actual cause and how did you fix it?"
                  className="w-full bg-[#0a0f18] text-cyan-100 border border-[var(--border-color)] rounded-2xl p-4 focus:outline-none focus:border-cyan-500/50 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.8),inset_-2px_-2px_4px_rgba(255,255,255,0.05)] resize-none font-mono text-sm"
                ></textarea>
              </div>

            </div>

            <div className="flex justify-end mt-4">
              <button className="px-8 py-4 rounded-xl font-bold bg-[var(--bg-card)] text-orange-400 shadow-[6px_6px_12px_var(--shadow-dark),-6px_-6px_12px_var(--shadow-light)] hover:shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)] active:scale-95 transition-all flex items-center gap-2">
                <Wrench size={18} /> Save Entry
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
