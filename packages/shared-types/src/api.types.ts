// ============================================
// API Response & Utility Types
// ============================================

/** Standard API success response wrapper */
export interface ApiResponse<T> {
  success: true;
  data: T;
  /** Optional message for the client, e.g. "Dealer verified successfully" */
  message?: string;
  /** ISO 8601 timestamp of the response */
  timestamp: string;
}

/** Paginated API response with cursor-based pagination */
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    /** Total number of matching records */
    total: number;
    /** Number of records in this page */
    count: number;
    /** Maximum records per page */
    limit: number;
    /** Current page offset (0-based) */
    offset: number;
    /** Whether more pages exist */
    hasMore: boolean;
    /** Cursor for the next page (null if no more pages) */
    nextCursor: string | null;
    /** Cursor for the previous page (null if first page) */
    prevCursor: string | null;
  };
  timestamp: string;
}

/** Standard API error response */
export interface ApiError {
  success: false;
  error: {
    /** Machine-readable error code, e.g. "VALIDATION_ERROR", "NOT_FOUND" */
    code: string;
    /** Human-readable error message */
    message: string;
    /** Field-level validation errors */
    details?: ApiValidationError[];
    /** Stack trace (only in development) */
    stack?: string;
  };
  timestamp: string;
}

/** Individual field validation error */
export interface ApiValidationError {
  /** Field path, e.g. "body.email" or "query.page" */
  field: string;
  /** Human-readable error message for this field */
  message: string;
  /** The invalid value that was received */
  received?: unknown;
}

/** Pagination query parameters accepted by list endpoints */
export interface PaginationParams {
  /** Number of records to return (default 20, max 100) */
  limit?: number;
  /** Number of records to skip (0-based offset) */
  offset?: number;
  /** Cursor for cursor-based pagination */
  cursor?: string;
  /** Field to sort by */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/** Common filter parameters for search/list endpoints */
export interface SearchParams extends PaginationParams {
  /** Full-text search query */
  q?: string;
  /** Filter by city */
  city?: string;
  /** Filter by status */
  status?: string;
  /** Filter records created after this ISO date */
  createdAfter?: string;
  /** Filter records created before this ISO date */
  createdBefore?: string;
}
