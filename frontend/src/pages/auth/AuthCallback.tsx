import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../lib/store';
import { authApi } from '../../lib/api';
import { LoadingSpinner } from '../../components/ui';

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      console.log('[Auth Callback] Starting callback handler');
      console.log('[Auth Callback] URL:', window.location.href);

      // Get token from URL
      const token = searchParams.get('token');
      const errorParam = searchParams.get('error');

      console.log('[Auth Callback] Token present:', !!token);
      console.log('[Auth Callback] Error param:', errorParam);

      if (errorParam) {
        // Decode the error message from the backend
        const decodedError = decodeURIComponent(errorParam);
        console.error('[Auth Callback] Error from backend:', decodedError);
        setError(decodedError === 'no_user' ? 'No user account was created. Please try again.' :
                 decodedError === 'auth_failed' ? 'Authentication failed. Please try again.' :
                 decodedError === 'token_failed' ? 'Failed to generate session. Please try again.' :
                 `Authentication error: ${decodedError}`);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (!token) {
        console.error('[Auth Callback] No token in URL');
        setError('No authentication token received.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        // Store token temporarily for the API call
        console.log('[Auth Callback] Storing token and verifying with backend...');
        localStorage.setItem('token', token);

        // CRITICAL: Verify token with backend and get authoritative user data
        // This ensures user type cannot be tampered with on the client side
        const response = await authApi.getMe();
        const serverUser = response.data.user;

        console.log('[Auth Callback] User verified:', {
          id: serverUser.id,
          email: serverUser.email,
          type: serverUser.type,
          city: serverUser.city,
          profileComplete: serverUser.profileComplete
        });

        // Set auth state with SERVER-VERIFIED user data
        setAuth(
          {
            id: serverUser.id,
            email: serverUser.email,
            name: serverUser.name || '',
            role: serverUser.role || '',
            city: serverUser.city || '',
            type: serverUser.type, // Server-authoritative type - never trust client-side JWT decode
          },
          token
        );

        // Check if profile is complete
        if (!serverUser.profileComplete || serverUser.city === 'Not Set') {
          console.log('[Auth Callback] Profile incomplete, redirecting to /complete-profile');
          navigate('/complete-profile', { replace: true });
        } else {
          // Redirect to appropriate dashboard based on SERVER-VERIFIED user type
          console.log('[Auth Callback] Profile complete, redirecting to dashboard');
          if (serverUser.type === 'dealer') {
            navigate('/dealer', { replace: true });
          } else if (serverUser.type === 'admin') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        }
      } catch (err: any) {
        console.error('[Auth Callback] Error verifying token:', err);
        console.error('[Auth Callback] Error details:', err.response?.data || err.message);
        // Clear invalid token
        localStorage.removeItem('token');
        setError('Failed to verify authentication. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, setAuth]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-primary-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-primary-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
            <LoadingSpinner size="lg" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Signing you in...</h2>
        <p className="text-gray-600">Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
}
