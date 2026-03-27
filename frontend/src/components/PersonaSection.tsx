import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// ─── Data ──────────────────────────────────────────────────────────────────────
const PERSONAS = [
  {
    id: 'dealer',
    color: 'orange',
    dot: 'bg-orange-500',
    activeTab: 'border-orange-500 text-orange-600',
    accentBtn: 'bg-gray-900 hover:bg-gray-800',
    stat: { value: '₹37,000', en: 'saved in one deal', hi: 'ek deal mein bachaye' },
    headline: { en: 'The right buyer, at the right time.', hi: 'Sahi buyer, sahi time pe.' },
    body: {
      en: 'Stop dealing with random calls. Verified buyers come to you with their product, quantity, and budget ready — all you do is quote.',
      hi: 'Random calls band. Verified buyers directly aate hain — product, quantity, budget sab ready.',
    },
    steps: {
      en: ['Buyer arrives with product, quantity, and budget set', 'Submit your quote in under 60 seconds', 'Win orders on merit — no middlemen'],
      hi: ['Buyer request aati hai — sab kuch pehle se ready', 'Quote submit karo — 60 seconds', 'Fair competition mein best deal milti hai'],
    },
    cta: { en: 'Register as Dealer — Free', hi: 'Dealer Register Karo — Free' },
    ctaLink: '/dealer/onboarding',
    isLink: true,
    notif: {
      icon: '🔔',
      title: { en: 'New Order Request', hi: 'Naya Order Request' },
      badge: { en: 'Just in', hi: 'Abhi Aaya' },
      badgeColor: 'text-orange-600 bg-orange-50',
      rows: {
        en: [{ k: 'Product', v: 'Polycab FRLS Wire 2.5mm × 200m' }, { k: 'Budget', v: '₹18,000 – ₹24,000' }, { k: 'City', v: 'Pune · 5 days' }],
        hi: [{ k: 'Product', v: 'Polycab FRLS Wire 2.5mm × 200m' }, { k: 'Budget', v: '₹18,000 – ₹24,000' }, { k: 'City', v: 'Pune · 5 din' }],
      },
      tags: { en: ['Verified Buyer', 'GST Ready'], hi: ['Verified Buyer', 'GST Ready'] },
      btn: { en: 'Quote Now', hi: 'Quote Bhejo' },
      btnColor: 'bg-orange-500 hover:bg-orange-600',
    },
  },
  {
    id: 'architect',
    color: 'violet',
    dot: 'bg-violet-600',
    activeTab: 'border-violet-600 text-violet-700',
    accentBtn: 'bg-gray-900 hover:bg-gray-800',
    stat: { value: '10×', en: 'faster than calling dealers manually', hi: 'dealers se manually call karne se faster' },
    headline: { en: 'Specify once. Compare everything.', hi: 'Ek baar specify karo. Sab compare karo.' },
    body: {
      en: 'Search by specification, compare verified dealers on price and lead time, and present accurate quotes to your clients.',
      hi: 'Specification ke saath search karo, verified dealers compare karo, client ko proper quote do.',
    },
    steps: {
      en: ['Search by brand, rating, finish, or standard', 'Compare 3–5 dealers — price, stock, lead time', 'Download a clean quote for client presentations'],
      hi: ['Brand, rating, finish se search karo', '3–5 verified dealers compare karo', 'Client ke liye quote download karo'],
    },
    cta: { en: 'Submit an Inquiry', hi: 'Inquiry Submit Karo' },
    ctaLink: 'inquiry-form',
    isLink: false,
    notif: {
      icon: '🔍',
      title: { en: 'Search Results', hi: 'Search Result' },
      badge: { en: '3 dealers', hi: '3 Dealers' },
      badgeColor: 'text-violet-600 bg-violet-50',
      rows: {
        en: [{ k: '★ Best', v: 'Havells Crabtree — ₹185/pc · 2 days' }, { k: 'Mid', v: 'Anchor — ₹210/pc · 1 day' }, { k: 'High', v: 'Legrand — ₹228/pc · 3 days' }],
        hi: [{ k: '★ Best', v: 'Havells Crabtree — ₹185/pc · 2 din' }, { k: 'Mid', v: 'Anchor — ₹210/pc · 1 din' }, { k: 'High', v: 'Legrand — ₹228/pc · 3 din' }],
      },
      tags: { en: ['BIS Certified', '48hr Lock'], hi: ['BIS Certified', '48hr Lock'] },
      btn: { en: 'Download Quote', hi: 'Quote Download' },
      btnColor: 'bg-violet-600 hover:bg-violet-700',
    },
  },
  {
    id: 'contractor',
    color: 'gray',
    dot: 'bg-gray-800',
    activeTab: 'border-gray-800 text-gray-900',
    accentBtn: 'bg-gray-900 hover:bg-gray-800',
    stat: { value: '120 → 1', en: 'calls replaced by one submission', hi: 'calls ki jagah ek submission' },
    headline: { en: 'Your full list. One submission.', hi: 'Pura list. Ek baar.' },
    body: {
      en: 'Photo your materials slip — AI reads every item. Multiple dealers quote simultaneously. GST-billed delivery to site.',
      hi: 'Materials slip ki photo lo. AI sab padh ta hai. Multiple dealers quote karte hain.',
    },
    steps: {
      en: ['Photo your slip — AI extracts 12+ items instantly', 'Multiple dealers quote at the same time', 'Choose the best, get GST-billed site delivery'],
      hi: ['List ki photo lo — AI turant 12+ items nikalta hai', 'Multiple dealers ek saath quote karte hain', 'Best deal chuno, GST billed delivery'],
    },
    cta: { en: 'Submit Materials List', hi: 'Materials List Submit Karo' },
    ctaLink: 'inquiry-form',
    isLink: false,
    notif: {
      icon: '🤖',
      title: { en: 'AI Scan Complete', hi: 'AI Scan Complete' },
      badge: { en: '12 items', hi: '12 Items' },
      badgeColor: 'text-green-700 bg-green-50',
      rows: {
        en: [{ k: '1.', v: 'FRLS Wire 2.5mm² — 200m · Polycab' }, { k: '2.', v: 'MCB 32A — 4 pcs · Schneider' }, { k: '3.', v: 'DB Box 8-way — 2 pcs · Legrand' }],
        hi: [{ k: '1.', v: 'FRLS Wire 2.5mm² — 200m · Polycab' }, { k: '2.', v: 'MCB 32A — 4 pcs · Schneider' }, { k: '3.', v: 'DB Box 8-way — 2 pcs · Legrand' }],
      },
      tags: { en: ['+ 9 more items', '4 dealers quoting'], hi: ['+ 9 aur items', '4 dealers quoting'] },
      btn: { en: 'Get All Quotes', hi: 'Saare Quotes Lo' },
      btnColor: 'bg-gray-800 hover:bg-gray-700',
    },
  },
  {
    id: 'homeowner',
    color: 'green',
    dot: 'bg-green-600',
    activeTab: 'border-green-600 text-green-700',
    accentBtn: 'bg-gray-900 hover:bg-gray-800',
    stat: { value: '₹24,000', en: 'saved on LED lights by one homeowner', hi: 'ek ghar wale ne LED lights par bachaye' },
    headline: { en: 'Is the price you were quoted actually fair?', hi: 'Jo price mili, kya woh sahi thi?' },
    body: {
      en: "Don't rely on one dealer's word. We contact 3–5 verified dealers at once, you get all their quotes, and you choose.",
      hi: 'Ek dealer pe mat ruko. Hum 3–5 se poochhhte hain. Aap compare karo, best chuno.',
    },
    steps: {
      en: ['Tell us the product — name, quantity, your city', 'We get quotes from verified dealers — nothing to do', 'Compare side by side, pick the best — GST bill included'],
      hi: ['Product batao — naam, quantity, shehar', 'Hum verified dealers se quote mangwate hain', 'Compare karo, best chuno — GST bill included'],
    },
    cta: { en: 'Get Free Quotes', hi: 'Free Quotes Lo' },
    ctaLink: 'inquiry-form',
    isLink: false,
    notif: {
      icon: '💬',
      title: { en: 'Your Quotes Are In', hi: 'Aapke Quotes Aaye' },
      badge: { en: '3 quotes', hi: '3 Quotes' },
      badgeColor: 'text-green-700 bg-green-50',
      rows: {
        en: [{ k: '★ Best', v: 'Delhi Store — ₹425/pc · 2 days' }, { k: 'Mid', v: 'Jaipur Traders — ₹495/pc · 1 day' }, { k: 'High', v: 'Local — ₹585/pc · Same day' }],
        hi: [{ k: '★ Best', v: 'Delhi Store — ₹425/pc · 2 din' }, { k: 'Mid', v: 'Jaipur Traders — ₹495/pc · 1 din' }, { k: 'High', v: 'Local — ₹585/pc · Same day' }],
      },
      tags: { en: ['GST Included', 'You save ₹3,200'], hi: ['GST Included', 'Aap bachate ₹3,200'] },
      btn: { en: 'Choose Best', hi: 'Best Chuno' },
      btnColor: 'bg-green-600 hover:bg-green-700',
    },
  },
] as const;

// ─── Component ─────────────────────────────────────────────────────────────────
export function PersonaSection() {
  const { lang } = useLanguage();
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const go = (next: number) => {
    if (fading || next === idx) return;
    setFading(true);
    setTimeout(() => { setIdx(next); setFading(false); }, 220);
  };

  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(() => go((idx + 1) % PERSONAS.length), 6000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [idx, paused]);

  const p = PERSONAS[idx];
  const l = (lang === 'hi' ? 'hi' : 'en') as 'en' | 'hi';

  return (
    <section
      className="bg-white border-t border-gray-100"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            {lang === 'hi' ? 'Aap kaun hain?' : 'Who are you?'}
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            {lang === 'hi' ? 'Hub4Estate kaise kaam karta hai aapke liye' : 'See how Hub4Estate works for you'}
          </h2>
        </div>

        {/* Tab Bar — minimal underline style */}
        <div className="flex gap-0 border-b border-gray-100 mb-8 overflow-x-auto scrollbar-hide">
          {PERSONAS.map((persona, i) => (
            <button
              key={persona.id}
              onClick={() => go(i)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap -mb-px ${
                i === idx
                  ? `${persona.activeTab} border-b-2`
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${i === idx ? persona.dot : 'bg-gray-200'}`} />
              {lang === 'hi'
                ? ['डीलर', 'आर्किटेक्ट', 'कॉन्ट्रैक्टर', 'घर का मालिक'][i]
                : ['Dealer', 'Architect', 'Contractor', 'Homeowner'][i]}
            </button>
          ))}
        </div>

        {/* Content */}
        <div
          className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start"
          style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.22s ease' }}
        >
          {/* LEFT */}
          <div>
            {/* Stat */}
            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight">{p.stat.value}</span>
              <span className="text-sm text-gray-400">{p.stat[l]}</span>
            </div>

            {/* Headline */}
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-snug mb-3">
              {p.headline[l]}
            </h3>

            {/* Body */}
            <p className="text-sm sm:text-base text-gray-500 leading-relaxed mb-6">{p.body[l]}</p>

            {/* Steps */}
            <ol className="space-y-3 mb-7">
              {p.steps[l].map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                  <span className={`flex-shrink-0 w-5 h-5 rounded-full text-xs font-semibold text-white flex items-center justify-center mt-0.5 ${p.dot}`}>
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>

            {/* CTA */}
            {p.isLink ? (
              <Link to={p.ctaLink as string} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-colors ${p.accentBtn}`}>
                {p.cta[l]} <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                onClick={() => document.getElementById(p.ctaLink as string)?.scrollIntoView({ behavior: 'smooth' })}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-colors ${p.accentBtn}`}
              >
                {p.cta[l]} <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* RIGHT — clean notification card */}
          <div>
            {/* Phone frame */}
            <div className="mx-auto max-w-[300px] rounded-3xl overflow-hidden border border-gray-200 shadow-xl shadow-gray-100">
              {/* Status bar */}
              <div className="bg-gray-900 px-5 pt-3 pb-1.5 flex items-center justify-between">
                <span className="text-[10px] text-gray-400">9:41</span>
                <div className="w-14 h-3 bg-gray-800 rounded-full absolute left-1/2 -translate-x-1/2" />
                <div className="w-3 h-1.5 border border-gray-600 rounded-sm overflow-hidden">
                  <div className="h-full w-2/3 bg-green-400" />
                </div>
              </div>

              {/* App bar */}
              <div className="bg-gray-900 px-4 py-2.5 flex items-center gap-2 border-b border-gray-800">
                <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                  <span className="text-white text-[9px] font-bold">H4</span>
                </div>
                <div>
                  <p className="text-white text-xs font-medium leading-none">Hub4Estate</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-1 h-1 rounded-full bg-green-400" />
                    <span className="text-[9px] text-gray-500">Online</span>
                  </div>
                </div>
              </div>

              {/* Chat bubble area */}
              <div className="bg-[#F0EBE3] px-3 py-3 min-h-[220px]">
                <p className="text-[9px] text-gray-400 bg-white/60 rounded-full px-2.5 py-0.5 w-fit mx-auto mb-3 text-center">
                  {lang === 'hi' ? 'Aaj, 11:24 AM' : 'Today, 11:24 AM'}
                </p>
                <div className="bg-white rounded-xl rounded-tl-sm shadow-sm p-3 max-w-[88%]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{p.notif.icon}</span>
                      <span className="text-xs font-semibold text-gray-800">{p.notif.title[l]}</span>
                    </div>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${p.notif.badgeColor}`}>
                      {p.notif.badge[l]}
                    </span>
                  </div>
                  <div className="space-y-1 mb-2">
                    {p.notif.rows[l].map((row, i) => (
                      <div key={i} className="flex items-start justify-between gap-2">
                        <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide w-9 flex-shrink-0">{row.k}</span>
                        <span className="text-[10px] text-gray-700 font-medium text-right">{row.v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {p.notif.tags[l].map(tag => (
                      <span key={tag} className="text-[9px] font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                  <button className={`w-full py-2 rounded-lg text-[10px] font-semibold text-white transition-colors ${p.notif.btnColor}`}>
                    {p.notif.btn[l]} →
                  </button>
                  <p className="text-right text-[8px] text-gray-300 mt-1">✓✓</p>
                </div>
              </div>
            </div>

            {/* Trust stats */}
            <div className="mt-4 flex justify-center gap-8">
              {[
                { v: '500+', en: 'Verified Dealers', hi: 'Verified Dealers' },
                { v: '₹0', en: 'Hidden Fees', hi: 'Hidden Charges' },
                { v: '100%', en: 'GST Billed', hi: 'GST Billed' },
              ].map(({ v, en, hi }) => (
                <div key={v} className="text-center">
                  <p className="text-sm font-semibold text-gray-900">{v}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{lang === 'hi' ? hi : en}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dot nav */}
        <div className="flex justify-center gap-1.5 mt-8">
          {PERSONAS.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={`h-1 rounded-full transition-all duration-300 ${i === idx ? `w-6 ${p.dot}` : 'w-1.5 bg-gray-200'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
