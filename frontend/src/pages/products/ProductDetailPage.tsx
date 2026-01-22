import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productsApi } from '../../lib/api';
import { useAuthStore, useRFQStore } from '../../lib/store';
import { Breadcrumb, Button, PageLoader, EmptyState, Alert } from '../../components/ui';
import {
  Package, Shield, Award, ChevronRight, Plus, Check,
  Bookmark, BookmarkCheck, Share2, Clock, Users, Zap,
  ArrowRight, TrendingUp, AlertTriangle, CheckCircle, Star
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  modelNumber: string;
  sku?: string;
  specifications?: string; // JSON string
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
      category: {
        id: string;
        name: string;
        slug: string;
      };
    };
  };
}

interface SimilarProduct {
  id: string;
  name: string;
  description: string;
  brand: {
    id: string;
    name: string;
  };
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

        // Check if already in RFQ
        const inRFQ = items.some(item => item.productId === id);
        setIsAddedToRFQ(inRFQ);
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

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      brand: product.brand.name,
      quantity: 1,
    });

    setIsAddedToRFQ(true);
    setShowAddedMessage(true);
    setTimeout(() => setShowAddedMessage(false), 3000);
  };

  const handleSaveProduct = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await productsApi.saveProduct(id!);
      setIsSaved(true);
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product?.name,
        text: `Check out ${product?.name} on Hub4Estate`,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return <PageLoader message="Loading product details..." />;
  }

  if (!product) {
    return (
      <div className="container-custom py-16">
        <EmptyState
          icon={Package}
          title="Product not found"
          description="The product you're looking for doesn't exist or has been removed."
          action={
            <Link to="/categories" className="btn-primary">
              Browse Products
            </Link>
          }
        />
      </div>
    );
  }

  const category = product.productType.subCategory.category;
  const subCategory = product.productType.subCategory;

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

      {/* Breadcrumb */}
      <section className="bg-neutral-50 border-b-2 border-neutral-200">
        <div className="container-custom py-4">
          <Breadcrumb
            items={[
              { label: 'Categories', href: '/categories' },
              { label: category.name, href: `/categories/${category.slug}` },
              { label: subCategory.name },
              { label: product.name },
            ]}
          />
        </div>
      </section>

      {/* Success Message */}
      {showAddedMessage && (
        <div className="fixed top-20 right-4 z-50 animate-slide-up">
          <Alert variant="success">
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5" />
              <span className="font-bold">Added to your RFQ!</span>
              <Link to="/rfq/create" className="font-bold underline">View RFQ</Link>
            </div>
          </Alert>
        </div>
      )}

      {/* Product Details */}
      <section className="py-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="space-y-6">
              <div className="bg-neutral-100 border-2 border-neutral-200 aspect-square flex items-center justify-center relative">
                <Package className="w-32 h-32 text-neutral-300" />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <div className="px-3 py-1 bg-green-500 text-white text-xs font-bold uppercase tracking-wider">
                    In Stock
                  </div>
                  <div className="px-3 py-1 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider">
                    Verified
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-neutral-50 border-2 border-neutral-200 p-4 text-center">
                  <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Verified</span>
                </div>
                <div className="bg-neutral-50 border-2 border-neutral-200 p-4 text-center">
                  <Award className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">ISI Certified</span>
                </div>
                <div className="bg-neutral-50 border-2 border-neutral-200 p-4 text-center">
                  <Star className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                  <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Top Brand</span>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Brand & Model */}
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-neutral-900 text-white font-bold text-sm uppercase tracking-wider">
                  {product.brand.name}
                </div>
                {product.modelNumber && (
                  <span className="text-sm font-medium text-neutral-500">
                    Model: {product.modelNumber}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-neutral-900 leading-tight">
                {product.name}
              </h1>

              {/* Description */}
              {product.description && (
                <p className="text-neutral-600 text-lg leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Price Notice - URGENT */}
              <div className="bg-accent-50 border-2 border-accent-500 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent-500 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-neutral-900 text-lg mb-1">
                      Get the Best Price in 60 Seconds
                    </h4>
                    <p className="text-neutral-600">
                      Add to RFQ and receive competitive quotes from verified dealers.
                      <span className="font-bold text-accent-600"> Save 15-25% vs retail prices.</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Stats */}
              <div className="flex items-center gap-6 py-4 border-y-2 border-neutral-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold text-neutral-700">127 dealers online</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-neutral-500" />
                  <span className="text-sm font-bold text-neutral-700">60s avg response</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToRFQ}
                  disabled={isAddedToRFQ}
                  className={`flex-1 py-4 px-6 font-bold text-lg flex items-center justify-center transition-all ${
                    isAddedToRFQ
                      ? 'bg-green-500 text-white cursor-default'
                      : 'btn-urgent'
                  }`}
                >
                  {isAddedToRFQ ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Added to RFQ
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      Add to RFQ
                    </>
                  )}
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveProduct}
                    className="btn-secondary px-4"
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-5 h-5 text-accent-600" />
                    ) : (
                      <Bookmark className="w-5 h-5" />
                    )}
                  </button>
                  <button onClick={handleShare} className="btn-secondary px-4">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {isAddedToRFQ && (
                <Link to="/rfq/create" className="btn-primary w-full justify-center">
                  Go to RFQ
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              )}

              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-4 pt-6">
                <div className="bg-neutral-50 border-2 border-neutral-200 p-4">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Category</span>
                  <p className="font-bold text-neutral-900 mt-1">{category.name}</p>
                </div>
                <div className="bg-neutral-50 border-2 border-neutral-200 p-4">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Product Type</span>
                  <p className="font-bold text-neutral-900 mt-1">{product.productType.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Specifications Section */}
      <section className="py-12 border-t-2 border-neutral-200">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Specifications */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl md:text-3xl font-black text-neutral-900 mb-6">
                Technical Specifications
              </h2>
              {product.specifications ? (
                <div className="bg-neutral-50 border-2 border-neutral-200">
                  <table className="w-full">
                    <tbody>
                      {(() => {
                        try {
                          const specs = JSON.parse(product.specifications);
                          return Object.entries(specs).map(([key, value], index) => (
                            <tr key={key} className={index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>
                              <td className="px-4 py-3 font-bold text-neutral-700 border-b border-neutral-200 w-1/3">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </td>
                              <td className="px-4 py-3 text-neutral-900 border-b border-neutral-200">
                                {String(value)}
                              </td>
                            </tr>
                          ));
                        } catch {
                          return (
                            <tr>
                              <td className="px-4 py-3 text-neutral-600" colSpan={2}>
                                {product.specifications}
                              </td>
                            </tr>
                          );
                        }
                      })()}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-neutral-50 border-2 border-neutral-200 p-6 text-center">
                  <p className="text-neutral-500">Specifications will be updated soon</p>
                </div>
              )}

              {/* Downloads */}
              {(product.datasheetUrl || product.manualUrl) && (
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-neutral-900 mb-4">Downloads</h3>
                  <div className="flex flex-wrap gap-4">
                    {product.datasheetUrl && (
                      <a
                        href={product.datasheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-sm"
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Technical Datasheet
                      </a>
                    )}
                    {product.manualUrl && (
                      <a
                        href={product.manualUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-sm"
                      >
                        <Package className="w-4 h-4 mr-2" />
                        User Manual
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Certifications & Warranty Sidebar */}
            <div className="space-y-6">
              {/* Certifications */}
              {product.certifications && product.certifications.length > 0 && (
                <div className="bg-green-50 border-2 border-green-200 p-6">
                  <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    Certifications
                  </h3>
                  <div className="space-y-2">
                    {product.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-neutral-700">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warranty */}
              {product.warrantyYears && (
                <div className="bg-blue-50 border-2 border-blue-200 p-6">
                  <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    Warranty
                  </h3>
                  <div className="text-3xl font-black text-blue-600 mb-1">
                    {product.warrantyYears} Year{product.warrantyYears > 1 ? 's' : ''}
                  </div>
                  <p className="text-sm text-neutral-600">Manufacturer Warranty</p>
                </div>
              )}

              {/* Brand Info */}
              <div className="bg-neutral-50 border-2 border-neutral-200 p-6">
                <h3 className="text-lg font-bold text-neutral-900 mb-4">About {product.brand.name}</h3>
                {product.brand.description && (
                  <p className="text-sm text-neutral-600 mb-4">{product.brand.description}</p>
                )}
                <div className="space-y-2">
                  {product.brand.priceSegment && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">Price Segment</span>
                      <span className="font-bold text-neutral-900">{product.brand.priceSegment}</span>
                    </div>
                  )}
                  {product.brand.qualityRating && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">Quality Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-neutral-900">{product.brand.qualityRating}/5</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Get Quote Section */}
      <section className="py-12 bg-neutral-900 text-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Why Get Quote Through Hub4Estate?
            </h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
              Stop wasting time calling multiple dealers. Let them compete for your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 border border-white/20 p-6">
              <div className="w-14 h-14 bg-accent-500 flex items-center justify-center mb-4">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Save 15-25%</h3>
              <p className="text-neutral-400">
                Dealers compete to offer you the best price. No more paying retail markup.
              </p>
            </div>

            <div className="bg-white/10 border border-white/20 p-6">
              <div className="w-14 h-14 bg-accent-500 flex items-center justify-center mb-4">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">60 Second Response</h3>
              <p className="text-neutral-400">
                Get quotes within a minute. No waiting, no phone tag, no delays.
              </p>
            </div>

            <div className="bg-white/10 border border-white/20 p-6">
              <div className="w-14 h-14 bg-accent-500 flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Verified Dealers</h3>
              <p className="text-neutral-400">
                All dealers are verified. GST registered, ISI certified products only.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="py-12 bg-neutral-50">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-neutral-900">Similar Products</h2>
                <p className="text-neutral-500 mt-1">Compare options from other brands</p>
              </div>
              <Link to={`/categories/${category.slug}`} className="btn-secondary text-sm">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((sp, index) => (
                <Link
                  key={sp.id}
                  to={`/products/${sp.id}`}
                  className="group bg-white border-2 border-neutral-200 hover:border-neutral-900 hover:shadow-brutal transition-all duration-200"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="aspect-square bg-neutral-100 flex items-center justify-center">
                    <Package className="w-16 h-16 text-neutral-300 group-hover:text-neutral-400 transition-colors" />
                  </div>
                  <div className="p-4">
                    <div className="px-2 py-1 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider inline-block mb-2">
                      {sp.brand.name}
                    </div>
                    <h3 className="font-bold text-neutral-900 group-hover:text-accent-600 transition-colors line-clamp-2">
                      {sp.name}
                    </h3>
                  </div>
                  <div className="px-4 py-3 bg-neutral-50 border-t-2 border-neutral-200">
                    <span className="text-xs font-bold text-accent-600">Get Quote →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="bg-neutral-900 border-4 border-neutral-900 shadow-brutal-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 md:p-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500 text-white text-sm font-bold uppercase tracking-wider mb-6">
                  <AlertTriangle className="w-4 h-4" />
                  Don't Overpay
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                  Ready to Get the Best Price?
                </h2>
                <p className="text-neutral-300 text-lg mb-8">
                  Create an RFQ with this product and receive competitive quotes from multiple verified dealers.
                  Compare prices, delivery times, and dealer ratings - all in one place.
                </p>
                <Link to="/rfq/create" className="btn-urgent inline-flex">
                  Create Your RFQ
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>

              <div className="bg-accent-500 p-8 md:p-12 flex items-center">
                <div className="grid grid-cols-2 gap-6 w-full">
                  <div className="text-center">
                    <div className="text-5xl font-black text-white mb-2">127</div>
                    <div className="text-sm font-bold text-white/80">Dealers Online</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-black text-white mb-2">60s</div>
                    <div className="text-sm font-bold text-white/80">Avg Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-black text-white mb-2">25%</div>
                    <div className="text-sm font-bold text-white/80">Max Savings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-black text-white mb-2">₹2.3Cr</div>
                    <div className="text-sm font-bold text-white/80">Saved Monthly</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
