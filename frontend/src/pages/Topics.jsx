import React, { useState } from 'react';
import { Layers, Search, Play, CheckCircle2, Clock } from 'lucide-react';
import { useTimer } from '../context/TimerContext';
import { useNavigate } from 'react-router-dom';

const initialTopics = [
  {
    id: 1,
    title: 'FastAPI Dependency Injection & Middleware',
    category: 'Backend Engineering',
    status: 'LEARNING',
    mastery: 65,
    prerequisites: ['Python Type Hints', 'AsyncIO Basics'],
    checkpoints: [
      { name: 'Request validation via Pydantic', done: true },
      { name: 'Custom Header & Bearer Auth dependency', done: true },
      { name: 'CORS & Gzip middleware configuration', done: false }
    ],
    estimatedHours: 6
  },
  {
    id: 2,
    title: 'SQLAlchemy 2.0 Async ORM & Alembic Revisions',
    category: 'Databases & System Design',
    status: 'COMPLETE',
    mastery: 100,
    prerequisites: ['PostgreSQL Schema Design'],
    checkpoints: [
      { name: 'AsyncSession lifecycle & context managers', done: true },
      { name: 'DeclarativeBase & mapped_column syntax', done: true },
      { name: 'Alembic autogen migrations & revision history', done: true }
    ],
    estimatedHours: 8
  },
  {
    id: 3,
    title: 'React Flow Interactive Node Graphs',
    category: 'Frontend & UI Architecture',
    status: 'MASTERED',
    mastery: 95,
    prerequisites: ['React Hooks', 'DOM Event Handling'],
    checkpoints: [
      { name: 'Custom Node type definition & handles', done: true },
      { name: 'MiniMap & Background controls integration', done: true },
      { name: 'Dynamic edge styling & animated markers', done: true }
    ],
    estimatedHours: 5
  },
  {
    id: 4,
    title: 'Docker Multi-Stage Builds & Distroless Images',
    category: 'DevOps & Cloud',
    status: 'REVIEW',
    mastery: 80,
    prerequisites: ['Linux Shell Fundamentals'],
    checkpoints: [
      { name: 'Virtualenv compilation stage separation', done: true },
      { name: 'Non-root security context execution', done: true },
      { name: 'Minimal runtime image footprint optimization', done: false }
    ],
    estimatedHours: 4
  },
  {
    id: 5,
    title: 'Redis Caching & PubSub Message Broker',
    category: 'Databases & System Design',
    status: 'NORMAL',
    mastery: 20,
    prerequisites: ['Data Structures', 'Networking TCP'],
    checkpoints: [
      { name: 'Key-value expiry & LRU eviction policies', done: true },
      { name: 'Pub/Sub channel listener implementation', done: false },
      { name: 'Redis distributed locks with Redlock', done: false }
    ],
    estimatedHours: 6
  },
  {
    id: 6,
    title: 'WebRTC Peer-to-Peer & Face Detection Stream',
    category: 'Frontend & UI Architecture',
    status: 'BLOCKED',
    mastery: 40,
    prerequisites: ['JavaScript MediaDevices API'],
    checkpoints: [
      { name: 'getUserMedia video track acquisition', done: true },
      { name: 'Zero-latency face landmark processing', done: false },
      { name: 'Background hardware LED camera shutdown', done: false }
    ],
    estimatedHours: 7
  }
];

const statusStyles = {
  ALL: { bg: 'bg-slate-500/15', text: 'text-slate-300', border: 'border-slate-500/30' },
  NORMAL: { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30' },
  LEARNING: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  COMPLETE: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  BLOCKED: { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' },
  REVIEW: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
  MASTERED: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' }
};

export default function Topics() {
  const [topics, setTopics] = useState(initialTopics);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { setTopic, startTimer } = useTimer();
  const navigate = useNavigate();

  const categories = ['All', 'Backend Engineering', 'Frontend & UI Architecture', 'Databases & System Design', 'DevOps & Cloud'];
  const statuses = ['ALL', 'NORMAL', 'LEARNING', 'COMPLETE', 'BLOCKED', 'REVIEW', 'MASTERED'];

  const handleStatusChange = (id, newStatus) => {
    setTopics((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
  };

  const handleStartStudy = (topicTitle) => {
    setTopic(topicTitle);
    startTimer();
    navigate('/os/timer');
  };

  const filteredTopics = topics.filter((topic) => {
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || topic.status === selectedStatus;
    const matchesCategory = selectedCategory === 'All' || topic.category === selectedCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-canvas)] text-[color:var(--text-main)] overflow-y-auto p-4 md:p-8 gap-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-wide flex items-center gap-3">
            <Layers className="text-purple-400" size={36} />
            Topics & Knowledge Matrix
          </h1>
          <p className="text-[color:var(--text-muted)] mt-1 font-medium text-sm md:text-base">
            Explore concepts, track learning lifecycle status, and initiate targeted focus sessions.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search topic or concept..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[color:var(--text-main)] rounded-2xl py-3 pl-11 pr-4 focus:outline-none focus:border-purple-500/50 shadow-[var(--input-shadow)] text-sm font-medium"
          />
        </div>
      </div>

      {/* Categories Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
              selectedCategory === cat
                ? 'bg-purple-500 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.35)]'
                : 'bg-[var(--bg-card)] text-[color:var(--text-muted)] border-[var(--border-color)] hover:text-[color:var(--text-main)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 6-Status Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {statuses.map((status) => {
          const isSelected = selectedStatus === status;
          const conf = statusStyles[status];
          return (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                isSelected
                  ? `${conf.bg} ${conf.text} ${conf.border} shadow-[0_0_12px_rgba(168,85,247,0.3)] ring-1 ring-purple-500/40`
                  : 'bg-[var(--bg-input)] text-[color:var(--text-muted)] border-[var(--border-color)] hover:text-[color:var(--text-main)]'
              }`}
            >
              {status}
            </button>
          );
        })}
      </div>

      {/* Topic Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTopics.map((topic) => {
          const conf = statusStyles[topic.status] || statusStyles.NORMAL;
          const completedCount = topic.checkpoints.filter((c) => c.done).length;

          return (
            <div
              key={topic.id}
              className="p-6 md:p-7 rounded-[32px] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[var(--card-shadow)] flex flex-col justify-between gap-6 hover:border-purple-500/40 transition-all duration-300 group"
            >
              <div className="flex flex-col gap-4">
                {/* Top Row: Category & Status Dropdown */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
                    {topic.category}
                  </span>

                  {/* Status Selector Pill */}
                  <select
                    value={topic.status}
                    onChange={(e) => handleStatusChange(topic.id, e.target.value)}
                    className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer border outline-none bg-transparent ${conf.bg} ${conf.text} ${conf.border}`}
                  >
                    {statuses.filter((s) => s !== 'ALL').map((s) => (
                      <option key={s} value={s} className="bg-slate-900 text-white font-bold">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <h3 className="text-xl font-black text-[color:var(--text-main)] group-hover:text-purple-300 transition-colors">
                  {topic.title}
                </h3>

                {/* Mastery Bar */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[color:var(--text-muted)]">Mastery Score</span>
                    <span className="text-purple-400">{topic.mastery}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[var(--bg-input)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-[0_0_8px_rgba(168,85,247,0.5)] transition-all duration-500"
                      style={{ width: `${topic.mastery}%` }}
                    />
                  </div>
                </div>

                {/* Prerequisites */}
                {topic.prerequisites.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="font-semibold text-[color:var(--text-muted)]">Prereqs:</span>
                    {topic.prerequisites.map((req) => (
                      <span
                        key={req}
                        className="px-2 py-0.5 rounded-lg bg-[var(--bg-input)] text-[color:var(--text-muted)] border border-[var(--border-color)]"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                )}

                {/* Checkpoints summary */}
                <div className="flex items-center justify-between text-xs text-[color:var(--text-muted)] pt-2 border-t border-[var(--border-color)]">
                  <span className="flex items-center gap-1 font-medium">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    {completedCount} of {topic.checkpoints.length} checkpoints cleared
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Clock size={14} />
                    ~{topic.estimatedHours}h est.
                  </span>
                </div>
              </div>

              {/* Bottom Action: Start Focus Session */}
              <div className="flex items-center justify-end pt-4 border-t border-[var(--border-color)]">
                <button
                  onClick={() => handleStartStudy(topic.title)}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all bg-purple-500 hover:bg-purple-600 text-white shadow-[0_4px_14px_rgba(168,85,247,0.4)] active:scale-95 cursor-pointer"
                >
                  <Play size={14} fill="currentColor" />
                  <span>Start Focus Session</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
