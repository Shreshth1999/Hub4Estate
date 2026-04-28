import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsApi } from '../../lib/api';
import {
  ChevronRight, Package, Info, AlertTriangle, CheckCircle,
  ArrowRight, Clock, Shield, Award, TrendingUp, Loader2
} from 'lucide-react';
import { SEO } from '../../components/SEO';

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-900 mb-1">Category not found</p>
          <p className="text-sm text-gray-500 mb-4">The category you're looking for doesn't exist.</p>
          <Link
            to="/categories"
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Browse All Categories
          </Link>
        </div>
      </div>
    );
  }

  const activeSubCategoryData = category.subCategories.find(sc => sc.id === activeSubCategory);
  const totalProducts = category.subCategories.reduce((acc, sc) => acc + sc.productTypes.length, 0);

  return (
    <div className="min-h-screen bg-white">
      <SEO
        canonicalUrl={`/categories/${slug}`}
        title={`${category.name} — Best Prices from Verified Dealers | Hub4Estate`}
        description={`Buy ${category.name} at the best price on Hub4Estate. Compare prices from verified dealers across India. ${totalProducts} products available. Zero middlemen, full transparency. Save up to 40%.`}
        keywords={`${category.name} best price, buy ${category.name} online India, ${category.name} wholesale, ${category.name} verified dealer, Hub4Estate ${category.name}, electrical ${category.name}`}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "@id": `https://hub4estate.com/categories/${slug}#collection`,
            "name": `${category.name} — Best Prices on Hub4Estate`,
            "description": category.description || `Browse ${totalProducts}+ ${category.name.toLowerCase()} product types from India's top brands on Hub4Estate. Compare quotes from verified dealers.`,
            "url": `https://hub4estate.com/categories/${slug}`,
            "isPartOf": { "@id": "https://hub4estate.com/#website" },
            "about": { "@type": "Thing", "name": category.name },
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": totalProducts,
              "itemListElement": category.subCategories.flatMap((sc, sIdx) =>
                sc.productTypes.filter((pt) => pt.isActive).map((pt, pIdx) => ({
                  "@type": "ListItem",
                  "position": sIdx * 100 + pIdx + 1,
                  "name": pt.name,
                  "url": `https://hub4estate.com/product-types/${pt.slug}`
                }))
              )
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://hub4estate.com/" },
              { "@type": "ListItem", "position": 2, "name": "Categories", "item": "https://hub4estate.com/categories" },
              { "@type": "ListItem", "position": 3, "name": category.name, "item": `https://hub4estate.com/categories/${slug}` }
            ]
          }
        ]}
      />
      {/* Breadcrumb + Hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
            <Link to="/categories" className="hover:text-gray-900 transition-colors">Categories</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900">{category.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-600 mb-4">
                {category.subCategories.length} Subcategories
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-3">
                {category.name}
              </h1>
              <p className="text-gray-500 mb-6">
                Browse {totalProducts}+ product types from India's top brands.
                Get competitive quotes from verified dealers.
              </p>
              <Link
                to="/rfq/create"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Get Quote Now
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { value: `${totalProducts}+`, label: 'Product Types' },
                { value: '50+', label: 'Top Brands' },
                { value: '127', label: 'Dealers Online' },
                { value: '60s', label: 'Avg Response' },
              ].map(({ value, label }) => (
                <div key={label} className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                  <div className="text-2xl font-semibold text-gray-900 mb-1">{value}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-24">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Subcategories</h3>
              </div>
              <nav className="p-2">
                {category.subCategories.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubCategory(sub.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg transition-all text-sm ${
                      activeSubCategory === sub.id
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{sub.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeSubCategory === sub.id
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {sub.productTypes.length}
                    </span>
                  </button>
                ))}
              </nav>
              <div className="p-3 border-t border-gray-200">
                <Link
                  to="/rfq/create"
                  className="flex items-center justify-center gap-1.5 w-full px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Get Quote
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Main Area */}
          <div className="lg:col-span-3">
            {/* Mobile tabs */}
            <div className="lg:hidden mb-6 overflow-x-auto">
              <div className="flex gap-2 pb-2">
                {category.subCategories.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubCategory(sub.id)}
                    className={`flex-shrink-0 px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${
                      activeSubCategory === sub.id
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {sub.name} ({sub.productTypes.length})
                  </button>
                ))}
              </div>
            </div>

            {activeSubCategoryData && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{activeSubCategoryData.name}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {activeSubCategoryData.productTypes.length} product types available
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                    <TrendingUp className="w-3.5 h-3.5" />
                    High Demand
                  </div>
                </div>

                {activeSubCategoryData.productTypes.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                    <Package className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Product types will be added soon.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeSubCategoryData.productTypes.map((pt) => (
                      <Link
                        key={pt.id}
                        to={`/product-types/${pt.slug}`}
                        className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all overflow-hidden"
                      >
                        <div className="p-5">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Package className="w-5 h-5 text-gray-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-gray-700">
                                {pt.name}
                              </h3>
                              <p className="text-xs text-gray-500 mt-0.5">Multiple brands available</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>
                        <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-xs text-gray-500">View Products</span>
                          <span className="text-xs font-medium text-green-600">Quotes Available</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Buying Guide */}
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Info className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Buying Guide</h2>
                  <p className="text-xs text-gray-500">Essential tips before you purchase</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    icon: Info,
                    bg: 'bg-blue-50',
                    border: 'border-blue-100',
                    iconColor: 'text-blue-500',
                    title: 'What to Know',
                    text: `Understand the key specifications and standards for ${category.name.toLowerCase()} products before making your purchase.`,
                  },
                  {
                    icon: AlertTriangle,
                    bg: 'bg-amber-50',
                    border: 'border-amber-100',
                    iconColor: 'text-amber-500',
                    title: 'Common Mistakes',
                    text: 'Avoid typical errors like choosing wrong specifications or ignoring ISI certification requirements.',
                  },
                  {
                    icon: CheckCircle,
                    bg: 'bg-green-50',
                    border: 'border-green-100',
                    iconColor: 'text-green-500',
                    title: 'Quality Check',
                    text: 'Always verify ISI marks, brand authenticity, and warranty terms before purchasing.',
                  },
                ].map(({ icon: Icon, bg, border, iconColor, title, text }) => (
                  <div key={title} className={`${bg} rounded-xl border ${border} p-5`}>
                    <Icon className={`w-5 h-5 ${iconColor} mb-3`} />
                    <h3 className="text-sm font-semibold text-gray-900 mb-1.5">{title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Shield, value: '100%', label: 'Verified Dealers' },
              { icon: Award, value: 'ISI', label: 'Certified Products' },
              { icon: Clock, value: '60 Sec', label: 'Avg Response Time' },
              { icon: TrendingUp, value: '15–25%', label: 'Avg Savings' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label}>
                <div className="w-10 h-10 bg-white rounded-xl border border-gray-200 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-4.5 h-4.5 text-gray-600" />
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
