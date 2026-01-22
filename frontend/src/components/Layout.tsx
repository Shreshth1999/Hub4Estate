import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
import { Menu, X, User, LogOut, ArrowRight, Zap } from 'lucide-react';
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
      {/* AI Assistant Floating Widget */}
      <AIAssistantWidget />

      {/* Header */}
      <header className="bg-white border-b-2 border-neutral-900 sticky top-0 z-50">
        <div className="container-custom">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-neutral-900 tracking-tight">
                Hub4Estate
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link
                to="/categories"
                className="px-4 py-2 text-sm font-bold uppercase tracking-wide text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
              >
                Products
              </Link>
              <Link
                to="/knowledge"
                className="px-4 py-2 text-sm font-bold uppercase tracking-wide text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
              >
                Guides
              </Link>
              <Link
                to="/community"
                className="px-4 py-2 text-sm font-bold uppercase tracking-wide text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
              >
                Community
              </Link>
              <Link
                to="/dealer/onboarding"
                className="px-4 py-2 text-sm font-bold uppercase tracking-wide text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
              >
                For Dealers
              </Link>
            </nav>

            {/* Auth Section */}
            <div className="hidden lg:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {user?.type === 'user' && (
                    <Link to="/rfq/create" className="btn-urgent text-sm py-3 px-6">
                      Get Quote
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  )}
                  {user?.type === 'dealer' && (
                    <Link to="/dealer" className="btn-primary text-sm py-3 px-6">
                      Dashboard
                    </Link>
                  )}
                  {user?.type === 'admin' && (
                    <Link to="/admin" className="btn-primary text-sm py-3 px-6">
                      Admin
                    </Link>
                  )}
                  <div className="flex items-center space-x-3 px-4 py-2 bg-neutral-100">
                    <div className="w-8 h-8 bg-neutral-900 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-bold text-neutral-900">
                      {user?.name}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn-ghost text-sm py-3 px-4 flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary text-sm py-3 px-6">
                    Sign In
                  </Link>
                  <Link to="/rfq/create" className="btn-urgent text-sm py-3 px-6">
                    Get Quote
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden w-12 h-12 flex items-center justify-center border-2 border-neutral-900 hover:bg-neutral-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t-2 border-neutral-200 bg-white">
            <div className="container-custom py-6 space-y-4">
              <Link
                to="/categories"
                className="block py-3 text-lg font-bold text-neutral-900 border-b border-neutral-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                to="/knowledge"
                className="block py-3 text-lg font-bold text-neutral-900 border-b border-neutral-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Guides
              </Link>
              <Link
                to="/community"
                className="block py-3 text-lg font-bold text-neutral-900 border-b border-neutral-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Community
              </Link>
              <Link
                to="/dealer/onboarding"
                className="block py-3 text-lg font-bold text-neutral-900 border-b border-neutral-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                For Dealers
              </Link>

              <div className="pt-4 space-y-3">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center space-x-3 py-3">
                      <div className="w-10 h-10 bg-neutral-900 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-lg font-bold text-neutral-900">
                        {user?.name}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="btn-secondary w-full justify-center"
                    >
                      <LogOut className="w-5 h-5 mr-2" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/rfq/create"
                      className="btn-urgent w-full justify-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Get Quote
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                    <Link
                      to="/login"
                      className="btn-secondary w-full justify-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                  </>
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
      <footer className="bg-neutral-900 text-white">
        <div className="container-custom py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-white flex items-center justify-center">
                  <Zap className="w-6 h-6 text-neutral-900" />
                </div>
                <span className="text-2xl font-black tracking-tight">
                  Hub4Estate
                </span>
              </div>
              <p className="text-neutral-400 leading-relaxed mb-4">
                India's RFQ-driven marketplace for electrical procurement.
                Dealers compete. You save.
              </p>
              <p className="text-neutral-500 text-sm">
                Hub4Estate LLP<br />
                Registered in India
              </p>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-6">
                Products
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/categories/wires-cables" className="text-neutral-300 hover:text-white font-medium transition-colors">
                    Wires & Cables
                  </Link>
                </li>
                <li>
                  <Link to="/categories/switchgear-protection" className="text-neutral-300 hover:text-white font-medium transition-colors">
                    Switchgear & MCBs
                  </Link>
                </li>
                <li>
                  <Link to="/categories/switches-sockets" className="text-neutral-300 hover:text-white font-medium transition-colors">
                    Switches & Sockets
                  </Link>
                </li>
                <li>
                  <Link to="/categories/lighting" className="text-neutral-300 hover:text-white font-medium transition-colors">
                    Lighting
                  </Link>
                </li>
                <li>
                  <Link to="/categories/fans-ventilation" className="text-neutral-300 hover:text-white font-medium transition-colors">
                    Fans & Ventilation
                  </Link>
                </li>
                <li>
                  <Link to="/categories" className="text-accent-400 hover:text-accent-300 font-bold transition-colors">
                    View All Categories
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-6">
                Resources
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/knowledge" className="text-neutral-300 hover:text-white font-medium transition-colors">
                    Buying Guides
                  </Link>
                </li>
                <li>
                  <Link to="/community" className="text-neutral-300 hover:text-white font-medium transition-colors">
                    Community Forum
                  </Link>
                </li>
                <li>
                  <Link to="/rfq/create" className="text-neutral-300 hover:text-white font-medium transition-colors">
                    Get Quote
                  </Link>
                </li>
                <li>
                  <Link to="/ai-assistant" className="text-neutral-300 hover:text-white font-medium transition-colors">
                    AI Assistant
                  </Link>
                </li>
              </ul>
            </div>

            {/* For Dealers */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-6">
                For Dealers
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/dealer/onboarding" className="text-neutral-300 hover:text-white font-medium transition-colors">
                    Join as Dealer
                  </Link>
                </li>
                <li>
                  <Link to="/dealer/login" className="text-neutral-300 hover:text-white font-medium transition-colors">
                    Dealer Login
                  </Link>
                </li>
              </ul>
              <div className="mt-6 pt-6 border-t border-neutral-800">
                <p className="text-sm text-neutral-500 mb-3">Contact Us</p>
                <a
                  href="mailto:shresth.agarwal@hub4estate.com"
                  className="text-neutral-300 hover:text-white font-medium transition-colors block"
                >
                  shresth.agarwal@hub4estate.com
                </a>
                <a
                  href="tel:+917690001999"
                  className="text-neutral-300 hover:text-white font-medium transition-colors block mt-1"
                >
                  +91 76900 01999
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-neutral-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-neutral-500 text-sm">
              &copy; 2026 Hub4Estate LLP. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-neutral-500">
              <Link to="/about" className="hover:text-white transition-colors">About</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link to="/join-team" className="hover:text-white transition-colors">Careers</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
