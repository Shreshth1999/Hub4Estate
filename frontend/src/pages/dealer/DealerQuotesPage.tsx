import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quotesApi } from '../../lib/api';
import {
  FileText, MapPin, Clock, ChevronRight, CheckCircle,
  XCircle, Clock4,
} from 'lucide-react';

interface Quote {
  id: string;
  status: string;
  totalAmount: number;
  deliveryDate: string | null;
  createdAt: string;
  lossReason: string | null;
  rfq: {
    id: string;
    title: string;
    deliveryCity: string;
  };
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; color: string }> = {
  SUBMITTED: { label: 'Pending',   dot: 'bg-amber-400',  color: 'text-amber-600' },
  SELECTED:  { label: 'Won',       dot: 'bg-green-400',  color: 'text-green-600' },
  REJECTED:  { label: 'Lost',      dot: 'bg-red-300',    color: 'text-red-500' },
  EXPIRED:   { label: 'Expired',   dot: 'bg-gray-300',   color: 'text-gray-400' },
  WITHDRAWN: { label: 'Withdrawn', dot: 'bg-gray-300',   color: 'text-gray-400' },
};

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'SUBMITTED', label: 'Pending' },
  { id: 'SELECTED', label: 'Won' },
  { id: 'REJECTED', label: 'Lost' },
];

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

export function DealerQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [summary, setSummary] = useState({ total: 0, won: 0, lost: 0, pending: 0 });

  useEffect(() => {
    quotesApi.getMyQuotes({ page: 1, limit: 50 })
      .then(res => {
        const list = res.data.quotes || [];
        setQuotes(list);
        setSummary({
          total: list.length,
          won: list.filter((q: Quote) => q.status === 'SELECTED').length,
          lost: list.filter((q: Quote) => q.status === 'REJECTED').length,
          pending: list.filter((q: Quote) => q.status === 'SUBMITTED').length,
        });
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = activeTab === 'all' ? quotes : quotes.filter(q => q.status === activeTab);
  const tabCount = (id: string) => id === 'all' ? quotes.length : quotes.filter(q => q.status === id).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">My Quotes</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track quotes you've submitted</p>
          </div>
          <Link
            to="/dealer/rfqs"
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Browse RFQs
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
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {tabCount(tab.id)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-6 max-w-3xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-14 text-center">
            <FileText className="w-8 h-8 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">No quotes found</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">
              {activeTab === 'all'
                ? 'Submit quotes on available RFQs to start winning deals.'
                : `No quotes with status "${STATUS_CONFIG[activeTab]?.label || activeTab}"`}
            </p>
            {activeTab === 'all' && (
              <Link
                to="/dealer/rfqs"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Browse RFQs
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(quote => {
              const s = STATUS_CONFIG[quote.status] || STATUS_CONFIG.SUBMITTED;
              return (
                <div
                  key={quote.id}
                  className={`bg-white rounded-xl border p-4 ${
                    quote.status === 'SELECTED' ? 'border-green-200' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{quote.rfq.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        <MapPin className="inline w-3 h-3 mr-0.5" />
                        {quote.rfq.deliveryCity}
                        {' · '}{fmtDate(quote.createdAt)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-900">{fmtCurrency(quote.totalAmount)}</p>
                      <p className={`text-xs font-medium ${s.color}`}>{s.label}</p>
                    </div>
                  </div>

                  {quote.status === 'SELECTED' && (
                    <div className="mt-3 pt-3 border-t border-green-100 flex items-center gap-1.5 text-xs text-green-700">
                      <CheckCircle className="w-3.5 h-3.5" />
                      You won this quote. The buyer will contact you.
                    </div>
                  )}
                  {quote.lossReason && (
                    <div className="mt-2 text-xs text-red-500">
                      Loss reason: {quote.lossReason}
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
