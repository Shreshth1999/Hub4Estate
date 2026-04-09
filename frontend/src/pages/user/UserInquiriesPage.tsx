import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../lib/store';
import { inquiryApi } from '../../lib/api';
import {
  Search, Plus, Package, Clock, CheckCircle, MessageSquare,
  Loader2, AlertCircle, Filter, ChevronRight, FileText, XCircle,
} from 'lucide-react';

interface Inquiry {
  id: string;
  inquiryNumber: string | null;
  name: string;
  phone: string;
  modelNumber: string | null;
  quantity: number;
  deliveryCity: string;
  productPhoto: string | null;
  status: string;
  notes: string | null;
  quotedPrice: number | null;
  shippingCost: number | null;
  totalPrice: number | null;
  estimatedDelivery: string | null;
  responseNotes: string | null;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; color: string; bg: string }> = {
  new:       { label: 'Open',        dot: 'bg-blue-400',   color: 'text-blue-600',   bg: 'bg-blue-50' },
  contacted: { label: 'In Progress', dot: 'bg-amber-400',  color: 'text-amber-600',  bg: 'bg-amber-50' },
  quoted:    { label: 'Quoted',      dot: 'bg-green-400',  color: 'text-green-600',  bg: 'bg-green-50' },
  closed:    { label: 'Closed',      dot: 'bg-gray-300',   color: 'text-gray-500',   bg: 'bg-gray-100' },
};

type TabKey = 'all' | 'new' | 'quoted' | 'closed';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'Open' },
  { key: 'quoted', label: 'Quoted' },
  { key: 'closed', label: 'Closed' },
];

export function UserInquiriesPage() {
  const { user } = useAuthStore();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  useEffect(() => {
    if (!user?.phone) {
      setIsLoading(false);
      return;
    }

    inquiryApi.track({ phone: user.phone })
      .then(res => {
        setInquiries(res.data.inquiries || []);
      })
      .catch(() => {
        setInquiries([]);
      })
      .finally(() => setIsLoading(false));
  }, [user?.phone]);

  const filteredInquiries = useMemo(() => {
    let list = inquiries;

    // Filter by tab
    if (activeTab !== 'all') {
      if (activeTab === 'new') {
        list = list.filter(i => i.status === 'new' || i.status === 'contacted');
      } else {
        list = list.filter(i => i.status === activeTab);
      }
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(i =>
        (i.name?.toLowerCase().includes(q)) ||
        (i.modelNumber?.toLowerCase().includes(q)) ||
        (i.inquiryNumber?.toLowerCase().includes(q)) ||
        (i.deliveryCity?.toLowerCase().includes(q))
      );
    }

    return list;
  }, [inquiries, activeTab, searchQuery]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const getStatusConfig = (status: string) =>
    STATUS_CONFIG[status] || STATUS_CONFIG.new;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">My Inquiries</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Track all your product inquiries in one place
              </p>
            </div>
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Inquiry
            </Link>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product, model, city..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-1 border-b border-gray-100 -mb-px">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.key === 'all' && inquiries.length > 0 && (
                  <span className="ml-1.5 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                    {inquiries.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-gray-300 mb-3" />
            <p className="text-sm text-gray-400">Loading inquiries...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-8 h-8 text-red-300 mb-3" />
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              {searchQuery ? 'No matching inquiries' : 'No inquiries yet'}
            </p>
            <p className="text-xs text-gray-400 mb-5 max-w-sm text-center">
              {searchQuery
                ? 'Try a different search term or filter.'
                : 'Submit your first inquiry and get quotes from verified dealers at the best prices.'}
            </p>
            {!searchQuery && (
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Submit Your First Inquiry
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredInquiries.map(inquiry => {
              const s = getStatusConfig(inquiry.status);
              return (
                <Link
                  key={inquiry.id}
                  to={`/track?number=${inquiry.inquiryNumber || inquiry.id}`}
                  className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {inquiry.name || inquiry.modelNumber || 'Product Inquiry'}
                        </p>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          {s.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                        {inquiry.modelNumber && (
                          <span className="text-xs text-gray-400">
                            Model: {inquiry.modelNumber}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          Qty: {inquiry.quantity}
                        </span>
                        <span className="text-xs text-gray-400">
                          {inquiry.deliveryCity}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(inquiry.createdAt)}
                        </span>
                      </div>
                      {inquiry.status === 'quoted' && inquiry.totalPrice && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            Quoted: Rs. {inquiry.totalPrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                      {inquiry.inquiryNumber && (
                        <p className="text-[11px] text-gray-300 mt-1.5">
                          #{inquiry.inquiryNumber}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0 mt-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
