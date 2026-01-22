import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { LoadingSpinner, Alert } from '../../components/ui';
import {
  CheckCircle, Clock, XCircle, ArrowRight, Mail, Phone,
  RefreshCw, AlertTriangle, Shield, Zap
} from 'lucide-react';

interface RegistrationStatus {
  id: string;
  businessName: string;
  email: string;
  status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';
  createdAt: string;
  verificationNotes?: string;
}

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

  const getStatusDisplay = (statusValue: string) => {
    switch (statusValue) {
      case 'PENDING_VERIFICATION':
        return {
          icon: Clock,
          color: 'text-amber-600',
          bgColor: 'bg-amber-100',
          borderColor: 'border-amber-200',
          title: 'Pending Verification',
          description: 'Our team is reviewing your documents. This usually takes 24-48 hours.',
        };
      case 'ACTIVE':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
          title: 'Verified & Active',
          description: 'Your account is active! You can now log in and start receiving RFQs.',
        };
      case 'REJECTED':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
          title: 'Verification Failed',
          description: 'Unfortunately, we could not verify your documents. Please contact support.',
        };
      case 'SUSPENDED':
        return {
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
          title: 'Account Suspended',
          description: 'Your account has been suspended. Please contact support for assistance.',
        };
      default:
        return {
          icon: Clock,
          color: 'text-neutral-600',
          bgColor: 'bg-neutral-100',
          borderColor: 'border-neutral-200',
          title: 'Unknown Status',
          description: 'Please contact support for more information.',
        };
    }
  };

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
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-neutral-200">
        <div className="container-custom py-4">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-neutral-900 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-neutral-900 tracking-tight">
              Hub4Estate
            </span>
          </Link>
        </div>
      </header>

      <main className="container-custom py-12">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-neutral-900 mb-2">
              Check Registration Status
            </h1>
            <p className="text-neutral-600">
              Enter your email to check your dealer registration status
            </p>
          </div>

          {/* Email Input */}
          <div className="bg-white border-2 border-neutral-200 p-6 mb-6">
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your registered email"
                value={checkEmail}
                onChange={(e) => setCheckEmail(e.target.value)}
                className="flex-1 border-2 border-neutral-200 px-4 py-3 focus:border-neutral-900 focus:outline-none"
              />
              <button
                onClick={() => checkStatus(checkEmail)}
                disabled={isChecking}
                className="btn-primary px-6"
              >
                {isChecking ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  'Check'
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6">
              <Alert variant="error">
                {error}
              </Alert>
            </div>
          )}

          {isLoading && email ? (
            <div className="text-center py-12">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-neutral-600">Checking your status...</p>
            </div>
          ) : status ? (
            <div className="space-y-6">
              {/* Status Card */}
              {(() => {
                const statusDisplay = getStatusDisplay(status.status);
                const StatusIcon = statusDisplay.icon;

                return (
                  <div className={`border-2 ${statusDisplay.borderColor} ${statusDisplay.bgColor} p-8`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-16 h-16 ${statusDisplay.bgColor} border-2 ${statusDisplay.borderColor} flex items-center justify-center flex-shrink-0`}>
                        <StatusIcon className={`w-8 h-8 ${statusDisplay.color}`} />
                      </div>
                      <div>
                        <h2 className={`text-2xl font-bold ${statusDisplay.color}`}>
                          {statusDisplay.title}
                        </h2>
                        <p className="text-neutral-600 mt-1">
                          {statusDisplay.description}
                        </p>
                      </div>
                    </div>

                    {status.verificationNotes && (
                      <div className="mt-6 pt-6 border-t border-neutral-200">
                        <p className="text-sm font-bold text-neutral-700 mb-1">Notes from our team:</p>
                        <p className="text-neutral-600">{status.verificationNotes}</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Details Card */}
              <div className="bg-white border-2 border-neutral-200 p-6">
                <h3 className="font-bold text-neutral-900 mb-4">Registration Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Business Name</span>
                    <span className="font-bold text-neutral-900">{status.businessName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Email</span>
                    <span className="font-bold text-neutral-900">{status.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Registered On</span>
                    <span className="font-bold text-neutral-900">{formatDate(status.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {status.status === 'ACTIVE' && (
                <Link to="/dealer/login" className="btn-urgent w-full justify-center">
                  Login to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              )}

              {status.status === 'PENDING_VERIFICATION' && (
                <div className="bg-neutral-900 text-white p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-6 h-6 text-accent-400" />
                    <span className="font-bold">What happens next?</span>
                  </div>
                  <ul className="space-y-3 text-sm text-neutral-300">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-accent-500 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                      Our team verifies your GST and PAN details
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-accent-500 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                      You receive an email confirmation
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-accent-500 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                      Login and complete your profile
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-accent-500 flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                      Start receiving RFQs!
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : !isLoading && !email && (
            <div className="bg-white border-2 border-neutral-200 p-8 text-center">
              <Shield className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-600 mb-6">
                Enter your registered email above to check your verification status
              </p>
              <div className="text-sm text-neutral-500">
                <p className="mb-2">Haven't registered yet?</p>
                <Link to="/dealer/onboarding" className="font-bold text-neutral-900 hover:text-accent-600">
                  Register as a Dealer
                </Link>
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-8 text-center">
            <p className="text-neutral-600 mb-4">Need help with your registration?</p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <a href="tel:+917690001999" className="flex items-center gap-2 text-neutral-700 hover:text-neutral-900">
                <Phone className="w-4 h-4" />
                +91 76900 01999
              </a>
              <a href="mailto:support@hub4estate.com" className="flex items-center gap-2 text-neutral-700 hover:text-neutral-900">
                <Mail className="w-4 h-4" />
                support@hub4estate.com
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
