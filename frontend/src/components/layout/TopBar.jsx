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
  Check,
  Menu,
  Sparkles,
  Bug,
  Terminal,
  CloudOff,
  RefreshCw
} from 'lucide-react';
import { useTimer } from '../../context/TimerContext';
import NotificationCenterModal from '../notifications/NotificationCenterModal';
import UserProfileModal from '../profile/UserProfileModal';
import { offlineSyncService } from '../../services/offlineSync';

export default function TopBar({ onToggleSidebar = () => {} }) {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const { notificationsList = [] } = useTimer();
  
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('themeMode') || 'dark');
  const [themeStyle, setThemeStyle] = useState(() => localStorage.getItem('themeStyle') || 'current');
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 3 Glass Gradient Background Options: aurora | sunset | emerald
  const [glassGradient, setGlassGradient] = useState(() => {
    const saved = localStorage.getItem('glassGradient') || 'aurora';
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-glass-gradient', saved);
    }
    return saved;
  });

  const handleGlassGradientChange = (grad) => {
    setGlassGradient(grad);
    localStorage.setItem('glassGradient', grad);
    document.documentElement.setAttribute('data-glass-gradient', grad);
    window.dispatchEvent(new CustomEvent('studyos-glass-gradient-changed', { detail: grad }));
  };

  // Modals for Notification Center & Profile
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Dynamic user profile state
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('studyos_user_profile');
      return saved ? JSON.parse(saved) : { name: 'Abdullah Al Sabbir', headline: 'Learner', avatarColor: 'from-cyan-600 to-blue-500' };
    } catch {
      return { name: 'Abdullah Al Sabbir', headline: 'Learner', avatarColor: 'from-cyan-600 to-blue-500' };
    }
  });

  // Listen for live profile updates
  useEffect(() => {
    const handleProfileUpdate = (e) => {
      if (e.detail) setUserProfile(e.detail);
    };
    window.addEventListener('studyos-profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('studyos-profile-updated', handleProfileUpdate);
  }, []);

  // Offline / Online sync status
  const [syncStatus, setSyncStatus] = useState({ 
    count: 0, 
    isSyncing: false, 
    online: typeof navigator !== 'undefined' ? navigator.onLine : true 
  });

  useEffect(() => {
    const handleSyncStatus = (e) => {
      if (e.detail) setSyncStatus(e.detail);
    };
    window.addEventListener('studyos-sync-status', handleSyncStatus);
    return () => window.removeEventListener('studyos-sync-status', handleSyncStatus);
  }, []);

  // Listen for external glass gradient changes (e.g. from Settings)
  useEffect(() => {
    const handleGradChange = (e) => {
      if (e.detail) setGlassGradient(e.detail);
    };
    window.addEventListener('studyos-glass-gradient-changed', handleGradChange);
    return () => window.removeEventListener('studyos-glass-gradient-changed', handleGradChange);
  }, []);

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

  const unreadNotificationsCount = notificationsList.filter((n) => !n.read).length;

  return (
    <header className="h-16 bg-[var(--bg-panel)] border-b border-[var(--border-color)] flex items-center justify-between px-3 sm:px-6 z-30 sticky top-0 shadow-[4px_4px_10px_var(--shadow-dark),-4px_-4px_10px_var(--shadow-light)] transition-colors duration-300">
      
      {/* Left: Mobile Toggle & Project Switcher Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Hamburger Menu Button (Mobile & Tablet) */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl bg-[var(--bg-card)] shadow-[3px_3px_6px_var(--shadow-dark),-3px_-3px_6px_var(--shadow-light)] active:shadow-[inset_2px_2px_4px_var(--shadow-dark)] text-[color:var(--text-muted)] hover:text-cyan-400 lg:hidden cursor-pointer transition-all shrink-0"
          title="Open Menu"
          aria-label="Open Menu"
        >
          <Menu size={18} />
        </button>

        {/* Project Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProjectMenu(!showProjectMenu)}
            className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-cyan-500/50 shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] transition-all cursor-pointer group"
            title="Switch Study Space"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse shrink-0" />
            <span className="text-xs font-bold text-[color:var(--text-main)] tracking-wide group-hover:text-cyan-400 transition-colors hidden sm:inline truncate max-w-[150px] md:max-w-[180px]">
              100-Day Backend → DevOps
            </span>
            <span className="text-xs font-bold text-[color:var(--text-main)] tracking-wide group-hover:text-cyan-400 sm:hidden">
              100-Day
            </span>
            <ChevronDown size={14} className={`text-[color:var(--text-muted)] transition-transform duration-200 shrink-0 ${showProjectMenu ? 'rotate-180' : ''}`} />
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
      </div>

      {/* Center: Search input */}
      <div className="relative flex-1 max-w-[180px] xs:max-w-xs sm:max-w-sm md:max-w-md mx-2 sm:mx-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]" />
        <input 
          ref={searchInputRef}
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchSubmit}
          placeholder="Search topics, notes..." 
          className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[color:var(--text-main)] text-xs font-medium rounded-xl py-2 pl-9 pr-12 sm:pr-14 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] placeholder:text-[color:var(--text-muted)] truncate"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden xs:flex items-center pointer-events-none">
          <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-bold text-[color:var(--text-muted)] bg-[var(--bg-card)] rounded border border-[var(--border-color)] shadow-[1px_1px_2px_var(--shadow-dark)]">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        
        {/* Quick Glass Gradient Switcher (Visible when Glass Theme is active) */}
        {themeStyle === 'glass' && (
          <div className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] shadow-inner">
            {[
              { id: 'aurora', label: 'Aurora', dot: 'bg-cyan-400', title: 'Cyber Aurora (Cyan / Indigo)' },
              { id: 'sunset', label: 'Sunset', dot: 'bg-rose-400', title: 'Sunset Radiant (Rose / Amber)' },
              { id: 'emerald', label: 'Emerald', dot: 'bg-emerald-400', title: 'Emerald Nebula (Mint / Teal)' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleGlassGradientChange(opt.id)}
                title={opt.title}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 ${
                  glassGradient === opt.id
                    ? 'bg-[var(--bg-card)] text-white shadow-[0_0_8px_rgba(255,255,255,0.2)]'
                    : 'text-[color:var(--text-muted)] hover:text-white opacity-70 hover:opacity-100'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${opt.dot} ${glassGradient === opt.id ? 'ring-1 ring-white scale-110' : ''}`} />
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Theme Engine Selector (Current / Glass / Clay) */}
        <div className="relative">
          <button
            onClick={() => setShowStyleMenu(!showStyleMenu)}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs font-bold text-[color:var(--text-muted)] hover:text-cyan-400 shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] transition-all cursor-pointer"
            title="Theme Engine (Neumorphism / Glassmorphism / Claymorphism)"
          >
            <Layers size={14} className="text-cyan-400 shrink-0" />
            <span className="capitalize hidden md:inline">{themeStyle}</span>
            <ChevronDown size={12} className={`transition-transform duration-150 ${showStyleMenu ? 'rotate-180' : ''}`} />
          </button>

          {showStyleMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[8px_8px_20px_var(--shadow-dark),-8px_-8px_20px_var(--shadow-light)] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
                Design Engine
              </div>
              {[
                { id: 'current', label: 'Neumorphism', desc: 'Debossed 3D Soft Light' },
                { id: 'glass', label: 'Glassmorphism', desc: 'Translucent Frosted Blur' },
                { id: 'clay', label: 'Claymorphism', desc: 'Soft Organic 3D' },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => {
                    setThemeStyle(style.id);
                    setShowStyleMenu(false);
                  }}
                  className={`w-full flex flex-col px-3 py-2 rounded-xl text-left transition-all mb-1 cursor-pointer ${
                    themeStyle === style.id
                      ? 'bg-[var(--bg-input)] text-cyan-400 shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] font-bold'
                      : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] hover:bg-[var(--bg-input)]'
                  }`}
                >
                  <span className="text-xs">{style.label}</span>
                  <span className="text-[10px] text-[color:var(--text-muted)]">{style.desc}</span>
                </button>
              ))}

              {/* Glass Gradient Sub-Options */}
              {themeStyle === 'glass' && (
                <div className="pt-2 border-t border-[var(--border-color)] mt-1 flex flex-col gap-1">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                    <Sparkles size={11} />
                    <span>Background Gradients</span>
                  </div>
                  {[
                    { id: 'aurora', label: 'Cyber Aurora', colors: 'from-cyan-400 to-indigo-500' },
                    { id: 'sunset', label: 'Sunset Radiant', colors: 'from-rose-400 to-amber-500' },
                    { id: 'emerald', label: 'Emerald Nebula', colors: 'from-emerald-400 to-teal-500' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        handleGlassGradientChange(opt.id);
                        setShowStyleMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                        glassGradient === opt.id 
                          ? 'bg-[var(--bg-input)] text-cyan-400 font-black' 
                          : 'text-[color:var(--text-muted)] hover:text-white hover:bg-[var(--bg-input)]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${opt.colors}`} />
                        <span>{opt.label}</span>
                      </div>
                      {glassGradient === opt.id && <Check size={13} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Light / Dark Mode Toggle Button */}
        <button 
          onClick={toggleThemeMode} 
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[var(--bg-card)] shadow-[3px_3px_6px_var(--shadow-dark),-3px_-3px_6px_var(--shadow-light)] active:shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] flex items-center justify-center text-[color:var(--text-muted)] hover:text-cyan-400 transition-all cursor-pointer shrink-0"
          title={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {themeMode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications Bell */}
        <button 
          onClick={() => setIsNotificationCenterOpen(true)}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[var(--bg-card)] shadow-[3px_3px_6px_var(--shadow-dark),-3px_-3px_6px_var(--shadow-light)] active:shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] hidden sm:flex items-center justify-center text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] transition-all relative cursor-pointer shrink-0"
          title="Open Notifications Center & Desktop Push"
        >
          <Bell size={16} />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.9)] animate-pulse" />
          )}
        </button>

        {/* Settings Shortcut */}
        <button 
          onClick={() => navigate('/os/settings')}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[var(--bg-card)] shadow-[3px_3px_6px_var(--shadow-dark),-3px_-3px_6px_var(--shadow-light)] active:shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] flex items-center justify-center text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] transition-all cursor-pointer shrink-0"
          title="Settings"
        >
          <Settings size={16} />
        </button>

        {/* DevOps Lab Terminal Launcher */}
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('studyos-launch-terminal', { detail: { topic: 'DevOps & Linux Shell' } }))}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/25 transition-all cursor-pointer text-xs font-bold shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
          title="Launch Browser DevOps Lab Shell (WebSocket PTY)"
        >
          <Terminal size={14} />
          <span className="hidden xl:inline">Launch Lab</span>
        </button>

        {/* Offline Sync Status Indicator */}
        {(!syncStatus.online || syncStatus.count > 0 || syncStatus.isSyncing) && (
          <button
            onClick={() => offlineSyncService.syncPending()}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 border ${
              syncStatus.isSyncing
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 animate-pulse'
                : !syncStatus.online
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}
            title={syncStatus.isSyncing ? 'Syncing mutations to backend...' : `${syncStatus.count} pending offline mutations. Click to sync.`}
          >
            {syncStatus.isSyncing ? (
              <RefreshCw size={11} className="animate-spin" />
            ) : !syncStatus.online ? (
              <CloudOff size={11} />
            ) : (
              <RefreshCw size={11} />
            )}
            <span className="hidden md:inline">
              {syncStatus.isSyncing ? 'Syncing...' : !syncStatus.online ? `Offline (${syncStatus.count})` : `Sync (${syncStatus.count})`}
            </span>
          </button>
        )}

        {/* "I'm Stuck" Debug Lab Shortcut */}
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('studyos-open-im-stuck'))}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 hover:text-orange-300 hover:bg-orange-500/25 transition-all cursor-pointer text-xs font-bold shrink-0 shadow-[0_0_10px_rgba(249,115,22,0.2)]"
          title="Open 'I'm Stuck' Debug Journal"
        >
          <Bug size={14} />
          <span className="hidden xl:inline">I'm Stuck</span>
        </button>

        {/* User Profile Badge */}
        <div 
          onClick={() => setIsProfileModalOpen(true)}
          className="flex items-center gap-2 pl-1.5 sm:pl-2 border-l border-[var(--border-color)] cursor-pointer group shrink-0"
          title="View & Edit Profile (Password Protected)"
        >
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr ${userProfile.avatarColor || 'from-cyan-600 to-blue-500'} text-white flex items-center justify-center text-xs font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform`}>
            {userProfile.name ? userProfile.name.charAt(0) : 'A'}
          </div>
          <div className="hidden xl:flex flex-col">
            <span className="text-xs font-bold text-[color:var(--text-main)] leading-none group-hover:text-cyan-400 transition-colors truncate max-w-[120px]">
              {userProfile.name || 'Abdullah'}
            </span>
            <span className="text-[10px] text-[color:var(--text-muted)] leading-tight truncate max-w-[120px]">
              {userProfile.headline || 'Learner'}
            </span>
          </div>
        </div>

      </div>

      {/* Interactive Modals */}
      <NotificationCenterModal 
        isOpen={isNotificationCenterOpen} 
        onClose={() => setIsNotificationCenterOpen(false)} 
      />

      <UserProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />

    </header>
  );
}
