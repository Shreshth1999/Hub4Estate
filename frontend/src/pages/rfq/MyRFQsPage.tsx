import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rfqApi } from '../../lib/api';
import { StatusBadge, EmptyState, ListSkeleton, Button } from '../../components/ui';
import {
  FileText, Plus, ChevronRight, Package, MapPin, Clock,
  MessageSquare, CheckCircle, XCircle, AlertCircle, Zap,
  ArrowRight, TrendingUp, Users
} from 'lucide-react';

type RFQStatus = 'all' | 'DRAFT' | 'PUBLISHED' | 'QUOTES_RECEIVED' | 'DEALER_SELECTED' | 'COMPLETED' | 'CANCELLED';

interface RFQItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    brand: { name: string };
  };
}

interface RFQ {
  id: string;
  title: string;
  status: string;
  deliveryCity: string;
  deliveryPincode: string;
  createdAt: string;
  items: RFQItem[];
  quotes: { id: string; status: string }[];
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'pending' | 'default'; icon: React.ElementType; color: string }> = {
  DRAFT: { label: 'Draft', variant: 'default', icon: FileText, color: 'bg-neutral-500' },
  PUBLISHED: { label: 'Published', variant: 'info', icon: AlertCircle, color: 'bg-blue-500' },
  QUOTES_RECEIVED: { label: 'Quotes Received', variant: 'warning', icon: MessageSquare, color: 'bg-amber-500' },
  DEALER_SELECTED: { label: 'Dealer Selected', variant: 'success', icon: CheckCircle, color: 'bg-green-500' },
  COMPLETED: { label: 'Completed', variant: 'success', icon: CheckCircle, color: 'bg-green-600' },
  CANCELLED: { label: 'Cancelled', variant: 'error', icon: XCircle, color: 'bg-red-500' },
};

const tabs = [
  { id: 'all', label: 'All RFQs' },
  { id: 'DRAFT', label: 'Draft' },
  { id: 'PUBLISHED', label: 'Published' },
  { id: 'QUOTES_RECEIVED', label: 'Quotes Received' },
  { id: 'DEALER_SELECTED', label: 'Selected' },
  { id: 'COMPLETED', label: 'Completed' },
];

export function MyRFQsPage() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<RFQStatus>('all');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    const fetchRFQs = async () => {
      setIsLoading(true);
      try {
        const params: any = { page: pagination.page, limit: 10 };
        if (activeTab !== 'all') {
          params.status = activeTab;
        }

        const response = await rfqApi.list(params);
        setRfqs(response.data.rfqs || []);
        setPagination(response.data.pagination || { page: 1, pages: 1, total: 0 });
      } catch (error) {
        console.error('Failed to fetch RFQs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRFQs();
  }, [activeTab, pagination.page]);

  const filteredRFQs = activeTab === 'all' ? rfqs : rfqs.filter(rfq => rfq.status === activeTab);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Stats
  const totalQuotes = rfqs.reduce((acc, rfq) => acc + (rfq.quotes?.length || 0), 0);
  const publishedCount = rfqs.filter(r => r.status === 'PUBLISHED' || r.status === 'QUOTES_RECEIVED').length;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <section className="bg-neutral-900 text-white">
        <div className="container-custom py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500 text-white text-sm font-bold uppercase tracking-wider mb-6">
                <FileText className="w-4 h-4" />
                Your Requests
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                My RFQs
              </h1>
              <p className="text-xl text-neutral-300 mb-8">
                Track your requests and manage quotes from verified dealers.
              </p>
              <Link to="/rfq/create" className="btn-urgent inline-flex">
                <Plus className="w-5 h-5 mr-2" />
                Create New RFQ
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
                <div className="text-4xl font-black text-accent-400 mb-2">{rfqs.length}</div>
                <div className="text-sm font-bold uppercase tracking-wider text-neutral-300">Total RFQs</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
                <div className="text-4xl font-black text-accent-400 mb-2">{totalQuotes}</div>
                <div className="text-sm font-bold uppercase tracking-wider text-neutral-300">Quotes Received</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
                <div className="text-4xl font-black text-accent-400 mb-2">{publishedCount}</div>
                <div className="text-sm font-bold uppercase tracking-wider text-neutral-300">Active RFQs</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
                <div className="text-4xl font-black text-green-400 mb-2">127</div>
                <div className="text-sm font-bold uppercase tracking-wider text-neutral-300">Dealers Online</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Urgency Banner */}
      <div className="bg-accent-500 text-white py-3">
        <div className="container-custom">
          <div className="flex items-center justify-center gap-6 text-sm font-bold">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Avg 15-25% savings on every RFQ</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>127 dealers ready to quote</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-12">
        <div className="container-custom">
          {/* Tabs */}
          <div className="mb-8 overflow-x-auto border-b-2 border-neutral-200">
            <div className="flex gap-1">
              {tabs.map((tab) => {
                const count = tab.id === 'all' ? rfqs.length : rfqs.filter(r => r.status === tab.id).length;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as RFQStatus)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-bold uppercase tracking-wider border-b-4 transition-all ${
                      activeTab === tab.id
                        ? 'border-neutral-900 text-neutral-900 bg-neutral-50'
                        : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {tab.label}
                    <span className={`px-2 py-0.5 text-xs ${
                      activeTab === tab.id
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-200 text-neutral-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RFQ List */}
          {isLoading ? (
            <ListSkeleton count={5} />
          ) : filteredRFQs.length === 0 ? (
            <div className="bg-neutral-50 border-2 border-neutral-200 p-12">
              <EmptyState
                icon={FileText}
                title="No RFQs found"
                description={activeTab === 'all'
                  ? "You haven't created any RFQs yet. Create your first RFQ to get competitive quotes from verified dealers."
                  : `No RFQs with status "${statusConfig[activeTab]?.label || activeTab}"`
                }
                action={
                  <Link to="/rfq/create" className="btn-urgent inline-flex">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First RFQ
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRFQs.map((rfq, index) => {
                const status = statusConfig[rfq.status] || statusConfig.DRAFT;
                const StatusIcon = status.icon;
                const quoteCount = rfq.quotes?.length || 0;

                return (
                  <Link
                    key={rfq.id}
                    to={`/rfq/${rfq.id}`}
                    className="block bg-white border-2 border-neutral-200 hover:border-neutral-900 hover:shadow-brutal transition-all duration-200"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Status Indicator */}
                        <div className={`w-12 h-12 ${status.color} flex items-center justify-center flex-shrink-0`}>
                          <StatusIcon className="w-6 h-6 text-white" />
                        </div>

                        {/* Main Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-neutral-900 truncate">
                              {rfq.title}
                            </h3>
                            <StatusBadge status={status.label} variant={status.variant} />
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 font-medium">
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {rfq.deliveryCity}, {rfq.deliveryPincode}
                            </span>
                            <span className="flex items-center">
                              <Package className="w-4 h-4 mr-1" />
                              {rfq.items.length} items
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatDate(rfq.createdAt)}
                            </span>
                          </div>

                          {/* Product Preview */}
                          {rfq.items.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {rfq.items.slice(0, 3).map((item) => (
                                <span
                                  key={item.id}
                                  className="px-3 py-1 bg-neutral-100 text-neutral-700 text-xs font-bold uppercase tracking-wider"
                                >
                                  {item.product.name} (x{item.quantity})
                                </span>
                              ))}
                              {rfq.items.length > 3 && (
                                <span className="px-3 py-1 bg-neutral-100 text-neutral-500 text-xs font-bold">
                                  +{rfq.items.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Quotes & Action */}
                        <div className="flex items-center gap-6">
                          {quoteCount > 0 && (
                            <div className="text-center px-6 py-3 bg-green-100 border-2 border-green-200">
                              <p className="text-3xl font-black text-green-700">{quoteCount}</p>
                              <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Quotes</p>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-neutral-900 font-bold">
                            <span className="hidden sm:inline">View</span>
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Footer */}
                    {quoteCount > 0 && (
                      <div className="px-6 py-3 bg-green-50 border-t-2 border-green-200 flex items-center justify-between">
                        <span className="text-sm font-bold text-green-700">
                          {quoteCount} dealer{quoteCount > 1 ? 's' : ''} quoted — Compare & save!
                        </span>
                        <span className="text-sm font-bold text-green-600 flex items-center">
                          Review Quotes <ArrowRight className="w-4 h-4 ml-1" />
                        </span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setPagination(prev => ({ ...prev, page }))}
                  className={`w-12 h-12 font-bold transition-all ${
                    pagination.page === page
                      ? 'bg-neutral-900 text-white'
                      : 'bg-white border-2 border-neutral-200 text-neutral-700 hover:border-neutral-900'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-neutral-50 border-t-2 border-neutral-200">
        <div className="container-custom">
          <div className="bg-neutral-900 border-4 border-neutral-900 shadow-brutal-lg p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500 text-white text-sm font-bold uppercase tracking-wider mb-6">
                  <Zap className="w-4 h-4" />
                  Get More Quotes
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
                  Need More Products?
                </h3>
                <p className="text-neutral-300 text-lg mb-6">
                  Create a new RFQ and get competitive quotes from 127+ verified dealers. Average response time: 60 seconds.
                </p>
                <Link to="/rfq/create" className="btn-urgent inline-flex">
                  Create New RFQ
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm p-6 text-center">
                  <div className="text-4xl font-black text-accent-400 mb-2">60s</div>
                  <div className="text-sm font-bold text-neutral-300">Avg Response</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-6 text-center">
                  <div className="text-4xl font-black text-accent-400 mb-2">25%</div>
                  <div className="text-sm font-bold text-neutral-300">Max Savings</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
