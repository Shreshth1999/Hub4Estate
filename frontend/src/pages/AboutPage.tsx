import { Link } from 'react-router-dom';
import {
  ArrowLeft, Zap, Target, Users, TrendingUp, Award,
  Mail, Phone, ArrowRight, Linkedin
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
    {
      icon: Target,
      title: 'Transparency',
      description: 'You see every quote side by side. No hidden prices, no dealer favouritism, no undisclosed commissions.',
    },
    {
      icon: Users,
      title: 'Access',
      description: 'The same dealer network that big contractors use — now available to anyone who needs one electrical product.',
    },
    {
      icon: TrendingUp,
      title: 'Honesty',
      description: "We don't claim numbers we haven't earned. Every stat on this platform is real. Every deal we share is verified.",
    },
    {
      icon: Award,
      title: 'Long Game',
      description: 'We are building infrastructure, not a quick flip. Electricals first. Every category in construction eventually.',
    },
  ];

  const realDeals = [
    {
      product: 'Sony Tower Speaker + 2 Mics',
      market: '₹1,05,000 (Croma)',
      hub4estate: '₹68,000',
      saved: '₹37,000',
    },
    {
      product: 'Philips 15W LED Panels × 200',
      market: '₹585/pc (local dealer)',
      hub4estate: '₹465/pc with shipping',
      saved: '₹24,000',
    },
    {
      product: 'FRLS 2.5mm² Wire × 200m',
      market: '₹127/m (highest quote)',
      hub4estate: '₹83/m (best dealer)',
      saved: '₹8,800',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-neutral-900 text-white py-20">
        <div className="container-custom">
          <Link to="/" className="inline-flex items-center text-neutral-400 hover:text-white mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500 text-white text-sm font-bold uppercase tracking-wider mb-6">
              <Zap className="w-4 h-4" />
              Our Story
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
              Fixing the Price Information
              <span className="text-accent-400"> Problem in Electrical Procurement.</span>
            </h1>
            <p className="text-xl text-neutral-300 leading-relaxed">
              Hub4Estate exists because the same product is priced completely differently
              by different dealers — and most buyers have no way to know. We're fixing that.
            </p>
          </div>
        </div>
      </section>

      {/* The Problem We're Solving */}
      <section className="py-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-6">
                Why Electrical? Why Now?
              </h2>
              <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
                The electrical sector in India is highly fragmented and opaque. The same Havells switch
                or Polycab wire is priced differently by every dealer depending on who you are and how
                much you know. Buyers without industry connections routinely pay far more than they need to.
              </p>
              <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
                Hub4Estate was built to close that gap. We connect buyers to multiple verified dealers,
                let them compete on price, and give the buyer full visibility into every quote.
                No middlemen. No guesswork. Just the real price.
              </p>
              <p className="text-lg text-neutral-600 leading-relaxed">
                We started with electricals because the chaos is highest here, the margins are most
                opaque, and the repeat demand is guaranteed. This is phase one. Every procurement
                category in construction follows.
              </p>
            </div>

            {/* Real Deals as proof */}
            <div className="space-y-4">
              <p className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-4">
                Real Deals We've Closed
              </p>
              {realDeals.map((deal, i) => (
                <div key={i} className="border-2 border-neutral-200 p-6 hover:border-neutral-900 transition-all">
                  <p className="font-bold text-neutral-900 mb-3">{deal.product}</p>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-500">Market price</span>
                    <span className="text-neutral-500 line-through">{deal.market}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="font-bold text-neutral-900">Hub4Estate</span>
                    <span className="font-bold text-neutral-900">{deal.hub4estate}</span>
                  </div>
                  <div className="flex justify-between border-t border-neutral-100 pt-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Saved</span>
                    <span className="font-black text-green-600">{deal.saved}</span>
                  </div>
                </div>
              ))}
              <p className="text-xs text-neutral-400 mt-2">All numbers verified. No fabrications.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="py-20 bg-neutral-50 border-y-2 border-neutral-200">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4">
                Meet the Founder
              </h2>
            </div>

            <div className="bg-white border-2 border-neutral-200 shadow-brutal p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                <div className="md:col-span-1">
                  <div className="w-48 h-48 bg-neutral-900 flex items-center justify-center mx-auto md:mx-0">
                    <span className="text-6xl font-black text-white">SA</span>
                  </div>
                  <div className="mt-6 space-y-2">
                    <div className="bg-neutral-100 px-3 py-2 text-xs font-bold text-neutral-700 uppercase tracking-wider">
                      Age 18
                    </div>
                    <div className="bg-neutral-100 px-3 py-2 text-xs font-bold text-neutral-700 uppercase tracking-wider">
                      Mesa School of Business
                    </div>
                    <div className="bg-neutral-100 px-3 py-2 text-xs font-bold text-neutral-700 uppercase tracking-wider">
                      NMIMS BBA (Distance)
                    </div>
                    <div className="bg-neutral-100 px-3 py-2 text-xs font-bold text-neutral-700 uppercase tracking-wider">
                      Sri Ganganagar, Rajasthan
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-2xl font-black text-neutral-900 mb-2">Shreshth Agarwal</h3>
                  <p className="text-accent-600 font-bold mb-6">Founder & CEO, HUB4ESTATE LLP</p>

                  <p className="text-neutral-600 mb-5 leading-relaxed">
                    Shreshth started ideating Hub4Estate at 16, watching his father — a real estate professional
                    in Sri Ganganagar — navigate endless broker calls, irrelevant leads, and opaque supplier
                    pricing. The insight that stuck: it's not a communication problem, it's an access problem.
                  </p>
                  <p className="text-neutral-600 mb-5 leading-relaxed">
                    Before Hub4Estate, Shreshth ran a dropshipping business in Class 9 (bottles to UAE/Dubai markets,
                    bought his own iPhone and MacBook from the proceeds), traded equities using hedging strategies
                    through Class 10 and 11 (₹87 lakh in returns), and ran Treva Iconic Jewels for a full year.
                    Hub4Estate is not a first venture — it's the most deliberate one.
                  </p>
                  <p className="text-neutral-600 mb-6 leading-relaxed">
                    2 years of validation, 10+ clients served manually, real deals closed across audio equipment,
                    LED lighting, and wiring — then incorporated HUB4ESTATE LLP in March 2026.
                    Electricals is the first vertical. The real play is B2B procurement infrastructure.
                  </p>

                  <blockquote className="border-l-4 border-accent-500 pl-4 italic text-neutral-700 mb-6">
                    "Unclear is dangerous. Difficult is workable. The problem is clear —
                    I know exactly what we're building and why. Everything else is just execution."
                  </blockquote>

                  <div className="flex flex-wrap gap-4">
                    <a
                      href="mailto:shreshth.agarwal@hub4estate.com"
                      className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900"
                    >
                      <Mail className="w-5 h-5" />
                      <span className="font-medium">shreshth.agarwal@hub4estate.com</span>
                    </a>
                    <a
                      href="tel:+917690001999"
                      className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900"
                    >
                      <Phone className="w-5 h-5" />
                      <span className="font-medium">+91 76900 01999</span>
                    </a>
                    <a
                      href="https://linkedin.com/in/sa-h4e"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900"
                    >
                      <Linkedin className="w-5 h-5" />
                      <span className="font-medium">linkedin.com/in/sa-h4e</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4">
              What We Stand For
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              These aren't values we put on a wall. They're the decisions we make every day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-white border-2 border-neutral-200 hover:border-neutral-900 transition-all p-6">
                  <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">{value.title}</h3>
                  <p className="text-neutral-600 text-sm">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="py-20 bg-neutral-900 text-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4">The Journey</h2>
            <p className="text-neutral-400">Two years of validation before a single line of product code.</p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-0">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-6">
                  <div className="w-24 flex-shrink-0 text-right pt-1">
                    <span className="text-sm font-black text-accent-400">{milestone.year}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-accent-500 rounded-full flex-shrink-0 mt-1" />
                    {index < milestones.length - 1 && (
                      <div className="w-px flex-1 bg-neutral-700 min-h-12" />
                    )}
                  </div>
                  <div className="flex-1 pb-10">
                    <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                    <p className="text-neutral-400 leading-relaxed">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Company Info */}
      <section className="py-12 bg-neutral-50 border-y-2 border-neutral-200">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl font-black text-neutral-900 mb-6">Company Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              {[
                { label: 'Entity', value: 'HUB4ESTATE LLP' },
                { label: 'LLPIN', value: 'ACW-4269' },
                { label: 'Incorporated', value: '17 March 2026' },
                { label: 'Registered in', value: 'Rajasthan, India' },
              ].map((item, i) => (
                <div key={i} className="bg-white border border-neutral-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">{item.label}</p>
                  <p className="font-bold text-neutral-900 text-sm">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-accent-500">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
            Ready to Find the Best Price?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Submit an inquiry and let our dealer network do the work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/rfq/create" className="btn-primary bg-white text-neutral-900 border-white hover:bg-neutral-900 hover:text-white hover:border-neutral-900">
              Submit an Inquiry
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link to="/dealer/onboarding" className="btn-secondary border-white text-white hover:bg-white hover:text-neutral-900">
              Join as Dealer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
