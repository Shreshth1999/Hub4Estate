import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Plus, MessageSquare, User } from 'lucide-react';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';

/**
 * App-style bottom navigation for mobile (≤lg breakpoint).
 * Renders only on public/buyer routes — dashboard layouts have their own nav.
 *
 * Adds `has-bottom-nav` to <body> so global CSS reserves space at page bottom.
 */
export function MobileBottomNav() {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    document.body.classList.add('has-bottom-nav');
    return () => document.body.classList.remove('has-bottom-nav');
  }, []);

  // Hide on auth/onboarding screens AND on internal dashboard routes
  // (those have their own UserLayout/DealerLayout/AdminLayout sidebar nav)
  const hidden =
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/dealer/login') ||
    location.pathname.startsWith('/admin/login') ||
    location.pathname.startsWith('/auth/') ||
    location.pathname.startsWith('/complete-profile') ||
    location.pathname.startsWith('/dealer/onboarding') ||
    location.pathname.startsWith('/professional/onboarding') ||
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/dealer/') ||
    location.pathname.startsWith('/admin/') ||
    location.pathname.startsWith('/professional/');

  if (hidden) return null;

  const profileTo = !isAuthenticated
    ? '/login'
    : user?.type === 'dealer'
      ? '/dealer'
      : user?.type === 'admin'
        ? '/admin'
        : '/dashboard';

  const tabs = [
    { to: '/', label: 'Home', Icon: Home, exact: true },
    { to: '/categories', label: 'Browse', Icon: Search },
    { to: '/rfq/create', label: 'Quote', Icon: Plus, primary: true },
    { to: '/track', label: 'Track', Icon: MessageSquare },
    { to: profileTo, label: isAuthenticated ? 'Account' : 'Login', Icon: User },
  ];

  return (
    <nav
      aria-label="Primary mobile navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-primary-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-5 h-16">
        {tabs.map(({ to, label, Icon, primary, exact }) => {
          const isActive = exact ? location.pathname === to : location.pathname.startsWith(to);
          return (
            <li key={label} className="flex">
              <NavLink
                to={to}
                end={exact}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  primary
                    ? 'text-amber-700'
                    : isActive
                      ? 'text-primary-950'
                      : 'text-primary-500 hover:text-primary-800'
                }`}
              >
                {primary ? (
                  <span className="w-9 h-9 -mt-3 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-md border-2 border-white">
                    <Icon className="w-4 h-4" strokeWidth={2.5} />
                  </span>
                ) : (
                  <Icon className={`w-[18px] h-[18px] ${isActive ? 'fill-primary-100' : ''}`} />
                )}
                <span className={`text-[10px] font-semibold tracking-tight ${primary ? 'mt-0' : ''}`}>
                  {label}
                </span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
