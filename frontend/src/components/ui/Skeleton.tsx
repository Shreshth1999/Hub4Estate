import { cn } from '@/lib/utils/cn';

// ============================================================
// Base shimmer bar
// ============================================================
interface SkeletonBaseProps {
  className?: string;
}

function SkeletonPulse({ className }: SkeletonBaseProps) {
  return (
    <div
      className={cn(
        'bg-neutral-200 animate-shimmer',
        'bg-[length:400%_100%]',
        'bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200',
        className,
      )}
    />
  );
}

// ============================================================
// Text — single line of text
// ============================================================
export function SkeletonText({
  width = '100%',
  className,
}: SkeletonBaseProps & { width?: string }) {
  return (
    <SkeletonPulse
      className={cn('h-4 rounded-sm', className)}
      style-width={width}
    />
  );
}

// Re-implement with inline style so width prop works
export function TextSkeleton({
  width = '100%',
  className,
}: { width?: string; className?: string }) {
  return (
    <div
      className={cn(
        'h-4 rounded-sm bg-neutral-200 animate-shimmer',
        'bg-[length:400%_100%]',
        'bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200',
        className,
      )}
      style={{ width }}
    />
  );
}

// ============================================================
// Text Paragraph — multiple lines simulating a paragraph
// ============================================================
export function ParagraphSkeleton({
  lines = 3,
  className,
}: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2.5', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <TextSkeleton
          key={i}
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}

// ============================================================
// Avatar — square or circle placeholder
// ============================================================
export function AvatarSkeleton({
  size = 48,
  rounded = false,
  className,
}: { size?: number; rounded?: boolean; className?: string }) {
  return (
    <SkeletonPulse
      className={cn(
        rounded ? 'rounded-full' : '',
        className,
      )}
    />
  );
}

// We need a wrapper because SkeletonPulse uses className, but we need inline size
export function AvatarSkeletonSized({
  size = 48,
  rounded = false,
  className,
}: { size?: number; rounded?: boolean; className?: string }) {
  return (
    <div
      className={cn(
        'bg-neutral-200 animate-shimmer flex-shrink-0',
        'bg-[length:400%_100%]',
        'bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200',
        rounded ? 'rounded-full' : '',
        className,
      )}
      style={{ width: size, height: size }}
    />
  );
}

// ============================================================
// Card — full card skeleton
// ============================================================
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white border-2 border-neutral-200 overflow-hidden', className)}>
      {/* Image placeholder */}
      <SkeletonPulse className="w-full aspect-square" />
      {/* Content */}
      <div className="p-4 space-y-3">
        <TextSkeleton width="40%" />
        <TextSkeleton width="80%" />
        <TextSkeleton width="50%" />
        <div className="pt-2">
          <SkeletonPulse className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Table Row — single row placeholder
// ============================================================
export function TableRowSkeleton({
  columns = 4,
  className,
}: { columns?: number; className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 py-4 px-5 border-b border-neutral-100',
        className,
      )}
    >
      {/* Checkbox-like placeholder */}
      <SkeletonPulse className="w-5 h-5 flex-shrink-0" />
      {/* Dynamic columns */}
      {Array.from({ length: columns }).map((_, i) => (
        <TextSkeleton
          key={i}
          width={i === 0 ? '30%' : `${Math.max(10, 25 - i * 4)}%`}
          className="flex-1"
        />
      ))}
    </div>
  );
}

// ============================================================
// Stat — metric box placeholder
// ============================================================
export function StatSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white border-2 border-neutral-200 p-5', className)}>
      <TextSkeleton width="50%" className="h-3 mb-4" />
      <SkeletonPulse className="h-8 w-2/3 mb-2" />
      <TextSkeleton width="40%" className="h-3" />
    </div>
  );
}

// ============================================================
// Convenience component that renders any variant by name
// ============================================================
export type SkeletonVariant = 'text' | 'paragraph' | 'avatar' | 'card' | 'table-row' | 'stat';

export function Skeleton({
  variant = 'text',
  className,
  count = 1,
}: {
  variant?: SkeletonVariant;
  className?: string;
  count?: number;
}) {
  const items = Array.from({ length: count });

  const renderItem = (key: number) => {
    switch (variant) {
      case 'text':
        return <TextSkeleton key={key} className={className} />;
      case 'paragraph':
        return <ParagraphSkeleton key={key} className={className} />;
      case 'avatar':
        return <AvatarSkeletonSized key={key} className={className} />;
      case 'card':
        return <CardSkeleton key={key} className={className} />;
      case 'table-row':
        return <TableRowSkeleton key={key} className={className} />;
      case 'stat':
        return <StatSkeleton key={key} className={className} />;
      default:
        return <TextSkeleton key={key} className={className} />;
    }
  };

  if (count === 1) return renderItem(0);

  return (
    <div className="space-y-3">
      {items.map((_, i) => renderItem(i))}
    </div>
  );
}
