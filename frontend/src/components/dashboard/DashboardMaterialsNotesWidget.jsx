import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Library, 
  ExternalLink, 
  FileText, 
  Video, 
  Link2, 
  Code, 
  FileCode, 
  ChevronRight,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

const defaultMaterials = [
  { id: 1, type: 'docs', title: 'Python OOP & Solid Principles', meta: 'PDF • 2.4 MB', icon: FileText, color: 'text-blue-400', url: '/os/materials' },
  { id: 2, type: 'notes', title: 'FastAPI Architecture & DI', meta: 'Markdown • 18 KB', icon: FileCode, color: 'text-cyan-400', url: '/os/notes' },
  { id: 3, type: 'videos', title: 'PostgreSQL Indexing Explained', meta: 'Video • 42 min', icon: Video, color: 'text-red-400', url: '/os/materials' },
  { id: 4, type: 'docs', title: 'Docker Containers Deep Dive', meta: 'Docs • 3.8 MB', icon: FileText, color: 'text-emerald-400', url: '/os/materials' },
];

const defaultRecentNotes = [
  { id: 1, title: 'Why FastAPI over Flask?', date: 'Today • 10:24 AM', tag: '#fastapi', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { id: 2, title: 'PostgreSQL B-Tree Indexes', date: 'Yesterday • Database', tag: '#postgresql', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 3, title: 'Docker Container Lifecycle', date: '2 days ago • DevOps', tag: '#docker', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
];

export default function DashboardMaterialsNotesWidget({
  materials = defaultMaterials,
  recentNotes = defaultRecentNotes
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  const filteredMaterials = activeTab === 'all' 
    ? materials 
    : materials.filter((m) => m.type.toLowerCase() === activeTab.toLowerCase());

  return (
    <div className="p-6 rounded-3xl bg-[var(--bg-card)] shadow-[6px_6px_14px_var(--shadow-dark),-6px_-6px_14px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col justify-between gap-5 h-full min-h-[480px] transition-all">
      
      {/* Top Section: Learning Materials */}
      <div className="flex flex-col gap-3.5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-400">
              <Library size={18} />
            </div>
            <h3 className="text-xs font-black tracking-wide text-[color:var(--text-main)] uppercase">
              Learning Materials
            </h3>
          </div>
          <button 
            onClick={() => navigate('/os/materials')}
            className="text-[11px] font-bold text-cyan-400 hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {/* Tab Filters (All, Notes, Docs, Videos) */}
        <div className="flex items-center gap-1.5 pb-1">
          {['all', 'notes', 'docs', 'videos'].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold capitalize transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--bg-input)] text-cyan-400 border border-cyan-500/40 shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)]'
                    : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] hover:bg-[var(--bg-input)]/50'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Material Items List */}
        <div className="flex flex-col gap-2 min-h-[140px]">
          {filteredMaterials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-xs text-[color:var(--text-muted)] italic">
              No items under {activeTab}
            </div>
          ) : (
            filteredMaterials.slice(0, 3).map((item) => {
              const ItemIcon = item.icon || FileText;
              return (
                <div 
                  key={item.id}
                  onClick={() => navigate(item.url || '/os/materials')}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-purple-500/40 shadow-[inset_1px_1px_3px_var(--shadow-dark)] hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="p-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] group-hover:scale-105 transition-transform">
                      <ItemIcon size={14} className={item.color || 'text-cyan-400'} />
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-bold text-[color:var(--text-main)] group-hover:text-purple-400 transition-colors truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-[color:var(--text-muted)] font-medium">
                        {item.meta}
                      </span>
                    </div>
                  </div>

                  <div className="p-1 rounded-lg text-[color:var(--text-muted)] group-hover:text-purple-400 group-hover:bg-purple-500/10 transition-all shrink-0">
                    <ArrowUpRight size={14} />
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Bottom Section: Recent Notes */}
      <div className="pt-3 border-t border-[var(--border-color)] flex flex-col gap-3">
        
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-[color:var(--text-muted)] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.8)]" />
            Recent Notes
          </span>
          <button 
            onClick={() => navigate('/os/notes')}
            className="text-[10px] font-bold text-cyan-400 hover:underline cursor-pointer"
          >
            All Notes
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {recentNotes.slice(0, 3).map((note) => (
            <div 
              key={note.id} 
              onClick={() => navigate('/os/notes')}
              className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-input)]/60 hover:bg-[var(--bg-input)] border border-transparent hover:border-yellow-500/30 transition-all cursor-pointer group"
            >
              <div className="flex flex-col truncate pr-2">
                <span className="text-xs font-semibold text-[color:var(--text-main)] group-hover:text-yellow-400 transition-colors truncate">
                  {note.title}
                </span>
                <span className="text-[9px] text-[color:var(--text-muted)] font-medium">
                  {note.date}
                </span>
              </div>
              
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 border border-[var(--border-color)] ${note.color} ${note.bg}`}>
                {note.tag}
              </span>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
