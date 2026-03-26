import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
import { Menu, X, User, LogOut, ArrowRight, Zap, Search } from 'lucide-react';
import { useState } from 'react';
import { AIAssistantWidget } from './AIAssistantWidget';

export function Layout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white">
      <AIAssistantWidget />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-semibold text-gray-900">Hub4Estate</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {[
                { to: '/categories', label: 'Products' },
                { to: '/knowledge', label: 'Guides' },
                { to: '/community', label: 'Community' },
                { to: '/dealer/onboarding', label: 'For Dealers' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {label}
                </Link>
              ))}
              <Link
                to="/track"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                Track Request
              </Link>
            </nav>

            {/* Auth / CTA Section */}
            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {user?.type === 'user' && (
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      My Dashboard
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  {user?.type === 'dealer' && (
                    <Link
                      to="/dealer"
                      className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Dealer Portal
                    </Link>
                  )}
                  {user?.type === 'admin' && (
                    <Link
                      to="/admin"
                      className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{user?.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/"
                  onClick={(e) => {
                    const el = document.getElementById('inquiry-form');
                    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
                  }}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Submit Inquiry
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="max-w-6xl mx-auto px-6 py-5 space-y-1">
              {[
                { to: '/categories', label: 'Products' },
                { to: '/knowledge', label: 'Guides' },
                { to: '/community', label: 'Community' },
                { to: '/dealer/onboarding', label: 'For Dealers' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="block py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              <Link
                to="/track"
                className="flex items-center gap-2 py-2.5 text-sm font-medium text-orange-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Search className="w-4 h-4" />
                Track Request
              </Link>

              <div className="pt-4 border-t border-gray-100 space-y-2">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-2 py-2">
                      <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{user?.name}</span>
                    </div>
                    {user?.type === 'user' && (
                      <Link
                        to="/dashboard"
                        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Dashboard
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                    {user?.type === 'dealer' && (
                      <Link
                        to="/dealer"
                        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dealer Portal
                      </Link>
                    )}
                    <button
                      onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setTimeout(() => {
                        document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                  >
                    Submit Inquiry
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
                  <Zap className="w-4.5 h-4.5 text-white" />
                </div>
                <span className="text-lg font-semibold">Hub4Estate</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                India's RFQ-driven marketplace for electrical procurement.
                Dealers compete. You save.
              </p>
              <p className="text-gray-500 text-xs">
                Hub4Estate LLP<br />
                Registered in India
              </p>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-5">Products</h4>
              <ul className="space-y-3 text-sm">
                {[
                  { to: '/categories/wires-cables', label: 'Wires & Cables' },
                  { to: '/categories/switchgear-protection', label: 'Switchgear & MCBs' },
                  { to: '/categories/switches-sockets', label: 'Switches & Sockets' },
                  { to: '/categories/lighting', label: 'Lighting' },
                  { to: '/categories/fans-ventilation', label: 'Fans & Ventilation' },
                  { to: '/categories', label: 'View All Categories', highlight: true },
                ].map(({ to, label, highlight }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className={`transition-colors ${highlight ? 'text-orange-400 hover:text-orange-300 font-medium' : 'text-gray-300 hover:text-white'}`}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-5">Resources</h4>
              <ul className="space-y-3 text-sm">
                {[
                  { to: '/knowledge', label: 'Buying Guides' },
                  { to: '/community', label: 'Community Forum' },
                  { to: '/rfq/create', label: 'Get Quote' },
                  { to: '/ai-assistant', label: 'AI Assistant' },
                  { to: '/track', label: 'Track Your Request', highlight: true },
                ].map(({ to, label, highlight }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className={`transition-colors ${highlight ? 'text-orange-400 hover:text-orange-300 font-medium' : 'text-gray-300 hover:text-white'}`}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Dealers */}
            <div>
              <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-5">For Dealers</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/dealer/onboarding" className="text-gray-300 hover:text-white transition-colors">Join as Dealer</Link>
                </li>
                <li>
                  <Link to="/dealer/login" className="text-gray-300 hover:text-white transition-colors">Dealer Login</Link>
                </li>
              </ul>
              <div className="mt-6 pt-6 border-t border-gray-800">
                <p className="text-xs text-gray-500 mb-3">Contact Us</p>
                <a href="mailto:shreshth.agarwal@hub4estate.com" className="text-sm text-gray-300 hover:text-white transition-colors block">
                  shreshth.agarwal@hub4estate.com
                </a>
                <a href="tel:+917690001999" className="text-sm text-gray-300 hover:text-white transition-colors block mt-1">
                  +91 76900 01999
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">&copy; 2026 Hub4Estate LLP. All rights reserved.</p>
            <div className="flex items-center gap-5 text-sm text-gray-500">
              {[
                { to: '/about', label: 'About' },
                { to: '/contact', label: 'Contact' },
                { to: '/privacy', label: 'Privacy' },
                { to: '/terms', label: 'Terms' },
                { to: '/join-team', label: 'Careers' },
              ].map(({ to, label }) => (
                <Link key={to} to={to} className="hover:text-white transition-colors">{label}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
