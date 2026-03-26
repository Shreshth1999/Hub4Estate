import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/store';
import { rfqApi } from '../../lib/api';
import {
  FileText, Plus, ArrowRight, Sparkles, ChevronRight,
  IndianRupee, Search, Package, Clock, CheckCircle,
  TrendingUp, MessageSquare, Loader2,
} from 'lucide-react';

interface RFQ {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  _count?: { items: number; quotes: number };
}

const RFQ_STATUS: Record<string, { label: string; color: string; dot: string; bg: string }> = {
  DRAFT:           { label: 'Draft',         color: 'text-gray-500',  dot: 'bg-gray-300',  bg: 'bg-gray-50' },
  PUBLISHED:       { label: 'Live',           color: 'text-blue-600',  dot: 'bg-blue-400',  bg: 'bg-blue-50' },
  QUOTES_RECEIVED: { label: 'Quotes ready',  color: 'text-amber-600', dot: 'bg-amber-400', bg: 'bg-amber-50' },
  QUOTE_SELECTED:  { label: 'In progress',   color: 'text-green-600', dot: 'bg-green-400', bg: 'bg-green-50' },
  COMPLETED:       { label: 'Completed',     color: 'text-green-600', dot: 'bg-green-400', bg: 'bg-green-50' },
  CANCELLED:       { label: 'Cancelled',     color: 'text-red-500',   dot: 'bg-red-400',   bg: 'bg-red-50' },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function UserDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, quotesReady: 0, completed: 0 });

  const firstName = user?.name?.split(' ')[0] || 'there';

  useEffect(() => {
    rfqApi.getMyRFQs({ limit: 10 })
      .then(res => {
        const data: RFQ[] = res.data.rfqs || [];
        setRfqs(data);
        const active = data.filter(r => r.status === 'PUBLISHED').length;
        const quotesReady = data.filter(r => r.status === 'QUOTES_RECEIVED').length;
        const completed = data.filter(r => r.status === 'COMPLETED').length;
        setStats({ total: data.length, active, quotesReady, completed });
      })
      .catch(err => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
          navigate('/login', { replace: true });
        }
      })
      .finally(() => setIsLoading(false));
  }, [logout, navigate]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  const urgentRfqs = rfqs.filter(r => r.status === 'QUOTES_RECEIVED');

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 px-6 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {getGreeting()}, {firstName}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {stats.active > 0
                  ? `${stats.active} live request${stats.active !== 1 ? 's' : ''} waiting for quotes`
                  : stats.quotesReady > 0
                  ? `${stats.quotesReady} request${stats.quotesReady !== 1 ? 's' : ''} with quotes ready`
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

        {/* ── Urgent: Quotes Ready Banner ────────────────────── */}
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
              to="/rfq/my-rfqs"
              className="flex-shrink-0 text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1"
            >
              Review <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* ── Quick Actions ───────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              to: '/rfq/create',
              icon: IndianRupee,
              label: 'Get Best Price',
              sub: 'Submit a request',
              color: 'bg-gray-900 text-white',
              iconColor: 'text-white',
              subColor: 'text-gray-400',
            },
            {
              to: '/ai-assistant',
              icon: Sparkles,
              label: 'Ask Spark AI',
              sub: 'Any question',
              color: 'bg-orange-500 text-white',
              iconColor: 'text-white',
              subColor: 'text-orange-200',
            },
            {
              to: '/track',
              icon: Search,
              label: 'Track Request',
              sub: 'Check status',
              color: 'bg-white border border-gray-200 text-gray-900',
              iconColor: 'text-gray-500',
              subColor: 'text-gray-400',
            },
          ].map(({ to, icon: Icon, label, sub, color, iconColor, subColor }) => (
            <Link
              key={to}
              to={to}
              className={`flex flex-col gap-3 p-4 rounded-xl hover:opacity-90 transition-all ${color}`}
            >
              <Icon className={`w-5 h-5 ${iconColor}`} />
              <div>
                <p className="text-sm font-semibold leading-tight">{label}</p>
                <p className={`text-xs mt-0.5 ${subColor}`}>{sub}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Stats Row (only when there's data) ─────────────── */}
        {!isLoading && stats.total > 0 && (
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Total Requests', value: stats.total, icon: FileText },
              { label: 'Live', value: stats.active, icon: Clock },
              { label: 'Quotes Ready', value: stats.quotesReady, icon: TrendingUp },
              { label: 'Completed', value: stats.completed, icon: CheckCircle },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <Icon className="w-4 h-4 text-gray-300 mx-auto mb-2" />
                <p className="text-xl font-semibold text-gray-900">{value}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── My Requests ─────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900">My Requests</h2>
              {stats.total > 0 && (
                <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                  {stats.total}
                </span>
              )}
            </div>
            {rfqs.length > 5 && (
              <Link
                to="/rfq/my-rfqs"
                className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors"
              >
                See all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
            </div>
          ) : rfqs.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {rfqs.slice(0, 6).map((rfq) => {
                const s = RFQ_STATUS[rfq.status] || RFQ_STATUS.DRAFT;
                const quotes = rfq._count?.quotes || 0;
                return (
                  <Link
                    key={rfq.id}
                    to={`/rfq/${rfq.id}`}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors group"
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-gray-700">
                        {rfq.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(rfq.createdAt)}
                        {rfq._count?.items
                          ? ` · ${rfq._count.items} item${rfq._count.items !== 1 ? 's' : ''}`
                          : ''}
                        {quotes > 0 && (
                          <span className="text-amber-600 font-medium">
                            {' '}· {quotes} quote{quotes !== 1 ? 's' : ''} ready
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium flex-shrink-0 ${s.color}`}>{s.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">No requests yet</p>
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

        {/* ── Feature Cards ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/ai-assistant"
            className="group flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-orange-200 hover:bg-orange-50/30 transition-all"
          >
            <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-orange-100 transition-colors">
              <Sparkles className="w-4.5 h-4.5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Spark AI</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                Ask about specs, prices, brands — any language
              </p>
            </div>
          </Link>

          <Link
            to="/user/categories"
            className="group flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-gray-100 transition-colors">
              <Package className="w-4.5 h-4.5 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Browse Products</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                Wires, MCBs, switches, fans and more
              </p>
            </div>
          </Link>

          <Link
            to="/messages"
            className="group flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-gray-100 transition-colors">
              <MessageSquare className="w-4.5 h-4.5 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Messages</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                Chat with dealers about your orders
              </p>
            </div>
          </Link>

          <Link
            to="/user/knowledge"
            className="group flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-gray-100 transition-colors">
              <FileText className="w-4.5 h-4.5 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Buying Guides</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                Wire sizes, MCBs, brand comparisons
              </p>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}
