import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  X,
  Plus,
  ChevronRight,
  FolderGit2,
  Trash2,
  Info
} from 'lucide-react';
import { getStudySpaces } from '../../services/api';
import { getSpaceSlug } from '../../utils/slugify';
import DeleteProjectModal from '../projects/DeleteProjectModal';
import AboutOmnideskModal from '../common/AboutOmnideskModal';


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
  const navigate = useNavigate();
  const [spacesList, setSpacesList] = useState([]);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [activeSpaceId, setActiveSpaceId] = useState(() => {
    return localStorage.getItem('current_study_space_id') || '';
  });
  const [activeSpaceTitle, setActiveSpaceTitle] = useState(() => {
    return localStorage.getItem('current_study_space_title') || '';
  });

  const handleProjectDeleted = (deletedId) => {
    setSpacesList(prev => prev.filter(s => s.id !== deletedId));
    if (localStorage.getItem('current_study_space_id') === deletedId) {
      localStorage.removeItem('current_study_space_id');
      localStorage.removeItem('current_study_space_title');
      window.dispatchEvent(new CustomEvent('studyos-space-changed', { detail: null }));
      navigate('/os/dashboard');
    }
    loadSpaces();
  };


  const loadSpaces = async () => {
    try {
      const data = await getStudySpaces();
      if (Array.isArray(data) && data.length > 0) {
        setSpacesList(data);
        const currentId = localStorage.getItem('current_study_space_id');
        const matched = data.find(s => s.id === currentId) || data[0];
        if (matched && !currentId) {
          setActiveSpaceId(matched.id);
          setActiveSpaceTitle(matched.title);
          localStorage.setItem('current_study_space_id', matched.id);
          localStorage.setItem('current_study_space_title', matched.title);
        }
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadSpaces();
    const handleSpaceChanged = (e) => {
      if (e.detail?.id) {
        setActiveSpaceId(e.detail.id);
        setActiveSpaceTitle(e.detail.title || '');
      }
      loadSpaces();
    };
    window.addEventListener('studyos-space-changed', handleSpaceChanged);
    return () => window.removeEventListener('studyos-space-changed', handleSpaceChanged);
  }, []);

  const handleSelectProject = (space) => {
    localStorage.setItem('current_study_space_id', space.id);
    localStorage.setItem('current_study_space_title', space.title);
    setActiveSpaceId(space.id);
    setActiveSpaceTitle(space.title);
    window.dispatchEvent(new CustomEvent('studyos-space-changed', { detail: space }));
    const slug = getSpaceSlug(space);
    navigate(`/os/dashboard/${slug}`);
    onClose();
  };

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
            <img 
              src="/omnidesk-mark.png" 
              alt="Omnidesk BD" 
              className="w-11 h-11 rounded-2xl object-contain shadow-[0_0_15px_rgba(0,240,255,0.35)] shrink-0 border border-cyan-500/20 bg-slate-950/40 p-1" 
            />
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 uppercase leading-none">
                Omnidesk BD
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

        {/* All Learning Projects Switcher Section */}
        <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-panel)] flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between px-1.5 pt-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[color:var(--text-muted)] flex items-center gap-1.5">
              <FolderGit2 size={12} className="text-cyan-400" />
              All Learning Projects
            </span>
            <button
              onClick={() => {
                navigate('/os/dashboard');
                onClose();
              }}
              className="p-1 rounded-lg hover:bg-[var(--bg-input)] text-cyan-400 hover:text-cyan-300 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer transition-colors"
              title="Create New Learning Project"
            >
              <Plus size={11} />
              <span>New</span>
            </button>
          </div>

          <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-0.5 scrollbar-thin">
            {spacesList.length === 0 ? (
              <div className="px-2 py-2 text-[11px] text-[color:var(--text-muted)] italic">
                Loading projects...
              </div>
            ) : (
              spacesList.map((space) => {
                const isActive = space.id === activeSpaceId || space.title === activeSpaceTitle;
                return (
                  <button
                    key={space.id}
                    onClick={() => handleSelectProject(space)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs font-bold transition-all group cursor-pointer ${
                      isActive
                        ? 'bg-[var(--bg-card)] text-cyan-400 shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] border border-cyan-500/30'
                        : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] hover:bg-[var(--bg-card)]'
                    }`}
                    title={`Switch to: ${space.title}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${
                        isActive 
                          ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)] animate-pulse' 
                          : 'bg-slate-500/50 group-hover:bg-slate-400'
                      }`} />
                      <span className="truncate text-[11px]">{space.title}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectToDelete(space);
                        }}
                        className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                        title={`Delete ${space.title} (Admin protected)`}
                      >
                        <Trash2 size={12} />
                      </button>
                      {isActive ? (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 shrink-0">
                          Active
                        </span>
                      ) : (
                        <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-[color:var(--text-muted)] shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* About Omnidesk BD Option */}
          <button
            onClick={() => setShowAboutModal(true)}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-xs font-bold text-[color:var(--text-muted)] hover:text-cyan-400 hover:bg-[var(--bg-card)] transition-colors group cursor-pointer border border-transparent hover:border-cyan-500/20"
          >
            <div className="flex items-center gap-2">
              <Info size={14} className="text-cyan-400" />
              <span>About Omnidesk BD</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-500">v1.2.9</span>
          </button>

          {/* Compact Encouragement */}
          <div className="pt-1.5 border-t border-[var(--border-color)]/60 flex items-center justify-between px-1 text-[10px] font-semibold text-[color:var(--text-muted)]">
            <span className="flex items-center gap-1 text-emerald-400">
              <Sprout size={12} /> Small daily steps
            </span>
            <span className="text-cyan-400 font-bold">Keep going! 💪</span>
          </div>
        </div>

      </aside>

      {/* Admin Password Protected Delete Project Modal */}
      <DeleteProjectModal 
        isOpen={Boolean(projectToDelete)}
        onClose={() => setProjectToDelete(null)}
        project={projectToDelete}
        onDeleted={handleProjectDeleted}
      />

      {/* About Omnidesk BD Modal */}
      <AboutOmnideskModal 
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />
    </>
  );
}

