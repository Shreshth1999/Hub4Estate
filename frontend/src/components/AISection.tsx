import { useEffect, useRef, useState } from 'react';
import { Camera, Mic, BarChart3, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';

// ─── Animated counter hook ─────────────────────────────────────────────────────
function useCountUp(target: number, trigger: boolean, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const step = target / (duration / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 40);
    return () => clearInterval(timer);
  }, [target, trigger, duration]);
  return count;
}

// ─── Slip scanner animation ────────────────────────────────────────────────────
const SCAN_ITEMS = [
  'FRLS 2.5mm² Wire — 200m',
  'MCB 32A Double Pole — 4 pcs',
  'DB Box 8-way — 2 pcs',
  '16A Switch Socket — 20 pcs',
  'Exhaust Fan 250mm — 3 pcs',
  'LED Batten 20W — 10 pcs',
];

function SlipScannerCard({ triggered }: { triggered: boolean }) {
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'done'>('idle');
  const [visibleItems, setVisibleItems] = useState<number>(0);
  const count = useCountUp(12, phase === 'done');

  useEffect(() => {
    if (!triggered) return;
    const t1 = setTimeout(() => setPhase('scanning'), 300);
    const t2 = setTimeout(() => setPhase('done'), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [triggered]);

  useEffect(() => {
    if (phase !== 'done') return;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setVisibleItems(i);
      if (i >= SCAN_ITEMS.length) clearInterval(timer);
    }, 180);
    return () => clearInterval(timer);
  }, [phase]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm h-full flex flex-col">
      {/* Top image area */}
      <div className="relative bg-gray-900 flex items-center justify-center" style={{ minHeight: 120 }}>
        {phase === 'idle' && (
          <div className="flex flex-col items-center gap-2 py-6">
            <Camera className="w-8 h-8 text-orange-400" />
            <p className="text-xs text-gray-400">Materials slip ki photo lo</p>
          </div>
        )}
        {phase === 'scanning' && (
          <div className="flex flex-col items-center gap-3 py-6 w-full px-6">
            <div className="w-full bg-gray-800 rounded-lg h-16 relative overflow-hidden">
              {/* Scan line */}
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-0.5 bg-orange-400/60" />
              </div>
              <div
                className="absolute top-0 left-0 h-full w-0.5 bg-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.8)]"
                style={{ animation: 'scan-sweep 0.8s ease-in-out infinite alternate' }}
              />
            </div>
            <p className="text-xs text-orange-300 font-medium animate-pulse">AI scan ho raha hai...</p>
          </div>
        )}
        {phase === 'done' && (
          <div className="flex flex-col items-center gap-2 py-5">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <span className="text-white font-bold text-lg">{count} items mile</span>
            </div>
            <p className="text-xs text-gray-400">Scan complete — 8 seconds mein</p>
          </div>
        )}
      </div>

      {/* Items list */}
      <div className="flex-1 p-4 space-y-1.5">
        {SCAN_ITEMS.slice(0, visibleItems).map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 text-xs text-gray-700 bg-gray-50 rounded-lg px-3 py-2"
            style={{ animation: 'item-pop 0.2s ease forwards' }}
          >
            <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
            <span className="font-medium">{item}</span>
          </div>
        ))}
        {phase !== 'done' && (
          <div className="flex items-center gap-2 text-xs text-gray-400 px-3 py-2">
            {phase === 'idle' ? 'Yahan items dikhenge...' : '...'}
          </div>
        )}
        {phase === 'done' && visibleItems >= SCAN_ITEMS.length && (
          <div className="text-[11px] text-gray-400 px-3 py-1">+ 6 aur items detected</div>
        )}
      </div>

      {phase === 'done' && (
        <div className="p-4 pt-0">
          <div className="bg-orange-500 text-white text-xs font-bold rounded-xl py-3 text-center">
            Saare 12 items ke Quotes Lo →
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Voice card ────────────────────────────────────────────────────────────────
const VOICE_STEPS = [
  { delay: 0, text: '"Polycab 4mm wire chahiye..."', type: 'voice' },
  { delay: 1200, text: 'Product: Polycab 4mm² Wire ✓', type: 'filled' },
  { delay: 1800, text: '"...200 meter, Jaipur mein"', type: 'voice' },
  { delay: 3000, text: 'Quantity: 200m · City: Jaipur ✓', type: 'filled' },
  { delay: 3800, text: 'Form ready! 3 dealers ko bheja.', type: 'success' },
];

function VoiceCard({ triggered }: { triggered: boolean }) {
  const [shown, setShown] = useState<number>(0);
  const [waves, setWaves] = useState(false);

  useEffect(() => {
    if (!triggered) return;
    setWaves(true);
    VOICE_STEPS.forEach((step, i) => {
      const t = setTimeout(() => setShown(i + 1), step.delay + 400);
      return () => clearTimeout(t);
    });
  }, [triggered]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm h-full flex flex-col">
      {/* Mic area */}
      <div className="bg-gradient-to-br from-violet-600 to-violet-800 px-5 py-6 flex flex-col items-center gap-3">
        <div className="relative">
          <div className={`absolute inset-0 rounded-full bg-white/20 ${waves ? 'animate-ping' : ''}`} />
          <div className={`absolute inset-[-8px] rounded-full bg-white/10 ${waves ? 'animate-ping [animation-delay:0.3s]' : ''}`} />
          <div className="relative w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
            <Mic className={`w-7 h-7 text-violet-600 ${waves ? 'animate-pulse' : ''}`} />
          </div>
        </div>
        <p className="text-white text-sm font-semibold">
          {waves ? '🎙️ Sun raha hoon...' : 'Bolo Hindi ya English mein'}
        </p>
        {waves && (
          <div className="flex gap-1 items-end h-6">
            {[3, 5, 8, 6, 9, 4, 7, 5, 3, 6].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-white/70 rounded-full"
                style={{
                  height: `${h * 2.5}px`,
                  animation: `wave-bar 0.5s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.07}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Chat messages */}
      <div className="flex-1 p-4 space-y-2 overflow-hidden">
        {VOICE_STEPS.slice(0, shown).map((step, i) => (
          <div
            key={i}
            className={`
              text-xs rounded-xl px-3 py-2 max-w-[90%]
              ${step.type === 'voice' ? 'bg-gray-100 text-gray-700 ml-0' : ''}
              ${step.type === 'filled' ? 'bg-violet-100 text-violet-800 font-semibold ml-auto' : ''}
              ${step.type === 'success' ? 'bg-green-100 text-green-800 font-bold ml-0 border border-green-200 w-full max-w-full text-center' : ''}
            `}
            style={{ animation: 'item-pop 0.25s ease forwards' }}
          >
            {step.text}
          </div>
        ))}
        {shown === 0 && (
          <p className="text-xs text-gray-400 text-center pt-2">Bolo — hum samjhenge</p>
        )}
      </div>
    </div>
  );
}

// ─── Compare card ──────────────────────────────────────────────────────────────
const QUOTES = [
  { dealer: 'Delhi Electricals', price: 425, day: 2, best: true },
  { dealer: 'Jaipur Traders', price: 495, day: 1, best: false },
  { dealer: 'Local Store', price: 585, day: 0, best: false },
];

function CompareCard({ triggered }: { triggered: boolean }) {
  const [shown, setShown] = useState(0);
  const saving = useCountUp(3200, triggered && shown >= QUOTES.length);

  useEffect(() => {
    if (!triggered) return;
    QUOTES.forEach((_, i) => {
      const t = setTimeout(() => setShown(i + 1), 600 + i * 600);
      return () => clearTimeout(t);
    });
  }, [triggered]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 bg-green-50 border-b border-green-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-green-600" />
          <span className="text-sm font-bold text-green-800">AI Quote Comparison</span>
        </div>
        <span className="text-[11px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
          Philips LED × 20
        </span>
      </div>

      {/* Quotes */}
      <div className="flex-1 p-4 space-y-2">
        {QUOTES.slice(0, shown).map((q, i) => (
          <div
            key={i}
            className={`
              flex items-center justify-between rounded-xl px-4 py-3 border
              ${q.best
                ? 'bg-green-50 border-green-200 ring-1 ring-green-400'
                : 'bg-gray-50 border-gray-200'}
            `}
            style={{ animation: 'item-pop 0.3s ease forwards' }}
          >
            <div>
              {q.best && <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-0.5">★ Best Price</p>}
              <p className="text-xs font-semibold text-gray-800">{q.dealer}</p>
              <p className="text-[11px] text-gray-500">{q.day === 0 ? 'Same day' : `${q.day} din`}</p>
            </div>
            <p className={`text-base font-bold ${q.best ? 'text-green-700' : 'text-gray-600'}`}>
              ₹{q.price}<span className="text-xs font-normal">/pc</span>
            </p>
          </div>
        ))}
        {shown === 0 && <p className="text-xs text-gray-400 text-center pt-4">Quotes aa rahe hain...</p>}
      </div>

      {/* Savings */}
      {shown >= QUOTES.length && (
        <div className="mx-4 mb-4 bg-gray-900 rounded-xl px-4 py-3 text-center" style={{ animation: 'item-pop 0.4s ease forwards' }}>
          <p className="text-xs text-gray-400 mb-1">Highest quote se bachenge</p>
          <p className="text-2xl font-bold text-orange-400">₹{saving.toLocaleString('en-IN')}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Section ──────────────────────────────────────────────────────────────

export function AISection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTriggered(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="bg-gray-950 relative overflow-hidden">
      <style>{`
        @keyframes scan-sweep {
          from { left: 0%; }
          to   { left: calc(100% - 2px); }
        }
        @keyframes item-pop {
          from { opacity: 0; transform: translateY(6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes wave-bar {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1); }
        }
        @keyframes float-orb {
          0%, 100% { transform: translateY(0) scale(1); }
          50%       { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes shimmer-text {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #f97316 0%, #fbbf24 30%, #f97316 60%, #fb923c 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer-text 3s linear infinite;
        }
      `}</style>

      {/* Ambient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" style={{ animation: 'float-orb 8s ease-in-out infinite' }} />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" style={{ animation: 'float-orb 10s ease-in-out infinite reverse' }} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-24 relative z-10">

        {/* Header */}
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2 mb-5">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">Volt AI — India ka Sabse Smart Tool</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white leading-tight mb-4">
            Technology jo{' '}
            <span className="shimmer-text">kaam karti hai —</span>
            <br className="hidden sm:block" /> chahe tech ho ya na ho
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
            Photo khicho, bolo, ya type karo. Baaki sab Volt AI sambhal ta hai.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">

          {/* Card 1: Slip Scanner */}
          <div
            className="flex flex-col"
            style={{ opacity: triggered ? 1 : 0, transform: triggered ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.6s ease 0.1s' }}
          >
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 mb-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Camera className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">📷 Slip Scanner</p>
                  <p className="text-[11px] text-orange-400 font-medium">8 seconds mein kaam</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Materials slip ki photo lo. AI turant 12+ items padh leta hai — koi typing nahi.
              </p>
            </div>
            <div className="flex-1">
              <SlipScannerCard triggered={triggered} />
            </div>
          </div>

          {/* Card 2: Voice */}
          <div
            className="flex flex-col"
            style={{ opacity: triggered ? 1 : 0, transform: triggered ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.6s ease 0.3s' }}
          >
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 mb-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                  <Mic className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">🎤 Bolo, Hum Sunenge</p>
                  <p className="text-[11px] text-violet-400 font-medium">Hindi + English dono</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Product ka naam Hindi mein bolo. Volt samjhega aur form khud bhar dega.
              </p>
            </div>
            <div className="flex-1">
              <VoiceCard triggered={triggered} />
            </div>
          </div>

          {/* Card 3: Compare */}
          <div
            className="flex flex-col"
            style={{ opacity: triggered ? 1 : 0, transform: triggered ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.6s ease 0.5s' }}
          >
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 mb-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">📊 Auto Compare</p>
                  <p className="text-[11px] text-green-400 font-medium">AI best pick karta hai</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                3-5 quotes aaye? Volt AI price, delivery, aur reliability compare karke best batata hai.
              </p>
            </div>
            <div className="flex-1">
              <CompareCard triggered={triggered} />
            </div>
          </div>

        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-gray-900 border border-gray-800 rounded-2xl px-6 sm:px-8 py-5 sm:py-6">
            <div className="text-center sm:text-left">
              <p className="text-white font-semibold text-base">Abhi try karo — bilkul free</p>
              <p className="text-gray-400 text-sm mt-0.5">Account banana zaroori nahi. Sirf inquiry submit karo.</p>
            </div>
            <button
              onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex-shrink-0 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3.5 rounded-xl transition-colors text-sm whitespace-nowrap"
            >
              Inquiry Submit Karo
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
