import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../lib/store';
import { authApi } from '../../lib/api';
import { Button, Input, OTPInput, Alert } from '../../components/ui';
import {
  Zap, Phone, Mail, ArrowRight, ArrowLeft, CheckCircle,
  Shield, Users, Clock, Sparkles, RefreshCw
} from 'lucide-react';

type AuthStep = 'method' | 'phone' | 'email' | 'otp' | 'profile' | 'success';
type AuthMode = 'login' | 'signup';

export function UserAuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth, isAuthenticated } = useAuthStore();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Determine initial mode from URL
  const initialMode = (searchParams.get('mode') as AuthMode) || 'login';

  const [step, setStep] = useState<AuthStep>('method');
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [authMethod, setAuthMethod] = useState<'phone' | 'email' | null>(null);

  // Form data
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleMethodSelect = (method: 'phone' | 'email' | 'google') => {
    setError('');
    if (method === 'google') {
      // Redirect to Google OAuth - construct URL based on current environment
      // In development: use localhost:3001, in production: use same origin or configured API URL
      const apiUrl = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001/api';
      window.location.href = `${apiUrl}/auth/google`;
      return;
    }
    setAuthMethod(method);
    setStep(method);
  };

  const handleSendOTP = async () => {
    setError('');

    // Validation
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
      const message = err.response?.data?.error || 'Failed to send OTP. Please try again.';
      setError(message);
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
        // New user - needs to complete profile
        setStep('profile');
      } else if (response.data.token && response.data.user) {
        // Existing user - login successful
        localStorage.setItem('token', response.data.token);
        setAuth(response.data.user, response.data.token);
        setStep('success');
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (err: any) {
      const message = err.response?.data?.error || 'Invalid OTP. Please try again.';
      setError(message);
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
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to create account. Please try again.';
      setError(message);
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
    if (step === 'otp') {
      setStep(authMethod || 'method');
    } else if (step === 'phone' || step === 'email') {
      setStep('method');
      setAuthMethod(null);
    } else if (step === 'profile') {
      setStep('otp');
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
  };

  // Benefits shown on the left side
  const benefits = [
    { icon: Shield, text: '500+ Verified Dealers' },
    { icon: Users, text: 'Compare Multiple Quotes' },
    { icon: Zap, text: 'Save 15-25% on Orders' },
    { icon: Clock, text: 'Get Quotes in 24 Hours' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Left Side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-neutral-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 border-2 border-white/10 rotate-12 animate-float" />
          <div className="absolute bottom-32 right-16 w-48 h-48 border-2 border-accent-500/20 -rotate-12 animate-float-delayed" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-accent-500/10 rotate-45 animate-pulse-slow" />
          <div className="absolute bottom-20 left-20 w-24 h-24 border-2 border-white/5 animate-spin-slow" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center space-x-3 group">
            <div className="w-14 h-14 bg-white flex items-center justify-center group-hover:bg-accent-500 transition-colors">
              <Zap className="w-7 h-7 text-neutral-900 group-hover:text-white transition-colors" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">Hub4Estate</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="relative z-10 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500 text-white text-sm font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-4 h-4" />
              {mode === 'signup' ? 'Join Free' : 'Welcome Back'}
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
              {mode === 'signup' ? (
                <>
                  Buy Electrical.<br />
                  <span className="text-accent-400">Save Money.</span>
                </>
              ) : (
                <>
                  Good to See<br />
                  <span className="text-accent-400">You Again.</span>
                </>
              )}
            </h1>
            <p className="mt-6 text-lg text-neutral-300 max-w-md font-medium leading-relaxed">
              {mode === 'signup'
                ? 'Get competitive quotes from 500+ verified electrical dealers. Compare prices and save up to 25% on your orders.'
                : 'Access your dashboard, track quotes, and manage your electrical procurement seamlessly.'
              }
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-2 gap-4">
            {benefits.map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-neutral-400 text-sm">
            India's #1 marketplace for electrical products
          </p>
        </div>

        {/* CSS for animations */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(12deg); }
            50% { transform: translateY(-20px) rotate(15deg); }
          }
          @keyframes float-delayed {
            0%, 100% { transform: translateY(0) rotate(-12deg); }
            50% { transform: translateY(-15px) rotate(-8deg); }
          }
          .animate-float { animation: float 6s ease-in-out infinite; }
          .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
          .animate-spin-slow { animation: spin 20s linear infinite; }
        `}</style>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-3">
              <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-neutral-900">Hub4Estate</span>
            </Link>
          </div>

          {/* Auth Card */}
          <div className="bg-white border-2 border-neutral-200 shadow-lg">
            {/* Progress indicator for multi-step */}
            {step !== 'method' && step !== 'success' && (
              <div className="h-1 bg-neutral-100">
                <div
                  className="h-full bg-accent-500 transition-all duration-300"
                  style={{
                    width: step === 'phone' || step === 'email' ? '33%'
                      : step === 'otp' ? '66%'
                      : '100%'
                  }}
                />
              </div>
            )}

            <div className="p-8">
              {/* Back button */}
              {step !== 'method' && step !== 'success' && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 mb-6 text-sm font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}

              {/* Error Alert */}
              {error && (
                <Alert variant="error" onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {/* STEP: Method Selection */}
              {step === 'method' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-black text-neutral-900">
                      {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
                    </h2>
                    <p className="text-neutral-500 mt-2">
                      {mode === 'signup'
                        ? 'Sign up to get quotes from verified dealers'
                        : 'Sign in to continue to your dashboard'
                      }
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Phone Option */}
                    <button
                      onClick={() => handleMethodSelect('phone')}
                      className="w-full flex items-center gap-4 p-4 border-2 border-neutral-200 hover:border-neutral-900 hover:shadow-brutal transition-all group"
                    >
                      <div className="w-12 h-12 bg-neutral-100 group-hover:bg-neutral-900 flex items-center justify-center transition-colors">
                        <Phone className="w-6 h-6 text-neutral-600 group-hover:text-white transition-colors" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-bold text-neutral-900">Continue with Phone</p>
                        <p className="text-sm text-neutral-500">We'll send you an OTP</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-1 transition-all" />
                    </button>

                    {/* Email Option */}
                    <button
                      onClick={() => handleMethodSelect('email')}
                      className="w-full flex items-center gap-4 p-4 border-2 border-neutral-200 hover:border-neutral-900 hover:shadow-brutal transition-all group"
                    >
                      <div className="w-12 h-12 bg-neutral-100 group-hover:bg-neutral-900 flex items-center justify-center transition-colors">
                        <Mail className="w-6 h-6 text-neutral-600 group-hover:text-white transition-colors" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-bold text-neutral-900">Continue with Email</p>
                        <p className="text-sm text-neutral-500">We'll send you an OTP</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-1 transition-all" />
                    </button>

                    {/* Divider */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t-2 border-neutral-200" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-neutral-500 font-bold uppercase tracking-wider">or</span>
                      </div>
                    </div>

                    {/* Google Option */}
                    <button
                      onClick={() => handleMethodSelect('google')}
                      className="w-full flex items-center justify-center gap-3 p-4 border-2 border-neutral-200 hover:border-neutral-900 hover:shadow-brutal transition-all"
                    >
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span className="font-bold text-neutral-700">Continue with Google</span>
                    </button>
                  </div>

                  {/* Toggle Login/Signup */}
                  <p className="text-center text-sm text-neutral-500 pt-4 border-t-2 border-neutral-100">
                    {mode === 'signup' ? (
                      <>
                        Already have an account?{' '}
                        <button onClick={toggleMode} className="font-bold text-neutral-900 hover:text-accent-600">
                          Sign In
                        </button>
                      </>
                    ) : (
                      <>
                        Don't have an account?{' '}
                        <button onClick={toggleMode} className="font-bold text-neutral-900 hover:text-accent-600">
                          Sign Up
                        </button>
                      </>
                    )}
                  </p>
                </div>
              )}

              {/* STEP: Phone Input */}
              {step === 'phone' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-neutral-900 flex items-center justify-center mx-auto mb-4">
                      <Phone className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-neutral-900">Enter Phone Number</h2>
                    <p className="text-neutral-500 mt-2">We'll send a 6-digit OTP to verify</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-neutral-900 mb-2 uppercase tracking-wide">
                      Mobile Number
                    </label>
                    <div className="flex">
                      <div className="flex items-center px-4 border-2 border-r-0 border-neutral-300 bg-neutral-100 text-neutral-600 font-bold">
                        +91
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="Enter 10-digit number"
                        className="flex-1 px-4 py-4 border-2 border-neutral-300 focus:border-neutral-900 focus:outline-none text-lg font-medium tracking-wider"
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
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              )}

              {/* STEP: Email Input */}
              {step === 'email' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-neutral-900 flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-neutral-900">Enter Email Address</h2>
                    <p className="text-neutral-500 mt-2">We'll send a 6-digit OTP to verify</p>
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
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              )}

              {/* STEP: OTP Verification */}
              {step === 'otp' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-neutral-900">Verify OTP</h2>
                    <p className="text-neutral-500 mt-2">
                      Enter the 6-digit code sent to
                      <br />
                      <span className="font-bold text-neutral-900">
                        {authMethod === 'phone' ? `+91 ${phone}` : email}
                      </span>
                    </p>
                  </div>

                  <OTPInput
                    value={otp}
                    onChange={setOtp}
                    error={!!error}
                  />

                  <Button
                    onClick={handleVerifyOTP}
                    isLoading={isLoading}
                    disabled={otp.length !== 6}
                    className="w-full"
                    size="lg"
                  >
                    Verify & Continue
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                  {/* Resend OTP */}
                  <div className="text-center">
                    {resendTimer > 0 ? (
                      <p className="text-sm text-neutral-500">
                        Resend OTP in <span className="font-bold text-neutral-900">{resendTimer}s</span>
                      </p>
                    ) : (
                      <button
                        onClick={handleResendOTP}
                        className="text-sm font-bold text-accent-600 hover:text-accent-700 flex items-center gap-2 mx-auto"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* STEP: Profile Completion (Signup only) */}
              {step === 'profile' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-accent-500 flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-neutral-900">Almost Done!</h2>
                    <p className="text-neutral-500 mt-2">Tell us a bit about yourself</p>
                  </div>

                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    label="Your Name"
                    required
                    autoFocus
                  />

                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g., Mumbai, Delhi, Bangalore"
                    label="City (Optional)"
                    helper="Helps us connect you with local dealers"
                  />

                  <Button
                    onClick={handleCompleteProfile}
                    isLoading={isLoading}
                    disabled={!name.trim()}
                    className="w-full"
                    size="lg"
                  >
                    Create Account
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              )}

              {/* STEP: Success */}
              {step === 'success' && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-500 flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-neutral-900 mb-2">
                    {mode === 'signup' ? 'Welcome Aboard!' : 'Welcome Back!'}
                  </h2>
                  <p className="text-neutral-500">
                    Redirecting to your dashboard...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center text-sm text-neutral-500">
            <p className="mb-3">
              Are you a dealer?{' '}
              <Link to="/dealer/login" className="font-bold text-neutral-900 hover:text-accent-600">
                Dealer Login
              </Link>
            </p>
            <p>
              By continuing, you agree to our{' '}
              <Link to="/terms" className="font-bold hover:text-accent-600">Terms</Link>
              {' '}and{' '}
              <Link to="/privacy" className="font-bold hover:text-accent-600">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
