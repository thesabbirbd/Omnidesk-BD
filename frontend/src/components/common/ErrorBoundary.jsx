import React from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-canvas)] text-[color:var(--text-main)] p-6">
          <div className="max-w-2xl w-full bg-[var(--bg-card)] border border-rose-500/50 p-8 rounded-3xl shadow-[0_0_40px_rgba(244,63,94,0.15)] flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/30">
              <AlertCircle size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-wide mb-2">Omnidesk Runtime Error</h1>
              <p className="text-slate-400 font-medium">A critical error occurred while rendering this module.</p>
            </div>
            
            <div className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 text-left overflow-x-auto text-xs font-mono text-rose-300">
              <p className="font-bold mb-2">{this.state.error && this.state.error.toString()}</p>
              <pre className="text-slate-500">{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
            </div>

            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold tracking-wide transition-all shadow-[0_0_15px_rgba(244,63,94,0.4)] hover:scale-105 active:scale-95"
            >
              <RotateCw size={18} />
              <span>Return to OS Core</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
