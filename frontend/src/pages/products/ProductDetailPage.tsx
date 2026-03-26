import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productsApi } from '../../lib/api';
import { useAuthStore, useRFQStore } from '../../lib/store';
import {
  Package, Shield, Award, ChevronRight, Plus, Check,
  Bookmark, BookmarkCheck, Share2, Clock, Zap,
  ArrowRight, TrendingUp, CheckCircle, Star, Loader2
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  modelNumber: string;
  sku?: string;
  specifications?: string;
  images?: string[];
  datasheetUrl?: string;
  manualUrl?: string;
  certifications?: string[];
  warrantyYears?: number;
  isActive: boolean;
  brand: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    priceSegment?: string;
    qualityRating?: number;
  };
  productType: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    subCategory: {
      id: string;
      name: string;
      slug: string;
      category: { id: string; name: string; slug: string };
    };
  };
}

interface SimilarProduct {
  id: string;
  name: string;
  description: string;
  brand: { id: string; name: string };
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addItem, items } = useRFQStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<SimilarProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isAddedToRFQ, setIsAddedToRFQ] = useState(false);
  const [showAddedMessage, setShowAddedMessage] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const response = await productsApi.getProduct(id);
        setProduct(response.data.product);
        setSimilarProducts(response.data.similarProducts || []);
        setIsAddedToRFQ(items.some(item => item.productId === id));
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id, items]);

  const handleAddToRFQ = () => {
    if (!product) return;
    if (!isAuthenticated) { navigate('/login'); return; }
    addItem({ productId: product.id, name: product.name, brand: product.brand.name, quantity: 1 });
    setIsAddedToRFQ(true);
    setShowAddedMessage(true);
    setTimeout(() => setShowAddedMessage(false), 3000);
  };

  const handleSaveProduct = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      await productsApi.saveProduct(id!);
      setIsSaved(true);
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title: product?.name, url: window.location.href });
    } catch {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-900 mb-4">Product not found</p>
          <Link to="/categories" className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const category = product.productType.subCategory.category;
  const subCategory = product.productType.subCategory;

  return (
    <div className="min-h-screen bg-white">
      {/* Success toast */}
      {showAddedMessage && (
        <div className="fixed top-20 right-4 z-50 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span className="text-sm font-medium text-green-700">Added to your RFQ!</span>
          <Link to="/rfq/create" className="text-sm font-medium text-green-700 underline">View RFQ</Link>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link to="/categories" className="hover:text-gray-900">Categories</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to={`/categories/${category.slug}`} className="hover:text-gray-900">{category.name}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-400">{subCategory.name}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl border border-gray-200 aspect-square flex items-center justify-center relative overflow-hidden">
              {product.images && product.images.length > 0 && product.images[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-contain p-6"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <Package className={`w-24 h-24 text-gray-300 ${product.images && product.images.length > 0 && product.images[0] ? 'hidden' : ''}`} />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-medium rounded-full">In Stock</span>
                <span className="px-2 py-0.5 bg-gray-900 text-white text-xs font-medium rounded-full">Verified</span>
              </div>
            </div>

            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((img, idx) => (
                  <div key={idx} className="aspect-square bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                    <img src={img} alt={`${product.name} view ${idx + 2}`} className="w-full h-full object-contain p-2"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Shield, color: 'text-green-600', label: 'Verified' },
                { icon: Award, color: 'text-blue-600', label: 'ISI Certified' },
                { icon: Star, color: 'text-amber-500', label: 'Top Brand' },
              ].map(({ icon: Icon, color, label }) => (
                <div key={label} className="bg-gray-50 rounded-xl border border-gray-200 p-3 text-center">
                  <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
                  <span className="text-xs text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-gray-900 text-white text-xs font-medium rounded-full">
                {product.brand.name}
              </span>
              {product.modelNumber && (
                <span className="text-sm text-gray-500">Model: {product.modelNumber}</span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-tight">
              {product.name}
            </h1>

            {product.description && (
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            )}

            <div className="bg-orange-50 rounded-xl border border-orange-100 p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Get the Best Price in 60 Seconds</h4>
                  <p className="text-sm text-gray-600">
                    Add to RFQ and receive competitive quotes from verified dealers.
                    <span className="font-medium text-orange-600"> Save 15–25% vs retail prices.</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-5 py-4 border-y border-gray-100">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-700">127 dealers online</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-sm text-gray-700">60s avg response</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToRFQ}
                disabled={isAddedToRFQ}
                className={`flex-1 py-3 px-5 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${
                  isAddedToRFQ
                    ? 'bg-green-500 text-white cursor-default'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {isAddedToRFQ ? <><Check className="w-4 h-4" />Added to RFQ</> : <><Plus className="w-4 h-4" />Add to RFQ</>}
              </button>
              <div className="flex gap-2">
                <button onClick={handleSaveProduct} className="px-3 py-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  {isSaved ? <BookmarkCheck className="w-4 h-4 text-orange-500" /> : <Bookmark className="w-4 h-4 text-gray-500" />}
                </button>
                <button onClick={handleShare} className="px-3 py-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  <Share2 className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {isAddedToRFQ && (
              <Link
                to="/rfq/create"
                className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 bg-white border border-gray-200 text-gray-900 text-sm font-medium rounded-lg hover:border-gray-300 transition-colors"
              >
                Go to RFQ
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                <span className="text-xs text-gray-500">Category</span>
                <p className="text-sm font-medium text-gray-900 mt-1">{category.name}</p>
              </div>
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                <span className="text-xs text-gray-500">Product Type</span>
                <p className="text-sm font-medium text-gray-900 mt-1">{product.productType.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-5">Technical Specifications</h2>
              {product.specifications ? (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <tbody>
                      {(() => {
                        try {
                          const specs = JSON.parse(product.specifications);
                          return Object.entries(specs).map(([key, value], index) => (
                            <tr key={key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-4 py-3 text-sm font-medium text-gray-700 border-b border-gray-100 w-1/3">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
                                {String(value)}
                              </td>
                            </tr>
                          ));
                        } catch {
                          return (
                            <tr><td className="px-4 py-3 text-sm text-gray-600" colSpan={2}>{product.specifications}</td></tr>
                          );
                        }
                      })()}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center text-sm text-gray-500">
                  Specifications will be updated soon
                </div>
              )}

              {(product.datasheetUrl || product.manualUrl) && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Downloads</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.datasheetUrl && (
                      <a href={product.datasheetUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:border-gray-300 transition-colors">
                        <Package className="w-4 h-4" />Technical Datasheet
                      </a>
                    )}
                    {product.manualUrl && (
                      <a href={product.manualUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:border-gray-300 transition-colors">
                        <Package className="w-4 h-4" />User Manual
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {product.certifications && product.certifications.length > 0 && (
                <div className="bg-green-50 rounded-xl border border-green-100 p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />Certifications
                  </h3>
                  <div className="space-y-2">
                    {product.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-sm text-gray-700">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {product.warrantyYears && (
                <div className="bg-blue-50 rounded-xl border border-blue-100 p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-600" />Warranty
                  </h3>
                  <div className="text-2xl font-semibold text-blue-600 mb-1">
                    {product.warrantyYears} Year{product.warrantyYears > 1 ? 's' : ''}
                  </div>
                  <p className="text-xs text-gray-500">Manufacturer Warranty</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">About {product.brand.name}</h3>
                {product.brand.description && (
                  <p className="text-xs text-gray-600 mb-3">{product.brand.description}</p>
                )}
                <div className="space-y-2">
                  {product.brand.priceSegment && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Price Segment</span>
                      <span className="font-medium text-gray-900">{product.brand.priceSegment}</span>
                    </div>
                  )}
                  {product.brand.qualityRating && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Quality Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="font-medium text-gray-900">{product.brand.qualityRating}/5</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Hub4Estate */}
      <div className="border-t border-gray-200 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-white mb-2">Why Get Quote Through Hub4Estate?</h2>
            <p className="text-sm text-gray-400">Stop wasting time calling multiple dealers. Let them compete for your business.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: TrendingUp, title: 'Save 15–25%', text: 'Dealers compete to offer you the best price.' },
              { icon: Clock, title: '60 Second Response', text: 'Get quotes within a minute.' },
              { icon: Shield, title: 'Verified Dealers', text: 'GST registered, ISI certified products only.' },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-white/10 rounded-xl border border-white/10 p-5">
                <Icon className="w-5 h-5 text-orange-400 mb-3" />
                <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
                <p className="text-xs text-gray-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6 py-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Similar Products</h2>
                <p className="text-sm text-gray-500 mt-0.5">Compare options from other brands</p>
              </div>
              <Link
                to={`/categories/${category.slug}`}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                View All<ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similarProducts.map((sp) => (
                <Link
                  key={sp.id}
                  to={`/products/${sp.id}`}
                  className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all overflow-hidden"
                >
                  <div className="aspect-square bg-gray-50 flex items-center justify-center">
                    <Package className="w-10 h-10 text-gray-300" />
                  </div>
                  <div className="p-3">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{sp.brand.name}</span>
                    <h3 className="text-xs font-medium text-gray-900 mt-2 line-clamp-2">{sp.name}</h3>
                  </div>
                  <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
                    <span className="text-xs font-medium text-orange-600">Get Quote →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
