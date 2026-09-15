import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Phase 7 & 9: Signature Branded Loader & Intelligent Loading Messages
 * Used for long-running AI tasks.
 */

const defaultMessages = [
  "Analyzing your material...",
  "Extracting key concepts...",
  "Building knowledge dependencies...",
  "Preparing your StudySpace..."
];

export default function SignatureLoader({ messages = defaultMessages, interval = 2500 }) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) return;
    const timer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, interval);
    return () => clearInterval(timer);
  }, [messages, interval]);

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in-95 duration-500">
      {/* Signature Glowing 'O' Animation */}
      <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
        {/* Core O */}
        <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 border-r-cyan-400 border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '1.5s' }}></div>
        <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-transparent border-b-blue-500 border-l-blue-500 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
        
        {/* Expanding Nodes */}
        <div className="absolute w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)] animate-ping" style={{ top: '-10px', left: '50%', animationDuration: '2s' }}></div>
        <div className="absolute w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)] animate-ping" style={{ bottom: '10px', right: '-15px', animationDuration: '2.5s', animationDelay: '0.5s' }}></div>
        <div className="absolute w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-ping" style={{ bottom: '10px', left: '-15px', animationDuration: '2.2s', animationDelay: '1s' }}></div>
        
        <Sparkles className="text-cyan-400 animate-pulse relative z-10" size={24} />
      </div>

      {/* Intelligent Loading Message */}
      <div className="h-8 relative w-full max-w-sm overflow-hidden">
        {messages.map((msg, i) => (
          <div
            key={msg}
            className={`absolute inset-0 flex items-center justify-center w-full transition-all duration-500 ${
              i === msgIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <p className="text-sm font-black tracking-widest uppercase text-cyan-400/90 drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">
              {msg}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
