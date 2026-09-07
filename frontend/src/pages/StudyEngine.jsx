import React, { useState } from 'react';
import { Check, X, RotateCcw, BrainCircuit, Activity, LayoutList } from 'lucide-react';

export default function StudyEngine() {
  const [activeTab, setActiveTab] = useState('competency');

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-card)] text-[color:var(--text-main)] p-6 rounded-2xl overflow-hidden shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)]">
      <header className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border-color)]">
        <h1 className="text-3xl font-bold tracking-wide flex items-center gap-3">
          <BrainCircuit className="text-blue-400" size={32} />
          Study Engine
        </h1>
        
        <div className="flex gap-4">
          <TabButton active={activeTab === 'competency'} onClick={() => setActiveTab('competency')} icon={LayoutList} label="Competency" />
          <TabButton active={activeTab === 'flashcards'} onClick={() => setActiveTab('flashcards')} icon={RotateCcw} label="Flashcards" />
          <TabButton active={activeTab === 'quiz'} onClick={() => setActiveTab('quiz')} icon={Activity} label="Quiz Engine" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {activeTab === 'competency' && <CompetencyEngine />}
        {activeTab === 'flashcards' && <FlashcardEngine />}
        {activeTab === 'quiz' && <QuizEngine />}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ease-out active:scale-95 ${
        active 
          ? 'text-blue-400 bg-[var(--bg-card)] shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)]' 
          : 'text-[color:var(--text-muted)] bg-[var(--bg-card)] shadow-[4px_4px_10px_var(--shadow-dark),-4px_-4px_10px_var(--shadow-light)] hover:text-[color:var(--text-main)]'
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );
}

// 1. Competency Engine (Checklist)
function CompetencyEngine() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Understand SELECT, INSERT, UPDATE, DELETE', checked: true },
    { id: 2, title: 'Write queries with JOINs', checked: false },
    { id: 3, title: 'Design normalized tables', checked: false },
    { id: 4, title: 'Optimize queries with indexes', checked: false }
  ]);

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, checked: !t.checked } : t));
  };

  const allComplete = tasks.every(t => t.checked);
  const completedCount = tasks.filter(t => t.checked).length;
  const progressPercent = (completedCount / tasks.length) * 100;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-10 py-4">
      <div className="flex flex-col gap-4 text-center">
        <h2 className="text-3xl font-bold text-[color:var(--text-main)] drop-shadow-md">
          Core Competency Checklist
        </h2>
        <p className="text-lg text-[color:var(--text-muted)]">PostgreSQL Fundamentals</p>
        
        {/* Progress Bar */}
        <div className="w-full max-w-2xl mx-auto mt-4 h-3 bg-[#090d18] rounded-full shadow-[inset_2px_2px_4px_rgba(0,0,0,0.6),inset_-1px_-1px_2px_rgba(30,41,59,0.3)] overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-blue-500 to-cyan-400"
            style={{ width: `${progressPercent}%`, boxShadow: '0 0 10px rgba(56, 189, 248, 0.6)' }}
          ></div>
        </div>
      </div>

      <div className="flex flex-col gap-6 p-10 rounded-[32px] overflow-hidden bg-[var(--bg-card)] shadow-[12px_12px_24px_var(--shadow-dark),-12px_-12px_24px_var(--shadow-light)] border border-[var(--border-color)]">
        {tasks.map(task => (
          <div 
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className={`flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-300 active:scale-[0.98] ${
              task.checked 
                ? 'shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)] text-blue-400' 
                : 'shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] text-[color:var(--text-muted)] hover:text-white'
            }`}
          >
            <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
              task.checked 
                ? 'bg-[var(--bg-card)] shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)]' 
                : 'bg-[var(--bg-card)] shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)]'
            }`}>
              {task.checked && <Check size={16} className="text-blue-400" />}
            </div>
            <span className={`text-lg font-medium ${task.checked ? 'line-through opacity-70' : ''}`}>
              {task.title}
            </span>
          </div>
        ))}
      </div>

      <div className={`p-8 rounded-[32px] text-center transition-all duration-500 ${
        allComplete 
          ? 'shadow-[inset_4px_4px_12px_var(--shadow-dark),inset_-4px_-4px_12px_var(--shadow-light)] text-green-400 border border-green-500/30' 
          : 'shadow-[4px_4px_12px_var(--shadow-dark),-4px_-4px_12px_var(--shadow-light)] text-slate-500'
      }`}>
        <h3 className="text-xl font-bold tracking-widest uppercase">
          {allComplete ? 'Topic Complete' : 'Topic Incomplete'}
        </h3>
        <p className="mt-2 opacity-80">
          {allComplete ? 'Ready to move to the next topic!' : `${completedCount}/${tasks.length} competency items checked`}
        </p>
      </div>
    </div>
  );
}

// 2. Flashcard Engine
function FlashcardEngine() {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-12">
      {/* 3D Flip Card */}
      <div 
        className="relative w-[500px] h-[300px] cursor-pointer"
        style={{ perspective: '1000px' }}
        onClick={() => setFlipped(!flipped)}
      >
        <div 
          className="w-full h-full relative transition-all duration-700"
          style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateX(180deg)' : 'rotateX(0deg)' }}
        >
          {/* Front */}
          <div 
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-8 rounded-3xl overflow-hidden bg-[var(--bg-card)] shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)]"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <span className="absolute top-6 left-8 text-slate-500 font-bold tracking-widest text-sm uppercase">Question</span>
            <h2 className="text-3xl font-medium text-[color:var(--text-main)] text-center leading-relaxed">
              What is a database index?
            </h2>
            <p className="absolute bottom-6 text-slate-500 text-sm">Click to reveal</p>
          </div>

          {/* Back */}
          <div 
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-8 rounded-3xl overflow-hidden bg-[var(--bg-card)] shadow-[inset_6px_6px_12px_var(--shadow-dark),inset_-6px_-6px_12px_var(--shadow-light)]"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}
          >
            <span className="absolute top-6 left-8 text-blue-400 font-bold tracking-widest text-sm uppercase">Answer</span>
            <p className="text-xl font-medium text-blue-200 text-center leading-relaxed">
              A data structure that improves the speed of data retrieval operations on a database table at the cost of additional writes and storage space.
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={`flex gap-6 transition-all duration-500 ${flipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <ControlButton label="Again" color="text-red-400" />
        <ControlButton label="Hard" color="text-orange-400" />
        <ControlButton label="Good" color="text-blue-400" />
        <ControlButton label="Easy" color="text-green-400" />
      </div>
    </div>
  );
}

function ControlButton({ label, color }) {
  return (
    <button className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 active:scale-90 bg-[var(--bg-card)] shadow-[6px_6px_12px_var(--shadow-dark),-6px_-6px_12px_var(--shadow-light)] hover:shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)] ${color}`}>
      {label}
    </button>
  );
}

// 3. Quiz Engine
function QuizEngine() {
  const [selectedOpt, setSelectedOpt] = useState(null);

  const options = [
    { id: 'A', text: 'Authentication failure' },
    { id: 'B', text: 'Rate limiting' },
    { id: 'C', text: 'Server error' },
    { id: 'D', text: 'Not found' },
  ];

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-10 py-8">
      
      {/* Debugging Question Card */}
      <div className="p-8 rounded-3xl overflow-hidden bg-[var(--bg-card)] shadow-[inset_6px_6px_12px_var(--shadow-dark),inset_-6px_-6px_12px_var(--shadow-light)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-[var(--bg-card)] shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)]">
            <Activity size={20} className="text-purple-400" />
          </div>
          <span className="text-purple-400 font-bold uppercase tracking-widest text-sm">Debugging Scenario</span>
        </div>
        
        <p className="text-xl text-[color:var(--text-muted)] font-mono bg-[#090d18] p-6 rounded-xl shadow-[inset_2px_2px_8px_#05080f] border border-[var(--border-color)]">
          Your API returns <span className="text-red-400">429</span>. What does this usually indicate?
        </p>
      </div>

      {/* Multiple Choice Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelectedOpt(opt.id)}
            className={`flex items-center gap-6 p-6 rounded-2xl transition-all duration-300 active:scale-95 text-left ${
              selectedOpt === opt.id
                ? 'shadow-[inset_6px_6px_12px_var(--shadow-dark),inset_-6px_-6px_12px_var(--shadow-light)] border border-blue-500/30'
                : 'shadow-[6px_6px_12px_var(--shadow-dark),-6px_-6px_12px_var(--shadow-light)] hover:shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)]'
            }`}
          >
            <div className={`w-12 h-12 flex items-center justify-center rounded-xl font-bold text-xl transition-all ${
              selectedOpt === opt.id
                ? 'bg-blue-500/20 text-blue-400 shadow-[inset_2px_2px_6px_rgba(0,0,0,0.5)]'
                : 'bg-[var(--bg-card)] text-[color:var(--text-muted)] shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)]'
            }`}>
              {opt.id}
            </div>
            <span className={`text-lg font-medium ${selectedOpt === opt.id ? 'text-blue-100' : 'text-[color:var(--text-muted)]'}`}>
              {opt.text}
            </span>
          </button>
        ))}
      </div>
      
      {selectedOpt && (
        <div className="flex justify-end mt-4">
          <button className="px-10 py-4 rounded-xl bg-[var(--bg-card)] shadow-[6px_6px_12px_var(--shadow-dark),-6px_-6px_12px_var(--shadow-light)] text-green-400 font-bold text-lg active:scale-95 transition-all hover:shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)]">
            Submit Answer
          </button>
        </div>
      )}
    </div>
  );
}
