import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Server, 
  Code, 
  ArrowRight, 
  Folder, 
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
  Check
} from 'lucide-react';
import { getStudySpaces, generateStudySpace, approveStudySpace } from '../services/api';

export default function Home() {
  const navigate = useNavigate();
  const [spaces, setSpaces] = useState([
    { id: '1', title: 'Backend -> DevOps', icon: Server, color: 'text-cyan-400', progress: 'In Progress' },
    { id: '2', title: 'Frontend Mastery', icon: Code, color: 'text-purple-400', progress: 'Completed' }
  ]);
  const [showCreate, setShowCreate] = useState(false);
  const [inputMode, setInputMode] = useState('topic'); // 'topic' | 'file'
  
  // Form state
  const [topicName, setTopicName] = useState('');
  const [workspaceTitle, setWorkspaceTitle] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [dailyMinutes, setDailyMinutes] = useState(60);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Generation & Preview state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  const fileInputRef = useRef(null);

  // Fetch real study spaces if available
  useEffect(() => {
    getStudySpaces()
      .then(res => {
        if (Array.isArray(res) && res.length > 0) {
          const mapped = res.map(s => ({
            id: s.id,
            title: s.title,
            icon: s.category?.toLowerCase().includes('devops') || s.category?.toLowerCase().includes('backend') ? Server : Code,
            color: 'text-cyan-400',
            progress: s.category || 'Active'
          }));
          setSpaces(mapped);
        }
      })
      .catch(() => {
        // Keep default spaces on network error/offline
      });
  }, []);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
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
      setGenerationError("Supported file types are .pdf, .txt, and .md");
      return;
    }
    setSelectedFile(file);
    setGenerationError(null);
    if (!workspaceTitle) {
      setWorkspaceTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleGenerate = async () => {
    setGenerationError(null);
    if (inputMode === 'topic' && !topicName.trim()) {
      setGenerationError("Please enter a topic name (e.g. 'Python Basics' or 'Learn Kubernetes').");
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
        topics: previewData.topics
      };

      const created = await approveStudySpace(approvalPayload);
      if (created?.id) {
        localStorage.setItem('current_study_space_id', created.id);
      }
      navigate('/os/dashboard');
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to approve study space.";
      setGenerationError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsApproving(false);
    }
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
    <div className="min-h-screen w-full bg-[var(--bg-canvas)] text-[color:var(--text-main)] flex flex-col items-center py-16 px-6 relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="text-center mb-12 z-10">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-300 tracking-wider uppercase drop-shadow-lg mb-3">
          Omnidesk BD
        </h1>
        <p className="text-lg font-medium text-[color:var(--text-muted)] max-w-xl mx-auto">
          Universal Knowledge Operating System • Intelligent Study Spaces Powered by Gemini 1.5 Flash
        </p>
      </div>

      {!showCreate ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full z-10">
          {spaces.map(space => (
            <div 
              key={space.id} 
              onClick={() => {
                localStorage.setItem('current_study_space_id', space.id);
                navigate('/os/dashboard');
              }}
              className="p-8 rounded-[36px] bg-[var(--bg-card)] shadow-[10px_10px_20px_var(--shadow-dark),-10px_-10px_20px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col items-center justify-center text-center gap-5 cursor-pointer group hover:shadow-[inset_3px_3px_6px_var(--shadow-dark),inset_-3px_-3px_6px_var(--shadow-light)] transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-5 right-5">
                <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 bg-[var(--bg-input)] px-3 py-1 rounded-full shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)]">
                  {space.progress}
                </span>
              </div>

              <div className={`p-5 rounded-2xl bg-[var(--bg-panel)] shadow-[inset_3px_3px_6px_var(--shadow-dark),inset_-3px_-3px_6px_var(--shadow-light)] group-hover:scale-110 transition-transform duration-300 ${space.color}`}>
                <space.icon size={42} className="drop-shadow-[0_0_10px_currentColor]" />
              </div>
              <h2 className="text-xl font-bold tracking-wide text-[color:var(--text-main)] group-hover:text-cyan-400 transition-colors">
                {space.title}
              </h2>
            </div>
          ))}

          {/* Create New Space Card */}
          <div 
            onClick={() => setShowCreate(true)}
            className="p-8 rounded-[36px] bg-[var(--bg-card)] shadow-[10px_10px_20px_var(--shadow-dark),-10px_-10px_20px_var(--shadow-light)] border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 flex flex-col items-center justify-center text-center gap-5 cursor-pointer group hover:shadow-[inset_3px_3px_6px_var(--shadow-dark),inset_-3px_-3px_6px_var(--shadow-light)] transition-all duration-300"
          >
            <div className="p-5 rounded-2xl bg-[var(--bg-input)] shadow-[3px_3px_6px_var(--shadow-dark),-3px_-3px_6px_var(--shadow-light)] text-[color:var(--text-muted)] group-hover:text-cyan-400 group-hover:scale-110 transition-all duration-300">
              <Plus size={42} />
            </div>
            <h2 className="text-xl font-bold tracking-wide text-[color:var(--text-muted)] group-hover:text-[color:var(--text-main)] transition-colors">
              Create Study Space
            </h2>
          </div>
        </div>
      ) : previewData ? (
        /* ================= PREVIEW SCREEN ================= */
        <div className="w-full max-w-4xl z-10 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-6 duration-300">
          <div className="p-8 rounded-[36px] bg-[var(--bg-card)] shadow-[12px_12px_24px_var(--shadow-dark),-12px_-12px_24px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col gap-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[var(--border-color)] gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Curriculum Preview</span>
                <h2 className="text-3xl font-black text-[color:var(--text-main)] mt-1">{previewData.title}</h2>
                <p className="text-sm text-[color:var(--text-muted)] mt-1">{previewData.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-4 py-2 rounded-xl bg-[var(--bg-input)] text-xs font-bold uppercase tracking-wider text-teal-400 border border-teal-500/30">
                  {previewData.category || category}
                </span>
                <span className="px-4 py-2 rounded-xl bg-[var(--bg-input)] text-xs font-bold tracking-wider text-cyan-400 flex items-center gap-1.5 border border-cyan-500/30">
                  <Clock size={14} /> {previewData.estimated_total_minutes || 0} min total
                </span>
              </div>
            </div>

            {generationError && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
                <AlertCircle size={18} />
                {generationError}
              </div>
            )}

            {/* Topics List */}
            <div className="flex flex-col gap-4 max-h-[480px] overflow-y-auto pr-2">
              {previewData.topics?.map((topic, idx) => (
                <div 
                  key={idx} 
                  className="p-5 rounded-2xl bg-[var(--bg-panel)] shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </span>
                      <h3 className="font-bold text-base text-[color:var(--text-main)]">{topic.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-1 rounded-md bg-[var(--bg-input)] text-[color:var(--text-muted)] font-medium">
                        {topic.estimated_minutes} min
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 font-semibold uppercase">
                        {topic.difficulty || 'intermediate'}
                      </span>
                    </div>
                  </div>

                  {topic.description && (
                    <p className="text-xs text-[color:var(--text-muted)] pl-10 leading-relaxed">
                      {topic.description}
                    </p>
                  )}

                  {/* Competency Checkpoints */}
                  {topic.competencies && topic.competencies.length > 0 && (
                    <div className="pl-10 pt-2 flex flex-wrap gap-2">
                      {topic.competencies.map((comp, cIdx) => (
                        <span 
                          key={cIdx} 
                          className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg bg-[var(--bg-input)] text-slate-300 border border-slate-700/50"
                        >
                          <Check size={12} className="text-teal-400" />
                          {comp.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-[var(--border-color)]">
              <button 
                onClick={() => setPreviewData(null)}
                disabled={isApproving}
                className="px-6 py-3 rounded-2xl font-bold text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] transition-colors"
              >
                Back & Refine
              </button>
              <div className="flex gap-4">
                <button 
                  onClick={resetForm}
                  disabled={isApproving}
                  className="px-6 py-3 rounded-2xl font-bold text-[color:var(--text-muted)] hover:text-red-400 transition-colors"
                >
                  Discard
                </button>
                <button 
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all active:scale-95 disabled:opacity-50"
                >
                  {isApproving ? (
                    <>
                      <Sparkles className="animate-spin" size={18} /> Persisting Workspace...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} /> Approve & Launch Workspace
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* ================= INPUT & GENERATION FORM ================= */
        <div className="w-full max-w-3xl z-10 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-6 duration-300">
          <div className="p-8 rounded-[36px] bg-[var(--bg-card)] shadow-[12px_12px_24px_var(--shadow-dark),-12px_-12px_24px_var(--shadow-light)] border border-[var(--border-color)] flex flex-col gap-6">
            
            <div className="flex flex-col items-center justify-center text-center w-full gap-2 border-b border-[var(--border-color)] pb-6">
              <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 mb-1">
                <Sparkles size={28} />
              </div>
              <h2 className="text-2xl font-black text-[color:var(--text-main)]">Initialize StudySpace</h2>
              <p className="text-[color:var(--text-muted)] text-sm font-medium">
                Enter a topic name or drop a curriculum file to generate an intelligent roadmap.
              </p>
            </div>

            {generationError && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
                <AlertCircle size={18} />
                {generationError}
              </div>
            )}

            {/* Mode Selection Tabs */}
            <div className="flex p-1.5 rounded-2xl bg-[var(--bg-input)] shadow-[inset_3px_3px_6px_var(--shadow-dark),inset_-3px_-3px_6px_var(--shadow-light)]">
              <button
                type="button"
                onClick={() => setInputMode('topic')}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  inputMode === 'topic'
                    ? 'bg-[var(--bg-card)] text-cyan-400 shadow-[2px_2px_6px_var(--shadow-dark),-2px_-2px_6px_var(--shadow-light)]'
                    : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]'
                }`}
              >
                <Zap size={16} /> Topic Name / Goal
              </button>
              <button
                type="button"
                onClick={() => setInputMode('file')}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  inputMode === 'file'
                    ? 'bg-[var(--bg-card)] text-cyan-400 shadow-[2px_2px_6px_var(--shadow-dark),-2px_-2px_6px_var(--shadow-light)]'
                    : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]'
                }`}
              >
                <Upload size={16} /> Upload Document (PDF / TXT / MD)
              </button>
            </div>

            {/* Input Mode Content */}
            {inputMode === 'topic' ? (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[color:var(--text-muted)] pl-2">
                  Topic Name or Goal
                </label>
                <div className="relative">
                  <BookOpen size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" />
                  <input 
                    type="text" 
                    value={topicName}
                    onChange={(e) => setTopicName(e.target.value)}
                    placeholder="e.g. Python Basics, Learn Kubernetes, or BBA Finance" 
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[color:var(--text-main)] font-semibold text-base rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-cyan-500/50 transition-all shadow-[inset_3px_3px_6px_var(--shadow-dark),inset_-3px_-3px_6px_var(--shadow-light)]"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[color:var(--text-muted)] pl-2">
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
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                    dragOver 
                      ? 'border-cyan-400 bg-cyan-500/10' 
                      : selectedFile 
                        ? 'border-teal-500/50 bg-teal-500/5' 
                        : 'border-[var(--border-color)] hover:border-cyan-500/40 bg-[var(--bg-input)]'
                  }`}
                >
                  {selectedFile ? (
                    <div className="flex items-center gap-3 text-teal-400">
                      <FileText size={32} />
                      <div className="text-left">
                        <p className="font-bold text-sm text-[color:var(--text-main)]">{selectedFile.name}</p>
                        <p className="text-xs text-[color:var(--text-muted)]">{(selectedFile.size / 1024).toFixed(1)} KB • Ready for extraction</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload size={32} className="text-cyan-400" />
                      <div className="text-center">
                        <p className="text-sm font-bold text-[color:var(--text-main)]">Drag & drop or click to browse</p>
                        <p className="text-xs text-[color:var(--text-muted)] mt-1">Supports PDF, TXT, and Markdown files</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Metadata Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[color:var(--text-muted)] pl-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[color:var(--text-main)] font-semibold text-sm rounded-2xl py-3.5 px-4 focus:outline-none focus:border-cyan-500/50 transition-all shadow-[inset_3px_3px_6px_var(--shadow-dark),inset_-3px_-3px_6px_var(--shadow-light)]"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Programming">Programming</option>
                  <option value="DevOps & Cloud">DevOps & Cloud</option>
                  <option value="Data Science & AI">Data Science & AI</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Business & Finance">Business & Finance</option>
                  <option value="General Engineering">General Engineering</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[color:var(--text-muted)] pl-2">
                  Daily Target (Minutes)
                </label>
                <input 
                  type="number" 
                  min="15" 
                  max="480"
                  step="15"
                  value={dailyMinutes}
                  onChange={(e) => setDailyMinutes(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[color:var(--text-main)] font-semibold text-sm rounded-2xl py-3.5 px-4 focus:outline-none focus:border-cyan-500/50 transition-all shadow-[inset_3px_3px_6px_var(--shadow-dark),inset_-3px_-3px_6px_var(--shadow-light)]"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-[var(--border-color)]">
              <button 
                type="button"
                onClick={resetForm}
                disabled={isGenerating}
                className="px-6 py-3 rounded-2xl font-bold text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-[var(--bg-card)] shadow-[6px_6px_12px_var(--shadow-dark),-6px_-6px_12px_var(--shadow-light)] hover:shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] transition-all font-black text-cyan-400 active:scale-95 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="animate-spin" size={18} /> Analyzing with Gemini...
                  </>
                ) : (
                  <>
                    Generate StudySpace <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
