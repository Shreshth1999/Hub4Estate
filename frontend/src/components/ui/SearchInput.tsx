import {
  forwardRef,
  useState,
  useEffect,
  useRef,
  useCallback,
  type InputHTMLAttributes,
} from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// ============================================================
// Types
// ============================================================
export interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  /** Called with the debounced value */
  onSearch: (value: string) => void;
  /** Debounce delay in ms (default: 300) */
  debounceMs?: number;
  /** Show loading spinner instead of search icon */
  isLoading?: boolean;
  /** Controlled value (optional) */
  value?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'h-9 text-xs pl-9 pr-9',
  md: 'h-11 text-sm pl-10 pr-10',
  lg: 'h-[52px] text-base pl-11 pr-11',
};

const iconSizes = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

// ============================================================
// SearchInput
// ============================================================
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      onSearch,
      debounceMs = 300,
      isLoading = false,
      value: controlledValue,
      placeholder = 'Search...',
      size = 'md',
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState(controlledValue ?? '');
    const timerRef = useRef<ReturnType<typeof setTimeout>>();
    const isControlled = controlledValue !== undefined;

    const currentValue = isControlled ? controlledValue : internalValue;

    // Sync controlled value
    useEffect(() => {
      if (isControlled) {
        setInternalValue(controlledValue);
      }
    }, [controlledValue, isControlled]);

    // Debounced callback
    const debouncedSearch = useCallback(
      (val: string) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          onSearch(val);
        }, debounceMs);
      },
      [onSearch, debounceMs],
    );

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (!isControlled) {
        setInternalValue(val);
      }
      debouncedSearch(val);
    };

    const handleClear = () => {
      if (!isControlled) {
        setInternalValue('');
      }
      // Fire immediately on clear
      if (timerRef.current) clearTimeout(timerRef.current);
      onSearch('');
    };

    const hasValue = currentValue.length > 0;

    return (
      <div className={cn('relative', className)}>
        {/* Search icon / spinner */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
          {isLoading ? (
            <Loader2 className={cn('animate-spin', iconSizes[size])} />
          ) : (
            <Search className={iconSizes[size]} />
          )}
        </div>

        <input
          ref={ref}
          type="text"
          value={currentValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'block w-full border-2 font-medium transition-all duration-200 rounded-none',
            'focus:outline-none focus:ring-0',
            'placeholder:text-neutral-400',
            'border-neutral-300 focus:border-neutral-900 bg-white',
            disabled && 'cursor-not-allowed bg-neutral-100 text-neutral-500',
            sizeStyles[size],
          )}
          {...props}
        />

        {/* Clear button */}
        {hasValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              'absolute right-1 top-1/2 -translate-y-1/2',
              'w-8 h-8 flex items-center justify-center',
              'text-neutral-400 hover:text-neutral-900 transition-colors',
              'min-w-[44px] min-h-[44px] -mr-2',
            )}
            aria-label="Clear search"
          >
            <X className={iconSizes[size]} />
          </button>
        )}
      </div>
    );
  },
);

SearchInput.displayName = 'SearchInput';
