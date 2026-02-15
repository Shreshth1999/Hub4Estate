import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsApi } from '../../lib/api';
import { useAuthStore, useRFQStore } from '../../lib/store';
import { Breadcrumb, EmptyState, PageLoader } from '../../components/ui';
import {
  Package, ChevronRight, ArrowRight, Clock, Users, Zap,
  Shield, Award, TrendingUp, Plus, Check, Filter
} from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  slug: string;
  priceSegment?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  modelNumber: string;
  sku?: string;
  images?: string[];
  certifications?: string[];
  warrantyYears?: number;
  brand: {
    id: string;
    name: string;
    slug: string;
    priceSegment?: string;
    qualityRating?: number;
  };
}

interface ProductType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  subCategory: {
    id: string;
    name: string;
    slug: string;
    category: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

export function ProductTypePage() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuthStore();
  const { addItem, items } = useRFQStore();

  const [productType, setProductType] = useState<ProductType | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    const fetchProducts = async () => {
      if (!slug) return;

      setIsLoading(true);
      try {
        const params: any = { page: pagination.page, limit: 20 };
        if (selectedBrand) params.brandId = selectedBrand;

        const response = await productsApi.getProductType(slug, params);
        setProductType(response.data.productType);
        setProducts(response.data.products || []);
        setBrands(response.data.brands || []);
        setPagination(response.data.pagination || { page: 1, pages: 1, total: 0 });
      } catch (error) {
        console.error('Failed to fetch product type:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [slug, selectedBrand, pagination.page]);

  const handleAddToRFQ = (product: Product) => {
    if (items.some(item => item.productId === product.id)) return;

    addItem({
      productId: product.id,
      name: product.name,
      brand: product.brand.name,
      quantity: 1,
    });
  };

  if (isLoading) {
    return <PageLoader message="Loading products..." />;
  }

  if (!productType) {
    return (
      <div className="container-custom py-16">
        <EmptyState
          title="Product type not found"
          description="The product type you're looking for doesn't exist or has been removed."
          action={
            <Link to="/categories" className="btn-primary">
              Browse All Categories
            </Link>
          }
        />
      </div>
    );
  }

  const category = productType.subCategory.category;
  const subCategory = productType.subCategory;

  return (
    <div className="min-h-screen bg-white">
      {/* Urgency Banner */}
      <div className="bg-accent-500 text-white py-3">
        <div className="container-custom">
          <div className="flex items-center justify-center gap-6 text-sm font-bold">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>127 dealers online ready to quote</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Avg 15-25% savings vs retail</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <section className="bg-neutral-900 text-white">
        <div className="container-custom py-10">
          <Breadcrumb
            items={[
              { label: 'Categories', href: '/categories' },
              { label: category.name, href: `/categories/${category.slug}` },
              { label: subCategory.name },
              { label: productType.name },
            ]}
          />

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500 text-white text-sm font-bold uppercase tracking-wider mb-6">
                <Package className="w-4 h-4" />
                {pagination.total} Products
              </div>

              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                {productType.name}
              </h1>

              {productType.description && (
                <p className="text-xl text-neutral-300 mb-8 leading-relaxed">
                  {productType.description}
                </p>
              )}

              <Link to="/rfq/create" className="btn-urgent inline-flex">
                Get Quote Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
                <div className="text-4xl font-black text-accent-400 mb-2">{brands.length}</div>
                <div className="text-sm font-bold uppercase tracking-wider text-neutral-300">Brands</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
                <div className="text-4xl font-black text-accent-400 mb-2">{pagination.total}</div>
                <div className="text-sm font-bold uppercase tracking-wider text-neutral-300">Products</div>
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

      {/* Main Content */}
      <section className="py-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Brand Filter */}
            <div className="lg:col-span-1">
              <div className="bg-neutral-50 border-2 border-neutral-200 sticky top-24">
                <div className="p-4 bg-neutral-900 text-white flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <h3 className="font-black uppercase tracking-wider text-sm">Filter by Brand</h3>
                </div>
                <nav className="p-2">
                  <button
                    onClick={() => { setSelectedBrand(''); setPagination(p => ({ ...p, page: 1 })); }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all ${
                      !selectedBrand
                        ? 'bg-neutral-900 text-white font-bold'
                        : 'text-neutral-700 hover:bg-neutral-100 font-medium'
                    }`}
                  >
                    <span>All Brands</span>
                    <span className={`text-xs px-2 py-1 font-bold ${
                      !selectedBrand ? 'bg-accent-500 text-white' : 'bg-neutral-200 text-neutral-600'
                    }`}>
                      {pagination.total}
                    </span>
                  </button>
                  {brands.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => { setSelectedBrand(brand.id); setPagination(p => ({ ...p, page: 1 })); }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all ${
                        selectedBrand === brand.id
                          ? 'bg-neutral-900 text-white font-bold'
                          : 'text-neutral-700 hover:bg-neutral-100 font-medium'
                      }`}
                    >
                      <div>
                        <span>{brand.name}</span>
                        {brand.priceSegment && (
                          <span className="block text-xs text-neutral-500 mt-0.5">{brand.priceSegment}</span>
                        )}
                      </div>
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

            {/* Products Grid */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-neutral-900">
                    {selectedBrand ? brands.find(b => b.id === selectedBrand)?.name : 'All'} Products
                  </h2>
                  <p className="text-neutral-500 mt-1">
                    {pagination.total} products available
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 font-bold text-sm">
                  <TrendingUp className="w-4 h-4" />
                  Quotes Available
                </div>
              </div>

              {products.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="No products found"
                  description={selectedBrand
                    ? "No products found for this brand. Try selecting a different brand."
                    : "No products available in this category yet."
                  }
                  action={
                    selectedBrand ? (
                      <button
                        onClick={() => setSelectedBrand('')}
                        className="btn-secondary"
                      >
                        Show All Brands
                      </button>
                    ) : undefined
                  }
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product, index) => {
                    const isInRFQ = items.some(item => item.productId === product.id);
                    const hasImage = product.images && product.images.length > 0 && product.images[0];

                    return (
                      <div
                        key={product.id}
                        className="group bg-white border-2 border-neutral-200 hover:border-neutral-900 hover:shadow-brutal transition-all duration-200"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        {/* Product Image */}
                        <Link to={`/products/${product.id}`}>
                          <div className="aspect-square bg-neutral-100 flex items-center justify-center relative overflow-hidden">
                            {hasImage ? (
                              <img
                                src={product.images![0]}
                                alt={product.name}
                                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <Package className={`w-16 h-16 text-neutral-300 ${hasImage ? 'hidden' : ''}`} />

                            {/* Badges */}
                            <div className="absolute top-3 left-3 flex flex-col gap-1">
                              <span className="px-2 py-1 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider">
                                {product.brand.name}
                              </span>
                              {product.brand.priceSegment && (
                                <span className="px-2 py-1 bg-accent-500 text-white text-xs font-bold uppercase tracking-wider">
                                  {product.brand.priceSegment}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>

                        {/* Product Info */}
                        <div className="p-4">
                          <Link to={`/products/${product.id}`}>
                            <h3 className="font-bold text-neutral-900 group-hover:text-accent-600 transition-colors line-clamp-2 mb-1">
                              {product.name}
                            </h3>
                          </Link>
                          {product.modelNumber && (
                            <p className="text-xs text-neutral-500 font-medium mb-2">
                              Model: {product.modelNumber}
                            </p>
                          )}
                          {product.description && (
                            <p className="text-sm text-neutral-600 line-clamp-2 mb-3">
                              {product.description}
                            </p>
                          )}

                          {/* Quick Info */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {product.warrantyYears && (
                              <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold">
                                {product.warrantyYears}Y Warranty
                              </span>
                            )}
                            {product.certifications && product.certifications.length > 0 && (
                              <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-bold">
                                {product.certifications[0]}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="px-4 py-3 bg-neutral-50 border-t-2 border-neutral-200 flex items-center justify-between">
                          <Link
                            to={`/products/${product.id}`}
                            className="text-xs font-bold text-neutral-600 hover:text-neutral-900 uppercase tracking-wider"
                          >
                            View Details
                          </Link>
                          <button
                            onClick={() => handleAddToRFQ(product)}
                            disabled={isInRFQ}
                            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                              isInRFQ
                                ? 'bg-green-500 text-white'
                                : 'bg-accent-500 text-white hover:bg-accent-600'
                            }`}
                          >
                            {isInRFQ ? (
                              <>
                                <Check className="w-3 h-3" />
                                Added
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" />
                                Add to RFQ
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setPagination(prev => ({ ...prev, page }))}
                      className={`w-12 h-12 font-bold transition-all ${
                        pagination.page === page
                          ? 'bg-neutral-900 text-white'
                          : 'bg-white border-2 border-neutral-200 text-neutral-700 hover:border-neutral-900'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
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
                  <div className="text-4xl font-black text-accent-400 mb-2">25%</div>
                  <div className="text-sm font-bold text-neutral-300">Max Savings</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
