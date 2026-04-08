import { type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ErrorStateProps {
  icon?: ReactNode;
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  icon,
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again',
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        'border-2 border-error-200 bg-error-50/50',
        className,
      )}
    >
      {/* Icon container */}
      <div className="w-16 h-16 bg-error-500 flex items-center justify-center mb-5">
        {icon || <AlertTriangle className="w-8 h-8 text-white" />}
      </div>

      <h3 className="text-lg font-bold text-neutral-900 uppercase tracking-wide mb-2">
        {title}
      </h3>

      <p className="text-sm text-neutral-600 max-w-sm leading-relaxed mb-6">
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className={cn(
            'inline-flex items-center gap-2 h-10 px-6',
            'font-bold text-sm uppercase tracking-wide',
            'bg-neutral-900 text-white border-2 border-neutral-900',
            'hover:shadow-brutal hover:-translate-y-0.5',
            'active:shadow-brutal-sm active:translate-x-[2px] active:translate-y-[2px]',
            'transition-all duration-200',
          )}
        >
          <RefreshCw className="w-4 h-4" />
          {retryLabel}
        </button>
      )}
    </div>
  );
}
