import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  RefreshCw, Play, CheckCircle, XCircle, Clock,
  Package, Database, AlertCircle, ChevronRight,
  Download, ExternalLink, Search, Filter
} from 'lucide-react';

interface Brand {
  name: string;
  slug: string;
  website: string;
  category: string;
  catalogUrls: number;
  lastScrapedAt: string | null;
  totalProducts: number;
  totalJobs: number;
  isActive: boolean;
}

interface ScrapeJob {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'PARTIAL';
  startedAt: string | null;
  completedAt: string | null;
  productsFound: number;
  productsCreated: number;
  productsUpdated: number;
  errors: number;
  brand: {
    name: string;
    slug: string;
  };
  createdAt: string;
}

interface ScrapedProduct {
  id: string;
  rawName: string;
  rawCategory: string | null;
  rawModelNumber: string | null;
  rawImages: string[];
  isProcessed: boolean;
  scrapedAt: string;
  brand: {
    name: string;
    slug: string;
  };
}

interface Stats {
  totalBrands: number;
  totalProducts: number;
  processedProducts: number;
  unprocessedProducts: number;
}

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  PENDING: { color: 'bg-gray-100 text-gray-600', icon: Clock, label: 'Pending' },
  IN_PROGRESS: { color: 'bg-blue-100 text-blue-700', icon: RefreshCw, label: 'Running' },
  COMPLETED: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Completed' },
  FAILED: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Failed' },
  PARTIAL: { color: 'bg-amber-100 text-amber-700', icon: AlertCircle, label: 'Partial' },
};

export function AdminScraperPage() {
  const [activeTab, setActiveTab] = useState<'brands' | 'jobs' | 'products'>('brands');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [jobs, setJobs] = useState<ScrapeJob[]>([]);
  const [products, setProducts] = useState<ScrapedProduct[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [runningJobs, setRunningJobs] = useState<Set<string>>(new Set());
  const [productFilter, setProductFilter] = useState<'all' | 'unprocessed'>('unprocessed');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'brands') {
        const [brandsRes, statsRes] = await Promise.all([
          api.get('/scraper/brands'),
          api.get('/scraper/stats'),
        ]);
        setBrands(brandsRes.data.brands);
        setStats(statsRes.data.stats);
      } else if (activeTab === 'jobs') {
        const res = await api.get('/scraper/jobs', { params: { limit: 50 } });
        setJobs(res.data.jobs);
      } else if (activeTab === 'products') {
        const res = await api.get('/scraper/products', {
          params: {
            limit: 100,
            isProcessed: productFilter === 'unprocessed' ? 'false' : undefined,
            search: searchQuery || undefined,
          },
        });
        setProducts(res.data.products);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startScrape = async (brandSlug: string) => {
    try {
      setRunningJobs(prev => new Set(prev).add(brandSlug));
      await api.post(`/scraper/scrape/${brandSlug}`);
      // Refresh jobs list
      setTimeout(() => {
        fetchData();
        setRunningJobs(prev => {
          const next = new Set(prev);
          next.delete(brandSlug);
          return next;
        });
      }, 2000);
    } catch (error: any) {
      console.error('Failed to start scrape:', error);
      setRunningJobs(prev => {
        const next = new Set(prev);
        next.delete(brandSlug);
        return next;
      });
      alert(error.response?.data?.error || 'Failed to start scrape');
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Product Scraper</h1>
        <p className="text-gray-500">Scrape product catalogs from electrical brand websites</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 p-4">
            <Database className="w-5 h-5 text-gray-400 mb-2" />
            <p className="text-2xl font-semibold text-gray-900">{stats.totalBrands}</p>
            <p className="text-xs text-gray-500 uppercase font-bold">Brands Configured</p>
          </div>
          <div className="bg-white border border-gray-200 p-4">
            <Package className="w-5 h-5 text-blue-500 mb-2" />
            <p className="text-2xl font-semibold text-blue-600">{stats.totalProducts}</p>
            <p className="text-xs text-gray-500 uppercase font-bold">Scraped Products</p>
          </div>
          <div className="bg-white border border-gray-200 p-4">
            <CheckCircle className="w-5 h-5 text-green-500 mb-2" />
            <p className="text-2xl font-semibold text-green-600">{stats.processedProducts}</p>
            <p className="text-xs text-gray-500 uppercase font-bold">Processed</p>
          </div>
          <div className="bg-white border border-gray-200 p-4">
            <AlertCircle className="w-5 h-5 text-amber-500 mb-2" />
            <p className="text-2xl font-semibold text-amber-600">{stats.unprocessedProducts}</p>
            <p className="text-xs text-gray-500 uppercase font-bold">Pending Review</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {(['brands', 'jobs', 'products'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-bold text-sm capitalize border-b-2 -mb-[2px] transition-colors ${
              activeTab === tab
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {/* Brands Tab */}
          {activeTab === 'brands' && (
            <div className="bg-white border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left p-4 font-bold text-sm">Brand</th>
                      <th className="text-left p-4 font-bold text-sm">Category</th>
                      <th className="text-left p-4 font-bold text-sm">Products</th>
                      <th className="text-left p-4 font-bold text-sm">Last Scraped</th>
                      <th className="text-left p-4 font-bold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brands.map(brand => (
                      <tr key={brand.slug} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{brand.name}</p>
                              <a
                                href={brand.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                              >
                                {brand.website.replace('https://', '')}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase">
                            {brand.category}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-gray-900">{brand.totalProducts}</span>
                          <span className="text-gray-500 text-sm"> products</span>
                        </td>
                        <td className="p-4 text-sm text-gray-500">
                          {formatDate(brand.lastScrapedAt)}
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => startScrape(brand.slug)}
                            disabled={runningJobs.has(brand.slug)}
                            className={`flex items-center gap-2 px-3 py-2 text-sm font-bold transition-colors ${
                              runningJobs.has(brand.slug)
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-900 text-white hover:bg-gray-800'
                            }`}
                          >
                            {runningJobs.has(brand.slug) ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Running...
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4" />
                                Scrape
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Jobs Tab */}
          {activeTab === 'jobs' && (
            <div className="bg-white border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left p-4 font-bold text-sm">Brand</th>
                      <th className="text-left p-4 font-bold text-sm">Status</th>
                      <th className="text-left p-4 font-bold text-sm">Found</th>
                      <th className="text-left p-4 font-bold text-sm">Created</th>
                      <th className="text-left p-4 font-bold text-sm">Updated</th>
                      <th className="text-left p-4 font-bold text-sm">Errors</th>
                      <th className="text-left p-4 font-bold text-sm">Started</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map(job => {
                      const statusConfig = STATUS_CONFIG[job.status];
                      const StatusIcon = statusConfig.icon;

                      return (
                        <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-4">
                            <span className="font-bold text-gray-900">{job.brand.name}</span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold ${statusConfig.color}`}>
                              <StatusIcon className={`w-3 h-3 ${job.status === 'IN_PROGRESS' ? 'animate-spin' : ''}`} />
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="p-4 font-bold">{job.productsFound}</td>
                          <td className="p-4 text-green-600 font-bold">{job.productsCreated}</td>
                          <td className="p-4 text-blue-600 font-bold">{job.productsUpdated}</td>
                          <td className="p-4">
                            {job.errors > 0 ? (
                              <span className="text-red-600 font-bold">{job.errors}</span>
                            ) : (
                              <span className="text-gray-400">0</span>
                            )}
                          </td>
                          <td className="p-4 text-sm text-gray-500">
                            {formatDate(job.startedAt)}
                          </td>
                        </tr>
                      );
                    })}
                    {jobs.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-500">
                          No scrape jobs yet. Start by scraping a brand.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <>
              {/* Filters */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={productFilter}
                    onChange={(e) => {
                      setProductFilter(e.target.value as any);
                      setTimeout(fetchData, 100);
                    }}
                    className="border border-gray-200 px-3 py-2 text-sm font-medium"
                  >
                    <option value="unprocessed">Unprocessed Only</option>
                    <option value="all">All Products</option>
                  </select>
                </div>
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 text-sm"
                  />
                </div>
                <button
                  onClick={fetchData}
                  className="px-4 py-2 bg-gray-900 text-white text-sm font-bold hover:bg-gray-800"
                >
                  Search
                </button>
              </div>

              <div className="bg-white border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left p-4 font-bold text-sm">Product</th>
                        <th className="text-left p-4 font-bold text-sm">Brand</th>
                        <th className="text-left p-4 font-bold text-sm">Category</th>
                        <th className="text-left p-4 font-bold text-sm">Model</th>
                        <th className="text-left p-4 font-bold text-sm">Status</th>
                        <th className="text-left p-4 font-bold text-sm">Scraped</th>
                        <th className="text-left p-4 font-bold text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-100 flex items-center justify-center flex-shrink-0">
                                {product.rawImages?.[0] ? (
                                  <img
                                    src={product.rawImages[0]}
                                    alt=""
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <Package className="w-6 h-6 text-gray-300" />
                                )}
                              </div>
                              <span className="font-medium text-gray-900 line-clamp-2">
                                {product.rawName}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-sm">{product.brand.name}</td>
                          <td className="p-4 text-sm text-gray-500">
                            {product.rawCategory || '-'}
                          </td>
                          <td className="p-4 text-sm font-mono text-gray-600">
                            {product.rawModelNumber || '-'}
                          </td>
                          <td className="p-4">
                            {product.isProcessed ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold bg-green-100 text-green-700">
                                <CheckCircle className="w-3 h-3" />
                                Processed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold bg-amber-100 text-amber-700">
                                <Clock className="w-3 h-3" />
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-sm text-gray-500">
                            {formatDate(product.scrapedAt)}
                          </td>
                          <td className="p-4">
                            <button className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center gap-1">
                              Review
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {products.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-gray-500">
                            No products found. Run a scrape job to populate products.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
