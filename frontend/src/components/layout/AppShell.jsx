import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppShell() {
  return (
    <div className="flex h-screen w-full bg-[var(--bg-canvas)] text-[color:var(--text-main)] font-sans overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-panel)] via-[var(--bg-canvas)] to-[#04070a] -z-10" />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
