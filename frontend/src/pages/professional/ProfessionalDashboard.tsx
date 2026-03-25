import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
import { rfqApi } from '@/lib/api';
import {
  Plus, FileText, ShieldCheck, ArrowRight, Sparkles,
  FolderOpen, CheckCircle2, AlertCircle, Clock,
} from 'lucide-react';
import { UserBadge } from '@/components/common/UserBadge';
import { TourGuide } from '@/components/TourGuide';

const RFQ_STATUS: Record<string, { label: string; dot: string; color: string }> = {
  DRAFT:           { label: 'Draft',          dot: 'bg-gray-300',   color: 'text-gray-500' },
  PUBLISHED:       { label: 'Live',            dot: 'bg-blue-400',   color: 'text-blue-600' },
  QUOTES_RECEIVED: { label: 'Quotes ready',   dot: 'bg-amber-400',  color: 'text-amber-600' },
  DEALER_SELECTED: { label: 'In progress',    dot: 'bg-violet-400', color: 'text-violet-600' },
  COMPLETED:       { label: 'Completed',      dot: 'bg-green-400',  color: 'text-green-600' },
  CANCELLED:       { label: 'Cancelled',      dot: 'bg-red-300',    color: 'text-red-500' },
};

const VERIF_STATUS = {
  NOT_APPLIED:       { label: 'Not applied',  icon: AlertCircle,   color: 'text-gray-500', bg: 'bg-gray-50' },
  PENDING_DOCUMENTS: { label: 'Docs needed',  icon: FileText,      color: 'text-amber-600', bg: 'bg-amber-50' },
  UNDER_REVIEW:      { label: 'Under review', icon: Clock,         color: 'text-blue-600', bg: 'bg-blue-50' },
  VERIFIED:          { label: 'Verified',     icon: CheckCircle2,  color: 'text-green-600', bg: 'bg-green-50' },
  REJECTED:          { label: 'Rejected',     icon: AlertCircle,   color: 'text-red-600', bg: 'bg-red-50' },
};

export function ProfessionalDashboard() {
  const { user } = useAuthStore();
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    rfqApi.getMyRFQs({ limit: 6 })
      .then(res => setRfqs(res.data?.rfqs || res.data || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const verifStatus = (user?.profVerificationStatus as keyof typeof VERIF_STATUS) || 'NOT_APPLIED';
  const verifConfig = VERIF_STATUS[verifStatus] || VERIF_STATUS.NOT_APPLIED;
  const VerifIcon = verifConfig.icon;
  const isVerified = verifStatus === 'VERIFIED';

  return (
    <div className="min-h-screen bg-gray-50">
      <TourGuide tourKey="professional" />

      {/* Page header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-lg font-semibold text-gray-900">
                {user?.name?.split(' ')[0] ? `Hi, ${user.name.split(' ')[0]}` : 'Dashboard'}
              </h1>
              {user?.role && (
                <UserBadge
                  role={user.role}
                  verified={isVerified}
                  data-tour="verification"
                />
              )}
            </div>
            <p className="text-sm text-gray-500">Your professional workspace on Hub4Estate</p>
          </div>
          <Link
            to="/rfq/create"
            data-tour="new-rfq"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            New RFQ
          </Link>
        </div>
      </div>

      <div className="px-6 py-6 max-w-5xl mx-auto space-y-6">

        {/* Verification status card */}
        {!isVerified && (
          <div className={`${verifConfig.bg} rounded-xl border border-gray-100 p-4 flex items-center justify-between gap-4`}>
            <div className="flex items-center gap-3">
              <VerifIcon className={`w-5 h-5 ${verifConfig.color} flex-shrink-0`} />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {verifStatus === 'NOT_APPLIED'
                    ? 'Get your verified badge'
                    : verifStatus === 'PENDING_DOCUMENTS'
                    ? 'Documents needed'
                    : verifStatus === 'UNDER_REVIEW'
                    ? 'Verification in progress'
                    : 'Verification rejected'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {verifStatus === 'NOT_APPLIED'
                    ? 'Dealers see your badge and adjust their approach when you post RFQs.'
                    : verifStatus === 'PENDING_DOCUMENTS'
                    ? 'Upload your credentials to proceed.'
                    : verifStatus === 'UNDER_REVIEW'
                    ? "We'll notify you within 24 hours."
                    : 'Review the reason and resubmit your documents.'}
                </p>
              </div>
            </div>
            {verifStatus !== 'UNDER_REVIEW' && (
              <Link
                to="/pro/documents"
                className="flex items-center gap-1.5 text-sm font-medium text-gray-900 hover:text-orange-600 transition-colors flex-shrink-0"
              >
                {verifStatus === 'NOT_APPLIED' ? 'Apply now' : 'View'}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent RFQs */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-gray-500">Recent RFQs</h2>
              <Link
                to="/rfq/my-rfqs"
                className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="bg-white rounded-xl border border-gray-200">
              {isLoading ? (
                <div className="px-4 py-8 text-center">
                  <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin mx-auto" />
                </div>
              ) : rfqs.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {rfqs.map(rfq => {
                    const s = RFQ_STATUS[rfq.status] || RFQ_STATUS.DRAFT;
                    return (
                      <Link
                        key={rfq.id}
                        to={`/rfq/${rfq.id}`}
                        className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
                      >
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{rfq.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(rfq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            {rfq._count?.quotes > 0 && ` · ${rfq._count.quotes} quote${rfq._count.quotes !== 1 ? 's' : ''}`}
                          </p>
                        </div>
                        <span className={`text-xs font-medium flex-shrink-0 ${s.color}`}>{s.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="px-4 py-10 text-center">
                  <FileText className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 font-medium">No RFQs yet</p>
                  <p className="text-xs text-gray-400 mt-1">Post your first project requirement to get quotes from dealers.</p>
                  <Link
                    to="/rfq/create"
                    className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-gray-900 hover:text-orange-600 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Post an RFQ
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-3">Quick links</h2>
            <div className="space-y-2">
              {[
                { to: '/pro/profile', icon: ShieldCheck, label: 'My Profile', desc: 'Edit your professional details' },
                { to: '/pro/projects', icon: FolderOpen, label: 'Projects', desc: 'Manage your project portfolio' },
                { to: '/ai-assistant', icon: Sparkles, label: 'Spark AI', desc: 'Product specs, price estimates' },
              ].map(({ to, icon: Icon, label, desc }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
