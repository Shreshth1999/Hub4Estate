import { Link } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { ArrowRight, Inbox, IndianRupee, UserCheck, Shield, BarChart3, TrendingUp, Users, Award, ChevronDown, Zap, Eye, EyeOff, Bell, Clock, Star, CheckCircle, Globe, FileText, MessageSquare, Sparkles, Target, PieChart, Layers, Truck, Phone } from 'lucide-react';
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
    Icon: Inbox,
    title: 'Inquiry arrives blind',
    desc: 'You receive real buyer inquiries with full product specs and quantity. No buyer name or contact is shared — ensuring fair competition.',
    detail: 'Inquiries are matched to your product categories and delivery zones automatically.',
    color: 'bg-blue-500',
  },
  {
    Icon: IndianRupee,
    title: 'Submit your quote',
    desc: 'Quote your best price with shipping cost and delivery timeline. The buyer sees all quotes side by side, transparently.',
    detail: 'You compete on price, service, and speed — not relationships. Best offer wins.',
    color: 'bg-amber-500',
  },
  {
    Icon: UserCheck,
    title: 'Win and connect',
    desc: 'If you win, the buyer\'s contact is revealed instantly. If you lose, you get the winning price as a market benchmark.',
    detail: 'Every quote, win or lose, builds your market intelligence and pricing strategy.',
    color: 'bg-accent-500',
  },
];

const BENEFITS = [
  { Icon: Users, title: 'Qualified buyer inquiries', desc: 'Every inquiry comes from a buyer who knows what they want and is ready to purchase. No tire-kickers — real purchase intent, verified specs.', tag: 'Quality leads' },
  { Icon: IndianRupee, title: 'Completely free to join', desc: 'No listing fees, no subscription charges, no commissions. You only invest time when a real inquiry matches your inventory.', tag: 'Zero cost' },
  { Icon: Award, title: 'Build your reputation', desc: 'Get rated by real customers after every transaction. Better ratings mean more inquiries routed to you over time. Climb the dealer tiers.', tag: 'Growth' },
  { Icon: BarChart3, title: 'Performance dashboard', desc: 'Track your quotes, conversion rates, and earnings in real time. See how you stack up against market averages and where to improve.', tag: 'Analytics' },
  { Icon: TrendingUp, title: 'Expand your reach', desc: 'Reach buyers across your city — and beyond — who would never have found your shop otherwise. Grow without opening new locations.', tag: 'Reach' },
  { Icon: Shield, title: 'Fair competition', desc: 'Blind bidding means you compete on price and service, not connections. No favoritism. The best quote wins — every time.', tag: 'Fair play' },
];

const DEALER_JOURNEY = [
  { step: '01', title: 'Register your business', desc: 'Fill out a simple form with your business details, GST number, product categories, and delivery zones. Takes 5 minutes.', Icon: FileText, time: '5 minutes' },
  { step: '02', title: 'We verify your profile', desc: 'Our team checks your GST registration, business documents, and trade references. Once approved, you\'re in.', Icon: Shield, time: '24-48 hours' },
  { step: '03', title: 'Start receiving inquiries', desc: 'Qualified buyer inquiries matching your categories and zones land in your dashboard automatically. Respond at your pace.', Icon: Bell, time: 'Ongoing' },
  { step: '04', title: 'Submit competitive quotes', desc: 'See full product specs, quantity, and delivery city. Submit your best price. You never see the buyer\'s identity — ensuring fair bidding.', Icon: IndianRupee, time: '2-4 hours avg response' },
  { step: '05', title: 'Win, connect, and deliver', desc: 'Win a quote? Buyer contact is revealed instantly. Coordinate directly, deliver the product, and collect your payment.', Icon: Truck, time: 'Instant reveal' },
  { step: '06', title: 'Grow your business', desc: 'Build your dealer rating, get more inquiries, expand to new zones. Use your performance dashboard to optimize.', Icon: TrendingUp, time: 'Continuous' },
];

const DASHBOARD_FEATURES = [
  { Icon: Inbox, title: 'Live Inquiry Feed', desc: 'See matching inquiries as they come in. Filter by category, city, and urgency.' },
  { Icon: PieChart, title: 'Quote Analytics', desc: 'Win rate, average response time, price competitiveness — all tracked.' },
  { Icon: Star, title: 'Dealer Rating', desc: 'Your composite score from delivery speed, pricing, and buyer feedback.' },
  { Icon: Target, title: 'Market Intelligence', desc: 'See winning prices for quotes you didn\'t win. Know where you stand.' },
  { Icon: MessageSquare, title: 'Direct Messaging', desc: 'Chat with won buyers directly through the platform. Coordinate delivery.' },
  { Icon: Layers, title: 'Order Management', desc: 'Track all your active orders, deliveries, and payment status in one place.' },
];

const FAQ = [
  { q: 'Is it really free?', a: 'Yes. There are no listing fees, no subscription charges, and no commissions taken from your sales. We monetize through premium features later — the core platform is free for all dealers.' },
  { q: 'How do inquiries get routed to me?', a: 'When a buyer submits an inquiry matching your registered product categories and delivery city/zone, you receive it automatically in your dashboard. You see the full product specs and quantity but not the buyer\'s identity until you win the quote.' },
  { q: 'What happens if I don\'t win a quote?', a: 'You receive the winning price as a market benchmark. This is valuable market intelligence — it helps you understand competitive pricing in your area and adjust your strategy for future quotes. Over time, this makes you more competitive.' },
  { q: 'How quickly do I need to respond?', a: 'There\'s no hard deadline, but faster responses tend to win more quotes. Our data shows dealers who respond within 2-4 hours have a 3x higher win rate than those who take 24+ hours.' },
  { q: 'What areas do you cover?', a: 'We\'re currently active across major cities in India — starting with Rajasthan and expanding rapidly. If you\'re an electrical dealer anywhere in India, you can register today and start receiving inquiries as we expand to your area.' },
  { q: 'How is my business information protected?', a: 'Your pricing, inventory, and business details are never shared with other dealers. Buyers only see your quote price, delivery terms, and your dealer rating — not your business name — until you win.' },
  { q: 'Can I choose which inquiries to respond to?', a: 'Absolutely. You have full control. Respond only to inquiries that match your current stock and pricing. There\'s no penalty for skipping inquiries that don\'t fit your business.' },
];

export function DealerLandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const heroRef = useInView(0.05);
  const stepsRef = useInView(0.08);
  const journeyRef = useInView(0.08);
  const benefitsRef = useInView(0.08);
  const dashboardRef = useInView(0.08);
  const statsRef = useInView(0.08);
  const faqRef = useInView(0.08);

  return (
    <div className="min-h-screen">
      <SEO
        canonicalUrl="/for-dealers"
        title="Become a Verified Dealer — Get High-Intent Buyer Leads, Grow Your Business"
        description="Join Hub4Estate's verified dealer network and receive high-intent buyer leads matched to your products. No commission on sales. Simple subscription plans. Verified dealer badge, analytics dashboard, concierge leads. Electrical dealers across India trust Hub4Estate to grow their business. Average 35% revenue increase."
        keywords="Hub4Estate for dealers, become electrical dealer, electrical dealer registration, verified dealer India, get buyer leads electrical, electrical B2B marketplace, sell electrical products online, dealer lead generation, electrical wholesale business, grow electrical business, Hub for Estate dealers, dealer subscription, electrical supplier registration, wires cables dealer, LED lights dealer, switches dealer, MCB dealer, fans dealer, electrical products seller, IndiaMART dealer alternative"
      />

      {/* ═══════ Hero ═══════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4" />

        <div ref={heroRef.ref as any} className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 lg:py-32">
          <div className="max-w-3xl" style={revealStyle(heroRef.inView, 0)}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-blue-400">For Electrical Dealers & Distributors</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-[1.05] tracking-tight">
              Grow your business with <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">real buyer inquiries</span>.
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl">
              Hub4Estate connects you with buyers who need electrical products right now. No cold calling. No middlemen. Just qualified inquiries, delivered to your dashboard.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12" style={revealStyle(heroRef.inView, 0.15)}>
              <Link to="/dealer/onboarding"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-500 text-gray-900 font-bold rounded-xl hover:bg-amber-400 transition-all duration-200 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5">
                Register as Dealer — Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/dealer/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-200">
                Already registered? Login
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6 text-sm" style={revealStyle(heroRef.inView, 0.25)}>
              {[
                { Icon: IndianRupee, text: 'Zero cost to join' },
                { Icon: Shield, text: 'No commission on sales' },
                { Icon: Users, text: 'Real purchase-ready buyers' },
                { Icon: EyeOff, text: 'Blind bidding — fair for all' },
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
              { value: 10, suffix: '+', prefix: '', label: 'Active clients served' },
              { value: 37, suffix: 'K', prefix: '₹', label: 'Avg. savings per order' },
              { value: 4, suffix: '+', prefix: '', label: 'Cities covered' },
              { value: 100, suffix: '%', prefix: '', label: 'Free for dealers' },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-3xl md:text-4xl font-bold text-white mb-1">
                  <AnimatedNumber value={item.value} suffix={item.suffix} prefix={item.prefix} />
                </p>
                <p className="text-sm text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════ How It Works — Overview ═══════ */}
      <section className="bg-white border-t border-gray-100">
        <div ref={stepsRef.ref as any} className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 lg:py-28">
          <div className="text-center mb-16" style={revealStyle(stepsRef.inView, 0)}>
            <span className="inline-block px-4 py-1.5 bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider rounded-full mb-4">How It Works</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4">Simple, transparent, profitable</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Three simple steps. No upfront cost. Real buyers with real purchase intent.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="relative group" style={revealStyle(stepsRef.inView, 0.1 + i * 0.12)}>
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


      {/* ═══════ Full Dealer Journey ═══════ */}
      <section className="bg-stone-50 border-t border-gray-100">
        <div ref={journeyRef.ref as any} className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 lg:py-28">
          <div className="text-center mb-16" style={revealStyle(journeyRef.inView, 0)}>
            <span className="inline-block px-4 py-1.5 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider rounded-full mb-4">Your Journey</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4">From registration to revenue</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Here's exactly what happens from the moment you sign up to closing your first deal.</p>
          </div>

          <div className="space-y-0">
            {DEALER_JOURNEY.map((item, i) => (
              <div key={i} className="flex gap-6 md:gap-8" style={revealStyle(journeyRef.inView, 0.05 + i * 0.08)}>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-lg">
                    {item.step}
                  </div>
                  {i < 5 && <div className="w-0.5 flex-1 bg-gray-200 my-2" />}
                </div>
                <div className="pb-10 md:pb-12 flex-1">
                  <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <item.Icon className="w-5 h-5 text-amber-600" />
                        <h3 className="text-lg md:text-xl font-bold text-gray-900">{item.title}</h3>
                      </div>
                      <span className="shrink-0 inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        <Clock className="w-3 h-3" /> {item.time}
                      </span>
                    </div>
                    <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-4">
            <Link to="/dealer/onboarding"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg hover:-translate-y-0.5">
              Start Your Journey — Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>


      {/* ═══════ Benefits ═══════ */}
      <section className="bg-white border-t border-gray-100">
        <div ref={benefitsRef.ref as any} className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 lg:py-28">
          <div className="text-center mb-16" style={revealStyle(benefitsRef.inView, 0)}>
            <span className="inline-block px-4 py-1.5 bg-accent-50 text-accent-700 text-xs font-bold uppercase tracking-wider rounded-full mb-4">Why Join</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4">Why dealers choose Hub4Estate</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Everything you need to grow your electrical business. Zero cost to get started.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map(({ Icon, title, desc, tag }, i) => (
              <div key={i} className="group bg-stone-50 border border-gray-200 rounded-2xl p-7 hover:border-amber-200 hover:bg-amber-50/30 hover:shadow-lg transition-all duration-300"
                style={revealStyle(benefitsRef.inView, 0.05 + i * 0.07)}>
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


      {/* ═══════ Dashboard Preview ═══════ */}
      <section className="bg-gray-900 border-t border-gray-800">
        <div ref={dashboardRef.ref as any} className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 lg:py-28">
          <div className="text-center mb-16" style={revealStyle(dashboardRef.inView, 0)}>
            <span className="inline-block px-4 py-1.5 bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider rounded-full mb-4">Your Dashboard</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">Everything you need in one place</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">A powerful dashboard built specifically for electrical dealers. Track inquiries, manage quotes, and grow your business.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {DASHBOARD_FEATURES.map(({ Icon, title, desc }, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/10 hover:border-amber-500/30 transition-all duration-300"
                style={revealStyle(dashboardRef.inView, 0.08 + i * 0.08)}>
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════ Social Proof Numbers ═══════ */}
      <section className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 border-t border-amber-400">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div ref={statsRef.ref as any} className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 lg:py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center" style={revealStyle(statsRef.inView, 0)}>
            {[
              { value: 10, suffix: '+', prefix: '', label: 'Active clients served' },
              { value: 37, suffix: 'K', prefix: '₹', label: 'Avg. savings per order' },
              { value: 4, suffix: '+', prefix: '', label: 'Cities covered' },
              { value: 100, suffix: '%', prefix: '', label: 'Free for dealers' },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
                  <AnimatedNumber value={item.value} suffix={item.suffix} prefix={item.prefix} />
                </p>
                <p className="text-sm font-medium text-amber-900/60">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════ FAQ ═══════ */}
      <section className="bg-white border-t border-gray-100">
        <div ref={faqRef.ref as any} className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20 lg:py-28">
          <div className="text-center mb-12" style={revealStyle(faqRef.inView, 0)}>
            <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full mb-4">FAQ</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Common questions from dealers</h2>
          </div>

          <div className="divide-y divide-gray-200" style={revealStyle(faqRef.inView, 0.1)}>
            {FAQ.map((item, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-6 text-left group"
                >
                  <span className="text-base font-semibold text-gray-900 group-hover:text-amber-700 transition-colors pr-4">{item.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 shrink-0 ${openFaq === i ? 'rotate-180 text-amber-500' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-96 pb-6' : 'max-h-0'}`}>
                  <p className="text-gray-500 leading-relaxed">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════ Final CTA ═══════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 lg:py-28 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight">Ready to grow your business?</h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">Join Hub4Estate for free. Start receiving qualified buyer inquiries today. No commitments, no charges.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dealer/onboarding"
              className="group inline-flex items-center justify-center gap-2 px-10 py-5 bg-amber-500 text-gray-900 font-bold text-lg rounded-xl hover:bg-amber-400 transition-all duration-200 shadow-xl shadow-amber-500/25 hover:-translate-y-0.5">
              Register as Dealer — Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/dealer/login"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 border border-white/20 text-white font-bold text-lg rounded-xl hover:bg-white/10 transition-all duration-200">
              Already a dealer? Login
            </Link>
          </div>
          <p className="text-sm text-gray-600 mt-8">Questions? Call us at <a href="tel:+917690001999" className="text-amber-400 hover:text-amber-300 font-medium">+91 76900 01999</a> or email <a href="mailto:shreshth.agarwal@hub4estate.com" className="text-amber-400 hover:text-amber-300 font-medium">shreshth.agarwal@hub4estate.com</a></p>
        </div>
      </section>
    </div>
  );
}
