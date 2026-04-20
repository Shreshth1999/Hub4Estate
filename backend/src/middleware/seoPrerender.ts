import { Request, Response, NextFunction } from 'express';

/**
 * SEO Prerender Middleware
 *
 * Detects search engine bots (Googlebot, Bingbot, LinkedIn, Facebook, Twitter, etc.)
 * and serves them a fully rendered, keyword-rich HTML page instead of the empty SPA shell.
 *
 * This is the #1 most critical SEO fix for a React SPA.
 */

const BOT_USER_AGENTS = [
  'googlebot', 'google-inspectiontool', 'storebot-google',
  'bingbot', 'msnbot', 'slurp', 'yandexbot', 'baiduspider',
  'duckduckbot', 'facebot', 'facebookexternalhit',
  'linkedinbot', 'twitterbot', 'pinterestbot',
  'whatsapp', 'telegrambot', 'applebot',
  'ia_archiver', 'semrushbot', 'ahrefsbot', 'mj12bot',
  'petalbot', 'rogerbot', 'screaming frog',
];

function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some(bot => ua.includes(bot));
}

/** Full SEO-optimized HTML that bots see for the homepage and key routes */
function generateSEOPage(path: string, pageOverride?: { title: string; description: string; h1: string; content: string }): string {
  const pages: Record<string, { title: string; description: string; h1: string; content: string }> = {
    '/': {
      title: 'Hub4Estate — Best Prices on Electrical Products in India | Zero Middlemen, Verified Dealers',
      description: "India's first transparent procurement platform for electrical products. Get the best price on wires, cables, switches, LEDs, MCBs, fans & more from verified dealers. No middlemen, no markups. Concierge service available. Save up to 40%.",
      h1: 'Hub4Estate — Best Prices on Electrical Products in India',
      content: getHomeContent(),
    },
    '/for-buyers': {
      title: 'Buy Electrical Products at Best Price — Hub4Estate Concierge Service | Verified Dealers India',
      description: 'Stop overpaying for electrical products. Hub4Estate connects you with verified dealers across India. Concierge service sources ANY product at the lowest price. Save up to 40%.',
      h1: 'Buy Electrical Products at the Best Price in India — Hub4Estate',
      content: getBuyerContent(),
    },
    '/for-dealers': {
      title: 'Become a Verified Dealer on Hub4Estate — Get High-Intent Buyer Leads | Grow Your Business',
      description: "Join Hub4Estate's verified dealer network. Receive high-intent buyer leads matched to your products. No commission. Simple subscription. Average 35% revenue increase.",
      h1: 'Become a Verified Dealer on Hub4Estate — Get Buyer Leads, Grow Revenue',
      content: getDealerContent(),
    },
    '/categories': {
      title: 'Electrical Product Categories — Wires, LEDs, Switches, MCBs, Fans & More | Hub4Estate',
      description: 'Browse all electrical product categories on Hub4Estate. Best prices from verified dealers on wires, cables, LED lighting, switches, MCBs, fans, distribution boards, and more.',
      h1: 'Electrical Product Categories — Browse & Compare Best Prices',
      content: getCategoriesContent(),
    },
    '/about': {
      title: 'About Hub4Estate — India\'s Transparent Electrical Products Marketplace | Founded 2026',
      description: 'Hub4Estate was founded by Shreshth Agarwal to solve pricing opacity in electrical procurement. After 2 years of validation, we built India\'s first transparent marketplace. Zero middlemen.',
      h1: 'About Hub4Estate — India\'s First Transparent Electrical Products Platform',
      content: getAboutContent(),
    },
    '/contact': {
      title: 'Contact Hub4Estate — Best Prices on Electrical Products | +91 76900 01999',
      description: 'Contact Hub4Estate for electrical product inquiries, dealer registration, concierge service, or partnerships. Email: shreshth.agarwal@hub4estate.com | Phone: +91 76900 01999.',
      h1: 'Contact Hub4Estate',
      content: getContactContent(),
    },
  };

  const page = pageOverride || pages[path] || pages['/'];
  const keywords = 'Hub4Estate, Hub for Estate, Hub 4 Estate, hub4estate, hubforestate, best price electrical products India, buy electrical products online, verified electrical dealers, electrical procurement platform, wires cables LED switches MCB fans wholesale, IndiaMART alternative, JustDial alternative, Moglix alternative, Moblix alternative, Homelane alternative, construction electrical supplies, building materials, Havells, Polycab, Philips, Legrand, Anchor, Finolex, Syska, Crompton, Orient, Schneider, KEI, RR Kabel, V-Guard, Bajaj, Wipro, GM Modular, electrical dealer marketplace, concierge service, zero middlemen, real estate procurement, electrical shop online India, no broker electrical, construction editor, buy electrical Delhi, buy electrical Mumbai, buy electrical Bangalore, buy electrical Jaipur, buy electrical Pune, buy electrical Hyderabad, buy electrical Chennai, buy electrical Kolkata, buy electrical Ahmedabad, buy electrical Lucknow, electrical products Delhi NCR, electrical products Mumbai, electrical dealer near me, best electrical brand India, FRLS wire price, LED panel price, modular switch price, MCB price, ceiling fan price, wholesale electrical India, bulk electrical order, construction procurement platform, B2B electrical marketplace, B2C electrical marketplace';

  return `<!doctype html>
<html lang="en-IN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.title}</title>
  <meta name="description" content="${page.description}">
  <meta name="keywords" content="${keywords}">
  <meta name="author" content="Hub4Estate LLP">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <meta name="googlebot" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="https://hub4estate.com${path}">

  <meta name="geo.region" content="IN">
  <meta name="geo.placename" content="India">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Hub4Estate">
  <meta property="og:title" content="${page.title}">
  <meta property="og:description" content="${page.description}">
  <meta property="og:url" content="https://hub4estate.com${path}">
  <meta property="og:image" content="https://hub4estate.com/logos/hub4estate/logo-full.png">
  <meta property="og:locale" content="en_IN">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${page.title}">
  <meta name="twitter:description" content="${page.description}">
  <meta name="twitter:image" content="https://hub4estate.com/logos/hub4estate/logo-full.png">

  <script type="application/ld+json">
  ${JSON.stringify(getOrganizationSchema())}
  </script>
  <script type="application/ld+json">
  ${JSON.stringify(getWebSiteSchema())}
  </script>
  <script type="application/ld+json">
  ${JSON.stringify(getFAQSchema())}
  </script>
</head>
<body>
  <header>
    <nav>
      <a href="https://hub4estate.com/">Hub4Estate — Home</a> |
      <a href="https://hub4estate.com/for-buyers">For Buyers</a> |
      <a href="https://hub4estate.com/for-dealers">For Dealers</a> |
      <a href="https://hub4estate.com/categories">Categories</a> |
      <a href="https://hub4estate.com/about">About</a> |
      <a href="https://hub4estate.com/contact">Contact</a>
    </nav>
  </header>
  <main>
    <h1>${page.h1}</h1>
    ${page.content}
  </main>
  <footer>
    <p>&copy; 2026 HUB4ESTATE LLP. All rights reserved. LLPIN: ACW-4269</p>
    <p>8-D-12, Jawahar Nagar, Sriganganagar, Rajasthan 335001, India</p>
    <p>Email: <a href="mailto:shreshth.agarwal@hub4estate.com">shreshth.agarwal@hub4estate.com</a> | Phone: <a href="tel:+917690001999">+91 76900 01999</a></p>
    <nav>
      <a href="https://hub4estate.com/privacy">Privacy Policy</a> |
      <a href="https://hub4estate.com/terms">Terms of Service</a> |
      <a href="https://hub4estate.com/about">About Hub4Estate</a> |
      <a href="https://hub4estate.com/contact">Contact Us</a>
    </nav>
  </footer>
</body>
</html>`;
}

function getHomeContent(): string {
  return `
    <section>
      <h2>India's First Transparent Electrical Products Marketplace</h2>
      <p>Hub4Estate (also known as Hub for Estate, Hub 4 Estate, or H4E) is India's first transparent procurement platform for electrical products. We connect buyers directly with verified dealers — no middlemen, no markups, no hidden fees. Get the best price on every electrical product.</p>
      <p>Whether you're building a home, renovating an office, or managing a construction project — Hub4Estate gets you the lowest verified price on all electrical products. Our platform compares prices from 6+ verified dealers across India for every order.</p>
    </section>

    <section>
      <h2>Why Choose Hub4Estate Over IndiaMART, Moblix, or Homelane?</h2>
      <p>Unlike IndiaMART, Hub4Estate doesn't just list products — we actively compare prices from multiple verified dealers and show you the best offer. Unlike Moblix or Homelane, we're 100% focused on getting you the lowest price with full transparency.</p>
      <ul>
        <li><strong>Zero middlemen</strong> — direct connection with verified dealers</li>
        <li><strong>Save up to 40%</strong> — compared to retail and market prices</li>
        <li><strong>6+ dealers compared</strong> — per order, automatically</li>
        <li><strong>Concierge service</strong> — personal agent sources any product for you</li>
        <li><strong>No broker, no commission</strong> — transparent pricing always</li>
        <li><strong>Pan-India delivery</strong> — verified dealers across all major cities</li>
      </ul>
    </section>

    <section>
      <h2>Electrical Product Categories</h2>
      <p>Browse our complete range of electrical products at the best prices in India:</p>
      <ul>
        <li><a href="/categories/wires-cables">Wires & Cables</a> — FRLS, Copper, Multi-core wires from Havells, Polycab, Finolex at best prices</li>
        <li><a href="/categories/led-lighting">LED Lighting</a> — LED panels, bulbs, tube lights, strips from Philips, Syska, Wipro at wholesale prices</li>
        <li><a href="/categories/switches-sockets">Switches & Sockets</a> — Modular switches, smart switches from Legrand, Anchor, Havells at lowest prices</li>
        <li><a href="/categories/mcb-switchgear">MCBs & Switchgear</a> — MCBs, RCCBs, distribution boards from Schneider, Havells, L&T</li>
        <li><a href="/categories/fans-ventilation">Fans & Ventilation</a> — Ceiling fans, exhaust fans from Crompton, Orient, Havells</li>
        <li><a href="/categories/conduits-pipes">Conduits & Pipes</a> — PVC conduits, flexible pipes for electrical installations</li>
        <li><a href="/categories/inverters-ups">Inverters & UPS</a> — Home inverters, UPS systems, solar inverters</li>
        <li><a href="/categories/earthing-safety">Earthing & Safety</a> — Earthing rods, kits, safety equipment</li>
        <li><a href="/categories/distribution-boards">Distribution Boards</a> — Panel boards, bus bars, DB boxes</li>
        <li><a href="/categories/smart-home">Smart Home Electrical</a> — Smart switches, home automation</li>
      </ul>
    </section>

    <section>
      <h2>Concierge Service — We Source Any Product at the Best Price</h2>
      <p>Hub4Estate's concierge service assigns a dedicated personal agent to find the best price on ANY product — not just electricals. Whether you need furniture, appliances, construction materials, or specialized equipment, our team negotiates with verified suppliers and delivers the best deal within 24-48 hours.</p>
      <h3>How the Concierge Service Works:</h3>
      <ol>
        <li>Tell us what you need — product name, brand, quantity, budget</li>
        <li>A dedicated agent is assigned to your request</li>
        <li>We compare prices from multiple verified suppliers</li>
        <li>You receive the best offers with full transparency</li>
        <li>Confirm and get it delivered to your doorstep</li>
      </ol>
    </section>

    <section>
      <h2>Real Savings — Real Deals Closed on Hub4Estate</h2>
      <p>These are actual orders placed through Hub4Estate:</p>
      <ul>
        <li><strong>Sony Tower Speaker + 2 Mics</strong>: Croma price ₹1,05,000 → Hub4Estate price ₹68,000 — <strong>Saved ₹37,000 (35%)</strong></li>
        <li><strong>Philips 15W LED Panels (×200)</strong>: Dealer price ₹585/piece → Hub4Estate ₹465/piece — <strong>Saved ₹24,000 (20%)</strong></li>
        <li><strong>Sony LED Panels (×2)</strong>: Nearest dealer ₹280 → Hub4Estate ₹152 — <strong>Saved 46%</strong></li>
        <li><strong>FRLS 2.5mm² Cable (200m)</strong>: 6 dealers quoted ₹83–₹127/m → Hub4Estate got best at ₹83/m — <strong>Saved ₹8,800</strong></li>
      </ul>
    </section>

    <section>
      <h2>Brands Available on Hub4Estate</h2>
      <p>We work with all major electrical brands in India:</p>
      <p>Havells, Polycab, Philips, Legrand, Anchor (Panasonic), Finolex, Syska, Crompton, Orient Electric, Wipro Lighting, L&T, Schneider Electric, ABB, Siemens, KEI Industries, RR Kabel, V-Guard, Bajaj Electricals, GM Modular, Hager, C&S Electric, HPL Electric, Indo Asian, Standard Electricals</p>
    </section>

    <section>
      <h2>Who Uses Hub4Estate?</h2>
      <p>Hub4Estate is for ANYONE who wants the best price — not just contractors or builders:</p>
      <ul>
        <li><strong>Homeowners</strong> — building or renovating? Get the best price on all electrical products</li>
        <li><strong>Interior Designers</strong> — source switches, lights, fans at wholesale prices for your projects</li>
        <li><strong>Small Business Owners</strong> — office setup? Get bulk pricing on electrical fittings</li>
        <li><strong>Property Developers</strong> — procurement for apartments, villas, commercial projects</li>
        <li><strong>Electricians & Contractors</strong> — buy materials at dealer-direct prices</li>
        <li><strong>Architects & Engineers</strong> — specify and source at the best price</li>
        <li><strong>Anyone</strong> — buying a fan, LED light, or wire for home use? We get you the best deal</li>
      </ul>
    </section>

    <section>
      <h2>How Hub4Estate Works</h2>
      <ol>
        <li><strong>Tell us what you need</strong> — Search, upload a purchase slip, or speak in Hindi/English</li>
        <li><strong>We compare dealers</strong> — 6+ verified dealers compete to give you the best price</li>
        <li><strong>Pick the best price</strong> — Side-by-side comparison, transparent pricing, delivery included</li>
      </ol>
    </section>

    <section>
      <h2>Frequently Asked Questions about Hub4Estate</h2>
      <h3>What is Hub4Estate?</h3>
      <p>Hub4Estate is India's first transparent procurement platform for electrical products. We connect buyers directly with verified dealers — no middlemen, no markups.</p>

      <h3>Is Hub4Estate better than IndiaMART for electrical products?</h3>
      <p>Yes. Unlike IndiaMART, Hub4Estate actively compares prices from multiple dealers, verifies every dealer, and shows you the best offer transparently. Plus our concierge service negotiates on your behalf.</p>

      <h3>What is Hub4Estate's Concierge Service?</h3>
      <p>Our concierge assigns a dedicated agent who personally sources the best price on any product for you. Not limited to electricals — furniture, appliances, building materials, anything.</p>

      <h3>How much can I save on Hub4Estate?</h3>
      <p>Users save up to 40% compared to retail prices. Real examples: ₹37,000 saved on a speaker system, ₹24,000 saved on 200 LED panels, ₹8,800 saved on 200m of wire.</p>

      <h3>Is Hub4Estate available across India?</h3>
      <p>Yes! We serve buyers and connect dealers across India — Rajasthan, Delhi, Karnataka, Maharashtra, Gujarat, UP, Tamil Nadu, and all other states.</p>

      <h3>How is Hub4Estate different from Moblix or Homelane?</h3>
      <p>Hub4Estate focuses exclusively on transparent pricing and procurement. We compare prices from multiple dealers for every order. No hidden fees, no broker commissions. Our concierge service goes beyond what any other platform offers.</p>

      <h3>Does Hub4Estate work for construction and real estate projects?</h3>
      <p>Absolutely. Hub4Estate is perfect for construction electrical procurement, real estate project supplies, bulk orders for apartments and commercial buildings. We source from verified dealers at the best prices.</p>
    </section>
  `;
}

function getBuyerContent(): string {
  return `
    <section>
      <h2>Stop Overpaying for Electrical Products</h2>
      <p>Hub4Estate connects you directly with verified dealers — no middlemen, no markups. Get the best price on wires, cables, LED lights, switches, MCBs, fans, and every electrical product across India.</p>
      <p>Our platform compares 6+ dealer prices for every product and shows you the best offer. With our concierge service, a dedicated agent personally sources any product at the lowest price — not just electricals.</p>
    </section>
    <section>
      <h2>Hub4Estate Concierge Service</h2>
      <p>Need ANY product at the best price? Our concierge service assigns a real person to your request — not a chatbot. They source from verified suppliers, negotiate prices, and deliver the best deal within 24-48 hours.</p>
      <p>Works for: electrical products, furniture, appliances, building materials, office equipment, home decor, and more.</p>
    </section>
    <section>
      <h2>Real Savings for Real Buyers</h2>
      <p>Save up to 40% on every order. Real deals: Sony Speaker ₹68K vs ₹1.05L retail (saved ₹37,000), 200 Philips LED panels at ₹465 vs ₹585 dealer price (saved ₹24,000), FRLS cable at best-of-6-dealers price (saved ₹8,800).</p>
    </section>
  `;
}

function getDealerContent(): string {
  return `
    <section>
      <h2>Grow Your Electrical Business with Hub4Estate</h2>
      <p>Join India's fastest-growing electrical products marketplace. Hub4Estate sends you high-intent buyer leads matched to your product categories. No commission on sales. Simple subscription plans. Average 35% revenue increase for active dealers.</p>
    </section>
    <section>
      <h2>Why Dealers Choose Hub4Estate</h2>
      <ul>
        <li>High-intent, verified buyer leads — not cold inquiries</li>
        <li>Zero commission on your sales</li>
        <li>Verified Dealer badge builds instant trust</li>
        <li>Analytics dashboard to track performance</li>
        <li>Concierge leads — highest converting segment</li>
        <li>Pan-India buyer reach</li>
      </ul>
    </section>
    <section>
      <h2>Dealer Plans</h2>
      <p>Starter (Free): 10 leads/month, basic profile. Growth (₹2,999/mo): 50 leads, verified badge, priority listing, analytics. Enterprise (₹7,999/mo): Unlimited leads, featured placement, dedicated account manager.</p>
    </section>
  `;
}

function getCategoriesContent(): string {
  return `
    <section>
      <h2>All Electrical Product Categories</h2>
      <ul>
        <li><a href="/categories/wires-cables"><strong>Wires & Cables</strong></a> — FRLS wire, copper cables, multi-core cables, flexible wires. Brands: Havells, Polycab, Finolex, KEI, RR Kabel</li>
        <li><a href="/categories/led-lighting"><strong>LED Lighting</strong></a> — LED panel lights, bulbs, tube lights, strip lights, downlights. Brands: Philips, Syska, Wipro, Bajaj, Crompton</li>
        <li><a href="/categories/switches-sockets"><strong>Switches & Sockets</strong></a> — Modular switches, smart switches, sockets, dimmers. Brands: Legrand, Anchor, Havells, GM, Schneider</li>
        <li><a href="/categories/mcb-switchgear"><strong>MCBs & Switchgear</strong></a> — MCBs, RCCBs, isolators, changeover switches. Brands: Schneider, Havells, L&T, ABB, Siemens</li>
        <li><a href="/categories/fans-ventilation"><strong>Fans & Ventilation</strong></a> — Ceiling fans, exhaust fans, table fans, pedestal fans. Brands: Crompton, Orient, Havells, Bajaj, Usha</li>
        <li><a href="/categories/conduits-pipes"><strong>Conduits & Pipes</strong></a> — PVC conduits, flexible conduits, rigid pipes for electrical wiring</li>
        <li><a href="/categories/inverters-ups"><strong>Inverters & UPS</strong></a> — Home inverters, online UPS, solar inverters. Brands: Luminous, V-Guard, Microtek, Su-Kam</li>
        <li><a href="/categories/earthing-safety"><strong>Earthing & Safety</strong></a> — Earthing electrodes, safety switches, surge protectors, fire safety</li>
        <li><a href="/categories/distribution-boards"><strong>Distribution Boards</strong></a> — DB boxes, panel boards, bus bars, enclosures</li>
        <li><a href="/categories/smart-home"><strong>Smart Home Electrical</strong></a> — Smart switches, WiFi plugs, home automation, voice-controlled devices</li>
      </ul>
    </section>
  `;
}

function getAboutContent(): string {
  return `
    <section>
      <h2>Our Story</h2>
      <p>Hub4Estate was founded by Shreshth Agarwal after seeing his father — a real estate professional — drowning in broker calls, mismatched deals, and zero transparency. The same product was quoted at ₹1,05,000 by one dealer and sourced at ₹66,000 through another. It wasn't a communication problem — it was an access problem.</p>
      <p>After 2 years of validation (April 2024 – March 2026), speaking with contractors, builders, interior designers, and homeowners, Hub4Estate LLP was incorporated in March 2026. Starting with electricals — the most opaque, highest-repeat-demand category in construction procurement.</p>
    </section>
    <section>
      <h2>Company Details</h2>
      <p>HUB4ESTATE LLP | LLPIN: ACW-4269 | Incorporated: 17 March 2026</p>
      <p>Address: 8-D-12, Jawahar Nagar, Sriganganagar, Rajasthan 335001, India</p>
      <p>Founder: Shreshth Agarwal | Email: shreshth.agarwal@hub4estate.com | Phone: +91 76900 01999</p>
    </section>
  `;
}

function getContactContent(): string {
  return `
    <section>
      <h2>Get in Touch with Hub4Estate</h2>
      <p>Email: <a href="mailto:shreshth.agarwal@hub4estate.com">shreshth.agarwal@hub4estate.com</a></p>
      <p>Phone: <a href="tel:+917690001999">+91 76900 01999</a></p>
      <p>Address: 8-D-12, Jawahar Nagar, Sriganganagar, Ganganagar-335001, Rajasthan, India</p>
      <p>Business Hours: Monday – Saturday, 9:00 AM – 9:00 PM IST</p>
    </section>
  `;
}

function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Hub4Estate",
    "alternateName": ["Hub for Estate", "Hub 4 Estate", "HUB4ESTATE", "H4E", "hubforestate"],
    "url": "https://hub4estate.com",
    "logo": "https://hub4estate.com/logos/hub4estate/logo-full.png",
    "description": "India's first transparent procurement platform for electrical products. Best prices from verified dealers. Zero middlemen.",
    "foundingDate": "2026-03-17",
    "founder": { "@type": "Person", "name": "Shreshth Agarwal" },
    "address": { "@type": "PostalAddress", "streetAddress": "8-D-12, Jawahar Nagar", "addressLocality": "Sriganganagar", "addressRegion": "Rajasthan", "postalCode": "335001", "addressCountry": "IN" },
    "contactPoint": { "@type": "ContactPoint", "telephone": "+91-7690001999", "contactType": "customer service", "email": "shreshth.agarwal@hub4estate.com", "availableLanguage": ["English", "Hindi"], "areaServed": "IN" },
    "sameAs": ["https://www.linkedin.com/in/sa-h4e"],
    "knowsAbout": ["Electrical Products", "Wires", "Cables", "LED Lighting", "Switches", "MCB", "Fans", "Construction Materials", "Building Materials", "Real Estate Procurement", "B2B Marketplace", "B2C Marketplace"]
  };
}

function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Hub4Estate",
    "alternateName": ["Hub for Estate", "Hub 4 Estate"],
    "url": "https://hub4estate.com",
    "potentialAction": { "@type": "SearchAction", "target": { "@type": "EntryPoint", "urlTemplate": "https://hub4estate.com/categories?q={search_term_string}" }, "query-input": "required name=search_term_string" }
  };
}

function getFAQSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "What is Hub4Estate?", "acceptedAnswer": { "@type": "Answer", "text": "Hub4Estate is India's first transparent procurement platform for electrical products. We connect buyers directly with verified dealers — no middlemen, no markups. Save up to 40%." } },
      { "@type": "Question", "name": "How is Hub4Estate different from IndiaMART?", "acceptedAnswer": { "@type": "Answer", "text": "Unlike IndiaMART, Hub4Estate actively compares prices from multiple dealers, verifies every dealer, and shows you the best offer transparently. Plus our concierge service personally negotiates on your behalf. Zero middlemen, zero hidden fees." } },
      { "@type": "Question", "name": "What is Hub4Estate's Concierge Service?", "acceptedAnswer": { "@type": "Answer", "text": "Our concierge assigns a dedicated agent who personally sources the best price on any product for you. Not limited to electricals — furniture, appliances, building materials, anything. Quoted within 24-48 hours." } },
      { "@type": "Question", "name": "Is Hub4Estate for construction and real estate?", "acceptedAnswer": { "@type": "Answer", "text": "Yes! Hub4Estate is perfect for construction electrical procurement, real estate project supplies, and bulk orders. We source from verified dealers at the best prices. Also great for individual homeowners." } },
      { "@type": "Question", "name": "Does Hub4Estate replace brokers?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Hub4Estate eliminates middlemen and brokers completely. You connect directly with verified dealers. No broker commission, no hidden markups. 100% transparent pricing." } },
    ]
  };
}

/** City-specific SEO content for prerender */
function getCityContent(city: string): { title: string; description: string; h1: string; content: string } {
  const cityData: Record<string, { market: string; highlight: string }> = {
    delhi: { market: 'Bhagirath Palace', highlight: 'NCR construction boom, Noida/Gurgaon projects' },
    mumbai: { market: 'Lohar Chawl', highlight: 'BKC/Thane development, high-rise construction' },
    bangalore: { market: 'SP Road', highlight: 'IT corridor, Electronic City growth' },
    jaipur: { market: 'Johari Bazaar area', highlight: 'Smart City projects, tourism infrastructure' },
    pune: { market: 'Budhwar Peth', highlight: 'Hinjewadi IT hub, Pimpri-Chinchwad industrial growth' },
    hyderabad: { market: 'Begum Bazaar', highlight: 'HITEC City, Pharma City development' },
    chennai: { market: 'Parrys Corner/Broadway', highlight: 'OMR IT corridor, housing boom' },
    kolkata: { market: 'Chandni Chowk', highlight: 'Salt Lake IT hub, New Town development' },
    ahmedabad: { market: 'Raipur Gate', highlight: 'GIFT City, SG Highway corridor' },
    lucknow: { market: 'Aminabad/Chowk', highlight: 'Gomti Nagar, IT City, metro expansion' },
  };
  const info = cityData[city] || { market: 'local electrical market', highlight: 'growing construction activity' };
  const cityName = city.charAt(0).toUpperCase() + city.slice(1);
  return {
    title: `Buy Electrical Products in ${cityName} at Best Price | Hub4Estate — Verified Dealers, Zero Middlemen`,
    description: `Buy electrical products at best price in ${cityName}. Wires, LEDs, switches, MCBs, fans from Havells, Polycab, Philips, Legrand. Hub4Estate compares 6+ verified dealers in ${cityName}. Save up to 40%. Zero middlemen. Better than ${info.market} market prices.`,
    h1: `Buy Electrical Products in ${cityName} at Best Price — Hub4Estate`,
    content: `
      <section>
        <p>Hub4Estate gets you the lowest prices on electrical products in ${cityName}. Whether you're buying wires, LED lights, switches, MCBs, fans, or any electrical product — we compare 6+ verified dealers in ${cityName} and across India. Save up to 40% compared to ${info.market} market prices.</p>
        <p>${cityName} highlights: ${info.highlight}. Hub4Estate serves all ${cityName} areas with verified dealer pricing and delivery.</p>
      </section>
      <section>
        <h2>Electrical Categories Available in ${cityName}</h2>
        <ul>
          <li><a href="/categories/wires-cables">Wires & Cables</a> — Havells, Polycab, Finolex FRLS wires at best price in ${cityName}</li>
          <li><a href="/categories/led-lighting">LED Lighting</a> — Philips, Syska, Wipro LED panels and bulbs in ${cityName}</li>
          <li><a href="/categories/switches-sockets">Switches & Sockets</a> — Legrand, Anchor, Havells modular switches in ${cityName}</li>
          <li><a href="/categories/mcb-switchgear">MCBs & Switchgear</a> — Schneider, Havells, L&T MCBs in ${cityName}</li>
          <li><a href="/categories/fans-ventilation">Fans & Ventilation</a> — Crompton, Orient, Havells fans in ${cityName}</li>
        </ul>
      </section>
      <section>
        <h2>Why Buy on Hub4Estate in ${cityName}?</h2>
        <ul>
          <li>Compare 6+ verified dealers in ${cityName} automatically</li>
          <li>Save up to 40% vs retail and market prices</li>
          <li>Zero middlemen — direct dealer connection</li>
          <li>Concierge service — personal agent sources any product</li>
          <li>Better than IndiaMART, JustDial for ${cityName} electrical procurement</li>
        </ul>
      </section>
    `,
  };
}

/** Brand-specific SEO content for prerender */
function getBrandContent(brand: string): { title: string; description: string; h1: string; content: string } {
  const brandData: Record<string, { fullName: string; products: string; flagship: string }> = {
    havells: { fullName: 'Havells India', products: 'wires, switches, LEDs, fans, MCBs, water heaters', flagship: 'Lifeline Plus FRLS wires, Crabtree switches' },
    polycab: { fullName: 'Polycab India', products: 'wires, cables, switches, LEDs, fans', flagship: 'FRLF PVC wires, armoured cables' },
    philips: { fullName: 'Philips / Signify', products: 'LED panels, bulbs, tube lights, strip lights, smart lighting', flagship: '15W LED panels, Hue smart lighting' },
    legrand: { fullName: 'Legrand India', products: 'modular switches, sockets, MCBs, distribution boards', flagship: 'Mylinc, Myrius, Arteor switches' },
    anchor: { fullName: 'Anchor by Panasonic', products: 'switches, sockets, MCBs, wires', flagship: 'Roma, Rider, Ziva switches' },
    crompton: { fullName: 'Crompton Greaves', products: 'ceiling fans, exhaust fans, LEDs, pumps', flagship: 'HS Plus, Aura ceiling fans' },
    schneider: { fullName: 'Schneider Electric', products: 'MCBs, RCCBs, switches, distribution boards, contactors', flagship: 'Acti9 MCBs, Zencelo switches' },
    orient: { fullName: 'Orient Electric', products: 'ceiling fans, exhaust fans, LEDs, water heaters', flagship: 'Aeroquiet, Energy Star fans' },
  };
  const info = brandData[brand] || { fullName: brand, products: 'electrical products', flagship: 'various products' };
  const brandName = info.fullName;
  return {
    title: `Buy ${brandName} Products at Best Price in India | Hub4Estate — Verified Dealers`,
    description: `Buy ${brandName} ${info.products} at best price in India. Hub4Estate compares 6+ verified dealers. Save up to 40%. Zero middlemen. ${info.flagship} at wholesale prices.`,
    h1: `Buy ${brandName} Products at Best Price in India — Hub4Estate`,
    content: `
      <section>
        <p>Hub4Estate gets you the lowest prices on ${brandName} products — ${info.products}. We compare 6+ verified dealers for every order. Save up to 40% on ${brandName} products.</p>
        <p>Popular ${brandName} products: ${info.flagship}. All available at wholesale prices on Hub4Estate.</p>
      </section>
      <section>
        <h2>Why Buy ${brandName} on Hub4Estate?</h2>
        <ul>
          <li>Compare prices from 6+ verified ${brandName} dealers</li>
          <li>Save up to 40% vs retail MRP</li>
          <li>Zero middlemen — direct dealer pricing</li>
          <li>Better than IndiaMART, Amazon for ${brandName} products</li>
          <li>Concierge service for bulk or custom ${brandName} orders</li>
        </ul>
      </section>
    `,
  };
}

/** Competitor comparison SEO content */
function getComparisonContent(competitor: string): { title: string; description: string; h1: string; content: string } {
  const compData: Record<string, { name: string; weakness: string }> = {
    indiamart: { name: 'IndiaMART', weakness: 'just lists suppliers — no price comparison, no verification, lead fees' },
    justdial: { name: 'JustDial', weakness: 'only provides phone numbers — no pricing, no procurement workflow' },
    amazon: { name: 'Amazon', weakness: 'marketplace commission, no wholesale pricing, limited bulk support' },
    moglix: { name: 'Moglix', weakness: 'B2B only — Hub4Estate serves both B2B and B2C with concierge service' },
  };
  const info = compData[competitor] || { name: competitor, weakness: 'lacks transparent pricing and dealer verification' };
  return {
    title: `Hub4Estate vs ${info.name} — Which is Better for Electrical Products? | Honest Comparison`,
    description: `Hub4Estate vs ${info.name} comparison for electrical products. Hub4Estate compares 6+ verified dealers, zero middlemen, saves up to 40%. ${info.name} ${info.weakness}. See why Hub4Estate wins.`,
    h1: `Hub4Estate vs ${info.name} — Why Hub4Estate Wins for Electrical Products`,
    content: `
      <section>
        <p>Comparing Hub4Estate with ${info.name} for buying electrical products in India. ${info.name} ${info.weakness}.</p>
        <p>Hub4Estate compares 6+ verified dealers per order, provides transparent pricing, zero middlemen, and a concierge service that personally sources any product at the best price.</p>
      </section>
      <section>
        <h2>Hub4Estate vs ${info.name} — Key Differences</h2>
        <ul>
          <li><strong>Price Comparison</strong>: Hub4Estate compares 6+ dealers automatically. ${info.name} doesn't.</li>
          <li><strong>Dealer Verification</strong>: Every Hub4Estate dealer is GST-verified. ${info.name} has unverified listings.</li>
          <li><strong>Zero Middlemen</strong>: Hub4Estate connects directly. No broker fees.</li>
          <li><strong>Concierge Service</strong>: Hub4Estate assigns a personal agent for any product.</li>
          <li><strong>Transparent Pricing</strong>: See all dealer quotes side by side on Hub4Estate.</li>
        </ul>
      </section>
    `,
  };
}

/** Express middleware — intercept bot requests on frontend routes and serve SEO HTML */
export function seoPrerender(req: Request, res: Response, next: NextFunction): void {
  const userAgent = req.headers['user-agent'] || '';

  // Only intercept if it's a bot AND it's a frontend route (not /api/)
  if (!isBot(userAgent) || req.path.startsWith('/api/') || req.path.startsWith('/health')) {
    return next();
  }

  // Map the request path to an SEO page
  const seoRoutes = ['/', '/for-buyers', '/for-dealers', '/categories', '/about', '/contact'];
  const matchedPath = seoRoutes.find(route => req.path === route || req.path === route + '/');

  if (matchedPath) {
    const html = generateSEOPage(matchedPath);
    res.set('Content-Type', 'text/html');
    res.set('X-Prerendered', 'true');
    res.send(html);
    return;
  }

  // Category and product routes
  if (req.path.startsWith('/categories/') || req.path.startsWith('/products/')) {
    const html = generateSEOPage('/categories');
    res.set('Content-Type', 'text/html');
    res.set('X-Prerendered', 'true');
    res.send(html);
    return;
  }

  // City-specific SEO pages: /seo/electrical-products-{city}.html
  const cityMatch = req.path.match(/\/seo\/electrical-products-(\w+)\.html/);
  if (cityMatch) {
    const city = cityMatch[1];
    const page = getCityContent(city);
    const html = generateSEOPage('/', page);
    res.set('Content-Type', 'text/html');
    res.set('X-Prerendered', 'true');
    res.send(html);
    return;
  }

  // Brand-specific SEO pages: /seo/buy-{brand}-*.html
  const brandMatch = req.path.match(/\/seo\/buy-(\w+)-(?:products|led|switches|fans|mcb)\.html/);
  if (brandMatch) {
    const brand = brandMatch[1];
    const page = getBrandContent(brand);
    const html = generateSEOPage('/', page);
    res.set('Content-Type', 'text/html');
    res.set('X-Prerendered', 'true');
    res.send(html);
    return;
  }

  // Competitor comparison pages: /seo/hub4estate-vs-{competitor}.html
  const compMatch = req.path.match(/\/seo\/hub4estate-vs-(\w+)(?:-\w+)*\.html/);
  if (compMatch) {
    const comp = compMatch[1];
    const page = getComparisonContent(comp);
    const html = generateSEOPage('/', page);
    res.set('Content-Type', 'text/html');
    res.set('X-Prerendered', 'true');
    res.send(html);
    return;
  }

  // Other SEO content pages
  if (req.path.startsWith('/seo/')) {
    const html = generateSEOPage('/');
    res.set('Content-Type', 'text/html');
    res.set('X-Prerendered', 'true');
    res.send(html);
    return;
  }

  next();
}
