import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Clock, CheckCircle, Phone, MapPin, Package, ArrowRight, AlertCircle, Loader2, IndianRupee, Truck, MessageSquare, Hash } from 'lucide-react';
import { api } from '../lib/api';

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

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock; step: number }> = {
  new: { label: 'Received', color: 'bg-blue-100 text-blue-800', icon: Clock, step: 1 },
  contacted: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: Phone, step: 2 },
  quoted: { label: 'Quote Ready', color: 'bg-green-100 text-green-800', icon: CheckCircle, step: 3 },
  closed: { label: 'Closed', color: 'bg-neutral-100 text-neutral-800', icon: CheckCircle, step: 4 },
};

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
      setError(searchBy === 'phone' ? 'Please enter your phone number.' : 'Please enter your inquiry number.');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const params = searchBy === 'phone' ? { phone: query } : { number: query };
      const res = await api.get('/inquiry/track', { params });
      setInquiries(res.data.inquiries);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setInquiries([]);
        setError(searchBy === 'phone'
          ? 'No inquiries found for this phone number.'
          : 'No inquiry found with this number. Please check and try again.');
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

  const steps = ['Received', 'In Progress', 'Quote Ready', 'Done'];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-neutral-900 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black mb-3">Track Your Inquiry</h1>
          <p className="text-neutral-400 text-lg">
            Check the status of your product inquiry — no sign-in required.
          </p>
        </div>
      </div>

      {/* Search Box */}
      <div className="max-w-2xl mx-auto px-4 -mt-8">
        <div className="bg-white border-2 border-neutral-900 p-6 shadow-brutal">
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setSearchBy('phone')}
              className={`px-4 py-2 text-sm font-bold ${searchBy === 'phone' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'} transition-colors`}
            >
              Search by Phone
            </button>
            <button
              type="button"
              onClick={() => setSearchBy('number')}
              className={`px-4 py-2 text-sm font-bold ${searchBy === 'number' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'} transition-colors`}
            >
              Search by Inquiry Number
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-3">
            {searchBy === 'phone' ? (
              <input
                type="tel"
                placeholder="Enter your 10-digit phone number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-neutral-200 focus:border-neutral-900 outline-none text-sm"
              />
            ) : (
              <input
                type="text"
                placeholder="e.g. HUB-HAVELLS-MCB-0001"
                value={inquiryNumber}
                onChange={e => setInquiryNumber(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-neutral-200 focus:border-neutral-900 outline-none text-sm font-mono uppercase"
              />
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-accent-500 text-white font-bold hover:bg-accent-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              Track
            </button>
          </form>

          {error && (
            <div className="mt-4 flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-400 mx-auto mb-3" />
            <p className="text-neutral-500">Looking up your inquiries...</p>
          </div>
        )}

        {!loading && searched && inquiries.length > 0 && (
          <div className="space-y-6">
            <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider">
              {inquiries.length} inquiry{inquiries.length !== 1 ? 'ies' : ''} found
            </p>

            {inquiries.map((inq) => {
              const status = statusConfig[inq.status] || statusConfig.new;
              const StatusIcon = status.icon;
              const hasQuote = inq.quotedPrice !== null;
              return (
                <div key={inq.id} className="bg-white border-2 border-neutral-200 hover:border-neutral-900 transition-colors overflow-hidden">
                  {/* Header with Inquiry Number & Status */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50">
                    <div className="flex items-center gap-3">
                      <Hash className="w-4 h-4 text-neutral-400" />
                      <span className="font-mono font-bold text-neutral-900">
                        {inq.inquiryNumber || inq.id.slice(0, 8)}
                      </span>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider ${status.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {status.label}
                    </span>
                  </div>

                  {/* Progress Steps */}
                  <div className="px-6 py-4 border-b border-neutral-100">
                    <div className="flex items-center justify-between">
                      {steps.map((stepLabel, idx) => {
                        const isActive = idx < status.step;
                        const isCurrent = idx === status.step - 1;
                        return (
                          <div key={stepLabel} className="flex flex-col items-center flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              isActive
                                ? isCurrent ? 'bg-accent-500 text-white' : 'bg-green-500 text-white'
                                : 'bg-neutral-200 text-neutral-400'
                            }`}>
                              {isActive && !isCurrent ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                            </div>
                            <span className={`text-xs mt-1 ${isActive ? 'font-bold text-neutral-900' : 'text-neutral-400'}`}>
                              {stepLabel}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex mt-2 mx-4">
                      {[0, 1, 2].map(idx => (
                        <div key={idx} className={`flex-1 h-1 mx-1 ${idx < status.step - 1 ? 'bg-green-500' : 'bg-neutral-200'}`} />
                      ))}
                    </div>
                  </div>

                  {/* Inquiry Details */}
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      {inq.modelNumber && (
                        <div className="flex items-start gap-2">
                          <Package className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Product</p>
                            <p className="text-sm text-neutral-900 font-medium">{inq.modelNumber}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Delivery City</p>
                          <p className="text-sm text-neutral-900 font-medium">{inq.deliveryCity}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Quantity</p>
                        <p className="text-sm text-neutral-900 font-medium">{inq.quantity} units</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Submitted</p>
                        <p className="text-sm text-neutral-900 font-medium">
                          {new Date(inq.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </p>
                      </div>
                      {inq.productPhoto && (
                        <div className="col-span-2">
                          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Your Product Photo</p>
                          <img
                            src={inq.productPhoto}
                            alt="Product"
                            className="w-24 h-24 object-cover border-2 border-neutral-200"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quote Response (shown when admin has responded) */}
                  {hasQuote && (
                    <div className="mx-6 mb-4 bg-green-50 border-2 border-green-200 p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <IndianRupee className="w-5 h-5 text-green-700" />
                        <h4 className="font-black text-green-900 text-lg">Your Quote</h4>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-green-600">Price per Unit</p>
                          <p className="text-2xl font-black text-green-900">
                            ₹{inq.quotedPrice!.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-green-600">Shipping</p>
                          <p className="text-2xl font-black text-green-900">
                            ₹{(inq.shippingCost || 0).toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div className="col-span-2 border-t border-green-200 pt-3 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-green-600">
                              Total ({inq.quantity} units + shipping)
                            </p>
                          </div>
                          <p className="text-3xl font-black text-green-900">
                            ₹{(inq.totalPrice || 0).toLocaleString('en-IN')}
                          </p>
                        </div>
                        {inq.estimatedDelivery && (
                          <div className="col-span-2 flex items-center gap-2 pt-2">
                            <Truck className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-bold text-green-800">
                              Delivery: {inq.estimatedDelivery}
                            </span>
                          </div>
                        )}
                        {inq.responseNotes && (
                          <div className="col-span-2 pt-2">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="w-4 h-4 text-green-600 mt-0.5" />
                              <p className="text-sm text-green-800">{inq.responseNotes}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {inq.respondedAt && (
                        <p className="text-xs text-green-500 mt-3">
                          Quote sent on {new Date(inq.respondedAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Status Messages */}
                  <div className="px-6 py-3 border-t border-neutral-100 bg-neutral-50">
                    {inq.status === 'new' && !hasQuote && (
                      <p className="text-sm text-blue-600 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Your inquiry has been received. Our team will contact you within 30 minutes.
                      </p>
                    )}
                    {inq.status === 'contacted' && !hasQuote && (
                      <p className="text-sm text-yellow-700 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        We're working on finding you the best price. Stay tuned!
                      </p>
                    )}
                    {inq.status === 'quoted' && hasQuote && (
                      <p className="text-sm text-green-700 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Your quote is ready! Call us or reply to confirm your order.
                      </p>
                    )}
                    {inq.status === 'closed' && (
                      <p className="text-sm text-neutral-500 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        This inquiry has been closed. Submit a new one if you need help!
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && searched && inquiries.length === 0 && !error && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500 mb-6">No inquiries found for this {searchBy === 'phone' ? 'phone number' : 'inquiry number'}.</p>
            <Link to="/" className="inline-flex items-center gap-2 bg-accent-500 text-white px-6 py-3 font-bold text-sm hover:bg-accent-600 transition-colors">
              Submit an Inquiry
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {!searched && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500">Enter your phone number or inquiry number above to see the status of your requests.</p>
          </div>
        )}
      </div>
    </div>
  );
}