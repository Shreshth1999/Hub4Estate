import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Zap, Mail, Phone, MapPin, Users, Briefcase, Code, TrendingUp,
  Send, CheckCircle, Linkedin, User, FileText
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
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
      <div className="bg-neutral-900 text-white py-16">
        <div className="container-custom">
          <Link to="/" className="inline-flex items-center text-neutral-400 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500 text-white text-sm font-bold uppercase tracking-wider mb-6">
              <Users className="w-4 h-4" />
              We're Hiring
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              Join the Mission
            </h1>
            <p className="text-xl text-neutral-300">
              We're building the price transparency infrastructure for electrical procurement in India.
              We want people who want to solve hard, unsexy problems with real market impact.
            </p>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <section className="py-16 bg-neutral-50 border-b-2 border-neutral-200">
        <div className="container-custom">
          <h2 className="text-2xl font-black text-neutral-900 mb-8 text-center">Why Join Hub4Estate?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="bg-white border-2 border-neutral-200 p-6 text-center">
                  <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-neutral-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-neutral-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16">
        <div className="container-custom">
          <h2 className="text-2xl font-black text-neutral-900 mb-8">Open Positions</h2>
          <div className="space-y-4">
            {openPositions.map((position, index) => (
              <div key={index} className="bg-white border-2 border-neutral-200 hover:border-neutral-900 hover:shadow-brutal transition-all p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900">{position.title}</h3>
                    <div className="flex flex-wrap gap-3 mt-2">
                      <span className="inline-flex items-center text-sm text-neutral-600">
                        <Briefcase className="w-4 h-4 mr-1" />
                        {position.type}
                      </span>
                      <span className="inline-flex items-center text-sm text-neutral-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        {position.location}
                      </span>
                    </div>
                    <p className="text-accent-700 font-semibold mt-3">Problem you'll own: {position.problem}</p>
                    <p className="text-neutral-600 mt-2">{position.description}</p>
                  </div>
                  <a
                    href="#apply"
                    className="btn-urgent whitespace-nowrap"
                  >
                    Apply Now
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-neutral-50 border-2 border-neutral-200 text-center">
            <p className="text-neutral-600">
              Don't see your role? If you understand the problem we're solving and can contribute —
              <a href="#apply" className="text-neutral-900 font-bold hover:text-accent-600 ml-1">send a general application.</a>
            </p>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-16 bg-neutral-50 border-y-2 border-neutral-200">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-neutral-900 mb-4">Apply Now</h2>
              <p className="text-neutral-600">
                Tell us who you are, what you've done, and why Hub4Estate.
              </p>
            </div>

            {submitted ? (
              <div className="bg-white border-2 border-green-500 shadow-brutal p-8 text-center">
                <div className="w-16 h-16 bg-green-500 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-black text-neutral-900 mb-2">Application Sent!</h3>
                <p className="text-neutral-600 mb-6">
                  Your email client should have opened with your application.
                  If it didn't, email directly to:
                </p>
                <a
                  href="mailto:shreshth.agarwal@hub4estate.com"
                  className="text-accent-600 font-bold hover:underline"
                >
                  shreshth.agarwal@hub4estate.com
                </a>
                <button
                  onClick={() => setSubmitted(false)}
                  className="block mx-auto mt-6 text-neutral-600 hover:text-neutral-900 font-medium"
                >
                  Submit another application
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white border-2 border-neutral-200 shadow-brutal p-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-neutral-900 mb-2">
                        <User className="w-4 h-4 inline mr-1" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-neutral-200 focus:border-neutral-900 focus:outline-none transition-colors"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-neutral-900 mb-2">
                        <Mail className="w-4 h-4 inline mr-1" />
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-neutral-200 focus:border-neutral-900 focus:outline-none transition-colors"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-neutral-900 mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-neutral-200 focus:border-neutral-900 focus:outline-none transition-colors"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-neutral-900 mb-2">
                        <Linkedin className="w-4 h-4 inline mr-1" />
                        LinkedIn Profile
                      </label>
                      <input
                        type="url"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-neutral-200 focus:border-neutral-900 focus:outline-none transition-colors"
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-neutral-900 mb-2">
                        <Briefcase className="w-4 h-4 inline mr-1" />
                        Position *
                      </label>
                      <select
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-neutral-200 focus:border-neutral-900 focus:outline-none transition-colors bg-white"
                      >
                        <option value="">Select a position</option>
                        {openPositions.map((pos, i) => (
                          <option key={i} value={pos.title}>{pos.title}</option>
                        ))}
                        <option value="Other">Other / General Application</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-neutral-900 mb-2">
                        <FileText className="w-4 h-4 inline mr-1" />
                        Years of Experience *
                      </label>
                      <select
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-neutral-200 focus:border-neutral-900 focus:outline-none transition-colors bg-white"
                      >
                        <option value="">Select experience</option>
                        <option value="0-1 years">0-1 years (Fresher / Student)</option>
                        <option value="1-3 years">1-3 years</option>
                        <option value="3-5 years">3-5 years</option>
                        <option value="5-10 years">5-10 years</option>
                        <option value="10+ years">10+ years</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-neutral-900 mb-2">
                      <Zap className="w-4 h-4 inline mr-1" />
                      Why Hub4Estate? *
                    </label>
                    <p className="text-sm text-neutral-500 mb-2">
                      Tell us what you've done that's relevant, and why you want in on this specifically.
                    </p>
                    <textarea
                      name="vision"
                      value={formData.vision}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border-2 border-neutral-200 focus:border-neutral-900 focus:outline-none transition-colors resize-none"
                      placeholder="What have you built or done that's relevant? Why does this problem matter to you?"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-urgent w-full justify-center text-lg py-4"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Submit Application
                  </button>

                  <p className="text-sm text-neutral-500 text-center">
                    By submitting, you agree to our{' '}
                    <Link to="/privacy" className="text-neutral-900 font-bold hover:text-accent-600">
                      Privacy Policy
                    </Link>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-neutral-900 text-white">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-black mb-4">Questions?</h2>
            <p className="text-neutral-300 mb-8">
              Reach out directly to our founder.
            </p>
            <div className="bg-white/10 border border-white/20 p-8 text-left">
              <h3 className="font-bold text-lg mb-4">Shreshth Agarwal — Founder, Hub4Estate</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-accent-400" />
                  <a href="mailto:shreshth.agarwal@hub4estate.com" className="hover:text-accent-400">
                    shreshth.agarwal@hub4estate.com
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-accent-400" />
                  <a href="tel:+917690001999" className="hover:text-accent-400">
                    +91 76900 01999
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Linkedin className="w-5 h-5 text-accent-400" />
                  <a
                    href="https://linkedin.com/in/sa-h4e"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent-400"
                  >
                    linkedin.com/in/sa-h4e
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
