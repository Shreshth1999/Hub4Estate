import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
import {
  User, LogOut, FileText, Package,
  Home, Plus, MessageSquare, Sparkles, BookOpen, Menu, X, Users, Search,
  ShoppingBag, IndianRupee, Bookmark, Settings,
} from 'lucide-react';
import { useState } from 'react';
import { AIAssistantWidget } from '../AIAssistantWidget';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  path: string;
  icon: LucideIcon;
  label: string;
  highlight?: boolean;
}

interface NavSection {
  label?: string;
  items: NavItem[];
}

export function UserLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navSections: NavSection[] = [
    {
      items: [
        { path: '/dashboard', icon: Home, label: 'Home' },
        { path: '/rfq/create', icon: Plus, label: 'New Request', highlight: true },
        { path: '/rfq/my-rfqs', icon: FileText, label: 'My Requests' },
        { path: '/dashboard/inquiries', icon: ShoppingBag, label: 'Inquiries' },
        { path: '/dashboard/quotes', icon: IndianRupee, label: 'Quotes' },
      ],
    },
    {
      label: 'Tools',
      items: [
        { path: '/ai-assistant', icon: Sparkles, label: 'Spark AI' },
        { path: '/user/categories', icon: Package, label: 'Browse Products' },
        { path: '/dashboard/saved', icon: Bookmark, label: 'Saved Products' },
        { path: '/messages', icon: MessageSquare, label: 'Messages' },
      ],
    },
    {
      label: 'Resources',
      items: [
        { path: '/track', icon: Search, label: 'Track Request' },
        { path: '/user/knowledge', icon: BookOpen, label: 'Guides' },
        { path: '/user/community', icon: Users, label: 'Community' },
      ],
    },
    {
      label: 'Account',
      items: [
        { path: '/dashboard/profile', icon: Settings, label: 'Profile Settings' },
      ],
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  const NavContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-5">
      {navSections.map((section, si) => (
        <div key={si}>
          {section.label && (
            <p className="px-3 mb-1.5 text-[11px] font-medium text-gray-400 uppercase tracking-wide">
              {section.label}
            </p>
          )}
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onItemClick}
                  className={`
                    flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${active
                      ? 'bg-gray-100 text-gray-900'
                      : item.highlight
                        ? 'text-amber-700 hover:bg-amber-50'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      active ? 'text-gray-900' : item.highlight ? 'text-amber-600' : 'text-gray-400'
                    }`}
                  />
                  {item.label}
                  {item.highlight && !active && (
                    <span className="ml-auto text-[10px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                      +
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AIAssistantWidget />

      {/* Sidebar — Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-56 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
        <div className="h-14 flex items-center px-4 border-b border-gray-100">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#100046] flex items-center justify-center">
              <img src="/logos/hub4estate/favicon-64.png" alt="" className="w-5 h-5 object-contain" />
            </div>
            <span className="text-sm font-semibold text-gray-900 tracking-tight">Hub4Estate</span>
          </Link>
        </div>

        <NavContent />

        <div className="border-t border-gray-100 p-3 space-y-0.5">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-3 h-3 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-[11px] text-gray-400 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#100046] flex items-center justify-center">
            <img src="/logos/hub4estate/favicon-64.png" alt="" className="w-5 h-5 object-contain" />
          </div>
          <span className="text-sm font-semibold text-gray-900">Hub4Estate</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-11 h-11 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white z-50 flex flex-col transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-900">Menu</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-11 h-11 flex items-center justify-center rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <NavContent onItemClick={() => setSidebarOpen(false)} />
        <div className="border-t border-gray-100 p-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-56">
        <div className="lg:hidden h-14" />
        <Outlet />
      </main>
    </div>
  );
}
