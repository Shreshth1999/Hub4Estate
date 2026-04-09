import { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// ============================================================
// Types
// ============================================================
export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  description?: string;
  children?: ReactNode;
  /** Show a dismiss button */
  dismissible?: boolean;
  onDismiss?: () => void;
  /** Alias for onDismiss (backward compat) — auto-enables dismiss button */
  onClose?: () => void;
  /** Controls visibility for animated entry/exit */
  visible?: boolean;
  className?: string;
}

// ============================================================
// Styles
// ============================================================
const variantStyles: Record<
  AlertVariant,
  { bg: string; border: string; icon: ReactNode; iconColor: string }
> = {
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: <Info className="w-5 h-5" />,
    iconColor: 'text-blue-600',
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: <CheckCircle className="w-5 h-5" />,
    iconColor: 'text-green-600',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: <AlertTriangle className="w-5 h-5" />,
    iconColor: 'text-amber-600',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: <XCircle className="w-5 h-5" />,
    iconColor: 'text-red-600',
  },
};

// ============================================================
// Alert component
// ============================================================
export function Alert({
  variant = 'info',
  title,
  description,
  children,
  dismissible,
  onDismiss,
  onClose,
  visible = true,
  className,
}: AlertProps) {
  const config = variantStyles[variant];

  // Support onClose as alias for onDismiss (backward compat)
  const dismissHandler = onDismiss ?? onClose;
  const showDismiss = dismissible ?? !!dismissHandler;

  const content = (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex items-start gap-3 p-4 border rounded-lg',
        config.bg,
        config.border,
        className,
      )}
      role="alert"
    >
      {/* Icon */}
      <span className={cn('flex-shrink-0 mt-0.5', config.iconColor)}>
        {config.icon}
      </span>

      {/* Body */}
      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-sm font-bold text-neutral-900 mb-0.5">{title}</p>
        )}
        {description && (
          <p className="text-sm text-neutral-600 leading-relaxed">
            {description}
          </p>
        )}
        {children && <div className="text-sm text-neutral-600">{children}</div>}
      </div>

      {/* Dismiss button */}
      {showDismiss && dismissHandler && (
        <button
          onClick={dismissHandler}
          className={cn(
            'flex-shrink-0 w-8 h-8 flex items-center justify-center',
            'text-neutral-400 hover:text-neutral-900 transition-colors',
            'min-w-[44px] min-h-[44px] -m-2',
          )}
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );

  return <AnimatePresence>{visible && content}</AnimatePresence>;
}
