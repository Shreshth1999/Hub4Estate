import { SmartSlipScanner } from '../components/SmartSlipScanner';
import { Sparkles, Zap, CheckCircle } from 'lucide-react';

export function SmartSlipScanPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-100 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-3">
            Smart Slip Scanner
          </h1>
          <p className="text-base text-gray-500 max-w-2xl mx-auto">
            Upload a photo, image, or PDF of your contractor's list — AI extracts all items,
            quantities, and brands automatically, then gets you the best quotes from verified dealers.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* How it works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:border-gray-300 hover:shadow-sm transition-all">
            <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center mx-auto mb-3 font-semibold text-base">
              1
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1.5">Upload or Capture</h3>
            <p className="text-xs text-gray-500">
              Take a photo of contractor's slip or upload from your device
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:border-gray-300 hover:shadow-sm transition-all">
            <div className="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1.5">AI Extraction</h3>
            <p className="text-xs text-gray-500">
              AI reads the slip and extracts products, quantities, brands automatically
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:border-gray-300 hover:shadow-sm transition-all">
            <div className="w-10 h-10 bg-green-500 text-white rounded-xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1.5">Get Quotes</h3>
            <p className="text-xs text-gray-500">
              Instantly receive competitive quotes from verified dealers
            </p>
          </div>
        </div>

        {/* Scanner Component */}
        <SmartSlipScanner />

        {/* Features */}
        <div className="bg-gray-900 rounded-2xl text-white p-6">
          <h3 className="font-semibold text-base mb-4">Smart Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {[
              { title: 'Auto-Brand Detection', desc: 'Recognizes 20+ electrical brands' },
              { title: 'Multi-Brand Quotes', desc: 'Get top 5 brands if none specified' },
              { title: 'Confidence Scores', desc: 'See AI confidence for each item' },
              { title: 'Edit Before Submit', desc: 'Review and correct any mistakes' },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">{f.title}:</strong>{' '}
                  <span className="text-gray-400">{f.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">Tips for Best Results</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            {[
              'Ensure good lighting - avoid shadows on the paper',
              'Keep camera steady and focus clearly on the text',
              'Capture the entire slip in frame - don\'t cut off edges',
              'If handwriting is unclear, type items manually for better accuracy',
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
