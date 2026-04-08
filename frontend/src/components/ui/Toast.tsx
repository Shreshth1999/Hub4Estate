import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';
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
  duration?: number; // ms, 0 = no auto-dismiss
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
let toastCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((msg: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${++toastCounter}-${Date.now()}`;
    const newToast: ToastMessage = { ...msg, id, duration: msg.duration ?? 5000 };
    setToasts((prev) => [...prev, newToast]);
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
      {/* Toast container — top-right, stacked */}
      <div
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-[380px] pointer-events-none"
        aria-live="polite"
        aria-relevant="additions"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ============================================================
// Single Toast Item
// ============================================================
const typeConfig: Record<
  ToastType,
  { icon: ReactNode; bg: string; border: string; iconColor: string }
> = {
  success: {
    icon: <CheckCircle className="w-5 h-5" />,
    bg: 'bg-white',
    border: 'border-l-4 border-l-success-500 border border-neutral-200',
    iconColor: 'text-success-500',
  },
  error: {
    icon: <XCircle className="w-5 h-5" />,
    bg: 'bg-white',
    border: 'border-l-4 border-l-error-500 border border-neutral-200',
    iconColor: 'text-error-500',
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5" />,
    bg: 'bg-white',
    border: 'border-l-4 border-l-warning-500 border border-neutral-200',
    iconColor: 'text-warning-500',
  },
  info: {
    icon: <Info className="w-5 h-5" />,
    bg: 'bg-white',
    border: 'border-l-4 border-l-info border border-neutral-200',
    iconColor: 'text-info',
  },
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    // Wait for exit animation then remove
    setTimeout(() => onDismiss(toast.id), 200);
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
    <div
      role="alert"
      className={cn(
        'pointer-events-auto shadow-soft',
        config.bg,
        config.border,
        'p-4',
        isExiting ? 'animate-toast-out' : 'animate-toast-in',
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
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
