import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quotesApi } from '../../lib/api';
import { ListSkeleton } from '../../components/ui';
import {
  FileText, MapPin, Package, Clock, ChevronRight, Zap,
  TrendingUp, Bell,
} from 'lucide-react';
import { UserBadge } from '../../components/common/UserBadge';

interface RFQItem {
  id: string;
  quantity: number;
  product: { name: string; brand: { name: string } };
}

interface AvailableRFQ {
  id: string;
  title: string;
  deliveryCity: string;
  deliveryPincode: string;
  urgency: string | null;
  createdAt: string;
  items: RFQItem[];
  user?: {
    role?: string;
    profVerificationStatus?: string;
  };
}

export function DealerRFQsPage() {
  const [rfqs, setRfqs] = useState<AvailableRFQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'urgent'>('all');

  useEffect(() => {
    quotesApi.getAvailableRFQs()
      .then(res => setRfqs(res.data.rfqs || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const filteredRFQs = filter === 'all' ? rfqs : rfqs.filter(r => r.urgency === 'urgent');
  const urgentCount = rfqs.filter(r => r.urgency === 'urgent').length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const diffHours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between gap-4 max-w-5xl mx-auto">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Available RFQs</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {rfqs.length > 0 ? `${rfqs.length} open request${rfqs.length !== 1 ? 's' : ''} in your area` : 'Quote requests from buyers in your service area'}
            </p>
          </div>
          {rfqs.length > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-amber-600">
              <Bell className="w-4 h-4" />
              <span className="font-medium">{rfqs.length} new</span>
            </div>
          )}
        </div>
      </div>

      {/* Tip bar */}
      {rfqs.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-100 px-6 py-2.5">
          <div className="flex items-center gap-2 max-w-5xl mx-auto">
            <TrendingUp className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            <p className="text-xs text-blue-700">Early quotes get more attention. Respond quickly to improve your conversion rate.</p>
          </div>
        </div>
      )}

      <div className="px-6 py-6 max-w-5xl mx-auto">

        {/* Filter tabs */}
        <div className="flex items-center gap-1 mb-5 border-b border-gray-200">
          {[
            { key: 'all' as const, label: `All (${rfqs.length})` },
            { key: 'urgent' as const, label: `Urgent (${urgentCount})`, icon: Zap },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                filter === tab.key
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon && <tab.icon className="w-3.5 h-3.5 text-amber-500" />}
              {tab.label}
            </button>
          ))}
        </div>

        {/* RFQ List */}
        {isLoading ? (
          <ListSkeleton count={4} />
        ) : filteredRFQs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center">
            <FileText className="w-8 h-8 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700">
              {filter === 'urgent' ? 'No urgent RFQs right now' : 'No RFQs match your profile yet'}
            </p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              {filter === 'urgent'
                ? 'Check back soon. Urgent requests appear here.'
                : 'Add your brands and service areas to your profile to get matched with more buyers.'}
            </p>
            {filter !== 'urgent' && (
              <Link
                to="/dealer/profile"
                className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
              >
                Update your profile <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        ) : (
          <div
            data-tour="rfq-inbox"
            className="space-y-3"
          >
            {filteredRFQs.map(rfq => {
              const buyerRole = rfq.user?.role;
              const buyerVerified = rfq.user?.profVerificationStatus === 'VERIFIED';
              const isProfessional = buyerRole && !['INDIVIDUAL_HOME_BUILDER', 'RENOVATION_HOMEOWNER'].includes(buyerRole);

              return (
                <Link
                  key={rfq.id}
                  to={`/dealer/rfqs/${rfq.id}/quote`}
                  data-tour="submit-quote"
                  className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group"
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    rfq.urgency === 'urgent' ? 'bg-amber-100' : 'bg-gray-100'
                  }`}>
                    {rfq.urgency === 'urgent'
                      ? <Zap className="w-4 h-4 text-amber-600" />
                      : <FileText className="w-4 h-4 text-gray-500" />
                    }
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{rfq.title}</p>
                      {rfq.urgency === 'urgent' && (
                        <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full flex-shrink-0">
                          Urgent
                        </span>
                      )}
                    </div>

                    {/* Buyer badge */}
                    {buyerRole && (
                      <div className="mb-2">
                        <UserBadge
                          role={buyerRole}
                          verified={buyerVerified}
                          showIcon={buyerVerified}
                        />
                        {isProfessional && buyerVerified && (
                          <span className="ml-2 text-[11px] text-gray-400">— professional buyer</span>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {rfq.deliveryCity}, {rfq.deliveryPincode}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {rfq.items.length} item{rfq.items.length !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(rfq.createdAt)}
                      </span>
                    </div>

                    {/* Product pills */}
                    {rfq.items.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {rfq.items.slice(0, 3).map(item => (
                          <span
                            key={item.id}
                            className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                          >
                            {item.product.name} ×{item.quantity}
                          </span>
                        ))}
                        {rfq.items.length > 3 && (
                          <span className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                            +{rfq.items.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg group-hover:bg-orange-600 transition-colors">
                    Quote
                    <ChevronRight className="w-3 h-3" />
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
