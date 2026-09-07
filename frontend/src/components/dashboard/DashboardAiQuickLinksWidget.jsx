import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Send, 
  ChevronRight, 
  Sparkles, 
  ExternalLink, 
  FileText, 
  Folder,
  Terminal,
  HelpCircle
} from 'lucide-react';

function YoutubeIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function GithubIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  );
}

export default function DashboardAiQuickLinksWidget() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (prompt.trim()) {
      navigate(`/os/ai-assistant?q=${encodeURIComponent(prompt.trim())}`);
    }
  };

  const handleChipClick = (queryText) => {
    navigate(`/os/ai-assistant?q=${encodeURIComponent(queryText)}`);
  };

  return (
    <div className="p-6 rounded-3xl bg-[var(--bg-card)] shadow-[6px_6px_14px_var(--shadow-dark),-6px_-6px_14px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col justify-between gap-5 h-full min-h-[480px] transition-all">
      
      {/* Top Section: AI Assistant */}
      <div className="flex flex-col gap-3.5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-sky-500/10 text-sky-400">
              <Bot size={18} className="drop-shadow-[0_0_6px_rgba(56,189,248,0.6)]" />
            </div>
            <h3 className="text-xs font-black tracking-wide text-[color:var(--text-main)] uppercase">
              AI Assistant
            </h3>
          </div>
          <button 
            onClick={() => navigate('/os/ai-assistant')}
            className="text-[11px] font-bold text-sky-400 hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Ask Bot</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {/* AI Input Form */}
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask about backend, Docker, code..."
            className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[color:var(--text-main)] rounded-2xl py-2.5 pl-3.5 pr-10 focus:outline-none focus:border-sky-500/50 shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] placeholder:text-[color:var(--text-muted)] transition-all font-medium"
          />
          <button
            type="submit"
            className="absolute right-1.5 w-8 h-8 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 flex items-center justify-center shadow-[0_0_10px_rgba(14,165,233,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Send query"
          >
            <Send size={13} />
          </button>
        </form>

        {/* Quick Action Chips */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
            Suggested Prompts
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'Explain Topic', query: 'Can you explain the current topic in simple terms with production code examples?' },
              { label: 'Debug Error', query: 'Help me debug this error in my backend application:' },
              { label: 'Generate Quiz', query: 'Generate a 3-question quick quiz on my current backend topic.' },
              { label: 'Active Recall', query: 'Give me 3 active recall challenges on FastAPI and PostgreSQL.' },
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(chip.query)}
                className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-[var(--bg-input)] border border-[var(--border-color)] text-sky-400 hover:text-cyan-300 hover:border-sky-500/40 shadow-[inset_1px_1px_2px_var(--shadow-dark)] active:scale-95 transition-all cursor-pointer"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Section: Quick Links */}
      <div className="pt-3 border-t border-[var(--border-color)] flex flex-col gap-2.5">
        
        <span className="text-[10px] font-black uppercase tracking-wider text-[color:var(--text-muted)] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
          Quick Links
        </span>

        <div className="grid grid-cols-2 gap-2">
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 p-2.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs font-bold text-[color:var(--text-main)] hover:text-red-400 hover:border-red-500/30 transition-all group shadow-[inset_1px_1px_3px_var(--shadow-dark)]"
          >
            <div className="p-1.5 rounded-lg bg-[var(--bg-card)] group-hover:scale-110 transition-transform">
              <YoutubeIcon size={16} className="text-red-500" />
            </div>
            <span className="truncate">YouTube</span>
          </a>

          <a
            href="https://github.com/thesabbirbd/universal-study-os"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 p-2.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs font-bold text-[color:var(--text-main)] hover:text-cyan-400 hover:border-cyan-500/30 transition-all group shadow-[inset_1px_1px_3px_var(--shadow-dark)]"
          >
            <div className="p-1.5 rounded-lg bg-[var(--bg-card)] group-hover:scale-110 transition-transform">
              <GithubIcon size={16} className="text-cyan-400" />
            </div>
            <span className="truncate">GitHub Repo</span>
          </a>

          <button
            onClick={() => navigate('/os/materials')}
            className="flex items-center gap-2 p-2.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs font-bold text-[color:var(--text-main)] hover:text-emerald-400 hover:border-emerald-500/30 transition-all group cursor-pointer shadow-[inset_1px_1px_3px_var(--shadow-dark)]"
          >
            <div className="p-1.5 rounded-lg bg-[var(--bg-card)] group-hover:scale-110 transition-transform">
              <FileText size={16} className="text-emerald-400" />
            </div>
            <span className="truncate">Docs (Official)</span>
          </button>

          <button
            onClick={() => navigate('/os/materials')}
            className="flex items-center gap-2 p-2.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs font-bold text-[color:var(--text-main)] hover:text-amber-400 hover:border-amber-500/30 transition-all group cursor-pointer shadow-[inset_1px_1px_3px_var(--shadow-dark)]"
          >
            <div className="p-1.5 rounded-lg bg-[var(--bg-card)] group-hover:scale-110 transition-transform">
              <Folder size={16} className="text-amber-400" />
            </div>
            <span className="truncate">Local Files</span>
          </button>
        </div>

      </div>

    </div>
  );
}
