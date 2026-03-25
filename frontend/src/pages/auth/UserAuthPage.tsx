import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../lib/store';
import { authApi } from '../../lib/api';
import { Button, Input, OTPInput, Alert } from '../../components/ui';
import {
  Zap, Phone, Mail, ArrowRight, ArrowLeft, CheckCircle,
  RefreshCw,
} from 'lucide-react';

type AuthStep = 'method' | 'phone' | 'email' | 'otp' | 'profile' | 'success';
type AuthMode = 'login' | 'signup';

export function UserAuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const initialMode = (searchParams.get('mode') as AuthMode) || 'login';

  const [step, setStep] = useState<AuthStep>('method');
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [authMethod, setAuthMethod] = useState<'phone' | 'email' | null>(null);

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleMethodSelect = (method: 'phone' | 'email' | 'google') => {
    setError('');
    if (method === 'google') {
      const apiUrl = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001/api';
      window.location.href = `${apiUrl}/auth/google`;
      return;
    }
    setAuthMethod(method);
    setStep(method);
  };

  const handleSendOTP = async () => {
    setError('');
    if (authMethod === 'phone' && phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (authMethod === 'email' && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address');
      return;
    }
    setIsLoading(true);
    try {
      const payload = authMethod === 'phone'
        ? { phone: `+91${phone}`, type: mode }
        : { email, type: mode };
      await authApi.sendOTP(payload);
      setStep('otp');
      setResendTimer(30);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }
    setIsLoading(true);
    try {
      const payload = authMethod === 'phone'
        ? { phone: `+91${phone}`, otp, type: mode }
        : { email, otp, type: mode };
      const response = await authApi.verifyOTP(payload);
      if (response.data.requiresProfile) {
        setStep('profile');
      } else if (response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        setAuth(response.data.user, response.data.token);
        setStep('success');
        setTimeout(() => navigate('/dashboard'), 1200);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
      setOtp('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteProfile = async () => {
    setError('');
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        name: name.trim(),
        city: city.trim() || undefined,
        ...(authMethod === 'phone' ? { phone: `+91${phone}` } : { email }),
      };
      const response = await authApi.userSignup(payload);
      if (response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        setAuth(response.data.user, response.data.token);
        setStep('success');
        setTimeout(() => navigate('/dashboard'), 1200);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setOtp('');
    await handleSendOTP();
  };

  const handleBack = () => {
    setError('');
    setOtp('');
    if (step === 'otp') setStep(authMethod || 'method');
    else if (step === 'phone' || step === 'email') { setStep('method'); setAuthMethod(null); }
    else if (step === 'profile') setStep('otp');
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
  };

  const progressWidth =
    step === 'phone' || step === 'email' ? '33%' :
    step === 'otp' ? '66%' :
    step === 'profile' ? '100%' : '0%';

  return (
    <div className="min-h-screen bg-white flex">

      {/* Left — Brand Panel */}
      <div className="hidden lg:flex lg:w-[440px] bg-gray-950 flex-col justify-between p-12 flex-shrink-0">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-orange-500 flex items-center justify-center rounded-lg">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-semibold text-white">Hub4Estate</span>
        </Link>

        <div className="space-y-10">
          <div>
            <h1 className="text-3xl font-semibold text-white leading-snug">
              {mode === 'signup'
                ? 'Get the best price on every electrical purchase.'
                : 'Welcome back.'}
            </h1>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">
              Verified dealers, zero middlemen, full price transparency — starting with electricals.
            </p>
          </div>

          {/* Real deal examples */}
          <div className="space-y-3">
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Real savings</p>
            {[
              { product: 'Sony Tower Speaker + 2 mics', market: '₹1,05,000', found: '₹68,000' },
              { product: 'Philips 15W LED × 200', market: '₹585/pc', found: '₹465/pc' },
              { product: 'FRLS 2.5mm² cable × 200m', market: '₹127/m', found: '₹83/m' },
            ].map((deal, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-800">
                <div>
                  <p className="text-sm text-gray-200">{deal.product}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-through">{deal.market}</p>
                </div>
                <p className="text-sm font-semibold text-green-400 ml-4">{deal.found}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-600">hub4estate.com · Bengaluru, India</p>
      </div>

      {/* Right — Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 bg-gray-900 flex items-center justify-center rounded-lg">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900">Hub4Estate</span>
          </div>

          {/* Progress bar */}
          {step !== 'method' && step !== 'success' && (
            <div className="h-0.5 bg-gray-100 rounded-full mb-8 overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-500"
                style={{ width: progressWidth }}
              />
            </div>
          )}

          {/* Back */}
          {step !== 'method' && step !== 'success' && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          )}

          {/* Error */}
          {error && (
            <Alert variant="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* ── Method selection ── */}
          {step === 'method' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {mode === 'signup' ? 'Create your account' : 'Sign in'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {mode === 'signup'
                    ? 'Get quotes from verified electrical dealers'
                    : 'Continue to your dashboard'
                  }
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleMethodSelect('phone')}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all group text-left"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <Phone className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Continue with Phone</p>
                    <p className="text-xs text-gray-400">OTP via SMS</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  onClick={() => handleMethodSelect('email')}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all group text-left"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <Mail className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Continue with Email</p>
                    <p className="text-xs text-gray-400">OTP via email</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-white text-gray-400">or</span>
                  </div>
                </div>

                <button
                  onClick={() => handleMethodSelect('google')}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all"
                >
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Continue with Google</span>
                </button>
              </div>

              <p className="text-sm text-gray-500 text-center">
                {mode === 'signup' ? (
                  <>
                    Already have an account?{' '}
                    <button onClick={toggleMode} className="font-medium text-gray-900 hover:text-orange-600 transition-colors">
                      Sign in
                    </button>
                  </>
                ) : (
                  <>
                    Don&apos;t have an account?{' '}
                    <button onClick={toggleMode} className="font-medium text-gray-900 hover:text-orange-600 transition-colors">
                      Sign up
                    </button>
                  </>
                )}
              </p>
            </div>
          )}

          {/* ── Phone input ── */}
          {step === 'phone' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Your mobile number</h2>
                <p className="text-sm text-gray-500 mt-1">We'll send a 6-digit OTP to verify</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Number</label>
                <div className="flex">
                  <div className="flex items-center px-3 border border-r-0 border-gray-200 bg-gray-50 rounded-l-lg text-sm text-gray-600 font-medium">
                    +91
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit number"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-r-lg focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 text-sm transition-all"
                    autoFocus
                  />
                </div>
              </div>

              <Button
                onClick={handleSendOTP}
                isLoading={isLoading}
                disabled={phone.length !== 10}
                className="w-full"
                size="lg"
              >
                Send OTP
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* ── Email input ── */}
          {step === 'email' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Your email address</h2>
                <p className="text-sm text-gray-500 mt-1">We'll send a 6-digit OTP to verify</p>
              </div>

              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                label="Email Address"
                autoFocus
              />

              <Button
                onClick={handleSendOTP}
                isLoading={isLoading}
                disabled={!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)}
                className="w-full"
                size="lg"
              >
                Send OTP
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* ── OTP verification ── */}
          {step === 'otp' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Enter the code</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Sent to{' '}
                  <span className="font-medium text-gray-700">
                    {authMethod === 'phone' ? `+91 ${phone}` : email}
                  </span>
                </p>
              </div>

              <OTPInput value={otp} onChange={setOtp} error={!!error} />

              <Button
                onClick={handleVerifyOTP}
                isLoading={isLoading}
                disabled={otp.length !== 6}
                className="w-full"
                size="lg"
              >
                Verify & continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-sm text-gray-400">
                    Resend in <span className="font-medium text-gray-700">{resendTimer}s</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResendOTP}
                    className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1.5 mx-auto transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Profile completion ── */}
          {step === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Almost there</h2>
                <p className="text-sm text-gray-500 mt-1">Just a few details to set up your account</p>
              </div>

              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                label="Name"
                required
                autoFocus
              />

              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai, Delhi, Bangalore"
                label="City (optional)"
                helper="Helps us find dealers near you"
              />

              <Button
                onClick={handleCompleteProfile}
                isLoading={isLoading}
                disabled={!name.trim()}
                className="w-full"
                size="lg"
              >
                Create account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* ── Success ── */}
          {step === 'success' && (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {mode === 'signup' ? 'Account created!' : 'Welcome back!'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">Redirecting to your dashboard...</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 space-y-2 text-center">
            <p className="text-xs text-gray-400">
              Are you a dealer?{' '}
              <Link to="/dealer/login" className="font-medium text-gray-600 hover:text-gray-900">
                Dealer login
              </Link>
            </p>
            <p className="text-xs text-gray-400">
              By continuing you agree to our{' '}
              <Link to="/terms" className="underline hover:text-gray-600">Terms</Link>
              {' '}and{' '}
              <Link to="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
