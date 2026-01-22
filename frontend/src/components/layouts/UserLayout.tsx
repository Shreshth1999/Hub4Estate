import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
import {
  User, LogOut, Zap, FileText, Package, Bookmark,
  Home, Plus, MessageSquare, Sparkles, HelpCircle
} from 'lucide-react';
import { useState } from 'react';
import { AIAssistantWidget } from '../AIAssistantWidget';

/**
 * UserLayout - Clean, SaaS-style dashboard for regular users.
 *
 * This layout is completely separate from the public landing page.
 * It focuses on the core user workflows:
 * - Creating and managing RFQs
 * - Browsing products
 * - Tracking quotes
 * - Comparing products
 */
export function UserLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Primary actions - what users do most
  const primaryNav = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/rfq/create', icon: Plus, label: 'Create RFQ', highlight: true },
    { path: '/rfq/my-rfqs', icon: FileText, label: 'My RFQs' },
  ];

  // Discovery - exploring the marketplace
  const discoverNav = [
    { path: '/user/categories', icon: Package, label: 'Browse Products' },
    { path: '/saved', icon: Bookmark, label: 'Saved Items' },
    { path: '/ai-assistant', icon: Sparkles, label: 'AI Assistant' },
  ];

  // Communication
  const communicationNav = [
    { path: '/messages', icon: MessageSquare, label: 'Messages' },
  ];

  // Resources
  const resourcesNav = [
    { path: '/knowledge', icon: HelpCircle, label: 'Buying Guides' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const renderNavItem = (item: { path: string; icon: any; label: string; highlight?: boolean }) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    if (item.highlight && !active) {
      return (
        <Link
          key={item.path}
          to={item.path}
          className="flex items-center gap-3 px-4 py-3 rounded-lg font-bold bg-accent-500 text-white hover:bg-accent-600 transition-colors"
        >
          <Icon className="w-5 h-5" />
          {item.label}
        </Link>
      );
    }

    return (
      <Link
        key={item.path}
        to={item.path}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors
          ${active
            ? 'bg-neutral-900 text-white'
            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
          }
        `}
      >
        <Icon className="w-5 h-5" />
        {item.label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* AI Assistant Floating Widget */}
      <AIAssistantWidget />

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r-2 border-neutral-200">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b-2 border-neutral-200">
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-neutral-900 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-neutral-900 tracking-tight">
              Hub4Estate
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          {/* Primary Actions */}
          <div className="space-y-1 mb-6">
            {primaryNav.map(renderNavItem)}
          </div>

          {/* Discover */}
          <div className="mb-6">
            <p className="px-4 mb-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">Discover</p>
            <div className="space-y-1">
              {discoverNav.map(renderNavItem)}
            </div>
          </div>

          {/* Communication */}
          <div className="mb-6">
            <p className="px-4 mb-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">Communication</p>
            <div className="space-y-1">
              {communicationNav.map(renderNavItem)}
            </div>
          </div>

          {/* Resources */}
          <div>
            <p className="px-4 mb-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">Resources</p>
            <div className="space-y-1">
              {resourcesNav.map(renderNavItem)}
            </div>
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t-2 border-neutral-200 p-4">
          <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg mb-3">
            <div className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-neutral-900 truncate">{user?.name}</p>
              <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 rounded-lg font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b-2 border-neutral-200 flex items-center justify-between px-4 z-50">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-neutral-900 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-black text-neutral-900">Hub4Estate</span>
        </Link>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-10 h-10 flex items-center justify-center border-2 border-neutral-200 rounded-lg"
        >
          <User className="w-5 h-5" />
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
          lg:hidden fixed inset-y-0 left-0 w-64 bg-white z-50 transform transition-transform
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-16 flex items-center px-6 border-b-2 border-neutral-200">
          <span className="text-xl font-black text-neutral-900">Menu</span>
        </div>

        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          {/* Primary Actions */}
          <div className="space-y-1 mb-6">
            {primaryNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              if (item.highlight && !active) {
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-bold bg-accent-500 text-white"
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              }
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${active ? 'bg-neutral-900 text-white' : 'text-neutral-600'}`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Discover */}
          <div className="mb-6">
            <p className="px-4 mb-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">Discover</p>
            <div className="space-y-1">
              {discoverNav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${active ? 'bg-neutral-900 text-white' : 'text-neutral-600'}`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Communication */}
          <div className="mb-6">
            <p className="px-4 mb-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">Communication</p>
            <div className="space-y-1">
              {communicationNav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${active ? 'bg-neutral-900 text-white' : 'text-neutral-600'}`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Resources */}
          <div>
            <p className="px-4 mb-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">Resources</p>
            <div className="space-y-1">
              {resourcesNav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${active ? 'bg-neutral-900 text-white' : 'text-neutral-600'}`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="border-t-2 border-neutral-200 p-4">
          <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg mb-3">
            <div className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-neutral-900 truncate">{user?.name}</p>
              <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 rounded-lg font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        <div className="lg:hidden h-16" /> {/* Spacer for mobile header */}
        <Outlet />
      </main>
    </div>
  );
}
