import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, contactApi } from '../../lib/api';
import {
  Users, Store, FileText, TrendingUp, AlertTriangle,
  Shield, Package, ShieldCheck, Loader2,
  MapPin, Clock, Mail, ArrowRight, Activity,
  ClipboardList, MessageSquare, Building2, BarChart3,
  ChevronRight, Zap, CheckCircle, XCircle,
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalDealers: number;
  pendingDealers: number;
  totalRFQs: number;
  activeRFQs: number;
  totalProducts: number;
  totalInquiries: number;
  openFraudFlags: number;
  totalQuotes: number;
}

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

interface RFQSummary {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  deliveryCity?: string;
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

const RFQ_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  PUBLISHED:       { label: 'Live',      color: 'text-blue-700',  bg: 'bg-blue-50' },
  COMPLETED:       { label: 'Done',      color: 'text-green-700', bg: 'bg-green-50' },
  DRAFT:           { label: 'Draft',     color: 'text-gray-500',  bg: 'bg-gray-100' },
  CANCELLED:       { label: 'Cancelled', color: 'text-red-600',   bg: 'bg-red-50' },
  QUOTES_RECEIVED: { label: 'Quoted',    color: 'text-amber-700', bg: 'bg-amber-50' },
  DEALER_SELECTED: { label: 'Selected',  color: 'text-violet-700', bg: 'bg-violet-50' },
};

const DEALER_STATUS: Record<string, { label: string; dot: string }> = {
  PENDING_VERIFICATION: { label: 'Pending',  dot: 'bg-amber-400' },
  VERIFIED:             { label: 'Verified', dot: 'bg-green-400' },
  SUSPENDED:            { label: 'Suspended',dot: 'bg-red-400' },
  REJECTED:             { label: 'Rejected', dot: 'bg-gray-400' },
};

function timeAgo(d: string) {
  const diffH = Math.floor((Date.now() - new Date(d).getTime()) / 3600000);
  if (diffH < 1) return 'Just now';
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return diffD === 1 ? '1d ago' : `${diffD}d ago`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentDealers, setRecentDealers] = useState<DealerSummary[]>([]);
  const [recentRFQs, setRecentRFQs] = useState<RFQSummary[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  useEffect(() => {
    Promise.all([
      adminApi.getDashboardStats(),
      contactApi.getSubmissions({ limit: 4 }),
    ])
      .then(([statsRes, leadsRes]) => {
        const d = statsRes.data;
        setStats(d.stats);
        setRecentDealers(d.recentDealers || []);
        setRecentRFQs(d.recentRFQs || []);
        setLeads(leadsRes.data.submissions || []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          <p className="text-sm text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const metricCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      sub: 'Registered on platform',
      href: '/admin/dealers',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      accent: 'border-l-blue-500',
    },
    {
      label: 'Verified Dealers',
      value: stats?.totalDealers ?? 0,
      icon: Store,
      sub: `${stats?.pendingDealers ?? 0} pending review`,
      href: '/admin/dealers',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      accent: 'border-l-green-500',
    },
    {
      label: 'Product Inquiries',
      value: stats?.totalInquiries ?? 0,
      icon: ClipboardList,
      sub: 'Total across all categories',
      href: '/admin/inquiries',
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      accent: 'border-l-violet-500',
    },
    {
      label: 'Total RFQs',
      value: stats?.totalRFQs ?? 0,
      icon: FileText,
      sub: `${stats?.activeRFQs ?? 0} currently active`,
      href: '/admin/rfqs',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      accent: 'border-l-amber-500',
    },
    {
      label: 'Catalog Products',
      value: stats?.totalProducts ?? 0,
      icon: Package,
      sub: 'Active product listings',
      href: '/admin/products',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      accent: 'border-l-orange-500',
    },
    {
      label: 'Dealer Quotes',
      value: stats?.totalQuotes ?? 0,
      icon: TrendingUp,
      sub: 'Quotes submitted by dealers',
      href: '/admin/rfqs',
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
      accent: 'border-l-teal-500',
    },
  ];

  const quickActions = [
    { to: '/admin/dealers', icon: Store, label: 'Manage Dealers', desc: 'Verify, suspend, review' },
    { to: '/admin/professionals', icon: ShieldCheck, label: 'Verify Professionals', desc: 'Architects, Designers, Contractors' },
    { to: '/admin/products', icon: Package, label: 'Product Catalog', desc: 'Brands, categories, listings' },
    { to: '/admin/leads', icon: Mail, label: 'Leads & Contact', desc: 'Contact form submissions' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics', desc: 'Metrics and AI insights' },
    { to: '/admin/fraud', icon: AlertTriangle, label: 'Fraud Monitor', desc: 'Review flagged activities', danger: true },
  ];

  const needsAttention = [
    ...(stats?.pendingDealers ? [{
      label: `${stats.pendingDealers} dealer${stats.pendingDealers !== 1 ? 's' : ''} pending verification`,
      href: '/admin/dealers?status=PENDING_VERIFICATION',
      color: 'border-amber-400 bg-amber-50',
      textColor: 'text-amber-800',
      linkColor: 'text-amber-700 hover:text-amber-900',
      icon: Store,
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-100',
    }] : []),
    ...(stats?.openFraudFlags ? [{
      label: `${stats.openFraudFlags} fraud flag${stats.openFraudFlags !== 1 ? 's' : ''} open`,
      href: '/admin/fraud',
      color: 'border-red-400 bg-red-50',
      textColor: 'text-red-800',
      linkColor: 'text-red-700 hover:text-red-900',
      icon: AlertTriangle,
      iconColor: 'text-red-500',
      iconBg: 'bg-red-100',
    }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-sm">
              <Shield className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{getGreeting()}, Shreshth</h1>
              <p className="text-sm text-gray-400 mt-0.5">{today} · Hub4Estate Control Center</p>
            </div>
          </div>
          {needsAttention.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-amber-700">{needsAttention.length} item{needsAttention.length !== 1 ? 's' : ''} need attention</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-6 max-w-7xl mx-auto space-y-6">

        {/* Needs Attention Banner */}
        {needsAttention.length > 0 && (
          <div className="space-y-2">
            {needsAttention.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-xl border-l-4 ${item.color}`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.iconBg}`}>
                      <Icon className={`w-4 h-4 ${item.iconColor}`} />
                    </div>
                    <span className={`text-sm font-semibold ${item.textColor}`}>{item.label}</span>
                  </div>
                  <Link
                    to={item.href}
                    className={`flex items-center gap-1 text-sm font-semibold transition-colors ${item.linkColor}`}
                  >
                    Review now <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {metricCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                to={card.href}
                className={`bg-white rounded-xl border border-gray-200 border-l-4 ${card.accent} p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                    <Icon className={`w-4.5 h-4.5 ${card.iconColor} w-[18px] h-[18px]`} />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-2xl font-bold text-gray-900 tabular-nums">{card.value.toLocaleString('en-IN')}</p>
                <p className="text-xs font-semibold text-gray-700 mt-1">{card.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
              </Link>
            );
          })}
        </div>

        {/* Main Content - Two Column */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Recent Activity */}
          <div className="lg:col-span-2 space-y-5">

            {/* Recent Dealer Registrations */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-gray-400" />
                  <h2 className="text-sm font-semibold text-gray-900">Recent Dealer Registrations</h2>
                </div>
                <Link to="/admin/dealers" className="text-xs font-medium text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {recentDealers.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <Store className="w-8 h-8 text-gray-100 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No dealers yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {recentDealers.map((dealer) => {
                    const ds = DEALER_STATUS[dealer.status] || { label: dealer.status, dot: 'bg-gray-300' };
                    return (
                      <Link
                        key={dealer.id}
                        to="/admin/dealers"
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group"
                      >
                        <div className="w-9 h-9 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-orange-600">{dealer.businessName.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{dealer.businessName}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                            <span>{dealer.ownerName}</span>
                            <span>·</span>
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-3 h-3" />{dealer.city || '—'}, {dealer.state || '—'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${ds.dot}`} />
                            <span className="text-xs font-medium text-gray-500">{ds.label}</span>
                          </div>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />{timeAgo(dealer.createdAt)}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent RFQs */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <h2 className="text-sm font-semibold text-gray-900">Recent RFQs</h2>
                </div>
                <Link to="/admin/rfqs" className="text-xs font-medium text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {recentRFQs.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <FileText className="w-8 h-8 text-gray-100 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No RFQs yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {recentRFQs.map((rfq) => {
                    const rs = RFQ_STATUS[rfq.status] || { label: rfq.status, color: 'text-gray-500', bg: 'bg-gray-100' };
                    return (
                      <div key={rfq.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{rfq.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                            {rfq.deliveryCity && <><MapPin className="w-3 h-3" />{rfq.deliveryCity} · </>}
                            {fmtDate(rfq.createdAt)}
                          </p>
                        </div>
                        <span className={`ml-3 flex-shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full ${rs.bg} ${rs.color}`}>
                          {rs.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Leads */}
            {leads.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <h2 className="text-sm font-semibold text-gray-900">Recent Leads</h2>
                  </div>
                  <Link to="/admin/leads" className="text-xs font-medium text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors">
                    View all <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="divide-y divide-gray-50">
                  {leads.map(lead => (
                    <Link key={lead.id} to="/admin/leads" className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Mail className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">{lead.name}</p>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                            lead.status === 'new' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {lead.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{lead.message}</p>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">{timeAgo(lead.createdAt)}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Quick Actions + Stats */}
          <div className="space-y-5">

            {/* Platform Health */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-gray-400" />
                  <h2 className="text-sm font-semibold text-gray-900">Platform Health</h2>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {[
                  {
                    label: 'Dealer Verification Rate',
                    value: stats?.totalDealers
                      ? `${Math.round((stats.totalDealers / Math.max(stats.totalDealers + stats.pendingDealers, 1)) * 100)}%`
                      : '—',
                    ok: (stats?.pendingDealers ?? 0) === 0,
                  },
                  {
                    label: 'Active RFQ Rate',
                    value: stats?.totalRFQs
                      ? `${Math.round((stats.activeRFQs / stats.totalRFQs) * 100)}%`
                      : '—',
                    ok: (stats?.activeRFQs ?? 0) > 0,
                  },
                  {
                    label: 'Avg Quotes per RFQ',
                    value: stats?.totalRFQs
                      ? `${(stats.totalQuotes / stats.totalRFQs).toFixed(1)}`
                      : '—',
                    ok: ((stats?.totalQuotes ?? 0) / Math.max(stats?.totalRFQs ?? 1, 1)) >= 1,
                  },
                  {
                    label: 'Open Fraud Flags',
                    value: String(stats?.openFraudFlags ?? 0),
                    ok: (stats?.openFraudFlags ?? 0) === 0,
                  },
                ].map(({ label, value, ok }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-gray-900">{value}</span>
                      {ok
                        ? <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                        : <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-gray-400" />
                  <h2 className="text-sm font-semibold text-gray-900">Quick Actions</h2>
                </div>
              </div>
              <div className="p-2">
                {quickActions.map(({ to, icon: Icon, label, desc, danger }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group ${
                      danger ? 'hover:bg-red-50' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      danger ? 'bg-red-50' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-4 h-4 ${danger ? 'text-red-500' : 'text-gray-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${danger ? 'text-red-700' : 'text-gray-900'}`}>{label}</p>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
