import { cn } from '@/lib/utils/cn';

// ============================================================
// Types
// ============================================================
export type SkeletonVariant = 'text' | 'card' | 'avatar' | 'table-row';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
  /** Number of skeleton items to render */
  count?: number;
  /** Width override (e.g. '80%', '200px') */
  width?: string;
  /** Number of text lines (only for variant="text") */
  lines?: number;
  /** Number of table columns (only for variant="table-row") */
  columns?: number;
  /** Avatar size in px (only for variant="avatar") */
  avatarSize?: number;
}

// ============================================================
// Base shimmer block
// ============================================================
function Shimmer({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn(
        'bg-neutral-200 animate-shimmer rounded-sm',
        'bg-[length:400%_100%]',
        'bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200',
        className,
      )}
      style={style}
    />
  );
}

// ============================================================
// Text variant — renders one or more shimmer lines
// ============================================================
function TextSkeleton({
  lines = 3,
  width,
  className,
}: {
  lines?: number;
  width?: string;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2.5', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Shimmer
          key={i}
          className="h-4"
          style={{
            width:
              width ||
              (i === lines - 1 && lines > 1 ? '60%' : '100%'),
          }}
        />
      ))}
    </div>
  );
}

// ============================================================
// Card variant
// ============================================================
function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-white border border-neutral-200 rounded-2xl overflow-hidden',
        className,
      )}
    >
      <Shimmer className="w-full aspect-video rounded-none" />
      <div className="p-5 space-y-3">
        <Shimmer className="h-4 w-2/5" />
        <Shimmer className="h-4 w-4/5" />
        <Shimmer className="h-4 w-3/5" />
        <div className="pt-2">
          <Shimmer className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Avatar variant (circle)
// ============================================================
function AvatarSkeleton({
  size = 48,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Shimmer
      className={cn('rounded-full flex-shrink-0', className)}
      style={{ width: size, height: size }}
    />
  );
}

// ============================================================
// Table row variant
// ============================================================
function TableRowSkeleton({
  columns = 4,
  className,
}: {
  columns?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 py-4 px-5 border-b border-neutral-100',
        className,
      )}
    >
      <Shimmer className="w-5 h-5 flex-shrink-0" />
      {Array.from({ length: columns }).map((_, i) => (
        <Shimmer
          key={i}
          className="h-4 flex-1"
          style={{ maxWidth: i === 0 ? '30%' : `${Math.max(10, 25 - i * 4)}%` }}
        />
      ))}
    </div>
  );
}

// ============================================================
// Convenience Skeleton component
// ============================================================
export function Skeleton({
  variant = 'text',
  className,
  count = 1,
  width,
  lines = 3,
  columns = 4,
  avatarSize = 48,
}: SkeletonProps) {
  const items = Array.from({ length: count });

  const renderItem = (key: number) => {
    switch (variant) {
      case 'text':
        return <TextSkeleton key={key} lines={lines} width={width} className={className} />;
      case 'card':
        return <CardSkeleton key={key} className={className} />;
      case 'avatar':
        return <AvatarSkeleton key={key} size={avatarSize} className={className} />;
      case 'table-row':
        return <TableRowSkeleton key={key} columns={columns} className={className} />;
      default:
        return <TextSkeleton key={key} lines={lines} width={width} className={className} />;
    }
  };

  if (count === 1) return renderItem(0);

  return (
    <div className="space-y-3">
      {items.map((_, i) => renderItem(i))}
    </div>
  );
}
