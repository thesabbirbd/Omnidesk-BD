import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  GitFork, 
  Calendar, 
  List, 
  Library, 
  Briefcase, 
  Timer, 
  FileText, 
  RotateCcw,
  HelpCircle,
  BarChart2, 
  Bot, 
  Settings,
  Brain,
  Sprout,
  X
} from 'lucide-react';

const navItems = [
  { path: '/os/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-cyan-400' },
  { path: '/os/mindmap', label: 'Mind Map', icon: GitFork, color: 'text-cyan-400' },
  { path: '/os/study-plan', label: 'Study Plan', icon: Calendar, color: 'text-emerald-400' },
  { path: '/os/topics', label: 'Topics', icon: List, color: 'text-amber-400' },
  { path: '/os/materials', label: 'Materials', icon: Library, color: 'text-purple-400' },
  { path: '/os/projects', label: 'Projects', icon: Briefcase, color: 'text-blue-400' },
  { path: '/os/timer', label: 'Timer', icon: Timer, color: 'text-orange-400' },
  { path: '/os/notes', label: 'Notes', icon: FileText, color: 'text-yellow-400' },
  { path: '/os/flashcards', label: 'Flashcards', icon: RotateCcw, color: 'text-pink-400' },
  { path: '/os/quizzes', label: 'Quizzes', icon: HelpCircle, color: 'text-indigo-400' },
  { path: '/os/analytics', label: 'Analytics', icon: BarChart2, color: 'text-rose-400' },
  { path: '/os/ai-assistant', label: 'AI Assistant', icon: Bot, color: 'text-sky-400' },
  { path: '/os/settings', label: 'Settings', icon: Settings, color: 'text-slate-400' },
];

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar (Fixed slide-over on mobile, static on desktop) */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[var(--bg-panel)] border-r border-[var(--border-color)] 
          flex flex-col h-full overflow-hidden select-none shrink-0 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        
        {/* Brand Header */}
        <div className="pt-6 pb-5 px-6 flex items-center justify-between border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[var(--bg-card)] shadow-[3px_3px_8px_var(--shadow-dark),-3px_-3px_8px_var(--shadow-light)] flex items-center justify-center text-cyan-400 shrink-0">
              <Brain size={26} className="drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 uppercase leading-none">
                StudyOS
              </span>
              <span className="text-[11px] font-bold text-[color:var(--text-muted)] tracking-wider mt-1">
                Learn • Build • Grow
              </span>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] hover:bg-[var(--bg-input)] lg:hidden cursor-pointer transition-all"
            title="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav Items List (Scrollable) */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-2 scrollbar-thin">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onClose()}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-200 group text-sm font-semibold tracking-wide ${
                  isActive
                    ? 'bg-[var(--bg-card)] text-cyan-400 shadow-[inset_3px_3px_6px_var(--shadow-dark),inset_-3px_-3px_6px_var(--shadow-light)] border border-cyan-500/30'
                    : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] hover:bg-[var(--bg-card)] hover:shadow-[3px_3px_8px_var(--shadow-dark),-3px_-3px_8px_var(--shadow-light)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon 
                    size={20} 
                    className={`transition-transform duration-200 shrink-0 ${
                      isActive 
                        ? `${item.color} scale-110 drop-shadow-[0_0_8px_currentColor]` 
                        : 'group-hover:scale-105'
                    }`} 
                  />
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)] shrink-0" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Motivational Card at Bottom */}
        <div className="p-4 border-t border-[var(--border-color)]">
          <div className="p-4 rounded-2xl bg-[var(--bg-card)] shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                <Sprout size={18} />
              </div>
              <span className="text-xs font-bold text-[color:var(--text-main)] leading-tight">
                Small steps every day lead to big results.
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-[var(--bg-input)] shadow-[inset_1px_1px_2px_var(--shadow-dark)] overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 w-2/3 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
            </div>

            <span className="text-[11px] font-bold text-emerald-400 tracking-wide">
              Keep going! 💪
            </span>
          </div>
        </div>

      </aside>
    </>
  );
}
