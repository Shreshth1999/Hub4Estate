import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogType?: string;
  ogImage?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const SITE_NAME = 'Hub4Estate';
const DEFAULT_TITLE = 'Hub4Estate — Best Prices on Electrical Products in India | Zero Middlemen, Verified Dealers';
const DEFAULT_DESCRIPTION = "India's first transparent procurement platform for electrical products. Get the best price on wires, cables, switches, LEDs, MCBs, fans & more from verified dealers. No middlemen, no markups. Concierge service available. Save up to 40%.";
const DEFAULT_KEYWORDS = 'Hub4Estate, Hub for Estate, Hub 4 Estate, best price electrical products India, buy electrical products online, verified electrical dealers, electrical procurement platform, wires cables LED switches MCB fans wholesale, zero middlemen electrical, concierge service, IndiaMART alternative, construction electrical supplies';
const DEFAULT_OG_IMAGE = 'https://hub4estate.com/logos/hub4estate/logo-full.png';
const BASE_URL = 'https://hub4estate.com';

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonicalUrl,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  noindex = false,
  jsonLd,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const canonical = canonicalUrl ? `${BASE_URL}${canonicalUrl}` : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {canonical && <link rel="canonical" href={canonical} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@hub4estate" />

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
