import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Camera, Mic, BarChart2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// ─── Feature data ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    id: 'scan',
    Icon: Camera,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
    en: {
      label: 'Slip Scanner',
      tagline: 'Photo any materials slip',
      desc: 'AI reads brand, quantity, and spec from your contractor\'s slip. No typing — form fills itself.',
      metric: '12 items in 8 sec',
    },
    hi: {
      label: 'Slip Scanner',
      tagline: 'Materials slip ki photo lo',
      desc: 'AI turant brand, quantity, aur spec padh leta hai. Koi typing nahi — form khud bhar jaata hai.',
      metric: '8 seconds mein 12 items',
    },
    demo: [
      { text: 'FRLS 2.5mm² Wire — 200m', brand: 'Polycab' },
      { text: 'MCB 32A Double Pole', brand: 'Schneider' },
      { text: 'DB Box 8-way', brand: 'Legrand' },
      { text: '16A Modular Switch', brand: 'Havells' },
      { text: 'LED Batten 20W', brand: 'Philips' },
    ],
  },
  {
    id: 'voice',
    Icon: Mic,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
    en: {
      label: 'Voice Input',
      tagline: 'Speak in Hindi or English',
      desc: 'Say what you need out loud — product, quantity, city. Volt fills your inquiry form automatically.',
      metric: 'Hindi + English',
    },
    hi: {
      label: 'Voice Input',
      tagline: 'Hindi ya English mein bolo',
      desc: 'Apna requirement bolo — product, quantity, city. Volt form khud bhar deta hai.',
      metric: 'Hindi + English dono',
    },
    messages: [
      { role: 'user', en: '"I need Polycab 4mm wire, 200 metres"', hi: '"Polycab 4mm wire chahiye, 200 meter"' },
      { role: 'ai', en: '✓ Product: Polycab 4mm² · Qty: 200m', hi: '✓ Product: Polycab 4mm² · Qty: 200m' },
      { role: 'user', en: '"Delivery in Jaipur"', hi: '"Jaipur mein deliver karna"' },
      { role: 'ai', en: '✓ City: Jaipur — form ready, sending to 4 dealers', hi: '✓ City: Jaipur — form ready, 4 dealers ko bheja' },
    ],
  },
  {
    id: 'compare',
    Icon: BarChart2,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-100',
    en: {
      label: 'Smart Compare',
      tagline: 'AI highlights the best deal',
      desc: 'When 3–5 quotes arrive, Volt ranks them by price, delivery time, and dealer reliability.',
      metric: 'Up to ₹37,000 saved',
    },
    hi: {
      label: 'Smart Compare',
      tagline: 'AI best deal highlight karta hai',
      desc: '3–5 quotes aate hain, Volt price, delivery, aur dealer reliability ke basis pe rank karta hai.',
      metric: '₹37,000 tak bachaye',
    },
    quotes: [
      { name: 'Delhi Electricals', price: 425, days: { en: '2 days', hi: '2 din' }, best: true },
      { name: 'Jaipur Traders', price: 495, days: { en: '1 day', hi: '1 din' }, best: false },
      { name: 'Local Shop', price: 585, days: { en: 'Same day', hi: 'Same day' }, best: false },
    ],
  },
] as const;

// ─── Main Section ─────────────────────────────────────────────────────────────
export function AISection() {
  const { lang } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);
  const [activeDemo, setActiveDemo] = useState<number | null>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTriggered(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-gray-50 border-y border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            {lang === 'hi' ? 'Volt AI — Powered by AI' : 'Volt AI'}
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
            {lang === 'hi' ? 'Aapke liye kaam karne wali technology' : 'AI that works for you'}
          </h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-lg">
            {lang === 'hi'
              ? 'Photo khicho, Hindi mein bolo, ya type karo. Volt form bhar deta hai aur dealers se best price laata hai.'
              : 'Scan a slip, speak your requirement, or just type. Volt fills your form and fetches the best price from verified dealers.'}
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-5">
          {FEATURES.map((f, i) => {
            const content = f[lang as 'en' | 'hi'] || f.en;
            const isActive = activeDemo === i;

            return (
              <div
                key={f.id}
                onClick={() => setActiveDemo(isActive ? null : i)}
                className={`rounded-2xl border bg-white cursor-pointer transition-all duration-200 overflow-hidden ${
                  isActive ? `${f.border} shadow-md` : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                }`}
                style={{
                  opacity: triggered ? 1 : 0,
                  transform: triggered ? 'translateY(0)' : 'translateY(16px)',
                  transition: `opacity 0.4s ease ${i * 0.1}s, transform 0.4s ease ${i * 0.1}s, box-shadow 0.2s ease, border-color 0.2s ease`,
                }}
              >
                {/* Card header */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-9 h-9 ${f.bg} rounded-xl flex items-center justify-center`}>
                      <f.Icon className={`w-4.5 h-4.5 ${f.color}`} />
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${f.bg} ${f.color}`}>
                      {content.metric}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">{content.label}</p>
                  <p className="text-xs text-gray-400 mb-2">{content.tagline}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{content.desc}</p>
                </div>

                {/* Demo panel — expands on click */}
                {isActive && (
                  <div className="border-t border-gray-50 bg-gray-900 p-3.5">
                    {f.id === 'scan' && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] text-gray-500 mb-2">
                          {lang === 'hi' ? 'Detect kiye gaye items:' : 'Detected items:'}
                        </p>
                        {(f as typeof FEATURES[0]).demo.map((item, j) => (
                          <div
                            key={j}
                            className="flex items-center justify-between text-[11px]"
                            style={{ animation: `fade-up 0.2s ease ${j * 0.06}s both` }}
                          >
                            <span className="text-gray-300">
                              <span className="text-green-400 mr-1.5">✓</span>{item.text}
                            </span>
                            <span className="text-gray-500 text-[9px]">{item.brand}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {f.id === 'voice' && (
                      <div className="space-y-2">
                        {(f as typeof FEATURES[1]).messages.map((m, j) => (
                          <div
                            key={j}
                            className={`text-[11px] rounded-xl px-2.5 py-1.5 max-w-[90%] ${
                              m.role === 'user' ? 'bg-gray-700 text-gray-300' : 'bg-violet-600 text-white ml-auto'
                            }`}
                            style={{ animation: `fade-up 0.2s ease ${j * 0.1}s both` }}
                          >
                            {m[lang as 'en' | 'hi'] || m.en}
                          </div>
                        ))}
                      </div>
                    )}

                    {f.id === 'compare' && (
                      <div className="space-y-2">
                        {(f as typeof FEATURES[2]).quotes.map((q, j) => (
                          <div
                            key={j}
                            className={`flex items-center justify-between rounded-xl px-3 py-2 ${
                              q.best ? 'bg-green-900/40 border border-green-700/30' : 'bg-gray-800'
                            }`}
                            style={{ animation: `fade-up 0.2s ease ${j * 0.08}s both` }}
                          >
                            <div>
                              {q.best && <p className="text-[9px] text-green-400 font-semibold mb-0.5">★ Best deal</p>}
                              <p className="text-[11px] text-white font-medium">{q.name}</p>
                              <p className="text-[9px] text-gray-500">{q.days[lang as 'en' | 'hi'] || q.days.en}</p>
                            </div>
                            <p className={`text-sm font-semibold ${q.best ? 'text-green-400' : 'text-gray-400'}`}>₹{q.price}</p>
                          </div>
                        ))}
                        <p className="text-[10px] text-orange-400 text-center mt-1">
                          {lang === 'hi' ? '₹3,200 bachaye' : '₹3,200 saved vs highest quote'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tap hint */}
        <p className="text-center text-xs text-gray-400 mt-4">
          {lang === 'hi' ? '↑ Kisi bhi card pe tap karo demo dekhne ke liye' : '↑ Tap any card to see a demo'}
        </p>

        {/* Bottom CTA */}
        <div
          className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl border border-gray-100 px-5 py-4"
          style={{ opacity: triggered ? 1 : 0, transition: 'opacity 0.5s ease 0.4s' }}
        >
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {lang === 'hi' ? 'Abhi try karo — free hai, account nahi chahiye' : 'Try it now — it\'s free, no account needed'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {lang === 'hi' ? 'Sirf inquiry submit karo, hum baaki sambhalenge' : 'Submit an inquiry and we handle everything else'}
            </p>
          </div>
          <button
            onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            {lang === 'hi' ? 'Inquiry Submit Karo' : 'Submit an Inquiry'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
