import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Server, Code, ArrowRight, Folder, Link2, Rocket } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);

  const spaces = [
    { id: 1, title: 'Backend -> DevOps', icon: Server, color: 'text-cyan-400', progress: '72 days left' },
    { id: 2, title: 'Frontend Mastery', icon: Code, color: 'text-purple-400', progress: 'Completed' }
  ];

  return (
    <div className="min-h-screen w-full bg-[var(--bg-canvas)] text-[color:var(--text-main)] flex flex-col items-center py-20 px-6 relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="text-center mb-16 z-10">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 tracking-wider uppercase drop-shadow-lg mb-4">
          Universal Study OS
        </h1>
        <p className="text-lg font-medium text-[color:var(--text-muted)] max-w-lg mx-auto">
          Select an existing study space or create a new universe of knowledge.
        </p>
      </div>

      {!showCreate ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl w-full z-10">
          
          {spaces.map(space => (
            <div 
              key={space.id} 
              onClick={() => navigate('/os/dashboard')}
              className="p-10 rounded-[40px] overflow-hidden bg-[var(--bg-card)] shadow-[12px_12px_24px_var(--shadow-dark),-12px_-12px_24px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col items-center justify-center text-center gap-6 cursor-pointer group hover:shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)] transition-all duration-300 relative overflow-hidden"
            >
              {/* Corner label inside a relative container to prevent overlap */}
              <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
                <div className="relative w-full h-full p-6">
                  <span className="absolute top-6 right-6 text-xs font-bold uppercase tracking-widest text-slate-500 bg-[var(--bg-input)] px-3 py-1 rounded-full shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)]">
                    {space.progress}
                  </span>
                </div>
              </div>

              <div className={`p-6 rounded-3xl bg-[var(--bg-panel)] shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)] group-hover:scale-110 transition-transform duration-500 ${space.color}`}>
                <space.icon size={48} className="drop-shadow-[0_0_12px_currentColor]" />
              </div>
              <h2 className="text-2xl font-black tracking-wide text-[color:var(--text-main)] group-hover:text-cyan-400 transition-colors">
                {space.title}
              </h2>
            </div>
          ))}

          {/* Create New Space Card */}
          <div 
            onClick={() => setShowCreate(true)}
            className="p-10 rounded-[40px] overflow-hidden bg-[var(--bg-card)] shadow-[12px_12px_24px_var(--shadow-dark),-12px_-12px_24px_var(--shadow-light)] border-2 border-dashed border-[var(--border-color)] hover:border-cyan-500/50 flex flex-col items-center justify-center text-center gap-6 cursor-pointer group hover:shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)] transition-all duration-300"
          >
            <div className="p-6 rounded-3xl bg-[var(--bg-input)] shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] text-[color:var(--text-muted)] group-hover:text-cyan-400 group-hover:scale-110 transition-all duration-500">
              <Plus size={48} />
            </div>
            <h2 className="text-2xl font-black tracking-wide text-[color:var(--text-muted)] group-hover:text-[color:var(--text-main)] transition-colors">
              Create Study Space
            </h2>
          </div>

        </div>
      ) : (
        <div className="w-full max-w-3xl z-10 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
          
          <div className="p-10 rounded-[40px] overflow-hidden bg-[var(--bg-card)] shadow-[12px_12px_24px_var(--shadow-dark),-12px_-12px_24px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col gap-8">
            <div className="flex flex-col items-center justify-center text-center w-full gap-2 border-b border-[var(--border-color)] pb-6">
              <Rocket className="text-cyan-400 mb-2" size={32} />
              <h2 className="text-3xl font-black text-[color:var(--text-main)]">Initialize Workspace</h2>
              <p className="text-[color:var(--text-muted)] font-medium">Define your goal and paste your roadmap.</p>
            </div>

            {/* Debossed Form */}
            <div className="flex flex-col gap-6">
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold uppercase tracking-widest text-[color:var(--text-muted)] pl-2">Workspace Name</label>
                <div className="relative">
                  <Folder size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-cyan-400" />
                  <input 
                    type="text" 
                    placeholder="e.g. 100-Day DevOps Engineer" 
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[color:var(--text-main)] font-bold text-lg rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-cyan-500/50 transition-all shadow-[inset_6px_6px_12px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold uppercase tracking-widest text-[color:var(--text-muted)] pl-2">Paste Roadmap / Curriculum</label>
                <textarea 
                  rows="6"
                  placeholder="Paste syllabus, topics, or ChatGPT output here..." 
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[color:var(--text-main)] font-mono text-sm rounded-2xl p-6 focus:outline-none focus:border-cyan-500/50 transition-all shadow-[inset_6px_6px_12px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)] resize-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold uppercase tracking-widest text-[color:var(--text-muted)] pl-2">Import External Materials</label>
                <div className="relative">
                  <Link2 size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-purple-400" />
                  <input 
                    type="text" 
                    placeholder="Paste notion link, github repo, or drive folder..." 
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[color:var(--text-main)] font-medium rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-purple-500/50 transition-all shadow-[inset_6px_6px_12px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)]"
                  />
                </div>
              </div>

            </div>

            <div className="flex justify-between items-center pt-6 border-t border-[var(--border-color)]">
              <button 
                onClick={() => setShowCreate(false)}
                className="px-8 py-4 rounded-2xl font-bold text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => navigate('/os/dashboard')}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-[var(--bg-card)] shadow-[6px_6px_12px_var(--shadow-dark),-6px_-6px_12px_var(--shadow-light)] hover:shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] transition-all font-black text-cyan-400 active:scale-95"
              >
                Generate Workspace <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
