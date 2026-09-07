import React, { useState } from 'react';
import { Search, Link as LinkIcon, FileText, File as FilePdf, FileVideo, UploadCloud, Folder, Plus, FileCode, CheckCircle2 } from 'lucide-react';

const mockMaterials = [
  { id: 1, type: 'pdf', name: 'FastAPI_Architecture.pdf', topic: 'Backend Engineering', size: '2.4 MB', date: 'Oct 12' },
  { id: 2, type: 'video', name: 'Python OOP Crash Course', topic: 'Core Python', size: '1h 20m', date: 'Oct 14' },
  { id: 3, type: 'url', name: 'ReactFlow Documentation', topic: 'Frontend React', size: 'Web', date: 'Oct 15' },
  { id: 4, type: 'markdown', name: 'System_Design_Notes.md', topic: 'System Design', size: '14 KB', date: 'Oct 16' },
  { id: 5, type: 'docx', name: 'Project_Requirements.docx', topic: 'Project X', size: '42 KB', date: 'Oct 16' },
];

const typeConfig = {
  pdf: { icon: FilePdf, color: 'text-red-500', bg: 'bg-red-500/10' },
  video: { icon: FileVideo, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  url: { icon: LinkIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  markdown: { icon: FileCode, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  docx: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-600/10' }
};

export default function Materials() {
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-canvas)] text-[color:var(--text-main)] overflow-y-auto p-6 md:p-10 gap-8">
      
      {/* Header and Upload Zone */}
      <div className="flex flex-col xl:flex-row gap-8">
        
        <div className="flex-1 flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-wide flex items-center gap-3">
              <Folder className="text-purple-400" size={32} />
              Universal Material Engine
            </h1>
            <p className="text-[color:var(--text-muted)] mt-2 font-medium">Manage, link, and organize your study files and references across all topics.</p>
          </div>

          {/* Search Bar - Inset */}
          <div className="relative w-full max-w-lg">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Search materials, URLs, notes..." 
              className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[color:var(--text-main)] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-purple-500/50 transition-all shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)] font-medium"
            />
          </div>
        </div>

        {/* Upload / Paste Zone - Neumorphic Tray */}
        <div className="xl:w-96 p-6 bg-[var(--bg-panel)] rounded-3xl shadow-[inset_4px_4px_12px_var(--shadow-dark),inset_-4px_-4px_12px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase tracking-widest text-[color:var(--text-muted)]">
            <Plus size={16} /> Quick Add
          </div>
          
          <button className="w-full py-4 px-4 rounded-2xl border-2 border-dashed border-[var(--border-color)] hover:border-purple-400/50 bg-[var(--bg-card)] shadow-[4px_4px_10px_var(--shadow-dark),-4px_-4px_10px_var(--shadow-light)] flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 group overflow-hidden cursor-pointer">
            <UploadCloud size={26} className="text-[color:var(--text-muted)] group-hover:text-purple-400 transition-colors drop-shadow-md" />
            <span className="font-semibold text-xs text-[color:var(--text-main)]">Drag & Drop files or Browse</span>
          </button>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] focus-within:border-purple-500/50 transition-all w-full">
            <LinkIcon size={16} className="text-[color:var(--text-muted)] shrink-0 ml-1" />
            <input 
              type="text" 
              placeholder="Paste URL here..." 
              className="w-full bg-transparent text-xs text-[color:var(--text-main)] py-2 px-1 focus:outline-none"
            />
            <button className="p-2 bg-purple-500 hover:bg-purple-400 text-white rounded-xl shadow-[0_0_10px_rgba(168,85,247,0.5)] shrink-0 transition-all cursor-pointer flex items-center justify-center">
              <CheckCircle2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-4 mt-4">
        {['all', 'pdf', 'video', 'url', 'markdown', 'docx'].map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-6 py-2.5 rounded-xl font-bold capitalize transition-all duration-300 flex items-center gap-2 ${
              activeFilter === filter
                ? 'bg-[var(--bg-card)] text-purple-400 shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)]'
                : 'bg-[var(--bg-card)] text-[color:var(--text-muted)] shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] hover:text-[color:var(--text-main)] hover:-translate-y-0.5'
            }`}
          >
            {filter !== 'all' && React.createElement(typeConfig[filter].icon, { size: 16, className: activeFilter === filter ? 'drop-shadow-[0_0_8px_currentColor]' : '' })}
            {filter}
          </button>
        ))}
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-4">
        {mockMaterials.filter(m => activeFilter === 'all' || m.type === activeFilter).map((material) => {
          const config = typeConfig[material.type];
          return (
            <div key={material.id} className="p-6 rounded-3xl overflow-hidden bg-[var(--bg-card)] shadow-[6px_6px_14px_var(--shadow-dark),-6px_-6px_14px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col gap-4 group cursor-pointer hover:border-purple-500/40 hover:shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] transition-all">
              
              <div className="flex justify-between items-start">
                <div className={`p-3.5 rounded-2xl ${config.bg} shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)] border border-[var(--border-color)] group-hover:scale-105 transition-transform`}>
                  {React.createElement(config.icon, { size: 24, className: `${config.color} drop-shadow-[0_0_8px_currentColor]` })}
                </div>
                <div className="flex flex-col items-end pt-1">
                  <span className="text-xs font-bold text-[color:var(--text-muted)] uppercase tracking-wider">{material.size}</span>
                  <span className="text-[11px] font-medium text-slate-500">{material.date}</span>
                </div>
              </div>

              <div className="mt-1">
                <h3 className="text-base font-bold text-[color:var(--text-main)] group-hover:text-purple-400 transition-colors line-clamp-2">
                  {material.name}
                </h3>
              </div>

              {/* Topic Connection Ribbon */}
              <div className="mt-auto pt-4 border-t border-[var(--border-color)]">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-input)] shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] border border-[var(--border-color)] text-xs font-semibold text-[color:var(--text-muted)]">
                  <Folder size={14} className="text-cyan-400 shrink-0" />
                  <span className="truncate">{material.topic}</span>
                </div>
              </div>
              
            </div>
          );
        })}
      </div>
      
    </div>
  );
}
