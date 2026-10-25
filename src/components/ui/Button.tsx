import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'subtle';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-150 select-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100',
          {
            // Primary: Indigo gradient with subtle shadow
            'bg-primary text-white hover:bg-primary-hover shadow-xs hover:shadow': variant === 'primary',
            // Secondary: Subtle border and surface background
            'bg-surface border border-border text-dark hover:bg-surface-subtle hover:border-gray-300 dark:hover:border-slate-600 shadow-2xs': variant === 'secondary',
            // Outline: Pure border with hover fill
            'bg-transparent border border-border text-dark hover:bg-gray-100 dark:hover:bg-slate-800': variant === 'outline',
            // Subtle: Soft background with matching text
            'bg-primary/10 text-primary hover:bg-primary/20': variant === 'subtle',
            // Ghost: Transparent with hover
            'hover:bg-gray-100 dark:hover:bg-slate-800 text-dark': variant === 'ghost',
            // Danger: Red with hover
            'bg-danger text-white hover:bg-red-600 shadow-2xs': variant === 'danger',

            // Sizes
            'h-8 px-2.5 text-xs rounded-btn gap-1.5': size === 'sm',
            'h-10 px-4 py-2 text-sm rounded-btn gap-2': size === 'md',
            'h-12 px-6 text-base rounded-btn gap-2.5 font-semibold': size === 'lg',
            'h-9 w-9 p-0 rounded-btn': size === 'icon',
          },
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
