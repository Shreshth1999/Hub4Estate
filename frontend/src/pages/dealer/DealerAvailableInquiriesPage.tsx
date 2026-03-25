import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { ImagePreview } from '../../components/common/ImagePreview';
import {
  Package, Phone, MapPin, Search, Loader2, Image as ImageIcon,
  Hash, User, Calendar, AlertCircle, Send, IndianRupee, Truck, X,
  CheckCircle, Filter, Bell
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

interface Inquiry {
  id: string;
  inquiryNumber: string;
  name: string;
  phone: string;
  email: string | null;
  productPhoto: string | null;
  modelNumber: string | null;
  quantity: number;
  deliveryCity: string;
  notes: string | null;
  status: string;
  createdAt: string;
  category: Category | null;
  identifiedBrand: Brand | null;
  dealerResponse: {
    status: string;
    quotedPrice: number;
  } | null;
}

export function DealerAvailableInquiriesPage() {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Quote modal
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [quoteForm, setQuoteForm] = useState({
    quotedPrice: '',
    shippingCost: '',
    estimatedDelivery: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dealer-inquiry/available', {
        params: { page, limit: 20 },
      });
      setInquiries(res.data.data || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.pages || 1);
    } catch (err: any) {
      console.error('Failed to fetch inquiries:', err);
      if (err.response?.status === 401) {
        navigate('/dealer/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const openQuoteModal = (inq: Inquiry) => {
    setSelectedInquiry(inq);
    setQuoteForm({
      quotedPrice: inq.dealerResponse?.quotedPrice.toString() || '',
      shippingCost: '',
      estimatedDelivery: '',
      notes: '',
    });
  };

  const handleSubmitQuote = async () => {
    if (!selectedInquiry) return;
    setSubmitting(true);
    try {
      const body: any = {
        quotedPrice: parseFloat(quoteForm.quotedPrice),
        shippingCost: parseFloat(quoteForm.shippingCost) || 0,
        estimatedDelivery: quoteForm.estimatedDelivery,
        notes: quoteForm.notes,
      };

      await api.post(`/dealer-inquiry/${selectedInquiry.id}/quote`, body);
      setSelectedInquiry(null);
      fetchInquiries();
      alert('Quote submitted successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit quote');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-neutral-900 text-white">
        <div className="container-custom py-12">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500 text-white text-sm font-bold uppercase tracking-wider mb-4">
              <Bell className="w-4 h-4" />
              Product Inquiries
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Available Product Inquiries
            </h1>
            <p className="mt-2 text-neutral-300 font-medium">
              View and respond to product inquiries from customers. Submit quotes to win orders.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-accent-500 text-white py-3">
        <div className="container-custom">
          <div className="flex items-center justify-center gap-6 text-sm font-bold">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span>{total} inquiries available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
          </div>
        ) : inquiries.length === 0 ? (
          <div className="text-center py-20 bg-neutral-50 border-2 border-neutral-200">
            <Package className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
            <h3 className="font-bold text-neutral-900 text-lg mb-2">No Inquiries Available</h3>
            <p className="text-neutral-500">
              No product inquiries match your profile yet. Check back later!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {inquiries.map((inq) => (
              <div
                key={inq.id}
                className="border-2 border-neutral-200 bg-white hover:border-neutral-400 transition-colors"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100 bg-neutral-50">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-neutral-900">
                      {inq.inquiryNumber}
                    </span>
                    {inq.category && (
                      <span className="px-2.5 py-1 text-xs font-bold uppercase bg-blue-100 text-blue-800">
                        {inq.category.name}
                      </span>
                    )}
                    {inq.identifiedBrand && (
                      <span className="px-2.5 py-1 text-xs font-bold bg-purple-100 text-purple-800">
                        {inq.identifiedBrand.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(inq.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                {/* Main Content */}
                <div className="px-5 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Customer Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-neutral-400" />
                        <span className="font-bold text-neutral-900">{inq.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-neutral-400" />
                        <a
                          href={`tel:${inq.phone}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {inq.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-neutral-400" />
                        <span className="text-sm text-neutral-600">{inq.deliveryCity}</span>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-2">
                      {inq.modelNumber && (
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-neutral-400" />
                          <span className="text-sm font-medium text-neutral-900">
                            {inq.modelNumber}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-neutral-400" />
                        <span className="text-sm text-neutral-600">Qty: {inq.quantity}</span>
                      </div>
                      {inq.notes && (
                        <div className="flex items-start gap-2">
                          <span className="text-sm text-neutral-500 italic">"{inq.notes}"</span>
                        </div>
                      )}
                    </div>

                    {/* Product Photo */}
                    <div>
                      {inq.productPhoto ? (
                        <div className="w-full h-32">
                          <ImagePreview
                            src={`${API_BASE_URL}${inq.productPhoto}`}
                            alt="Product Photo"
                            className="w-full h-32"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-32 bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 items-end justify-center">
                      {inq.dealerResponse ? (
                        <div className="bg-green-50 border border-green-200 p-3 w-full">
                          <p className="text-xs font-bold uppercase text-green-700 mb-1">
                            <CheckCircle className="w-3 h-3 inline mr-1" />
                            Quote Submitted
                          </p>
                          <p className="text-lg font-black text-green-800">
                            ₹{inq.dealerResponse.quotedPrice.toLocaleString('en-IN')}
                            <span className="text-xs font-normal">/unit</span>
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => openQuoteModal(inq)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent-500 text-white font-bold text-sm hover:bg-accent-600 transition-colors"
                        >
                          <Send className="w-4 h-4" />
                          Submit Quote
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-neutral-500">
              Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-bold bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-bold bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quote Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-neutral-900 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-neutral-200 bg-neutral-50">
              <div>
                <h2 className="text-lg font-black text-neutral-900">
                  Submit Quote for {selectedInquiry.inquiryNumber}
                </h2>
                <p className="text-sm text-neutral-500">
                  {selectedInquiry.name} — {selectedInquiry.deliveryCity}
                </p>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-2 hover:bg-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inquiry Summary */}
            <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-bold text-neutral-700">Product:</span>{' '}
                  <span className="text-neutral-900">
                    {selectedInquiry.modelNumber || 'See photo'}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-neutral-700">Quantity:</span>{' '}
                  <span className="text-neutral-900">{selectedInquiry.quantity} units</span>
                </div>
                <div>
                  <span className="font-bold text-neutral-700">Delivery City:</span>{' '}
                  <span className="text-neutral-900">{selectedInquiry.deliveryCity}</span>
                </div>
                {selectedInquiry.category && (
                  <div>
                    <span className="font-bold text-neutral-700">Category:</span>{' '}
                    <span className="text-neutral-900">{selectedInquiry.category.name}</span>
                  </div>
                )}
              </div>
              {selectedInquiry.productPhoto && (
                <div className="mt-4">
                  <ImagePreview
                    src={`${API_BASE_URL}${selectedInquiry.productPhoto}`}
                    alt="Product"
                    className="w-full max-w-sm h-48"
                  />
                </div>
              )}
            </div>

            {/* Quote Form */}
            <div className="px-6 py-5 space-y-4">
              <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                <IndianRupee className="w-5 h-5" /> Pricing & Delivery
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Price per Unit (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="e.g. 125.50"
                    value={quoteForm.quotedPrice}
                    onChange={(e) =>
                      setQuoteForm((f) => ({ ...f, quotedPrice: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 border-2 border-neutral-200 focus:border-neutral-900 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Shipping Cost (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 50"
                    value={quoteForm.shippingCost}
                    onChange={(e) =>
                      setQuoteForm((f) => ({ ...f, shippingCost: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 border-2 border-neutral-200 focus:border-neutral-900 outline-none text-sm"
                  />
                </div>
              </div>

              {/* Auto-calculated total */}
              {quoteForm.quotedPrice && (
                <div className="bg-green-50 border border-green-200 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-green-700">
                      Total Price (auto-calculated)
                    </p>
                    <p className="text-sm text-green-600 mt-0.5">
                      (₹{parseFloat(quoteForm.quotedPrice).toLocaleString('en-IN')} x{' '}
                      {selectedInquiry.quantity})
                      {quoteForm.shippingCost
                        ? ` + ₹${parseFloat(quoteForm.shippingCost).toLocaleString('en-IN')} shipping`
                        : ''}
                    </p>
                  </div>
                  <p className="text-2xl font-black text-green-800">
                    ₹
                    {(
                      (parseFloat(quoteForm.quotedPrice) || 0) * selectedInquiry.quantity +
                      (parseFloat(quoteForm.shippingCost) || 0)
                    ).toLocaleString('en-IN')}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  <Truck className="w-3.5 h-3.5 inline mr-1" /> Estimated Delivery Time
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3-5 business days"
                  value={quoteForm.estimatedDelivery}
                  onChange={(e) =>
                    setQuoteForm((f) => ({ ...f, estimatedDelivery: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 border-2 border-neutral-200 focus:border-neutral-900 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Additional Notes
                </label>
                <textarea
                  placeholder="e.g. Price includes GST. Brand: Havells. 1 year warranty..."
                  value={quoteForm.notes}
                  onChange={(e) => setQuoteForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 border-2 border-neutral-200 focus:border-neutral-900 outline-none text-sm resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t-2 border-neutral-200 bg-neutral-50 flex items-center justify-between">
              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-6 py-2.5 text-sm font-bold text-neutral-600 hover:text-neutral-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitQuote}
                disabled={submitting || !quoteForm.quotedPrice}
                className="flex items-center gap-2 px-8 py-2.5 bg-green-600 text-white font-bold text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Submit Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
