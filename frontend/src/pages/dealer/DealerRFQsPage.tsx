import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quotesApi } from '../../lib/api';
import { StatusBadge, EmptyState, ListSkeleton } from '../../components/ui';
import {
  FileText, MapPin, Package, Clock, ChevronRight, Zap, AlertTriangle,
  ArrowRight, TrendingUp, Bell
} from 'lucide-react';

interface RFQItem {
  id: string;
  quantity: number;
  product: {
    name: string;
    brand: { name: string };
  };
}

interface AvailableRFQ {
  id: string;
  title: string;
  deliveryCity: string;
  deliveryPincode: string;
  urgency: string | null;
  createdAt: string;
  items: RFQItem[];
}

export function DealerRFQsPage() {
  const [rfqs, setRfqs] = useState<AvailableRFQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'urgent'>('all');

  useEffect(() => {
    const fetchRFQs = async () => {
      try {
        const response = await quotesApi.getAvailableRFQs();
        setRfqs(response.data.rfqs || []);
      } catch (error) {
        console.error('Failed to fetch RFQs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRFQs();
  }, []);

  const filteredRFQs = filter === 'all' ? rfqs : rfqs.filter(rfq => rfq.urgency === 'urgent');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const urgentCount = rfqs.filter(r => r.urgency === 'urgent').length;

  return (
    <div className="min-h-screen bg-white">
      {/* Info Banner */}
      <div className="bg-accent-500 text-white py-3">
        <div className="container-custom">
          <div className="flex items-center justify-center gap-6 text-sm font-bold">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span>{rfqs.length} new quote requests available</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Quick responses get better results</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <section className="bg-neutral-900 text-white">
        <div className="container-custom py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500 text-white text-sm font-bold uppercase tracking-wider mb-4">
                <FileText className="w-4 h-4" />
                Available RFQs
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                Available Quote Requests
              </h1>
              <p className="mt-2 text-neutral-300 font-medium">
                Browse and respond to RFQs from customers in your service area. Submit competitive quotes to win orders.
              </p>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center bg-white/10 border border-white/20 p-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all ${
                  filter === 'all'
                    ? 'bg-white text-neutral-900'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                All ({rfqs.length})
              </button>
              <button
                onClick={() => setFilter('urgent')}
                className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                  filter === 'urgent'
                    ? 'bg-white text-neutral-900'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-500" />
                Urgent ({urgentCount})
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container-custom">
          {isLoading ? (
            <ListSkeleton count={5} />
          ) : filteredRFQs.length === 0 ? (
            <div className="bg-neutral-50 border-2 border-neutral-200 p-12">
              <EmptyState
                icon={FileText}
                title="No RFQs available"
                description={filter === 'urgent'
                  ? "No urgent RFQs at the moment. Check back later!"
                  : "No RFQs match your profile yet. Make sure you've added your brands and service areas."
                }
                action={
                  <Link to="/dealer/profile" className="btn-primary">
                    Update Profile
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRFQs.map((rfq, index) => (
                <Link
                  key={rfq.id}
                  to={`/dealer/rfqs/${rfq.id}/quote`}
                  className="block bg-white border-2 border-neutral-200 hover:border-neutral-900 hover:shadow-brutal transition-all duration-200"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Status Indicator */}
                      <div className={`w-14 h-14 flex items-center justify-center flex-shrink-0 ${
                        rfq.urgency === 'urgent' ? 'bg-amber-500' : 'bg-neutral-900'
                      }`}>
                        {rfq.urgency === 'urgent' ? (
                          <Zap className="w-7 h-7 text-white" />
                        ) : (
                          <FileText className="w-7 h-7 text-white" />
                        )}
                      </div>

                      {/* Main Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-bold text-neutral-900 truncate">
                            {rfq.title}
                          </h3>
                          {rfq.urgency === 'urgent' && (
                            <StatusBadge status="Urgent" variant="warning" />
                          )}
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
                      </div>

                      {/* Action */}
                      <div className="flex items-center gap-4">
                        <span className="btn-urgent">
                          Submit Quote
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </span>
                      </div>
                    </div>
                  </div>

                  {rfq.urgency === 'urgent' && (
                    <div className="px-6 py-3 bg-amber-50 border-t-2 border-amber-200 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-bold text-amber-700">
                        Urgent: Customer needs quick delivery
                      </span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}

          {/* Tips */}
          <div className="mt-12 bg-neutral-900 border-2 border-neutral-900 shadow-brutal p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-accent-500 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg mb-2">Tips for Better Quotes</h3>
                <ul className="text-neutral-300 space-y-2 text-sm font-medium">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-accent-400 rounded-full"></span>
                    Respond quickly - first quotes often get more attention
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-accent-400 rounded-full"></span>
                    Be competitive on pricing while maintaining quality
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-accent-400 rounded-full"></span>
                    Provide accurate delivery estimates
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
