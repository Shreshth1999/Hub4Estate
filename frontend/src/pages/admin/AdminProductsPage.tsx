import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { ListSkeleton, EmptyState, StatusBadge } from '../../components/ui';
import {
  Package, Search, Filter, Image, ChevronRight, BarChart3,
} from 'lucide-react';

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-neutral-900 text-white">
        <div className="container-custom py-12">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-accent-500 flex items-center justify-center">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Product Management</h1>
              <p className="text-neutral-300 font-medium">View and manage all products on the platform</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-custom py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white border-2 border-neutral-200 p-6">
              <div className="flex items-center gap-3 mb-1">
                <Package className="w-5 h-5 text-neutral-400" />
                <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Total Products</p>
              </div>
              <p className="text-3xl font-black text-neutral-900">{stats.totalProducts}</p>
            </div>
            <div className="bg-blue-50 border-2 border-blue-200 p-6">
              <div className="flex items-center gap-3 mb-1">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <p className="text-sm font-bold text-blue-600 uppercase tracking-wider">Total Brands</p>
              </div>
              <p className="text-3xl font-black text-blue-900">{stats.totalBrands}</p>
            </div>
            <div className="bg-purple-50 border-2 border-purple-200 p-6">
              <div className="flex items-center gap-3 mb-1">
                <Filter className="w-5 h-5 text-purple-500" />
                <p className="text-sm font-bold text-purple-600 uppercase tracking-wider">Total Categories</p>
              </div>
              <p className="text-3xl font-black text-purple-900">{stats.totalCategories}</p>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-neutral-50 border-2 border-neutral-200 p-6 mb-8">
          <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by product name or model number..."
                className="w-full border-2 border-neutral-300 focus:border-neutral-900 focus:outline-none pl-12 pr-4 py-3 text-base font-medium"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-neutral-400 flex-shrink-0" />
              <input
                type="text"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setPage(1);
                }}
                placeholder="Category ID"
                className="border-2 border-neutral-300 focus:border-neutral-900 focus:outline-none px-4 py-3 text-sm font-medium w-40"
              />
            </div>

            {/* Brand Filter */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={brandId}
                onChange={(e) => {
                  setBrandId(e.target.value);
                  setPage(1);
                }}
                placeholder="Brand ID"
                className="border-2 border-neutral-300 focus:border-neutral-900 focus:outline-none px-4 py-3 text-sm font-medium w-40"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-neutral-900 text-white border-2 border-neutral-900 px-6 py-3 font-bold uppercase tracking-wider text-sm hover:bg-white hover:text-neutral-900 transition-all"
              >
                Search
              </button>
              {hasFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="bg-white text-neutral-900 border-2 border-neutral-300 px-6 py-3 font-bold uppercase tracking-wider text-sm hover:border-neutral-900 transition-all"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Products List */}
        {isLoading ? (
          <ListSkeleton count={5} />
        ) : products.length === 0 ? (
          <div className="bg-neutral-50 border-2 border-neutral-200 p-12">
            <EmptyState
              icon={Package}
              title="No products found"
              description={hasFilters ? 'No products match your current filters. Try adjusting your search.' : 'No products have been added to the platform yet.'}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Table Header */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-3 bg-neutral-100 border-2 border-neutral-200">
              <div className="col-span-4">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Product</span>
              </div>
              <div className="col-span-2">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Brand</span>
              </div>
              <div className="col-span-2">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Category</span>
              </div>
              <div className="col-span-1">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Images</span>
              </div>
              <div className="col-span-2">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Status</span>
              </div>
              <div className="col-span-1" />
            </div>

            {/* Product Rows */}
            {products.map((product, index) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="block bg-white border-2 border-neutral-200 hover:border-neutral-900 hover:shadow-brutal transition-all p-6"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <div className="lg:grid lg:grid-cols-12 gap-4 items-center">
                  {/* Product Name + Model */}
                  <div className="col-span-4 mb-3 lg:mb-0">
                    <h3 className="font-bold text-neutral-900 truncate">{product.name}</h3>
                    {product.modelNumber && (
                      <p className="text-sm text-neutral-500 font-mono font-medium mt-1">
                        {product.modelNumber}
                      </p>
                    )}
                  </div>

                  {/* Brand */}
                  <div className="col-span-2 mb-2 lg:mb-0">
                    <span className="lg:hidden text-xs font-bold text-neutral-400 uppercase tracking-wider mr-2">Brand:</span>
                    <span className="text-sm font-medium text-neutral-700">
                      {product.brand?.name || '-'}
                    </span>
                  </div>

                  {/* Category */}
                  <div className="col-span-2 mb-2 lg:mb-0">
                    <span className="lg:hidden text-xs font-bold text-neutral-400 uppercase tracking-wider mr-2">Category:</span>
                    <span className="text-sm font-medium text-neutral-700">
                      {product.category?.name || '-'}
                    </span>
                  </div>

                  {/* Image Count */}
                  <div className="col-span-1 mb-2 lg:mb-0">
                    <span className="lg:hidden text-xs font-bold text-neutral-400 uppercase tracking-wider mr-2">Images:</span>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-neutral-500">
                      <Image className="w-4 h-4" />
                      {product.images?.length || 0}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-2 mb-2 lg:mb-0">
                    <span className="lg:hidden text-xs font-bold text-neutral-400 uppercase tracking-wider mr-2">Status:</span>
                    <StatusBadge
                      status={product.isActive ? 'Active' : 'Inactive'}
                      variant={product.isActive ? 'success' : 'default'}
                    />
                  </div>

                  {/* Arrow */}
                  <div className="col-span-1 hidden lg:flex justify-end">
                    <ChevronRight className="w-5 h-5 text-neutral-300" />
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
              className="px-6 py-3 border-2 border-neutral-200 font-bold uppercase tracking-wider text-sm hover:border-neutral-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="font-bold text-neutral-900">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="px-6 py-3 border-2 border-neutral-200 font-bold uppercase tracking-wider text-sm hover:border-neutral-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
