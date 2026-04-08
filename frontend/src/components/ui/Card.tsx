import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { Star, MapPin, CheckCircle, Clock, TrendingUp, ArrowUpRight } from 'lucide-react';

// ============================================================
// Base Card
// ============================================================
export type CardVariant =
  | 'product'
  | 'dealer'
  | 'inquiry'
  | 'quote'
  | 'stat'
  | 'feature';

interface CardBaseProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  bordered?: boolean;
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export function Card({
  children,
  padding = 'md',
  hoverable = false,
  bordered = true,
  className,
  ...props
}: CardBaseProps) {
  return (
    <div
      className={cn(
        'bg-white transition-all duration-200',
        bordered && 'border-2 border-neutral-200',
        hoverable && [
          'cursor-pointer',
          'hover:border-neutral-900 hover:shadow-brutal hover:-translate-y-0.5',
          'active:shadow-brutal-sm active:translate-x-[2px] active:translate-y-[2px]',
        ],
        paddingStyles[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================
// Product Card
// ============================================================
interface ProductCardProps {
  image?: string;
  brand: string;
  name: string;
  modelNumber?: string;
  mrp: number;
  hubPrice?: number;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

export function ProductCard({
  image,
  brand,
  name,
  modelNumber,
  mrp,
  hubPrice,
  rating,
  reviewCount,
  inStock = true,
  onAction,
  actionLabel = 'Get Quote',
  className,
}: ProductCardProps) {
  const savings = hubPrice ? Math.round(((mrp - hubPrice) / mrp) * 100) : 0;

  return (
    <Card hoverable padding="none" className={cn('overflow-hidden group', className)}>
      {/* Image */}
      <div className="relative aspect-square bg-neutral-50 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-300">
            <span className="text-4xl">No image</span>
          </div>
        )}
        {savings > 0 && (
          <span className="absolute top-3 left-3 bg-cta-500 text-navy font-bold text-xs px-2 py-1 border-2 border-navy">
            SAVE {savings}%
          </span>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <span className="bg-neutral-900 text-white font-bold text-sm px-4 py-2 uppercase tracking-wide">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
          {brand}
        </p>
        <h3 className="text-sm font-bold text-neutral-900 line-clamp-2 leading-snug mb-1">
          {name}
        </h3>
        {modelNumber && (
          <p className="text-xs font-mono text-neutral-400 mb-3">{modelNumber}</p>
        )}

        {/* Rating */}
        {rating !== undefined && (
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center gap-0.5 bg-success-bg text-success-text px-2 py-0.5 text-xs font-bold">
              <Star className="w-3 h-3 fill-current" />
              {rating.toFixed(1)}
            </div>
            {reviewCount !== undefined && (
              <span className="text-xs text-neutral-400">({reviewCount})</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          {hubPrice ? (
            <>
              <span className="font-mono font-bold text-lg text-neutral-900">
                {'\u20B9'}{hubPrice.toLocaleString('en-IN')}
              </span>
              <span className="font-mono text-sm text-neutral-400 line-through">
                {'\u20B9'}{mrp.toLocaleString('en-IN')}
              </span>
            </>
          ) : (
            <span className="font-mono font-bold text-lg text-neutral-900">
              {'\u20B9'}{mrp.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Action */}
        {onAction && inStock && (
          <button
            onClick={onAction}
            className={cn(
              'w-full h-10 flex items-center justify-center',
              'bg-cta-500 text-navy font-bold text-sm uppercase tracking-wide',
              'border-2 border-navy',
              'hover:shadow-brutal hover:-translate-y-0.5',
              'active:shadow-brutal-sm active:translate-x-[2px] active:translate-y-[2px]',
              'transition-all duration-200',
            )}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </Card>
  );
}

// ============================================================
// Dealer Card
// ============================================================
interface DealerCardProps {
  name: string;
  location: string;
  rating?: number;
  totalOrders?: number;
  verified?: boolean;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  specialties?: string[];
  avatar?: string;
  onView?: () => void;
  className?: string;
}

const tierColors: Record<string, string> = {
  bronze: 'bg-accent-200 text-accent-800',
  silver: 'bg-neutral-200 text-neutral-800',
  gold: 'bg-cta-100 text-cta-800',
  platinum: 'bg-primary-200 text-primary-900',
};

export function DealerCard({
  name,
  location,
  rating,
  totalOrders,
  verified = false,
  tier,
  specialties,
  avatar,
  onView,
  className,
}: DealerCardProps) {
  return (
    <Card hoverable padding="md" className={cn('group', className)} onClick={onView}>
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 flex-shrink-0 bg-primary-100 border-2 border-neutral-200 flex items-center justify-center overflow-hidden">
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl font-bold text-primary-700">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-neutral-900 truncate">{name}</h3>
            {verified && (
              <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-1 text-xs text-neutral-500 mb-2">
            <MapPin className="w-3 h-3" />
            <span>{location}</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {rating !== undefined && (
              <div className="flex items-center gap-1 text-xs font-bold">
                <Star className="w-3 h-3 text-cta-500 fill-cta-500" />
                <span>{rating.toFixed(1)}</span>
              </div>
            )}
            {totalOrders !== undefined && (
              <span className="text-xs text-neutral-500">
                {totalOrders} orders
              </span>
            )}
            {tier && (
              <span
                className={cn(
                  'text-xs font-bold uppercase tracking-wider px-2 py-0.5',
                  tierColors[tier],
                )}
              >
                {tier}
              </span>
            )}
          </div>

          {specialties && specialties.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {specialties.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        <ArrowUpRight className="w-5 h-5 text-neutral-300 group-hover:text-neutral-900 transition-colors flex-shrink-0" />
      </div>
    </Card>
  );
}

// ============================================================
// Inquiry Card
// ============================================================
interface InquiryCardProps {
  inquiryId: string;
  title: string;
  category: string;
  status: 'draft' | 'open' | 'in_review' | 'awarded' | 'completed' | 'closed';
  bidCount?: number;
  createdAt: string;
  deadline?: string;
  totalAmount?: number;
  onView?: () => void;
  className?: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-neutral-100 text-neutral-700 border-neutral-300' },
  open: { label: 'Open', color: 'bg-success-bg text-success-text border-success-500' },
  in_review: { label: 'In Review', color: 'bg-cta-50 text-cta-800 border-cta-500' },
  awarded: { label: 'Awarded', color: 'bg-info-bg text-info-text border-info' },
  completed: { label: 'Completed', color: 'bg-primary-100 text-primary-800 border-primary-500' },
  closed: { label: 'Closed', color: 'bg-neutral-100 text-neutral-600 border-neutral-400' },
};

export function InquiryCard({
  inquiryId,
  title,
  category,
  status,
  bidCount = 0,
  createdAt,
  deadline,
  totalAmount,
  onView,
  className,
}: InquiryCardProps) {
  const statusInfo = statusConfig[status] || statusConfig.draft;

  return (
    <Card hoverable padding="md" className={cn('group', className)} onClick={onView}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-mono text-xs text-neutral-400 mb-1">{inquiryId}</p>
          <h3 className="font-bold text-neutral-900 leading-snug">{title}</h3>
        </div>
        <span
          className={cn(
            'text-xs font-bold uppercase tracking-wider px-2 py-1 border-2 flex-shrink-0',
            statusInfo.color,
          )}
        >
          {statusInfo.label}
        </span>
      </div>

      <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
        {category}
      </p>

      <div className="flex items-center justify-between text-xs text-neutral-500">
        <div className="flex items-center gap-4">
          <span>{bidCount} bid{bidCount !== 1 ? 's' : ''}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {createdAt}
          </span>
          {deadline && (
            <span className="text-error-600 font-medium">Due: {deadline}</span>
          )}
        </div>
        {totalAmount !== undefined && (
          <span className="font-mono font-bold text-neutral-900">
            {'\u20B9'}{totalAmount.toLocaleString('en-IN')}
          </span>
        )}
      </div>
    </Card>
  );
}

// ============================================================
// Quote Card
// ============================================================
interface QuoteCardProps {
  dealerName: string;
  dealerRating?: number;
  verified?: boolean;
  price: number;
  deliveryDays?: number;
  score?: number;
  isWinning?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  className?: string;
}

export function QuoteCard({
  dealerName,
  dealerRating,
  verified = false,
  price,
  deliveryDays,
  score,
  isWinning = false,
  onAccept,
  onReject,
  className,
}: QuoteCardProps) {
  return (
    <Card
      padding="md"
      className={cn(
        isWinning && 'border-cta-500 border-2 bg-cta-50/30',
        className,
      )}
    >
      {isWinning && (
        <div className="bg-cta-500 text-navy text-xs font-bold uppercase tracking-wider px-3 py-1 -mt-5 -mx-5 mb-4 text-center border-b-2 border-navy">
          Best Quote
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-neutral-900">{dealerName}</h4>
            {verified && <CheckCircle className="w-4 h-4 text-success-500" />}
          </div>
          {dealerRating !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 text-cta-500 fill-cta-500" />
              <span className="text-xs font-medium">{dealerRating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="font-mono text-xl font-bold text-neutral-900">
            {'\u20B9'}{price.toLocaleString('en-IN')}
          </p>
          {deliveryDays !== undefined && (
            <p className="text-xs text-neutral-500 mt-0.5">
              {deliveryDays} day{deliveryDays !== 1 ? 's' : ''} delivery
            </p>
          )}
        </div>
      </div>

      {score !== undefined && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-neutral-500 font-medium">Match Score</span>
            <span className="font-bold text-neutral-900">{score}/100</span>
          </div>
          <div className="w-full h-2 bg-neutral-100 overflow-hidden">
            <div
              className="h-full bg-cta-500 transition-all duration-500"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      )}

      {(onAccept || onReject) && (
        <div className="flex gap-2 mt-4">
          {onAccept && (
            <button
              onClick={onAccept}
              className={cn(
                'flex-1 h-10 font-bold text-sm uppercase tracking-wide',
                'bg-cta-500 text-navy border-2 border-navy',
                'hover:shadow-brutal hover:-translate-y-0.5',
                'active:shadow-brutal-sm active:translate-x-[2px] active:translate-y-[2px]',
                'transition-all duration-200',
              )}
            >
              Accept
            </button>
          )}
          {onReject && (
            <button
              onClick={onReject}
              className={cn(
                'flex-1 h-10 font-bold text-sm uppercase tracking-wide',
                'bg-white text-neutral-700 border-2 border-neutral-300',
                'hover:border-neutral-900 hover:text-neutral-900',
                'transition-all duration-200',
              )}
            >
              Decline
            </button>
          )}
        </div>
      )}
    </Card>
  );
}

// ============================================================
// Stat Card
// ============================================================
interface StatCardProps {
  label: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  trend?: { value: number; isPositive: boolean };
  icon?: ReactNode;
  className?: string;
}

export function StatCard({
  label,
  value,
  prefix = '',
  suffix = '',
  trend,
  icon,
  className,
}: StatCardProps) {
  return (
    <Card padding="md" className={cn('group', className)}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          {label}
        </p>
        {icon && (
          <div className="w-10 h-10 bg-primary-50 flex items-center justify-center text-primary-700">
            {icon}
          </div>
        )}
      </div>
      <p className="font-mono text-2xl font-bold text-neutral-900">
        {prefix}
        {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
        {suffix}
      </p>
      {trend && (
        <div
          className={cn(
            'flex items-center gap-1 mt-2 text-xs font-bold',
            trend.isPositive ? 'text-success-text' : 'text-error-text',
          )}
        >
          <TrendingUp
            className={cn('w-3 h-3', !trend.isPositive && 'rotate-180')}
          />
          <span>{Math.abs(trend.value)}%</span>
          <span className="text-neutral-400 font-normal">vs last month</span>
        </div>
      )}
    </Card>
  );
}

// ============================================================
// Feature Card
// ============================================================
interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  href?: string;
  className?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  href,
  className,
}: FeatureCardProps) {
  const Wrapper = href ? 'a' : 'div';
  const wrapperProps = href ? { href } : {};

  return (
    <Card
      hoverable
      padding="lg"
      className={cn('group', className)}
    >
      <Wrapper {...wrapperProps} className="block">
        <div className="w-12 h-12 bg-cta-50 flex items-center justify-center text-cta-700 mb-4 group-hover:bg-cta-500 group-hover:text-navy transition-colors duration-200">
          {icon}
        </div>
        <h3 className="font-bold text-neutral-900 text-lg mb-2">{title}</h3>
        <p className="text-sm text-neutral-600 leading-relaxed">{description}</p>
      </Wrapper>
    </Card>
  );
}
