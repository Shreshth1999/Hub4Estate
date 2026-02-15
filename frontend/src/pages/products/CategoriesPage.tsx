import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { productsApi } from '../../lib/api';
import { EmptyState } from '../../components/ui';
import { ElectricalBackgroundSystem } from '../../components/ElectricalBackgroundSystem';
import { CategoryTile, STATIC_CATEGORIES } from '../../components/InteractiveCategoryGrid';
import {
  Search, Zap,
  ArrowRight, Package, Clock, TrendingUp, CheckCircle, Shield
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  subCategories: {
    id: string;
    name: string;
    slug: string;
  }[];
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const gridRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productsApi.getCategories();
        console.log("Fetched categories:", response.data);
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Scroll-based animation for connecting wires
  useEffect(() => {
    const handleScroll = () => {
      if (!gridRef.current) return;
      const rect = gridRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / (windowHeight + rect.height)));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Use static categories as fallback when API returns empty
  const displayCategories = categories.length > 0 ? categories : STATIC_CATEGORIES;

  const filteredCategories = displayCategories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white relative">
      {/* Electrical background system with zone-based sketches and interactive cursor */}
      <ElectricalBackgroundSystem />

      {/* Info Banner */}
      <div className="bg-accent-500 text-white py-3">
        <div className="container-custom">
          <div className="flex items-center justify-center gap-6 text-sm font-bold">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span>Wires • Switches • MCBs • Fans • Lighting • More</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Compare prices from 500+ verified dealers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-neutral-900 text-white">
        <div className="container-custom py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500 text-white text-sm font-bold uppercase tracking-wider mb-6">
                <Package className="w-4 h-4" />
                Product Catalog
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-[0.95]">
                Electrical Products.<br />
                <span className="text-accent-400">Best Prices.</span>
              </h1>

              <p className="text-xl text-neutral-300 mb-8 leading-relaxed">
                Browse our catalog of electrical products. Get quotes from <span className="text-white font-bold">500+ verified dealers</span> across India.
              </p>

              {/* Search Bar */}
              <div className="relative max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search categories, products, brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-search w-full pl-12 bg-white text-neutral-900"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
                <div className="text-4xl font-black text-accent-400 mb-2">14</div>
                <div className="text-sm font-bold uppercase tracking-wider text-neutral-300">Categories</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
                <div className="text-4xl font-black text-accent-400 mb-2">50+</div>
                <div className="text-sm font-bold uppercase tracking-wider text-neutral-300">Top Brands</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
                <div className="text-4xl font-black text-accent-400 mb-2">10K+</div>
                <div className="text-sm font-bold uppercase tracking-wider text-neutral-300">Products</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
                <div className="text-4xl font-black text-green-400 mb-2">500+</div>
                <div className="text-sm font-bold uppercase tracking-wider text-neutral-300">Verified Dealers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid - Dark theme matching landing page */}
      <section className="py-16 bg-neutral-900">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-2">All Categories</h2>
              <p className="text-neutral-400 font-medium">Select a category to browse products</p>
            </div>
            <Link to="/rfq/create" className="hidden md:inline-flex btn-urgent">
              Get Quote
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(14)].map((_, i) => (
                <div key={i} className="bg-neutral-700/50 border border-neutral-600 animate-pulse h-56" />
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="bg-neutral-800 border border-neutral-700 p-12">
              <EmptyState
                title="No categories found"
                description={searchQuery ? 'Try a different search term' : 'No categories available at the moment'}
              />
            </div>
          ) : (
            <div ref={gridRef} className="relative">
              {/* Connecting wires background */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-0"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="wire-pulse-categories" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#525252" />
                    <stop offset={`${scrollProgress * 100}%`} stopColor="#f97316" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#525252" />
                  </linearGradient>
                </defs>
                {/* Horizontal connection lines */}
                <line x1="0" y1="25%" x2="100%" y2="25%" stroke="url(#wire-pulse-categories)" strokeWidth="1" opacity="0.2" />
                <line x1="0" y1="50%" x2="100%" y2="50%" stroke="url(#wire-pulse-categories)" strokeWidth="1" opacity="0.2" />
                <line x1="0" y1="75%" x2="100%" y2="75%" stroke="url(#wire-pulse-categories)" strokeWidth="1" opacity="0.2" />
              </svg>

              {/* Category grid */}
              <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredCategories.map((category, index) => (
                  <CategoryTile key={category.id} category={category} index={index} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Educational Guides */}
      <section className="py-16 bg-neutral-50 border-y-2 border-neutral-200">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4">
              Buying Guides
            </h2>
            <p className="text-xl text-neutral-500 max-w-2xl mx-auto">
              Don't know what to buy? Our expert guides will help you make the right choice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'How to Choose the Right Wire Size',
                description: 'Understanding wire gauge, current capacity, and safety ratings for your project.',
                category: 'Wires & Cables'
              },
              {
                title: 'MCB vs RCCB: What You Need',
                description: 'Learn the difference between circuit breakers and when to use each type.',
                category: 'Switchgear'
              },
              {
                title: 'LED Lighting Guide for Homes',
                description: 'Wattage, color temperature, and placement tips for perfect home lighting.',
                category: 'Lighting'
              },
            ].map((guide, index) => (
              <div key={index} className="bg-white border-2 border-neutral-200 p-6 hover:border-neutral-900 hover:shadow-brutal transition-all">
                <span className="inline-block px-3 py-1 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider mb-4">
                  {guide.category}
                </span>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">{guide.title}</h3>
                <p className="text-neutral-500 text-sm mb-4">{guide.description}</p>
                <Link to="/knowledge" className="text-sm font-bold text-accent-600 uppercase tracking-wider hover:text-accent-700">
                  Read Guide →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-neutral-900 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="font-black text-2xl text-neutral-900">100%</div>
              <div className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Verified Dealers</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-neutral-900 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div className="font-black text-2xl text-neutral-900">ISI</div>
              <div className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Certified Products</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-neutral-900 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div className="font-black text-2xl text-neutral-900">60 Sec</div>
              <div className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-neutral-900 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="font-black text-2xl text-neutral-900">15-25%</div>
              <div className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Avg Savings</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16">
        <div className="container-custom">
          <div className="bg-neutral-900 border-4 border-neutral-900 shadow-brutal-lg p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500 text-white text-sm font-bold uppercase tracking-wider mb-6">
                  <Zap className="w-4 h-4" />
                  Get Started
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
                  Ready to Get Quotes?
                </h3>
                <p className="text-neutral-300 text-lg mb-6">
                  Create an RFQ and receive competitive quotes from verified dealers in your area.
                </p>
                <Link to="/rfq/create" className="btn-urgent inline-flex">
                  Create RFQ Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm p-6 text-center">
                  <div className="text-4xl font-black text-accent-400 mb-2">500+</div>
                  <div className="text-sm font-bold text-neutral-300">Verified Dealers</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-6 text-center">
                  <div className="text-4xl font-black text-accent-400 mb-2">15-25%</div>
                  <div className="text-sm font-bold text-neutral-300">Avg. Savings</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
