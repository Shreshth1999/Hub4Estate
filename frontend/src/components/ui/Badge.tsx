import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { CheckCircle, Shield, AlertTriangle, Flame, Minus, Zap } from 'lucide-react';

// ============================================================
// Base Badge
// ============================================================
type BadgeSize = 'sm' | 'md';

interface BaseBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  size?: BadgeSize;
  children: ReactNode;
}

const baseSizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-xs',
};

// ============================================================
// Status Badge — active / pending / closed / error
// ============================================================
type StatusType = 'active' | 'pending' | 'closed' | 'error';

const statusStyles: Record<StatusType, string> = {
  active: 'bg-success-bg text-success-text border-success-500',
  pending: 'bg-cta-50 text-cta-800 border-cta-500',
  closed: 'bg-neutral-100 text-neutral-600 border-neutral-400',
  error: 'bg-error-bg text-error-text border-error-500',
};

const statusDotColors: Record<StatusType, string> = {
  active: 'bg-success-500',
  pending: 'bg-cta-500',
  closed: 'bg-neutral-400',
  error: 'bg-error-500',
};

export function StatusBadge({
  status,
  label,
  size = 'sm',
  className,
  ...props
}: BaseBadgeProps & { status: StatusType; label?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-bold uppercase tracking-wider border',
        baseSizeStyles[size],
        statusStyles[status],
        className,
      )}
      {...props}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', statusDotColors[status])} />
      {label || status}
    </span>
  );
}

// ============================================================
// Trust Badge — verified / premium
// ============================================================
type TrustType = 'verified' | 'premium';

const trustStyles: Record<TrustType, { bg: string; icon: ReactNode }> = {
  verified: {
    bg: 'bg-success-bg text-success-text border-success-500',
    icon: <CheckCircle className="w-3 h-3" />,
  },
  premium: {
    bg: 'bg-cta-50 text-cta-800 border-cta-500',
    icon: <Shield className="w-3 h-3" />,
  },
};

export function TrustBadge({
  type,
  label,
  size = 'sm',
  className,
  ...props
}: BaseBadgeProps & { type: TrustType; label?: string }) {
  const config = trustStyles[type];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-bold uppercase tracking-wider border',
        baseSizeStyles[size],
        config.bg,
        className,
      )}
      {...props}
    >
      {config.icon}
      {label || type}
    </span>
  );
}

// ============================================================
// Urgency Badge — high / medium / low
// ============================================================
type UrgencyLevel = 'high' | 'medium' | 'low';

const urgencyStyles: Record<UrgencyLevel, { bg: string; icon: ReactNode }> = {
  high: {
    bg: 'bg-error-bg text-error-text border-error-500 animate-pulse-slow',
    icon: <Flame className="w-3 h-3" />,
  },
  medium: {
    bg: 'bg-cta-50 text-cta-800 border-cta-500',
    icon: <AlertTriangle className="w-3 h-3" />,
  },
  low: {
    bg: 'bg-primary-50 text-primary-700 border-primary-400',
    icon: <Minus className="w-3 h-3" />,
  },
};

export function UrgencyBadge({
  level,
  label,
  size = 'sm',
  className,
  ...props
}: BaseBadgeProps & { level: UrgencyLevel; label?: string }) {
  const config = urgencyStyles[level];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-bold uppercase tracking-wider border',
        baseSizeStyles[size],
        config.bg,
        className,
      )}
      {...props}
    >
      {config.icon}
      {label || `${level} priority`}
    </span>
  );
}

// ============================================================
// Category Badge
// ============================================================
export function CategoryBadge({
  children,
  size = 'sm',
  className,
  ...props
}: BaseBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-bold uppercase tracking-wider',
        'bg-primary-50 text-primary-700 border border-primary-300',
        baseSizeStyles[size],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// ============================================================
// Count Badge — typically used on icons/tabs
// ============================================================
export function CountBadge({
  count,
  max = 99,
  className,
  ...props
}: Omit<BaseBadgeProps, 'children' | 'size'> & {
  count: number;
  max?: number;
}) {
  if (count <= 0) return null;

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center',
        'min-w-[18px] h-[18px] px-1 text-[10px]',
        'font-bold bg-error-500 text-white rounded-full',
        className,
      )}
      {...props}
    >
      {displayCount}
    </span>
  );
}

// ============================================================
// New Badge — "new" indicator
// ============================================================
export function NewBadge({
  size = 'sm',
  className,
  ...props
}: Omit<BaseBadgeProps, 'children'>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-bold uppercase tracking-wider',
        'bg-cta-500 text-navy border-2 border-navy',
        baseSizeStyles[size],
        className,
      )}
      {...props}
    >
      <Zap className="w-3 h-3" />
      New
    </span>
  );
}
