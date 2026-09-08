import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  X 
} from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import FloatingTimer from '../timer/FloatingTimer';
import ImStuckModal from '../debug/ImStuckModal';
import DevOpsTerminalModal from '../terminal/DevOpsTerminalModal';
import { useTimer } from '../../context/TimerContext';

export default function AppShell() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { lastNotification, clearNotification } = useTimer();

  // Active Glass Gradient state (aurora | sunset | emerald)
  const [glassGradient, setGlassGradient] = useState(() => {
    const saved = localStorage.getItem('glassGradient') || 'aurora';
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-glass-gradient', saved);
    }
    return saved;
  });

  // Listen for dynamic glass gradient changes
  useEffect(() => {
    const handleGradientChange = (e) => {
      if (e.detail) {
        setGlassGradient(e.detail);
        document.documentElement.setAttribute('data-glass-gradient', e.detail);
        localStorage.setItem('glassGradient', e.detail);
      }
    };
    window.addEventListener('studyos-glass-gradient-changed', handleGradientChange);
    return () => window.removeEventListener('studyos-glass-gradient-changed', handleGradientChange);
  }, []);

  // Auto-dismiss global notifications after 4.5 seconds
  useEffect(() => {
    if (lastNotification) {
      const timer = setTimeout(() => {
        clearNotification();
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [lastNotification, clearNotification]);

  return (
    <div className="flex h-screen w-full bg-[var(--bg-canvas)] text-[color:var(--text-main)] font-sans overflow-hidden">
      {/* Responsive Sidebar Drawer */}
      <Sidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={() => setIsMobileSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden relative min-w-0">
        <TopBar 
          onToggleSidebar={() => setIsMobileSidebarOpen((prev) => !prev)} 
        />
        
        {/* Global OS Toast Notification Banner (Visible across ALL routes) */}
        {lastNotification && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-2xl border border-cyan-400/50 shadow-[0_12px_36px_rgba(0,0,0,0.6),0_0_20px_rgba(34,211,238,0.3)] animate-in fade-in slide-in-from-top-4 duration-300 max-w-md w-auto select-none">
            <div className="shrink-0">
              {lastNotification.type === 'complete' && <Sparkles size={18} className="text-emerald-400" />}
              {lastNotification.type === 'start' && <Play size={16} fill="currentColor" className="text-cyan-400" />}
              {lastNotification.type === 'pause' && <Pause size={16} fill="currentColor" className="text-amber-400" />}
              {lastNotification.type === 'absence' && <AlertCircle size={18} className="text-red-400 animate-pulse" />}
              {lastNotification.type === 'warning' && <AlertCircle size={18} className="text-amber-400" />}
              {(!lastNotification.type || lastNotification.type === 'info') && <CheckCircle2 size={18} className="text-cyan-400" />}
            </div>

            <div className="flex flex-col min-w-0">
              {lastNotification.title && (
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                  {lastNotification.title}
                </span>
              )}
              <span className="text-xs font-bold text-white leading-snug">
                {lastNotification.message}
              </span>
            </div>

            <button
              onClick={clearNotification}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer ml-1.5"
              title="Dismiss Notification"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* Main Viewport Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 relative">
          {/* Ambient Lighting & 3D Objects dynamically tailored to the active Glass Gradient option */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
            
            {/* OPTION 1: CYBER AURORA AMBIENT MESH */}
            {glassGradient === 'aurora' && (
              <>
                <div className="absolute top-10 left-1/4 w-[520px] h-[520px] bg-cyan-500/25 dark:bg-cyan-500/20 rounded-full blur-[110px]" />
                <div className="absolute top-1/2 right-1/4 w-[560px] h-[560px] bg-indigo-500/25 dark:bg-indigo-500/20 rounded-full blur-[120px]" />
                <div className="absolute -bottom-20 left-1/3 w-[460px] h-[460px] bg-purple-500/20 dark:bg-purple-500/18 rounded-full blur-[110px]" />
                <div className="absolute top-1/4 -left-20 w-[420px] h-[420px] bg-blue-500/20 dark:bg-blue-500/15 rounded-full blur-[100px]" />

                {/* 3D Cyan & Blue Floating Objects */}
                <div className="absolute top-20 left-1/3 w-28 h-28 rounded-full orb-3d-blue animate-float-slow opacity-90 hidden sm:block" />
                <div className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full orb-3d-cyan animate-float-reverse opacity-85 hidden md:block" />
                <div className="absolute top-1/2 left-1/6 w-20 h-20 cube-3d-blue animate-float-slow opacity-90 hidden lg:block" />
                <div className="absolute top-2/3 right-1/3 w-24 h-24 cube-3d-blue animate-float-reverse opacity-90 hidden md:block" />
                <div className="absolute bottom-24 right-1/4 torus-3d-purple animate-float-slow opacity-85 hidden lg:block" />
                <div className="absolute bottom-1/3 left-1/3 w-16 h-16 rounded-full orb-3d-blue animate-float-reverse opacity-90 hidden md:block" />
                <div className="absolute top-10 right-1/5 w-12 h-12 rounded-full orb-3d-cyan animate-float-slow opacity-85" />
              </>
            )}

            {/* OPTION 2: SUNSET RADIANT AMBIENT MESH */}
            {glassGradient === 'sunset' && (
              <>
                <div className="absolute top-10 left-1/4 w-[520px] h-[520px] bg-rose-500/25 dark:bg-rose-500/20 rounded-full blur-[110px]" />
                <div className="absolute top-1/2 right-1/4 w-[560px] h-[560px] bg-amber-500/25 dark:bg-amber-500/20 rounded-full blur-[120px]" />
                <div className="absolute -bottom-20 left-1/3 w-[460px] h-[460px] bg-purple-500/22 dark:bg-purple-500/18 rounded-full blur-[110px]" />
                <div className="absolute top-1/4 -left-20 w-[420px] h-[420px] bg-pink-500/25 dark:bg-pink-500/18 rounded-full blur-[100px]" />

                {/* 3D Pink & Amber Floating Objects */}
                <div className="absolute top-20 left-1/3 w-28 h-28 rounded-full orb-3d-pink animate-float-slow opacity-90 hidden sm:block" />
                <div className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full orb-3d-amber animate-float-reverse opacity-85 hidden md:block" />
                <div className="absolute top-1/2 left-1/6 w-20 h-20 cube-3d-pink animate-float-slow opacity-90 hidden lg:block" />
                <div className="absolute top-2/3 right-1/3 w-24 h-24 cube-3d-pink animate-float-reverse opacity-90 hidden md:block" />
                <div className="absolute bottom-24 right-1/4 torus-3d-purple animate-float-slow opacity-85 hidden lg:block" />
                <div className="absolute bottom-1/3 left-1/3 w-16 h-16 rounded-full orb-3d-amber animate-float-reverse opacity-90 hidden md:block" />
                <div className="absolute top-10 right-1/5 w-12 h-12 rounded-full orb-3d-pink animate-float-slow opacity-85" />
              </>
            )}

            {/* OPTION 3: EMERALD NEBULA AMBIENT MESH */}
            {glassGradient === 'emerald' && (
              <>
                <div className="absolute top-10 left-1/4 w-[520px] h-[520px] bg-emerald-500/25 dark:bg-emerald-500/20 rounded-full blur-[110px]" />
                <div className="absolute top-1/2 right-1/4 w-[560px] h-[560px] bg-teal-500/25 dark:bg-teal-500/20 rounded-full blur-[120px]" />
                <div className="absolute -bottom-20 left-1/3 w-[460px] h-[460px] bg-cyan-500/20 dark:bg-cyan-500/18 rounded-full blur-[110px]" />
                <div className="absolute top-1/4 -left-20 w-[420px] h-[420px] bg-blue-500/20 dark:bg-blue-500/15 rounded-full blur-[100px]" />

                {/* 3D Emerald & Mint Floating Objects */}
                <div className="absolute top-20 left-1/3 w-28 h-28 rounded-full orb-3d-emerald animate-float-slow opacity-90 hidden sm:block" />
                <div className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full orb-3d-cyan animate-float-reverse opacity-85 hidden md:block" />
                <div className="absolute top-1/2 left-1/6 w-20 h-20 cube-3d-emerald animate-float-slow opacity-90 hidden lg:block" />
                <div className="absolute top-2/3 right-1/3 w-24 h-24 cube-3d-emerald animate-float-reverse opacity-90 hidden md:block" />
                <div className="absolute bottom-24 right-1/4 torus-3d-purple animate-float-slow opacity-85 hidden lg:block" />
                <div className="absolute bottom-1/3 left-1/3 w-16 h-16 rounded-full orb-3d-emerald animate-float-reverse opacity-90 hidden md:block" />
                <div className="absolute top-10 right-1/5 w-12 h-12 rounded-full orb-3d-cyan animate-float-slow opacity-85" />
              </>
            )}

          </div>
          
          <Outlet />
        </main>
      </div>

      {/* Global StudyOS Floating Timer Widget */}
      <FloatingTimer />

      {/* Global 'I'm Stuck' Debug Lab Modal */}
      <ImStuckModal />

      {/* Global DevOps Lab Terminal Modal (xterm.js + PTY) */}
      <DevOpsTerminalModal />
    </div>
  );
}
