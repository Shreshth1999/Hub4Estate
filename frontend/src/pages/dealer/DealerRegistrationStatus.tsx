import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';
import {
  CheckCircle, Clock, XCircle, ArrowRight, Mail, Phone,
  RefreshCw, AlertTriangle, Shield, Zap, Loader2,
} from 'lucide-react';

interface RegistrationStatus {
  id: string;
  businessName: string;
  email: string;
  status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';
  createdAt: string;
  verificationNotes?: string;
}

const STATUS_CONFIG: Record<string, {
  icon: typeof Clock;
  color: string;
  bg: string;
  border: string;
  title: string;
  description: string;
}> = {
  PENDING_VERIFICATION: {
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    title: 'Pending Verification',
    description: 'Our team is reviewing your documents. This usually takes 24–48 hours.',
  },
  ACTIVE: {
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    title: 'Verified & Active',
    description: 'Your account is active! You can now log in and start receiving RFQs.',
  },
  REJECTED: {
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    title: 'Verification Failed',
    description: 'Unfortunately, we could not verify your documents. Please contact support.',
  },
  SUSPENDED: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    title: 'Account Suspended',
    description: 'Your account has been suspended. Please contact support for assistance.',
  },
};

export function DealerRegistrationStatus() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');

  const [status, setStatus] = useState<RegistrationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(email || '');
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = async (emailToCheck: string) => {
    if (!emailToCheck.trim()) {
      setError('Please enter your email address');
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const response = await api.get(`/auth/dealer/status?email=${encodeURIComponent(emailToCheck)}`);
      setStatus(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('No registration found with this email. Please check and try again.');
      } else {
        setError('Failed to check status. Please try again.');
      }
      setStatus(null);
    } finally {
      setIsChecking(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (email) {
      checkStatus(email);
    } else {
      setIsLoading(false);
    }
  }, [email]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-semibold text-gray-900">Hub4Estate</span>
          </Link>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Check Registration Status</h1>
          <p className="text-sm text-gray-500">Enter your email to check your dealer registration status</p>
        </div>

        {/* Email Input */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="Enter your registered email"
              value={checkEmail}
              onChange={(e) => setCheckEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && checkStatus(checkEmail)}
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
            />
            <button
              onClick={() => checkStatus(checkEmail)}
              disabled={isChecking}
              className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isChecking ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                'Check'
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        {isLoading && email ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <p className="text-sm text-gray-500">Checking your status...</p>
          </div>
        ) : status ? (
          <div className="space-y-4">
            {/* Status Card */}
            {(() => {
              const cfg = STATUS_CONFIG[status.status] || {
                icon: Clock,
                color: 'text-gray-600',
                bg: 'bg-gray-50',
                border: 'border-gray-200',
                title: 'Unknown Status',
                description: 'Please contact support for more information.',
              };
              const StatusIcon = cfg.icon;

              return (
                <div className={`${cfg.bg} border ${cfg.border} rounded-xl p-6`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${cfg.bg} border ${cfg.border} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <StatusIcon className={`w-6 h-6 ${cfg.color}`} />
                    </div>
                    <div>
                      <h2 className={`text-base font-semibold ${cfg.color}`}>{cfg.title}</h2>
                      <p className="text-sm text-gray-600 mt-1">{cfg.description}</p>
                    </div>
                  </div>

                  {status.verificationNotes && (
                    <div className="mt-5 pt-5 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-500 mb-1">Notes from our team</p>
                      <p className="text-sm text-gray-700">{status.verificationNotes}</p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Details Card */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">Registration Details</p>
              </div>
              <div className="divide-y divide-gray-100">
                {[
                  { label: 'Business Name', value: status.businessName },
                  { label: 'Email', value: status.email },
                  { label: 'Registered On', value: formatDate(status.createdAt) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active CTA */}
            {status.status === 'ACTIVE' && (
              <Link
                to="/dealer/login"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
              >
                Login to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            {/* Pending — what happens next */}
            {status.status === 'PENDING_VERIFICATION' && (
              <div className="bg-gray-900 rounded-xl p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <Clock className="w-4 h-4 text-gray-300" />
                  <span className="text-sm font-medium text-white">What happens next?</span>
                </div>
                <ol className="space-y-2.5">
                  {[
                    'Our team verifies your GST and PAN details',
                    'You receive an email confirmation',
                    'Login and complete your profile',
                    'Start receiving RFQs',
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                      <span className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-xs font-medium text-white flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        ) : !isLoading && !email && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <Shield className="w-10 h-10 text-gray-200 mx-auto mb-4" />
            <p className="text-sm text-gray-500 mb-5">
              Enter your registered email above to check your verification status
            </p>
            <p className="text-xs text-gray-400 mb-1.5">Haven't registered yet?</p>
            <Link
              to="/dealer/onboarding"
              className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
            >
              Register as a Dealer
            </Link>
          </div>
        )}

        {/* Help */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-4">Need help with your registration?</p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <a href="tel:+917690001999" className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors">
              <Phone className="w-3.5 h-3.5" />
              +91 76900 01999
            </a>
            <a href="mailto:support@hub4estate.com" className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors">
              <Mail className="w-3.5 h-3.5" />
              support@hub4estate.com
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
