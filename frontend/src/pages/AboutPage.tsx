import { Link } from 'react-router-dom';
import {
  ArrowLeft, Target, Users, TrendingUp, Award,
  Mail, Phone, ArrowRight, Linkedin,
} from 'lucide-react';

export function AboutPage() {
  const milestones = [
    {
      year: 'Apr 2024',
      title: 'The Idea',
      description: "Shreshth's father — a real estate professional — was drowning in broker calls, mismatched leads, and zero transparency. The first question: why does he need 50 calls for one useful deal? That spiralled into deeper research on procurement pain in construction.",
    },
    {
      year: '2024–25',
      title: 'Two Years of Validation',
      description: "Spoke with contractors, builders, interior designers, and homeowners. Found the real problem: same product, wildly different prices depending on who you know. The same item quoted at ₹1.05 lakh — sourced at ₹66,000. Not a communication problem. An access problem.",
    },
    {
      year: 'Mar 2026',
      title: 'Incorporated',
      description: 'HUB4ESTATE LLP registered (LLPIN: ACW-4269). 2 years of validation, pivots, and real deal-closing before building the platform. Started with electricals — highest chaos, most opaque pricing, guaranteed repeat demand.',
    },
    {
      year: 'Mar 2026',
      title: 'Platform Live',
      description: '10+ clients served. Real deals closed. Sony speakers at ₹68K vs ₹1,05,000 at Croma. Philips LED panels saving ₹24,000 on a 200-unit order. FRLS wire: 6 dealer quotes, ₹8,800 saved on 200 metres. Building from here.',
    },
  ];

  const values = [
    { icon: Target, title: 'Transparency', description: 'You see every quote side by side. No hidden prices, no dealer favouritism, no undisclosed commissions.' },
    { icon: Users, title: 'Access', description: 'The same dealer network that big contractors use — now available to anyone who needs one electrical product.' },
    { icon: TrendingUp, title: 'Honesty', description: "We don't claim numbers we haven't earned. Every stat on this platform is real. Every deal we share is verified." },
    { icon: Award, title: 'Long Game', description: 'We are building infrastructure, not a quick flip. Electricals first. Every procurement category in construction follows.' },
  ];

  const realDeals = [
    { product: 'Sony Tower Speaker + 2 Mics', market: '₹1,05,000 (Croma)', hub4estate: '₹68,000', saved: '₹37,000' },
    { product: 'Philips 15W LED Panels × 200', market: '₹585/pc (local dealer)', hub4estate: '₹465/pc with shipping', saved: '₹24,000' },
    { product: 'FRLS 2.5mm² Wire × 200m', market: '₹127/m (highest quote)', hub4estate: '₹83/m (best dealer)', saved: '₹8,800' },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <div className="bg-white border-b border-gray-200 px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Our Story</p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
            Fixing the price information problem<br />in electrical procurement.
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Hub4Estate exists because the same product is priced completely differently by different dealers —
            and most buyers have no way to know. We're fixing that.
          </p>
        </div>
      </div>

      {/* The Problem */}
      <div className="px-6 py-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-5">Why Electrical? Why Now?</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              The electrical sector in India is highly fragmented and opaque. The same Havells switch or Polycab wire
              is priced differently by every dealer depending on who you are and how much you know.
              Buyers without industry connections routinely pay far more than they need to.
            </p>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Hub4Estate was built to close that gap. We connect buyers to multiple verified dealers, let them compete
              on price, and give the buyer full visibility into every quote. No middlemen. No guesswork. Just the real price.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We started with electricals because the chaos is highest here, the margins are most opaque, and the
              repeat demand is guaranteed. This is phase one. Every procurement category in construction follows.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Real Deals We've Closed</p>
            {realDeals.map((deal, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-5">
                <p className="text-sm font-semibold text-gray-900 mb-3">{deal.product}</p>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Market price</span>
                  <span className="text-gray-400 line-through">{deal.market}</span>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="font-medium text-gray-700">Hub4Estate</span>
                  <span className="font-medium text-gray-900">{deal.hub4estate}</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-3">
                  <span className="text-xs text-gray-400">Saved</span>
                  <span className="text-sm font-semibold text-green-600">{deal.saved}</span>
                </div>
              </div>
            ))}
            <p className="text-xs text-gray-400 mt-2">All numbers verified. No fabrications.</p>
          </div>
        </div>
      </div>

      {/* Founder */}
      <div className="bg-gray-50 border-y border-gray-200 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-10 text-center">Meet the Founder</h2>
          <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              <div className="md:col-span-1">
                <div className="w-32 h-32 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto md:mx-0 mb-4">
                  <span className="text-3xl font-bold text-white">SA</span>
                </div>
                <div className="space-y-2 text-xs text-gray-500">
                  <p>Age 18</p>
                  <p>Mesa School of Business</p>
                  <p>NMIMS BBA (Distance)</p>
                  <p>Sri Ganganagar, Rajasthan</p>
                </div>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">Shreshth Agarwal</h3>
                <p className="text-sm text-orange-600 font-medium mb-5">Founder & CEO, HUB4ESTATE LLP</p>
                <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                  Shreshth started ideating Hub4Estate at 16, watching his father — a real estate professional
                  in Sri Ganganagar — navigate endless broker calls, irrelevant leads, and opaque supplier pricing.
                  The insight that stuck: it's not a communication problem, it's an access problem.
                </p>
                <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                  Before Hub4Estate, Shreshth ran a dropshipping business in Class 9 (bottles to UAE/Dubai,
                  bought his own iPhone and MacBook from the proceeds), traded equities using hedging strategies
                  (₹87 lakh in returns), and ran Treva Iconic Jewels for a full year.
                  Hub4Estate is not a first venture — it's the most deliberate one.
                </p>
                <blockquote className="border-l-2 border-gray-200 pl-4 italic text-gray-500 text-sm mb-5">
                  "Unclear is dangerous. Difficult is workable. The problem is clear —
                  I know exactly what we're building and why. Everything else is just execution."
                </blockquote>
                <div className="flex flex-wrap gap-4 text-sm">
                  <a href="mailto:shreshth.agarwal@hub4estate.com" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors">
                    <Mail className="w-4 h-4" /> shreshth.agarwal@hub4estate.com
                  </a>
                  <a href="tel:+917690001999" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors">
                    <Phone className="w-4 h-4" /> +91 76900 01999
                  </a>
                  <a href="https://linkedin.com/in/sa-h4e" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors">
                    <Linkedin className="w-4 h-4" /> linkedin.com/in/sa-h4e
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="px-6 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">What We Stand For</h2>
          <p className="text-gray-500">These aren't values we put on a wall. They're the decisions we make every day.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {values.map((value, i) => {
            const Icon = value.icon;
            return (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                  <Icon className="w-4.5 h-4.5 text-gray-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1.5">{value.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{value.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Journey */}
      <div className="bg-gray-50 border-y border-gray-200 px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">The Journey</h2>
            <p className="text-sm text-gray-500">Two years of validation before a single line of product code.</p>
          </div>
          <div className="space-y-0">
            {milestones.map((m, i) => (
              <div key={i} className="flex gap-6">
                <div className="w-20 flex-shrink-0 text-right pt-1">
                  <span className="text-xs font-semibold text-orange-500">{m.year}</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-gray-900 rounded-full flex-shrink-0 mt-1" />
                  {i < milestones.length - 1 && <div className="w-px flex-1 bg-gray-200 min-h-10" />}
                </div>
                <div className="flex-1 pb-8">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{m.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Company Info */}
      <div className="px-6 py-12 max-w-2xl mx-auto">
        <h3 className="text-sm font-medium text-gray-900 mb-4 text-center">Company Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Entity', value: 'HUB4ESTATE LLP' },
            { label: 'LLPIN', value: 'ACW-4269' },
            { label: 'Incorporated', value: '17 Mar 2026' },
            { label: 'Registered in', value: 'Rajasthan, India' },
          ].map((item, i) => (
            <div key={i} className="bg-gray-50 rounded-xl border border-gray-100 p-3">
              <p className="text-[11px] text-gray-400 mb-0.5">{item.label}</p>
              <p className="text-xs font-semibold text-gray-900">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gray-900 px-6 py-14 text-center">
        <h2 className="text-2xl font-semibold text-white mb-3">Ready to find the best price?</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto text-sm">
          Submit a requirement and let our dealer network compete to give you the best deal.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/rfq/create" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors">
            Post a requirement <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/dealer/onboarding" className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-700 text-white text-sm font-medium rounded-lg hover:border-gray-500 transition-colors">
            Join as dealer
          </Link>
        </div>
      </div>
    </div>
  );
}
