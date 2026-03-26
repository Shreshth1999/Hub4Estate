import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dealerApi, quotesApi } from '../../lib/api';
import { useAuthStore } from '../../lib/store';
import { Loader2 } from 'lucide-react';
import {
  TrendingUp, FileText, CheckCircle, Clock, ArrowRight,
  Award, Bell, Shield, MapPin, AlertCircle,
  IndianRupee, Send, Eye, ChevronRight, Package,
  Upload, FileCheck, Building2, Phone,
} from 'lucide-react';

interface DealerProfile {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  status: string;
  dealerType?: string;
  gstNumber?: string;
  panNumber?: string;
  totalRFQs: number;
  quotesSubmitted: number;
  quotesWon: number;
  conversionRate: number;
  onboardingStep?: number;
  profileComplete?: boolean;
}

interface Analytics {
  metrics: { totalRFQs: number; conversions: number; conversionRate: number };
  insights: { lossReasons: Record<string, number>; avgQuoteAmount: number; statusBreakdown: Record<string, number> };
}

interface RFQPreview {
  id: string;
  title: string;
  buyerCity: string;
  itemCount: number;
  createdAt: string;
  estimatedValue?: number;
}

export function DealerDashboard() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<DealerProfile | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recentRFQs, setRecentRFQs] = useState<RFQPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, analyticsRes] = await Promise.all([
          dealerApi.getProfile(),
          quotesApi.getAnalytics(),
        ]);
        setProfile(profileRes.data);
        setAnalytics(analyticsRes.data);
      } catch (err: any) {
        console.error('Failed to fetch dealer data:', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
          navigate('/dealer/login', { replace: true });
          return;
        }
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [logout, navigate]);

  const formatTimeAgo = (dateString: string) => {
    const diffHrs = Math.floor((Date.now() - new Date(dateString).getTime()) / 3600000);
    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${Math.floor(diffHrs / 24)}d ago`;
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  const isPending = profile?.status && ['PENDING_VERIFICATION', 'DOCUMENTS_PENDING', 'UNDER_REVIEW'].includes(profile.status);
  if (isPending) return <PendingDealerDashboard profile={profile} />;

  const pendingRFQs = 0;
  const pendingQuotes = analytics?.insights.statusBreakdown?.SUBMITTED || 0;
  const winRate = ((analytics?.metrics.conversionRate || 0) * 100).toFixed(0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-3.5 h-3.5 text-green-500" />
              <span className="text-xs font-medium text-green-600">Verified Dealer</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">{profile?.businessName}</h1>
            <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {profile?.city || 'Location not set'}
            </p>
          </div>
          <Link
            to="/dealer/rfqs"
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            View RFQs
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Inline stats */}
        <div className="flex items-center gap-5 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-semibold text-gray-900">{pendingRFQs}</span>
            <span className="text-sm text-gray-400">new RFQs</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <span className="text-base font-semibold text-gray-900">{pendingQuotes}</span>
            <span className="text-sm text-gray-400">pending quotes</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <span className="text-base font-semibold text-gray-900">{winRate}%</span>
            <span className="text-sm text-gray-400">win rate</span>
          </div>
        </div>
      </div>

      {/* Notification bar */}
      {pendingRFQs > 0 && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">
              {pendingRFQs} new RFQs waiting for your quote
            </span>
          </div>
          <Link
            to="/dealer/rfqs"
            className="text-sm font-medium text-amber-700 hover:text-amber-900 flex items-center gap-1 transition-colors"
          >
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      <div className="px-6 py-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Column */}
          <div className="lg:col-span-2 space-y-5">

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total RFQs', value: analytics?.metrics.totalRFQs || 0, color: 'text-gray-900' },
                { label: 'Pending', value: pendingQuotes, color: 'text-amber-600' },
                { label: 'Won', value: analytics?.metrics.conversions || 0, color: 'text-green-600' },
                { label: 'Win rate', value: `${winRate}%`, color: 'text-blue-600' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-400 mb-1.5">{stat.label}</p>
                  <p className={`text-xl font-semibold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* RFQ Inbox */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <h2 className="text-sm font-medium text-gray-900">RFQ Inbox</h2>
                  {pendingRFQs > 0 && (
                    <span className="text-xs font-medium bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                      {pendingRFQs} new
                    </span>
                  )}
                </div>
                <Link
                  to="/dealer/rfqs"
                  className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
                >
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentRFQs.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <FileText className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No new RFQs yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentRFQs.map((rfq) => (
                    <div key={rfq.id} className="px-4 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{rfq.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {rfq.buyerCity}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="w-3 h-3" /> {rfq.itemCount} items
                          </span>
                          <span>{formatTimeAgo(rfq.createdAt)}</span>
                          {rfq.estimatedValue && (
                            <span className="text-green-600 font-medium">
                              ~₹{(rfq.estimatedValue / 1000).toFixed(0)}K
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Link
                          to="/dealer/rfqs"
                          className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-gray-500" />
                        </Link>
                        <Link
                          to={`/dealer/rfqs/${rfq.id}/quote`}
                          className="w-8 h-8 flex items-center justify-center bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="px-4 py-3 border-t border-gray-100">
                <Link
                  to="/dealer/rfqs"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Browse all RFQs <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { to: '/dealer/quotes', icon: CheckCircle, label: 'My Quotes', desc: 'Track submitted quotes', color: 'text-green-500' },
                { to: '/dealer/profile', icon: Award, label: 'Profile', desc: 'Update brands & areas', color: 'text-purple-500' },
              ].map(({ to, icon: Icon, label, desc, color }) => (
                <Link
                  key={to}
                  to={to}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all flex items-center gap-3"
                >
                  <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Avg quote value */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-400 mb-1.5 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5" /> Avg quote value
              </p>
              <p className="text-xl font-semibold text-gray-900">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(analytics?.insights.avgQuoteAmount || 0)}
              </p>
            </div>

            {/* Tips */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-500 mb-3">Win more quotes</p>
              <div className="space-y-2.5">
                {[
                  'Respond within 24h — 40% higher win rate',
                  'Add detailed item breakdowns',
                  'Include warranty information',
                  'Provide clear delivery timeline',
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-600 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Help */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-700 mb-1">Need help?</p>
              <p className="text-xs text-gray-500 mb-3">Our dealer support team is here.</p>
              <a
                href="tel:+917690001999"
                className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                +91 76900 01999
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Pending verification state
function PendingDealerDashboard({ profile }: { profile: DealerProfile | null }) {
  const getStatusInfo = (status: string | undefined) => {
    switch (status) {
      case 'PENDING_VERIFICATION': return { label: 'Pending verification', description: 'Your registration is being reviewed.', step: 1 };
      case 'DOCUMENTS_PENDING':   return { label: 'Documents required', description: 'Please upload required documents to complete verification.', step: 2 };
      case 'UNDER_REVIEW':        return { label: 'Under review', description: 'Your documents are being verified. Usually 24–48 hours.', step: 3 };
      default:                    return { label: 'Processing', description: 'Your application is being processed.', step: 1 };
    }
  };

  const statusInfo = getStatusInfo(profile?.status);
  const steps = [
    { label: 'Registration', done: true },
    { label: 'Documents', done: statusInfo.step > 1 },
    { label: 'Review', done: statusInfo.step > 2 },
    { label: 'Verified', done: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-xs font-medium text-amber-600">{statusInfo.label}</span>
        </div>
        <h1 className="text-lg font-semibold text-gray-900">{profile?.businessName || 'Welcome'}</h1>
        <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          {profile?.city}, {profile?.state}
        </p>
      </div>

      <div className="px-6 py-4 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <p className="text-sm text-amber-800">{statusInfo.description}</p>
      </div>

      <div className="px-6 py-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">

            {/* Progress */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-medium text-gray-900 mb-5">Verification progress</h2>
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 right-0 top-4 h-px bg-gray-200 z-0" style={{ left: '5%', right: '5%' }}>
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${((statusInfo.step - 1) / 3) * 100}%` }}
                  />
                </div>
                {steps.map((step, i) => (
                  <div key={i} className="flex flex-col items-center relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                      step.done
                        ? 'bg-green-500 text-white'
                        : i === statusInfo.step - 1
                          ? 'bg-amber-400 text-white'
                          : 'bg-gray-100 text-gray-400'
                    }`}>
                      {step.done ? '✓' : i + 1}
                    </div>
                    <p className="text-xs text-gray-600 mt-2 font-medium">{step.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-medium text-gray-900 mb-4">What&apos;s next</h2>
              {profile?.status === 'DOCUMENTS_PENDING' ? (
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
                  <Upload className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Upload required documents</p>
                    <p className="text-sm text-gray-500 mt-1">Please upload your GST certificate and PAN card.</p>
                    <Link to="/dealer/profile" className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-orange-600 hover:text-orange-700">
                      Upload now <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <FileCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Verification in progress</p>
                    <p className="text-sm text-gray-500 mt-1">Our team is reviewing your application. Typically 24–48 hours. We&apos;ll email you once verified.</p>
                  </div>
                </div>
              )}

              <div className="mt-3 flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Complete your profile</p>
                  <p className="text-sm text-gray-500 mt-1">Add the brands you deal in and service areas to get matched with relevant RFQs.</p>
                  <Link to="/dealer/profile" className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-gray-700 hover:text-gray-900">
                    Go to profile <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Your details */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-medium text-gray-900 mb-4">Registration details</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Business', value: profile?.businessName },
                  { label: 'Owner', value: profile?.ownerName },
                  { label: 'Email', value: profile?.email },
                  { label: 'Phone', value: profile?.phone },
                  { label: 'GST', value: profile?.gstNumber || '—' },
                  { label: 'Location', value: `${profile?.city}, ${profile?.state}` },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    <p className="text-sm font-medium text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-500 mb-3">While you wait</p>
              <div className="space-y-2.5">
                {['Complete your dealer profile', 'Add brands you deal in', 'Set your service areas', 'Browse product catalog'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                    <p className="text-xs text-gray-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-700 mb-1">Questions?</p>
              <p className="text-xs text-gray-500 mb-3">Our team is happy to help.</p>
              <a href="tel:+917690001999" className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors">
                <Phone className="w-3.5 h-3.5" />
                +91 76900 01999
              </a>
              <a href="mailto:shreshth.agarwal@hub4estate.com" className="block text-center text-xs text-gray-400 mt-2 hover:text-gray-600">
                shreshth.agarwal@hub4estate.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
