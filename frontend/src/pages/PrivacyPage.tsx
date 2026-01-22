import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

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
          <h1 className="text-4xl font-black">Privacy Policy</h1>
          <p className="text-neutral-400 mt-2">Last updated: January 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-12">
        <div className="max-w-3xl mx-auto prose prose-lg">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">1. Introduction</h2>
            <p className="text-neutral-600 mb-4">
              Hub4Estate ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-bold text-neutral-800 mb-2">Personal Information</h3>
            <ul className="list-disc list-inside text-neutral-600 mb-4 space-y-2">
              <li>Name and contact information (email, phone number)</li>
              <li>Business details for dealers (GST number, PAN, business address)</li>
              <li>Location information (city, pincode) for delivery purposes</li>
              <li>Payment information when making transactions</li>
            </ul>

            <h3 className="text-xl font-bold text-neutral-800 mb-2">Usage Information</h3>
            <ul className="list-disc list-inside text-neutral-600 mb-4 space-y-2">
              <li>Products viewed and searched</li>
              <li>RFQs created and quotes received</li>
              <li>Communication with dealers</li>
              <li>Device and browser information</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-neutral-600 mb-4 space-y-2">
              <li>To facilitate quotes and transactions between buyers and dealers</li>
              <li>To verify dealer credentials and maintain platform quality</li>
              <li>To improve our services and user experience</li>
              <li>To send important updates about your orders and account</li>
              <li>To prevent fraud and ensure platform security</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">4. Information Sharing</h2>
            <p className="text-neutral-600 mb-4">
              We share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-neutral-600 mb-4 space-y-2">
              <li><strong>With Dealers:</strong> When you request quotes, your contact and delivery information is shared with relevant dealers</li>
              <li><strong>Service Providers:</strong> Third-party services that help us operate our platform</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">5. Data Security</h2>
            <p className="text-neutral-600 mb-4">
              We implement industry-standard security measures to protect your data, including encryption, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">6. Pricing & Quote Confidentiality</h2>
            <p className="text-neutral-600 mb-4">
              Given the sensitivity of pricing and GST information in our RFQ-based marketplace, we maintain strict confidentiality:
            </p>
            <ul className="list-disc list-inside text-neutral-600 mb-4 space-y-2">
              <li><strong>Dealer quotes are never shared with competing dealers</strong></li>
              <li>Pricing data is used only for the specific RFQ it was submitted for</li>
              <li>GST and tax information is handled in compliance with Indian IT laws</li>
              <li>Aggregated market data may be used for analytics but never identifies individual dealers</li>
              <li>Loss analysis feedback provided to dealers is anonymized and aggregated</li>
            </ul>
            <p className="text-neutral-600 mb-4">
              This confidentiality is critical for maintaining dealer trust and ensuring fair competition on our platform.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">7. Your Rights</h2>
            <p className="text-neutral-600 mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-neutral-600 mb-4 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your account</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">8. Contact Us</h2>
            <p className="text-neutral-600 mb-4">
              If you have questions about this Privacy Policy, please contact us:
            </p>
            <div className="bg-neutral-50 border-2 border-neutral-200 p-6">
              <p className="font-bold text-neutral-900">Hub4Estate LLP</p>
              <p className="text-neutral-600">Email: privacy@hub4estate.com</p>
              <p className="text-neutral-600">Phone: +91 76900 01999</p>
              <p className="text-neutral-500 text-sm mt-2">Registered in India</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
