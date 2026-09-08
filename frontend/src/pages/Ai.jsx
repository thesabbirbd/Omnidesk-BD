import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  Code, 
  BrainCircuit, 
  Loader2, 
  Lightbulb, 
  Wrench, 
  HelpCircle,
  Hash,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { sendAiChat } from '../services/api';

export default function Ai() {
  const [activeMode, setActiveMode] = useState('explain'); // 'explain' | 'hint' | 'debug'
  const [contextTopic, setContextTopic] = useState(() => {
    return localStorage.getItem('studyos_active_topic') || 'PostgreSQL Architecture';
  });
  const [messages, setMessages] = useState([
    { 
      role: 'ai', 
      content: "Hello! I am your Omni-AI Mentor powered by Gemini 1.5 Flash. I operate in 3 specialized modes:\n\n• **Explain**: Feynman technique breakdowns with intuitive analogies.\n• **Hint**: Socratic guidance—I guide your reasoning without dumping full solutions.\n• **Debug**: Engineering Lab root-cause analysis and structured hypotheses.\n\nSelect a mode or quick-action chip below to begin!",
      mode: 'explain',
      provider: 'gemini-1.5-flash'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages, isLoading]);

  // Sync active topic from local storage or external updates
  useEffect(() => {
    const handleTopicChange = (e) => {
      if (e.detail?.title) {
        setContextTopic(e.detail.title);
      }
    };
    window.addEventListener('studyos-topic-selected', handleTopicChange);
    return () => window.removeEventListener('studyos-topic-selected', handleTopicChange);
  }, []);

  const handleSend = async (messageText = input, modeOverride = null) => {
    const textToSend = messageText.trim();
    if (!textToSend || isLoading) return;

    const currentMode = modeOverride || activeMode;
    const userMsg = { 
      role: 'user', 
      content: textToSend,
      mode: currentMode,
      contextTopic: contextTopic 
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendAiChat({
        message: textToSend,
        mode: currentMode,
        context_topic: contextTopic
      });

      setMessages(prev => [
        ...prev, 
        { 
          role: 'ai', 
          content: response.reply,
          mode: response.mode || currentMode,
          provider: response.provider || 'gemini-1.5-flash'
        }
      ]);
    } catch (err) {
      const errorDetail = err.response?.data?.detail || "Could not connect to AI Assistant.";
      setMessages(prev => [
        ...prev, 
        { 
          role: 'ai', 
          content: `⚠️ Error: ${errorDetail}. Please check your connection or quota.`,
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerQuickAction = (mode, promptTemplate) => {
    setActiveMode(mode);
    const populated = promptTemplate.replace('{TOPIC}', contextTopic);
    setInput(populated);
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-canvas)] text-[color:var(--text-main)] overflow-hidden p-4 md:p-6">
      
      {/* Header & Mode Selectors */}
      <div className="flex flex-col items-center justify-center text-center gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-400 shadow-[inset_2px_2px_4px_var(--shadow-dark)]">
            <Bot size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Omni-AI Assistant & Debug Lab
            </h1>
            <p className="text-[color:var(--text-muted)] text-xs font-medium">
              Gemini 1.5 Flash Free Tier • Socratic & Feynman Active Learning
            </p>
          </div>
        </div>

        {/* Mode Selector Chips */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-color)] shadow-[inset_3px_3px_6px_var(--shadow-dark),inset_-3px_-3px_6px_var(--shadow-light)]">
          <button
            type="button"
            onClick={() => setActiveMode('explain')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'explain'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'text-[color:var(--text-muted)] hover:text-cyan-400'
            }`}
          >
            <Lightbulb size={14} /> Explain (Feynman)
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('hint')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'hint'
                ? 'bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                : 'text-[color:var(--text-muted)] hover:text-amber-400'
            }`}
          >
            <HelpCircle size={14} /> Give Hint (Socratic)
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('debug')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'debug'
                ? 'bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                : 'text-[color:var(--text-muted)] hover:text-rose-400'
            }`}
          >
            <Wrench size={14} /> Debug Error (Lab)
          </button>
        </div>

        {/* Active Context Topic Chip */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[color:var(--text-muted)] font-medium flex items-center gap-1">
            <Hash size={13} className="text-cyan-400" /> Active Mind Map Topic:
          </span>
          <input 
            type="text"
            value={contextTopic}
            onChange={(e) => {
              setContextTopic(e.target.value);
              localStorage.setItem('studyos_active_topic', e.target.value);
            }}
            placeholder="Set topic name..."
            className="px-3 py-1 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] text-cyan-300 font-bold text-xs focus:outline-none focus:border-cyan-400 shadow-[inset_2px_2px_4px_var(--shadow-dark)]"
          />
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 max-w-4xl w-full mx-auto flex flex-col bg-[var(--bg-panel)] rounded-[32px] shadow-[10px_10px_20px_var(--shadow-dark),-10px_-10px_20px_var(--shadow-light)] border border-[var(--border-color)] overflow-hidden">
        
        {/* Quick Action Bar at Top of Messages */}
        <div className="px-6 py-3 bg-[var(--bg-card)]/70 border-b border-[var(--border-color)] flex items-center justify-between gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--text-muted)] shrink-0">
            Quick Prompts:
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => triggerQuickAction('explain', "Explain the core mechanics and fundamentals of '{TOPIC}' simply with a real-world analogy.")}
              className="px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 text-xs font-medium transition-all"
            >
              💡 Explain Topic
            </button>
            <button
              onClick={() => triggerQuickAction('hint', "I am solving an issue with '{TOPIC}'. Give me a guiding clue or question without giving away the full answer.")}
              className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 text-xs font-medium transition-all"
            >
              🔍 Give Hint
            </button>
            <button
              onClick={() => triggerQuickAction('debug', "I'm experiencing an unexpected failure in '{TOPIC}'. What are the 3 most likely root causes and how do I inspect them?")}
              className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 text-xs font-medium transition-all"
            >
              🛠️ Debug Error
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className={`w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center shadow-[3px_3px_6px_var(--shadow-dark),-3px_-3px_6px_var(--shadow-light)] ${
                msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-[var(--bg-card)] text-sky-400 border border-sky-500/30'
              }`}>
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] p-5 rounded-2xl relative group ${
                msg.role === 'user'
                  ? 'bg-indigo-500/15 text-[color:var(--text-main)] border border-indigo-500/30 rounded-tr-xs shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)]'
                  : 'bg-[var(--bg-card)] text-[color:var(--text-main)] shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] border border-[var(--border-color)] rounded-tl-xs'
              }`}>
                {/* Meta Badge */}
                {msg.role === 'ai' && (
                  <div className="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-[var(--border-color)] text-[11px] text-[color:var(--text-muted)]">
                    <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-cyan-400">
                      <Sparkles size={12} /> {msg.provider || 'gemini-1.5-flash'} • {msg.mode || 'explain'} mode
                    </span>
                    <button
                      onClick={() => handleCopy(msg.content, idx)}
                      className="opacity-60 hover:opacity-100 transition-opacity p-1 text-[color:var(--text-muted)] hover:text-cyan-400"
                      title="Copy response"
                    >
                      {copiedIdx === idx ? <Check size={14} className="text-teal-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                )}

                <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 flex-row">
              <div className="w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center bg-[var(--bg-card)] shadow-[3px_3px_6px_var(--shadow-dark),-3px_-3px_6px_var(--shadow-light)] text-sky-400 border border-sky-500/30">
                <Bot size={18} />
              </div>
              <div className="p-4 rounded-2xl bg-[var(--bg-card)] shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] rounded-tl-xs flex items-center gap-3 border border-sky-500/20">
                <Loader2 className="animate-spin text-sky-400" size={18} />
                <span className="text-xs text-sky-400 font-bold animate-pulse">
                  Gemini 1.5 Flash analyzing in {activeMode} mode...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-5 bg-[var(--bg-card)] border-t border-[var(--border-color)]">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            <div className="flex-1 relative">
              <textarea 
                rows="1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`Ask ${activeMode === 'explain' ? 'for an explanation' : activeMode === 'hint' ? 'for a guiding clue' : 'for root-cause debugging'} (Press Enter to send)...`}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[color:var(--text-main)] text-sm rounded-2xl py-3 px-4 focus:outline-none focus:border-cyan-500/50 shadow-[inset_3px_3px_6px_var(--shadow-dark),inset_-3px_-3px_6px_var(--shadow-light)] resize-none"
              />
            </div>
            
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
              title="Send prompt"
            >
              <Send size={18} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
