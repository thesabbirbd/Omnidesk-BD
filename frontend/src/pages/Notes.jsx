import React, { useState } from 'react';
import { Search, Plus, Hash, Folder, Type, Bold, Italic, Link2, List, Save, Clock, ChevronRight } from 'lucide-react';

const mockNotes = [
  { id: 1, title: 'FastAPI Dependency Injection', preview: 'Dependency Injection is a pattern where...', topic: 'Backend Engineering', tags: ['fastapi', 'python'], time: '10:24 AM' },
  { id: 2, title: 'React Hooks Deep Dive', preview: 'Understanding useEffect dependencies...', topic: 'Frontend Support', tags: ['react', 'hooks'], time: 'Yesterday' },
  { id: 3, title: 'Docker vs VMs', preview: 'Containers share the host kernel while VMs...', topic: 'Containers & Automation', tags: ['docker', 'devops'], time: '2 days ago' },
];

export default function Notes() {
  const [activeNote, setActiveNote] = useState(mockNotes[0]);
  const [noteContent, setNoteContent] = useState(
    `# FastAPI Dependency Injection\n\nDependency Injection (DI) in FastAPI is incredibly powerful. It allows you to declare dependencies for your route handler functions.\n\n## Why use DI?\n- **Reusability**: Shared logic (database connections, auth) can be reused.\n- **Testing**: You can easily override dependencies in tests.\n\n\`\`\`python\nfrom fastapi import Depends, FastAPI\n\napp = FastAPI()\n\ndef get_db():\n    db = SessionLocal()\n    try:\n        yield db\n    finally:\n        db.close()\n\n@app.get("/users/")\ndef read_users(db: Session = Depends(get_db)):\n    return db.query(User).all()\n\`\`\``
  );

  return (
    <div className="flex flex-col xl:flex-row h-full w-full bg-[var(--bg-canvas)] text-[color:var(--text-main)] overflow-hidden p-6 md:p-8 gap-8">
      
      {/* Left Sidebar: Recent Notes */}
      <div className="xl:w-96 flex flex-col gap-6">
        <h1 className="text-3xl font-black tracking-wide flex items-center gap-3">
          <Type className="text-yellow-400" size={32} />
          Knowledge Base
        </h1>
        
        {/* Search & New */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Search notes..." 
              className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[color:var(--text-main)] rounded-2xl py-3 pl-11 pr-4 focus:outline-none focus:border-yellow-500/50 transition-all shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)] text-sm font-medium"
            />
          </div>
          <button className="p-3 bg-[var(--bg-card)] rounded-2xl shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] text-yellow-400 hover:shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] active:scale-95 transition-all">
            <Plus size={20} />
          </button>
        </div>

        {/* Note List */}
        <div className="flex flex-col gap-4 overflow-y-auto pr-2 pb-10">
          {mockNotes.map((note) => (
            <div 
              key={note.id}
              onClick={() => setActiveNote(note)}
              className={`p-5 rounded-[24px] cursor-pointer transition-all duration-300 border border-[var(--border-color)] flex flex-col gap-3 group ${
                activeNote.id === note.id
                  ? 'bg-[var(--bg-card)] shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)]'
                  : 'bg-[var(--bg-card)] shadow-[6px_6px_12px_var(--shadow-dark),-6px_-6px_12px_var(--shadow-light)] hover:translate-x-1'
              }`}
            >
              <div className="flex justify-between items-start">
                <h3 className={`font-bold text-lg line-clamp-1 ${activeNote.id === note.id ? 'text-yellow-400' : 'text-[color:var(--text-main)] group-hover:text-yellow-400'}`}>
                  {note.title}
                </h3>
                <ChevronRight size={16} className={`mt-1 ${activeNote.id === note.id ? 'text-yellow-400' : 'text-transparent'}`} />
              </div>
              <p className="text-sm text-[color:var(--text-muted)] line-clamp-2">{note.preview}</p>
              
              <div className="flex justify-between items-center mt-1">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-input)] shadow-[inset_1px_1px_3px_var(--shadow-dark),inset_-1px_-1px_3px_var(--shadow-light)] text-[10px] font-bold uppercase text-slate-500">
                  <Folder size={10} className="text-cyan-400" />
                  {note.topic}
                </div>
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1"><Clock size={12}/> {note.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col bg-[var(--bg-card)] rounded-[40px] shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)] border border-[var(--border-color)] overflow-hidden">
        
        {/* Editor Header */}
        <div className="px-10 pt-10 pb-6 flex flex-col gap-6 border-b border-[var(--border-color)]">
          <input 
            type="text" 
            value={activeNote.title}
            readOnly
            className="w-full bg-transparent border-none outline-none text-3xl font-bold text-[color:var(--text-main)] placeholder-slate-500"
            placeholder="Note Title..."
          />
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Topic Link */}
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-card)] shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] hover:shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] transition-all text-sm font-bold text-cyan-400 active:scale-95">
                <Folder size={16} /> {activeNote.topic}
              </button>
              
              {/* Tags */}
              {activeNote.tags.map(tag => (
                <div key={tag} className="flex items-center gap-1 px-4 py-2 rounded-full bg-[var(--bg-input)] shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] border border-[var(--border-color)] text-xs font-bold text-pink-400 lowercase">
                  <Hash size={12} /> {tag}
                </div>
              ))}
              <button className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--bg-card)] shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] text-[color:var(--text-muted)] hover:text-pink-400 hover:shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] transition-all">
                <Plus size={14} />
              </button>
            </div>
            
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--bg-card)] shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] hover:shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] transition-all text-sm font-bold text-yellow-400 active:scale-95">
              <Save size={16} /> Save Note
            </button>
          </div>
        </div>

        {/* Editor Toolbar */}
        <div className="px-10 py-4 flex gap-4 border-b border-[var(--border-color)] bg-[var(--bg-input)]/30">
          {[Bold, Italic, Link2, List, Type].map((Icon, idx) => (
            <button key={idx} className="p-2.5 rounded-xl bg-[var(--bg-card)] shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] hover:shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] active:scale-95 transition-all">
              <Icon size={16} />
            </button>
          ))}
        </div>

        {/* Debossed Markdown Area */}
        <div className="flex-1 p-8 bg-[var(--bg-panel)]">
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className="w-full h-full bg-[#070b14] rounded-3xl p-8 text-[color:var(--text-main)] font-mono text-sm leading-relaxed outline-none border border-[var(--border-color)] shadow-[inset_6px_6px_12px_rgba(0,0,0,0.8),inset_-2px_-2px_6px_rgba(255,255,255,0.03)] resize-none"
            placeholder="Start writing markdown..."
          />
        </div>

      </div>
    </div>
  );
}
