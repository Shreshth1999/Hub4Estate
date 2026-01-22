import { Link } from 'react-router-dom';
import {
  ArrowLeft, Zap, Target, Users, TrendingUp, Award,
  Mail, Phone, ArrowRight
} from 'lucide-react';

export function AboutPage() {
  const milestones = [
    { year: '2024', title: 'Idea Born', description: 'Identified the gap in electrical procurement market' },
    { year: '2025', title: 'Platform Launch', description: 'Hub4Estate goes live with 100+ dealers' },
    { year: '2026', title: 'Expansion', description: '500+ dealers, 50+ cities, 10,000+ products' },
  ];

  const values = [
    {
      icon: Target,
      title: 'Transparency',
      description: 'Clear pricing, no hidden costs. What you see is what you get.',
    },
    {
      icon: Users,
      title: 'Trust',
      description: 'Every dealer is verified. Every product is authentic.',
    },
    {
      icon: TrendingUp,
      title: 'Efficiency',
      description: 'Save time and money with streamlined procurement.',
    },
    {
      icon: Award,
      title: 'Quality',
      description: 'Only the best brands and products on our platform.',
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
              Building India's Procurement
              <span className="text-accent-400"> Infrastructure for Electrical</span>
            </h1>
            <p className="text-xl text-neutral-300 leading-relaxed">
              Hub4Estate is not a typical e-commerce website. It's an RFQ-driven, price-discovery engine where
              dealers compete transparently to give buyers the best deal on electrical products.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-6">
                Why Electrical? Why Now?
              </h2>
              <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
                The electrical sector in Indian real estate is highly fragmented, opaque in pricing, and dealer-dependent.
                The same Havells switch or Polycab wire is sold at vastly different prices depending on the buyer's knowledge and negotiation ability.
              </p>
              <p className="text-lg text-neutral-600 leading-relaxed">
                Hub4Estate fixes this by standardizing the catalog, verifying every dealer, and creating a transparent
                RFQ system where price competition happens on merit—not relationships.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-neutral-900 text-white p-8">
                <div className="text-4xl font-black text-accent-400 mb-2">500+</div>
                <div className="text-sm font-bold uppercase tracking-wider text-neutral-400">Verified Dealers</div>
              </div>
              <div className="bg-neutral-900 text-white p-8">
                <div className="text-4xl font-black text-accent-400 mb-2">50+</div>
                <div className="text-sm font-bold uppercase tracking-wider text-neutral-400">Cities</div>
              </div>
              <div className="bg-neutral-900 text-white p-8">
                <div className="text-4xl font-black text-accent-400 mb-2">10K+</div>
                <div className="text-sm font-bold uppercase tracking-wider text-neutral-400">Products</div>
              </div>
              <div className="bg-neutral-900 text-white p-8">
                <div className="text-4xl font-black text-accent-400 mb-2">15-25%</div>
                <div className="text-sm font-bold uppercase tracking-wider text-neutral-400">Avg. Savings</div>
              </div>
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
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-2xl font-black text-neutral-900 mb-2">Shreshth Agarwal</h3>
                  <p className="text-accent-600 font-bold mb-4">Founder & CEO, Hub4Estate LLP</p>
                  <p className="text-neutral-600 mb-6 leading-relaxed">
                    Hub4Estate is a direct extension of Shreshth's lived experience—watching real estate professionals
                    struggle with fragmented information, endless calls, and opaque pricing. This platform is not a
                    generic startup but an operator's product, built by someone who understands the pain of procurement
                    in Indian real estate.
                  </p>
                  <p className="text-neutral-600 mb-6 leading-relaxed">
                    The electrical focus reflects a deliberate choice: start where chaos is highest, margins are opaque,
                    and repeat demand is guaranteed. The long-term vision is to become the default procurement layer
                    for electrical materials in Indian real estate projects.
                  </p>
                  <blockquote className="border-l-4 border-accent-500 pl-4 italic text-neutral-700 mb-6">
                    "We're replacing phone calls, WhatsApp negotiations, and fragmented dealer networks with a single
                    intelligent interface. If executed correctly, this becomes extremely hard to displace."
                  </blockquote>
                  <div className="flex flex-wrap gap-4">
                    <a
                      href="mailto:shresth.agarwal@hub4estate.com"
                      className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900"
                    >
                      <Mail className="w-5 h-5" />
                      <span className="font-medium">shresth.agarwal@hub4estate.com</span>
                    </a>
                    <a
                      href="tel:+917690001999"
                      className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900"
                    >
                      <Phone className="w-5 h-5" />
                      <span className="font-medium">+91 76900 01999</span>
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
              Our Values
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              These principles guide everything we do at Hub4Estate.
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

      {/* Timeline */}
      <section className="py-20 bg-neutral-900 text-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Our Journey</h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-6">
                  <div className="w-20 flex-shrink-0 text-right">
                    <span className="text-2xl font-black text-accent-400">{milestone.year}</span>
                  </div>
                  <div className="w-px bg-neutral-700 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-accent-500 rounded-full" />
                  </div>
                  <div className="flex-1 pb-8">
                    <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                    <p className="text-neutral-400">{milestone.description}</p>
                  </div>
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
            Ready to Experience Better Procurement?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of buyers and dealers already using Hub4Estate.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/rfq/create" className="btn-primary bg-white text-neutral-900 border-white hover:bg-neutral-900 hover:text-white hover:border-neutral-900">
              Get Started
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
