import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  Moon, 
  Sun, 
  Settings, 
  ChevronDown, 
  Layers, 
  Check
} from 'lucide-react';

export default function TopBar() {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('themeMode') || 'dark');
  const [themeStyle, setThemeStyle] = useState(() => localStorage.getItem('themeStyle') || 'current');
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Apply theme attributes to documentElement
  useEffect(() => {
    document.documentElement.setAttribute('data-theme-mode', themeMode);
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme-style', themeStyle);
    localStorage.setItem('themeStyle', themeStyle);
  }, [themeStyle]);

  // Keyboard shortcut for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleThemeMode = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/os/topics?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-[var(--bg-panel)] border-b border-[var(--border-color)] flex items-center justify-between px-6 z-30 sticky top-0 shadow-[4px_4px_10px_var(--shadow-dark),-4px_-4px_10px_var(--shadow-light)] transition-colors duration-300">
      
      {/* Left: Project Switcher Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowProjectMenu(!showProjectMenu)}
          className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-cyan-500/50 shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] transition-all cursor-pointer group"
          title="Switch Study Space"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
          <span className="text-xs font-bold text-[color:var(--text-main)] tracking-wide group-hover:text-cyan-400 transition-colors">
            100-Day Backend → DevOps
          </span>
          <ChevronDown size={14} className={`text-[color:var(--text-muted)] transition-transform duration-200 ${showProjectMenu ? 'rotate-180' : ''}`} />
        </button>

        {showProjectMenu && (
          <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[8px_8px_20px_var(--shadow-dark),-8px_-8px_20px_var(--shadow-light)] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
              Active Spaces
            </div>
            <button
              onClick={() => {
                setShowProjectMenu(false);
                navigate('/os/dashboard');
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-bold text-cyan-400 bg-[var(--bg-input)] shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] mb-1"
            >
              <span>100-Day Backend → DevOps</span>
              <Check size={14} />
            </button>
            <button
              onClick={() => {
                setShowProjectMenu(false);
                navigate('/');
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-medium text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] hover:bg-[var(--bg-input)] transition-all"
            >
              <span>Switch / All Spaces</span>
              <span className="text-[10px] uppercase font-bold text-slate-500">Go to Home</span>
            </button>
          </div>
        )}
      </div>

      {/* Center: Search input */}
      <div className="relative w-80 md:w-96">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]" />
        <input 
          ref={searchInputRef}
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchSubmit}
          placeholder="Search topics, notes, commands... (Ctrl + K)" 
          className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[color:var(--text-main)] text-xs font-medium rounded-xl py-2 pl-10 pr-16 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] placeholder:text-[color:var(--text-muted)]"
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold text-[color:var(--text-muted)] bg-[var(--bg-card)] rounded border border-[var(--border-color)] shadow-[1px_1px_2px_var(--shadow-dark)]">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        
        {/* Theme Engine Selector (Current / Glass / Clay) */}
        <div className="relative">
          <button
            onClick={() => setShowStyleMenu(!showStyleMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs font-bold text-[color:var(--text-muted)] hover:text-cyan-400 shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] transition-all cursor-pointer"
            title="Theme Engine (Neumorphism / Glassmorphism / Claymorphism)"
          >
            <Layers size={14} className="text-cyan-400" />
            <span className="capitalize">{themeStyle}</span>
            <ChevronDown size={12} className={`transition-transform duration-150 ${showStyleMenu ? 'rotate-180' : ''}`} />
          </button>

          {showStyleMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[8px_8px_20px_var(--shadow-dark),-8px_-8px_20px_var(--shadow-light)] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
                Design Engine
              </div>
              {[
                { id: 'current', label: 'Neumorphism', desc: 'Debossed 3D Soft Light' },
                { id: 'glass', label: 'Glassmorphism', desc: 'Translucent Blur' },
                { id: 'clay', label: 'Claymorphism', desc: 'Soft Organic 3D' },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => {
                    setThemeStyle(style.id);
                    setShowStyleMenu(false);
                  }}
                  className={`w-full flex flex-col px-3 py-2 rounded-xl text-left transition-all mb-1 ${
                    themeStyle === style.id
                      ? 'bg-[var(--bg-input)] text-cyan-400 shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] font-bold'
                      : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] hover:bg-[var(--bg-input)]'
                  }`}
                >
                  <span className="text-xs">{style.label}</span>
                  <span className="text-[10px] text-[color:var(--text-muted)]">{style.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Light / Dark Mode Toggle Button */}
        <button 
          onClick={toggleThemeMode} 
          className="w-9 h-9 rounded-xl bg-[var(--bg-card)] shadow-[3px_3px_6px_var(--shadow-dark),-3px_-3px_6px_var(--shadow-light)] active:shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] flex items-center justify-center text-[color:var(--text-muted)] hover:text-cyan-400 transition-all cursor-pointer"
          title={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {themeMode === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications Bell */}
        <button 
          className="w-9 h-9 rounded-xl bg-[var(--bg-card)] shadow-[3px_3px_6px_var(--shadow-dark),-3px_-3px_6px_var(--shadow-light)] active:shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] flex items-center justify-center text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] transition-all relative cursor-pointer"
          title="Notifications"
        >
          <Bell size={17} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
        </button>

        {/* Settings Shortcut */}
        <button 
          onClick={() => navigate('/os/settings')}
          className="w-9 h-9 rounded-xl bg-[var(--bg-card)] shadow-[3px_3px_6px_var(--shadow-dark),-3px_-3px_6px_var(--shadow-light)] active:shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] flex items-center justify-center text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] transition-all cursor-pointer"
          title="Settings"
        >
          <Settings size={17} />
        </button>

        {/* User Profile Badge */}
        <div 
          onClick={() => navigate('/os/settings')}
          className="flex items-center gap-2 pl-2 border-l border-[var(--border-color)] cursor-pointer group"
          title="User Profile"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 text-white flex items-center justify-center text-xs font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform">
            A
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="text-xs font-bold text-[color:var(--text-main)] leading-none group-hover:text-cyan-400 transition-colors">
              Abdullah
            </span>
            <span className="text-[10px] text-[color:var(--text-muted)] leading-tight">
              Learner
            </span>
          </div>
        </div>

      </div>
    </header>
  );
}
