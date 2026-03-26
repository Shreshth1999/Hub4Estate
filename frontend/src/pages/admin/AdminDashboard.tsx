import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, contactApi } from '../../lib/api';
import {
  Users, Store, FileText, TrendingUp, AlertTriangle,
  ChevronRight, Shield, ArrowRight, Package, ShieldCheck, Loader2,
  MapPin, Clock, Mail,
} from 'lucide-react';

interface DealerSummary {
  id: string;
  businessName: string;
  ownerName: string;
  city: string;
  state: string;
  status: string;
  dealerType: string | null;
  createdAt: string;
}

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
    deliveryCity?: string;
  }[];
  recentDealers: DealerSummary[];
}

interface Lead {
  id: string;
  name: string;
  email: string;
  role: string;
  message: string;
  status: string;
  createdAt: string;
}

const RFQ_STATUS_STYLE: Record<string, string> = {
  PUBLISHED: 'bg-blue-50 text-blue-700',
  COMPLETED: 'bg-green-50 text-green-700',
  DRAFT:     'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-50 text-red-600',
  QUOTES_RECEIVED: 'bg-amber-50 text-amber-700',
};

const DEALER_STATUS_DOT: Record<string, string> = {
  PENDING_VERIFICATION: 'bg-amber-400',
  VERIFIED:             'bg-green-400',
  SUSPENDED:            'bg-red-400',
  REJECTED:             'bg-gray-400',
  UNDER_REVIEW:         'bg-blue-400',
  DOCUMENTS_PENDING:    'bg-amber-300',
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

const fmtTimeAgo = (d: string) => {
  const diffH = Math.floor((Date.now() - new Date(d).getTime()) / 3600000);
  if (diffH < 1) return 'Just now';
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return diffD === 1 ? '1d ago' : `${diffD}d ago`;
};

export function AdminDashboard() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.getDashboardStats(),
      contactApi.getSubmissions({ limit: 5 }),
    ])
      .then(([statsRes, leadsRes]) => {
        setData(statsRes.data);
        setLeads(leadsRes.data.submissions || []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const stats = [
    { label: 'Total users', value: data?.stats.totalUsers || 0, icon: Users, href: '/admin/dealers' },
    { label: 'Verified dealers', value: data?.stats.totalDealers || 0, icon: Store, href: '/admin/dealers' },
    { label: 'Total RFQs', value: data?.stats.totalRFQs || 0, icon: FileText, href: '/admin/rfqs' },
    { label: 'Active RFQs', value: data?.stats.activeRFQs || 0, icon: TrendingUp, href: '/admin/rfqs' },
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

      <div className="px-6 py-6 max-w-7xl mx-auto space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <h2 className="text-sm font-medium text-gray-500 mb-3">Quick actions</h2>
            <div className="space-y-2">
              {[
                { to: '/admin/dealers', icon: Store, label: 'Manage Dealers', desc: 'Verify, suspend, or review dealers' },
                { to: '/admin/professionals', icon: ShieldCheck, label: 'Verify Professionals', desc: 'Architects, Designers, Contractors' },
                { to: '/admin/products', icon: Package, label: 'Product Catalog', desc: 'Manage categories, brands, products' },
                { to: '/admin/leads', icon: Mail, label: 'Leads & Inquiries', desc: 'Contact form submissions' },
                { to: '/admin/fraud', icon: AlertTriangle, label: 'Fraud Monitoring', desc: 'Review flagged activities', danger: true },
              ].map(({ to, icon: Icon, label, desc, danger }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${danger ? 'bg-red-50' : 'bg-gray-100'}`}>
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

          <div className="lg:col-span-2 space-y-5">

            {/* Recent Dealer Registrations */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-gray-500">Recent dealer registrations</h2>
                <Link to="/admin/dealers" className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="bg-white rounded-xl border border-gray-200">
                {data?.recentDealers && data.recentDealers.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {data.recentDealers.map((dealer) => (
                      <Link
                        key={dealer.id}
                        to="/admin/dealers"
                        className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Store className="w-4 h-4 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{dealer.businessName}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />{dealer.city || '—'}, {dealer.state || '—'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />{fmtTimeAgo(dealer.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <div className={`w-2 h-2 rounded-full ${DEALER_STATUS_DOT[dealer.status] || 'bg-gray-300'}`} />
                          <span className="text-xs text-gray-500">
                            {dealer.status === 'PENDING_VERIFICATION' ? 'Pending' :
                             dealer.status === 'VERIFIED' ? 'Verified' :
                             dealer.status === 'UNDER_REVIEW' ? 'In review' :
                             dealer.status}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-gray-400">
                    No dealer registrations yet
                  </div>
                )}
              </div>
            </div>

            {/* Recent RFQs */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-gray-500">Recent RFQs</h2>
                <Link to="/admin/rfqs" className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="bg-white rounded-xl border border-gray-200">
                {data?.recentRFQs && data.recentRFQs.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {data.recentRFQs.map((rfq) => (
                      <div key={rfq.id} className="px-4 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{rfq.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                            {rfq.deliveryCity && <><MapPin className="w-3 h-3" />{rfq.deliveryCity} · </>}
                            {fmtDate(rfq.createdAt)}
                          </p>
                        </div>
                        <span className={`ml-3 flex-shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${RFQ_STATUS_STYLE[rfq.status] || 'bg-gray-100 text-gray-600'}`}>
                          {rfq.status.charAt(0) + rfq.status.slice(1).toLowerCase().replace(/_/g, ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-gray-400">
                    No recent RFQs
                  </div>
                )}
              </div>
            </div>

            {/* Recent Leads */}
            {leads.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-medium text-gray-500">Recent leads</h2>
                  <Link to="/admin/leads" className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors">
                    View all <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                  {leads.map(lead => (
                    <div key={lead.id} className="px-4 py-3.5 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Mail className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                            lead.status === 'new' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {lead.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{lead.message}</p>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">{fmtTimeAgo(lead.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
