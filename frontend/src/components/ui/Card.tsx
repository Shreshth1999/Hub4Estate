import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

// ============================================================
// Types
// ============================================================
export type CardVariant = 'default' | 'elevated' | 'interactive';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
}

// ============================================================
// Styles
// ============================================================
const paddingStyles: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

const variantBase =
  'bg-white rounded-2xl transition-all duration-200';

const variantStyles: Record<CardVariant, string> = {
  default: cn(variantBase, 'border border-neutral-200'),
  elevated: cn(variantBase, 'border border-neutral-200 shadow-lg'),
  interactive: cn(
    variantBase,
    'border border-neutral-200 cursor-pointer',
    'hover:shadow-md hover:-translate-y-0.5',
    'active:translate-y-0 active:shadow-sm',
  ),
};

// ============================================================
// Card
// ============================================================
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      padding = 'md',
      className,
      onClick,
      ...props
    },
    ref,
  ) => {
    // Use framer-motion wrapper for the interactive variant
    if (variant === 'interactive') {
      return (
        <motion.div
          ref={ref}
          whileHover={{ y: -2, boxShadow: '0 8px 30px -4px rgba(0,0,0,0.12)' }}
          whileTap={{ scale: 0.99 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={cn(
            'bg-white rounded-2xl border border-neutral-200 cursor-pointer',
            paddingStyles[padding],
            className,
          )}
          onClick={onClick}
          {...(props as Record<string, unknown>)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          variantStyles[variant],
          paddingStyles[padding],
          className,
        )}
        onClick={onClick}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';
