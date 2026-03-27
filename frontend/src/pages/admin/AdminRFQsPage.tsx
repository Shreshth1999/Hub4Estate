import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  FileText, MapPin, Clock, Users,
  Loader2, Search,
} from 'lucide-react';

interface RFQProduct { name: string }
interface RFQItem { id: string; quantity: number; product: RFQProduct }
interface RFQQuote { id: string }
interface RFQUser { name: string; email: string }
interface RFQ {
  id: string;
  title: string;
  status: string;
  deliveryCity: string;
  createdAt: string;
  user: RFQUser;
  items: RFQItem[];
  quotes: RFQQuote[];
}
interface Pagination { total: number; page: number; limit: number; pages: number }
interface RFQResponse { rfqs: RFQ[]; pagination: Pagination }

type StatusTab = 'ALL' | 'PUBLISHED' | 'QUOTES_RECEIVED' | 'DEALER_SELECTED' | 'COMPLETED' | 'CANCELLED';

const STATUS_TABS: { key: StatusTab; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'PUBLISHED', label: 'Published' },
  { key: 'QUOTES_RECEIVED', label: 'Quotes Received' },
  { key: 'DEALER_SELECTED', label: 'Dealer Selected' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

const STATUS_CONFIG: Record<string, { dot: string; color: string; label: string }> = {
  PUBLISHED:       { dot: 'bg-blue-400',   color: 'text-blue-600',   label: 'Published' },
  QUOTES_RECEIVED: { dot: 'bg-amber-400',  color: 'text-amber-600',  label: 'Quotes Received' },
  DEALER_SELECTED: { dot: 'bg-purple-400', color: 'text-purple-600', label: 'Dealer Selected' },
  COMPLETED:       { dot: 'bg-green-400',  color: 'text-green-600',  label: 'Completed' },
  CANCELLED:       { dot: 'bg-red-400',    color: 'text-red-500',    label: 'Cancelled' },
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export function AdminRFQsPage() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusTab>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, pages: 1 });
  const [stats, setStats] = useState({ total: 0, active: 0, totalQuotes: 0 });

  const fetchRFQs = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (activeTab !== 'ALL') params.status = activeTab;
      if (search) params.search = search;

      const res = await api.get<RFQResponse>('/admin/rfqs', { params });
      setRfqs(res.data.rfqs);
      setPagination(res.data.pagination);

      if (activeTab === 'ALL') {
        const totalQuotes = res.data.rfqs.reduce((sum, rfq) => sum + rfq.quotes.length, 0);
        const activeCount = res.data.rfqs.filter(r =>
          ['PUBLISHED', 'QUOTES_RECEIVED', 'DEALER_SELECTED'].includes(r.status)
        ).length;
        setStats({ total: res.data.pagination.total, active: activeCount, totalQuotes });
      }
    } catch (err) {
      console.error('Failed to fetch RFQs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRFQs(); }, [activeTab, page, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabChange = (tab: StatusTab) => { setActiveTab(tab); setPage(1); };
  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchRFQs(); };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <h1 className="text-lg font-semibold text-gray-900">RFQ Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">View and manage all Request for Quotations across the platform.</p>

        {/* Stats inline */}
        {!loading && (
          <div className="flex items-center gap-5 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-semibold text-gray-900">{stats.total}</span>
              <span className="text-sm text-gray-400">total</span>
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-1.5">
              <span className="text-base font-semibold text-blue-600">{stats.active}</span>
              <span className="text-sm text-gray-400">active</span>
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-1.5">
              <span className="text-base font-semibold text-green-600">{stats.totalQuotes}</span>
              <span className="text-sm text-gray-400">quotes</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 mt-4">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-6 max-w-5xl mx-auto">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, user name, email, or city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-white rounded-lg focus:border-gray-400 outline-none text-sm transition-colors"
            />
          </div>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); setPage(1); }}
              className="px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:border-gray-400 transition-colors bg-white"
            >
              Clear
            </button>
          )}
        </form>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : rfqs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-14 text-center">
            <FileText className="w-8 h-8 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">No RFQs found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rfqs.map(rfq => {
              const s = STATUS_CONFIG[rfq.status] || { dot: 'bg-gray-300', color: 'text-gray-500', label: rfq.status };
              return (
                <div key={rfq.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Top row */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      <span className={`text-xs font-medium ${s.color}`}>{s.label}</span>
                      <span className="text-xs text-gray-300 mx-1">·</span>
                      <span className="font-mono text-xs text-gray-400">{rfq.id.slice(0, 8)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {fmtDate(rfq.createdAt)}
                    </div>
                  </div>

                  {/* Main content */}
                  <div className="px-4 py-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900">{rfq.title}</h3>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" /> {rfq.user.name}
                            <span className="text-gray-300">·</span>
                            {rfq.user.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {rfq.deliveryCity}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-center">
                          <p className="text-sm font-semibold text-gray-900">{rfq.items.length}</p>
                          <p className="text-[11px] text-gray-400">items</p>
                        </div>
                        <div className="w-px h-8 bg-gray-100" />
                        <div className="text-center">
                          <p className={`text-sm font-semibold ${rfq.quotes.length > 0 ? 'text-green-600' : 'text-amber-600'}`}>
                            {rfq.quotes.length}
                          </p>
                          <p className="text-[11px] text-gray-400">quotes</p>
                        </div>
                      </div>
                    </div>
                    {rfq.items.length > 0 && (
                      <p className="text-xs text-gray-400 mt-2 truncate">
                        {rfq.items.map(item => item.product.name).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-400">
              {(page - 1) * pagination.limit + 1}–{Math.min(page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3.5 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <span className="px-3.5 py-1.5 text-sm text-gray-500">
                {page} / {pagination.pages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-3.5 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
