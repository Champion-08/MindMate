import React, { HTMLAttributes } from 'react';
import { cn } from '../../utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-card border border-border bg-surface text-dark shadow-soft transition-all duration-200',
          hoverable && 'hover:shadow-card hover:border-border/80 hover:-translate-y-0.5',
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';
