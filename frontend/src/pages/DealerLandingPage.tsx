import { Link } from 'react-router-dom';
import { ArrowRight, Inbox, IndianRupee, UserCheck, Shield, BarChart3, TrendingUp, Users, Award, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const STEPS = [
  { Icon: Inbox, title: 'Inquiry arrives blind', desc: 'You receive real buyer inquiries with full product specs and quantity. No buyer name or contact is shared — ensuring fair competition.' },
  { Icon: IndianRupee, title: 'Submit your quote', desc: 'Quote your best price with shipping cost and delivery timeline. The buyer sees all quotes side by side, transparently.' },
  { Icon: UserCheck, title: 'Win or learn', desc: 'If you win, the buyer\'s contact is revealed instantly. If you lose, you get the winning price as a market benchmark to improve next time.' },
];

const BENEFITS = [
  { Icon: Users, title: 'Qualified buyer inquiries', desc: 'Every inquiry comes from a buyer who knows what they want. No tire-kickers — real purchase intent.' },
  { Icon: IndianRupee, title: 'Completely free to join', desc: 'No listing fees, no subscription charges. You only invest time when a real inquiry matches your inventory.' },
  { Icon: Award, title: 'Build your reputation', desc: 'Get rated by real customers. Better ratings mean more inquiries routed to you over time.' },
  { Icon: BarChart3, title: 'Performance dashboard', desc: 'Track your quotes, conversion rates, and earnings. See how you stack up and where to improve.' },
  { Icon: TrendingUp, title: 'Expand your reach', desc: 'Reach buyers across your city — and beyond — who would never have found your shop otherwise.' },
  { Icon: Shield, title: 'Fair competition', desc: 'Blind bidding means you compete on price and service, not relationships. The best quote wins.' },
];

const FAQ = [
  { q: 'Is it really free?', a: 'Yes. There are no listing fees, no subscription charges, and no commissions taken from your sales. We monetize through premium features later — the core platform is free.' },
  { q: 'How do inquiries get routed to me?', a: 'When a buyer submits an inquiry matching your product categories and city, you receive it automatically. You see the full product specs and quantity but not the buyer\'s identity.' },
  { q: 'What happens if I don\'t win a quote?', a: 'You receive the winning price as a market benchmark. This helps you understand competitive pricing and adjust your strategy for future quotes.' },
  { q: 'How quickly do I need to respond?', a: 'There\'s no hard deadline, but faster responses tend to win more quotes. Most successful dealers respond within 2-4 hours.' },
  { q: 'What areas do you cover?', a: 'We\'re currently active across major cities in India — starting with Rajasthan and expanding. If you\'re an electrical dealer anywhere in India, you can register.' },
];

export function DealerLandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-20 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-amber-600 mb-4">For Electrical Dealers & Distributors</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-[1.05] tracking-tight">
              Grow your business with <span className="text-amber-600">real buyer inquiries</span>.
            </h1>
            <p className="text-lg text-gray-500 mb-8 leading-relaxed">
              Hub4Estate connects you with buyers who need electrical products right now. No cold calling. No middlemen. Just qualified inquiries, delivered to your dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/dealer/onboarding" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors">
                Register as Dealer — Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/dealer/login" className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-gray-200 text-gray-600 font-medium rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors">
                Already registered? Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-stone-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">How it works for dealers</h2>
          <p className="text-gray-500 mb-12">Three simple steps. No upfront cost.</p>

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

      {/* Benefits */}
      <section className="bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Why dealers join Hub4Estate</h2>
          <p className="text-gray-500 mb-12 max-w-lg">Everything you need to grow your electrical business. Zero cost to get started.</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map(({ Icon, title, desc }, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-gray-600" />
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

      {/* Numbers */}
      <section className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { stat: '10+', label: 'Active clients served' },
              { stat: '₹37K', label: 'Avg. savings per order' },
              { stat: '4+', label: 'Cities covered' },
              { stat: '100%', label: 'Free for dealers' },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-3xl font-bold text-white mb-1">{item.stat}</p>
                <p className="text-sm text-gray-400">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 tracking-tight">Common questions</h2>
          <div className="divide-y divide-gray-200">
            {FAQ.map((item, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-5 text-left"
                >
                  <span className="text-base font-medium text-gray-900">{item.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <p className="pb-5 text-sm text-gray-500 leading-relaxed">{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gray-900 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Ready to grow your business?</h2>
          <p className="text-gray-400 mb-8">Join Hub4Estate for free. Start receiving qualified buyer inquiries today.</p>
          <Link to="/dealer/onboarding" className="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors">
            Register as Dealer — Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
