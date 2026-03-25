import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
import {
  User, LogOut, Zap, Users, Shield, BarChart3,
  Settings, AlertTriangle, Home, Package, FileText,
  Building2, MessageSquare, Mail, ClipboardList, BookUser, Menu, X,
} from 'lucide-react';
import { useState } from 'react';
import { AIAssistantWidget } from '../AIAssistantWidget';

export function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navSections = [
    {
      items: [
        { path: '/admin', icon: Home, label: 'Dashboard' },
      ],
    },
    {
      label: 'Operations',
      items: [
        { path: '/admin/dealers', icon: Users, label: 'Dealers' },
        { path: '/admin/leads', icon: Mail, label: 'Leads' },
        { path: '/admin/inquiries', icon: ClipboardList, label: 'Inquiries' },
        { path: '/admin/brand-dealers', icon: BookUser, label: 'Brand Dealers' },
        { path: '/admin/rfqs', icon: FileText, label: 'RFQs' },
      ],
    },
    {
      label: 'Insights',
      items: [
        { path: '/admin/chats', icon: MessageSquare, label: 'AI Chats' },
        { path: '/admin/crm', icon: Building2, label: 'CRM' },
        { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
        { path: '/admin/fraud', icon: AlertTriangle, label: 'Fraud Flags' },
      ],
    },
    {
      label: 'Catalog',
      items: [
        { path: '/admin/products', icon: Package, label: 'Products' },
        { path: '/admin/settings', icon: Settings, label: 'Settings' },
      ],
    },
  ];

  const isActive = (path: string) =>
    location.pathname === path ||
    (path !== '/admin' && location.pathname.startsWith(path + '/'));

  const NavContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-5">
      {navSections.map((section, si) => (
        <div key={si}>
          {section.label && (
            <p className="px-3 mb-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">
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
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }
                  `}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${active ? 'text-white' : 'text-slate-500'}`}
                  />
                  {item.label}
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
      <aside className="hidden lg:flex lg:flex-col lg:w-56 lg:fixed lg:inset-y-0 bg-slate-900">
        <div className="h-14 flex items-center px-4 border-b border-slate-800">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-red-600 flex items-center justify-center rounded-lg">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white block leading-tight">Hub4Estate</span>
              <span className="text-[10px] text-red-400 font-medium">Admin Panel</span>
            </div>
          </Link>
        </div>

        <NavContent />

        <div className="border-t border-slate-800 p-3 space-y-0.5">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-3 h-3 text-slate-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{user?.name || 'Admin'}</p>
              <p className="text-[11px] text-slate-500 truncate">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-500 hover:text-slate-200 hover:bg-white/5 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-50">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-red-600 flex items-center justify-center rounded-lg">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-white">Hub4Estate Admin</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`lg:hidden fixed inset-y-0 left-0 w-56 bg-slate-900 z-50 flex flex-col transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-800">
          <span className="text-sm font-semibold text-white">Admin Menu</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-800"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        <NavContent onItemClick={() => setSidebarOpen(false)} />
        <div className="border-t border-slate-800 p-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-500 hover:text-slate-200 hover:bg-white/5 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-56 bg-gray-50">
        <div className="lg:hidden h-14" />
        <Outlet />
      </main>
    </div>
  );
}
