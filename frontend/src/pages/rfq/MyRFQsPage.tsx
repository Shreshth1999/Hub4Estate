import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rfqApi } from '../../lib/api';
import {
  FileText, Plus, ChevronRight, MapPin, CheckCircle, XCircle,
  MessageSquare, AlertCircle,
} from 'lucide-react';

type RFQStatus = 'all' | 'DRAFT' | 'PUBLISHED' | 'QUOTES_RECEIVED' | 'DEALER_SELECTED' | 'COMPLETED' | 'CANCELLED';

interface RFQ {
  id: string;
  title: string;
  status: string;
  deliveryCity: string;
  deliveryPincode: string;
  createdAt: string;
  _count?: { items: number; quotes: number };
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; color: string }> = {
  DRAFT:           { label: 'Draft',          dot: 'bg-gray-300',   color: 'text-gray-500' },
  PUBLISHED:       { label: 'Live',            dot: 'bg-blue-400',   color: 'text-blue-600' },
  QUOTES_RECEIVED: { label: 'Quotes ready',   dot: 'bg-amber-400',  color: 'text-amber-600' },
  DEALER_SELECTED: { label: 'In progress',    dot: 'bg-violet-400', color: 'text-violet-600' },
  COMPLETED:       { label: 'Completed',      dot: 'bg-green-400',  color: 'text-green-600' },
  CANCELLED:       { label: 'Cancelled',      dot: 'bg-red-300',    color: 'text-red-500' },
};

const TABS: { id: RFQStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'DRAFT', label: 'Draft' },
  { id: 'PUBLISHED', label: 'Live' },
  { id: 'QUOTES_RECEIVED', label: 'Quotes ready' },
  { id: 'COMPLETED', label: 'Completed' },
];

export function MyRFQsPage() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<RFQStatus>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setIsLoading(true);
    const params: any = { page, limit: 15 };
    if (activeTab !== 'all') params.status = activeTab;

    rfqApi.list(params)
      .then(res => {
        setRfqs(res.data.rfqs || []);
        setTotalPages(res.data.pagination?.pages || 1);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [activeTab, page]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  const filtered = activeTab === 'all' ? rfqs : rfqs.filter(r => r.status === activeTab);
  const tabCount = (id: RFQStatus) => id === 'all' ? rfqs.length : rfqs.filter(r => r.status === id).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">My RFQs</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track and manage your quote requests</p>
          </div>
          <Link
            to="/rfq/create"
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New RFQ
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 overflow-x-auto">
          {TABS.map(tab => {
            const count = tabCount(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setPage(1); }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
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

      <div className="px-6 py-6 max-w-3xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-14 text-center">
            <FileText className="w-8 h-8 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">No RFQs yet</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">
              {activeTab === 'all'
                ? 'Create your first RFQ to get quotes from verified dealers.'
                : `No RFQs with status "${STATUS_CONFIG[activeTab]?.label || activeTab}"`}
            </p>
            {activeTab === 'all' && (
              <Link
                to="/rfq/create"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Create RFQ
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(rfq => {
              const s = STATUS_CONFIG[rfq.status] || STATUS_CONFIG.DRAFT;
              const quotes = rfq._count?.quotes || 0;
              const hasQuotes = quotes > 0;
              return (
                <Link
                  key={rfq.id}
                  to={`/rfq/${rfq.id}`}
                  className={`flex items-center gap-3 px-4 py-4 bg-white rounded-xl border transition-all hover:shadow-sm ${
                    hasQuotes ? 'border-amber-200 hover:border-amber-300' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">{rfq.title}</p>
                      {hasQuotes && (
                        <span className="flex-shrink-0 text-[11px] font-medium bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full">
                          {quotes} quote{quotes !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      <MapPin className="inline w-3 h-3 mr-0.5" />
                      {rfq.deliveryCity}
                      {rfq._count?.items ? ` · ${rfq._count.items} item${rfq._count.items !== 1 ? 's' : ''}` : ''}
                      {' · '}{formatDate(rfq.createdAt)}
                    </p>
                  </div>
                  <span className={`text-xs font-medium flex-shrink-0 ${s.color}`}>{s.label}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-1 mt-6">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                  page === p
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
