import { useEffect, useState, ReactNode } from 'react';
import { useAuthStore } from '@/lib/store';
import { authApi } from '@/lib/api';
import { LoadingSpinner } from './ui';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider wraps the app and handles:
 * 1. Verifying persisted auth state against the backend on mount
 * 2. Ensuring user type is always validated server-side
 * 3. Logging out users with invalid/tampered tokens
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const {
    token,
    isAuthenticated,
    setVerifying,
    setVerified,
    updateUser,
    logout
  } = useAuthStore();

  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      // Check for token in localStorage as well (for OAuth callback scenario)
      const storedToken = localStorage.getItem('token');
      const hasToken = token || storedToken;

      // If no token at all, nothing to verify - just render the app
      if (!hasToken) {
        setIsInitializing(false);
        return;
      }

      setVerifying(true);

      try {
        // Call backend to verify token and get authoritative user data
        // Use a timeout to prevent hanging if backend is down
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await authApi.getMe();
        clearTimeout(timeoutId);

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

        setVerified(true);
      } catch (error: any) {
        // Token invalid or expired or backend down - log user out
        console.error('Auth verification failed:', error);
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
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-neutral-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
