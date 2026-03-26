import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsApi } from '../../lib/api';
import { CategoryTile, STATIC_CATEGORIES } from '../../components/InteractiveCategoryGrid';
import {
  Search, ArrowRight, Package, Shield, CheckCircle, Clock, TrendingUp, Loader2
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
      {/* Hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-600 mb-4">
                <Package className="w-3.5 h-3.5" />
                Product Catalog
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-3">
                Electrical Products.<br />
                <span className="text-orange-500">Best Prices.</span>
              </h1>
              <p className="text-gray-500 mb-6">
                Browse our catalog of electrical products. Get quotes from{' '}
                <span className="font-medium text-gray-700">500+ verified dealers</span> across India.
              </p>
              <div className="relative max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories, products, brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-gray-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { value: '14', label: 'Categories' },
                { value: '50+', label: 'Top Brands' },
                { value: '10K+', label: 'Products' },
                { value: '500+', label: 'Verified Dealers' },
              ].map(({ value, label }) => (
                <div key={label} className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                  <div className="text-2xl font-semibold text-gray-900 mb-1">{value}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">All Categories</h2>
            <p className="text-sm text-gray-500 mt-0.5">Select a category to browse products</p>
          </div>
          <Link
            to="/rfq/create"
            className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Get Quote
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Package className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-900 mb-1">No categories found</p>
            <p className="text-sm text-gray-500">
              {searchQuery ? 'Try a different search term' : 'No categories available at the moment'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCategories.map((category, index) => (
              <CategoryTile key={category.id} category={category} index={index} />
            ))}
          </div>
        )}
      </div>

      {/* Buying Guides */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Buying Guides</h2>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">
              Don't know what to buy? Our expert guides will help you make the right choice.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: 'How to Choose the Right Wire Size',
                description: 'Understanding wire gauge, current capacity, and safety ratings for your project.',
                category: 'Wires & Cables',
              },
              {
                title: 'MCB vs RCCB: What You Need',
                description: 'Learn the difference between circuit breakers and when to use each type.',
                category: 'Switchgear',
              },
              {
                title: 'LED Lighting Guide for Homes',
                description: 'Wattage, color temperature, and placement tips for perfect home lighting.',
                category: 'Lighting',
              },
            ].map((guide, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all">
                <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full mb-3">
                  {guide.category}
                </span>
                <h3 className="text-sm font-semibold text-gray-900 mb-1.5">{guide.title}</h3>
                <p className="text-xs text-gray-500 mb-4">{guide.description}</p>
                <Link to="/knowledge" className="text-xs font-medium text-orange-600 hover:text-orange-700">
                  Read Guide →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Shield, value: '100%', label: 'Verified Dealers' },
              { icon: CheckCircle, value: 'ISI', label: 'Certified Products' },
              { icon: Clock, value: '60 Sec', label: 'Avg Response' },
              { icon: TrendingUp, value: '15–25%', label: 'Avg Savings' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label}>
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="text-xl font-semibold text-gray-900 mb-0.5">{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
