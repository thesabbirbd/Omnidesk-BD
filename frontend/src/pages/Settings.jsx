import React, { useState } from 'react';
import { Settings as SettingsIcon, Palette, Target, Bot, DownloadCloud, UploadCloud, Database } from 'lucide-react';

export default function Settings() {
  const [themeMode, setThemeMode] = useState(localStorage.getItem('themeMode') || 'dark');
  const [themeStyle, setThemeStyle] = useState(localStorage.getItem('themeStyle') || 'current');
  const [dailyGoal, setDailyGoal] = useState(3);
  const [aiEnabled, setAiEnabled] = useState(true);

  // Sync with global theme (in case it's changed elsewhere, though TopBar also sets it)
  // For simplicity we rely on TopBar to set document attributes, but here we just update local storage and trigger a re-render/event if needed, or just set it here too.
  const handleModeChange = (mode) => {
    setThemeMode(mode);
    localStorage.setItem('themeMode', mode);
    document.documentElement.setAttribute('data-theme-mode', mode);
  };

  const handleStyleChange = (style) => {
    setThemeStyle(style);
    localStorage.setItem('themeStyle', style);
    document.documentElement.setAttribute('data-theme-style', style);
  };

  // Reusable Toggle Component
  const Toggle = ({ label, icon: Icon, state, setter, colorClass }) => (
    <div className="flex justify-between items-center p-6 bg-[var(--bg-input)] rounded-2xl shadow-[inset_2px_2px_6px_var(--shadow-dark),inset_-2px_-2px_6px_var(--shadow-light)]">
      <div className="flex items-center gap-4">
        <Icon className={colorClass} size={24} />
        <span className="font-bold text-[color:var(--text-main)]">{label}</span>
      </div>
      <button 
        onClick={() => setter(!state)}
        className={`relative w-16 h-8 rounded-full transition-all duration-300 flex items-center px-1 ${
          state 
            ? 'bg-cyan-500 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5),0_0_10px_rgba(34,211,238,0.5)]' 
            : 'bg-[var(--bg-card)] shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)]'
        }`}
      >
        <div className={`w-6 h-6 rounded-full bg-[var(--bg-card)] shadow-[2px_2px_4px_var(--shadow-dark),-2px_-2px_4px_var(--shadow-light)] transition-all duration-300 ${
          state ? 'translate-x-8' : 'translate-x-0'
        }`}></div>
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-canvas)] text-[color:var(--text-main)] overflow-y-auto p-6 md:p-10 gap-8">
      
      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center gap-2 w-full max-w-4xl mx-auto mb-6">
        <h1 className="text-3xl md:text-4xl font-black tracking-wide flex items-center justify-center gap-3">
          <SettingsIcon className="text-slate-400" size={36} />
          System Configuration
        </h1>
        <p className="text-[color:var(--text-muted)] font-medium">Manage preferences, goals, and backups.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto w-full">
        
        {/* Appearance & Goals */}
        <section className="p-8 md:p-10 rounded-[32px] overflow-hidden bg-[var(--bg-card)] shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col gap-6 overflow-hidden">
          <h2 className="text-2xl font-bold text-[color:var(--text-main)] flex items-center justify-center text-center w-full gap-3 mb-4">
            <Palette className="text-purple-400" size={28} />
            Preferences
          </h2>
          
          <Toggle label="Dark Mode" icon={Palette} state={themeMode === 'dark'} setter={(val) => handleModeChange(val ? 'dark' : 'light')} colorClass="text-purple-400" />
          
          <div className="flex flex-col gap-3 p-6 bg-[var(--bg-input)] rounded-2xl shadow-[inset_2px_2px_6px_var(--shadow-dark),inset_-2px_-2px_6px_var(--shadow-light)]">
            <span className="font-bold text-[color:var(--text-main)]">Theme Engine</span>
            <div className="flex gap-2 w-full">
              {['current', 'glass', 'clay'].map(style => (
                <button
                  key={style}
                  onClick={() => handleStyleChange(style)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    themeStyle === style
                      ? 'bg-[var(--bg-card)] text-purple-400 shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] border border-purple-500/30'
                      : 'bg-[var(--bg-card)] text-[color:var(--text-muted)] shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] hover:text-purple-300 active:scale-95'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col gap-4 p-6 bg-[var(--bg-input)] rounded-2xl shadow-[inset_2px_2px_6px_var(--shadow-dark),inset_-2px_-2px_6px_var(--shadow-light)]">
            <div className="flex items-center justify-center text-center gap-3 mb-2 w-full">
              <Target className="text-emerald-400" size={24} />
              <span className="font-bold text-[color:var(--text-main)]">Daily Study Goal (Hours)</span>
            </div>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="1" max="12" 
                value={dailyGoal} 
                onChange={(e) => setDailyGoal(e.target.value)}
                className="w-full accent-emerald-500 h-2 bg-[var(--bg-card)] rounded-full outline-none"
              />
              <span className="font-black text-xl text-emerald-400 w-8 text-right">{dailyGoal}h</span>
            </div>
          </div>

          <Toggle label="AI Assistance" icon={Bot} state={aiEnabled} setter={setAiEnabled} colorClass="text-sky-400" />
        </section>

        {/* Backup & Data Management */}
        <section className="p-8 md:p-10 rounded-[32px] overflow-hidden bg-[var(--bg-card)] shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col gap-6 overflow-hidden items-center">
          <h2 className="text-2xl font-bold text-[color:var(--text-main)] flex items-center justify-center text-center w-full gap-3 mb-2">
            <Database className="text-orange-400" size={28} />
            Data & Backup
          </h2>
          <p className="text-sm font-medium text-[color:var(--text-muted)] text-center max-w-sm mb-4">
            Export your entire Study OS database locally to keep your progress safe, or restore from a previous backup.
          </p>

          <div className="flex flex-col gap-5 w-full max-w-sm">
            <button className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-[var(--bg-card)] shadow-[4px_4px_10px_var(--shadow-dark),-4px_-4px_10px_var(--shadow-light)] hover:shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] transition-all font-bold text-cyan-400 active:scale-95 group">
              <DownloadCloud size={24} className="group-hover:animate-bounce" />
              Export Backup (.json)
            </button>
            
            <button className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-[var(--bg-card)] shadow-[4px_4px_10px_var(--shadow-dark),-4px_-4px_10px_var(--shadow-light)] hover:shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] transition-all font-bold text-orange-400 active:scale-95 group">
              <UploadCloud size={24} className="group-hover:-translate-y-1 transition-transform" />
              Restore Backup
            </button>
          </div>

          <div className="mt-auto pt-6 w-full text-center">
             <button className="text-xs font-bold uppercase tracking-wider text-red-500/80 hover:text-red-400 transition-colors">
               Danger: Factory Reset Data
             </button>
          </div>
        </section>

      </div>
    </div>
  );
}
