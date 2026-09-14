import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { slugify, matchesSlug, getSpaceSlug } from '../utils/slugify';
import { 
  Calendar, 
  Target,
  Sparkles,
  Upload,
  FileText,
  Plus,
  Check,
  ChevronRight,
  AlertCircle,
  X,
  ArrowRight,
  BookOpen,
  Layers,
  Zap,
  Globe,
  Code,
  Video,
  Server,
  Shield,
  Cpu,
  RefreshCw,
  FolderOpen,
  Copy,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { generateMasterPrompt, DEFAULT_TOPIC_PLACEHOLDER } from '../utils/masterPrompt';
import WikipediaTooltip from '../components/WikipediaTooltip';
import { 
  getTopics, 
  getSessions, 
  getStudySpaces, 
  generateStudySpace, 
  approveStudySpace,
  getTemplatePreview
} from '../services/api';
import DeleteProjectModal from '../components/projects/DeleteProjectModal';
import DashboardInteractiveMindMap from '../components/dashboard/DashboardInteractiveMindMap';

import DashboardActiveSprintPanel from '../components/dashboard/DashboardActiveSprintPanel';
import DashboardStudyTimer from '../components/dashboard/DashboardStudyTimer';
import DashboardTodaysStudy from '../components/dashboard/DashboardTodaysStudy';
import DashboardProgressOverview from '../components/dashboard/DashboardProgressOverview';
import DashboardStudyPlanWidget from '../components/dashboard/DashboardStudyPlanWidget';
import DashboardMaterialsNotesWidget from '../components/dashboard/DashboardMaterialsNotesWidget';
import DashboardAiQuickLinksWidget from '../components/dashboard/DashboardAiQuickLinksWidget';

const SUGGESTED_SKILLS = [
  {
    id: 'networking',
    title: 'Computer Networking Basics',
    description: 'OSI 7 Layers, TCP/IP, IPv4 Subnetting & Routing Protocols',
    icon: Globe,
    category: 'Computer Science & Networking',
    gradient: 'from-blue-500/20 to-cyan-500/20 border-cyan-500/40 text-cyan-400'
  },
  {
    id: 'python',
    title: 'Python Mastery',
    description: 'AsyncIO, Generators, Metaclasses, OOP & Clean Architecture',
    icon: Code,
    category: 'Software Engineering',
    gradient: 'from-amber-500/20 to-yellow-500/20 border-amber-500/40 text-amber-400'
  },
  {
    id: 'video',
    title: 'Video Editing & Production',
    description: 'Storyboarding, Timeline Cutting, Color Grading & Sound FX',
    icon: Video,
    category: 'Digital Media & Arts',
    gradient: 'from-pink-500/20 to-rose-500/20 border-pink-500/40 text-pink-400'
  },
  {
    id: 'cloud-native',
    title: 'Kubernetes Architecture',
    description: 'Pods, Services, Ingress Controllers, Helm & Production Clusters',
    icon: Server,
    category: 'DevOps & Cloud Native',
    gradient: 'from-indigo-500/20 to-blue-500/20 border-indigo-500/40 text-indigo-400'
  },
  {
    id: 'cloud',
    title: 'Cloud Engineering',
    description: 'Terraform, AWS VPC/IAM, Multi-Region SRE & High Availability',
    icon: Cpu,
    category: 'Infrastructure & SRE',
    gradient: 'from-teal-500/20 to-emerald-500/20 border-teal-500/40 text-teal-400'
  },
  {
    id: 'sec',
    title: 'Cybersecurity & Ethical Hacking',
    description: 'Penetration Testing, OWASP Top 10, Network Defense & CVE Auditing',
    icon: Shield,
    category: 'Information Security',
    gradient: 'from-purple-500/20 to-violet-500/20 border-purple-500/40 text-purple-400'
  },
  {
    id: 'ai',
    title: 'AI & LLM Engineering',
    description: 'Prompt Engineering, RAG Architectures, Vector DBs & Multi-Agent SDKs',
    icon: Sparkles,
    category: 'Artificial Intelligence',
    gradient: 'from-emerald-500/20 to-green-500/20 border-emerald-500/40 text-emerald-400'
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { spaceSlug } = useParams();
  const [searchParams] = useSearchParams();
  
  // Active Space & Topics State
  const [spaces, setSpaces] = useState([]);
  const [currentSpace, setCurrentSpace] = useState(null);
  const [topics, setTopics] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isLoadingSpace, setIsLoadingSpace] = useState(false);

  // Creation Input State
  const [topicInput, setTopicInput] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [dailyMinutes, setDailyMinutes] = useState(60);
  const [selectedCategory, setSelectedCategory] = useState('Technology & Engineering');
  
  // AI Generation & Preview State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [activeSuggestion, setActiveSuggestion] = useState(null);

  const [showMasterPromptModal, setShowMasterPromptModal] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const handleProjectDeleted = (deletedId) => {
    setSpaces(prev => prev.filter(s => s.id !== deletedId));
    if (currentSpace?.id === deletedId) {
      localStorage.removeItem('current_study_space_id');
      localStorage.removeItem('current_study_space_title');
      window.dispatchEvent(new CustomEvent('studyos-space-changed', { detail: null }));
      navigate('/os/dashboard');
    }
    loadActiveSpaceAndTopics();
  };

  const handleCopyMasterPrompt = () => {
    const prompt = generateMasterPrompt(topicInput);
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };


  const fileInputRef = useRef(null);
  const topicInputRef = useRef(null);

  // 1. Fetch available StudySpaces and active space topics with dynamic slug matching
  const loadActiveSpaceAndTopics = async (targetSlugOverride) => {
    setIsLoadingSpace(true);
    try {
      const [fetchedSpaces, fetchedSessions] = await Promise.all([
        getStudySpaces().catch(() => []),
        getSessions().catch(() => [])
      ]);

      const spaceList = Array.isArray(fetchedSpaces) ? fetchedSpaces : [];
      setSpaces(spaceList);
      setSessions(Array.isArray(fetchedSessions) ? fetchedSessions : []);

      const activeSlug = targetSlugOverride !== undefined 
        ? targetSlugOverride 
        : (spaceSlug || searchParams.get('space') || searchParams.get('project'));
      const savedSpaceId = localStorage.getItem('current_study_space_id');

      let active = null;
      // 1. Prioritize URL slug/ID match
      if (activeSlug) {
        active = spaceList.find(s => matchesSlug(s, activeSlug));
      }

      // 2. Fall back to localStorage space
      if (!active && savedSpaceId) {
        active = spaceList.find(s => matchesSlug(s, savedSpaceId));
      }

      // 3. Fall back to first space in DB
      if (!active && spaceList.length > 0) {
        active = spaceList[0];
      }

      // 4. Default fallback placeholder
      if (!active) {
        active = {
          id: 'default-devops',
          title: '100-Day Backend → DevOps Engineer',
          description: 'Build strong backend skills, master DevOps, and grow into a complete engineer.',
          category: 'Backend / DevOps'
        };
      }

      setCurrentSpace(active);
      if (active?.id && active.id !== 'default-devops') {
        localStorage.setItem('current_study_space_id', active.id);
        localStorage.setItem('current_study_space_title', active.title);

        // Keep URL in sync with active space slug
        const canonicalSlug = getSpaceSlug(active);
        if (canonicalSlug && spaceSlug !== canonicalSlug) {
          navigate(`/os/dashboard/${canonicalSlug}`, { replace: true });
        }

        const fetchedTopics = await getTopics(active.id).catch(() => []);
        setTopics(Array.isArray(fetchedTopics) ? fetchedTopics : []);
      } else {
        const fetchedTopics = await getTopics().catch(() => []);
        setTopics(Array.isArray(fetchedTopics) ? fetchedTopics : []);
      }
    } catch (err) {
      console.error('Error loading dashboard space:', err);
    } finally {
      setIsLoadingSpace(false);
    }
  };

  useEffect(() => {
    loadActiveSpaceAndTopics(spaceSlug);

    const handleSpaceChanged = (e) => {
      if (e.detail?.id) {
        localStorage.setItem('current_study_space_id', e.detail.id);
        localStorage.setItem('current_study_space_title', e.detail.title);
        const newSlug = getSpaceSlug(e.detail);
        if (newSlug) {
          navigate(`/os/dashboard/${newSlug}`, { replace: true });
        }
      }
      loadActiveSpaceAndTopics(e.detail ? getSpaceSlug(e.detail) : undefined);
    };

    window.addEventListener('studyos-space-changed', handleSpaceChanged);
    return () => window.removeEventListener('studyos-space-changed', handleSpaceChanged);
  }, [spaceSlug]);

  // 2. File drop handlers
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
    if (!customTitle) {
      setCustomTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }
  };

  // 3. Auto-fill from suggested skills
  const handleSelectSuggestion = async (skill) => {
    setActiveSuggestion(skill.id);
    setTopicInput(skill.title);
    setCustomTitle(skill.title);
    setSelectedCategory(skill.category);
    setGenerationError(null);
    setIsGenerating(true);
    try {
      // Map the skill.id to template_id if needed. The SUGGESTED_SKILLS ids are like 'net', 'py', 'video', 'k8s', 'cloud', 'sec', 'ai'
      // We will just use skill.id as the template ID.
      const preview = await getTemplatePreview(skill.id);
      setPreviewData(preview);
    } catch (err) {
      console.error('Failed to load template:', err);
      setGenerationError("Failed to load local template. " + (err.response?.data?.detail || err.message));
    } finally {
      setIsGenerating(false);
    }
  };

  // 4. Generate StudySpace via Gemini 3.6 Flash
  const handleGenerateStudySpace = async () => {
    setGenerationError(null);
    const hasTopic = topicInput.trim().length > 0;
    const hasFile = selectedFile !== null;

    if (!hasTopic && !hasFile) {
      setGenerationError("Please enter a topic/skill goal or upload a document (.pdf, .txt, .md).");
      if (topicInputRef.current) topicInputRef.current.focus();
      return;
    }

    setIsGenerating(true);

    try {
      let preview;
      if (hasFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        if (customTitle.trim()) formData.append('title', customTitle.trim());
        formData.append('category', selectedCategory);
        formData.append('daily_target_minutes', dailyMinutes.toString());
        preview = await generateStudySpace(formData);
      } else {
        const payload = {
          topic_name: topicInput.trim(),
          title: customTitle.trim() || topicInput.trim(),
          category: selectedCategory,
          daily_target_minutes: parseInt(dailyMinutes, 10) || 60
        };
        preview = await generateStudySpace(payload);
      }

      setPreviewData(preview);
    } catch (err) {
      console.error('Generation failure:', err);
      const detail = err.response?.data?.detail || err.message || "Failed to generate StudySpace with Gemini AI.";
      setGenerationError(typeof detail === 'string' ? detail : JSON.stringify(detail));
    } finally {
      setIsGenerating(false);
    }
  };

  // 5. Approve & Persist StudySpace, dynamically adapting OS
  const handleApproveStudySpace = async () => {
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
        const newSlug = getSpaceSlug(created);
        localStorage.setItem('current_study_space_id', created.id);
        localStorage.setItem('current_study_space_title', created.title);
        window.dispatchEvent(new CustomEvent('studyos-space-changed', { detail: created }));
        if (newSlug) {
          navigate(`/os/dashboard/${newSlug}`);
        }
      }

      // Reset form and reload space
      setPreviewData(null);
      setTopicInput('');
      setCustomTitle('');
      setSelectedFile(null);
      setActiveSuggestion(null);
      await loadActiveSpaceAndTopics();
    } catch (err) {
      console.error('Approval failure:', err);
      const detail = err.response?.data?.detail || err.message || "Failed to approve and save StudySpace.";
      setGenerationError(typeof detail === 'string' ? detail : JSON.stringify(detail));
    } finally {
      setIsApproving(false);
    }
  };

  // Progress calculations
  const totalTopicsCount = topics.length || 1;
  const completedTopicsCount = topics.filter(
    (t) => (t.status || '').toLowerCase() === 'complete' || (t.status || '').toLowerCase() === 'mastered'
  ).length;
  const learningTopicsCount = topics.filter(
    (t) => (t.status || '').toLowerCase() === 'learning' || (t.status || '').toLowerCase() === 'in_progress'
  ).length;
  const notStartedTopicsCount = Math.max(0, totalTopicsCount - completedTopicsCount - learningTopicsCount);
  const progressPercent = Math.min(100, Math.round((completedTopicsCount / totalTopicsCount) * 100));

  // Compute dynamic weekly study plan representation
  const computedPlanWeeks = topics.length > 0 
    ? Array.from({ length: Math.max(1, Math.ceil(topics.length / 4)) }, (_, wIdx) => {
        const slice = topics.slice(wIdx * 4, (wIdx + 1) * 4);
        const done = slice.filter(t => (t.status || '').toLowerCase() === 'complete').length;
        const pct = Math.round((done / Math.max(1, slice.length)) * 100);
        return {
          week: `Week ${wIdx + 1}`,
          title: slice[0]?.title || `Sprint Stage ${wIdx + 1}`,
          progress: pct,
          status: pct === 100 ? 'completed' : pct > 0 ? 'in_progress' : 'upcoming',
          days: `${done}/${slice.length} topics`
        };
      })
    : undefined;

  return (
    <div className="flex flex-col w-full min-h-full text-[color:var(--text-main)] gap-6 pb-12 transition-colors duration-300">
      
      {/* ========================================================================= */}
      {/* 1. VERY TOP: PROMINENT, PREMIUM "CREATE NEW PROJECT / STUDYSPACE" INPUT AREA */}
      {/* ========================================================================= */}
      <div className="w-full shrink-0 rounded-3xl bg-[var(--bg-card)] shadow-[8px_8px_20px_var(--shadow-dark),-8px_-8px_20px_var(--shadow-light)] border border-[var(--border-color)] p-6 md:p-8 relative overflow-hidden transition-all">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-400/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[inset_2px_2px_4px_rgba(6,182,212,0.2)] shrink-0">
              <Sparkles size={24} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black tracking-wide text-[color:var(--text-main)]">
                  Create New Project / StudySpace
                </h2>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                  Gemini 3.6 Flash Free Tier
                </span>
              </div>
              <p className="text-xs font-semibold text-[color:var(--text-muted)] mt-0.5">
                Type any skill goal or drop documentation (.pdf, .txt, .md). The AI generates an instant interactive learning roadmap.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {/* Master AI Prompt Button */}
            <button
              onClick={() => setShowMasterPromptModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/40 hover:border-cyan-400 text-purple-300 hover:text-cyan-300 text-xs font-bold transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95"
              title="View & Copy Master AI Prompt for external AIs (ChatGPT, Claude, Gemini)"
            >
              <Sparkles size={14} className="text-cyan-400 animate-pulse" />
              <span>Master AI Prompt</span>
            </button>

            {/* Daily Study Commitment Quick Selector */}
            <div className="flex items-center gap-1.5 bg-[var(--bg-input)] px-3 py-1.5 rounded-2xl border border-[var(--border-color)] shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)]">
              <span className="text-[11px] font-bold text-[color:var(--text-muted)] mr-1">Daily Pace:</span>
              {[30, 60, 90, 120].map((m) => (
                <button
                  key={m}
                  onClick={() => setDailyMinutes(m)}
                  className={`px-2 py-0.5 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                    dailyMinutes === m
                      ? 'bg-cyan-400 text-slate-950 shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                      : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Unified Input Zone (Text Input + File Drag-and-Drop) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 relative z-10 items-stretch">
          
          {/* Left Column: Topic Goal Input (col-span-7) */}
          <div className="lg:col-span-7 flex flex-col gap-3 justify-between">
            <div className="relative flex items-center">
              <input
                ref={topicInputRef}
                type="text"
                value={topicInput}
                onChange={(e) => {
                  setTopicInput(e.target.value);
                  setGenerationError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGenerateStudySpace();
                }}
                placeholder="What do you want to learn? (e.g. Computer Networking Basics, Python Mastery, Video Editing...)"
                className="w-full h-14 bg-[var(--bg-input)] border border-[var(--border-color)] focus:border-cyan-400 text-sm font-semibold text-[color:var(--text-main)] rounded-2xl px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] placeholder:text-[color:var(--text-muted)] transition-all"
              />
              {topicInput && (
                <button
                  onClick={() => {
                    setTopicInput('');
                    setActiveSuggestion(null);
                  }}
                  className="absolute right-3 p-1 rounded-lg text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] hover:bg-[var(--bg-card)] transition-all cursor-pointer"
                  title="Clear input"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Custom Title (Optional override) */}
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Custom Workspace Title (optional, defaults to goal name)"
              className="w-full h-11 bg-[var(--bg-input)] border border-[var(--border-color)] text-xs font-medium text-[color:var(--text-main)] rounded-xl px-3 focus:outline-none focus:border-cyan-400/60 shadow-[inset_1px_1px_3px_var(--shadow-dark)] placeholder:text-[color:var(--text-muted)]"
            />
          </div>

          {/* Right Column: File Drag-and-Drop Area (col-span-5) */}
          <div className="lg:col-span-5 flex flex-col">
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
              className={`h-full min-h-[106px] rounded-2xl border-2 border-dashed p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                dragOver 
                  ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_15px_rgba(34,211,238,0.2)]' 
                  : selectedFile
                  ? 'border-emerald-500/50 bg-emerald-500/5 shadow-[inset_2px_2px_4px_var(--shadow-dark)]'
                  : 'border-[var(--border-color)] hover:border-cyan-500/40 bg-[var(--bg-input)] shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)]'
              }`}
            >
              {selectedFile ? (
                <div className="flex items-center gap-3 w-full justify-between px-2">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <FileText size={22} className="text-emerald-400 shrink-0" />
                    <div className="text-left overflow-hidden">
                      <div className="text-xs font-bold text-[color:var(--text-main)] truncate max-w-[200px]">
                        {selectedFile.name}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-semibold">
                        {(selectedFile.size / 1024).toFixed(1)} KB • Click to replace
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="p-1.5 rounded-lg bg-[var(--bg-card)] text-[color:var(--text-muted)] hover:text-rose-400 transition-colors"
                    title="Remove file"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <Upload size={20} className="text-cyan-400" />
                  <div className="text-xs font-bold text-[color:var(--text-main)]">
                    <span>Drop PDF, TXT or Markdown</span>
                    <span className="text-cyan-400 ml-1 underline">or browse</span>
                  </div>
                  <span className="text-[10px] text-[color:var(--text-muted)]">
                    Max 50MB • Ingests & builds structured DAG roadmap
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Error Notification Banner */}
        {generationError && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-400 animate-in fade-in duration-200">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1">
              <span className="font-bold">Error: </span>
              <span>{generationError}</span>
            </div>
            <button 
              onClick={() => setGenerationError(null)}
              className="p-1 rounded text-rose-400 hover:text-rose-300"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Generate Action Button */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[var(--border-color)]">
          <div className="text-xs text-[color:var(--text-muted)] font-medium">
            {topicInput.trim() 
              ? <span>Target Goal: <strong className="text-cyan-400">{topicInput}</strong></span>
              : selectedFile
              ? <span>Source Document: <strong className="text-emerald-400">{selectedFile.name}</strong></span>
              : <span>Choose a suggested project below or type your custom goal</span>}
          </div>

          <button
            onClick={handleGenerateStudySpace}
            disabled={isGenerating || (!topicInput.trim() && !selectedFile)}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-black text-xs tracking-wider uppercase transition-all duration-200 cursor-pointer shadow-[6px_6px_14px_var(--shadow-dark),-6px_-6px_14px_var(--shadow-light)] ${
              isGenerating || (!topicInput.trim() && !selectedFile)
                ? 'opacity-50 cursor-not-allowed bg-[var(--bg-input)] text-[color:var(--text-muted)]'
                : 'bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 active:scale-98 shadow-[0_0_15px_rgba(34,211,238,0.4)]'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw size={16} className="animate-spin text-slate-950" />
                <span>Synthesizing with Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Generate StudySpace</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUGGESTED PROJECTS / SKILLS SECTION (RIGHT BELOW INPUT AREA)             */}
      {/* ========================================================================= */}
      <div className="w-full shrink-0 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-cyan-400" />
            <h3 className="text-xs font-black tracking-wider uppercase text-[color:var(--text-muted)]">
              Suggested Projects / Skills (Click to Auto-Fill)
            </h3>
          </div>
          <span className="text-[10px] font-bold text-[color:var(--text-muted)]">
            7 Curated Engineering Domains
          </span>
        </div>

        {/* Horizontal Scrolling or Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-3 w-full">
          {SUGGESTED_SKILLS.map((skill) => {
            const Icon = skill.icon;
            const isSelected = activeSuggestion === skill.id || topicInput === skill.title;

            return (
              <button
                key={skill.id}
                onClick={() => handleSelectSuggestion(skill)}
                className={`p-3.5 rounded-2xl bg-[var(--bg-card)] border text-left flex flex-col justify-between gap-2.5 transition-all duration-200 cursor-pointer group hover:scale-102 ${
                  isSelected
                    ? 'border-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.35),inset_2px_2px_4px_var(--shadow-dark)] ring-1 ring-cyan-400'
                    : 'border-[var(--border-color)] shadow-[4px_4px_10px_var(--shadow-dark),-4px_-4px_10px_var(--shadow-light)] hover:border-cyan-500/40 hover:shadow-[inset_2px_2px_4px_var(--shadow-dark)]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${skill.gradient} shadow-[inset_1px_1px_3px_rgba(0,0,0,0.3)]`}>
                    <Icon size={16} />
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  )}
                </div>

                <div>
                  <div className="text-xs font-black text-[color:var(--text-main)] group-hover:text-cyan-400 transition-colors line-clamp-1">
                    {skill.title}
                  </div>
                  <p className="text-[10px] font-medium text-[color:var(--text-muted)] line-clamp-2 mt-0.5">
                    {skill.description}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-[9px] font-bold text-cyan-400 group-hover:underline pt-1 border-t border-[var(--border-color)]">
                  <span>Auto-fill</span>
                  <ArrowRight size={10} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2.5 PREVIEW DRAWER / MODAL: STRICTLY ANALYZE -> PREVIEW -> APPROVE -> PERSIST */}
      {/* ========================================================================= */}
      {previewData && (
        <div className="w-full shrink-0 rounded-3xl bg-[var(--bg-card)] border-2 border-cyan-500/40 shadow-[10px_10px_30px_var(--shadow-dark),-10px_-10px_30px_var(--shadow-light)] p-6 md:p-8 flex flex-col gap-6 animate-in fade-in duration-300">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Check size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Roadmap Preview Ready
                  </span>
                  <span className="text-[10px] font-bold text-[color:var(--text-muted)]">
                    Provider: {previewData.provider_used || 'Gemini 3.6 Flash'}
                  </span>
                </div>
                <h3 className="text-xl font-black text-[color:var(--text-main)] mt-1">
                  {previewData.title}
                </h3>
                <p className="text-xs text-[color:var(--text-muted)] mt-0.5">
                  {previewData.description || previewData.summary}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setPreviewData(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] bg-[var(--bg-input)] border border-[var(--border-color)] cursor-pointer"
              >
                Discard
              </button>

              <button
                onClick={handleApproveStudySpace}
                disabled={isApproving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(52,211,153,0.5)] cursor-pointer transition-all"
              >
                {isApproving ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Activating Space...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Approve & Create</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Topics Grid */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-bold text-[color:var(--text-muted)]">
              <span>Synthesized Topics ({previewData.topics?.length || 0})</span>
              <span>Total Estimated Time: {previewData.total_estimated_minutes || 600} minutes</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 max-h-80 overflow-y-auto pr-1">
              {(previewData.topics || []).map((t, idx) => (
                <div 
                  key={idx} 
                  className="p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] flex flex-col justify-between gap-3 shadow-[inset_1px_1px_3px_var(--shadow-dark)]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-cyan-400">
                        #{idx + 1}
                      </span>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {t.difficulty || 'INTERMEDIATE'}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-[color:var(--text-main)] line-clamp-1">
                      {t.title}
                    </h4>
                    <p className="text-[10px] text-[color:var(--text-muted)] line-clamp-2 mt-1">
                      {t.description}
                    </p>
                  </div>

                  {/* Subtopics */}
                  {t.subtopics && t.subtopics.length > 0 && (
                    <div className="flex flex-col gap-1 pt-2 border-t border-[var(--border-color)]">
                      <span className="text-[9px] font-bold text-[color:var(--text-muted)] uppercase">Milestones:</span>
                      {t.subtopics.slice(0, 2).map((sub, sIdx) => (
                        <div key={sIdx} className="text-[9px] text-[color:var(--text-muted)] flex items-center gap-1.5 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 shrink-0" />
                          <span className="truncate">{sub}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ACTIVE STUDY SPACE HERO & DYNAMIC MISSION HEADER                        */}
      {/* ========================================================================= */}
      <div className="w-full shrink-0 p-6 rounded-3xl bg-[var(--bg-card)] shadow-[6px_6px_14px_var(--shadow-dark),-6px_-6px_14px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col lg:flex-row items-center justify-between gap-6 transition-all">
        
        {/* Left: Active Mission Identity */}
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[inset_2px_2px_4px_rgba(6,182,212,0.2)] shrink-0">
            <Target size={26} className="drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black tracking-wide text-[color:var(--text-main)] truncate">
                {currentSpace?.title || '100-Day Backend → DevOps Engineer'}
              </h1>
              {currentSpace?.category && (
                <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
                  {currentSpace.category}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-[color:var(--text-muted)] line-clamp-1 mt-0.5">
              {currentSpace?.description || 'Build strong foundations, master core systems, and verify genuine competence.'}
            </p>
          </div>
        </div>

        {/* Middle: Dynamic Progress Bar */}
        <div className="flex flex-col w-full lg:w-72 gap-2 shrink-0">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-[color:var(--text-muted)]">Track Progress</span>
            <span className="text-cyan-400 font-black">{progressPercent}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-[var(--bg-input)] shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] p-0.5 overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.6)] transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-[10px] font-bold text-right text-[color:var(--text-muted)]">
            {completedTopicsCount} of {totalTopicsCount} Topics Mastered
          </div>
        </div>

        {/* Right: Study Space Quick Switcher */}
        <div className="flex items-center justify-between gap-4 w-full lg:w-auto px-5 py-3 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] shrink-0">
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-amber-400" />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Active StudySpace
              </span>
              <span className="text-xs font-black text-[color:var(--text-main)]">
                {spaces.length || 1} Registered Tracks
              </span>
            </div>
          </div>

          {/* Mini gauge & Delete button */}
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-700/40"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-cyan-400 transition-all duration-1000"
                  strokeDasharray={`${progressPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>

            {currentSpace && currentSpace.id !== 'default-devops' && (
              <button
                type="button"
                onClick={() => setProjectToDelete(currentSpace)}
                className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors ml-1 cursor-pointer"
                title={`Delete ${currentSpace.title} (Admin protected)`}
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>


      </div>

      {/* ========================================================================= */}
      {/* 4. MIDDLE SECTION: DYNAMIC REACT FLOW MIND MAP & ACTIVE SPRINT (LEFT)       */}
      {/*    AND TODAY'S ACTIVITY & PROGRESS OVERVIEW (RIGHT)                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full shrink-0 items-start">
        
        {/* Left Column: Interactive Mind Map + Active Sprint Panel (approx 65% width / col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Dynamic Mind Map passing currently active space and real topics */}
          <DashboardInteractiveMindMap 
            activeSpace={currentSpace} 
            spaceTopics={topics} 
          />

          {/* Active Sprint & Telemetry Panel */}
          <DashboardActiveSprintPanel />
        </div>

        {/* Right Column: Activity & Control Stack (approx 35% width / col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <DashboardTodaysStudy />
          <DashboardProgressOverview 
            topicsCount={{ 
              completed: completedTopicsCount, 
              learning: learningTopicsCount, 
              notStarted: notStartedTopicsCount, 
              blocked: 0 
            }} 
          />
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. BOTTOM ROW: 4 CONTEXTUAL WIDGET CARDS                                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full shrink-0 items-stretch">
        
        {/* Card 1: Current Study Plan */}
        <DashboardStudyPlanWidget planWeeks={computedPlanWeeks} />

        {/* Card 2: Learning Materials & Recent Notes */}
        <DashboardMaterialsNotesWidget />

        {/* Card 3: Study Timer (State Isolated) */}
        <DashboardStudyTimer />

        {/* Card 4: AI Assistant & Quick Links */}
        <DashboardAiQuickLinksWidget />

      </div>

      {/* ========================================================================= */}
      {/* 6. MASTER AI PROMPT MODAL (FOR CHATGPT, CLAUDE, GEMINI, DEEPSEEK)           */}
      {/* ========================================================================= */}
      {showMasterPromptModal && (
        <div 
          onClick={() => setShowMasterPromptModal(false)}
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 select-none"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[0_25px_60px_rgba(0,0,0,0.8),inset_1px_1px_2px_rgba(255,255,255,0.1)] p-6 md:p-8 flex flex-col gap-5 max-h-[88vh] overflow-y-auto select-text"
          >
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  <Sparkles size={22} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-black text-[color:var(--text-main)]">
                    Omnidesk BD Master AI Prompt
                  </h3>
                  <p className="text-xs text-[color:var(--text-muted)] font-semibold mt-0.5">
                    Generate an ultra-detailed, syllabus-complete curriculum from any AI
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowMasterPromptModal(false)}
                className="p-2 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-panel)] text-[color:var(--text-muted)] hover:text-white border border-[var(--border-color)] transition-all cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300 flex items-start gap-3">
              <Sparkles size={18} className="shrink-0 text-cyan-400 mt-0.5" />
              <div className="leading-relaxed">
                <span>
                  <strong>How to use:</strong> Click <strong>Copy Master Prompt</strong> below. We've automatically filled in your topic ({topicInput.trim() ? <strong className="text-white">"{topicInput.trim()}"</strong> : <em>"your chosen topic"</em>}) at the bottom of the prompt. Paste it into ChatGPT, Claude, Gemini, or DeepSeek. Save the generated reply as a <strong>.md</strong> or <strong>.txt</strong> file, then drop it into the upload box on Omnidesk BD!
                </span>
              </div>
            </div>

            {/* Prompt Preview Box */}
            <div className="relative rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] p-4 shadow-inner max-h-72 overflow-y-auto font-mono text-xs text-[color:var(--text-main)] leading-relaxed whitespace-pre-wrap select-all scrollbar-thin">
              {generateMasterPrompt(topicInput)}
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[var(--border-color)]">
              <span className="text-[11px] font-bold text-[color:var(--text-muted)] truncate max-w-sm">
                Topic Target: <span className="text-cyan-400 font-mono">"{topicInput.trim() || DEFAULT_TOPIC_PLACEHOLDER}"</span>
              </span>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowMasterPromptModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-panel)] text-xs font-bold text-[color:var(--text-muted)] hover:text-white cursor-pointer transition-all border border-[var(--border-color)]"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleCopyMasterPrompt}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 text-xs font-black shadow-[0_0_18px_rgba(6,182,212,0.4)] cursor-pointer transition-all active:scale-95"
                >
                  {copiedPrompt ? (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>Copy Master Prompt</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Password Protected Delete Project Modal */}

      <DeleteProjectModal 
        isOpen={Boolean(projectToDelete)}
        onClose={() => setProjectToDelete(null)}
        project={projectToDelete}
        onDeleted={handleProjectDeleted}
      />

    </div>
  );
}

