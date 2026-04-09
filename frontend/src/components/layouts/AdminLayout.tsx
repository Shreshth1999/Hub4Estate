import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
import { adminApi } from '@/lib/api';
import {
  LogOut, Shield, Users, BarChart3,
  Settings, AlertTriangle, Home, Package, FileText,
  Building2, MessageSquare, Mail, ClipboardList, BookUser,
  Menu, X, ShieldCheck, ChevronRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { AIAssistantWidget } from '../AIAssistantWidget';

export function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCounts, setPendingCounts] = useState({ dealers: 0, fraud: 0 });

  useEffect(() => {
    adminApi.getDashboardStats()
      .then(res => {
        const s = res.data.stats;
        setPendingCounts({
          dealers: s.pendingDealers || 0,
          fraud: s.openFraudFlags || 0,
        });
      })
      .catch(() => {});
  }, []);

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
        { path: '/admin/dealers', icon: Users, label: 'Dealers', badge: pendingCounts.dealers },
        { path: '/admin/professionals', icon: ShieldCheck, label: 'Professionals' },
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
        { path: '/admin/fraud', icon: AlertTriangle, label: 'Fraud Flags', badge: pendingCounts.fraud, danger: true },
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
    <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
      {navSections.map((section, si) => (
        <div key={si}>
          {section.label && (
            <p className="px-2 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              {section.label}
            </p>
          )}
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              const badge = (item as any).badge || 0;
              const danger = (item as any).danger;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onItemClick}
                  className={`
                    flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all
                    ${active
                      ? 'bg-white/10 text-white shadow-sm'
                      : danger && badge > 0
                        ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }
                  `}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      active ? 'text-white' :
                      danger && badge > 0 ? 'text-red-400' :
                      'text-slate-500'
                    }`}
                  />
                  <span className="flex-1">{item.label}</span>
                  {badge > 0 && (
                    <span className={`flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full ${
                      danger ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {badge > 99 ? '99+' : badge}
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
      <aside className="hidden lg:flex lg:flex-col lg:w-56 lg:fixed lg:inset-y-0 bg-slate-900">
        {/* Brand */}
        <div className="h-14 flex items-center px-4 border-b border-slate-800/80">
          <Link to="/admin" className="flex items-center gap-2.5">
            <img src="/logos/hub4estate/favicon-64.png" alt="" className="w-7 h-7 object-contain" />
            <div>
              <span className="text-sm font-bold text-white block leading-tight tracking-tight">Hub4Estate</span>
              <span className="text-[10px] text-red-400 font-semibold tracking-wider uppercase">Admin</span>
            </div>
          </Link>
        </div>

        <NavContent />

        {/* User Footer */}
        <div className="border-t border-slate-800/80 p-3">
          <div className="flex items-center gap-2.5 px-2.5 py-2 mb-0.5">
            <div className="w-7 h-7 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-xs font-bold text-white">
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-slate-500 truncate">Super Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm text-slate-500 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-50">
        <Link to="/admin" className="flex items-center gap-2">
          <img src="/logos/hub4estate/favicon-64.png" alt="" className="w-7 h-7 object-contain" />
          <span className="text-sm font-bold text-white">Hub4Estate Admin</span>
        </Link>
        <div className="flex items-center gap-2">
          {(pendingCounts.dealers + pendingCounts.fraud) > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full">
              <span className="text-[10px] font-bold text-amber-400">
                {pendingCounts.dealers + pendingCounts.fraud} pending
              </span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`lg:hidden fixed inset-y-0 left-0 w-56 bg-slate-900 z-50 flex flex-col transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center rounded-md">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-white">Admin Menu</span>
          </div>
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
            className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm text-slate-500 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-56 bg-gray-50 min-h-screen">
        <div className="lg:hidden h-14" />
        <Outlet />
      </main>
    </div>
  );
}
