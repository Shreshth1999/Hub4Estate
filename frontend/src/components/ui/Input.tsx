import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// ============================================================
// Types
// ============================================================
export type InputSize = 'sm' | 'md' | 'lg';

interface BaseInputProps {
  inputSize?: InputSize;
  label?: string;
  error?: string;
  helperText?: string;
  /** Alias for helperText (backward compat) */
  helper?: string;
  required?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export type InputProps = BaseInputProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

export type TextareaProps = BaseInputProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>;

// ============================================================
// Shared style maps
// ============================================================
const sizeStyles: Record<InputSize, string> = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-11 px-4 text-sm',
  lg: 'h-[52px] px-4 text-base',
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

// ============================================================
// InputWrapper — shared label, error, helper layout
// ============================================================
function InputWrapper({
  label,
  error,
  helperText,
  required,
  inputSize = 'md',
  fullWidth = true,
  children,
  id,
  errorId,
  helperTextId,
}: {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  inputSize?: InputSize;
  fullWidth?: boolean;
  children: ReactNode;
  id?: string;
  errorId?: string;
  helperTextId?: string;
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
          {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p id={errorId} className="mt-1.5 text-xs font-medium text-red-600" role="alert">{error}</p>
      )}
      {helperText && !error && (
        <p id={helperTextId} className="mt-1.5 text-xs text-neutral-500">{helperText}</p>
      )}
    </div>
  );
}

// ============================================================
// Input
// ============================================================
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      inputSize = 'md',
      label,
      error,
      helperText,
      helper,
      required,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className,
      id,
      disabled,
      type,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const inputId = id || props.name || undefined;
    const isPassword = type === 'password';
    const resolvedHelper = helperText ?? helper;
    const errorId = error && inputId ? `${inputId}-error` : undefined;
    const helperTextId = !error && resolvedHelper && inputId ? `${inputId}-helper` : undefined;
    const describedBy = [errorId, helperTextId].filter(Boolean).join(' ') || undefined;

    const resolvedType = isPassword
      ? showPassword
        ? 'text'
        : 'password'
      : type || 'text';

    const suffixIcon = isPassword ? (
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShowPassword((v) => !v)}
        className="p-1 text-neutral-400 hover:text-neutral-700 transition-colors focus:outline-none min-w-[44px] min-h-[44px] flex items-center justify-center"
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

    return (
      <InputWrapper
        label={label}
        error={error}
        helperText={resolvedHelper}
        required={required}
        inputSize={inputSize}
        fullWidth={fullWidth}
        id={inputId}
        errorId={errorId}
        helperTextId={helperTextId}
      >
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none z-10 text-neutral-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            aria-required={required || undefined}
            className={cn(
              'block w-full border-2 font-medium transition-all duration-200 rounded-none',
              'focus:outline-none focus:ring-0',
              'placeholder:text-neutral-400',
              sizeStyles[inputSize],
              // Error state
              error
                ? 'border-red-500 focus:border-red-600 bg-red-50/50'
                : 'border-neutral-300 focus:border-neutral-900 bg-white',
              // Disabled
              disabled && 'cursor-not-allowed bg-neutral-100 text-neutral-500',
              // Icon padding
              leftIcon && 'pl-10',
              suffixIcon && 'pr-10',
              className,
            )}
            {...props}
          />

          {suffixIcon && (
            <div className="absolute right-1 flex items-center z-10">
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
      helper,
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
    const resolvedHelper = helperText ?? helper;
    const errorId = error && inputId ? `${inputId}-error` : undefined;
    const helperTextId = !error && resolvedHelper && inputId ? `${inputId}-helper` : undefined;
    const describedBy = [errorId, helperTextId].filter(Boolean).join(' ') || undefined;

    return (
      <InputWrapper
        label={label}
        error={error}
        helperText={resolvedHelper}
        required={required}
        inputSize={inputSize}
        fullWidth={fullWidth}
        id={inputId}
        errorId={errorId}
        helperTextId={helperTextId}
      >
        <textarea
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          className={cn(
            'block w-full border-2 font-medium transition-all duration-200 resize-y rounded-none',
            'focus:outline-none focus:ring-0',
            'placeholder:text-neutral-400',
            textareaSizeStyles[inputSize],
            error
              ? 'border-red-500 focus:border-red-600 bg-red-50/50'
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
