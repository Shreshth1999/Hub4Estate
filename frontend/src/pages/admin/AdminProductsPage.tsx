import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { Loader2, Package, Search, Filter, Image, ChevronRight, BarChart3 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  modelNumber?: string;
  brand?: { id: string; name: string };
  category?: { id: string; name: string };
  images?: string[];
  isActive: boolean;
}

interface Stats {
  totalProducts: number;
  totalBrands: number;
  totalCategories: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit };
      if (search) params.search = search;
      if (categoryId) params.categoryId = categoryId;
      if (brandId) params.brandId = brandId;

      const response = await api.get('/admin/products', { params });
      const data = response.data;

      setProducts(data.products || []);
      setStats(data.stats || null);
      setPagination(data.pagination || null);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  }, [search, categoryId, brandId, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset to page 1 when filters change
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategoryId('');
    setBrandId('');
    setPage(1);
  };

  const hasFilters = search || categoryId || brandId;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Product Management</h1>
              <p className="text-sm text-gray-500">View and manage all products on the platform</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-gray-400" />
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Products</p>
              </div>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">Total Brands</p>
              </div>
              <p className="text-2xl font-semibold text-blue-900">{stats.totalBrands}</p>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="w-4 h-4 text-purple-500" />
                <p className="text-xs font-medium text-purple-600 uppercase tracking-wider">Total Categories</p>
              </div>
              <p className="text-2xl font-semibold text-purple-900">{stats.totalCategories}</p>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by product name or model number..."
                className="w-full border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none pl-10 pr-4 py-2.5 text-sm"
              />
            </div>
            <input
              type="text"
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
              placeholder="Category ID"
              className="border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none px-3 py-2.5 text-sm w-40"
            />
            <input
              type="text"
              value={brandId}
              onChange={(e) => { setBrandId(e.target.value); setPage(1); }}
              placeholder="Brand ID"
              className="border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none px-3 py-2.5 text-sm w-40"
            />
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                Search
              </button>
              {hasFilters && (
                <button type="button" onClick={handleClearFilters} className="px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:border-gray-400 transition-colors">
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Products List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-900">No products found</p>
            <p className="text-xs text-gray-500 mt-1">
              {hasFilters ? 'No products match your current filters.' : 'No products have been added yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Table Header */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="col-span-4"><span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Product</span></div>
              <div className="col-span-2"><span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</span></div>
              <div className="col-span-2"><span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Category</span></div>
              <div className="col-span-1"><span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Images</span></div>
              <div className="col-span-2"><span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</span></div>
              <div className="col-span-1" />
            </div>

            {products.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="block bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all p-5"
              >
                <div className="lg:grid lg:grid-cols-12 gap-4 items-center">
                  <div className="col-span-4 mb-2 lg:mb-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{product.name}</h3>
                    {product.modelNumber && (
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{product.modelNumber}</p>
                    )}
                  </div>
                  <div className="col-span-2 mb-1 lg:mb-0">
                    <span className="lg:hidden text-xs text-gray-400 mr-2">Brand:</span>
                    <span className="text-sm text-gray-700">{product.brand?.name || '—'}</span>
                  </div>
                  <div className="col-span-2 mb-1 lg:mb-0">
                    <span className="lg:hidden text-xs text-gray-400 mr-2">Category:</span>
                    <span className="text-sm text-gray-700">{product.category?.name || '—'}</span>
                  </div>
                  <div className="col-span-1 mb-1 lg:mb-0">
                    <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                      <Image className="w-3.5 h-3.5" />
                      {product.images?.length || 0}
                    </span>
                  </div>
                  <div className="col-span-2 mb-1 lg:mb-0">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="col-span-1 hidden lg:flex justify-end">
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm font-medium text-gray-900">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
