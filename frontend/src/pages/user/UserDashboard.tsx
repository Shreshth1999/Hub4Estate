import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/store';
import { rfqApi, productsApi } from '../../lib/api';
import {
  ShoppingCart, FileText, Plus, ArrowRight, MessageSquare,
  TrendingUp, Search, Zap, X, Trash2, ChevronRight, Users,
  Star, Building2, Send, Eye, CheckCircle2, AlertCircle,
  Sparkles, Target, Phone
} from 'lucide-react';

interface RFQ {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  _count?: { items: number; quotes: number };
}

interface CartItem {
  id: string;
  name: string;
  category: string;
  brand?: string;
  quantity: number;
  specifications?: string;
}

// Quote Cart Hook - persisted to localStorage
const useQuoteCart = () => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('quoteCart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('quoteCart', JSON.stringify(items));
  }, [items]);

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
    ));
  };

  const clearCart = () => setItems([]);

  return { items, removeItem, updateQuantity, clearCart };
};

// RFQ Status Config
const RFQ_STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; next: string }> = {
  DRAFT: { label: 'Draft', color: 'bg-neutral-100 text-neutral-600', icon: FileText, next: 'Publish to get quotes' },
  PUBLISHED: { label: 'Live', color: 'bg-blue-100 text-blue-700', icon: Send, next: 'Waiting for dealer quotes' },
  QUOTES_RECEIVED: { label: 'Quotes Ready', color: 'bg-amber-100 text-amber-700', icon: MessageSquare, next: 'Review and compare quotes' },
  QUOTE_SELECTED: { label: 'Quote Selected', color: 'bg-green-100 text-green-700', icon: CheckCircle2, next: 'Contact dealer to finalize' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle2, next: 'Order fulfilled' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: AlertCircle, next: '' },
};

// Quick Add Categories
const QUICK_ADD_PRODUCTS = [
  { name: 'Wires & Cables', icon: '🔌', examples: ['House Wire 1.5mm', 'FRLS Cable 2.5mm', 'Armoured Cable'] },
  { name: 'MCBs & Distribution', icon: '⚡', examples: ['MCB 16A', 'MCB 32A', 'Distribution Box 8-way'] },
  { name: 'Switches & Sockets', icon: '🔘', examples: ['Modular Switch', '5A Socket', '16A Socket'] },
  { name: 'Fans & Lighting', icon: '💡', examples: ['Ceiling Fan', 'LED Panel 12W', 'Tube Light 20W'] },
];

// Simulated marketplace data (would come from API)
const TRENDING_PRODUCTS = [
  { name: 'Havells MCB 32A SP', category: 'MCBs', enquiries: 128 },
  { name: 'Polycab FRLS 2.5mm', category: 'Wires', enquiries: 95 },
  { name: 'Anchor Roma Switch', category: 'Switches', enquiries: 87 },
];

const ACTIVE_DEALERS = [
  { name: 'Sharma Electricals', city: 'Delhi', rating: 4.8, responseTime: '< 2 hrs' },
  { name: 'Gupta Electric Store', city: 'Mumbai', rating: 4.6, responseTime: '< 4 hrs' },
  { name: 'SK Traders', city: 'Bangalore', rating: 4.7, responseTime: '< 3 hrs' },
];

export function UserDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { items: cartItems, removeItem, updateQuantity, clearCart } = useQuoteCart();

  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [stats, setStats] = useState({
    totalRfqs: 0,
    activeRfqs: 0,
    quotesReceived: 0,
    savedProducts: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rfqResponse, savedResponse] = await Promise.all([
          rfqApi.getMyRFQs({ limit: 10 }),
          productsApi.getSavedProducts().catch(() => ({ data: { savedProducts: [] } })),
        ]);

        const rfqData = rfqResponse.data.rfqs || [];
        setRfqs(rfqData);

        const activeCount = rfqData.filter((r: RFQ) =>
          r.status === 'PUBLISHED' || r.status === 'QUOTES_RECEIVED'
        ).length;

        const totalQuotes = rfqData.reduce((sum: number, r: RFQ) =>
          sum + (r._count?.quotes || 0), 0
        );

        setStats({
          totalRfqs: rfqData.length,
          activeRfqs: activeCount,
          quotesReceived: totalQuotes,
          savedProducts: savedResponse.data.savedProducts?.length || 0,
        });
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
          navigate('/login', { replace: true });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [logout, navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  const handleSubmitCart = () => {
    navigate('/rfq/create', { state: { cartItems } });
  };

  // Get the most actionable RFQ (one that needs attention)
  const actionableRfq = rfqs.find(r =>
    r.status === 'QUOTES_RECEIVED' || r.status === 'PUBLISHED'
  );

  // Check if user is new (no RFQs yet)
  const isNewUser = !isLoading && rfqs.length === 0;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Context Header - Project-focused */}
      <div className="bg-neutral-900 text-white">
        <div className="container-custom py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              {isNewUser ? (
                <>
                  <p className="text-accent-400 text-sm font-bold mb-1">Welcome to Hub4Estate</p>
                  <h1 className="text-2xl lg:text-3xl font-black">
                    Let's get your first quote, {user?.name?.split(' ')[0] || 'there'}
                  </h1>
                  <p className="text-neutral-400 mt-1">
                    Add products to your cart and get competitive quotes from verified dealers
                  </p>
                </>
              ) : actionableRfq ? (
                <>
                  <p className="text-accent-400 text-sm font-bold mb-1">Action Needed</p>
                  <h1 className="text-2xl lg:text-3xl font-black">
                    {actionableRfq.status === 'QUOTES_RECEIVED'
                      ? `You have ${actionableRfq._count?.quotes || 0} quotes waiting`
                      : 'Your RFQ is live — quotes coming soon'
                    }
                  </h1>
                  <p className="text-neutral-400 mt-1">
                    {actionableRfq.title} • {actionableRfq._count?.items || 0} items
                  </p>
                </>
              ) : (
                <>
                  <p className="text-neutral-400 text-sm mb-1">Welcome back</p>
                  <h1 className="text-2xl lg:text-3xl font-black">
                    {user?.name || 'User'}
                  </h1>
                  <p className="text-neutral-400 mt-1">
                    {stats.activeRfqs > 0
                      ? `${stats.activeRfqs} active RFQ${stats.activeRfqs > 1 ? 's' : ''} in progress`
                      : 'Ready to source more products?'
                    }
                  </p>
                </>
              )}
            </div>

            {/* Quick Stats - Desktop */}
            <div className="hidden lg:flex items-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-black">{stats.totalRfqs}</p>
                <p className="text-xs text-neutral-400 uppercase tracking-wide">RFQs</p>
              </div>
              <div className="w-px h-10 bg-neutral-700" />
              <div className="text-center">
                <p className="text-3xl font-black text-amber-400">{stats.quotesReceived}</p>
                <p className="text-xs text-neutral-400 uppercase tracking-wide">Quotes</p>
              </div>
              <div className="w-px h-10 bg-neutral-700" />
              <div className="text-center">
                <p className="text-3xl font-black text-green-400">{stats.savedProducts}</p>
                <p className="text-xs text-neutral-400 uppercase tracking-wide">Saved</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-6 lg:py-8">
        {/* Primary Action Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8">
          <Link
            to="/rfq/create"
            className="group bg-accent-500 text-white p-4 lg:p-6 border-2 border-accent-600 hover:bg-accent-600 transition-colors"
          >
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/20 flex items-center justify-center mb-3">
              <Plus className="w-5 h-5 lg:w-6 lg:h-6" />
            </div>
            <h3 className="font-bold text-sm lg:text-base">Create RFQ</h3>
            <p className="text-xs lg:text-sm text-white/80 mt-1 hidden lg:block">
              Get quotes from multiple dealers
            </p>
            <ArrowRight className="w-4 h-4 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          <Link
            to="/user/categories"
            className="group bg-white p-4 lg:p-6 border-2 border-neutral-200 hover:border-neutral-900 transition-colors"
          >
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-neutral-100 flex items-center justify-center mb-3">
              <Search className="w-5 h-5 lg:w-6 lg:h-6 text-neutral-600" />
            </div>
            <h3 className="font-bold text-neutral-900 text-sm lg:text-base">Browse Products</h3>
            <p className="text-xs lg:text-sm text-neutral-500 mt-1 hidden lg:block">
              Explore 1000+ electrical items
            </p>
            <ArrowRight className="w-4 h-4 mt-2 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          <Link
            to="/ai-assistant"
            className="group bg-white p-4 lg:p-6 border-2 border-neutral-200 hover:border-neutral-900 transition-colors"
          >
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-neutral-100 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-neutral-600" />
            </div>
            <h3 className="font-bold text-neutral-900 text-sm lg:text-base">AI Assistant</h3>
            <p className="text-xs lg:text-sm text-neutral-500 mt-1 hidden lg:block">
              Get expert buying advice
            </p>
            <ArrowRight className="w-4 h-4 mt-2 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          <Link
            to="/saved"
            className="group bg-white p-4 lg:p-6 border-2 border-neutral-200 hover:border-neutral-900 transition-colors"
          >
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-neutral-100 flex items-center justify-center mb-3">
              <Star className="w-5 h-5 lg:w-6 lg:h-6 text-neutral-600" />
            </div>
            <h3 className="font-bold text-neutral-900 text-sm lg:text-base">Saved Products</h3>
            <p className="text-xs lg:text-sm text-neutral-500 mt-1 hidden lg:block">
              {stats.savedProducts > 0 ? `${stats.savedProducts} items saved` : 'Your shortlisted items'}
            </p>
            <ArrowRight className="w-4 h-4 mt-2 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quote Cart */}
            <div className="bg-white border-2 border-neutral-900">
              <div className="p-4 border-b-2 border-neutral-900 bg-neutral-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5" />
                  <h2 className="font-bold">Quote Cart</h2>
                  {cartItems.length > 0 && (
                    <span className="bg-accent-500 text-white text-xs font-bold px-2 py-0.5">
                      {cartItems.length} items
                    </span>
                  )}
                </div>
                {cartItems.length > 0 && (
                  <button onClick={clearCart} className="text-neutral-400 hover:text-white text-sm">
                    Clear
                  </button>
                )}
              </div>

              {cartItems.length === 0 ? (
                <div className="p-6 lg:p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-neutral-100 flex items-center justify-center flex-shrink-0">
                      <Target className="w-6 h-6 text-neutral-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-neutral-900 mb-1">
                        {isNewUser ? 'Start by adding products' : 'Your cart is empty'}
                      </h3>
                      <p className="text-neutral-500 text-sm mb-4">
                        {isNewUser
                          ? 'Browse our catalog or quick-add common items. We\'ll get you quotes from verified dealers in your area.'
                          : 'Add products to get competitive quotes from multiple dealers.'
                        }
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button onClick={() => setShowQuickAdd(true)} className="btn-primary">
                          <Zap className="w-4 h-4 mr-2" />
                          Quick Add
                        </button>
                        <Link to="/user/categories" className="btn-secondary">
                          <Search className="w-4 h-4 mr-2" />
                          Browse Catalog
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-neutral-100 max-h-64 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.id} className="p-4 flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-neutral-900 truncate">{item.name}</h4>
                          <p className="text-sm text-neutral-500">{item.category}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 border-2 border-neutral-200 flex items-center justify-center hover:border-neutral-300"
                          >
                            -
                          </button>
                          <span className="w-10 text-center font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 border-2 border-neutral-200 flex items-center justify-center hover:border-neutral-300"
                          >
                            +
                          </button>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-neutral-400 hover:text-red-500">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-neutral-50 border-t-2 border-neutral-200">
                    <button onClick={handleSubmitCart} className="btn-urgent w-full justify-center">
                      Get Quotes for {cartItems.length} Items
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                    <p className="text-xs text-neutral-500 text-center mt-2">
                      Receive quotes within 24 hours from verified dealers
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* RFQ Lifecycle Section */}
            {rfqs.length > 0 && (
              <div className="bg-white border-2 border-neutral-200">
                <div className="p-4 border-b-2 border-neutral-200 flex items-center justify-between">
                  <h2 className="font-bold text-neutral-900">Your RFQs</h2>
                  <Link to="/rfq/my-rfqs" className="text-sm font-bold text-accent-600 hover:text-accent-700 flex items-center gap-1">
                    View All <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {isLoading ? (
                  <div className="p-12 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-neutral-200 border-t-neutral-900 rounded-full mx-auto"></div>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100">
                    {rfqs.slice(0, 4).map((rfq) => {
                      const statusConfig = RFQ_STATUS_CONFIG[rfq.status] || RFQ_STATUS_CONFIG.DRAFT;
                      const StatusIcon = statusConfig.icon;
                      const hasQuotes = (rfq._count?.quotes || 0) > 0;

                      return (
                        <Link
                          key={rfq.id}
                          to={`/rfq/${rfq.id}`}
                          className="block p-4 hover:bg-neutral-50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold ${statusConfig.color}`}>
                                  <StatusIcon className="w-3 h-3" />
                                  {statusConfig.label}
                                </span>
                                {hasQuotes && (
                                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5">
                                    {rfq._count?.quotes} quote{(rfq._count?.quotes || 0) > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                              <h3 className="font-bold text-neutral-900 truncate">{rfq.title}</h3>
                              <p className="text-sm text-neutral-500 mt-0.5">
                                {formatDate(rfq.createdAt)} • {rfq._count?.items || 0} items
                              </p>
                              {statusConfig.next && (
                                <p className="text-xs text-accent-600 mt-1 font-medium">
                                  → {statusConfig.next}
                                </p>
                              )}
                            </div>
                            <ChevronRight className="w-5 h-5 text-neutral-300 flex-shrink-0" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* New User: How It Works */}
            {isNewUser && (
              <div className="bg-neutral-900 text-white p-6">
                <h3 className="font-bold text-lg mb-4">How Hub4Estate Works</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 bg-accent-500 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                    <div>
                      <p className="font-bold text-sm">Add Products</p>
                      <p className="text-xs text-neutral-400">Browse catalog or quick-add items to your cart</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 bg-accent-500 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                    <div>
                      <p className="font-bold text-sm">Submit RFQ</p>
                      <p className="text-xs text-neutral-400">Your request goes to verified dealers in your area</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 bg-accent-500 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                    <div>
                      <p className="font-bold text-sm">Compare Quotes</p>
                      <p className="text-xs text-neutral-400">Get competitive prices within 24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 bg-accent-500 flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                    <div>
                      <p className="font-bold text-sm">Connect & Order</p>
                      <p className="text-xs text-neutral-400">Chat with dealer and place your order</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Marketplace Feed */}
          <div className="space-y-6">
            {/* Trending Products */}
            <div className="bg-white border-2 border-neutral-200">
              <div className="p-4 border-b-2 border-neutral-200 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent-600" />
                <h3 className="font-bold text-neutral-900">Trending Products</h3>
              </div>
              <div className="divide-y divide-neutral-100">
                {TRENDING_PRODUCTS.map((product, i) => (
                  <div key={i} className="p-3 hover:bg-neutral-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-neutral-900 text-sm">{product.name}</p>
                        <p className="text-xs text-neutral-500">{product.category}</p>
                      </div>
                      <span className="text-xs text-neutral-400">{product.enquiries} enquiries</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-neutral-100">
                <Link to="/user/categories" className="text-sm font-bold text-accent-600 hover:text-accent-700 flex items-center gap-1">
                  Browse all products <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Active Dealers */}
            <div className="bg-white border-2 border-neutral-200">
              <div className="p-4 border-b-2 border-neutral-200 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-green-600" />
                <h3 className="font-bold text-neutral-900">Active Dealers</h3>
              </div>
              <div className="divide-y divide-neutral-100">
                {ACTIVE_DEALERS.map((dealer, i) => (
                  <div key={i} className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-neutral-900 text-sm">{dealer.name}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-bold text-neutral-600">{dealer.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500">{dealer.city}</span>
                      <span className="text-xs text-green-600 font-medium">{dealer.responseTime}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-green-50 border-t border-green-100">
                <p className="text-xs text-green-700 text-center">
                  <span className="font-bold">150+</span> verified dealers ready to quote
                </p>
              </div>
            </div>

            {/* Mobile Stats */}
            <div className="lg:hidden grid grid-cols-3 gap-3">
              <div className="bg-white border-2 border-neutral-200 p-3 text-center">
                <p className="text-xl font-black text-neutral-900">{stats.totalRfqs}</p>
                <p className="text-xs text-neutral-500">RFQs</p>
              </div>
              <div className="bg-white border-2 border-neutral-200 p-3 text-center">
                <p className="text-xl font-black text-amber-600">{stats.quotesReceived}</p>
                <p className="text-xs text-neutral-500">Quotes</p>
              </div>
              <div className="bg-white border-2 border-neutral-200 p-3 text-center">
                <p className="text-xl font-black text-green-600">{stats.savedProducts}</p>
                <p className="text-xs text-neutral-500">Saved</p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white border-2 border-neutral-200 p-4">
              <h3 className="font-bold text-neutral-900 mb-3 text-sm">Resources</h3>
              <div className="space-y-2">
                <Link to="/knowledge" className="flex items-center gap-3 p-2 bg-neutral-50 hover:bg-neutral-100 transition-colors rounded">
                  <Eye className="w-4 h-4 text-neutral-500" />
                  <span className="text-sm text-neutral-700">Buying Guides</span>
                </Link>
                <Link to="/community" className="flex items-center gap-3 p-2 bg-neutral-50 hover:bg-neutral-100 transition-colors rounded">
                  <Users className="w-4 h-4 text-neutral-500" />
                  <span className="text-sm text-neutral-700">Community</span>
                </Link>
              </div>
            </div>

            {/* Help */}
            <div className="bg-neutral-100 border-2 border-neutral-200 p-4">
              <h3 className="font-bold text-neutral-900 mb-1 text-sm">Need Help?</h3>
              <p className="text-xs text-neutral-600 mb-3">
                Our procurement experts are here to assist you.
              </p>
              <a href="tel:+917690001999" className="flex items-center justify-center gap-2 w-full py-2 bg-white border-2 border-neutral-300 hover:border-neutral-900 transition-colors text-sm font-bold">
                <Phone className="w-4 h-4" />
                +91 76900 01999
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg max-h-[80vh] overflow-auto">
            <div className="p-4 border-b-2 border-neutral-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-bold text-lg">Quick Add Products</h3>
                <p className="text-sm text-neutral-500">Click to add to your quote cart</p>
              </div>
              <button onClick={() => setShowQuickAdd(false)} className="p-2 hover:bg-neutral-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-6">
              {QUICK_ADD_PRODUCTS.map((category) => (
                <div key={category.name}>
                  <h4 className="font-bold text-neutral-900 mb-3 flex items-center gap-2">
                    <span className="text-lg">{category.icon}</span>
                    {category.name}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {category.examples.map((product) => (
                      <button
                        key={product}
                        onClick={() => {
                          const cart = JSON.parse(localStorage.getItem('quoteCart') || '[]');
                          cart.push({
                            id: Date.now().toString(),
                            name: product,
                            category: category.name,
                            quantity: 1,
                          });
                          localStorage.setItem('quoteCart', JSON.stringify(cart));
                          window.location.reload();
                        }}
                        className="px-3 py-2 border-2 border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50 text-sm font-medium transition-colors"
                      >
                        + {product}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t-2 border-neutral-200 bg-neutral-50 sticky bottom-0">
              <Link
                to="/user/categories"
                className="btn-primary w-full justify-center"
                onClick={() => setShowQuickAdd(false)}
              >
                Browse Full Catalog
                <ChevronRight className="w-5 h-5 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
