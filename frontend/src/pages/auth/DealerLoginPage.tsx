import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../lib/api';
import { useAuthStore } from '../../lib/store';
import { Button, Input, Alert } from '../../components/ui';
import { Zap, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';

export function DealerLoginPage() {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated, user } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.type === 'dealer') navigate('/dealer');
      else if (user.type === 'admin') navigate('/admin');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await authApi.dealerLogin({ email, password });
      const { token, dealer } = response.data;
      setAuth({
        id: dealer.id,
        email: dealer.email,
        name: dealer.businessName,
        role: 'dealer',
        city: dealer.city || '',
        type: 'dealer',
      }, token);
      setSuccess(true);
      setTimeout(() => navigate('/dealer'), 1200);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">

      {/* Left — Brand Panel */}
      <div className="hidden lg:flex lg:w-[440px] bg-gray-950 flex-col justify-between p-12 flex-shrink-0">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-amber-600 flex items-center justify-center rounded-lg">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-base font-semibold text-white block leading-tight">Hub4Estate</span>
            <span className="text-[10px] text-amber-500 font-medium">Dealer Portal</span>
          </div>
        </Link>

        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-semibold text-white leading-snug">
              Grow your business with qualified leads.
            </h1>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">
              Access quality RFQs, submit competitive quotes, and connect with verified buyers across India.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">What dealers get</p>
            {[
              'Verified buyer RFQs in your city',
              'Direct quoting — no middlemen',
              'Build reputation through completed orders',
              'Insights on win rate and pricing',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-600 flex-shrink-0" />
                <p className="text-sm text-gray-300">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-600">hub4estate.com · Bengaluru, India</p>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 bg-gray-900 flex items-center justify-center rounded-lg">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-900 block leading-tight">Hub4Estate</span>
              <span className="text-[10px] text-amber-600 font-medium">Dealer Portal</span>
            </div>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Welcome back!</h2>
              <p className="text-sm text-gray-500 mt-1">Redirecting to your dashboard...</p>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <h2 className="text-xl font-semibold text-gray-900">Dealer sign in</h2>
                <p className="text-sm text-gray-500 mt-1">Access your dealer dashboard</p>
              </div>

              {error && (
                <div className="mb-5">
                  <Alert variant="error" onClose={() => setError('')}>
                    {error}
                  </Alert>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  label="Email Address"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
                  Sign in
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3 text-center">
                <p className="text-sm text-gray-500">
                  Don&apos;t have an account?{' '}
                  <Link
                    to="/dealer/onboarding"
                    className="font-medium text-gray-900 hover:text-amber-700 transition-colors"
                  >
                    Register as dealer
                  </Link>
                </p>
              </div>
            </>
          )}

          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to buyer login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
