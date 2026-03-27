import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { rfqApi } from '../../lib/api';
import {
  Package, MapPin, Calendar, ArrowLeft, Award,
  CheckCircle, MessageSquare, Truck, Shield, AlertCircle, Loader2, X,
  Sparkles, TrendingDown, Zap, Star,
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
}

interface RFQItem {
  id: string;
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

const STATUS_CONFIG: Record<string, { label: string; dot: string; color: string }> = {
  DRAFT:           { label: 'Draft',          dot: 'bg-gray-300',   color: 'text-gray-500' },
  PUBLISHED:       { label: 'Live',            dot: 'bg-blue-400',   color: 'text-blue-600' },
  QUOTES_RECEIVED: { label: 'Quotes ready',   dot: 'bg-amber-400',  color: 'text-amber-600' },
  DEALER_SELECTED: { label: 'In progress',    dot: 'bg-violet-400', color: 'text-violet-600' },
  COMPLETED:       { label: 'Completed',      dot: 'bg-green-400',  color: 'text-green-600' },
  CANCELLED:       { label: 'Cancelled',      dot: 'bg-red-300',    color: 'text-red-500' },
};

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export function RFQDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmQuote, setConfirmQuote] = useState<Quote | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    if (!id) return;
    rfqApi.getById(id)
      .then(res => setRfq(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSelectQuote = async () => {
    if (!confirmQuote || !id) return;
    setIsSelecting(true);
    try {
      await rfqApi.selectQuote(id, confirmQuote.id);
      const res = await rfqApi.getById(id);
      setRfq(res.data);
      setConfirmQuote(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSelecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!rfq) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">RFQ not found</p>
          <Link to="/rfq/my-rfqs" className="inline-flex items-center gap-1 mt-3 text-sm text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My RFQs
          </Link>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[rfq.status] || STATUS_CONFIG.DRAFT;
  const sortedQuotes = [...rfq.quotes].sort((a, b) => a.ranking - b.ranking);
  const canSelect = ['PUBLISHED', 'QUOTES_RECEIVED'].includes(rfq.status);
  const lowestPrice = sortedQuotes.length > 0 ? Math.min(...sortedQuotes.map(q => q.totalAmount)) : 0;
  const highestPrice = sortedQuotes.length > 0 ? Math.max(...sortedQuotes.map(q => q.totalAmount)) : 0;
  const savings = highestPrice > lowestPrice
    ? Math.round((highestPrice - lowestPrice) / highestPrice * 100)
    : 0;

  const sparkInsights = useMemo(() => {
    if (sortedQuotes.length < 2) return null;
    const cheapest = sortedQuotes.reduce((a, b) => a.totalAmount < b.totalAmount ? a : b);
    const fastest = sortedQuotes
      .filter(q => q.deliveryDate)
      .reduce<Quote | null>((a, b) => {
        if (!a) return b;
        return new Date(b.deliveryDate!) < new Date(a.deliveryDate!) ? b : a;
      }, null);
    const mostReliable = sortedQuotes.reduce((a, b) => a.dealer.conversionRate > b.dealer.conversionRate ? a : b);
    const allSame = cheapest.id === fastest?.id && fastest?.id === mostReliable.id;
    const insights: { icon: any; color: string; bg: string; label: string; dealer: string; detail: string }[] = [];
    insights.push({
      icon: TrendingDown, color: 'text-green-700', bg: 'bg-green-50',
      label: 'Lowest price',
      dealer: cheapest.dealer.businessName,
      detail: fmtCurrency(cheapest.totalAmount),
    });
    if (fastest && fastest.id !== cheapest.id) {
      insights.push({
        icon: Zap, color: 'text-blue-700', bg: 'bg-blue-50',
        label: 'Fastest delivery',
        dealer: fastest.dealer.businessName,
        detail: fmt(fastest.deliveryDate),
      });
    }
    if (mostReliable.id !== cheapest.id && mostReliable.dealer.conversionRate > 0) {
      insights.push({
        icon: Star, color: 'text-amber-700', bg: 'bg-amber-50',
        label: 'Highest success rate',
        dealer: mostReliable.dealer.businessName,
        detail: `${(mostReliable.dealer.conversionRate * 100).toFixed(0)}% win rate`,
      });
    }
    const topPick = allSame ? cheapest : (cheapest.dealer.conversionRate >= 0.5 ? cheapest : (mostReliable.totalAmount <= lowestPrice * 1.05 ? mostReliable : cheapest));
    return { insights, topPick };
  }, [sortedQuotes]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <Link
          to="/rfq/my-rfqs"
          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> My RFQs
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${status.dot}`} />
              <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
              {sortedQuotes.length > 0 && (
                <span className="text-xs bg-amber-50 text-amber-600 font-medium px-2 py-0.5 rounded-full">
                  {sortedQuotes.length} quote{sortedQuotes.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <h1 className="text-lg font-semibold text-gray-900">{rfq.title}</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              <MapPin className="inline w-3 h-3 mr-0.5" />
              {rfq.deliveryCity}, {rfq.deliveryPincode}
              {' · '}Created {fmt(rfq.createdAt)}
            </p>
          </div>
          {savings > 0 && (
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-semibold text-green-600">{savings}% savings</p>
              <p className="text-xs text-gray-400">between quotes</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Quotes Column */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-sm font-medium text-gray-500">
              {sortedQuotes.length > 0 ? 'Quotes' : 'Waiting for quotes'}
            </h2>

            {sortedQuotes.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 px-4 py-12 text-center">
                <MessageSquare className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-500">No quotes yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Your RFQ is live. Dealers will submit quotes shortly.
                </p>
              </div>
            ) : (
              sortedQuotes.map((quote, idx) => (
                <div
                  key={quote.id}
                  className={`bg-white rounded-xl border transition-all ${
                    idx === 0
                      ? 'border-green-200 shadow-sm'
                      : 'border-gray-200'
                  }`}
                >
                  {idx === 0 && (
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-green-50 rounded-t-xl border-b border-green-100">
                      <Award className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-xs font-medium text-green-700">Best price</span>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-gray-700">
                            {quote.dealer.businessName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{quote.dealer.businessName}</p>
                          <p className="text-xs text-gray-400">
                            {quote.dealer.city}
                            {quote.dealer.conversionRate > 0 && (
                              <> · {(quote.dealer.conversionRate * 100).toFixed(0)}% success rate</>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">{fmtCurrency(quote.totalAmount)}</p>
                        {quote.deliveryDate && (
                          <p className="text-xs text-gray-400 flex items-center justify-end gap-1">
                            <Truck className="w-3 h-3" />
                            {fmt(quote.deliveryDate)}
                          </p>
                        )}
                      </div>
                    </div>

                    {canSelect && quote.status !== 'SELECTED' && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Shield className="w-3.5 h-3.5" />
                          Verified dealer
                        </div>
                        <button
                          onClick={() => setConfirmQuote(quote)}
                          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                            idx === 0
                              ? 'bg-gray-900 text-white hover:bg-gray-800'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Select quote
                        </button>
                      </div>
                    )}

                    {quote.status === 'SELECTED' && (
                      <div className="mt-3 pt-3 border-t border-green-100 flex items-center gap-2 text-xs text-green-700">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Selected — dealer will contact you shortly
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* RFQ Details */}
          <div className="space-y-4">
            {/* Spark AI Quote Comparison */}
            {sparkInsights && canSelect && (
              <div className="bg-white rounded-xl border border-violet-100 overflow-hidden">
                <div className="px-4 py-3 bg-violet-50 border-b border-violet-100 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                  <span className="text-xs font-medium text-violet-700">Spark recommendation</span>
                </div>
                <div className="p-4 space-y-3">
                  {sparkInsights.insights.map((insight, i) => (
                    <div key={i} className={`flex items-center gap-2.5 px-3 py-2 ${insight.bg} rounded-lg`}>
                      <insight.icon className={`w-3.5 h-3.5 ${insight.color} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium ${insight.color}`}>{insight.label}</p>
                        <p className="text-xs text-gray-600 truncate">{insight.dealer}</p>
                      </div>
                      <span className="text-xs font-semibold text-gray-700 flex-shrink-0">{insight.detail}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-[11px] text-gray-500">
                      <span className="font-medium text-gray-700">Best pick: </span>
                      {sparkInsights.topPick.dealer.businessName} — combines competitive pricing with reliability.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Products */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-gray-400" />
                <h3 className="text-sm font-medium text-gray-900">Products</h3>
                <span className="text-xs text-gray-400 ml-auto">{rfq.items.length}</span>
              </div>
              <div className="divide-y divide-gray-100">
                {rfq.items.map(item => (
                  <div key={item.id} className="px-4 py-3 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm text-gray-900 truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-400">{item.product.brand.name}</p>
                    </div>
                    <span className="text-xs font-medium text-gray-500 flex-shrink-0 ml-2">×{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                Delivery
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">City</span>
                  <span className="text-gray-900 font-medium">{rfq.deliveryCity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Pincode</span>
                  <span className="text-gray-900 font-medium">{rfq.deliveryPincode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Preference</span>
                  <span className="text-gray-900 font-medium capitalize">{rfq.deliveryPreference}</span>
                </div>
              </div>
              {rfq.deliveryAddress && (
                <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">{rfq.deliveryAddress}</p>
              )}
            </div>

            {rfq.description && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-xs text-gray-400 font-medium mb-2">Notes</h3>
                <p className="text-sm text-gray-700">{rfq.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmQuote && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Confirm selection</h3>
              <button onClick={() => setConfirmQuote(null)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="font-semibold text-gray-700">{confirmQuote.dealer.businessName.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{confirmQuote.dealer.businessName}</p>
                  <p className="text-xs text-gray-400">{confirmQuote.dealer.city}</p>
                </div>
                <p className="ml-auto text-lg font-semibold text-gray-900">{fmtCurrency(confirmQuote.totalAmount)}</p>
              </div>
              <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                The dealer will be notified and will contact you to finalize the order.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmQuote(null)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSelectQuote}
                  disabled={isSelecting}
                  className="flex-1 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isSelecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
