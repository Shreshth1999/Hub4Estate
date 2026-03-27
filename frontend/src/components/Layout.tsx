import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
import { Menu, X, User, LogOut, ArrowRight, Zap, Search, Globe, Check, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { AIAssistantWidget } from './AIAssistantWidget';
import { useLanguage, LANGUAGES } from '../contexts/LanguageContext';

// ─── Language Selector ────────────────────────────────────────────────────────
function LanguageSelector() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find(l => l.code === lang);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 hover:border-gray-300 transition-colors text-sm text-gray-600 hover:text-gray-900"
      >
        <Globe className="w-3.5 h-3.5" />
        <span className="font-medium">{current?.native}</span>
        <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl py-1.5 z-50 overflow-hidden">
          <p className="px-4 pt-1.5 pb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Choose Language</p>
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => { if (l.available) { setLang(l.code); setOpen(false); } }}
              disabled={!l.available}
              className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${
                l.available ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-not-allowed opacity-50'
              }`}
            >
              <span className="flex items-baseline gap-2">
                <span className={`${lang === l.code ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
                  {l.native}
                </span>
                <span className="text-[11px] text-gray-400">{l.name}</span>
              </span>
              {lang === l.code && <Check className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />}
              {!l.available && <span className="text-[9px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full flex-shrink-0">Soon</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Layout ──────────────────────────────────────────────────────────────
export function Layout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, setLang } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white">
      <AIAssistantWidget />

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-semibold text-gray-900">Hub4Estate</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {[
                { to: '/categories', label: 'Products' },
                { to: '/knowledge', label: 'Guides' },
                { to: '/community', label: 'Community' },
                { to: '/dealer/onboarding', label: 'For Dealers' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {label}
                </Link>
              ))}
              <Link
                to="/track"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                Track
              </Link>
            </nav>

            {/* Right side: language + auth */}
            <div className="hidden lg:flex items-center gap-2.5">
              <LanguageSelector />

              {isAuthenticated ? (
                <>
                  {user?.type === 'user' && (
                    <Link to="/dashboard" className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                      My Dashboard <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  {user?.type === 'dealer' && (
                    <Link to="/dealer" className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">Dealer Portal</Link>
                  )}
                  {user?.type === 'admin' && (
                    <Link to="/admin" className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">Admin Panel</Link>
                  )}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{user?.name}</span>
                  </div>
                  <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <Link
                  to="/"
                  onClick={(e) => {
                    const el = document.getElementById('inquiry-form');
                    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
                  }}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Get Quotes
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-4 space-y-0.5">
              {[
                { to: '/categories', label: 'Products' },
                { to: '/knowledge', label: 'Guides' },
                { to: '/community', label: 'Community' },
                { to: '/dealer/onboarding', label: 'For Dealers' },
                { to: '/track', label: 'Track Request' },
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

              {/* Language options — mobile */}
              <div className="pt-3 border-t border-gray-100 mt-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Language</p>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map(l => (
                    <button
                      key={l.code}
                      onClick={() => { if (l.available) setLang(l.code); }}
                      disabled={!l.available}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        lang === l.code
                          ? 'bg-gray-900 text-white border-gray-900'
                          : l.available
                            ? 'border-gray-200 text-gray-600 hover:border-gray-400'
                            : 'border-gray-100 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      {l.native}
                      {!l.available && <span className="ml-1 text-[9px]">·soon</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-3">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 py-1">
                      <div className="w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{user?.name}</span>
                    </div>
                    {user?.type === 'user' && (
                      <Link to="/dashboard" className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl" onClick={() => setMobileMenuOpen(false)}>
                        My Dashboard <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                    {user?.type === 'dealer' && (
                      <Link to="/dealer" className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl" onClick={() => setMobileMenuOpen(false)}>
                        Dealer Portal
                      </Link>
                    )}
                    <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl"
                    onClick={() => { setMobileMenuOpen(false); setTimeout(() => { document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' }); }, 100); }}
                  >
                    Get Free Quotes <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main><Outlet /></main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-base font-semibold">Hub4Estate</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">India's marketplace for electrical procurement. Dealers compete. You save.</p>
              <p className="text-gray-500 text-xs">Hub4Estate LLP · Registered in India</p>
            </div>

            <div>
              <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-4">Products</h4>
              <ul className="space-y-2.5 text-sm">
                {[
                  { to: '/categories/wires-cables', label: 'Wires & Cables' },
                  { to: '/categories/switchgear-protection', label: 'Switchgear & MCBs' },
                  { to: '/categories/switches-sockets', label: 'Switches & Sockets' },
                  { to: '/categories/lighting', label: 'Lighting' },
                  { to: '/categories', label: 'View All →', highlight: true },
                ].map(({ to, label, highlight }) => (
                  <li key={to}><Link to={to} className={`transition-colors ${highlight ? 'text-orange-400 hover:text-orange-300' : 'text-gray-400 hover:text-white'}`}>{label}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-4">Resources</h4>
              <ul className="space-y-2.5 text-sm">
                {[
                  { to: '/knowledge', label: 'Buying Guides' },
                  { to: '/community', label: 'Community' },
                  { to: '/ai-assistant', label: 'AI Assistant' },
                  { to: '/track', label: 'Track Request', highlight: true },
                ].map(({ to, label, highlight }) => (
                  <li key={to}><Link to={to} className={`transition-colors ${highlight ? 'text-orange-400 hover:text-orange-300' : 'text-gray-400 hover:text-white'}`}>{label}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-4">For Dealers</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/dealer/onboarding" className="text-gray-400 hover:text-white transition-colors">Join as Dealer</Link></li>
                <li><Link to="/dealer/login" className="text-gray-400 hover:text-white transition-colors">Dealer Login</Link></li>
              </ul>
              <div className="mt-5 pt-5 border-t border-gray-800">
                <a href="mailto:shreshth.agarwal@hub4estate.com" className="text-sm text-gray-400 hover:text-white transition-colors block">shreshth.agarwal@hub4estate.com</a>
                <a href="tel:+917690001999" className="text-sm text-gray-400 hover:text-white transition-colors block mt-1">+91 76900 01999</a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">&copy; 2026 Hub4Estate LLP. All rights reserved.</p>
            <div className="flex items-center gap-5 text-sm text-gray-600">
              {['/about', '/contact', '/privacy', '/terms', '/join-team'].map((to, i) => (
                <Link key={to} to={to} className="hover:text-white transition-colors">
                  {['About', 'Contact', 'Privacy', 'Terms', 'Careers'][i]}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
