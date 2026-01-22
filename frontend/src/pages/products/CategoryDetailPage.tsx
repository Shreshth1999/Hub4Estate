import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsApi } from '../../lib/api';
import { Breadcrumb, EmptyState, PageLoader } from '../../components/ui';
import { ElectricalBackgroundSystem } from '../../components/ElectricalBackgroundSystem';
import {
  ChevronRight, Package, Info, AlertTriangle, CheckCircle,
  ArrowRight, Clock, Users, Zap, Shield, Award, TrendingUp
} from 'lucide-react';

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  productTypes: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
  }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  subCategories: SubCategory[];
}

export function CategoryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubCategory, setActiveSubCategory] = useState<string>('');

  useEffect(() => {
    const fetchCategory = async () => {
      if (!slug) return;

      try {
        const response = await productsApi.getCategoryBySlug(slug);
        const cat = response.data.category;
        setCategory(cat);

        // Set first subcategory as active
        if (cat.subCategories?.length > 0) {
          setActiveSubCategory(cat.subCategories[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch category:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [slug]);

  if (isLoading) {
    return <PageLoader message="Loading category..." />;
  }

  if (!category) {
    return (
      <div className="container-custom py-16">
        <EmptyState
          title="Category not found"
          description="The category you're looking for doesn't exist or has been removed."
          action={
            <Link to="/categories" className="btn-primary">
              Browse All Categories
            </Link>
          }
        />
      </div>
    );
  }

  const activeSubCategoryData = category.subCategories.find(sc => sc.id === activeSubCategory);
  const totalProducts = category.subCategories.reduce((acc, sc) => acc + sc.productTypes.length, 0);

  return (
    <div className="min-h-screen bg-white relative">
      {/* Electrical background system with zone-based sketches and interactive cursor */}
      <ElectricalBackgroundSystem />

      {/* Hero Header */}
      <section className="bg-neutral-900 text-white">
        <div className="container-custom py-12">
          <Breadcrumb
            items={[
              { label: 'Categories', href: '/categories' },
              { label: category.name },
            ]}
          />

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500 text-white text-sm font-bold uppercase tracking-wider mb-6">
                <Zap className="w-4 h-4" />
                {category.subCategories.length} Subcategories
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6">
                {category.name}
              </h1>

              <p className="text-xl text-neutral-300 mb-8 leading-relaxed">
                Browse {totalProducts}+ product types from India's top brands.
                Get competitive quotes from verified dealers.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/rfq/create" className="btn-urgent">
                  Get Quote Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
                <div className="text-4xl font-black text-accent-400 mb-2">{totalProducts}+</div>
                <div className="text-sm font-bold uppercase tracking-wider text-neutral-300">Product Types</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
                <div className="text-4xl font-black text-accent-400 mb-2">50+</div>
                <div className="text-sm font-bold uppercase tracking-wider text-neutral-300">Top Brands</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
                <div className="text-4xl font-black text-accent-400 mb-2">127</div>
                <div className="text-sm font-bold uppercase tracking-wider text-neutral-300">Dealers Online</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
                <div className="text-4xl font-black text-accent-400 mb-2">60s</div>
                <div className="text-sm font-bold uppercase tracking-wider text-neutral-300">Avg Response</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Urgency Banner */}
      <div className="bg-accent-500 text-white py-3">
        <div className="container-custom">
          <div className="flex items-center justify-center gap-6 text-sm font-bold">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Limited Time: Extra 5% Off on Bulk Orders</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>47 buyers requested quotes in last hour</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Subcategory Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-neutral-50 border-2 border-neutral-200 sticky top-24">
                <div className="p-4 bg-neutral-900 text-white">
                  <h3 className="font-black uppercase tracking-wider text-sm">Subcategories</h3>
                </div>
                <nav className="p-2">
                  {category.subCategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setActiveSubCategory(sub.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all ${
                        activeSubCategory === sub.id
                          ? 'bg-neutral-900 text-white font-bold'
                          : 'text-neutral-700 hover:bg-neutral-100 font-medium'
                      }`}
                    >
                      <span>{sub.name}</span>
                      <span className={`text-xs px-2 py-1 font-bold ${
                        activeSubCategory === sub.id
                          ? 'bg-accent-500 text-white'
                          : 'bg-neutral-200 text-neutral-600'
                      }`}>
                        {sub.productTypes.length}
                      </span>
                    </button>
                  ))}
                </nav>

                {/* Quick CTA */}
                <div className="p-4 border-t-2 border-neutral-200">
                  <Link to="/rfq/create" className="btn-urgent w-full justify-center text-sm">
                    Get Quote
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {/* Mobile Tabs */}
              <div className="lg:hidden mb-6 overflow-x-auto">
                <div className="flex gap-2 pb-2">
                  {category.subCategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setActiveSubCategory(sub.id)}
                      className={`flex-shrink-0 px-4 py-2 text-sm font-bold border-2 transition-all ${
                        activeSubCategory === sub.id
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-900'
                      }`}
                    >
                      {sub.name} ({sub.productTypes.length})
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Types Grid */}
              {activeSubCategoryData && (
                <>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black text-neutral-900">
                        {activeSubCategoryData.name}
                      </h2>
                      <p className="text-neutral-500 mt-1">
                        {activeSubCategoryData.productTypes.length} product types available
                      </p>
                    </div>
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 font-bold text-sm">
                      <TrendingUp className="w-4 h-4" />
                      High Demand
                    </div>
                  </div>

                  {activeSubCategoryData.productTypes.length === 0 ? (
                    <EmptyState
                      icon={Package}
                      title="No product types yet"
                      description="Product types will be added soon for this subcategory."
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeSubCategoryData.productTypes.map((pt, index) => (
                        <Link
                          key={pt.id}
                          to={`/product-types/${pt.slug}`}
                          className="group bg-white border-2 border-neutral-200 hover:border-neutral-900 hover:shadow-brutal transition-all duration-200"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <div className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-14 h-14 bg-neutral-900 flex items-center justify-center flex-shrink-0 group-hover:bg-accent-500 transition-colors">
                                <Package className="w-7 h-7 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-neutral-900 group-hover:text-accent-600 transition-colors">
                                  {pt.name}
                                </h3>
                                <p className="text-sm text-neutral-500 mt-1">
                                  Multiple brands available
                                </p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-1 transition-all" />
                            </div>
                          </div>
                          <div className="px-6 py-3 bg-neutral-50 border-t-2 border-neutral-200 flex items-center justify-between">
                            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                              View Products
                            </span>
                            <span className="text-xs font-bold text-green-600">
                              Quotes Available
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Educational Content */}
              <div className="mt-16">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center">
                    <Info className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-neutral-900">Buying Guide</h2>
                    <p className="text-neutral-500">Essential tips before you purchase</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-primary-50 border-2 border-primary-200 p-6">
                    <div className="w-12 h-12 bg-primary-500 flex items-center justify-center mb-4">
                      <Info className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-neutral-900 mb-2 text-lg">What to Know</h3>
                    <p className="text-neutral-600 text-sm leading-relaxed">
                      Understand the key specifications and standards for {category.name.toLowerCase()} products before making your purchase.
                    </p>
                  </div>

                  <div className="bg-amber-50 border-2 border-amber-200 p-6">
                    <div className="w-12 h-12 bg-amber-500 flex items-center justify-center mb-4">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-neutral-900 mb-2 text-lg">Common Mistakes</h3>
                    <p className="text-neutral-600 text-sm leading-relaxed">
                      Avoid typical errors like choosing wrong specifications or ignoring ISI certification requirements.
                    </p>
                  </div>

                  <div className="bg-green-50 border-2 border-green-200 p-6">
                    <div className="w-12 h-12 bg-green-500 flex items-center justify-center mb-4">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-neutral-900 mb-2 text-lg">Quality Check</h3>
                    <p className="text-neutral-600 text-sm leading-relaxed">
                      Always verify ISI marks, brand authenticity, and warranty terms before purchasing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-neutral-50 border-y-2 border-neutral-200">
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
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="font-black text-2xl text-neutral-900">ISI</div>
              <div className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Certified Products</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-neutral-900 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div className="font-black text-2xl text-neutral-900">60 Sec</div>
              <div className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Avg Response Time</div>
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
                  Don't Wait
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
                  Get Your Quote in 60 Seconds
                </h3>
                <p className="text-neutral-300 text-lg mb-6">
                  Stop calling multiple dealers. Submit one RFQ and let verified dealers compete for your business.
                </p>
                <Link to="/rfq/create" className="btn-urgent inline-flex">
                  Create RFQ Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm p-6 text-center">
                  <div className="text-4xl font-black text-accent-400 mb-2">127</div>
                  <div className="text-sm font-bold text-neutral-300">Dealers Online Now</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-6 text-center">
                  <div className="text-4xl font-black text-accent-400 mb-2">₹2.3Cr</div>
                  <div className="text-sm font-bold text-neutral-300">Saved This Month</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
