// ============================================
// Search & Analytics Types
// ============================================

export interface SearchHistory {
  id: string;
  userId: string | null;
  query: string;
  /** JSON string of applied filters */
  filters: string | null;
  resultCount: number;
  /** Product or dealer ID that was clicked from results */
  clickedId: string | null;
  sessionId: string | null;
  createdAt: string;
}
