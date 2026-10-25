import React, { useState, useEffect } from 'react';
import { Check, Clock, Edit2, Trash2, Calendar, Play, Sparkles } from 'lucide-react';
import { cn } from '../../utils';

interface TaskCardProps {
  id?: string;
  name: string;
  duration: string;
  type: string;
  isDone?: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  activityCompleted?: boolean;
  onToggle?: (id: string, done: boolean) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onStartPractice?: (id: string) => void;
}

export function TaskCard({
  id,
  name,
  duration,
  type,
  isDone: initialIsDone = false,
  priority = 'medium',
  dueDate,
  activityCompleted = false,
  onToggle,
  onEdit,
  onDelete,
  onStartPractice,
}: TaskCardProps) {
  const [isDone, setIsDone] = useState(initialIsDone);

  useEffect(() => {
    setIsDone(initialIsDone);
  }, [initialIsDone]);

  const getTypeBadge = (t: string) => {
    switch (t.toLowerCase()) {
      case 'practice':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40';
      case 'recovery':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40';
      case 'review':
        return 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/40';
      case 'quiz':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40';
      case 'assessment':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p.toLowerCase()) {
      case 'high':
        return <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200/60">High Priority</span>;
      case 'low':
        return <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60">Low</span>;
      default:
        return <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200/60">Med</span>;
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newDone = !isDone;
    setIsDone(newDone);
    if (onToggle && id) onToggle(id, newDone);
  };

  return (
    <div 
      className={cn(
        "group relative flex items-center justify-between p-3.5 rounded-card border transition-all duration-200 select-none",
        isDone 
          ? "bg-surface-subtle/70 border-border/60 opacity-70" 
          : "bg-surface border-border hover:border-primary/40 shadow-2xs hover:shadow-soft"
      )}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Completion Checkbox */}
        <button 
          type="button"
          onClick={handleToggle}
          className={cn(
            "h-6 w-6 rounded-full border flex items-center justify-center shrink-0 transition-all focus:outline-none",
            isDone 
              ? "bg-success border-success text-white shadow-2xs" 
              : "border-gray-300 dark:border-slate-600 hover:border-primary text-transparent"
          )}
          title={isDone ? "Mark as incomplete" : "Mark as completed"}
        >
          <Check className="h-3.5 w-3.5 stroke-[3]" />
        </button>

        {/* Task Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full capitalize", getTypeBadge(type))}>
              {type}
            </span>
            {priority && getPriorityBadge(priority)}
            {activityCompleted && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200/60">
                <Sparkles className="h-2.5 w-2.5" /> Practice Verified
              </span>
            )}
          </div>
          <p className={cn(
            "text-sm font-semibold text-dark mt-1 truncate transition-all",
            isDone && "line-through text-muted"
          )}>
            {name}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted mt-1 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {duration}
            </span>
            {dueDate && (
              <span className="flex items-center gap-1 text-muted">
                <Calendar className="h-3.5 w-3.5" />
                {dueDate}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Action buttons */}
      <div className="flex items-center gap-1.5 shrink-0 ml-3">
        {onStartPractice && id && !isDone && (
          <button
            type="button"
            onClick={() => onStartPractice(id)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-btn bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors shadow-2xs"
            title="Start targeted practice"
          >
            <Play className="h-3 w-3 fill-current" />
            <span className="hidden sm:inline">Start</span>
          </button>
        )}

        {onEdit && id && (
          <button
            type="button"
            onClick={() => onEdit(id)}
            className="p-1.5 text-muted hover:text-dark hover:bg-surface-subtle rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            title="Edit task"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
        )}

        {onDelete && id && (
          <button
            type="button"
            onClick={() => onDelete(id)}
            className="p-1.5 text-muted hover:text-danger hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            title="Delete task"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
