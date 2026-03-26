import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsApi } from '../../lib/api';
import { useAuthStore, useRFQStore } from '../../lib/store';
import {
  Package, ChevronRight, ArrowRight, Clock, Shield, Award, TrendingUp, Plus, Check, Filter, Loader2
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
    addItem({ productId: product.id, name: product.name, brand: product.brand.name, quantity: 1 });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!productType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-900 mb-1">Product type not found</p>
          <Link to="/categories" className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
            Browse All Categories
          </Link>
        </div>
      </div>
    );
  }

  const category = productType.subCategory.category;
  const subCategory = productType.subCategory;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
            <Link to="/categories" className="hover:text-gray-900">Categories</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to={`/categories/${category.slug}`} className="hover:text-gray-900">{category.name}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-400">{subCategory.name}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900">{productType.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-600 mb-4">
                <Package className="w-3.5 h-3.5" />
                {pagination.total} Products
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-3">
                {productType.name}
              </h1>
              {productType.description && (
                <p className="text-gray-500 mb-6">{productType.description}</p>
              )}
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
                { value: String(brands.length), label: 'Brands' },
                { value: String(pagination.total), label: 'Products' },
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
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-24">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-gray-500" />
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Filter by Brand</h3>
              </div>
              <nav className="p-2">
                <button
                  onClick={() => { setSelectedBrand(''); setPagination(p => ({ ...p, page: 1 })); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg transition-all text-sm ${
                    !selectedBrand ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>All Brands</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${!selectedBrand ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {pagination.total}
                  </span>
                </button>
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => { setSelectedBrand(brand.id); setPagination(p => ({ ...p, page: 1 })); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg transition-all text-sm ${
                      selectedBrand === brand.id ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <span>{brand.name}</span>
                      {brand.priceSegment && (
                        <span className="block text-xs opacity-60 mt-0.5">{brand.priceSegment}</span>
                      )}
                    </div>
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

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedBrand ? brands.find(b => b.id === selectedBrand)?.name : 'All'} Products
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">{pagination.total} products available</p>
              </div>
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                <TrendingUp className="w-3.5 h-3.5" />
                Quotes Available
              </div>
            </div>

            {products.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Package className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-900 mb-1">No products found</p>
                <p className="text-sm text-gray-500 mb-4">
                  {selectedBrand ? 'Try selecting a different brand.' : 'No products available yet.'}
                </p>
                {selectedBrand && (
                  <button
                    onClick={() => setSelectedBrand('')}
                    className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Show All Brands
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => {
                  const isInRFQ = items.some(item => item.productId === product.id);
                  const hasImage = product.images && product.images.length > 0 && product.images[0];

                  return (
                    <div
                      key={product.id}
                      className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all overflow-hidden"
                    >
                      <Link to={`/products/${product.id}`}>
                        <div className="aspect-square bg-gray-50 flex items-center justify-center relative overflow-hidden">
                          {hasImage ? (
                            <img
                              src={product.images![0]}
                              alt={product.name}
                              className="w-full h-full object-contain p-4"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <Package className={`w-12 h-12 text-gray-300 ${hasImage ? 'hidden' : ''}`} />
                          <div className="absolute top-2 left-2">
                            <span className="px-2 py-0.5 bg-gray-900 text-white text-xs font-medium rounded-full">
                              {product.brand.name}
                            </span>
                          </div>
                        </div>
                      </Link>

                      <div className="p-4">
                        <Link to={`/products/${product.id}`}>
                          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1 hover:text-gray-700">
                            {product.name}
                          </h3>
                        </Link>
                        {product.modelNumber && (
                          <p className="text-xs text-gray-500 mb-2">Model: {product.modelNumber}</p>
                        )}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {product.warrantyYears && (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                              {product.warrantyYears}Y Warranty
                            </span>
                          )}
                          {product.certifications && product.certifications.length > 0 && (
                            <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                              {product.certifications[0]}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <Link
                          to={`/products/${product.id}`}
                          className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => handleAddToRFQ(product)}
                          disabled={isInRFQ}
                          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                            isInRFQ
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-900 text-white hover:bg-gray-800'
                          }`}
                        >
                          {isInRFQ ? (
                            <><Check className="w-3 h-3" />Added</>
                          ) : (
                            <><Plus className="w-3 h-3" />Add to RFQ</>
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
                    className={`w-9 h-9 text-sm font-medium rounded-lg transition-all ${
                      pagination.page === page
                        ? 'bg-gray-900 text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
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

      {/* Trust Indicators */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Shield, value: '100%', label: 'Verified Dealers' },
              { icon: Award, value: 'ISI', label: 'Certified Products' },
              { icon: Clock, value: '60 Sec', label: 'Avg Response' },
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
