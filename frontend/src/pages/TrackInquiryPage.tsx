import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, Clock, CheckCircle, Phone, MapPin, Package,
  AlertCircle, Loader2, IndianRupee, Truck, MessageSquare, Hash,
} from 'lucide-react';
import { api } from '../lib/api';
import { ImagePreview } from '../components/common/ImagePreview';

const API_BASE_URL = (import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001/api').replace(/\/api$/, '');

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

const STATUS_CONFIG: Record<string, { label: string; dot: string; color: string; step: number }> = {
  new:       { label: 'Received',    dot: 'bg-blue-400',   color: 'text-blue-600',   step: 1 },
  contacted: { label: 'In Progress', dot: 'bg-amber-400',  color: 'text-amber-600',  step: 2 },
  quoted:    { label: 'Quote Ready', dot: 'bg-green-400',  color: 'text-green-600',  step: 3 },
  closed:    { label: 'Closed',      dot: 'bg-gray-300',   color: 'text-gray-500',   step: 4 },
};

const STEPS = ['Received', 'In Progress', 'Quote Ready', 'Done'];

export function TrackInquiryPage() {
  const [searchParams] = useSearchParams();
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [inquiryNumber, setInquiryNumber] = useState(searchParams.get('number') || '');
  const [searchBy, setSearchBy] = useState<'phone' | 'number'>(searchParams.get('number') ? 'number' : 'phone');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const fetchInquiries = async () => {
    const query = searchBy === 'phone' ? phone.trim() : inquiryNumber.trim();
    if (!query) {
      setError(searchBy === 'phone' ? 'Enter your phone number.' : 'Enter your inquiry number.');
      return;
    }
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const params = searchBy === 'phone' ? { phone: query } : { number: query };
      const res = await api.get('/inquiry/track', { params });
      setInquiries(res.data.inquiries || []);
    } catch (err: any) {
      setInquiries([]);
      if (err.response?.status === 404) {
        setError(searchBy === 'phone'
          ? 'No inquiries found for this phone number.'
          : 'Inquiry not found. Check the number and try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('phone') || searchParams.get('number')) {
      fetchInquiries();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInquiries();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Track Your Inquiry</h1>
          <p className="text-sm text-gray-500">Check the status of your product inquiry — no sign-in required.</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Search Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          {/* Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => { setSearchBy('phone'); setError(''); }}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                searchBy === 'phone'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              By phone number
            </button>
            <button
              type="button"
              onClick={() => { setSearchBy('number'); setError(''); }}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                searchBy === 'number'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              By inquiry number
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-3">
            {searchBy === 'phone' ? (
              <input
                type="tel"
                placeholder="Enter your 10-digit phone number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors"
              />
            ) : (
              <input
                type="text"
                placeholder="e.g. HUB-HAVELLS-MCB-0001"
                value={inquiryNumber}
                onChange={e => setInquiryNumber(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-gray-400 transition-colors"
              />
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Track
            </button>
          </form>

          {error && (
            <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Looking up your inquiries...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !searched && (
          <div className="text-center py-12">
            <Search className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Enter your phone or inquiry number above to track your request.</p>
          </div>
        )}

        {/* No results */}
        {!loading && searched && inquiries.length === 0 && !error && (
          <div className="text-center py-12">
            <AlertCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              No inquiries found for this {searchBy === 'phone' ? 'phone number' : 'inquiry number'}.
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && inquiries.length > 0 && (
          <div className="space-y-4">
            <p className="text-xs text-gray-400 font-medium">
              {inquiries.length} inquiry{inquiries.length !== 1 ? 's' : ''} found
            </p>

            {inquiries.map((inq) => {
              const status = STATUS_CONFIG[inq.status] || STATUS_CONFIG.new;
              const hasQuote = inq.quotedPrice !== null;

              return (
                <div key={inq.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Hash className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {inq.inquiryNumber || inq.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      {STEPS.map((stepLabel, idx) => {
                        const done = idx < status.step;
                        const current = idx === status.step - 1;
                        return (
                          <div key={stepLabel} className="flex flex-col items-center flex-1">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium mb-1 ${
                              done && !current
                                ? 'bg-green-500 text-white'
                                : current
                                  ? 'bg-gray-900 text-white'
                                  : 'bg-gray-100 text-gray-400'
                            }`}>
                              {done && !current ? <CheckCircle className="w-3.5 h-3.5" /> : idx + 1}
                            </div>
                            <span className={`text-[10px] text-center ${done ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                              {stepLabel}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-1 mt-1">
                      {[0, 1, 2].map(idx => (
                        <div
                          key={idx}
                          className={`flex-1 h-0.5 rounded-full ${idx < status.step - 1 ? 'bg-green-400' : 'bg-gray-100'}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="px-5 py-4 grid grid-cols-2 gap-4">
                    {inq.modelNumber && (
                      <div className="flex items-start gap-2">
                        <Package className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[11px] text-gray-400 mb-0.5">Product</p>
                          <p className="text-sm text-gray-900">{inq.modelNumber}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[11px] text-gray-400 mb-0.5">Delivery city</p>
                        <p className="text-sm text-gray-900">{inq.deliveryCity}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 mb-0.5">Quantity</p>
                      <p className="text-sm text-gray-900">{inq.quantity} units</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 mb-0.5">Submitted</p>
                      <p className="text-sm text-gray-900">
                        {new Date(inq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    {inq.productPhoto && (
                      <div className="col-span-2">
                        <p className="text-[11px] text-gray-400 mb-2">Product photo</p>
                        <ImagePreview
                          src={`${API_BASE_URL}${inq.productPhoto}`}
                          alt="Product Photo"
                          className="w-full h-40"
                        />
                      </div>
                    )}
                  </div>

                  {/* Quote */}
                  {hasQuote && (
                    <div className="mx-5 mb-5 bg-green-50 rounded-xl border border-green-100 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <IndianRupee className="w-4 h-4 text-green-700" />
                        <h4 className="text-sm font-semibold text-green-900">Your Quote</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[11px] text-green-600 mb-0.5">Price per unit</p>
                          <p className="text-xl font-semibold text-green-900">
                            ₹{inq.quotedPrice!.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-green-600 mb-0.5">Shipping</p>
                          <p className="text-xl font-semibold text-green-900">
                            ₹{(inq.shippingCost || 0).toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div className="col-span-2 border-t border-green-200 pt-3 flex items-center justify-between">
                          <p className="text-[11px] text-green-600">
                            Total ({inq.quantity} units + shipping)
                          </p>
                          <p className="text-2xl font-semibold text-green-900">
                            ₹{(inq.totalPrice || 0).toLocaleString('en-IN')}
                          </p>
                        </div>
                        {inq.estimatedDelivery && (
                          <div className="col-span-2 flex items-center gap-2">
                            <Truck className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-sm text-green-800">Delivery: {inq.estimatedDelivery}</span>
                          </div>
                        )}
                        {inq.responseNotes && (
                          <div className="col-span-2 flex items-start gap-2">
                            <MessageSquare className="w-3.5 h-3.5 text-green-600 mt-0.5" />
                            <p className="text-sm text-green-800">{inq.responseNotes}</p>
                          </div>
                        )}
                      </div>
                      {inq.respondedAt && (
                        <p className="text-[11px] text-green-500 mt-3">
                          Quote sent on {new Date(inq.respondedAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Status message */}
                  <div className="px-5 pb-4">
                    {inq.status === 'new' && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <Clock className="w-3.5 h-3.5" />
                        Received. Our team will contact you within 30 minutes.
                      </div>
                    )}
                    {inq.status === 'contacted' && (
                      <div className="flex items-center gap-2 text-sm text-amber-600">
                        <Phone className="w-3.5 h-3.5" />
                        We're sourcing the best price for you. Stay tuned!
                      </div>
                    )}
                    {inq.status === 'quoted' && hasQuote && (
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Quote is ready — call us to confirm your order.
                      </div>
                    )}
                    {inq.status === 'closed' && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CheckCircle className="w-3.5 h-3.5" />
                        This inquiry is closed. Submit a new one if needed.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
