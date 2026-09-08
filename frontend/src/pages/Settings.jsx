import React, { useState, useRef } from 'react';
import { Settings as SettingsIcon, Palette, Target, DownloadCloud, UploadCloud, Database, Clock, Camera, CheckCircle2, AlertTriangle, Sparkles, Check } from 'lucide-react';
import { useTimer } from '../context/TimerContext';

export default function Settings() {
  const [themeMode, setThemeMode] = useState(localStorage.getItem('themeMode') || 'dark');
  const [themeStyle, setThemeStyle] = useState(localStorage.getItem('themeStyle') || 'glass');
  const [glassGradient, setGlassGradient] = useState(localStorage.getItem('glassGradient') || 'aurora');
  const [dailyGoal, setDailyGoal] = useState(4);
  const [backupStatus, setBackupStatus] = useState(null);
  const fileInputRef = useRef(null);

  const handleGlassGradientChange = (grad) => {
    setGlassGradient(grad);
    localStorage.setItem('glassGradient', grad);
    document.documentElement.setAttribute('data-glass-gradient', grad);
    window.dispatchEvent(new CustomEvent('studyos-glass-gradient-changed', { detail: { gradient: grad } }));
  };

  const {
    presenceEnabled,
    togglePresence,
    presenceIntervalSecs,
    setPresenceInterval,
    setTimerMode
  } = useTimer();

  const [durations, setDurations] = useState(() => {
    try {
      const saved = localStorage.getItem('studyos_timer_durations');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return { pomodoro: 25, focus: 50, short_break: 5, long_break: 15 };
  });

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

  const handleQuickTheme = (style, mode) => {
    handleStyleChange(style);
    handleModeChange(mode);
  };

  const handleDurationChange = (modeKey, valueMinutes) => {
    const mins = Math.max(1, parseInt(valueMinutes, 10) || 1);
    const updated = { ...durations, [modeKey]: mins };
    setDurations(updated);
    localStorage.setItem('studyos_timer_durations', JSON.stringify(updated));
    setTimerMode(modeKey, mins);
  };

  // Export JSON backup of all Omnidesk BD local storage
  const handleExportBackup = () => {
    try {
      const backupData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        settings: {
          themeMode,
          themeStyle,
          glassGradient,
          dailyGoal,
          durations,
          presenceIntervalSecs,
          presenceEnabled
        },
        storage: { ...localStorage }
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `studyos-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setBackupStatus({ type: 'success', text: 'Backup exported successfully!' });
      setTimeout(() => setBackupStatus(null), 4000);
    } catch (err) {
      setBackupStatus({ type: 'error', text: 'Failed to export backup.' });
    }
  };

  // Import JSON backup
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        if (parsed.storage) {
          Object.keys(parsed.storage).forEach((key) => {
            localStorage.setItem(key, parsed.storage[key]);
          });
        }
        if (parsed.settings) {
          if (parsed.settings.themeMode) handleModeChange(parsed.settings.themeMode);
          if (parsed.settings.themeStyle) handleStyleChange(parsed.settings.themeStyle);
          if (parsed.settings.glassGradient) handleGlassGradientChange(parsed.settings.glassGradient);
        }
        setBackupStatus({ type: 'success', text: 'Backup restored! Reloading...' });
        setTimeout(() => window.location.reload(), 1200);
      } catch (err) {
        setBackupStatus({ type: 'error', text: 'Invalid JSON backup file.' });
      }
    };
    reader.readAsText(file);
  };

  const handleFactoryReset = () => {
    if (window.confirm('Are you sure you want to reset Omnidesk BD? All local data and history will be cleared.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-canvas)] text-[color:var(--text-main)] overflow-y-auto p-4 md:p-10 gap-8">
      
      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center gap-2 w-full max-w-4xl mx-auto mb-2">
        <h1 className="text-3xl md:text-4xl font-black tracking-wide flex items-center justify-center gap-3">
          <SettingsIcon className="text-cyan-400" size={36} />
          System Configuration & Preferences
        </h1>
        <p className="text-[color:var(--text-muted)] font-medium text-sm md:text-base">
          Configure 3D themes, camera presence snapshot intervals, timer defaults, and local data persistence.
        </p>
      </div>

      {backupStatus && (
        <div className={`max-w-5xl mx-auto w-full p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${
          backupStatus.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'
        }`}>
          {backupStatus.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
          <span>{backupStatus.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto w-full">
        
        {/* Theme & Visual System */}
        <section className="p-6 md:p-8 rounded-[32px] bg-[var(--bg-card)] shadow-[var(--card-shadow)] border border-[var(--border-color)] flex flex-col gap-6">
          <h2 className="text-xl font-bold text-[color:var(--text-main)] flex items-center gap-3 pb-2 border-b border-[var(--border-color)]">
            <Palette className="text-purple-400" size={24} />
            6-Theme Visual Engine
          </h2>

          {/* Quick Theme Presets */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--text-muted)]">Active Theme Combination</span>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { style: 'glass', mode: 'dark', label: 'Glass Dark (iOS)', color: 'border-cyan-400 text-cyan-300 bg-cyan-950/30' },
                { style: 'glass', mode: 'light', label: 'Glass Light', color: 'border-cyan-500 text-cyan-700 bg-cyan-50' },
                { style: 'clay', mode: 'dark', label: 'Clay Graphite', color: 'border-orange-400 text-orange-300 bg-orange-950/30' },
                { style: 'clay', mode: 'light', label: 'Clay Marshmallow', color: 'border-orange-500 text-orange-700 bg-orange-50' },
                { style: 'current', mode: 'dark', label: 'Neumorphic Dark', color: 'border-indigo-400 text-indigo-300 bg-indigo-950/30' },
                { style: 'current', mode: 'light', label: 'Neumorphic Light', color: 'border-indigo-500 text-indigo-700 bg-indigo-50' }
              ].map((item) => {
                const isActive = themeStyle === item.style && themeMode === item.mode;
                return (
                  <button
                    key={`${item.style}-${item.mode}`}
                    onClick={() => handleQuickTheme(item.style, item.mode)}
                    className={`p-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border text-center ${
                      isActive
                        ? `${item.color} shadow-[0_0_15px_rgba(34,211,238,0.35)] ring-2 ring-cyan-400`
                        : 'bg-[var(--bg-input)] text-[color:var(--text-muted)] border-[var(--border-color)] hover:text-[color:var(--text-main)]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Glass Atmosphere Gradients (Exclusive to Glass Theme) */}
          {themeStyle === 'glass' && (
            <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--text-muted)] flex items-center gap-2">
                  <Sparkles className="text-cyan-400" size={14} /> Glass Atmosphere Gradient
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {glassGradient}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'aurora',
                    label: 'Cyber Aurora',
                    desc: 'Cyan & Violet',
                    previewClass: 'from-cyan-400 via-indigo-500 to-purple-600',
                    borderActive: 'border-cyan-400 ring-2 ring-cyan-400/50 bg-cyan-950/30'
                  },
                  {
                    id: 'sunset',
                    label: 'Sunset Radiant',
                    desc: 'Rose & Amber',
                    previewClass: 'from-pink-500 via-rose-500 to-amber-500',
                    borderActive: 'border-rose-400 ring-2 ring-rose-400/50 bg-rose-950/30'
                  },
                  {
                    id: 'emerald',
                    label: 'Emerald Nebula',
                    desc: 'Mint & Teal',
                    previewClass: 'from-emerald-400 via-teal-500 to-cyan-700',
                    borderActive: 'border-emerald-400 ring-2 ring-emerald-400/50 bg-emerald-950/30'
                  }
                ].map((grad) => {
                  const isActive = glassGradient === grad.id;
                  return (
                    <button
                      key={grad.id}
                      type="button"
                      onClick={() => handleGlassGradientChange(grad.id)}
                      className={`p-3 rounded-xl border flex flex-col gap-2 text-left transition-all cursor-pointer relative overflow-hidden ${
                        isActive
                          ? grad.borderActive
                          : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[color:var(--text-muted)]'
                      }`}
                    >
                      <div className={`h-2.5 w-full rounded-full bg-gradient-to-r ${grad.previewClass} shadow-sm`} />
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-[color:var(--text-main)] leading-tight">{grad.label}</div>
                          <div className="text-[10px] text-[color:var(--text-muted)] font-medium">{grad.desc}</div>
                        </div>
                        {isActive && (
                          <div className="p-1 rounded-full bg-cyan-400/20 text-cyan-300">
                            <Check size={12} />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Daily Goal Slider */}
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-[color:var(--text-muted)] flex items-center gap-2">
                <Target className="text-emerald-400" size={16} /> Daily Study Target
              </span>
              <span className="text-lg font-black text-emerald-400">{dailyGoal} Hours</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="12" 
              value={dailyGoal} 
              onChange={(e) => setDailyGoal(e.target.value)}
              className="w-full accent-emerald-400 h-2 bg-[var(--bg-card)] rounded-full cursor-pointer"
            />
          </div>
        </section>

        {/* Camera Presence & Verification */}
        <section className="p-6 md:p-8 rounded-[32px] bg-[var(--bg-card)] shadow-[var(--card-shadow)] border border-[var(--border-color)] flex flex-col gap-6">
          <h2 className="text-xl font-bold text-[color:var(--text-main)] flex items-center gap-3 pb-2 border-b border-[var(--border-color)]">
            <Camera className="text-cyan-400" size={24} />
            Face Presence Detection
          </h2>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]">
            <div className="flex flex-col">
              <span className="font-bold text-sm text-[color:var(--text-main)]">Autonomous Presence Check</span>
              <span className="text-xs text-[color:var(--text-muted)]">Pauses timer when you step away</span>
            </div>
            <button
              onClick={() => togglePresence()}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                presenceEnabled
                  ? 'bg-cyan-500 text-white border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-[var(--bg-card)] text-[color:var(--text-muted)] border-[var(--border-color)]'
              }`}
            >
              {presenceEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Verification Frequency Intervals */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--text-muted)]">Check Frequency</span>
              <span className="text-xs font-bold text-cyan-400">{presenceIntervalSecs}s intervals</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '5s (Default)', secs: 5 },
                { label: '30s', secs: 30 },
                { label: '60s', secs: 60 },
                { label: '5 Min', secs: 300 }
              ].map((intv) => (
                <button
                  key={intv.secs}
                  onClick={() => setPresenceInterval(intv.secs)}
                  className={`py-2 px-1 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer border text-center ${
                    presenceIntervalSecs === intv.secs
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'bg-[var(--bg-input)] text-[color:var(--text-muted)] border-[var(--border-color)] hover:text-[color:var(--text-main)]'
                  }`}
                >
                  {intv.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[color:var(--text-muted)] italic">
              * Privacy First: Camera opens for ~500ms to verify facial presence and immediately shuts off all hardware tracks and LED indicators.
            </p>
          </div>
        </section>

        {/* Timer Default Durations */}
        <section className="p-6 md:p-8 rounded-[32px] bg-[var(--bg-card)] shadow-[var(--card-shadow)] border border-[var(--border-color)] flex flex-col gap-6">
          <h2 className="text-xl font-bold text-[color:var(--text-main)] flex items-center gap-3 pb-2 border-b border-[var(--border-color)]">
            <Clock className="text-indigo-400" size={24} />
            Timer Duration Presets
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]">
              <label className="text-xs font-bold text-[color:var(--text-muted)] uppercase">Pomodoro (mins)</label>
              <input
                type="number"
                min="5"
                max="120"
                value={durations.pomodoro}
                onChange={(e) => handleDurationChange('pomodoro', e.target.value)}
                className="bg-transparent font-black text-xl text-cyan-400 outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]">
              <label className="text-xs font-bold text-[color:var(--text-muted)] uppercase">Deep Focus (mins)</label>
              <input
                type="number"
                min="10"
                max="180"
                value={durations.focus}
                onChange={(e) => handleDurationChange('focus', e.target.value)}
                className="bg-transparent font-black text-xl text-indigo-400 outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]">
              <label className="text-xs font-bold text-[color:var(--text-muted)] uppercase">Short Break (mins)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={durations.short_break}
                onChange={(e) => handleDurationChange('short_break', e.target.value)}
                className="bg-transparent font-black text-xl text-emerald-400 outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]">
              <label className="text-xs font-bold text-[color:var(--text-muted)] uppercase">Long Break (mins)</label>
              <input
                type="number"
                min="5"
                max="60"
                value={durations.long_break}
                onChange={(e) => handleDurationChange('long_break', e.target.value)}
                className="bg-transparent font-black text-xl text-purple-400 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Data Persistence & JSON Backup */}
        <section className="p-6 md:p-8 rounded-[32px] bg-[var(--bg-card)] shadow-[var(--card-shadow)] border border-[var(--border-color)] flex flex-col justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-[color:var(--text-main)] flex items-center gap-3 pb-2 border-b border-[var(--border-color)]">
              <Database className="text-orange-400" size={24} />
              Data Backup & Restore
            </h2>
            <p className="text-xs text-[color:var(--text-muted)] mt-2">
              Export your entire Study OS configuration, timer history, and study state to a portable JSON file, or restore from a previous save.
            </p>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json" 
            className="hidden" 
          />

          <div className="flex flex-col gap-3">
            <button
              onClick={handleExportBackup}
              className="w-full py-3.5 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 hover:text-white text-cyan-400 border border-cyan-500/30 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <DownloadCloud size={18} /> Export Backup (.json)
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3.5 px-4 rounded-xl bg-orange-500/10 hover:bg-orange-500 hover:text-white text-orange-400 border border-orange-500/30 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <UploadCloud size={18} /> Restore Backup (.json)
            </button>
          </div>

          <div className="pt-2 text-center border-t border-[var(--border-color)]">
            <button
              onClick={handleFactoryReset}
              className="text-xs font-bold uppercase tracking-wider text-red-400/80 hover:text-red-400 transition-colors cursor-pointer"
            >
              Danger: Factory Reset All Data
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
