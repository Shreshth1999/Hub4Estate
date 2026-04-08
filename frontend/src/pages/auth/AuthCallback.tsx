import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
import { authApi } from '@/lib/api';
import { Loader2, XCircle } from 'lucide-react';

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const errorParam = searchParams.get('error');

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
        // CRIT-03: Store token in memory via setAuth, not localStorage
        useAuthStore.getState().setToken(token);

        // CRITICAL: Verify token with backend and get authoritative user data
        // This ensures user type cannot be tampered with on the client side
        const response = await authApi.getMe();
        const serverUser = response.data.user;

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
          navigate('/complete-profile', { replace: true });
        } else {
          if (serverUser.type === 'dealer') {
            navigate('/dealer', { replace: true });
          } else if (serverUser.type === 'admin') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        }
      } catch (_err) {
        useAuthStore.getState().logout();
        setError('Failed to verify authentication. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, setAuth]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-md w-full mx-4">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-base font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-sm text-gray-600 mb-3">{error}</p>
          <p className="text-xs text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
        <h2 className="text-base font-semibold text-gray-900 mb-1">Signing you in...</h2>
        <p className="text-sm text-gray-500">Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
}
