import React from 'react';
import { AlertCircle, RefreshCw, Cpu, WifiOff, X } from 'lucide-react';

export default function IntelligentErrorBanner({ error, onDismiss, onRetry }) {
  if (!error) return null;

  const errorStr = String(error).toLowerCase();
  
  const isOffline = !navigator.onLine || errorStr.includes('network') || errorStr.includes('fetch');
  const isAiFailure = errorStr.includes('gemini') || errorStr.includes('ai') || errorStr.includes('generation');

  return (
    <div className="mt-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row sm:items-start gap-4 text-xs text-rose-400 animate-in fade-in duration-200">
      <div className="flex gap-3 flex-1">
        {isOffline ? <WifiOff size={18} className="shrink-0 mt-0.5 text-rose-400" /> : <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-400" />}
        <div className="flex-1">
          <span className="font-bold block mb-1">
            {isOffline ? "You're offline" : isAiFailure ? "AI Generation Failed" : "Action Failed"}
          </span>
          <span className="opacity-90 leading-relaxed">
            {isOffline 
              ? "Your local StudySpaces remain available, but creating new ones requires an internet connection."
              : isAiFailure
              ? "Gemini isn't available right now. Please try again later or consider a local fallback."
              : error}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        {onRetry && !isOffline && (
          <button 
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold transition-colors"
          >
            <RefreshCw size={14} /> Retry
          </button>
        )}
        {isAiFailure && !isOffline && (
          <button 
            onClick={() => window.open('https://ollama.com', '_blank')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/30 hover:bg-rose-500/20 text-rose-300 font-bold transition-colors"
          >
            <Cpu size={14} /> Use Ollama
          </button>
        )}
        {onDismiss && (
          <button 
            onClick={onDismiss}
            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition-colors ml-2"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
