import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, ArrowRight, RotateCcw, Award, Zap } from 'lucide-react';

export default function Quizzes() {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const questions = [
    {
      id: 1,
      category: 'Debugging & Networking',
      scenario: 'Your production API server is returning HTTP 502 Bad Gateway to incoming requests through Nginx.',
      question: 'What is the most likely root cause?',
      options: [
        { id: 'A', text: 'The client sent an invalid JSON payload in the request body.' },
        { id: 'B', text: 'The upstream application service (e.g. Uvicorn/Gunicorn) is stopped or crashed.' },
        { id: 'C', text: 'Nginx failed to read its own SSL certificates.' },
        { id: 'D', text: 'The client IP is being rate-limited by the firewall.' },
      ],
      correct: 'B',
      explanation: '502 Bad Gateway indicates that Nginx acted as a reverse proxy/gateway and received an invalid response (or connection refused) from the upstream application server.'
    },
    {
      id: 2,
      category: 'Docker & Containers',
      scenario: 'You want to build a lightweight container image for a Python FastAPI microservice.',
      question: 'Which multi-stage Docker build practice is best suited to reduce final image size?',
      options: [
        { id: 'A', text: 'Compile build dependencies and virtualenv in a builder stage, then copy only the virtualenv into a python:slim or distroless runner stage.' },
        { id: 'B', text: 'Use an Ubuntu base image and run apt-get clean at the very end.' },
        { id: 'C', text: 'Store build artifacts inside a volume mounted during image build.' },
        { id: 'D', text: 'Include gcc and python-dev in the final stage for runtime optimizations.' },
      ],
      correct: 'A',
      explanation: 'Multi-stage builds allow compiling wheels and installing build tools in an ephemeral builder image, keeping the final production image small and secure.'
    },
    {
      id: 3,
      category: 'Database & Transactions',
      scenario: 'Two concurrent transactions update the same row in PostgreSQL without explicit row locking.',
      question: 'What isolation level guarantees repeatable reads and prevents phantom reads in PostgreSQL?',
      options: [
        { id: 'A', text: 'Read Uncommitted' },
        { id: 'B', text: 'Read Committed' },
        { id: 'C', text: 'Serializable' },
        { id: 'D', text: 'Snapshot Fallback' },
      ],
      correct: 'C',
      explanation: 'In PostgreSQL, the Serializable isolation level provides the strictest transaction isolation, preventing dirty reads, non-repeatable reads, phantom reads, and serialization anomalies.'
    }
  ];

  const currentQ = questions[currentQIndex];

  const handleSelect = (id) => {
    if (!isSubmitted) {
      setSelectedOption(id);
    }
  };

  const handleSubmit = () => {
    if (!selectedOption) return;
    setIsSubmitted(true);
    if (selectedOption === currentQ.correct) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
    setCurrentQIndex((prev) => (prev + 1) % questions.length);
  };

  const handleReset = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
    setCurrentQIndex(0);
    setScore(0);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-canvas)] text-[color:var(--text-main)] overflow-y-auto p-6 md:p-8 gap-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-[var(--bg-card)] shadow-[6px_6px_14px_var(--shadow-dark),-6px_-6px_14px_var(--shadow-light)] border border-[var(--border-color)]">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-[var(--bg-panel)] shadow-[inset_3px_3px_6px_var(--shadow-dark),inset_-3px_-3px_6px_var(--shadow-light)] text-indigo-400">
            <HelpCircle size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 uppercase">
              Engineering Quizzes
            </h1>
            <p className="text-xs font-semibold text-[color:var(--text-muted)]">
              Scenario-based knowledge testing & architectural reasoning
            </p>
          </div>
        </div>

        {/* Score & Counter */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs font-bold bg-[var(--bg-input)] px-4 py-2 rounded-2xl shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] border border-[var(--border-color)]">
            <Award size={16} className="text-amber-400" />
            <span className="text-[color:var(--text-muted)]">Score:</span>
            <span className="text-indigo-400 font-black">{score} / {questions.length}</span>
          </div>

          <div className="text-xs font-bold text-[color:var(--text-muted)]">
            Question <span className="text-cyan-400">{currentQIndex + 1}</span> of {questions.length}
          </div>
        </div>
      </div>

      {/* Main Quiz Area */}
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
        
        {/* Scenario Card */}
        <div className="p-8 rounded-3xl bg-[var(--bg-card)] shadow-[8px_8px_18px_var(--shadow-dark),-8px_-8px_18px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[var(--bg-input)] text-indigo-400 border border-indigo-500/20">
              {currentQ.category}
            </span>
          </div>

          <p className="text-sm md:text-base font-semibold text-[color:var(--text-muted)] bg-[var(--bg-input)] p-4 rounded-2xl border border-[var(--border-color)] shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] leading-relaxed">
            {currentQ.scenario}
          </p>

          <h2 className="text-xl md:text-2xl font-bold text-[color:var(--text-main)] pt-2">
            {currentQ.question}
          </h2>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQ.options.map((opt) => {
            const isSelected = selectedOption === opt.id;
            const isCorrect = opt.id === currentQ.correct;

            let borderClass = 'border-[var(--border-color)]';
            let shadowClass = 'shadow-[4px_4px_10px_var(--shadow-dark),-4px_-4px_10px_var(--shadow-light)]';
            let bgClass = 'bg-[var(--bg-card)]';

            if (isSubmitted) {
              if (isCorrect) {
                borderClass = 'border-emerald-500/60';
                bgClass = 'bg-emerald-500/10 text-emerald-300';
              } else if (isSelected && !isCorrect) {
                borderClass = 'border-red-500/60';
                bgClass = 'bg-red-500/10 text-red-300';
              }
            } else if (isSelected) {
              borderClass = 'border-cyan-500/50';
              shadowClass = 'shadow-[inset_3px_3px_6px_var(--shadow-dark),inset_-3px_-3px_6px_var(--shadow-light)]';
              bgClass = 'bg-[var(--bg-input)] text-cyan-400';
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`p-5 rounded-2xl flex items-start gap-4 text-left transition-all duration-200 border cursor-pointer ${bgClass} ${borderClass} ${shadowClass} active:scale-[0.99]`}
              >
                <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                  isSelected ? 'bg-cyan-500 text-slate-950 shadow-[0_0_8px_rgba(34,211,238,0.6)]' : 'bg-[var(--bg-panel)] text-[color:var(--text-muted)] shadow-[inset_1px_1px_2px_var(--shadow-dark)]'
                }`}>
                  {opt.id}
                </div>
                <span className="text-xs md:text-sm font-semibold leading-relaxed text-[color:var(--text-main)]">
                  {opt.text}
                </span>
              </button>
            );
          })}
        </div>

        {/* Feedback Alert when submitted */}
        {isSubmitted && (
          <div className={`p-6 rounded-2xl flex items-start gap-4 border animate-in fade-in slide-in-from-top-2 duration-300 ${
            selectedOption === currentQ.correct 
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 shadow-[inset_2px_2px_6px_rgba(16,185,129,0.2)]'
              : 'bg-red-500/10 border-red-500/40 text-red-300 shadow-[inset_2px_2px_6px_rgba(239,68,68,0.2)]'
          }`}>
            {selectedOption === currentQ.correct ? (
              <CheckCircle2 size={24} className="text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle size={24} className="text-red-400 shrink-0 mt-0.5" />
            )}
            <div className="flex flex-col gap-1">
              <span className="font-bold text-sm">
                {selectedOption === currentQ.correct ? 'Correct Solution!' : 'Incorrect Choice'}
              </span>
              <p className="text-xs opacity-90 leading-relaxed">
                {currentQ.explanation}
              </p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] bg-[var(--bg-card)] shadow-[3px_3px_6px_var(--shadow-dark),-3px_-3px_6px_var(--shadow-light)] active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw size={16} /> Reset
          </button>

          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={!selectedOption}
              className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-[4px_4px_10px_var(--shadow-dark),-4px_-4px_10px_var(--shadow-light)] cursor-pointer ${
                selectedOption
                  ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-slate-950 active:scale-95 shadow-[0_0_12px_rgba(34,211,238,0.4)]'
                  : 'bg-[var(--bg-card)] text-[color:var(--text-muted)] opacity-50 cursor-not-allowed'
              }`}
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(52,211,153,0.4)] active:scale-95 transition-all cursor-pointer"
            >
              Next Question <ArrowRight size={16} />
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
