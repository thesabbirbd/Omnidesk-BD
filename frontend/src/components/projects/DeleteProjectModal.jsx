import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ShieldAlert, Trash2, X, Lock, AlertTriangle, ArrowLeft } from 'lucide-react';
import { deleteStudySpace } from '../../services/api';

export default function DeleteProjectModal({ isOpen, onClose, project, onDeleted }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setIsDeleting(false);
      setShake(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !project) return null;

  const handleDelete = async (e) => {
    e.preventDefault();
    setError('');

    // Strictly enforce default admin password
    if (password !== 'admin') {
      setError("Access Denied: Incorrect Admin Password. Deletion protected.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteStudySpace(project.id, password);
      if (onDeleted) {
        onDeleted(project.id);
      }
      onClose();
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to delete StudySpace.";
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setIsDeleting(false);
    }
  };

  const modalContent = (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200 select-none"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-3xl bg-[var(--bg-card)] border border-red-500/40 shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(239,68,68,0.2)] p-6 sm:p-8 flex flex-col gap-6 text-[color:var(--text-main)] select-text relative transition-transform ${
          shake ? 'animate-bounce' : ''
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="p-1.5 rounded-xl hover:bg-[var(--bg-input)] text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] transition-colors"
              title="Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-[color:var(--text-main)]">Delete StudySpace</h2>
              <p className="text-[11px] font-semibold text-red-400 uppercase tracking-wider">Admin Protected Action</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 rounded-xl hover:bg-[var(--bg-input)] text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Warning Details */}
        <div className="flex flex-col gap-3">
          <p className="text-sm text-[color:var(--text-muted)] leading-relaxed">
            You are about to permanently delete the project:
          </p>
          <div className="p-3.5 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-color)] flex items-center justify-between">
            <span className="font-bold text-sm text-[color:var(--text-main)] truncate">{project.title}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-bold uppercase">
              Permanent
            </span>
          </div>
          <p className="text-xs text-amber-400/90 flex items-center gap-1.5 mt-1 font-medium">
            <AlertTriangle size={14} className="shrink-0" />
            All associated topics, mind map nodes, and sprints will be erased.
          </p>
        </div>

        {/* Password Form */}
        <form onSubmit={handleDelete} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[color:var(--text-muted)] flex items-center gap-1.5">
              <Lock size={13} className="text-red-400" /> Enter Admin Password
            </label>
            <input 
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter 'admin' to confirm"
              className="w-full bg-[var(--bg-input)] border border-red-500/30 focus:border-red-400 text-[color:var(--text-main)] font-semibold text-sm rounded-2xl py-3 px-4 focus:outline-none transition-all shadow-[inset_3px_3px_6px_var(--shadow-dark),inset_-3px_-3px_6px_var(--shadow-light)]"
            />
            <span className="text-[10px] text-[color:var(--text-muted)] pl-1">
              Default system password: <span className="font-mono text-cyan-400">admin</span>
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
              <ShieldAlert size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDeleting || !password}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all active:scale-95 disabled:opacity-50"
            >
              <Trash2 size={14} />
              <span>{isDeleting ? "Deleting..." : "Confirm Deletion"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? ReactDOM.createPortal(modalContent, document.body)
    : null;
}
