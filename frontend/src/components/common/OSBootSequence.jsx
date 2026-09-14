import React, { useState, useEffect } from 'react';
import { Sparkles, Terminal, Volume2, VolumeX, X } from 'lucide-react';
import { soundEngine } from '../../utils/audioSynth';

export default function OSBootSequence({ onComplete, forcePlay = false }) {
  const [stage, setStage] = useState(0); // 0: warming up, 1: kernel loading, 2: operational
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(soundEngine.isSoundEnabled());

  useEffect(() => {
    // Check if already booted in this session (unless forcePlay is requested)
    if (!forcePlay && sessionStorage.getItem('studyos_booted')) {
      if (onComplete) onComplete();
      return;
    }

    // Trigger futuristic audio and warm voice
    const timerAudio = setTimeout(() => {
      soundEngine.triggerBootAudio();
    }, 250);

    // Sequence timelines
    const t1 = setTimeout(() => setStage(1), 1100);
    const t2 = setTimeout(() => setStage(2), 2200);
    const t3 = setTimeout(() => {
      setIsFadingOut(true);
    }, 3200);
    const t4 = setTimeout(() => {
      sessionStorage.setItem('studyos_booted', 'true');
      if (onComplete) onComplete();
    }, 3900);

    return () => {
      clearTimeout(timerAudio);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [forcePlay, onComplete]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      sessionStorage.setItem('studyos_booted', 'true');
      if (onComplete) onComplete();
    }, 500);
  };

  const toggleSound = (e) => {
    e.stopPropagation();
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEngine.setSoundEnabled(next);
  };

  return (
    <div 
      onClick={handleSkip}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/70 backdrop-blur-2xl text-slate-800 select-none transition-opacity duration-[800ms] cursor-pointer overflow-hidden ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Light Glassmorphism backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-[100px] pointer-events-none animate-pulse duration-1000" />
      <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Controls: Sound toggle & Skip */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
        <button
          onClick={toggleSound}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/50 border border-white/60 shadow-sm text-slate-600 hover:text-cyan-600 text-xs font-bold backdrop-blur-xl transition-all hover:scale-105 hover:bg-white/80 hover:shadow-md"
          title={soundEnabled ? 'Mute System Audio' : 'Unmute System Audio'}
        >
          {soundEnabled ? <Volume2 size={16} className="text-cyan-500" /> : <VolumeX size={16} className="text-slate-400" />}
          <span>{soundEnabled ? 'Audio ON' : 'Audio OFF'}</span>
        </button>
        <button
          onClick={handleSkip}
          className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-white/50 border border-white/60 shadow-sm text-slate-500 hover:text-slate-800 text-xs font-bold backdrop-blur-xl transition-all hover:scale-105 hover:bg-white/80 hover:shadow-md"
        >
          <span>Skip</span>
          <X size={14} />
        </button>
      </div>

      {/* Centerpiece: Glowing Logo & Orbital Loader */}
      <div className="flex flex-col items-center gap-10 z-10 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ transform: stage === 2 ? 'translateY(-10px)' : 'translateY(0)' }}>
        <div className="relative flex items-center justify-center">
          {/* Orbital Multi-Ring Glassmorphic Loader */}
          <div className="absolute -inset-12 rounded-full border-[1.5px] border-cyan-400/20 animate-[spin_10s_linear_infinite]" />
          <div className="absolute -inset-8 rounded-full border-[1.5px] border-dashed border-blue-400/30 animate-[spin_6s_linear_infinite_reverse]" />
          <div className="absolute -inset-4 rounded-full border border-purple-400/20 animate-ping [animation-duration:3s]" />

          {/* Logo Container with 3D Glassmorphism drop shadow */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-[2.5rem] bg-white/60 border border-white/80 p-6 shadow-[0_20px_60px_-15px_rgba(6,182,212,0.3),inset_0_2px_10px_rgba(255,255,255,1)] flex items-center justify-center overflow-hidden animate-in zoom-in-75 duration-700 backdrop-blur-md transition-all hover:scale-105">
            <img 
              src="/omnidesk-mark.png" 
              alt="Omnidesk BD" 
              className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.1)] filter brightness-95"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/10 via-transparent to-blue-400/10 pointer-events-none" />
          </div>
        </div>

        {/* System Title */}
        <div className="flex flex-col items-center text-center gap-2">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 drop-shadow-sm transition-all duration-700" style={{ opacity: stage >= 1 ? 1 : 0, transform: stage >= 1 ? 'translateY(0)' : 'translateY(10px)' }}>
            Omnidesk BD
          </h1>
          <p className="text-xs sm:text-sm font-bold tracking-widest text-slate-500/80 uppercase transition-all duration-700 delay-100" style={{ opacity: stage >= 1 ? 1 : 0, transform: stage >= 1 ? 'translateY(0)' : 'translateY(10px)' }}>
            Advanced Cognitive Workspace
          </p>
        </div>

        {/* Smooth Glassmorphic Progress Bar */}
        <div className="flex flex-col items-center gap-4 w-72 sm:w-96 transition-all duration-700 delay-200" style={{ opacity: stage >= 1 ? 1 : 0 }}>
          <div className="w-full h-2.5 bg-white/40 rounded-full overflow-hidden p-0.5 border border-white/60 shadow-inner relative backdrop-blur-md">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                width: stage === 0 ? '15%' : stage === 1 ? '65%' : '100%'
              }}
            />
          </div>

          {/* Real-time Status Text */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 tracking-wide">
            <span className={`w-2 h-2 rounded-full transition-colors duration-300 ${stage === 2 ? 'bg-indigo-500' : 'bg-cyan-500 animate-pulse'}`} />
            {stage === 0 && <span>SYSTEM WARMUP...</span>}
            {stage === 1 && <span>LOADING COGNITIVE ENGINE...</span>}
            {stage === 2 && <span className="text-indigo-600">WORKSPACE READY</span>}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-8 flex flex-col items-center gap-1.5 text-[11px] font-bold text-slate-400/80 z-10 transition-opacity duration-1000 delay-300" style={{ opacity: stage >= 1 ? 1 : 0 }}>
        <span>v1.2.9 • Motion Graphics Engine • Glassmorphism UI</span>
        <span className="text-cyan-600/70">Click anywhere to skip</span>
      </div>
    </div>
  );
}
