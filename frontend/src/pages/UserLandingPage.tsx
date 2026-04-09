import { Link } from 'react-router-dom';
import { ArrowRight, Upload, SlidersHorizontal, CheckCircle, Home, Wrench, Palette, Building2, Users, Store, Shield, IndianRupee, Headphones, FileText, Truck, Star } from 'lucide-react';

const STEPS = [
  { Icon: Upload, title: 'Tell us what you need', desc: 'Upload a purchase slip, type a product name, or just speak it in Hindi. Our AI extracts the specs automatically.' },
  { Icon: SlidersHorizontal, title: 'Dealers compete for your order', desc: 'Multiple verified dealers send you blind quotes. You see price, shipping, delivery time — all side by side.' },
  { Icon: CheckCircle, title: 'Pick the best deal', desc: 'Choose the quote that works for you. The dealer\'s contact is revealed instantly. Deal done.' },
];

const AUDIENCES = [
  { Icon: Home, title: 'Homeowners', desc: 'Renovating or fitting a new home? Compare prices on lights, fans, wiring before spending a rupee.' },
  { Icon: Wrench, title: 'Contractors', desc: 'Bulk pricing from 4+ dealers, delivered directly to your project site.' },
  { Icon: Palette, title: 'Interior Designers', desc: 'Source exact-spec products without calling 10 different vendors.' },
  { Icon: Building2, title: 'Builders', desc: 'One inquiry, multiple verified dealer quotes — instantly.' },
  { Icon: Users, title: 'Architects', desc: 'Find products matching your specifications, not just nearby stock.' },
  { Icon: Store, title: 'Small Businesses', desc: 'Get dealer pricing on office fitout materials, not retail markup.' },
];

const DEALS = [
  { product: 'Sony Tower Speaker + 2 Mics', retail: '₹1,05,000', hub4estate: '₹68,000', saved: '₹37,000' },
  { product: 'Philips 15W LED Panels × 200', retail: '₹585/piece', hub4estate: '₹465/piece', saved: '₹24,000 total' },
  { product: 'FRLS 2.5mm² Cable × 200m', retail: '₹127/meter', hub4estate: '₹83/meter', saved: '₹8,800 total' },
];

export function UserLandingPage() {
  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-20 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-amber-600 mb-4">For Anyone Buying Electrical Products</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-[1.05] tracking-tight">
              Find the <span className="text-amber-600">cheapest price</span> on any electrical product in India.
            </h1>
            <p className="text-lg text-gray-500 mb-8 leading-relaxed">
              Tell us what you need. Verified dealers compete to give you their best price. You compare side by side and pick the winner. Always free. Zero spam.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/" onClick={(e) => { e.preventDefault(); window.location.href = '/#inquiry-form'; }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors">
                Submit Inquiry — Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/track" className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-gray-200 text-gray-600 font-medium rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors">
                Track Existing Inquiry
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-stone-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">How it works for buyers</h2>
          <p className="text-gray-500 mb-12">Three steps. Real savings. No spam calls.</p>

          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-amber-700">{i + 1}</span>
                  </div>
                  <step.Icon className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Concierge Service */}
      <section className="bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full mb-6">
                <Headphones className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-semibold text-amber-700">Concierge Service</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                Not sure what to buy? We'll help.
              </h2>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Our concierge team helps you specify the right products, find the right brands, and negotiates with dealers on your behalf. Think of it as having a procurement expert on speed dial — for free.
              </p>
              <div className="space-y-4">
                {[
                  { Icon: Star, text: 'Personalized product recommendations based on your project' },
                  { Icon: IndianRupee, text: 'We negotiate with dealers to get you even better prices' },
                  { Icon: FileText, text: 'Full documentation — GST bills, warranty, delivery proof' },
                  { Icon: Truck, text: 'Delivery coordination to your site, home, or office' },
                ].map(({ Icon, text }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Icon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600">{text}</p>
                  </div>
                ))}
              </div>
              <Link to="/" onClick={(e) => { e.preventDefault(); window.location.href = '/#inquiry-form'; }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors mt-8">
                Get Concierge Help — Free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-stone-50 border border-gray-200 rounded-lg p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Perfect for:</h3>
              <div className="space-y-5">
                {[
                  'First-time buyers who don\'t know exact product specs',
                  'Large projects needing multiple product categories',
                  'People who want the best price but don\'t have time to compare',
                  'Anyone who wants a trusted expert handling their procurement',
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600">{text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Cost</p>
                <p className="text-2xl font-bold text-gray-900">Free <span className="text-sm font-normal text-gray-400">for all buyers</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="bg-stone-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Built for anyone who buys electrical products</h2>
          <p className="text-gray-500 mb-12 max-w-lg">Whether you're doing a home renovation or managing a construction project — if you've ever overpaid without knowing it, Hub4Estate is for you.</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {AUDIENCES.map(({ Icon, title, desc }, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real Savings */}
      <section className="bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Real savings from real deals</h2>
          <p className="text-gray-500 mb-12">These are actual deals closed through Hub4Estate. Verified numbers.</p>

          <div className="grid md:grid-cols-3 gap-6">
            {DEALS.map((deal, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">{deal.product}</h3>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Retail / Market</span>
                    <span className="text-sm text-gray-400 line-through">{deal.retail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-amber-600">Hub4Estate price</span>
                    <span className="text-sm font-semibold text-amber-600">{deal.hub4estate}</span>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-400 mb-1">You save</p>
                  <p className="text-2xl font-bold text-gray-900">{deal.saved}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Trust Us */}
      <section className="bg-stone-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { Icon: Shield, title: 'Every dealer is verified', desc: 'We vet dealers before they can quote. GST, business documents, track record — all checked.' },
              { Icon: IndianRupee, title: 'Always free for buyers', desc: 'No signup fees, no commissions, no hidden charges. You pay the dealer directly for the product.' },
              { Icon: FileText, title: 'Full transparency', desc: 'You see every quote, every price, every detail. We never hide information or push you toward a specific dealer.' },
            ].map(({ Icon, title, desc }, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gray-900 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Stop overpaying for electrical products.</h2>
          <p className="text-gray-400 mb-8">Submit your first inquiry. It takes 30 seconds and it's completely free.</p>
          <Link to="/" onClick={(e) => { e.preventDefault(); window.location.href = '/#inquiry-form'; }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors">
            Get Your Best Price <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
