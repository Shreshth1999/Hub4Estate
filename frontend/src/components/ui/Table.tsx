import {
  useState,
  useCallback,
  useMemo,
  type ReactNode,
  type Key,
} from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import { Pagination } from './Pagination';

// ============================================================
// Types
// ============================================================
export type SortDirection = 'asc' | 'desc' | null;

export interface TableColumn<T> {
  /** Unique key for the column, used as the property accessor */
  key: string;
  /** Display header text */
  header: string;
  /** Whether this column is sortable */
  sortable?: boolean;
  /** Custom render function for cell content */
  render?: (row: T, index: number) => ReactNode;
  /** Header alignment */
  headerAlign?: 'left' | 'center' | 'right';
  /** Cell alignment */
  align?: 'left' | 'center' | 'right';
  /** Column width (e.g. '200px', '25%') */
  width?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  /** Unique key extractor for each row */
  rowKey: (row: T) => Key;
  /** Enable row selection with checkboxes */
  selectable?: boolean;
  /** Currently selected row keys */
  selectedKeys?: Set<Key>;
  /** Callback when selection changes */
  onSelectionChange?: (selected: Set<Key>) => void;
  /** Sort state */
  sortColumn?: string;
  sortDirection?: SortDirection;
  onSort?: (column: string, direction: SortDirection) => void;
  /** Pagination */
  pageSize?: number;
  currentPage?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  /** Loading state */
  isLoading?: boolean;
  loadingRows?: number;
  /** Empty state */
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  /** Styling */
  className?: string;
}

// ============================================================
// Alignment helpers
// ============================================================
const alignClass = (align?: 'left' | 'center' | 'right') => {
  switch (align) {
    case 'center':
      return 'text-center';
    case 'right':
      return 'text-right';
    default:
      return 'text-left';
  }
};

// ============================================================
// Table component
// ============================================================
export function Table<T>({
  columns,
  data,
  rowKey,
  selectable = false,
  selectedKeys,
  onSelectionChange,
  sortColumn,
  sortDirection,
  onSort,
  pageSize,
  currentPage = 1,
  totalItems,
  onPageChange,
  isLoading = false,
  loadingRows = 5,
  emptyTitle = 'No data',
  emptyDescription = 'There are no items to display.',
  emptyAction,
  className,
}: TableProps<T>) {
  const [internalSelected, setInternalSelected] = useState<Set<Key>>(new Set());

  const selected = selectedKeys ?? internalSelected;
  const setSelected = onSelectionChange ?? setInternalSelected;

  const total = totalItems ?? data.length;

  // Determine visible data for pagination
  const visibleData = useMemo(() => {
    if (onPageChange) {
      // Externally paginated — show all data passed in
      return data;
    }
    if (pageSize) {
      const start = (currentPage - 1) * pageSize;
      return data.slice(start, start + pageSize);
    }
    return data;
  }, [data, pageSize, currentPage, onPageChange]);

  const totalPages = pageSize ? Math.ceil(total / pageSize) : 1;

  // Selection handlers
  const allSelected =
    visibleData.length > 0 &&
    visibleData.every((row) => selected.has(rowKey(row)));

  const someSelected =
    visibleData.some((row) => selected.has(rowKey(row))) && !allSelected;

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      const next = new Set(selected);
      visibleData.forEach((row) => next.delete(rowKey(row)));
      setSelected(next);
    } else {
      const next = new Set(selected);
      visibleData.forEach((row) => next.add(rowKey(row)));
      setSelected(next);
    }
  }, [allSelected, selected, visibleData, rowKey, setSelected]);

  const handleSelectRow = useCallback(
    (key: Key) => {
      const next = new Set(selected);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      setSelected(next);
    },
    [selected, setSelected],
  );

  // Sort handler
  const handleSort = useCallback(
    (colKey: string) => {
      if (!onSort) return;
      if (sortColumn === colKey) {
        if (sortDirection === 'asc') {
          onSort(colKey, 'desc');
        } else if (sortDirection === 'desc') {
          onSort(colKey, null);
        } else {
          onSort(colKey, 'asc');
        }
      } else {
        onSort(colKey, 'asc');
      }
    },
    [sortColumn, sortDirection, onSort],
  );

  // Cell value accessor
  const getCellValue = (row: T, key: string): ReactNode => {
    const value = (row as Record<string, unknown>)[key];
    if (value === null || value === undefined) return '-';
    return String(value);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('bg-white border border-neutral-200 rounded-2xl overflow-hidden', className)}>
        {/* Header skeleton */}
        <div className="flex items-center gap-4 px-5 py-3 border-b border-neutral-200 bg-[#faf9f7]">
          {selectable && <Skeleton variant="text" lines={1} className="w-5" />}
          {columns.map((col) => (
            <div key={col.key} className="flex-1">
              <Skeleton variant="text" lines={1} />
            </div>
          ))}
        </div>
        <Skeleton variant="table-row" count={loadingRows} columns={columns.length} />
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className={className}>
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      </div>
    );
  }

  return (
    <div className={cn('bg-white border border-neutral-200 rounded-2xl overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Head */}
          <thead>
            <tr className="border-b border-neutral-200 bg-[#faf9f7]">
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-neutral-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-5 py-3 text-xs font-bold uppercase tracking-wider text-neutral-500',
                    alignClass(col.headerAlign || col.align),
                    col.sortable && 'cursor-pointer select-none hover:text-neutral-900',
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <span className="inline-flex flex-col -space-y-1">
                        {sortColumn === col.key && sortDirection === 'asc' ? (
                          <ChevronUp className="w-3.5 h-3.5 text-neutral-900" />
                        ) : sortColumn === col.key && sortDirection === 'desc' ? (
                          <ChevronDown className="w-3.5 h-3.5 text-neutral-900" />
                        ) : (
                          <ChevronsUpDown className="w-3.5 h-3.5 text-neutral-300" />
                        )}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {visibleData.map((row, idx) => {
              const key = rowKey(row);
              const isSelected = selected.has(key);

              return (
                <tr
                  key={String(key)}
                  className={cn(
                    'border-b border-neutral-100 transition-colors duration-100',
                    isSelected
                      ? 'bg-amber-50'
                      : 'hover:bg-neutral-50',
                  )}
                >
                  {selectable && (
                    <td className="w-12 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(key)}
                        className="w-4 h-4 rounded border-neutral-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        aria-label={`Select row ${idx + 1}`}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-5 py-3 text-sm text-neutral-700',
                        alignClass(col.align),
                      )}
                    >
                      {col.render
                        ? col.render(row, idx)
                        : getCellValue(row, col.key)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      {pageSize && totalPages > 1 && (
        <div className="px-5 py-3 border-t border-neutral-200 bg-[#faf9f7]">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={total}
            pageSize={pageSize}
            onPageChange={onPageChange ?? (() => {})}
          />
        </div>
      )}
    </div>
  );
}
