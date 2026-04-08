import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from 'react';
import { Eye, EyeOff, Search, Phone, IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type InputVariant = 'default' | 'search' | 'password' | 'phone' | 'currency' | 'textarea';
export type InputSize = 'sm' | 'md' | 'lg';

interface BaseInputProps {
  variant?: InputVariant;
  inputSize?: InputSize;
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export type InputProps = BaseInputProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

export type TextareaProps = BaseInputProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>;

const sizeStyles: Record<InputSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-4 text-base',
};

const textareaSizeStyles: Record<InputSize, string> = {
  sm: 'px-3 py-2 text-xs min-h-[80px]',
  md: 'px-4 py-3 text-sm min-h-[120px]',
  lg: 'px-4 py-4 text-base min-h-[160px]',
};

const labelSizeStyles: Record<InputSize, string> = {
  sm: 'text-xs mb-1',
  md: 'text-sm mb-1.5',
  lg: 'text-sm mb-2',
};

function InputWrapper({
  label,
  error,
  helperText,
  required,
  inputSize = 'md',
  fullWidth = true,
  children,
  id,
}: {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  inputSize?: InputSize;
  fullWidth?: boolean;
  children: ReactNode;
  id?: string;
}) {
  return (
    <div className={cn(fullWidth ? 'w-full' : 'inline-flex flex-col')}>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            'block font-bold text-neutral-900 uppercase tracking-wide',
            labelSizeStyles[inputSize],
          )}
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="mt-1.5 text-xs font-medium text-error-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-xs text-neutral-500">{helperText}</p>
      )}
    </div>
  );
}

// ============================================================
// Standard Input (default, search, password, phone, currency)
// ============================================================
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      inputSize = 'md',
      label,
      error,
      helperText,
      required,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className,
      id,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const inputId = id || props.name || undefined;

    // Determine type override for password variant
    const resolvedType =
      variant === 'password'
        ? showPassword
          ? 'text'
          : 'password'
        : variant === 'search'
          ? 'search'
          : variant === 'phone'
            ? 'tel'
            : variant === 'currency'
              ? 'text'
              : props.type || 'text';

    // Determine prefix icons based on variant
    const prefixIcon =
      variant === 'search' ? (
        <Search className="w-4 h-4 text-neutral-400" />
      ) : variant === 'phone' ? (
        <span className="flex items-center gap-1 text-neutral-600 font-medium text-sm">
          <Phone className="w-3.5 h-3.5" />
          +91
        </span>
      ) : variant === 'currency' ? (
        <IndianRupee className="w-4 h-4 text-neutral-600" />
      ) : (
        leftIcon
      );

    // Determine suffix for password variant
    const suffixIcon =
      variant === 'password' ? (
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword((v) => !v)}
          className="p-1 text-neutral-400 hover:text-neutral-700 transition-colors focus:outline-none"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      ) : (
        rightIcon
      );

    // Phone variant input pattern
    const inputMode =
      variant === 'phone' ? 'numeric' as const
        : variant === 'currency' ? 'decimal' as const
          : undefined;

    return (
      <InputWrapper
        label={label}
        error={error}
        helperText={helperText}
        required={required}
        inputSize={inputSize}
        fullWidth={fullWidth}
        id={inputId}
      >
        <div className="relative flex items-center">
          {prefixIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none z-10">
              {prefixIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            inputMode={inputMode}
            disabled={disabled}
            className={cn(
              'block w-full border-2 font-medium transition-all duration-200',
              'focus:outline-none focus:ring-0',
              'placeholder:text-neutral-400',
              sizeStyles[inputSize],
              // Error state
              error
                ? 'border-error-500 focus:border-error-600 bg-error-50/50'
                : 'border-neutral-300 focus:border-neutral-900 bg-white',
              // Disabled
              disabled && 'cursor-not-allowed bg-neutral-100 text-neutral-500',
              // Prefix padding
              prefixIcon && (variant === 'phone' ? 'pl-[4.5rem]' : 'pl-10'),
              // Suffix padding
              suffixIcon && 'pr-10',
              className,
            )}
            {...props}
          />

          {suffixIcon && (
            <div className="absolute right-3 flex items-center z-10">
              {suffixIcon}
            </div>
          )}
        </div>
      </InputWrapper>
    );
  },
);

Input.displayName = 'Input';

// ============================================================
// Textarea
// ============================================================
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      inputSize = 'md',
      label,
      error,
      helperText,
      required,
      fullWidth = true,
      className,
      id,
      disabled,
      ...props
    },
    ref,
  ) => {
    const inputId = id || (props as { name?: string }).name || undefined;

    return (
      <InputWrapper
        label={label}
        error={error}
        helperText={helperText}
        required={required}
        inputSize={inputSize}
        fullWidth={fullWidth}
        id={inputId}
      >
        <textarea
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={cn(
            'block w-full border-2 font-medium transition-all duration-200 resize-y',
            'focus:outline-none focus:ring-0',
            'placeholder:text-neutral-400',
            textareaSizeStyles[inputSize],
            error
              ? 'border-error-500 focus:border-error-600 bg-error-50/50'
              : 'border-neutral-300 focus:border-neutral-900 bg-white',
            disabled && 'cursor-not-allowed bg-neutral-100 text-neutral-500',
            className,
          )}
          {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      </InputWrapper>
    );
  },
);

Textarea.displayName = 'Textarea';
