import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { productsApi } from '../lib/api';
import {
  X, Plus, ChevronRight, Check, Minus, ArrowLeft,
  ShoppingCart, Star, Shield, Package, Zap, AlertCircle
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  modelNumber?: string;
  brand: {
    id: string;
    name: string;
    logo?: string;
  };
  productType: {
    id: string;
    name: string;
    subCategory: {
      id: string;
      name: string;
      category: {
        id: string;
        name: string;
      };
    };
  };
  specifications?: string; // JSON string
  images: string[];
  certifications: string[];
  warrantyYears?: number;
  description?: string;
}

interface CompareSpec {
  key: string;
  label: string;
  values: (string | number | null)[];
}

const MAX_COMPARE_PRODUCTS = 4;

// Parse specifications from JSON string
const parseSpecs = (specsJson?: string): Record<string, any> => {
  if (!specsJson) return {};
  try {
    return JSON.parse(specsJson);
  } catch {
    return {};
  }
};

// Get all unique spec keys from multiple products
const getAllSpecKeys = (products: Product[]): string[] => {
  const keys = new Set<string>();
  products.forEach(product => {
    const specs = parseSpecs(product.specifications);
    Object.keys(specs).forEach(key => keys.add(key));
  });
  return Array.from(keys).sort();
};

// Format spec key to readable label
const formatSpecLabel = (key: string): string => {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

export function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get product IDs from URL
  const productIds = searchParams.get('ids')?.split(',').filter(Boolean) || [];

  useEffect(() => {
    const fetchProducts = async () => {
      if (productIds.length === 0) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const productPromises = productIds.map(id => productsApi.getProduct(id));
        const responses = await Promise.all(productPromises);
        const fetchedProducts = responses.map(r => r.data.product).filter(Boolean);
        setProducts(fetchedProducts);
      } catch (err) {
        console.error('Failed to fetch products for comparison:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  const removeProduct = (productId: string) => {
    const newIds = productIds.filter(id => id !== productId);
    if (newIds.length === 0) {
      navigate('/user/categories');
    } else {
      setSearchParams({ ids: newIds.join(',') });
    }
  };

  const addToQuoteCart = (product: Product) => {
    const cart = JSON.parse(localStorage.getItem('quoteCart') || '[]');
    const exists = cart.some((item: any) => item.productId === product.id);

    if (!exists) {
      cart.push({
        id: Date.now().toString(),
        productId: product.id,
        name: product.name,
        brand: product.brand.name,
        category: product.productType.subCategory.category.name,
        quantity: 1,
      });
      localStorage.setItem('quoteCart', JSON.stringify(cart));
    }

    navigate('/dashboard');
  };

  // Build comparison data
  const specKeys = getAllSpecKeys(products);
  const comparisonSpecs: CompareSpec[] = specKeys.map(key => ({
    key,
    label: formatSpecLabel(key),
    values: products.map(p => {
      const specs = parseSpecs(p.specifications);
      return specs[key] ?? null;
    }),
  }));

  // Empty state
  if (!isLoading && products.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12">
        <div className="container-custom">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-neutral-400" />
            </div>
            <h1 className="text-2xl font-black text-neutral-900 mb-2">No Products to Compare</h1>
            <p className="text-neutral-500 mb-6">
              Browse our catalog and add products to compare their specifications side-by-side.
            </p>
            <Link to="/user/categories" className="btn-primary">
              Browse Products
              <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12">
        <div className="container-custom">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-neutral-200 border-t-neutral-900 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12">
        <div className="container-custom">
          <div className="max-w-md mx-auto text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-neutral-900 mb-2">Error Loading Products</h1>
            <p className="text-neutral-500 mb-6">{error}</p>
            <Link to="/user/categories" className="btn-secondary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-neutral-200 sticky top-0 z-10">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/user/categories" className="p-2 hover:bg-neutral-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-black text-neutral-900">Compare Products</h1>
                <p className="text-sm text-neutral-500">
                  {products.length} of {MAX_COMPARE_PRODUCTS} products
                </p>
              </div>
            </div>
            {products.length < MAX_COMPARE_PRODUCTS && (
              <Link
                to="/user/categories"
                className="btn-secondary text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container-custom py-6">
        {/* Product Headers */}
        <div className="bg-white border-2 border-neutral-200 overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b-2 border-neutral-200">
                <th className="w-48 p-4 text-left bg-neutral-50 border-r-2 border-neutral-200">
                  <span className="text-sm font-bold text-neutral-600">Specifications</span>
                </th>
                {products.map((product, index) => (
                  <th
                    key={product.id}
                    className={`p-4 text-left ${index < products.length - 1 ? 'border-r border-neutral-100' : ''}`}
                    style={{ minWidth: '200px' }}
                  >
                    <div className="relative">
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-neutral-100 hover:bg-red-100 hover:text-red-600 rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>

                      {/* Product Image */}
                      <div className="w-24 h-24 bg-neutral-100 flex items-center justify-center mb-3">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Package className="w-10 h-10 text-neutral-300" />
                        )}
                      </div>

                      {/* Brand */}
                      <div className="flex items-center gap-2 mb-2">
                        {product.brand.logo ? (
                          <img src={product.brand.logo} alt={product.brand.name} className="h-4" />
                        ) : (
                          <span className="text-xs font-bold text-neutral-500 uppercase">
                            {product.brand.name}
                          </span>
                        )}
                      </div>

                      {/* Product Name */}
                      <h3 className="font-bold text-neutral-900 text-sm mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      {product.modelNumber && (
                        <p className="text-xs text-neutral-500 mb-3">
                          Model: {product.modelNumber}
                        </p>
                      )}

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => addToQuoteCart(product)}
                        className="w-full py-2 px-3 bg-accent-500 text-white text-xs font-bold hover:bg-accent-600 transition-colors flex items-center justify-center gap-1"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        Add to Quote Cart
                      </button>
                    </div>
                  </th>
                ))}
                {/* Empty slots */}
                {Array.from({ length: MAX_COMPARE_PRODUCTS - products.length }).map((_, i) => (
                  <th
                    key={`empty-${i}`}
                    className="p-4 border-r border-neutral-100 last:border-r-0"
                    style={{ minWidth: '200px' }}
                  >
                    <Link
                      to="/user/categories"
                      className="block p-8 border-2 border-dashed border-neutral-200 hover:border-neutral-400 transition-colors text-center"
                    >
                      <Plus className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                      <span className="text-sm text-neutral-400">Add Product</span>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Category Row */}
              <tr className="border-b border-neutral-100">
                <td className="p-4 bg-neutral-50 border-r-2 border-neutral-200 font-medium text-sm">
                  Category
                </td>
                {products.map((product, index) => (
                  <td key={product.id} className={`p-4 text-sm ${index < products.length - 1 ? 'border-r border-neutral-100' : ''}`}>
                    {product.productType.subCategory.category.name}
                  </td>
                ))}
                {Array.from({ length: MAX_COMPARE_PRODUCTS - products.length }).map((_, i) => (
                  <td key={`empty-cat-${i}`} className="p-4 border-r border-neutral-100 last:border-r-0">
                    <span className="text-neutral-300">-</span>
                  </td>
                ))}
              </tr>

              {/* Type Row */}
              <tr className="border-b border-neutral-100">
                <td className="p-4 bg-neutral-50 border-r-2 border-neutral-200 font-medium text-sm">
                  Product Type
                </td>
                {products.map((product, index) => (
                  <td key={product.id} className={`p-4 text-sm ${index < products.length - 1 ? 'border-r border-neutral-100' : ''}`}>
                    {product.productType.name}
                  </td>
                ))}
                {Array.from({ length: MAX_COMPARE_PRODUCTS - products.length }).map((_, i) => (
                  <td key={`empty-type-${i}`} className="p-4 border-r border-neutral-100 last:border-r-0">
                    <span className="text-neutral-300">-</span>
                  </td>
                ))}
              </tr>

              {/* Warranty Row */}
              <tr className="border-b border-neutral-100">
                <td className="p-4 bg-neutral-50 border-r-2 border-neutral-200 font-medium text-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    Warranty
                  </div>
                </td>
                {products.map((product, index) => (
                  <td key={product.id} className={`p-4 text-sm ${index < products.length - 1 ? 'border-r border-neutral-100' : ''}`}>
                    {product.warrantyYears ? (
                      <span className="text-green-600 font-medium">{product.warrantyYears} years</span>
                    ) : (
                      <span className="text-neutral-400">Not specified</span>
                    )}
                  </td>
                ))}
                {Array.from({ length: MAX_COMPARE_PRODUCTS - products.length }).map((_, i) => (
                  <td key={`empty-warranty-${i}`} className="p-4 border-r border-neutral-100 last:border-r-0">
                    <span className="text-neutral-300">-</span>
                  </td>
                ))}
              </tr>

              {/* Certifications Row */}
              <tr className="border-b border-neutral-100">
                <td className="p-4 bg-neutral-50 border-r-2 border-neutral-200 font-medium text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    Certifications
                  </div>
                </td>
                {products.map((product, index) => (
                  <td key={product.id} className={`p-4 text-sm ${index < products.length - 1 ? 'border-r border-neutral-100' : ''}`}>
                    {product.certifications?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {product.certifications.map((cert, i) => (
                          <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium">
                            {cert}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-neutral-400">Not specified</span>
                    )}
                  </td>
                ))}
                {Array.from({ length: MAX_COMPARE_PRODUCTS - products.length }).map((_, i) => (
                  <td key={`empty-cert-${i}`} className="p-4 border-r border-neutral-100 last:border-r-0">
                    <span className="text-neutral-300">-</span>
                  </td>
                ))}
              </tr>

              {/* Dynamic Specification Rows */}
              {comparisonSpecs.length > 0 && (
                <tr>
                  <td colSpan={MAX_COMPARE_PRODUCTS + 1} className="bg-neutral-900 text-white p-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      <span className="font-bold text-sm">Technical Specifications</span>
                    </div>
                  </td>
                </tr>
              )}
              {comparisonSpecs.map((spec, specIndex) => (
                <tr key={spec.key} className="border-b border-neutral-100">
                  <td className="p-4 bg-neutral-50 border-r-2 border-neutral-200 font-medium text-sm">
                    {spec.label}
                  </td>
                  {spec.values.map((value, productIndex) => {
                    // Find the best value for highlighting (if numeric)
                    const numericValues = spec.values
                      .map((v, i) => ({ value: parseFloat(String(v)), index: i }))
                      .filter(v => !isNaN(v.value));

                    const isBestNumeric = numericValues.length > 1 &&
                      numericValues.every(nv => nv.index === productIndex || nv.value <= numericValues.find(x => x.index === productIndex)!.value);

                    return (
                      <td
                        key={productIndex}
                        className={`p-4 text-sm ${productIndex < products.length - 1 ? 'border-r border-neutral-100' : ''}`}
                      >
                        {value !== null ? (
                          <span className={isBestNumeric ? 'text-green-600 font-medium' : ''}>
                            {String(value)}
                          </span>
                        ) : (
                          <span className="text-neutral-300">-</span>
                        )}
                      </td>
                    );
                  })}
                  {Array.from({ length: MAX_COMPARE_PRODUCTS - products.length }).map((_, i) => (
                    <td key={`empty-spec-${specIndex}-${i}`} className="p-4 border-r border-neutral-100 last:border-r-0">
                      <span className="text-neutral-300">-</span>
                    </td>
                  ))}
                </tr>
              ))}

              {comparisonSpecs.length === 0 && (
                <tr>
                  <td colSpan={MAX_COMPARE_PRODUCTS + 1} className="p-8 text-center text-neutral-500">
                    No detailed specifications available for comparison
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border-2 border-neutral-200">
          <div className="text-sm text-neutral-500">
            Compare up to {MAX_COMPARE_PRODUCTS} products side-by-side. Add products to your quote cart to get competitive prices.
          </div>
          <div className="flex items-center gap-3">
            <Link to="/user/categories" className="btn-secondary text-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add More Products
            </Link>
            <Link to="/dashboard" className="btn-primary text-sm">
              <ShoppingCart className="w-4 h-4 mr-2" />
              View Quote Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
