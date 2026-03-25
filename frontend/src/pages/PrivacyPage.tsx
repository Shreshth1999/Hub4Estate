import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-neutral-900 text-white py-12">
        <div className="container-custom">
          <Link to="/" className="inline-flex items-center text-neutral-400 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-accent-400" />
            <h1 className="text-4xl font-black">Privacy Policy</h1>
          </div>
          <p className="text-neutral-400 mt-2">Last updated: 17 March 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-12">
        <div className="max-w-3xl mx-auto">

          <div className="bg-neutral-50 border-2 border-neutral-200 p-6 mb-10">
            <p className="text-neutral-700 font-medium">
              This Privacy Policy describes how HUB4ESTATE LLP ("Hub4Estate", "we", "our", "us"), a Limited Liability Partnership incorporated under the LLP Act, 2008 (LLPIN: ACW-4269), collects, uses, and protects information you provide when using our platform at <strong>hub4estate.com</strong>. This policy is governed by the Information Technology Act, 2000 and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.
            </p>
          </div>

          <div className="space-y-10">

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4 pb-2 border-b-2 border-neutral-200">1. Who We Are</h2>
              <div className="text-neutral-600 space-y-2">
                <p><span className="font-semibold text-neutral-800">Legal Name:</span> HUB4ESTATE LLP</p>
                <p><span className="font-semibold text-neutral-800">LLPIN:</span> ACW-4269</p>
                <p><span className="font-semibold text-neutral-800">PAN:</span> AATFH3466L</p>
                <p><span className="font-semibold text-neutral-800">Registered Address:</span> 8-D-12, Jawahar Nagar, Sriganganagar, Ganganagar — 335001, Rajasthan, India</p>
                <p><span className="font-semibold text-neutral-800">Contact:</span> shreshth.agarwal@hub4estate.com | +91 76900 01999</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4 pb-2 border-b-2 border-neutral-200">2. Information We Collect</h2>

              <h3 className="text-lg font-bold text-neutral-800 mb-3">2.1 Information You Provide</h3>
              <ul className="list-disc list-inside text-neutral-600 mb-6 space-y-2">
                <li>Name, email address, phone number when you create an account or submit an inquiry</li>
                <li>City and pincode for delivery and dealer matching purposes</li>
                <li>Business details for dealers: business name, GST number, PAN, business address</li>
                <li>Product inquiry details: what you're buying, quantity, specifications</li>
                <li>Messages sent through the platform to dealers or our team</li>
              </ul>

              <h3 className="text-lg font-bold text-neutral-800 mb-3">2.2 Information Collected Automatically</h3>
              <ul className="list-disc list-inside text-neutral-600 mb-4 space-y-2">
                <li>Pages visited, products searched, and inquiries created</li>
                <li>Device type, browser, and operating system (for technical compatibility)</li>
                <li>IP address and approximate location</li>
                <li>Session and usage data (how you interact with the platform)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4 pb-2 border-b-2 border-neutral-200">3. How We Use Your Information</h2>
              <ul className="list-disc list-inside text-neutral-600 space-y-2">
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
              <h2 className="text-2xl font-bold text-neutral-900 mb-4 pb-2 border-b-2 border-neutral-200">4. Information Sharing</h2>
              <p className="text-neutral-600 mb-4">We do not sell your personal information. We share it only in these circumstances:</p>
              <ul className="list-disc list-inside text-neutral-600 space-y-3">
                <li>
                  <strong className="text-neutral-800">With Dealers:</strong> When you submit an inquiry, your contact information and product requirements are shared with relevant matched dealers so they can send you quotes.
                </li>
                <li>
                  <strong className="text-neutral-800">With Service Providers:</strong> Third-party services that help us run the platform (hosting, email delivery, analytics). These providers process data only on our instructions.
                </li>
                <li>
                  <strong className="text-neutral-800">Legal Requirements:</strong> When required by a court order, law enforcement, or applicable Indian law.
                </li>
                <li>
                  <strong className="text-neutral-800">Business Transfer:</strong> If Hub4Estate is acquired or merged, your data may transfer to the new entity under the same privacy commitments.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4 pb-2 border-b-2 border-neutral-200">5. Quote & Pricing Confidentiality</h2>
              <p className="text-neutral-600 mb-4">
                Given the commercial sensitivity of pricing data in our marketplace:
              </p>
              <ul className="list-disc list-inside text-neutral-600 space-y-2">
                <li>Dealer quotes are never shared with competing dealers</li>
                <li>Pricing data is used only for the specific inquiry it was submitted for</li>
                <li>GST and tax information is handled in compliance with Indian law</li>
                <li>Aggregated market data may be used for internal analytics but never identifies individual dealers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4 pb-2 border-b-2 border-neutral-200">6. Data Security</h2>
              <p className="text-neutral-600 mb-4">
                We use HTTPS/TLS encryption for all data in transit. Passwords are hashed and never stored in plain text. Our servers are hosted on AWS infrastructure with access controls and regular security reviews. While we take reasonable precautions, no internet transmission is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4 pb-2 border-b-2 border-neutral-200">7. Data Retention</h2>
              <p className="text-neutral-600 mb-4">
                We retain your account data for as long as your account is active. Inquiry and quote data is retained for 3 years for dispute resolution and compliance purposes. You may request deletion of your account at any time (see Section 8).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4 pb-2 border-b-2 border-neutral-200">8. Your Rights</h2>
              <p className="text-neutral-600 mb-4">Under Indian law, you have the right to:</p>
              <ul className="list-disc list-inside text-neutral-600 space-y-2">
                <li>Access the personal data we hold about you</li>
                <li>Correct inaccurate or outdated data</li>
                <li>Request deletion of your account and associated personal data</li>
                <li>Withdraw consent for marketing communications (WhatsApp, SMS, email) at any time</li>
                <li>Lodge a complaint with our Grievance Officer (see below)</li>
              </ul>
              <p className="text-neutral-600 mt-4">
                To exercise any of these rights, email us at <a href="mailto:shreshth.agarwal@hub4estate.com" className="text-accent-600 font-semibold hover:underline">shreshth.agarwal@hub4estate.com</a> with your request. We will respond within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4 pb-2 border-b-2 border-neutral-200">9. Cookies</h2>
              <p className="text-neutral-600 mb-4">
                We use essential cookies for authentication (keeping you logged in) and session management. We may use analytics cookies to understand platform usage. We do not use advertising or tracking cookies for third-party ad targeting. You can disable cookies in your browser settings, though this may affect platform functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4 pb-2 border-b-2 border-neutral-200">10. Children's Privacy</h2>
              <p className="text-neutral-600">
                Hub4Estate is not directed at children under 18. We do not knowingly collect personal information from minors. If you believe a minor has provided us with personal data, contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4 pb-2 border-b-2 border-neutral-200">11. Grievance Officer</h2>
              <p className="text-neutral-600 mb-4">
                As required under Rule 5(9) of the SPDI Rules, 2011, we have designated a Grievance Officer for any concerns related to your personal data:
              </p>
              <div className="bg-neutral-50 border-2 border-neutral-200 p-6">
                <p className="font-bold text-neutral-900 text-lg mb-3">Shreshth Agarwal</p>
                <p className="text-neutral-600 mb-1">Grievance Officer, HUB4ESTATE LLP</p>
                <p className="text-neutral-600 mb-1">8-D-12, Jawahar Nagar, Sriganganagar, Ganganagar — 335001, Rajasthan</p>
                <p className="text-neutral-600 mb-1">
                  Email:{' '}
                  <a href="mailto:shreshth.agarwal@hub4estate.com" className="text-accent-600 hover:underline">
                    shreshth.agarwal@hub4estate.com
                  </a>
                </p>
                <p className="text-neutral-600">Phone: +91 76900 01999</p>
                <p className="text-neutral-500 text-sm mt-3">
                  Grievances will be acknowledged within 48 hours and resolved within 30 days.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4 pb-2 border-b-2 border-neutral-200">12. Changes to This Policy</h2>
              <p className="text-neutral-600">
                We may update this Privacy Policy as our platform evolves. Significant changes will be communicated via email or a prominent notice on the platform. Continued use after changes constitutes acceptance of the updated policy.
              </p>
            </section>

          </div>

          <div className="mt-12 p-6 bg-neutral-900 text-white">
            <p className="font-bold mb-2">Questions about this policy?</p>
            <p className="text-neutral-400 text-sm">
              Email <a href="mailto:shreshth.agarwal@hub4estate.com" className="text-accent-400 hover:underline">shreshth.agarwal@hub4estate.com</a> or call +91 76900 01999.
              HUB4ESTATE LLP — LLPIN: ACW-4269 — Registered in Rajasthan, India.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
