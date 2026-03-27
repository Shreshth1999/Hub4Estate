import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

// ─── Animated number hook ───────────────────────────────────────────────────────
function useCountUp(to: number, active: boolean, ms = 1500) {
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

// ─── Feature data ───────────────────────────────────────────────────────────────
const FEATURES = [
  {
    id: 'scan',
    emoji: '📷',
    color: 'bg-orange-500',
    glow: 'rgba(249,115,22,0.15)',
    label: 'Slip Scanner',
    tagline: '8 seconds mein 12 items',
    desc: 'Materials slip ki photo lo. AI turant sab padh ta hai — brand, quantity, specification. Koi typing nahi.',
  },
  {
    id: 'voice',
    emoji: '🎤',
    color: 'bg-violet-600',
    glow: 'rgba(124,58,237,0.15)',
    label: 'Bolo, Hum Sunenge',
    tagline: 'Hindi + English dono',
    desc: 'Apna product Hindi mein bolo. "Polycab 4mm wire chahiye 200 meter Jaipur mein" — form khud bhar jaayega.',
  },
  {
    id: 'compare',
    emoji: '📊',
    color: 'bg-green-500',
    glow: 'rgba(34,197,94,0.15)',
    label: 'Smart Compare',
    tagline: 'AI best pick karta hai',
    desc: '3–5 quotes aaye? Volt AI price, delivery aur dealer reliability compare karke best option batata hai.',
  },
] as const;

// ─── Scan animation ─────────────────────────────────────────────────────────────
const SCAN_ITEMS = [
  'FRLS 2.5mm² Wire — 200m',
  'MCB 32A — 4 pcs',
  'DB Box 8-way — 2 pcs',
  '16A Switch — 20 pcs',
  'LED Batten 20W — 10 pcs',
  '+ 7 more items...',
];

function ScanDemo({ active }: { active: boolean }) {
  const [phase, setPhase] = useState(0); // 0=idle 1=scanning 2=done
  const [items, setItems] = useState(0);
  const count = useCountUp(12, phase === 2);

  useEffect(() => {
    if (!active) return;
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => setPhase(2), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [active]);

  useEffect(() => {
    if (phase !== 2) { setItems(0); return; }
    let i = 0;
    const t = setInterval(() => {
      i++; setItems(i);
      if (i >= SCAN_ITEMS.length) clearInterval(t);
    }, 220);
    return () => clearInterval(t);
  }, [phase]);

  return (
    <div className="rounded-2xl bg-gray-900 overflow-hidden border border-gray-800">
      {/* "Photo" area */}
      <div className="relative bg-gray-950 h-28 flex items-center justify-center overflow-hidden">
        {phase < 2 && (
          <div className="absolute inset-3 border border-dashed border-orange-500/40 rounded-lg flex items-center justify-center">
            {phase === 0 ? (
              <span className="text-3xl opacity-50">📋</span>
            ) : (
              <>
                {/* Scan line */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 bg-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.8)]"
                  style={{ animation: 'ai-scan 0.7s ease-in-out infinite alternate' }}
                />
                <p className="text-orange-400 text-xs font-bold animate-pulse">Scanning...</p>
              </>
            )}
          </div>
        )}
        {phase === 2 && (
          <div className="flex flex-col items-center gap-1">
            <p className="text-4xl font-black text-white">{count}</p>
            <p className="text-orange-400 text-xs font-bold">items detected</p>
          </div>
        )}
      </div>
      {/* Items */}
      <div className="p-3 space-y-1.5 min-h-[120px]">
        {SCAN_ITEMS.slice(0, items).map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-gray-300" style={{ animation: 'ai-pop 0.2s ease both' }}>
            <span className="text-green-400 font-bold">✓</span>
            <span>{item}</span>
          </div>
        ))}
        {items === 0 && <p className="text-xs text-gray-600 text-center pt-3">Items yahan dikhenge...</p>}
      </div>
    </div>
  );
}

// ─── Voice animation ────────────────────────────────────────────────────────────
const MSGS = [
  { text: '"Polycab 4mm wire chahiye..."', type: 'user' as const, delay: 400 },
  { text: '✓ Product: Polycab 4mm² Wire', type: 'ai' as const, delay: 1400 },
  { text: '"...200 meter, Jaipur mein"', type: 'user' as const, delay: 2400 },
  { text: '✓ Qty: 200m · City: Jaipur', type: 'ai' as const, delay: 3400 },
  { text: '🎉 Form ready! 4 dealers ko bheja.', type: 'success' as const, delay: 4400 },
];

function VoiceDemo({ active }: { active: boolean }) {
  const [shown, setShown] = useState(0);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    if (!active) return;
    setListening(true);
    const timers = MSGS.map((m, i) => setTimeout(() => setShown(i + 1), m.delay));
    return () => timers.forEach(clearTimeout);
  }, [active]);

  return (
    <div className="rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden">
      {/* Mic */}
      <div className="bg-violet-900/30 px-4 py-5 flex flex-col items-center gap-2 border-b border-gray-800">
        <div className="relative">
          {listening && <div className="absolute inset-0 rounded-full bg-violet-500/30 animate-ping scale-150" />}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${listening ? 'bg-violet-600' : 'bg-gray-700'}`}>
            🎤
          </div>
        </div>
        {listening && (
          <div className="flex gap-0.5 h-5 items-end">
            {[2, 4, 6, 8, 5, 9, 6, 4, 2, 7].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-violet-400 rounded-full"
                style={{ height: `${h * 2}px`, animation: `ai-wave 0.4s ease infinite alternate`, animationDelay: `${i * 0.08}s` }}
              />
            ))}
          </div>
        )}
      </div>
      {/* Chat */}
      <div className="p-3 space-y-2 min-h-[140px]">
        {MSGS.slice(0, shown).map((m, i) => (
          <div
            key={i}
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
        {shown === 0 && <p className="text-xs text-gray-600 text-center pt-3">Bolne ke baad yahan dikhega...</p>}
      </div>
    </div>
  );
}

// ─── Compare animation ──────────────────────────────────────────────────────────
const QUOTES_DATA = [
  { name: 'Delhi Electricals', price: 425, days: '2 din', best: true },
  { name: 'Jaipur Traders', price: 495, days: '1 din', best: false },
  { name: 'Local Store', price: 585, days: 'Same day', best: false },
];

function CompareDemo({ active }: { active: boolean }) {
  const [shown, setShown] = useState(0);
  const saving = useCountUp(3200, active && shown >= 3, 1200);

  useEffect(() => {
    if (!active) return;
    const timers = QUOTES_DATA.map((_, i) => setTimeout(() => setShown(i + 1), 600 + i * 700));
    return () => timers.forEach(clearTimeout);
  }, [active]);

  return (
    <div className="rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden">
      <div className="px-3 py-2.5 border-b border-gray-800 flex items-center justify-between">
        <span className="text-xs font-bold text-gray-300">Philips LED Panel × 20</span>
        <span className="text-[10px] text-green-400 font-bold bg-green-900/30 px-2 py-0.5 rounded-full">{shown} quotes</span>
      </div>
      <div className="p-3 space-y-2 min-h-[120px]">
        {QUOTES_DATA.slice(0, shown).map((q, i) => (
          <div
            key={i}
            className={`flex items-center justify-between rounded-xl px-3 py-2.5 border ${
              q.best ? 'bg-green-900/30 border-green-600/40' : 'bg-gray-800 border-gray-700'
            }`}
            style={{ animation: 'ai-pop 0.3s ease both' }}
          >
            <div>
              {q.best && <p className="text-[10px] text-green-400 font-bold mb-0.5">★ Best</p>}
              <p className="text-xs font-semibold text-white">{q.name}</p>
              <p className="text-[10px] text-gray-500">{q.days}</p>
            </div>
            <p className={`text-sm font-black ${q.best ? 'text-green-400' : 'text-gray-400'}`}>
              ₹{q.price}
            </p>
          </div>
        ))}
        {shown === 0 && <p className="text-xs text-gray-600 text-center pt-3">Quotes aa rahe hain...</p>}
      </div>
      {shown >= 3 && (
        <div className="mx-3 mb-3 bg-orange-500 rounded-xl px-3 py-2.5 flex items-center justify-between" style={{ animation: 'ai-pop 0.4s ease both' }}>
          <span className="text-xs text-orange-100 font-medium">Aapne bachaya</span>
          <span className="text-base font-black text-white">₹{saving.toLocaleString('en-IN')}</span>
        </div>
      )}
    </div>
  );
}

// ─── Main section ───────────────────────────────────────────────────────────────

export function AISection() {
  const ref = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTriggered(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-gray-950 relative overflow-hidden">
      <style>{`
        @keyframes ai-scan {
          from { top: 0; }
          to   { top: calc(100% - 2px); }
        }
        @keyframes ai-pop {
          from { opacity: 0; transform: translateY(8px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes ai-wave {
          from { transform: scaleY(0.3); }
          to   { transform: scaleY(1); }
        }
        @keyframes ai-float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-12px); }
        }
        @keyframes ai-glow-pulse {
          0%,100% { opacity: 0.4; }
          50%      { opacity: 0.8; }
        }
        @keyframes ai-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .ai-shimmer-text {
          background: linear-gradient(90deg,#f97316,#facc15,#f97316,#fb923c);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: ai-shimmer 2.5s linear infinite;
        }
      `}</style>

      {/* Ambient blobs */}
      <div
        className="absolute top-20 left-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)', animation: 'ai-float 9s ease-in-out infinite' }}
      />
      <div
        className="absolute bottom-20 right-1/4 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', animation: 'ai-float 11s ease-in-out infinite reverse' }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-24 relative z-10">

        {/* Header */}
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 mb-5">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-orange-400">Volt AI — India ka Pehla</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white leading-tight mb-4">
            Technology{' '}
            <span className="ai-shimmer-text">jo samajhti hai</span>
            <br />aapki zarourat
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
            Photo khicho, Hindi mein bolo, ya simply type karo. Baaki kaam Volt karta hai.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={f.id}
              style={{
                opacity: triggered ? 1 : 0,
                transform: triggered ? 'translateY(0)' : 'translateY(28px)',
                transition: `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s`,
              }}
            >
              {/* Label card */}
              <div
                className="rounded-2xl border border-gray-800 p-4 mb-3 relative overflow-hidden"
                style={{ background: `radial-gradient(ellipse at top left, ${f.glow} 0%, transparent 70%)` }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-9 h-9 ${f.color} rounded-xl flex items-center justify-center text-lg`}>
                    {f.emoji}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{f.label}</p>
                    <p className="text-[11px] text-gray-400">{f.tagline}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
              </div>

              {/* Demo card */}
              {f.id === 'scan'    && <ScanDemo    active={triggered} />}
              {f.id === 'voice'   && <VoiceDemo   active={triggered} />}
              {f.id === 'compare' && <CompareDemo active={triggered} />}
            </div>
          ))}
        </div>

        {/* Bottom strip */}
        <div
          className="mt-12 rounded-2xl border border-gray-800 bg-gray-900/60 p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left"
          style={{ opacity: triggered ? 1 : 0, transform: triggered ? 'translateY(0)' : 'translateY(16px)', transition: 'all 0.7s ease 0.6s' }}
        >
          <div className="flex-1">
            <p className="text-white font-bold text-base sm:text-lg mb-1">Abhi try karo — koi account nahi chahiye</p>
            <p className="text-gray-400 text-sm">Sirf inquiry submit karo. Sab kuch free hai.</p>
          </div>
          <button
            onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto flex-shrink-0 inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold px-7 py-4 rounded-2xl transition-colors text-sm touch-manipulation"
          >
            Inquiry Submit Karo
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
}
