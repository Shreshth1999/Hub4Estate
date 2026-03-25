import { ShieldCheck } from 'lucide-react';

export type UserRoleType =
  | 'ARCHITECT'
  | 'INTERIOR_DESIGNER'
  | 'CONTRACTOR'
  | 'ELECTRICIAN'
  | 'SMALL_BUILDER'
  | 'DEVELOPER'
  | 'INDIVIDUAL_HOME_BUILDER'
  | 'RENOVATION_HOMEOWNER'
  | 'dealer';

interface UserBadgeProps {
  role: UserRoleType | string;
  verified?: boolean;
  size?: 'sm' | 'md';
  /** Show the shield check icon */
  showIcon?: boolean;
  className?: string;
}

const ROLE_CONFIG: Record<string, { label: string; colors: string; verifiedColors: string }> = {
  ARCHITECT: {
    label: 'Architect',
    colors: 'bg-violet-50 text-violet-700 border-violet-100',
    verifiedColors: 'bg-violet-100 text-violet-800 border-violet-200',
  },
  INTERIOR_DESIGNER: {
    label: 'Interior Designer',
    colors: 'bg-pink-50 text-pink-700 border-pink-100',
    verifiedColors: 'bg-pink-100 text-pink-800 border-pink-200',
  },
  CONTRACTOR: {
    label: 'Contractor',
    colors: 'bg-blue-50 text-blue-700 border-blue-100',
    verifiedColors: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  ELECTRICIAN: {
    label: 'Electrician',
    colors: 'bg-amber-50 text-amber-700 border-amber-100',
    verifiedColors: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  SMALL_BUILDER: {
    label: 'Builder',
    colors: 'bg-teal-50 text-teal-700 border-teal-100',
    verifiedColors: 'bg-teal-100 text-teal-800 border-teal-200',
  },
  DEVELOPER: {
    label: 'Developer',
    colors: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    verifiedColors: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  INDIVIDUAL_HOME_BUILDER: {
    label: 'Home Builder',
    colors: 'bg-gray-50 text-gray-600 border-gray-100',
    verifiedColors: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  RENOVATION_HOMEOWNER: {
    label: 'Homeowner',
    colors: 'bg-gray-50 text-gray-600 border-gray-100',
    verifiedColors: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  dealer: {
    label: 'Dealer',
    colors: 'bg-orange-50 text-orange-700 border-orange-100',
    verifiedColors: 'bg-orange-100 text-orange-800 border-orange-200',
  },
};

export function UserBadge({ role, verified = false, size = 'sm', showIcon = true, className = '' }: UserBadgeProps) {
  const config = ROLE_CONFIG[role] ?? {
    label: role,
    colors: 'bg-gray-50 text-gray-600 border-gray-100',
    verifiedColors: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const colorClass = verified ? config.verifiedColors : config.colors;
  const label = verified ? `Verified ${config.label}` : config.label;

  const sizeClass = size === 'md'
    ? 'text-xs px-2.5 py-1 gap-1.5'
    : 'text-[11px] px-2 py-0.5 gap-1';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${colorClass} ${sizeClass} ${className}`}
    >
      {verified && showIcon && (
        <ShieldCheck className={size === 'md' ? 'w-3.5 h-3.5 flex-shrink-0' : 'w-3 h-3 flex-shrink-0'} />
      )}
      {label}
    </span>
  );
}

/** Compact badge — just the initials of the role, used in tight spaces */
export function UserBadgeDot({ role, verified = false }: Pick<UserBadgeProps, 'role' | 'verified'>) {
  const config = ROLE_CONFIG[role] ?? {
    label: role,
    colors: 'bg-gray-100 text-gray-600',
    verifiedColors: 'bg-gray-200 text-gray-700',
  };
  const colorClass = verified ? config.verifiedColors : config.colors;
  return (
    <span
      title={verified ? `Verified ${config.label}` : config.label}
      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold border ${colorClass}`}
    >
      {config.label.charAt(0)}
    </span>
  );
}
