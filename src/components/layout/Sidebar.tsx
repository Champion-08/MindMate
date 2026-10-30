import React, { useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Dumbbell, 
  BrainCircuit, 
  BarChart2, 
  Calendar, 
  Files, 
  Lightbulb, 
  Users, 
  Settings,
  UserRound,
  Brain,
  PanelLeftClose,
  PanelLeftOpen,
  Trophy,
  Video,
  X,
  Sparkles
} from 'lucide-react';
import { cn } from '../../utils';
import { useAppContext } from '../../context/AppContext';
import { Avatar } from '../ui/Avatar';
import { StatusIndicator } from '../ui/StatusIndicator';

const NAV_ITEMS = [
  { label: 'Home', icon: Home, path: '/home' },
  { label: 'AI Tutor', icon: BookOpen, path: '/learn' },
  { label: 'Practice', icon: Dumbbell, path: '/practice' },
  { label: 'Learning Twin', icon: BrainCircuit, path: '/learning-twin' },
  { label: 'Progress', icon: BarChart2, path: '/progress' },
  { label: 'Study Planner', icon: Calendar, path: '/planner' },
  { label: 'Zoom Classes', icon: Video, path: '/zoom' },
  { label: 'Materials', icon: Files, path: '/materials' },
  { label: 'Insights', icon: Lightbulb, path: '/insights' },
  { label: 'Achievements', icon: Trophy, path: '/learning-win' },
  { label: 'My Profile', icon: UserRound, path: '/profile' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

export function Sidebar() {
  const { 
    isOnline, 
    toggleOnline, 
    user,
    sidebarWidth,
    setSidebarWidth,
    isSidebarCollapsed,
    toggleSidebarCollapse,
    isMobileNavOpen,
    setIsMobileNavOpen,
    isDraggingSidebar,
    setIsDraggingSidebar
  } = useAppContext();

  const sidebarRef = useRef<HTMLElement>(null);
  const initial = user?.name ? user.name.substring(0, 2).toUpperCase() : 'AL';

  // Handle Drag Resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingSidebar) return;
      // Clamp width between 210px and 340px
      const newWidth = Math.max(210, Math.min(340, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isDraggingSidebar) {
        setIsDraggingSidebar(false);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }
    };

    if (isDraggingSidebar) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSidebar, setSidebarWidth, setIsDraggingSidebar]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSidebarCollapsed) {
      toggleSidebarCollapse();
    }
    setIsDraggingSidebar(true);
  };

  const currentWidth = isSidebarCollapsed ? 70 : sidebarWidth;

  const handleNavClick = () => {
    if (isMobileNavOpen) {
      setIsMobileNavOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileNavOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* Main Sidebar Component */}
      <aside
        ref={sidebarRef}
        style={{ width: `${currentWidth}px` }}
        className={cn(
          "fixed inset-y-0 left-0 bg-surface border-r border-border flex flex-col z-40 select-none shadow-soft",
          // Mobile responsive slide-in
          "transition-transform duration-300 md:transition-none",
          isMobileNavOpen ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0",
          // Desktop collapse transition
          !isDraggingSidebar && "transition-[width] duration-200"
        )}
      >
        {/* Top Header: Logo & Collapse Button */}
        <div className={cn(
          "h-[72px] px-4 flex items-center justify-between border-b border-border/80",
          isSidebarCollapsed && "justify-center px-2"
        )}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-gradient-to-tr from-primary to-accent text-white p-2 rounded-xl shrink-0 shadow-glow-primary">
              <Brain className="h-5 w-5" />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-base text-dark tracking-tight leading-tight truncate">
                    MindMate
                  </h1>
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                </div>
                <p className="text-[10px] font-bold text-primary tracking-wider uppercase truncate mt-0.5">
                  Adaptive AI Twin
                </p>
              </div>
            )}
          </div>

          {/* Desktop Collapse Button */}
          {!isSidebarCollapsed ? (
            <button
              type="button"
              onClick={toggleSidebarCollapse}
              className="p-1.5 rounded-lg text-muted hover:text-dark hover:bg-surface-subtle transition-colors hidden md:block"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleSidebarCollapse}
              className="p-1.5 rounded-lg text-muted hover:text-dark hover:bg-surface-subtle transition-colors hidden md:block"
              title="Expand sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          )}

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(false)}
            className="p-1.5 rounded-lg text-muted hover:text-dark hover:bg-surface-subtle md:hidden"
            title="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              title={isSidebarCollapsed ? item.label : undefined}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-btn text-xs font-semibold transition-all duration-150 relative group",
                isActive 
                  ? "text-primary bg-primary/10 shadow-2xs font-bold" 
                  : "text-muted hover:text-dark hover:bg-surface-subtle",
                isSidebarCollapsed && "justify-center px-0 py-2.5"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                  )}
                  <item.icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-primary" : "text-muted group-hover:text-dark")} />
                  {!isSidebarCollapsed && (
                    <span className="truncate tracking-wide">{item.label}</span>
                  )}
                  {/* Tooltip on collapsed state */}
                  {isSidebarCollapsed && (
                    <div className="fixed left-[75px] ml-2 hidden group-hover:block z-50 bg-slate-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xl pointer-events-none whitespace-nowrap animate-fade-in">
                      {item.label}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}

          {/* Friends section separator */}
          <div className="my-2 border-t border-border/80 px-1 pt-2">
            <NavLink
              to="/friends"
              onClick={handleNavClick}
              title={isSidebarCollapsed ? "Friends & Network" : undefined}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-btn text-xs font-semibold transition-all duration-150 relative group",
                isActive 
                  ? "text-primary bg-primary/10 shadow-2xs font-bold" 
                  : "text-muted hover:text-dark hover:bg-surface-subtle",
                isSidebarCollapsed && "justify-center px-0 py-2.5"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                  )}
                  <Users className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-primary" : "text-muted group-hover:text-dark")} />
                  {!isSidebarCollapsed && (
                    <span className="truncate tracking-wide">Study Buddies</span>
                  )}
                  {isSidebarCollapsed && (
                    <div className="fixed left-[75px] ml-2 hidden group-hover:block z-50 bg-slate-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xl pointer-events-none whitespace-nowrap animate-fade-in">
                      Study Buddies
                    </div>
                  )}
                </>
              )}
            </NavLink>
          </div>
        </nav>

        {/* Footer Area: Connectivity Status & User Capsule */}
        <div className="p-3 border-t border-border/80 mt-auto space-y-2 bg-surface">
          {/* Online status indicator */}
          <div 
            className={cn(
              "flex items-center justify-between px-3 py-2 bg-surface-subtle rounded-btn cursor-pointer hover:bg-gray-200/50 dark:hover:bg-slate-800 transition-colors border border-border/50",
              isSidebarCollapsed && "justify-center px-1"
            )}
            onClick={toggleOnline}
            title="Toggle online / offline sync mode"
          >
            <StatusIndicator isOnline={isOnline} />
          </div>

          {/* User profile row */}
          <div className={cn(
            "flex items-center gap-2.5 px-1 py-1",
            isSidebarCollapsed && "justify-center px-0"
          )}>
            <Avatar src={user?.avatar} fallback={initial} size="sm" />
            {!isSidebarCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-dark truncate leading-tight">
                    {user?.name || 'Alex Learner'}
                  </p>
                  <p className="text-[10px] text-muted truncate mt-0.5">
                    {user?.goal ? `Goal: ${user.goal}` : 'Adaptive Scholar'}
                  </p>
                </div>
                <NavLink 
                  to="/settings" 
                  onClick={handleNavClick} 
                  className="text-muted hover:text-dark p-1.5 rounded-lg hover:bg-surface-subtle transition-colors shrink-0" 
                  title="Settings"
                >
                  <Settings className="h-4 w-4" />
                </NavLink>
              </>
            )}
          </div>
        </div>

        {/* Drag Resize Handle (Desktop Only) */}
        {!isSidebarCollapsed && (
          <div
            onMouseDown={handleResizeStart}
            className={cn(
              "absolute top-0 right-0 w-2 h-full cursor-col-resize z-50 group transition-colors hidden md:block",
              isDraggingSidebar ? "bg-primary w-2.5" : "hover:bg-primary/40"
            )}
            title="Drag to adjust sidebar width"
          >
            <div className="absolute right-0.5 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-border group-hover:bg-primary" />
          </div>
        )}
      </aside>
    </>
  );
}
