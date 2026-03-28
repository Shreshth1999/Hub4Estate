import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Clock, ArrowRight, CheckCircle, Loader2, Linkedin, Zap } from 'lucide-react';
import { contactApi } from '../lib/api';
import { ElectricWireDivider } from '../components/ElectricWireDivider';
import { useInView, revealStyle } from '../hooks/useInView';

interface FormData {
  name: string;
  email: string;
  phone: string;
  role: string;
  message: string;
}

export function ContactPage() {
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', phone: '', role: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { ref: heroRef, inView: heroIn } = useInView(0.05);
  const { ref: formRef, inView: formIn } = useInView(0.05);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.role || !formData.message) {
      setError('Please fill in all required fields.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await contactApi.submit({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        role: formData.role,
        message: formData.message,
      });
      setIsSuccess(true);
      setFormData({ name: '', email: '', phone: '', role: '', message: '' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Hero — dark */}
      <div className="bg-[#0B1628] blueprint-bg-dark relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-amber-600/8 rounded-full blur-3xl animate-glow-pulse" />
        </div>
        <div ref={heroRef as any} className="max-w-4xl mx-auto px-6 py-20 relative">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 mb-10 transition-colors" style={revealStyle(heroIn, 0)}>
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center mb-6" style={revealStyle(heroIn, 0.06)}>
            <Zap className="w-6 h-6 text-amber-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4 tracking-tight" style={revealStyle(heroIn, 0.1)}>
            Get in Touch
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed max-w-xl" style={revealStyle(heroIn, 0.14)}>
            Questions about Hub4Estate? Want to become a dealer? Just reach out — we respond within 24 hours.
          </p>
        </div>
      </div>

      <ElectricWireDivider />

      {/* Main content */}
      <div ref={formRef as any} className="px-6 py-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
          {/* Left */}
          <div style={revealStyle(formIn, 0)}>
            <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Contact info</h2>
            <div className="space-y-6">
              {[
                {
                  icon: Mail,
                  label: 'Email',
                  main: 'shreshth.agarwal@hub4estate.com',
                  href: 'mailto:shreshth.agarwal@hub4estate.com',
                  sub: 'General inquiries, partnerships, dealer registration',
                },
                {
                  icon: Phone,
                  label: 'Phone',
                  main: '+91 76900 01999',
                  href: 'tel:+917690001999',
                  sub: 'Mon–Sat, 9AM–7PM IST',
                },
                {
                  icon: Linkedin,
                  label: 'LinkedIn',
                  main: 'linkedin.com/in/sa-h4e',
                  href: 'https://linkedin.com/in/sa-h4e',
                  sub: 'Shreshth Agarwal — Founder',
                  external: true,
                },
                {
                  icon: MapPin,
                  label: 'Registered Office',
                  main: 'HUB4ESTATE LLP',
                  sub: '8-D-12, Jawahar Nagar, Sriganganagar, Rajasthan — 335001',
                },
                {
                  icon: Clock,
                  label: 'Business Hours',
                  sub: 'Monday – Saturday: 9:00 AM – 7:00 PM IST\nSunday: Closed',
                },
              ].map(({ icon: Icon, label, main, href, sub, external }, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    {href && main ? (
                      <a
                        href={href}
                        target={external ? '_blank' : undefined}
                        rel={external ? 'noopener noreferrer' : undefined}
                        className="text-sm font-semibold text-gray-900 hover:text-amber-700 transition-colors"
                      >
                        {main}
                      </a>
                    ) : main && (
                      <p className="text-sm font-semibold text-gray-900">{main}</p>
                    )}
                    {sub && <p className="text-xs text-gray-400 mt-0.5 whitespace-pre-line">{sub}</p>}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 bg-gray-50 rounded-2xl border border-gray-100 p-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Company Details</p>
              <div className="space-y-1.5 text-sm text-gray-600">
                <p><span className="font-bold text-gray-900">Legal Entity:</span> HUB4ESTATE LLP</p>
                <p><span className="font-bold text-gray-900">LLPIN:</span> ACW-4269</p>
                <p><span className="font-bold text-gray-900">PAN:</span> AATFH3466L</p>
                <p><span className="font-bold text-gray-900">Incorporated:</span> 17 March 2026</p>
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <div style={revealStyle(formIn, 0.1)}>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              {isSuccess ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Message sent!</h3>
                  <p className="text-sm text-gray-500 mb-5">We'll get back to you within 24 hours.</p>
                  <button onClick={() => setIsSuccess(false)} className="text-sm text-gray-500 hover:text-gray-900">
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-gray-900 mb-5">Send a message</h3>
                  {error && (
                    <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-3">
                      {error}
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Your name <span className="text-red-400">*</span></label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} disabled={isSubmitting}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 transition-colors"
                        placeholder="Enter your name" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email <span className="text-red-400">*</span></label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={isSubmitting}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 transition-colors"
                        placeholder="your@email.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone (optional)</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} disabled={isSubmitting}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 transition-colors"
                        placeholder="+91 98765 43210" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">I am a <span className="text-red-400">*</span></label>
                      <select name="role" value={formData.role} onChange={handleChange} disabled={isSubmitting}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 bg-white transition-colors">
                        <option value="">Select your role</option>
                        <option value="homeowner">Homeowner / Individual Buyer</option>
                        <option value="contractor">Contractor / Builder</option>
                        <option value="interior-designer">Interior Designer / Architect</option>
                        <option value="dealer">Electrical Dealer</option>
                        <option value="brand">Brand / Manufacturer</option>
                        <option value="investor">Investor</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Message <span className="text-red-400">*</span></label>
                      <textarea name="message" value={formData.message} onChange={handleChange} rows={4} disabled={isSubmitting}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none"
                        placeholder="How can we help?" />
                    </div>
                    <button type="submit" disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors">
                      {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send message'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-16">
          <h2 className="text-base font-bold text-gray-500 mb-4">Quick links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { to: '/rfq/create', title: 'Post a requirement', desc: 'Get quotes from verified dealers' },
              { to: '/dealer/onboarding', title: 'Become a dealer', desc: 'Register and start receiving inquiries' },
              { to: '/about', title: 'Our story', desc: 'Why we built Hub4Estate' },
            ].map(item => (
              <Link key={item.to} to={item.to} className="flex items-center justify-between gap-3 p-4 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-sm transition-all group">
                <div>
                  <p className="text-sm font-bold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
