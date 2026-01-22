import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { rfqApi, productsApi } from '../../lib/api';
import { useRFQStore } from '../../lib/store';
import { Stepper, Button, Input, Alert, EmptyState } from '../../components/ui';
import {
  Package, MapPin, FileText, Send, Plus, Minus, Trash2,
  Search, ChevronRight, ChevronLeft, Lightbulb, AlertTriangle, Sparkles,
  Clock, Shield, Zap, ArrowRight, Users, CheckCircle
} from 'lucide-react';

const steps = [
  { label: 'Products', description: 'Select items' },
  { label: 'Delivery', description: 'Location details' },
  { label: 'Review', description: 'AI suggestions' },
  { label: 'Publish', description: 'Get quotes' },
];

const DELIVERY_PREFERENCES = [
  { id: 'delivery', label: 'Home Delivery', description: 'Products delivered to your doorstep' },
  { id: 'pickup', label: 'Store Pickup', description: 'Pick up from dealer location' },
  { id: 'both', label: 'Flexible', description: 'Open to either option for best price' },
];

interface SearchResult {
  id: string;
  name: string;
  description: string;
  brand: { name: string };
  productType: { name: string };
}

export function CreateRFQPage() {
  const navigate = useNavigate();
  const { items, addItem, removeItem, updateQuantity, clearItems } = useRFQStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Product Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deliveryCity: '',
    deliveryPincode: '',
    deliveryAddress: '',
    deliveryPreference: 'both',
    urgency: 'normal',
  });

  // AI Suggestions
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);

  // Search Products
  useEffect(() => {
    const searchProducts = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await productsApi.searchProducts({ q: searchQuery, limit: 10 });
        setSearchResults(response.data.products || []);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleAddProduct = (product: SearchResult) => {
    if (items.find(item => item.productId === product.id)) return;

    addItem({
      productId: product.id,
      name: product.name,
      brand: product.brand.name,
      quantity: 1,
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  const validateStep = (step: number): boolean => {
    setError('');

    if (step === 0) {
      if (items.length === 0) {
        setError('Please add at least one product to your RFQ');
        return false;
      }
    }

    if (step === 1) {
      if (!formData.title.trim() || formData.title.length < 5) {
        setError('Please enter a title (at least 5 characters)');
        return false;
      }
      if (!formData.deliveryCity.trim()) {
        setError('Please enter your city');
        return false;
      }
      if (!formData.deliveryPincode || formData.deliveryPincode.length !== 6) {
        setError('Please enter a valid 6-digit pincode');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handlePublish = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Create RFQ
      const rfqData = {
        title: formData.title,
        description: formData.description || undefined,
        deliveryCity: formData.deliveryCity,
        deliveryPincode: formData.deliveryPincode,
        deliveryAddress: formData.deliveryAddress || undefined,
        deliveryPreference: formData.deliveryPreference as 'delivery' | 'pickup' | 'both',
        urgency: formData.urgency as 'normal' | 'urgent',
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          notes: item.notes,
        })),
      };

      const createResponse = await rfqApi.create(rfqData);
      const rfqId = createResponse.data.rfq.id;

      // Store AI suggestions if any
      if (createResponse.data.rfq.aiSuggestions) {
        setAiSuggestions(JSON.parse(createResponse.data.rfq.aiSuggestions));
      }

      // Publish RFQ
      await rfqApi.publish(rfqId);

      // Clear cart and navigate
      clearItems();
      navigate(`/rfq/${rfqId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create RFQ. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <div className="bg-neutral-900 text-white py-6 border-b-4 border-accent-500">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black">
                Get Quotes in <span className="text-accent-400">60 Seconds</span>
              </h1>
              <p className="text-neutral-400">
                Verified dealers compete to give you the best price
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                <span className="text-neutral-300">
                  <span className="font-bold text-white">127</span> dealers online
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-accent-400" />
                <span className="text-neutral-300">100% Free</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-10">
        {/* Stepper */}
        <div className="max-w-3xl mx-auto mb-10">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="border-2 border-neutral-900 bg-white p-8 lg:p-10">
            {error && (
              <Alert variant="error" title="Error">
                {error}
              </Alert>
            )}

            {/* Step 1: Products */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="step-number">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900">What Do You Need?</h2>
                    <p className="text-neutral-500">Search and add products to your quote request</p>
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search products by name or brand (e.g., Polycab 2.5mm wire)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-search pl-12"
                  />

                  {/* Search Results Dropdown */}
                  {(searchResults.length > 0 || isSearching) && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-neutral-900 shadow-brutal z-10 max-h-80 overflow-y-auto">
                      {isSearching ? (
                        <div className="p-4 text-center text-neutral-500 font-medium">
                          Searching...
                        </div>
                      ) : (
                        searchResults.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => handleAddProduct(product)}
                            disabled={items.some(item => item.productId === product.id)}
                            className="w-full flex items-center space-x-4 p-4 hover:bg-primary-50 border-b border-neutral-200 last:border-0 text-left disabled:opacity-50 disabled:bg-neutral-50"
                          >
                            <div className="w-14 h-14 bg-neutral-900 flex items-center justify-center flex-shrink-0">
                              <Package className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-neutral-900 truncate">{product.name}</p>
                              <p className="text-sm text-neutral-500">{product.brand.name} • {product.productType.name}</p>
                            </div>
                            {items.some(item => item.productId === product.id) ? (
                              <span className="text-sm font-bold text-success-600 uppercase">Added</span>
                            ) : (
                              <Plus className="w-6 h-6 text-accent-600" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Items */}
                <div className="space-y-4">
                  <h3 className="font-bold text-neutral-900 uppercase tracking-wide text-sm">
                    Your Products ({items.length})
                  </h3>

                  {items.length === 0 ? (
                    <EmptyState
                      icon={Package}
                      title="No Products Added"
                      description="Search and add products above to start your quote request"
                      action={
                        <Link to="/categories" className="btn-secondary">
                          Browse Catalog
                        </Link>
                      }
                    />
                  ) : (
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div
                          key={item.productId}
                          className="flex items-center space-x-4 p-4 bg-primary-50 border-2 border-primary-200"
                        >
                          <div className="w-14 h-14 bg-neutral-900 flex items-center justify-center flex-shrink-0">
                            <Package className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-neutral-900 truncate">{item.name}</p>
                            <p className="text-sm text-neutral-600">{item.brand}</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                              className="w-10 h-10 border-2 border-neutral-300 bg-white flex items-center justify-center hover:bg-neutral-100 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center font-bold text-lg">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="w-10 h-10 border-2 border-neutral-300 bg-white flex items-center justify-center hover:bg-neutral-100 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="w-10 h-10 text-error-500 hover:bg-error-50 flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <Link
                    to="/categories"
                    className="text-accent-600 hover:text-accent-700 font-bold inline-flex items-center"
                  >
                    Browse all products
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            )}

            {/* Step 2: Delivery Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="step-number">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900">Where Do You Need It?</h2>
                    <p className="text-neutral-500">Enter your delivery location</p>
                  </div>
                </div>

                <Input
                  label="Quote Title"
                  placeholder="e.g., Electrical items for 3BHK apartment"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />

                <div>
                  <label className="block text-sm font-bold text-neutral-900 mb-2 uppercase tracking-wide">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Any specific requirements or notes for dealers..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="block w-full border-2 border-neutral-300 px-4 py-4 text-base font-medium focus:border-neutral-900 focus:outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="City"
                    placeholder="e.g., Mumbai"
                    value={formData.deliveryCity}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryCity: e.target.value }))}
                    required
                  />
                  <Input
                    label="Pincode"
                    placeholder="6-digit pincode"
                    value={formData.deliveryPincode}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryPincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-900 mb-2 uppercase tracking-wide">
                    Full Address (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Street address, landmark..."
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                    className="block w-full border-2 border-neutral-300 px-4 py-4 text-base font-medium focus:border-neutral-900 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-900 mb-3 uppercase tracking-wide">
                    Delivery Preference
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {DELIVERY_PREFERENCES.map((pref) => (
                      <button
                        key={pref.id}
                        onClick={() => setFormData(prev => ({ ...prev, deliveryPreference: pref.id }))}
                        className={`p-4 border-2 text-left transition-all duration-200 ${
                          formData.deliveryPreference === pref.id
                            ? 'border-neutral-900 bg-primary-50 shadow-brutal-sm'
                            : 'border-neutral-200 hover:border-neutral-400'
                        }`}
                      >
                        <p className="font-bold text-neutral-900">{pref.label}</p>
                        <p className="text-sm text-neutral-500 mt-1">{pref.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="step-number">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900">Review Your Request</h2>
                    <p className="text-neutral-500">Double-check details before publishing</p>
                  </div>
                </div>

                {/* AI Suggestions */}
                <div className="bg-neutral-900 text-white p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Sparkles className="w-5 h-5 text-accent-400" />
                    <h3 className="font-bold">AI Recommendations</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <Lightbulb className="w-4 h-4 text-accent-400 mt-0.5 flex-shrink-0" />
                      <p className="text-neutral-300">Consider adding MCBs for safety protection if you're buying wires.</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-warning-400 mt-0.5 flex-shrink-0" />
                      <p className="text-neutral-300">Check wire gauge requirements for your planned electrical load.</p>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-4">
                  <div className="border-2 border-neutral-200 p-6">
                    <h3 className="font-bold text-neutral-900 mb-4 uppercase tracking-wide text-sm">Quote Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Title:</span>
                        <span className="font-bold text-neutral-900">{formData.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Location:</span>
                        <span className="font-bold text-neutral-900">{formData.deliveryCity}, {formData.deliveryPincode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Delivery:</span>
                        <span className="font-bold text-neutral-900 capitalize">{formData.deliveryPreference}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-2 border-neutral-200 p-6">
                    <h3 className="font-bold text-neutral-900 mb-4 uppercase tracking-wide text-sm">Products ({items.length})</h3>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.productId} className="flex justify-between text-sm">
                          <span className="text-neutral-600">{item.name}</span>
                          <span className="font-bold text-neutral-900">Qty: {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Publish */}
            {currentStep === 3 && (
              <div className="space-y-8 text-center py-8">
                <div className="w-24 h-24 bg-accent-500 flex items-center justify-center mx-auto">
                  <Send className="w-12 h-12 text-white" />
                </div>

                <div>
                  <h2 className="text-3xl font-black text-neutral-900 mb-3">Ready to Publish!</h2>
                  <p className="text-neutral-600 text-lg">
                    Your request will be sent to verified dealers in your area.
                  </p>
                </div>

                <div className="bg-neutral-900 text-white p-8 text-left max-w-md mx-auto">
                  <h3 className="font-bold text-lg mb-4">What Happens Next?</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <span className="w-8 h-8 bg-accent-500 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                      <span className="text-neutral-300">Dealers in {formData.deliveryCity} receive your request</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="w-8 h-8 bg-accent-500 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                      <span className="text-neutral-300">They submit competitive quotes with pricing</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="w-8 h-8 bg-accent-500 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                      <span className="text-neutral-300">Compare quotes and select the best deal</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-8 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-neutral-900" />
                    <span><span className="font-bold">60 sec</span> avg response</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-neutral-900" />
                    <span><span className="font-bold">3-5</span> dealers respond</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-neutral-900" />
                    <span><span className="font-bold">100%</span> verified</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10 pt-8 border-t-2 border-neutral-200">
              {currentStep > 0 ? (
                <Button variant="ghost" onClick={handleBack} size="lg">
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 3 ? (
                <Button onClick={handleNext} variant="primary" size="lg">
                  Continue
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              ) : (
                <Button onClick={handlePublish} isLoading={isLoading} variant="accent" size="lg">
                  <Send className="w-5 h-5 mr-2" />
                  Publish & Get Quotes
                </Button>
              )}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-neutral-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success-600" />
              <span>No registration required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success-600" />
              <span>No hidden fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success-600" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
