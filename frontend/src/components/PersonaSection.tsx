import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Store, Palette, Wrench, Home, ArrowRight, CheckCircle, Shield, IndianRupee, Clock } from 'lucide-react';

// ─── Persona data ──────────────────────────────────────────────────────────────

const PERSONAS = [
  {
    id: 'dealer',
    label: 'Dealer',
    emoji: '🏪',
    Icon: Store,
    accent: 'orange',
    tabActive: 'bg-orange-500 text-white',
    tabInactive: 'text-gray-600',
    dotColor: 'bg-orange-500',
    stepColor: 'text-orange-600 bg-orange-50 border-orange-200',
    btnClass: 'bg-orange-500 hover:bg-orange-600 text-white',
    headline: 'Asli buyers aate hain. Random calls nahi.',
    headlineSub: 'Verified buyers, real requirements.',
    problem: 'Aaj kal: 20 calls, 5 serious, 1 order. Bahut time waste.',
    steps: [
      { icon: '📲', title: 'Buyer request aati hai', detail: 'Exactly kya chahiye, kitna chahiye, budget kya hai — sab pehle se pata rehta hai' },
      { icon: '👁️', title: 'Poori detail dekhte hain', detail: 'Product, quantity, budget, city, deadline — kuch bhi hidden nahi' },
      { icon: '✍️', title: 'Apna rate submit karo', detail: 'Ek simple form. 60 seconds. Bas.' },
      { icon: '🏆', title: 'Best price wala jeet ta hai', detail: 'Fair competition. Jo sabse achha offer kare, order mile.' },
    ],
    ctaLabel: 'Dealer ke roop mein register karo — Free',
    ctaHref: '/dealer/onboarding',
    ctaIsLink: true,
    mockTitle: '🔔 Naya Order Request',
    mockBadge: 'Priority',
    mockBadgeColor: 'bg-orange-100 text-orange-700',
    mockContent: [
      { label: 'Product', value: 'FRLS 2.5mm² Wire × 200m' },
      { label: 'Brand', value: 'Polycab preferred' },
      { label: 'Budget', value: '₹18,000 – ₹24,000' },
      { label: 'City', value: 'Pune' },
      { label: 'Deadline', value: '5 din mein chahiye' },
    ],
    mockBadges: ['✓ Verified Buyer', '2 orders placed'],
    mockCta: 'Quote Submit Karo →',
  },
  {
    id: 'architect',
    label: 'Architect',
    emoji: '📐',
    Icon: Palette,
    accent: 'indigo',
    tabActive: 'bg-indigo-600 text-white',
    tabInactive: 'text-gray-600',
    dotColor: 'bg-indigo-600',
    stepColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    btnClass: 'bg-gray-900 hover:bg-gray-800 text-white',
    headline: 'Sahi product, sahi price, client ke saamne confident raho.',
    headlineSub: 'Specification + verified dealers + quote — sab ek jagah.',
    problem: 'Aaj kal: Har project mein 10 dealers ko call karo, price compare karo. Ghante barbaad.',
    steps: [
      { icon: '🔍', title: 'Specification ke saath search karo', detail: 'Finish, rating, brand, wattage — sab filter karo. Exact product milega.' },
      { icon: '📊', title: 'Verified dealers compare karo', detail: 'Kaun ke paas stock hai, price kya hai, delivery kab hogi — sab ek table mein.' },
      { icon: '📄', title: 'Quote download karo', detail: 'Client presentation ke liye proper quote PDF. Professional lag ta hai.' },
      { icon: '🔒', title: '48 ghante price lock karo', detail: 'Client se approval lo — price wahi rahega. Surprise nahi.' },
    ],
    ctaLabel: 'Inquiry Submit Karo',
    ctaHref: 'inquiry-form',
    ctaIsLink: false,
    mockTitle: '🔍 Search Results',
    mockBadge: '3 Dealers Found',
    mockBadgeColor: 'bg-indigo-100 text-indigo-700',
    mockContent: [
      { label: 'Search', value: '15A Modular Switch, Brushed Steel' },
      { label: '★ Best', value: 'Havells Crabtree — ₹185/pc · 2 din' },
      { label: 'Mid', value: 'Anchor Advance — ₹210/pc · 1 din' },
      { label: 'High', value: 'Legrand Myrius — ₹228/pc · 3 din' },
    ],
    mockBadges: ['✓ BIS Certified', '48hr Price Lock'],
    mockCta: 'Quote Download Karo →',
  },
  {
    id: 'contractor',
    label: 'Contractor',
    emoji: '🏗️',
    Icon: Wrench,
    accent: 'slate',
    tabActive: 'bg-gray-800 text-white',
    tabInactive: 'text-gray-600',
    dotColor: 'bg-gray-800',
    stepColor: 'text-gray-800 bg-gray-100 border-gray-300',
    btnClass: 'bg-gray-900 hover:bg-gray-800 text-white',
    headline: 'Puri materials list ek baar. Quotes saare dealers se.',
    headlineSub: '120 calls ki jagah 1 submission. Bas.',
    problem: 'Aaj kal: 20 items × 6 dealers = 120 calls. Price change hota rehta hai. Delivery miss hoti hai.',
    steps: [
      { icon: '📷', title: 'Apni list upload karo', detail: 'Photo khicho ya type karo. AI turant sab padh leta hai.' },
      { icon: '🤖', title: 'AI sab cheez nikalta hai', detail: 'Brand, quantity, specification — khud automatically bhar deta hai.' },
      { icon: '📬', title: '4+ dealers quotes bhejte hain', detail: 'Poori list ke liye compete karte hain. Tumhe kuch karna nahi.' },
      { icon: '🚚', title: 'Best deal chuno, site pe delivery', detail: 'GST bill, proper documentation, tracked delivery.' },
    ],
    ctaLabel: 'Materials List Submit Karo',
    ctaHref: 'inquiry-form',
    ctaIsLink: false,
    mockTitle: '🤖 AI Scan Complete',
    mockBadge: '12 Items Found',
    mockBadgeColor: 'bg-green-100 text-green-700',
    mockContent: [
      { label: '1.', value: 'FRLS 2.5mm² Wire — 200m · Polycab' },
      { label: '2.', value: 'MCB 32A Double Pole — 4 pcs · Schneider' },
      { label: '3.', value: 'DB Box 8-way — 2 pcs · Legrand' },
      { label: '4.', value: '16A Switch Socket — 20 pcs · Havells' },
    ],
    mockBadges: ['+ 8 aur items', '4 dealers quoting'],
    mockCta: 'Saare Items ke Quotes Lo →',
  },
  {
    id: 'homeowner',
    label: 'Homeowner',
    emoji: '🏠',
    Icon: Home,
    accent: 'green',
    tabActive: 'bg-green-600 text-white',
    tabInactive: 'text-gray-600',
    dotColor: 'bg-green-600',
    stepColor: 'text-green-700 bg-green-50 border-green-200',
    btnClass: 'bg-green-600 hover:bg-green-700 text-white',
    headline: 'Paise bachao. Overcharge mat hone do.',
    headlineSub: 'Sirf ek dealer ko call karna band karo.',
    problem: 'Aaj kal: Jo pehla rate mila, wahi de diya. Pata bhi nahi chala ki ₹5,000 zyada diye.',
    steps: [
      { icon: '📝', title: 'Kya chahiye batao', detail: 'Product ka naam, kitna chahiye, kaunsa shehar — bas itna. 2 minute.' },
      { icon: '📞', title: 'Hum dealers se baat karte hain', detail: 'Aapko kuch nahi karna. Hum 3-5 verified dealers ko contact karte hain.' },
      { icon: '💬', title: 'Quotes aate hain', detail: 'Kuch ghanton mein — asli prices, asli dealers.' },
      { icon: '✅', title: 'Compare karo, best chuno', detail: 'Sab ek jagah. Jo sahi lage, wahi lo. Koi pressure nahi.' },
    ],
    ctaLabel: 'Inquiry Submit Karo — Free',
    ctaHref: 'inquiry-form',
    ctaIsLink: false,
    mockTitle: '💬 Aapke Quotes Aa Gaye',
    mockBadge: '3 Quotes Received',
    mockBadgeColor: 'bg-green-100 text-green-700',
    mockContent: [
      { label: 'Product', value: 'Philips 15W LED Panel × 20' },
      { label: '★ Best', value: 'Delhi Electricals — ₹425/pc · 2 din' },
      { label: 'Mid', value: 'Jaipur Traders — ₹495/pc · 1 din' },
      { label: 'High', value: 'Local Store — ₹585/pc · Same day' },
    ],
    mockBadges: ['GST Bill included', 'Aap bachate hain ₹3,200'],
    mockCta: 'Best Quote Chuno →',
  },
] as const;

type PersonaId = typeof PERSONAS[number]['id'];

// ─── Component ─────────────────────────────────────────────────────────────────

export function PersonaSection() {
  const [active, setActive] = useState<number>(0);
  const [visible, setVisible] = useState(true);
  const [progressKey, setProgressKey] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitioning = useRef(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  const switchTo = (idx: number) => {
    if (transitioning.current) return;
    transitioning.current = true;
    setVisible(false);
    setTimeout(() => {
      setActive(idx);
      setProgressKey(k => k + 1);
      setVisible(true);
      transitioning.current = false;
    }, 220);
  };

  const advance = () => {
    setActive(prev => {
      const next = (prev + 1) % PERSONAS.length;
      switchTo(next);
      return prev;
    });
  };

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setTimeout(advance, 6000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [active, isPaused, progressKey]);

  const handleTabClick = (idx: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    switchTo(idx);
  };

  // Scroll active tab into view on mobile
  useEffect(() => {
    const tab = tabsRef.current?.children[active] as HTMLElement | undefined;
    tab?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [active]);

  const persona = PERSONAS[active];

  return (
    <section
      ref={sectionRef}
      className="relative bg-white border-y border-gray-100 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      data-persona-section
    >
      {/* Progress bar animation CSS */}
      <style>{`
        @keyframes persona-bar {
          from { width: 0%; }
          to   { width: 100%; }
        }
        .persona-progress-bar {
          animation: persona-bar ${isPaused ? '99999s' : '6s'} linear forwards;
        }
        @keyframes persona-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .persona-animate {
          animation: persona-fade-up 0.45s ease forwards;
        }
        @keyframes persona-pop {
          0%   { transform: scale(0.95); opacity: 0; }
          60%  { transform: scale(1.02); }
          100% { transform: scale(1); opacity: 1; }
        }
        .persona-mock-pop {
          animation: persona-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20">

        {/* ── Header ── */}
        <div className="text-center mb-8 md:mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-600 mb-2">Hub4Estate for Everyone</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-900 leading-tight">
            Aap kaun hain? <span className="text-orange-600">Hum dekhate hain.</span>
          </h2>
          <p className="mt-3 text-base sm:text-lg text-gray-500 max-w-xl mx-auto">
            Har role ke liye alag solution. Apna role choose karo.
          </p>
        </div>

        {/* ── Tabs ── */}
        <div className="relative mb-8 md:mb-10">
          <div
            ref={tabsRef}
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {PERSONAS.map((p, i) => (
              <button
                key={p.id}
                onClick={() => handleTabClick(i)}
                className={`
                  relative flex-shrink-0 snap-start flex items-center gap-2
                  px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base
                  transition-all duration-300 min-h-[52px] touch-manipulation
                  ${i === active ? p.tabActive + ' shadow-md scale-105' : 'bg-gray-100 ' + p.tabInactive + ' hover:bg-gray-200'}
                `}
              >
                <span className="text-lg">{p.emoji}</span>
                <span>{p.label}</span>
                {/* Progress bar under active */}
                {i === active && (
                  <span
                    key={progressKey}
                    className="persona-progress-bar absolute bottom-0 left-0 h-0.5 bg-white/50 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Main content ── */}
        <div
          className="transition-all duration-300"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)' }}
        >
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-start">

            {/* LEFT — Story */}
            <div className={visible ? 'persona-animate' : ''}>
              {/* Persona badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{persona.emoji}</span>
                <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${persona.stepColor}`}>
                  {persona.label}
                </span>
              </div>

              {/* Headline */}
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 leading-tight mb-2">
                {persona.headline}
              </h3>
              <p className="text-base sm:text-lg text-gray-500 mb-2">{persona.headlineSub}</p>

              {/* Pain point */}
              <div className="flex items-start gap-2 mb-6 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <span className="text-base mt-0.5">😤</span>
                <p className="text-sm text-red-700 font-medium">{persona.problem}</p>
              </div>

              {/* Steps */}
              <div className="space-y-3 mb-8">
                {persona.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3.5 sm:p-4">
                    <span className="text-xl sm:text-2xl flex-shrink-0 mt-0.5">{step.icon}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base leading-snug">{step.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{step.detail}</p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                  </div>
                ))}
              </div>

              {/* CTA */}
              {persona.ctaIsLink ? (
                <Link
                  to={persona.ctaHref as string}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-base transition-colors ${persona.btnClass}`}
                >
                  {persona.ctaLabel}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <button
                  onClick={() => document.getElementById(persona.ctaHref as string)?.scrollIntoView({ behavior: 'smooth' })}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-base transition-colors ${persona.btnClass}`}
                >
                  {persona.ctaLabel}
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* RIGHT — Mock UI card */}
            <div className={`lg:sticky lg:top-8 ${visible ? 'persona-mock-pop' : 'opacity-0'}`}>
              <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">

                {/* Card header */}
                <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-sm font-bold text-gray-800">{persona.mockTitle}</span>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${persona.mockBadgeColor}`}>
                    {persona.mockBadge}
                  </span>
                </div>

                {/* Card body */}
                <div className="p-5 space-y-3">
                  {persona.mockContent.map((row, i) => (
                    <div
                      key={i}
                      className={`flex items-start justify-between gap-3 ${i === 0 ? 'pb-3 border-b border-gray-100' : ''}`}
                    >
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex-shrink-0 mt-0.5 w-14">
                        {row.label}
                      </span>
                      <span className={`text-sm font-semibold text-right ${i === 1 && persona.id === 'homeowner' ? 'text-green-700' : 'text-gray-800'}`}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Badges */}
                <div className="px-5 pb-4 flex flex-wrap gap-2">
                  {persona.mockBadges.map((badge, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full"
                    >
                      {badge}
                    </span>
                  ))}
                </div>

                {/* Card CTA */}
                <div className="px-5 pb-5">
                  <div className={`w-full py-3 px-4 rounded-xl text-sm font-bold text-center text-white ${persona.btnClass.split(' ')[0]}`}>
                    {persona.mockCta}
                  </div>
                </div>

                {/* Trust bar */}
                <div className="px-5 pb-4 flex items-center justify-center gap-4 border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Shield className="w-3.5 h-3.5 text-green-500" />
                    Verified Platform
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <IndianRupee className="w-3.5 h-3.5 text-orange-500" />
                    GST Billed
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    Fast Response
                  </div>
                </div>
              </div>

              {/* Floating stat */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { num: '₹37K', label: 'Max saved on one deal' },
                  { num: '8+', label: 'Dealers compared' },
                  { num: '100%', label: 'GST documented' },
                ].map(({ num, label }) => (
                  <div key={label} className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                    <p className="text-lg sm:text-xl font-bold text-gray-900">{num}</p>
                    <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Dot nav (mobile) ── */}
        <div className="flex justify-center gap-2 mt-8 lg:hidden">
          {PERSONAS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => handleTabClick(i)}
              className={`h-2 rounded-full transition-all duration-300 touch-manipulation ${
                i === active ? `w-8 ${p.dotColor}` : 'w-2 bg-gray-300'
              }`}
              aria-label={p.label}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
