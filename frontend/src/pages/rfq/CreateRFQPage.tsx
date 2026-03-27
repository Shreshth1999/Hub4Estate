import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { rfqApi, productsApi } from '../../lib/api';
import { useRFQStore } from '../../lib/store';
import {
  Package, MapPin, FileText, Send, Plus, Minus, Trash2,
  Search, ChevronRight, ChevronLeft, Sparkles, Loader2,
  CheckCircle, ArrowRight,
} from 'lucide-react';

const STEPS = [
  { label: 'Products', desc: 'Select items' },
  { label: 'Details', desc: 'Location & title' },
  { label: 'Review', desc: 'Confirm & publish' },
];

const DELIVERY_PREFS = [
  { id: 'delivery', label: 'Home delivery', desc: 'Delivered to your doorstep' },
  { id: 'pickup', label: 'Store pickup', desc: 'Collect from dealer' },
  { id: 'both', label: 'Flexible', desc: 'Best price option' },
];

interface SearchResult {
  id: string;
  name: string;
  brand: { name: string };
  productType: { name: string };
}

export function CreateRFQPage() {
  const navigate = useNavigate();
  const { items, addItem, removeItem, updateQuantity, clearItems } = useRFQStore();

  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    deliveryCity: '',
    deliveryPincode: '',
    deliveryAddress: '',
    deliveryPreference: 'both',
  });

  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await productsApi.searchProducts({ q: searchQuery, limit: 8 });
        setSearchResults(res.data.products || []);
      } catch { /* noop */ }
      finally { setIsSearching(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddProduct = (product: SearchResult) => {
    if (items.find(i => i.productId === product.id)) return;
    addItem({ productId: product.id, name: product.name, brand: product.brand.name, quantity: 1 });
    setSearchQuery('');
    setSearchResults([]);
  };

  const validate = (s: number) => {
    setError('');
    if (s === 0 && items.length === 0) { setError('Add at least one product.'); return false; }
    if (s === 1) {
      if (!form.title.trim() || form.title.length < 5) { setError('Enter a title (min 5 characters).'); return false; }
      if (!form.deliveryCity.trim()) { setError('Enter your city.'); return false; }
      if (form.deliveryPincode.length !== 6) { setError('Enter a valid 6-digit pincode.'); return false; }
    }
    return true;
  };

  const next = () => { if (validate(step)) setStep(s => s + 1); };
  const back = () => { setError(''); setStep(s => s - 1); };

  const publish = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await rfqApi.create({
        title: form.title,
        description: form.description || undefined,
        deliveryCity: form.deliveryCity,
        deliveryPincode: form.deliveryPincode,
        deliveryAddress: form.deliveryAddress || undefined,
        deliveryPreference: form.deliveryPreference as 'delivery' | 'pickup' | 'both',
        urgency: 'normal',
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity, notes: i.notes })),
      });
      const rfqId = res.data.rfq.id;
      await rfqApi.publish(rfqId);
      clearItems();
      navigate(`/rfq/${rfqId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to publish. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <h1 className="text-lg font-semibold text-gray-900">New RFQ</h1>
        <p className="text-sm text-gray-500 mt-0.5">Post a requirement and get quotes from verified dealers</p>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mt-4">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  i < step ? 'bg-green-500 text-white' :
                  i === step ? 'bg-gray-900 text-white' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {i < step ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${
                  i === step ? 'text-gray-900' : 'text-gray-400'
                }`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-px ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-6">

          {error && (
            <div className="mb-5 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3.5 py-3">
              <span>{error}</span>
            </div>
          )}

          {/* Step 0: Products */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-400" /> What do you need?
                </h2>
                <p className="text-sm text-gray-500">Search and add products to your request</p>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by product name or brand..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors"
                />
                {(searchResults.length > 0 || isSearching) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-72 overflow-y-auto">
                    {isSearching ? (
                      <div className="p-4 text-center text-sm text-gray-400 flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Searching...
                      </div>
                    ) : searchResults.map(product => (
                      <button
                        key={product.id}
                        onClick={() => handleAddProduct(product)}
                        disabled={items.some(i => i.productId === product.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left disabled:opacity-40 border-b border-gray-100 last:border-0"
                      >
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.brand.name}</p>
                        </div>
                        {items.some(i => i.productId === product.id) ? (
                          <span className="text-xs text-green-600 font-medium">Added</span>
                        ) : (
                          <Plus className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected items */}
              <div>
                <p className="text-xs text-gray-400 font-medium mb-2">
                  {items.length} item{items.length !== 1 ? 's' : ''} added
                </p>
                {items.length === 0 ? (
                  <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center">
                    <Package className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No products added yet</p>
                    <Link to="/user/categories" className="text-xs text-gray-500 hover:text-gray-900 mt-1 inline-flex items-center gap-1">
                      Browse catalog <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {items.map(item => (
                      <div key={item.productId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-gray-400">{item.brand}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                            className="w-7 h-7 border border-gray-200 rounded-md flex items-center justify-center bg-white hover:bg-gray-50 text-gray-600"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="w-7 h-7 border border-gray-200 rounded-md flex items-center justify-center bg-white hover:bg-gray-50 text-gray-600"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button onClick={() => removeItem(item.productId)} className="text-gray-300 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 1: Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" /> Where do you need it?
                </h2>
                <p className="text-sm text-gray-500">Add delivery details and a title for your request</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  RFQ Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Electrical items for 3BHK apartment"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    City <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Mumbai"
                    value={form.deliveryCity}
                    onChange={e => setForm(f => ({ ...f, deliveryCity: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Pincode <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="6-digit pincode"
                    value={form.deliveryPincode}
                    onChange={e => setForm(f => ({ ...f, deliveryPincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
                <textarea
                  rows={3}
                  placeholder="Any specific requirements for dealers..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery preference</label>
                <div className="grid grid-cols-3 gap-2">
                  {DELIVERY_PREFS.map(pref => (
                    <button
                      key={pref.id}
                      onClick={() => setForm(f => ({ ...f, deliveryPreference: pref.id }))}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        form.deliveryPreference === pref.id
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="text-xs font-medium text-gray-900">{pref.label}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{pref.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" /> Review your request
                </h2>
                <p className="text-sm text-gray-500">Everything looks good? Publish to get quotes.</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Title</span>
                  <span className="text-gray-900 font-medium text-right max-w-xs truncate">{form.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Location</span>
                  <span className="text-gray-900 font-medium">{form.deliveryCity}, {form.deliveryPincode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Delivery</span>
                  <span className="text-gray-900 font-medium capitalize">{form.deliveryPreference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Products</span>
                  <span className="text-gray-900 font-medium">{items.length} item{items.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                {items.map(item => (
                  <div key={item.productId} className="flex items-center justify-between text-sm px-3 py-2 bg-white border border-gray-100 rounded-lg">
                    <span className="text-gray-700 truncate mr-2">{item.name}</span>
                    <span className="text-gray-400 flex-shrink-0">×{item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 bg-blue-50 rounded-lg p-3">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                Verified dealers in {form.deliveryCity} will receive this and submit competitive quotes.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
            {step > 0 ? (
              <button
                onClick={back}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}

            {step < 2 ? (
              <button
                onClick={next}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={publish}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Publishing...</>
                ) : (
                  <><Send className="w-4 h-4" /> Publish & get quotes</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
