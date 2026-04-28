import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsApi } from '../../lib/api';
import {
  Loader2, Heart, Package, Trash2, ExternalLink,
  AlertCircle, Bookmark, Search,
} from 'lucide-react';

interface SavedProduct {
  id: string;
  productId: string;
  notes: string | null;
  createdAt: string;
  product: {
    id: string;
    name: string;
    brand?: { name: string } | string;
    category?: { name: string } | string;
    mrp?: number;
    images?: string[];
    imageUrl?: string;
    slug?: string;
  };
}

export function UserSavedProductsPage() {
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    loadSavedProducts();
  }, []);

  const loadSavedProducts = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await productsApi.getSavedProducts();
      setSavedProducts(res.data.savedProducts || res.data || []);
    } catch {
      setError('Failed to load saved products.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    setRemovingId(productId);
    try {
      // Toggle save (unsave)
      await productsApi.saveProduct(productId);
      setSavedProducts(prev => prev.filter(sp => sp.productId !== productId && sp.product?.id !== productId));
    } catch {
      // Could show toast
    } finally {
      setRemovingId(null);
    }
  };

  const getBrandName = (brand: { name: string } | string | undefined): string => {
    if (!brand) return '';
    if (typeof brand === 'string') return brand;
    return brand.name || '';
  };

  const getCategoryName = (category: { name: string } | string | undefined): string => {
    if (!category) return '';
    if (typeof category === 'string') return category;
    return category.name || '';
  };

  const getImageUrl = (product: SavedProduct['product']): string | null => {
    if (product.images && product.images.length > 0) return product.images[0];
    if (product.imageUrl) return product.imageUrl;
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Saved Products</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {savedProducts.length > 0
                  ? `${savedProducts.length} product${savedProducts.length !== 1 ? 's' : ''} saved`
                  : 'Products you have bookmarked'}
              </p>
            </div>
            <Link
              to="/user/categories"
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Search className="w-4 h-4" />
              Browse Products
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-gray-300 mb-3" />
            <p className="text-sm text-gray-400">Loading saved products...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-8 h-8 text-red-300 mb-3" />
            <p className="text-sm text-red-500">{error}</p>
            <button
              onClick={loadSavedProducts}
              className="mt-3 text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              Try again
            </button>
          </div>
        ) : savedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <Bookmark className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">No saved products</p>
            <p className="text-xs text-gray-400 mb-5 max-w-sm text-center">
              Save products while browsing to compare later or include in your next request.
            </p>
            <Link
              to="/user/categories"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
            >
              <Package className="w-4 h-4" />
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedProducts.map(saved => {
              const product = saved.product;
              const imageUrl = getImageUrl(product);
              const brandName = getBrandName(product.brand);
              const categoryName = getCategoryName(product.category);
              const isRemoving = removingId === (saved.productId || product.id);

              return (
                <div
                  key={saved.id || saved.productId}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all group"
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-50 relative">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-contain p-4"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-200" />
                      </div>
                    )}

                    {/* Remove button */}
                    <button
                      onClick={() => handleRemove(saved.productId || product.id)}
                      disabled={isRemoving}
                      className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors group/btn"
                    >
                      {isRemoving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5 text-gray-400 group-hover/btn:text-red-500 transition-colors" />
                      )}
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-3.5">
                    {brandName && (
                      <p className="text-[11px] font-medium text-amber-600 uppercase tracking-wide mb-0.5">
                        {brandName}
                      </p>
                    )}
                    <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
                      {product.name}
                    </p>
                    {categoryName && (
                      <p className="text-xs text-gray-400 mt-1">{categoryName}</p>
                    )}
                    {product.mrp && (
                      <p className="text-sm font-semibold text-gray-900 mt-2">
                        Rs. {product.mrp.toLocaleString('en-IN')}
                        <span className="text-[11px] text-gray-400 font-normal ml-1">MRP</span>
                      </p>
                    )}
                    {saved.notes && (
                      <p className="text-xs text-gray-500 mt-1.5 bg-gray-50 rounded px-2 py-1 truncate">
                        {saved.notes}
                      </p>
                    )}

                    <Link
                      to={`/user/products/${product.id}`}
                      className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 bg-gray-50 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      View Details
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
