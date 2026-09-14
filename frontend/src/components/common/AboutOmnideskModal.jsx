import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
  Sparkles, 
  X, 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Play, 
  ShieldCheck, 
  Terminal, 
  Cpu, 
  ExternalLink,
  Layers,
  Heart
} from 'lucide-react';
import { soundEngine } from '../../utils/audioSynth';

function GithubIcon({ size = 16, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}


export default function AboutOmnideskModal({ isOpen, onClose, onReplayBoot }) {
  const [soundEnabled, setSoundEnabled] = useState(soundEngine.isSoundEnabled());
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSoundEnabled(soundEngine.isSoundEnabled());
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEngine.setSoundEnabled(next);
  };

  const handleTestVoiceAndChime = () => {
    setIsPlayingAudio(true);
    soundEngine.triggerBootAudio(() => {
      setIsPlayingAudio(false);
    });
    setTimeout(() => setIsPlayingAudio(false), 3000);
  };

  const modalContent = (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200 select-none"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-3xl bg-[var(--bg-card)] border border-cyan-500/30 shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(34,211,238,0.2)] p-6 sm:p-8 flex flex-col gap-6 text-[color:var(--text-main)] select-text relative max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-[var(--bg-input)] text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] transition-colors"
              title="Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-wide text-[color:var(--text-main)]">About Omnidesk BD</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono text-[10px] font-bold border border-cyan-500/20">
                v1.2.9
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[var(--bg-input)] text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Center Hero: Logo with Glowing Aura */}
        <div className="flex flex-col items-center text-center gap-4 py-2">
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-cyan-500/30 via-indigo-500/20 to-teal-400/30 blur-xl opacity-75 animate-pulse" />
            <div className="relative w-24 h-24 rounded-3xl bg-slate-900 border border-cyan-400/50 p-3 shadow-[0_0_30px_rgba(34,211,238,0.4)] flex items-center justify-center">
              <img 
                src="/omnidesk-mark.png" 
                alt="Omnidesk BD" 
                className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-black uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-300">
              Omnidesk BD
            </h1>
            <p className="text-xs font-semibold text-[color:var(--text-muted)] tracking-wide mt-1">
              The Autonomous Cognitive Study & DevOps Operating System
            </p>
          </div>
        </div>

        {/* Audio & Boot Sequence Interactive Actions */}
        <div className="p-4 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSound}
              className={`p-2.5 rounded-xl border transition-all ${
                soundEnabled 
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20' 
                  : 'bg-[var(--bg-input)] text-slate-500 border-slate-700 hover:text-slate-300'
              }`}
              title={soundEnabled ? "Mute audio" : "Enable audio"}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            <div className="text-left">
              <p className="text-xs font-bold text-[color:var(--text-main)]">
                Futuristic Audio Synthesizer
              </p>
              <p className="text-[11px] text-[color:var(--text-muted)]">
                {soundEnabled ? "Audio & Studio Voice Enabled" : "Sound currently muted"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestVoiceAndChime}
              disabled={isPlayingAudio}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
            >
              <Play size={13} className={isPlayingAudio ? "animate-spin" : ""} />
              <span>{isPlayingAudio ? "Playing Voice..." : "Test Voice & Chime"}</span>
            </button>
            {onReplayBoot && (
              <button
                onClick={() => {
                  onClose();
                  onReplayBoot();
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all active:scale-95"
              >
                <Sparkles size={13} />
                <span>Replay Boot Sequence</span>
              </button>
            )}
          </div>
        </div>

        {/* System Capabilities & Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-color)] flex items-start gap-3">
            <Cpu size={18} className="text-cyan-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-[color:var(--text-main)]">Gemini AI Cognitive Engine</h4>
              <p className="text-[11px] text-[color:var(--text-muted)] mt-0.5">Syllabus generator with zero cost free-tier limits.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-color)] flex items-start gap-3">
            <Terminal size={18} className="text-teal-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-[color:var(--text-main)]">Native DevOps Lab Terminal</h4>
              <p className="text-[11px] text-[color:var(--text-muted)] mt-0.5">xterm.js + PTY WebSocket cloud shell container.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-color)] flex items-start gap-3">
            <ShieldCheck size={18} className="text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-[color:var(--text-main)]">Protected Project Deletion</h4>
              <p className="text-[11px] text-[color:var(--text-muted)] mt-0.5">Admin-protected project deletion safeguarding data.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-color)] flex items-start gap-3">
            <Layers size={18} className="text-purple-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-[color:var(--text-main)]">Dynamic Knowledge Graphs</h4>
              <p className="text-[11px] text-[color:var(--text-muted)] mt-0.5">Interactive mind maps reflecting real-time progress.</p>
            </div>
          </div>
        </div>

        {/* GitHub & Creator Footer */}
        <div className="pt-4 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-[color:var(--text-muted)]">
            <span>Engineered with</span>
            <Heart size={13} className="text-red-400 fill-red-400" />
            <span>by</span>
            <a 
              href="https://github.com/thesabbirbd" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-bold text-cyan-400 hover:underline flex items-center gap-1"
            >
              @thesabbirbd <ExternalLink size={11} />
            </a>
          </div>

          <a 
            href="https://github.com/thesabbirbd/Omnidesk-BD" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-panel)] border border-[var(--border-color)] hover:border-cyan-400/50 text-[color:var(--text-main)] font-semibold transition-all hover:scale-105"
          >
            <Github size={15} />
            <span>View GitHub Repository</span>
            <ExternalLink size={12} className="text-[color:var(--text-muted)]" />
          </a>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? ReactDOM.createPortal(modalContent, document.body)
    : null;
}
