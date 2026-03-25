import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Clock, ArrowRight, Building2, CheckCircle, Loader2, Linkedin } from 'lucide-react';
import { contactApi } from '../lib/api';

interface FormData {
  name: string;
  email: string;
  phone: string;
  role: string;
  message: string;
}

export function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    role: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.role || !formData.message) {
      setError('Please fill in all required fields');
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
      setError(err.response?.data?.error || 'Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-neutral-300 leading-relaxed">
              Questions about Hub4Estate? Want to become a dealer? Just reach out.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left - Contact Details */}
            <div>
              <h2 className="text-3xl font-black text-neutral-900 mb-8">Get in Touch</h2>

              <div className="space-y-8">
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-1">Email</h3>
                    <a href="mailto:shreshth.agarwal@hub4estate.com" className="text-accent-600 hover:underline text-lg block">
                      shreshth.agarwal@hub4estate.com
                    </a>
                    <p className="text-neutral-500 text-sm mt-1">General inquiries, partnerships, dealer registration</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-1">Phone</h3>
                    <a href="tel:+917690001999" className="text-accent-600 hover:underline text-lg">
                      +91 76900 01999
                    </a>
                    <p className="text-neutral-500 text-sm mt-1">Mon–Sat, 9AM–7PM IST</p>
                  </div>
                </div>

                {/* LinkedIn */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center flex-shrink-0">
                    <Linkedin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-1">LinkedIn</h3>
                    <a
                      href="https://linkedin.com/in/sa-h4e"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-600 hover:underline text-lg"
                    >
                      linkedin.com/in/sa-h4e
                    </a>
                    <p className="text-neutral-500 text-sm mt-1">Shreshth Agarwal — Founder</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-1">Registered Office</h3>
                    <p className="text-neutral-600 leading-relaxed">
                      HUB4ESTATE LLP<br />
                      WeWork Arekere, No. 197/36, 2nd Floor<br />
                      Bannerghatta Road, Bengaluru — 560076<br />
                      Karnataka, India
                    </p>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-1">Business Hours</h3>
                    <p className="text-neutral-600">
                      Monday – Saturday: 9:00 AM – 7:00 PM IST<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>

              {/* Company Details */}
              <div className="mt-12 p-6 bg-neutral-50 border-2 border-neutral-200">
                <div className="flex items-center gap-3 mb-4">
                  <Building2 className="w-6 h-6 text-neutral-700" />
                  <h3 className="font-bold text-neutral-900">Company Details</h3>
                </div>
                <div className="space-y-2 text-neutral-600 text-sm">
                  <p><span className="font-semibold text-neutral-800">Legal Entity:</span> HUB4ESTATE LLP</p>
                  <p><span className="font-semibold text-neutral-800">LLPIN:</span> ACW-4269</p>
                  <p><span className="font-semibold text-neutral-800">PAN:</span> AATFH3466L</p>
                  <p><span className="font-semibold text-neutral-800">Incorporated:</span> 17 March 2026</p>
                  <p><span className="font-semibold text-neutral-800">Registered in:</span> Rajasthan, India</p>
                  <p><span className="font-semibold text-neutral-800">Industry:</span> B2B/B2C Marketplace — Electrical Products</p>
                </div>
              </div>
            </div>

            {/* Right - Contact Form */}
            <div>
              <div className="bg-white border-2 border-neutral-900 p-8">
                {isSuccess ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-black text-neutral-900 mb-4">Message Sent!</h3>
                    <p className="text-neutral-600 mb-6">
                      We'll get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => setIsSuccess(false)}
                      className="text-accent-600 font-semibold hover:underline"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-black text-neutral-900 mb-6">Send us a Message</h3>

                    {error && (
                      <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700">
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-neutral-900 uppercase tracking-wider mb-2">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full border-2 border-neutral-300 p-4 focus:border-neutral-900 focus:outline-none"
                          placeholder="Enter your name"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-neutral-900 uppercase tracking-wider mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full border-2 border-neutral-300 p-4 focus:border-neutral-900 focus:outline-none"
                          placeholder="Enter your email"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-neutral-900 uppercase tracking-wider mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full border-2 border-neutral-300 p-4 focus:border-neutral-900 focus:outline-none"
                          placeholder="Enter your phone number (optional)"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-neutral-900 uppercase tracking-wider mb-2">
                          I am a *
                        </label>
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          className="w-full border-2 border-neutral-300 p-4 focus:border-neutral-900 focus:outline-none bg-white"
                          disabled={isSubmitting}
                        >
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
                        <label className="block text-sm font-bold text-neutral-900 uppercase tracking-wider mb-2">
                          Message *
                        </label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows={5}
                          className="w-full border-2 border-neutral-300 p-4 focus:border-neutral-900 focus:outline-none resize-none"
                          placeholder="How can we help you?"
                          disabled={isSubmitting}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-400 text-white py-4 font-bold text-lg transition-colors flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Send Message'
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 bg-neutral-50 border-t-2 border-neutral-200">
        <div className="container-custom">
          <h2 className="text-2xl font-black text-neutral-900 mb-8 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link
              to="/rfq/create"
              className="bg-white border-2 border-neutral-200 hover:border-neutral-900 p-6 text-center transition-all"
            >
              <h3 className="font-bold text-neutral-900 mb-2">Submit an Inquiry</h3>
              <p className="text-sm text-neutral-500 mb-4">Get quotes from verified dealers</p>
              <span className="text-accent-600 font-semibold inline-flex items-center">
                Start Now <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            </Link>
            <Link
              to="/dealer/onboarding"
              className="bg-white border-2 border-neutral-200 hover:border-neutral-900 p-6 text-center transition-all"
            >
              <h3 className="font-bold text-neutral-900 mb-2">Become a Dealer</h3>
              <p className="text-sm text-neutral-500 mb-4">Register and start receiving buyer inquiries</p>
              <span className="text-accent-600 font-semibold inline-flex items-center">
                Register Free <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            </Link>
            <Link
              to="/about"
              className="bg-white border-2 border-neutral-200 hover:border-neutral-900 p-6 text-center transition-all"
            >
              <h3 className="font-bold text-neutral-900 mb-2">Our Story</h3>
              <p className="text-sm text-neutral-500 mb-4">Why we built Hub4Estate</p>
              <span className="text-accent-600 font-semibold inline-flex items-center">
                Read More <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
