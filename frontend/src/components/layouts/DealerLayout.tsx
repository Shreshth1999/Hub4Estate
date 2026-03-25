import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
import {
  User, LogOut, Zap, FileText, CheckCircle,
  Award, Home, MessageSquare, Package, Menu, X,
} from 'lucide-react';
import { useState } from 'react';
import { AIAssistantWidget } from '../AIAssistantWidget';

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
    { path: '/dealer/inquiries/available', icon: Package, label: 'Inquiries' },
    { path: '/dealer/rfqs', icon: FileText, label: 'RFQs' },
    { path: '/dealer/quotes', icon: CheckCircle, label: 'My Quotes' },
    { path: '/dealer/messages', icon: MessageSquare, label: 'Messages' },
    { path: '/dealer/profile', icon: Award, label: 'Profile' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const NavContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-0.5">
      {navItems.map((item) => {
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
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }
            `}
          >
            <Icon
              className={`w-4 h-4 flex-shrink-0 ${active ? 'text-white' : 'text-gray-500'}`}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AIAssistantWidget />

      {/* Sidebar — Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-56 lg:fixed lg:inset-y-0 bg-gray-900">
        <div className="h-14 flex items-center px-4 border-b border-gray-800">
          <Link to="/dealer" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-orange-500 flex items-center justify-center rounded-lg">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white block leading-tight">Hub4Estate</span>
              <span className="text-[10px] text-orange-400 font-medium">Dealer Portal</span>
            </div>
          </Link>
        </div>

        <NavContent />

        <div className="border-t border-gray-800 p-3 space-y-0.5">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-3 h-3 text-gray-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-200 hover:bg-white/5 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 z-50">
        <Link to="/dealer" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-orange-500 flex items-center justify-center rounded-lg">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-white">Hub4Estate</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-800 transition-colors"
        >
          <Menu className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`lg:hidden fixed inset-y-0 left-0 w-56 bg-gray-900 z-50 flex flex-col transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-800">
          <span className="text-sm font-semibold text-white">Menu</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-800"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <NavContent onItemClick={() => setSidebarOpen(false)} />
        <div className="border-t border-gray-800 p-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-200 hover:bg-white/5 rounded-md transition-colors"
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
