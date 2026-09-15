import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bot, Play, Folder, Activity, BookOpen, Settings, X, Plus } from 'lucide-react';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const actions = [
    { id: 'create-space', title: 'Create Study Space', icon: Plus, action: () => navigate('/os/dashboard'), category: 'Actions' },
    { id: 'open-ai', title: 'Open AI Assistant', icon: Bot, action: () => navigate('/os/ai-assistant'), category: 'Navigation' },
    { id: 'timer', title: 'Open Timer', icon: Play, action: () => navigate('/os/timer'), category: 'Navigation' },
    { id: 'dashboard', title: 'Dashboard', icon: Activity, action: () => navigate('/os/dashboard'), category: 'Navigation' },
    { id: 'materials', title: 'Materials', icon: BookOpen, action: () => navigate('/os/materials'), category: 'Navigation' },
    { id: 'projects', title: 'Projects', icon: Folder, action: () => navigate('/os/projects'), category: 'Navigation' },
    { id: 'settings', title: 'Settings', icon: Settings, action: () => navigate('/os/settings'), category: 'Navigation' },
  ];

  const filteredActions = actions.filter(a => a.title.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const executeAction = (action) => {
    action.action();
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filteredActions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filteredActions.length) % filteredActions.length);
    } else if (e.key === 'Enter' && filteredActions.length > 0) {
      e.preventDefault();
      executeAction(filteredActions[activeIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      
      <div className="relative w-full max-w-xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center px-4 py-3 border-b border-[var(--border-color)]">
          <Search size={20} className="text-[color:var(--text-muted)] mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search commands... (Ctrl+K)"
            className="flex-1 bg-transparent border-none outline-none text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] text-sm"
          />
          <button onClick={() => setIsOpen(false)} className="p-1 text-[color:var(--text-muted)] hover:text-rose-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredActions.length === 0 ? (
            <div className="p-8 text-center text-[color:var(--text-muted)] text-sm">
              No commands found.
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {filteredActions.map((action, idx) => {
                const Icon = action.icon;
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={action.id}
                    onClick={() => executeAction(action)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left transition-colors ${
                      isActive 
                        ? 'bg-cyan-500/10 text-cyan-400' 
                        : 'text-[color:var(--text-main)] hover:bg-[var(--bg-input)]'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-cyan-400' : 'text-[color:var(--text-muted)]'} />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{action.title}</span>
                      <span className="text-[10px] text-[color:var(--text-muted)] uppercase tracking-wider">{action.category}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
