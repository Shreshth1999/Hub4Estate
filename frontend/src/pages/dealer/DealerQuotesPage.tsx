import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quotesApi } from '../../lib/api';
import { StatusBadge, EmptyState, ListSkeleton } from '../../components/ui';
import {
  FileText, MapPin, Clock, ChevronRight, CheckCircle,
  XCircle, Clock4, TrendingUp, TrendingDown, ArrowRight
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

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'SUBMITTED', label: 'Pending' },
  { id: 'SELECTED', label: 'Won' },
  { id: 'REJECTED', label: 'Lost' },
];

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'pending' | 'default'; icon: React.ElementType; color: string }> = {
  SUBMITTED: { label: 'Pending', variant: 'pending', icon: Clock4, color: 'bg-amber-500' },
  SELECTED: { label: 'Won', variant: 'success', icon: CheckCircle, color: 'bg-green-500' },
  REJECTED: { label: 'Lost', variant: 'error', icon: XCircle, color: 'bg-red-500' },
  EXPIRED: { label: 'Expired', variant: 'default', icon: Clock, color: 'bg-neutral-500' },
  WITHDRAWN: { label: 'Withdrawn', variant: 'default', icon: XCircle, color: 'bg-neutral-500' },
};

export function DealerQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [summary, setSummary] = useState({ total: 0, won: 0, lost: 0, pending: 0 });

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await quotesApi.getMyQuotes({ page: 1, limit: 50 });
        const quoteList = response.data.quotes || [];
        setQuotes(quoteList);

        setSummary({
          total: quoteList.length,
          won: quoteList.filter((q: Quote) => q.status === 'SELECTED').length,
          lost: quoteList.filter((q: Quote) => q.status === 'REJECTED').length,
          pending: quoteList.filter((q: Quote) => q.status === 'SUBMITTED').length,
        });
      } catch (error) {
        console.error('Failed to fetch quotes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuotes();
  }, []);

  const filteredQuotes = activeTab === 'all'
    ? quotes
    : quotes.filter(q => q.status === activeTab);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-neutral-900 text-white">
        <div className="container-custom py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500 text-white text-sm font-bold uppercase tracking-wider mb-4">
                <FileText className="w-4 h-4" />
                My Quotes
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                Track Your Quotes
              </h1>
              <p className="mt-2 text-neutral-300 font-medium">
                Monitor submitted quotes and win more deals
              </p>
            </div>

            <Link to="/dealer/rfqs" className="btn-urgent">
              Browse New RFQs
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="py-8 border-b-2 border-neutral-200">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border-2 border-neutral-200 p-6">
              <p className="text-4xl font-black text-neutral-900">{summary.total}</p>
              <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mt-1">Total Quotes</p>
            </div>
            <div className="bg-green-50 border-2 border-green-200 p-6">
              <p className="text-4xl font-black text-green-700 flex items-center">
                {summary.won}
                <TrendingUp className="w-6 h-6 ml-2" />
              </p>
              <p className="text-sm font-bold text-green-600 uppercase tracking-wider mt-1">Won</p>
            </div>
            <div className="bg-amber-50 border-2 border-amber-200 p-6">
              <p className="text-4xl font-black text-amber-700">{summary.pending}</p>
              <p className="text-sm font-bold text-amber-600 uppercase tracking-wider mt-1">Pending</p>
            </div>
            <div className="bg-red-50 border-2 border-red-200 p-6">
              <p className="text-4xl font-black text-red-700 flex items-center">
                {summary.lost}
                <TrendingDown className="w-6 h-6 ml-2" />
              </p>
              <p className="text-sm font-bold text-red-600 uppercase tracking-wider mt-1">Lost</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container-custom">
          {/* Tabs */}
          <div className="flex items-center gap-1 mb-8 overflow-x-auto border-b-2 border-neutral-200">
            {tabs.map((tab) => {
              const count = tab.id === 'all' ? quotes.length : quotes.filter(q => q.status === tab.id).length;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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

          {/* Quotes List */}
          {isLoading ? (
            <ListSkeleton count={5} />
          ) : filteredQuotes.length === 0 ? (
            <div className="bg-neutral-50 border-2 border-neutral-200 p-12">
              <EmptyState
                icon={FileText}
                title="No quotes found"
                description={activeTab === 'all'
                  ? "You haven't submitted any quotes yet. Browse available RFQs to get started."
                  : `No quotes with status "${statusConfig[activeTab]?.label || activeTab}"`
                }
                action={
                  <Link to="/dealer/rfqs" className="btn-urgent">
                    Browse RFQs
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuotes.map((quote, index) => {
                const status = statusConfig[quote.status] || statusConfig.SUBMITTED;
                const StatusIcon = status.icon;

                return (
                  <div
                    key={quote.id}
                    className="bg-white border-2 border-neutral-200 hover:border-neutral-900 hover:shadow-brutal transition-all"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Status Icon */}
                        <div className={`w-14 h-14 ${status.color} flex items-center justify-center flex-shrink-0`}>
                          <StatusIcon className="w-7 h-7 text-white" />
                        </div>

                        {/* Main Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-bold text-neutral-900 truncate">
                              {quote.rfq.title}
                            </h3>
                            <StatusBadge status={status.label} variant={status.variant} />
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 font-medium">
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {quote.rfq.deliveryCity}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              Submitted {formatDate(quote.createdAt)}
                            </span>
                          </div>

                          {quote.lossReason && (
                            <p className="mt-3 text-sm text-red-600 font-medium px-3 py-1 bg-red-50 inline-block">
                              Loss reason: <span className="capitalize">{quote.lossReason}</span>
                            </p>
                          )}
                        </div>

                        {/* Amount */}
                        <div className="text-right px-6 py-4 bg-neutral-50 border-2 border-neutral-200">
                          <p className="text-3xl font-black text-neutral-900">
                            {formatCurrency(quote.totalAmount)}
                          </p>
                          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mt-1">Quote Amount</p>
                        </div>
                      </div>
                    </div>

                    {quote.status === 'SELECTED' && (
                      <div className="px-6 py-3 bg-green-50 border-t-2 border-green-200 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-bold text-green-700">
                          Congratulations! You won this quote.
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
