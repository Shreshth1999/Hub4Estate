import { Link } from 'react-router-dom';
import {
  ArrowRight, ChevronRight, Sun, Home, Zap, Briefcase,
  GraduationCap, Shield, ExternalLink, IndianRupee
} from 'lucide-react';
import { SEO } from '../../components/SEO';
import {
  SEO_GOVERNMENT_SCHEMES,
  SCHEME_CATEGORY_LABELS,
  SCHEME_CATEGORY_COLORS,
  type SEOGovernmentScheme,
} from '../../data/seo-data';

// ─── Category Icons ──────────────────────────────────────────────────────────
const CATEGORY_ICONS: Record<SEOGovernmentScheme['category'], typeof Sun> = {
  'solar-renewable': Sun,
  'housing-electrification': Home,
  'energy-efficiency': Zap,
  'business-msme': Briefcase,
  'skill-development': GraduationCap,
};

// ─── Category order ──────────────────────────────────────────────────────────
const CATEGORY_ORDER: SEOGovernmentScheme['category'][] = [
  'solar-renewable',
  'housing-electrification',
  'energy-efficiency',
  'business-msme',
  'skill-development',
];

// ─── Main Component ──────────────────────────────────────────────────────────
export function GovtSchemesPage() {
  const pageTitle = 'Government Schemes for Electrical Products & Solar Energy in India';
  const pageDescription = 'Complete guide to government schemes and subsidies for electrical products, solar energy, housing electrification, energy efficiency, and MSME support in India. Learn eligibility, benefits, and how to apply.';
  const pageKeywords = 'government schemes electrical products, solar subsidy India, PM Surya Ghar, UJALA scheme, PMAY electrical, KUSUM scheme, MSME electrical, Saubhagya scheme, energy efficiency India, Skill India electrician, government subsidy LED, solar panel subsidy, electrical products government schemes, Hub4Estate';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: pageTitle,
    description: pageDescription,
    url: 'https://hub4estate.com/government-schemes',
    publisher: {
      '@type': 'Organization',
      name: 'Hub4Estate',
      url: 'https://hub4estate.com',
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: SEO_GOVERNMENT_SCHEMES.map((scheme, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: scheme.name,
        url: `https://hub4estate.com/government-schemes/${scheme.slug}`,
      })),
    },
  };

  // Group schemes by category
  const schemesByCategory = CATEGORY_ORDER.map(cat => ({
    category: cat,
    label: SCHEME_CATEGORY_LABELS[cat],
    colors: SCHEME_CATEGORY_COLORS[cat],
    Icon: CATEGORY_ICONS[cat],
    schemes: SEO_GOVERNMENT_SCHEMES.filter(s => s.category === cat),
  })).filter(group => group.schemes.length > 0);

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={pageTitle}
        description={pageDescription}
        keywords={pageKeywords}
        canonicalUrl="/government-schemes"
        jsonLd={jsonLd}
      />

      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-amber-50 via-white to-blue-50/30 border-b border-gray-100 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 65%)' }} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 md:py-24 relative">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-amber-600 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900 font-medium">Government Schemes</span>
          </div>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 border border-blue-200 rounded-full text-xs font-bold text-blue-700 mb-6">
              <Shield className="w-3 h-3" />
              Official Government Programmes
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-[0.95]">
              Government Schemes & Subsidies for{' '}
              <span className="text-amber-600">Electrical Products</span>
            </h1>

            <p className="text-lg text-gray-500 max-w-2xl mb-8 leading-relaxed">
              Comprehensive guide to central and state government schemes related to electrical products, solar energy,
              housing electrification, energy efficiency, and MSME support. Learn about eligibility, benefits, and how
              Hub4Estate can help you procure materials at the best price for government scheme projects.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/rfq/create"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors"
              >
                Get Material Quotes <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-gray-200 text-gray-700 font-medium rounded-xl hover:border-gray-300 transition-colors"
              >
                Talk to Our Team
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Quick Stats ───────────────────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            {[
              { stat: `${SEO_GOVERNMENT_SCHEMES.length}`, label: 'Schemes Covered' },
              { stat: '5', label: 'Categories' },
              { stat: '₹78K+', label: 'Max Subsidy (Solar)' },
              { stat: 'All India', label: 'Coverage' },
            ].map((item, i) => (
              <div key={i} className="px-6 py-6 text-center">
                <p className="text-2xl font-black text-gray-900 mb-1">{item.stat}</p>
                <p className="text-xs text-gray-400">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Category Navigation ───────────────────────────────────────────── */}
      <section className="py-12 bg-stone-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Browse by Category</h2>
          <div className="flex flex-wrap gap-3">
            {schemesByCategory.map(({ category, label, colors, Icon }) => (
              <a
                key={category}
                href={`#${category}`}
                className={`inline-flex items-center gap-2 px-4 py-2.5 ${colors.bg} ${colors.text} ${colors.border} border rounded-xl text-sm font-bold hover:opacity-80 transition-opacity`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Scheme Sections by Category ───────────────────────────────────── */}
      {schemesByCategory.map(({ category, label, colors, Icon, schemes }) => (
        <section key={category} id={category} className="py-16 md:py-20 bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            {/* Category header */}
            <div className="flex items-center gap-3 mb-8">
              <div className={`w-10 h-10 ${colors.bg} ${colors.border} border rounded-xl flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${colors.text}`} />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">{label}</h2>
                <p className="text-sm text-gray-500">{schemes.length} scheme{schemes.length > 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Scheme cards */}
            <div className="grid md:grid-cols-2 gap-5">
              {schemes.map((scheme) => (
                <Link
                  key={scheme.slug}
                  to={`/government-schemes/${scheme.slug}`}
                  className="group bg-white border border-gray-100 rounded-2xl p-6 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-100/40 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${colors.bg} ${colors.text} ${colors.border} border text-xs font-bold rounded-full mb-3`}>
                        <Icon className="w-3 h-3" />
                        {label}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-700 transition-colors leading-snug">
                        {scheme.name}
                      </h3>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-amber-500 transition-colors flex-shrink-0 mt-1" />
                  </div>

                  <p className="text-sm text-gray-500 mb-4 leading-relaxed">{scheme.shortDescription}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      {scheme.ministry}
                    </span>
                  </div>

                  {/* Bottom accent line */}
                  <div className="mt-4 h-[2px] bg-amber-500 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* ─── How Hub4Estate Helps ──────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-[#09090B]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-[0.2em] mb-3">Hub4Estate Advantage</p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
              Need Electrical Products for a Government Scheme Project?
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              Whether you are installing rooftop solar under PM Surya Ghar, wiring a PMAY house, or upgrading to LED under UJALA, Hub4Estate gets you the best price on all electrical materials from verified dealers.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: IndianRupee,
                title: 'Best Material Prices',
                desc: 'Multiple dealers compete to offer you the lowest price on electrical materials needed for your government scheme project. Save 20-40% compared to retail.',
              },
              {
                icon: Shield,
                title: 'ISI-Certified Products',
                desc: 'Government schemes require BIS/ISI-certified products. All dealers on Hub4Estate supply genuine, certified electrical products with proper documentation.',
              },
              {
                icon: ExternalLink,
                title: 'Complete Product Range',
                desc: 'From solar cables to MCBs, LED lights to distribution boards — every electrical product required for government scheme projects is available through Hub4Estate.',
              },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-colors">
                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── All Schemes Quick Reference ───────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-stone-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Government Schemes — Quick Reference</h2>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-200 px-6 py-3 hidden md:grid">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Scheme</span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ministry</span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Details</span>
            </div>
            {SEO_GOVERNMENT_SCHEMES.map((scheme, i) => {
              const colors = SCHEME_CATEGORY_COLORS[scheme.category];
              return (
                <Link
                  key={scheme.slug}
                  to={`/government-schemes/${scheme.slug}`}
                  className={`grid grid-cols-1 md:grid-cols-4 items-center px-6 py-4 ${i % 2 === 0 ? '' : 'bg-gray-50/50'} border-b border-gray-100 last:border-0 hover:bg-amber-50/50 transition-colors`}
                >
                  <span className="text-sm font-bold text-gray-900">{scheme.name}</span>
                  <span className="text-sm text-gray-500 hidden md:block">{scheme.ministry}</span>
                  <span className={`inline-flex items-center gap-1 w-fit px-2 py-0.5 ${colors.bg} ${colors.text} text-xs font-bold rounded-full mt-1 md:mt-0`}>
                    {SCHEME_CATEGORY_LABELS[scheme.category]}
                  </span>
                  <span className="text-xs font-bold text-amber-600 text-right hidden md:block">Learn More</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-[#09090B]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs font-semibold text-amber-500 uppercase tracking-[0.2em] mb-6">Hub4Estate for Government Scheme Projects</p>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-5 tracking-tight leading-tight">
            Need Electrical Products for a Government Scheme Project?
          </h2>
          <p className="text-lg text-white/50 mb-10 max-w-xl mx-auto">
            Hub4Estate gets you the best price on all electrical materials required for government-subsidized projects. ISI-certified products from verified dealers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/rfq/create"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors"
            >
              Get Material Quotes <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 border border-white/20 text-white/75 font-medium rounded-xl hover:border-white/40 hover:text-white transition-colors"
            >
              Talk to Our Team
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Internal Links Footer ─────────────────────────────────────────── */}
      <section className="py-10 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-8 text-sm">
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Government Schemes</h4>
              <ul className="space-y-1.5">
                {SEO_GOVERNMENT_SCHEMES.slice(0, 5).map(s => (
                  <li key={s.slug}><Link to={`/government-schemes/${s.slug}`} className="text-gray-500 hover:text-amber-600 transition-colors">{s.name}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Product Categories</h4>
              <ul className="space-y-1.5">
                <li><Link to="/categories" className="text-gray-500 hover:text-amber-600 transition-colors">All Categories</Link></li>
                <li><Link to="/categories/wires-cables" className="text-gray-500 hover:text-amber-600 transition-colors">Wires & Cables</Link></li>
                <li><Link to="/categories/led-lighting" className="text-gray-500 hover:text-amber-600 transition-colors">LED Lighting</Link></li>
                <li><Link to="/categories/switchgear-protection" className="text-gray-500 hover:text-amber-600 transition-colors">Switchgear & MCBs</Link></li>
                <li><Link to="/categories/fans" className="text-gray-500 hover:text-amber-600 transition-colors">Fans</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Top Brands</h4>
              <ul className="space-y-1.5">
                <li><Link to="/brands/havells" className="text-gray-500 hover:text-amber-600 transition-colors">Havells</Link></li>
                <li><Link to="/brands/polycab" className="text-gray-500 hover:text-amber-600 transition-colors">Polycab</Link></li>
                <li><Link to="/brands/philips" className="text-gray-500 hover:text-amber-600 transition-colors">Philips</Link></li>
                <li><Link to="/brands/schneider" className="text-gray-500 hover:text-amber-600 transition-colors">Schneider Electric</Link></li>
                <li><Link to="/brands/legrand" className="text-gray-500 hover:text-amber-600 transition-colors">Legrand</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Quick Links</h4>
              <ul className="space-y-1.5">
                <li><Link to="/for-buyers" className="text-gray-500 hover:text-amber-600 transition-colors">For Buyers</Link></li>
                <li><Link to="/for-dealers" className="text-gray-500 hover:text-amber-600 transition-colors">For Dealers</Link></li>
                <li><Link to="/contact" className="text-gray-500 hover:text-amber-600 transition-colors">Contact Us</Link></li>
                <li><Link to="/about" className="text-gray-500 hover:text-amber-600 transition-colors">About Hub4Estate</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
