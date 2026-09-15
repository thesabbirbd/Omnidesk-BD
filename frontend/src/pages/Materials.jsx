import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Link as LinkIcon, 
  FileText, 
  File as FilePdf, 
  FileVideo, 
  UploadCloud, 
  Folder, 
  Plus, 
  FileCode, 
  CheckCircle2, 
  ArrowLeft,
  ExternalLink,
  BookOpen,
  Sparkles,
  Globe,
  Terminal,
  Bookmark
} from 'lucide-react';
import { getStudySpaces } from '../services/api';
import { getSpaceSlug } from '../utils/slugify';

// Curated Online Resources generator based on active topic
const generateCuratedOnlineMaterials = (title = '', category = '') => {
  const t = (title + ' ' + category).toLowerCase();
  
  if (t.includes('network') || t.includes('tcp') || t.includes('cisco')) {
    return [
      { id: 'cur-1', title: 'RFC 793: Transmission Control Protocol (TCP) Specification', type: 'url', category: 'Official Standard', source: 'IETF RFC Database', url: 'https://datatracker.ietf.org/doc/html/rfc793', badge: 'OFFICIAL RFC', duration: '45 min read' },
      { id: 'cur-2', title: 'Computer Networking: A Top-Down Approach Companion Labs', type: 'url', category: 'Interactive Lab', source: 'Kurose & Ross', url: 'https://gaia.cs.umass.edu/kurose_ross/online_lectures.htm', badge: 'ACADEMIC LAB', duration: '2 hours' },
      { id: 'cur-3', title: 'Wireshark Packet Analysis Masterclass', type: 'video', category: 'Practical Lab', source: 'Wireshark Foundation', url: 'https://www.wireshark.org/docs/', badge: 'PACKET LAB', duration: '1h 30m' },
      { id: 'cur-4', title: 'Cloudflare Learning Center: What is DNS & IP Routing?', type: 'url', category: 'Architecture Guide', source: 'Cloudflare', url: 'https://www.cloudflare.com/learning/network-layer/what-is-the-network-layer/', badge: 'GUIDE', duration: '20 min read' }
    ];
  } else if (t.includes('python')) {
    return [
      { id: 'cur-1', title: 'Official Python 3.12 Documentation & Language Reference', type: 'url', category: 'Official Docs', source: 'Python Software Foundation', url: 'https://docs.python.org/3/', badge: 'OFFICIAL DOCS', duration: 'Comprehensive' },
      { id: 'cur-2', title: 'FastAPI High-Performance Async Architecture Guide', type: 'url', category: 'Framework Docs', source: 'tiangolo', url: 'https://fastapi.tiangolo.com/tutorial/', badge: 'INTERACTIVE DOCS', duration: '1 hour' },
      { id: 'cur-3', title: 'Python AsyncIO: Coroutines, Tasks & Event Loop Deep Dive', type: 'url', category: 'Deep Dive', source: 'Real Python', url: 'https://realpython.com/async-io-python/', badge: 'DEEP DIVE', duration: '40 min read' },
      { id: 'cur-4', title: 'Python AST & Bytecode Disassembler Playground', type: 'url', category: 'Interactive Tool', source: 'Python Tutor', url: 'https://pythontutor.com/', badge: 'PLAYGROUND', duration: 'Hands-on' }
    ];
  } else if (t.includes('kube') || t.includes('cloud') || t.includes('devops') || t.includes('docker')) {
    return [
      { id: 'cur-1', title: 'Kubernetes Official Documentation & Interactive Katacoda Tutorials', type: 'url', category: 'Official Docs', source: 'CNCF / Kubernetes', url: 'https://kubernetes.io/docs/tutorials/', badge: 'OFFICIAL CNCF', duration: 'Hands-on Labs' },
      { id: 'cur-2', title: 'Docker Multi-Stage Builds & Security Best Practices', type: 'url', category: 'Production Guide', source: 'Docker Documentation', url: 'https://docs.docker.com/build/building/multi-stage/', badge: 'BEST PRACTICES', duration: '30 min read' },
      { id: 'cur-3', title: 'Killercoda Interactive Cloud Native Sandboxes', type: 'url', category: 'Live Terminal Sandbox', source: 'Killercoda', url: 'https://killercoda.com/', badge: 'LIVE PTY LAB', duration: 'Self-Paced' },
      { id: 'cur-4', title: 'The Twelve-Factor App System Design Manifesto', type: 'url', category: 'Architecture Blueprint', source: '12factor.net', url: 'https://12factor.net/', badge: 'MANIFESTO', duration: '25 min read' }
    ];
  } else if (t.includes('video') || t.includes('editing')) {
    return [
      { id: 'cur-1', title: 'DaVinci Resolve Official Training & Certification Courseware', type: 'url', category: 'Official Docs', source: 'Blackmagic Design', url: 'https://www.blackmagicdesign.com/products/davinciresolve/training', badge: 'CERTIFIED COURSE', duration: 'Multi-Module' },
      { id: 'cur-2', title: 'Color Grading & Color Science Fundamentals', type: 'video', category: 'Video Guide', source: 'Color Grading Central', url: 'https://www.colorgradingcentral.com/', badge: 'COLOR SCIENCE', duration: '45 min' },
      { id: 'cur-3', title: 'FFmpeg Command Line Audio/Video Transcoding Cookbook', type: 'url', category: 'CLI Reference', source: 'FFmpeg Org', url: 'https://ffmpeg.org/documentation.html', badge: 'CLI COOKBOOK', duration: 'Reference' }
    ];
  }

  // General fallback tailored to topic title
  return [
    { id: 'cur-1', title: `${title || 'Core Subject'} Official Technical Documentation & Reference Manual`, type: 'url', category: 'Official Docs', source: 'Standard Technical Index', url: 'https://developer.mozilla.org', badge: 'OFFICIAL REFERENCE', duration: 'Comprehensive' },
    { id: 'cur-2', title: `System Architecture & Implementation Blueprints for ${title || 'Topic'}`, type: 'url', category: 'Architecture Guide', source: 'Engineering Architecture Hub', url: 'https://github.com/donnemartin/system-design-primer', badge: 'SYSTEM DESIGN', duration: '1 hour' },
    { id: 'cur-3', title: `Hands-On Interactive Code Sandbox & Practice Repository`, type: 'url', category: 'Interactive Sandbox', source: 'CodeSandbox / Replit', url: 'https://codesandbox.io', badge: 'SANDBOX', duration: 'Hands-on' },
    { id: 'cur-4', title: `Comprehensive Cheat Sheet & Key Concept Summaries`, type: 'url', category: 'Quick Reference', source: 'DevCheatSheets', url: 'https://devhints.io', badge: 'CHEAT SHEET', duration: '15 min read' }
  ];
};

const mockMaterials = [
  { id: 1, type: 'pdf', name: 'FastAPI_Architecture.pdf', topic: 'Backend Engineering', size: '2.4 MB', date: 'Oct 12' },
  { id: 2, type: 'video', name: 'Python OOP Crash Course', topic: 'Core Python', size: '1h 20m', date: 'Oct 14' },
  { id: 3, type: 'url', name: 'ReactFlow Documentation', topic: 'Frontend React', size: 'Web', date: 'Oct 15' },
  { id: 4, type: 'markdown', name: 'System_Design_Notes.md', topic: 'System Design', size: '14 KB', date: 'Oct 16' },
  { id: 5, type: 'docx', name: 'Project_Requirements.docx', topic: 'Project X', size: '42 KB', date: 'Oct 16' },
];

const typeConfig = {
  pdf: { icon: FilePdf, color: 'text-red-500', bg: 'bg-red-500/10' },
  video: { icon: FileVideo, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  url: { icon: LinkIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  markdown: { icon: FileCode, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  docx: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-600/10' }
};

export default function Materials() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeSpaceTitle, setActiveSpaceTitle] = useState(() => {
    return localStorage.getItem('current_study_space_title') || '100-Day Backend → DevOps';
  });
  const [activeSpaceCategory, setActiveSpaceCategory] = useState('Backend / DevOps');
  const [activeSpaceId, setActiveSpaceId] = useState(() => {
    return localStorage.getItem('current_study_space_id') || '';
  });
  const [spacesList, setSpacesList] = useState([]);

  useEffect(() => {
    const loadCurrentSpace = async () => {
      try {
        const spaces = await getStudySpaces();
        if (Array.isArray(spaces) && spaces.length > 0) {
          setSpacesList(spaces);
          const currentId = localStorage.getItem('current_study_space_id');
          const matched = spaces.find(s => s.id === currentId) || spaces[0];
          setActiveSpaceId(matched.id);
          setActiveSpaceTitle(matched.title);
          setActiveSpaceCategory(matched.category || 'Engineering');
        }
      } catch {
        // fallback
      }
    };
    loadCurrentSpace();

    const handleSpaceChanged = (e) => {
      if (e.detail) {
        setActiveSpaceId(e.detail.id || '');
        setActiveSpaceTitle(e.detail.title || '');
        setActiveSpaceCategory(e.detail.category || 'Engineering');
      }
      loadCurrentSpace();
    };
    window.addEventListener('studyos-space-changed', handleSpaceChanged);
    return () => window.removeEventListener('studyos-space-changed', handleSpaceChanged);
  }, []);

  const curatedMaterials = generateCuratedOnlineMaterials(activeSpaceTitle, activeSpaceCategory);

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-canvas)] text-[color:var(--text-main)] overflow-y-auto p-6 md:p-10 gap-8">
      
      {/* Top Navigation & Breadcrumb */}
      <div className="shrink-0 flex items-center justify-between gap-4 p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[4px_4px_12px_var(--shadow-dark),-4px_-4px_12px_var(--shadow-light)]">
        <button
          onClick={() => {
            const currentSpace = spacesList.find(s => s.id === activeSpaceId);
            const slug = currentSpace ? getSpaceSlug(currentSpace) : '';
            navigate(slug ? `/os/dashboard/${slug}` : '/os/dashboard');
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-panel)] border border-[var(--border-color)] text-xs font-bold text-[color:var(--text-main)] hover:text-cyan-400 transition-all cursor-pointer shadow-inner"
          title="Return to Project Dashboard"
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-input)] border border-cyan-500/30 text-xs font-bold text-cyan-400 shadow-inner">
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse shrink-0" />
          <span className="truncate max-w-[180px] sm:max-w-[260px]">{activeSpaceTitle}</span>
        </div>
      </div>
      
      {/* Header and Upload Zone */}
      <div className="flex flex-col xl:flex-row gap-8">
        
        <div className="flex-1 flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-wide flex items-center gap-3">
              <Folder className="text-purple-400" size={32} />
              Universal Material Engine
            </h1>
            <p className="text-[color:var(--text-muted)] mt-2 font-medium">Manage, link, and organize your study files and references across all topics.</p>
          </div>

          {/* Search Bar - Inset */}
          <div className="relative w-full max-w-lg">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Search materials, URLs, notes..." 
              className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[color:var(--text-main)] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-purple-500/50 transition-all shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)] font-medium"
            />
          </div>
        </div>

        {/* Upload / Paste Zone - Neumorphic Tray */}
        <div className="xl:w-96 p-6 bg-[var(--bg-panel)] rounded-3xl shadow-[inset_4px_4px_12px_var(--shadow-dark),inset_-4px_-4px_12px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase tracking-widest text-[color:var(--text-muted)]">
            <Plus size={16} /> Quick Add
          </div>
          
          <button className="w-full py-4 px-4 rounded-2xl border-2 border-dashed border-[var(--border-color)] hover:border-purple-400/50 bg-[var(--bg-card)] shadow-[4px_4px_10px_var(--shadow-dark),-4px_-4px_10px_var(--shadow-light)] flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 group overflow-hidden cursor-pointer">
            <UploadCloud size={26} className="text-[color:var(--text-muted)] group-hover:text-purple-400 transition-colors drop-shadow-md" />
            <span className="font-semibold text-xs text-[color:var(--text-main)]">Drag & Drop files or Browse</span>
          </button>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] focus-within:border-purple-500/50 transition-all w-full">
            <LinkIcon size={16} className="text-[color:var(--text-muted)] shrink-0 ml-1" />
            <input 
              type="text" 
              placeholder="Paste URL here..." 
              className="w-full bg-transparent text-xs text-[color:var(--text-main)] py-2 px-1 focus:outline-none"
            />
            <button className="p-2 bg-purple-500 hover:bg-purple-400 text-white rounded-xl shadow-[0_0_10px_rgba(168,85,247,0.5)] shrink-0 transition-all cursor-pointer flex items-center justify-center">
              <CheckCircle2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-4 mt-4">
        {['all', 'pdf', 'video', 'url', 'markdown', 'docx'].map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-6 py-2.5 rounded-xl font-bold capitalize transition-all duration-300 flex items-center gap-2 ${
              activeFilter === filter
                ? 'bg-[var(--bg-card)] text-purple-400 shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)]'
                : 'bg-[var(--bg-card)] text-[color:var(--text-muted)] shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)] hover:text-[color:var(--text-main)] hover:-translate-y-0.5'
            }`}
          >
            {filter !== 'all' && React.createElement(typeConfig[filter].icon, { size: 16, className: activeFilter === filter ? 'drop-shadow-[0_0_8px_currentColor]' : '' })}
            {filter}
          </button>
        ))}
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-4">
                {mockMaterials.filter(m => activeFilter === 'all' || m.type === activeFilter).length === 0 ? (
          <div className="col-span-full">
            <EmptyState icon={Folder} title="Your knowledge base is empty" description="No materials match your current filter. Drag and drop files to add them." actionText="Upload Document" onAction={() => {}} />
          </div>
        ) : mockMaterials.filter(m => activeFilter === 'all' || m.type === activeFilter).map((material) => {
          const config = typeConfig[material.type];
          return (
            <div key={material.id} className="p-6 rounded-3xl overflow-hidden bg-[var(--bg-card)] shadow-[6px_6px_14px_var(--shadow-dark),-6px_-6px_14px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col gap-4 group cursor-pointer hover:border-purple-500/40 hover:shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] transition-all">
              
              <div className="flex justify-between items-start">
                <div className={`p-3.5 rounded-2xl ${config.bg} shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)] border border-[var(--border-color)] group-hover:scale-105 transition-transform`}>
                  {React.createElement(config.icon, { size: 24, className: `${config.color} drop-shadow-[0_0_8px_currentColor]` })}
                </div>
                <div className="flex flex-col items-end pt-1">
                  <span className="text-xs font-bold text-[color:var(--text-muted)] uppercase tracking-wider">{material.size}</span>
                  <span className="text-[11px] font-medium text-slate-500">{material.date}</span>
                </div>
              </div>

              <div className="mt-1">
                <h3 className="text-base font-bold text-[color:var(--text-main)] group-hover:text-purple-400 transition-colors line-clamp-2">
                  {material.name}
                </h3>
              </div>

              {/* Topic Connection Ribbon */}
              <div className="mt-auto pt-4 border-t border-[var(--border-color)]">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-input)] shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] border border-[var(--border-color)] text-xs font-semibold text-[color:var(--text-muted)]">
                  <Folder size={14} className="text-cyan-400 shrink-0" />
                  <span className="truncate">{material.topic}</span>
                </div>
              </div>
              
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* Dynamic Curated Online Learning Resources & Documentation Section          */}
      {/* ========================================================================= */}
      <div className="flex flex-col gap-5 mt-6 pt-6 border-t border-[var(--border-color)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Globe size={20} />
              </div>
              <h2 className="text-xl md:text-2xl font-black tracking-wide text-[color:var(--text-main)]">
                Curated Online Learning Resources & Docs
              </h2>
            </div>
            <p className="text-xs md:text-sm font-medium text-[color:var(--text-muted)] mt-1 ml-10">
              Verified official documentation, interactive playgrounds, and video deep-dives tailored to <span className="text-cyan-400 font-bold">{activeSpaceTitle}</span>.
            </p>
          </div>

          <span className="self-start md:self-auto px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold flex items-center gap-1.5">
            <Sparkles size={14} />
            <span>Ready Online Suggestions</span>
          </span>
        </div>

        {/* Curated Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {curatedMaterials.map((res) => (
            <div
              key={res.id}
              className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[6px_6px_14px_var(--shadow-dark),-6px_-6px_14px_var(--shadow-light)] flex flex-col justify-between gap-4 group hover:border-cyan-500/40 hover:shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] transition-all"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                    {res.badge}
                  </span>
                  <span className="text-[11px] font-medium text-[color:var(--text-muted)]">
                    {res.duration}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[color:var(--text-main)] group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug">
                  {res.title}
                </h3>

                <span className="text-xs text-[color:var(--text-muted)] font-medium">
                  Source: <span className="text-[color:var(--text-main)] font-semibold">{res.source}</span>
                </span>
              </div>

              <a
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-2 py-2.5 px-3 rounded-xl bg-[var(--bg-input)] hover:bg-cyan-500 text-[color:var(--text-muted)] hover:text-slate-950 font-bold text-xs flex items-center justify-center gap-2 border border-[var(--border-color)] hover:border-cyan-400 shadow-inner transition-all cursor-pointer group-hover:shadow-[0_0_12px_rgba(6,182,212,0.4)]"
              >
                <span>Launch Resource</span>
                <ExternalLink size={14} />
              </a>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
