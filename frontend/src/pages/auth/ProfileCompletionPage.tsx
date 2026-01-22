import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../lib/store';
import { authApi } from '../../lib/api';
import { Button, Input, LoadingSpinner } from '../../components/ui';
import { Zap, CheckCircle, Phone, MapPin } from 'lucide-react';

const POPULAR_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
];

export function ProfileCompletionPage() {
  const navigate = useNavigate();
  const { user, setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(user);

  const [formData, setFormData] = useState({
    phone: '',
    city: '',
  });

  // Check authentication and load user data
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        // No token - redirect to login
        navigate('/login', { replace: true });
        return;
      }

      // If we already have user data from store, use it
      if (user) {
        setCurrentUser(user);
        setIsCheckingAuth(false);

        // If profile is already complete, redirect to dashboard
        if (user.city && user.city !== 'Not Set') {
          navigate('/dashboard', { replace: true });
        }
        return;
      }

      // Otherwise, fetch user data from API
      try {
        const response = await authApi.getMe();
        const serverUser = response.data.user;

        const userData = {
          id: serverUser.id,
          email: serverUser.email,
          name: serverUser.name || '',
          role: serverUser.role || '',
          city: serverUser.city || '',
          type: serverUser.type,
        };

        setCurrentUser(userData);

        // If profile is already complete, redirect to dashboard
        if (serverUser.city && serverUser.city !== 'Not Set') {
          setAuth(userData, token);
          navigate('/dashboard', { replace: true });
          return;
        }
      } catch (err) {
        console.error('Failed to verify auth:', err);
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
        return;
      }

      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [user, navigate, setAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.phone || formData.phone.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    if (!formData.city.trim()) {
      setError('Please select or enter your city');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authApi.completeProfile({
        phone: formData.phone,
        city: formData.city,
      });

      // Update auth state with complete profile and new token
      const newToken = response.data.token;
      if (newToken && response.data.user) {
        localStorage.setItem('token', newToken);
        setAuth(response.data.user, newToken);
      }

      // Redirect to user dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to complete profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-neutral-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3">
            <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-neutral-900">Hub4Estate</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white border-2 border-neutral-200 p-8">
          {/* Welcome */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-black text-neutral-900">
              Welcome, {currentUser?.name?.split(' ')[0] || 'there'}!
            </h1>
            <p className="text-neutral-500 mt-2">
              Just two quick details to get started
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Number */}
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-2 uppercase tracking-wide">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
              </label>
              <Input
                type="tel"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  phone: e.target.value.replace(/\D/g, '').slice(0, 10)
                }))}
              />
              <p className="text-xs text-neutral-500 mt-1">
                For order updates and dealer communication
              </p>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-2 uppercase tracking-wide">
                <MapPin className="w-4 h-4 inline mr-2" />
                City
              </label>

              {/* Quick City Selection */}
              <div className="flex flex-wrap gap-2 mb-3">
                {POPULAR_CITIES.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, city }))}
                    className={`px-3 py-1.5 text-sm font-medium border-2 transition-colors ${
                      formData.city === city
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>

              <Input
                placeholder="Or type your city"
                value={!POPULAR_CITIES.includes(formData.city) ? formData.city : ''}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              size="lg"
            >
              Start Exploring
            </Button>
          </form>

          {/* Skip Option */}
          <p className="text-center text-sm text-neutral-500 mt-6">
            You can always update this later in settings
          </p>
        </div>

        {/* What you get */}
        <div className="mt-6 p-4 bg-neutral-900 text-white">
          <p className="text-sm font-bold mb-3">With your account, you can:</p>
          <ul className="space-y-2 text-sm text-neutral-300">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Get quotes from 500+ verified dealers
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Compare prices and save 15-25%
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Track orders and communicate with dealers
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
