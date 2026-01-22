import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { quotesApi, rfqApi } from '../../lib/api';
import { Button, Input, PageLoader, Alert, EmptyState } from '../../components/ui';
import {
  Package, MapPin, Clock, ChevronLeft, Send, Plus, Minus,
  Calendar, Truck, DollarSign, FileText, CheckCircle, AlertTriangle
} from 'lucide-react';

interface RFQItem {
  id: string;
  productId: string;
  quantity: number;
  notes?: string;
  product: {
    id: string;
    name: string;
    modelNumber?: string;
    brand: { id: string; name: string };
    productType: {
      name: string;
      subCategory: {
        name: string;
        category: { name: string };
      };
    };
  };
}

interface RFQ {
  id: string;
  title: string;
  description?: string;
  deliveryCity: string;
  deliveryPincode: string;
  deliveryAddress?: string;
  deliveryPreference: 'delivery' | 'pickup' | 'both';
  urgency: string | null;
  status: string;
  publishedAt: string;
  items: RFQItem[];
  user: {
    city: string;
    role: string;
  };
}

interface QuoteItem {
  productId: string;
  name: string;
  brand: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export function DealerQuoteSubmitPage() {
  const { rfqId } = useParams<{ rfqId: string }>();
  const navigate = useNavigate();

  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Quote form data
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [shippingCost, setShippingCost] = useState(0);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchRFQs = async () => {
      try {
        // Note: We need to fetch from available RFQs since individual RFQ fetch requires user auth
        const response = await quotesApi.getAvailableRFQs();
        const foundRFQ = response.data.rfqs?.find((r: RFQ) => r.id === rfqId);

        if (foundRFQ) {
          setRfq(foundRFQ);
          // Initialize quote items from RFQ items
          setQuoteItems(
            foundRFQ.items.map((item: RFQItem) => ({
              productId: item.product.id,
              name: item.product.name,
              brand: item.product.brand.name,
              quantity: item.quantity,
              unitPrice: 0,
              totalPrice: 0,
            }))
          );
        }
      } catch (error) {
        console.error('Failed to fetch RFQ:', error);
        setError('Failed to load RFQ details');
      } finally {
        setIsLoading(false);
      }
    };

    if (rfqId) {
      fetchRFQs();
    }
  }, [rfqId]);

  // Set default valid until date (7 days from now)
  useEffect(() => {
    const defaultValidUntil = new Date();
    defaultValidUntil.setDate(defaultValidUntil.getDate() + 7);
    setValidUntil(defaultValidUntil.toISOString().split('T')[0]);
  }, []);

  const handlePriceChange = (productId: string, unitPrice: number) => {
    setQuoteItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, unitPrice, totalPrice: unitPrice * item.quantity }
          : item
      )
    );
  };

  const totalAmount = quoteItems.reduce((sum, item) => sum + item.totalPrice, 0) + shippingCost;

  const validateForm = (): boolean => {
    setError('');

    // Check all items have prices
    const allPriced = quoteItems.every((item) => item.unitPrice > 0);
    if (!allPriced) {
      setError('Please enter unit price for all items');
      return false;
    }

    // Check valid until date
    if (!validUntil) {
      setError('Please set quote validity date');
      return false;
    }

    // Check at least one delivery option
    if (rfq?.deliveryPreference !== 'pickup' && !deliveryDate) {
      setError('Please set an expected delivery date');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !rfq) return;

    setIsSubmitting(true);
    setError('');

    try {
      const quoteData = {
        rfqId: rfq.id,
        totalAmount,
        shippingCost,
        deliveryDate: deliveryDate ? new Date(deliveryDate).toISOString() : undefined,
        pickupDate: pickupDate ? new Date(pickupDate).toISOString() : undefined,
        validUntil: new Date(validUntil).toISOString(),
        notes: notes || undefined,
        items: quoteItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
      };

      await quotesApi.submitQuote(quoteData);
      navigate('/dealer/quotes', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit quote. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return <PageLoader message="Loading RFQ details..." />;
  }

  if (!rfq) {
    return (
      <div className="container-custom py-16">
        <EmptyState
          icon={FileText}
          title="RFQ not found"
          description="This RFQ may have been closed or is no longer available."
          action={
            <Link to="/dealer/rfqs" className="btn-primary">
              View Available RFQs
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-neutral-900 text-white">
        <div className="container-custom py-8">
          <Link
            to="/dealer/rfqs"
            className="inline-flex items-center text-neutral-400 hover:text-white mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to RFQs
          </Link>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-500 text-white text-xs font-bold uppercase tracking-wider mb-3">
                {rfq.urgency === 'urgent' ? 'Urgent RFQ' : 'Quote Request'}
              </div>
              <h1 className="text-2xl md:text-3xl font-black">{rfq.title}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-neutral-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {rfq.deliveryCity}, {rfq.deliveryPincode}
                </span>
                <span className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  {rfq.items.length} items
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Posted {formatDate(rfq.publishedAt)}
                </span>
              </div>
            </div>

            <div className="bg-white/10 border border-white/20 p-4 text-center">
              <div className="text-3xl font-black text-white">
                ₹{totalAmount.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-neutral-400 uppercase tracking-wider">
                Total Quote Amount
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-10">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quote Form */}
            <div className="lg:col-span-2 space-y-8">
              {error && (
                <Alert variant="error" title="Error">
                  {error}
                </Alert>
              )}

              {/* Item Pricing */}
              <div className="border-2 border-neutral-200 p-6">
                <h2 className="text-xl font-black text-neutral-900 mb-6 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Item Pricing
                </h2>

                <div className="space-y-4">
                  {quoteItems.map((item, index) => (
                    <div
                      key={item.productId}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-neutral-50 border border-neutral-200"
                    >
                      {/* Product Info */}
                      <div className="md:col-span-5">
                        <p className="font-bold text-neutral-900">{item.name}</p>
                        <p className="text-sm text-neutral-500">{item.brand}</p>
                        {rfq.items[index]?.notes && (
                          <p className="text-xs text-accent-600 mt-1">
                            Note: {rfq.items[index].notes}
                          </p>
                        )}
                      </div>

                      {/* Quantity */}
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                          Qty
                        </label>
                        <p className="text-lg font-bold text-neutral-900">{item.quantity}</p>
                      </div>

                      {/* Unit Price */}
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                          Unit Price (₹)
                        </label>
                        <input
                          type="number"
                          value={item.unitPrice || ''}
                          onChange={(e) =>
                            handlePriceChange(item.productId, parseFloat(e.target.value) || 0)
                          }
                          placeholder="0"
                          className="w-full border-2 border-neutral-300 px-3 py-2 font-bold text-right focus:border-neutral-900 focus:outline-none"
                        />
                      </div>

                      {/* Total */}
                      <div className="md:col-span-3 text-right">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                          Total
                        </label>
                        <p className="text-lg font-black text-neutral-900">
                          ₹{item.totalPrice.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping */}
                <div className="mt-6 pt-6 border-t-2 border-neutral-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-bold text-neutral-900">
                        Shipping Cost (₹)
                      </label>
                      <p className="text-xs text-neutral-500">
                        Enter 0 for free shipping
                      </p>
                    </div>
                    <input
                      type="number"
                      value={shippingCost || ''}
                      onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-32 border-2 border-neutral-300 px-3 py-2 font-bold text-right focus:border-neutral-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Total */}
                <div className="mt-4 pt-4 border-t-2 border-neutral-900 flex items-center justify-between">
                  <span className="text-lg font-bold text-neutral-900">TOTAL</span>
                  <span className="text-2xl font-black text-neutral-900">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Delivery Options */}
              <div className="border-2 border-neutral-200 p-6">
                <h2 className="text-xl font-black text-neutral-900 mb-6 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Delivery Options
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(rfq.deliveryPreference === 'delivery' || rfq.deliveryPreference === 'both') && (
                    <div>
                      <label className="block text-sm font-bold text-neutral-900 mb-2">
                        Expected Delivery Date *
                      </label>
                      <input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full border-2 border-neutral-300 px-4 py-3 focus:border-neutral-900 focus:outline-none"
                      />
                    </div>
                  )}

                  {(rfq.deliveryPreference === 'pickup' || rfq.deliveryPreference === 'both') && (
                    <div>
                      <label className="block text-sm font-bold text-neutral-900 mb-2">
                        Available for Pickup From
                      </label>
                      <input
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full border-2 border-neutral-300 px-4 py-3 focus:border-neutral-900 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Quote Details */}
              <div className="border-2 border-neutral-200 p-6">
                <h2 className="text-xl font-black text-neutral-900 mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Quote Details
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-neutral-900 mb-2">
                      Quote Valid Until *
                    </label>
                    <input
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border-2 border-neutral-300 px-4 py-3 focus:border-neutral-900 focus:outline-none"
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                      Your quote will expire after this date
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-neutral-900 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Any additional details about your quote, payment terms, warranty info, etc."
                      className="w-full border-2 border-neutral-300 px-4 py-3 focus:border-neutral-900 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - RFQ Summary */}
            <div className="space-y-6">
              {/* RFQ Summary */}
              <div className="bg-neutral-50 border-2 border-neutral-200 p-6 sticky top-24">
                <h3 className="font-bold text-neutral-900 mb-4 uppercase tracking-wide text-sm">
                  RFQ Summary
                </h3>

                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-neutral-500">Customer Location</span>
                    <p className="font-bold text-neutral-900">
                      {rfq.deliveryCity}, {rfq.deliveryPincode}
                    </p>
                  </div>

                  <div>
                    <span className="text-neutral-500">Delivery Preference</span>
                    <p className="font-bold text-neutral-900 capitalize">
                      {rfq.deliveryPreference === 'both' ? 'Flexible' : rfq.deliveryPreference}
                    </p>
                  </div>

                  {rfq.description && (
                    <div>
                      <span className="text-neutral-500">Customer Notes</span>
                      <p className="font-bold text-neutral-900">{rfq.description}</p>
                    </div>
                  )}
                </div>

                {/* Items List */}
                <div className="mt-6 pt-6 border-t border-neutral-300">
                  <h4 className="font-bold text-neutral-900 mb-3 text-sm uppercase tracking-wider">
                    Requested Items
                  </h4>
                  <div className="space-y-2">
                    {rfq.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-neutral-600 truncate flex-1 mr-2">
                          {item.product.name}
                        </span>
                        <span className="font-bold text-neutral-900">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8">
                  <Button
                    onClick={handleSubmit}
                    isLoading={isSubmitting}
                    variant="accent"
                    size="lg"
                    className="w-full"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Submit Quote
                  </Button>
                  <p className="text-xs text-neutral-500 text-center mt-3">
                    Once submitted, customer will be notified of your quote
                  </p>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-neutral-900 text-white p-6">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-accent-400" />
                  Quote Tips
                </h3>
                <ul className="text-sm text-neutral-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    Competitive pricing wins orders
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    Faster delivery dates are preferred
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    Clear notes build trust
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
