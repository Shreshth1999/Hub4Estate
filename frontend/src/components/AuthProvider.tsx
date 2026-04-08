import { useEffect, useState, ReactNode } from 'react';
import { useAuthStore, getAuthToken } from '@/lib/store';
import { authApi } from '@/lib/api';
import { identifyUser, resetUser } from '@/lib/analytics';
import { Loader2 } from 'lucide-react';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const {
    isAuthenticated,
    setVerifying,
    setVerified,
    updateUser,
    logout
  } = useAuthStore();

  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      // CRIT-03: Token is in-memory only. If no token, nothing to verify.
      const hasToken = !!getAuthToken();

      if (!hasToken) {
        // If persisted state says authenticated but no in-memory token,
        // user refreshed the page — clear stale state
        if (isAuthenticated) logout();
        setIsInitializing(false);
        return;
      }

      setVerifying(true);

      try {
        // Call backend to verify token and get authoritative user data
        const response = await authApi.getMe();

        const serverUser = response.data.user;

        // Update user with server-verified data (this is the source of truth)
        updateUser({
          id: serverUser.id,
          email: serverUser.email,
          name: serverUser.name || '',
          role: serverUser.role || '',
          city: serverUser.city || '',
          type: serverUser.type, // Server-authoritative type
        });

        // Identify user in analytics
        identifyUser({
          id: serverUser.id,
          email: serverUser.email,
          name: serverUser.name,
          role: serverUser.role,
          city: serverUser.city,
          type: serverUser.type,
        });

        setVerified(true);
      } catch (error: any) {
        // Token invalid or expired or backend down - log user out
        console.error('Auth verification failed:', error);
        resetUser();
        logout();
      } finally {
        setIsInitializing(false);
      }
    };

    verifyAuth();
  }, []); // Only run on mount

  // Show loading while verifying auth
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          <p className="mt-4 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
