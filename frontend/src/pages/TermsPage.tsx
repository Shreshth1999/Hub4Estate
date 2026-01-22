import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-neutral-900 text-white py-12">
        <div className="container-custom">
          <Link to="/" className="inline-flex items-center text-neutral-400 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-black">Terms of Service</h1>
          <p className="text-neutral-400 mt-2">Last updated: January 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-12">
        <div className="max-w-3xl mx-auto prose prose-lg">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-neutral-600 mb-4">
              By accessing or using Hub4Estate, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">2. Platform Description</h2>
            <p className="text-neutral-600 mb-4">
              Hub4Estate is an online marketplace that connects buyers of electrical products with verified dealers. We facilitate quote requests and comparisons but are not directly involved in transactions between buyers and dealers.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">3. User Accounts</h2>
            <ul className="list-disc list-inside text-neutral-600 mb-4 space-y-2">
              <li>You must provide accurate and complete information when creating an account</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must notify us immediately of any unauthorized access</li>
              <li>One account per person or business entity</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">4. Dealer Requirements</h2>
            <p className="text-neutral-600 mb-4">Dealers on our platform must:</p>
            <ul className="list-disc list-inside text-neutral-600 mb-4 space-y-2">
              <li>Provide valid GST and PAN documentation</li>
              <li>Maintain accurate pricing and inventory information</li>
              <li>Respond to quote requests in a timely manner</li>
              <li>Honor quoted prices and delivery commitments</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">5. Buyer Responsibilities</h2>
            <ul className="list-disc list-inside text-neutral-600 mb-4 space-y-2">
              <li>Provide accurate delivery and contact information</li>
              <li>Make genuine quote requests (no spam or fake requests)</li>
              <li>Complete transactions as agreed with dealers</li>
              <li>Report any issues with dealers through our platform</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">6. Prohibited Activities</h2>
            <ul className="list-disc list-inside text-neutral-600 mb-4 space-y-2">
              <li>Providing false or misleading information</li>
              <li>Attempting to manipulate pricing or reviews</li>
              <li>Harassing other users or dealers</li>
              <li>Using the platform for illegal purposes</li>
              <li>Circumventing platform fees or policies</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-neutral-600 mb-4">
              Hub4Estate acts as a marketplace facilitator. We are not responsible for:
            </p>
            <ul className="list-disc list-inside text-neutral-600 mb-4 space-y-2">
              <li>Product quality or defects</li>
              <li>Delivery delays or failures by dealers</li>
              <li>Disputes between buyers and dealers</li>
              <li>Financial losses from transactions</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">8. Contact Information</h2>
            <p className="text-neutral-600 mb-4">
              For questions about these terms, please contact us:
            </p>
            <div className="bg-neutral-50 border-2 border-neutral-200 p-6">
              <p className="font-bold text-neutral-900">Hub4Estate</p>
              <p className="text-neutral-600">Email: shresth.agarwal@hub4estate.com</p>
              <p className="text-neutral-600">Phone: +91 76900 01999</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
