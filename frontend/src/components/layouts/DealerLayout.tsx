import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
import {
  User, LogOut, Zap, FileText, CheckCircle, BarChart3,
  Award, Home, MessageSquare, Package
} from 'lucide-react';
import { useState } from 'react';
import { AIAssistantWidget } from '../AIAssistantWidget';

/**
 * DealerLayout - Dedicated dashboard for verified dealers.
 *
 * This is a completely separate application shell from the user dashboard.
 * Dealers have their own workflows:
 * - Viewing available RFQs
 * - Submitting quotes
 * - Tracking quote status
 * - Managing their dealer profile
 * - Viewing analytics
 */
export function DealerLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dealer', icon: Home, label: 'Dashboard' },
    { path: '/dealer/inquiries/available', icon: Package, label: 'Product Inquiries', badge: true },
    { path: '/dealer/rfqs', icon: FileText, label: 'Available RFQs' },
    { path: '/dealer/quotes', icon: CheckCircle, label: 'My Quotes' },
    { path: '/dealer/messages', icon: MessageSquare, label: 'Messages' },
    { path: '/dealer/profile', icon: Award, label: 'Profile' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* AI Assistant Floating Widget */}
      <AIAssistantWidget />

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-neutral-900">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-neutral-800">
          <Link to="/dealer" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black text-white tracking-tight block">
                Hub4Estate
              </span>
              <span className="text-xs font-bold text-accent-400 uppercase tracking-wider">
                Dealer Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors
                  ${active
                    ? 'bg-accent-500 text-white'
                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {item.label}
                {item.badge && (
                  <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                    New
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-neutral-800 p-4">
          <div className="flex items-center gap-3 p-3 bg-neutral-800 rounded-lg mb-3">
            <div className="w-10 h-10 bg-accent-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name}</p>
              <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-neutral-400 hover:bg-neutral-800 hover:text-white rounded-lg font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-neutral-900 flex items-center justify-between px-4 z-50">
        <Link to="/dealer" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-accent-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-base font-black text-white">Hub4Estate</span>
            <span className="text-xs font-bold text-accent-400 ml-2">Dealer</span>
          </div>
        </Link>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-10 h-10 flex items-center justify-center border border-neutral-700 rounded-lg"
        >
          <User className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`
          lg:hidden fixed inset-y-0 left-0 w-64 bg-neutral-900 z-50 transform transition-transform
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-16 flex items-center px-6 border-b border-neutral-800">
          <span className="text-xl font-black text-white">Menu</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors
                  ${active
                    ? 'bg-accent-500 text-white'
                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {item.label}
                {item.badge && (
                  <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                    New
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-neutral-800 p-4">
          <div className="flex items-center gap-3 p-3 bg-neutral-800 rounded-lg mb-3">
            <div className="w-10 h-10 bg-accent-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name}</p>
              <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-neutral-400 hover:bg-neutral-800 hover:text-white rounded-lg font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 bg-white">
        <div className="lg:hidden h-16" /> {/* Spacer for mobile header */}
        <Outlet />
      </main>
    </div>
  );
}
