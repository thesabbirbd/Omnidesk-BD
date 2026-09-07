import React, { useState } from 'react';
import { Briefcase, Terminal, Wrench, CheckCircle, Clock, BookOpen, Bug, Activity } from 'lucide-react';

const mockProjects = [
  {
    id: 1,
    name: "Study OS Dashboard",
    description: "A neumorphic study management system built with React & FastAPI.",
    progress: 75,
    milestones: [
      { name: "Planning", status: "complete" },
      { name: "Building", status: "complete" },
      { name: "Debugging", status: "active" },
      { name: "Testing", status: "pending" },
      { name: "Deployment", status: "pending" },
      { name: "Documentation", status: "pending" },
    ]
  },
  {
    id: 2,
    name: "Python API Gateway",
    description: "Microservice routing and rate-limiting using async FastAPI.",
    progress: 30,
    milestones: [
      { name: "Planning", status: "complete" },
      { name: "Building", status: "active" },
      { name: "Debugging", status: "pending" },
      { name: "Testing", status: "pending" },
      { name: "Deployment", status: "pending" },
      { name: "Documentation", status: "pending" },
    ]
  }
];

export default function Projects() {
  const [activeTab, setActiveTab] = useState('projects');

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-canvas)] text-[color:var(--text-main)] overflow-y-auto p-6 md:p-10 gap-8">
      
      {/* Header */}
      <div className="flex flex-col gap-2 text-center w-full max-w-4xl mx-auto mb-4">
        <h1 className="text-3xl md:text-4xl font-black tracking-wide flex items-center justify-center gap-3">
          <Briefcase className="text-cyan-400" size={36} />
          Engineering Lab & Projects
        </h1>
        <p className="text-[color:var(--text-muted)] font-medium">Track capstone projects and document your debugging processes.</p>
      </div>

      {/* Neumorphic Tab Switcher */}
      <div className="flex justify-center max-w-md mx-auto w-full p-2 rounded-2xl bg-[var(--bg-card)] shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)] border border-[var(--border-color)]">
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
            activeTab === 'projects'
              ? 'bg-[var(--bg-card)] shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] text-cyan-400'
              : 'text-[color:var(--text-muted)] hover:text-white'
          }`}
        >
          <Briefcase size={18} /> Tracker
        </button>
        <button
          onClick={() => setActiveTab('debug')}
          className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
            activeTab === 'debug'
              ? 'bg-[var(--bg-card)] shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] text-orange-400'
              : 'text-[color:var(--text-muted)] hover:text-white'
          }`}
        >
          <Bug size={18} /> Debug Journal
        </button>
      </div>

      {activeTab === 'projects' ? (
        <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full">
          {mockProjects.map(project => (
            <div key={project.id} className="p-8 md:p-10 rounded-[32px] overflow-hidden bg-[var(--bg-card)] shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col gap-8">
              
              {/* Project Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[color:var(--text-main)] group-hover:text-cyan-400 transition-colors">
                    {project.name}
                  </h2>
                  <p className="text-[color:var(--text-muted)] mt-1">{project.description}</p>
                </div>
                
                {/* Overall Progress */}
                <div className="flex items-center gap-4 bg-[var(--bg-input)] px-6 py-3 rounded-2xl shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)]">
                  <span className="font-bold text-slate-400">Completion</span>
                  <span className="text-xl font-black text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">{project.progress}%</span>
                </div>
              </div>

              {/* Milestones Track */}
              <div className="flex flex-wrap md:flex-nowrap gap-4 justify-between items-center bg-[var(--bg-input)] p-6 rounded-[24px] shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)]">
                {project.milestones.map((ms, index) => {
                  
                  const isComplete = ms.status === 'complete';
                  const isActive = ms.status === 'active';
                  
                  return (
                    <React.Fragment key={ms.name}>
                      <div className="flex flex-col items-center gap-3 relative z-10">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
                          isComplete ? 'bg-[var(--bg-card)] border-green-500/50 shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light),inset_0_0_10px_rgba(34,197,94,0.2)] text-green-400' :
                          isActive ? 'bg-[var(--bg-card)] border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.4),inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] text-cyan-400' :
                          'bg-[var(--bg-card)] border-transparent shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] text-[color:var(--text-muted)] opacity-50'
                        }`}>
                          {isComplete ? <CheckCircle size={20} /> : isActive ? <Activity size={20} /> : <Clock size={20} />}
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${
                          isComplete ? 'text-green-400' : isActive ? 'text-cyan-400' : 'text-slate-500'
                        }`}>{ms.name}</span>
                      </div>
                      
                      {/* Connecting Line */}
                      {index < project.milestones.length - 1 && (
                        <div className="hidden md:block flex-1 h-2 bg-[var(--bg-card)] rounded-full shadow-[inset_1px_1px_3px_var(--shadow-dark),inset_-1px_-1px_3px_var(--shadow-light)] overflow-hidden relative">
                          <div className={`absolute left-0 top-0 h-full transition-all duration-1000 ${
                            isComplete ? 'w-full bg-green-500 shadow-[0_0_8px_#22c55e]' : 'w-0'
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
