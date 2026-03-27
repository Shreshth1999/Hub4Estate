import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../lib/store';
import { authApi } from '../../lib/api';
import { Zap, CheckCircle, Phone, MapPin, Loader2 } from 'lucide-react';

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

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      if (user) {
        setCurrentUser(user);
        setIsCheckingAuth(false);
        if (user.city && user.city !== 'Not Set') {
          navigate('/dashboard', { replace: true });
        }
        return;
      }

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

    if (formData.phone && formData.phone.length > 0 && formData.phone.length < 10) {
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
      const profileData: { city: string; phone?: string } = { city: formData.city };
      if (formData.phone && formData.phone.length === 10) {
        profileData.phone = formData.phone;
      }

      const response = await authApi.completeProfile(profileData);

      const newToken = response.data.token;
      if (newToken && response.data.user) {
        localStorage.setItem('token', newToken);
        setAuth(response.data.user, newToken);
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to complete profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center">
              <Zap className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">Hub4Estate</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          {/* Welcome */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-green-500" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              Welcome, {currentUser?.name?.split(' ')[0] || 'there'}!
            </h1>
            <p className="text-sm text-gray-500 mt-1">Just two quick details to get started</p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Number */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-3.5 h-3.5" />
                Phone Number
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  phone: e.target.value.replace(/\D/g, '').slice(0, 10)
                }))}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-1.5">For order updates and dealer communication</p>
            </div>

            {/* City */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-3.5 h-3.5" />
                City
              </label>

              {/* Quick City Selection */}
              <div className="flex flex-wrap gap-2 mb-3">
                {POPULAR_CITIES.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, city }))}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      formData.city === city
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>

              <input
                placeholder="Or type your city"
                value={!POPULAR_CITIES.includes(formData.city) ? formData.city : ''}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Start Exploring
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-5">
            You can always update this later in settings
          </p>
        </div>

        {/* Benefits */}
        <div className="mt-4 bg-gray-900 rounded-2xl p-5">
          <p className="text-xs font-medium text-gray-300 mb-3">With your account, you can:</p>
          <ul className="space-y-2">
            {[
              'Get quotes from 500+ verified dealers',
              'Compare prices and save 15–25%',
              'Track orders and communicate with dealers',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
