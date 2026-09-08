import React, { useState, useEffect } from 'react';
import { 
  X, 
  Share2, 
  Layers, 
  Clock, 
  Award, 
  Bug, 
  FileText, 
  FolderKanban, 
  GraduationCap, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Circle, 
  AlertCircle,
  ExternalLink,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { getTopicKnowledgeGraph } from '../../services/api';

export default function KnowledgeGraphModal({ topicId, isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isOpen || !topicId) return;

    setLoading(true);
    getTopicKnowledgeGraph(topicId)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load topic knowledge graph:', err);
        setLoading(false);
      });
  }, [isOpen, topicId]);

  if (!isOpen) return null;

  const topic = data?.topic;
  const metrics = data?.metrics;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/35 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
        style={{
          boxShadow: '0 25px 50px -12px var(--shadow-dark), inset 1px 1px 2px var(--shadow-light)'
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)] bg-[var(--bg-input)]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              <Share2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[color:var(--text-main)]">
                  {topic?.title || 'Knowledge Graph Entity Explorer'}
                </h2>
                {topic?.status && (
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/30">
                    {topic.status}
                  </span>
                )}
              </div>
              <p className="text-xs text-[color:var(--text-muted)] flex items-center gap-2 mt-0.5">
                <span>Universal Study Entity Map & Linked Competencies</span>
                {topic?.origin && (
                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-[var(--bg-input)] border border-[var(--border-color)] text-cyan-400">
                    {topic.origin}
                  </span>
                )}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] hover:bg-[var(--bg-input)] transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-[color:var(--text-muted)] gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
              <p className="text-xs font-semibold">Traversing Topic Entity Graph...</p>
            </div>
          ) : !data ? (
            <div className="py-16 text-center text-rose-400 text-sm font-semibold">
              Failed to load knowledge graph data.
            </div>
          ) : (
            <>
              {/* Metrics Highlights */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-[var(--bg-input)]/50 border border-[var(--border-color)]">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-1">
                    <Clock size={14} />
                    <span>Focus Time</span>
                  </div>
                  <div className="text-lg font-black text-[color:var(--text-main)]">
                    {metrics?.formatted_study_time || '0m'}
                  </div>
                  <div className="text-[10px] text-[color:var(--text-muted)]">
                    {metrics?.sessions_count || 0} study sessions
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-input)]/50 border border-[var(--border-color)]">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
                    <Award size={14} />
                    <span>Competency</span>
                  </div>
                  <div className="text-lg font-black text-[color:var(--text-main)]">
                    {metrics?.completed_competencies || 0} / {metrics?.total_competencies || 0}
                  </div>
                  <div className="text-[10px] text-[color:var(--text-muted)]">
                    Skill verification stages
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-input)]/50 border border-[var(--border-color)]">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold mb-1">
                    <Bug size={14} />
                    <span>Debug Lab</span>
                  </div>
                  <div className="text-lg font-black text-[color:var(--text-main)]">
                    {metrics?.bugs_resolved_count || 0}
                  </div>
                  <div className="text-[10px] text-[color:var(--text-muted)]">
                    Bugs & obstacles solved
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-input)]/50 border border-[var(--border-color)]">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
                    <GraduationCap size={14} />
                    <span>Quizzes Passed</span>
                  </div>
                  <div className="text-lg font-black text-[color:var(--text-main)]">
                    {data.quizzes?.filter(q => q.passed).length || 0} / {data.quizzes?.length || 0}
                  </div>
                  <div className="text-[10px] text-[color:var(--text-muted)]">
                    Knowledge checks
                  </div>
                </div>
              </div>

              {/* Source Grounding Callout */}
              {topic?.source_reference && (
                <div className="p-3.5 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex items-start gap-3">
                  <FileText size={16} className="text-cyan-400 mt-0.5 shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-cyan-300">Grounding Source: </span>
                    <span className="text-[color:var(--text-muted)]">{topic.source_reference}</span>
                  </div>
                </div>
              )}

              {/* Navigation Sub-Tabs */}
              <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-2 text-xs font-bold">
                {[
                  { id: 'overview', label: 'Overview & Dependencies' },
                  { id: 'competencies', label: `Competencies (${data.competencies?.length || 0})` },
                  { id: 'artifacts', label: `Notes & Docs (${(data.related_notes?.length || 0) + (data.related_materials?.length || 0)})` },
                  { id: 'projects', label: `Projects & Bugs (${(data.related_projects?.length || 0) + (data.bugs_fixed?.length || 0)})` }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      activeTab === t.id 
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' 
                        : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab: Overview & Dependencies DAG */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Prerequisites */}
                    <div className="p-4 rounded-2xl bg-[var(--bg-input)]/40 border border-[var(--border-color)]">
                      <div className="flex items-center gap-2 text-xs font-bold text-[color:var(--text-main)] mb-3">
                        <ArrowLeft size={14} className="text-amber-400" />
                        <span>Prerequisites ({data.prerequisites?.length || 0})</span>
                      </div>
                      {data.prerequisites?.length === 0 ? (
                        <p className="text-xs text-[color:var(--text-muted)] italic">No prerequisite requirements. Ready to study!</p>
                      ) : (
                        <div className="space-y-2">
                          {data.prerequisites.map((p) => (
                            <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs">
                              <span className="font-semibold text-[color:var(--text-main)]">{p.title}</span>
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                                p.status === 'complete' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                              }`}>
                                {p.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Downstream Topics */}
                    <div className="p-4 rounded-2xl bg-[var(--bg-input)]/40 border border-[var(--border-color)]">
                      <div className="flex items-center gap-2 text-xs font-bold text-[color:var(--text-main)] mb-3">
                        <ArrowRight size={14} className="text-cyan-400" />
                        <span>Unlocks Downstream ({data.downstream_topics?.length || 0})</span>
                      </div>
                      {data.downstream_topics?.length === 0 ? (
                        <p className="text-xs text-[color:var(--text-muted)] italic">Final leaf node or capstone topic.</p>
                      ) : (
                        <div className="space-y-2">
                          {data.downstream_topics.map((d) => (
                            <div key={d.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs">
                              <span className="font-semibold text-[color:var(--text-main)]">{d.title}</span>
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-[var(--bg-input)] text-[color:var(--text-muted)]">
                                {d.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Competencies */}
              {activeTab === 'competencies' && (
                <div className="space-y-3">
                  {data.competencies?.length === 0 ? (
                    <p className="text-xs text-[color:var(--text-muted)] italic">No explicit competencies registered yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {data.competencies.map((c) => (
                        <div key={c.id} className="p-3.5 rounded-2xl bg-[var(--bg-input)]/40 border border-[var(--border-color)] flex items-start gap-3">
                          <div className={`mt-0.5 shrink-0 ${c.is_completed ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {c.is_completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400">
                                {c.competency_type}
                              </span>
                              <span className={`text-[10px] font-bold ${c.is_completed ? 'text-emerald-400' : 'text-[color:var(--text-muted)]'}`}>
                                {c.is_completed ? 'Verified' : 'Pending'}
                              </span>
                            </div>
                            <h4 className="text-xs font-semibold text-[color:var(--text-main)] mt-1">{c.title}</h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Notes & Materials */}
              {activeTab === 'artifacts' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Related Notes */}
                  <div className="p-4 rounded-2xl bg-[var(--bg-input)]/40 border border-[var(--border-color)]">
                    <h4 className="text-xs font-bold text-[color:var(--text-main)] mb-3 flex items-center gap-2">
                      <FileText size={14} className="text-cyan-400" />
                      <span>Study Notes ({data.related_notes?.length || 0})</span>
                    </h4>
                    {data.related_notes?.length === 0 ? (
                      <p className="text-xs text-[color:var(--text-muted)] italic">No notes created for this topic yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {data.related_notes.map((n) => (
                          <div key={n.id} className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs">
                            <div className="font-semibold text-[color:var(--text-main)] truncate">{n.title}</div>
                            <div className="text-[10px] text-[color:var(--text-muted)] mt-1">{n.created_at}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Materials */}
                  <div className="p-4 rounded-2xl bg-[var(--bg-input)]/40 border border-[var(--border-color)]">
                    <h4 className="text-xs font-bold text-[color:var(--text-main)] mb-3 flex items-center gap-2">
                      <BookOpen size={14} className="text-amber-400" />
                      <span>Course Materials ({data.related_materials?.length || 0})</span>
                    </h4>
                    {data.related_materials?.length === 0 ? (
                      <p className="text-xs text-[color:var(--text-muted)] italic">No uploaded documents or PDFs attached.</p>
                    ) : (
                      <div className="space-y-2">
                        {data.related_materials.map((m) => (
                          <div key={m.id} className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs">
                            <div className="font-semibold text-[color:var(--text-main)] truncate">{m.title}</div>
                            <div className="text-[10px] text-[color:var(--text-muted)] mt-1">
                              {m.file_type?.toUpperCase()} {m.page_count ? `• ${m.page_count} pages` : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Projects & Bugs */}
              {activeTab === 'projects' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Projects */}
                  <div className="p-4 rounded-2xl bg-[var(--bg-input)]/40 border border-[var(--border-color)]">
                    <h4 className="text-xs font-bold text-[color:var(--text-main)] mb-3 flex items-center gap-2">
                      <FolderKanban size={14} className="text-indigo-400" />
                      <span>Linked Projects ({data.related_projects?.length || 0})</span>
                    </h4>
                    {data.related_projects?.length === 0 ? (
                      <p className="text-xs text-[color:var(--text-muted)] italic">No projects connected yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {data.related_projects.map((p) => (
                          <div key={p.id} className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs">
                            <div className="font-semibold text-[color:var(--text-main)]">{p.title}</div>
                            <div className="flex items-center gap-2 text-[10px] text-[color:var(--text-muted)] mt-1">
                              <span className="uppercase font-bold text-cyan-400">{p.status}</span>
                              <span>• Stage: {p.stage}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bugs & Debug Lab */}
                  <div className="p-4 rounded-2xl bg-[var(--bg-input)]/40 border border-[var(--border-color)]">
                    <h4 className="text-xs font-bold text-[color:var(--text-main)] mb-3 flex items-center gap-2">
                      <Bug size={14} className="text-rose-400" />
                      <span>Debug Lab Journal ({data.bugs_fixed?.length || 0})</span>
                    </h4>
                    {data.bugs_fixed?.length === 0 ? (
                      <p className="text-xs text-[color:var(--text-muted)] italic">No debug entries logged for this topic.</p>
                    ) : (
                      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                        {data.bugs_fixed.map((b) => (
                          <div key={b.id} className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs space-y-1">
                            <div className="font-semibold text-rose-400">{b.title}</div>
                            <p className="text-[11px] text-[color:var(--text-muted)] line-clamp-2">{b.problem}</p>
                            {b.solution && (
                              <div className="text-[10px] text-emerald-400 pt-1 border-t border-[var(--border-color)]/30 font-mono">
                                Fix: {b.solution}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-input)]/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] bg-[var(--bg-input)] border border-[var(--border-color)] shadow-[inset_2px_2px_4px_var(--shadow-dark)] active:scale-95 transition-all cursor-pointer"
          >
            Close Explorer
          </button>
        </div>
      </div>
    </div>
  );
}
