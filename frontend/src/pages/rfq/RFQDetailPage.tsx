import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { rfqApi } from '../../lib/api';
import { Breadcrumb, StatusBadge, Button, Alert, PageLoader, EmptyState, Modal } from '../../components/ui';
import {
  Package, MapPin, Calendar, Clock, ChevronRight, Award,
  Star, Truck, CheckCircle, XCircle, MessageSquare, Phone,
  Zap, ArrowRight, TrendingUp, Shield, AlertTriangle
} from 'lucide-react';

interface Quote {
  id: string;
  status: string;
  totalAmount: number;
  deliveryDate: string | null;
  ranking: number;
  dealer: {
    id: string;
    businessName: string;
    city: string;
    conversionRate: number;
  };
  items: {
    id: string;
    itemPrice: number;
    quantity: number;
  }[];
}

interface RFQItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    brand: { name: string };
    productType: {
      subCategory: {
        category: { name: string };
      };
    };
  };
}

interface RFQ {
  id: string;
  title: string;
  description: string | null;
  status: string;
  deliveryCity: string;
  deliveryPincode: string;
  deliveryAddress: string | null;
  deliveryPreference: string;
  createdAt: string;
  publishedAt: string | null;
  items: RFQItem[];
  quotes: Quote[];
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'pending' | 'default'; color: string }> = {
  DRAFT: { label: 'Draft', variant: 'default', color: 'bg-neutral-500' },
  PUBLISHED: { label: 'Published', variant: 'info', color: 'bg-blue-500' },
  QUOTES_RECEIVED: { label: 'Quotes Received', variant: 'warning', color: 'bg-amber-500' },
  DEALER_SELECTED: { label: 'Dealer Selected', variant: 'success', color: 'bg-green-500' },
  COMPLETED: { label: 'Completed', variant: 'success', color: 'bg-green-600' },
  CANCELLED: { label: 'Cancelled', variant: 'error', color: 'bg-red-500' },
};

export function RFQDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    const fetchRFQ = async () => {
      if (!id) return;

      try {
        const response = await rfqApi.getById(id);
        setRfq(response.data);
      } catch (error) {
        console.error('Failed to fetch RFQ:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRFQ();
  }, [id]);

  const handleSelectQuote = async () => {
    if (!selectedQuote || !id) return;

    setIsSelecting(true);
    try {
      await rfqApi.selectQuote(id, selectedQuote.id);
      // Refresh RFQ data
      const response = await rfqApi.getById(id);
      setRfq(response.data);
      setShowConfirmModal(false);
    } catch (error) {
      console.error('Failed to select quote:', error);
    } finally {
      setIsSelecting(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
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

  if (isLoading) {
    return <PageLoader message="Loading RFQ details..." />;
  }

  if (!rfq) {
    return (
      <div className="container-custom py-16">
        <EmptyState
          title="RFQ not found"
          description="The RFQ you're looking for doesn't exist or you don't have access to it."
          action={
            <Link to="/rfq/my-rfqs" className="btn-primary">
              View My RFQs
            </Link>
          }
        />
      </div>
    );
  }

  const status = statusConfig[rfq.status] || statusConfig.DRAFT;
  const sortedQuotes = [...rfq.quotes].sort((a, b) => a.ranking - b.ranking);
  const canSelectQuote = ['PUBLISHED', 'QUOTES_RECEIVED'].includes(rfq.status);
  const lowestPrice = sortedQuotes.length > 0 ? Math.min(...sortedQuotes.map(q => q.totalAmount)) : 0;
  const highestPrice = sortedQuotes.length > 0 ? Math.max(...sortedQuotes.map(q => q.totalAmount)) : 0;
  const savings = highestPrice > 0 ? ((highestPrice - lowestPrice) / highestPrice * 100).toFixed(0) : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Urgency Banner */}
      {canSelectQuote && sortedQuotes.length > 0 && (
        <div className="bg-green-500 text-white py-3">
          <div className="container-custom">
            <div className="flex items-center justify-center gap-6 text-sm font-bold">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>{sortedQuotes.length} quotes received — Select now to lock in your price!</span>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Potential savings: {savings}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <section className="bg-neutral-900 text-white">
        <div className="container-custom py-8">
          <Breadcrumb
            items={[
              { label: 'My RFQs', href: '/rfq/my-rfqs' },
              { label: rfq.title },
            ]}
          />

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-4 mb-4">
                <div className={`px-4 py-2 ${status.color} text-white font-bold text-sm uppercase tracking-wider`}>
                  {status.label}
                </div>
                {rfq.quotes.length > 0 && (
                  <div className="px-4 py-2 bg-green-500 text-white font-bold text-sm uppercase tracking-wider">
                    {rfq.quotes.length} Quotes
                  </div>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-4">{rfq.title}</h1>

              <div className="flex flex-wrap items-center gap-6 text-neutral-300">
                <span className="flex items-center font-medium">
                  <MapPin className="w-5 h-5 mr-2" />
                  {rfq.deliveryCity}, {rfq.deliveryPincode}
                </span>
                <span className="flex items-center font-medium">
                  <Calendar className="w-5 h-5 mr-2" />
                  Created {formatDate(rfq.createdAt)}
                </span>
                {rfq.publishedAt && (
                  <span className="flex items-center font-medium">
                    <Clock className="w-5 h-5 mr-2" />
                    Published {formatDate(rfq.publishedAt)}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            {sortedQuotes.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
                <div className="text-center mb-4">
                  <div className="text-4xl font-black text-accent-400">{formatCurrency(lowestPrice)}</div>
                  <div className="text-sm font-bold text-neutral-300 uppercase tracking-wider">Best Quote</div>
                </div>
                {Number(savings) > 0 && (
                  <div className="text-center pt-4 border-t border-white/20">
                    <div className="text-2xl font-black text-green-400">{savings}%</div>
                    <div className="text-sm font-bold text-neutral-300">Potential Savings</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Quotes */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-neutral-900">
                  {sortedQuotes.length > 0 ? 'Compare Quotes' : 'Waiting for Quotes'}
                </h2>
                {sortedQuotes.length > 0 && (
                  <div className="flex items-center gap-2 text-sm font-bold text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Live quotes
                  </div>
                )}
              </div>

              {sortedQuotes.length === 0 ? (
                <div className="bg-neutral-50 border-2 border-neutral-200 p-12">
                  <EmptyState
                    icon={MessageSquare}
                    title="No quotes yet"
                    description="Your RFQ has been published. Verified dealers will submit their quotes soon. Average response time: 60 seconds."
                  />

                  <div className="mt-8 grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white border-2 border-neutral-200">
                      <div className="text-2xl font-black text-neutral-900">127</div>
                      <div className="text-xs font-bold text-neutral-500 uppercase">Dealers Online</div>
                    </div>
                    <div className="text-center p-4 bg-white border-2 border-neutral-200">
                      <div className="text-2xl font-black text-neutral-900">60s</div>
                      <div className="text-xs font-bold text-neutral-500 uppercase">Avg Response</div>
                    </div>
                    <div className="text-center p-4 bg-white border-2 border-neutral-200">
                      <div className="text-2xl font-black text-neutral-900">25%</div>
                      <div className="text-xs font-bold text-neutral-500 uppercase">Avg Savings</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedQuotes.map((quote, index) => (
                    <div
                      key={quote.id}
                      className={`bg-white border-2 transition-all duration-200 ${
                        index === 0
                          ? 'border-green-500 shadow-brutal'
                          : 'border-neutral-200 hover:border-neutral-900 hover:shadow-brutal'
                      }`}
                    >
                      {/* Best Price Badge */}
                      {index === 0 && (
                        <div className="bg-green-500 text-white px-4 py-2 flex items-center gap-2">
                          <Award className="w-5 h-5" />
                          <span className="font-bold uppercase tracking-wider text-sm">Best Price — Recommended</span>
                        </div>
                      )}

                      <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          {/* Dealer Info */}
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-neutral-900 flex items-center justify-center">
                              <span className="text-2xl font-black text-white">
                                {quote.dealer.businessName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-neutral-900">{quote.dealer.businessName}</h3>
                              <div className="flex items-center gap-4 text-sm text-neutral-500 font-medium mt-1">
                                <span className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {quote.dealer.city}
                                </span>
                                <span className="flex items-center">
                                  <Star className="w-4 h-4 mr-1 text-amber-500" />
                                  {(quote.dealer.conversionRate * 100).toFixed(0)}% success rate
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Price & Delivery */}
                          <div className="flex items-center gap-8">
                            <div className="text-right">
                              <p className="text-3xl font-black text-neutral-900">
                                {formatCurrency(quote.totalAmount)}
                              </p>
                              <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Total</p>
                            </div>

                            {quote.deliveryDate && (
                              <div className="text-right">
                                <p className="flex items-center text-lg font-bold text-neutral-900">
                                  <Truck className="w-5 h-5 mr-2 text-neutral-500" />
                                  {formatDate(quote.deliveryDate)}
                                </p>
                                <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Delivery</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action */}
                        {canSelectQuote && (
                          <div className="mt-6 pt-6 border-t-2 border-neutral-200 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-medium text-neutral-500">
                              <Shield className="w-4 h-4 text-green-500" />
                              Verified Dealer • GST Registered
                            </div>
                            <button
                              onClick={() => {
                                setSelectedQuote(quote);
                                setShowConfirmModal(true);
                              }}
                              className={index === 0 ? 'btn-urgent' : 'btn-primary'}
                            >
                              Select This Quote
                              <ChevronRight className="w-4 h-4 ml-2" />
                            </button>
                          </div>
                        )}

                        {quote.status === 'SELECTED' && (
                          <div className="mt-6 pt-6 border-t-2 border-green-200 bg-green-50 -mx-6 -mb-6 px-6 py-4">
                            <div className="flex items-center gap-3 text-green-700 font-bold">
                              <CheckCircle className="w-6 h-6" />
                              <span>Selected! The dealer will contact you shortly.</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: RFQ Details */}
            <div className="space-y-6">
              {/* Products */}
              <div className="bg-neutral-50 border-2 border-neutral-200">
                <div className="p-4 bg-neutral-900 text-white">
                  <h3 className="font-bold flex items-center uppercase tracking-wider text-sm">
                    <Package className="w-5 h-5 mr-2" />
                    Products ({rfq.items.length})
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {rfq.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-white border-2 border-neutral-200"
                    >
                      <div className="w-10 h-10 bg-neutral-100 flex items-center justify-center">
                        <Package className="w-5 h-5 text-neutral-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-neutral-900 text-sm truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs font-medium text-neutral-500">{item.product.brand.name}</p>
                      </div>
                      <span className="text-sm font-bold text-neutral-900 bg-neutral-100 px-3 py-1">
                        x{item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Details */}
              <div className="bg-neutral-50 border-2 border-neutral-200">
                <div className="p-4 bg-neutral-900 text-white">
                  <h3 className="font-bold flex items-center uppercase tracking-wider text-sm">
                    <MapPin className="w-5 h-5 mr-2" />
                    Delivery Details
                  </h3>
                </div>
                <div className="p-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-neutral-500">City:</span>
                    <span className="font-bold text-neutral-900">{rfq.deliveryCity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-neutral-500">Pincode:</span>
                    <span className="font-bold text-neutral-900">{rfq.deliveryPincode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-neutral-500">Preference:</span>
                    <span className="font-bold text-neutral-900 capitalize">{rfq.deliveryPreference}</span>
                  </div>
                  {rfq.deliveryAddress && (
                    <div className="pt-3 border-t border-neutral-200">
                      <span className="font-medium text-neutral-500">Address:</span>
                      <p className="font-bold text-neutral-900 mt-1">{rfq.deliveryAddress}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {rfq.description && (
                <div className="bg-neutral-50 border-2 border-neutral-200 p-4">
                  <h3 className="font-bold text-neutral-900 mb-2 uppercase tracking-wider text-sm">Notes</h3>
                  <p className="text-sm text-neutral-600">{rfq.description}</p>
                </div>
              )}

              {/* Quick Action */}
              <Link to="/rfq/create" className="btn-secondary w-full justify-center">
                Create Another RFQ
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Confirm Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Selection"
        size="md"
      >
        {selectedQuote && (
          <div className="space-y-6">
            <div className="bg-neutral-50 border-2 border-neutral-200 p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-neutral-900 flex items-center justify-center">
                  <span className="text-xl font-black text-white">
                    {selectedQuote.dealer.businessName.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-neutral-900">{selectedQuote.dealer.businessName}</p>
                  <p className="text-sm font-medium text-neutral-500">{selectedQuote.dealer.city}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t-2 border-neutral-200 flex justify-between items-center">
                <span className="font-medium text-neutral-500">Total Amount:</span>
                <span className="text-2xl font-black text-neutral-900">
                  {formatCurrency(selectedQuote.totalAmount)}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800 font-medium">
                By selecting this quote, the dealer will be notified and will contact you to finalize the order.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                className="btn-secondary flex-1 justify-center"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-urgent flex-1 justify-center"
                onClick={handleSelectQuote}
                disabled={isSelecting}
              >
                {isSelecting ? (
                  'Confirming...'
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Confirm Selection
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
