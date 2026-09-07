import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, Code, BrainCircuit, Loader2 } from 'lucide-react';
// import { sendChatMessage } from '../services/api'; // Scaffolding for FastAPI connection

export default function Ai() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hello! I'm your Study OS AI. I can explain complex topics, debug your code, or generate quick quizzes to test your knowledge. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages]);

  const handleSend = async (text = input) => {
    if (!text.trim()) return;
    
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Scaffolding: Call FastAPI backend here
    // try {
    //   const response = await sendChatMessage(text);
    //   setMessages(prev => [...prev, { role: 'ai', content: response.data.reply }]);
    // } catch (err) {
    //   setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I couldn't reach the backend." }]);
    // }

    // Mock Response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', content: `Here is a simulated response to: "${text}". I am currently running in offline mock mode.` }]);
      setIsLoading(false);
    }, 1500);
  };

  const handleQuickAction = (action) => {
    handleSend(action);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-canvas)] text-[color:var(--text-main)] overflow-hidden p-4 md:p-8">
      
      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center gap-2 mb-6">
        <h1 className="text-3xl md:text-4xl font-black tracking-wide flex items-center justify-center gap-3">
          <Bot className="text-sky-400" size={36} />
          AI Assistant
        </h1>
        <p className="text-[color:var(--text-muted)] font-medium text-sm">Your personal tutor and debugging companion.</p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 max-w-4xl w-full mx-auto flex flex-col bg-[var(--bg-panel)] rounded-[32px] shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)] border border-[var(--border-color)] overflow-hidden">
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] ${
                msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-[var(--bg-card)] text-sky-400'
              }`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[80%] p-5 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-indigo-500/10 text-[color:var(--text-main)] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)] border border-indigo-500/20 rounded-tr-sm'
                  : 'bg-[var(--bg-card)] text-[color:var(--text-main)] shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] rounded-tl-sm'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 flex-row">
              <div className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center bg-[var(--bg-card)] shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] text-sky-400">
                <Bot size={20} />
              </div>
              <div className="p-5 rounded-2xl bg-[var(--bg-card)] shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] rounded-tl-sm flex items-center gap-3">
                <Loader2 className="animate-spin text-sky-400" size={20} />
                <span className="text-sm text-[color:var(--text-muted)] animate-pulse">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-[var(--bg-card)] border-t border-[var(--border-color)]">
          
          {/* Quick Actions */}
          <div className="flex justify-center flex-wrap gap-3 mb-5">
            <button 
              onClick={() => handleQuickAction('Please explain this topic simply: ')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-card)] shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] hover:shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] transition-all text-xs font-bold text-sky-400 active:scale-95"
            >
              <Sparkles size={14} /> Explain Topic
            </button>
            <button 
              onClick={() => handleQuickAction('Can you debug this error for me: \n```\n\n```')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-card)] shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] hover:shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] transition-all text-xs font-bold text-red-400 active:scale-95"
            >
              <Code size={14} /> Debug Error
            </button>
            <button 
              onClick={() => handleQuickAction('Generate a short multiple-choice quiz on: ')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-card)] shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] hover:shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] transition-all text-xs font-bold text-emerald-400 active:scale-95"
            >
              <BrainCircuit size={14} /> Generate Quiz
            </button>
          </div>

          {/* Inset Text Input */}
          <div className="flex gap-4">
            <div className="flex-1 bg-[var(--bg-input)] rounded-2xl shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)] flex items-center p-1">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything about your study..." 
                className="w-full bg-transparent border-none outline-none text-[color:var(--text-main)] px-4 py-3 text-sm placeholder-slate-500"
              />
            </div>
            
            <button 
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="w-12 h-12 flex-shrink-0 rounded-xl bg-[var(--bg-card)] shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] hover:shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] transition-all flex items-center justify-center text-sky-400 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <Send size={20} className="ml-1" />
            </button>
          </div>
          
        </div>
      </div>

    </div>
  );
}
