import { Link } from 'react-router-dom';
import { ChevronRight, Package, AlertCircle, Loader2, Check, X } from 'lucide-react';

// ==================== STATUS BADGE ====================
type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'pending' | 'default' | 'urgent';

const badgeStyles: Record<BadgeVariant, string> = {
  success: 'bg-success-100 text-success-800 border-success-800',
  warning: 'bg-warning-100 text-warning-800 border-warning-800',
  error: 'bg-error-100 text-error-800 border-error-800',
  info: 'bg-primary-100 text-primary-800 border-primary-800',
  pending: 'bg-neutral-100 text-neutral-800 border-neutral-800',
  default: 'bg-neutral-100 text-neutral-800 border-neutral-300',
  urgent: 'bg-accent-500 text-white border-accent-600 animate-pulse-slow',
};

export function StatusBadge({
  status,
  variant = 'default',
  size = 'sm'
}: {
  status: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}) {
  const sizeClass = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';
  return (
    <span className={`inline-flex items-center font-bold uppercase tracking-wider border-2 ${badgeStyles[variant]} ${sizeClass}`}>
      {status}
    </span>
  );
}

// ==================== BREADCRUMB ====================
interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center space-x-2 text-sm font-medium text-neutral-500 mb-8">
      <Link to="/" className="hover:text-neutral-900 transition-colors uppercase tracking-wide">Home</Link>
      {items.map((item, index) => (
        <span key={index} className="flex items-center space-x-2">
          <span className="text-neutral-300">/</span>
          {item.href ? (
            <Link to={item.href} className="hover:text-neutral-900 transition-colors uppercase tracking-wide">
              {item.label}
            </Link>
          ) : (
            <span className="text-neutral-900 font-bold uppercase tracking-wide">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

// ==================== STEPPER ====================
interface Step {
  label: string;
  description?: string;
}

export function Stepper({
  steps,
  currentStep
}: {
  steps: Step[];
  currentStep: number;
}) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 flex items-center justify-center font-black text-lg transition-all duration-300 border-2 ${
                  index < currentStep
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : index === currentStep
                      ? 'bg-accent-500 text-white border-accent-500 shadow-brutal-sm'
                      : 'bg-white text-neutral-400 border-neutral-300'
                }`}
              >
                {index < currentStep ? <Check className="w-6 h-6" /> : index + 1}
              </div>
              <div className="mt-3 text-center">
                <p className={`text-sm font-bold uppercase tracking-wide ${
                  index <= currentStep ? 'text-neutral-900' : 'text-neutral-400'
                }`}>
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-xs text-neutral-500 mt-1">{step.description}</p>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${
                  index < currentStep ? 'bg-neutral-900' : 'bg-neutral-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== EMPTY STATE ====================
export function EmptyState({
  icon: Icon = Package,
  title,
  description,
  action,
}: {
  icon?: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-neutral-300 bg-neutral-50">
      <div className="w-20 h-20 bg-neutral-900 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-white" />
      </div>
      <h3 className="text-xl font-bold text-neutral-900 mb-2 uppercase tracking-wide">{title}</h3>
      <p className="text-neutral-600 max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}

// ==================== SKELETON LOADERS ====================
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-neutral-200 ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white border-2 border-neutral-200 p-6">
      <Skeleton className="h-48 w-full mb-4" />
      <Skeleton className="h-6 w-3/4 mb-3" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border-2 border-neutral-200 p-5">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-14 w-14" />
            <div className="flex-1">
              <Skeleton className="h-5 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ==================== TABS ====================
interface Tab {
  id: string;
  label: string;
  count?: number;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex border-b-2 border-neutral-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-6 py-4 text-sm font-bold uppercase tracking-wide transition-all duration-200 border-b-2 -mb-0.5 ${
            activeTab === tab.id
              ? 'border-neutral-900 text-neutral-900 bg-white'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`ml-2 px-2 py-0.5 text-xs font-bold ${
              activeTab === tab.id
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-200 text-neutral-600'
            }`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ==================== LOADING STATES ====================
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }[size];

  return <Loader2 className={`${sizeClass} animate-spin text-neutral-900`} />;
}

export function PageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-neutral-600 font-medium uppercase tracking-wide">{message}</p>
    </div>
  );
}

// ==================== ALERT ====================
export function Alert({
  variant = 'info',
  title,
  children,
  onClose,
}: {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
}) {
  const styles = {
    info: 'bg-primary-50 border-primary-800 text-primary-900',
    success: 'bg-success-50 border-success-800 text-success-900',
    warning: 'bg-warning-50 border-warning-800 text-warning-900',
    error: 'bg-error-50 border-error-800 text-error-900',
  };

  const iconStyles = {
    info: 'text-primary-600',
    success: 'text-success-600',
    warning: 'text-warning-600',
    error: 'text-error-600',
  };

  return (
    <div className={`border-l-4 p-4 mb-6 ${styles[variant]}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <AlertCircle className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${iconStyles[variant]}`} />
          <div>
            {title && <h4 className="font-bold mb-1">{title}</h4>}
            <div className="text-sm">{children}</div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-4 hover:opacity-70">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ==================== MODAL ====================
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  if (!isOpen) return null;

  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }[size];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-neutral-900/80 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        <div className={`relative bg-white border-2 border-neutral-900 shadow-brutal-lg w-full ${sizeClass} transform transition-all animate-scale-in`}>
          <div className="flex items-center justify-between p-6 border-b-2 border-neutral-200">
            <h3 className="text-xl font-bold text-neutral-900 uppercase tracking-wide">{title}</h3>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center hover:bg-neutral-100 transition-colors border-2 border-neutral-300 hover:border-neutral-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ==================== INPUT ====================
export function Input({
  label,
  error,
  helper,
  required,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helper?: string;
  required?: boolean;
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-bold text-neutral-900 mb-2 uppercase tracking-wide">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      <input
        {...props}
        className={`block w-full border-2 px-4 py-4 text-base font-medium transition-all duration-200
          ${error
            ? 'border-error-500 focus:border-error-600 bg-error-50'
            : 'border-neutral-300 focus:border-neutral-900'
          }
          focus:outline-none focus:ring-0
          disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500
          ${props.className || ''}`}
      />
      {error && <p className="mt-2 text-sm font-medium text-error-600">{error}</p>}
      {helper && !error && <p className="mt-2 text-sm text-neutral-500">{helper}</p>}
    </div>
  );
}

// ==================== BUTTON ====================
export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'urgent';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}) {
  const baseClass = 'inline-flex items-center justify-center font-bold uppercase tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-2';

  const variants = {
    primary: 'bg-neutral-900 text-white border-neutral-900 hover:bg-white hover:text-neutral-900 hover:shadow-brutal active:shadow-brutal-sm active:translate-x-[2px] active:translate-y-[2px]',
    secondary: 'bg-white text-neutral-900 border-neutral-900 hover:bg-neutral-900 hover:text-white hover:shadow-brutal active:shadow-brutal-sm active:translate-x-[2px] active:translate-y-[2px]',
    accent: 'bg-accent-600 text-white border-accent-600 hover:bg-accent-700 hover:border-accent-700 hover:shadow-brutal active:shadow-brutal-sm',
    ghost: 'bg-transparent text-neutral-700 border-transparent hover:bg-neutral-100 hover:text-neutral-900',
    urgent: 'bg-neutral-950 text-white border-neutral-950 hover:bg-accent-600 hover:border-accent-600 hover:scale-105 hover:shadow-brutal-lg active:scale-100',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      className={`${baseClass} ${variants[variant]} ${sizes[size]} ${props.className || ''}`}
    >
      {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
      {children}
    </button>
  );
}

// ==================== COUNTDOWN ====================
export function Countdown({
  hours = 0,
  minutes = 0,
  seconds = 0,
  label = "Time Remaining"
}: {
  hours?: number;
  minutes?: number;
  seconds?: number;
  label?: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-xs uppercase tracking-wider text-neutral-500 mb-3 font-bold">{label}</p>
      <div className="flex gap-2">
        <div className="countdown-box">
          <div className="countdown-number">{String(hours).padStart(2, '0')}</div>
          <div className="countdown-label">Hours</div>
        </div>
        <div className="countdown-box">
          <div className="countdown-number">{String(minutes).padStart(2, '0')}</div>
          <div className="countdown-label">Min</div>
        </div>
        <div className="countdown-box">
          <div className="countdown-number">{String(seconds).padStart(2, '0')}</div>
          <div className="countdown-label">Sec</div>
        </div>
      </div>
    </div>
  );
}

// ==================== STAT CARD ====================
export function StatCard({
  value,
  label,
  prefix = '',
  suffix = '',
}: {
  value: string | number;
  label: string;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div className="card-stat text-center">
      <div className="big-number text-neutral-900">
        {prefix}{value}{suffix}
      </div>
      <p className="text-sm font-bold uppercase tracking-wider text-neutral-500 mt-2">{label}</p>
    </div>
  );
}

// ==================== URGENCY BADGE ====================
export function UrgencyBadge({ text }: { text: string }) {
  return (
    <span className="badge-urgent px-4 py-2 text-sm">
      {text}
    </span>
  );
}

// ==================== TRUST BADGE ====================
export function TrustBadge({
  icon,
  text
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="trust-badge">
      {icon}
      <span>{text}</span>
    </div>
  );
}

// ==================== OTP INPUT ====================
export { OTPInput } from './OTPInput';
