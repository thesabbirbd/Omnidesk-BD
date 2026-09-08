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
          {/* Ambient Lighting & 3D Glossy Floating Objects for iOS Glass Aesthetic */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
            {/* Atmospheric light glows */}
            <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-cyan-500/20 dark:bg-cyan-500/15 rounded-full blur-[100px]" />
            <div className="absolute top-1/2 right-1/4 w-[550px] h-[550px] bg-indigo-500/20 dark:bg-indigo-500/15 rounded-full blur-[110px]" />
            <div className="absolute -bottom-20 left-1/3 w-[450px] h-[450px] bg-purple-500/15 dark:bg-purple-500/12 rounded-full blur-[100px]" />
            <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] bg-pink-500/15 dark:bg-rose-500/10 rounded-full blur-[100px]" />

            {/* Glossy 3D Spheres & Shapes from Reference Image */}
            <div className="absolute top-24 right-1/3 w-16 h-16 rounded-full orb-3d-blue animate-float-slow opacity-90 hidden sm:block" />
            <div className="absolute top-1/3 left-1/5 w-20 h-20 rounded-full orb-3d-pink animate-float-reverse opacity-85 hidden md:block" />
            <div className="absolute bottom-28 right-16 w-24 h-24 rounded-full orb-3d-blue animate-float-slow opacity-95 hidden lg:block" />
            <div className="absolute top-2/3 right-1/4 torus-3d-purple animate-float-reverse opacity-80 hidden lg:block" />
            <div className="absolute bottom-1/4 left-1/4 w-12 h-12 rounded-full orb-3d-cyan animate-float-slow opacity-85 hidden md:block" />
            <div className="absolute top-12 left-1/3 w-8 h-8 rounded-full orb-3d-blue animate-float-reverse opacity-80" />
          </div>
          
          <Outlet />
        </main>
      </div>

      {/* Global StudyOS Floating Timer Widget */}
      <FloatingTimer />
    </div>
  );
}
