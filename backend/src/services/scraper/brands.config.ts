/**
 * Brand Scraping Configurations
 *
 * Each brand has specific selectors and URL patterns for scraping.
 * Selectors use CSS syntax with special attributes:
 * - @src = get src attribute
 * - @href = get href attribute
 * - @data-* = get data attribute
 * - text() = get text content (default)
 */

export interface BrandConfig {
  name: string;
  slug: string;
  website: string;
  logoUrl?: string;
  category: 'wires' | 'switches' | 'lighting' | 'solar' | 'automation' | 'multi';

  // URLs to start scraping
  catalogUrls: string[];

  // CSS selectors for scraping
  selectors: {
    // Product listing page
    productList: string; // Container for each product card
    productLink: string; // Link to product detail page
    productName?: string; // Product name on listing page
    productImage?: string; // Image on listing page
    pagination?: string; // Next page link

    // Product detail page
    detailName: string;
    detailImage: string;
    detailGallery?: string;
    detailDescription?: string;
    detailSpecsTable?: string;
    detailSpecRow?: string;
    detailSpecLabel?: string;
    detailSpecValue?: string;
    detailCategory?: string;
    detailSubCategory?: string;
    detailModelNumber?: string;
    detailSku?: string;
    detailPrice?: string;
    detailDatasheet?: string;
    detailManual?: string;
    detailCertifications?: string;
    detailWarranty?: string;
  };

  // Request configuration
  requestConfig?: {
    headers?: Record<string, string>;
    delay?: number; // ms between requests
    timeout?: number;
    userAgent?: string;
  };

  // URL transformation functions
  transforms?: {
    absoluteUrl?: (relativeUrl: string, baseUrl: string) => string;
    imageUrl?: (imageUrl: string) => string;
  };
}

// ============================================
// WIRES & CABLES
// ============================================

export const POLYCAB_CONFIG: BrandConfig = {
  name: 'Polycab',
  slug: 'polycab',
  website: 'https://www.polycab.com',
  logoUrl: 'https://www.polycab.com/assets/images/polycab-logo.svg',
  category: 'wires',
  catalogUrls: [
    'https://www.polycab.com/wires-cables/house-wires',
    'https://www.polycab.com/wires-cables/flexible-cables',
    'https://www.polycab.com/wires-cables/industrial-cables',
    'https://www.polycab.com/wires-cables/control-cables',
  ],
  selectors: {
    productList: '.product-list .product-item',
    productLink: 'a.product-link@href',
    productName: '.product-title',
    productImage: '.product-image img@src',
    pagination: '.pagination a.next@href',
    detailName: 'h1.product-title',
    detailImage: '.product-gallery .main-image img@src',
    detailGallery: '.product-gallery .thumbnail img@src',
    detailDescription: '.product-description',
    detailSpecsTable: '.specifications-table',
    detailSpecRow: 'tr',
    detailSpecLabel: 'td:first-child',
    detailSpecValue: 'td:last-child',
    detailCategory: '.breadcrumb li:nth-child(2)',
    detailSubCategory: '.breadcrumb li:nth-child(3)',
    detailDatasheet: 'a.download-datasheet@href',
  },
  requestConfig: {
    delay: 1500,
    timeout: 30000,
  },
};

export const FINOLEX_CONFIG: BrandConfig = {
  name: 'Finolex',
  slug: 'finolex',
  website: 'https://www.finolex.com',
  logoUrl: 'https://www.finolex.com/images/logo.png',
  category: 'wires',
  catalogUrls: [
    'https://www.finolex.com/products/cables/house-wires',
    'https://www.finolex.com/products/cables/industrial-cables',
    'https://www.finolex.com/products/cables/flexible-cables',
  ],
  selectors: {
    productList: '.product-grid .product-card',
    productLink: 'a.product-link@href',
    productName: '.product-name',
    productImage: '.product-img img@src',
    pagination: '.pagination .next@href',
    detailName: '.product-detail h1',
    detailImage: '.product-image img@src',
    detailDescription: '.product-description',
    detailSpecsTable: '.specifications',
    detailSpecRow: '.spec-row',
    detailSpecLabel: '.spec-label',
    detailSpecValue: '.spec-value',
    detailDatasheet: '.downloads a[href*=".pdf"]@href',
  },
  requestConfig: {
    delay: 2000,
  },
};

export const RR_KABEL_CONFIG: BrandConfig = {
  name: 'RR Kabel',
  slug: 'rr-kabel',
  website: 'https://www.rrkabel.com',
  logoUrl: 'https://www.rrkabel.com/assets/images/logo.png',
  category: 'wires',
  catalogUrls: [
    'https://www.rrkabel.com/products/wires',
    'https://www.rrkabel.com/products/cables',
    'https://www.rrkabel.com/products/industrial',
  ],
  selectors: {
    productList: '.products-container .product',
    productLink: 'a@href',
    productName: '.product-title',
    productImage: 'img@src',
    pagination: '.pagination a.next@href',
    detailName: 'h1.product-name',
    detailImage: '.product-image img@src',
    detailDescription: '.description',
    detailSpecsTable: '.technical-specs table',
    detailSpecRow: 'tr',
    detailSpecLabel: 'th',
    detailSpecValue: 'td',
  },
  requestConfig: {
    delay: 1500,
  },
};

export const KEI_CONFIG: BrandConfig = {
  name: 'KEI Industries',
  slug: 'kei',
  website: 'https://www.kei-ind.com',
  logoUrl: 'https://www.kei-ind.com/images/kei-logo.png',
  category: 'wires',
  catalogUrls: [
    'https://www.kei-ind.com/products/house-wires',
    'https://www.kei-ind.com/products/flexible-cables',
    'https://www.kei-ind.com/products/power-cables',
  ],
  selectors: {
    productList: '.product-listing .product-item',
    productLink: 'a.product-url@href',
    productName: '.name',
    productImage: '.image img@src',
    detailName: '.product-detail h1',
    detailImage: '.product-image img@src',
    detailDescription: '.product-description',
    detailSpecsTable: '.specifications-table',
    detailSpecRow: 'tr',
    detailSpecLabel: 'td.label',
    detailSpecValue: 'td.value',
  },
  requestConfig: {
    delay: 2000,
  },
};

export const VGUARD_CONFIG: BrandConfig = {
  name: 'V-Guard',
  slug: 'vguard',
  website: 'https://www.vguard.in',
  logoUrl: 'https://www.vguard.in/images/v-guard-logo.png',
  category: 'multi',
  catalogUrls: [
    'https://www.vguard.in/products/wires-and-cables',
    'https://www.vguard.in/products/switches-and-switchgears',
    'https://www.vguard.in/products/fans',
    'https://www.vguard.in/products/water-heaters',
  ],
  selectors: {
    productList: '.product-list .product',
    productLink: 'a@href',
    productName: '.product-name',
    productImage: '.product-image img@src',
    pagination: '.pagination .next@href',
    detailName: 'h1.product-title',
    detailImage: '.product-gallery img@src',
    detailDescription: '.product-description',
    detailSpecsTable: '.specifications',
    detailSpecRow: '.spec-item',
    detailSpecLabel: '.spec-label',
    detailSpecValue: '.spec-value',
    detailWarranty: '.warranty-info',
  },
  requestConfig: {
    delay: 1500,
  },
};

// ============================================
// SWITCHES & SWITCHGEAR
// ============================================

export const SCHNEIDER_CONFIG: BrandConfig = {
  name: 'Schneider Electric',
  slug: 'schneider',
  website: 'https://www.se.com/in',
  logoUrl: 'https://www.se.com/ww/resources/images/logo.png',
  category: 'switches',
  catalogUrls: [
    'https://www.se.com/in/en/product-category/6100-wiring-devices/',
    'https://www.se.com/in/en/product-category/5100-circuit-breakers-and-switches/',
    'https://www.se.com/in/en/product-category/6200-enclosures-and-accessories/',
  ],
  selectors: {
    productList: '.product-tile',
    productLink: 'a.product-tile-link@href',
    productName: '.product-tile-name',
    productImage: '.product-tile-image img@src',
    pagination: '.pagination__next@href',
    detailName: '.product-name h1',
    detailImage: '.product-image-gallery img@src',
    detailGallery: '.product-gallery-thumbnails img@src',
    detailDescription: '.product-description',
    detailSpecsTable: '.product-specifications',
    detailSpecRow: '.specification-row',
    detailSpecLabel: '.specification-label',
    detailSpecValue: '.specification-value',
    detailModelNumber: '.product-reference',
    detailDatasheet: 'a[href*="datasheet"]@href',
    detailCertifications: '.certifications span',
  },
  requestConfig: {
    delay: 2000,
    headers: {
      'Accept-Language': 'en-IN',
    },
  },
};

export const LEGRAND_CONFIG: BrandConfig = {
  name: 'Legrand',
  slug: 'legrand',
  website: 'https://www.legrand.co.in',
  logoUrl: 'https://www.legrand.co.in/sites/all/themes/legrand/logo.png',
  category: 'switches',
  catalogUrls: [
    'https://www.legrand.co.in/products/wiring-devices',
    'https://www.legrand.co.in/products/distribution-boards',
    'https://www.legrand.co.in/products/cable-management',
  ],
  selectors: {
    productList: '.product-list-item',
    productLink: 'a.product-link@href',
    productName: '.product-title',
    productImage: '.product-image img@src',
    pagination: '.pager__item--next a@href',
    detailName: 'h1.page-title',
    detailImage: '.product-image img@src',
    detailDescription: '.product-description',
    detailSpecsTable: '.technical-specifications',
    detailSpecRow: 'tr',
    detailSpecLabel: 'th',
    detailSpecValue: 'td',
    detailDatasheet: '.product-downloads a[href*=".pdf"]@href',
  },
  requestConfig: {
    delay: 1500,
  },
};

export const ANCHOR_CONFIG: BrandConfig = {
  name: 'Anchor (Panasonic)',
  slug: 'anchor',
  website: 'https://www.anchor-world.com',
  logoUrl: 'https://www.anchor-world.com/images/anchor-logo.png',
  category: 'switches',
  catalogUrls: [
    'https://www.anchor-world.com/products/switches',
    'https://www.anchor-world.com/products/sockets',
    'https://www.anchor-world.com/products/modular-plates',
    'https://www.anchor-world.com/products/mcb-rccb',
  ],
  selectors: {
    productList: '.product-grid .product-item',
    productLink: 'a@href',
    productName: '.product-name',
    productImage: '.product-image img@src',
    pagination: '.pagination .next@href',
    detailName: 'h1.product-title',
    detailImage: '.product-gallery .main-image img@src',
    detailDescription: '.product-description',
    detailSpecsTable: '.product-specifications table',
    detailSpecRow: 'tr',
    detailSpecLabel: 'td:first-child',
    detailSpecValue: 'td:last-child',
    detailModelNumber: '.product-code',
  },
  requestConfig: {
    delay: 1500,
  },
};

export const HAVELLS_CONFIG: BrandConfig = {
  name: 'Havells',
  slug: 'havells',
  website: 'https://www.havells.com',
  logoUrl: 'https://www.havells.com/images/havells-logo.png',
  category: 'multi',
  catalogUrls: [
    'https://www.havells.com/en/consumer/wires-and-cables.html',
    'https://www.havells.com/en/consumer/switchgear.html',
    'https://www.havells.com/en/consumer/lighting.html',
    'https://www.havells.com/en/consumer/fans.html',
    'https://www.havells.com/en/consumer/switches.html',
  ],
  selectors: {
    productList: '.product-listing .product-item',
    productLink: 'a.product-item-link@href',
    productName: '.product-item-name',
    productImage: '.product-image img@src',
    pagination: '.pages-item-next a@href',
    detailName: '.product-info h1',
    detailImage: '.gallery-placeholder img@src',
    detailGallery: '.fotorama__thumb img@src',
    detailDescription: '.product.description',
    detailSpecsTable: '.additional-attributes',
    detailSpecRow: 'tr',
    detailSpecLabel: 'th',
    detailSpecValue: 'td',
    detailPrice: '.product-info-price .price',
    detailDatasheet: 'a[href*="datasheet"]@href',
    detailWarranty: '.warranty-info',
  },
  requestConfig: {
    delay: 2000,
  },
};

export const ABB_CONFIG: BrandConfig = {
  name: 'ABB',
  slug: 'abb',
  website: 'https://new.abb.com/in',
  logoUrl: 'https://new.abb.com/images/abb-logo.png',
  category: 'switches',
  catalogUrls: [
    'https://new.abb.com/products/in/low-voltage/circuit-breakers-and-switches',
    'https://new.abb.com/products/in/low-voltage/wiring-accessories',
  ],
  selectors: {
    productList: '.product-list .product',
    productLink: 'a.product-link@href',
    productName: '.product-title',
    productImage: '.product-image img@src',
    detailName: 'h1.page-title',
    detailImage: '.product-image img@src',
    detailDescription: '.product-description',
    detailSpecsTable: '.specifications-table',
    detailSpecRow: 'tr',
    detailSpecLabel: 'th',
    detailSpecValue: 'td',
    detailDatasheet: 'a.download-link[href*=".pdf"]@href',
  },
  requestConfig: {
    delay: 2000,
  },
};

export const LT_ELECTRICAL_CONFIG: BrandConfig = {
  name: 'L&T Electrical',
  slug: 'lt-electrical',
  website: 'https://www.lntebg.com',
  category: 'switches',
  catalogUrls: [
    'https://www.lntebg.com/products/low-voltage/switchgear',
    'https://www.lntebg.com/products/low-voltage/mcbs',
  ],
  selectors: {
    productList: '.products-grid .product',
    productLink: 'a@href',
    productName: '.product-name',
    productImage: 'img@src',
    detailName: 'h1.product-title',
    detailImage: '.product-image img@src',
    detailDescription: '.product-description',
    detailSpecsTable: '.specifications',
    detailSpecRow: '.spec-row',
    detailSpecLabel: '.label',
    detailSpecValue: '.value',
  },
  requestConfig: {
    delay: 1500,
  },
};

// ============================================
// LIGHTING
// ============================================

export const PHILIPS_CONFIG: BrandConfig = {
  name: 'Philips (Signify)',
  slug: 'philips',
  website: 'https://www.lighting.philips.co.in',
  logoUrl: 'https://www.lighting.philips.co.in/images/philips-logo.png',
  category: 'lighting',
  catalogUrls: [
    'https://www.lighting.philips.co.in/consumer/led-lights',
    'https://www.lighting.philips.co.in/consumer/ceiling-lights',
    'https://www.lighting.philips.co.in/consumer/decorative-lights',
  ],
  selectors: {
    productList: '.product-list .product-tile',
    productLink: 'a.product-tile-link@href',
    productName: '.product-tile-title',
    productImage: '.product-tile-image img@src',
    pagination: '.pagination__next@href',
    detailName: 'h1.product-title',
    detailImage: '.product-gallery-main img@src',
    detailDescription: '.product-description',
    detailSpecsTable: '.product-specifications',
    detailSpecRow: '.specification',
    detailSpecLabel: '.spec-name',
    detailSpecValue: '.spec-value',
    detailPrice: '.product-price',
    detailWarranty: '.warranty',
  },
  requestConfig: {
    delay: 2000,
  },
};

export const SYSKA_CONFIG: BrandConfig = {
  name: 'Syska',
  slug: 'syska',
  website: 'https://www.syska.co.in',
  logoUrl: 'https://www.syska.co.in/images/syska-logo.png',
  category: 'lighting',
  catalogUrls: [
    'https://www.syska.co.in/led-bulbs',
    'https://www.syska.co.in/led-panels',
    'https://www.syska.co.in/led-downlights',
    'https://www.syska.co.in/led-battens',
  ],
  selectors: {
    productList: '.products-grid .product-item',
    productLink: 'a.product-link@href',
    productName: '.product-name',
    productImage: '.product-image img@src',
    pagination: '.pagination .next@href',
    detailName: 'h1.product-title',
    detailImage: '.product-image-main img@src',
    detailDescription: '.product-description',
    detailSpecsTable: '.product-specifications',
    detailSpecRow: '.spec-item',
    detailSpecLabel: '.spec-label',
    detailSpecValue: '.spec-value',
    detailPrice: '.product-price',
    detailWarranty: '.warranty-info',
  },
  requestConfig: {
    delay: 1500,
  },
};

export const CROMPTON_CONFIG: BrandConfig = {
  name: 'Crompton',
  slug: 'crompton',
  website: 'https://www.crompton.co.in',
  logoUrl: 'https://www.crompton.co.in/images/crompton-logo.png',
  category: 'multi',
  catalogUrls: [
    'https://www.crompton.co.in/lighting/led-lamps',
    'https://www.crompton.co.in/lighting/led-battens',
    'https://www.crompton.co.in/fans/ceiling-fans',
    'https://www.crompton.co.in/fans/table-fans',
  ],
  selectors: {
    productList: '.product-list .product',
    productLink: 'a.product-url@href',
    productName: '.product-title',
    productImage: '.product-image img@src',
    pagination: '.pagination .next@href',
    detailName: 'h1.product-name',
    detailImage: '.product-main-image img@src',
    detailDescription: '.product-description',
    detailSpecsTable: '.specifications-table',
    detailSpecRow: 'tr',
    detailSpecLabel: 'td.label',
    detailSpecValue: 'td.value',
    detailWarranty: '.warranty',
  },
  requestConfig: {
    delay: 1500,
  },
};

export const WIPRO_LIGHTING_CONFIG: BrandConfig = {
  name: 'Wipro Lighting',
  slug: 'wipro-lighting',
  website: 'https://www.wiprolighting.com',
  logoUrl: 'https://www.wiprolighting.com/images/wipro-logo.png',
  category: 'lighting',
  catalogUrls: [
    'https://www.wiprolighting.com/consumer/led-lamps',
    'https://www.wiprolighting.com/consumer/led-fixtures',
    'https://www.wiprolighting.com/consumer/smart-lighting',
  ],
  selectors: {
    productList: '.product-grid .product-card',
    productLink: 'a.product-link@href',
    productName: '.product-name',
    productImage: '.product-img img@src',
    pagination: '.pagination .next@href',
    detailName: 'h1.product-title',
    detailImage: '.product-gallery img@src',
    detailDescription: '.product-description',
    detailSpecsTable: '.technical-specs',
    detailSpecRow: '.spec-row',
    detailSpecLabel: '.spec-label',
    detailSpecValue: '.spec-value',
  },
  requestConfig: {
    delay: 1500,
  },
};

export const ORIENT_CONFIG: BrandConfig = {
  name: 'Orient Electric',
  slug: 'orient',
  website: 'https://www.orientelectric.com',
  logoUrl: 'https://www.orientelectric.com/images/orient-logo.png',
  category: 'multi',
  catalogUrls: [
    'https://www.orientelectric.com/fans/ceiling-fans',
    'https://www.orientelectric.com/fans/table-fans',
    'https://www.orientelectric.com/lighting/led-bulbs',
    'https://www.orientelectric.com/lighting/led-battens',
  ],
  selectors: {
    productList: '.products-container .product-item',
    productLink: 'a@href',
    productName: '.product-name',
    productImage: '.product-image img@src',
    pagination: '.pagination .next@href',
    detailName: 'h1.product-title',
    detailImage: '.product-gallery img@src',
    detailDescription: '.product-description',
    detailSpecsTable: '.specifications',
    detailSpecRow: '.spec-item',
    detailSpecLabel: '.spec-name',
    detailSpecValue: '.spec-value',
  },
  requestConfig: {
    delay: 1500,
  },
};

// ============================================
// SOLAR & POWER BACKUP
// ============================================

export const TATA_POWER_SOLAR_CONFIG: BrandConfig = {
  name: 'Tata Power Solar',
  slug: 'tata-power-solar',
  website: 'https://www.tatapowersolar.com',
  logoUrl: 'https://www.tatapowersolar.com/images/tata-logo.png',
  category: 'solar',
  catalogUrls: [
    'https://www.tatapowersolar.com/products/solar-panels',
    'https://www.tatapowersolar.com/products/solar-inverters',
    'https://www.tatapowersolar.com/products/solar-batteries',
  ],
  selectors: {
    productList: '.product-listing .product',
    productLink: 'a.product-link@href',
    productName: '.product-name',
    productImage: '.product-image img@src',
    detailName: 'h1.product-title',
    detailImage: '.product-image img@src',
    detailDescription: '.product-description',
    detailSpecsTable: '.specifications',
    detailSpecRow: '.spec-item',
    detailSpecLabel: '.label',
    detailSpecValue: '.value',
    detailDatasheet: 'a.datasheet@href',
  },
  requestConfig: {
    delay: 2000,
  },
};

export const LUMINOUS_CONFIG: BrandConfig = {
  name: 'Luminous',
  slug: 'luminous',
  website: 'https://www.luminousindia.com',
  logoUrl: 'https://www.luminousindia.com/images/luminous-logo.png',
  category: 'solar',
  catalogUrls: [
    'https://www.luminousindia.com/inverters',
    'https://www.luminousindia.com/batteries',
    'https://www.luminousindia.com/solar',
  ],
  selectors: {
    productList: '.product-grid .product-item',
    productLink: 'a.product-link@href',
    productName: '.product-name',
    productImage: '.product-image img@src',
    pagination: '.pagination .next@href',
    detailName: 'h1.product-title',
    detailImage: '.product-main-image img@src',
    detailDescription: '.product-description',
    detailSpecsTable: '.product-specifications',
    detailSpecRow: 'tr',
    detailSpecLabel: 'th',
    detailSpecValue: 'td',
    detailWarranty: '.warranty-info',
  },
  requestConfig: {
    delay: 1500,
  },
};

export const MICROTEK_CONFIG: BrandConfig = {
  name: 'Microtek',
  slug: 'microtek',
  website: 'https://www.microtekdirect.com',
  category: 'solar',
  catalogUrls: [
    'https://www.microtekdirect.com/inverters',
    'https://www.microtekdirect.com/batteries',
    'https://www.microtekdirect.com/solar-products',
  ],
  selectors: {
    productList: '.products .product-item',
    productLink: 'a@href',
    productName: '.product-title',
    productImage: '.product-image img@src',
    pagination: '.pagination .next@href',
    detailName: 'h1.product-name',
    detailImage: '.product-image img@src',
    detailDescription: '.description',
    detailSpecsTable: '.specifications table',
    detailSpecRow: 'tr',
    detailSpecLabel: 'td:first-child',
    detailSpecValue: 'td:last-child',
  },
  requestConfig: {
    delay: 1500,
  },
};

export const EXIDE_CONFIG: BrandConfig = {
  name: 'Exide',
  slug: 'exide',
  website: 'https://www.exideindustries.com',
  category: 'solar',
  catalogUrls: [
    'https://www.exideindustries.com/products/inverter-batteries',
    'https://www.exideindustries.com/products/solar-batteries',
  ],
  selectors: {
    productList: '.product-list .product',
    productLink: 'a.product-link@href',
    productName: '.product-name',
    productImage: '.product-image img@src',
    detailName: 'h1.product-title',
    detailImage: '.product-image img@src',
    detailDescription: '.product-description',
    detailSpecsTable: '.specifications',
    detailSpecRow: '.spec-row',
    detailSpecLabel: '.label',
    detailSpecValue: '.value',
    detailWarranty: '.warranty',
  },
  requestConfig: {
    delay: 2000,
  },
};

// ============================================
// ALL BRAND CONFIGS
// ============================================

export const ALL_BRAND_CONFIGS: BrandConfig[] = [
  // Wires & Cables
  POLYCAB_CONFIG,
  FINOLEX_CONFIG,
  RR_KABEL_CONFIG,
  KEI_CONFIG,
  VGUARD_CONFIG,
  HAVELLS_CONFIG,

  // Switches & Switchgear
  SCHNEIDER_CONFIG,
  LEGRAND_CONFIG,
  ANCHOR_CONFIG,
  ABB_CONFIG,
  LT_ELECTRICAL_CONFIG,

  // Lighting
  PHILIPS_CONFIG,
  SYSKA_CONFIG,
  CROMPTON_CONFIG,
  WIPRO_LIGHTING_CONFIG,
  ORIENT_CONFIG,

  // Solar & Power Backup
  TATA_POWER_SOLAR_CONFIG,
  LUMINOUS_CONFIG,
  MICROTEK_CONFIG,
  EXIDE_CONFIG,
];

// Get brand config by slug
export const getBrandConfig = (slug: string): BrandConfig | undefined => {
  return ALL_BRAND_CONFIGS.find(b => b.slug === slug);
};

// Get all brands by category
export const getBrandsByCategory = (category: BrandConfig['category']): BrandConfig[] => {
  return ALL_BRAND_CONFIGS.filter(b => b.category === category || b.category === 'multi');
};
