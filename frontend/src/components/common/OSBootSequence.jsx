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
    const t1 = setTimeout(() => setStage(1), 850);
    const t2 = setTimeout(() => setStage(2), 1900);
    const t3 = setTimeout(() => {
      setIsFadingOut(true);
    }, 2800);
    const t4 = setTimeout(() => {
      sessionStorage.setItem('studyos_booted', 'true');
      if (onComplete) onComplete();
    }, 3400);

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
    }, 300);
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
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 text-white select-none transition-opacity duration-700 cursor-pointer overflow-hidden ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Futuristic cybernetic backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.25),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c70d_1px,transparent_1px),linear-gradient(to_bottom,#0284c70d_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />

      {/* Top Controls: Sound toggle & Skip */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
        <button
          onClick={toggleSound}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:text-cyan-400 text-xs font-semibold backdrop-blur-md transition-all hover:scale-105"
          title={soundEnabled ? 'Mute System Audio' : 'Unmute System Audio'}
        >
          {soundEnabled ? <Volume2 size={15} className="text-cyan-400" /> : <VolumeX size={15} className="text-slate-500" />}
          <span>{soundEnabled ? 'Audio ON' : 'Audio OFF'}</span>
        </button>
        <button
          onClick={handleSkip}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-400 hover:text-white text-xs font-semibold backdrop-blur-md transition-all hover:scale-105"
        >
          <span>Skip</span>
          <X size={13} />
        </button>
      </div>

      {/* Centerpiece: Glowing Logo & Orbital Loader */}
      <div className="flex flex-col items-center gap-8 z-10">
        <div className="relative flex items-center justify-center">
          {/* Orbital Multi-Ring Glowing Cybernetic Loader */}
          <div className="absolute -inset-10 rounded-full border border-cyan-500/20 animate-spin [animation-duration:8s]" />
          <div className="absolute -inset-6 rounded-full border-2 border-dashed border-cyan-400/40 animate-spin [animation-duration:4s] [animation-direction:reverse]" />
          <div className="absolute -inset-2 rounded-full border border-teal-400/30 animate-ping [animation-duration:3s]" />

          {/* Logo Container with 3D drop shadow */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-slate-900/90 border border-cyan-400/40 p-4 shadow-[0_0_50px_rgba(34,211,238,0.35)] flex items-center justify-center overflow-hidden animate-in zoom-in-75 duration-500">
            <img 
              src="/omnidesk-mark.png" 
              alt="Omnidesk BD" 
              className="w-full h-full object-contain drop-shadow-[0_0_16px_rgba(34,211,238,0.8)] filter brightness-110"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-teal-400/20 pointer-events-none" />
          </div>
        </div>

        {/* System Title */}
        <div className="flex flex-col items-center text-center gap-2">
          <h1 className="text-3xl sm:text-4xl font-black tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-300 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
            Omnidesk BD
          </h1>
          <p className="text-xs sm:text-sm font-semibold tracking-wider text-slate-400 uppercase">
            Autonomous Cognitive Study & DevOps OS
          </p>
        </div>

        {/* Futuristic Cybernetic Buffering / Progress Bar */}
        <div className="flex flex-col items-center gap-3 w-72 sm:w-80">
          <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50 relative">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-300 rounded-full shadow-[0_0_12px_rgba(34,211,238,0.8)] transition-all duration-700 ease-out"
              style={{
                width: stage === 0 ? '25%' : stage === 1 ? '70%' : '100%'
              }}
            />
          </div>

          {/* Real-time Status Text */}
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 tracking-wide">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            {stage === 0 && <span>[ SYSTEM WARMING UP... ]</span>}
            {stage === 1 && <span>[ INITIALIZING COGNITIVE KERNEL... ]</span>}
            {stage === 2 && <span className="text-teal-300 font-bold">[ SYSTEM READY • WELCOME ]</span>}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-8 flex flex-col items-center gap-1 text-[11px] font-mono text-slate-500 z-10">
        <span>Omnidesk BD v1.2.9 • Architecture: Linux x86_64 / WebKit</span>
        <span className="text-slate-600">Click anywhere to launch instantly</span>
      </div>
    </div>
  );
}
