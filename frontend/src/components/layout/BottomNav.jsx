import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Share2, Clock, Bot } from 'lucide-react';

export default function BottomNav() {
  const navItems = [
    { label: 'Home', icon: Home, path: '/os/dashboard', color: 'text-cyan-400' },
    { label: 'Mind Map', icon: Share2, path: '/os/projects', color: 'text-emerald-400' },
    { label: 'Timer', icon: Clock, path: '/os/timer', color: 'text-amber-400' },
    { label: 'AI', icon: Bot, path: '/os/ai-assistant', color: 'text-purple-400' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-panel)]/90 backdrop-blur-md border-t border-[var(--border-color)] pb-[var(--safe-area-bottom)] safe-area-shadow">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 min-w-[64px] ${
                isActive
                  ? 'bg-[var(--bg-card)] shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] border border-cyan-500/20 text-cyan-400'
                  : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon 
                  size={22} 
                  className={`mb-1 transition-transform duration-200 ${
                    isActive 
                      ? `${item.color} scale-110 drop-shadow-[0_0_8px_currentColor]` 
                      : ''
                  }`} 
                />
                <span className={`text-[10px] font-bold ${isActive ? 'text-cyan-400' : ''}`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
