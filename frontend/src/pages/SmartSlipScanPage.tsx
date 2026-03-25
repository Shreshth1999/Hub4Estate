import { SmartSlipScanner } from '../components/SmartSlipScanner';
import { Sparkles, Zap, CheckCircle } from 'lucide-react';

export function SmartSlipScanPage() {
  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500 text-white text-sm font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-4 h-4" />
            AI-Powered
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-neutral-900 mb-4">
            Smart Slip Scanner
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Upload a photo, image, or PDF of your contractor's list — AI extracts all items,
            quantities, and brands automatically, then gets you the best quotes from verified dealers.
          </p>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border-2 border-neutral-900 p-6 text-center">
            <div className="w-12 h-12 bg-blue-500 text-white flex items-center justify-center mx-auto mb-3 font-black text-xl">
              1
            </div>
            <h3 className="font-bold text-neutral-900 mb-2">Upload or Capture</h3>
            <p className="text-sm text-neutral-600">
              Take a photo of contractor's slip or upload from your device
            </p>
          </div>

          <div className="bg-white border-2 border-neutral-900 p-6 text-center">
            <div className="w-12 h-12 bg-accent-500 text-white flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-neutral-900 mb-2">AI Extraction</h3>
            <p className="text-sm text-neutral-600">
              AI reads the slip and extracts products, quantities, brands automatically
            </p>
          </div>

          <div className="bg-white border-2 border-neutral-900 p-6 text-center">
            <div className="w-12 h-12 bg-green-500 text-white flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-neutral-900 mb-2">Get Quotes</h3>
            <p className="text-sm text-neutral-600">
              Instantly receive competitive quotes from verified dealers
            </p>
          </div>
        </div>

        {/* Scanner Component */}
        <SmartSlipScanner />

        {/* Features */}
        <div className="mt-8 bg-neutral-900 text-white p-6">
          <h3 className="font-bold text-lg mb-4">✨ Smart Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-accent-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Auto-Brand Detection:</strong> Recognizes 20+ electrical brands
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-accent-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Multi-Brand Quotes:</strong> Get top 5 brands if none specified
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-accent-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Confidence Scores:</strong> See AI confidence for each item
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-accent-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Edit Before Submit:</strong> Review and correct any mistakes
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 border-2 border-blue-200 p-6">
          <h3 className="font-bold text-blue-900 mb-3">📸 Tips for Best Results</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>Ensure good lighting - avoid shadows on the paper</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>Keep camera steady and focus clearly on the text</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>Capture the entire slip in frame - don't cut off edges</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>If handwriting is unclear, type items manually for better accuracy</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
