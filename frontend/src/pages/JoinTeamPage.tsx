import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Zap, Mail, Phone, MapPin, Users, Briefcase, Code, TrendingUp,
  Send, CheckCircle, Linkedin, User, FileText,
} from 'lucide-react';

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
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    linkedin: '',
    vision: '',
  });
  const [submitted, setSubmitted] = useState(false);

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
    { icon: TrendingUp, title: 'Real Ownership', description: 'Real responsibility from day one — not ticket-filing' },
    { icon: Users, title: 'Actual Impact', description: 'Your work directly saves buyers money on every deal' },
    { icon: Briefcase, title: 'Hard Problems', description: 'Fragmented markets, trust, pricing opacity — not CRUD apps' },
    { icon: Code, title: 'Long Game', description: 'Building infrastructure for decades — not a quick flip' },
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
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">We're hiring</p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
            Join the Mission
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            We're building the price transparency infrastructure for electrical procurement in India.
            We want people who want to solve hard, unsexy problems with real market impact.
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-14">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-8 text-center">Why Join Hub4Estate?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 text-center">
                  <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-4.5 h-4.5 text-gray-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Open Positions */}
      <div className="px-6 py-14 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Open Positions</h2>
        <div className="space-y-3">
          {openPositions.map((position, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900">{position.title}</h3>
                  <div className="flex flex-wrap gap-3 mt-1.5">
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                      <Briefcase className="w-3 h-3" /> {position.type}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                      <MapPin className="w-3 h-3" /> {position.location}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mt-3">
                    <span className="text-gray-400">You'll own: </span>{position.problem}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{position.description}</p>
                </div>
                <a
                  href="#apply"
                  className="inline-flex items-center justify-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors flex-shrink-0"
                >
                  Apply
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl text-center">
          <p className="text-sm text-gray-500">
            Don't see your role? If you understand the problem we're solving and can contribute —{' '}
            <a href="#apply" className="text-gray-900 font-medium hover:underline">send a general application.</a>
          </p>
        </div>
      </div>

      {/* Application Form */}
      <div id="apply" className="bg-gray-50 border-y border-gray-200 px-6 py-14">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Apply Now</h2>
            <p className="text-sm text-gray-500">Tell us who you are, what you've done, and why Hub4Estate.</p>
          </div>

          {submitted ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Application sent!</h3>
              <p className="text-sm text-gray-500 mb-4">
                Your email client should have opened. If it didn't, email directly:
              </p>
              <a href="mailto:shreshth.agarwal@hub4estate.com" className="text-sm font-medium text-gray-900 hover:underline">
                shreshth.agarwal@hub4estate.com
              </a>
              <button
                onClick={() => setSubmitted(false)}
                className="block mx-auto mt-5 text-sm text-gray-400 hover:text-gray-700"
              >
                Submit another application
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Full name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Phone <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">LinkedIn (optional)</label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors"
                    placeholder="linkedin.com/in/yourprofile"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Position <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 bg-white transition-colors"
                  >
                    <option value="">Select a position</option>
                    {openPositions.map((pos, i) => (
                      <option key={i} value={pos.title}>{pos.title}</option>
                    ))}
                    <option value="Other">Other / General Application</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Experience <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 bg-white transition-colors"
                  >
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
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Why Hub4Estate? <span className="text-red-400">*</span>
                </label>
                <p className="text-xs text-gray-400 mb-2">What you've done that's relevant, and why you want in on this specifically.</p>
                <textarea
                  name="vision"
                  value={formData.vision}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none"
                  placeholder="What have you built or done that's relevant? Why does this problem matter to you?"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
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

      {/* Contact */}
      <div className="bg-gray-900 px-6 py-14">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-white mb-2">Questions?</h2>
          <p className="text-gray-400 mb-8 text-sm">Reach out directly to our founder.</p>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-left">
            <p className="text-sm font-semibold text-white mb-4">Shreshth Agarwal — Founder, Hub4Estate</p>
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
