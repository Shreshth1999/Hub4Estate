import { type ReactNode, type ElementType } from 'react';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface EmptyStateProps {
  /** A lucide-react icon component or any ReactNode */
  icon?: ElementType | ReactNode;
  title: string;
  description: string;
  /** Action button or any ReactNode to render below the description */
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
  // Determine whether icon is a component (ElementType) or a ReactNode
  let iconContent: ReactNode;
  if (!icon) {
    iconContent = <Package className="w-8 h-8 text-neutral-400" />;
  } else if (typeof icon === 'function') {
    const IconComponent = icon as ElementType;
    iconContent = <IconComponent className="w-8 h-8 text-neutral-400" />;
  } else {
    iconContent = icon;
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        'border-2 border-dashed border-neutral-300 bg-[#faf9f7] rounded-2xl',
        className,
      )}
    >
      {/* Icon container */}
      <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-5">
        {iconContent}
      </div>

      <h3 className="text-lg font-bold text-neutral-900 mb-2">
        {title}
      </h3>

      <p className="text-sm text-neutral-500 max-w-sm leading-relaxed mb-6">
        {description}
      </p>

      {action && <div>{action}</div>}
    </div>
  );
}
