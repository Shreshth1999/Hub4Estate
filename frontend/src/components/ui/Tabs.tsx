import { type ReactNode, type ElementType } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

// ============================================================
// Types
// ============================================================
export interface TabItem {
  id: string;
  label: string;
  /** Optional count badge displayed next to the label */
  count?: number;
  /** Optional lucide-react icon component */
  icon?: ElementType;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  /** Visual style: 'underline' uses a bottom border, 'pill' uses a filled bg */
  variant?: 'underline' | 'pill';
  /** Full width: tabs stretch equally to fill the container */
  fullWidth?: boolean;
  className?: string;
}

// ============================================================
// Tabs component
// ============================================================
export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  fullWidth = false,
  className,
}: TabsProps) {
  return (
    <div
      className={cn(
        'flex',
        variant === 'underline' && 'border-b-2 border-neutral-200',
        variant === 'pill' && 'bg-neutral-100 p-1 rounded-lg gap-1',
        fullWidth && 'w-full',
        className,
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-disabled={tab.disabled}
            disabled={tab.disabled}
            onClick={() => {
              if (!tab.disabled) onChange(tab.id);
            }}
            className={cn(
              'relative inline-flex items-center justify-center gap-2',
              'text-sm font-bold uppercase tracking-wide transition-colors duration-200',
              'min-h-[44px] px-4',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2',
              fullWidth && 'flex-1',
              tab.disabled && 'opacity-40 cursor-not-allowed',
              // Variant-specific styles
              variant === 'underline' && [
                'pb-3 -mb-[2px]',
                isActive
                  ? 'text-neutral-900'
                  : 'text-neutral-500 hover:text-neutral-900',
              ],
              variant === 'pill' && [
                'py-2 rounded-md',
                isActive
                  ? 'text-neutral-900'
                  : 'text-neutral-500 hover:text-neutral-700',
              ],
            )}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                  isActive
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-200 text-neutral-600',
                )}
              >
                {tab.count}
              </span>
            )}
            {/* Active indicator */}
            {isActive && variant === 'underline' && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-neutral-900"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            {isActive && variant === 'pill' && (
              <motion.div
                layoutId="tab-pill"
                className="absolute inset-0 bg-white rounded-md shadow-sm"
                style={{ zIndex: -1 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
