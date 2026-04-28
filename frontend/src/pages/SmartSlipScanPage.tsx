import { SmartSlipScanner } from '../components/SmartSlipScanner';
import { Sparkles, Zap, CheckCircle, Camera, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useInView, revealStyle } from '../hooks/useInView';
import { SEO } from '@/components/SEO';

const STEPS = [
  {
    icon: Camera,
    number: '01',
    title: 'Upload or Capture',
    desc: 'Take a photo of your contractor\'s slip or upload a PDF/image from your device.',
    accent: 'bg-amber-600/20 text-amber-500',
  },
  {
    icon: Sparkles,
    number: '02',
    title: 'AI Extraction',
    desc: 'AI reads the slip and extracts products, quantities, and brands automatically.',
    accent: 'bg-violet-500/20 text-violet-400',
  },
  {
    icon: CheckCircle,
    number: '03',
    title: 'Get Quotes',
    desc: 'Review extracted items, edit if needed, then get competitive quotes from verified dealers.',
    accent: 'bg-green-500/20 text-green-400',
  },
];

const FEATURES = [
  { title: 'Auto-Brand Detection', desc: 'Recognises 20+ electrical brands from handwriting or print.' },
  { title: 'Multi-Brand Quotes', desc: 'Get top 5 brands quoted if none specified.' },
  { title: 'Confidence Scores', desc: 'See AI confidence for each extracted item.' },
  { title: 'Edit Before Submit', desc: 'Review and correct any mistakes before sending.' },
];

export function SmartSlipScanPage() {
  const { ref: heroRef, inView: heroIn } = useInView(0.05);
  const { ref: stepsRef, inView: stepsIn } = useInView(0.05);
  const { ref: scannerRef, inView: scannerIn } = useInView(0.05);

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Smart Slip Scanner - Scan & Compare Electrical Product Prices"
        description="Upload a photo of your electrical product bill or price list and instantly compare prices from verified dealers on Hub4Estate. AI-powered price comparison."
        keywords="electrical price scanner, compare electrical prices, smart slip scan, Hub4Estate AI scanner"
        canonicalUrl="/smart-scan"
      />

      {/* Hero — dark */}
      <div className="bg-gray-900 blueprint-bg-dark relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-amber-600/8 rounded-full blur-3xl animate-glow-pulse" />
        </div>
        <div ref={heroRef as any} className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center relative">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600/20 text-amber-500 text-[11px] font-semibold rounded-full mb-6 border border-amber-600/30"
            style={revealStyle(heroIn, 0)}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered · Free to use
          </div>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight"
            style={revealStyle(heroIn, 0.06)}
          >
            Smart Slip<br />
            <span className="text-amber-500">Scanner</span>
          </h1>
          <p
            className="text-gray-400 mb-8 max-w-xl mx-auto leading-relaxed"
            style={revealStyle(heroIn, 0.1)}
          >
            Upload a photo, image, or PDF of your contractor's material list — AI extracts every item,
            quantity, and brand, then gets you competitive quotes from verified dealers. Instantly.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3" style={revealStyle(heroIn, 0.14)}>
            <a
              href="#scanner"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-600 text-white text-sm font-bold rounded-xl hover:bg-amber-700 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Scan a Slip Now
            </a>
            <Link
              to="/rfq/create"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-white/10 text-white text-sm font-bold rounded-xl hover:bg-white/20 transition-colors"
            >
              Manual Entry <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div ref={stepsRef as any} className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <div className="text-center mb-10" style={revealStyle(stepsIn, 0)}>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">How it works</h2>
          <p className="text-sm text-gray-500">Three steps from photo to quote.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-md transition-all card-3d"
                style={revealStyle(stepsIn, 0.06 + i * 0.06)}
              >
                <div className={`w-10 h-10 ${step.accent} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-gray-300 mb-1">{step.number}</div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scanner — dark background */}
      <div className="bg-gray-900 px-6 py-14">
        <div ref={scannerRef as any} className="max-w-4xl mx-auto" style={revealStyle(scannerIn, 0)}>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">Upload your slip</h2>
            <p className="text-sm text-gray-400">Supports photos, screenshots, and PDF files.</p>
          </div>
          <div id="scanner">
            <SmartSlipScanner />
          </div>
        </div>
      </div>

      {/* Features + Tips */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Smart Features */}
          <div>
            <h3 className="text-lg font-black text-gray-900 mb-5 tracking-tight">Smart Features</h3>
            <div className="space-y-4">
              {FEATURES.map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-0.5">{f.title}</p>
                    <p className="text-xs text-gray-500">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div>
            <h3 className="text-lg font-black text-gray-900 mb-5 tracking-tight">Tips for Best Results</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-3">
              {[
                'Good lighting — avoid shadows on the paper.',
                'Keep camera steady, text clearly in focus.',
                'Capture the full slip — don\'t cut off edges.',
                'Handwriting unclear? Type items manually for better accuracy.',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-600">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA — dark */}
      <div className="bg-gray-900 px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-3 tracking-tight">
            Need to type it manually?
          </h2>
          <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
            If your slip is hard to read or you already know what you need,
            just enter it directly — still completely free.
          </p>
          <Link
            to="/rfq/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 text-sm font-bold rounded-xl hover:bg-gray-100 transition-colors"
          >
            Post a Requirement Manually <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

    </div>
  );
}
