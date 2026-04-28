import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, Mail, Phone, MapPin, Users, Briefcase, Code, TrendingUp,
  Send, CheckCircle, Linkedin, ArrowRight,
} from 'lucide-react';
import { useInView, revealStyle } from '../hooks/useInView';
import { SEO } from '@/components/SEO';

interface ApplicationForm {
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  linkedin: string;
  vision: string;
}

export function JoinTeamPage() {
  const [formData, setFormData] = useState<ApplicationForm>({
    name: '', email: '', phone: '', position: '', experience: '', linkedin: '', vision: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const { ref: heroRef, inView: heroIn } = useInView(0.05);
  const { ref: benefitsRef, inView: benefitsIn } = useInView(0.05);
  const { ref: positionsRef, inView: positionsIn } = useInView(0.05);
  const { ref: formRef, inView: formIn } = useInView(0.05);

  const openPositions = [
    {
      title: 'Full-Stack Engineer / Tech Lead',
      type: 'Full-time',
      location: 'Remote / Hybrid',
      problem: 'Build and own the RFQ engine, dealer matching logic, quote comparison, and the platform backend.',
      description: 'Strong in React + Node.js + PostgreSQL. You think in systems, not just features. Marketplace or B2B experience is a plus.',
    },
    {
      title: 'Dealer Acquisition Lead',
      type: 'Full-time',
      location: 'Pan India',
      problem: 'Bring verified electrical dealers onto the platform. Build relationships with traditional businesses.',
      description: 'B2B sales experience. You know how to earn trust with shop owners and distributors — not just pitch decks.',
    },
    {
      title: 'Operations & Catalog Lead',
      type: 'Full-time',
      location: 'Remote',
      problem: 'Structure electrical product data — specs, brands, categories, compliance (ISI/BIS). Keep the catalog clean.',
      description: 'Detail-oriented. Comfortable with spreadsheets, scraping workflows, and systematic data management.',
    },
    {
      title: 'Marketing & Growth Intern',
      type: 'Internship',
      location: 'Remote',
      problem: 'Help buyers find us. Content, social, SEO, community — whatever actually works.',
      description: 'Creative, self-directed, willing to try things and be honest when they fail. No fluff.',
    },
  ];

  const benefits = [
    { icon: TrendingUp, title: 'Real Ownership', description: 'Real responsibility from day one — not ticket-filing', accent: 'bg-amber-900/30 text-amber-500' },
    { icon: Users, title: 'Actual Impact', description: 'Your work directly saves buyers money on every deal', accent: 'bg-green-900/30 text-green-400' },
    { icon: Briefcase, title: 'Hard Problems', description: 'Fragmented markets, trust, pricing opacity — not CRUD apps', accent: 'bg-violet-900/30 text-violet-400' },
    { icon: Code, title: 'Long Game', description: 'Building infrastructure for decades — not a quick flip', accent: 'bg-blue-900/30 text-blue-400' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Job Application: ${formData.position || 'General'} - ${formData.name}`);
    const body = encodeURIComponent(
`New Job Application for Hub4Estate

APPLICANT DETAILS
-----------------
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
LinkedIn: ${formData.linkedin || 'Not provided'}

POSITION
--------
Applied for: ${formData.position || 'General Application'}
Experience: ${formData.experience}

VISION & MOTIVATION
-------------------
${formData.vision}

---
Submitted via Hub4Estate Join Team Page`
    );
    window.location.href = `mailto:shreshth.agarwal@hub4estate.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Join Our Team - Careers at Hub4Estate"
        description="Join Hub4Estate and help build India's first transparent procurement platform for electrical products. Open positions in engineering, sales, operations, and more."
        keywords="Hub4Estate careers, jobs at Hub4Estate, electrical marketplace jobs India, construction tech careers"
        canonicalUrl="/join-team"
      />

      {/* Hero — dark */}
      <div className="bg-[#09090B] blueprint-bg-dark relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-amber-600/8 rounded-full blur-3xl animate-glow-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-violet-500/6 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '2s' }} />
        </div>
        <div ref={heroRef as any} className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-800 text-gray-300 text-[11px] font-semibold rounded-full mb-6" style={revealStyle(heroIn, 0)}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            We're hiring
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-5 tracking-tight" style={revealStyle(heroIn, 0.06)}>
            Join the<br />
            <span className="text-amber-500">Mission</span>
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed max-w-2xl" style={revealStyle(heroIn, 0.12)}>
            We're building the price transparency infrastructure for electrical procurement in India.
            We want people who want to solve hard, unsexy problems with real market impact.
          </p>
          <div className="mt-8" style={revealStyle(heroIn, 0.16)}>
            <a href="#apply" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 text-sm font-bold rounded-xl hover:bg-gray-100 transition-colors">
              Apply Now <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div ref={benefitsRef as any} className="px-6 py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl font-black text-gray-900 mb-10 text-center tracking-tight" style={revealStyle(benefitsIn, 0)}>
          Why Join Hub4Estate?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {benefits.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-2xl p-6 card-3d"
                style={revealStyle(benefitsIn, 0.08 + i * 0.06)}
              >
                <div className={`w-10 h-10 ${benefit.accent} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">{benefit.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Open Positions — dark */}
      <div ref={positionsRef as any} className="bg-[#09090B] px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-white mb-8 tracking-tight" style={revealStyle(positionsIn, 0)}>Open Positions</h2>
          <div className="space-y-3">
            {openPositions.map((position, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors"
                style={revealStyle(positionsIn, 0.06 + i * 0.06)}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-white">{position.title}</h3>
                    <div className="flex flex-wrap gap-3 mt-1.5">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <Briefcase className="w-3 h-3" /> {position.type}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" /> {position.location}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-300 mt-3">
                      <span className="text-gray-500">You'll own: </span>{position.problem}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{position.description}</p>
                  </div>
                  <a
                    href="#apply"
                    className="inline-flex items-center justify-center px-4 py-2 bg-amber-600 text-white text-sm font-bold rounded-xl hover:bg-amber-700 transition-colors flex-shrink-0"
                  >
                    Apply
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-5 bg-white/5 border border-white/10 rounded-2xl text-center" style={revealStyle(positionsIn, 0.35)}>
            <p className="text-sm text-gray-400">
              Don't see your role? If you understand the problem we're solving and can contribute —{' '}
              <a href="#apply" className="text-white font-bold hover:underline">send a general application.</a>
            </p>
          </div>
        </div>
      </div>

      {/* Application Form */}
      <div id="apply" ref={formRef as any} className="px-6 py-20 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10" style={revealStyle(formIn, 0)}>
            <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Apply Now</h2>
            <p className="text-sm text-gray-500">Tell us who you are, what you've done, and why Hub4Estate.</p>
          </div>

          {submitted ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm" style={revealStyle(formIn, 0.08)}>
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Application sent!</h3>
              <p className="text-sm text-gray-500 mb-4">
                Your email client should have opened. If it didn't, email directly:
              </p>
              <a href="mailto:shreshth.agarwal@hub4estate.com" className="text-sm font-bold text-gray-900 hover:underline">
                shreshth.agarwal@hub4estate.com
              </a>
              <button onClick={() => setSubmitted(false)} className="block mx-auto mt-5 text-sm text-gray-400 hover:text-gray-700">
                Submit another application
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm" style={revealStyle(formIn, 0.08)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full name <span className="text-red-400">*</span></label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 transition-colors"
                    placeholder="Your full name" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email <span className="text-red-400">*</span></label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 transition-colors"
                    placeholder="your@email.com" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone <span className="text-red-400">*</span></label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 transition-colors"
                    placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">LinkedIn (optional)</label>
                  <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 transition-colors"
                    placeholder="linkedin.com/in/yourprofile" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Position <span className="text-red-400">*</span></label>
                  <select name="position" value={formData.position} onChange={handleChange} required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 bg-white transition-colors">
                    <option value="">Select a position</option>
                    {openPositions.map((pos, i) => (
                      <option key={i} value={pos.title}>{pos.title}</option>
                    ))}
                    <option value="Other">Other / General Application</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Experience <span className="text-red-400">*</span></label>
                  <select name="experience" value={formData.experience} onChange={handleChange} required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 bg-white transition-colors">
                    <option value="">Select experience</option>
                    <option value="0-1 years">0–1 years (Fresher / Student)</option>
                    <option value="1-3 years">1–3 years</option>
                    <option value="3-5 years">3–5 years</option>
                    <option value="5-10 years">5–10 years</option>
                    <option value="10+ years">10+ years</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Why Hub4Estate? <span className="text-red-400">*</span></label>
                <p className="text-xs text-gray-400 mb-2">What you've done that's relevant, and why you want in on this specifically.</p>
                <textarea name="vision" value={formData.vision} onChange={handleChange} required rows={5}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none"
                  placeholder="What have you built or done that's relevant? Why does this problem matter to you?" />
              </div>

              <button type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors">
                <Send className="w-4 h-4" />
                Submit application
              </button>

              <p className="text-xs text-gray-400 text-center">
                By submitting, you agree to our{' '}
                <Link to="/privacy" className="text-gray-600 hover:text-gray-900">Privacy Policy</Link>
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Contact — dark */}
      <div className="bg-[#09090B] px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Zap className="w-6 h-6 text-amber-500" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Questions?</h2>
          <p className="text-gray-400 mb-8 text-sm">Reach out directly to our founder.</p>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left">
            <p className="text-sm font-bold text-white mb-4">Shreshth Agarwal — Founder, Hub4Estate</p>
            <div className="space-y-3">
              <a href="mailto:shreshth.agarwal@hub4estate.com" className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors">
                <Mail className="w-4 h-4 flex-shrink-0" />
                shreshth.agarwal@hub4estate.com
              </a>
              <a href="tel:+917690001999" className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors">
                <Phone className="w-4 h-4 flex-shrink-0" />
                +91 76900 01999
              </a>
              <a href="https://linkedin.com/in/sa-h4e" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors">
                <Linkedin className="w-4 h-4 flex-shrink-0" />
                linkedin.com/in/sa-h4e
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
