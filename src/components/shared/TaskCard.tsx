import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Check, Clock } from 'lucide-react';
import { cn } from '../../utils';

interface TaskCardProps {
  name: string;
  duration: string;
  type: string;
  isDone?: boolean;
}

export function TaskCard({ name, duration, type, isDone: initialIsDone = false }: TaskCardProps) {
  const [isDone, setIsDone] = useState(initialIsDone);

  const getTypeColor = (t: string) => {
    switch (t.toLowerCase()) {
      case 'practice': return 'bg-indigo-100 text-indigo-700';
      case 'recovery': return 'bg-orange-100 text-orange-700';
      case 'review': return 'bg-blue-100 text-blue-700';
      case 'quiz': return 'bg-purple-100 text-purple-700';
      case 'assessment': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div 
      className={cn(
        "flex items-center p-3 rounded-xl border transition-all cursor-pointer",
        isDone ? "bg-gray-50 border-gray-200 opacity-70" : "bg-white border-border hover:border-primary/50 shadow-sm"
      )}
      onClick={() => setIsDone(!isDone)}
    >
      <div 
        className={cn(
          "h-6 w-6 rounded-full border flex items-center justify-center mr-4 flex-shrink-0 transition-colors",
          isDone ? "bg-success border-success text-white" : "border-gray-300 text-transparent hover:border-primary"
        )}
      >
        <Check className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("font-medium text-sm truncate", isDone && "line-through text-muted")}>
          {name}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider", getTypeColor(type))}>
            {type}
          </span>
        </div>
      </div>
      <div className="flex items-center text-xs text-muted whitespace-nowrap ml-2">
        <Clock className="h-3 w-3 mr-1" />
        {duration}
      </div>
    </div>
  );
}
