import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsApi } from '../../lib/api';
import { CategoryTile, STATIC_CATEGORIES } from '../../components/InteractiveCategoryGrid';
import {
  Search, ArrowRight, Package, Shield, CheckCircle, Zap, Loader2
} from 'lucide-react';
import { useInView, revealStyle } from '../../hooks/useInView';

interface Category {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  subCategories: { id: string; name: string; slug: string }[];
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const { ref: heroRef, inView: heroIn } = useInView(0.05);
  const { ref: gridRef, inView: gridIn } = useInView(0.05);
  const { ref: guidesRef, inView: guidesIn } = useInView(0.05);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productsApi.getCategories();
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const displayCategories = categories.length > 0 ? categories : STATIC_CATEGORIES;
  const filteredCategories = displayCategories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">

      {/* Hero — dark */}
      <div className="bg-[#09090B] blueprint-bg-dark relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-amber-600/8 rounded-full blur-3xl animate-glow-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-amber-400/6 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
        </div>
        <div ref={heroRef as any} className="max-w-6xl mx-auto px-6 py-20 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-800 text-gray-300 text-[11px] font-semibold rounded-full mb-6" style={revealStyle(heroIn, 0)}>
                <Package className="w-3.5 h-3.5" />
                Product Catalog
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight" style={revealStyle(heroIn, 0.06)}>
                Electrical Products.<br />
                <span className="text-amber-500">Best Prices.</span>
              </h1>
              <p className="text-gray-400 mb-8 leading-relaxed" style={revealStyle(heroIn, 0.1)}>
                Browse our catalog. Submit a requirement and get quotes from verified dealers across India — always free for buyers.
              </p>
              <div className="relative max-w-xl" style={revealStyle(heroIn, 0.14)}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories, products, brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:border-white/20 focus:outline-none focus:bg-white/15 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3" style={revealStyle(heroIn, 0.16)}>
              {[
                { icon: Shield, title: 'GST-Verified Dealers', desc: 'Every dealer is verified with valid GST before receiving inquiries.' },
                { icon: CheckCircle, title: 'You Compare, You Decide', desc: 'See multiple quotes side by side. No pressure, no hidden fees, no commissions.' },
                { icon: Zap, title: 'Completely Free for Buyers', desc: 'Submit as many requirements as you need. You never pay Hub4Estate.' },
              ].map(({ icon: Icon, title, desc }, i) => (
                <div key={i} className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="w-9 h-9 bg-amber-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white mb-0.5">{title}</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div ref={gridRef as any} className="max-w-6xl mx-auto px-6 py-14">
        <div className="flex items-center justify-between mb-8" style={revealStyle(gridIn, 0)}>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">All Categories</h2>
            <p className="text-sm text-gray-500 mt-0.5">Select a category to browse products and get quotes</p>
          </div>
          <Link
            to="/rfq/create"
            className="hidden md:flex items-center gap-1.5 px-4 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors"
          >
            Get Quote <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <Package className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-900 mb-1">No categories found</p>
            <p className="text-sm text-gray-500">
              {searchQuery ? 'Try a different search term' : 'No categories available at the moment'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" style={revealStyle(gridIn, 0.08)}>
            {filteredCategories.map((category, index) => (
              <CategoryTile key={category.id} category={category} index={index} />
            ))}
          </div>
        )}
      </div>

      {/* Buying Guides — dark */}
      <div ref={guidesRef as any} className="bg-[#09090B] px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10" style={revealStyle(guidesIn, 0)}>
            <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Buying Guides</h2>
            <p className="text-sm text-gray-400 max-w-xl mx-auto">
              Don't know what to buy? Our expert guides help you make the right choice before you spend a rupee.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { title: 'How to Choose the Right Wire Size', description: 'Understanding wire gauge, current capacity, and safety ratings for your project.', category: 'Wires & Cables', accent: 'bg-amber-600/20 text-amber-500' },
              { title: 'MCB vs RCCB: What You Need', description: 'Learn the difference between circuit breakers and when to use each type.', category: 'Switchgear', accent: 'bg-violet-500/20 text-violet-400' },
              { title: 'LED Lighting Guide for Homes', description: 'Wattage, color temperature, and placement tips for perfect home lighting.', category: 'Lighting', accent: 'bg-green-500/20 text-green-400' },
            ].map((guide, index) => (
              <div
                key={index}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all card-3d"
                style={revealStyle(guidesIn, 0.08 + index * 0.06)}
              >
                <span className={`inline-flex items-center px-2.5 py-1 ${guide.accent} text-xs font-bold rounded-full mb-4`}>
                  {guide.category}
                </span>
                <h3 className="text-sm font-bold text-white mb-2">{guide.title}</h3>
                <p className="text-xs text-gray-400 mb-5 leading-relaxed">{guide.description}</p>
                <Link to="/knowledge" className="text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors">
                  Read Guide →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-14 text-center">
        <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Ready to get the best price?</h2>
        <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm">
          Tell us what you need. We'll connect you with verified dealers who compete to give you the best deal.
        </p>
        <Link
          to="/rfq/create"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors"
        >
          Post a Requirement <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
