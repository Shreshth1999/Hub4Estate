import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../lib/store';
import { rfqApi } from '../../lib/api';
import {
  Loader2, AlertCircle, ChevronRight, FileText, IndianRupee,
  Clock, ArrowUpDown, CheckCircle2, Timer, XCircle, Star, Package,
} from 'lucide-react';

interface QuoteItem {
  id: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Quote {
  id: string;
  dealerAlias: string;
  totalAmount: number;
  deliveryDays: number | null;
  notes: string | null;
  status: string;
  createdAt: string;
  items?: QuoteItem[];
}

interface RFQWithQuotes {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  quotes: Quote[];
}

type SortKey = 'price-asc' | 'price-desc' | 'delivery' | 'newest';

const QUOTE_STATUS: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  PENDING:   { label: 'Pending',  color: 'text-amber-600',  bg: 'bg-amber-50',  icon: Timer },
  SELECTED:  { label: 'Selected', color: 'text-green-600',  bg: 'bg-green-50',  icon: CheckCircle2 },
  REJECTED:  { label: 'Expired',  color: 'text-gray-500',   bg: 'bg-gray-100',  icon: XCircle },
};

export function UserQuotesPage() {
  const { user } = useAuthStore();
  const [rfqsWithQuotes, setRfqsWithQuotes] = useState<RFQWithQuotes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('newest');
  const [expandedRfq, setExpandedRfq] = useState<string | null>(null);

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await rfqApi.getMyRFQs({ limit: 50 });
      const rfqs = res.data.rfqs || [];

      // Fetch details for RFQs that have quotes
      const rfqsWithQuoteData: RFQWithQuotes[] = [];
      for (const rfq of rfqs) {
        if (rfq._count?.quotes > 0 || rfq.status === 'QUOTES_RECEIVED' || rfq.status === 'QUOTE_SELECTED') {
          try {
            const detailRes = await rfqApi.getRFQ(rfq.id);
            const detail = detailRes.data.rfq || detailRes.data;
            const quotes = (detail.quotes || []).map((q: any, idx: number) => ({
              id: q.id,
              dealerAlias: `Dealer #${idx + 1}`,
              totalAmount: q.totalAmount || q.total || 0,
              deliveryDays: q.deliveryDays || q.estimatedDelivery || null,
              notes: q.notes || null,
              status: q.status || 'PENDING',
              createdAt: q.createdAt,
              items: q.items || [],
            }));

            if (quotes.length > 0) {
              rfqsWithQuoteData.push({
                id: rfq.id,
                title: rfq.title,
                status: rfq.status,
                createdAt: rfq.createdAt,
                quotes,
              });
            }
          } catch {
            // Skip if detail fetch fails
          }
        }
      }

      setRfqsWithQuotes(rfqsWithQuoteData);
    } catch {
      setError('Failed to load quotes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sortedRfqs = useMemo(() => {
    const sorted = [...rfqsWithQuotes];
    sorted.forEach(rfq => {
      rfq.quotes.sort((a, b) => {
        switch (sortBy) {
          case 'price-asc':
            return a.totalAmount - b.totalAmount;
          case 'price-desc':
            return b.totalAmount - a.totalAmount;
          case 'delivery':
            return (a.deliveryDays || 999) - (b.deliveryDays || 999);
          case 'newest':
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
    });
    return sorted;
  }, [rfqsWithQuotes, sortBy]);

  const totalQuotes = rfqsWithQuotes.reduce((sum, r) => sum + r.quotes.length, 0);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  const handleSelectQuote = async (rfqId: string, quoteId: string) => {
    try {
      await rfqApi.selectQuote(rfqId, quoteId);
      await loadQuotes();
    } catch {
      // Could show a toast here
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Quotes Received</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {totalQuotes > 0
                  ? `${totalQuotes} quote${totalQuotes !== 1 ? 's' : ''} across ${rfqsWithQuotes.length} request${rfqsWithQuotes.length !== 1 ? 's' : ''}`
                  : 'Dealer quotes for your requests'}
              </p>
            </div>

            {/* Sort control */}
            {totalQuotes > 0 && (
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as SortKey)}
                  className="text-sm text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                >
                  <option value="newest">Newest first</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="delivery">Fastest delivery</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-gray-300 mb-3" />
            <p className="text-sm text-gray-400">Loading quotes...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-8 h-8 text-red-300 mb-3" />
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : sortedRfqs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <IndianRupee className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">No quotes yet</p>
            <p className="text-xs text-gray-400 mb-5 max-w-sm text-center">
              Once you submit a request, verified dealers will compete to give you the best price. Quotes will appear here.
            </p>
            <Link
              to="/rfq/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
            >
              Create a Request
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {sortedRfqs.map(rfq => (
              <div key={rfq.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* RFQ Header */}
                <button
                  onClick={() => setExpandedRfq(expandedRfq === rfq.id ? null : rfq.id)}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{rfq.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(rfq.createdAt)} &middot; {rfq.quotes.length} quote{rfq.quotes.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      expandedRfq === rfq.id ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {/* Quotes List — always visible, expandable for more detail */}
                <div className={`border-t border-gray-100 ${expandedRfq === rfq.id ? '' : 'max-h-0 overflow-hidden'}`}>
                  <div className="divide-y divide-gray-50">
                    {rfq.quotes.map(quote => {
                      const qs = QUOTE_STATUS[quote.status] || QUOTE_STATUS.PENDING;
                      const StatusIcon = qs.icon;
                      return (
                        <div key={quote.id} className="px-4 py-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-gray-900">
                                  {quote.dealerAlias}
                                </p>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${qs.bg} ${qs.color}`}>
                                  <StatusIcon className="w-3 h-3" />
                                  {qs.label}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                                <div className="flex items-center gap-1.5">
                                  <IndianRupee className="w-3.5 h-3.5 text-gray-400" />
                                  <span className="text-sm font-semibold text-gray-900">
                                    {quote.totalAmount > 0
                                      ? `Rs. ${quote.totalAmount.toLocaleString('en-IN')}`
                                      : 'Price on request'}
                                  </span>
                                </div>
                                {quote.deliveryDays && (
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-xs text-gray-500">
                                      {quote.deliveryDays} day{quote.deliveryDays !== 1 ? 's' : ''} delivery
                                    </span>
                                  </div>
                                )}
                                <span className="text-xs text-gray-400">
                                  {formatDate(quote.createdAt)}
                                </span>
                              </div>

                              {quote.notes && (
                                <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg px-3 py-2">
                                  {quote.notes}
                                </p>
                              )}
                            </div>

                            {quote.status === 'PENDING' && rfq.status !== 'COMPLETED' && rfq.status !== 'CANCELLED' && (
                              <button
                                onClick={() => handleSelectQuote(rfq.id, quote.id)}
                                className="flex-shrink-0 px-4 py-2 bg-amber-500 text-white text-xs font-medium rounded-lg hover:bg-amber-600 transition-colors"
                              >
                                Select Quote
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Collapsed preview — show best price */}
                {expandedRfq !== rfq.id && rfq.quotes.length > 0 && (
                  <div className="border-t border-gray-100 px-4 py-2.5 bg-gray-50/50">
                    <p className="text-xs text-gray-500">
                      Best price:{' '}
                      <span className="font-semibold text-gray-900">
                        Rs. {Math.min(...rfq.quotes.map(q => q.totalAmount)).toLocaleString('en-IN')}
                      </span>
                      {rfq.quotes.length > 1 && (
                        <span className="text-gray-400">
                          {' '}&middot; {rfq.quotes.length} quotes &middot; Click to expand
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
