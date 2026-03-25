import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../lib/api';
import { CardSkeleton } from '../../components/ui';
import {
  Users, Store, FileText, TrendingUp, AlertTriangle,
  ChevronRight, Shield, ArrowRight, Package,
} from 'lucide-react';

interface DashboardStats {
  stats: {
    totalUsers: number;
    totalDealers: number;
    totalRFQs: number;
    pendingDealers: number;
    activeRFQs: number;
  };
  recentRFQs: {
    id: string;
    title: string;
    status: string;
    createdAt: string;
  }[];
}

const STATUS_STYLE: Record<string, string> = {
  PUBLISHED: 'bg-blue-50 text-blue-700',
  COMPLETED: 'bg-green-50 text-green-700',
  DRAFT:     'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-50 text-red-600',
};

export function AdminDashboard() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminApi.getDashboardStats();
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Total users', value: data?.stats.totalUsers || 0, icon: Users, href: '/admin/users' },
    { label: 'Verified dealers', value: data?.stats.totalDealers || 0, icon: Store, href: '/admin/dealers' },
    { label: 'Total RFQs', value: data?.stats.totalRFQs || 0, icon: FileText, href: '/admin/rfqs' },
    { label: 'Active RFQs', value: data?.stats.activeRFQs || 0, icon: TrendingUp, href: undefined },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Platform overview and management</p>
          </div>
        </div>
      </div>

      {/* Pending dealers alert */}
      {(data?.stats.pendingDealers || 0) > 0 && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">
              {data?.stats.pendingDealers} dealer{(data?.stats.pendingDealers || 0) !== 1 ? 's' : ''} pending verification
            </span>
          </div>
          <Link
            to="/admin/dealers?status=pending"
            className="text-sm font-medium text-amber-700 hover:text-amber-900 flex items-center gap-1 transition-colors"
          >
            Review now <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      <div className="px-6 py-6 max-w-7xl mx-auto">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const card = (
              <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-gray-600" />
                  </div>
                </div>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
              </div>
            );
            return stat.href
              ? <Link key={stat.label} to={stat.href}>{card}</Link>
              : <div key={stat.label}>{card}</div>;
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Quick Actions */}
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-3">Quick actions</h2>
            <div className="space-y-2">
              {[
                { to: '/admin/dealers', icon: Store, label: 'Manage Dealers', desc: 'Verify, suspend, or review dealers' },
                { to: '/admin/products', icon: Package, label: 'Product Catalog', desc: 'Manage categories, brands, products' },
                { to: '/admin/fraud', icon: AlertTriangle, label: 'Fraud Monitoring', desc: 'Review flagged activities', danger: true },
                { to: '/admin/inquiries', icon: FileText, label: 'Inquiries', desc: 'View and manage all inquiries' },
              ].map(({ to, icon: Icon, label, desc, danger }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${danger ? 'bg-red-50' : 'bg-gray-100'}`}>
                    <Icon className={`w-4 h-4 ${danger ? 'text-red-500' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent RFQs */}
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-3">Recent RFQs</h2>
            <div className="bg-white rounded-xl border border-gray-200">
              {data?.recentRFQs && data.recentRFQs.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {data.recentRFQs.slice(0, 6).map((rfq) => (
                    <div key={rfq.id} className="px-4 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{rfq.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(rfq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      <span className={`ml-3 flex-shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[rfq.status] || 'bg-gray-100 text-gray-600'}`}>
                        {rfq.status.charAt(0) + rfq.status.slice(1).toLowerCase().replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center text-sm text-gray-400">
                  No recent RFQs
                </div>
              )}
              <div className="px-4 py-3 border-t border-gray-100">
                <Link
                  to="/admin/rfqs"
                  className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  View all RFQs <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
