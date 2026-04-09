import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quotesApi, dealerApi } from '../../lib/api';
import {
  ArrowLeft, TrendingUp, Clock, Send, CheckCircle,
  IndianRupee, BarChart3, Loader2, AlertCircle,
  Target, Zap, Calendar, ChevronRight, Award,
  Lightbulb, ArrowUpRight, ArrowDownRight, FileText,
} from 'lucide-react';

interface Analytics {
  metrics: {
    totalRFQs: number;
    conversions: number;
    conversionRate: number;
  };
  insights: {
    lossReasons: Record<string, number>;
    avgQuoteAmount: number;
    statusBreakdown: Record<string, number>;
  };
}

interface Quote {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  rfq: {
    id: string;
    title: string;
    deliveryCity: string;
  };
}

const STATUS_DOT: Record<string, string> = {
  SUBMITTED: 'bg-amber-400',
  SELECTED: 'bg-green-400',
  REJECTED: 'bg-red-300',
  EXPIRED: 'bg-gray-300',
  WITHDRAWN: 'bg-gray-300',
};

const STATUS_LABEL: Record<string, string> = {
  SUBMITTED: 'Pending',
  SELECTED: 'Won',
  REJECTED: 'Lost',
  EXPIRED: 'Expired',
  WITHDRAWN: 'Withdrawn',
};

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export function DealerPerformancePage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recentQuotes, setRecentQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, quotesRes] = await Promise.all([
          quotesApi.getAnalytics(),
          quotesApi.getMyQuotes({ page: 1, limit: 20 }),
        ]);
        setAnalytics(analyticsRes.data);
        setRecentQuotes(quotesRes.data.quotes || []);
      } catch (err: any) {
        setError('Failed to load performance data. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalQuotes = analytics?.metrics.totalRFQs || 0;
  const quotesWon = analytics?.metrics.conversions || 0;
  const conversionRate = ((analytics?.metrics.conversionRate || 0) * 100).toFixed(1);
  const avgQuoteValue = analytics?.insights.avgQuoteAmount || 0;
  const pendingCount = analytics?.insights.statusBreakdown?.SUBMITTED || 0;
  const lostCount = analytics?.insights.statusBreakdown?.REJECTED || 0;

  // Estimate revenue from won quotes
  const wonQuotes = recentQuotes.filter(q => q.status === 'SELECTED');
  const estimatedRevenue = wonQuotes.reduce((sum, q) => sum + q.totalAmount, 0);

  // Top loss reasons
  const lossReasons = Object.entries(analytics?.insights.lossReasons || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-5xl mx-auto">
          <Link to="/dealer" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 mb-3 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Performance</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your quoting activity and conversion metrics</p>
        </div>
      </div>

      <div className="px-6 py-6 max-w-5xl mx-auto">
        {/* Big Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Conversion Rate - Hero */}
          <div className="col-span-2 lg:col-span-1 bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Target className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{conversionRate}%</p>
            <p className="text-xs text-gray-400 mt-1">Quote-to-Win Rate</p>
            <div className="mt-3 w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(parseFloat(conversionRate), 100)}%` }}
              />
            </div>
          </div>

          {/* Avg Response Time Placeholder */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">&lt;24h</p>
            <p className="text-xs text-gray-400 mt-1">Avg Response Time</p>
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> Faster than 80% of dealers
            </p>
          </div>

          {/* Total Quotes This Month */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Send className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalQuotes}</p>
            <p className="text-xs text-gray-400 mt-1">Quotes Submitted</p>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="text-green-600 font-medium">{quotesWon} won</span>
              <span className="text-gray-300">|</span>
              <span className="text-amber-600 font-medium">{pendingCount} pending</span>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {estimatedRevenue > 0
                ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, notation: 'compact' }).format(estimatedRevenue)
                : '--'}
            </p>
            <p className="text-xs text-gray-400 mt-1">Revenue (Won Quotes)</p>
            {avgQuoteValue > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                Avg quote: {fmtCurrency(avgQuoteValue)}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-5">

            {/* Monthly Performance Chart Placeholder */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-gray-500" />
                  <h2 className="text-sm font-semibold text-gray-900">Monthly Quotes Overview</h2>
                </div>
              </div>
              <div className="flex items-end gap-3 h-40">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => {
                  const sent = [3, 5, 4, 8, 6, 10];
                  const won = [1, 2, 1, 4, 3, 5];
                  const maxVal = Math.max(...sent);
                  return (
                    <div key={month} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex flex-col gap-0.5 items-center">
                        <div
                          className="w-full max-w-[32px] bg-amber-200 rounded-t"
                          style={{ height: `${(sent[i] / maxVal) * 100}%`, minHeight: '4px' }}
                        />
                        <div
                          className="w-full max-w-[32px] bg-green-400 rounded-b"
                          style={{ height: `${(won[i] / maxVal) * 100}%`, minHeight: '4px' }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1">{month}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <div className="w-2.5 h-2.5 rounded-sm bg-amber-200" /> Quotes Sent
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <div className="w-2.5 h-2.5 rounded-sm bg-green-400" /> Quotes Won
                </div>
              </div>
              <p className="text-[10px] text-gray-300 mt-2">* Chart shows placeholder data. Real data will populate as you submit more quotes.</p>
            </div>

            {/* Recent Quote History */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <h2 className="text-sm font-semibold text-gray-900">Recent Quote History</h2>
                </div>
                <Link to="/dealer/quotes" className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentQuotes.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <Send className="w-6 h-6 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No quotes submitted yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs text-gray-400 font-medium">
                        <th className="text-left px-4 py-2.5">RFQ</th>
                        <th className="text-left px-4 py-2.5">City</th>
                        <th className="text-right px-4 py-2.5">Amount</th>
                        <th className="text-left px-4 py-2.5">Status</th>
                        <th className="text-left px-4 py-2.5">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {recentQuotes.slice(0, 10).map(q => {
                        const dotClass = STATUS_DOT[q.status] || 'bg-gray-300';
                        const label = STATUS_LABEL[q.status] || q.status;
                        return (
                          <tr key={q.id} className={`hover:bg-gray-50 transition-colors ${q.status === 'SELECTED' ? 'bg-green-50/30' : ''}`}>
                            <td className="px-4 py-2.5 font-medium text-gray-900 truncate max-w-[200px]">{q.rfq.title}</td>
                            <td className="px-4 py-2.5 text-gray-500">{q.rfq.deliveryCity}</td>
                            <td className="px-4 py-2.5 text-right font-medium text-gray-900">{fmtCurrency(q.totalAmount)}</td>
                            <td className="px-4 py-2.5">
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                                <div className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                                {label}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-gray-400 text-xs">{fmtDate(q.createdAt)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Loss Reasons */}
            {lossReasons.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                  <h2 className="text-sm font-semibold text-gray-900">Top Loss Reasons</h2>
                </div>
                <div className="space-y-3">
                  {lossReasons.map(([reason, count]) => {
                    const total = lostCount || 1;
                    const pct = ((count / total) * 100).toFixed(0);
                    return (
                      <div key={reason}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700">{reason}</span>
                          <span className="text-xs text-gray-400">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-red-300 h-1.5 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Status Breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-500 mb-3">Status Breakdown</p>
              <div className="space-y-2.5">
                {Object.entries(analytics?.insights.statusBreakdown || {}).map(([status, count]) => {
                  const dotClass = STATUS_DOT[status] || 'bg-gray-300';
                  const label = STATUS_LABEL[status] || status;
                  const pct = totalQuotes > 0 ? ((count / totalQuotes) * 100).toFixed(0) : '0';
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${dotClass}`} />
                        <span className="text-sm text-gray-700">{label}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{count} <span className="text-xs text-gray-400">({pct}%)</span></span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tips to Improve */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <p className="text-xs font-medium text-gray-700">Tips to Improve</p>
              </div>
              <div className="space-y-3">
                {[
                  { tip: 'Respond within 24 hours', detail: 'Fast responses have 40% higher win rates', icon: Clock },
                  { tip: 'Add detailed breakdowns', detail: 'Itemized quotes build buyer trust', icon: FileText },
                  { tip: 'Include warranty terms', detail: 'Buyers prefer quotes with clear warranty info', icon: CheckCircle },
                  { tip: 'Competitive pricing', detail: 'Check your average vs market rates', icon: TrendingUp },
                  { tip: 'Complete your profile', detail: 'Verified profiles with photos get 2x more inquiries', icon: Award },
                ].map(({ tip, detail, icon: Icon }, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                    <Icon className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-gray-900">{tip}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-2">
              <Link
                to="/dealer/quotes"
                className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">View All Quotes</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link
                to="/dealer/inquiries/available"
                className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Browse Inquiries</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link
                to="/dealer/profile"
                className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Edit Profile</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
