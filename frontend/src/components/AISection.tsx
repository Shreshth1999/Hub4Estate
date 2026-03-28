import { ArrowRight, Camera, Mic, BarChart2, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useInView, revealStyle } from '../hooks/useInView';

const SCAN_ITEMS = [
  { text: 'FRLS 2.5mm² Wire — 200m', brand: 'Polycab' },
  { text: 'MCB 32A Double Pole', brand: 'Schneider' },
  { text: 'DB Box 8-way', brand: 'Legrand' },
  { text: '16A Modular Switch', brand: 'Havells' },
];

const voiceMessages = (isHi: boolean) => [
  { role: 'user', text: isHi ? '"Polycab 4mm wire chahiye, 200 meter"' : '"I need Polycab 4mm wire, 200 metres"' },
  { role: 'ai',   text: '✓ Product: Polycab 4mm² · Qty: 200m' },
  { role: 'user', text: isHi ? '"Jaipur mein deliver karna"' : '"Delivery in Jaipur"' },
  { role: 'ai',   text: isHi ? '✓ City: Jaipur — 4 dealers ko bheja' : '✓ City: Jaipur — sent to 4 dealers' },
];

const quotes = (isHi: boolean) => [
  { name: isHi ? 'सत्यापित डीलर A' : 'Verified Dealer A', price: '₹425', time: isHi ? '2 din' : '2 days', best: true },
  { name: isHi ? 'सत्यापित डीलर B' : 'Verified Dealer B', price: '₹495', time: isHi ? '1 din' : '1 day', best: false },
  { name: isHi ? 'सत्यापित डीलर C' : 'Verified Dealer C', price: '₹585', time: 'Same day', best: false },
];

export function AISection() {
  const { lang, tx } = useLanguage();
  const { aiSection } = tx;
  const isHi = lang === 'hi';
  const { ref, inView } = useInView(0.06);

  return (
    <section className="bg-white border-t border-gray-100 overflow-hidden">
      <style>{`
        @keyframes aiSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes aiSlideRight {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes aiFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes barGrow {
          from { width: 0%; }
        }
        .ai-item { animation: aiSlideUp 0.45s cubic-bezier(0.16,1,0.3,1) both; }
        .ai-msg  { animation: aiSlideRight 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .ai-fade { animation: aiFadeIn 0.5s ease both; }
        .ai-bar  { animation: barGrow 1.2s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

      <div ref={ref as any} className="max-w-6xl mx-auto px-6 py-20 sm:py-28">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
          <div style={revealStyle(inView, 0)}>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0B1628] text-white text-[11px] font-bold rounded-full mb-5 uppercase tracking-widest">
              <Zap className="w-3 h-3 text-amber-400" />
              {aiSection.badge}
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-3">
              {aiSection.title}
            </h2>
            <p className="text-lg text-gray-500 max-w-lg leading-relaxed">
              {aiSection.subtitle}
            </p>
          </div>

          {/* Step flow indicator */}
          <div className="flex items-center gap-2 flex-shrink-0" style={revealStyle(inView, 0.08)}>
            {['Scan', 'Match', 'Save'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">
                    {s}
                  </span>
                </div>
                {i < 2 && <div className="w-5 h-px bg-gray-200" />}
              </div>
            ))}
          </div>
        </div>

        {/* ── 3 Cards ── */}
        <div className="grid sm:grid-cols-3 gap-5">

          {/* Card 1 — Slip Scanner */}
          <div
            className="group rounded-2xl border border-gray-100 bg-white overflow-hidden hover:border-amber-200 hover:shadow-2xl hover:shadow-amber-100/40 hover:-translate-y-1.5 transition-all duration-300"
            style={revealStyle(inView, 0.12)}
          >
            {/* Amber accent top */}
            <div className="h-[3px] bg-gradient-to-r from-amber-500 to-amber-400" />

            <div className="p-6 pb-5">
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-amber-200/60">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <span className="text-4xl font-black text-gray-50 group-hover:text-amber-50 transition-colors duration-300 leading-none select-none">01</span>
              </div>
              <p className="text-base font-bold text-gray-900 mb-1">{aiSection.features[0].label}</p>
              <p className="text-xs font-semibold text-amber-600 mb-3">{aiSection.features[0].tagline}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{aiSection.features[0].desc}</p>
            </div>

            <div className="bg-[#0B1628] p-4 border-t border-gray-100/5">
              <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-3 font-bold">Detected items:</p>
              <div className="space-y-2">
                {SCAN_ITEMS.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between text-[11px] ${inView ? 'ai-item' : 'opacity-0'}`}
                    style={{ animationDelay: `${0.15 + i * 0.1}s` }}
                  >
                    <span className="text-gray-300">
                      <span className="text-amber-400 mr-1.5">✓</span>{item.text}
                    </span>
                    <span className="text-gray-600 text-[9px] font-medium">{item.brand}</span>
                  </div>
                ))}
                <p
                  className={`text-[9px] text-gray-600 pt-2.5 border-t border-white/5 ${inView ? 'ai-fade' : 'opacity-0'}`}
                  style={{ animationDelay: '0.55s' }}
                >
                  {isHi ? '+ 8 aur items detect hue' : '+ 8 more items detected'}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2 — Voice Input */}
          <div
            className="group rounded-2xl border border-gray-100 bg-white overflow-hidden hover:border-amber-200 hover:shadow-2xl hover:shadow-amber-100/40 hover:-translate-y-1.5 transition-all duration-300"
            style={revealStyle(inView, 0.2)}
          >
            <div className="h-[3px] bg-gradient-to-r from-[#0B1628] to-[#1a3060]" />

            <div className="p-6 pb-5">
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-amber-200/60">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <span className="text-4xl font-black text-gray-50 group-hover:text-amber-50 transition-colors duration-300 leading-none select-none">02</span>
              </div>
              <p className="text-base font-bold text-gray-900 mb-1">{aiSection.features[1].label}</p>
              <p className="text-xs font-semibold text-amber-600 mb-3">{aiSection.features[1].tagline}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{aiSection.features[1].desc}</p>
            </div>

            <div className="bg-[#0B1628] p-4 border-t border-gray-100/5">
              <div className="space-y-2">
                {voiceMessages(isHi).map((m, i) => (
                  <div
                    key={i}
                    className={`text-[11px] rounded-xl px-3 py-2 leading-snug ${
                      m.role === 'user'
                        ? 'bg-white/8 text-gray-300 max-w-[88%]'
                        : 'bg-amber-500/15 border border-amber-500/20 text-amber-300 ml-auto max-w-[88%] text-right'
                    } ${inView ? 'ai-msg' : 'opacity-0'}`}
                    style={{ animationDelay: `${0.1 + i * 0.18}s` }}
                  >
                    {m.text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3 — Smart Compare */}
          <div
            className="group rounded-2xl border border-gray-100 bg-white overflow-hidden hover:border-amber-200 hover:shadow-2xl hover:shadow-amber-100/40 hover:-translate-y-1.5 transition-all duration-300"
            style={revealStyle(inView, 0.28)}
          >
            <div className="h-[3px] bg-gradient-to-r from-amber-500 to-amber-400" />

            <div className="p-6 pb-5">
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-amber-200/60">
                  <BarChart2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-4xl font-black text-gray-50 group-hover:text-amber-50 transition-colors duration-300 leading-none select-none">03</span>
              </div>
              <p className="text-base font-bold text-gray-900 mb-1">{aiSection.features[2].label}</p>
              <p className="text-xs font-semibold text-amber-600 mb-3">{aiSection.features[2].tagline}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{aiSection.features[2].desc}</p>
            </div>

            <div className="bg-[#0B1628] p-4 border-t border-gray-100/5">
              <div className="space-y-2">
                {quotes(isHi).map((q, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 ${
                      q.best
                        ? 'bg-amber-500/10 border border-amber-500/25'
                        : 'bg-white/5'
                    } ${inView ? 'ai-item' : 'opacity-0'}`}
                    style={{ animationDelay: `${0.12 + i * 0.12}s` }}
                  >
                    <div>
                      {q.best && (
                        <p className="text-[9px] text-amber-400 font-bold uppercase tracking-wider mb-0.5">★ Best Price</p>
                      )}
                      <p className={`text-[11px] font-semibold ${q.best ? 'text-white' : 'text-gray-400'}`}>{q.name}</p>
                      <p className="text-[9px] text-gray-600">{q.time}</p>
                    </div>
                    <p className={`text-sm font-black ${q.best ? 'text-amber-400' : 'text-gray-600'}`}>
                      {q.price}
                    </p>
                  </div>
                ))}
                <p
                  className={`text-[10px] text-amber-500 text-center pt-1.5 font-bold ${inView ? 'ai-fade' : 'opacity-0'}`}
                  style={{ animationDelay: '0.48s' }}
                >
                  {isHi ? '₹3,200 bachaye vs highest quote' : '₹3,200 saved vs highest quote'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── CTA bar ── */}
        <div
          className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 border border-gray-100 rounded-2xl px-7 py-5"
          style={revealStyle(inView, 0.42)}
        >
          <div>
            <p className="text-sm font-bold text-gray-900">
              {isHi ? 'Abhi try karo — free hai, account nahi chahiye' : "Try it now — it's free, no account needed"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {isHi ? 'Sirf inquiry submit karo, hum baaki sambhalenge' : 'Submit an inquiry and we handle everything else'}
            </p>
          </div>
          <button
            onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-[#0B1628] text-white text-sm font-semibold rounded-xl hover:bg-[#0f2040] transition-all duration-200 hover:shadow-lg hover:shadow-[#0B1628]/30"
          >
            {aiSection.cta} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
