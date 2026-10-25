import React, { useState, useRef, useEffect } from 'react';
import { Search } from '../ui/Search';
import { Avatar } from '../ui/Avatar';
import { 
  Bell, 
  ChevronDown, 
  Settings, 
  LogOut, 
  User, 
  Menu, 
  Sparkles, 
  Cpu, 
  Cloud, 
  HardDrive,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils';
import { SUPPORTED_LANGUAGES } from '../../data/learningContent';
import { aiTutorService, AIEngineStatus } from '../../services/ai';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { notifications, user, logout, toggleMobileNav, language, setLanguage, isOnline } = useAppContext();
  const navigate = useNavigate();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showAIStatus, setShowAIStatus] = useState(false);
  const [aiStatus, setAiStatus] = useState<AIEngineStatus | null>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);

  // Monitor AI Engine Status
  useEffect(() => {
    const unsub = aiTutorService.onStatusChange((status) => {
      setAiStatus(status);
    });
    return () => unsub();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLanguage(false);
      }
      if (aiRef.current && !aiRef.current.contains(e.target as Node)) {
        setShowAIStatus(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'AL';

  return (
    <header className="h-[72px] bg-surface/90 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 w-full transition-all">
      {/* Left side: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={toggleMobileNav}
          className="p-2 -ml-2 rounded-xl text-muted hover:text-dark hover:bg-gray-100 dark:hover:bg-slate-800 md:hidden shrink-0 transition-colors"
          title="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-extrabold text-dark tracking-tight leading-tight truncate">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted font-normal truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right side: AI Pill, Search, Language, Notifications, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        
        {/* Global AI Engine Live Indicator */}
        <div className="relative" ref={aiRef}>
          <button
            type="button"
            onClick={() => {
              setShowAIStatus(!showAIStatus);
              setShowNotifications(false);
              setShowProfile(false);
              setShowLanguage(false);
            }}
            className={cn(
              "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-150 shadow-2xs select-none",
              aiStatus?.cloudAvailable
                ? "bg-indigo-50/80 dark:bg-indigo-950/40 text-primary border-indigo-200/80 dark:border-indigo-800/60 hover:border-primary"
                : aiStatus?.localModelLoaded
                ? "bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 hover:border-emerald-400"
                : "bg-gray-50 dark:bg-slate-800 text-muted border-border hover:text-dark"
            )}
            title="AI Engine Status"
          >
            <span className="relative flex h-2 w-2">
              <span className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                aiStatus?.cloudAvailable ? "bg-primary" : "bg-emerald-500"
              )} />
              <span className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                aiStatus?.cloudAvailable ? "bg-primary" : "bg-emerald-500"
              )} />
            </span>
            <span className="font-semibold tracking-wide flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>
                {aiStatus?.mode === 'offline' 
                  ? 'Local AI' 
                  : aiStatus?.cloudAvailable 
                  ? 'Gemini / Gemma 4' 
                  : 'WebLLM AI'}
              </span>
            </span>
          </button>

          {/* AI Status Dropdown Details */}
          {showAIStatus && (
            <div className="absolute right-0 mt-2 w-72 bg-surface rounded-card shadow-card-hover border border-border p-4 z-50 animate-slide-up">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">AI Inference Engine</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {aiStatus?.mode?.toUpperCase() || 'HYBRID'}
                </span>
              </div>
              <div className="space-y-3 pt-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <Cloud className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-dark">Cloud AI (Gemini / Gemma 4 API)</p>
                    <p className="text-[11px] text-muted">
                      {aiStatus?.cloudAvailable ? 'Connected & ready for fast answers' : 'Unavailable (using on-device fallback)'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Cpu className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-dark">Local WebGPU Engine</p>
                    <p className="text-[11px] text-muted">
                      {aiStatus?.webGpuSupported 
                        ? (aiStatus.localModelLoaded ? 'Model cached & running locally' : 'WebGPU supported (download on demand)')
                        : 'WebGPU not detected in this browser'}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-border flex justify-end">
                  <button
                    onClick={() => { setShowAIStatus(false); navigate('/settings'); }}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    Configure AI Settings →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Global Search */}
        <Search placeholder="Search lessons, topics..." containerClassName="w-52 hidden lg:block" />

        {/* Language Selector */}
        <div className="relative" ref={langRef}>
          <button
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-btn border border-border bg-surface hover:bg-surface-subtle text-xs font-semibold text-dark transition-all duration-150 shadow-2xs"
            onClick={() => {
              setShowLanguage(!showLanguage);
              setShowNotifications(false);
              setShowProfile(false);
              setShowAIStatus(false);
            }}
            title="Change learning language"
          >
            <span className="text-base leading-none">
              {SUPPORTED_LANGUAGES.find((l) => l.code === language)?.flag || '🇺🇸'}
            </span>
            <span className="hidden sm:inline uppercase tracking-wider text-[11px] font-bold text-dark">
              {SUPPORTED_LANGUAGES.find((l) => l.code === language)?.code || 'en'}
            </span>
            <ChevronDown className="h-3 w-3 text-muted" />
          </button>

          {showLanguage && (
            <div className="absolute right-0 mt-2 w-48 bg-surface rounded-card shadow-card-hover border border-border py-1.5 z-50 animate-slide-up">
              <div className="px-3 py-1.5 border-b border-border text-[10px] font-bold text-muted uppercase tracking-wider">
                Select Language
              </div>
              <div className="max-h-56 overflow-y-auto">
                {SUPPORTED_LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      setLanguage(l.code);
                      setShowLanguage(false);
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors text-left',
                      language === l.code
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-dark hover:bg-surface-subtle'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base leading-none">{l.flag}</span>
                      <span>{l.label}</span>
                    </span>
                    {language === l.code && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            className="p-2 text-muted hover:text-dark hover:bg-surface-subtle rounded-full transition-colors relative"
            onClick={() => { 
              setShowNotifications(!showNotifications); 
              setShowProfile(false);
              setShowLanguage(false);
              setShowAIStatus(false);
            }}
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-danger rounded-full ring-2 ring-surface animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-surface rounded-card shadow-card-hover border border-border py-2 z-50 animate-slide-up">
              <div className="px-4 py-2 border-b border-border flex justify-between items-center">
                <h3 className="font-bold text-sm text-dark">Notifications</h3>
                {unreadCount > 0 ? (
                  <span className="text-xs text-primary font-medium cursor-pointer hover:underline">
                    Mark all read
                  </span>
                ) : (
                  <span className="text-xs text-muted">All caught up</span>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-muted">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        'px-4 py-3 hover:bg-surface-subtle cursor-pointer text-xs border-b border-border last:border-0 transition-colors',
                        !n.isRead && 'bg-primary/5'
                      )}
                    >
                      <div className="flex gap-2.5">
                        {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0" />}
                        <p className="text-dark/90 leading-relaxed">{n.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { 
              setShowProfile(!showProfile); 
              setShowNotifications(false);
              setShowLanguage(false);
              setShowAIStatus(false);
            }}
            className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity p-1 rounded-xl hover:bg-surface-subtle"
          >
            <Avatar src={user?.avatar} fallback={initials} size="sm" />
            <span className="hidden md:block text-xs font-semibold text-dark truncate max-w-[110px]">
              {user?.name ?? 'Alex'}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted" />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-52 bg-surface rounded-card shadow-card-hover border border-border py-1.5 z-50 animate-slide-up">
              <div className="px-4 py-2.5 border-b border-border mb-1 bg-surface-subtle/50">
                <p className="text-xs font-bold text-dark truncate">{user?.name ?? 'Alex Learner'}</p>
                <p className="text-[11px] text-muted truncate">{user?.email ?? 'learner@mindmate.app'}</p>
              </div>
              <button
                onClick={() => { setShowProfile(false); navigate('/profile'); }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-dark hover:bg-surface-subtle transition-colors"
              >
                <User className="h-4 w-4 text-muted" /> My Profile
              </button>
              <button
                onClick={() => { setShowProfile(false); navigate('/settings'); }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-dark hover:bg-surface-subtle transition-colors"
              >
                <Settings className="h-4 w-4 text-muted" /> Settings & AI
              </button>
              <div className="border-t border-border mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-danger hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
