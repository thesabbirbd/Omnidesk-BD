import React, { useState } from 'react';
import { Calendar, CheckCircle2, Clock, AlertTriangle, Play, Flame } from 'lucide-react';
import { useTimer } from '../context/TimerContext';
import { useNavigate } from 'react-router-dom';

const initialWeeks = [
  {
    weekNumber: 1,
    title: 'Python Mastery & Object-Oriented Architecture',
    days: 'Days 1 - 7',
    summary: 'Master dunder methods, metaclasses, decorators, and design patterns in Python 3.12.',
    topics: [
      { id: 101, title: 'Dunder Methods & Magic Functions', hours: 3, difficulty: 'Intermediate', status: 'complete', overdue: false },
      { id: 102, title: 'Decorators & Custom Context Managers', hours: 4, difficulty: 'Intermediate', status: 'complete', overdue: false },
      { id: 103, title: 'Type Hinting, Generics & Pydantic V2', hours: 3.5, difficulty: 'Advanced', status: 'complete', overdue: false },
      { id: 104, title: 'Concurrency with AsyncIO & ThreadPools', hours: 5, difficulty: 'Advanced', status: 'in-progress', overdue: true },
    ]
  },
  {
    weekNumber: 2,
    title: 'FastAPI Microservices & Dependency Injection',
    days: 'Days 8 - 14',
    summary: 'Building production RESTful APIs, custom middleware, dependency graph, and OpenAPI validation.',
    topics: [
      { id: 201, title: 'FastAPI Dependency Injection Architecture', hours: 3.5, difficulty: 'Intermediate', status: 'in-progress', overdue: false },
      { id: 202, title: 'SQLAlchemy 2.0 Async Session Management', hours: 4.5, difficulty: 'Advanced', status: 'scheduled', overdue: true },
      { id: 203, title: 'JWT Authentication & OAuth2 Password Bearer', hours: 3, difficulty: 'Intermediate', status: 'scheduled', overdue: false },
      { id: 204, title: 'Background Tasks, Celery & Redis Queues', hours: 5, difficulty: 'Advanced', status: 'scheduled', overdue: false },
    ]
  },
  {
    weekNumber: 3,
    title: 'Database Engineering: PostgreSQL & Alembic',
    days: 'Days 15 - 21',
    summary: 'B-Tree indexing, foreign keys, cascade constraints, JSONB operators, and migration workflows.',
    topics: [
      { id: 301, title: 'PostgreSQL Relational Normalization & B-Trees', hours: 4, difficulty: 'Intermediate', status: 'scheduled', overdue: false },
      { id: 302, title: 'Alembic Schema Auto-Generation & Revisions', hours: 2.5, difficulty: 'Intermediate', status: 'scheduled', overdue: false },
      { id: 303, title: 'Query Optimization & EXPLAIN ANALYZE', hours: 4, difficulty: 'Advanced', status: 'scheduled', overdue: false },
      { id: 304, title: 'Redis Cache Layer & Invalidations', hours: 3.5, difficulty: 'Intermediate', status: 'scheduled', overdue: false },
    ]
  },
  {
    weekNumber: 4,
    title: 'Modern Frontend & React Architecture',
    days: 'Days 22 - 28',
    summary: 'Vite, React 18, Custom Context Engines, Neumorphic/Glassmorphism CSS Design Tokens, and Canvas.',
    topics: [
      { id: 401, title: 'Global State Management without Redux', hours: 3, difficulty: 'Intermediate', status: 'scheduled', overdue: false },
      { id: 402, title: 'React Flow Interactive Knowledge Graphs', hours: 4.5, difficulty: 'Advanced', status: 'scheduled', overdue: false },
      { id: 403, title: 'Theme Engines & CSS Variable Design Tokens', hours: 2.5, difficulty: 'Easy', status: 'scheduled', overdue: false },
      { id: 404, title: 'WebSocket Realtime Presence & WebRTC', hours: 4, difficulty: 'Advanced', status: 'scheduled', overdue: false },
    ]
  }
];

export default function StudyPlan() {
  const [weeks, setWeeks] = useState(initialWeeks);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');
  const { setTopic, startTimer } = useTimer();
  const navigate = useNavigate();

  const currentWeekData = weeks.find((w) => w.weekNumber === selectedWeek) || weeks[0];

  // Calculate totals
  const allTopics = weeks.flatMap((w) => w.topics);
  const totalTopics = allTopics.length;
  const completedTopics = allTopics.filter((t) => t.status === 'complete').length;
  const inProgressTopics = allTopics.filter((t) => t.status === 'in-progress').length;
  const overdueTopics = allTopics.filter((t) => t.overdue && t.status !== 'complete');
  const completionPercentage = Math.round((completedTopics / totalTopics) * 100);

  const toggleTopicStatus = (topicId) => {
    setWeeks((prevWeeks) =>
      prevWeeks.map((week) => ({
        ...week,
        topics: week.topics.map((topic) => {
          if (topic.id === topicId) {
            const nextStatus = topic.status === 'complete' ? 'in-progress' : 'complete';
            return { ...topic, status: nextStatus, overdue: nextStatus === 'complete' ? false : topic.overdue };
          }
          return topic;
        })
      }))
    );
  };

  const handleStartStudy = (topicTitle) => {
    setTopic(topicTitle);
    startTimer();
    navigate('/os/timer');
  };

  const filteredTopics = currentWeekData.topics.filter((topic) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'overdue') return topic.overdue && topic.status !== 'complete';
    return topic.status === filterStatus;
  });

  return (
    <div className="flex flex-col w-full min-h-full text-[color:var(--text-main)] gap-6 md:gap-8 pb-12">
      
      {/* Header Section */}
      <div className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-wide flex items-center gap-3">
            <Calendar className="text-cyan-400 shrink-0" size={36} />
            <span>Curriculum & Study Plan</span>
          </h1>
          <p className="text-[color:var(--text-muted)] mt-1 font-medium text-sm md:text-base">
            Structured 14-week roadmap designed for deep engineering mastery.
          </p>
        </div>

        {/* Global Stats Pill */}
        <div className="shrink-0 flex items-center gap-3 bg-[var(--bg-card)] px-5 py-3 rounded-2xl border border-[var(--border-color)] shadow-[var(--card-shadow)]">
          <div className="flex flex-col">
            <span className="text-xs uppercase font-bold text-[color:var(--text-muted)]">Roadmap Progress</span>
            <span className="text-xl font-black text-cyan-400">{completionPercentage}% Completed</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold">
            <Flame size={22} className="text-orange-400" />
          </div>
        </div>
      </div>

      {/* Overdue Milestones Alert Banner */}
      {overdueTopics.length > 0 && (
        <div className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-red-500/10 border border-red-500/30 text-red-300 shadow-[0_8px_20px_rgba(239,68,68,0.15)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-red-500/20 text-red-400">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-base text-red-200">
                {overdueTopics.length} Overdue Milestones Pending
              </h3>
              <p className="text-xs text-red-300/80">
                Tasks like &quot;{overdueTopics[0].title}&quot; have passed their scheduled timeline. Jump into a focus session to catch up.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleStartStudy(overdueTopics[0].title)}
            className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_4px_12px_rgba(239,68,68,0.4)] active:scale-95 cursor-pointer shrink-0"
          >
            <Play size={14} fill="currentColor" /> Catch Up Now
          </button>
        </div>
      )}

      {/* Progress Cards Row */}
      <div className="shrink-0 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[var(--card-shadow)] flex flex-col gap-1">
          <span className="text-xs font-bold uppercase text-[color:var(--text-muted)]">Total Milestones</span>
          <span className="text-2xl font-black text-[color:var(--text-main)]">{totalTopics}</span>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[var(--card-shadow)] flex flex-col gap-1">
          <span className="text-xs font-bold uppercase text-emerald-400">Mastered</span>
          <span className="text-2xl font-black text-emerald-400">{completedTopics}</span>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[var(--card-shadow)] flex flex-col gap-1">
          <span className="text-xs font-bold uppercase text-amber-400">In Progress</span>
          <span className="text-2xl font-black text-amber-400">{inProgressTopics}</span>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[var(--card-shadow)] flex flex-col gap-1">
          <span className="text-xs font-bold uppercase text-rose-400">Overdue</span>
          <span className="text-2xl font-black text-rose-400">{overdueTopics.length}</span>
        </div>
      </div>

      {/* Week Selector Pills */}
      <div className="shrink-0 flex items-center gap-3 overflow-x-auto pb-2 w-full">
        {weeks.map((week) => {
          const isSelected = week.weekNumber === selectedWeek;
          const weekCompleted = week.topics.every((t) => t.status === 'complete');
          return (
            <button
              key={week.weekNumber}
              onClick={() => setSelectedWeek(week.weekNumber)}
              className={`px-5 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-300 flex items-center gap-2.5 cursor-pointer border ${
                isSelected
                  ? 'bg-cyan-500 text-white border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                  : 'bg-[var(--bg-card)] text-[color:var(--text-muted)] border-[var(--border-color)] hover:text-[color:var(--text-main)]'
              }`}
            >
              <span>Week {week.weekNumber}</span>
              {weekCompleted && <CheckCircle2 size={16} className="text-emerald-400" />}
            </button>
          );
        })}
      </div>

      {/* Week Details & Topics List */}
      <div className="p-6 md:p-8 rounded-[32px] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[var(--card-shadow)] flex flex-col gap-6">
        
        {/* Week Summary Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--border-color)]">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {currentWeekData.days}
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-[color:var(--text-main)]">
                {currentWeekData.title}
              </h2>
            </div>
            <p className="text-sm text-[color:var(--text-muted)] mt-2">
              {currentWeekData.summary}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            {['all', 'in-progress', 'overdue', 'complete'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  filterStatus === status
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : 'bg-[var(--bg-input)] text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]'
                }`}
              >
                {status.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Topics Checklist */}
        <div className="flex flex-col gap-4">
          {filteredTopics.map((topic) => {
            const isCompleted = topic.status === 'complete';
            const isOverdue = topic.overdue && !isCompleted;

            return (
              <div
                key={topic.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCompleted
                    ? 'bg-[var(--bg-input)]/40 border-[var(--border-color)] opacity-75'
                    : isOverdue
                    ? 'bg-red-500/5 border-red-500/30'
                    : 'bg-[var(--bg-input)] border-[var(--border-color)] hover:border-cyan-500/40'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Complete Checkbox */}
                  <button
                    onClick={() => toggleTopicStatus(topic.id)}
                    className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      isCompleted
                        ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                        : 'border-[var(--border-color)] hover:border-cyan-400 text-transparent'
                    }`}
                  >
                    <CheckCircle2 size={18} />
                  </button>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-bold text-base ${isCompleted ? 'line-through text-[color:var(--text-muted)]' : 'text-[color:var(--text-main)]'}`}>
                        {topic.title}
                      </span>
                      {isOverdue && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                          Overdue
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[color:var(--text-muted)]">
                      <span className="flex items-center gap-1">
                        <Clock size={14} /> {topic.hours}h study
                      </span>
                      <span>•</span>
                      <span className={`font-semibold ${
                        topic.difficulty === 'Advanced' ? 'text-purple-400' : topic.difficulty === 'Intermediate' ? 'text-amber-400' : 'text-cyan-400'
                      }`}>
                        {topic.difficulty}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action: Launch Timer */}
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleStartStudy(topic.title)}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all bg-[var(--bg-card)] hover:bg-cyan-500 hover:text-white border border-[var(--border-color)] hover:border-cyan-400 shadow-[var(--card-shadow)] active:scale-95 cursor-pointer text-cyan-400"
                  >
                    <Play size={14} fill="currentColor" />
                    <span>Focus Session</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
