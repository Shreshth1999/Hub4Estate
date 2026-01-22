import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../lib/api';
import { useAuthStore } from '../../lib/store';
import { Button, Input, Alert } from '../../components/ui';
import {
  Store, Shield, Eye, EyeOff, Zap, ArrowRight, ArrowLeft,
  TrendingUp, Users, FileText, Award, Sparkles, CheckCircle
} from 'lucide-react';

type LoginType = 'dealer' | 'admin';

export function DealerLoginPage() {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated, user } = useAuthStore();
  const [loginType, setLoginType] = useState<LoginType>('dealer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.type === 'dealer') {
        navigate('/dealer');
      } else if (user.type === 'admin') {
        navigate('/admin');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let response;
      if (loginType === 'admin') {
        response = await authApi.adminLogin({ email, password });
        const { token, admin } = response.data;
        localStorage.setItem('token', token);
        setAuth({
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          city: '',
          type: 'admin',
        }, token);
        setSuccess(true);
        setTimeout(() => navigate('/admin'), 1500);
      } else {
        response = await authApi.dealerLogin({ email, password });
        const { token, dealer } = response.data;
        localStorage.setItem('token', token);
        setAuth({
          id: dealer.id,
          email: dealer.email,
          name: dealer.businessName,
          role: 'dealer',
          city: dealer.city || '',
          type: 'dealer',
        }, token);
        setSuccess(true);
        setTimeout(() => navigate('/dealer'), 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Benefits shown on the left side
  const dealerBenefits = [
    { icon: FileText, text: 'Access to Quality RFQs' },
    { icon: TrendingUp, text: 'Grow Your Business' },
    { icon: Users, text: 'Connect with Buyers' },
    { icon: Award, text: 'Build Your Reputation' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Left Side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-neutral-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 border-2 border-accent-500/20 rotate-12 animate-float" />
          <div className="absolute bottom-32 right-16 w-48 h-48 border-2 border-white/10 -rotate-12 animate-float-delayed" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-accent-500/10 rotate-45 animate-pulse-slow" />
          <div className="absolute bottom-20 left-20 w-24 h-24 border-2 border-accent-500/10 animate-spin-slow" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center space-x-3 group">
            <div className="w-14 h-14 bg-accent-500 flex items-center justify-center group-hover:bg-white transition-colors">
              <Zap className="w-7 h-7 text-white group-hover:text-neutral-900 transition-colors" />
            </div>
            <div>
              <span className="text-2xl font-black text-white tracking-tight block">Hub4Estate</span>
              <span className="text-xs font-bold text-accent-400 uppercase tracking-wider">Dealer Portal</span>
            </div>
          </Link>
        </div>

        {/* Main Content */}
        <div className="relative z-10 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500 text-white text-sm font-bold uppercase tracking-wider mb-6">
              <Store className="w-4 h-4" />
              Dealer Access
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
              Grow Your<br />
              <span className="text-accent-400">Business Today.</span>
            </h1>
            <p className="mt-6 text-lg text-neutral-300 max-w-md font-medium leading-relaxed">
              Access quality RFQs, submit competitive quotes, and connect with verified buyers across India.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-2 gap-4">
            {dealerBenefits.map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 bg-accent-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-accent-400" />
                </div>
                <span className="text-sm font-bold">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-neutral-400 text-sm">
            Trusted by 500+ dealers across India
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

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-3">
              <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-black text-neutral-900 block">Hub4Estate</span>
                <span className="text-xs font-bold text-accent-500 uppercase tracking-wider">Dealer Portal</span>
              </div>
            </Link>
          </div>

          {/* Login Card */}
          <div className="bg-white border-2 border-neutral-200 shadow-lg">
            <div className="p-8">
              {/* Success State */}
              {success ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-500 flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-neutral-900 mb-2">Welcome Back!</h2>
                  <p className="text-neutral-500">
                    Redirecting to your {loginType === 'admin' ? 'admin panel' : 'dashboard'}...
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-neutral-900">
                      {loginType === 'admin' ? 'Admin Login' : 'Dealer Login'}
                    </h2>
                    <p className="text-neutral-500 mt-2">
                      Sign in to access your {loginType === 'admin' ? 'admin panel' : 'dealer dashboard'}
                    </p>
                  </div>

                  {/* Toggle */}
                  <div className="flex bg-neutral-100 border-2 border-neutral-200 p-1 mb-6">
                    <button
                      onClick={() => { setLoginType('dealer'); setError(''); }}
                      className={`flex-1 flex items-center justify-center space-x-2 py-3 font-bold transition-all ${
                        loginType === 'dealer'
                          ? 'bg-neutral-900 text-white'
                          : 'text-neutral-500 hover:text-neutral-700'
                      }`}
                    >
                      <Store className="w-4 h-4" />
                      <span>Dealer</span>
                    </button>
                    <button
                      onClick={() => { setLoginType('admin'); setError(''); }}
                      className={`flex-1 flex items-center justify-center space-x-2 py-3 font-bold transition-all ${
                        loginType === 'admin'
                          ? 'bg-neutral-900 text-white'
                          : 'text-neutral-500 hover:text-neutral-700'
                      }`}
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin</span>
                    </button>
                  </div>

                  {error && (
                    <div className="mb-6">
                      <Alert variant="error" onClose={() => setError('')}>
                        {error}
                      </Alert>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                      type="email"
                      label="Email Address"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />

                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        label="Password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-10 text-neutral-500 hover:text-neutral-700"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    {loginType === 'dealer' && (
                      <div className="text-right">
                        <button
                          type="button"
                          className="text-sm font-bold text-accent-600 hover:text-accent-700"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    )}

                    <Button
                      type="submit"
                      isLoading={isLoading}
                      className="w-full"
                      size="lg"
                    >
                      Sign In
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </form>

                  {/* Demo Credentials */}
                  {loginType === 'admin' && (
                    <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200">
                      <p className="text-sm font-bold text-blue-900 mb-2">Demo Admin Credentials:</p>
                      <p className="text-sm text-blue-700 font-medium">Email: admin@hub4estate.com</p>
                      <p className="text-sm text-blue-700 font-medium">Password: admin123</p>
                    </div>
                  )}

                  {loginType === 'dealer' && (
                    <div className="mt-6 pt-6 border-t-2 border-neutral-100">
                      <div className="text-center">
                        <p className="text-neutral-600 font-medium mb-4">
                          Don't have an account?
                        </p>
                        <Link
                          to="/dealer/onboarding"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-100 hover:bg-neutral-200 font-bold text-neutral-900 transition-colors"
                        >
                          <Sparkles className="w-5 h-5" />
                          Register as Dealer
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center text-sm text-neutral-500">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 font-medium hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Buyer Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
