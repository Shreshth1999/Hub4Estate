import { useParams, Link } from 'react-router-dom';
import {
  ArrowRight, Shield, CheckCircle, Truck, IndianRupee,
  MapPin, Star, ChevronRight, Package, HelpCircle, Tag,
  Clock, Users, Zap, ShoppingCart
} from 'lucide-react';
import { SEO } from '../../components/SEO';
import {
  getProductBySlug, getCityBySlug, SEO_PRODUCTS, SEO_CITIES,
  type SEOProduct, type SEOCity
} from '../../data/seo-data';

// ─── Helper: title case ──────────────────────────────────────────────────────
function titleCase(str: string): string {
  return str.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ─── Generic fallback when slug combo is unknown ─────────────────────────────
function GenericProductCitySection({ productSlug, citySlug }: { productSlug: string; citySlug: string }) {
  const productName = titleCase(productSlug);
  const cityName = titleCase(citySlug);
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={`Buy ${productName} in ${cityName} at Best Price`}
        description={`Get the best price on ${productName} in ${cityName}. Compare prices from verified dealers on Hub4Estate. Zero middlemen. Free delivery. Save up to 40%.`}
        keywords={`buy ${productName} in ${cityName}, ${productName} best price ${cityName}, ${productName} dealer ${cityName}, electrical products ${cityName}, Hub4Estate`}
        canonicalUrl={`/buy/${productSlug}-in-${citySlug}`}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-50 via-white to-amber-50/30 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 md:py-24">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-amber-600 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/categories" className="hover:text-amber-600 transition-colors">Categories</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900 font-medium">{productName} in {cityName}</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
            Buy <span className="text-amber-600">{productName}</span> in {cityName} at Best Price
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mb-8">
            Get the best price on {productName} in {cityName}. Compare quotes from verified electrical dealers. Zero middlemen. Save up to 40% on your purchase.
          </p>
          <Link
            to="/rfq/create"
            className="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors"
          >
            Get Best Price Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Browse section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse Electrical Products</h2>
        <p className="text-gray-600 mb-8 max-w-2xl">
          We are expanding our catalog every day. Browse our current categories or submit a custom requirement and our team will source the best price for you.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link to="/categories" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors">
            Browse All Categories <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:border-gray-300 transition-colors">
            Contact Us <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function BuyProductCityPage() {
  const { productSlug: rawParam } = useParams<{ productSlug: string }>();

  // Parse: "havells-wire-in-jaipur" → productSlug="havells-wire", citySlug="jaipur"
  const parts = (rawParam || '').split('-in-');
  const productSlug = parts[0] || '';
  const citySlug = parts[1] || '';

  const product: SEOProduct | undefined = getProductBySlug(productSlug);
  const city: SEOCity | undefined = getCityBySlug(citySlug);

  // Fallback for unknown combos
  if (!product || !city) {
    return <GenericProductCitySection productSlug={productSlug} citySlug={citySlug} />;
  }

  const pageTitle = `Buy ${product.name} in ${city.name} at Best Price`;
  const pageDescription = `Get the best price on ${product.name} in ${city.name}. Compare prices from verified dealers. Zero middlemen. Free delivery. Save up to ${product.savingsPercent}.`;
  const pageKeywords = `buy ${product.name} in ${city.name}, ${product.shortName} best price ${city.name}, ${product.shortName} dealer ${city.name}, ${product.category} ${city.name}, ${product.topBrands.join(', ')}, electrical products ${city.name}, Hub4Estate`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      brand: { '@type': 'Brand', name: 'Multiple Brands' },
      category: product.category,
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'INR',
        lowPrice: product.hub4estateRange.match(/[\d,]+/)?.[0]?.replace(',', '') || '100',
        highPrice: product.hub4estateRange.match(/[\d,]+$/)?.[0]?.replace(',', '') || '10000',
        offerCount: city.dealerCount.replace('+', ''),
        availability: 'https://schema.org/InStock',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: `Hub4Estate — ${product.name} Dealers in ${city.name}`,
      description: `Verified dealers for ${product.name} in ${city.name}, ${city.state}`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: city.name,
        addressRegion: city.state,
        addressCountry: 'IN',
      },
      url: `https://hub4estate.com/buy/${productSlug}-in-${citySlug}`,
    },
  ];

  // Related products
  const relatedProducts = product.relatedSlugs
    .map(slug => SEO_PRODUCTS.find(p => p.slug === slug))
    .filter(Boolean) as SEOProduct[];

  // Nearby cities (first 6, excluding current)
  const nearbyCities = SEO_CITIES.filter(c => c.slug !== citySlug).slice(0, 6);

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={pageTitle}
        description={pageDescription}
        keywords={pageKeywords}
        canonicalUrl={`/buy/${productSlug}-in-${citySlug}`}
        jsonLd={jsonLd}
      />

      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-amber-50 via-white to-amber-50/30 border-b border-gray-100 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 65%)' }} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 md:py-24 relative">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
            <Link to="/" className="hover:text-amber-600 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/categories" className="hover:text-amber-600 transition-colors">Categories</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={`/categories/${product.categorySlug}`} className="hover:text-amber-600 transition-colors">{product.category}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900 font-medium">{product.shortName} in {city.name}</span>
          </div>

          <div className="grid lg:grid-cols-5 gap-12 items-start">
            <div className="lg:col-span-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 border border-amber-200 rounded-full text-xs font-bold text-amber-700 mb-6">
                <MapPin className="w-3 h-3" />
                Delivering to {city.name}, {city.state}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-[0.95]">
                Buy <span className="text-amber-600">{product.name}</span> in {city.name} at Best Price
              </h1>

              <p className="text-lg text-gray-500 max-w-2xl mb-8 leading-relaxed">
                {pageDescription} Compare quotes from {city.dealerCount} verified dealers in {city.name} and across India. Delivery in {city.deliveryDays}.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link
                  to="/rfq/create"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors"
                >
                  Get Best Price <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/for-buyers"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-gray-200 text-gray-700 font-medium rounded-xl hover:border-gray-300 transition-colors"
                >
                  How It Works
                </Link>
              </div>

              {/* Trust row */}
              <div className="flex flex-col gap-2.5">
                {[
                  { icon: Shield, text: 'All dealers verified with GST before listing' },
                  { icon: IndianRupee, text: `Save ${product.savingsPercent} compared to retail MRP` },
                  { icon: Truck, text: `Delivery to ${city.name} in ${city.deliveryDays}` },
                ].map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm font-medium text-gray-700">
                    <Icon className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick info card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Price Overview in {city.name}</h2>
                <div className="space-y-4 mb-6">
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <p className="text-xs text-red-500 font-bold uppercase tracking-wider mb-1">Retail MRP</p>
                    <p className="text-xl font-black text-red-600 line-through">{product.mrpRange}</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                    <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">Hub4Estate Price</p>
                    <p className="text-xl font-black text-emerald-700">{product.hub4estateRange}</p>
                    <p className="text-xs text-emerald-500 mt-1">Save up to {product.savingsPercent}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <span>{city.dealerCount} verified dealers in {city.name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>Delivery: {city.deliveryDays}</span>
                </div>
                <Link
                  to="/rfq/create"
                  className="block w-full text-center px-6 py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Submit Requirement
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Why Buy From Hub4Estate in {City} ─────────────────────────────── */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
            Why Buy {product.shortName} from Hub4Estate in {city.name}?
          </h2>
          <p className="text-gray-500 mb-10 max-w-2xl">
            Hub4Estate is India's first transparent procurement platform for electrical products. Here is why buyers in {city.name} choose us for {product.name}.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: IndianRupee, title: 'Best Price Guaranteed', desc: `Multiple verified dealers in ${city.name} compete to give you the lowest price on ${product.shortName}. No middlemen, no hidden markups.` },
              { icon: Shield, title: 'Verified Dealers Only', desc: `Every dealer on Hub4Estate is GST-verified and vetted before they can quote. You deal with trusted, authorized sellers only.` },
              { icon: Truck, title: `Fast Delivery to ${city.name}`, desc: `Get ${product.shortName} delivered to your doorstep in ${city.name} within ${city.deliveryDays}. Most dealers offer free delivery for bulk orders.` },
              { icon: CheckCircle, title: 'Genuine Products, Proper Bills', desc: `Every order comes with a GST bill and manufacturer warranty card. No counterfeit products, no grey market — only genuine ${product.topBrands[0]} and other brands.` },
              { icon: Star, title: 'Compare Before You Buy', desc: `See quotes from multiple dealers side by side — price, delivery time, and dealer rating. You choose the best deal, not us.` },
              { icon: Zap, title: 'Free for Buyers, Always', desc: `Submitting a requirement on Hub4Estate is 100% free. No registration fee, no commission, no hidden charges to buyers.` },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="group bg-white border border-gray-100 rounded-2xl p-6 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-100/40 transition-all duration-300">
                <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-500 group-hover:border-amber-500 transition-all">
                  <Icon className="w-5 h-5 text-amber-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Price Range Section ───────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-stone-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
            {product.name} Price Range in {city.name}
          </h2>
          <p className="text-gray-500 mb-10 max-w-2xl">
            Here is how Hub4Estate pricing compares to retail MRP for {product.name} in {city.name}. Actual prices depend on brand, specifications, and order quantity.
          </p>
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                  <Tag className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-red-500 uppercase tracking-wider">Retail MRP</p>
                  <p className="text-2xl font-black text-red-600">{product.mrpRange}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                This is the Maximum Retail Price you would pay at a local electrical shop or online retailer in {city.name}. No room for negotiation on MRP.
              </p>
            </div>
            <div className="bg-white border border-emerald-200 rounded-2xl p-6 ring-2 ring-emerald-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Hub4Estate Price</p>
                  <p className="text-2xl font-black text-emerald-700">{product.hub4estateRange}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Competitive dealer pricing through Hub4Estate. Save {product.savingsPercent} by letting dealers compete for your order. Prices include GST and delivery.
              </p>
            </div>
          </div>

          {/* Specifications */}
          <h3 className="text-xl font-bold text-gray-900 mb-4">Specifications</h3>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
            {product.specifications.map((spec, i) => (
              <div key={i} className={`flex items-center gap-3 px-5 py-3 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">{spec}</span>
              </div>
            ))}
          </div>

          {/* Applications */}
          <h3 className="text-xl font-bold text-gray-900 mb-4">Common Applications</h3>
          <div className="flex flex-wrap gap-2 mb-8">
            {product.applications.map((app, i) => (
              <span key={i} className="px-3 py-1.5 bg-amber-50 border border-amber-100 text-amber-700 text-sm font-medium rounded-lg">
                {app}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Top Brands Available ──────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
            Top {product.category} Brands Available in {city.name}
          </h2>
          <p className="text-gray-500 mb-10 max-w-2xl">
            Hub4Estate dealers in {city.name} stock products from all major electrical brands. Compare pricing across brands and choose the best value for your project.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {product.topBrands.map((brand, i) => {
              const brandSlug = brand.toLowerCase().replace(/\s+/g, '-');
              return (
                <Link
                  key={i}
                  to={`/brands/${brandSlug}`}
                  className="group bg-gray-50 border border-gray-100 rounded-xl p-5 text-center hover:border-amber-200 hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:border-amber-300 transition-colors">
                    <Package className="w-5 h-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
                  </div>
                  <p className="text-sm font-bold text-gray-900">{brand}</p>
                  <p className="text-xs text-amber-600 mt-1">View prices</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── How To Order ──────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-[#09090B]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-[0.2em] mb-3">Simple 3-Step Process</p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
              How to Order {product.shortName} in {city.name}
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Getting the best price on {product.name} in {city.name} takes less than 2 minutes. Here is how it works.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Submit Your Requirement', desc: `Tell us what you need — ${product.shortName}, brand preferences, quantity, and delivery to ${city.name}. Upload a photo or purchase slip for faster processing.` },
              { step: '02', title: 'Dealers Compete for Your Order', desc: `Multiple verified dealers in ${city.name} and across India send you their best price. Quotes are blind — dealers cannot see each other's pricing.` },
              { step: '03', title: 'Compare and Choose the Best Deal', desc: `See all quotes side by side — price, delivery time, dealer rating. Pick the one that works for you. Contact is revealed instantly. Done.` },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-colors">
                <div className="text-amber-500 text-sm font-bold mb-4">Step {item.step}</div>
                <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Delivery Info ─────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
            {product.shortName} Delivery in {city.name}
          </h2>
          <p className="text-gray-500 mb-10 max-w-2xl">
            Hub4Estate dealers deliver {product.name} to all areas in {city.name}, {city.state}. Here are the delivery details for your city.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-stone-50 border border-gray-100 rounded-2xl p-6">
              <Truck className="w-8 h-8 text-amber-600 mb-4" />
              <h3 className="text-base font-bold text-gray-900 mb-2">Estimated Delivery Time</h3>
              <p className="text-2xl font-black text-amber-600 mb-2">{city.deliveryDays}</p>
              <p className="text-sm text-gray-500">From order confirmation to doorstep delivery in {city.name}. Timelines may vary based on stock availability and order size.</p>
            </div>
            <div className="bg-stone-50 border border-gray-100 rounded-2xl p-6">
              <MapPin className="w-8 h-8 text-amber-600 mb-4" />
              <h3 className="text-base font-bold text-gray-900 mb-2">Delivery Coverage</h3>
              <p className="text-2xl font-black text-amber-600 mb-2">All PIN codes</p>
              <p className="text-sm text-gray-500">Delivery available to all areas within {city.name} ({city.pinPrefix}xxx). Including commercial sites, residential addresses, and construction locations.</p>
            </div>
            <div className="bg-stone-50 border border-gray-100 rounded-2xl p-6">
              <IndianRupee className="w-8 h-8 text-amber-600 mb-4" />
              <h3 className="text-base font-bold text-gray-900 mb-2">Delivery Charges</h3>
              <p className="text-2xl font-black text-amber-600 mb-2">Often Free</p>
              <p className="text-sm text-gray-500">Most dealers offer free delivery for bulk orders in {city.name}. Delivery charges, if any, are shown transparently in the quote.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Related Products ──────────────────────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <section className="py-16 md:py-20 bg-stone-50 border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
              Related Electrical Products in {city.name}
            </h2>
            <p className="text-gray-500 mb-10 max-w-2xl">
              Buyers who look for {product.shortName} also search for these electrical products. Get the best price on all of them from verified dealers.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((rp, i) => (
                <Link
                  key={i}
                  to={`/buy/${rp.slug}-in-${citySlug}`}
                  className="group bg-white border border-gray-100 rounded-xl p-5 hover:border-amber-200 hover:shadow-md transition-all"
                >
                  <Package className="w-8 h-8 text-gray-300 group-hover:text-amber-500 mb-3 transition-colors" />
                  <h3 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-amber-700 transition-colors">{rp.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{rp.category}</p>
                  <p className="text-xs font-bold text-emerald-600">Save {rp.savingsPercent}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Also Available In ─────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Buy {product.shortName} in Other Cities
          </h2>
          <div className="flex flex-wrap gap-2">
            {nearbyCities.map((c, i) => (
              <Link
                key={i}
                to={`/buy/${productSlug}-in-${c.slug}`}
                className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:border-amber-200 hover:text-amber-700 hover:bg-amber-50 transition-all"
              >
                {product.shortName} in {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ Section ───────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-stone-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
            Frequently Asked Questions — {product.shortName} in {city.name}
          </h2>
          <p className="text-gray-500 mb-10">
            Common questions about buying {product.name} in {city.name} through Hub4Estate.
          </p>
          <div className="space-y-4">
            {product.faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-6">
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs font-semibold text-amber-500 uppercase tracking-[0.2em] mb-6">Free for Buyers, Always</p>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-5 tracking-tight leading-tight">
            Get the Best Price on {product.shortName} in {city.name}
          </h2>
          <p className="text-lg text-white/50 mb-10 max-w-xl mx-auto">
            Submit your requirement now. Multiple verified dealers will compete to offer you the lowest price on {product.name} with delivery to {city.name}.
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-8 text-sm">
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Popular Products</h4>
              <ul className="space-y-1.5">
                {SEO_PRODUCTS.slice(0, 5).map(p => (
                  <li key={p.slug}><Link to={`/buy/${p.slug}-in-${citySlug}`} className="text-gray-500 hover:text-amber-600 transition-colors">{p.shortName} in {city.name}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Popular Cities</h4>
              <ul className="space-y-1.5">
                {SEO_CITIES.slice(0, 5).map(c => (
                  <li key={c.slug}><Link to={`/buy/${productSlug}-in-${c.slug}`} className="text-gray-500 hover:text-amber-600 transition-colors">{product.shortName} in {c.name}</Link></li>
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
                <li><Link to="/about" className="text-gray-500 hover:text-amber-600 transition-colors">About Hub4Estate</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Government Schemes</h4>
              <ul className="space-y-1.5">
                <li><Link to="/government-schemes" className="text-gray-500 hover:text-amber-600 transition-colors">All Schemes</Link></li>
                <li><Link to="/government-schemes/pm-surya-ghar-muft-bijli-yojana" className="text-gray-500 hover:text-amber-600 transition-colors">PM Surya Ghar</Link></li>
                <li><Link to="/government-schemes/ujala-scheme" className="text-gray-500 hover:text-amber-600 transition-colors">UJALA Scheme</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
