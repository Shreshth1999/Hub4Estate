import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// ─── Data ──────────────────────────────────────────────────────────────────────

const PERSONAS = [
  {
    id: 'dealer',
    tab: { en: 'Dealer', hi: 'डीलर' },
    color: 'orange',
    bg: 'from-orange-500 to-orange-600',
    accentBg: 'bg-orange-500',
    tabBg: 'bg-orange-500',
    bigNumber: '₹37,000',
    bigLabel: {
      en: 'saved by one customer in a single deal',
      hi: 'ek deal mein bachaye ek customer ne',
    },
    headline: {
      en: 'The right buyer,\nat the right time.',
      hi: 'Sahi buyer,\nsahi time pe.',
    },
    sub: {
      en: 'No more random calls. Verified buyers come to you with their product, quantity, and budget already set — ready to place an order.',
      hi: 'Random calls band. Verified buyers directly aate hain — product, quantity, budget sab pehle se ready.',
    },
    steps: {
      en: [
        'Buyer request arrives — product, quantity, budget specified upfront',
        'Submit your quote in 60 seconds — no paperwork, no calls',
        'Win the deal on merit — fair competition, real orders',
      ],
      hi: [
        'Buyer request aati hai — product, quantity, budget sab pehle se',
        'Quote submit karo — 60 seconds ka kaam',
        'Best deal milti hai — fair competition, guaranteed order',
      ],
    },
    cta: { en: 'Register as Dealer — Free', hi: 'Dealer Register Karo — Free' },
    ctaLink: '/dealer/onboarding',
    isLink: true,
    notif: {
      icon: '🔔',
      title: { en: 'New Order Request', hi: 'Naya Order Request' },
      badge: { en: 'Just Now', hi: 'Abhi Aaya' },
      badgeBg: 'bg-orange-100 text-orange-700',
      rows: {
        en: [
          { k: 'Product', v: 'Polycab FRLS Wire 2.5mm × 200m' },
          { k: 'Budget', v: '₹18,000 – ₹24,000' },
          { k: 'City', v: 'Pune · Delivery in 5 days' },
        ],
        hi: [
          { k: 'Product', v: 'Polycab FRLS Wire 2.5mm × 200m' },
          { k: 'Budget', v: '₹18,000 – ₹24,000' },
          { k: 'City', v: 'Pune · 5 din mein' },
        ],
      },
      tags: { en: ['✓ Verified Buyer', 'GST Ready'], hi: ['✓ Verified Buyer', 'GST Ready'] },
      btn: { en: 'Submit Quote →', hi: 'Quote Bhejo →' },
      btnBg: 'bg-orange-500',
    },
  },
  {
    id: 'architect',
    tab: { en: 'Architect', hi: 'आर्किटेक्ट' },
    color: 'violet',
    bg: 'from-violet-600 to-violet-700',
    accentBg: 'bg-violet-600',
    tabBg: 'bg-violet-600',
    bigNumber: '10x',
    bigLabel: {
      en: 'faster than calling dealers manually',
      hi: 'faster sourcing than calling dealers manually',
    },
    headline: {
      en: 'The right product,\nwith confidence.',
      hi: 'Sahi product,\nconfidence ke saath.',
    },
    sub: {
      en: 'Search by specification, compare verified dealers side by side, and give your clients an accurate quote — without a single phone call.',
      hi: 'Specification ke saath search karo, verified dealers compare karo, client ko proper quote do.',
    },
    steps: {
      en: [
        'Search by spec — brand, finish, rating, wattage, standard',
        'Compare 3–5 verified dealers — price, stock, lead time',
        'Download the quote — ready for client presentation',
      ],
      hi: [
        'Specification ke saath search — brand, finish, rating, wattage',
        '3–5 verified dealers compare karo — price, stock, lead time',
        'Quote download karo — client presentation ke liye ready',
      ],
    },
    cta: { en: 'Submit an Inquiry', hi: 'Inquiry Submit Karo' },
    ctaLink: 'inquiry-form',
    isLink: false,
    notif: {
      icon: '🔍',
      title: { en: 'Search Result', hi: 'Search Result' },
      badge: { en: '3 Dealers Found', hi: '3 Dealers Mile' },
      badgeBg: 'bg-violet-100 text-violet-700',
      rows: {
        en: [
          { k: '★ Best', v: 'Havells Crabtree — ₹185/pc · 2 days' },
          { k: 'Mid', v: 'Anchor Advance — ₹210/pc · 1 day' },
          { k: 'High', v: 'Legrand Myrius — ₹228/pc · 3 days' },
        ],
        hi: [
          { k: '★ Best', v: 'Havells Crabtree — ₹185/pc · 2 din' },
          { k: 'Mid', v: 'Anchor Advance — ₹210/pc · 1 din' },
          { k: 'High', v: 'Legrand Myrius — ₹228/pc · 3 din' },
        ],
      },
      tags: { en: ['BIS Certified', '48hr Price Lock'], hi: ['BIS Certified', '48hr Price Lock'] },
      btn: { en: 'Download Quote →', hi: 'Quote Download Karo →' },
      btnBg: 'bg-violet-600',
    },
  },
  {
    id: 'contractor',
    tab: { en: 'Contractor', hi: 'कॉन्ट्रैक्टर' },
    color: 'gray',
    bg: 'from-gray-800 to-gray-900',
    accentBg: 'bg-gray-800',
    tabBg: 'bg-gray-800',
    bigNumber: '120 → 1',
    bigLabel: {
      en: 'calls replaced by one submission — full materials list',
      hi: 'calls ki jagah ek submission — pura materials list',
    },
    headline: {
      en: 'Your full list,\none submission.',
      hi: 'Pura list,\nEk baar.',
    },
    sub: {
      en: "Photo your materials slip. AI reads every item instantly. 4+ dealers compete on price — you get GST-billed delivery to site.",
      hi: 'Photo khicho apni materials list ki. AI sab padh ta hai. 4+ dealers compete karte hain.',
    },
    steps: {
      en: [
        'Photo your slip or type your list — AI extracts 12+ items instantly',
        'Multiple dealers quote at once — no phone calls',
        'Choose the best deal, site delivery — GST billed, fully tracked',
      ],
      hi: [
        'List ki photo lo ya type karo — AI turant 12+ items nikalta hai',
        'Multiple dealers ek saath quote karte hain — koi call nahi',
        'Best deal chuno, site pe delivery — GST billed, tracked',
      ],
    },
    cta: { en: 'Submit Materials List', hi: 'Materials List Submit Karo' },
    ctaLink: 'inquiry-form',
    isLink: false,
    notif: {
      icon: '🤖',
      title: { en: 'AI Scan Complete', hi: 'AI Scan Complete' },
      badge: { en: '12 Items Found', hi: '12 Items Mile' },
      badgeBg: 'bg-green-100 text-green-700',
      rows: {
        en: [
          { k: '1.', v: 'FRLS Wire 2.5mm — 200m · Polycab' },
          { k: '2.', v: 'MCB 32A — 4 pcs · Schneider' },
          { k: '3.', v: 'DB Box 8-way — 2 pcs · Legrand' },
        ],
        hi: [
          { k: '1.', v: 'FRLS Wire 2.5mm — 200m · Polycab' },
          { k: '2.', v: 'MCB 32A — 4 pcs · Schneider' },
          { k: '3.', v: 'DB Box 8-way — 2 pcs · Legrand' },
        ],
      },
      tags: { en: ['+ 9 more items', '4 dealers quoting'], hi: ['+ 9 aur items', '4 dealers quoting'] },
      btn: { en: 'Get All Quotes →', hi: 'Saare Quotes Lo →' },
      btnBg: 'bg-gray-800',
    },
  },
  {
    id: 'homeowner',
    tab: { en: 'Homeowner', hi: 'घर का मालिक' },
    color: 'green',
    bg: 'from-green-500 to-green-600',
    accentBg: 'bg-green-600',
    tabBg: 'bg-green-600',
    bigNumber: '₹24,000',
    bigLabel: {
      en: 'saved on LED lights alone — by a single homeowner',
      hi: 'ek ghar wale ne bachaye — sirf LED lights order karke',
    },
    headline: {
      en: "Is the price you're getting\nactually good?",
      hi: 'Jo price milti hai,\nwoh sahi hai?',
    },
    sub: {
      en: "Don't trust one dealer's quote. We ask 3–5 verified dealers at the same time. You compare them all, pick the best, and see exactly how much you saved.",
      hi: 'Ek dealer se mat poochho. Hum 3–5 se poochhhte hain. Aap compare karo, best chuno.',
    },
    steps: {
      en: [
        'Tell us the product — name, quantity, city. Takes 2 minutes.',
        'We get quotes from verified dealers — you do nothing',
        'Compare side by side, choose the best — GST bill, warranty included',
      ],
      hi: [
        'Product batao — naam, quantity, shehar. 2 minute.',
        'Hum verified dealers se quote mangwate hain — aapko kuch nahi karna',
        'Quotes compare karo, best chuno — GST bill, warranty sab included',
      ],
    },
    cta: { en: 'Get Free Quotes', hi: 'Free Quotes Lo' },
    ctaLink: 'inquiry-form',
    isLink: false,
    notif: {
      icon: '💬',
      title: { en: 'Your Quotes Are In', hi: 'Aapke Quotes Aaye' },
      badge: { en: '3 Quotes', hi: '3 Quotes' },
      badgeBg: 'bg-green-100 text-green-700',
      rows: {
        en: [
          { k: '★ Best', v: 'Delhi Store — ₹425/pc · 2 days' },
          { k: 'Mid', v: 'Jaipur Traders — ₹495/pc · 1 day' },
          { k: 'High', v: 'Local Shop — ₹585/pc · Same day' },
        ],
        hi: [
          { k: '★ Best', v: 'Delhi Store — ₹425/pc · 2 din' },
          { k: 'Mid', v: 'Jaipur Traders — ₹495/pc · 1 din' },
          { k: 'High', v: 'Local Shop — ₹585/pc · Same day' },
        ],
      },
      tags: { en: ['GST Bill Included', 'You Save: ₹3,200'], hi: ['GST Bill Included', 'Aap Bachate: ₹3,200'] },
      btn: { en: 'Choose Best Quote →', hi: 'Best Quote Chuno →' },
      btnBg: 'bg-green-600',
    },
  },
] as const;

// ─── Component ─────────────────────────────────────────────────────────────────

export function PersonaSection() {
  const { lang } = useLanguage();
  const [idx, setIdx] = useState(0);
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
    }, 260);
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
      className="bg-gray-50 border-y border-gray-100 overflow-hidden"
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
        @keyframes ps-in-r { from { opacity:0; transform:translateX(24px); } to { opacity:1; transform:translateX(0); } }
        @keyframes ps-in-l { from { opacity:0; transform:translateX(-24px); } to { opacity:1; transform:translateX(0); } }
        @keyframes ps-out-r { from { opacity:1; transform:translateX(0); } to { opacity:0; transform:translateX(-24px); } }
        @keyframes ps-out-l { from { opacity:1; transform:translateX(0); } to { opacity:0; transform:translateX(24px); } }
        .ps-er { animation: ps-in-r 0.28s ease forwards; }
        .ps-el { animation: ps-in-l 0.28s ease forwards; }
        .ps-xr { animation: ps-out-r 0.26s ease forwards; }
        .ps-xl { animation: ps-out-l 0.26s ease forwards; }
        .touch-none { -webkit-tap-highlight-color: transparent; }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="pt-10 sm:pt-14 pb-6 sm:pb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-3">
            {lang === 'hi' ? 'Platform ki Khaasiyat' : 'Built For Everyone'}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-900">
            {lang === 'hi' ? 'Aap kaun hain?' : 'Who are you?'}
          </h2>
          <p className="text-gray-400 mt-2 text-sm sm:text-base">
            {lang === 'hi'
              ? 'Apna role select karo — dekhte hain kaise kaam karta hai'
              : 'Select your role to see exactly how Hub4Estate helps you'}
          </p>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6 sm:mb-8 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
          {PERSONAS.map((persona, i) => (
            <button
              key={persona.id}
              onClick={() => go(i, i > idx ? 'right' : 'left')}
              className={`
                relative flex-shrink-0 px-4 sm:px-6 py-3 rounded-2xl font-semibold
                text-sm transition-all duration-300 touch-none min-h-[48px]
                ${i === idx
                  ? `${persona.tabBg} text-white shadow-md scale-105`
                  : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'}
              `}
            >
              {persona.tab[lang]}
              {i === idx && (
                <span
                  key={progressKey}
                  className="pg-bar-inner absolute bottom-0 left-0 right-0 h-0.5 bg-white/40 rounded-b-2xl"
                />
              )}
            </button>
          ))}
        </div>

        {/* Main Card */}
        <div className="relative pb-10 sm:pb-14">
          <div className={animating
            ? (dir === 'right' ? 'ps-xr' : 'ps-xl')
            : (dir === 'right' ? 'ps-er' : 'ps-el')
          }>
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-start">

              {/* LEFT: Story */}
              <div className="flex flex-col gap-5">

                {/* Big number card */}
                <div className={`rounded-2xl p-6 sm:p-8 bg-gradient-to-br ${p.bg} text-white`}>
                  <p className="text-5xl sm:text-6xl font-bold tracking-tight mb-1 leading-none">
                    {p.bigNumber}
                  </p>
                  <p className="text-sm sm:text-base text-white/80 mt-1">{p.bigLabel[lang]}</p>
                </div>

                {/* Headline + sub */}
                <div>
                  <h3 className="text-2xl sm:text-3xl font-semibold text-gray-900 leading-tight whitespace-pre-line mb-2">
                    {p.headline[lang]}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500 leading-relaxed">{p.sub[lang]}</p>
                </div>

                {/* Steps */}
                <div className="space-y-3">
                  {p.steps[lang].map((s, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${p.accentBg}`}>
                        {i + 1}
                      </span>
                      <p className="text-sm sm:text-base text-gray-700 leading-snug pt-0.5">{s}</p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div>
                  {p.isLink ? (
                    <Link
                      to={p.ctaLink as string}
                      className={`inline-flex items-center gap-2 px-6 py-4 rounded-2xl font-semibold text-base text-white transition-opacity active:opacity-80 touch-none ${p.accentBg}`}
                    >
                      {p.cta[lang]}
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  ) : (
                    <button
                      onClick={() => document.getElementById(p.ctaLink as string)?.scrollIntoView({ behavior: 'smooth' })}
                      className={`inline-flex items-center gap-2 px-6 py-4 rounded-2xl font-semibold text-base text-white transition-opacity active:opacity-80 touch-none ${p.accentBg}`}
                    >
                      {p.cta[lang]}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* RIGHT: Phone Mockup */}
              <div className="lg:sticky lg:top-8">
                <div className="relative mx-auto max-w-[320px]">

                  {/* Phone frame */}
                  <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-200">

                    {/* Status bar */}
                    <div className="bg-gray-900 px-5 pt-3.5 pb-2 flex items-center justify-between">
                      <span className="text-[11px] text-gray-300 font-medium">9:41</span>
                      <div className="w-16 h-3.5 bg-gray-800 rounded-full mx-auto absolute left-1/2 -translate-x-1/2" />
                      <div className="flex gap-1 items-center">
                        <div className="w-3 h-1.5 border border-gray-400 rounded-sm relative overflow-hidden">
                          <div className="absolute inset-0 w-2/3 bg-green-400" />
                        </div>
                      </div>
                    </div>

                    {/* App header */}
                    <div className="bg-gray-900 px-4 py-3 flex items-center gap-2.5 border-b border-gray-800">
                      <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">H4</span>
                      </div>
                      <div>
                        <p className="text-white text-xs font-semibold leading-none">Hub4Estate</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                          <span className="text-[10px] text-gray-400">Online</span>
                        </div>
                      </div>
                      <div className="ml-auto flex gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-gray-600" />
                        <div className="w-1 h-1 rounded-full bg-gray-600" />
                        <div className="w-1 h-1 rounded-full bg-gray-600" />
                      </div>
                    </div>

                    {/* Chat area */}
                    <div className="bg-[#ECE5DD] px-3 py-4 min-h-[260px]">
                      <p className="text-center text-[10px] text-gray-500 bg-white/60 rounded-full px-3 py-0.5 w-fit mx-auto mb-3">
                        {lang === 'hi' ? 'Aaj, 11:24 AM' : 'Today, 11:24 AM'}
                      </p>

                      {/* Message bubble */}
                      <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm p-3.5 max-w-[92%]">
                        {/* Header row */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">{p.notif.icon}</span>
                            <span className="text-xs font-bold text-gray-800">{p.notif.title[lang]}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.notif.badgeBg}`}>
                            {p.notif.badge[lang]}
                          </span>
                        </div>

                        {/* Data rows */}
                        <div className="space-y-1.5 mb-3">
                          {p.notif.rows[lang].map((row, i) => (
                            <div key={i} className="flex items-start justify-between gap-2">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex-shrink-0 w-10">{row.k}</span>
                              <span className={`text-xs font-semibold text-right ${i === 0 && p.id === 'homeowner' ? 'text-green-700' : 'text-gray-800'}`}>{row.v}</span>
                            </div>
                          ))}
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {p.notif.tags[lang].map((tag) => (
                            <span key={tag} className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Action button */}
                        <button className={`w-full py-2.5 rounded-xl text-xs font-bold text-white ${p.notif.btnBg}`}>
                          {p.notif.btn[lang]}
                        </button>

                        <p className="text-right text-[9px] text-gray-400 mt-1">✓✓ Delivered</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trust row */}
                <div className="mt-5 flex justify-center gap-6 sm:gap-8">
                  {[
                    { v: '500+', en: 'Verified Dealers', hi: 'Verified Dealers' },
                    { v: '100%', en: 'GST Billed', hi: 'GST Billed' },
                    { v: '₹0', en: 'Hidden Fees', hi: 'Hidden Charges' },
                  ].map(({ v, en, hi }) => (
                    <div key={v} className="text-center">
                      <p className="text-lg font-bold text-gray-900">{v}</p>
                      <p className="text-[11px] text-gray-400">{lang === 'hi' ? hi : en}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Prev / Next arrows — desktop only */}
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white border border-gray-200 rounded-full shadow flex items-center justify-center text-gray-600 hover:bg-gray-50 active:scale-95 transition-all hidden sm:flex"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white border border-gray-200 rounded-full shadow flex items-center justify-center text-gray-600 hover:bg-gray-50 active:scale-95 transition-all hidden sm:flex"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dot nav */}
        <div className="flex justify-center gap-2 pb-10 sm:pb-14">
          {PERSONAS.map((persona, i) => (
            <button
              key={persona.id}
              onClick={() => go(i, i > idx ? 'right' : 'left')}
              className={`h-2 rounded-full transition-all duration-300 touch-none ${
                i === idx ? `w-8 ${persona.tabBg}` : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
