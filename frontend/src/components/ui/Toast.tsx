import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// ============================================================
// Types
// ============================================================
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  /** Duration in ms. 0 = no auto-dismiss. Default: 5000 */
  duration?: number;
}

interface ToastContextValue {
  toast: (msg: Omit<ToastMessage, 'id'>) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

// ============================================================
// Context
// ============================================================
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return ctx;
}

// ============================================================
// Provider
// ============================================================
const MAX_VISIBLE = 3;
let toastCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((msg: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${++toastCounter}-${Date.now()}`;
    const newToast: ToastMessage = { ...msg, id, duration: msg.duration ?? 5000 };
    setToasts((prev) => {
      const next = [...prev, newToast];
      // Keep only the latest MAX_VISIBLE
      if (next.length > MAX_VISIBLE) {
        return next.slice(next.length - MAX_VISIBLE);
      }
      return next;
    });
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss, dismissAll }}>
      {children}
      {/* Toast container -- bottom-right */}
      <div
        className="fixed bottom-4 right-4 z-[9999] flex flex-col-reverse gap-3 w-full max-w-[380px] pointer-events-none"
        aria-live="polite"
        aria-relevant="additions"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// ============================================================
// Single Toast Item
// ============================================================
const typeConfig: Record<
  ToastType,
  { icon: ReactNode; borderColor: string; iconColor: string }
> = {
  success: {
    icon: <CheckCircle className="w-5 h-5" />,
    borderColor: 'border-l-green-500',
    iconColor: 'text-green-500',
  },
  error: {
    icon: <XCircle className="w-5 h-5" />,
    borderColor: 'border-l-red-500',
    iconColor: 'text-red-500',
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5" />,
    borderColor: 'border-l-amber-500',
    iconColor: 'text-amber-500',
  },
  info: {
    icon: <Info className="w-5 h-5" />,
    borderColor: 'border-l-blue-500',
    iconColor: 'text-blue-500',
  },
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleDismiss = useCallback(() => {
    onDismiss(toast.id);
  }, [onDismiss, toast.id]);

  // Auto-dismiss
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      timerRef.current = setTimeout(handleDismiss, toast.duration);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.duration, handleDismiss]);

  // Pause on hover
  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleMouseLeave = () => {
    if (toast.duration && toast.duration > 0) {
      timerRef.current = setTimeout(handleDismiss, 2000);
    }
  };

  const config = typeConfig[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      role={toast.type === 'error' || toast.type === 'warning' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' || toast.type === 'warning' ? 'assertive' : 'polite'}
      className={cn(
        'pointer-events-auto bg-white shadow-soft-lg',
        'border border-neutral-200 border-l-4',
        config.borderColor,
        'p-4',
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-start gap-3">
        <span className={cn('flex-shrink-0 mt-0.5', config.iconColor)}>
          {config.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-neutral-900">{toast.title}</p>
          {toast.description && (
            <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
              {toast.description}
            </p>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-colors min-w-[44px] min-h-[44px] -m-2"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
