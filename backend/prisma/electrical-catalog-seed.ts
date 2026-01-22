/**
 * Hub4Estate - Complete Electrical Product Catalog Seed
 *
 * This file contains the comprehensive taxonomy for real-estate electrical procurement:
 * - 9 Main Categories
 * - 40+ Subcategories
 * - 50+ Brands with metadata
 * - Sample products for each category
 */

// ============================================
// BRAND DATA
// ============================================

export const brands = [
  // Wires & Cables Brands
  {
    name: 'Polycab',
    slug: 'polycab',
    logo: 'https://www.polycab.com/assets/images/logo.png',
    description: 'India\'s largest wires & cables manufacturer. Known for quality house wiring, industrial cables, and electrical products.',
    website: 'https://www.polycab.com',
    isPremium: true,
    priceSegment: 'Mid-range',
    qualityRating: 4.5,
  },
  {
    name: 'Finolex Cables',
    slug: 'finolex',
    logo: 'https://www.finolex.com/images/logo.png',
    description: 'Pioneer in Indian cable industry since 1958. Trusted for house wiring, communication cables, and automotive wires.',
    website: 'https://www.finolex.com',
    isPremium: true,
    priceSegment: 'Mid-range',
    qualityRating: 4.5,
  },
  {
    name: 'RR Kabel',
    slug: 'rr-kabel',
    logo: 'https://www.rrkabel.com/assets/images/logo.png',
    description: 'One of the fastest growing cable companies in India. Known for innovation in flame-retardant and specialty cables.',
    website: 'https://www.rrkabel.com',
    isPremium: false,
    priceSegment: 'Mid-range',
    qualityRating: 4.3,
  },
  {
    name: 'KEI Industries',
    slug: 'kei',
    logo: 'https://www.kei-ind.com/images/logo.png',
    description: 'Leading manufacturer of power cables, house wires, and stainless steel wires. Strong presence in infrastructure projects.',
    website: 'https://www.kei-ind.com',
    isPremium: false,
    priceSegment: 'Mid-range',
    qualityRating: 4.2,
  },
  {
    name: 'Havells',
    slug: 'havells',
    logo: 'https://www.havells.com/images/logo.svg',
    description: 'India\'s leading FMEG company. Complete range from wires, switches, lighting to fans and water heaters.',
    website: 'https://www.havells.com',
    isPremium: true,
    priceSegment: 'Premium',
    qualityRating: 4.7,
  },
  {
    name: 'V-Guard',
    slug: 'v-guard',
    logo: 'https://www.vguard.in/images/logo.png',
    description: 'South India\'s trusted brand for voltage stabilizers, wires, fans, and home appliances.',
    website: 'https://www.vguard.in',
    isPremium: false,
    priceSegment: 'Mid-range',
    qualityRating: 4.2,
  },
  {
    name: 'Universal Cables',
    slug: 'universal-cables',
    logo: null,
    description: 'Manufacturer of power cables, control cables, and instrumentation cables for industrial applications.',
    website: 'https://www.universalcables.net',
    isPremium: false,
    priceSegment: 'Budget',
    qualityRating: 3.8,
  },

  // Switchgear & Protection Brands
  {
    name: 'Schneider Electric',
    slug: 'schneider-electric',
    logo: 'https://www.se.com/in/assets/images/logo.svg',
    description: 'Global leader in energy management and automation. Premium switchgear, MCBs, and smart electrical solutions.',
    website: 'https://www.se.com/in',
    isPremium: true,
    priceSegment: 'Premium',
    qualityRating: 4.9,
  },
  {
    name: 'Legrand',
    slug: 'legrand',
    logo: 'https://www.legrandgroup.com/images/logo.svg',
    description: 'French multinational specializing in electrical and digital building infrastructure. Premium modular switches and wiring devices.',
    website: 'https://www.legrandgroup.com',
    isPremium: true,
    priceSegment: 'Premium',
    qualityRating: 4.8,
  },
  {
    name: 'ABB',
    slug: 'abb',
    logo: 'https://new.abb.com/images/logo.svg',
    description: 'Swiss-Swedish multinational. Industrial-grade switchgear, drives, and robotics. Premium quality.',
    website: 'https://new.abb.com/in',
    isPremium: true,
    priceSegment: 'Premium',
    qualityRating: 4.9,
  },
  {
    name: 'Siemens',
    slug: 'siemens',
    logo: 'https://new.siemens.com/images/logo.svg',
    description: 'German multinational. Industrial automation, switchgear, and smart infrastructure solutions.',
    website: 'https://new.siemens.com/in',
    isPremium: true,
    priceSegment: 'Premium',
    qualityRating: 4.8,
  },
  {
    name: 'L&T Electrical',
    slug: 'lnt-electrical',
    logo: 'https://www.lntebg.com/images/logo.png',
    description: 'Larsen & Toubro\'s electrical division. Trusted for industrial switchgear, MCCBs, and metering solutions.',
    website: 'https://www.lntebg.com',
    isPremium: true,
    priceSegment: 'Premium',
    qualityRating: 4.6,
  },
  {
    name: 'Hager',
    slug: 'hager',
    logo: 'https://www.hager.com/images/logo.svg',
    description: 'German brand specializing in electrical distribution, cable management, and building automation.',
    website: 'https://www.hager.com',
    isPremium: true,
    priceSegment: 'Premium',
    qualityRating: 4.5,
  },
  {
    name: 'C&S Electric',
    slug: 'cs-electric',
    logo: 'https://www.cnepl.com/images/logo.png',
    description: 'Part of Siemens Group. LV switchgear, busbar systems, and protection devices.',
    website: 'https://www.cnepl.com',
    isPremium: false,
    priceSegment: 'Mid-range',
    qualityRating: 4.3,
  },

  // Modular Switches Brands
  {
    name: 'Anchor by Panasonic',
    slug: 'anchor-panasonic',
    logo: 'https://www.lsin.panasonic.com/images/anchor-logo.png',
    description: 'India\'s most trusted switch brand, now part of Panasonic. Wide range of modular switches and accessories.',
    website: 'https://www.lsin.panasonic.com',
    isPremium: false,
    priceSegment: 'Mid-range',
    qualityRating: 4.4,
  },
  {
    name: 'Goldmedal Electricals',
    slug: 'goldmedal',
    logo: 'https://www.goldmedalindia.com/images/logo.png',
    description: 'Premium Indian brand known for designer switches, sockets, and wiring accessories.',
    website: 'https://www.goldmedalindia.com',
    isPremium: true,
    priceSegment: 'Premium',
    qualityRating: 4.5,
  },
  {
    name: 'GM Modular',
    slug: 'gm-modular',
    logo: null,
    description: 'Budget-friendly modular switches and accessories. Good value for basic installations.',
    website: null,
    isPremium: false,
    priceSegment: 'Budget',
    qualityRating: 3.8,
  },
  {
    name: 'Wipro Lighting',
    slug: 'wipro-lighting',
    logo: 'https://www.wiprolighting.com/images/logo.png',
    description: 'Part of Wipro group. LED lighting, smart lighting, and commercial lighting solutions.',
    website: 'https://www.wiprolighting.com',
    isPremium: false,
    priceSegment: 'Mid-range',
    qualityRating: 4.2,
  },

  // Lighting Brands
  {
    name: 'Philips (Signify)',
    slug: 'philips-signify',
    logo: 'https://www.signify.com/images/philips-logo.svg',
    description: 'Global leader in lighting. LED bulbs, professional lighting, and Philips Hue smart lighting.',
    website: 'https://www.signify.com',
    isPremium: true,
    priceSegment: 'Premium',
    qualityRating: 4.8,
  },
  {
    name: 'Syska LED',
    slug: 'syska',
    logo: 'https://www.syska.co.in/images/logo.png',
    description: 'Fast-growing Indian LED brand. Affordable LED bulbs, battens, and consumer electronics.',
    website: 'https://www.syska.co.in',
    isPremium: false,
    priceSegment: 'Budget',
    qualityRating: 4.0,
  },
  {
    name: 'Crompton',
    slug: 'crompton',
    logo: 'https://www.crompton.co.in/images/logo.svg',
    description: 'Heritage Indian brand. Fans, lighting, and pumps. Known for reliability and value.',
    website: 'https://www.crompton.co.in',
    isPremium: false,
    priceSegment: 'Mid-range',
    qualityRating: 4.3,
  },
  {
    name: 'Orient Electric',
    slug: 'orient-electric',
    logo: 'https://www.orientelectric.com/images/logo.png',
    description: 'Part of CK Birla Group. Fans, lighting, and home appliances. Strong presence in fans segment.',
    website: 'https://www.orientelectric.com',
    isPremium: false,
    priceSegment: 'Mid-range',
    qualityRating: 4.4,
  },

  // Power Backup Brands
  {
    name: 'Luminous',
    slug: 'luminous',
    logo: 'https://www.luminousindia.com/images/logo.png',
    description: 'India\'s leading power backup brand. Inverters, batteries, and solar solutions.',
    website: 'https://www.luminousindia.com',
    isPremium: true,
    priceSegment: 'Mid-range',
    qualityRating: 4.5,
  },
  {
    name: 'Microtek',
    slug: 'microtek',
    logo: 'https://www.microtekdirect.com/images/logo.png',
    description: 'Popular inverter and UPS brand. Good value for residential and small commercial use.',
    website: 'https://www.microtekdirect.com',
    isPremium: false,
    priceSegment: 'Budget',
    qualityRating: 4.0,
  },
  {
    name: 'Exide',
    slug: 'exide',
    logo: 'https://www.exideindustries.com/images/logo.png',
    description: 'India\'s largest battery manufacturer. Automotive and industrial batteries, inverter batteries.',
    website: 'https://www.exideindustries.com',
    isPremium: true,
    priceSegment: 'Mid-range',
    qualityRating: 4.6,
  },
  {
    name: 'Amaron',
    slug: 'amaron',
    logo: 'https://www.amararaja.com/images/amaron-logo.png',
    description: 'Part of Amara Raja Group. Premium batteries for automotive and inverter applications.',
    website: 'https://www.amararaja.com',
    isPremium: true,
    priceSegment: 'Premium',
    qualityRating: 4.7,
  },
  {
    name: 'APC by Schneider',
    slug: 'apc',
    logo: 'https://www.apc.com/images/logo.svg',
    description: 'Global leader in UPS and power protection. Premium solutions for IT and critical infrastructure.',
    website: 'https://www.apc.com',
    isPremium: true,
    priceSegment: 'Premium',
    qualityRating: 4.8,
  },

  // Tools Brands
  {
    name: 'Fluke',
    slug: 'fluke',
    logo: 'https://www.fluke.com/images/logo.svg',
    description: 'World leader in electronic test tools. Premium multimeters, clamp meters, and thermal cameras.',
    website: 'https://www.fluke.com',
    isPremium: true,
    priceSegment: 'Premium',
    qualityRating: 4.9,
  },
  {
    name: 'Bosch Professional',
    slug: 'bosch',
    logo: 'https://www.boschprofessional.com/images/logo.svg',
    description: 'German engineering excellence. Power tools, measuring tools, and accessories for professionals.',
    website: 'https://www.boschprofessional.com',
    isPremium: true,
    priceSegment: 'Premium',
    qualityRating: 4.8,
  },
  {
    name: 'Makita',
    slug: 'makita',
    logo: 'https://www.makita.in/images/logo.png',
    description: 'Japanese power tool manufacturer. Cordless tools, drills, and industrial equipment.',
    website: 'https://www.makita.in',
    isPremium: true,
    priceSegment: 'Premium',
    qualityRating: 4.7,
  },
  {
    name: 'Hilti',
    slug: 'hilti',
    logo: 'https://www.hilti.in/images/logo.svg',
    description: 'Premium construction tools and fastening systems. Professional-grade for heavy-duty use.',
    website: 'https://www.hilti.in',
    isPremium: true,
    priceSegment: 'Premium',
    qualityRating: 4.9,
  },
  {
    name: 'DeWalt',
    slug: 'dewalt',
    logo: 'https://www.dewalt.in/images/logo.svg',
    description: 'American power tool brand. Cordless tools, hand tools, and jobsite equipment.',
    website: 'https://www.dewalt.in',
    isPremium: true,
    priceSegment: 'Premium',
    qualityRating: 4.7,
  },
  {
    name: 'Stanley',
    slug: 'stanley',
    logo: 'https://www.stanleytools.com/images/logo.svg',
    description: 'Trusted hand tools and storage. Good value for professional and DIY use.',
    website: 'https://www.stanleytools.com',
    isPremium: false,
    priceSegment: 'Mid-range',
    qualityRating: 4.3,
  },

  // Air Conditioning Brands
  {
    name: 'Daikin',
    slug: 'daikin',
    logo: 'https://www.daikinindia.com/images/logo.png',
    description: 'Japanese AC manufacturer. Premium inverter ACs, VRF systems. Industry leader in energy efficiency.',
    website: 'https://www.daikinindia.com',
    isPremium: true,
    priceSegment: 'Premium',
    qualityRating: 4.9,
  },
  {
    name: 'LG',
    slug: 'lg',
    logo: 'https://www.lg.com/in/images/logo.png',
    description: 'Korean electronics giant. Dual inverter ACs, AI-powered cooling, wide range of capacities.',
    website: 'https://www.lg.com/in/air-conditioners',
    isPremium: true,
    priceSegment: 'Premium',
    qualityRating: 4.7,
  },
  {
    name: 'Samsung',
    slug: 'samsung',
    logo: 'https://www.samsung.com/in/images/logo.png',
    description: 'Digital inverter ACs with wind-free cooling technology. Smart connectivity features.',
    website: 'https://www.samsung.com/in/air-conditioners',
    isPremium: true,
    priceSegment: 'Premium',
    qualityRating: 4.6,
  },
  {
    name: 'Voltas',
    slug: 'voltas',
    logo: 'https://www.voltas.com/images/logo.png',
    description: 'Tata Group company. India\'s largest AC brand by market share. Good value and service network.',
    website: 'https://www.voltas.com',
    isPremium: false,
    priceSegment: 'Mid-range',
    qualityRating: 4.3,
  },
  {
    name: 'Blue Star',
    slug: 'blue-star',
    logo: 'https://www.bluestarindia.com/images/logo.png',
    description: 'Indian AC specialist. Commercial and residential ACs. Strong after-sales service.',
    website: 'https://www.bluestarindia.com',
    isPremium: false,
    priceSegment: 'Mid-range',
    qualityRating: 4.4,
  },
  {
    name: 'Carrier',
    slug: 'carrier',
    logo: 'https://www.carrier.com/images/logo.svg',
    description: 'American pioneer in air conditioning. Premium residential and commercial HVAC solutions.',
    website: 'https://www.carrier.com',
    isPremium: true,
    priceSegment: 'Premium',
    qualityRating: 4.7,
  },
  {
    name: 'Hitachi',
    slug: 'hitachi',
    logo: 'https://www.hitachiaircon.com/images/logo.png',
    description: 'Japanese quality. Tropical design ACs for Indian climate. Inverter and fixed speed options.',
    website: 'https://www.hitachiaircon.com',
    isPremium: true,
    priceSegment: 'Premium',
    qualityRating: 4.6,
  },
  {
    name: 'Mitsubishi Electric',
    slug: 'mitsubishi-electric',
    logo: 'https://www.mitsubishielectric.in/images/logo.png',
    description: 'Premium Japanese brand. VRF systems, ducted ACs, and high-end residential solutions.',
    website: 'https://www.mitsubishielectric.in',
    isPremium: true,
    priceSegment: 'Premium',
    qualityRating: 4.8,
  },
  {
    name: 'Lloyd',
    slug: 'lloyd',
    logo: 'https://www.mylloyd.com/images/logo.png',
    description: 'Havells subsidiary. Budget-friendly ACs with good features. Strong dealer network.',
    website: 'https://www.mylloyd.com',
    isPremium: false,
    priceSegment: 'Budget',
    qualityRating: 4.0,
  },
  {
    name: 'Godrej',
    slug: 'godrej-ac',
    logo: 'https://www.godrej.com/images/logo.png',
    description: 'Indian conglomerate. Eco-friendly ACs using green refrigerants. Good value proposition.',
    website: 'https://www.godrejappliances.com',
    isPremium: false,
    priceSegment: 'Mid-range',
    qualityRating: 4.2,
  },
];

// ============================================
// CATEGORY & SUBCATEGORY DATA
// ============================================

export const categories = [
  // 1. Wires & Cables
  {
    name: 'Wires & Cables',
    slug: 'wires-cables',
    description: 'House wiring, armoured cables, submersible cables, and communication cables for every electrical need.',
    icon: '⚡',
    sortOrder: 1,
    whatIsIt: 'Electrical wiring forms the nervous system of your building, carrying power safely from the distribution board to every outlet.',
    whereUsed: 'Throughout the building - main distribution, room circuits, AC points, kitchen appliances, outdoor lighting.',
    whyQualityMatters: 'Poor quality wiring is responsible for 70% of electrical fires in India. Good wiring lasts 25+ years; cheap wire fails in 5.',
    commonMistakes: 'Undersized wires for AC (use 4 sq mm, not 2.5), mixing copper-aluminum, skipping FRLS for safety, no color coding.',
    subCategories: [
      {
        name: 'House Wiring Cables',
        slug: 'house-wiring',
        description: 'FR/FRLS/ZHFR cables for indoor residential and commercial wiring. 0.75 to 6 sq mm.',
        sortOrder: 1,
      },
      {
        name: 'Armoured Cables',
        slug: 'armoured-cables',
        description: 'PVC/XLPE armoured cables for mains, underground, and outdoor installation. 1.5 to 400 sq mm.',
        sortOrder: 2,
      },
      {
        name: 'Fire-Resistant Cables (FRLS/ZHFR)',
        slug: 'fire-resistant-cables',
        description: 'Flame retardant, low smoke cables for high-rise buildings and commercial complexes.',
        sortOrder: 3,
      },
      {
        name: 'Flexible Cables',
        slug: 'flexible-cables',
        description: 'Multi-strand flexible cables for appliances, extension cords, and temporary connections.',
        sortOrder: 4,
      },
      {
        name: 'Submersible Cables',
        slug: 'submersible-cables',
        description: 'Water-resistant cables for borewell pumps and submersible motor applications.',
        sortOrder: 5,
      },
      {
        name: 'Solar PV Cables',
        slug: 'solar-cables',
        description: 'UV-resistant DC cables for solar panel installations. 4 to 10 sq mm.',
        sortOrder: 6,
      },
      {
        name: 'Communication Cables',
        slug: 'communication-cables',
        description: 'CAT5e, CAT6, coaxial cables for networking, CCTV, and TV distribution.',
        sortOrder: 7,
      },
      {
        name: 'Control Cables',
        slug: 'control-cables',
        description: 'Multi-core cables for automation, instrumentation, and control systems.',
        sortOrder: 8,
      },
    ],
  },

  // 2. Switchgear & Protection
  {
    name: 'Switchgear & Protection',
    slug: 'switchgear-protection',
    description: 'MCBs, RCCBs, MCCBs, distribution boards, and surge protection devices for complete circuit safety.',
    icon: '🔒',
    sortOrder: 2,
    whatIsIt: 'Protection devices that automatically disconnect power during faults, preventing fires, shocks, and appliance damage.',
    whereUsed: 'Main DB, sub-distribution boards, individual circuit points, heavy appliances like AC and geyser.',
    whyQualityMatters: 'Cheap MCBs fail to trip during faults - leading to fires and electrocution. ISI-marked quality MCBs save lives.',
    commonMistakes: 'Wrong MCB rating (too high = no protection), skipping RCCB entirely, no surge protection for electronics.',
    subCategories: [
      {
        name: 'MCB (Miniature Circuit Breakers)',
        slug: 'mcb',
        description: 'Overcurrent and short-circuit protection. B, C, D curves. 0.5A to 63A ratings.',
        sortOrder: 1,
      },
      {
        name: 'RCCB (Residual Current Circuit Breaker)',
        slug: 'rccb',
        description: 'Earth leakage protection. 30mA for personal safety, 100mA for equipment.',
        sortOrder: 2,
      },
      {
        name: 'RCBO (Combined MCB+RCCB)',
        slug: 'rcbo',
        description: 'Combined overcurrent and earth leakage protection in single device.',
        sortOrder: 3,
      },
      {
        name: 'MCCB (Molded Case Circuit Breaker)',
        slug: 'mccb',
        description: 'High-current protection for mains. 16A to 1600A. Adjustable trip settings.',
        sortOrder: 4,
      },
      {
        name: 'Distribution Boards',
        slug: 'distribution-boards',
        description: 'SPN/TPN/DP boards for organizing MCBs and RCCBs. 4 to 24 ways.',
        sortOrder: 5,
      },
      {
        name: 'Isolators & Changeovers',
        slug: 'isolators',
        description: 'Manual disconnection switches and generator changeover switches.',
        sortOrder: 6,
      },
      {
        name: 'Surge Protection Devices (SPD)',
        slug: 'spd',
        description: 'Type 1, 2, 3 surge protection for lightning and voltage spikes.',
        sortOrder: 7,
      },
      {
        name: 'Contactors & Relays',
        slug: 'contactors',
        description: 'Motor starters, power contactors, and control relays.',
        sortOrder: 8,
      },
      {
        name: 'Fuses & Fuse Holders',
        slug: 'fuses',
        description: 'HRC fuses, kit-kat fuses, and fuse carriers for older installations.',
        sortOrder: 9,
      },
    ],
  },

  // 3. Modular Switches & Sockets
  {
    name: 'Modular Switches & Sockets',
    slug: 'modular-switches',
    description: 'Premium modular switches, sockets, regulators, and plates for residential and commercial interiors.',
    icon: '🔌',
    sortOrder: 3,
    whatIsIt: 'Touch points where you interact with your electrical system daily. Available in 1M, 2M, 6M, 8M, 12M configurations.',
    whereUsed: 'Every room - near doors for switches, work areas for sockets, beds for USB charging points.',
    whyQualityMatters: 'You touch these 50+ times daily. Cheap switches spark, fail within 2 years, and can cause shocks.',
    commonMistakes: 'Insufficient socket points (plan 20% extra), wrong height placement, no USB points, buying based on looks only.',
    subCategories: [
      {
        name: 'Modular Switches',
        slug: 'modular-switches-items',
        description: '1-way, 2-way, intermediate switches. Bell push, indicator switches.',
        sortOrder: 1,
      },
      {
        name: 'Socket Outlets',
        slug: 'sockets',
        description: '6A, 16A, 20A sockets. USB sockets, universal sockets, shutter sockets.',
        sortOrder: 2,
      },
      {
        name: 'Fan Regulators',
        slug: 'fan-regulators',
        description: 'Electronic step regulators, rotary regulators for ceiling fans.',
        sortOrder: 3,
      },
      {
        name: 'Dimmers',
        slug: 'dimmers',
        description: 'LED-compatible dimmers for mood lighting. Touch and rotary types.',
        sortOrder: 4,
      },
      {
        name: 'Plates & Frames',
        slug: 'plates-frames',
        description: '1M to 18M cover plates. White, color, wood, metal finishes.',
        sortOrder: 5,
      },
      {
        name: 'Bell Push & Indicators',
        slug: 'bell-indicators',
        description: 'Door bell switches, DND indicators, night lamp indicators.',
        sortOrder: 6,
      },
      {
        name: 'Data & Communication',
        slug: 'data-communication',
        description: 'RJ45, RJ11, TV sockets, HDMI plates for structured cabling.',
        sortOrder: 7,
      },
      {
        name: 'Outdoor & Industrial Sockets',
        slug: 'outdoor-sockets',
        description: 'IP44/IP65 weatherproof sockets, industrial plugs, and sockets.',
        sortOrder: 8,
      },
    ],
  },

  // 4. Lighting & Luminaires
  {
    name: 'Lighting & Luminaires',
    slug: 'lighting',
    description: 'LED bulbs, panels, downlights, street lights, and decorative fixtures for every lighting need.',
    icon: '💡',
    sortOrder: 4,
    whatIsIt: 'Modern LED lighting that provides efficient illumination while consuming 80% less power than traditional bulbs.',
    whereUsed: 'Every space - ambient lighting for rooms, task lighting for work, accent lighting for aesthetics, safety lighting for exits.',
    whyQualityMatters: 'Quality LEDs last 25,000+ hours and maintain brightness. Cheap ones flicker, lose lumens, and fail in 2 years.',
    commonMistakes: 'Wrong color temperature (warm for bedrooms, cool for offices), inadequate lumens, no layered lighting plan.',
    subCategories: [
      {
        name: 'LED Bulbs',
        slug: 'led-bulbs',
        description: 'B22/E27 base bulbs. 5W to 30W. Warm white, cool white, daylight options.',
        sortOrder: 1,
      },
      {
        name: 'LED Battens & Tubes',
        slug: 'led-battens',
        description: 'Direct replacement for fluorescent tubes. 2ft, 4ft lengths.',
        sortOrder: 2,
      },
      {
        name: 'LED Panels',
        slug: 'led-panels',
        description: 'Surface and recessed panels for false ceiling. Round and square.',
        sortOrder: 3,
      },
      {
        name: 'Downlights & COB Lights',
        slug: 'downlights',
        description: 'Recessed ceiling lights. Fixed and adjustable COB spotlights.',
        sortOrder: 4,
      },
      {
        name: 'Track Lights & Spotlights',
        slug: 'track-lights',
        description: 'Accent lighting for retail, galleries, and display areas.',
        sortOrder: 5,
      },
      {
        name: 'Street & Outdoor Lights',
        slug: 'outdoor-lights',
        description: 'Street lights, flood lights, garden lights, wall-mounted lights.',
        sortOrder: 6,
      },
      {
        name: 'Decorative Fixtures',
        slug: 'decorative-lights',
        description: 'Chandeliers, pendants, wall sconces, designer fixtures.',
        sortOrder: 7,
      },
      {
        name: 'Emergency & Exit Lights',
        slug: 'emergency-lights',
        description: 'Battery backup lights, exit signs, emergency luminaires.',
        sortOrder: 8,
      },
      {
        name: 'Industrial Lighting',
        slug: 'industrial-lights',
        description: 'High bay lights, clean room lights, hazardous area lighting.',
        sortOrder: 9,
      },
    ],
  },

  // 5. Fans & Ventilation
  {
    name: 'Fans & Ventilation',
    slug: 'fans-ventilation',
    description: 'Ceiling fans, exhaust fans, BLDC fans, and industrial ventilation systems.',
    icon: '🌀',
    sortOrder: 5,
    whatIsIt: 'Air circulation devices that keep spaces comfortable and remove stale air, moisture, and odors.',
    whereUsed: 'Bedrooms and living rooms (ceiling fans), kitchens and bathrooms (exhaust), large halls (industrial fans).',
    whyQualityMatters: 'A good fan reduces AC usage by 30%. Bad fans are noisy, wobble, and consume 2x power. 5-star rating matters!',
    commonMistakes: 'Wrong blade size for room (48" for 150 sq ft), mounting too low (min 8 ft), ignoring energy rating.',
    subCategories: [
      {
        name: 'Ceiling Fans',
        slug: 'ceiling-fans',
        description: 'Standard 48"/56" fans. Decorative, anti-dust, under-light models.',
        sortOrder: 1,
      },
      {
        name: 'BLDC Ceiling Fans',
        slug: 'bldc-fans',
        description: 'Energy-efficient brushless DC motor fans. 28W-35W consumption.',
        sortOrder: 2,
      },
      {
        name: 'Exhaust Fans',
        slug: 'exhaust-fans',
        description: 'Kitchen, bathroom, and fresh air exhaust. 6" to 12" sizes.',
        sortOrder: 3,
      },
      {
        name: 'Pedestal & Table Fans',
        slug: 'pedestal-fans',
        description: 'Portable fans for spot cooling. High-speed models available.',
        sortOrder: 4,
      },
      {
        name: 'Wall Fans',
        slug: 'wall-fans',
        description: 'Wall-mounted fans for shops, offices, and semi-outdoor areas.',
        sortOrder: 5,
      },
      {
        name: 'Industrial Fans',
        slug: 'industrial-fans',
        description: 'High-volume air circulators for warehouses and factories.',
        sortOrder: 6,
      },
      {
        name: 'Ventilation Systems',
        slug: 'ventilation-systems',
        description: 'Inline duct fans, air handling units, heat recovery ventilators.',
        sortOrder: 7,
      },
    ],
  },

  // 6. Earthing & Safety
  {
    name: 'Earthing & Safety',
    slug: 'earthing-safety',
    description: 'Earth pits, earthing electrodes, lightning arrestors, and surge protection for building safety.',
    icon: '🛡️',
    sortOrder: 6,
    whatIsIt: 'Grounding systems that provide a safe path for fault current, preventing electric shocks and equipment damage.',
    whereUsed: 'Main earth pit near meter, body earthing for appliances, lightning protection on rooftops.',
    whyQualityMatters: 'Proper earthing is literally life-saving. Bad earthing kills people during faults and monsoons.',
    commonMistakes: 'Single earth pit instead of multiple, no maintenance schedule, using pipe earthing in rocky soil.',
    subCategories: [
      {
        name: 'Earthing Electrodes',
        slug: 'earthing-electrodes',
        description: 'GI pipe, copper plate, chemical earthing, maintenance-free electrodes.',
        sortOrder: 1,
      },
      {
        name: 'Earth Strips & Conductors',
        slug: 'earth-strips',
        description: 'Copper/GI strips for earth connection. Earth bars and busbars.',
        sortOrder: 2,
      },
      {
        name: 'Earthing Compounds',
        slug: 'earthing-compounds',
        description: 'Bentonite, charcoal, salt mixtures for reducing earth resistance.',
        sortOrder: 3,
      },
      {
        name: 'Lightning Arrestors',
        slug: 'lightning-arrestors',
        description: 'ESE terminals, conventional air terminals, down conductors.',
        sortOrder: 4,
      },
      {
        name: 'Earth Testing Equipment',
        slug: 'earth-testers',
        description: 'Earth resistance testers, clamp-on testers, soil resistivity meters.',
        sortOrder: 5,
      },
    ],
  },

  // 7. Power Backup & Solar
  {
    name: 'Power Backup & Solar',
    slug: 'power-backup',
    description: 'Inverters, UPS systems, batteries, and solar solutions for uninterrupted power.',
    icon: '🔋',
    sortOrder: 7,
    whatIsIt: 'Backup power systems that keep essential loads running during grid outages using batteries or solar.',
    whereUsed: 'Homes (inverter + battery), offices (online UPS), IT equipment (rack UPS), solar for long-term savings.',
    whyQualityMatters: 'Cheap inverters have poor waveform damaging motors. Bad batteries need replacement in 2 years vs 5 years.',
    commonMistakes: 'Undersizing inverter VA capacity, wrong battery type (tubular for long backup), no solar integration planning.',
    subCategories: [
      {
        name: 'Home Inverters',
        slug: 'home-inverters',
        description: 'Pure sine wave inverters. 600VA to 5KVA for residential use.',
        sortOrder: 1,
      },
      {
        name: 'UPS Systems',
        slug: 'ups',
        description: 'Online, offline, line-interactive UPS for computers and servers.',
        sortOrder: 2,
      },
      {
        name: 'Inverter Batteries',
        slug: 'inverter-batteries',
        description: 'Tubular, flat plate, SMF batteries. 80Ah to 220Ah.',
        sortOrder: 3,
      },
      {
        name: 'Lithium Batteries',
        slug: 'lithium-batteries',
        description: 'LiFePO4 batteries for solar and inverter applications.',
        sortOrder: 4,
      },
      {
        name: 'Solar Panels',
        slug: 'solar-panels',
        description: 'Mono/poly crystalline panels. 100W to 550W modules.',
        sortOrder: 5,
      },
      {
        name: 'Solar Inverters',
        slug: 'solar-inverters',
        description: 'On-grid, off-grid, and hybrid solar inverters.',
        sortOrder: 6,
      },
      {
        name: 'Solar Accessories',
        slug: 'solar-accessories',
        description: 'Mounting structures, MC4 connectors, DC cables, ACDB/DCDB.',
        sortOrder: 7,
      },
      {
        name: 'Voltage Stabilizers',
        slug: 'stabilizers',
        description: 'AC stabilizers, mainline stabilizers for entire home.',
        sortOrder: 8,
      },
    ],
  },

  // 8. Tools & Testers
  {
    name: 'Tools & Testers',
    slug: 'tools-testers',
    description: 'Multimeters, clamp meters, wire strippers, crimping tools, and installation accessories.',
    icon: '🔧',
    sortOrder: 8,
    whatIsIt: 'Professional-grade tools for electrical installation, testing, and maintenance work.',
    whereUsed: 'By electricians for installation, testing earth resistance, checking load, crimping lugs, and cable management.',
    whyQualityMatters: 'Quality tools ensure proper connections, accurate measurements, and safe working conditions.',
    commonMistakes: 'Using wrong lug sizes, cheap crimping tools causing loose connections, not testing before energizing.',
    subCategories: [
      {
        name: 'Multimeters',
        slug: 'multimeters',
        description: 'Digital/analog multimeters for voltage, current, resistance measurement.',
        sortOrder: 1,
      },
      {
        name: 'Clamp Meters',
        slug: 'clamp-meters',
        description: 'Non-contact current measurement. AC/DC clamp meters.',
        sortOrder: 2,
      },
      {
        name: 'Insulation Testers (Meggers)',
        slug: 'meggers',
        description: 'Insulation resistance testers for cable and motor testing.',
        sortOrder: 3,
      },
      {
        name: 'Wire Strippers & Cutters',
        slug: 'wire-strippers',
        description: 'Manual and automatic wire strippers, cable cutters.',
        sortOrder: 4,
      },
      {
        name: 'Crimping Tools',
        slug: 'crimping-tools',
        description: 'Lug crimpers, ferrule crimpers, hydraulic crimping tools.',
        sortOrder: 5,
      },
      {
        name: 'Screwdrivers & Pliers',
        slug: 'hand-tools',
        description: 'Insulated screwdrivers, combination pliers, nose pliers.',
        sortOrder: 6,
      },
      {
        name: 'Cable Lugs & Glands',
        slug: 'lugs-glands',
        description: 'Copper lugs, aluminum lugs, cable glands, thimbles.',
        sortOrder: 7,
      },
      {
        name: 'Conduits & Accessories',
        slug: 'conduits',
        description: 'PVC conduits, flexible conduits, junction boxes, accessories.',
        sortOrder: 8,
      },
      {
        name: 'Cable Ties & Markers',
        slug: 'cable-management',
        description: 'Nylon ties, cable markers, spiral wrapping, cable trays.',
        sortOrder: 9,
      },
    ],
  },

  // 9. Smart Electrical & Automation
  {
    name: 'Smart Electrical & Automation',
    slug: 'smart-electrical',
    description: 'Smart switches, sensors, home automation hubs, and energy monitoring devices.',
    icon: '🤖',
    sortOrder: 9,
    whatIsIt: 'Connected electrical devices that can be controlled via apps, voice, or automation schedules.',
    whereUsed: 'Smart homes, offices for energy management, security systems, and convenience.',
    whyQualityMatters: 'Cheap smart devices have security vulnerabilities and poor reliability. Invest in proven ecosystems.',
    commonMistakes: 'Mixing incompatible protocols, no neutral wire for smart switches, weak WiFi coverage.',
    subCategories: [
      {
        name: 'Smart Switches',
        slug: 'smart-switches',
        description: 'WiFi/Zigbee/Z-Wave enabled switches. Touch panels, scene controllers.',
        sortOrder: 1,
      },
      {
        name: 'Smart Plugs & Sockets',
        slug: 'smart-plugs',
        description: 'WiFi plugs for appliance control and energy monitoring.',
        sortOrder: 2,
      },
      {
        name: 'Smart Lighting',
        slug: 'smart-lighting',
        description: 'Color-changing bulbs, smart strips, tunable white fixtures.',
        sortOrder: 3,
      },
      {
        name: 'Motion & Occupancy Sensors',
        slug: 'motion-sensors',
        description: 'PIR sensors, microwave sensors for automatic lighting control.',
        sortOrder: 4,
      },
      {
        name: 'Home Automation Hubs',
        slug: 'automation-hubs',
        description: 'Central controllers for Zigbee, Z-Wave, and WiFi devices.',
        sortOrder: 5,
      },
      {
        name: 'Energy Monitors',
        slug: 'energy-monitors',
        description: 'Real-time power consumption monitors, smart meters.',
        sortOrder: 6,
      },
      {
        name: 'Smart Doorbells & Locks',
        slug: 'smart-security',
        description: 'Video doorbells, smart locks, access control systems.',
        sortOrder: 7,
      },
    ],
  },

  // 10. Air Conditioning & Climate Control
  {
    name: 'Air Conditioning & Climate Control',
    slug: 'air-conditioning',
    description: 'Split ACs, window ACs, inverter ACs, VRF systems, and climate control accessories.',
    icon: '❄️',
    sortOrder: 10,
    whatIsIt: 'Cooling and heating systems that regulate indoor temperature, humidity, and air quality for comfort.',
    whereUsed: 'Bedrooms, living rooms, offices, server rooms, commercial spaces, and industrial facilities.',
    whyQualityMatters: 'ACs run 8-12 hours daily in summer. Energy-efficient inverter ACs save 30-50% on electricity. Quality units last 15+ years.',
    commonMistakes: 'Undersized AC for room (calculate 1 ton per 100-120 sq ft), poor installation, skipping stabilizer, blocked outdoor unit.',
    subCategories: [
      {
        name: 'Split Air Conditioners',
        slug: 'split-ac',
        description: 'Wall-mounted split ACs. Fixed speed and inverter. 0.8 to 2.5 ton capacity.',
        sortOrder: 1,
      },
      {
        name: 'Window Air Conditioners',
        slug: 'window-ac',
        description: 'Self-contained window units. Economical option for single rooms. 0.75 to 2 ton.',
        sortOrder: 2,
      },
      {
        name: 'Inverter Air Conditioners',
        slug: 'inverter-ac',
        description: 'Variable speed compressor ACs. 5-star energy efficiency. 30-50% power savings.',
        sortOrder: 3,
      },
      {
        name: 'Cassette Air Conditioners',
        slug: 'cassette-ac',
        description: 'Ceiling-mounted cassette units for offices and commercial spaces. 2 to 5 ton.',
        sortOrder: 4,
      },
      {
        name: 'VRF/VRV Systems',
        slug: 'vrf-systems',
        description: 'Variable Refrigerant Flow systems for large buildings. Multi-zone climate control.',
        sortOrder: 5,
      },
      {
        name: 'Ducted Air Conditioning',
        slug: 'ducted-ac',
        description: 'Concealed ducted systems for whole-house or floor cooling. 3 to 20 ton capacity.',
        sortOrder: 6,
      },
      {
        name: 'Portable Air Conditioners',
        slug: 'portable-ac',
        description: 'Movable floor-standing units. No permanent installation required.',
        sortOrder: 7,
      },
      {
        name: 'AC Accessories & Parts',
        slug: 'ac-accessories',
        description: 'Copper piping, drain pipes, AC brackets, remote controls, filters.',
        sortOrder: 8,
      },
      {
        name: 'AC Stabilizers',
        slug: 'ac-stabilizers',
        description: 'Voltage stabilizers specifically designed for air conditioners. 1.5 to 5 KVA.',
        sortOrder: 9,
      },
    ],
  },
];

// ============================================
// SAMPLE PRODUCTS
// ============================================

export const sampleProducts = [
  // Wires & Cables
  {
    category: 'wires-cables',
    subCategory: 'house-wiring',
    brand: 'polycab',
    name: 'Polycab Optima Plus FR 1.5 sq mm House Wire',
    modelNumber: 'OPT-FR-1.5',
    description: 'Flame retardant (FR) house wiring cable. Ideal for lighting and fan circuits. ISI marked, 90m coil.',
    specifications: JSON.stringify({
      'Cross Section': '1.5 sq mm',
      'Conductor': 'Electrolytic Grade Copper',
      'Insulation': 'FR PVC',
      'Voltage Rating': '1100V',
      'Current Capacity': '14A',
      'Temperature Rating': '70°C',
      'Length': '90 meters',
      'Color Options': 'Red, Black, Blue, Green, Yellow',
    }),
    certifications: ['ISI', 'IEC 60227'],
    warrantyYears: 10,
  },
  {
    category: 'wires-cables',
    subCategory: 'house-wiring',
    brand: 'havells',
    name: 'Havells Lifeline Plus HRFR 2.5 sq mm Wire',
    modelNumber: 'LLFR-2.5',
    description: 'Heat resistant flame retardant wire for heavy-duty applications. Suitable for power circuits and AC connections.',
    specifications: JSON.stringify({
      'Cross Section': '2.5 sq mm',
      'Conductor': 'Annealed Copper',
      'Insulation': 'HRFR PVC',
      'Voltage Rating': '1100V',
      'Current Capacity': '18A',
      'Temperature Rating': '85°C',
      'Length': '90 meters',
    }),
    certifications: ['ISI', 'IEC 60227'],
    warrantyYears: 15,
  },
  {
    category: 'wires-cables',
    subCategory: 'house-wiring',
    brand: 'finolex',
    name: 'Finolex FR-LSH 4 sq mm Cable',
    modelNumber: 'FR-LSH-4',
    description: 'Fire retardant low smoke halogen-free cable for AC and geyser circuits. Recommended for high-rise buildings.',
    specifications: JSON.stringify({
      'Cross Section': '4 sq mm',
      'Conductor': 'Electrolytic Copper',
      'Insulation': 'FR-LSH Compound',
      'Voltage Rating': '1100V',
      'Current Capacity': '26A',
      'Temperature Rating': '90°C',
      'Length': '90 meters',
    }),
    certifications: ['ISI', 'IEC 60754', 'IEC 61034'],
    warrantyYears: 10,
  },

  // Switchgear
  {
    category: 'switchgear-protection',
    subCategory: 'mcb',
    brand: 'schneider-electric',
    name: 'Schneider Acti9 iC60N 16A MCB C-Curve',
    modelNumber: 'A9F44116',
    description: 'Premium miniature circuit breaker for lighting and general circuits. DIN rail mounting, 10kA breaking capacity.',
    specifications: JSON.stringify({
      'Current Rating': '16A',
      'Poles': 'Single Pole (SP)',
      'Curve Type': 'C',
      'Breaking Capacity': '10kA',
      'Mounting': 'DIN Rail 35mm',
      'Width': '18mm (1 module)',
      'Mechanical Life': '20,000 operations',
      'Electrical Life': '10,000 operations',
    }),
    certifications: ['ISI', 'IEC 60898-1', 'CE'],
    warrantyYears: 5,
  },
  {
    category: 'switchgear-protection',
    subCategory: 'rccb',
    brand: 'havells',
    name: 'Havells RCCB 63A 30mA RCCB Double Pole',
    modelNumber: 'RCCB-DP6330',
    description: 'Residual current circuit breaker for personal safety. 30mA sensitivity for shock protection.',
    specifications: JSON.stringify({
      'Current Rating': '63A',
      'Sensitivity': '30mA',
      'Poles': 'Double Pole (DP)',
      'Type': 'AC',
      'Breaking Capacity': '10kA',
      'Mounting': 'DIN Rail 35mm',
      'Width': '36mm (2 modules)',
      'Test Button': 'Yes',
    }),
    certifications: ['ISI', 'IEC 61008-1'],
    warrantyYears: 3,
  },
  {
    category: 'switchgear-protection',
    subCategory: 'distribution-boards',
    brand: 'legrand',
    name: 'Legrand Ekinox 8-Way SPN Distribution Board',
    modelNumber: 'EKX-SPN8',
    description: 'Single phase neutral distribution board with MCB/RCCB provision. Metal enclosure with IP43 rating.',
    specifications: JSON.stringify({
      'Ways': '8',
      'Type': 'SPN (Single Phase Neutral)',
      'Enclosure': 'Metal',
      'IP Rating': 'IP43',
      'Busbar': '100A rated',
      'Door': 'Transparent',
      'Mounting': 'Surface/Flush',
    }),
    certifications: ['ISI', 'IEC 61439-3'],
    warrantyYears: 2,
  },

  // Modular Switches
  {
    category: 'modular-switches',
    subCategory: 'modular-switches-items',
    brand: 'anchor-panasonic',
    name: 'Anchor Roma Classic 6A 1-Way Switch',
    modelNumber: 'RC-SW-6A-1W',
    description: 'Classic white modular switch with silver rocker. Fits standard 1M plate cutout.',
    specifications: JSON.stringify({
      'Current Rating': '6A',
      'Type': '1-Way',
      'Module Size': '1M',
      'Color': 'White with Silver Rocker',
      'Terminal': 'Screw Type',
      'Mechanical Life': '100,000 operations',
    }),
    certifications: ['ISI'],
    warrantyYears: 5,
  },
  {
    category: 'modular-switches',
    subCategory: 'sockets',
    brand: 'legrand',
    name: 'Legrand Mylinc 16A 3-Pin Socket with Shutter',
    modelNumber: 'MLN-16A-3P',
    description: 'Heavy-duty socket for AC, geyser, and high-power appliances. Child-safe shutter mechanism.',
    specifications: JSON.stringify({
      'Current Rating': '16A',
      'Pin Configuration': '3-Pin (L, N, E)',
      'Module Size': '2M',
      'Shutter': 'Yes',
      'Color': 'White',
      'Terminal': 'Quick Connect',
    }),
    certifications: ['ISI'],
    warrantyYears: 5,
  },
  {
    category: 'modular-switches',
    subCategory: 'fan-regulators',
    brand: 'havells',
    name: 'Havells Pearlz Electronic Fan Regulator',
    modelNumber: 'PZ-EFR-WH',
    description: 'Electronic step regulator for ceiling fans. Silent operation, energy-efficient.',
    specifications: JSON.stringify({
      'Type': 'Electronic Step',
      'Steps': '5',
      'Module Size': '1M',
      'Max Load': '120W',
      'Color': 'White',
      'Noise': 'Silent',
    }),
    certifications: ['ISI'],
    warrantyYears: 2,
  },

  // Lighting
  {
    category: 'lighting',
    subCategory: 'led-bulbs',
    brand: 'philips-signify',
    name: 'Philips Stellar Bright 12W LED Bulb B22',
    modelNumber: 'SB-12W-B22-CDL',
    description: 'High lumen output LED bulb. Cool daylight 6500K. Ideal for living rooms and work areas.',
    specifications: JSON.stringify({
      'Wattage': '12W',
      'Lumen Output': '1200 lm',
      'Color Temperature': '6500K (Cool Daylight)',
      'Base': 'B22',
      'Beam Angle': '180°',
      'Life': '15,000 hours',
      'Dimmable': 'No',
    }),
    certifications: ['BIS', 'Energy Star'],
    warrantyYears: 2,
  },
  {
    category: 'lighting',
    subCategory: 'led-panels',
    brand: 'havells',
    name: 'Havells Trim NXT 18W Round LED Panel',
    modelNumber: 'TNXT-18W-RD-WW',
    description: 'Surface-mounted LED panel for false ceilings. Warm white for bedrooms and living areas.',
    specifications: JSON.stringify({
      'Wattage': '18W',
      'Shape': 'Round',
      'Size': '8 inch (200mm)',
      'Color Temperature': '3000K (Warm White)',
      'Lumen Output': '1440 lm',
      'Mounting': 'Surface',
      'Cut-out': 'Not required',
    }),
    certifications: ['BIS'],
    warrantyYears: 2,
  },
  {
    category: 'lighting',
    subCategory: 'downlights',
    brand: 'crompton',
    name: 'Crompton Star Domestic 10W COB Downlight',
    modelNumber: 'STDOM-10W-COB',
    description: 'Recessed COB downlight for false ceilings. Focused beam for accent lighting.',
    specifications: JSON.stringify({
      'Wattage': '10W',
      'Type': 'COB (Chip on Board)',
      'Color Temperature': '4000K (Neutral White)',
      'Lumen Output': '800 lm',
      'Beam Angle': '60°',
      'Cut-out': '90mm',
      'Depth': '50mm',
    }),
    certifications: ['BIS'],
    warrantyYears: 2,
  },

  // Fans
  {
    category: 'fans-ventilation',
    subCategory: 'ceiling-fans',
    brand: 'havells',
    name: 'Havells Pacer 1200mm Ceiling Fan',
    modelNumber: 'PACER-1200-BRN',
    description: 'Classic ceiling fan with powerful air delivery. Double ball bearing for silent operation.',
    specifications: JSON.stringify({
      'Sweep': '1200mm (48")',
      'Speed': '370 RPM',
      'Air Delivery': '230 CMM',
      'Power': '75W',
      'Color': 'Brown',
      'Bearing': 'Double Ball',
      'Star Rating': '2 Star',
    }),
    certifications: ['BIS', 'BEE Star'],
    warrantyYears: 2,
  },
  {
    category: 'fans-ventilation',
    subCategory: 'bldc-fans',
    brand: 'orient-electric',
    name: 'Orient Aeroquiet BLDC 1200mm Ceiling Fan',
    modelNumber: 'AERQ-BLDC-1200',
    description: 'Energy-efficient BLDC fan with remote control. Consumes only 28W at full speed.',
    specifications: JSON.stringify({
      'Sweep': '1200mm (48")',
      'Speed': '350 RPM',
      'Air Delivery': '230 CMM',
      'Power': '28W',
      'Motor': 'BLDC',
      'Remote': 'Yes (with Timer)',
      'Star Rating': '5 Star',
    }),
    certifications: ['BIS', 'BEE 5 Star'],
    warrantyYears: 3,
  },
  {
    category: 'fans-ventilation',
    subCategory: 'exhaust-fans',
    brand: 'crompton',
    name: 'Crompton Brisk Air 6" Exhaust Fan',
    modelNumber: 'BA-6-EXH',
    description: 'Compact exhaust fan for bathrooms and small kitchens. Low noise operation.',
    specifications: JSON.stringify({
      'Size': '6 inch (150mm)',
      'Air Delivery': '6.5 CMM',
      'Speed': '2100 RPM',
      'Power': '20W',
      'Mounting': 'Wall/Window',
      'Noise Level': '45 dB',
    }),
    certifications: ['BIS'],
    warrantyYears: 2,
  },

  // Power Backup
  {
    category: 'power-backup',
    subCategory: 'home-inverters',
    brand: 'luminous',
    name: 'Luminous Zelio+ 1100VA Pure Sine Wave Inverter',
    modelNumber: 'ZELIO-1100',
    description: 'Pure sine wave inverter for home use. Supports 1 battery, suitable for 3-4 fans + lights + TV.',
    specifications: JSON.stringify({
      'Capacity': '1100VA / 900W',
      'Waveform': 'Pure Sine Wave',
      'Battery': '1 x 12V (100-220Ah)',
      'Charging Current': '15A',
      'Transfer Time': '<10ms',
      'Display': 'LCD',
      'Protection': 'Overload, Short Circuit, Deep Discharge',
    }),
    certifications: ['BIS'],
    warrantyYears: 2,
  },
  {
    category: 'power-backup',
    subCategory: 'inverter-batteries',
    brand: 'exide',
    name: 'Exide Inva Master 150Ah Tall Tubular Battery',
    modelNumber: 'IMTT-150',
    description: 'Tall tubular battery for long backup. Ideal for areas with frequent power cuts.',
    specifications: JSON.stringify({
      'Capacity': '150Ah',
      'Type': 'Tall Tubular',
      'Voltage': '12V',
      'Dimensions': '505 x 188 x 410 mm',
      'Weight': '53 kg',
      'Electrolyte': 'Lead Acid',
      'Backup': '4-6 hours (depending on load)',
    }),
    certifications: ['BIS'],
    warrantyYears: 5,
  },
  {
    category: 'power-backup',
    subCategory: 'ups',
    brand: 'apc',
    name: 'APC Back-UPS 1100VA 230V',
    modelNumber: 'BX1100C-IN',
    description: 'Computer UPS with AVR and USB charging. Protects PC from power surges and outages.',
    specifications: JSON.stringify({
      'Capacity': '1100VA / 660W',
      'Topology': 'Line Interactive',
      'Outlets': '6 (4 Battery + 2 Surge)',
      'USB Ports': '1',
      'Runtime': '5 min at full load',
      'AVR': 'Yes (140-300V)',
      'Form Factor': 'Tower',
    }),
    certifications: ['BIS', 'CE'],
    warrantyYears: 2,
  },

  // Tools
  {
    category: 'tools-testers',
    subCategory: 'multimeters',
    brand: 'fluke',
    name: 'Fluke 117 True RMS Digital Multimeter',
    modelNumber: 'FLUKE-117',
    description: 'Professional multimeter for electricians. True RMS, non-contact voltage detection, AutoVolt.',
    specifications: JSON.stringify({
      'DC Voltage': '0.1mV to 600V',
      'AC Voltage': '0.1mV to 600V (True RMS)',
      'DC Current': '0.01mA to 10A',
      'Resistance': '0.1Ω to 40MΩ',
      'Capacitance': '1nF to 10,000µF',
      'Features': 'AutoVolt, VoltAlert, Min/Max',
      'Safety': 'CAT III 600V',
    }),
    certifications: ['CE', 'UL'],
    warrantyYears: 3,
  },
  {
    category: 'tools-testers',
    subCategory: 'clamp-meters',
    brand: 'fluke',
    name: 'Fluke 323 True RMS Clamp Meter',
    modelNumber: 'FLUKE-323',
    description: 'Compact clamp meter for current measurement without circuit interruption.',
    specifications: JSON.stringify({
      'AC Current': '0.1A to 400A (True RMS)',
      'AC Voltage': '0.1V to 600V',
      'DC Voltage': '0.1V to 600V',
      'Resistance': '0.1Ω to 4kΩ',
      'Jaw Opening': '30mm',
      'Safety': 'CAT III 600V, CAT IV 300V',
    }),
    certifications: ['CE', 'UL'],
    warrantyYears: 2,
  },
  {
    category: 'tools-testers',
    subCategory: 'crimping-tools',
    brand: 'stanley',
    name: 'Stanley 84-868 Crimping Plier 1.5-6mm',
    modelNumber: '84-868',
    description: 'Professional crimping tool for insulated terminals. Comfortable grip, precise crimping.',
    specifications: JSON.stringify({
      'Wire Range': '1.5 to 6 sq mm',
      'Terminal Types': 'Insulated Ring, Spade, Butt',
      'Length': '9 inch (225mm)',
      'Material': 'Carbon Steel',
      'Handle': 'Bi-material grip',
    }),
    certifications: ['VDE'],
    warrantyYears: 1,
  },

  // Smart Electrical
  {
    category: 'smart-electrical',
    subCategory: 'smart-switches',
    brand: 'schneider-electric',
    name: 'Schneider Wiser 4-Gang Smart Switch',
    modelNumber: 'WISER-4G-WH',
    description: 'WiFi-enabled smart switch with voice control. Works with Alexa, Google Home.',
    specifications: JSON.stringify({
      'Gangs': '4',
      'Connectivity': 'WiFi 2.4GHz',
      'Max Load': '6A per gang',
      'Voice Control': 'Alexa, Google Assistant',
      'App': 'Wiser by SE',
      'Neutral Required': 'Yes',
      'Color': 'White',
    }),
    certifications: ['BIS', 'CE', 'FCC'],
    warrantyYears: 2,
  },
  {
    category: 'smart-electrical',
    subCategory: 'smart-plugs',
    brand: 'philips-signify',
    name: 'Philips Hue Smart Plug',
    modelNumber: 'HUE-PLUG-IN',
    description: 'Smart plug for converting any lamp into smart lighting. Works with Hue ecosystem.',
    specifications: JSON.stringify({
      'Max Load': '2300W',
      'Connectivity': 'Zigbee (requires Hue Bridge)',
      'Voice Control': 'Alexa, Google, Siri',
      'App': 'Philips Hue',
      'Scheduling': 'Yes',
      'Away Mode': 'Yes',
    }),
    certifications: ['CE', 'FCC'],
    warrantyYears: 2,
  },
  {
    category: 'smart-electrical',
    subCategory: 'motion-sensors',
    brand: 'legrand',
    name: 'Legrand Arteor Motion Sensor Switch',
    modelNumber: 'ART-PIR-WH',
    description: 'PIR motion sensor for automatic lighting control. Wall-mounted, adjustable sensitivity.',
    specifications: JSON.stringify({
      'Detection': 'PIR (Passive Infrared)',
      'Range': '8m at 180°',
      'Time Delay': '10s to 7 min (adjustable)',
      'Lux Level': '3 to 2000 lux',
      'Max Load': '300W LED / 1200W Incandescent',
      'Module Size': '2M',
    }),
    certifications: ['CE'],
    warrantyYears: 2,
  },
];

// ============================================
// KNOWLEDGE ARTICLES
// ============================================

export const knowledgeArticles = [
  {
    title: 'Complete Guide to House Wiring: Choosing the Right Cable Size',
    slug: 'house-wiring-cable-size-guide',
    category: 'Wires & Cables',
    content: `
# Complete Guide to House Wiring Cable Sizes

Choosing the right wire size is critical for electrical safety. This guide covers everything you need to know.

## Standard Wire Sizes for Home

| Circuit Type | Wire Size | Typical MCB |
|-------------|-----------|-------------|
| Lighting | 1.0 - 1.5 sq mm | 6A |
| Fan circuits | 1.5 sq mm | 6A |
| Power sockets (5A) | 1.5 - 2.5 sq mm | 10A |
| Power sockets (15A) | 2.5 sq mm | 16A |
| AC (1.5 ton) | 4 sq mm | 20A |
| AC (2 ton) | 6 sq mm | 32A |
| Geyser | 4 sq mm | 20A |
| Mains | 6 - 10 sq mm | 32-63A |

## Color Coding (Indian Standard)

- **Red/Brown**: Phase (Live)
- **Black**: Neutral
- **Green/Yellow**: Earth

## Key Considerations

1. **FRLS vs FR**: Use FRLS (Low Smoke) for high-rise buildings
2. **Copper vs Aluminum**: Always use copper for house wiring
3. **Voltage Drop**: Keep below 3% for long runs

## Common Mistakes to Avoid

- Using 2.5 sq mm for AC (use 4 sq mm minimum)
- Mixing old aluminum with new copper
- Overloading circuits
- Not using proper junction boxes
    `,
    tags: ['wiring', 'cables', 'house wiring', 'electrical safety'],
    isPublished: true,
  },
  {
    title: 'MCB Selection Guide: Ratings, Curves, and Breaking Capacity',
    slug: 'mcb-selection-guide',
    category: 'Switchgear & Protection',
    content: `
# MCB Selection Guide

Miniature Circuit Breakers (MCBs) are the first line of defense in your electrical system. Here's how to choose the right one.

## MCB Ratings

The MCB rating should be:
- **Lower than** the cable current capacity
- **Higher than** the normal operating current

## Curve Types

### B-Curve (3-5x)
- Residential lighting and power circuits
- Sensitive equipment

### C-Curve (5-10x)
- General purpose
- Motors with moderate starting current

### D-Curve (10-20x)
- Motors with high starting current
- Transformers

## Breaking Capacity

- **6kA**: Basic residential
- **10kA**: Standard residential and commercial
- **25kA**: Industrial applications

## Typical Selection

| Load | MCB Rating | Curve |
|------|-----------|-------|
| Lights | 6A | B or C |
| Fans | 6A | B or C |
| Socket 5A | 10A | C |
| Socket 15A | 16A | C |
| AC 1.5T | 20A | C |
| AC 2T | 32A | C |
| Geyser | 20A | C |
    `,
    tags: ['MCB', 'switchgear', 'circuit breaker', 'electrical protection'],
    isPublished: true,
  },
  {
    title: 'RCCB vs RCBO: Understanding Earth Leakage Protection',
    slug: 'rccb-vs-rcbo-guide',
    category: 'Switchgear & Protection',
    content: `
# RCCB vs RCBO: What's the Difference?

Both devices protect against earth leakage (electric shock), but they work differently.

## RCCB (Residual Current Circuit Breaker)

- Detects earth leakage only
- Must be used WITH an MCB
- Protects multiple circuits
- More economical

### Sensitivity Ratings
- **30mA**: Personal protection (shock)
- **100mA**: Equipment protection
- **300mA**: Fire protection

## RCBO (Residual Current Breaker with Overcurrent)

- Combines RCCB + MCB in one device
- Protects individual circuits
- Selective tripping (only affected circuit trips)
- More expensive but convenient

## When to Use What?

### Use RCCB + MCBs when:
- Budget is a concern
- Simple residential installation
- OK with all circuits tripping together

### Use RCBOs when:
- Need selective protection
- Critical loads (medical, IT)
- Want to identify which circuit has fault

## Important Tips

1. Always use 30mA for bathrooms and wet areas
2. Test the RCCB monthly using test button
3. Don't bypass RCCB to stop nuisance tripping - find the fault!
    `,
    tags: ['RCCB', 'RCBO', 'earth leakage', 'electrical safety'],
    isPublished: true,
  },
];
