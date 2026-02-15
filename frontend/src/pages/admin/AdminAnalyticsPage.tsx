import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  BarChart3, Users, FileText, Package, TrendingUp, Activity,
  ArrowUpRight, ArrowDownRight, Clock
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalDealers: number;
  pendingDealers: number;
  totalProducts: number;
  totalRFQs: number;
  activeRFQs: number;
  totalQuotes: number;
}

interface RecentActivity {
  id: string;
  type: 'user_signup' | 'dealer_signup' | 'rfq_created' | 'quote_submitted';
  description: string;
  timestamp: string;
}

export function AdminAnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/dashboard/stats');
        setStats(response.data.stats);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const metricCards = stats
    ? [
        {
          label: 'Total Users',
          value: stats.totalUsers,
          icon: Users,
          color: 'bg-blue-500',
          description: 'Registered platform users',
        },
        {
          label: 'Total Dealers',
          value: stats.totalDealers,
          icon: Package,
          color: 'bg-emerald-500',
          description: `${stats.pendingDealers} pending verification`,
        },
        {
          label: 'Total RFQs',
          value: stats.totalRFQs,
          icon: FileText,
          color: 'bg-amber-500',
          description: `${stats.activeRFQs} currently active`,
        },
        {
          label: 'Total Products',
          value: stats.totalProducts,
          icon: BarChart3,
          color: 'bg-purple-500',
          description: 'Listed in catalog',
        },
        {
          label: 'Total Quotes',
          value: stats.totalQuotes,
          icon: TrendingUp,
          color: 'bg-rose-500',
          description: 'Submitted by dealers',
        },
        {
          label: 'Active RFQs',
          value: stats.activeRFQs,
          icon: Activity,
          color: 'bg-cyan-500',
          description: 'Currently accepting quotes',
        },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <section className="bg-neutral-900 text-white">
          <div className="container-custom py-12">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-accent-500 flex items-center justify-center">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">Platform Analytics</h1>
                <p className="text-neutral-300 font-medium">Loading data...</p>
              </div>
            </div>
          </div>
        </section>
        <section className="py-8">
          <div className="container-custom">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="border-2 border-neutral-200 p-6 animate-pulse"
                >
                  <div className="w-12 h-12 bg-neutral-200 mb-4" />
                  <div className="h-10 bg-neutral-200 w-24 mb-2" />
                  <div className="h-4 bg-neutral-100 w-32" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <section className="bg-neutral-900 text-white">
          <div className="container-custom py-12">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-red-500 flex items-center justify-center">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">Platform Analytics</h1>
                <p className="text-neutral-300 font-medium">Error loading data</p>
              </div>
            </div>
          </div>
        </section>
        <section className="py-12">
          <div className="container-custom">
            <div className="border-2 border-red-200 bg-red-50 p-8 text-center">
              <p className="text-red-700 font-bold text-lg">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-3 bg-neutral-900 text-white font-bold uppercase tracking-wider text-sm hover:bg-neutral-800 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-neutral-900 text-white">
        <div className="container-custom py-12">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-accent-500 flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Platform Analytics</h1>
              <p className="text-neutral-300 font-medium">Key metrics and platform performance overview</p>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Grid */}
      <section className="py-8 border-b-2 border-neutral-200">
        <div className="container-custom">
          <h2 className="text-xl font-black text-neutral-900 uppercase tracking-wider mb-6">
            Key Metrics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {metricCards.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div
                  key={index}
                  className="bg-white border-2 border-neutral-200 p-6 hover:border-neutral-900 hover:shadow-brutal transition-all"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${metric.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-4xl font-black text-neutral-900">
                    {metric.value.toLocaleString()}
                  </p>
                  <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mt-1">
                    {metric.label}
                  </p>
                  <p className="text-xs text-neutral-400 font-medium mt-2">
                    {metric.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platform Overview */}
      <section className="py-8 border-b-2 border-neutral-200">
        <div className="container-custom">
          <h2 className="text-xl font-black text-neutral-900 uppercase tracking-wider mb-6">
            Platform Overview
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dealer Breakdown */}
            <div className="border-2 border-neutral-200 p-6">
              <h3 className="font-bold text-neutral-900 uppercase tracking-wider text-sm mb-4 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Dealer Status Breakdown
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-neutral-50 border-2 border-neutral-100">
                  <span className="font-medium text-neutral-700">Verified Dealers</span>
                  <span className="font-black text-neutral-900 text-lg">
                    {(stats?.totalDealers || 0) - (stats?.pendingDealers || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-50 border-2 border-amber-100">
                  <span className="font-medium text-amber-700">Pending Verification</span>
                  <span className="font-black text-amber-900 text-lg">
                    {stats?.pendingDealers || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-50 border-2 border-neutral-100">
                  <span className="font-medium text-neutral-700">Total Dealers</span>
                  <span className="font-black text-neutral-900 text-lg">
                    {stats?.totalDealers || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* RFQ Breakdown */}
            <div className="border-2 border-neutral-200 p-6">
              <h3 className="font-bold text-neutral-900 uppercase tracking-wider text-sm mb-4 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                RFQ Status Breakdown
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 border-2 border-blue-100">
                  <span className="font-medium text-blue-700">Active RFQs</span>
                  <span className="font-black text-blue-900 text-lg">
                    {stats?.activeRFQs || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-50 border-2 border-neutral-100">
                  <span className="font-medium text-neutral-700">Closed / Completed</span>
                  <span className="font-black text-neutral-900 text-lg">
                    {(stats?.totalRFQs || 0) - (stats?.activeRFQs || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-50 border-2 border-neutral-100">
                  <span className="font-medium text-neutral-700">Total RFQs</span>
                  <span className="font-black text-neutral-900 text-lg">
                    {stats?.totalRFQs || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conversion Ratios */}
      <section className="py-8">
        <div className="container-custom">
          <h2 className="text-xl font-black text-neutral-900 uppercase tracking-wider mb-6">
            Conversion Ratios
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border-2 border-neutral-200 p-6">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-bold text-neutral-500 uppercase tracking-wider">
                  Quotes per RFQ
                </span>
              </div>
              <p className="text-3xl font-black text-neutral-900">
                {stats?.totalRFQs
                  ? (stats.totalQuotes / stats.totalRFQs).toFixed(1)
                  : '0'}
              </p>
              <p className="text-xs text-neutral-400 font-medium mt-1">
                Average quotes received per RFQ
              </p>
            </div>

            <div className="border-2 border-neutral-200 p-6">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-bold text-neutral-500 uppercase tracking-wider">
                  Active RFQ Rate
                </span>
              </div>
              <p className="text-3xl font-black text-neutral-900">
                {stats?.totalRFQs
                  ? Math.round((stats.activeRFQs / stats.totalRFQs) * 100)
                  : 0}
                %
              </p>
              <p className="text-xs text-neutral-400 font-medium mt-1">
                Percentage of RFQs currently active
              </p>
            </div>

            <div className="border-2 border-neutral-200 p-6">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-bold text-neutral-500 uppercase tracking-wider">
                  Dealer Verification Rate
                </span>
              </div>
              <p className="text-3xl font-black text-neutral-900">
                {stats?.totalDealers
                  ? Math.round(
                      ((stats.totalDealers - stats.pendingDealers) /
                        stats.totalDealers) *
                        100
                    )
                  : 0}
                %
              </p>
              <p className="text-xs text-neutral-400 font-medium mt-1">
                Dealers verified out of total
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
