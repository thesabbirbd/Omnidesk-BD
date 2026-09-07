import React, { useState } from 'react';
import { RotateCcw, Check, Sparkles, ArrowLeft, ArrowRight, Layers, Flame } from 'lucide-react';

export default function Flashcards() {
  const [flipped, setFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const cards = [
    {
      topic: 'PostgreSQL Fundamentals',
      question: 'What is the purpose of an INDEX in a relational database?',
      answer: 'An index is a data structure (commonly B-tree) that improves the speed of data retrieval operations on a table at the cost of additional storage and slower writes.',
      difficulty: 'Medium',
    },
    {
      topic: 'Docker & Containers',
      question: 'What is the difference between an Image and a Container?',
      answer: 'An image is a read-only template with instructions for creating a Docker container. A container is a runnable instance of an image with an isolated writable filesystem layer.',
      difficulty: 'Easy',
    },
    {
      topic: 'FastAPI & APIs',
      question: 'What is the role of Pydantic in FastAPI?',
      answer: 'Pydantic handles data validation, serialization, and schema generation based on Python type hints, ensuring requests and responses conform to defined contracts.',
      difficulty: 'Medium',
    },
    {
      topic: 'Linux & DevOps',
      question: 'What does the HTTP 429 status code mean and how should a client handle it?',
      answer: 'Too Many Requests (Rate Limiting). The client should back off, observe the Retry-After header, and implement exponential backoff with jitter.',
      difficulty: 'Hard',
    }
  ];

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-canvas)] text-[color:var(--text-main)] overflow-y-auto p-6 md:p-8 gap-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-[var(--bg-card)] shadow-[6px_6px_14px_var(--shadow-dark),-6px_-6px_14px_var(--shadow-light)] border border-[var(--border-color)]">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-[var(--bg-panel)] shadow-[inset_3px_3px_6px_var(--shadow-dark),inset_-3px_-3px_6px_var(--shadow-light)] text-pink-400">
            <RotateCcw size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400 uppercase">
              Flashcards Deck
            </h1>
            <p className="text-xs font-semibold text-[color:var(--text-muted)]">
              Active Recall & Spaced Repetition Practice
            </p>
          </div>
        </div>

        {/* Deck Progress Pill */}
        <div className="flex items-center gap-4 text-xs font-bold bg-[var(--bg-input)] px-4 py-2 rounded-2xl shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] border border-[var(--border-color)]">
          <span className="text-[color:var(--text-muted)]">Card</span>
          <span className="text-pink-400 text-sm font-black">{currentIndex + 1} / {cards.length}</span>
          <div className="w-24 h-2 rounded-full bg-[var(--bg-card)] overflow-hidden">
            <div 
              className="h-full bg-pink-400 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Flashcard Container */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[420px] gap-8">
        
        {/* 3D Flip Card */}
        <div 
          className="relative w-full max-w-2xl h-80 cursor-pointer select-none"
          style={{ perspective: '1200px' }}
          onClick={() => setFlipped(!flipped)}
        >
          <div 
            className="w-full h-full relative transition-all duration-500 ease-out"
            style={{ 
              transformStyle: 'preserve-3d', 
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' 
            }}
          >
            {/* Front: Question */}
            <div 
              className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-8 rounded-3xl bg-[var(--bg-card)] shadow-[10px_10px_20px_var(--shadow-dark),-10px_-10px_20px_var(--shadow-light)] border border-[var(--border-color)]"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="absolute top-6 left-8 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[var(--bg-input)] text-pink-400 border border-pink-500/20">
                  {currentCard.topic}
                </span>
                <span className="text-[10px] font-bold text-[color:var(--text-muted)]">
                  • {currentCard.difficulty}
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-[color:var(--text-main)] text-center leading-relaxed px-6">
                {currentCard.question}
              </h2>

              <p className="absolute bottom-6 text-[color:var(--text-muted)] text-xs font-semibold flex items-center gap-2">
                <Sparkles size={14} className="text-pink-400" />
                Click anywhere to flip and reveal answer
              </p>
            </div>

            {/* Back: Answer */}
            <div 
              className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-8 rounded-3xl bg-[var(--bg-card)] shadow-[inset_6px_6px_12px_var(--shadow-dark),inset_-6px_-6px_12px_var(--shadow-light)] border border-pink-500/30"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <span className="absolute top-6 left-8 text-xs font-black uppercase tracking-widest text-pink-400">
                Answer & Key Insight
              </span>

              <p className="text-lg md:text-xl font-medium text-[color:var(--text-main)] text-center leading-relaxed px-8">
                {currentCard.answer}
              </p>

              <span className="absolute bottom-6 text-xs text-[color:var(--text-muted)] font-semibold">
                Rate your recall below to adjust review interval
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
          
          {/* Spaced-Repetition Rating (when flipped) */}
          <div className={`flex items-center gap-3 transition-all duration-300 ${flipped ? 'opacity-100 scale-100' : 'opacity-30 pointer-events-none scale-95'}`}>
            <button 
              onClick={handleNext} 
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[var(--bg-card)] text-red-400 shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] active:shadow-[inset_2px_2px_4px_var(--shadow-dark)] hover:scale-105 transition-all cursor-pointer"
            >
              Again (&lt; 1m)
            </button>
            <button 
              onClick={handleNext} 
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[var(--bg-card)] text-orange-400 shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] active:shadow-[inset_2px_2px_4px_var(--shadow-dark)] hover:scale-105 transition-all cursor-pointer"
            >
              Hard (2d)
            </button>
            <button 
              onClick={handleNext} 
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[var(--bg-card)] text-cyan-400 shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] active:shadow-[inset_2px_2px_4px_var(--shadow-dark)] hover:scale-105 transition-all cursor-pointer"
            >
              Good (4d)
            </button>
            <button 
              onClick={handleNext} 
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[var(--bg-card)] text-emerald-400 shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] active:shadow-[inset_2px_2px_4px_var(--shadow-dark)] hover:scale-105 transition-all cursor-pointer"
            >
              Easy (7d)
            </button>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center justify-between w-full px-4 pt-2">
            <button 
              onClick={handlePrev}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] bg-[var(--bg-card)] shadow-[3px_3px_6px_var(--shadow-dark),-3px_-3px_6px_var(--shadow-light)] active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft size={16} /> Previous
            </button>

            <button 
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-pink-400 bg-[var(--bg-card)] shadow-[3px_3px_6px_var(--shadow-dark),-3px_-3px_6px_var(--shadow-light)] active:scale-95 transition-all cursor-pointer"
            >
              Next <ArrowRight size={16} />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
