import { Link } from 'react-router-dom';
import { Zap, ArrowRight, ShoppingBag, Store, Briefcase } from 'lucide-react';

const ROLES = [
  {
    key: 'buyer',
    icon: ShoppingBag,
    label: 'I want to buy',
    sublabel: 'Homeowner, anyone who needs electrical products',
    desc: 'Post your requirements, get quotes from verified dealers, compare and order. Free forever.',
    href: '/login?mode=signup',
    cta: 'Sign up as buyer',
    accent: 'bg-blue-50 text-blue-600',
    border: 'hover:border-blue-200',
  },
  {
    key: 'professional',
    icon: Briefcase,
    label: 'I\'m a professional',
    sublabel: 'Architect, Interior Designer, Contractor, Electrician',
    desc: 'Same buying experience, plus a verified professional badge visible to all dealers. Get better quotes, build long-term relationships.',
    href: '/login?mode=signup&type=professional',
    cta: 'Sign up as professional',
    accent: 'bg-violet-50 text-violet-600',
    border: 'hover:border-violet-200',
    badge: 'Verified badge',
  },
  {
    key: 'dealer',
    icon: Store,
    label: 'I\'m a dealer',
    sublabel: 'Electrical supplier, distributor, or stockist',
    desc: 'Receive RFQs from verified buyers in your city. Submit quotes, win orders, grow your business.',
    href: '/dealer/onboarding',
    cta: 'Register as dealer',
    accent: 'bg-orange-50 text-orange-600',
    border: 'hover:border-orange-200',
  },
];

export function RoleSelectionPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="w-7 h-7 bg-gray-900 flex items-center justify-center rounded-lg">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-900">Hub4Estate</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl">

          <div className="text-center mb-10">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              How are you using Hub4Estate?
            </h1>
            <p className="text-sm text-gray-500">
              Pick the option that fits you best. You can always change this later.
            </p>
          </div>

          <div className="space-y-3">
            {ROLES.map(role => {
              const Icon = role.icon;
              return (
                <Link
                  key={role.key}
                  to={role.href}
                  className={`group flex items-center gap-5 p-5 bg-white rounded-2xl border border-gray-200 ${role.border} hover:shadow-sm transition-all`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${role.accent}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-gray-900">{role.label}</p>
                      {role.badge && (
                        <span className="text-[10px] font-medium bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full">
                          {role.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mb-1">{role.sublabel}</p>
                    <p className="text-xs text-gray-500 leading-relaxed hidden sm:block">{role.desc}</p>
                  </div>

                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 group-hover:bg-gray-900 transition-colors">
                      <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-gray-700 font-medium hover:text-orange-600 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
