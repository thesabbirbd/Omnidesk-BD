import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Server, 
  Code, 
  ArrowRight, 
  Sparkles, 
  Upload, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  X, 
  ChevronRight, 
  BookOpen, 
  Zap, 
  Check, 
  Copy, 
  Trash2, 
  Sun, 
  Moon, 
  Palette, 
  Volume2, 
  VolumeX, 
  Info, 
  Layers, 
  ArrowLeft,
  Cpu,
  Globe,
  Video,
  Shield,
  ExternalLink
} from 'lucide-react';

function GithubIcon({ size = 16, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

import { getStudySpaces, generateStudySpace, approveStudySpace } from '../services/api';
import { getSpaceSlug, slugify } from '../utils/slugify';
import { generateMasterPrompt, DEFAULT_TOPIC_PLACEHOLDER } from '../utils/masterPrompt';
import { soundEngine } from '../utils/audioSynth';
import OSBootSequence from '../components/common/OSBootSequence';
import DeleteProjectModal from '../components/projects/DeleteProjectModal';
import AboutOmnideskModal from '../components/common/AboutOmnideskModal';

const SUGGESTED_STARTER_SKILLS = [
  {
    id: 'devops',
    title: 'Backend → DevOps Engineer',
    description: 'Linux, Shell Scripting, Docker Containers, Kubernetes & CI/CD Pipelines',
    icon: Server,
    category: 'Backend / DevOps',
    color: 'text-cyan-400',
    gradient: 'from-blue-500/20 to-cyan-500/20 border-cyan-500/40'
  },
  {
    id: 'net',
    title: 'Computer Networking Basics',
    description: 'OSI 7 Layers, TCP/IP, IPv4 Subnetting & Routing Architecture',
    icon: Globe,
    category: 'Computer Science',
    color: 'text-teal-400',
    gradient: 'from-teal-500/20 to-emerald-500/20 border-teal-500/40'
  },
  {
    id: 'py',
    title: 'Python Mastery',
    description: 'AsyncIO, Generators, Metaclasses, OOP & Clean Architecture',
    icon: Code,
    category: 'Programming',
    color: 'text-amber-400',
    gradient: 'from-amber-500/20 to-yellow-500/20 border-amber-500/40'
  },
  {
    id: 'k8s',
    title: 'Cloud Native & Kubernetes Architecture',
    description: 'Pods, Ingress, Helm, Service Mesh & Production Cluster Management',
    icon: Cpu,
    category: 'DevOps & Cloud',
    color: 'text-indigo-400',
    gradient: 'from-indigo-500/20 to-blue-500/20 border-indigo-500/40'
  }
];

export default function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Boot sequence state
  const [showBootSequence, setShowBootSequence] = useState(() => {
    return !sessionStorage.getItem('studyos_booted');
  });

  // Modal states
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showMasterPromptModal, setShowMasterPromptModal] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Sound state
  const [soundEnabled, setSoundEnabled] = useState(soundEngine.isSoundEnabled());

  // Theme state
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'dark';
  });
  const [glassGradient, setGlassGradient] = useState(() => {
    return localStorage.getItem('glassGradient') || 'aurora';
  });
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  // Study Spaces state
  const [spaces, setSpaces] = useState([]);
  const [loadingSpaces, setLoadingSpaces] = useState(true);
  const [autoResumeNotice, setAutoResumeNotice] = useState(null);

  // Creation & Form state
  const [showCreate, setShowCreate] = useState(() => {
    return searchParams.get('create') === 'true' || searchParams.get('new') === 'true';
  });
  const [inputMode, setInputMode] = useState('topic'); // 'topic' | 'file'
  const [topicName, setTopicName] = useState('');
  const [workspaceTitle, setWorkspaceTitle] = useState('');
  const [category, setCategory] = useState('Backend / DevOps');
  const [dailyMinutes, setDailyMinutes] = useState(60);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Generation & Preview state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  const fileInputRef = useRef(null);

  // Apply theme attributes to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme-mode', themeMode);
    document.documentElement.setAttribute('data-glass-gradient', glassGradient);
    localStorage.setItem('themeMode', themeMode);
    localStorage.setItem('glassGradient', glassGradient);
  }, [themeMode, glassGradient]);

  // Load study spaces and handle auto-resume
  const fetchSpaces = async () => {
    setLoadingSpaces(true);
    try {
      const res = await getStudySpaces();
      const list = Array.isArray(res) ? res : [];
      setSpaces(list);

      // Auto-resume check: If user had an active workspace and didn't ask to create a new one
      const savedSpaceId = localStorage.getItem('current_study_space_id');
      const shouldAutoResume = searchParams.get('create') !== 'true' && searchParams.get('new') !== 'true';

      if (savedSpaceId && list.length > 0 && shouldAutoResume) {
        const matching = list.find(s => s.id === savedSpaceId || s.slug === savedSpaceId);
        if (matching) {
          setAutoResumeNotice(matching);
        }
      }
    } catch (err) {
      console.warn("Failed to load study spaces:", err);
      // Fallback sample space
      setSpaces([
        {
          id: 'default-devops',
          title: 'Backend → DevOps Engineer',
          category: 'Backend / DevOps',
          topic_count: 4,
          description: 'Linux, Shell Scripting, Docker Containers, Kubernetes & CI/CD Pipelines'
        }
      ]);
    } finally {
      setLoadingSpaces(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEngine.setSoundEnabled(next);
  };

  const handleCopyMasterPrompt = () => {
    const prompt = generateMasterPrompt(topicName);
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'txt', 'md'].includes(ext)) {
      setGenerationError("Supported file formats are .pdf, .txt, and .md");
      return;
    }
    setSelectedFile(file);
    setGenerationError(null);
    if (!workspaceTitle) {
      setWorkspaceTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }
  };

  const handleSelectStarterSkill = (skill) => {
    setTopicName(skill.title);
    setWorkspaceTitle(skill.title);
    setCategory(skill.category);
    setInputMode('topic');
    setShowCreate(true);
    setGenerationError(null);
  };

  const handleGenerate = async () => {
    setGenerationError(null);
    if (inputMode === 'topic' && !topicName.trim()) {
      setGenerationError("Please enter a topic name (e.g. 'Backend -> DevOps' or 'Computer Networking').");
      return;
    }
    if (inputMode === 'file' && !selectedFile) {
      setGenerationError("Please drop or select a PDF, TXT, or Markdown file.");
      return;
    }

    setIsGenerating(true);
    try {
      let preview;
      if (inputMode === 'file' && selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        if (workspaceTitle.trim()) formData.append('title', workspaceTitle.trim());
        formData.append('category', category);
        formData.append('daily_target_minutes', dailyMinutes.toString());
        preview = await generateStudySpace(formData);
      } else {
        const payload = {
          topic_name: topicName.trim(),
          title: workspaceTitle.trim() || topicName.trim(),
          category: category,
          daily_target_minutes: parseInt(dailyMinutes, 10) || 60
        };
        preview = await generateStudySpace(payload);
      }
      setPreviewData(preview);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to generate study space.";
      setGenerationError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = async () => {
    if (!previewData) return;
    setIsApproving(true);
    setGenerationError(null);

    try {
      const approvalPayload = {
        title: previewData.title,
        description: previewData.description,
        category: previewData.category,
        interface_language: previewData.interface_language || 'en',
        learning_language: previewData.learning_language || 'en',
        source_language: previewData.source_language || 'en',
        daily_target_minutes: dailyMinutes,
        topics: previewData.topics,
        study_plan: previewData.study_plan
      };

      const created = await approveStudySpace(approvalPayload);
      if (created?.id) {
        localStorage.setItem('current_study_space_id', created.id);
        localStorage.setItem('current_study_space_title', created.title);
        const slug = getSpaceSlug(created);
        navigate(`/os/dashboard/${slug}`);
      } else {
        navigate('/os/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to approve study space.";
      setGenerationError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsApproving(false);
    }
  };

  const handleProjectDeleted = (deletedId) => {
    setSpaces(prev => prev.filter(s => s.id !== deletedId));
    if (localStorage.getItem('current_study_space_id') === deletedId) {
      localStorage.removeItem('current_study_space_id');
      localStorage.removeItem('current_study_space_title');
    }
    if (autoResumeNotice?.id === deletedId) {
      setAutoResumeNotice(null);
    }
    fetchSpaces();
  };

  const resetForm = () => {
    setShowCreate(false);
    setPreviewData(null);
    setTopicName('');
    setWorkspaceTitle('');
    setSelectedFile(null);
    setGenerationError(null);
  };

  return (
    <div className="min-h-screen w-full bg-[var(--bg-canvas)] text-[color:var(--text-main)] flex flex-col items-center justify-start overflow-y-auto px-4 sm:px-6 py-6 sm:py-8 relative pb-36 transition-colors duration-300">
      
      {/* OS Boot Sequence Overlay (First Launch or Replay) */}
      {showBootSequence && (
        <OSBootSequence 
          forcePlay={true}
          onComplete={() => setShowBootSequence(false)} 
        />
      )}

      {/* Delete Project Modal (Password 'admin' Protected) */}
      <DeleteProjectModal 
        isOpen={Boolean(projectToDelete)}
        onClose={() => setProjectToDelete(null)}
        project={projectToDelete}
        onDeleted={handleProjectDeleted}
      />

      {/* About Omnidesk BD Modal */}
      <AboutOmnideskModal 
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        onReplayBoot={() => setShowBootSequence(true)}
      />

      {/* Ambient Cyber Grid & Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-cyan-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px]" />
      </div>

      {/* ========================================================================= */}
      {/* TOP NAVIGATION BAR                                                        */}
      {/* ========================================================================= */}
      <header className="w-full max-w-6xl flex items-center justify-between py-3 px-4 sm:px-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[6px_6px_16px_var(--shadow-dark),-6px_-6px_16px_var(--shadow-light)] mb-8 z-20">
        {/* Brand & Mark */}
        <div 
          onClick={() => { resetForm(); }}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative w-10 h-10 rounded-xl bg-slate-900 border border-cyan-400/40 p-1.5 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)] group-hover:scale-105 transition-transform">
            <img 
              src="/omnidesk-mark.png" 
              alt="Omnidesk BD" 
              className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-wider text-[color:var(--text-main)] group-hover:text-cyan-400 transition-colors">
                OMNIDESK BD
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                v1.2.9
              </span>
            </div>
            <p className="text-[10px] font-medium text-[color:var(--text-muted)] hidden sm:block">
              Cognitive Knowledge OS & DevOps Lab
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className={`p-2 rounded-xl border transition-all ${
              soundEnabled 
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20' 
                : 'bg-[var(--bg-input)] text-slate-500 border-slate-700 hover:text-slate-300'
            }`}
            title={soundEnabled ? "Audio Enabled (Click to Mute)" : "Audio Muted (Click to Enable)"}
          >
            {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>

          {/* Theme Mode Toggle (Dark / Light) */}
          <button
            onClick={() => setThemeMode(prev => prev === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-panel)] border border-[var(--border-color)] text-[color:var(--text-main)] transition-all hover:scale-105"
            title={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {themeMode === 'dark' ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-cyan-400" />}
          </button>

          {/* Glass Gradient Theme Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(prev => !prev)}
              className="p-2 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-panel)] border border-[var(--border-color)] text-[color:var(--text-main)] transition-all hover:scale-105 flex items-center gap-1"
              title="Glass Gradient Theme"
            >
              <Palette size={17} className="text-teal-400" />
            </button>

            {showThemeMenu && (
              <div 
                onClick={() => setShowThemeMenu(false)}
                className="absolute right-0 mt-2 w-44 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl p-2 z-50 flex flex-col gap-1 text-xs"
              >
                <div className="px-3 py-1 text-[10px] font-black uppercase text-[color:var(--text-muted)] tracking-wider">
                  Glass Theme
                </div>
                {[
                  { id: 'aurora', label: 'Aurora Cyan', dot: 'bg-cyan-400' },
                  { id: 'sunset', label: 'Sunset Amber', dot: 'bg-amber-400' },
                  { id: 'emerald', label: 'Emerald Nebula', dot: 'bg-emerald-400' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setGlassGradient(opt.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left font-bold transition-all ${
                      glassGradient === opt.id 
                        ? 'bg-cyan-500/15 text-cyan-400' 
                        : 'hover:bg-[var(--bg-input)] text-[color:var(--text-main)]'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${opt.dot}`} />
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* About Omnidesk BD */}
          <button
            onClick={() => setShowAboutModal(true)}
            className="p-2 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-panel)] border border-[var(--border-color)] text-[color:var(--text-main)] hover:text-cyan-400 transition-all hover:scale-105"
            title="About Omnidesk BD"
          >
            <Info size={17} />
          </button>

          {/* GitHub Repository Link */}
          <a
            href="https://github.com/thesabbirbd/Omnidesk-BD"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-white hover:border-cyan-400 text-xs font-bold transition-all hover:scale-105"
            title="Visit GitHub Repository"
          >
            <Github size={15} />
            <span>GitHub</span>
          </a>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* AUTO-RESUME PREVIOUS PROJECT BANNER (IF ACTIVE)                           */}
      {/* ========================================================================= */}
      {autoResumeNotice && !showCreate && (
        <div className="w-full max-w-6xl mb-6 p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping shrink-0" />
            <div>
              <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Previous StudySpace Loaded
              </p>
              <h3 className="text-sm font-black text-[color:var(--text-main)]">
                {autoResumeNotice.title}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const slug = getSpaceSlug(autoResumeNotice);
                navigate(`/os/dashboard/${slug}`);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all hover:scale-105 active:scale-95"
            >
              <span>Resume StudySpace</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => setAutoResumeNotice(null)}
              className="p-2 rounded-xl hover:bg-white/10 text-[color:var(--text-muted)] hover:text-white transition-colors"
              title="Dismiss Notice"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONTENT AREA: CREATION FORM vs PROJECTS HUB                               */}
      {/* ========================================================================= */}
      {!showCreate ? (
        /* ================= ALL PROJECTS & STARTER SKILLS ================= */
        <div className="w-full max-w-6xl flex flex-col gap-10 z-10 animate-in fade-in duration-300">
          
          {/* Main Hero Banner */}
          <div className="text-center flex flex-col items-center gap-3">
            <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-300 tracking-wider uppercase drop-shadow-lg">
              Omnidesk BD
            </h1>
            <p className="text-sm sm:text-base font-semibold text-[color:var(--text-muted)] max-w-xl">
              Universal Cognitive StudyOS • Powered by Gemini AI Free Tier
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400/80 mt-1">
              <span>Engineered by</span>
              <a 
                href="https://github.com/thesabbirbd" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-bold hover:underline"
              >
                @thesabbirbd
              </a>
              <span>•</span>
              <span className="text-emerald-400">System Ready</span>
            </div>
          </div>

          {/* User's Existing Projects Grid */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-cyan-400" />
                <h2 className="text-lg font-black tracking-wide text-[color:var(--text-main)]">
                  Your Learning Projects ({spaces.length})
                </h2>
              </div>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all hover:scale-105 active:scale-95"
              >
                <Plus size={15} />
                <span>Create New Project</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Create New Space Card */}
              <div 
                onClick={() => setShowCreate(true)}
                className="p-6 rounded-3xl bg-[var(--bg-card)] shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)] border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 flex flex-col items-center justify-center text-center gap-4 cursor-pointer group hover:shadow-[inset_3px_3px_6px_var(--shadow-dark),inset_-3px_-3px_6px_var(--shadow-light)] transition-all duration-300 min-h-[190px]"
              >
                <div className="p-4 rounded-2xl bg-[var(--bg-input)] shadow-[2px_2px_4px_var(--shadow-dark),-2px_-2px_4px_var(--shadow-light)] text-[color:var(--text-muted)] group-hover:text-cyan-400 group-hover:scale-110 transition-all duration-300">
                  <Plus size={36} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[color:var(--text-main)] group-hover:text-cyan-400 transition-colors">
                    Create New StudySpace
                  </h3>
                  <p className="text-xs text-[color:var(--text-muted)] mt-1">
                    AI generation from topic or document
                  </p>
                </div>
              </div>

              {/* Space Cards */}
              {spaces.map(space => {
                const isBackendDevOps = space.category?.toLowerCase().includes('devops') || 
                                       space.category?.toLowerCase().includes('backend') ||
                                       space.title?.toLowerCase().includes('devops') ||
                                       space.title?.toLowerCase().includes('backend');
                return (
                  <div 
                    key={space.id} 
                    onClick={() => {
                      localStorage.setItem('current_study_space_id', space.id);
                      localStorage.setItem('current_study_space_title', space.title);
                      const slug = getSpaceSlug(space);
                      navigate(`/os/dashboard/${slug}`);
                    }}
                    className="p-6 rounded-3xl bg-[var(--bg-card)] shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col justify-between gap-4 cursor-pointer group hover:shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] transition-all duration-300 relative min-h-[190px]"
                  >
                    {/* Top row: badge + delete button */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-[var(--bg-input)] px-2.5 py-1 rounded-full shadow-[inset_1px_1px_2px_var(--shadow-dark),inset_-1px_-1px_2px_var(--shadow-light)]">
                        {space.category || 'Engineering'}
                      </span>

                      {/* Password Protected Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectToDelete(space);
                        }}
                        className="p-1.5 rounded-xl bg-transparent hover:bg-red-500/15 text-[color:var(--text-muted)] hover:text-red-400 transition-all hover:scale-110"
                        title="Delete project (Requires admin password)"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Middle: Icon & Title */}
                    <div className="flex items-center gap-3.5">
                      <div className={`p-3 rounded-2xl bg-[var(--bg-panel)] shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] group-hover:scale-105 transition-transform ${isBackendDevOps ? 'text-cyan-400' : 'text-teal-400'}`}>
                        {isBackendDevOps ? <Server size={28} /> : <Code size={28} />}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-[color:var(--text-main)] group-hover:text-cyan-400 transition-colors truncate">
                          {space.title}
                        </h3>
                        <p className="text-xs text-[color:var(--text-muted)] mt-0.5 line-clamp-1">
                          {space.description || `${space.topic_count || 4} topics syllabus`}
                        </p>
                      </div>
                    </div>

                    {/* Bottom: Stats & Enter */}
                    <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)] text-xs text-[color:var(--text-muted)]">
                      <span>{space.topic_count || 4} Topics</span>
                      <span className="text-cyan-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Launch <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Suggested Projects / Starter Skills Section */}
          <div className="flex flex-col gap-4 pt-4 border-t border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-teal-400" />
                <h2 className="text-lg font-black tracking-wide text-[color:var(--text-main)]">
                  Ready-Made Suggested Projects & Skills
                </h2>
              </div>
              <span className="text-xs text-[color:var(--text-muted)]">Click any to auto-generate roadmap</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SUGGESTED_STARTER_SKILLS.map(skill => (
                <div
                  key={skill.id}
                  onClick={() => handleSelectStarterSkill(skill)}
                  className={`p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[4px_4px_10px_var(--shadow-dark),-4px_-4px_10px_var(--shadow-light)] hover:shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] cursor-pointer group transition-all duration-300 flex flex-col justify-between gap-3`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl bg-[var(--bg-panel)] ${skill.color} group-hover:scale-110 transition-transform`}>
                      <skill.icon size={22} />
                    </div>
                    <span className="text-[10px] font-bold text-cyan-400 bg-[var(--bg-input)] px-2 py-0.5 rounded-md">
                      Starter
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[color:var(--text-main)] group-hover:text-cyan-400 transition-colors">
                      {skill.title}
                    </h4>
                    <p className="text-xs text-[color:var(--text-muted)] mt-1 line-clamp-2">
                      {skill.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-teal-400 group-hover:translate-x-1 transition-transform">
                    <span>Use Template</span>
                    <ChevronRight size={13} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : previewData ? (
        /* ================= PREVIEW SCREEN ================= */
        <div className="w-full max-w-3xl z-10 flex flex-col gap-6 animate-in fade-in duration-200">
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] shadow-[10px_10px_24px_var(--shadow-dark),-10px_-10px_24px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col gap-5">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--border-color)] gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Curriculum Preview</span>
                <h2 className="text-2xl font-black text-[color:var(--text-main)] mt-0.5">{previewData.title}</h2>
                <p className="text-xs text-[color:var(--text-muted)] mt-0.5">{previewData.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1 rounded-xl bg-[var(--bg-input)] text-xs font-bold uppercase tracking-wider text-teal-400 border border-teal-500/30">
                  {previewData.category || category}
                </span>
                <span className="px-3 py-1 rounded-xl bg-[var(--bg-input)] text-xs font-bold tracking-wider text-cyan-400 flex items-center gap-1 border border-cyan-500/30">
                  <Clock size={13} /> {previewData.estimated_total_minutes || 0} min
                </span>
              </div>
            </div>

            {generationError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{generationError}</span>
              </div>
            )}

            {/* Topics List with Natural Scroll */}
            <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
              {previewData.topics?.map((topic, idx) => (
                <div 
                  key={idx} 
                  className="p-4 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-color)] flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-sm text-[color:var(--text-main)]">{topic.title}</h4>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-[var(--bg-input)] text-[color:var(--text-muted)] font-medium">
                      {topic.estimated_minutes}m
                    </span>
                  </div>

                  {topic.description && (
                    <p className="text-xs text-[color:var(--text-muted)] pl-8 leading-relaxed">
                      {topic.description}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
              <button 
                onClick={() => setPreviewData(null)}
                disabled={isApproving}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] transition-colors"
              >
                Back & Refine
              </button>
              <div className="flex gap-3">
                <button 
                  onClick={resetForm}
                  disabled={isApproving}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-[color:var(--text-muted)] hover:text-red-400 transition-colors"
                >
                  Discard
                </button>
                <button 
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all active:scale-95 disabled:opacity-50"
                >
                  {isApproving ? (
                    <>
                      <Sparkles className="animate-spin" size={15} /> Launching...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={15} /> Approve & Launch Workspace
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* ================= INPUT & GENERATION FORM (DEAD-CENTERED & SCROLL SAFE) ================= */
        <div className="w-full max-w-2xl z-10 flex flex-col items-center justify-center my-auto animate-in fade-in duration-200">
          <div className="w-full p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] shadow-[10px_10px_24px_var(--shadow-dark),-10px_-10px_24px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col gap-5">
            
            {/* Form Header with Back to Projects Button */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="p-1.5 rounded-xl hover:bg-[var(--bg-input)] text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] transition-colors flex items-center gap-1 text-xs font-semibold"
                  title="Back to Projects"
                >
                  <ArrowLeft size={16} />
                  <span>Projects</span>
                </button>
                <div>
                  <h2 className="text-xl font-black text-[color:var(--text-main)]">Initialize StudySpace</h2>
                  <p className="text-xs text-[color:var(--text-muted)]">Type a topic or upload curriculum documentation</p>
                </div>
              </div>

              {/* Master AI Prompt Button */}
              <button
                type="button"
                onClick={() => setShowMasterPromptModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/40 hover:border-cyan-400 text-purple-300 hover:text-cyan-300 text-xs font-bold transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95"
                title="View & Copy Master AI Prompt for ChatGPT, Claude or Gemini"
              >
                <Sparkles size={13} className="text-cyan-400 animate-pulse" />
                <span className="hidden sm:inline">Master AI Prompt</span>
              </button>
            </div>

            {generationError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{generationError}</span>
              </div>
            )}

            {/* Mode Selection Tabs */}
            <div className="flex p-1 rounded-2xl bg-[var(--bg-input)] shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)]">
              <button
                type="button"
                onClick={() => setInputMode('topic')}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                  inputMode === 'topic'
                    ? 'bg-[var(--bg-card)] text-cyan-400 shadow-[2px_2px_6px_var(--shadow-dark),-2px_-2px_6px_var(--shadow-light)]'
                    : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]'
                }`}
              >
                <Zap size={14} /> Topic Name / Goal
              </button>
              <button
                type="button"
                onClick={() => setInputMode('file')}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                  inputMode === 'file'
                    ? 'bg-[var(--bg-card)] text-cyan-400 shadow-[2px_2px_6px_var(--shadow-dark),-2px_-2px_6px_var(--shadow-light)]'
                    : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]'
                }`}
              >
                <Upload size={14} /> Upload Document (PDF/TXT/MD)
              </button>
            </div>

            {/* Mode Content */}
            {inputMode === 'topic' ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[color:var(--text-muted)] pl-1">
                  Topic Name or Learning Goal
                </label>
                <div className="relative">
                  <BookOpen size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
                  <input 
                    type="text" 
                    value={topicName}
                    onChange={(e) => setTopicName(e.target.value)}
                    placeholder="e.g. Backend -> DevOps, Computer Networking, or Kubernetes" 
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[color:var(--text-main)] font-semibold text-sm rounded-2xl py-3 pl-10 pr-4 focus:outline-none focus:border-cyan-500/50 transition-all shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)]"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[color:var(--text-muted)] pl-1">
                  Drop Syllabus or Document
                </label>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.txt,.md"
                  className="hidden" 
                />
                <div 
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all ${
                    dragOver 
                      ? 'border-cyan-400 bg-cyan-500/10' 
                      : selectedFile 
                        ? 'border-teal-500/50 bg-teal-500/5' 
                        : 'border-[var(--border-color)] hover:border-cyan-500/40 bg-[var(--bg-input)]'
                  }`}
                >
                  {selectedFile ? (
                    <div className="flex items-center gap-2.5 text-teal-400">
                      <FileText size={26} />
                      <div className="text-left">
                        <p className="font-bold text-xs text-[color:var(--text-main)]">{selectedFile.name}</p>
                        <p className="text-[10px] text-[color:var(--text-muted)]">{(selectedFile.size / 1024).toFixed(1)} KB • Ready for extraction</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload size={26} className="text-cyan-400" />
                      <div className="text-center">
                        <p className="text-xs font-bold text-[color:var(--text-main)]">Drag & drop or click to browse</p>
                        <p className="text-[10px] text-[color:var(--text-muted)] mt-0.5">Supports PDF, TXT, and Markdown files</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Metadata Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[color:var(--text-muted)] pl-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[color:var(--text-main)] font-semibold text-xs rounded-2xl py-2.5 px-3 focus:outline-none focus:border-cyan-500/50 transition-all shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)]"
                >
                  <option value="Backend / DevOps">Backend / DevOps</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Programming">Programming</option>
                  <option value="DevOps & Cloud">DevOps & Cloud</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Data Science & AI">Data Science & AI</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[color:var(--text-muted)] pl-1">
                  Daily Target (Minutes)
                </label>
                <input 
                  type="number" 
                  min="15" 
                  max="480" 
                  step="15"
                  value={dailyMinutes}
                  onChange={(e) => setDailyMinutes(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[color:var(--text-main)] font-semibold text-xs rounded-2xl py-2.5 px-3 focus:outline-none focus:border-cyan-500/50 transition-all shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)]"
                />
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
              <button 
                type="button"
                onClick={resetForm}
                disabled={isGenerating}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all active:scale-95 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="animate-spin" size={15} /> Generating with Gemini...
                  </>
                ) : (
                  <>
                    <span>Generate StudySpace</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MASTER AI PROMPT MODAL                                                    */}
      {/* ========================================================================= */}
      {showMasterPromptModal && (
        <div 
          onClick={() => setShowMasterPromptModal(false)}
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 select-none text-left"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[0_25px_60px_rgba(0,0,0,0.8)] p-6 md:p-8 flex flex-col gap-4 max-h-[85vh] overflow-y-auto select-text"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-cyan-400" />
                <h3 className="text-lg font-black text-[color:var(--text-main)]">Master AI Prompt Generator</h3>
              </div>
              <button 
                onClick={() => setShowMasterPromptModal(false)}
                className="p-1 rounded-lg hover:bg-[var(--bg-input)] text-[color:var(--text-muted)] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[color:var(--text-muted)] leading-relaxed">
              Copy this curriculum prompt into ChatGPT, Claude, Gemini, or DeepSeek. It specifies exhaustive pedagogical depth and structured output.
            </p>

            <pre className="p-4 rounded-2xl bg-slate-950 text-cyan-300 font-mono text-xs overflow-x-auto border border-cyan-500/20 leading-relaxed whitespace-pre-wrap max-h-80">
              {generateMasterPrompt(topicName)}
            </pre>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-[color:var(--text-muted)]">
                {copiedPrompt ? "✓ Copied to clipboard!" : "Ready to copy"}
              </span>
              <button
                onClick={handleCopyMasterPrompt}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all active:scale-95"
              >
                {copiedPrompt ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedPrompt ? "Copied!" : "Copy Master Prompt"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
