import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { SEO } from '@/components/SEO';

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Privacy Policy"
        description="Hub4Estate Privacy Policy. Learn how we protect your data and handle personal information on India's leading electrical products procurement platform."
        keywords="Hub4Estate privacy policy, data protection, electrical products platform privacy"
        canonicalUrl="/privacy"
      />
      {/* Header — dark */}
      <div className="bg-gray-900 px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-500" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Privacy Policy</h1>
          </div>
          <p className="text-sm text-gray-500 mt-3">Last updated: 17 March 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-12">
        <div className="max-w-3xl mx-auto">

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-10">
            <p className="text-sm text-gray-700 leading-relaxed">
              This Privacy Policy describes how HUB4ESTATE LLP ("Hub4Estate", "we", "our", "us"), a Limited Liability Partnership incorporated under the LLP Act, 2008 (LLPIN: ACW-4269), collects, uses, and protects information you provide when using our platform at <strong>hub4estate.com</strong>. This policy is governed by the Information Technology Act, 2000 and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.
            </p>
          </div>

          <div className="space-y-10">

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">1. Who We Are</h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p><span className="font-medium text-gray-800">Legal Name:</span> HUB4ESTATE LLP</p>
                <p><span className="font-medium text-gray-800">LLPIN:</span> ACW-4269</p>
                <p><span className="font-medium text-gray-800">PAN:</span> AATFH3466L</p>
                <p><span className="font-medium text-gray-800">Registered Address:</span> 8-D-12, Jawahar Nagar, Sriganganagar, Rajasthan — 335001, India</p>
                <p><span className="font-medium text-gray-800">Contact:</span> shreshth.agarwal@hub4estate.com | +91 76900 01999</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">2. Information We Collect</h2>

              <h3 className="text-sm font-semibold text-gray-800 mb-3">2.1 Information You Provide</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 mb-6 space-y-2">
                <li>Name, email address, phone number when you create an account or submit an inquiry</li>
                <li>City and pincode for delivery and dealer matching purposes</li>
                <li>Business details for dealers: business name, GST number, PAN, business address</li>
                <li>Product inquiry details: what you're buying, quantity, specifications</li>
                <li>Messages sent through the platform to dealers or our team</li>
              </ul>

              <h3 className="text-sm font-semibold text-gray-800 mb-3">2.2 Information Collected Automatically</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                <li>Pages visited, products searched, and inquiries created</li>
                <li>Device type, browser, and operating system (for technical compatibility)</li>
                <li>IP address and approximate location</li>
                <li>Session and usage data (how you interact with the platform)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">3. How We Use Your Information</h2>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                <li>To match your inquiry with relevant verified dealers</li>
                <li>To facilitate price quotes between buyers and dealers</li>
                <li>To verify dealer credentials and maintain platform integrity</li>
                <li>To send you updates about your inquiry status via email, WhatsApp, or SMS (with your consent)</li>
                <li>To improve platform features and resolve technical issues</li>
                <li>To prevent fraud and ensure platform security</li>
                <li>To comply with legal obligations under Indian law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">4. Information Sharing</h2>
              <p className="text-sm text-gray-600 mb-4">We do not sell your personal information. We share it only in these circumstances:</p>
              <ul className="text-sm text-gray-600 space-y-3">
                <li><strong className="text-gray-800">With Dealers:</strong> When you submit an inquiry, your contact information and product requirements are shared with relevant matched dealers so they can send you quotes.</li>
                <li><strong className="text-gray-800">With Service Providers:</strong> Third-party services that help us run the platform (hosting, email delivery, analytics). These providers process data only on our instructions.</li>
                <li><strong className="text-gray-800">Legal Requirements:</strong> When required by a court order, law enforcement, or applicable Indian law.</li>
                <li><strong className="text-gray-800">Business Transfer:</strong> If Hub4Estate is acquired or merged, your data may transfer to the new entity under the same privacy commitments.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">5. Quote & Pricing Confidentiality</h2>
              <p className="text-sm text-gray-600 mb-4">Given the commercial sensitivity of pricing data in our marketplace:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                <li>Dealer quotes are never shared with competing dealers</li>
                <li>Pricing data is used only for the specific inquiry it was submitted for</li>
                <li>GST and tax information is handled in compliance with Indian law</li>
                <li>Aggregated market data may be used for internal analytics but never identifies individual dealers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">6. Data Security</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                We use HTTPS/TLS encryption for all data in transit. Passwords are hashed and never stored in plain text. Our servers are hosted on AWS infrastructure with access controls and regular security reviews. While we take reasonable precautions, no internet transmission is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">7. Data Retention</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                We retain your account data for as long as your account is active. Inquiry and quote data is retained for 3 years for dispute resolution and compliance purposes. You may request deletion of your account at any time (see Section 8).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">8. Your Rights</h2>
              <p className="text-sm text-gray-600 mb-4">Under Indian law, you have the right to:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                <li>Access the personal data we hold about you</li>
                <li>Correct inaccurate or outdated data</li>
                <li>Request deletion of your account and associated personal data</li>
                <li>Withdraw consent for marketing communications (WhatsApp, SMS, email) at any time</li>
                <li>Lodge a complaint with our Grievance Officer (see below)</li>
              </ul>
              <p className="text-sm text-gray-600 mt-4">
                To exercise any of these rights, email us at{' '}
                <a href="mailto:shreshth.agarwal@hub4estate.com" className="font-medium text-gray-900 hover:underline">
                  shreshth.agarwal@hub4estate.com
                </a>{' '}
                with your request. We will respond within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">9. Cookies</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                We use essential cookies for authentication (keeping you logged in) and session management. We may use analytics cookies to understand platform usage. We do not use advertising or tracking cookies for third-party ad targeting. You can disable cookies in your browser settings, though this may affect platform functionality.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">10. Children's Privacy</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Hub4Estate is not directed at children under 18. We do not knowingly collect personal information from minors. If you believe a minor has provided us with personal data, contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">11. Grievance Officer</h2>
              <p className="text-sm text-gray-600 mb-4">
                As required under Rule 5(9) of the SPDI Rules, 2011, we have designated a Grievance Officer for any concerns related to your personal data:
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <p className="font-semibold text-gray-900 mb-3">Shreshth Agarwal</p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Grievance Officer, HUB4ESTATE LLP</p>
                  <p>8-D-12, Jawahar Nagar, Sriganganagar, Rajasthan — 335001</p>
                  <p>
                    Email:{' '}
                    <a href="mailto:shreshth.agarwal@hub4estate.com" className="text-gray-900 font-medium hover:underline">
                      shreshth.agarwal@hub4estate.com
                    </a>
                  </p>
                  <p>Phone: +91 76900 01999</p>
                  <p className="text-gray-400 text-xs mt-3">Grievances will be acknowledged within 48 hours and resolved within 30 days.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">12. Changes to This Policy</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                We may update this Privacy Policy as our platform evolves. Significant changes will be communicated via email or a prominent notice on the platform. Continued use after changes constitutes acceptance of the updated policy.
              </p>
            </section>

          </div>

          <div className="mt-12 p-5 bg-gray-900 rounded-xl">
            <p className="font-medium text-white mb-1">Questions about this policy?</p>
            <p className="text-gray-400 text-sm">
              Email{' '}
              <a href="mailto:shreshth.agarwal@hub4estate.com" className="text-gray-200 hover:text-white underline">
                shreshth.agarwal@hub4estate.com
              </a>{' '}
              or call +91 76900 01999. HUB4ESTATE LLP — LLPIN: ACW-4269 — Registered in Rajasthan, India.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
