import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowRight, Clock, Shield, Zap, CheckCircle, Star, TrendingUp, Users, Store, IndianRupee, FileText, Truck, Award, BarChart3 } from 'lucide-react';
import { InteractiveCategoryGrid } from '../components/InteractiveCategoryGrid';
import { ElectricalBackgroundSystem } from '../components/ElectricalBackgroundSystem';
import { productsApi } from '../lib/api';

export function HomePage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    productsApi.getCategories()
      .then(res => {
        setCategories(res.data.categories || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load categories:', err);
        setLoading(false);
      });
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { value: '500+', label: 'Verified Dealers' },
    { value: '10,000+', label: 'Products' },
    { value: '60', label: 'Seconds Avg Response' },
    { value: '50+', label: 'Cities Covered' },
  ];

  const urgencyBenefits = [
    { icon: Clock, text: 'Get quotes in under 60 seconds' },
    { icon: Shield, text: 'All dealers verified & background-checked' },
    { icon: Zap, text: 'Guaranteed lowest prices or money back' },
  ];

  return (
    <div className="min-h-screen bg-white relative">
      {/* Electrical background system */}
      <ElectricalBackgroundSystem />

      {/* Urgency Ticker */}
      <div className="ticker">
        <div className="ticker-content">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex">
              <span className="ticker-item">
                <span className="w-2 h-2 bg-accent-500 rounded-full mr-3 animate-pulse"></span>
                LIMITED TIME: FREE DELIVERY ON ORDERS ABOVE ₹5,000
              </span>
              <span className="ticker-item">
                <span className="w-2 h-2 bg-success-500 rounded-full mr-3 animate-pulse"></span>
                247 BUYERS GOT QUOTES IN THE LAST HOUR
              </span>
              <span className="ticker-item">
                <span className="w-2 h-2 bg-warning-500 rounded-full mr-3 animate-pulse"></span>
                PRICES UPDATED EVERY 24 HOURS — ACT NOW
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-white border-b-2 border-neutral-900 overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 grid-bg"></div>

        <div className="container-custom relative py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <div className="animate-slide-up">
              {/* Urgency Badge */}
              <div className="inline-flex items-center bg-neutral-900 text-white px-4 py-2 mb-8">
                <span className="w-2 h-2 bg-accent-500 rounded-full mr-3 animate-pulse"></span>
                <span className="text-sm font-bold uppercase tracking-wider">Price Drop Alert: Save Up to 40% Today</span>
              </div>

              {/* Brand Badge */}
              <div className="inline-flex items-center border-2 border-accent-500 text-accent-600 px-4 py-2 mb-8 ml-4">
                <Zap className="w-4 h-4 mr-2" />
                <span className="text-sm font-bold uppercase tracking-wider">India's #1 Electrical Products Marketplace</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-neutral-900 mb-6 leading-[0.9]">
                Buy Electrical Products.<br />
                <span className="text-accent-600">Save 20-40%.</span><br />
                In 60 Seconds.
              </h1>

              {/* Subheadline */}
              <p className="text-xl md:text-2xl text-neutral-600 mb-8 max-w-xl font-medium leading-relaxed">
                Wires, switches, MCBs, fans, lights — get <span className="text-neutral-900 font-bold">instant quotes</span> from 500+ verified electrical dealers.
                Compare prices. Pick the best deal.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link to="/rfq/create" className="btn-urgent group">
                  Get Instant Quote
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/categories" className="btn-secondary">
                  Browse Products
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-col gap-3">
                {urgencyBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                    <benefit.icon className="w-5 h-5 text-neutral-900" />
                    <span>{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Countdown & Stats */}
            <div className="animate-slide-left">
              {/* Countdown Timer */}
              <div className="bg-neutral-900 p-8 mb-8">
                <p className="text-accent-500 text-sm font-bold uppercase tracking-wider mb-4">
                  Today's Offer Ends In
                </p>
                <div className="flex gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-5xl md:text-6xl font-black text-white tabular-nums">
                      {String(countdown.hours).padStart(2, '0')}
                    </div>
                    <div className="text-xs uppercase tracking-wider text-neutral-400 mt-2">Hours</div>
                  </div>
                  <div className="text-5xl font-black text-accent-500">:</div>
                  <div className="text-center">
                    <div className="text-5xl md:text-6xl font-black text-white tabular-nums">
                      {String(countdown.minutes).padStart(2, '0')}
                    </div>
                    <div className="text-xs uppercase tracking-wider text-neutral-400 mt-2">Minutes</div>
                  </div>
                  <div className="text-5xl font-black text-accent-500">:</div>
                  <div className="text-center">
                    <div className="text-5xl md:text-6xl font-black text-white tabular-nums">
                      {String(countdown.seconds).padStart(2, '0')}
                    </div>
                    <div className="text-xs uppercase tracking-wider text-neutral-400 mt-2">Seconds</div>
                  </div>
                </div>
                <p className="text-neutral-400 text-sm">
                  <span className="text-white font-bold">127 people</span> are viewing deals right now
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="card-stat">
                    <div className="text-4xl font-black text-neutral-900">{stat.value}</div>
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="bg-primary-50 border-b-2 border-neutral-200 py-6">
        <div className="container-custom">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-10 h-10 bg-neutral-300 border-2 border-white rounded-full" />
                ))}
              </div>
              <span className="text-sm font-bold text-neutral-700">
                <span className="text-neutral-900">2,847</span> happy customers this month
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-warning-400 text-warning-400" />
                ))}
              </div>
              <span className="text-sm font-bold text-neutral-700">
                <span className="text-neutral-900">4.9/5</span> from 12,000+ reviews
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success-600" />
              <span className="text-sm font-bold text-neutral-700">
                <span className="text-neutral-900">₹2.4 Cr</span> saved by customers
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Whether You're Buying or Selling */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-4">
              Whether You're Buying or Selling
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Hub4Estate works for both sides of the electrical marketplace
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* For Buyers */}
            <div className="border-2 border-neutral-900 p-8 bg-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-accent-500 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-accent-600">For Buyers</span>
                  <h3 className="text-2xl font-black text-neutral-900">Home Builders & Contractors</h3>
                </div>
              </div>
              <div className="space-y-4 mb-8">
                {[
                  { icon: IndianRupee, title: 'Save 20-40% on Every Order', desc: 'Dealers compete to give you the best price' },
                  { icon: Shield, title: '100% Verified Products', desc: 'No fake brands, no duplicates, full warranty' },
                  { icon: Clock, title: 'Get Quotes in 60 Seconds', desc: 'No more visiting 10 shops to compare prices' },
                  { icon: FileText, title: 'Proper Documentation', desc: 'GST bills, warranty cards, delivery proof' },
                  { icon: Truck, title: 'Doorstep Delivery', desc: 'Products delivered to your site or home' },
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-neutral-100 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-4 h-4 text-neutral-700" />
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900">{benefit.title}</p>
                      <p className="text-sm text-neutral-600">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/rfq/create" className="btn-urgent w-full justify-center">
                Get Free Quotes Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>

            {/* For Dealers */}
            <div className="border-2 border-neutral-900 p-8 bg-neutral-900 text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-accent-500 flex items-center justify-center">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-accent-400">For Dealers</span>
                  <h3 className="text-2xl font-black text-white">Electrical Shops & Distributors</h3>
                </div>
              </div>
              <div className="space-y-4 mb-8">
                {[
                  { icon: Users, title: 'Quality Leads Daily', desc: 'Get verified buyer inquiries delivered to you' },
                  { icon: IndianRupee, title: 'Zero Upfront Fees', desc: 'No listing fees, no monthly charges' },
                  { icon: Award, title: 'Build Your Reputation', desc: 'Get reviews and ratings from real customers' },
                  { icon: BarChart3, title: 'Performance Analytics', desc: 'Track your quotes, wins, and conversion rate' },
                  { icon: TrendingUp, title: 'Grow Your Business', desc: 'Access customers you could never reach before' },
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-neutral-800 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-4 h-4 text-accent-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white">{benefit.title}</p>
                      <p className="text-sm text-neutral-400">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/dealer/onboarding" className="btn-accent w-full justify-center">
                Register as Dealer — Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Bold Steps */}
      <section className="section bg-neutral-50 border-y-2 border-neutral-200">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-4">
              3 Steps. 60 Seconds. Done.
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              No more running to 10 shops. No more haggling. No more getting ripped off.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                title: 'Tell Us What You Need',
                description: 'Select products from our catalog. Add quantities. Takes 30 seconds.',
                highlight: 'Takes 30 seconds'
              },
              {
                step: '02',
                title: 'Dealers Fight For You',
                description: 'Verified dealers compete to give you the best price. You sit back.',
                highlight: 'You sit back'
              },
              {
                step: '03',
                title: 'Pick The Winner',
                description: 'Compare quotes side-by-side. Choose the best deal. Pay securely.',
                highlight: 'Compare & Choose'
              },
            ].map((item, index) => (
              <div key={index} className="card-feature group">
                <div className="step-number mb-6">{item.step}</div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">{item.title}</h3>
                <p className="text-neutral-600 mb-4">{item.description}</p>
                <span className="inline-flex items-center text-sm font-bold text-accent-600 uppercase tracking-wider">
                  {item.highlight}
                </span>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/rfq/create" className="btn-urgent">
              Start Getting Quotes Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid with Interactive Illustrations */}
      <section className="section bg-neutral-800 text-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="inline-block text-accent-400 text-sm font-bold uppercase tracking-wider mb-4">
              Shop By Category
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Everything Electrical.<br />One Platform.
            </h2>
            <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
              Havells, Polycab, Schneider, Legrand, Anchor — all major brands with verified specs, compliance info, and warranty details.
            </p>
          </div>

          {/* Interactive Category Grid with SVG illustrations */}
          <InteractiveCategoryGrid categories={categories} loading={loading} />

          <div className="text-center mt-12">
            <Link to="/categories" className="btn-accent">
              Explore Full Catalog
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* The Problem Section - The Ugly Truth */}
      <section className="section bg-white border-b-2 border-neutral-200">
        <div className="container-tight">
          <div className="text-center mb-16">
            <span className="inline-block text-error-600 text-sm font-bold uppercase tracking-wider mb-4">
              The Ugly Truth
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-4">
              You're Getting Ripped Off.<br />Here's How.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {[
              {
                title: 'The 40% Markup Scam',
                description: 'Local dealers mark up prices 30-50%. The same wire that costs ₹1,200 at wholesale is sold to you for ₹1,800.',
                stat: '40%',
                statLabel: 'Average Markup'
              },
              {
                title: 'The Fake Brand Trap',
                description: 'Duplicate products look identical to originals. Without proper verification, you could be buying counterfeit goods.',
                stat: '23%',
                statLabel: 'Products Are Fake'
              },
              {
                title: 'The Information Gap',
                description: 'Dealers know everything. You know nothing. This power imbalance costs you money on every single purchase.',
                stat: '₹15K',
                statLabel: 'Avg Lost Per Project'
              },
              {
                title: 'Zero Documentation',
                description: 'No proper bills, no warranty cards, no proof. When something fails, you have no recourse.',
                stat: '67%',
                statLabel: 'Have No Paperwork'
              },
            ].map((item, index) => (
              <div key={index} className="border-2 border-neutral-200 p-8 hover:border-neutral-900 hover:shadow-brutal transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-neutral-900">{item.title}</h3>
                  <div className="text-right">
                    <div className="text-3xl font-black text-error-600">{item.stat}</div>
                    <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">{item.statLabel}</div>
                  </div>
                </div>
                <p className="text-neutral-600">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Solution Box */}
          <div className="bg-neutral-900 text-white p-10 text-center">
            <h3 className="text-3xl font-black mb-4">
              Hub4Estate Fixes Everything.
            </h3>
            <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
              Transparent pricing. Verified dealers. Full documentation. Price comparison.
              <span className="text-accent-400 font-bold"> The playing field is now level.</span>
            </p>
            <Link to="/rfq/create" className="btn-accent inline-flex">
              Start Saving Money Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section bg-primary-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="inline-block text-neutral-900 text-sm font-bold uppercase tracking-wider mb-4">
              Real Results
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-4">
              Customers Saved ₹2.4 Crores.<br />This Month Alone.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "I was quoted ₹85,000 by a local dealer. Hub4Estate got me the same order for ₹52,000. That's ₹33,000 saved!",
                author: 'Rajesh Kumar',
                role: 'Home Builder, Bangalore',
                saved: '₹33,000'
              },
              {
                quote: "The comparison feature is genius. I could see exactly which dealer was trying to overcharge me. Never going back to the old way.",
                author: 'Priya Sharma',
                role: 'Interior Designer, Mumbai',
                saved: '₹28,500'
              },
              {
                quote: "As a contractor, I buy electrical items daily. Hub4Estate reduced my procurement costs by 25%. My margins improved overnight.",
                author: 'Mohammed Irfan',
                role: 'Electrical Contractor, Delhi',
                saved: '₹1.2 Lakhs'
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white border-2 border-neutral-900 p-8">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-warning-400 text-warning-400" />
                  ))}
                </div>
                <blockquote className="text-lg text-neutral-700 mb-6">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center justify-between border-t-2 border-neutral-200 pt-6">
                  <div>
                    <p className="font-bold text-neutral-900">{testimonial.author}</p>
                    <p className="text-sm text-neutral-500">{testimonial.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Saved</p>
                    <p className="text-xl font-black text-success-600">{testimonial.saved}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-accent-500">
        <div className="container-custom text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Ready To Save Money?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of smart buyers who refuse to overpay.
            Your first quote is free. Always.
          </p>
          <Link to="/rfq/create" className="btn-primary bg-white text-neutral-900 border-white hover:bg-neutral-900 hover:text-white hover:border-neutral-900">
            Get Your Free Quote Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
