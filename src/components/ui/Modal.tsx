import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, description, children, className }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <div 
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-50 w-full max-w-lg bg-surface rounded-card-lg shadow-2xl border border-border flex flex-col max-h-[88vh] animate-slide-up overflow-hidden",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-border/80 bg-surface">
          <div>
            <h2 className="text-lg font-bold text-dark leading-tight">{title}</h2>
            {description && <p className="text-xs text-muted mt-1">{description}</p>}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose} 
            className="h-8 w-8 p-0 rounded-full text-muted hover:text-dark hover:bg-gray-100 dark:hover:bg-slate-800 shrink-0 -mr-2"
            title="Close dialog"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
