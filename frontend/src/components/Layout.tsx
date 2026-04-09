import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
import { Menu, X, User, LogOut, ArrowRight, Search, Globe } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { AIAssistantWidget } from './AIAssistantWidget';
import { useLanguage } from '../contexts/LanguageContext';
import type { LangCode } from '../i18n/translations';

const LANG_OPTIONS: { code: LangCode; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
];

export function Layout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const { lang, setLang, tx } = useLanguage();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white">
      <AIAssistantWidget />

      {/* Announcement Bar */}
      <div className="bg-gray-900 text-center py-2 px-4">
        <p className="text-xs font-medium text-gray-400 flex items-center justify-center gap-2">
          Verified dealers. Real quotes. Always free for buyers.
          <Link
            to="/"
            onClick={(e) => {
              const el = document.getElementById('inquiry-form');
              if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
            }}
            className="text-amber-500 hover:text-amber-400 font-semibold transition-colors ml-1"
          >
            Get a quote →
          </Link>
        </p>
      </div>

      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#100046] flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-500/20 transition-all">
                <img src="/logos/hub4estate/favicon-64.png" alt="" className="w-6 h-6 object-contain" />
              </div>
              <span className="text-base font-semibold text-gray-900">Hub4Estate</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {[
                { to: '/categories', label: tx.nav.products },
                { to: '/for-buyers', label: 'For Buyers' },
                { to: '/for-dealers', label: tx.nav.forDealers },
                { to: '/community', label: tx.nav.community },
                { to: '/knowledge', label: tx.nav.guides },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-150"
                >
                  {label}
                </Link>
              ))}
              <Link
                to="/track"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-amber-700 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-all duration-150"
              >
                <Search className="w-3.5 h-3.5" />
                {tx.nav.track}
              </Link>
            </nav>

            {/* Language switcher */}
            <div className="hidden lg:block relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(o => !o)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-150"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'हिंदी' : 'EN'}</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50 min-w-[110px]">
                  {LANG_OPTIONS.map(opt => (
                    <button
                      key={opt.code}
                      onClick={() => { setLang(opt.code); setLangOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        lang === opt.code
                          ? 'text-gray-900 font-semibold bg-gray-50'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right side: auth */}
            <div className="hidden lg:flex items-center gap-2.5">
              {isAuthenticated ? (
                <>
                  {user?.type === 'user' && (
                    <Link to="/dashboard" className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                      {tx.nav.myDashboard} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  {user?.type === 'dealer' && (
                    <Link to="/dealer" className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">{tx.nav.dealerPortal}</Link>
                  )}
                  {user?.type === 'admin' && (
                    <Link to="/admin" className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">{tx.nav.adminPanel}</Link>
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
                <>
                  <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                    Login
                  </Link>
                  <Link to="/signup" className="px-4 py-2 text-sm font-medium text-amber-700 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors">
                    Sign Up
                  </Link>
                  <Link
                    to="/"
                    onClick={(e) => {
                      const el = document.getElementById('inquiry-form');
                      if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
                    }}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    {tx.nav.getQuotes}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </>
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
                { to: '/categories', label: tx.nav.products },
                { to: '/for-buyers', label: 'For Buyers' },
                { to: '/for-dealers', label: tx.nav.forDealers },
                { to: '/community', label: tx.nav.community },
                { to: '/knowledge', label: tx.nav.guides },
                { to: '/track', label: tx.nav.track },
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

              {/* Mobile language toggle */}
              <div className="flex gap-2 pt-3 pb-1">
                {LANG_OPTIONS.map(opt => (
                  <button
                    key={opt.code}
                    onClick={() => { setLang(opt.code); setMobileMenuOpen(false); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      lang === opt.code
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
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
                        {tx.nav.myDashboard} <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                    {user?.type === 'dealer' && (
                      <Link to="/dealer" className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl" onClick={() => setMobileMenuOpen(false)}>
                        {tx.nav.dealerPortal}
                      </Link>
                    )}
                    <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      <LogOut className="w-4 h-4" /> {tx.nav.logout}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl"
                      onClick={() => { setMobileMenuOpen(false); setTimeout(() => { document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' }); }, 100); }}
                    >
                      {tx.nav.getQuotes} <ArrowRight className="w-4 h-4" />
                    </Link>
                    <div className="flex gap-2">
                      <Link to="/login" className="flex-1 text-center py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                        Login
                      </Link>
                      <Link to="/signup" className="flex-1 text-center py-2.5 text-sm font-medium text-amber-700 border border-amber-200 rounded-xl hover:bg-amber-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                        Sign Up
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main><Outlet /></main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <img src="/logos/hub4estate/favicon-64.png" alt="" className="w-8 h-8 object-contain" />
                <span className="text-base font-bold">Hub4Estate</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">{tx.footer.tagline}</p>
              <p className="text-gray-600 text-xs">{tx.footer.registered}</p>
            </div>

            <div>
              <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-4">{tx.footer.sections.products}</h4>
              <ul className="space-y-2.5 text-sm">
                {[
                  { to: '/categories/wires-cables', label: 'Wires & Cables' },
                  { to: '/categories/switchgear-protection', label: 'Switchgear & MCBs' },
                  { to: '/categories/switches-sockets', label: 'Switches & Sockets' },
                  { to: '/categories/lighting', label: 'Lighting' },
                  { to: '/categories', label: tx.footer.links.viewAll, highlight: true },
                ].map(({ to, label, highlight }) => (
                  <li key={to}><Link to={to} className={`transition-colors ${highlight ? 'text-amber-500 hover:text-amber-400' : 'text-gray-400 hover:text-white'}`}>{label}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-4">{tx.footer.sections.resources}</h4>
              <ul className="space-y-2.5 text-sm">
                {[
                  { to: '/knowledge', label: tx.footer.links.buyingGuides },
                  { to: '/community', label: tx.footer.links.community },
                  { to: '/ai-assistant', label: tx.footer.links.aiAssistant },
                  { to: '/track', label: tx.footer.links.trackRequest, highlight: true },
                ].map(({ to, label, highlight }) => (
                  <li key={to}><Link to={to} className={`transition-colors ${highlight ? 'text-amber-500 hover:text-amber-400' : 'text-gray-400 hover:text-white'}`}>{label}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-4">{tx.footer.sections.forDealers}</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/for-dealers" className="text-gray-400 hover:text-white transition-colors">{tx.footer.links.joinDealer}</Link></li>
                <li><Link to="/dealer/login" className="text-gray-400 hover:text-white transition-colors">{tx.footer.links.dealerLogin}</Link></li>
              </ul>
              <div className="mt-5 pt-5 border-t border-gray-800">
                <a href="mailto:shreshth.agarwal@hub4estate.com" className="text-sm text-gray-400 hover:text-white transition-colors block">shreshth.agarwal@hub4estate.com</a>
                <a href="tel:+917690001999" className="text-sm text-gray-400 hover:text-white transition-colors block mt-1">+91 76900 01999</a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">{tx.footer.bottom.copyright}</p>
            <div className="flex items-center gap-5 text-sm text-gray-600">
              {[
                { to: '/about', label: tx.footer.bottom.about },
                { to: '/contact', label: tx.footer.bottom.contact },
                { to: '/privacy', label: tx.footer.bottom.privacy },
                { to: '/terms', label: tx.footer.bottom.terms },
                { to: '/join-team', label: tx.footer.bottom.careers },
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
