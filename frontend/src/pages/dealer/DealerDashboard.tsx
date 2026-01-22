import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dealerApi, quotesApi } from '../../lib/api';
import { useAuthStore } from '../../lib/store';
import { CardSkeleton, Alert } from '../../components/ui';
import {
  TrendingUp, FileText, CheckCircle, Clock, ArrowRight,
  Target, Award, Bell, Zap, Shield, MapPin,
  IndianRupee, MessageSquare, Eye, Send, ChevronRight, Package
} from 'lucide-react';

interface DealerProfile {
  id: string;
  businessName: string;
  ownerName: string;
  city: string;
  status: string;
  totalRFQs: number;
  quotesSubmitted: number;
  quotesWon: number;
  conversionRate: number;
}

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

interface RFQPreview {
  id: string;
  title: string;
  buyerCity: string;
  itemCount: number;
  createdAt: string;
  deadline?: string;
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

        // Mock recent RFQs for preview - in production this would come from API
        setRecentRFQs([
          {
            id: '1',
            title: 'Wiring for 3BHK Apartment',
            buyerCity: 'Mumbai',
            itemCount: 12,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            estimatedValue: 85000,
          },
          {
            id: '2',
            title: 'MCB Distribution Setup',
            buyerCity: 'Pune',
            itemCount: 8,
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            estimatedValue: 45000,
          },
          {
            id: '3',
            title: 'Complete Home Electrical',
            buyerCity: 'Mumbai',
            itemCount: 25,
            createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            estimatedValue: 175000,
          },
        ]);
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
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${Math.floor(diffHrs / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="container-custom">
          <Alert variant="error">{error}</Alert>
        </div>
      </div>
    );
  }

  const pendingRFQs = 23; // Mock: would come from API
  const pendingQuotes = analytics?.insights.statusBreakdown?.SUBMITTED || 0;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header with Stats */}
      <div className="bg-neutral-900 text-white">
        <div className="container-custom py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-green-400">Verified Dealer</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black">
                {profile?.businessName || 'Dealer Dashboard'}
              </h1>
              <p className="text-neutral-400 mt-1 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {profile?.city || 'Location not set'}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center px-4 py-2 bg-white/10 backdrop-blur">
                <p className="text-2xl font-black text-accent-400">{pendingRFQs}</p>
                <p className="text-xs text-neutral-400 uppercase">New RFQs</p>
              </div>
              <div className="text-center px-4 py-2 bg-white/10 backdrop-blur">
                <p className="text-2xl font-black text-green-400">{((analytics?.metrics.conversionRate || 0) * 100).toFixed(0)}%</p>
                <p className="text-xs text-neutral-400 uppercase">Win Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {pendingRFQs > 0 && (
        <div className="bg-accent-500 text-white py-3">
          <div className="container-custom">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5" />
                <span className="font-bold">{pendingRFQs} new RFQs need your attention!</span>
              </div>
              <Link to="/dealer/rfqs" className="flex items-center gap-1 font-bold hover:underline">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* RFQ Inbox Preview */}
            <div className="bg-white border-2 border-neutral-900">
              <div className="p-4 border-b-2 border-neutral-900 bg-neutral-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5" />
                  <h2 className="font-bold">RFQ Inbox</h2>
                  <span className="bg-accent-500 text-white text-xs font-bold px-2 py-0.5">
                    {pendingRFQs} New
                  </span>
                </div>
                <Link to="/dealer/rfqs" className="text-sm text-neutral-400 hover:text-white flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {recentRFQs.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                  <h3 className="font-bold text-neutral-900 mb-2">No new RFQs</h3>
                  <p className="text-neutral-500">New quote requests will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {recentRFQs.map((rfq) => (
                    <div key={rfq.id} className="p-4 hover:bg-neutral-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-neutral-900">{rfq.title}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {rfq.buyerCity}
                            </span>
                            <span className="flex items-center gap-1">
                              <Package className="w-3 h-3" /> {rfq.itemCount} items
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {formatTimeAgo(rfq.createdAt)}
                            </span>
                          </div>
                          {rfq.estimatedValue && (
                            <p className="mt-2 text-sm font-bold text-green-600">
                              Est. ₹{(rfq.estimatedValue / 1000).toFixed(0)}K
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/dealer/rfqs/${rfq.id}`}
                            className="p-2 border-2 border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/dealer/rfqs/${rfq.id}/quote`}
                            className="p-2 bg-accent-500 text-white hover:bg-accent-600"
                          >
                            <Send className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-4 bg-neutral-50 border-t-2 border-neutral-200">
                <Link
                  to="/dealer/rfqs"
                  className="btn-primary w-full justify-center"
                >
                  View All RFQs
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border-2 border-neutral-200 p-4">
                <FileText className="w-5 h-5 text-blue-500 mb-2" />
                <p className="text-2xl font-black text-neutral-900">{analytics?.metrics.totalRFQs || 0}</p>
                <p className="text-xs text-neutral-500 font-bold uppercase">Total RFQs</p>
              </div>
              <div className="bg-white border-2 border-neutral-200 p-4">
                <Send className="w-5 h-5 text-amber-500 mb-2" />
                <p className="text-2xl font-black text-amber-600">{pendingQuotes}</p>
                <p className="text-xs text-neutral-500 font-bold uppercase">Pending</p>
              </div>
              <div className="bg-white border-2 border-neutral-200 p-4">
                <CheckCircle className="w-5 h-5 text-green-500 mb-2" />
                <p className="text-2xl font-black text-green-600">{analytics?.metrics.conversions || 0}</p>
                <p className="text-xs text-neutral-500 font-bold uppercase">Won</p>
              </div>
              <div className="bg-white border-2 border-neutral-200 p-4">
                <Target className="w-5 h-5 text-purple-500 mb-2" />
                <p className="text-2xl font-black text-purple-600">
                  {((analytics?.metrics.conversionRate || 0) * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-neutral-500 font-bold uppercase">Win Rate</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/dealer/quotes"
                className="bg-white border-2 border-neutral-200 p-6 hover:border-neutral-900 hover:shadow-brutal transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-neutral-900">My Quotes</h3>
                    <p className="text-sm text-neutral-500">Track your submitted quotes</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>

              <Link
                to="/dealer/profile"
                className="bg-white border-2 border-neutral-200 p-6 hover:border-neutral-900 hover:shadow-brutal transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500 flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-neutral-900">My Profile</h3>
                    <p className="text-sm text-neutral-500">Update brands & areas</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Earnings */}
            <div className="bg-green-50 border-2 border-green-200 p-6">
              <div className="flex items-center gap-2 text-green-700 mb-3">
                <IndianRupee className="w-5 h-5" />
                <span className="font-bold uppercase tracking-wider text-sm">Avg Quote Value</span>
              </div>
              <p className="text-3xl font-black text-green-800">
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                }).format(analytics?.insights.avgQuoteAmount || 0)}
              </p>
            </div>

            {/* Performance Tips */}
            <div className="bg-neutral-900 text-white p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-accent-400" />
                <h3 className="font-bold">Win More Quotes</h3>
              </div>
              <ul className="space-y-3 text-sm text-neutral-300">
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Respond within 24 hours for 40% higher win rate</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Add detailed item breakdowns</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Offer warranty information</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Include delivery timeline</span>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="bg-white border-2 border-neutral-200 p-4">
              <h3 className="font-bold text-neutral-900 mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link to="/dealer/rfqs" className="flex items-center gap-3 p-3 bg-neutral-50 hover:bg-neutral-100 transition-colors">
                  <FileText className="w-5 h-5 text-neutral-600" />
                  <span className="font-medium text-neutral-900">Browse RFQs</span>
                  <ChevronRight className="w-4 h-4 text-neutral-400 ml-auto" />
                </Link>
                <Link to="/dealer/quotes" className="flex items-center gap-3 p-3 bg-neutral-50 hover:bg-neutral-100 transition-colors">
                  <Send className="w-5 h-5 text-neutral-600" />
                  <span className="font-medium text-neutral-900">My Quotes</span>
                  <ChevronRight className="w-4 h-4 text-neutral-400 ml-auto" />
                </Link>
                <Link to="/community" className="flex items-center gap-3 p-3 bg-neutral-50 hover:bg-neutral-100 transition-colors">
                  <MessageSquare className="w-5 h-5 text-neutral-600" />
                  <span className="font-medium text-neutral-900">Community</span>
                  <ChevronRight className="w-4 h-4 text-neutral-400 ml-auto" />
                </Link>
              </div>
            </div>

            {/* Help */}
            <div className="bg-white border-2 border-neutral-200 p-4">
              <h3 className="font-bold text-neutral-900 mb-2">Need Help?</h3>
              <p className="text-sm text-neutral-600 mb-4">
                Our dealer support team is here to help you grow your business.
              </p>
              <a href="tel:+917690001999" className="btn-secondary w-full justify-center text-sm">
                Call: +91 76900 01999
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
