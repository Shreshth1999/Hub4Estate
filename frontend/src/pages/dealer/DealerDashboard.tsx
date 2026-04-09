import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dealerApi, quotesApi } from '../../lib/api';
import { useAuthStore } from '../../lib/store';
import { api } from '../../lib/api';
import {
  Loader2, TrendingUp, FileText, CheckCircle, Clock, ArrowRight,
  Award, Bell, Shield, MapPin, AlertCircle, IndianRupee, Send, Eye,
  ChevronRight, Package, Upload, FileCheck, Building2, Phone,
  BarChart3, Zap, MessageSquare, User,
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
  description?: string;
  brandMappings?: Array<{ id: string; brand: { id: string; name: string } }>;
  categoryMappings?: Array<{ id: string; category: { id: string; name: string } }>;
  serviceAreas?: Array<{ id: string; pincode: string }>;
}

interface Analytics {
  metrics: { totalRFQs: number; conversions: number; conversionRate: number };
  insights: { lossReasons: Record<string, number>; avgQuoteAmount: number; statusBreakdown: Record<string, number> };
}

interface InquiryPreview {
  id: string;
  inquiryNumber: string;
  modelNumber: string | null;
  quantity: number;
  deliveryCity: string;
  createdAt: string;
  category: { id: string; name: string } | null;
  identifiedBrand: { id: string; name: string } | null;
  dealerResponse: { status: string; quotedPrice: number } | null;
  notes: string | null;
}

export function DealerDashboard() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<DealerProfile | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recentInquiries, setRecentInquiries] = useState<InquiryPreview[]>([]);
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

        // Fetch recent available inquiries
        try {
          const inquiriesRes = await api.get('/dealer-inquiry/available', { params: { page: 1, limit: 5 } });
          setRecentInquiries(inquiriesRes.data.data || []);
        } catch {
          // Non-critical, silently ignore
        }
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

  const isPending = profile?.status && ['PENDING_VERIFICATION', 'DOCUMENTS_PENDING', 'UNDER_REVIEW'].includes(profile.status);
  if (isPending) return <PendingDealerDashboard profile={profile} />;

  const totalQuotes = analytics?.metrics.totalRFQs || 0;
  const quotesWon = analytics?.metrics.conversions || 0;
  const pendingQuotes = analytics?.insights.statusBreakdown?.SUBMITTED || 0;
  const winRate = ((analytics?.metrics.conversionRate || 0) * 100).toFixed(0);
  const avgQuoteValue = analytics?.insights.avgQuoteAmount || 0;

  // Profile completeness check
  const profileIncomplete = !profile?.description || !profile?.brandMappings?.length || !profile?.categoryMappings?.length || !profile?.serviceAreas?.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Greeting Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-3.5 h-3.5 text-green-500" />
              <span className="text-xs font-medium text-green-600">Verified Dealer</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              Welcome back, {profile?.businessName || 'Dealer'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {profile?.city || 'Location not set'}{profile?.state ? `, ${profile.state}` : ''}
            </p>
          </div>
          <Link
            to="/dealer/inquiries/available"
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
          >
            View Inquiries
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Profile Incomplete Alert */}
      {profileIncomplete && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">
                Your profile is incomplete. Complete it to receive more relevant inquiries.
              </span>
            </div>
            <Link
              to="/dealer/profile"
              className="text-sm font-medium text-amber-700 hover:text-amber-900 flex items-center gap-1 transition-colors"
            >
              Complete profile <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      <div className="px-6 py-6 max-w-7xl mx-auto">
        {/* 5 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          <Link to="/dealer/inquiries/available" className="bg-white rounded-xl border border-gray-200 p-4 hover:border-amber-300 hover:shadow-sm transition-all">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{recentInquiries.length > 0 ? recentInquiries.length + '+' : '0'}</p>
            <p className="text-xs text-gray-400 mt-0.5">Available Inquiries</p>
          </Link>

          <Link to="/dealer/quotes" className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Send className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{totalQuotes}</p>
            <p className="text-xs text-gray-400 mt-0.5">Quotes Submitted</p>
          </Link>

          <Link to="/dealer/quotes" className="bg-white rounded-xl border border-gray-200 p-4 hover:border-green-300 hover:shadow-sm transition-all">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-green-600">{quotesWon}</p>
            <p className="text-xs text-gray-400 mt-0.5">Quotes Won</p>
          </Link>

          <Link to="/dealer/performance" className="bg-white rounded-xl border border-gray-200 p-4 hover:border-purple-300 hover:shadow-sm transition-all">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-purple-600">{winRate}%</p>
            <p className="text-xs text-gray-400 mt-0.5">Win Rate</p>
          </Link>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-gray-900">
              {avgQuoteValue > 0
                ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, notation: 'compact' }).format(avgQuoteValue)
                : '--'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Avg Quote Value</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-5">

            {/* New Inquiries Section */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <h2 className="text-sm font-semibold text-gray-900">New Inquiries</h2>
                  {recentInquiries.length > 0 && (
                    <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      {recentInquiries.length} available
                    </span>
                  )}
                </div>
                <Link
                  to="/dealer/inquiries/available"
                  className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
                >
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentInquiries.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <FileText className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No new inquiries yet</p>
                  <p className="text-xs text-gray-400 mt-1">Check back soon for new product inquiries.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentInquiries.map((inq) => (
                    <div key={inq.id} className="px-4 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {inq.modelNumber || inq.category?.name || 'Product Inquiry'}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {inq.deliveryCity}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="w-3 h-3" /> Qty: {inq.quantity}
                          </span>
                          {inq.category && (
                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-medium">
                              {inq.category.name}
                            </span>
                          )}
                          <span>{formatTimeAgo(inq.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {inq.dealerResponse ? (
                          <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Quoted
                          </span>
                        ) : (
                          <Link
                            to="/dealer/inquiries/available"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-xs font-medium rounded-lg hover:bg-amber-600 transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" /> Quote
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="px-4 py-3 border-t border-gray-100">
                <Link
                  to="/dealer/inquiries/available"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Browse All Inquiries <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Performance Chart Placeholder */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-gray-500" />
                  <h2 className="text-sm font-semibold text-gray-900">Monthly Performance</h2>
                </div>
                <Link to="/dealer/performance" className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors">
                  Details <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="flex items-end gap-2 h-32">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => {
                  const heights = [40, 55, 35, 70, 60, 80];
                  return (
                    <div key={month} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex flex-col gap-0.5">
                        <div
                          className="w-full bg-amber-400 rounded-t"
                          style={{ height: `${heights[i]}%` }}
                        />
                        <div
                          className="w-full bg-green-400 rounded-b"
                          style={{ height: `${heights[i] * 0.4}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400">{month}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <div className="w-2.5 h-2.5 rounded-sm bg-amber-400" /> Quotes Sent
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <div className="w-2.5 h-2.5 rounded-sm bg-green-400" /> Quotes Won
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { to: '/dealer/inquiries/available', icon: FileText, label: 'Available Inquiries', desc: 'Browse & quote', color: 'text-amber-500' },
                { to: '/dealer/quotes', icon: CheckCircle, label: 'My Quotes', desc: 'Track submissions', color: 'text-green-500' },
                { to: '/dealer/profile', icon: User, label: 'Profile', desc: 'Update details', color: 'text-purple-500' },
                { to: '/dealer/messages', icon: MessageSquare, label: 'Messages', desc: 'Conversations', color: 'text-blue-500' },
              ].map(({ to, icon: Icon, label, desc, color }) => (
                <Link
                  key={to}
                  to={to}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <Icon className={`w-5 h-5 ${color} mb-2`} />
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Quote Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-500 mb-3">Quote Summary</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Pending</span>
                  <span className="text-sm font-semibold text-amber-600">{pendingQuotes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Won</span>
                  <span className="text-sm font-semibold text-green-600">{quotesWon}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Total</span>
                  <span className="text-sm font-semibold text-gray-900">{totalQuotes}</span>
                </div>
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Avg Value</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(avgQuoteValue)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-500 mb-3">Win more quotes</p>
              <div className="space-y-2.5">
                {[
                  'Respond within 24h -- 40% higher win rate',
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
      case 'UNDER_REVIEW':        return { label: 'Under review', description: 'Your documents are being verified. Usually 24-48 hours.', step: 3 };
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
                      {step.done ? '\u2713' : i + 1}
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
                    <Link to="/dealer/profile" className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-amber-600 hover:text-amber-700">
                      Upload now <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <FileCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Verification in progress</p>
                    <p className="text-sm text-gray-500 mt-1">Our team is reviewing your application. Typically 24-48 hours. We&apos;ll email you once verified.</p>
                  </div>
                </div>
              )}

              <div className="mt-3 flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Complete your profile</p>
                  <p className="text-sm text-gray-500 mt-1">Add the brands you deal in and service areas to get matched with relevant inquiries.</p>
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
                  { label: 'GST', value: profile?.gstNumber || '--' },
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
