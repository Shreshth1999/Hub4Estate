import {
  useState,
  useRef,
  useCallback,
  type ReactNode,
} from 'react';
import { motion, AnimatePresence, type TargetAndTransition } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

// ============================================================
// Types
// ============================================================
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: string;
  placement?: TooltipPlacement;
  /** Delay before showing tooltip in ms (default: 200) */
  delay?: number;
  children: ReactNode;
  className?: string;
}

// ============================================================
// Placement styles
// ============================================================
const placementStyles: Record<TooltipPlacement, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const motionVariants: Record<TooltipPlacement, { initial: TargetAndTransition; animate: TargetAndTransition }> = {
  top: {
    initial: { opacity: 0, y: 4 },
    animate: { opacity: 1, y: 0 },
  },
  bottom: {
    initial: { opacity: 0, y: -4 },
    animate: { opacity: 1, y: 0 },
  },
  left: {
    initial: { opacity: 0, x: 4 },
    animate: { opacity: 1, x: 0 },
  },
  right: {
    initial: { opacity: 0, x: -4 },
    animate: { opacity: 1, x: 0 },
  },
};

// ============================================================
// Tooltip component
// ============================================================
export function Tooltip({
  content,
  placement = 'top',
  delay = 200,
  children,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => setIsVisible(true), delay);
  }, [delay]);

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsVisible(false);
  }, []);

  return (
    <div
      className={cn('relative inline-flex', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={motionVariants[placement].initial}
            animate={motionVariants[placement].animate}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 pointer-events-none',
              'px-3 py-1.5 text-xs font-medium text-white',
              'bg-neutral-900 rounded-md shadow-sm',
              'whitespace-nowrap',
              placementStyles[placement],
            )}
            role="tooltip"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
