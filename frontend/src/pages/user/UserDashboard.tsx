import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../lib/store';
import { useMyRFQs } from '../../hooks/useRFQs';
import { inquiryApi } from '../../lib/api';
import {
  FileText, Plus, ArrowRight, Sparkles, ChevronRight,
  IndianRupee, Search, Package, Clock, CheckCircle,
  TrendingUp, MessageSquare, Loader2, Bookmark,
  User, Zap, Send, ShoppingBag,
} from 'lucide-react';

interface RFQ {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  _count?: { items: number; quotes: number };
}

interface Inquiry {
  id: string;
  inquiryNumber: string | null;
  name: string;
  status: string;
  quantity: number;
  deliveryCity: string;
  createdAt: string;
}

interface ActivityItem {
  id: string;
  type: 'rfq' | 'inquiry';
  title: string;
  status: string;
  date: string;
  link: string;
  meta?: string;
}

const RFQ_STATUS: Record<string, { label: string; color: string; dot: string; bg: string }> = {
  DRAFT:           { label: 'Draft',         color: 'text-gray-500',  dot: 'bg-gray-300',  bg: 'bg-gray-50' },
  PUBLISHED:       { label: 'Live',           color: 'text-blue-600',  dot: 'bg-blue-400',  bg: 'bg-blue-50' },
  QUOTES_RECEIVED: { label: 'Quotes ready',  color: 'text-amber-600', dot: 'bg-amber-400', bg: 'bg-amber-50' },
  QUOTE_SELECTED:  { label: 'In progress',   color: 'text-green-600', dot: 'bg-green-400', bg: 'bg-green-50' },
  COMPLETED:       { label: 'Completed',     color: 'text-green-600', dot: 'bg-green-400', bg: 'bg-green-50' },
  CANCELLED:       { label: 'Cancelled',     color: 'text-red-500',   dot: 'bg-red-400',   bg: 'bg-red-50' },
};

const INQUIRY_STATUS: Record<string, { label: string }> = {
  new:       { label: 'Open' },
  contacted: { label: 'In Progress' },
  quoted:    { label: 'Quoted' },
  closed:    { label: 'Closed' },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function UserDashboard() {
  const { user } = useAuthStore();
  const { data, isLoading: rfqLoading } = useMyRFQs({ limit: 10 });
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [inquiryLoading, setInquiryLoading] = useState(true);

  const rfqs: RFQ[] = data?.rfqs || [];

  const firstName = user?.name?.split(' ')[0] || 'there';

  // Fetch inquiries by phone
  useEffect(() => {
    if (!user?.phone) {
      setInquiryLoading(false);
      return;
    }
    inquiryApi.track({ phone: user.phone })
      .then(res => setInquiries(res.data.inquiries || []))
      .catch(() => setInquiries([]))
      .finally(() => setInquiryLoading(false));
  }, [user?.phone]);

  const isLoading = rfqLoading || inquiryLoading;

  const stats = useMemo(() => {
    const activeRfqs = rfqs.filter(r => r.status === 'PUBLISHED').length;
    const quotesReceived = rfqs.reduce((sum, r) => sum + (r._count?.quotes || 0), 0);
    const completedRfqs = rfqs.filter(r => r.status === 'COMPLETED').length;
    // Placeholder savings estimate
    const moneySaved = completedRfqs * 2400;
    return {
      totalInquiries: inquiries.length,
      activeRfqs,
      quotesReceived,
      moneySaved,
    };
  }, [rfqs, inquiries]);

  // Build combined activity feed
  const recentActivity: ActivityItem[] = useMemo(() => {
    const rfqItems: ActivityItem[] = rfqs.slice(0, 5).map(rfq => ({
      id: rfq.id,
      type: 'rfq',
      title: rfq.title,
      status: RFQ_STATUS[rfq.status]?.label || rfq.status,
      date: rfq.createdAt,
      link: `/rfq/${rfq.id}`,
      meta: rfq._count?.quotes ? `${rfq._count.quotes} quote${rfq._count.quotes !== 1 ? 's' : ''}` : undefined,
    }));
    const inqItems: ActivityItem[] = inquiries.slice(0, 5).map(inq => ({
      id: inq.id,
      type: 'inquiry',
      title: inq.name || 'Product Inquiry',
      status: INQUIRY_STATUS[inq.status]?.label || inq.status,
      date: inq.createdAt,
      link: `/track?number=${inq.inquiryNumber || inq.id}`,
      meta: `${inq.quantity} pcs, ${inq.deliveryCity}`,
    }));
    return [...rfqItems, ...inqItems]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [rfqs, inquiries]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  const urgentRfqs = rfqs.filter(r => r.status === 'QUOTES_RECEIVED');

  const statCards = [
    { label: 'Total Inquiries', value: stats.totalInquiries, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Active RFQs', value: stats.activeRfqs, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Quotes Received', value: stats.quotesReceived, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Est. Savings', value: stats.moneySaved > 0 ? `Rs. ${stats.moneySaved.toLocaleString('en-IN')}` : '--', icon: IndianRupee, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Page Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {getGreeting()}, {firstName}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {urgentRfqs.length > 0
                  ? `${urgentRfqs.length} request${urgentRfqs.length !== 1 ? 's' : ''} with quotes ready to review`
                  : stats.activeRfqs > 0
                  ? `${stats.activeRfqs} live request${stats.activeRfqs !== 1 ? 's' : ''} waiting for quotes`
                  : 'Your procurement dashboard'}
              </p>
            </div>
            <Link
              to="/rfq/create"
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Request
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6 space-y-5">

        {/* Urgent: Quotes Ready Banner */}
        {urgentRfqs.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-900">
                {urgentRfqs.length === 1
                  ? 'You have dealer quotes ready to review'
                  : `${urgentRfqs.length} requests have dealer quotes ready`}
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Compare prices and pick the best deal
              </p>
            </div>
            <Link
              to="/dashboard/quotes"
              className="flex-shrink-0 text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1"
            >
              Review <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* Stat Cards */}
        {!isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statCards.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <p className="text-xl font-semibold text-gray-900">{value}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              to: '/',
              icon: Send,
              label: 'Submit Inquiry',
              accent: 'bg-amber-500 text-white hover:bg-amber-600',
              iconColor: 'text-white',
            },
            {
              to: '/rfq/create',
              icon: IndianRupee,
              label: 'Create RFQ',
              accent: 'bg-gray-900 text-white hover:bg-gray-800',
              iconColor: 'text-white',
            },
            {
              to: '/user/categories',
              icon: Package,
              label: 'Browse Products',
              accent: 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50',
              iconColor: 'text-gray-500',
            },
            {
              to: '/messages',
              icon: MessageSquare,
              label: 'Messages',
              accent: 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50',
              iconColor: 'text-gray-500',
            },
          ].map(({ to, icon: Icon, label, accent, iconColor }) => (
            <Link
              key={label}
              to={to}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all text-center ${accent}`}
            >
              <Icon className={`w-5 h-5 ${iconColor}`} />
              <p className="text-xs font-medium">{label}</p>
            </Link>
          ))}
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <Link
              to="/dashboard/inquiries"
              className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {recentActivity.map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  to={item.link}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    item.type === 'rfq' ? 'bg-blue-50' : 'bg-amber-50'
                  }`}>
                    {item.type === 'rfq' ? (
                      <FileText className="w-4 h-4 text-blue-500" />
                    ) : (
                      <ShoppingBag className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-gray-700">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(item.date)}
                      {item.meta && <span> &middot; {item.meta}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                      {item.status}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">No activity yet</p>
              <p className="text-xs text-gray-400 mb-5 max-w-xs mx-auto">
                Tell us what electrical product you need. Verified dealers compete to give you the best price.
              </p>
              <Link
                to="/rfq/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Submit Your First Request
              </Link>
            </div>
          )}
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/ai-assistant"
            className="group flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-amber-200 hover:bg-amber-50/30 transition-all"
          >
            <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-amber-100 transition-colors">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Spark AI</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                Ask about specs, prices, brands
              </p>
            </div>
          </Link>

          <Link
            to="/dashboard/saved"
            className="group flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-gray-100 transition-colors">
              <Bookmark className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Saved Products</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                Your bookmarked items
              </p>
            </div>
          </Link>

          <Link
            to="/user/knowledge"
            className="group flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-gray-100 transition-colors">
              <FileText className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Buying Guides</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                Wire sizes, MCBs, comparisons
              </p>
            </div>
          </Link>

          <Link
            to="/dashboard/profile"
            className="group flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-gray-100 transition-colors">
              <User className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Profile Settings</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                Update your info and preferences
              </p>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}
