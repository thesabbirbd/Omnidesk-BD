import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Lock, 
  Unlock, 
  Save, 
  GitBranch, 
  Mail, 
  Target, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Edit3
} from 'lucide-react';

const PROFILE_STORAGE_KEY = 'studyos_user_profile';
const ADMIN_PASSWORD = 'admin';

const DEFAULT_PROFILE = {
  name: 'Abdullah Al Sabbir',
  headline: 'Junior Backend & DevOps Engineer',
  targetTrack: '100-Day Backend → DevOps Engineer',
  dailyGoalHours: 4,
  githubUrl: 'https://github.com/thesabbirbd',
  email: 'thesabbirbd@gmail.com',
  bio: 'Building resilient async FastAPI architectures, Docker pipelines, and mastering AWS cloud infrastructure.',
  avatarColor: 'from-cyan-500 to-blue-600',
  isSaved: true
};

export default function UserProfileModal({ isOpen, onClose }) {
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formData, setFormData] = useState(profile);
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  if (!isOpen) return null;

  const handleStartEdit = () => {
    // If profile is already saved, require password to edit
    if (profile.isSaved) {
      setPasswordInput('');
      setPasswordError('');
      setIsPasswordModalOpen(true);
    } else {
      setIsEditing(true);
    }
  };

  const handleVerifyPassword = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsPasswordModalOpen(false);
      setIsEditing(true);
      setPasswordError('');
    } else {
      setPasswordError('Invalid password! Default password is "admin".');
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = { ...formData, isSaved: true };
    setProfile(updated);
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('studyos-profile-updated', { detail: updated }));
    } catch {
      // ignore
    }
    setIsEditing(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_1px_1px_2px_rgba(255,255,255,0.1)] p-6 md:p-8 relative flex flex-col gap-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <User size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide text-[color:var(--text-main)]">
                Engineer Profile
              </h2>
              <span className="text-xs font-semibold text-[color:var(--text-muted)]">
                Universal Study OS Identity & Target Configuration
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[var(--bg-input)] text-[color:var(--text-muted)] hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Save Toast */}
        {saveToast && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} />
            <span>Profile successfully updated and locked with security password!</span>
          </div>
        )}

        {/* Profile Card Header Display */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] shadow-inner">
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${profile.avatarColor} text-white flex items-center justify-center text-3xl font-black shadow-[0_0_20px_rgba(6,182,212,0.5)] shrink-0`}>
            {profile.name.charAt(0) || 'U'}
          </div>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-[color:var(--text-main)] truncate">
                {profile.name}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                VERIFIED
              </span>
            </div>
            <p className="text-xs font-bold text-cyan-400/90 mt-0.5">
              {profile.headline}
            </p>
            <p className="text-xs text-[color:var(--text-muted)] mt-1.5 line-clamp-2">
              {profile.bio}
            </p>
          </div>
        </div>

        {/* Main Content: View Mode vs Edit Form */}
        {!isEditing ? (
          /* View Mode */
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-[var(--bg-input)]/60 border border-[var(--border-color)] flex items-center gap-3">
                <Target size={18} className="text-cyan-400 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] uppercase font-bold text-[color:var(--text-muted)]">Active Track</span>
                  <span className="text-xs font-black text-[color:var(--text-main)] truncate">{profile.targetTrack}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg-input)]/60 border border-[var(--border-color)] flex items-center gap-3">
                <Clock size={18} className="text-amber-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-[color:var(--text-muted)]">Daily Study Target</span>
                  <span className="text-xs font-black text-[color:var(--text-main)]">{profile.dailyGoalHours} Hours / Day</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg-input)]/60 border border-[var(--border-color)] flex items-center gap-3">
                <GitBranch size={18} className="text-purple-400 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] uppercase font-bold text-[color:var(--text-muted)]">GitHub Profile</span>
                  <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-cyan-400 hover:underline truncate">
                    {profile.githubUrl}
                  </a>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg-input)]/60 border border-[var(--border-color)] flex items-center gap-3">
                <Mail size={18} className="text-emerald-400 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] uppercase font-bold text-[color:var(--text-muted)]">Email</span>
                  <span className="text-xs font-bold text-[color:var(--text-main)] truncate">{profile.email}</span>
                </div>
              </div>
            </div>

            {/* Lock status banner & Edit Button */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] mt-2">
              <div className="flex items-center gap-2.5 text-xs text-[color:var(--text-muted)]">
                <Lock size={16} className="text-amber-400" />
                <span>Profile editing is secured with admin password lock</span>
              </div>

              <button
                onClick={handleStartEdit}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-[0_0_12px_rgba(34,211,238,0.5)] active:scale-95 transition-all cursor-pointer"
              >
                <Edit3 size={14} />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        ) : (
          /* Edit Mode (Unlocked after entering 'admin') */
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <Unlock size={14} />
              <span>Editing Unlocked (Security authenticated)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-[color:var(--text-muted)]">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-[var(--bg-input)] border border-[var(--border-color)] text-[color:var(--text-main)] text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-[color:var(--text-muted)]">Headline / Role</label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  required
                  className="bg-[var(--bg-input)] border border-[var(--border-color)] text-[color:var(--text-main)] text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-[color:var(--text-muted)]">Target Learning Track</label>
                <input
                  type="text"
                  value={formData.targetTrack}
                  onChange={(e) => setFormData({ ...formData, targetTrack: e.target.value })}
                  className="bg-[var(--bg-input)] border border-[var(--border-color)] text-[color:var(--text-main)] text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-[color:var(--text-muted)]">Daily Goal (Hours)</label>
                <input
                  type="number"
                  min="1"
                  max="16"
                  value={formData.dailyGoalHours}
                  onChange={(e) => setFormData({ ...formData, dailyGoalHours: Number(e.target.value) })}
                  className="bg-[var(--bg-input)] border border-[var(--border-color)] text-[color:var(--text-main)] text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-[color:var(--text-muted)]">GitHub URL</label>
                <input
                  type="url"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  className="bg-[var(--bg-input)] border border-[var(--border-color)] text-[color:var(--text-main)] text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-[color:var(--text-muted)]">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-[var(--bg-input)] border border-[var(--border-color)] text-[color:var(--text-main)] text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-[color:var(--text-muted)]">Bio & Focus Statement</label>
              <textarea
                rows={2}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="bg-[var(--bg-input)] border border-[var(--border-color)] text-[color:var(--text-main)] text-xs font-medium rounded-xl px-3 py-2 outline-none focus:border-cyan-400 resize-none"
              />
            </div>

            {/* Avatar Color Picker */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-[color:var(--text-muted)]">Avatar Gradient</label>
              <div className="flex items-center gap-3">
                {[
                  { id: 'from-cyan-500 to-blue-600', label: 'Cyan / Blue' },
                  { id: 'from-purple-500 to-indigo-600', label: 'Purple / Indigo' },
                  { id: 'from-emerald-500 to-teal-600', label: 'Emerald / Teal' },
                  { id: 'from-amber-500 to-rose-600', label: 'Amber / Rose' },
                ].map((grad) => (
                  <button
                    type="button"
                    key={grad.id}
                    onClick={() => setFormData({ ...formData, avatarColor: grad.id })}
                    className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${grad.id} cursor-pointer transition-transform ${formData.avatarColor === grad.id ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'}`}
                    title={grad.label}
                  />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl hover:bg-[var(--bg-input)] text-xs font-bold text-[color:var(--text-muted)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-[0_0_12px_rgba(34,211,238,0.5)] active:scale-95 transition-all cursor-pointer"
              >
                <Save size={14} />
                <span>Save & Lock</span>
              </button>
            </div>
          </form>
        )}

        {/* Security Password Unlock Modal */}
        {isPasswordModalOpen && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md rounded-3xl p-6 flex flex-col items-center justify-center z-50 animate-in zoom-in-95 duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 shadow-2xl flex flex-col gap-4 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40">
                <Lock size={24} />
              </div>

              <div>
                <h4 className="text-sm font-black text-[color:var(--text-main)]">Security Authentication</h4>
                <p className="text-xs text-[color:var(--text-muted)] mt-1">
                  Enter password to unlock profile editing:
                </p>
              </div>

              <form onSubmit={handleVerifyPassword} className="flex flex-col gap-3">
                <input
                  type="password"
                  placeholder="Enter password..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  autoFocus
                  className="bg-[var(--bg-input)] border border-[var(--border-color)] text-center text-sm font-bold text-[color:var(--text-main)] px-3 py-2 rounded-xl outline-none focus:border-cyan-400 tracking-wider"
                />

                {passwordError && (
                  <span className="text-[11px] font-bold text-red-400 flex items-center justify-center gap-1">
                    <AlertCircle size={13} />
                    <span>{passwordError}</span>
                  </span>
                )}

                <div className="flex items-center gap-2 justify-center mt-1">
                  <button
                    type="button"
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="px-4 py-2 rounded-xl hover:bg-[var(--bg-input)] text-xs font-bold text-[color:var(--text-muted)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-md cursor-pointer"
                  >
                    Unlock
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
