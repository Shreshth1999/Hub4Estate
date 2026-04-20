import { useParams, Link } from 'react-router-dom';
import {
  ArrowRight, ChevronRight, Shield, CheckCircle, Users,
  HelpCircle, Package, ExternalLink, IndianRupee,
  FileText, Clock, Zap, BookOpen
} from 'lucide-react';
import { SEO } from '../../components/SEO';
import {
  getSchemeBySlug, SEO_GOVERNMENT_SCHEMES, SEO_PRODUCTS, SEO_BRANDS,
  SCHEME_CATEGORY_LABELS, SCHEME_CATEGORY_COLORS,
  type SEOGovernmentScheme,
} from '../../data/seo-data';

// ─── Helper ──────────────────────────────────────────────────────────────────
function titleCase(str: string): string {
  return str.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ─── Fallback for unknown scheme ─────────────────────────────────────────────
function GenericSchemePage({ slug }: { slug: string }) {
  const schemeName = titleCase(slug);
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={`${schemeName} - Complete Guide`}
        description={`Learn about ${schemeName}. Eligibility, benefits, how to apply, and electrical products needed.`}
        keywords={`${schemeName}, government scheme India, electrical products, Hub4Estate`}
        canonicalUrl={`/government-schemes/${slug}`}
      />

      <section className="bg-gradient-to-br from-amber-50 via-white to-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-amber-600 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/government-schemes" className="hover:text-amber-600 transition-colors">Government Schemes</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900 font-medium">{schemeName}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
            {schemeName}
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mb-8">
            Information about this scheme is being compiled. Browse our complete list of government schemes for electrical products and solar energy.
          </p>
          <Link to="/government-schemes" className="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors">
            View All Schemes <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function GovtSchemeDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const scheme: SEOGovernmentScheme | undefined = getSchemeBySlug(slug || '');

  if (!scheme) {
    return <GenericSchemePage slug={slug || ''} />;
  }

  const colors = SCHEME_CATEGORY_COLORS[scheme.category];
  const categoryLabel = SCHEME_CATEGORY_LABELS[scheme.category];

  const pageTitle = `${scheme.name} - Complete Guide`;
  const pageDescription = `${scheme.name}: ${scheme.shortDescription} Learn about eligibility, benefits, how to apply, and electrical products needed. Hub4Estate helps you source materials at the best price.`;
  const pageKeywords = `${scheme.name}, ${scheme.slug.replace(/-/g, ' ')}, ${scheme.ministry}, government scheme India, ${scheme.electricalProducts.slice(0, 5).join(', ')}, electrical products subsidy, Hub4Estate`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: `${scheme.name} - Complete Guide`,
      description: pageDescription,
      url: `https://hub4estate.com/government-schemes/${scheme.slug}`,
      publisher: {
        '@type': 'Organization',
        name: 'Hub4Estate',
        url: 'https://hub4estate.com',
      },
      datePublished: '2026-04-01',
      dateModified: '2026-04-10',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'GovernmentService',
      name: scheme.name,
      description: scheme.overview,
      serviceType: categoryLabel,
      provider: {
        '@type': 'GovernmentOrganization',
        name: scheme.ministry,
        address: { '@type': 'PostalAddress', addressCountry: 'IN' },
      },
      url: scheme.officialLink,
    },
  ];

  // Related schemes
  const relatedSchemes = scheme.relatedSchemeSlugs
    .map(s => SEO_GOVERNMENT_SCHEMES.find(gs => gs.slug === s))
    .filter(Boolean) as SEOGovernmentScheme[];

  // Relevant products from our catalog
  const relevantProducts = SEO_PRODUCTS.filter(p =>
    scheme.electricalProducts.some(ep =>
      p.name.toLowerCase().includes(ep.toLowerCase().split(' ')[0]) ||
      ep.toLowerCase().includes(p.shortName.toLowerCase())
    )
  ).slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={pageTitle}
        description={pageDescription}
        keywords={pageKeywords}
        canonicalUrl={`/government-schemes/${scheme.slug}`}
        jsonLd={jsonLd}
      />

      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-amber-50 via-white to-blue-50/30 border-b border-gray-100 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 65%)' }} />
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 relative">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
            <Link to="/" className="hover:text-amber-600 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/government-schemes" className="hover:text-amber-600 transition-colors">Government Schemes</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900 font-medium">{scheme.name}</span>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 items-start">
            {/* Main content */}
            <div className="lg:col-span-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${colors.bg} ${colors.text} ${colors.border} border text-xs font-bold rounded-full mb-6`}>
                {categoryLabel}
              </span>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
                {scheme.name}
              </h1>

              <p className="text-lg text-gray-500 max-w-2xl mb-4 leading-relaxed">
                {scheme.shortDescription}
              </p>

              <p className="text-sm text-gray-400 mb-8">
                Ministry: {scheme.ministry}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/rfq/create"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors"
                >
                  Get Material Quotes <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href={scheme.officialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-gray-200 text-gray-700 font-medium rounded-xl hover:border-gray-300 transition-colors"
                >
                  Official Website <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Sidebar: Quick Facts */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Quick Facts</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Ministry</p>
                  <p className="text-sm font-medium text-gray-900">{scheme.ministry}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Category</p>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 ${colors.bg} ${colors.text} text-xs font-bold rounded-full`}>
                    {categoryLabel}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Electrical Products Needed</p>
                  <p className="text-sm font-medium text-gray-900">{scheme.electricalProducts.length} product types</p>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <a
                    href={scheme.officialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Official Portal
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Scheme Overview ───────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Scheme Overview</h2>
          </div>
          <div className="bg-stone-50 border border-gray-100 rounded-2xl p-6 md:p-8">
            <p className="text-gray-700 leading-relaxed text-lg">{scheme.overview}</p>
          </div>
        </div>
      </section>

      {/* ─── Eligibility ───────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-stone-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Who is Eligible?</h2>
          </div>
          <div className="space-y-3">
            {scheme.eligibility.map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-white border border-gray-100 rounded-xl p-4">
                <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Benefits ──────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Benefits</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {scheme.benefits.map((benefit, i) => (
              <div key={i} className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <Zap className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700 leading-relaxed font-medium">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How to Apply ──────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-stone-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-violet-50 border border-violet-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-violet-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">How to Apply — Step by Step</h2>
          </div>
          <div className="space-y-4">
            {scheme.howToApply.map((step, i) => (
              <div key={i} className="flex items-start gap-4 bg-white border border-gray-100 rounded-xl p-5">
                <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-black text-violet-700">{i + 1}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <a
              href={scheme.officialLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Apply on the official portal: {scheme.officialLink}
            </a>
          </div>
        </div>
      </section>

      {/* ─── Electrical Products Needed ─────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
              Electrical Products Needed Under This Scheme
            </h2>
          </div>
          <p className="text-gray-500 mb-8 max-w-2xl">
            The following electrical products are typically required for projects under {scheme.name}. Hub4Estate can help you source all of them at the best price from verified dealers.
          </p>

          <div className="grid sm:grid-cols-2 gap-3 mb-8">
            {scheme.electricalProducts.map((product, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4">
                <Package className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span className="text-sm text-gray-700 font-medium">{product}</span>
              </div>
            ))}
          </div>

          {/* Matching products from our catalog */}
          {relevantProducts.length > 0 && (
            <div className="mt-10">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Available on Hub4Estate</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {relevantProducts.map((p, i) => (
                  <Link
                    key={i}
                    to={`/buy/${p.slug}-in-delhi`}
                    className="group flex items-start gap-4 bg-amber-50 border border-amber-100 rounded-xl p-4 hover:border-amber-200 hover:shadow-md transition-all"
                  >
                    <Package className="w-8 h-8 text-amber-500 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 group-hover:text-amber-700 transition-colors">{p.name}</h4>
                      <p className="text-xs text-gray-500">{p.category}</p>
                      <p className="text-xs font-bold text-emerald-600 mt-1">Save {p.savingsPercent} on Hub4Estate</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── How Hub4Estate Helps ──────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-[#09090B]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-[0.2em] mb-3">Hub4Estate Advantage</p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
              How Hub4Estate Helps with {scheme.name}
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              Whether you are a beneficiary, contractor, or installer working on a {scheme.name} project, Hub4Estate ensures you get the best price on all required electrical materials.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: IndianRupee, title: 'Best Material Prices', desc: `Save 20-40% on electrical products needed for ${scheme.name} projects. Verified dealers compete to offer you the lowest price.` },
              { icon: Shield, title: 'Government-Grade Quality', desc: 'All products are ISI/BIS certified as required by government schemes. Genuine products with manufacturer warranty and proper GST bills.' },
              { icon: Clock, title: 'Fast Procurement', desc: 'Submit your material list once. Receive multiple dealer quotes within hours. No need to call 10 different shops.' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors">
                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Related Schemes ───────────────────────────────────────────────── */}
      {relatedSchemes.length > 0 && (
        <section className="py-16 md:py-20 bg-stone-50 border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6 tracking-tight">Related Schemes</h2>
            <div className="space-y-4">
              {relatedSchemes.map((rs) => {
                const rsColors = SCHEME_CATEGORY_COLORS[rs.category];
                return (
                  <Link
                    key={rs.slug}
                    to={`/government-schemes/${rs.slug}`}
                    className="group flex items-start gap-4 bg-white border border-gray-100 rounded-xl p-5 hover:border-amber-200 hover:shadow-md transition-all"
                  >
                    <div className={`w-10 h-10 ${rsColors.bg} ${rsColors.border} border rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Shield className={`w-5 h-5 ${rsColors.text}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-amber-700 transition-colors mb-1">{rs.name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2">{rs.shortDescription}</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 ${rsColors.bg} ${rsColors.text} text-xs font-bold rounded-full mt-2`}>
                        {SCHEME_CATEGORY_LABELS[rs.category]}
                      </span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-amber-500 transition-colors flex-shrink-0 mt-1" />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-[#09090B]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold text-amber-500 uppercase tracking-[0.2em] mb-6">Hub4Estate for {scheme.name}</p>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-5 tracking-tight leading-tight">
            Need Materials for {scheme.name}?
          </h2>
          <p className="text-lg text-white/50 mb-10 max-w-xl mx-auto">
            Get quotes from verified dealers on all electrical products required for your {scheme.name} project. ISI-certified. Best prices. Free for buyers.
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
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-sm">
            <div>
              <h4 className="font-bold text-gray-900 mb-3">More Schemes</h4>
              <ul className="space-y-1.5">
                {SEO_GOVERNMENT_SCHEMES.filter(s => s.slug !== scheme.slug).slice(0, 5).map(s => (
                  <li key={s.slug}><Link to={`/government-schemes/${s.slug}`} className="text-gray-500 hover:text-amber-600 transition-colors">{s.name}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Top Brands</h4>
              <ul className="space-y-1.5">
                {SEO_BRANDS.slice(0, 5).map(b => (
                  <li key={b.slug}><Link to={`/brands/${b.slug}`} className="text-gray-500 hover:text-amber-600 transition-colors">{b.name}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Product Categories</h4>
              <ul className="space-y-1.5">
                <li><Link to="/categories" className="text-gray-500 hover:text-amber-600 transition-colors">All Categories</Link></li>
                <li><Link to="/categories/wires-cables" className="text-gray-500 hover:text-amber-600 transition-colors">Wires & Cables</Link></li>
                <li><Link to="/categories/led-lighting" className="text-gray-500 hover:text-amber-600 transition-colors">LED Lighting</Link></li>
                <li><Link to="/categories/switchgear-protection" className="text-gray-500 hover:text-amber-600 transition-colors">Switchgear</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Quick Links</h4>
              <ul className="space-y-1.5">
                <li><Link to="/government-schemes" className="text-gray-500 hover:text-amber-600 transition-colors">All Schemes</Link></li>
                <li><Link to="/for-buyers" className="text-gray-500 hover:text-amber-600 transition-colors">For Buyers</Link></li>
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
