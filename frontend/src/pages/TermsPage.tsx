import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header — dark */}
      <div className="bg-[#0B1628] px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-500" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Terms of Service</h1>
          </div>
          <p className="text-sm text-gray-500 mt-3">Last updated: 17 March 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-12">
        <div className="max-w-3xl mx-auto">

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-10">
            <p className="text-sm text-gray-700 leading-relaxed">
              These Terms of Service govern your use of Hub4Estate (hub4estate.com), operated by HUB4ESTATE LLP (LLPIN: ACW-4269), a Limited Liability Partnership registered under the Limited Liability Partnership Act, 2008, with its registered office at 8-D-12, Jawahar Nagar, Sriganganagar, Rajasthan — 335001, India. By accessing or using our platform, you agree to these terms. If you do not agree, do not use Hub4Estate.
            </p>
          </div>

          <div className="space-y-10">

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">1. Platform Description</h2>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Hub4Estate is an online marketplace that connects buyers of electrical products with verified dealers across India. We facilitate inquiry submission, quote requests, and price comparisons. We are an intermediary platform — we are not a party to transactions between buyers and dealers, and we do not manufacture, stock, or ship products.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Hub4Estate operates as an intermediary under Section 2(1)(w) of the Information Technology Act, 2000.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">2. Eligibility</h2>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                <li>You must be at least 18 years of age to create an account</li>
                <li>You must be competent to enter into contracts under the Indian Contract Act, 1872</li>
                <li>Businesses must be legally registered entities operating in India</li>
                <li>By using the platform, you represent that you meet these eligibility requirements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">3. User Accounts</h2>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                <li>You must provide accurate and complete information when registering</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You must notify us immediately at{' '}
                  <a href="mailto:shreshth.agarwal@hub4estate.com" className="text-gray-900 font-medium hover:underline">
                    shreshth.agarwal@hub4estate.com
                  </a>{' '}
                  of any unauthorized access
                </li>
                <li>One account per person or business entity — creating duplicate accounts is prohibited</li>
                <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">4. Buyer Responsibilities</h2>
              <p className="text-sm text-gray-600 mb-4">As a buyer on Hub4Estate, you agree to:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                <li>Submit accurate product inquiries with genuine intent to purchase</li>
                <li>Provide correct delivery address, contact details, and specifications</li>
                <li>Not submit fake, test, or spam inquiries that waste dealer resources</li>
                <li>Honor commitments made to dealers when confirming an order</li>
                <li>Report any dealer misconduct, fake products, or pricing irregularities to us promptly</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">5. Dealer Requirements</h2>
              <p className="text-sm text-gray-600 mb-4">Dealers registering on Hub4Estate must:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                <li>Be a legitimately registered business with valid GST and PAN documentation</li>
                <li>Provide accurate information about products, pricing, and availability</li>
                <li>Respond to inquiries in a timely manner</li>
                <li>Honor the quoted prices at the time of confirmed order</li>
                <li>Not quote products they cannot supply or at prices they do not intend to honor</li>
                <li>Comply with all applicable Indian laws and regulations including the Consumer Protection Act, 2019</li>
                <li>Not contact buyers outside the Hub4Estate platform to circumvent our process</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">6. Prohibited Activities</h2>
              <p className="text-sm text-gray-600 mb-4">The following are strictly prohibited on Hub4Estate:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                <li>Providing false, misleading, or incomplete information</li>
                <li>Attempting to manipulate pricing, reviews, or rankings</li>
                <li>Submitting fake inquiries, fake quotes, or impersonating others</li>
                <li>Using the platform for any illegal purpose</li>
                <li>Scraping, copying, or reproducing platform content without permission</li>
                <li>Attempting to reverse-engineer, disrupt, or compromise platform security</li>
                <li>Harassing, threatening, or abusing other users, dealers, or Hub4Estate team</li>
                <li>Circumventing dealer subscription fees or platform policies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">7. Pricing & Quotes</h2>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Hub4Estate displays prices and quotes submitted by third-party dealers. We do not guarantee the accuracy, completeness, or availability of any quoted price. Quoted prices may be subject to GST, delivery charges, and other terms specified by the dealer. A quote is not a binding offer until confirmed in writing by the dealer.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Hub4Estate does not mark up dealer prices. Our revenue model is based on dealer subscription and lead access fees, not buyer charges.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">8. Intellectual Property</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                All content on Hub4Estate — including the platform design, logo, text, code, and product catalog — is the property of HUB4ESTATE LLP or its licensors. You may not use, copy, reproduce, or distribute any platform content without prior written permission. Brand names and trademarks of electrical manufacturers (Havells, Polycab, Philips, etc.) belong to their respective owners.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">9. Limitation of Liability</h2>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Hub4Estate acts as an intermediary marketplace. To the maximum extent permitted by Indian law, we are not liable for:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                <li>Product quality, defects, or non-compliance with BIS/ISI standards</li>
                <li>Delivery delays, failures, or damage caused by dealers</li>
                <li>Disputes between buyers and dealers regarding price, quality, or delivery</li>
                <li>Financial losses arising from transactions between buyers and dealers</li>
                <li>Inaccurate product specifications or pricing submitted by dealers</li>
                <li>Platform downtime or technical failures beyond our reasonable control</li>
              </ul>
              <p className="text-sm text-gray-600 mt-4 leading-relaxed">
                Our total liability in any circumstance shall not exceed the amount paid by you to Hub4Estate in the preceding 3 months.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">10. Dispute Resolution</h2>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                For disputes between buyers and dealers, Hub4Estate will provide a reasonable mediation effort upon request. However, we are not obligated to resolve third-party disputes.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                For disputes involving Hub4Estate directly, the parties agree to first attempt resolution through written notice and good-faith negotiation. If unresolved within 30 days, disputes shall be subject to arbitration under the Arbitration and Conciliation Act, 1996, with proceedings conducted in Sriganganagar, Rajasthan.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">11. Governing Law & Jurisdiction</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                These Terms are governed by the laws of India. Subject to the arbitration clause above, the courts of Rajasthan shall have exclusive jurisdiction over any disputes arising from these Terms or your use of Hub4Estate.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">12. Termination</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                We may suspend or terminate your access to Hub4Estate at any time, without notice, if you violate these Terms. You may also close your account at any time by emailing us. Upon termination, provisions relating to intellectual property, limitation of liability, and governing law continue to apply.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">13. Modifications to Terms</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                We reserve the right to update these Terms as our platform evolves. We will notify registered users of material changes by email. Continued use of Hub4Estate after changes constitutes acceptance of the revised Terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">14. Contact</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <p className="font-semibold text-gray-900 mb-3">HUB4ESTATE LLP</p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>8-D-12, Jawahar Nagar, Sriganganagar, Rajasthan — 335001, India</p>
                  <p>LLPIN: ACW-4269 | PAN: AATFH3466L</p>
                  <p>
                    Email:{' '}
                    <a href="mailto:shreshth.agarwal@hub4estate.com" className="text-gray-900 font-medium hover:underline">
                      shreshth.agarwal@hub4estate.com
                    </a>
                  </p>
                  <p>Phone: +91 76900 01999</p>
                </div>
              </div>
            </section>

          </div>

          <div className="mt-12 flex flex-wrap gap-4">
            <Link to="/privacy" className="text-sm font-medium text-gray-700 hover:text-gray-900 hover:underline">
              Privacy Policy →
            </Link>
            <Link to="/contact" className="text-sm font-medium text-gray-700 hover:text-gray-900 hover:underline">
              Contact Us →
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
