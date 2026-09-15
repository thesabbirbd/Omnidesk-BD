import React from 'react';
import { Sparkles, FolderOpen, History, BookOpen } from 'lucide-react';

export default function EmptyState({ 
  icon: Icon = FolderOpen, 
  title = "It's a bit empty here", 
  description = "Get started by creating your first item or exploring our suggestions.",
  actionText,
  onAction,
  type = 'default'
}) {
  return (
    <div className="w-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-[var(--border-color)] rounded-3xl bg-[var(--bg-card)]/50 backdrop-blur-sm min-h-[400px]">
      <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center text-cyan-400 mb-6 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)]">
        <Icon size={36} className="animate-pulse" />
      </div>
      <h3 className="text-xl sm:text-2xl font-black tracking-wider text-[color:var(--text-main)] mb-3">
        {title}
      </h3>
      <p className="text-[color:var(--text-muted)] text-sm font-semibold max-w-md mb-8 leading-relaxed">
        {description}
      </p>
      
      {actionText && onAction && (
        <button 
          onClick={onAction}
          className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_14px_rgba(34,211,238,0.4)] hover:shadow-[0_6px_20px_rgba(34,211,238,0.6)] active:scale-95"
        >
          {type === 'ai' ? <Sparkles size={16} /> : <BookOpen size={16} />}
          {actionText}
        </button>
      )}
    </div>
  );
}
