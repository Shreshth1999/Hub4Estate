import { Link } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { ArrowRight, Upload, SlidersHorizontal, CheckCircle, Home, Wrench, Palette, Building2, Users, Store, Shield, IndianRupee, Headphones, FileText, Truck, Star, Sparkles, Camera, Mic, Search, BookOpen, MessageSquare, BarChart3, Eye, EyeOff, Zap, Clock, ChevronRight, Play, TrendingDown, Globe, Award } from 'lucide-react';
import { useInView, revealStyle } from '../hooks/useInView';
import { SEO } from '../components/SEO';

/* ─── Animated Counter ─── */
function AnimatedNumber({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView(0.3);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (inView && !hasAnimated.current) {
      hasAnimated.current = true;
      const duration = 1500;
      const start = performance.now();
      const step = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * value));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  }, [inView, value]);

  return <span ref={ref as any}>{prefix}{count}{suffix}</span>;
}

const STEPS = [
  {
    Icon: Upload,
    title: 'Tell us what you need',
    desc: 'Upload a purchase slip, type a product name, or just speak it in Hindi. Our AI extracts the specs automatically.',
    detail: 'Supports photo upload, drag & drop, camera capture, and voice input in Hindi/English.',
    color: 'bg-amber-500',
  },
  {
    Icon: SlidersHorizontal,
    title: 'Dealers compete for your order',
    desc: 'Multiple verified dealers send you blind quotes. You see price, shipping, delivery time — all side by side.',
    detail: 'Dealers cannot see each other\'s quotes. Pure competition drives the best price for you.',
    color: 'bg-accent-500',
  },
  {
    Icon: CheckCircle,
    title: 'Pick the best deal',
    desc: 'Choose the quote that works for you. The dealer\'s contact is revealed instantly. Deal done.',
    detail: 'Full transparency — GST bills, warranty, delivery proof. No hidden charges ever.',
    color: 'bg-blue-500',
  },
];

const AUDIENCES = [
  { Icon: Home, title: 'Homeowners', desc: 'Renovating or fitting a new home? Compare prices on lights, fans, wiring before spending a rupee.', tag: 'Save 20-40%' },
  { Icon: Wrench, title: 'Contractors', desc: 'Bulk pricing from 4+ dealers, delivered directly to your project site.', tag: 'Bulk deals' },
  { Icon: Palette, title: 'Interior Designers', desc: 'Source exact-spec products without calling 10 different vendors.', tag: 'Exact specs' },
  { Icon: Building2, title: 'Builders & Developers', desc: 'One inquiry, multiple verified dealer quotes — instantly. Scale procurement across projects.', tag: 'Multi-project' },
  { Icon: Users, title: 'Architects', desc: 'Find products matching your specifications, not just nearby stock.', tag: 'Spec matching' },
  { Icon: Store, title: 'Small Businesses', desc: 'Get dealer pricing on office fitout materials, not retail markup.', tag: 'No markup' },
];

const DEALS = [
  { product: 'Sony Tower Speaker + 2 Mics', retail: '1,05,000', hub4estate: '68,000', saved: 37000, percent: '35%', tag: 'Electronics' },
  { product: 'Philips 15W LED Panels x 200', retail: '585/piece', hub4estate: '465/piece', saved: 24000, percent: '21%', tag: 'Lighting' },
  { product: 'FRLS 2.5mm Cable x 200m', retail: '127/meter', hub4estate: '83/meter', saved: 8800, percent: '35%', tag: 'Cables' },
];

const CATEGORIES_PREVIEW = [
  { name: 'Wires & Cables', icon: Zap, count: '50+ products', slug: 'wires-cables' },
  { name: 'Switchgear & MCBs', icon: Shield, count: '40+ products', slug: 'switchgear-protection' },
  { name: 'Switches & Sockets', icon: Home, count: '60+ products', slug: 'switches-sockets' },
  { name: 'Lighting', icon: Sparkles, count: '80+ products', slug: 'lighting' },
  { name: 'Fans & Ventilation', icon: Globe, count: '30+ products', slug: 'fans-ventilation' },
  { name: 'Conduits & Accessories', icon: Wrench, count: '25+ products', slug: 'conduits-accessories' },
];

const PLATFORM_FEATURES = [
  { Icon: Search, title: 'Product Discovery', desc: 'Browse thousands of electrical products across brands. Compare specs, prices, and dealer availability.', link: '/categories', cta: 'Browse Products' },
  { Icon: Sparkles, title: 'AI-Powered Assistant', desc: 'Not sure what to buy? Our AI helps you find the right products based on your project needs — in Hindi or English.', link: '/ai-assistant', cta: 'Try AI Assistant' },
  { Icon: MessageSquare, title: 'Community & Discussions', desc: 'Join discussions with contractors, electricians, and homeowners. Get real advice from real people.', link: '/community', cta: 'Join Community' },
  { Icon: BookOpen, title: 'Buying Guides & Knowledge', desc: 'Learn about wire sizing, MCB ratings, ISI standards, and more. Make informed decisions.', link: '/knowledge', cta: 'Read Guides' },
];

export function UserLandingPage() {
  const heroRef = useInView(0.05);
  const stepsRef = useInView(0.08);
  const processRef = useInView(0.08);
  const conciergeRef = useInView(0.08);
  const categoriesRef = useInView(0.08);
  const audienceRef = useInView(0.08);
  const dealsRef = useInView(0.08);
  const featuresRef = useInView(0.08);
  const trustRef = useInView(0.08);
  const statsRef = useInView(0.08);

  return (
    <div className="min-h-screen">
      <SEO
        canonicalUrl="/for-buyers"
        title="Buy Electrical Products at Best Price — Concierge Service, Verified Dealers"
        description="Stop overpaying for electrical products. Hub4Estate connects you with verified dealers across India — get the best price on wires, cables, LEDs, switches, MCBs, fans & more. Our concierge service personally sources any product at the lowest price. Save up to 40% on every order. Zero middlemen, full transparency."
        keywords="buy electrical products best price, Hub4Estate for buyers, electrical products concierge service, best price wires cables India, LED lights best deal, switches sockets cheap, MCB switchgear wholesale, ceiling fans best price, electrical products no middlemen, verified electrical dealers India, Hub for Estate buyers, electrical shopping online, construction materials best price, building electrical supplies, home electrical products, office electrical products, bulk electrical order, Havells best price, Polycab best price, Philips LED best price"
      />

      {/* ═══════ Hero ═══════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        {/* Amber glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />

        <div ref={heroRef.ref as any} className="relative max-w-6xl mx-auto px-6 py-20 lg:py-32">
          <div className="max-w-3xl" style={revealStyle(heroRef.inView, 0)}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-8">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-amber-400">For Anyone Buying Electrical Products</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-[1.05] tracking-tight">
              Find the <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">cheapest price</span> on any electrical product in India.
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl">
              Tell us what you need. Verified dealers compete to give you their best price. You compare side by side and pick the winner. Always free. Zero spam.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12" style={revealStyle(heroRef.inView, 0.15)}>
              <Link to="/" onClick={(e) => { e.preventDefault(); window.location.href = '/#inquiry-form'; }}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-500 text-gray-900 font-bold rounded-xl hover:bg-amber-400 transition-all duration-200 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5">
                Submit Inquiry — It's Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-200">
                Create Free Account
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6 text-sm" style={revealStyle(heroRef.inView, 0.25)}>
              {[
                { Icon: Shield, text: 'Every dealer verified' },
                { Icon: IndianRupee, text: 'Always free for buyers' },
                { Icon: Eye, text: 'Full price transparency' },
                { Icon: EyeOff, text: 'Blind bidding — fair prices' },
              ].map(({ Icon, text }, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-400">
                  <Icon className="w-4 h-4 text-amber-500" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 pt-10 border-t border-white/10" style={revealStyle(heroRef.inView, 0.3)}>
            {[
              { value: 37, suffix: 'K+', prefix: '₹', label: 'Avg. saved per order' },
              { value: 10, suffix: '+', prefix: '', label: 'Active clients served' },
              { value: 4, suffix: '+', prefix: '', label: 'Cities covered' },
              { value: 0, suffix: '', prefix: '', label: 'Hidden fees — ever', display: 'Zero' },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {item.display || <AnimatedNumber value={item.value} suffix={item.suffix} prefix={item.prefix} />}
                </p>
                <p className="text-sm text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════ How It Works — Detailed ═══════ */}
      <section className="bg-white border-t border-gray-100">
        <div ref={stepsRef.ref as any} className="max-w-6xl mx-auto px-6 py-20 lg:py-28">
          <div className="text-center mb-16" style={revealStyle(stepsRef.inView, 0)}>
            <span className="inline-block px-4 py-1.5 bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider rounded-full mb-4">How It Works</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4">Three steps to your best price</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">No middlemen. No spam calls. No hidden fees. Just real competition between verified dealers working for you.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="relative group" style={revealStyle(stepsRef.inView, 0.1 + i * 0.12)}>
                {/* Connector line */}
                {i < 2 && <div className="hidden md:block absolute top-14 left-full w-full h-[2px] bg-gradient-to-r from-gray-200 to-transparent z-0" />}
                <div className="relative bg-white border-2 border-gray-100 rounded-2xl p-8 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-12 h-12 ${step.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <span className="text-lg font-bold text-white">{i + 1}</span>
                    </div>
                    <step.Icon className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed mb-4">{step.desc}</p>
                  <p className="text-sm text-amber-600 font-medium flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> {step.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════ The Full Process ═══════ */}
      <section className="bg-stone-50 border-t border-gray-100">
        <div ref={processRef.ref as any} className="max-w-6xl mx-auto px-6 py-20 lg:py-28">
          <div className="text-center mb-16" style={revealStyle(processRef.inView, 0)}>
            <span className="inline-block px-4 py-1.5 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider rounded-full mb-4">Behind the Scenes</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4">What happens after you submit</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Complete transparency from inquiry to delivery. Here's exactly what happens at every step.</p>
          </div>

          <div className="space-y-0">
            {[
              { step: '01', title: 'Your inquiry is verified', desc: 'Our team verifies your product details, corrects any specs, and identifies the exact SKU you need. If something is unclear, we call you.', time: '< 30 minutes', Icon: CheckCircle, accent: 'amber' },
              { step: '02', title: 'Matched to the right dealers', desc: 'Your inquiry is sent to 4-8 verified dealers who stock the product in your delivery zone. Dealers see specs and quantity — but NOT your name or contact.', time: '< 1 hour', Icon: Users, accent: 'blue' },
              { step: '03', title: 'Dealers submit blind quotes', desc: 'Each dealer submits their best price, shipping cost, and delivery timeline. They compete without seeing each other\'s quotes. Best price wins.', time: '2-6 hours', Icon: IndianRupee, accent: 'emerald' },
              { step: '04', title: 'You compare and choose', desc: 'We send you all quotes side by side via WhatsApp/SMS. You see every detail — price, shipping, delivery time, dealer rating. Pick the one you like.', time: 'Your pace', Icon: SlidersHorizontal, accent: 'purple' },
              { step: '05', title: 'Dealer contact revealed', desc: 'Once you pick a quote, the winning dealer\'s contact is revealed. You coordinate directly — place the order, confirm delivery, get GST bills.', time: 'Instant', Icon: Star, accent: 'amber' },
              { step: '06', title: 'We follow up', desc: 'After delivery, our team checks in to make sure everything went smoothly. Your feedback helps us maintain dealer quality.', time: '24 hours after delivery', Icon: Headphones, accent: 'blue' },
            ].map((item, i) => {
              const accentColors: Record<string, string> = { amber: 'bg-amber-500 text-amber-500 border-amber-500', blue: 'bg-blue-500 text-blue-500 border-blue-500', emerald: 'bg-accent-500 text-accent-600 border-accent-500', purple: 'bg-purple-500 text-purple-500 border-purple-500' };
              const colors = accentColors[item.accent];
              const [bgColor] = colors.split(' ');
              const textColor = colors.split(' ')[1];
              return (
                <div key={i} className="flex gap-6 md:gap-8" style={revealStyle(processRef.inView, 0.05 + i * 0.08)}>
                  {/* Timeline */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-lg`}>
                      {item.step}
                    </div>
                    {i < 5 && <div className="w-0.5 flex-1 bg-gray-200 my-2" />}
                  </div>
                  {/* Content */}
                  <div className="pb-10 md:pb-12 flex-1">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="text-lg md:text-xl font-bold text-gray-900">{item.title}</h3>
                        <span className="shrink-0 inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                          <Clock className="w-3 h-3" /> {item.time}
                        </span>
                      </div>
                      <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* ═══════ Browse Products ═══════ */}
      <section className="bg-white border-t border-gray-100">
        <div ref={categoriesRef.ref as any} className="max-w-6xl mx-auto px-6 py-20 lg:py-28">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12" style={revealStyle(categoriesRef.inView, 0)}>
            <div>
              <span className="inline-block px-4 py-1.5 bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider rounded-full mb-4">Product Catalog</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">Browse by category</h2>
              <p className="text-gray-500 max-w-lg">Thousands of electrical products from India's top brands. Search, compare, and get the best price.</p>
            </div>
            <Link to="/categories" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors shrink-0">
              View All Categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CATEGORIES_PREVIEW.map((cat, i) => (
              <Link key={i} to={`/categories/${cat.slug}`}
                className="group relative bg-stone-50 border border-gray-200 rounded-xl p-6 hover:border-amber-300 hover:bg-amber-50/50 hover:shadow-md transition-all duration-300"
                style={revealStyle(categoriesRef.inView, 0.05 + i * 0.06)}>
                <cat.icon className="w-8 h-8 text-amber-600 mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-base font-bold text-gray-900 mb-1">{cat.name}</h3>
                <p className="text-sm text-gray-400">{cat.count}</p>
                <ChevronRight className="absolute top-6 right-6 w-5 h-5 text-gray-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════ Concierge Service ═══════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-amber-50/50 to-white border-t border-amber-100">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-300/20 rounded-full blur-[100px]" />

        <div ref={conciergeRef.ref as any} className="relative max-w-6xl mx-auto px-6 py-20 lg:py-28">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div style={revealStyle(conciergeRef.inView, 0)}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 border border-amber-200 rounded-full mb-6">
                <Headphones className="w-4 h-4 text-amber-700" />
                <span className="text-sm font-bold text-amber-800">Free Concierge Service</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
                Not sure what to buy?<br />
                <span className="text-amber-600">We'll handle everything.</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Our concierge team helps you specify the right products, find the right brands, and negotiates with dealers on your behalf. Think of it as having a procurement expert on speed dial.
              </p>

              <div className="space-y-5 mb-10">
                {[
                  { Icon: Star, title: 'Personalized recommendations', desc: 'Tell us your project — we recommend the right products, brands, and specs.' },
                  { Icon: IndianRupee, title: 'Price negotiation', desc: 'We negotiate with dealers to get you even better prices than standard quotes.' },
                  { Icon: FileText, title: 'Full documentation', desc: 'GST bills, warranty cards, delivery proof — everything organized for you.' },
                  { Icon: Truck, title: 'Delivery coordination', desc: 'We coordinate delivery to your site, home, or office. Track everything in real time.' },
                ].map(({ Icon, title, desc }, i) => (
                  <div key={i} className="flex items-start gap-4" style={revealStyle(conciergeRef.inView, 0.1 + i * 0.08)}>
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-0.5">{title}</h4>
                      <p className="text-sm text-gray-500">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link to="/" onClick={(e) => { e.preventDefault(); window.location.href = '/#inquiry-form'; }}
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg hover:-translate-y-0.5">
                Get Concierge Help — Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div style={revealStyle(conciergeRef.inView, 0.15)}>
              <div className="bg-white border-2 border-amber-200 rounded-2xl p-8 shadow-xl shadow-amber-500/10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                    <Headphones className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Perfect for</h3>
                    <p className="text-sm text-gray-400">Anyone who wants it done right</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    'First-time buyers who don\'t know exact product specs',
                    'Large projects needing multiple product categories',
                    'People who want the best price but don\'t have time to compare',
                    'Anyone who wants a trusted expert handling their procurement',
                    'Businesses needing GST-compliant documentation',
                  ].map((text, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700">{text}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 bg-gradient-to-r from-amber-50 to-accent-50 -mx-8 -mb-8 px-8 pb-8 rounded-b-2xl">
                  <p className="text-sm text-gray-500 mb-1">Cost for buyers</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-black text-gray-900">Free</p>
                    <p className="text-sm text-gray-400">forever — no hidden fees</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ═══════ Platform Features ═══════ */}
      <section className="bg-gray-900 border-t border-gray-800">
        <div ref={featuresRef.ref as any} className="max-w-6xl mx-auto px-6 py-20 lg:py-28">
          <div className="text-center mb-16" style={revealStyle(featuresRef.inView, 0)}>
            <span className="inline-block px-4 py-1.5 bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider rounded-full mb-4">Platform Features</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">More than just quotes</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">Hub4Estate is a complete platform for buying electrical products — from discovery to delivery.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {PLATFORM_FEATURES.map(({ Icon, title, desc, link, cta }, i) => (
              <Link key={i} to={link}
                className="group bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-amber-500/30 transition-all duration-300"
                style={revealStyle(featuresRef.inView, 0.08 + i * 0.1)}>
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors">
                    <Icon className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">{title}</h3>
                    <p className="text-gray-400 leading-relaxed mb-4">{desc}</p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400 group-hover:gap-2.5 transition-all">
                      {cta} <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════ Who It's For ═══════ */}
      <section className="bg-white border-t border-gray-100">
        <div ref={audienceRef.ref as any} className="max-w-6xl mx-auto px-6 py-20 lg:py-28">
          <div className="text-center mb-16" style={revealStyle(audienceRef.inView, 0)}>
            <span className="inline-block px-4 py-1.5 bg-accent-50 text-accent-700 text-xs font-bold uppercase tracking-wider rounded-full mb-4">Who It's For</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4">Built for anyone who buys electrical products</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Whether you're doing a home renovation or managing a construction project — if you've ever overpaid without knowing it, this is for you.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {AUDIENCES.map(({ Icon, title, desc, tag }, i) => (
              <div key={i} className="group bg-stone-50 border border-gray-200 rounded-2xl p-7 hover:border-amber-200 hover:bg-amber-50/30 hover:shadow-lg transition-all duration-300"
                style={revealStyle(audienceRef.inView, 0.05 + i * 0.07)}>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center group-hover:border-amber-200 group-hover:bg-amber-50 transition-colors">
                    <Icon className="w-6 h-6 text-gray-600 group-hover:text-amber-600 transition-colors" />
                  </div>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">{tag}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════ Real Savings ═══════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border-t border-gray-800">
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px]" />

        <div ref={dealsRef.ref as any} className="relative max-w-6xl mx-auto px-6 py-20 lg:py-28">
          <div className="text-center mb-16" style={revealStyle(dealsRef.inView, 0)}>
            <span className="inline-block px-4 py-1.5 bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider rounded-full mb-4">Verified Savings</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">Real savings from real deals</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">These are actual deals closed through Hub4Estate. Real buyers. Verified numbers.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {DEALS.map((deal, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all duration-300"
                style={revealStyle(dealsRef.inView, 0.08 + i * 0.1)}>
                <div className="p-7">
                  <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-full mb-4">{deal.tag}</span>
                  <h3 className="text-lg font-bold text-white mb-6">{deal.product}</h3>

                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="text-sm text-gray-500">Retail / Market</span>
                        <span className="text-sm text-gray-500 line-through">₹{deal.retail}</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-white/10 rounded-full" style={{ width: '100%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="text-sm font-semibold text-amber-400">Hub4Estate price</span>
                        <span className="text-sm font-bold text-amber-400">₹{deal.hub4estate}</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-1000"
                          style={{ width: dealsRef.inView ? `${100 - parseInt(deal.percent)}%` : '0%' }} />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-5 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">You save</p>
                      <p className="text-3xl font-black text-amber-400">
                        ₹<AnimatedNumber value={deal.saved} />
                      </p>
                    </div>
                    <span className="px-3 py-1.5 bg-accent-500/10 text-accent-400 text-sm font-bold rounded-lg">
                      <TrendingDown className="w-3.5 h-3.5 inline mr-1" />{deal.percent} less
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-600 mt-10">All savings verified from real Hub4Estate transactions. Prices may vary by location and quantity.</p>
        </div>
      </section>


      {/* ═══════ Why Trust Us ═══════ */}
      <section className="bg-white border-t border-gray-100">
        <div ref={trustRef.ref as any} className="max-w-6xl mx-auto px-6 py-20 lg:py-28">
          <div className="text-center mb-16" style={revealStyle(trustRef.inView, 0)}>
            <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full mb-4">Trust & Safety</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">Built on trust, not tricks</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { Icon: Shield, title: 'Every dealer is verified', desc: 'We vet dealers before they can quote. GST documents, business license, trade references, and track record — all checked before approval.', accent: 'amber' },
              { Icon: IndianRupee, title: 'Always free for buyers', desc: 'No signup fees, no commissions, no hidden charges. You pay the dealer directly for the product. We never take a cut from your purchase.', accent: 'emerald' },
              { Icon: Eye, title: 'Full transparency', desc: 'You see every quote, every price, every detail. We never hide information or push you toward a specific dealer. Your choice is always yours.', accent: 'blue' },
            ].map(({ Icon, title, desc, accent }, i) => {
              const accents: Record<string, string> = { amber: 'bg-amber-100 text-amber-700', emerald: 'bg-accent-100 text-accent-700', blue: 'bg-blue-100 text-blue-700' };
              const [bg, text] = accents[accent].split(' ');
              return (
                <div key={i} className="text-center" style={revealStyle(trustRef.inView, 0.08 + i * 0.1)}>
                  <div className={`w-16 h-16 ${bg} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <Icon className={`w-8 h-8 ${text}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                  <p className="text-gray-500 leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* ═══════ Final CTA ═══════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-amber-500 to-amber-600">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div ref={statsRef.ref as any} className="relative max-w-4xl mx-auto px-6 py-20 lg:py-28 text-center">
          <div style={revealStyle(statsRef.inView, 0)}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-6 tracking-tight">Stop overpaying for electrical products.</h2>
            <p className="text-xl text-amber-900/70 mb-10 max-w-2xl mx-auto">Submit your first inquiry. It takes 30 seconds and it's completely free. No account needed.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/" onClick={(e) => { e.preventDefault(); window.location.href = '/#inquiry-form'; }}
                className="group inline-flex items-center justify-center gap-2 px-10 py-5 bg-gray-900 text-white font-bold text-lg rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-xl hover:-translate-y-0.5">
                Get Your Best Price <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/signup"
                className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white/20 text-gray-900 font-bold text-lg rounded-xl hover:bg-white/30 transition-all duration-200 backdrop-blur-sm">
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
