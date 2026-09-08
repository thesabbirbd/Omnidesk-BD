import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import FloatingTimer from '../timer/FloatingTimer';

export default function AppShell() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
        
        {/* Main Viewport Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 relative">
          {/* Ambient Lighting Orbs for True Glassmorphism Translucency */}
          <div className="absolute top-12 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute bottom-16 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-panel)] via-[var(--bg-canvas)] to-transparent -z-20 opacity-80" />
          
          <Outlet />
        </main>
      </div>

      {/* Global StudyOS Floating Timer Widget */}
      <FloatingTimer />
    </div>
  );
}
