import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  X, 
  Sparkles, 
  Wrench, 
  Check, 
  AlertTriangle,
  Lightbulb,
  FileCode,
  FolderKanban
} from 'lucide-react';
import { createDebugJournal, getDebugHypothesis, getProjects, sendAiChat } from '../../services/api';

export default function ImStuckModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingHypo, setLoadingHypo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState([]);

  const [form, setForm] = useState({
    title: '',
    problem: '',
    symptom: '',
    hypothesis: '',
    command_used: '',
    output_logs: '',
    root_cause: '',
    solution: '',
    lesson_learned: '',
    project_id: ''
  });

  // Listen for global open trigger
  useEffect(() => {
    const handleOpen = (e) => {
      if (e?.detail) {
        setForm((prev) => ({
          ...prev,
          title: e.detail.title || prev.title,
          problem: e.detail.problem || prev.problem,
          project_id: e.detail.project_id || prev.project_id,
        }));
      }
      setIsOpen(true);
    };

    window.addEventListener('studyos-open-im-stuck', handleOpen);
    return () => window.removeEventListener('studyos-open-im-stuck', handleOpen);
  }, []);

  // Fetch available projects
  useEffect(() => {
    if (isOpen) {
      getProjects()
        .then((data) => setProjects(data || []))
        .catch(() => setProjects([]));
    }
  }, [isOpen]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAiSuggest = async () => {
    if (!form.problem && !form.output_logs) {
      alert("Please describe the problem or paste error logs first.");
      return;
    }
    setLoadingHypo(true);
    try {
      const debugPrompt = `Problem: ${form.problem || form.title || 'Unexpected runtime error'}\n` +
        (form.symptom ? `Symptom: ${form.symptom}\n` : '') +
        (form.output_logs ? `Output / Logs:\n${form.output_logs}\n` : '');

      const res = await sendAiChat({
        message: debugPrompt,
        mode: 'debug',
        context_topic: form.title || 'Engineering Lab Blocker'
      });

      if (res?.reply) {
        const replyText = res.reply;
        setForm((prev) => ({
          ...prev,
          hypothesis: replyText,
          root_cause: prev.root_cause || "Diagnosed via Gemini 1.5 Flash Debug Lab. Review hypotheses above."
        }));
      } else {
        // Fallback to structured hypothesis API
        const legacyRes = await getDebugHypothesis({
          problem: form.problem || form.title || "Unknown error",
          symptom: form.symptom,
          output_logs: form.output_logs
        });
        if (legacyRes) {
          setForm((prev) => ({
            ...prev,
            hypothesis: legacyRes.hypothesis || prev.hypothesis,
            command_used: legacyRes.investigation_command || prev.command_used,
            root_cause: prev.root_cause || legacyRes.recommended_fix || ''
          }));
        }
      }
    } catch (err) {
      console.warn("AI debug diagnosis error:", err);
    } finally {
      setLoadingHypo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.problem.trim()) {
      alert("Title and Problem description are required.");
      return;
    }
    setSaving(true);
    try {
      await createDebugJournal({
        ...form,
        project_id: form.project_id || null,
        topic_id: null
      });

      window.dispatchEvent(new CustomEvent('studyos-show-toast', {
        detail: {
          type: 'success',
          title: 'Debug Journal Saved',
          message: `Saved entry "${form.title}" to Engineering Lab.`
        }
      }));

      // Notify any active Debug Journal listeners (e.g., Projects page)
      window.dispatchEvent(new CustomEvent('studyos-debug-journal-added'));

      setIsOpen(false);
      setForm({
        title: '',
        problem: '',
        symptom: '',
        hypothesis: '',
        command_used: '',
        output_logs: '',
        root_cause: '',
        solution: '',
        lesson_learned: '',
        project_id: ''
      });
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to save debug journal");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Terminal size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-wide text-[color:var(--text-main)] flex items-center gap-2">
                "I'm Stuck" — Debug Lab Journal
              </h2>
              <p className="text-xs font-semibold text-[color:var(--text-muted)]">
                Structured root-cause isolation (Problem → Hypothesis → Command → Output → Solution).
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl text-[color:var(--text-muted)] hover:text-white bg-[var(--bg-input)] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Row 1: Title & Project Link */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
                Bug / Problem Title *
              </label>
              <input 
                type="text"
                required
                placeholder="e.g. Postgres async deadlock on worker thread"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-sm font-semibold text-[color:var(--text-main)] outline-none focus:border-orange-400/50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
                Link to Project
              </label>
              <select
                value={form.project_id}
                onChange={(e) => handleChange('project_id', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs font-semibold text-[color:var(--text-main)] outline-none"
              >
                <option value="">No Project (General)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Problem & Symptom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
                1. What is Broken? (Problem) *
              </label>
              <textarea 
                rows={3}
                required
                placeholder="Describe the failure, expected vs actual behavior..."
                value={form.problem}
                onChange={(e) => handleChange('problem', e.target.value)}
                className="w-full p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs font-mono text-[color:var(--text-main)] outline-none focus:border-orange-400/50 resize-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
                2. Symptom / Observation
              </label>
              <textarea 
                rows={3}
                placeholder="What error code or strange behavior appeared?"
                value={form.symptom}
                onChange={(e) => handleChange('symptom', e.target.value)}
                className="w-full p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs font-mono text-[color:var(--text-main)] outline-none focus:border-orange-400/50 resize-none"
              />
            </div>
          </div>

          {/* Row 3: Hypothesis & AI Helper */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--text-muted)] flex items-center gap-1.5">
                <Lightbulb size={13} className="text-amber-400" />
                <span>3. Hypothesis (Why do you think it broke?)</span>
              </label>
              <button
                type="button"
                onClick={handleAiSuggest}
                disabled={loadingHypo}
                className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 px-2.5 py-1 rounded-lg border border-cyan-500/30 transition-all cursor-pointer"
              >
                <Sparkles size={11} />
                <span>{loadingHypo ? "Analyzing with Gemini..." : "Diagnose with Gemini (Debug Lab)"}</span>
              </button>
            </div>
            <textarea 
              rows={2}
              placeholder="What invariant or configuration might have failed?"
              value={form.hypothesis}
              onChange={(e) => handleChange('hypothesis', e.target.value)}
              className="w-full p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs font-mono text-cyan-300 outline-none focus:border-cyan-400/50 resize-none"
            />
          </div>

          {/* Row 4: Command & Output */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--text-muted)] flex items-center gap-1.5">
                <FileCode size={13} className="text-emerald-400" />
                <span>4. Command / Test Executed</span>
              </label>
              <textarea 
                rows={3}
                placeholder="e.g. docker-compose logs --tail=100 backend"
                value={form.command_used}
                onChange={(e) => handleChange('command_used', e.target.value)}
                className="w-full p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs font-mono text-emerald-400 outline-none focus:border-emerald-400/50 resize-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--text-muted)] flex items-center gap-1.5">
                <AlertTriangle size={13} className="text-red-400" />
                <span>5. Terminal Output / Error Logs</span>
              </label>
              <textarea 
                rows={3}
                placeholder="Paste raw stack trace or log output here..."
                value={form.output_logs}
                onChange={(e) => handleChange('output_logs', e.target.value)}
                className="w-full p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs font-mono text-red-300 outline-none focus:border-red-400/50 resize-none"
              />
            </div>
          </div>

          {/* Row 5: Root Cause & Solution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
                6. Root Cause
              </label>
              <textarea 
                rows={2}
                placeholder="The actual underlying bug once identified..."
                value={form.root_cause}
                onChange={(e) => handleChange('root_cause', e.target.value)}
                className="w-full p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs font-mono text-[color:var(--text-main)] outline-none resize-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
                7. Verified Solution & Lesson Learned
              </label>
              <textarea 
                rows={2}
                placeholder="What fixed it permanently, and what lesson will prevent it?"
                value={form.solution}
                onChange={(e) => handleChange('solution', e.target.value)}
                className="w-full p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs font-mono text-emerald-300 outline-none resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-[color:var(--text-muted)] hover:text-white bg-[var(--bg-input)] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-950 bg-orange-400 hover:bg-orange-300 shadow-[0_0_15px_rgba(251,146,60,0.4)] flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Wrench size={13} />
              <span>{saving ? "Recording..." : "Save to Debug Lab"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
