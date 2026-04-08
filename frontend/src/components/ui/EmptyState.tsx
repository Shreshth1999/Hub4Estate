import { type ReactNode } from 'react';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        'border-2 border-dashed border-neutral-300 bg-warm-white',
        className,
      )}
    >
      {/* Icon container */}
      <div className="w-16 h-16 bg-neutral-900 flex items-center justify-center mb-5">
        {icon || <Package className="w-8 h-8 text-white" />}
      </div>

      <h3 className="text-lg font-bold text-neutral-900 uppercase tracking-wide mb-2">
        {title}
      </h3>

      <p className="text-sm text-neutral-500 max-w-sm leading-relaxed mb-6">
        {description}
      </p>

      {action && <div>{action}</div>}
    </div>
  );
}
