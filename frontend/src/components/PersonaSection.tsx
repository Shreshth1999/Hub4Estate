import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

// ─── Data ──────────────────────────────────────────────────────────────────────

const PERSONAS = [
  {
    id: 'dealer',
    tab: 'Dealer',
    bg: 'from-orange-500 to-orange-600',
    lightBg: 'bg-orange-50',
    border: 'border-orange-200',
    accent: 'text-orange-600',
    accentBg: 'bg-orange-500',
    tabBg: 'bg-orange-500',
    bigNumber: '₹37,000',
    bigLabel: 'ek deal mein bachaye ek customer ne',
    headline: 'Sahi buyer,\nsahi time pe.',
    sub: 'Random calls band. Verified buyers directly aate hain — budget, product, city sab ready.',
    steps: [
      { n: '1', text: 'Buyer request aati hai — product, quantity, budget sab pehle se' },
      { n: '2', text: 'Aap quote submit karte ho — 60 seconds ka kaam' },
      { n: '3', text: 'Best deal milti hai — fair competition, guaranteed order' },
    ],
    cta: 'Dealer Register Karo — Free',
    ctaLink: '/dealer/onboarding',
    isLink: true,
    notif: {
      icon: '🔔',
      title: 'Naya Order Request',
      badge: 'Abhi Aaya',
      badgeBg: 'bg-orange-100 text-orange-700',
      rows: [
        { k: 'Product', v: 'Polycab FRLS Wire 2.5mm × 200m' },
        { k: 'Budget', v: '₹18,000 – ₹24,000' },
        { k: 'City', v: 'Pune · 5 din mein' },
      ],
      tags: ['✓ Verified Buyer', 'GST Ready'],
      btn: 'Quote Bhejo →',
      btnBg: 'bg-orange-500',
    },
  },
  {
    id: 'architect',
    tab: 'Architect',
    bg: 'from-violet-600 to-violet-700',
    lightBg: 'bg-violet-50',
    border: 'border-violet-200',
    accent: 'text-violet-600',
    accentBg: 'bg-violet-600',
    tabBg: 'bg-violet-600',
    bigNumber: '10x',
    bigLabel: 'faster sourcing than calling dealers manually',
    headline: 'Sahi product\nconfidence ke saath.',
    sub: 'Specification search karo, verified dealers compare karo, client ko proper quote do.',
    steps: [
      { n: '1', text: 'Specification ke saath search — brand, finish, rating, wattage' },
      { n: '2', text: '3–5 verified dealers compare karo — price, stock, lead time' },
      { n: '3', text: 'Quote download karo — client presentation ke liye ready' },
    ],
    cta: 'Inquiry Submit Karo',
    ctaLink: 'inquiry-form',
    isLink: false,
    notif: {
      icon: '🔍',
      title: 'Search Result',
      badge: '3 Dealers Found',
      badgeBg: 'bg-violet-100 text-violet-700',
      rows: [
        { k: '★ Best', v: 'Havells Crabtree — ₹185/pc · 2 din' },
        { k: 'Mid', v: 'Anchor Advance — ₹210/pc · 1 din' },
        { k: 'High', v: 'Legrand Myrius — ₹228/pc · 3 din' },
      ],
      tags: ['BIS Certified', '48hr Price Lock'],
      btn: 'Quote Download Karo →',
      btnBg: 'bg-violet-600',
    },
  },
  {
    id: 'contractor',
    tab: 'Contractor',
    bg: 'from-gray-800 to-gray-900',
    lightBg: 'bg-gray-100',
    border: 'border-gray-300',
    accent: 'text-gray-800',
    accentBg: 'bg-gray-800',
    tabBg: 'bg-gray-800',
    bigNumber: '120→1',
    bigLabel: 'calls ki jagah ek submission — pura materials list',
    headline: 'Pura list,\nEk baar.',
    sub: 'Photo khicho apni materials list ki. AI sab padh ta hai. 4+ dealers compete karte hain.',
    steps: [
      { n: '1', text: 'List ki photo lo ya type karo — AI turant 12+ items nikalta hai' },
      { n: '2', text: 'Multiple dealers ek saath quote karte hain — koi call nahi' },
      { n: '3', text: 'Best deal chuno, site pe delivery — GST billed, tracked' },
    ],
    cta: 'Materials List Submit Karo',
    ctaLink: 'inquiry-form',
    isLink: false,
    notif: {
      icon: '🤖',
      title: 'AI Scan Complete',
      badge: '12 Items Mile',
      badgeBg: 'bg-green-100 text-green-700',
      rows: [
        { k: '1.', v: 'FRLS Wire 2.5mm — 200m · Polycab' },
        { k: '2.', v: 'MCB 32A — 4 pcs · Schneider' },
        { k: '3.', v: 'DB Box 8-way — 2 pcs · Legrand' },
      ],
      tags: ['+ 9 aur items', '4 dealers quoting'],
      btn: 'Saare Quotes Lo →',
      btnBg: 'bg-gray-800',
    },
  },
  {
    id: 'homeowner',
    tab: 'Homeowner',
    bg: 'from-green-500 to-green-600',
    lightBg: 'bg-green-50',
    border: 'border-green-200',
    accent: 'text-green-700',
    accentBg: 'bg-green-600',
    tabBg: 'bg-green-600',
    bigNumber: '₹24,000',
    bigLabel: 'ek ghar wale ne bachaye — sirf LED lights order karke',
    headline: 'Jo price milti hai,\nwoh sahi hai?',
    sub: 'Ek dealer se mat poochho. Hum 3–5 se poochhhte hain. Aap compare karo, best chuno.',
    steps: [
      { n: '1', text: 'Product batao — naam, quantity, shehar. 2 minute.' },
      { n: '2', text: 'Hum verified dealers se quote mangwate hain — aapko kuch nahi karna' },
      { n: '3', text: 'Quotes compare karo, best chuno — GST bill, warranty sab included' },
    ],
    cta: 'Free Inquiry Karo',
    ctaLink: 'inquiry-form',
    isLink: false,
    notif: {
      icon: '💬',
      title: 'Aapke Quotes Aaye',
      badge: '3 Quotes',
      badgeBg: 'bg-green-100 text-green-700',
      rows: [
        { k: '★ Best', v: 'Delhi Store — ₹425/pc · 2 din' },
        { k: 'Mid', v: 'Jaipur Traders — ₹495/pc · 1 din' },
        { k: 'High', v: 'Local — ₹585/pc · Same day' },
      ],
      tags: ['GST Bill Included', 'Aap Bachate: ₹3,200'],
      btn: 'Best Quote Chuno →',
      btnBg: 'bg-green-600',
    },
  },
] as const;

type Idx = 0 | 1 | 2 | 3;

// ─── Component ─────────────────────────────────────────────────────────────────

export function PersonaSection() {
  const [idx, setIdx] = useState<number>(0);
  const [animating, setAnimating] = useState(false);
  const [dir, setDir] = useState<'left' | 'right'>('right');
  const [paused, setPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const go = (next: number, direction: 'left' | 'right' = 'right') => {
    if (animating) return;
    setDir(direction);
    setAnimating(true);
    setTimeout(() => {
      setIdx(next);
      setProgressKey(k => k + 1);
      setAnimating(false);
    }, 280);
  };

  const prev = () => go((idx - 1 + PERSONAS.length) % PERSONAS.length, 'left');
  const next = () => go((idx + 1) % PERSONAS.length, 'right');

  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(() => go((idx + 1) % PERSONAS.length, 'right'), 5500);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [idx, paused, progressKey]);

  const p = PERSONAS[idx];

  return (
    <section
      className="bg-white border-y border-gray-100 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <style>{`
        @keyframes pg-bar {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        .pg-bar-inner {
          transform-origin: left;
          animation: pg-bar ${paused ? '9999s' : '5.5s'} linear forwards;
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-out-right {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(-32px); }
        }
        @keyframes slide-out-left {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(32px); }
        }
        .ps-enter-right { animation: slide-in-right 0.3s ease forwards; }
        .ps-enter-left  { animation: slide-in-left  0.3s ease forwards; }
        .ps-exit-right  { animation: slide-out-right 0.28s ease forwards; }
        .ps-exit-left   { animation: slide-out-left  0.28s ease forwards; }
        .touch-card { -webkit-tap-highlight-color: transparent; }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* ── Top label ── */}
        <div className="pt-10 sm:pt-14 pb-6 sm:pb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-3">Platform ki Khaasiyat</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-900">
            Aap kaun hain?
          </h2>
          <p className="text-gray-400 mt-2 text-sm sm:text-base">Apna role select karo — dekhte hain kaise kaam karta hai</p>
        </div>

        {/* ── Tab bar ── */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6 sm:mb-8 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
          {PERSONAS.map((persona, i) => (
            <button
              key={persona.id}
              onClick={() => go(i, i > idx ? 'right' : 'left')}
              className={`
                relative flex-shrink-0 px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl font-bold
                text-sm sm:text-base transition-all duration-300 touch-card min-h-[52px]
                ${i === idx
                  ? `${persona.tabBg} text-white shadow-lg scale-105`
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
              `}
            >
              {persona.tab}
              {/* Progress bar */}
              {i === idx && (
                <span
                  key={progressKey}
                  className="pg-bar-inner absolute bottom-0 left-0 right-0 h-0.5 bg-white/40 rounded-b-2xl"
                />
              )}
            </button>
          ))}
        </div>

        {/* ── Main card ── */}
        <div className="relative pb-10 sm:pb-14">
          <div
            className={animating
              ? (dir === 'right' ? 'ps-exit-right' : 'ps-exit-left')
              : (dir === 'right' ? 'ps-enter-right' : 'ps-enter-left')
            }
          >
            <div className="grid lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-10 items-start">

              {/* LEFT: Story */}
              <div className="flex flex-col gap-4 sm:gap-5">

                {/* Big number hero */}
                <div className={`rounded-2xl p-5 sm:p-7 bg-gradient-to-br ${p.bg} text-white`}>
                  <p className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-1 leading-none">
                    {p.bigNumber}
                  </p>
                  <p className="text-sm sm:text-base text-white/80 font-medium">{p.bigLabel}</p>
                </div>

                {/* Headline + sub */}
                <div className="px-1">
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 leading-tight whitespace-pre-line mb-2">
                    {p.headline}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500 leading-relaxed">{p.sub}</p>
                </div>

                {/* Steps */}
                <div className="space-y-2.5">
                  {p.steps.map((s) => (
                    <div key={s.n} className="flex items-start gap-3">
                      <span className={`
                        flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center
                        text-xs font-black text-white ${p.accentBg}
                      `}>
                        {s.n}
                      </span>
                      <p className="text-sm sm:text-base text-gray-700 leading-snug pt-0.5">{s.text}</p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="pt-1">
                  {p.isLink ? (
                    <Link
                      to={p.ctaLink as string}
                      className={`
                        w-full sm:w-auto inline-flex items-center justify-center gap-2
                        px-6 py-4 rounded-2xl font-bold text-base text-white
                        transition-opacity active:opacity-80 touch-card ${p.accentBg}
                      `}
                    >
                      {p.cta}
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  ) : (
                    <button
                      onClick={() => document.getElementById(p.ctaLink as string)?.scrollIntoView({ behavior: 'smooth' })}
                      className={`
                        w-full sm:w-auto inline-flex items-center justify-center gap-2
                        px-6 py-4 rounded-2xl font-bold text-base text-white
                        transition-opacity active:opacity-80 touch-card ${p.accentBg}
                      `}
                    >
                      {p.cta}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* RIGHT: Notification card */}
              <div className="lg:sticky lg:top-8">
                {/* Phone frame */}
                <div className="relative mx-auto max-w-xs sm:max-w-sm">
                  {/* Simulated status bar */}
                  <div className="bg-gray-900 rounded-t-3xl px-5 pt-3 pb-2 flex items-center justify-between">
                    <span className="text-[10px] text-gray-300 font-medium">9:41</span>
                    <div className="w-16 h-4 bg-gray-800 rounded-full mx-auto absolute left-1/2 -translate-x-1/2" />
                    <div className="flex gap-1 items-center">
                      <div className="w-3 h-1.5 border border-gray-400 rounded-sm">
                        <div className="w-2 h-full bg-green-400 rounded-sm" />
                      </div>
                    </div>
                  </div>

                  {/* App header */}
                  <div className="bg-gray-900 px-4 py-3 flex items-center gap-2 border-b border-gray-800">
                    <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center">
                      <span className="text-white text-[10px] font-black">H4</span>
                    </div>
                    <div>
                      <p className="text-white text-xs font-semibold">Hub4Estate</p>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        <span className="text-[10px] text-gray-400">Online</span>
                      </div>
                    </div>
                    <div className="ml-auto flex gap-2">
                      <div className="w-1 h-1 rounded-full bg-gray-600" />
                      <div className="w-1 h-1 rounded-full bg-gray-600" />
                      <div className="w-1 h-1 rounded-full bg-gray-600" />
                    </div>
                  </div>

                  {/* Notification card (WhatsApp-style message) */}
                  <div className="bg-[#ECE5DD] px-3 py-4 rounded-b-3xl min-h-[240px]">
                    {/* Timestamp */}
                    <p className="text-center text-[10px] text-gray-500 bg-white/60 rounded-full px-3 py-0.5 w-fit mx-auto mb-3">
                      Aaj, 11:24 AM
                    </p>

                    {/* Message bubble */}
                    <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm p-3.5 max-w-[90%]">
                      {/* Badge row */}
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{p.notif.icon}</span>
                          <span className="text-xs font-bold text-gray-800">{p.notif.title}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.notif.badgeBg}`}>
                          {p.notif.badge}
                        </span>
                      </div>

                      {/* Rows */}
                      <div className="space-y-1.5 mb-2.5">
                        {p.notif.rows.map((row, i) => (
                          <div key={i} className="flex items-start justify-between gap-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex-shrink-0 w-10">{row.k}</span>
                            <span className={`text-xs font-semibold text-right ${i === 0 && p.id === 'homeowner' ? 'text-green-700' : 'text-gray-800'}`}>{row.v}</span>
                          </div>
                        ))}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {p.notif.tags.map((tag) => (
                          <span key={tag} className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Action button */}
                      <button className={`w-full py-2.5 rounded-xl text-xs font-bold text-white ${p.notif.btnBg}`}>
                        {p.notif.btn}
                      </button>

                      {/* Read receipt */}
                      <p className="text-right text-[9px] text-gray-400 mt-1">✓✓ Delivered</p>
                    </div>
                  </div>
                </div>

                {/* Trust row below phone */}
                <div className="mt-4 flex justify-center gap-4 sm:gap-6">
                  {[
                    { v: '500+', l: 'Verified Dealers' },
                    { v: '100%', l: 'GST Billed' },
                    { v: '0', l: 'Hidden Charges' },
                  ].map(({ v, l }) => (
                    <div key={l} className="text-center">
                      <p className="text-base sm:text-lg font-bold text-gray-900">{v}</p>
                      <p className="text-[11px] text-gray-400">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Prev / Next arrows */}
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50 active:scale-95 transition-all hidden sm:flex"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50 active:scale-95 transition-all hidden sm:flex"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* ── Dot nav ── */}
        <div className="flex justify-center gap-2 pb-10 sm:pb-14">
          {PERSONAS.map((persona, i) => (
            <button
              key={persona.id}
              onClick={() => go(i, i > idx ? 'right' : 'left')}
              className={`h-2 rounded-full transition-all duration-300 touch-card ${
                i === idx ? `w-8 ${persona.tabBg}` : 'w-2 bg-gray-200'
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
