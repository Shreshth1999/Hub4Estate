import { Link } from 'react-router-dom';
import { Zap, User, Store, ArrowRight, CheckCircle, Shield, Phone, Mail } from 'lucide-react';

/**
 * RoleSelectionPage - The FIRST screen before any registration.
 *
 * This is critical for proper platform separation:
 * - Users (Buyers) go to OTP-based auth flow (Phone/Email/Google)
 * - Dealers go to multi-step dealer registration
 *
 * This ensures the platform knows user intent from the start.
 */
export function RoleSelectionPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b-2 border-neutral-200">
        <div className="container-custom py-4">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-neutral-900 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-neutral-900 tracking-tight">
              Hub4Estate
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-3xl">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4">
              How do you want to use Hub4Estate?
            </h1>
            <p className="text-lg text-neutral-600">
              Choose your role to get started with the right experience
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Buyer / User Card */}
            <Link
              to="/login?mode=signup"
              className="group bg-white border-2 border-neutral-200 hover:border-neutral-900 hover:shadow-brutal transition-all p-8"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-neutral-900 mb-2">
                    I'm a Buyer
                  </h2>
                  <p className="text-neutral-600">
                    Homeowner, builder, architect, contractor, or electrician looking for electrical products
                  </p>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3 text-sm text-neutral-600">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  Browse 10,000+ electrical products
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-600">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  Get quotes from verified dealers
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-600">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  Compare prices and save money
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-600">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  Free to use, no commitments
                </li>
              </ul>

              <div className="flex items-center justify-between pt-4 border-t-2 border-neutral-100">
                <div className="flex items-center gap-2 text-sm font-bold text-neutral-500">
                  <Phone className="w-4 h-4" />
                  <Mail className="w-4 h-4" />
                  <span>Sign up with OTP</span>
                </div>
                <div className="w-10 h-10 bg-neutral-100 group-hover:bg-neutral-900 group-hover:text-white flex items-center justify-center transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>

            {/* Dealer Card */}
            <Link
              to="/dealer/onboarding"
              className="group bg-white border-2 border-neutral-200 hover:border-neutral-900 hover:shadow-brutal transition-all p-8"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-accent-500 flex items-center justify-center flex-shrink-0">
                  <Store className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-neutral-900 mb-2">
                    I'm a Dealer
                  </h2>
                  <p className="text-neutral-600">
                    Electrical dealer or distributor looking to grow your business
                  </p>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3 text-sm text-neutral-600">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  Receive RFQs from verified buyers
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-600">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  Submit quotes and win orders
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-600">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  Grow your customer base
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-600">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  Track performance analytics
                </li>
              </ul>

              <div className="flex items-center justify-between pt-4 border-t-2 border-neutral-100">
                <span className="text-sm font-bold text-neutral-500">
                  Register your business
                </span>
                <div className="w-10 h-10 bg-neutral-100 group-hover:bg-neutral-900 group-hover:text-white flex items-center justify-center transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-neutral-500">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span>Verified Dealers</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Secure Platform</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent-500" />
              <span>5000+ Products</span>
            </div>
          </div>

          {/* Already have account */}
          <div className="mt-8 text-center">
            <p className="text-neutral-600">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-neutral-900 hover:text-accent-600">
                Sign in as Buyer
              </Link>
              {' '} or {' '}
              <Link to="/dealer/login" className="font-bold text-neutral-900 hover:text-accent-600">
                Sign in as Dealer
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
