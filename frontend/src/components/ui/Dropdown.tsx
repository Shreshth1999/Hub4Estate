import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
  type ElementType,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// ============================================================
// Types
// ============================================================
export interface DropdownItem {
  key: string;
  label: string;
  icon?: ElementType;
  disabled?: boolean;
  /** Renders a visual separator before this item */
  separator?: boolean;
  /** Destructive items shown in red */
  destructive?: boolean;
}

export interface DropdownProps {
  /** Trigger content — defaults to a button with chevron */
  trigger?: ReactNode;
  /** Trigger label when using the default trigger button */
  label?: string;
  items: DropdownItem[];
  onSelect: (key: string) => void;
  /** Popover alignment relative to trigger */
  align?: 'left' | 'right';
  /** Width of the dropdown menu */
  menuWidth?: string;
  className?: string;
  disabled?: boolean;
}

// ============================================================
// Dropdown component
// ============================================================
export function Dropdown({
  trigger,
  label = 'Options',
  items,
  onSelect,
  align = 'left',
  menuWidth = '200px',
  className,
  disabled = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = useCallback(
    (key: string) => {
      onSelect(key);
      setIsOpen(false);
    },
    [onSelect],
  );

  const toggleOpen = () => {
    if (!disabled) setIsOpen((prev) => !prev);
  };

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      {/* Trigger */}
      {trigger ? (
        <div
          onClick={toggleOpen}
          className={cn(disabled && 'opacity-50 pointer-events-none cursor-not-allowed')}
        >
          {trigger}
        </div>
      ) : (
        <button
          onClick={toggleOpen}
          disabled={disabled}
          className={cn(
            'inline-flex items-center gap-2 h-11 px-4',
            'text-sm font-bold text-neutral-700',
            'border-2 border-neutral-300 bg-white',
            'transition-all duration-200',
            'hover:border-neutral-900 hover:text-neutral-900',
            'min-w-[44px] min-h-[44px]',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          {label}
          <ChevronDown
            className={cn(
              'w-4 h-4 transition-transform duration-200',
              isOpen && 'rotate-180',
            )}
          />
        </button>
      )}

      {/* Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 mt-1 py-1',
              'bg-white border border-neutral-200 shadow-soft-lg',
              'rounded-lg overflow-hidden',
              align === 'right' ? 'right-0' : 'left-0',
            )}
            style={{ width: menuWidth }}
            role="menu"
          >
            {items.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.key}>
                  {item.separator && (
                    <div className="my-1 h-px bg-neutral-100" />
                  )}
                  <button
                    role="menuitem"
                    disabled={item.disabled}
                    onClick={() => {
                      if (!item.disabled) handleSelect(item.key);
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 text-sm text-left',
                      'transition-colors duration-100',
                      'min-h-[44px]',
                      item.disabled
                        ? 'opacity-40 cursor-not-allowed'
                        : item.destructive
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900',
                    )}
                  >
                    {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                    {item.label}
                  </button>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
