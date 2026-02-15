import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
import {
  User, LogOut, Zap, Users, Shield, BarChart3,
  Settings, AlertTriangle, Home, Package, FileText, Building2, MessageSquare, Mail, ClipboardList, BookUser
} from 'lucide-react';
import { useState } from 'react';
import { AIAssistantWidget } from '../AIAssistantWidget';

/**
 * AdminLayout - Administrative control panel.
 *
 * This is a completely separate application shell for platform administrators.
 * Admins have oversight workflows:
 * - Verifying dealers
 * - Monitoring platform activity
 * - Managing products/categories
 * - Viewing fraud flags
 * - System settings
 */
export function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/admin', icon: Home, label: 'Dashboard' },
    { path: '/admin/dealers', icon: Users, label: 'Dealers', badge: 'Pending' },
    { path: '/admin/leads', icon: Mail, label: 'Leads' },
    { path: '/admin/inquiries', icon: ClipboardList, label: 'Inquiries', badge: 'New' },
    { path: '/admin/brand-dealers', icon: BookUser, label: 'Brand Dealers' },
    { path: '/admin/chats', icon: MessageSquare, label: 'AI Chats' },
    { path: '/admin/crm', icon: Building2, label: 'CRM' },
    { path: '/admin/rfqs', icon: FileText, label: 'RFQs' },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/fraud', icon: AlertTriangle, label: 'Fraud Flags' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (path: string) => location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path + '/'));

  return (
    <div className="min-h-screen bg-neutral-100 flex">
      {/* AI Assistant Floating Widget */}
      <AIAssistantWidget />

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-slate-900">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Link to="/admin" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black text-white tracking-tight block">
                Hub4Estate
              </span>
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                Admin Panel
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
                    ? 'bg-red-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {item.label}
                {item.badge && (
                  <span className="ml-auto px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg mb-3">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 flex items-center justify-between px-4 z-50">
        <Link to="/admin" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-red-600 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-base font-black text-white">Hub4Estate</span>
            <span className="text-xs font-bold text-red-400 ml-2">Admin</span>
          </div>
        </Link>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-10 h-10 flex items-center justify-center border border-slate-700 rounded-lg"
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
          lg:hidden fixed inset-y-0 left-0 w-64 bg-slate-900 z-50 transform transition-transform
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <span className="text-xl font-black text-white">Admin Menu</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
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
                    ? 'bg-red-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {item.label}
                {item.badge && (
                  <span className="ml-auto px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg font-medium transition-colors"
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
