import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: cn(
    'bg-cta-500 text-navy border-2 border-navy',
    'hover:shadow-brutal hover:-translate-y-0.5',
    'active:shadow-brutal-sm active:translate-x-[2px] active:translate-y-[2px]',
  ),
  secondary: cn(
    'bg-white text-neutral-900 border-2 border-neutral-900',
    'hover:bg-neutral-900 hover:text-white hover:shadow-brutal hover:-translate-y-0.5',
    'active:shadow-brutal-sm active:translate-x-[2px] active:translate-y-[2px]',
  ),
  accent: cn(
    'bg-accent-600 text-white border-2 border-accent-700',
    'hover:bg-accent-700 hover:shadow-brutal hover:-translate-y-0.5',
    'active:shadow-brutal-sm active:translate-x-[2px] active:translate-y-[2px]',
  ),
  ghost: cn(
    'bg-transparent text-neutral-700 border-2 border-transparent',
    'hover:bg-neutral-100 hover:text-neutral-900',
    'active:bg-neutral-200',
  ),
  destructive: cn(
    'bg-error-500 text-white border-2 border-error-700',
    'hover:bg-error-600 hover:shadow-brutal hover:-translate-y-0.5',
    'active:shadow-brutal-sm active:translate-x-[2px] active:translate-y-[2px]',
  ),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-5 text-sm gap-2',
  lg: 'h-12 px-7 text-base gap-2.5',
};

const iconSizes: Record<ButtonSize, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center',
          'font-bold uppercase tracking-wide',
          'transition-all duration-200 ease-out',
          'select-none whitespace-nowrap',
          'min-w-[44px] min-h-[44px]', // 44px minimum touch target
          // Variant
          variantStyles[variant],
          // Size
          sizeStyles[size],
          // Full width
          fullWidth && 'w-full',
          // Disabled
          isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className={cn('animate-spin', iconSizes[size])} />
        ) : (
          leftIcon && <span className={cn('flex-shrink-0', iconSizes[size])}>{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && (
          <span className={cn('flex-shrink-0', iconSizes[size])}>{rightIcon}</span>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
