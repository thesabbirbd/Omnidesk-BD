import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  X, 
  Check, 
  Trash2, 
  Volume2, 
  VolumeX, 
  Monitor, 
  Clock, 
  Sparkles, 
  AlertCircle, 
  Info, 
  Play, 
  Pause, 
  ChevronRight,
  Send
} from 'lucide-react';
import { useTimer, sendBrowserPush } from '../../context/TimerContext';

const PREFS_KEY = 'studyos_notification_prefs';

export default function NotificationCenterModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { 
    notificationsList = [], 
    clearNotificationsList, 
    markAllNotificationsRead 
  } = useTimer();

  const [prefs, setPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem(PREFS_KEY);
      return saved ? JSON.parse(saved) : { browserPush: false, sound: true, presenceAlert: true };
    } catch {
      return { browserPush: false, sound: true, presenceAlert: true };
    }
  });

  const [browserPermission, setBrowserPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  // Save preferences
  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      // ignore
    }
  }, [prefs]);

  if (!isOpen) return null;

  // Request browser desktop push permission
  const handleRequestPushPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setBrowserPermission(permission);
        if (permission === 'granted') {
          setPrefs((prev) => ({ ...prev, browserPush: true }));
          sendBrowserPush('Omnidesk BD • Notifications Enabled 🎉', 'Desktop push notifications are now active on your operating system!');
        } else {
          setPrefs((prev) => ({ ...prev, browserPush: false }));
        }
      } catch (err) {
        console.warn('Notification permission error:', err);
      }
    }
  };

  const toggleSound = () => {
    setPrefs((prev) => ({ ...prev, sound: !prev.sound }));
  };

  const handleSendTestPush = () => {
    sendBrowserPush('Omnidesk BD Test Notification', 'Desktop push alerts are functioning smoothly on your device!');
  };

  const formatRelativeTime = (timestamp) => {
    const diffMs = Date.now() - timestamp;
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return 'Just now';
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const unreadCount = notificationsList.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_1px_1px_2px_rgba(255,255,255,0.1)] p-5 md:p-6 relative flex flex-col gap-4 max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Bell size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-wide text-[color:var(--text-main)] flex items-center gap-2">
                <span>Notifications Center</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-cyan-500 text-slate-950">
                    {unreadCount} New
                  </span>
                )}
              </h3>
              <span className="text-[10px] text-[color:var(--text-muted)]">
                Manage OS alerts & desktop notifications
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[var(--bg-input)] text-[color:var(--text-muted)] hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Customization & Preferences Box */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] flex flex-col gap-2.5 shadow-inner">
          <span className="text-[10px] font-black uppercase tracking-wider text-[color:var(--text-muted)]">
            Notification Customizations
          </span>

          {/* Browser Push Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor size={15} className="text-cyan-400" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[color:var(--text-main)]">Browser Desktop Push</span>
                <span className="text-[9px] text-[color:var(--text-muted)]">
                  {browserPermission === 'granted' && prefs.browserPush 
                    ? 'Active (Receives alerts outside tab)' 
                    : browserPermission === 'denied' 
                      ? 'Blocked in browser settings' 
                      : 'Disabled'}
                </span>
              </div>
            </div>

            {browserPermission === 'granted' ? (
              <button
                onClick={() => setPrefs((prev) => ({ ...prev, browserPush: !prev.browserPush }))}
                className={`px-3 py-1 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                  prefs.browserPush 
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_8px_rgba(34,211,238,0.5)]' 
                    : 'bg-white/10 text-[color:var(--text-muted)]'
                }`}
              >
                {prefs.browserPush ? 'ENABLED' : 'DISABLED'}
              </button>
            ) : (
              <button
                onClick={handleRequestPushPermission}
                className="px-2.5 py-1 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-[10px] font-black shadow-md cursor-pointer"
              >
                Enable Push
              </button>
            )}
          </div>

          {/* Sound Toggle & Test Notification */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-2">
              {prefs.sound ? <Volume2 size={15} className="text-emerald-400" /> : <VolumeX size={15} className="text-slate-500" />}
              <span className="text-xs font-bold text-[color:var(--text-main)]">Sound Chimes</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleSound}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer ${prefs.sound ? 'text-emerald-400 bg-emerald-500/15' : 'text-slate-500 bg-white/5'}`}
              >
                {prefs.sound ? 'ON' : 'OFF'}
              </button>

              {browserPermission === 'granted' && prefs.browserPush && (
                <button
                  onClick={handleSendTestPush}
                  className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  title="Send sample push notification"
                >
                  <Send size={10} />
                  <span>Test</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List Controls */}
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
            Activity Stream
          </span>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                Mark Read
              </button>
            )}
            {notificationsList.length > 0 && (
              <button
                onClick={clearNotificationsList}
                className="text-[10px] font-bold text-red-400 hover:text-red-300 flex items-center gap-0.5 cursor-pointer"
              >
                <Trash2 size={10} />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Notifications Stream */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 min-h-[160px] max-h-[280px]">
          {notificationsList.length === 0 ? (
            <div className="flex flex-col items-center justify-center my-auto py-8 text-[color:var(--text-muted)]">
              <Bell size={24} className="opacity-40 mb-2" />
              <span className="text-xs font-semibold">No notifications right now</span>
              <span className="text-[10px] opacity-70">Study sessions and presence updates will appear here</span>
            </div>
          ) : (
            notificationsList.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.type === 'complete' || item.type === 'start') navigate('/os/timer');
                  onClose();
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                  !item.read 
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-[color:var(--text-main)]' 
                    : 'bg-[var(--bg-input)]/60 border-[var(--border-color)] text-[color:var(--text-muted)] hover:border-cyan-500/30'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {item.type === 'complete' && <Sparkles size={16} className="text-emerald-400" />}
                  {item.type === 'start' && <Play size={16} className="text-cyan-400" />}
                  {item.type === 'pause' && <Pause size={16} className="text-amber-400" />}
                  {item.type === 'absence' && <AlertCircle size={16} className="text-red-400" />}
                  {item.type === 'warning' && <AlertCircle size={16} className="text-amber-400" />}
                  {(!item.type || item.type === 'info') && <Info size={16} className="text-blue-400" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-[color:var(--text-main)] truncate">
                      {item.title || 'Omnidesk BD Update'}
                    </span>
                    <span className="text-[9px] font-mono text-[color:var(--text-muted)] shrink-0">
                      {formatRelativeTime(item.timestamp)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[color:var(--text-muted)] mt-0.5 leading-snug">
                    {item.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
