import { ArrowRight, Camera, Mic, BarChart2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useInView, revealStyle } from '../hooks/useInView';

// ─── Static demo data ─────────────────────────────────────────────────────────
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
  { name: isHi ? 'सत्यापित डीलर B' : 'Verified Dealer B', price: '₹495', time: isHi ? '1 din'  : '1 day',  best: false },
  { name: isHi ? 'सत्यापित डीलर C' : 'Verified Dealer C', price: '₹585', time: 'Same day',                  best: false },
];

// ─── Main Section ─────────────────────────────────────────────────────────────
export function AISection() {
  const { lang, tx } = useLanguage();
  const { aiSection } = tx;
  const isHi = lang === 'hi';

  const { ref, inView } = useInView(0.06);

  const features = [
    {
      id: 'scan',
      Icon: Camera,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      accentLine: 'bg-amber-500',
      label: aiSection.features[0].label,
      tagline: aiSection.features[0].tagline,
      desc: aiSection.features[0].desc,
      demo: (
        <div className="space-y-1.5">
          <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-2">Detected items:</p>
          {SCAN_ITEMS.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-[11px]">
              <span className="text-gray-300">
                <span className="text-green-400 mr-1.5">✓</span>{item.text}
              </span>
              <span className="text-gray-500 text-[9px]">{item.brand}</span>
            </div>
          ))}
          <p className="text-[9px] text-gray-600 pt-1.5 border-t border-gray-700/50">
            {isHi ? '+ 8 aur items detect hue' : '+ 8 more items detected'}
          </p>
        </div>
      ),
    },
    {
      id: 'voice',
      Icon: Mic,
      iconColor: 'text-violet-500',
      iconBg: 'bg-violet-50',
      accentLine: 'bg-violet-500',
      label: aiSection.features[1].label,
      tagline: aiSection.features[1].tagline,
      desc: aiSection.features[1].desc,
      demo: (
        <div className="space-y-1.5">
          {voiceMessages(isHi).map((m, i) => (
            <div
              key={i}
              className={`text-[11px] rounded-lg px-2.5 py-1.5 leading-tight ${
                m.role === 'user'
                  ? 'bg-gray-700 text-gray-300 max-w-[85%]'
                  : 'bg-violet-600 text-white ml-auto max-w-[85%] text-right'
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'compare',
      Icon: BarChart2,
      iconColor: 'text-green-500',
      iconBg: 'bg-green-50',
      accentLine: 'bg-green-500',
      label: aiSection.features[2].label,
      tagline: aiSection.features[2].tagline,
      desc: aiSection.features[2].desc,
      demo: (
        <div className="space-y-1.5">
          {quotes(isHi).map((q, i) => (
            <div
              key={i}
              className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 ${
                q.best ? 'bg-green-900/30 border border-green-700/20' : 'bg-gray-800'
              }`}
            >
              <div>
                {q.best && <p className="text-[9px] text-green-400 font-semibold">★ Best</p>}
                <p className="text-[11px] text-white">{q.name}</p>
                <p className="text-[9px] text-gray-500">{q.time}</p>
              </div>
              <p className={`text-xs font-semibold ${q.best ? 'text-green-400' : 'text-gray-400'}`}>
                {q.price}
              </p>
            </div>
          ))}
          <p className="text-[9px] text-amber-500 text-center pt-0.5">
            {isHi ? '₹3,200 bachaye vs highest quote' : '₹3,200 saved vs highest quote'}
          </p>
        </div>
      ),
    },
  ];

  return (
    <section className="bg-gray-50 border-y border-gray-100">
      <div ref={ref as any} className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4" style={revealStyle(inView, 0)}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-900 text-white text-[11px] font-semibold rounded-full">
              <span className="w-1 h-1 rounded-full bg-amber-500" />
              {aiSection.badge}
            </span>
          </div>
          <h2
            className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-3 tracking-tight"
            style={revealStyle(inView, 0.06)}
          >
            {aiSection.title}
          </h2>
          <p
            className="text-base text-gray-500 max-w-lg leading-relaxed"
            style={revealStyle(inView, 0.12)}
          >
            {aiSection.subtitle}
          </p>
        </div>

        {/* 3-column cards with always-visible demos */}
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-5">
          {features.map((f, i) => (
            <div
              key={f.id}
              className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
              style={revealStyle(inView, 0.15 + i * 0.08)}
            >
              {/* Top accent line */}
              <div className={`h-0.5 ${f.accentLine}`} />

              {/* Info */}
              <div className="p-5">
                <div className={`w-9 h-9 ${f.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                  <f.Icon className={`w-4 h-4 ${f.iconColor}`} />
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-0.5">{f.label}</p>
                <p className="text-xs text-gray-400 mb-2.5">{f.tagline}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>

              {/* Demo — always visible */}
              <div className="border-t border-gray-50 bg-gray-900 p-4">
                {f.demo}
              </div>
            </div>
          ))}
        </div>

        {/* CTA bar */}
        <div
          className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5"
          style={revealStyle(inView, 0.4)}
        >
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {isHi ? 'Abhi try karo — free hai, account nahi chahiye' : "Try it now — it's free, no account needed"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {isHi ? 'Sirf inquiry submit karo, hum baaki sambhalenge' : 'Submit an inquiry and we handle everything else'}
            </p>
          </div>
          <button
            onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all duration-200 hover:shadow-lg hover:shadow-gray-900/20"
          >
            {aiSection.cta} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
