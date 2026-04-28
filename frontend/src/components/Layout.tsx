import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
import { Menu, X, User, LogOut, ArrowRight, Search, Globe, ChevronDown, Mail, Phone } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { AIAssistantWidget } from './AIAssistantWidget';
import { MobileBottomNav } from './MobileBottomNav';
import { useLanguage } from '../contexts/LanguageContext';
import type { LangCode } from '../i18n/translations';

const LANG_OPTIONS: { code: LangCode; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हिं' },
];

const NAV_LINKS = (tx: any) => [
  { to: '/categories', label: tx.nav.products },
  { to: '/for-buyers', label: 'For Buyers' },
  { to: '/for-dealers', label: tx.nav.forDealers },
];

const FOOTER_CATEGORIES = [
  { to: '/categories/wires-cables',          label: 'Wires & Cables' },
  { to: '/categories/switchgear-protection', label: 'Switchgear & MCBs' },
  { to: '/categories/switches-sockets',      label: 'Switches & Sockets' },
  { to: '/categories/lighting',              label: 'Lighting' },
  { to: '/categories/fans-ventilation',      label: 'Fans & Ventilation' },
];

export function Layout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const { lang, setLang, tx } = useLanguage();

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  // Scroll-aware header shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close lang dropdown on outside click
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

  const scrollToInquiryForm = (e: React.MouseEvent) => {
    if (location.pathname === '/') {
      const el = document.getElementById('inquiry-form');
      if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <AIAssistantWidget />
      <MobileBottomNav />

      {/* ── Announcement Bar — hidden on mobile to save vertical space ── */}
      <div className="hidden sm:block bg-primary-50 border-b border-primary-200">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-xs font-medium text-primary-700 flex items-center justify-center gap-2 py-2.5 text-center">
            Verified dealers · Real quotes · Zero middlemen ·
            <Link
              to="/"
              onClick={scrollToInquiryForm}
              className="text-amber-700 hover:text-amber-800 font-semibold underline underline-offset-2 transition-colors"
            >
              Get free quotes →
            </Link>
          </p>
        </div>
      </div>

      {/* ── Header ── */}
      <header
        className={`bg-white sticky top-0 z-50 border-b transition-all duration-200 ${
          scrolled ? 'border-primary-200 shadow-warm-sm' : 'border-primary-100'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16">

            {/* Logo — smaller on mobile to leave more room */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-primary-950 flex items-center justify-center shadow-neo-sm group-hover:shadow-neo-md group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-150">
                <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" aria-hidden="true">
                  <path
                    d="M13.5 3 L6 13.5 H11 L10 21 L17.5 10.5 H12.5 L13.5 3 Z"
                    fill="#ffffff"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-[15px] sm:text-[17px] font-black text-primary-950 tracking-tight">Hub4Estate</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
              {NAV_LINKS(tx).map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                    location.pathname.startsWith(to) && to !== '/'
                      ? 'text-primary-950 bg-primary-100'
                      : 'text-primary-700 hover:text-primary-950 hover:bg-primary-50'
                  }`}
                >
                  {label}
                </Link>
              ))}
              <Link
                to="/track"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-accent-700 hover:text-accent-800 hover:bg-accent-50 rounded-lg transition-all duration-150"
              >
                <Search className="w-3.5 h-3.5" aria-hidden="true" />
                {tx.nav.track}
              </Link>
            </nav>

            {/* Desktop Right Side */}
            <div className="hidden lg:flex items-center gap-2">

              {/* Language switcher */}
              <div className="relative" ref={langRef}>
                <button
                  onClick={() => setLangOpen(o => !o)}
                  aria-label="Switch language"
                  aria-expanded={langOpen}
                  className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-all duration-150"
                >
                  <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{lang === 'hi' ? 'हिं' : 'EN'}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${langOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                {langOpen && (
                  <div className="absolute right-0 top-full mt-1.5 bg-white border-2 border-primary-200 rounded-xl shadow-warm py-1 z-50 min-w-[100px] animate-scale-in">
                    {LANG_OPTIONS.map(opt => (
                      <button
                        key={opt.code}
                        onClick={() => { setLang(opt.code); setLangOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors rounded-lg mx-0.5 ${
                          lang === opt.code
                            ? 'text-primary-950 font-semibold bg-primary-50'
                            : 'text-primary-600 hover:text-primary-950 hover:bg-primary-50'
                        }`}
                      >
                        {opt.label === 'EN' ? 'English' : 'हिंदी'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Auth buttons */}
              {isAuthenticated ? (
                <>
                  {user?.type === 'user' && (
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl shadow-neo-sm hover:shadow-neo-md transition-all duration-150"
                    >
                      {tx.nav.myDashboard}
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  )}
                  {user?.type === 'dealer' && (
                    <Link
                      to="/dealer"
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl shadow-neo-sm hover:shadow-neo-md transition-all duration-150"
                    >
                      {tx.nav.dealerPortal}
                    </Link>
                  )}
                  {user?.type === 'admin' && (
                    <Link
                      to="/admin"
                      className="px-4 py-2 bg-primary-950 hover:bg-primary-900 text-white text-sm font-semibold rounded-xl transition-all duration-150"
                    >
                      {tx.nav.adminPanel}
                    </Link>
                  )}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-xl border-2 border-primary-200">
                    <div className="w-6 h-6 bg-primary-950 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-semibold text-primary-950 max-w-[120px] truncate">{user?.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    aria-label="Log out"
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary-500 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-all duration-150"
                  >
                    <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-primary-700 hover:text-primary-950 hover:bg-primary-50 rounded-lg transition-all duration-150"
                  >
                    {(tx.nav as any).login || 'Login'}
                  </Link>
                  <Link
                    to="/"
                    onClick={scrollToInquiryForm}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-sm font-semibold rounded-xl shadow-neo-sm hover:shadow-neo-md transition-all duration-150"
                  >
                    {tx.nav.getQuotes}
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden w-11 h-11 flex items-center justify-center rounded-xl border-2 border-primary-200 hover:bg-primary-50 transition-all duration-150"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen
                ? <X className="w-5 h-5 text-primary-950" aria-hidden="true" />
                : <Menu className="w-5 h-5 text-primary-950" aria-hidden="true" />
              }
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t-2 border-primary-100 bg-white animate-slide-down">
            <div className="px-4 py-5 space-y-1">

              {/* Nav links */}
              {[...NAV_LINKS(tx), { to: '/track', label: tx.nav.track }].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center py-3 text-sm font-medium border-b border-primary-100 transition-colors ${
                    location.pathname.startsWith(to) && to !== '/'
                      ? 'text-primary-950 font-semibold'
                      : 'text-primary-700'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}

              {/* Language toggle */}
              <div className="flex gap-2 py-3">
                {[{ code: 'en' as LangCode, label: 'English' }, { code: 'hi' as LangCode, label: 'हिंदी' }].map(opt => (
                  <button
                    key={opt.code}
                    onClick={() => { setLang(opt.code); setMobileMenuOpen(false); }}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border-2 transition-all duration-150 ${
                      lang === opt.code
                        ? 'bg-primary-950 text-white border-primary-950'
                        : 'border-primary-200 text-primary-600 hover:border-primary-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Auth section */}
              <div className="pt-2">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 py-2 px-3 bg-primary-50 rounded-xl border-2 border-primary-200">
                      <div className="w-8 h-8 bg-primary-950 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary-950">{user?.name}</p>
                        <p className="text-xs text-primary-500 capitalize">{user?.type}</p>
                      </div>
                    </div>
                    {user?.type === 'user' && (
                      <Link
                        to="/dashboard"
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-xl shadow-neo-sm transition-all"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {tx.nav.myDashboard} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </Link>
                    )}
                    {user?.type === 'dealer' && (
                      <Link
                        to="/dealer"
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-xl shadow-neo-sm transition-all"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {tx.nav.dealerPortal}
                      </Link>
                    )}
                    <button
                      onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                      className="flex items-center gap-2 w-full px-4 py-3 text-sm font-medium text-primary-700 border-2 border-primary-200 rounded-xl hover:bg-primary-50 transition-all"
                    >
                      <LogOut className="w-4 h-4" aria-hidden="true" /> {tx.nav.logout}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-xl shadow-neo-sm transition-all"
                      onClick={(e) => {
                        setMobileMenuOpen(false);
                        if (location.pathname === '/') {
                          e.preventDefault();
                          setTimeout(() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' }), 50);
                        }
                      }}
                    >
                      {tx.nav.getQuotes} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                    <Link
                      to="/login"
                      className="flex items-center justify-center w-full py-3 text-sm font-semibold text-primary-800 border-2 border-primary-300 rounded-xl hover:bg-primary-50 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {(tx.nav as any).login || 'Login'}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Page content */}
      <main id="main-content">
        <Outlet />
      </main>

      {/* ── Footer — PRD §10: warm-white bg, NO dark background ── */}
      <footer className="bg-[#faf9f7] border-t-2 border-primary-200">
        {/* SEO link silo — distributes internal PageRank to programmatic & comparison pages */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 sm:gap-8 lg:gap-12 text-[12px]">
            <div>
              <p className="section-label mb-3">Electrical Products by City</p>
              <ul className="space-y-1.5">
                <li><a href="/seo/electrical-products-mumbai.html" className="text-primary-600 hover:text-primary-950">Mumbai</a></li>
                <li><a href="/seo/electrical-products-delhi.html" className="text-primary-600 hover:text-primary-950">Delhi</a></li>
                <li><a href="/seo/electrical-products-bangalore.html" className="text-primary-600 hover:text-primary-950">Bangalore</a></li>
                <li><a href="/seo/electrical-products-chennai.html" className="text-primary-600 hover:text-primary-950">Chennai</a></li>
                <li><a href="/seo/electrical-products-hyderabad.html" className="text-primary-600 hover:text-primary-950">Hyderabad</a></li>
                <li><a href="/seo/electrical-products-pune.html" className="text-primary-600 hover:text-primary-950">Pune</a></li>
                <li><a href="/seo/electrical-products-kolkata.html" className="text-primary-600 hover:text-primary-950">Kolkata</a></li>
                <li><a href="/seo/electrical-products-ahmedabad.html" className="text-primary-600 hover:text-primary-950">Ahmedabad</a></li>
                <li><a href="/seo/electrical-products-jaipur.html" className="text-primary-600 hover:text-primary-950">Jaipur</a></li>
                <li><a href="/seo/electrical-products-lucknow.html" className="text-primary-600 hover:text-primary-950">Lucknow</a></li>
              </ul>
            </div>
            <div>
              <p className="section-label mb-3">Top Electrical Brands</p>
              <ul className="space-y-1.5">
                <li><Link to="/brands/havells" className="text-primary-600 hover:text-primary-950">Havells</Link></li>
                <li><Link to="/brands/polycab" className="text-primary-600 hover:text-primary-950">Polycab</Link></li>
                <li><Link to="/brands/philips" className="text-primary-600 hover:text-primary-950">Philips</Link></li>
                <li><Link to="/brands/legrand" className="text-primary-600 hover:text-primary-950">Legrand</Link></li>
                <li><Link to="/brands/anchor" className="text-primary-600 hover:text-primary-950">Anchor</Link></li>
                <li><Link to="/brands/finolex" className="text-primary-600 hover:text-primary-950">Finolex</Link></li>
                <li><Link to="/brands/syska" className="text-primary-600 hover:text-primary-950">Syska</Link></li>
                <li><Link to="/brands/crompton" className="text-primary-600 hover:text-primary-950">Crompton</Link></li>
                <li><Link to="/brands/orient" className="text-primary-600 hover:text-primary-950">Orient</Link></li>
                <li><Link to="/brands/schneider" className="text-primary-600 hover:text-primary-950">Schneider</Link></li>
              </ul>
            </div>
            <div>
              <p className="section-label mb-3">Buying Guides</p>
              <ul className="space-y-1.5">
                <li><a href="/seo/wires-cables-buying-guide-india.html" className="text-primary-600 hover:text-primary-950">Wires &amp; Cables Guide</a></li>
                <li><a href="/seo/led-lighting-buying-guide-india.html" className="text-primary-600 hover:text-primary-950">LED Lighting Guide</a></li>
                <li><a href="/seo/switches-sockets-buying-guide-india.html" className="text-primary-600 hover:text-primary-950">Switches &amp; Sockets Guide</a></li>
                <li><a href="/seo/mcb-switchgear-buying-guide-india.html" className="text-primary-600 hover:text-primary-950">MCB &amp; Switchgear Guide</a></li>
                <li><a href="/seo/ceiling-fan-buying-guide-india.html" className="text-primary-600 hover:text-primary-950">Ceiling Fan Guide</a></li>
                <li><a href="/seo/home-wiring-complete-guide.html" className="text-primary-600 hover:text-primary-950">Home Wiring Guide</a></li>
                <li><a href="/seo/electrical-safety-standards-india.html" className="text-primary-600 hover:text-primary-950">Safety Standards</a></li>
                <li><a href="/seo/best-electrical-brands-india.html" className="text-primary-600 hover:text-primary-950">Best Brands in India</a></li>
                <li><a href="/seo/solar-electrical-products-india.html" className="text-primary-600 hover:text-primary-950">Solar Products Guide</a></li>
                <li><a href="/seo/electrical-products-price-list-2024.html" className="text-primary-600 hover:text-primary-950">Price List 2024</a></li>
              </ul>
            </div>
            <div>
              <p className="section-label mb-3">Compare Hub4Estate</p>
              <ul className="space-y-1.5">
                <li><a href="/seo/hub4estate-vs-indiamart.html" className="text-primary-600 hover:text-primary-950">vs IndiaMART</a></li>
                <li><a href="/seo/hub4estate-vs-justdial.html" className="text-primary-600 hover:text-primary-950">vs JustDial</a></li>
                <li><a href="/seo/hub4estate-vs-moglix.html" className="text-primary-600 hover:text-primary-950">vs Moglix</a></li>
                <li><a href="/seo/hub4estate-vs-amazon-electrical.html" className="text-primary-600 hover:text-primary-950">vs Amazon</a></li>
                <li><a href="/seo/indiamart-alternative-electrical-products.html" className="text-primary-600 hover:text-primary-950">IndiaMART Alternative</a></li>
                <li><a href="/seo/best-electrical-procurement-platform-india.html" className="text-primary-600 hover:text-primary-950">Best Procurement Platform</a></li>
                <li><a href="/seo/concierge-service-buy-anything-best-price.html" className="text-primary-600 hover:text-primary-950">Concierge Service</a></li>
                <li><a href="/seo/electrical-dealer-registration-india.html" className="text-primary-600 hover:text-primary-950">Dealer Registration</a></li>
                <li><a href="/seo/government-schemes-electrical-products.html" className="text-primary-600 hover:text-primary-950">Government Schemes</a></li>
                <li><a href="/seo/index.html" className="text-primary-600 hover:text-primary-950 font-semibold">All SEO Pages →</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-100 mt-10" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-16">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-primary-950 flex items-center justify-center shadow-neo-sm">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" aria-hidden="true">
                    <path
                      d="M13.5 3 L6 13.5 H11 L10 21 L17.5 10.5 H12.5 L13.5 3 Z"
                      fill="#ffffff"
                      stroke="#ffffff"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-base font-black text-primary-950">Hub4Estate</span>
              </div>
              <p className="text-primary-700 text-sm leading-relaxed mb-4">{tx.footer.tagline}</p>
              <div className="space-y-1.5">
                <a
                  href="mailto:shreshth.agarwal@hub4estate.com"
                  className="flex items-center gap-2 text-xs text-primary-600 hover:text-accent-700 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                  shreshth.agarwal@hub4estate.com
                </a>
                <a
                  href="tel:+917690001999"
                  className="flex items-center gap-2 text-xs text-primary-600 hover:text-accent-700 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                  +91 76900 01999
                </a>
              </div>
              <p className="text-primary-400 text-[11px] mt-4 leading-relaxed">{tx.footer.registered}</p>
            </div>

            {/* Products */}
            <div>
              <p className="section-label mb-4">{tx.footer.sections.products}</p>
              <ul className="space-y-2.5">
                {FOOTER_CATEGORIES.map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} className="text-sm text-primary-700 hover:text-primary-950 hover:underline underline-offset-2 transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/categories" className="text-sm font-semibold text-amber-700 hover:text-amber-800 transition-colors">
                    {tx.footer.links.viewAll} →
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <p className="section-label mb-4">{tx.footer.sections.resources}</p>
              <ul className="space-y-2.5">
                {[
                  { to: '/ai-assistant', label: tx.footer.links.aiAssistant },
                  { to: '/track',        label: tx.footer.links.trackRequest },
                  { to: '/knowledge',    label: tx.footer.links.buyingGuides },
                  { to: '/community',    label: tx.footer.links.community },
                ].map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} className="text-sm text-primary-700 hover:text-primary-950 hover:underline underline-offset-2 transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Dealers + Company */}
            <div>
              <p className="section-label mb-4">{tx.footer.sections.forDealers}</p>
              <ul className="space-y-2.5 mb-6">
                <li>
                  <Link to="/for-dealers" className="text-sm text-primary-700 hover:text-primary-950 hover:underline underline-offset-2 transition-colors">
                    {tx.footer.links.joinDealer}
                  </Link>
                </li>
                <li>
                  <Link to="/dealer/login" className="text-sm text-primary-700 hover:text-primary-950 hover:underline underline-offset-2 transition-colors">
                    {tx.footer.links.dealerLogin}
                  </Link>
                </li>
              </ul>
              <p className="section-label mb-4">Company</p>
              <ul className="space-y-2.5">
                {[
                  { to: '/about',     label: 'About Us' },
                  { to: '/join-team', label: 'Careers' },
                  { to: '/contact',   label: 'Contact' },
                  { to: '/privacy',   label: 'Privacy Policy' },
                  { to: '/terms',     label: 'Terms of Service' },
                ].map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} className="text-sm text-primary-700 hover:text-primary-950 hover:underline underline-offset-2 transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t-2 border-primary-200 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-primary-500 text-sm">
              {tx.footer.bottom.copyright}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-primary-400 text-xs">HUB4ESTATE LLP · LLPIN ACW-4269 · Sriganganagar, Rajasthan</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
