import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  BarChart3, Users, FileText, Package, TrendingUp, Activity, Loader2,
  Sparkles, Zap, MapPin, ShoppingBag, AlertTriangle, RefreshCw, ChevronRight,
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

interface AIInsight {
  type: 'hot_lead' | 'demand_trend' | 'dealer_tip' | 'city_activity' | 'action_needed';
  title: string;
  body: string;
  priority: 'high' | 'medium' | 'low';
}

const INSIGHT_CONFIG = {
  hot_lead:      { icon: Zap,           bg: 'bg-amber-50',  border: 'border-amber-200',  dot: 'bg-amber-500',  label: 'Hot Lead' },
  demand_trend:  { icon: TrendingUp,    bg: 'bg-blue-50',   border: 'border-blue-200',   dot: 'bg-blue-500',   label: 'Demand Trend' },
  dealer_tip:    { icon: Users,         bg: 'bg-violet-50', border: 'border-violet-200', dot: 'bg-violet-500', label: 'Dealer Tip' },
  city_activity: { icon: MapPin,        bg: 'bg-green-50',  border: 'border-green-200',  dot: 'bg-green-500',  label: 'City Activity' },
  action_needed: { icon: AlertTriangle, bg: 'bg-red-50',    border: 'border-red-200',    dot: 'bg-red-500',    label: 'Action Needed' },
};

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

export function AdminAnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsGenerated, setInsightsGenerated] = useState<string | null>(null);

  useEffect(() => {
    api.get('/admin/dashboard/stats')
      .then(res => setStats(res.data.stats))
      .catch(() => setError('Failed to load analytics data'))
      .finally(() => setIsLoading(false));
  }, []);

  const fetchInsights = async () => {
    setInsightsLoading(true);
    try {
      const res = await api.get('/admin/ai-insights');
      setInsights((res.data.insights || []).sort((a: AIInsight, b: AIInsight) =>
        PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      ));
      setInsightsGenerated(new Date().toLocaleTimeString('en-IN'));
    } catch {
      setInsights([]);
    } finally {
      setInsightsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">Retry</button>
        </div>
      </div>
    );
  }

  const metricCards = stats ? [
    { label: 'Total Users',    value: stats.totalUsers,    icon: Users,     desc: 'Registered platform users' },
    { label: 'Total Dealers',  value: stats.totalDealers,  icon: Package,   desc: `${stats.pendingDealers} pending verification` },
    { label: 'Total RFQs',     value: stats.totalRFQs,     icon: FileText,  desc: `${stats.activeRFQs} currently active` },
    { label: 'Total Products', value: stats.totalProducts, icon: BarChart3, desc: 'Listed in catalog' },
    { label: 'Total Quotes',   value: stats.totalQuotes,   icon: TrendingUp, desc: 'Submitted by dealers' },
    { label: 'Active RFQs',    value: stats.activeRFQs,    icon: Activity,  desc: 'Currently accepting quotes' },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <h1 className="text-lg font-semibold text-gray-900">Platform Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Key metrics and AI-powered insights</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Key Metrics */}
        <div>
          <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Key Metrics</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {metricCards.map(metric => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">{metric.value.toLocaleString()}</p>
                  <p className="text-xs font-medium text-gray-600 mt-0.5">{metric.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{metric.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-violet-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Volt AI Insights</h3>
                {insightsGenerated && <p className="text-xs text-gray-400">Generated at {insightsGenerated}</p>}
              </div>
            </div>
            <button
              onClick={fetchInsights}
              disabled={insightsLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-violet-600 bg-violet-50 border border-violet-200 rounded-lg hover:bg-violet-100 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${insightsLoading ? 'animate-spin' : ''}`} />
              {insightsLoading ? 'Analyzing...' : insights.length ? 'Refresh' : 'Generate Insights'}
            </button>
          </div>

          {insights.length === 0 && !insightsLoading ? (
            <div className="px-5 py-10 text-center">
              <Sparkles className="w-8 h-8 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">AI insights not generated yet</p>
              <p className="text-xs text-gray-400 mt-1 mb-4">Click "Generate Insights" to get AI-powered analysis of your platform data.</p>
              <button
                onClick={fetchInsights}
                className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors"
              >
                <Sparkles className="w-4 h-4" /> Generate with Volt AI
              </button>
            </div>
          ) : insightsLoading ? (
            <div className="px-5 py-10 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-violet-500 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Volt is analyzing your platform data...</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {insights.map((insight, i) => {
                const cfg = INSIGHT_CONFIG[insight.type] || INSIGHT_CONFIG.action_needed;
                const Icon = cfg.icon;
                return (
                  <div key={i} className={`px-5 py-4 flex items-start gap-3 ${insight.priority === 'high' ? cfg.bg : ''}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.bg} ${cfg.border} border`}>
                      <Icon className="w-3.5 h-3.5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900">{insight.title}</p>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                        <span className="text-[11px] text-gray-400">{cfg.label}</span>
                        {insight.priority === 'high' && (
                          <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">High priority</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{insight.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dealer + RFQ Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-900">Dealer Status</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {[
                { label: 'Verified Dealers',     value: (stats?.totalDealers || 0) - (stats?.pendingDealers || 0), bg: 'bg-green-50', color: 'text-green-700' },
                { label: 'Pending Verification', value: stats?.pendingDealers || 0,                                bg: 'bg-amber-50',  color: 'text-amber-700' },
                { label: 'Total Dealers',        value: stats?.totalDealers || 0,                                  bg: 'bg-white',     color: 'text-gray-700' },
              ].map(({ label, value, bg, color }) => (
                <div key={label} className={`flex items-center justify-between px-4 py-3 ${bg}`}>
                  <span className={`text-sm ${color}`}>{label}</span>
                  <span className={`text-base font-semibold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-900">RFQ Status</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {[
                { label: 'Active RFQs',          value: stats?.activeRFQs || 0,                                     bg: 'bg-blue-50', color: 'text-blue-700' },
                { label: 'Closed / Completed',   value: (stats?.totalRFQs || 0) - (stats?.activeRFQs || 0),         bg: 'bg-white',   color: 'text-gray-700' },
                { label: 'Total RFQs',           value: stats?.totalRFQs || 0,                                      bg: 'bg-white',   color: 'text-gray-700' },
              ].map(({ label, value, bg, color }) => (
                <div key={label} className={`flex items-center justify-between px-4 py-3 ${bg}`}>
                  <span className={`text-sm ${color}`}>{label}</span>
                  <span className={`text-base font-semibold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Conversion Ratios */}
        <div>
          <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Conversion Ratios</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: TrendingUp,
                label: 'Quotes per RFQ',
                value: stats?.totalRFQs ? (stats.totalQuotes / stats.totalRFQs).toFixed(1) : '0',
                desc: 'Average quotes received per RFQ',
              },
              {
                icon: Activity,
                label: 'Active RFQ Rate',
                value: `${stats?.totalRFQs ? Math.round((stats.activeRFQs / stats.totalRFQs) * 100) : 0}%`,
                desc: 'Percentage of RFQs currently active',
              },
              {
                icon: Users,
                label: 'Dealer Verification Rate',
                value: `${stats?.totalDealers ? Math.round(((stats.totalDealers - stats.pendingDealers) / stats.totalDealers) * 100) : 0}%`,
                desc: 'Dealers verified out of total',
              },
            ].map(({ icon: Icon, label, value, desc }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500">{label}</span>
                </div>
                <p className="text-2xl font-semibold text-gray-900">{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
