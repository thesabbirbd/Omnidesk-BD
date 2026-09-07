import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

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
        <main className="flex-1 overflow-y-auto p-4 md:p-6 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-panel)] via-[var(--bg-canvas)] to-[#04070a] -z-10" />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
