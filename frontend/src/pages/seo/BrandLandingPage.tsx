import { useParams, Link } from 'react-router-dom';
import {
  ArrowRight, Shield, CheckCircle, Award, ChevronRight, Package,
  HelpCircle, IndianRupee, Star, Zap, Users, Building2,
  ExternalLink, TrendingUp
} from 'lucide-react';
import { SEO } from '../../components/SEO';
import {
  getBrandBySlug, SEO_BRANDS, SEO_CITIES, SEO_PRODUCTS,
  type SEOBrand
} from '../../data/seo-data';

// ─── Helper ──────────────────────────────────────────────────────────────────
function titleCase(str: string): string {
  return str.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ─── Fallback for unknown brand ──────────────────────────────────────────────
function GenericBrandPage({ brandSlug }: { brandSlug: string }) {
  const brandName = titleCase(brandSlug);
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={`Buy ${brandName} Products at Best Price in India`}
        description={`Get the best price on ${brandName} electrical products from verified dealers on Hub4Estate. Zero middlemen. Compare quotes. Free delivery.`}
        keywords={`${brandName} products, ${brandName} electrical, buy ${brandName} online, ${brandName} best price, Hub4Estate`}
        canonicalUrl={`/brands/${brandSlug}`}
      />

      <section className="bg-gradient-to-br from-amber-50 via-white to-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-amber-600 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900 font-medium">{brandName}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
            Buy <span className="text-amber-600">{brandName}</span> Products at Best Price
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mb-8">
            Get the best price on {brandName} electrical products. Compare quotes from verified dealers on Hub4Estate. Zero middlemen.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/rfq/create" className="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors">
              Get Best Price <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/categories" className="inline-flex items-center gap-2 px-8 py-4 border border-gray-200 text-gray-700 font-bold rounded-xl hover:border-gray-300 transition-colors">
              Browse Categories
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse All Brands</h2>
        <div className="flex flex-wrap gap-3">
          {SEO_BRANDS.map(b => (
            <Link key={b.slug} to={`/brands/${b.slug}`} className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:border-amber-200 hover:text-amber-700 transition-all">
              {b.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function BrandLandingPage() {
  const { brandSlug } = useParams<{ brandSlug: string }>();
  const brand: SEOBrand | undefined = getBrandBySlug(brandSlug || '');

  if (!brand) {
    return <GenericBrandPage brandSlug={brandSlug || ''} />;
  }

  const pageTitle = `Buy ${brand.name} Products at Best Price in India`;
  const pageDescription = `Get the best price on ${brand.name} electrical products from verified dealers on Hub4Estate. ${brand.tagline}. Compare quotes. Save 20-35%. Free delivery.`;
  const pageKeywords = `${brand.name} products, ${brand.name} electrical, buy ${brand.name} online, ${brand.name} best price, ${brand.name} dealer, ${brand.name} price list, ${brand.popularProducts.join(', ')}, Hub4Estate`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    name: brand.name,
    description: brand.overview,
    url: `https://hub4estate.com/brands/${brand.slug}`,
    logo: `https://hub4estate.com/logos/brands/${brand.slug}.png`,
    foundingDate: brand.founded,
    address: {
      '@type': 'PostalAddress',
      addressLocality: brand.headquarters,
      addressCountry: brand.headquarters.includes('India') ? 'IN' : undefined,
    },
  };

  // Get products from this brand (match topBrands)
  const brandProducts = SEO_PRODUCTS.filter(p => p.topBrands.includes(brand.name));
  const compareBrands = brand.compareBrands
    .map(slug => SEO_BRANDS.find(b => b.slug === slug))
    .filter(Boolean) as SEOBrand[];

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={pageTitle}
        description={pageDescription}
        keywords={pageKeywords}
        canonicalUrl={`/brands/${brand.slug}`}
        jsonLd={jsonLd}
      />

      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-amber-50 via-white to-amber-50/30 border-b border-gray-100 relative overflow-hidden">
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 65%)' }} />
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 relative">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-amber-600 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900 font-medium">{brand.name}</span>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 border border-amber-200 rounded-full text-xs font-bold text-amber-700 mb-6">
                <Award className="w-3 h-3" />
                Authorized Dealer Network
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 tracking-tight leading-[0.95]">
                Buy <span className="text-amber-600">{brand.name}</span> Products at Best Price in India
              </h1>

              <p className="text-xl text-gray-500 mb-2 font-medium">{brand.tagline}</p>
              <p className="text-gray-400 mb-8 max-w-xl">
                Founded {brand.founded} | Headquarters: {brand.headquarters}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link
                  to="/rfq/create"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors"
                >
                  Get Best {brand.name} Prices <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/categories"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-gray-200 text-gray-700 font-medium rounded-xl hover:border-gray-300 transition-colors"
                >
                  Browse Catalog
                </Link>
              </div>

              {/* Trust row */}
              <div className="flex flex-col gap-2.5">
                {[
                  { icon: Shield, text: 'All dealers verified — authorized distribution only' },
                  { icon: IndianRupee, text: 'Save 20-35% below MRP on genuine products' },
                  { icon: CheckCircle, text: 'Proper GST bills and manufacturer warranty' },
                ].map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm font-medium text-gray-700">
                    <Icon className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Certifications & Quality</h2>
              <div className="space-y-2 mb-6">
                {brand.certifications.map((cert, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{cert}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-400 mb-2">Categories Available</p>
                <p className="text-2xl font-black text-amber-600">{brand.categories.length}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── About Brand ───────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
            About {brand.name}
          </h2>
          <div className="max-w-4xl">
            <p className="text-gray-600 leading-relaxed text-lg mb-8">{brand.overview}</p>
            <div className="grid sm:grid-cols-3 gap-5">
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                <Building2 className="w-6 h-6 text-amber-600 mb-3" />
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Founded</p>
                <p className="text-lg font-bold text-gray-900">{brand.founded}</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                <Award className="w-6 h-6 text-amber-600 mb-3" />
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Certifications</p>
                <p className="text-lg font-bold text-gray-900">{brand.certifications.length}+</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                <Package className="w-6 h-6 text-amber-600 mb-3" />
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Product Lines</p>
                <p className="text-lg font-bold text-gray-900">{brand.categories.length} categories</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Product Categories ────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-stone-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
            {brand.name} Product Categories on Hub4Estate
          </h2>
          <p className="text-gray-500 mb-10 max-w-2xl">
            Browse all {brand.name} product categories available through verified dealers on Hub4Estate. Get competitive pricing on every category.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {brand.categories.map((cat, i) => (
              <Link
                key={i}
                to={`/categories/${cat.slug}`}
                className="group bg-white border border-gray-100 rounded-2xl p-6 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-100/40 hover:-translate-y-1 transition-all duration-300"
              >
                <Package className="w-8 h-8 text-gray-300 group-hover:text-amber-500 mb-4 transition-colors" />
                <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-amber-700 transition-colors">{cat.name}</h3>
                <p className="text-sm text-gray-500 mb-3">by {brand.name}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <p className="text-sm font-bold text-emerald-600">{cat.priceRange}</p>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-amber-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why Buy Brand from Hub4Estate ─────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
            Why Buy {brand.name} from Hub4Estate?
          </h2>
          <p className="text-gray-500 mb-10 max-w-2xl">
            Hub4Estate is the smartest way to buy {brand.name} products in India. Here is what makes us different.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {brand.whyBuyFromHub4Estate.map((reason, i) => {
              const icons = [IndianRupee, TrendingUp, CheckCircle, Zap, Users];
              const Icon = icons[i % icons.length];
              return (
                <div key={i} className="flex items-start gap-4 bg-gray-50 border border-gray-100 rounded-xl p-5">
                  <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-amber-600" />
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">{reason}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Price List Overview ───────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-stone-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
            {brand.name} Price List Overview
          </h2>
          <p className="text-gray-500 mb-10 max-w-2xl">
            Indicative price ranges for {brand.name} products. Actual prices depend on specific model, quantity, and dealer. Submit a requirement on Hub4Estate for exact pricing.
          </p>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200 px-6 py-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">MRP Range</span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</span>
            </div>
            {brand.categories.map((cat, i) => (
              <div key={i} className={`grid grid-cols-3 items-center px-6 py-4 ${i % 2 === 0 ? '' : 'bg-gray-50/50'} border-b border-gray-100 last:border-0`}>
                <Link to={`/categories/${cat.slug}`} className="text-sm font-bold text-gray-900 hover:text-amber-600 transition-colors">
                  {cat.name}
                </Link>
                <span className="text-sm text-gray-600">{cat.priceRange}</span>
                <div className="text-right">
                  <Link to="/rfq/create" className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors">
                    Get Best Price
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Popular Products ──────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
            Popular {brand.name} Products
          </h2>
          <p className="text-gray-500 mb-10 max-w-2xl">
            Most-searched {brand.name} products on Hub4Estate. Submit a requirement for any of these to get dealer quotes.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {brand.popularProducts.map((product, i) => (
              <div key={i} className="flex items-center gap-4 bg-gray-50 border border-gray-100 rounded-xl p-4">
                <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Star className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{product}</p>
                  <p className="text-xs text-gray-500">by {brand.name}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Also show products from our data */}
          {brandProducts.length > 0 && (
            <div className="mt-10">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Buy {brand.name} Products by City</h3>
              <div className="flex flex-wrap gap-2">
                {brandProducts.slice(0, 4).flatMap(p =>
                  SEO_CITIES.slice(0, 5).map(c => (
                    <Link
                      key={`${p.slug}-${c.slug}`}
                      to={`/buy/${p.slug}-in-${c.slug}`}
                      className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-gray-600 hover:border-amber-200 hover:text-amber-700 hover:bg-amber-50 transition-all"
                    >
                      {p.shortName} in {c.name}
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── Compare With Other Brands ─────────────────────────────────────── */}
      {compareBrands.length > 0 && (
        <section className="py-16 md:py-20 bg-stone-50 border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
              Compare {brand.name} with Other Brands
            </h2>
            <p className="text-gray-500 mb-10 max-w-2xl">
              Not sure if {brand.name} is the right choice? Compare with these popular alternatives. Hub4Estate dealers stock all major brands.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {compareBrands.map((cb, i) => (
                <Link
                  key={i}
                  to={`/brands/${cb.slug}`}
                  className="group bg-white border border-gray-100 rounded-xl p-5 hover:border-amber-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-amber-700 transition-colors">{cb.name}</h3>
                    <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-amber-500 transition-colors" />
                  </div>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{cb.tagline}</p>
                  <p className="text-xs font-bold text-amber-600">{cb.categories.length} categories available</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── FAQ Section ───────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
            Frequently Asked Questions About {brand.name}
          </h2>
          <p className="text-gray-500 mb-10">
            Common questions about buying {brand.name} products through Hub4Estate.
          </p>
          <div className="space-y-4">
            {brand.faqs.map((faq, i) => (
              <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-6">
                <div className="flex items-start gap-3 mb-3">
                  <HelpCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <h3 className="text-base font-bold text-gray-900">{faq.q}</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed pl-8">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-[#09090B]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold text-amber-500 uppercase tracking-[0.2em] mb-6">Free for Buyers, Always</p>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-5 tracking-tight leading-tight">
            Get the Best Prices on {brand.name} Products
          </h2>
          <p className="text-lg text-white/50 mb-10 max-w-xl mx-auto">
            Submit your {brand.name} product requirement. Multiple verified dealers will compete to offer you the lowest price with genuine products and proper documentation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/rfq/create"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors"
            >
              Submit Your Requirement <ArrowRight className="w-5 h-5" />
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
              <h4 className="font-bold text-gray-900 mb-3">All Brands</h4>
              <ul className="space-y-1.5">
                {SEO_BRANDS.filter(b => b.slug !== brand.slug).slice(0, 6).map(b => (
                  <li key={b.slug}><Link to={`/brands/${b.slug}`} className="text-gray-500 hover:text-amber-600 transition-colors">{b.name}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Popular Categories</h4>
              <ul className="space-y-1.5">
                {brand.categories.slice(0, 5).map((cat, i) => (
                  <li key={i}><Link to={`/categories/${cat.slug}`} className="text-gray-500 hover:text-amber-600 transition-colors">{cat.name}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Quick Links</h4>
              <ul className="space-y-1.5">
                <li><Link to="/categories" className="text-gray-500 hover:text-amber-600 transition-colors">All Categories</Link></li>
                <li><Link to="/for-buyers" className="text-gray-500 hover:text-amber-600 transition-colors">For Buyers</Link></li>
                <li><Link to="/for-dealers" className="text-gray-500 hover:text-amber-600 transition-colors">For Dealers</Link></li>
                <li><Link to="/contact" className="text-gray-500 hover:text-amber-600 transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Resources</h4>
              <ul className="space-y-1.5">
                <li><Link to="/government-schemes" className="text-gray-500 hover:text-amber-600 transition-colors">Government Schemes</Link></li>
                <li><Link to="/about" className="text-gray-500 hover:text-amber-600 transition-colors">About Hub4Estate</Link></li>
                <li><Link to="/knowledge" className="text-gray-500 hover:text-amber-600 transition-colors">Buying Guides</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
