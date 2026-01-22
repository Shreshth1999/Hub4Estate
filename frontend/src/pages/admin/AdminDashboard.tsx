import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../lib/api';
import { CardSkeleton, Alert } from '../../components/ui';
import {
  Users, Store, FileText, TrendingUp, AlertTriangle,
  ChevronRight, Shield, ArrowRight
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
      <div className="min-h-screen bg-white py-8">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Users',
      value: data?.stats.totalUsers || 0,
      icon: Users,
      href: '/admin/users',
    },
    {
      label: 'Verified Dealers',
      value: data?.stats.totalDealers || 0,
      icon: Store,
      href: '/admin/dealers',
    },
    {
      label: 'Total RFQs',
      value: data?.stats.totalRFQs || 0,
      icon: FileText,
      href: '/admin/rfqs',
    },
    {
      label: 'Active RFQs',
      value: data?.stats.activeRFQs || 0,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-neutral-900 text-white">
        <div className="container-custom py-12">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-accent-500 flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Admin Dashboard</h1>
              <p className="text-neutral-300 font-medium">Platform management and oversight</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pending Dealers Alert */}
      {(data?.stats.pendingDealers || 0) > 0 && (
        <section className="py-4 bg-amber-50 border-b-2 border-amber-200">
          <div className="container-custom">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span className="font-bold text-amber-800">
                  {data?.stats.pendingDealers} dealer(s) pending verification
                </span>
              </div>
              <Link
                to="/admin/dealers?status=pending"
                className="text-amber-800 hover:text-amber-900 font-bold inline-flex items-center uppercase tracking-wider text-sm"
              >
                Review Now
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="py-8 border-b-2 border-neutral-200">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <div
                  key={index}
                  className="bg-white border-2 border-neutral-200 p-6 hover:border-neutral-900 hover:shadow-brutal transition-all"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-4xl font-black text-neutral-900">{stat.value}</p>
                  <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mt-1">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Management Links */}
            <div className="space-y-6">
              <h2 className="text-xl font-black text-neutral-900 uppercase tracking-wider">Quick Actions</h2>

              <div className="space-y-4">
                <Link
                  to="/admin/dealers"
                  className="group flex items-center space-x-4 bg-white border-2 border-neutral-200 p-6 hover:border-neutral-900 hover:shadow-brutal transition-all"
                >
                  <div className="w-14 h-14 bg-neutral-900 flex items-center justify-center group-hover:bg-accent-500 transition-colors">
                    <Store className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-neutral-900">Manage Dealers</h3>
                    <p className="text-sm text-neutral-500 font-medium">Verify, suspend, or review dealers</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                  to="/admin/products"
                  className="group flex items-center space-x-4 bg-white border-2 border-neutral-200 p-6 hover:border-neutral-900 hover:shadow-brutal transition-all"
                >
                  <div className="w-14 h-14 bg-neutral-900 flex items-center justify-center group-hover:bg-accent-500 transition-colors">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-neutral-900">Product Catalog</h3>
                    <p className="text-sm text-neutral-500 font-medium">Manage categories, brands, and products</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                  to="/admin/fraud-flags"
                  className="group flex items-center space-x-4 bg-white border-2 border-neutral-200 p-6 hover:border-neutral-900 hover:shadow-brutal transition-all"
                >
                  <div className="w-14 h-14 bg-red-500 flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-neutral-900">Fraud Monitoring</h3>
                    <p className="text-sm text-neutral-500 font-medium">Review flagged activities</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-6">
              <h2 className="text-xl font-black text-neutral-900 uppercase tracking-wider">Recent RFQs</h2>

              <div className="bg-white border-2 border-neutral-200 divide-y-2 divide-neutral-200">
                {data?.recentRFQs && data.recentRFQs.length > 0 ? (
                  data.recentRFQs.slice(0, 5).map((rfq) => (
                    <div key={rfq.id} className="p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                      <div>
                        <p className="font-bold text-neutral-900">{rfq.title}</p>
                        <p className="text-sm text-neutral-500 font-medium">
                          {new Date(rfq.createdAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                        rfq.status === 'PUBLISHED' ? 'bg-blue-100 text-blue-700 border-2 border-blue-200' :
                        rfq.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border-2 border-green-200' :
                        'bg-neutral-100 text-neutral-700 border-2 border-neutral-200'
                      }`}>
                        {rfq.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-neutral-500 font-medium">
                    No recent RFQs
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
