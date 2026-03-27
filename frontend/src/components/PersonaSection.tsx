import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  Palette,
  Wrench,
  Home,
  Zap,
  ArrowRight,
  CheckCircle,
  Shield,
  Clock,
  Star,
  ChevronRight,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkflowStep {
  title: string;
  detail: string;
}

interface PersonaConfig {
  id: string;
  label: string;
  Icon: React.ElementType;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  accentDot: string;
  accentBtn: string;
  accentBtnHover: string;
  headline: string;
  pain: string;
  steps: WorkflowStep[];
  ctaLabel: string;
  ctaHref: string;
  ctaIsScroll: boolean;
  MockUI: React.FC;
}

// ─── Mock UI Cards ─────────────────────────────────────────────────────────────

function DealerMockUI() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header bar */}
      <div className="bg-orange-50 border-b border-orange-100 px-5 py-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
        <span className="text-xs font-bold text-orange-700 uppercase tracking-wide">New Inquiry — Priority</span>
        <span className="ml-auto text-[10px] font-medium text-orange-500 bg-orange-100 px-2 py-0.5 rounded-full">Just now</span>
      </div>

      {/* Inquiry body */}
      <div className="p-5 space-y-4">
        <div>
          <p className="text-base font-bold text-gray-900">FRLS 2.5mm² Wire × 200m</p>
          <p className="text-xs text-gray-500 mt-0.5">Brand preference: Polycab</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Budget</p>
            <p className="text-sm font-bold text-gray-900">₹18,000 – ₹24,000</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Delivery</p>
            <p className="text-sm font-bold text-gray-900">Pune · 5 days</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded-full text-[11px] font-bold text-green-700">
            <Shield className="w-3 h-3" />
            Verified Buyer
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-full text-[11px] font-bold text-blue-700">
            <CheckCircle className="w-3 h-3" />
            2 orders placed
          </span>
        </div>

        <div className="border-t border-gray-100 pt-4 flex gap-2">
          <button className="flex-1 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors">
            Submit Quote
          </button>
          <button className="px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:border-gray-300 transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

function ArchitectMockUI() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Search bar */}
      <div className="bg-indigo-50 border-b border-indigo-100 px-5 py-3">
        <div className="flex items-center gap-2 bg-white border border-indigo-200 rounded-lg px-3 py-2">
          <span className="text-xs text-gray-400">Searching:</span>
          <span className="text-xs font-semibold text-gray-800">"15A modular switch, brushed steel"</span>
        </div>
      </div>

      {/* Results */}
      <div className="p-5 space-y-3">
        {/* Best value */}
        <div className="border border-indigo-200 bg-indigo-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">Best Value</span>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-gray-900">Havells Crabtree</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                  <CheckCircle className="w-2.5 h-2.5" /> BIS certified
                </span>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                  <CheckCircle className="w-2.5 h-2.5" /> 2yr warranty
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-base font-black text-gray-900">₹185<span className="text-xs font-medium text-gray-500">/pc</span></p>
              <p className="text-[11px] text-gray-500 flex items-center justify-end gap-1 mt-0.5">
                <Clock className="w-3 h-3" /> 2 days
              </p>
            </div>
          </div>
        </div>

        {/* Other options */}
        <div className="flex items-center justify-between px-4 py-3 border border-gray-100 rounded-xl">
          <span className="text-sm text-gray-700 font-medium">Anchor Advance</span>
          <div className="text-right">
            <span className="text-sm font-bold text-gray-900">₹210<span className="text-xs font-normal text-gray-500">/pc</span></span>
            <span className="ml-2 text-[11px] text-gray-400">1 day</span>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border border-gray-100 rounded-xl">
          <span className="text-sm text-gray-700 font-medium">Legrand Myrius</span>
          <div className="text-right">
            <span className="text-sm font-bold text-gray-900">₹228<span className="text-xs font-normal text-gray-500">/pc</span></span>
            <span className="ml-2 text-[11px] text-gray-400">3 days</span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
          <span className="text-[11px] text-gray-500">3 verified dealers</span>
          <span className="text-[11px] font-semibold text-indigo-600 flex items-center gap-1">
            <Clock className="w-3 h-3" /> 48hr price lock available
          </span>
        </div>
      </div>
    </div>
  );
}

function ContractorMockUI() {
  const items = [
    { name: 'FRLS 2.5mm² Wire', qty: '200m', brand: 'Polycab' },
    { name: 'MCB 32A Double Pole', qty: '4 units', brand: 'Schneider' },
    { name: 'DB Box 8-way', qty: '2 units', brand: 'Legrand' },
    { name: '16A Switch Socket', qty: '20 units', brand: 'Havells' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-slate-800 px-5 py-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-400" />
        <span className="text-xs font-bold text-green-300 uppercase tracking-wide">AI Scan Complete</span>
        <span className="ml-auto text-[10px] font-medium text-slate-300">12 items found</span>
      </div>

      {/* Items */}
      <div className="p-5 space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
            <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600 flex-shrink-0">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs font-medium text-gray-700">{item.qty}</p>
              <p className="text-[10px] text-slate-500">{item.brand}</p>
            </div>
          </div>
        ))}

        <div className="pt-1 pb-1 text-sm text-gray-400 italic">+ 8 more items detected</div>

        <div className="pt-2">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors">
            Get Quotes for All 12 Items
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function HomeownerMockUI() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-green-50 border-b border-green-100 px-5 py-3">
        <p className="text-xs font-bold text-green-800">Quotes for: Philips 15W LED Panel × 20</p>
        <p className="text-[11px] text-green-600 mt-0.5 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> 3 quotes received · 4 hrs ago
        </p>
      </div>

      {/* Quotes */}
      <div className="p-5 space-y-2">
        {/* Best */}
        <div className="border border-green-200 bg-green-50 rounded-xl p-3.5">
          <div className="flex items-start justify-between mb-1.5">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <Star className="w-3 h-3 text-green-600 fill-green-600" />
                <span className="text-[10px] font-black text-green-700 uppercase tracking-wide">Best</span>
              </div>
              <p className="text-sm font-bold text-gray-900">Delhi Electricals</p>
            </div>
            <div className="text-right">
              <p className="text-base font-black text-green-700">₹425<span className="text-xs font-normal text-gray-500">/pc</span></p>
              <p className="text-[11px] text-gray-500">2 days</p>
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <span className="text-[10px] font-medium text-gray-600 bg-white border border-gray-200 px-2 py-0.5 rounded">GST bill</span>
            <span className="text-[10px] font-medium text-gray-600 bg-white border border-gray-200 px-2 py-0.5 rounded">warranty included</span>
          </div>
        </div>

        {/* Mid */}
        <div className="flex items-center justify-between px-3.5 py-3 border border-gray-100 rounded-xl">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Mid</span>
            <p className="text-sm text-gray-700 font-medium">Jaipur Traders</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-700">₹495<span className="text-xs font-normal text-gray-400">/pc</span></p>
            <p className="text-[11px] text-gray-400">1 day</p>
          </div>
        </div>

        {/* High */}
        <div className="flex items-center justify-between px-3.5 py-3 border border-gray-100 rounded-xl">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase">High</span>
            <p className="text-sm text-gray-700 font-medium">Local Store</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-500">₹585<span className="text-xs font-normal text-gray-400">/pc</span></p>
            <p className="text-[11px] text-gray-400">Same day</p>
          </div>
        </div>

        {/* Savings */}
        <div className="border-t border-gray-100 pt-3 text-center">
          <p className="text-sm font-black text-green-600">You save ₹3,200 vs highest quote</p>
        </div>
      </div>
    </div>
  );
}

function ElectricianMockUI() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-blue-50 border-b border-blue-100 px-5 py-3 flex items-center gap-2">
        <Zap className="w-4 h-4 text-blue-600" />
        <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">Live Price Check</span>
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
      </div>

      {/* Product */}
      <div className="px-5 pt-5 pb-4">
        <p className="text-sm font-bold text-gray-900">Polycab 4mm² FRLS Wire</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">3 dealers in stock</span>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="mx-5 mb-5 space-y-2.5">
        <div className="flex items-center justify-between py-2.5 px-4 bg-green-50 border border-green-200 rounded-xl">
          <span className="text-xs font-semibold text-gray-700">Lowest available</span>
          <div className="text-right">
            <span className="text-sm font-black text-green-700">₹52<span className="text-xs font-medium">/m</span></span>
            <span className="ml-2 text-[10px] text-gray-400">(Mumbai)</span>
          </div>
        </div>

        <div className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-xl">
          <span className="text-xs font-medium text-gray-600">Market average</span>
          <span className="text-sm font-bold text-gray-700">₹61<span className="text-xs font-normal text-gray-400">/m</span></span>
        </div>

        <div className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-xl">
          <span className="text-xs font-medium text-gray-600">Highest quoted</span>
          <span className="text-sm font-bold text-gray-400">₹74<span className="text-xs font-normal text-gray-400">/m</span></span>
        </div>

        <div className="border-t border-dashed border-gray-200 pt-3 space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-gray-700">Your client quote</span>
            <span className="text-sm font-black text-gray-900">₹85–90/m</span>
          </div>
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium text-gray-500">Est. margin</span>
            <span className="text-sm font-bold text-green-600">₹33–38/m</span>
          </div>
        </div>

        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors mt-1">
          <Clock className="w-4 h-4" />
          Lock Price for 48hrs
        </button>
      </div>
    </div>
  );
}

// ─── Persona Data ──────────────────────────────────────────────────────────────

const PERSONAS: PersonaConfig[] = [
  {
    id: 'dealer',
    label: 'Dealer',
    Icon: Store,
    accentText: 'text-orange-600',
    accentBg: 'bg-orange-50',
    accentBorder: 'border-orange-200',
    accentDot: 'bg-orange-500',
    accentBtn: 'bg-orange-500 text-white',
    accentBtnHover: 'hover:bg-orange-600',
    headline: 'Stop chasing. Start converting.',
    pain: 'Random calls, ghost buyers, zero context. Every lead feels like a gamble.',
    steps: [
      { title: 'Qualified inquiry lands in your dashboard', detail: 'Real specs, quantity, budget, city, and deadline — all in one place.' },
      { title: 'Review the buyer', detail: 'See their order history, urgency level, and verified buyer status before you commit.' },
      { title: 'Submit your quote', detail: 'Price, delivery date, a brief note. The whole thing takes 60 seconds.' },
      { title: 'You win on merit', detail: 'Best price + best service wins the deal. No politics, no middlemen.' },
    ],
    ctaLabel: 'Join as a Dealer',
    ctaHref: '/dealer/onboarding',
    ctaIsScroll: false,
    MockUI: DealerMockUI,
  },
  {
    id: 'architect',
    label: 'Architect',
    Icon: Palette,
    accentText: 'text-indigo-600',
    accentBg: 'bg-indigo-50',
    accentBorder: 'border-indigo-200',
    accentDot: 'bg-indigo-500',
    accentBtn: 'bg-indigo-600 text-white',
    accentBtnHover: 'hover:bg-indigo-700',
    headline: 'Specify with certainty.',
    pain: 'Chasing dealer quotes for every project. Prices that change by morning.',
    steps: [
      { title: 'Search by specification', detail: 'Not just product name — search by finish, rating, or compliance standard.' },
      { title: 'See verified dealer stock', detail: '3–5 dealers who actually have it, with real lead times, not estimates.' },
      { title: 'Lock in the spec', detail: 'Download a quote PDF ready for your client presentation — professional and clean.' },
      { title: 'Reorder when ready', detail: 'Same spec, same price guaranteed for 48 hours. No surprises at order time.' },
    ],
    ctaLabel: 'Submit an Inquiry',
    ctaHref: 'inquiry-form',
    ctaIsScroll: true,
    MockUI: ArchitectMockUI,
  },
  {
    id: 'contractor',
    label: 'Contractor',
    Icon: Wrench,
    accentText: 'text-slate-700',
    accentBg: 'bg-slate-50',
    accentBorder: 'border-slate-200',
    accentDot: 'bg-slate-600',
    accentBtn: 'bg-slate-800 text-white',
    accentBtnHover: 'hover:bg-slate-900',
    headline: 'Your entire materials list. One request.',
    pain: '50 calls across 3 sites. Prices shift. Deliveries miss. Margins get eaten.',
    steps: [
      { title: 'Upload your materials slip', detail: 'Photo, scan, or type. AI reads it instantly — no manual entry needed.' },
      { title: '12 items identified automatically', detail: 'Brands, quantities, specs extracted. You review, not re-type.' },
      { title: '4+ dealers compete for your order', detail: 'They quote on the full list together — not per-item, per-call chaos.' },
      { title: 'One consolidated delivery to site', detail: 'Tracked, documented, GST-billed. One invoice, not twelve.' },
    ],
    ctaLabel: 'Try Slip Scanner',
    ctaHref: 'inquiry-form',
    ctaIsScroll: true,
    MockUI: ContractorMockUI,
  },
  {
    id: 'homeowner',
    label: 'Homeowner',
    Icon: Home,
    accentText: 'text-green-700',
    accentBg: 'bg-green-50',
    accentBorder: 'border-green-200',
    accentDot: 'bg-green-500',
    accentBtn: 'bg-green-600 text-white',
    accentBtnHover: 'hover:bg-green-700',
    headline: 'Know exactly what you should be paying.',
    pain: 'One electrician. One quote. No idea if you\'re being overcharged.',
    steps: [
      { title: 'Tell us what you need', detail: 'Product name, quantity, your city. Two minutes maximum.' },
      { title: 'We contact 3–5 verified dealers', detail: 'On your behalf. You wait. No cold-calling strangers.' },
      { title: 'Quotes arrive within hours', detail: 'Real prices from real dealers — not guesses or "call for price" delays.' },
      { title: 'Compare and choose', detail: 'Every quote side by side. You pick. Zero pressure, zero commitment.' },
    ],
    ctaLabel: 'Submit an Inquiry',
    ctaHref: 'inquiry-form',
    ctaIsScroll: true,
    MockUI: HomeownerMockUI,
  },
  {
    id: 'electrician',
    label: 'Electrician',
    Icon: Zap,
    accentText: 'text-blue-600',
    accentBg: 'bg-blue-50',
    accentBorder: 'border-blue-200',
    accentDot: 'bg-blue-500',
    accentBtn: 'bg-blue-600 text-white',
    accentBtnHover: 'hover:bg-blue-700',
    headline: 'Quote clients with confidence.',
    pain: 'You can\'t price a job until you know material costs. And costs change daily.',
    steps: [
      { title: 'Check live dealer prices', detail: 'Before you quote your client, not after. Know your material cost first.' },
      { title: 'See exactly what dealers have in stock', detail: 'No surprises when you go to order — stock confirmed before you commit.' },
      { title: 'Lock in cost for 48 hours', detail: 'Quote your client knowing your margin is protected for two full days.' },
      { title: 'Order directly, deliver to site', detail: 'GST documentation included. Clean paper trail for your records.' },
    ],
    ctaLabel: 'Submit an Inquiry',
    ctaHref: 'inquiry-form',
    ctaIsScroll: true,
    MockUI: ElectricianMockUI,
  },
];

const AUTO_ADVANCE_MS = 6000;

// ─── Main Component ────────────────────────────────────────────────────────────

export function PersonaSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitioningRef = useRef(false);

  const switchTo = useCallback((index: number) => {
    if (transitioningRef.current) return;
    transitioningRef.current = true;

    // Fade out
    setVisible(false);

    setTimeout(() => {
      setActiveIndex(index);
      setProgressKey(k => k + 1);
      // Fade in
      setVisible(true);
      transitioningRef.current = false;
    }, 220);
  }, []);

  const advanceNext = useCallback(() => {
    setActiveIndex(prev => {
      const next = (prev + 1) % PERSONAS.length;
      switchTo(next);
      return prev; // actual update happens inside switchTo
    });
  }, [switchTo]);

  // Auto-advance timer
  useEffect(() => {
    if (isHovered) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    timerRef.current = setTimeout(() => {
      const next = (activeIndex + 1) % PERSONAS.length;
      switchTo(next);
    }, AUTO_ADVANCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeIndex, isHovered, switchTo]);

  // Silence unused advanceNext warning — it's kept for clarity
  void advanceNext;

  const persona = PERSONAS[activeIndex];
  const { MockUI } = persona;

  const handleTabClick = (index: number) => {
    if (index === activeIndex || transitioningRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    switchTo(index);
  };

  const handleCTA = () => {
    if (persona.ctaIsScroll) {
      document.getElementById(persona.ctaHref)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      data-persona-section
      className="py-20 md:py-28 bg-white border-y border-gray-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-6xl mx-auto px-6">

        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-600 mb-3">Tailored for every role</p>
          <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight">
            Built for Everyone in the Industry
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
            Whether you buy, sell, specify, or install — Hub4Estate works around how you actually work.
          </p>
        </div>

        {/* Tab selector */}
        <div className="flex justify-center mb-10">
          <div className="flex gap-1 bg-gray-100 rounded-2xl p-1.5 overflow-x-auto scrollbar-hide max-w-full">
            {PERSONAS.map((p, i) => {
              const isActive = i === activeIndex;
              return (
                <button
                  key={p.id}
                  onClick={() => handleTabClick(i)}
                  className={`
                    relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                    transition-all duration-300 whitespace-nowrap flex-shrink-0
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400
                    ${isActive
                      ? `bg-white shadow-sm ${p.accentText}`
                      : 'text-gray-500 hover:text-gray-800'
                    }
                  `}
                  aria-pressed={isActive}
                >
                  <p.Icon className={`w-4 h-4 transition-colors duration-300 ${isActive ? p.accentText : 'text-gray-400'}`} />
                  <span>{p.label}</span>

                  {/* Progress bar under active tab */}
                  {isActive && !isHovered && (
                    <span
                      key={progressKey}
                      className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full overflow-hidden"
                    >
                      <span
                        className={`block h-full ${p.accentDot} rounded-full`}
                        style={{
                          animation: `persona-progress ${AUTO_ADVANCE_MS}ms linear forwards`,
                        }}
                      />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main content grid */}
        <div
          className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(8px)',
            transition: visible
              ? 'opacity 400ms ease, transform 400ms ease'
              : 'opacity 200ms ease, transform 200ms ease',
          }}
        >
          {/* Left: Story narrative */}
          <div>
            {/* Persona identity */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${persona.accentBg} ${persona.accentBorder} mb-6`}>
              <persona.Icon className={`w-4 h-4 ${persona.accentText}`} />
              <span className={`text-xs font-bold uppercase tracking-wider ${persona.accentText}`}>
                {persona.label}
              </span>
            </div>

            {/* Headline */}
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight tracking-tight">
              {persona.headline}
            </h3>

            {/* Pain statement */}
            <p className="text-base text-gray-500 mb-8 leading-relaxed">
              {persona.pain}
            </p>

            {/* Workflow steps */}
            <div className="space-y-4 mb-8">
              {persona.steps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  {/* Step indicator */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white ${persona.accentDot}`}>
                      {i + 1}
                    </div>
                    {i < persona.steps.length - 1 && (
                      <div className="w-px flex-1 bg-gray-100 mt-2" />
                    )}
                  </div>

                  {/* Step content */}
                  <div className="pb-4">
                    <p className="text-sm font-bold text-gray-900 leading-snug">{step.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            {persona.ctaIsScroll ? (
              <button
                onClick={handleCTA}
                className={`
                  inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold
                  transition-colors duration-200 ${persona.accentBtn} ${persona.accentBtnHover}
                `}
              >
                {persona.ctaLabel}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <Link
                to={persona.ctaHref}
                className={`
                  inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold
                  transition-colors duration-200 ${persona.accentBtn} ${persona.accentBtnHover}
                `}
              >
                {persona.ctaLabel}
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Right: Mock UI card */}
          <div className="lg:flex lg:justify-center">
            <div className="w-full max-w-sm mx-auto lg:mx-0">
              {/* Subtle context label */}
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3 text-center">
                What you see in the platform
              </p>

              <MockUI />

              {/* Trust footer */}
              <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Verified dealers only
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  GST documented
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Real-time quotes
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dot navigation (mobile-friendly alternate nav) */}
        <div className="flex justify-center gap-2 mt-10">
          {PERSONAS.map((_, i) => (
            <button
              key={i}
              onClick={() => handleTabClick(i)}
              className={`
                transition-all duration-300 rounded-full
                ${i === activeIndex
                  ? `w-6 h-2 ${persona.accentDot}`
                  : 'w-2 h-2 bg-gray-200 hover:bg-gray-300'
                }
              `}
              aria-label={`Switch to ${PERSONAS[i].label}`}
            />
          ))}
        </div>
      </div>

      {/* Keyframe injection */}
      <style>{`
        @keyframes persona-progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </section>
  );
}
