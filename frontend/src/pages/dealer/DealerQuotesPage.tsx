import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quotesApi } from '../../lib/api';
import {
  FileText, MapPin, CheckCircle, XCircle, ChevronDown, ChevronUp,
  Clock, Edit3, IndianRupee, Calendar, Send, Loader2, Package,
  AlertCircle, Trophy,
} from 'lucide-react';

interface QuoteItem {
  id: string;
  productName?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
}

interface Quote {
  id: string;
  status: string;
  totalAmount: number;
  deliveryDate: string | null;
  createdAt: string;
  lossReason: string | null;
  notes?: string;
  items?: QuoteItem[];
  rfq: {
    id: string;
    title: string;
    deliveryCity: string;
    status?: string;
  };
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; color: string; bg: string }> = {
  SUBMITTED: { label: 'Pending',   dot: 'bg-amber-400',  color: 'text-amber-600', bg: 'bg-amber-50' },
  SELECTED:  { label: 'Won',       dot: 'bg-green-400',  color: 'text-green-600', bg: 'bg-green-50' },
  REJECTED:  { label: 'Lost',      dot: 'bg-red-300',    color: 'text-red-500', bg: 'bg-red-50' },
  EXPIRED:   { label: 'Expired',   dot: 'bg-gray-300',   color: 'text-gray-400', bg: 'bg-gray-50' },
  WITHDRAWN: { label: 'Withdrawn', dot: 'bg-gray-300',   color: 'text-gray-400', bg: 'bg-gray-50' },
};

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'SUBMITTED', label: 'Pending' },
  { id: 'SELECTED', label: 'Won' },
  { id: 'REJECTED', label: 'Lost' },
  { id: 'EXPIRED', label: 'Expired' },
];

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const fmtDateShort = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

export function DealerQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedQuote, setExpandedQuote] = useState<string | null>(null);
  const [summary, setSummary] = useState({ total: 0, won: 0, lost: 0, pending: 0, expired: 0 });

  useEffect(() => {
    quotesApi.getMyQuotes({ page: 1, limit: 100 })
      .then(res => {
        const list: Quote[] = res.data.quotes || [];
        setQuotes(list);
        setSummary({
          total: list.length,
          won: list.filter(q => q.status === 'SELECTED').length,
          lost: list.filter(q => q.status === 'REJECTED').length,
          pending: list.filter(q => q.status === 'SUBMITTED').length,
          expired: list.filter(q => q.status === 'EXPIRED').length,
        });
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = activeTab === 'all' ? quotes : quotes.filter(q => q.status === activeTab);
  const tabCount = (id: string) => id === 'all' ? quotes.length : quotes.filter(q => q.status === id).length;

  const toggleExpand = (id: string) => {
    setExpandedQuote(prev => prev === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">My Quotes</h1>
              <p className="text-sm text-gray-500 mt-0.5">Track quotes you&apos;ve submitted</p>
            </div>
            <Link
              to="/dealer/inquiries/available"
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              New Quote
            </Link>
          </div>

          {/* Stats row */}
          {!isLoading && summary.total > 0 && (
            <div className="flex items-center gap-5 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-semibold text-gray-900">{summary.total}</span>
                <span className="text-sm text-gray-400">total</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-1.5">
                <span className="text-base font-semibold text-green-600">{summary.won}</span>
                <span className="text-sm text-gray-400">won</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-1.5">
                <span className="text-base font-semibold text-amber-600">{summary.pending}</span>
                <span className="text-sm text-gray-400">pending</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-1.5">
                <span className="text-base font-semibold text-red-500">{summary.lost}</span>
                <span className="text-sm text-gray-400">lost</span>
              </div>
              {summary.expired > 0 && (
                <>
                  <div className="w-px h-4 bg-gray-200" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-semibold text-gray-400">{summary.expired}</span>
                    <span className="text-sm text-gray-400">expired</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto">
            {TABS.map(tab => {
              const count = tabCount(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                  <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-6 py-6 max-w-3xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-14 text-center">
            <FileText className="w-8 h-8 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">No quotes found</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">
              {activeTab === 'all'
                ? 'Submit quotes on available inquiries to start winning deals.'
                : `No quotes with status "${STATUS_CONFIG[activeTab]?.label || activeTab}"`}
            </p>
            {activeTab === 'all' && (
              <Link
                to="/dealer/inquiries/available"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
              >
                Browse Inquiries
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(quote => {
              const s = STATUS_CONFIG[quote.status] || STATUS_CONFIG.SUBMITTED;
              const isExpanded = expandedQuote === quote.id;
              const isWon = quote.status === 'SELECTED';

              return (
                <div
                  key={quote.id}
                  className={`bg-white rounded-xl border overflow-hidden transition-all ${
                    isWon ? 'border-green-200 ring-1 ring-green-100' : 'border-gray-200'
                  }`}
                >
                  {/* Main row */}
                  <div
                    className={`p-4 cursor-pointer hover:bg-gray-50/50 transition-colors ${isWon ? 'bg-green-50/30' : ''}`}
                    onClick={() => toggleExpand(quote.id)}
                  >
                    <div className="flex items-center gap-3">
                      {isWon && (
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Trophy className="w-4 h-4 text-green-600" />
                        </div>
                      )}
                      {!isWon && (
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{quote.rfq.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {quote.rfq.deliveryCity}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {fmtDateShort(quote.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 flex items-center gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{fmtCurrency(quote.totalAmount)}</p>
                          <span className={`inline-flex items-center gap-1 text-xs font-medium ${s.color}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                            {s.label}
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <div className="pt-3 space-y-3">
                        {/* Quote Details */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div>
                            <p className="text-xs text-gray-400">Amount</p>
                            <p className="text-sm font-semibold text-gray-900">{fmtCurrency(quote.totalAmount)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Status</p>
                            <p className={`text-sm font-medium ${s.color}`}>{s.label}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Submitted</p>
                            <p className="text-sm font-medium text-gray-900">{fmtDate(quote.createdAt)}</p>
                          </div>
                          {quote.deliveryDate && (
                            <div>
                              <p className="text-xs text-gray-400">Delivery Date</p>
                              <p className="text-sm font-medium text-gray-900">{fmtDate(quote.deliveryDate)}</p>
                            </div>
                          )}
                        </div>

                        {/* Quote Items */}
                        {quote.items && quote.items.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-400 mb-2">Items Breakdown</p>
                            <div className="bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-200">
                              {quote.items.map((item, idx) => (
                                <div key={item.id || idx} className="flex items-center justify-between px-3 py-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Package className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-gray-700">{item.productName || `Item ${idx + 1}`}</span>
                                    {item.quantity && <span className="text-xs text-gray-400">x{item.quantity}</span>}
                                  </div>
                                  {item.totalPrice && (
                                    <span className="font-medium text-gray-900">{fmtCurrency(item.totalPrice)}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {quote.notes && (
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Your Notes</p>
                            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100">{quote.notes}</p>
                          </div>
                        )}

                        {/* Won message */}
                        {isWon && (
                          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <p className="text-sm text-green-700 font-medium">You won this quote. The buyer will contact you to finalize the order.</p>
                          </div>
                        )}

                        {/* Loss reason */}
                        {quote.lossReason && (
                          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                            <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-red-600">Loss reason</p>
                              <p className="text-sm text-red-500">{quote.lossReason}</p>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        {quote.status === 'SUBMITTED' && (
                          <div className="flex items-center gap-2 pt-1">
                            <Link
                              to={`/dealer/rfqs/${quote.rfq.id}/quote`}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-gray-400 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Edit Quote
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
