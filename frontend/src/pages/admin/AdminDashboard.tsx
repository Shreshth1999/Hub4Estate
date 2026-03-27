import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, contactApi } from '../../lib/api';
import {
  Users, Store, FileText, AlertTriangle,
  Shield, Package, Loader2, MapPin, Clock,
  Mail, CheckCircle, Activity, ArrowRight,
  ShieldCheck, ClipboardList, MessageSquare,
  Building2, BarChart3, ChevronRight, Zap, TrendingUp,
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

const DEALER_STATUS: Record<string, { dot: string; label: string }> = {
  PENDING_VERIFICATION: { dot: 'bg-amber-400', label: 'Pending' },
  VERIFIED:             { dot: 'bg-green-400',  label: 'Verified' },
  SUSPENDED:            { dot: 'bg-red-400',    label: 'Suspended' },
  REJECTED:             { dot: 'bg-gray-400',   label: 'Rejected' },
};

const RFQ_STATUS: Record<string, { label: string; cls: string }> = {
  PUBLISHED:       { label: 'Live',     cls: 'bg-blue-100 text-blue-700' },
  COMPLETED:       { label: 'Done',     cls: 'bg-green-100 text-green-700' },
  DRAFT:           { label: 'Draft',    cls: 'bg-gray-100 text-gray-500' },
  CANCELLED:       { label: 'Cancelled',cls: 'bg-red-100 text-red-600' },
  QUOTES_RECEIVED: { label: 'Quoted',   cls: 'bg-amber-100 text-amber-700' },
  DEALER_SELECTED: { label: 'Selected', cls: 'bg-violet-100 text-violet-700' },
};

function timeAgo(d: string) {
  const h = Math.floor((Date.now() - new Date(d).getTime()) / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return days === 1 ? '1d ago' : `${days}d ago`;
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
  const [recentDealers, setRecentDealers] = useState<any[]>([]);
  const [recentRFQs, setRecentRFQs] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  useEffect(() => {
    Promise.all([
      adminApi.getDashboardStats(),
      contactApi.getSubmissions({ limit: 3 }),
    ]).then(([statsRes, leadsRes]) => {
      const d = statsRes.data;
      setStats(d.stats);
      setRecentDealers(d.recentDealers || []);
      setRecentRFQs(d.recentRFQs || []);
      setLeads(leadsRes.data.submissions || []);
    }).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          <p className="text-sm text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const pending = stats?.pendingDealers ?? 0;
  const fraud = stats?.openFraudFlags ?? 0;
  const needsAttention = pending > 0 || fraud > 0;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO DARK STRIP ─────────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 pt-8 pb-8">
        <div className="max-w-7xl mx-auto">

          {/* Greeting */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">{today}</p>
              <h1 className="text-2xl font-bold text-white">
                {getGreeting()}, Shreshth 👋
              </h1>
              <p className="text-slate-400 text-sm mt-1">Here's what's happening on Hub4Estate</p>
            </div>
            <Link
              to="/admin/analytics"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl border border-white/10 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Link>
          </div>

          {/* 3 Hero Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: 'Product Inquiries',
                value: stats?.totalInquiries ?? 0,
                sub: 'Customers looking for products',
                color: 'text-blue-400',
                borderColor: 'border-blue-500/30',
                bg: 'bg-blue-500/10',
                href: '/admin/inquiries',
              },
              {
                label: 'Verified Dealers',
                value: stats?.totalDealers ?? 0,
                sub: pending > 0 ? `${pending} pending your review` : 'All applications reviewed',
                color: pending > 0 ? 'text-amber-400' : 'text-green-400',
                borderColor: pending > 0 ? 'border-amber-500/30' : 'border-green-500/30',
                bg: pending > 0 ? 'bg-amber-500/10' : 'bg-green-500/10',
                href: '/admin/dealers',
              },
              {
                label: 'Active RFQs',
                value: stats?.activeRFQs ?? 0,
                sub: `${stats?.totalRFQs ?? 0} total RFQs on platform`,
                color: 'text-violet-400',
                borderColor: 'border-violet-500/30',
                bg: 'bg-violet-500/10',
                href: '/admin/rfqs',
              },
            ].map(({ label, value, sub, color, borderColor, bg, href }) => (
              <Link
                key={label}
                to={href}
                className={`${bg} border ${borderColor} rounded-2xl p-5 hover:bg-white/10 transition-all group`}
              >
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{label}</p>
                <p className={`text-5xl font-black ${color} tabular-nums mb-2`}>
                  {value.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-slate-500 flex items-center justify-between">
                  {sub}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── NEEDS ATTENTION ──────────────────────────────────── */}
      {needsAttention && (
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Needs Attention</span>
            </div>
            {pending > 0 && (
              <Link to="/admin/dealers" className="flex items-center gap-1.5 text-sm font-medium text-amber-800 hover:text-amber-900 transition-colors">
                <Store className="w-3.5 h-3.5" />
                {pending} dealer{pending !== 1 ? 's' : ''} pending verification
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
            {fraud > 0 && (
              <Link to="/admin/fraud" className="flex items-center gap-1.5 text-sm font-medium text-red-700 hover:text-red-900 transition-colors">
                <AlertTriangle className="w-3.5 h-3.5" />
                {fraud} fraud flag{fraud !== 1 ? 's' : ''} open
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <div className="px-6 py-6 max-w-7xl mx-auto space-y-6">

        {/* Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Users',     value: stats?.totalUsers ?? 0,    icon: Users,     href: '/admin/dealers',  cls: 'bg-blue-50 border-blue-100',    val: 'text-blue-700' },
            { label: 'Dealers',   value: stats?.totalDealers ?? 0,  icon: Store,     href: '/admin/dealers',  cls: 'bg-green-50 border-green-100',  val: 'text-green-700' },
            { label: 'Inquiries', value: stats?.totalInquiries ?? 0,icon: ClipboardList, href: '/admin/inquiries', cls: 'bg-violet-50 border-violet-100', val: 'text-violet-700' },
            { label: 'RFQs',      value: stats?.totalRFQs ?? 0,     icon: FileText,  href: '/admin/rfqs',     cls: 'bg-amber-50 border-amber-100',  val: 'text-amber-700' },
            { label: 'Products',  value: stats?.totalProducts ?? 0, icon: Package,   href: '/admin/products', cls: 'bg-orange-50 border-orange-100',val: 'text-orange-700' },
            { label: 'Quotes',    value: stats?.totalQuotes ?? 0,   icon: TrendingUp,href: '/admin/rfqs',     cls: 'bg-teal-50 border-teal-100',   val: 'text-teal-700' },
          ].map(({ label, value, icon: Icon, href, cls, val }) => (
            <Link
              key={label}
              to={href}
              className={`${cls} border rounded-xl p-4 hover:shadow-sm hover:-translate-y-0.5 transition-all`}
            >
              <Icon className={`w-4 h-4 ${val} mb-2`} />
              <p className={`text-2xl font-bold ${val} tabular-nums`}>{value.toLocaleString('en-IN')}</p>
              <p className="text-xs font-medium text-gray-500 mt-0.5">{label}</p>
            </Link>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Activity Feed */}
          <div className="lg:col-span-2 space-y-4">

            {/* Recent Dealer Registrations */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-bold text-gray-900">Dealer Registrations</span>
                </div>
                <Link to="/admin/dealers" className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {recentDealers.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <Store className="w-8 h-8 text-gray-100 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No dealers yet</p>
                </div>
              ) : recentDealers.map((dealer) => {
                const ds = DEALER_STATUS[dealer.status] || { dot: 'bg-gray-300', label: dealer.status };
                return (
                  <Link key={dealer.id} to="/admin/dealers" className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm ${
                      dealer.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                      dealer.status === 'PENDING_VERIFICATION' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {dealer.businessName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{dealer.businessName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {dealer.ownerName}
                        {dealer.city && ` · ${dealer.city}, ${dealer.state}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${ds.dot}`} />
                        <span className="text-xs font-medium text-gray-500">{ds.label}</span>
                      </div>
                      <span className="text-xs text-gray-400">{timeAgo(dealer.createdAt)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Recent RFQs */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-bold text-gray-900">Recent RFQs</span>
                </div>
                <Link to="/admin/rfqs" className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {recentRFQs.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <FileText className="w-8 h-8 text-gray-100 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No RFQs yet</p>
                </div>
              ) : recentRFQs.map((rfq) => {
                const rs = RFQ_STATUS[rfq.status] || { label: rfq.status, cls: 'bg-gray-100 text-gray-500' };
                return (
                  <div key={rfq.id} className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{rfq.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        {rfq.deliveryCity && <><MapPin className="w-3 h-3" />{rfq.deliveryCity} · </>}
                        {fmtDate(rfq.createdAt)}
                      </p>
                    </div>
                    <span className={`ml-3 flex-shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${rs.cls}`}>
                      {rs.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Recent Leads */}
            {leads.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-bold text-gray-900">Recent Leads</span>
                  </div>
                  <Link to="/admin/leads" className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors">
                    View all <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                {leads.map(lead => (
                  <Link key={lead.id} to="/admin/leads" className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{lead.name}</p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          lead.status === 'new' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {lead.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{lead.message}</p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(lead.createdAt)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right: Platform Health + Quick Actions */}
          <div className="space-y-4">

            {/* Platform Health */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-bold text-gray-900">Platform Health</span>
                </div>
              </div>
              <div className="p-4 space-y-4">
                {[
                  {
                    label: 'Dealer Approval Rate',
                    value: (stats?.totalDealers ?? 0) + (stats?.pendingDealers ?? 0) > 0
                      ? `${Math.round(((stats?.totalDealers ?? 0) / Math.max((stats?.totalDealers ?? 0) + (stats?.pendingDealers ?? 0), 1)) * 100)}%`
                      : '—',
                    ok: (stats?.pendingDealers ?? 0) === 0,
                    bar: (stats?.totalDealers ?? 0) + (stats?.pendingDealers ?? 0) > 0
                      ? Math.round(((stats?.totalDealers ?? 0) / Math.max((stats?.totalDealers ?? 0) + (stats?.pendingDealers ?? 0), 1)) * 100)
                      : 0,
                  },
                  {
                    label: 'Active RFQ Rate',
                    value: stats?.totalRFQs
                      ? `${Math.round(((stats.activeRFQs) / stats.totalRFQs) * 100)}%`
                      : '—',
                    ok: (stats?.activeRFQs ?? 0) > 0,
                    bar: stats?.totalRFQs
                      ? Math.round(((stats.activeRFQs) / stats.totalRFQs) * 100)
                      : 0,
                  },
                  {
                    label: 'Quotes per RFQ',
                    value: stats?.totalRFQs
                      ? `${(stats.totalQuotes / stats.totalRFQs).toFixed(1)}`
                      : '—',
                    ok: (stats?.totalQuotes ?? 0) > 0,
                    bar: Math.min(Math.round(((stats?.totalQuotes ?? 0) / Math.max(stats?.totalRFQs ?? 1, 1)) * 20), 100),
                  },
                  {
                    label: 'Fraud Flags',
                    value: `${stats?.openFraudFlags ?? 0} open`,
                    ok: (stats?.openFraudFlags ?? 0) === 0,
                    bar: 0,
                  },
                ].map(({ label, value, ok, bar }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-gray-500">{label}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-gray-900">{value}</span>
                        {ok
                          ? <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                          : <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        }
                      </div>
                    </div>
                    {bar > 0 && (
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${ok ? 'bg-green-400' : 'bg-amber-400'}`}
                          style={{ width: `${bar}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-bold text-gray-900">Quick Actions</span>
                </div>
              </div>
              <div className="p-2">
                {[
                  { to: '/admin/inquiries', icon: ClipboardList, label: 'Product Inquiries', desc: 'Respond to customer queries', accent: 'text-violet-600 bg-violet-50' },
                  { to: '/admin/dealers', icon: Store, label: 'Manage Dealers', desc: 'Verify, suspend, review', accent: 'text-green-600 bg-green-50' },
                  { to: '/admin/professionals', icon: ShieldCheck, label: 'Professionals', desc: 'Architect & contractor verification', accent: 'text-blue-600 bg-blue-50' },
                  { to: '/admin/leads', icon: Mail, label: 'Leads & Contact', desc: 'Contact form submissions', accent: 'text-amber-600 bg-amber-50' },
                  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics', desc: 'Platform metrics & AI insights', accent: 'text-pink-600 bg-pink-50' },
                  { to: '/admin/fraud', icon: AlertTriangle, label: 'Fraud Monitor', desc: 'Review flagged activities', accent: 'text-red-600 bg-red-50' },
                ].map(({ to, icon: Icon, label, desc, accent }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{label}</p>
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
