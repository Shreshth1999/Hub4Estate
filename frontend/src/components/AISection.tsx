import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// ─── Animated number hook ─────────────────────────────────────────────────────
function useCountUp(to: number, active: boolean, ms = 1400) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    let v = 0;
    const step = to / (ms / 30);
    const t = setInterval(() => {
      v = Math.min(v + step, to);
      setN(Math.round(v));
      if (v >= to) clearInterval(t);
    }, 30);
    return () => clearInterval(t);
  }, [active, to, ms]);
  return n;
}

// ─── Scan Demo ────────────────────────────────────────────────────────────────
const SCAN_ITEMS_EN = ['FRLS 2.5mm² Wire — 200m', 'MCB 32A — 4 pcs', 'DB Box 8-way — 2 pcs', '16A Switch — 20 pcs', 'LED Batten 20W — 10 pcs', '+ 7 more items'];
const SCAN_ITEMS_HI = ['FRLS 2.5mm² Wire — 200m', 'MCB 32A — 4 pcs', 'DB Box 8-way — 2 pcs', '16A Switch — 20 pcs', 'LED Batten 20W — 10 pcs', '+ 7 aur items'];

function ScanDemo({ active, lang }: { active: boolean; lang: string }) {
  const [phase, setPhase] = useState(0);
  const [items, setItems] = useState(0);
  const count = useCountUp(12, phase === 2);
  const SCAN_ITEMS = lang === 'hi' ? SCAN_ITEMS_HI : SCAN_ITEMS_EN;

  useEffect(() => {
    if (!active) return;
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [active]);

  useEffect(() => {
    if (phase !== 2) { setItems(0); return; }
    let i = 0;
    const t = setInterval(() => { i++; setItems(i); if (i >= SCAN_ITEMS.length) clearInterval(t); }, 230);
    return () => clearInterval(t);
  }, [phase]);

  return (
    <div className="rounded-2xl bg-gray-900 overflow-hidden border border-gray-800">
      <div className="relative bg-gray-950 h-24 flex items-center justify-center overflow-hidden">
        {phase < 2 && (
          <div className="absolute inset-3 border border-dashed border-orange-500/50 rounded-lg flex items-center justify-center">
            {phase === 0
              ? <span className="text-3xl opacity-40">📋</span>
              : (
                <>
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.8)]"
                    style={{ animation: 'scan-line 0.7s ease-in-out infinite alternate' }} />
                  <p className="text-orange-400 text-xs font-semibold animate-pulse">
                    {lang === 'hi' ? 'Scanning...' : 'Scanning slip...'}
                  </p>
                </>
              )}
          </div>
        )}
        {phase === 2 && (
          <div className="flex flex-col items-center gap-1">
            <p className="text-4xl font-bold text-white">{count}</p>
            <p className="text-orange-400 text-xs font-semibold">
              {lang === 'hi' ? 'items detect hue' : 'items detected'}
            </p>
          </div>
        )}
      </div>
      <div className="p-3 space-y-1.5 min-h-[110px]">
        {SCAN_ITEMS.slice(0, items).map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-gray-300" style={{ animation: 'ai-pop 0.2s ease both' }}>
            <span className="text-green-400 font-bold">✓</span>
            <span>{item}</span>
          </div>
        ))}
        {items === 0 && <p className="text-xs text-gray-600 text-center pt-3">{lang === 'hi' ? 'Items yahan dikhenge...' : 'Items will appear here...'}</p>}
      </div>
    </div>
  );
}

// ─── Voice Demo ───────────────────────────────────────────────────────────────
const VOICE_MSGS_EN = [
  { text: '"I need Polycab 4mm wire..."', type: 'user' as const, delay: 400 },
  { text: '✓ Product: Polycab 4mm² Wire', type: 'ai' as const, delay: 1400 },
  { text: '"...200 metres, delivery in Jaipur"', type: 'user' as const, delay: 2400 },
  { text: '✓ Qty: 200m · City: Jaipur', type: 'ai' as const, delay: 3400 },
  { text: '🎉 Form ready! Sent to 4 dealers.', type: 'success' as const, delay: 4400 },
];
const VOICE_MSGS_HI = [
  { text: '"Polycab 4mm wire chahiye..."', type: 'user' as const, delay: 400 },
  { text: '✓ Product: Polycab 4mm² Wire', type: 'ai' as const, delay: 1400 },
  { text: '"...200 meter, Jaipur mein"', type: 'user' as const, delay: 2400 },
  { text: '✓ Qty: 200m · City: Jaipur', type: 'ai' as const, delay: 3400 },
  { text: '🎉 Form ready! 4 dealers ko bheja.', type: 'success' as const, delay: 4400 },
];

function VoiceDemo({ active, lang }: { active: boolean; lang: string }) {
  const [shown, setShown] = useState(0);
  const MSGS = lang === 'hi' ? VOICE_MSGS_HI : VOICE_MSGS_EN;

  useEffect(() => {
    if (!active) return;
    const timers = MSGS.map((m, i) => setTimeout(() => setShown(i + 1), m.delay));
    return () => timers.forEach(clearTimeout);
  }, [active]);

  return (
    <div className="rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden">
      <div className="bg-violet-900/30 px-4 py-4 flex flex-col items-center gap-2 border-b border-gray-800">
        <div className="relative">
          {active && <div className="absolute inset-0 rounded-full bg-violet-500/30 animate-ping scale-150" />}
          <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl ${active ? 'bg-violet-600' : 'bg-gray-700'}`}>🎤</div>
        </div>
        {active && (
          <div className="flex gap-0.5 h-4 items-end">
            {[2, 4, 6, 8, 5, 9, 6, 4, 2, 7].map((h, i) => (
              <div key={i} className="w-1 bg-violet-400 rounded-full"
                style={{ height: `${h * 1.8}px`, animation: `ai-wave 0.4s ease infinite alternate`, animationDelay: `${i * 0.08}s` }} />
            ))}
          </div>
        )}
      </div>
      <div className="p-3 space-y-2 min-h-[130px]">
        {MSGS.slice(0, shown).map((m, i) => (
          <div key={i}
            className={`text-xs rounded-xl px-3 py-2 max-w-[85%] ${
              m.type === 'user' ? 'bg-gray-700 text-gray-200 ml-0' :
              m.type === 'ai' ? 'bg-violet-600 text-white ml-auto' :
              'bg-green-900/50 border border-green-600/30 text-green-300 mx-auto text-center w-full max-w-full'
            }`}
            style={{ animation: 'ai-pop 0.25s ease both' }}
          >
            {m.text}
          </div>
        ))}
        {shown === 0 && <p className="text-xs text-gray-600 text-center pt-3">{lang === 'hi' ? 'Bolne ke baad yahan dikhega...' : 'Speak — transcript appears here...'}</p>}
      </div>
    </div>
  );
}

// ─── Compare Demo ─────────────────────────────────────────────────────────────
const QUOTES_EN = [
  { name: 'Delhi Electricals', price: 425, days: '2 days', best: true },
  { name: 'Jaipur Traders', price: 495, days: '1 day', best: false },
  { name: 'Local Shop', price: 585, days: 'Same day', best: false },
];
const QUOTES_HI = [
  { name: 'Delhi Electricals', price: 425, days: '2 din', best: true },
  { name: 'Jaipur Traders', price: 495, days: '1 din', best: false },
  { name: 'Local Shop', price: 585, days: 'Same day', best: false },
];

function CompareDemo({ active, lang }: { active: boolean; lang: string }) {
  const [shown, setShown] = useState(0);
  const saving = useCountUp(3200, active && shown >= 3, 1200);
  const QUOTES = lang === 'hi' ? QUOTES_HI : QUOTES_EN;

  useEffect(() => {
    if (!active) return;
    const timers = QUOTES.map((_, i) => setTimeout(() => setShown(i + 1), 600 + i * 700));
    return () => timers.forEach(clearTimeout);
  }, [active]);

  return (
    <div className="rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden">
      <div className="px-3 py-2.5 border-b border-gray-800 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-300">Philips LED Panel × 20</span>
        <span className="text-[10px] text-green-400 font-bold bg-green-900/30 px-2 py-0.5 rounded-full">{shown} {lang === 'hi' ? 'quotes' : 'quotes'}</span>
      </div>
      <div className="p-3 space-y-2 min-h-[110px]">
        {QUOTES.slice(0, shown).map((q, i) => (
          <div key={i}
            className={`flex items-center justify-between rounded-xl px-3 py-2.5 border ${
              q.best ? 'bg-green-900/30 border-green-600/40' : 'bg-gray-800 border-gray-700'
            }`}
            style={{ animation: 'ai-pop 0.3s ease both' }}
          >
            <div>
              {q.best && <p className="text-[10px] text-green-400 font-bold mb-0.5">★ {lang === 'hi' ? 'Best' : 'Best Deal'}</p>}
              <p className="text-xs font-semibold text-white">{q.name}</p>
              <p className="text-[10px] text-gray-500">{q.days}</p>
            </div>
            <p className={`text-sm font-bold ${q.best ? 'text-green-400' : 'text-gray-400'}`}>₹{q.price}</p>
          </div>
        ))}
        {shown === 0 && <p className="text-xs text-gray-600 text-center pt-3">{lang === 'hi' ? 'Quotes aa rahe hain...' : 'Quotes loading...'}</p>}
      </div>
      {shown >= 3 && (
        <div className="mx-3 mb-3 bg-orange-500 rounded-xl px-3 py-2.5 flex items-center justify-between" style={{ animation: 'ai-pop 0.4s ease both' }}>
          <span className="text-xs text-orange-100 font-medium">{lang === 'hi' ? 'Aapne bachaya' : 'You saved'}</span>
          <span className="text-base font-bold text-white">₹{saving.toLocaleString('en-IN')}</span>
        </div>
      )}
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export function AISection() {
  const { lang } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTriggered(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const FEATURES = [
    {
      id: 'scan',
      emoji: '📷',
      color: 'bg-orange-500',
      label: lang === 'hi' ? 'Slip Scanner' : 'Slip Scanner',
      tagline: lang === 'hi' ? '8 seconds mein 12 items' : '12 items in 8 seconds',
      desc: lang === 'hi'
        ? 'Materials slip ki photo lo. AI turant sab padh ta hai — brand, quantity, specification. Koi typing nahi.'
        : 'Photo your contractor\'s slip. AI reads every item instantly — brand, quantity, spec. No manual typing.',
    },
    {
      id: 'voice',
      emoji: '🎤',
      color: 'bg-violet-600',
      label: lang === 'hi' ? 'Bolo, Hum Sunenge' : 'Voice Input',
      tagline: lang === 'hi' ? 'Hindi + English dono' : 'Hindi & English',
      desc: lang === 'hi'
        ? 'Apna product Hindi mein bolo. "Polycab 4mm wire chahiye 200 meter Jaipur mein" — form khud bhar jaayega.'
        : 'Speak your requirement in Hindi or English. "I need Polycab 4mm wire 200m in Jaipur" — form fills itself.',
    },
    {
      id: 'compare',
      emoji: '📊',
      color: 'bg-green-600',
      label: lang === 'hi' ? 'Smart Compare' : 'Smart Compare',
      tagline: lang === 'hi' ? 'AI best pick karta hai' : 'AI picks the best',
      desc: lang === 'hi'
        ? '3–5 quotes aaye? Volt AI price, delivery aur dealer reliability compare karke best option batata hai.'
        : 'Got 3–5 quotes? Volt AI compares price, delivery and dealer reliability to highlight the best option.',
    },
  ];

  return (
    <section ref={ref} className="bg-white border-y border-gray-100 relative overflow-hidden">
      <style>{`
        @keyframes scan-line { from { top: 0; } to { top: calc(100% - 2px); } }
        @keyframes ai-pop { from { opacity:0; transform:translateY(8px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes ai-wave { from { transform:scaleY(0.3); } to { transform:scaleY(1); } }
        @keyframes shimmer-text {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .shimmer-text {
          background: linear-gradient(90deg,#f97316,#fb923c,#fbbf24,#f97316);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer-text 2.5s linear infinite;
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-20 relative z-10">

        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 mb-5">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-orange-600">
              {lang === 'hi' ? 'Volt AI — India ka Pehla' : 'Volt AI — Powered by AI'}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-900 leading-tight mb-4">
            {lang === 'hi' ? (
              <>Technology{' '}<span className="shimmer-text">jo samajhti hai</span><br />aapki zarourat</>
            ) : (
              <>AI that{' '}<span className="shimmer-text">understands</span><br />what you need</>
            )}
          </h2>
          <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto">
            {lang === 'hi'
              ? 'Photo khicho, Hindi mein bolo, ya simply type karo. Baaki kaam Volt karta hai.'
              : 'Photo, voice, or type — tell us what you need. Volt handles the rest.'}
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={f.id}
              style={{
                opacity: triggered ? 1 : 0,
                transform: triggered ? 'translateY(0)' : 'translateY(24px)',
                transition: `opacity 0.5s ease ${i * 0.12}s, transform 0.5s ease ${i * 0.12}s`,
              }}
            >
              {/* Feature label card */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 mb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-9 h-9 ${f.color} rounded-xl flex items-center justify-center text-lg`}>
                    {f.emoji}
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold text-sm">{f.label}</p>
                    <p className="text-[11px] text-gray-400">{f.tagline}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>

              {/* Demo card */}
              {f.id === 'scan'    && <ScanDemo    active={triggered} lang={lang} />}
              {f.id === 'voice'   && <VoiceDemo   active={triggered} lang={lang} />}
              {f.id === 'compare' && <CompareDemo active={triggered} lang={lang} />}
            </div>
          ))}
        </div>

        {/* Bottom CTA strip */}
        <div
          className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left"
          style={{ opacity: triggered ? 1 : 0, transform: triggered ? 'translateY(0)' : 'translateY(12px)', transition: 'all 0.6s ease 0.5s' }}
        >
          <div className="flex-1">
            <p className="text-gray-900 font-semibold text-base sm:text-lg mb-1">
              {lang === 'hi' ? 'Abhi try karo — koi account nahi chahiye' : 'Try it now — no account needed'}
            </p>
            <p className="text-gray-500 text-sm">
              {lang === 'hi' ? 'Sirf inquiry submit karo. Sab kuch free hai.' : 'Just submit an inquiry. Everything is free.'}
            </p>
          </div>
          <button
            onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto flex-shrink-0 inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold px-6 py-3.5 rounded-2xl transition-colors text-sm"
          >
            {lang === 'hi' ? 'Inquiry Submit Karo' : 'Submit an Inquiry'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
