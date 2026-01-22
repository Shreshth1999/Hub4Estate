import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
import { LoadingSpinner } from './ui';

interface ProtectedRouteProps {
  requiredRole?: 'user' | 'dealer' | 'admin';
}

/**
 * ProtectedRoute guards routes based on authentication and user type.
 *
 * Key behaviors:
 * 1. Waits for auth verification before rendering
 * 2. Redirects to login if not authenticated
 * 3. Redirects to correct dashboard if user type doesn't match required role
 */
export function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isVerified, isVerifying, user } = useAuthStore();
  const location = useLocation();

  // Wait for auth verification to complete
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-neutral-600 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to appropriate login page
  if (!isAuthenticated || !isVerified) {
    // Dealers/admins have separate login
    if (location.pathname.startsWith('/dealer') || location.pathname.startsWith('/admin')) {
      return <Navigate to="/dealer/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but wrong role - redirect to correct dashboard
  if (requiredRole && user?.type !== requiredRole) {
    // Redirect to the user's correct dashboard based on their verified type
    const redirectPath = getRedirectForUserType(user?.type);
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}

/**
 * Get the correct redirect path based on user type
 */
function getRedirectForUserType(userType: string | undefined): string {
  switch (userType) {
    case 'dealer':
      return '/dealer';
    case 'admin':
      return '/admin';
    case 'user':
    default:
      return '/dashboard';
  }
}
