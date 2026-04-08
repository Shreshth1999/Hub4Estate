import {
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  type KeyboardEvent,
} from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: ModalSize;
  /** Hides the built-in header (title bar + close button) */
  hideHeader?: boolean;
  /** Prevents closing by clicking backdrop or pressing Escape */
  persistent?: boolean;
  footer?: ReactNode;
}

const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-[400px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[720px]',
  xl: 'max-w-[900px]',
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  hideHeader = false,
  persistent = false,
  footer,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // ---- Lock body scroll ----
  useEffect(() => {
    if (!isOpen) return;

    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  // ---- Focus management ----
  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus first focusable element in modal (after mount)
    const timer = setTimeout(() => {
      const firstFocusable = contentRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      firstFocusable?.focus();
    }, 50);

    return () => {
      clearTimeout(timer);
      previousActiveElement.current?.focus();
    };
  }, [isOpen]);

  // ---- Escape key ----
  useEffect(() => {
    if (!isOpen || persistent) return;

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, persistent, onClose]);

  // ---- Tab trap ----
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== 'Tab') return;

      const focusableElements = contentRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (!focusableElements || focusableElements.length === 0) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [],
  );

  // ---- Backdrop click ----
  const handleBackdropClick = useCallback(() => {
    if (!persistent) onClose();
  }, [persistent, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy/60 backdrop-blur-sm animate-backdrop-in"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Content — bottom sheet on mobile, centered on md+ */}
      <div
        ref={contentRef}
        className={cn(
          // Base
          'relative z-10 bg-white w-full',
          'flex flex-col max-h-[90vh]',
          // Mobile: bottom sheet
          'rounded-t-2xl animate-sheet-up',
          // Desktop: centered dialog
          'md:rounded-none md:animate-modal-in md:border-2 md:border-neutral-900 md:shadow-brutal-lg',
          sizeStyles[size],
        )}
      >
        {/* Header */}
        {!hideHeader && (
          <div className="flex items-center justify-between px-5 py-4 border-b-2 border-neutral-200 flex-shrink-0">
            <div>
              {title && (
                <h2 className="text-lg font-bold text-neutral-900 uppercase tracking-wide">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-neutral-500 mt-0.5">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className={cn(
                'w-10 h-10 flex items-center justify-center flex-shrink-0',
                'border-2 border-neutral-300 hover:border-neutral-900',
                'text-neutral-500 hover:text-neutral-900',
                'transition-all duration-200',
                'hover:shadow-brutal-sm hover:-translate-y-0.5',
                'active:translate-x-[1px] active:translate-y-[1px] active:shadow-none',
              )}
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-4 border-t-2 border-neutral-200 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
