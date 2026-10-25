import React from 'react';
import { Card } from '../ui/Card';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  colorClass?: string;
  trend?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  subtitle, 
  colorClass = "text-primary",
  trend
}: StatCardProps) {
  return (
    <Card hoverable className="p-5 flex items-center justify-between">
      <div className="flex items-center gap-4 min-w-0">
        <div className={cn(
          "p-3 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs",
          colorClass.includes('orange') ? "bg-orange-500/10 text-orange-600 dark:text-orange-400" :
          colorClass.includes('indigo') ? "bg-primary/10 text-primary" :
          colorClass.includes('yellow') ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
          colorClass.includes('green') || colorClass.includes('emerald') ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
          "bg-primary/10 text-primary"
        )}>
          <Icon className="h-6 w-6 stroke-[2.2]" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted truncate">
            {title}
          </p>
          <h3 className="text-2xl font-black text-dark tracking-tight mt-0.5 truncate">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-muted truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {trend && (
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 shrink-0">
          {trend}
        </span>
      )}
    </Card>
  );
}
