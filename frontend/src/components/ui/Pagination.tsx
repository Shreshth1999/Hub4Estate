import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// ============================================================
// Types
// ============================================================
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Total number of items (for "Showing X-Y of Z" text) */
  totalItems?: number;
  /** Items per page (for "Showing X-Y of Z" text) */
  pageSize?: number;
  /** Max visible page numbers before using ellipsis (default: 5) */
  maxVisible?: number;
  className?: string;
}

// ============================================================
// Page number generation
// ============================================================
function getPageNumbers(
  current: number,
  total: number,
  maxVisible: number,
): (number | 'ellipsis')[] {
  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [];
  const sideWidth = Math.floor((maxVisible - 3) / 2); // pages around current excluding first/last/ellipsis

  // Always show first page
  pages.push(1);

  let start = Math.max(2, current - sideWidth);
  let end = Math.min(total - 1, current + sideWidth);

  // Adjust if near the beginning
  if (current <= sideWidth + 2) {
    end = Math.min(total - 1, maxVisible - 2);
    start = 2;
  }

  // Adjust if near the end
  if (current >= total - sideWidth - 1) {
    start = Math.max(2, total - maxVisible + 3);
    end = total - 1;
  }

  if (start > 2) {
    pages.push('ellipsis');
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < total - 1) {
    pages.push('ellipsis');
  }

  // Always show last page
  if (total > 1) {
    pages.push(total);
  }

  return pages;
}

// ============================================================
// Pagination component
// ============================================================
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  maxVisible = 5,
  className,
}: PaginationProps) {
  const pages = useMemo(
    () => getPageNumbers(currentPage, totalPages, maxVisible),
    [currentPage, totalPages, maxVisible],
  );

  if (totalPages <= 1) return null;

  // "Showing X-Y of Z" calculation
  const showingText = useMemo(() => {
    if (totalItems === undefined || pageSize === undefined) return null;
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);
    return `Showing ${start}-${end} of ${totalItems}`;
  }, [currentPage, pageSize, totalItems]);

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-3',
        className,
      )}
    >
      {/* Showing text */}
      {showingText && (
        <p className="text-xs text-neutral-500 font-medium">{showingText}</p>
      )}

      {/* Page controls */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={cn(
            'w-9 h-9 flex items-center justify-center',
            'border border-neutral-200 text-neutral-600',
            'transition-colors duration-150',
            'min-w-[44px] min-h-[44px]',
            currentPage <= 1
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:border-neutral-900 hover:text-neutral-900',
          )}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        {pages.map((page, idx) => {
          if (page === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-9 h-9 flex items-center justify-center text-neutral-400 text-sm"
              >
                ...
              </span>
            );
          }

          const isActive = page === currentPage;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                'w-9 h-9 flex items-center justify-center text-sm font-bold',
                'transition-colors duration-150',
                'min-w-[44px] min-h-[44px]',
                isActive
                  ? 'bg-neutral-900 text-white border border-neutral-900'
                  : 'border border-neutral-200 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900',
              )}
              aria-label={`Page ${page}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={cn(
            'w-9 h-9 flex items-center justify-center',
            'border border-neutral-200 text-neutral-600',
            'transition-colors duration-150',
            'min-w-[44px] min-h-[44px]',
            currentPage >= totalPages
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:border-neutral-900 hover:text-neutral-900',
          )}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
