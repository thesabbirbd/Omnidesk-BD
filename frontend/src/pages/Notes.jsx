import React, { useState, useRef } from 'react';
import { Search, Plus, Hash, Folder, Type, Bold, Italic, Link2, List, Save, Clock, ChevronRight, Check, Code, Trash2 } from 'lucide-react';

const initialNotes = [
  { 
    id: 1, 
    title: 'FastAPI Dependency Injection', 
    preview: 'Dependency Injection is a pattern where...', 
    topic: 'Backend Engineering', 
    tags: ['fastapi', 'python'], 
    time: '10:24 AM',
    content: `# FastAPI Dependency Injection\n\nDependency Injection (DI) in FastAPI is incredibly powerful. It allows you to declare dependencies for your route handler functions.\n\n## Why use DI?\n- **Reusability**: Shared logic (database connections, auth) can be reused.\n- **Testing**: You can easily override dependencies in tests.\n\n\`\`\`python\nfrom fastapi import Depends, FastAPI\n\napp = FastAPI()\n\ndef get_db():\n    db = SessionLocal()\n    try:\n        yield db\n    finally:\n        db.close()\n\n@app.get("/users/")\ndef read_users(db: Session = Depends(get_db)):\n    return db.query(User).all()\n\`\`\``
  },
  { 
    id: 2, 
    title: 'React Hooks Deep Dive', 
    preview: 'Understanding useEffect dependencies...', 
    topic: 'Frontend Support', 
    tags: ['react', 'hooks'], 
    time: 'Yesterday',
    content: `# React Hooks Deep Dive\n\nUnderstanding useEffect dependencies and memoization strategies in modern React.\n\n- Use \`useCallback\` for passing callbacks to optimized child components\n- Use \`useMemo\` for expensive computations\n- Clean up timers and event listeners in return callback`
  },
  { 
    id: 3, 
    title: 'Docker vs VMs', 
    preview: 'Containers share the host kernel while VMs...', 
    topic: 'Containers & Automation', 
    tags: ['docker', 'devops'], 
    time: '2 days ago',
    content: `# Docker Containers vs Virtual Machines\n\n- **Containers**: Share host OS kernel, lightweight (MBs), start in seconds.\n- **Virtual Machines**: Hypervisor runs guest OS, heavy (GBs), full hardware virtualization.`
  },
];

export default function Notes() {
  const [notes, setNotes] = useState(initialNotes);
  const [activeNoteId, setActiveNoteId] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveStatus, setSaveStatus] = useState(false);
  const textareaRef = useRef(null);

  const activeNote = notes.find(n => n.id === activeNoteId) || notes[0] || {
    id: 0,
    title: 'New Note',
    preview: '',
    topic: 'General',
    tags: [],
    time: 'Now',
    content: ''
  };

  const handleTitleChange = (newTitle) => {
    setNotes(prev => prev.map(n => n.id === activeNote.id ? { ...n, title: newTitle } : n));
  };

  const handleContentChange = (newContent) => {
    const lines = newContent.split('\n').filter(l => l.trim() && !l.startsWith('#'));
    const preview = lines[0] ? lines[0].slice(0, 80) + '...' : 'Empty note';
    setNotes(prev => prev.map(n => n.id === activeNote.id ? { ...n, content: newContent, preview } : n));
  };

  const handleSave = () => {
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2000);
  };

  const handleCreateNote = () => {
    const newId = Date.now();
    const newNote = {
      id: newId,
      title: 'Untitled Note',
      preview: 'Start typing here...',
      topic: 'Omnidesk Notes',
      tags: ['draft'],
      time: 'Just now',
      content: '# Untitled Note\n\nStart writing your thoughts, documentation, or study notes here...'
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newId);
  };

  const handleDeleteNote = (id, e) => {
    e.stopPropagation();
    if (notes.length <= 1) return;
    const remaining = notes.filter(n => n.id !== id);
    setNotes(remaining);
    if (activeNoteId === id) {
      setActiveNoteId(remaining[0].id);
    }
  };

  const insertFormatting = (prefix, suffix = '') => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = activeNote.content || '';
    const selected = currentText.substring(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    const updated = currentText.substring(0, start) + replacement + currentText.substring(end);

    handleContentChange(updated);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected ? selected.length : 4));
    }, 50);
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col xl:flex-row h-full w-full bg-[var(--bg-canvas)] text-[color:var(--text-main)] overflow-hidden p-6 md:p-8 gap-8">
      
      {/* Left Sidebar: Recent Notes */}
      <div className="xl:w-96 flex flex-col gap-6 shrink-0">
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[color:var(--text-main)] rounded-2xl py-3 pl-11 pr-4 focus:outline-none focus:border-yellow-500/50 transition-all shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] text-sm font-medium placeholder-[color:var(--text-muted)]"
            />
          </div>
          <button 
            onClick={handleCreateNote}
            title="Create New Note"
            className="p-3 bg-[var(--bg-card)] rounded-2xl shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] text-yellow-400 hover:shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Note List */}
        <div className="flex flex-col gap-4 overflow-y-auto pr-2 pb-10 max-h-[calc(100vh-250px)]">
          {filteredNotes.map((note) => (
            <div 
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              className={`p-5 rounded-[24px] cursor-pointer transition-all duration-300 border border-[var(--border-color)] flex flex-col gap-3 group relative ${
                activeNote.id === note.id
                  ? 'bg-[var(--bg-card)] shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)] ring-1 ring-yellow-400/30'
                  : 'bg-[var(--bg-card)] shadow-[6px_6px_12px_var(--shadow-dark),-6px_-6px_12px_var(--shadow-light)] hover:translate-x-1'
              }`}
            >
              <div className="flex justify-between items-start">
                <h3 className={`font-bold text-lg line-clamp-1 pr-6 ${activeNote.id === note.id ? 'text-yellow-400' : 'text-[color:var(--text-main)] group-hover:text-yellow-400'}`}>
                  {note.title}
                </h3>
                <div className="flex items-center gap-1">
                  {notes.length > 1 && (
                    <button 
                      onClick={(e) => handleDeleteNote(note.id, e)}
                      title="Delete note"
                      className="opacity-0 group-hover:opacity-100 hover:text-red-400 text-[color:var(--text-muted)] p-1 rounded-lg transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  <ChevronRight size={16} className={`${activeNote.id === note.id ? 'text-yellow-400' : 'text-transparent'}`} />
                </div>
              </div>
              <p className="text-sm text-[color:var(--text-muted)] line-clamp-2">{note.preview}</p>
              
              <div className="flex justify-between items-center mt-1">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-input)] shadow-[inset_1px_1px_3px_var(--shadow-dark),inset_-1px_-1px_3px_var(--shadow-light)] text-[10px] font-bold uppercase text-[color:var(--text-muted)]">
                  <Folder size={10} className="text-cyan-400" />
                  {note.topic}
                </div>
                <span className="text-xs font-semibold text-[color:var(--text-muted)] flex items-center gap-1">
                  <Clock size={12}/> {note.time}
                </span>
              </div>
            </div>
          ))}
          {filteredNotes.length === 0 && (
            <p className="text-center text-sm text-[color:var(--text-muted)] py-8">No notes found.</p>
          )}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col bg-[var(--bg-card)] rounded-[32px] md:rounded-[40px] shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)] border border-[var(--border-color)] overflow-hidden">
        
        {/* Editor Header */}
        <div className="px-6 md:px-10 pt-8 pb-6 flex flex-col gap-6 border-b border-[var(--border-color)]">
          <input 
            type="text" 
            value={activeNote.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-2xl md:text-3xl font-bold text-[color:var(--text-main)] placeholder-[color:var(--text-muted)] focus:ring-1 focus:ring-yellow-400/30 rounded-xl px-2 py-1 transition-all"
            placeholder="Note Title..."
          />
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Topic Link */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-card)] shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] text-sm font-bold text-cyan-400">
                <Folder size={16} /> {activeNote.topic}
              </div>
              
              {/* Tags */}
              {activeNote.tags.map(tag => (
                <div key={tag} className="flex items-center gap-1 px-4 py-2 rounded-full bg-[var(--bg-input)] shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] border border-[var(--border-color)] text-xs font-bold text-pink-400 lowercase">
                  <Hash size={12} /> {tag}
                </div>
              ))}
            </div>
            
            <button 
              onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--bg-card)] shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] hover:shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] transition-all text-sm font-bold active:scale-95 cursor-pointer ${
                saveStatus ? 'text-emerald-400 border border-emerald-400/30' : 'text-yellow-400'
              }`}
            >
              {saveStatus ? <Check size={16} /> : <Save size={16} />}
              {saveStatus ? 'Saved!' : 'Save Note'}
            </button>
          </div>
        </div>

        {/* Editor Toolbar */}
        <div className="px-6 md:px-10 py-3 flex flex-wrap items-center gap-3 border-b border-[var(--border-color)] bg-[var(--bg-input)]/40">
          <button 
            type="button"
            onClick={() => insertFormatting('**', '**')}
            title="Bold (**text**)"
            className="p-2.5 rounded-xl bg-[var(--bg-card)] shadow-[3px_3px_6px_var(--shadow-dark),-3px_-3px_6px_var(--shadow-light)] hover:shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] text-[color:var(--text-muted)] hover:text-yellow-400 active:scale-95 transition-all cursor-pointer"
          >
            <Bold size={16} />
          </button>
          <button 
            type="button"
            onClick={() => insertFormatting('*', '*')}
            title="Italic (*text*)"
            className="p-2.5 rounded-xl bg-[var(--bg-card)] shadow-[3px_3px_6px_var(--shadow-dark),-3px_-3px_6px_var(--shadow-light)] hover:shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] text-[color:var(--text-muted)] hover:text-yellow-400 active:scale-95 transition-all cursor-pointer"
          >
            <Italic size={16} />
          </button>
          <button 
            type="button"
            onClick={() => insertFormatting('[', '](https://)')}
            title="Link ([title](url))"
            className="p-2.5 rounded-xl bg-[var(--bg-card)] shadow-[3px_3px_6px_var(--shadow-dark),-3px_-3px_6px_var(--shadow-light)] hover:shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] text-[color:var(--text-muted)] hover:text-yellow-400 active:scale-95 transition-all cursor-pointer"
          >
            <Link2 size={16} />
          </button>
          <button 
            type="button"
            onClick={() => insertFormatting('\n- ')}
            title="List item (- text)"
            className="p-2.5 rounded-xl bg-[var(--bg-card)] shadow-[3px_3px_6px_var(--shadow-dark),-3px_-3px_6px_var(--shadow-light)] hover:shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] text-[color:var(--text-muted)] hover:text-yellow-400 active:scale-95 transition-all cursor-pointer"
          >
            <List size={16} />
          </button>
          <button 
            type="button"
            onClick={() => insertFormatting('\n## ')}
            title="Heading (## Title)"
            className="p-2.5 rounded-xl bg-[var(--bg-card)] shadow-[3px_3px_6px_var(--shadow-dark),-3px_-3px_6px_var(--shadow-light)] hover:shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] text-[color:var(--text-muted)] hover:text-yellow-400 active:scale-95 transition-all cursor-pointer"
          >
            <Type size={16} />
          </button>
          <button 
            type="button"
            onClick={() => insertFormatting('\n```\n', '\n```\n')}
            title="Code Block"
            className="p-2.5 rounded-xl bg-[var(--bg-card)] shadow-[3px_3px_6px_var(--shadow-dark),-3px_-3px_6px_var(--shadow-light)] hover:shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] text-[color:var(--text-muted)] hover:text-yellow-400 active:scale-95 transition-all cursor-pointer"
          >
            <Code size={16} />
          </button>
        </div>

        {/* Theme-Adaptive Markdown Writing Area */}
        <div className="flex-1 p-6 md:p-8 bg-[var(--bg-panel)] flex flex-col">
          <textarea
            ref={textareaRef}
            value={activeNote.content || ''}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full h-full min-h-[400px] bg-[var(--bg-input)] rounded-3xl p-6 md:p-8 text-[color:var(--text-main)] font-mono text-sm leading-relaxed outline-none border border-[var(--border-color)] shadow-[inset_2px_2px_6px_var(--shadow-dark),inset_-2px_-2px_6px_var(--shadow-light)] focus:border-yellow-500/50 resize-none transition-all placeholder-[color:var(--text-muted)]"
            placeholder="Start writing markdown notes here..."
          />
        </div>

      </div>
    </div>
  );
}
