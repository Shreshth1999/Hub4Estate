import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

// ============================================================
// Types
// ============================================================
export type BadgeStatus = 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type BadgeVariant = 'dot' | 'pill';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status?: BadgeStatus;
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
}

// ============================================================
// Color maps
// ============================================================
const pillStyles: Record<BadgeStatus, string> = {
  success: 'bg-green-100 text-green-800 border-green-300',
  warning: 'bg-amber-100 text-amber-800 border-amber-300',
  error: 'bg-red-100 text-red-800 border-red-300',
  info: 'bg-blue-100 text-blue-800 border-blue-300',
  neutral: 'bg-neutral-100 text-neutral-700 border-neutral-300',
};

const dotColors: Record<BadgeStatus, string> = {
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  neutral: 'bg-neutral-400',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-3 py-1 text-xs',
};

// ============================================================
// Badge component
// ============================================================
export function Badge({
  status = 'neutral',
  variant = 'pill',
  size = 'sm',
  className,
  children,
  ...props
}: BadgeProps) {
  if (variant === 'dot') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 font-bold uppercase tracking-wider',
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        <span
          className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColors[status])}
        />
        {children}
      </span>
    );
  }

  // pill variant
  return (
    <span
      className={cn(
        'inline-flex items-center font-bold uppercase tracking-wider rounded-full border',
        sizeStyles[size],
        pillStyles[status],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
