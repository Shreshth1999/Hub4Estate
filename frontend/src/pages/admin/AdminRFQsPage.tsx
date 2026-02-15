import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  FileText, Search, MapPin, Package, Clock, Users,
  MessageSquare, CheckCircle, XCircle, AlertCircle, Loader2
} from 'lucide-react';

interface RFQProduct {
  name: string;
}

interface RFQItem {
  id: string;
  quantity: number;
  product: RFQProduct;
}

interface RFQQuote {
  id: string;
}

interface RFQUser {
  name: string;
  email: string;
}

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

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface RFQResponse {
  rfqs: RFQ[];
  pagination: Pagination;
}

type StatusTab = 'ALL' | 'PUBLISHED' | 'QUOTES_RECEIVED' | 'DEALER_SELECTED' | 'COMPLETED' | 'CANCELLED';

const STATUS_TABS: { key: StatusTab; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'PUBLISHED', label: 'Published' },
  { key: 'QUOTES_RECEIVED', label: 'Quotes Received' },
  { key: 'DEALER_SELECTED', label: 'Dealer Selected' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

const statusStyles: Record<string, { bg: string; text: string }> = {
  PUBLISHED: { bg: 'bg-blue-100', text: 'text-blue-800' },
  QUOTES_RECEIVED: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  DEALER_SELECTED: { bg: 'bg-purple-100', text: 'text-purple-800' },
  COMPLETED: { bg: 'bg-green-100', text: 'text-green-800' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-800' },
};

function getStatusStyle(status: string) {
  return statusStyles[status] || { bg: 'bg-neutral-100', text: 'text-neutral-800' };
}

export function AdminRFQsPage() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusTab>('ALL');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, pages: 1 });
  const [stats, setStats] = useState({ total: 0, active: 0, totalQuotes: 0 });

  const fetchRFQs = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (activeTab !== 'ALL') {
        params.status = activeTab;
      }

      const res = await api.get<RFQResponse>('/admin/rfqs', { params });
      const data = res.data;
      setRfqs(data.rfqs);
      setPagination(data.pagination);

      // Calculate stats from the full dataset (when no filter)
      if (activeTab === 'ALL') {
        const totalQuotes = data.rfqs.reduce((sum, rfq) => sum + rfq.quotes.length, 0);
        const activeCount = data.rfqs.filter(
          (rfq) => rfq.status === 'PUBLISHED' || rfq.status === 'QUOTES_RECEIVED' || rfq.status === 'DEALER_SELECTED'
        ).length;
        setStats({
          total: data.pagination.total,
          active: activeCount,
          totalQuotes,
        });
      }
    } catch (err) {
      console.error('Failed to fetch RFQs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQs();
  }, [activeTab, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabChange = (tab: StatusTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-neutral-900">RFQ Management</h1>
        <p className="text-neutral-500 text-sm mt-1">
          View and manage all Request for Quotations across the platform.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border-2 border-neutral-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-900 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Total RFQs</p>
              <p className="text-2xl font-black text-neutral-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border-2 border-blue-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-blue-600 uppercase tracking-wider">Active RFQs</p>
              <p className="text-2xl font-black text-blue-900">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border-2 border-green-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-green-600 uppercase tracking-wider">Total Quotes</p>
              <p className="text-2xl font-black text-green-900">{stats.totalQuotes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2 text-sm font-bold transition-colors ${
              activeTab === tab.key
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* RFQ List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
        </div>
      ) : rfqs.length === 0 ? (
        <div className="text-center py-20 text-neutral-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No RFQs found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rfqs.map((rfq) => {
            const style = getStatusStyle(rfq.status);
            return (
              <div
                key={rfq.id}
                className="border-2 border-neutral-200 bg-white hover:border-neutral-400 transition-colors"
              >
                {/* Top row */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${style.bg} ${style.text}`}>
                      {rfq.status.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono text-sm font-bold text-neutral-900">
                      {rfq.id.slice(0, 8)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(rfq.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                {/* Main content */}
                <div className="px-5 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Title & User */}
                    <div className="md:col-span-2 space-y-2">
                      <h3 className="font-bold text-neutral-900 text-base">{rfq.title}</h3>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-neutral-400" />
                        <span className="text-sm text-neutral-700 font-medium">{rfq.user.name}</span>
                        <span className="text-xs text-neutral-400">{rfq.user.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-neutral-400" />
                        <span className="text-sm text-neutral-600">{rfq.deliveryCity}</span>
                      </div>
                    </div>

                    {/* Items Count */}
                    <div className="flex flex-col justify-center">
                      <div className="bg-neutral-50 border border-neutral-200 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="w-4 h-4 text-neutral-500" />
                          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Items</span>
                        </div>
                        <p className="text-xl font-black text-neutral-900">{rfq.items.length}</p>
                        {rfq.items.length > 0 && (
                          <p className="text-xs text-neutral-400 mt-1 truncate">
                            {rfq.items.map((item) => item.product.name).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quotes Count */}
                    <div className="flex flex-col justify-center">
                      <div className={`p-3 border ${
                        rfq.quotes.length > 0
                          ? 'bg-green-50 border-green-200'
                          : 'bg-amber-50 border-amber-200'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className={`w-4 h-4 ${
                            rfq.quotes.length > 0 ? 'text-green-500' : 'text-amber-500'
                          }`} />
                          <span className={`text-xs font-bold uppercase tracking-wider ${
                            rfq.quotes.length > 0 ? 'text-green-600' : 'text-amber-600'
                          }`}>
                            Quotes
                          </span>
                        </div>
                        <p className={`text-xl font-black ${
                          rfq.quotes.length > 0 ? 'text-green-800' : 'text-amber-800'
                        }`}>
                          {rfq.quotes.length}
                        </p>
                        <p className={`text-xs mt-1 ${
                          rfq.quotes.length > 0 ? 'text-green-600' : 'text-amber-500'
                        }`}>
                          {rfq.quotes.length > 0 ? 'Quotes received' : 'Awaiting quotes'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-500">
            Showing {(page - 1) * pagination.limit + 1}&ndash;{Math.min(page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-bold bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm font-medium text-neutral-600">
              Page {page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="px-4 py-2 text-sm font-bold bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
