import React, { HTMLAttributes } from 'react';
import { cn } from '../../utils';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'outline';
  dot?: boolean;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', dot = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors select-none',
          {
            'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300': variant === 'default',
            'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40': variant === 'success',
            'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40': variant === 'warning',
            'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40': variant === 'danger',
            'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/40': variant === 'info',
            'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40': variant === 'primary',
            'bg-transparent border border-border text-muted': variant === 'outline',
          },
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn('h-1.5 w-1.5 rounded-full shrink-0', {
              'bg-gray-500': variant === 'default',
              'bg-emerald-500': variant === 'success',
              'bg-amber-500': variant === 'warning',
              'bg-rose-500': variant === 'danger',
              'bg-sky-500': variant === 'info',
              'bg-indigo-500': variant === 'primary',
              'bg-slate-400': variant === 'outline',
            })}
          />
        )}
        {children}
      </div>
    );
  }
);
Badge.displayName = 'Badge';
