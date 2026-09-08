import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  X, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Lightbulb, 
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { getTopicVerificationQuiz, updateTopicStatus, sendAiChat } from '../../services/api';

export default function TopicQuizVerificationModal({
  topic = null,
  isOpen: propIsOpen = false,
  onClose = () => {},
  onVerified = () => {}
}) {
  const [isOpen, setIsOpen] = useState(propIsOpen);
  const [activeTopic, setActiveTopic] = useState(topic);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [resultState, setResultState] = useState(null); // 'correct' | 'incorrect' | null
  const [isShaking, setIsShaking] = useState(false);
  const [hintText, setHintText] = useState(null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Sync prop changes
  useEffect(() => {
    setIsOpen(propIsOpen);
    if (topic) setActiveTopic(topic);
  }, [propIsOpen, topic]);

  // Global event listener for easy dispatch from MindMap, Topics, etc.
  useEffect(() => {
    const handleGlobalTrigger = (e) => {
      if (e.detail) {
        setActiveTopic(e.detail);
        setIsOpen(true);
        setQuizData(null);
        setSelectedIdx(null);
        setResultState(null);
        setHintText(null);
      }
    };
    window.addEventListener('studyos-verify-topic-quiz', handleGlobalTrigger);
    return () => window.removeEventListener('studyos-verify-topic-quiz', handleGlobalTrigger);
  }, []);

  // Fetch quiz challenge whenever modal opens for a topic
  useEffect(() => {
    if (isOpen && activeTopic?.id) {
      fetchQuiz(activeTopic.id);
    }
  }, [isOpen, activeTopic?.id]);

  const fetchQuiz = async (topicId) => {
    setLoadingQuiz(true);
    setResultState(null);
    setSelectedIdx(null);
    setHintText(null);
    try {
      const data = await getTopicVerificationQuiz(topicId);
      setQuizData(data);
    } catch (err) {
      console.warn("Error fetching verification quiz:", err);
      // Fallback local quiz structure
      setQuizData({
        topic_id: topicId,
        topic_title: activeTopic?.title || 'Engineering Architecture',
        question: `In ${activeTopic?.title || 'this engineering domain'}, which fundamental architectural principle guarantees consistency and fault isolation?`,
        options: [
          'Strict boundary enforcement and idempotency checks',
          'Disabling error boundaries to accelerate throughput',
          'Eliminating database connection pooling',
          'Hardcoding static credentials across all instances'
        ],
        correct_answer_index: 0,
        explanation: 'Boundary enforcement and idempotency isolate failures and maintain state consistency during transient faults.',
        provider: 'offline_heuristic'
      });
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleVerify = async () => {
    if (selectedIdx === null || !quizData || submitting) return;
    setSubmitting(true);

    const isCorrect = selectedIdx === quizData.correct_answer_index;

    if (isCorrect) {
      setResultState('correct');
      try {
        await updateTopicStatus(activeTopic.id, 'COMPLETE', 100, {
          quiz_verified: true,
          evidence_notes: `Verified via Gemini Anti-Fake-Progress challenge: "${quizData.question.slice(0, 50)}..."`
        });

        window.dispatchEvent(new CustomEvent('studyos-show-toast', {
          detail: {
            type: 'success',
            title: 'Mastery Verified! 🏆',
            message: `Topic "${activeTopic.title}" verified and logged to ActivityLog.`
          }
        }));

        window.dispatchEvent(new CustomEvent('studyos-topic-status-updated', {
          detail: { id: activeTopic.id, status: 'COMPLETE', progress: 100 }
        }));

        setTimeout(() => {
          onVerified(activeTopic.id);
          handleClose();
        }, 1800);
      } catch (err) {
        console.warn("Status update error:", err);
      }
    } else {
      setResultState('incorrect');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 700);

      try {
        // Keep status as LEARNING
        await updateTopicStatus(activeTopic.id, 'LEARNING', 50);
        window.dispatchEvent(new CustomEvent('studyos-topic-status-updated', {
          detail: { id: activeTopic.id, status: 'LEARNING', progress: 50 }
        }));
      } catch (err) {
        // ignore
      }
    }
    setSubmitting(false);
  };

  const handleRequestHint = async () => {
    if (!quizData || loadingHint) return;
    setLoadingHint(true);
    try {
      const prompt = `I am taking a verification challenge for '${activeTopic?.title}'. The question is: "${quizData.question}". Give me a Socratic hint or guiding principle to help me choose the right answer without revealing the option directly.`;
      const res = await sendAiChat({
        message: prompt,
        mode: 'hint',
        context_topic: activeTopic?.title
      });
      setHintText(res.reply);
    } catch (err) {
      setHintText("Focus on foundational resilience patterns, failure isolation, and consistency invariants.");
    } finally {
      setLoadingHint(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuizData(null);
    setSelectedIdx(null);
    setResultState(null);
    setHintText(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`relative w-full max-w-xl rounded-[32px] bg-[var(--bg-card)] border-2 transition-all duration-300 shadow-[16px_16px_32px_var(--shadow-dark),-16px_-16px_32px_var(--shadow-light)] overflow-hidden ${
          resultState === 'correct' 
            ? 'border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.3)]' 
            : resultState === 'incorrect' 
              ? 'border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.3)]' 
              : 'border-cyan-500/40'
        } ${isShaking ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
      >
        
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[var(--border-color)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${
              resultState === 'correct' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/10 text-cyan-400'
            } shadow-[inset_2px_2px_4px_var(--shadow-dark)]`}>
              <ShieldCheck size={26} />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-cyan-400">
                Anti-Fake-Progress Verification Gate
              </span>
              <h2 className="text-xl font-black text-[color:var(--text-main)] leading-tight">
                {activeTopic?.title || "Topic Mastery Challenge"}
              </h2>
            </div>
          </div>

          <button 
            onClick={handleClose}
            className="p-2 rounded-xl text-[color:var(--text-muted)] hover:text-white bg-[var(--bg-input)] cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">
          {loadingQuiz ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <Loader2 className="animate-spin text-cyan-400" size={36} />
              <p className="text-sm font-bold text-cyan-300 animate-pulse">
                Generating conceptual challenge with Gemini 1.5 Flash...
              </p>
              <p className="text-xs text-[color:var(--text-muted)]">
                Testing genuine engineering reasoning, not rote memorization.
              </p>
            </div>
          ) : quizData ? (
            <>
              {/* Question Box */}
              <div className="p-5 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-color)] shadow-[inset_3px_3px_6px_var(--shadow-dark),inset_-3px_-3px_6px_var(--shadow-light)]">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--text-muted)]">
                  Conceptual Question ({quizData.provider || 'gemini-1.5-flash'})
                </span>
                <p className="text-base font-bold text-[color:var(--text-main)] mt-1.5 leading-relaxed">
                  {quizData.question}
                </p>
              </div>

              {/* Options */}
              <div className="flex flex-col gap-2.5">
                {quizData.options?.map((opt, idx) => {
                  const isSelected = selectedIdx === idx;
                  const isCorrect = idx === quizData.correct_answer_index;
                  let btnStyle = "border-[var(--border-color)] bg-[var(--bg-card)] text-[color:var(--text-main)] shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)]";

                  if (resultState === 'correct') {
                    if (isCorrect) {
                      btnStyle = "border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold shadow-[0_0_15px_rgba(52,211,153,0.3)]";
                    } else {
                      btnStyle = "border-transparent opacity-40";
                    }
                  } else if (resultState === 'incorrect') {
                    if (isSelected) {
                      btnStyle = "border-rose-500 bg-rose-500/20 text-rose-300 font-bold shadow-[0_0_15px_rgba(244,63,94,0.3)]";
                    }
                  } else if (isSelected) {
                    btnStyle = "border-cyan-400 bg-cyan-500/10 text-cyan-300 shadow-[inset_2px_2px_4px_var(--shadow-dark)]";
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={resultState === 'correct'}
                      onClick={() => {
                        setSelectedIdx(idx);
                        setResultState(null);
                      }}
                      className={`w-full p-4 rounded-2xl border text-left text-sm flex items-start gap-3 transition-all cursor-pointer ${btnStyle}`}
                    >
                      <span className="w-6 h-6 rounded-lg bg-[var(--bg-input)] flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="leading-snug">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback Alert */}
              {resultState === 'correct' && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex flex-col gap-1.5 animate-in fade-in">
                  <div className="flex items-center gap-2 font-black text-sm text-emerald-400">
                    <CheckCircle size={18} /> Verified Mastery! Status Updated to COMPLETE.
                  </div>
                  {quizData.explanation && (
                    <p className="text-emerald-200/90 pl-6 leading-relaxed">
                      {quizData.explanation}
                    </p>
                  )}
                </div>
              )}

              {resultState === 'incorrect' && (
                <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex flex-col gap-2.5 animate-in fade-in">
                  <div className="flex items-center gap-2 font-black text-sm text-rose-400">
                    <AlertCircle size={18} /> Incorrect Answer. Anti-Fake-Progress Gate Enforced.
                  </div>
                  <p className="text-rose-200/90 leading-relaxed">
                    Topic status remains <strong className="text-white">LEARNING</strong>. Real engineering requires understanding the underlying mechanics.
                  </p>
                  <button
                    type="button"
                    onClick={handleRequestHint}
                    disabled={loadingHint}
                    className="self-start flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold hover:bg-amber-500/30 transition-all text-xs"
                  >
                    <Lightbulb size={14} />
                    {loadingHint ? "Getting Socratic Hint..." : "Ask AI for a Hint"}
                  </button>
                </div>
              )}

              {/* Socratic Hint Box */}
              {hintText && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-col gap-1 animate-in fade-in">
                  <span className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb size={14} /> Socratic AI Hint:
                  </span>
                  <p className="leading-relaxed pl-5 whitespace-pre-wrap">{hintText}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-sm text-[color:var(--text-muted)] py-6">
              Could not load verification challenge.
            </p>
          )}
        </div>

        {/* Actions Footer */}
        <div className="p-5 border-t border-[var(--border-color)] bg-[var(--bg-panel)] flex items-center justify-between">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-[color:var(--text-muted)] hover:text-white transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {resultState === 'incorrect' && (
              <button
                type="button"
                onClick={() => fetchQuiz(activeTopic.id)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[var(--bg-input)] text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/10 transition-all"
              >
                <RotateCcw size={14} /> Try Another Question
              </button>
            )}

            <button
              type="button"
              disabled={selectedIdx === null || submitting || resultState === 'correct'}
              onClick={handleVerify}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={14} /> Verifying...
                </>
              ) : (
                <>
                  Verify & Mark Complete <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
