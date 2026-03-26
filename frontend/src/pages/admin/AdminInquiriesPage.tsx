import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { ImagePreview } from '../../components/common/ImagePreview';
import {
  Package, Phone, MapPin, Clock, Search, Filter, ChevronRight,
  Send, IndianRupee, Truck, X, Loader2, Image, Hash, User, Calendar,
  CheckCircle, AlertCircle, MessageSquare, Zap
} from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001/api').replace(/\/api$/, '');

interface Inquiry {
  id: string;
  inquiryNumber: string | null;
  name: string;
  phone: string;
  email: string | null;
  productPhoto: string | null;
  modelNumber: string | null;
  quantity: number;
  deliveryCity: string;
  notes: string | null;
  status: string;
  internalNotes: string | null;
  quotedPrice: number | null;
  shippingCost: number | null;
  totalPrice: number | null;
  estimatedDelivery: string | null;
  responseNotes: string | null;
  respondedAt: string | null;
  respondedBy: string | null;
  createdAt: string;
  updatedAt: string;
  pipeline?: {
    id: string;
    status: string;
    identifiedBrand: string | null;
  } | null;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: 'New', color: 'text-blue-800', bg: 'bg-blue-100' },
  contacted: { label: 'Contacted', color: 'text-yellow-800', bg: 'bg-yellow-100' },
  quoted: { label: 'Quoted', color: 'text-green-800', bg: 'bg-green-100' },
  closed: { label: 'Closed', color: 'text-gray-800', bg: 'bg-gray-100' },
};

export function AdminInquiriesPage() {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  // Response modal
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [responseForm, setResponseForm] = useState({
    quotedPrice: '',
    shippingCost: '',
    estimatedDelivery: '',
    responseNotes: '',
    internalNotes: '',
  });
  const [responding, setResponding] = useState(false);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;

      const res = await api.get('/inquiry/admin/list', { params });
      setInquiries(res.data.data);
      setTotalPages(res.data.pages);
      setTotal(res.data.total);
      setStatusCounts(res.data.statusCounts || {});
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchInquiries();
  };

  const openResponse = (inq: Inquiry) => {
    setSelectedInquiry(inq);
    setResponseForm({
      quotedPrice: inq.quotedPrice?.toString() || '',
      shippingCost: inq.shippingCost?.toString() || '',
      estimatedDelivery: inq.estimatedDelivery || '',
      responseNotes: inq.responseNotes || '',
      internalNotes: inq.internalNotes || '',
    });
  };

  const handleRespond = async () => {
    if (!selectedInquiry) return;
    setResponding(true);
    try {
      const body: any = {};
      if (responseForm.quotedPrice) body.quotedPrice = parseFloat(responseForm.quotedPrice);
      if (responseForm.shippingCost) body.shippingCost = parseFloat(responseForm.shippingCost);
      if (responseForm.estimatedDelivery) body.estimatedDelivery = responseForm.estimatedDelivery;
      if (responseForm.responseNotes) body.responseNotes = responseForm.responseNotes;
      if (responseForm.internalNotes) body.internalNotes = responseForm.internalNotes;

      // Auto-calculate total
      if (body.quotedPrice && body.shippingCost !== undefined) {
        body.totalPrice = (body.quotedPrice * selectedInquiry.quantity) + (body.shippingCost || 0);
      }

      await api.patch(`/inquiry/admin/${selectedInquiry.id}/respond`, body);
      setSelectedInquiry(null);
      fetchInquiries();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to send response');
    } finally {
      setResponding(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/inquiry/admin/${id}/status`, { status });
      fetchInquiries();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const totalAll = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Product Inquiries</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          View and respond to customer product inquiries. Send prices, shipping costs, and delivery timelines.
        </p>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-1">
        {[
          { key: 'all', label: 'All', count: totalAll },
          { key: 'new', label: 'New', count: statusCounts['new'] || 0 },
          { key: 'contacted', label: 'Contacted', count: statusCounts['contacted'] || 0 },
          { key: 'quoted', label: 'Quoted', count: statusCounts['quoted'] || 0 },
          { key: 'closed', label: 'Closed', count: statusCounts['closed'] || 0 },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => { setStatusFilter(tab.key); setPage(1); }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
              statusFilter === tab.key
                ? 'bg-gray-900 text-white'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {tab.label}
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
              statusFilter === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, model number, inquiry number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:border-gray-400 outline-none text-sm transition-colors"
          />
        </div>
        <button type="submit" className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
          Search
        </button>
      </form>

      {/* Inquiries List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-14 text-center">
          <Package className="w-8 h-8 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">No inquiries found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {inquiries.map(inq => {
            const st = statusConfig[inq.status] || statusConfig.new;
            return (
              <div
                key={inq.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                {/* Top row */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${st.bg} ${st.color}`}>
                      {st.label}
                    </span>
                    <span className="font-mono text-xs text-gray-400">
                      {inq.inquiryNumber || inq.id.slice(0, 8)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {new Date(inq.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </div>
                </div>

                {/* Main content */}
                <div className="px-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Customer Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{inq.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <a href={`tel:${inq.phone}`} className="text-sm text-blue-600 hover:underline">{inq.phone}</a>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm text-gray-600">{inq.deliveryCity}</span>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-2">
                      {inq.modelNumber && (
                        <div className="flex items-center gap-2">
                          <Hash className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{inq.modelNumber}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm text-gray-600">Qty: {inq.quantity}</span>
                      </div>
                      {inq.productPhoto && (
                        <div className="mt-1.5">
                          <p className="text-xs text-gray-400 mb-1">Product Photo</p>
                          <ImagePreview
                            src={`${API_BASE_URL}${inq.productPhoto}`}
                            alt="Product Photo"
                            className="w-20 h-20"
                          />
                        </div>
                      )}
                      {inq.notes && (
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                          <span className="text-xs text-gray-500 italic">"{inq.notes}"</span>
                        </div>
                      )}
                    </div>

                    {/* Quote Status */}
                    <div>
                      {inq.quotedPrice ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-1">
                          <p className="text-xs font-medium text-green-700">Quote Sent</p>
                          <p className="text-base font-semibold text-green-800">
                            ₹{inq.quotedPrice.toLocaleString('en-IN')}<span className="text-xs font-normal">/unit</span>
                          </p>
                          <p className="text-xs text-green-600">Shipping: ₹{(inq.shippingCost || 0).toLocaleString('en-IN')}</p>
                          <p className="text-xs text-green-600">Total: ₹{(inq.totalPrice || 0).toLocaleString('en-IN')}</p>
                          {inq.estimatedDelivery && (
                            <p className="text-xs text-green-600">Delivery: {inq.estimatedDelivery}</p>
                          )}
                        </div>
                      ) : (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                          <AlertCircle className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                          <p className="text-xs font-medium text-amber-700">Awaiting Response</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => navigate(`/admin/inquiries/${inq.id}/pipeline`)}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          inq.pipeline
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        {inq.pipeline ? `Pipeline (${inq.pipeline.status.replace(/_/g, ' ')})` : 'Start Pipeline'}
                      </button>
                      <button
                        onClick={() => openResponse(inq)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        {inq.quotedPrice ? 'Update Quote' : 'Quick Quote'}
                      </button>
                      {inq.status === 'new' && (
                        <button
                          onClick={() => updateStatus(inq.id, 'contacted')}
                          className="w-full text-xs text-gray-500 hover:text-gray-900 py-1 font-medium transition-colors"
                        >
                          Mark as Contacted
                        </button>
                      )}
                      {inq.status !== 'closed' && (
                        <button
                          onClick={() => updateStatus(inq.id, 'closed')}
                          className="w-full text-xs text-gray-400 hover:text-red-600 py-1 transition-colors"
                        >
                          Close Inquiry
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3.5 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3.5 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Respond to {selectedInquiry.inquiryNumber || selectedInquiry.name}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedInquiry.name} — {selectedInquiry.phone} — {selectedInquiry.deliveryCity}
                </p>
              </div>
              <button onClick={() => setSelectedInquiry(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inquiry Summary */}
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-gray-400">Product: </span>
                  <span className="font-medium text-gray-900">{selectedInquiry.modelNumber || 'See photo'}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Quantity: </span>
                  <span className="font-medium text-gray-900">{selectedInquiry.quantity} units</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Delivery: </span>
                  <span className="font-medium text-gray-900">{selectedInquiry.deliveryCity}</span>
                </div>
                {selectedInquiry.productPhoto && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400 mb-2">Product Photo</p>
                    <ImagePreview
                      src={`${API_BASE_URL}${selectedInquiry.productPhoto}`}
                      alt="Product Photo"
                      className="w-full max-w-sm h-48"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Response Form */}
            <div className="px-5 py-5 space-y-4">
              <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-gray-400" /> Pricing & Delivery
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Price per Unit (₹)</label>
                  <input
                    type="number" step="0.01" min="0" placeholder="e.g. 1250"
                    value={responseForm.quotedPrice}
                    onChange={e => setResponseForm(f => ({ ...f, quotedPrice: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Shipping Cost (₹)</label>
                  <input
                    type="number" step="0.01" min="0" placeholder="e.g. 200"
                    value={responseForm.shippingCost}
                    onChange={e => setResponseForm(f => ({ ...f, shippingCost: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors"
                  />
                </div>
              </div>

              {responseForm.quotedPrice && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-green-700">Total (auto-calculated)</p>
                    <p className="text-xs text-green-600 mt-0.5">
                      ₹{parseFloat(responseForm.quotedPrice).toLocaleString('en-IN')} × {selectedInquiry.quantity}
                      {responseForm.shippingCost ? ` + ₹${parseFloat(responseForm.shippingCost).toLocaleString('en-IN')} shipping` : ''}
                    </p>
                  </div>
                  <p className="text-xl font-semibold text-green-800">
                    ₹{(
                      (parseFloat(responseForm.quotedPrice) || 0) * selectedInquiry.quantity +
                      (parseFloat(responseForm.shippingCost) || 0)
                    ).toLocaleString('en-IN')}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Estimated Delivery Time
                </label>
                <input
                  type="text" placeholder="e.g. 3-5 business days"
                  value={responseForm.estimatedDelivery}
                  onChange={e => setResponseForm(f => ({ ...f, estimatedDelivery: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Notes to Customer (visible)</label>
                <textarea
                  placeholder="e.g. Price includes GST. Brand: Havells. 1 year warranty..."
                  value={responseForm.responseNotes}
                  onChange={e => setResponseForm(f => ({ ...f, responseNotes: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Internal Notes (not visible to customer)</label>
                <textarea
                  placeholder="Internal notes for your team..."
                  value={responseForm.internalNotes}
                  onChange={e => setResponseForm(f => ({ ...f, internalNotes: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-100 rounded-lg text-sm focus:outline-none focus:border-gray-300 transition-colors resize-none text-gray-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRespond}
                disabled={responding || !responseForm.quotedPrice}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {responding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Quote to Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}