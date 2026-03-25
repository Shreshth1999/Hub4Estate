import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/store';
import { rfqApi, productsApi } from '../../lib/api';
import {
  ShoppingCart, FileText, Plus, ArrowRight, MessageSquare,
  Search, X, Trash2, ChevronRight, Send, Eye,
  CheckCircle2, AlertCircle, Sparkles, Package, Phone, Star,
  TrendingUp, Building2,
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

const useQuoteCart = () => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('quoteCart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('quoteCart', JSON.stringify(items));
  }, [items]);

  const removeItem = (id: string) => setItems(prev => prev.filter(item => item.id !== id));
  const updateQuantity = (id: string, quantity: number) =>
    setItems(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item));
  const clearCart = () => setItems([]);

  return { items, removeItem, updateQuantity, clearCart };
};

const RFQ_STATUS: Record<string, { label: string; color: string; dot: string; next: string }> = {
  DRAFT:           { label: 'Draft',          color: 'text-gray-500',   dot: 'bg-gray-300',   next: 'Publish to get quotes' },
  PUBLISHED:       { label: 'Live',            color: 'text-blue-600',   dot: 'bg-blue-400',   next: 'Waiting for dealer quotes' },
  QUOTES_RECEIVED: { label: 'Quotes ready',   color: 'text-amber-600',  dot: 'bg-amber-400',  next: 'Review and compare quotes' },
  QUOTE_SELECTED:  { label: 'Quote selected', color: 'text-green-600',  dot: 'bg-green-400',  next: 'Contact dealer to finalize' },
  COMPLETED:       { label: 'Completed',      color: 'text-green-600',  dot: 'bg-green-400',  next: '' },
  CANCELLED:       { label: 'Cancelled',      color: 'text-red-500',    dot: 'bg-red-400',    next: '' },
};

const QUICK_ADD_PRODUCTS = [
  { name: 'Wires & Cables',       icon: '🔌', examples: ['House Wire 1.5mm', 'FRLS Cable 2.5mm', 'Armoured Cable'] },
  { name: 'MCBs & Distribution',  icon: '⚡', examples: ['MCB 16A', 'MCB 32A', 'Distribution Box 8-way'] },
  { name: 'Switches & Sockets',   icon: '🔘', examples: ['Modular Switch', '5A Socket', '16A Socket'] },
  { name: 'Fans & Lighting',      icon: '💡', examples: ['Ceiling Fan', 'LED Panel 12W', 'Tube Light 20W'] },
];

const TRENDING = [
  { name: 'Havells MCB 32A SP', category: 'MCBs', enquiries: 128 },
  { name: 'Polycab FRLS 2.5mm', category: 'Wires', enquiries: 95 },
  { name: 'Anchor Roma Switch', category: 'Switches', enquiries: 87 },
];

const ACTIVE_DEALERS = [
  { name: 'Sharma Electricals', city: 'Delhi', rating: 4.8 },
  { name: 'Gupta Electric Store', city: 'Mumbai', rating: 4.6 },
  { name: 'SK Traders', city: 'Bangalore', rating: 4.7 },
];

export function UserDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { items: cartItems, removeItem, updateQuantity, clearCart } = useQuoteCart();

  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [stats, setStats] = useState({ totalRfqs: 0, activeRfqs: 0, quotesReceived: 0, savedProducts: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rfqResponse, savedResponse] = await Promise.all([
          rfqApi.getMyRFQs({ limit: 10 }),
          productsApi.getSavedProducts().catch(() => ({ data: { savedProducts: [] } })),
        ]);
        const rfqData = rfqResponse.data.rfqs || [];
        setRfqs(rfqData);
        const activeCount = rfqData.filter((r: RFQ) => r.status === 'PUBLISHED' || r.status === 'QUOTES_RECEIVED').length;
        const totalQuotes = rfqData.reduce((sum: number, r: RFQ) => sum + (r._count?.quotes || 0), 0);
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

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  const handleSubmitCart = () => navigate('/rfq/create', { state: { cartItems } });

  const actionableRfq = rfqs.find(r => r.status === 'QUOTES_RECEIVED' || r.status === 'PUBLISHED');
  const isNewUser = !isLoading && rfqs.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {isNewUser
                ? `Welcome, ${user?.name?.split(' ')[0] || 'there'}`
                : actionableRfq?.status === 'QUOTES_RECEIVED'
                  ? `${actionableRfq._count?.quotes || 0} quote${(actionableRfq._count?.quotes || 0) !== 1 ? 's' : ''} ready`
                  : user?.name?.split(' ')[0] || 'Dashboard'
              }
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {isNewUser
                ? 'Add products and get quotes from verified dealers'
                : actionableRfq?.status === 'QUOTES_RECEIVED'
                  ? `${actionableRfq.title} — review and compare`
                  : stats.activeRfqs > 0
                    ? `${stats.activeRfqs} active RFQ${stats.activeRfqs > 1 ? 's' : ''} in progress`
                    : 'Your procurement dashboard'
              }
            </p>
          </div>
          <Link
            to="/rfq/create"
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New RFQ
          </Link>
        </div>

        {/* Inline stats */}
        {!isNewUser && (
          <div className="flex items-center gap-5 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-semibold text-gray-900">{stats.totalRfqs}</span>
              <span className="text-sm text-gray-400">RFQs</span>
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-1.5">
              <span className="text-base font-semibold text-gray-900">{stats.quotesReceived}</span>
              <span className="text-sm text-gray-400">quotes received</span>
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-1.5">
              <span className="text-base font-semibold text-gray-900">{stats.savedProducts}</span>
              <span className="text-sm text-gray-400">saved</span>
            </div>
          </div>
        )}
      </div>

      <div className="px-6 py-6 max-w-7xl mx-auto">

        {/* Quick action pills */}
        <div className="flex items-center gap-2 flex-wrap mb-6">
          <button
            onClick={() => setShowQuickAdd(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all"
          >
            <ShoppingCart className="w-4 h-4 text-gray-500" />
            Quick add
          </button>
          <Link
            to="/user/categories"
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all"
          >
            <Search className="w-4 h-4 text-gray-500" />
            Browse catalog
          </Link>
          <Link
            to="/ai-assistant"
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all"
          >
            <Sparkles className="w-4 h-4 text-orange-500" />
            Ask Spark AI
          </Link>
          <Link
            to="/messages"
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all"
          >
            <MessageSquare className="w-4 h-4 text-gray-500" />
            Messages
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-5">

            {/* Quote Cart */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-gray-500" />
                  <h2 className="text-sm font-medium text-gray-900">Quote Cart</h2>
                  {cartItems.length > 0 && (
                    <span className="text-xs font-medium bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                      {cartItems.length}
                    </span>
                  )}
                </div>
                {cartItems.length > 0 && (
                  <button onClick={clearCart} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                    Clear all
                  </button>
                )}
              </div>

              {cartItems.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Package className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {isNewUser ? 'Start adding products' : 'Your cart is empty'}
                  </p>
                  <p className="text-xs text-gray-400 mb-4">
                    Add products to get quotes from verified dealers in your area
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setShowQuickAdd(true)}
                      className="px-3.5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Quick add
                    </button>
                    <Link
                      to="/user/categories"
                      className="px-3.5 py-2 border border-gray-200 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Browse
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.id} className="px-4 py-3 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-gray-400">{item.category}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 border border-gray-200 rounded flex items-center justify-center text-gray-500 hover:bg-gray-50 text-sm"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-gray-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 border border-gray-200 rounded flex items-center justify-center text-gray-500 hover:bg-gray-50 text-sm"
                          >
                            +
                          </button>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-3 border-t border-gray-100">
                    <button
                      onClick={handleSubmitCart}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Get quotes for {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <p className="text-xs text-gray-400 text-center mt-2">
                      Quotes from verified dealers within 24 hours
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* My RFQs */}
            {rfqs.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <h2 className="text-sm font-medium text-gray-900">My RFQs</h2>
                  </div>
                  <Link
                    to="/rfq/my-rfqs"
                    className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
                  >
                    View all <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {isLoading ? (
                  <div className="px-4 py-8 flex justify-center">
                    <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {rfqs.slice(0, 4).map((rfq) => {
                      const s = RFQ_STATUS[rfq.status] || RFQ_STATUS.DRAFT;
                      const hasQuotes = (rfq._count?.quotes || 0) > 0;
                      return (
                        <Link
                          key={rfq.id}
                          to={`/rfq/${rfq.id}`}
                          className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
                        >
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900 truncate">{rfq.title}</p>
                              {hasQuotes && (
                                <span className="text-xs bg-amber-50 text-amber-600 font-medium px-1.5 py-0.5 rounded-full flex-shrink-0">
                                  {rfq._count?.quotes} quote{(rfq._count?.quotes || 0) !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">
                              <span className={s.color}>{s.label}</span>
                              {' · '}{formatDate(rfq.createdAt)}
                              {' · '}{rfq._count?.items || 0} items
                              {s.next && <span className="text-gray-400"> · {s.next}</span>}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* How it works (new users only) */}
            {isNewUser && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-medium text-gray-900 mb-4">How Hub4Estate works</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { step: '1', title: 'Add products', desc: 'Browse catalog or quick-add items' },
                    { step: '2', title: 'Submit RFQ', desc: 'Goes to verified dealers nearby' },
                    { step: '3', title: 'Compare quotes', desc: 'Get competitive prices in 24h' },
                    { step: '4', title: 'Connect & order', desc: 'Chat with dealer, place order' },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3">
                      <span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0 mt-0.5">
                        {item.step}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Trending */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-4 py-3.5 border-b border-gray-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-medium text-gray-900">Trending</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {TRENDING.map((product, i) => (
                  <div key={i} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-800">{product.name}</p>
                      <p className="text-xs text-gray-400">{product.category}</p>
                    </div>
                    <span className="text-xs text-gray-400">{product.enquiries}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-gray-100">
                <Link
                  to="/user/categories"
                  className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1"
                >
                  Browse all <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Active Dealers */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-4 py-3.5 border-b border-gray-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-medium text-gray-900">Active Dealers</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {ACTIVE_DEALERS.map((dealer, i) => (
                  <div key={i} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-800">{dealer.name}</p>
                      <p className="text-xs text-gray-400">{dealer.city}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-medium text-gray-600">{dealer.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-xs font-medium text-gray-500 mb-3">Resources</h3>
              <div className="space-y-1">
                {[
                  { to: '/knowledge', icon: Eye, label: 'Buying guides' },
                  { to: '/community', icon: MessageSquare, label: 'Community' },
                ].map(({ to, icon: Icon, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Help */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-700 mb-1">Need help?</p>
              <p className="text-xs text-gray-500 mb-3">Our team is available to assist.</p>
              <a
                href="tel:+917690001999"
                className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                +91 76900 01999
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] overflow-auto">
            <div className="sticky top-0 bg-white px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Quick add products</h3>
                <p className="text-xs text-gray-400 mt-0.5">Tap to add to your quote cart</p>
              </div>
              <button onClick={() => setShowQuickAdd(false)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-6">
              {QUICK_ADD_PRODUCTS.map((category) => (
                <div key={category.name}>
                  <h4 className="text-xs font-medium text-gray-500 mb-2.5 flex items-center gap-1.5">
                    <span>{category.icon}</span> {category.name}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {category.examples.map((product) => (
                      <button
                        key={product}
                        onClick={() => {
                          const cart = JSON.parse(localStorage.getItem('quoteCart') || '[]');
                          cart.push({ id: Date.now().toString(), name: product, category: category.name, quantity: 1 });
                          localStorage.setItem('quoteCart', JSON.stringify(cart));
                          window.location.reload();
                        }}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all"
                      >
                        + {product}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="sticky bottom-0 bg-white px-5 py-4 border-t border-gray-100">
              <Link
                to="/user/categories"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                onClick={() => setShowQuickAdd(false)}
              >
                Browse full catalog <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
