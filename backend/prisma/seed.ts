import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...\n');

  // ============================================
  // 1. ADMIN USER
  // ============================================
  console.log('1. Creating admin user...');
  const adminPassword = await bcrypt.hash('Admin@123456', 12);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@hub4estate.com' },
    update: {
      password: adminPassword,
      name: 'Hub4Estate Admin',
      role: 'admin',
      isActive: true,
    },
    create: {
      email: 'admin@hub4estate.com',
      password: adminPassword,
      name: 'Hub4Estate Admin',
      role: 'admin',
      isActive: true,
    },
  });
  console.log(`   Admin created: ${admin.email} (id: ${admin.id})\n`);

  // ============================================
  // 2. CATEGORIES (Electrical)
  // ============================================
  console.log('2. Creating categories...');
  const categoryData = [
    { name: 'Wires & Cables', slug: 'wires-cables', icon: 'Cable', description: 'All types of electrical wires and cables for residential and commercial use', sortOrder: 1 },
    { name: 'MCBs & Distribution', slug: 'mcbs-distribution', icon: 'CircuitBoard', description: 'Miniature circuit breakers, RCCBs, and distribution boards', sortOrder: 2 },
    { name: 'Switches & Sockets', slug: 'switches-sockets', icon: 'ToggleLeft', description: 'Modular switches, sockets, and switch plates', sortOrder: 3 },
    { name: 'LED Lighting', slug: 'led-lighting', icon: 'Lightbulb', description: 'Energy-efficient LED bulbs, panels, downlights, and strip lights', sortOrder: 4 },
    { name: 'Fans & Ventilation', slug: 'fans-ventilation', icon: 'Fan', description: 'Ceiling fans, exhaust fans, and ventilation equipment', sortOrder: 5 },
    { name: 'Panels & Enclosures', slug: 'panels-enclosures', icon: 'Box', description: 'Electrical panels, enclosures, and junction boxes', sortOrder: 6 },
    { name: 'Conduits & Accessories', slug: 'conduits-accessories', icon: 'Pipette', description: 'PVC conduits, casing-capping, and wiring accessories', sortOrder: 7 },
    { name: 'Solar & Energy', slug: 'solar-energy', icon: 'Sun', description: 'Solar panels, inverters, and energy storage solutions', sortOrder: 8 },
  ];

  const categories: Record<string, string> = {}; // slug -> id

  for (const cat of categoryData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, description: cat.description, sortOrder: cat.sortOrder },
      create: cat,
    });
    categories[cat.slug] = created.id;
  }
  console.log(`   Created ${categoryData.length} categories\n`);

  // ============================================
  // 3. BRANDS
  // ============================================
  console.log('3. Creating brands...');
  const brandData = [
    { name: 'Havells', slug: 'havells', website: 'https://havells.com', description: 'Leading Indian electrical equipment company', priceSegment: 'Premium', qualityRating: 4.5, isPremium: true },
    { name: 'Polycab', slug: 'polycab', website: 'https://polycab.com', description: 'India\'s largest wire and cable manufacturer', priceSegment: 'Mid-range', qualityRating: 4.3, isPremium: false },
    { name: 'Anchor by Panasonic', slug: 'anchor-panasonic', website: 'https://anchor-india.com', description: 'Panasonic brand for switches, sockets, and wiring devices', priceSegment: 'Mid-range', qualityRating: 4.2, isPremium: false },
    { name: 'Finolex', slug: 'finolex', website: 'https://finolex.com', description: 'Trusted name in wires, cables, and PVC pipes', priceSegment: 'Budget', qualityRating: 4.0, isPremium: false },
    { name: 'L&T Switchgear', slug: 'lt-switchgear', website: 'https://lntelectrical.com', description: 'Industrial and residential switchgear solutions', priceSegment: 'Premium', qualityRating: 4.6, isPremium: true },
    { name: 'Schneider Electric', slug: 'schneider', website: 'https://schneider-electric.co.in', description: 'Global specialist in energy management and automation', priceSegment: 'Premium', qualityRating: 4.7, isPremium: true },
    { name: 'Legrand', slug: 'legrand', website: 'https://legrand.co.in', description: 'French multinational — premium switches and wiring devices', priceSegment: 'Premium', qualityRating: 4.5, isPremium: true },
    { name: 'Philips', slug: 'philips', website: 'https://philips.co.in', description: 'Global leader in lighting and electronics', priceSegment: 'Mid-range', qualityRating: 4.4, isPremium: false },
    { name: 'Crompton', slug: 'crompton', website: 'https://crompton.co.in', description: 'Consumer electrical brand — fans, lighting, pumps', priceSegment: 'Mid-range', qualityRating: 4.1, isPremium: false },
    { name: 'Orient Electric', slug: 'orient-electric', website: 'https://orientelectric.com', description: 'Fans, lighting, and home appliances', priceSegment: 'Mid-range', qualityRating: 4.0, isPremium: false },
    { name: 'Syska', slug: 'syska', website: 'https://syska.co.in', description: 'LED lighting and consumer electronics brand', priceSegment: 'Budget', qualityRating: 3.8, isPremium: false },
    { name: 'GM Modular', slug: 'gm-modular', website: 'https://gmmodular.com', description: 'Switches, sockets, and lighting solutions', priceSegment: 'Budget', qualityRating: 3.9, isPremium: false },
  ];

  const brands: Record<string, string> = {}; // slug -> id

  for (const brand of brandData) {
    const created = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {
        name: brand.name,
        website: brand.website,
        description: brand.description,
        priceSegment: brand.priceSegment,
        qualityRating: brand.qualityRating,
        isPremium: brand.isPremium,
      },
      create: brand,
    });
    brands[brand.slug] = created.id;
  }
  console.log(`   Created ${brandData.length} brands\n`);

  // ============================================
  // 4. SUBCATEGORIES & PRODUCT TYPES
  // ============================================
  console.log('4. Creating subcategories and product types...');

  // Helper to create subcategory + product types under a category
  async function createSubcategoryWithTypes(
    categorySlug: string,
    subName: string,
    subSlug: string,
    subDescription: string,
    types: Array<{ name: string; slug: string; description?: string }>
  ) {
    const categoryId = categories[categorySlug];
    if (!categoryId) {
      console.warn(`   Category not found: ${categorySlug}`);
      return {};
    }

    const sub = await prisma.subCategory.upsert({
      where: { categoryId_slug: { categoryId, slug: subSlug } },
      update: { name: subName, description: subDescription },
      create: { categoryId, name: subName, slug: subSlug, description: subDescription },
    });

    const typeIds: Record<string, string> = {};
    for (const t of types) {
      const pt = await prisma.productType.upsert({
        where: { subCategoryId_slug: { subCategoryId: sub.id, slug: t.slug } },
        update: { name: t.name, description: t.description },
        create: { subCategoryId: sub.id, name: t.name, slug: t.slug, description: t.description },
      });
      typeIds[t.slug] = pt.id;
    }
    return typeIds;
  }

  // Wires & Cables
  const wireTypes = await createSubcategoryWithTypes('wires-cables', 'Wires', 'wires', 'Electrical wires for residential and commercial applications', [
    { name: 'FRLS Wires', slug: 'frls-wires', description: 'Flame Retardant Low Smoke wires for safe residential wiring' },
    { name: 'Flexible Cables', slug: 'flexible-cables', description: 'Multi-strand flexible cables for appliances and extensions' },
    { name: 'Armoured Cables', slug: 'armoured-cables', description: 'Steel wire armoured cables for underground and outdoor use' },
    { name: 'Coaxial Cables', slug: 'coaxial-cables', description: 'Coaxial cables for TV, internet, and CCTV applications' },
  ]);

  // MCBs & Distribution
  const mcbTypes = await createSubcategoryWithTypes('mcbs-distribution', 'Circuit Protection', 'circuit-protection', 'MCBs, RCCBs, and distribution boards', [
    { name: 'Single Pole MCB', slug: 'single-pole-mcb', description: 'Single pole miniature circuit breakers for individual circuits' },
    { name: 'Double Pole MCB', slug: 'double-pole-mcb', description: 'Double pole MCBs for higher-load circuits' },
    { name: 'RCCB', slug: 'rccb', description: 'Residual current circuit breakers for earth fault protection' },
    { name: 'Distribution Boards', slug: 'distribution-boards', description: 'DB boxes for organizing circuit breakers' },
  ]);

  // Switches & Sockets
  const switchTypes = await createSubcategoryWithTypes('switches-sockets', 'Modular Switches', 'modular-range', 'Modular switches, plates, and power sockets', [
    { name: 'Modular Switches', slug: 'modular-switches', description: 'Modern modular switches for residential and commercial use' },
    { name: 'Switch Plates', slug: 'switch-plates', description: 'Cover plates for modular switch modules' },
    { name: 'Power Sockets', slug: 'power-sockets', description: '3-pin and multi-pin power sockets' },
  ]);

  // LED Lighting
  const ledTypes = await createSubcategoryWithTypes('led-lighting', 'LED Products', 'led-products', 'Energy-efficient LED lighting solutions', [
    { name: 'LED Bulbs', slug: 'led-bulbs', description: 'Standard B22/E27 LED bulbs for general lighting' },
    { name: 'LED Panels', slug: 'led-panels', description: 'Surface and recessed LED panel lights for false ceilings' },
    { name: 'LED Downlights', slug: 'led-downlights', description: 'Recessed downlights for accent and ambient lighting' },
    { name: 'LED Strip Lights', slug: 'led-strip-lights', description: 'Flexible LED strips for decorative and cove lighting' },
  ]);

  // Fans & Ventilation subcategory (needed for fan products)
  const fanTypes = await createSubcategoryWithTypes('fans-ventilation', 'Ceiling Fans', 'ceiling-fans', 'Ceiling fans for residential and commercial spaces', [
    { name: 'Standard Ceiling Fans', slug: 'standard-ceiling-fans', description: 'Standard 1200mm ceiling fans' },
  ]);

  console.log('   Created subcategories and product types\n');

  // ============================================
  // 5. SAMPLE PRODUCTS
  // ============================================
  console.log('5. Creating sample products...');

  const productData = [
    {
      name: 'Havells LifeLine Plus FRLS Wire 1.5mm 90m',
      sku: 'HAV-FRLS-1.5-90',
      brandSlug: 'havells',
      productTypeSlug: 'frls-wires',
      typeMap: wireTypes,
      description: 'Havells LifeLine Plus FRLS 1.5 sq mm single core copper wire, 90 meters roll. Flame retardant low smoke for safe residential wiring.',
      specifications: JSON.stringify({
        mrp: 2450,
        crossSection: '1.5 sq mm',
        length: '90 meters',
        material: 'Electrolytic copper',
        insulation: 'FRLS PVC',
        voltage: '1100V',
        currentRating: '15A',
        standard: 'IS 694:2010',
      }),
      certifications: ['ISI', 'BIS'],
      warrantyYears: 10,
    },
    {
      name: 'Polycab FRLS Wire 2.5mm 90m',
      sku: 'POL-FRLS-2.5-90',
      brandSlug: 'polycab',
      productTypeSlug: 'frls-wires',
      typeMap: wireTypes,
      description: 'Polycab FRLS 2.5 sq mm single core copper wire, 90 meters roll. Ideal for power socket circuits.',
      specifications: JSON.stringify({
        mrp: 3850,
        crossSection: '2.5 sq mm',
        length: '90 meters',
        material: 'Electrolytic copper',
        insulation: 'FRLS PVC',
        voltage: '1100V',
        currentRating: '25A',
        standard: 'IS 694:2010',
      }),
      certifications: ['ISI', 'BIS'],
      warrantyYears: 10,
    },
    {
      name: 'Havells MCB Single Pole 16A',
      sku: 'HAV-MCB-SP-16A',
      brandSlug: 'havells',
      productTypeSlug: 'single-pole-mcb',
      typeMap: mcbTypes,
      description: 'Havells?"mubo MCB single pole 16A C-curve. Suitable for lighting and general power circuits.',
      specifications: JSON.stringify({
        mrp: 185,
        poles: 1,
        rating: '16A',
        curve: 'C',
        breakingCapacity: '10kA',
        voltage: '240V AC',
        standard: 'IS/IEC 60898',
      }),
      certifications: ['ISI', 'BIS', 'IEC'],
      warrantyYears: 2,
    },
    {
      name: 'L&T MCB Single Pole 32A',
      sku: 'LT-MCB-SP-32A',
      brandSlug: 'lt-switchgear',
      productTypeSlug: 'single-pole-mcb',
      typeMap: mcbTypes,
      description: 'L&T Exora MCB single pole 32A C-curve. High breaking capacity for AC and geyser circuits.',
      specifications: JSON.stringify({
        mrp: 210,
        poles: 1,
        rating: '32A',
        curve: 'C',
        breakingCapacity: '10kA',
        voltage: '240V AC',
        standard: 'IS/IEC 60898',
      }),
      certifications: ['ISI', 'BIS', 'IEC'],
      warrantyYears: 2,
    },
    {
      name: 'Anchor Roma Modular Switch 10A',
      sku: 'ANC-ROMA-SW-10A',
      brandSlug: 'anchor-panasonic',
      productTypeSlug: 'modular-switches',
      typeMap: switchTypes,
      description: 'Anchor Roma 1-way modular switch 10A. Elegant design with durable mechanism.',
      specifications: JSON.stringify({
        mrp: 65,
        type: '1-way',
        rating: '10A',
        voltage: '240V AC',
        moduleSize: '1M',
        color: 'White',
        standard: 'IS 3854',
      }),
      certifications: ['ISI', 'BIS'],
      warrantyYears: 5,
    },
    {
      name: 'Legrand Myrius Switch 16A',
      sku: 'LEG-MYR-SW-16A',
      brandSlug: 'legrand',
      productTypeSlug: 'modular-switches',
      typeMap: switchTypes,
      description: 'Legrand Myrius premium modular switch 16A. High-end design with silver contact mechanism.',
      specifications: JSON.stringify({
        mrp: 145,
        type: '1-way',
        rating: '16A',
        voltage: '240V AC',
        moduleSize: '1M',
        color: 'White',
        contactMaterial: 'Silver alloy',
        standard: 'IS 3854',
      }),
      certifications: ['ISI', 'BIS'],
      warrantyYears: 10,
    },
    {
      name: 'Philips 15W LED Panel Round',
      sku: 'PHI-LED-PNL-15W',
      brandSlug: 'philips',
      productTypeSlug: 'led-panels',
      typeMap: ledTypes,
      description: 'Philips AstraSlim 15W round LED panel. Surface mount, cool daylight 6500K.',
      specifications: JSON.stringify({
        mrp: 585,
        wattage: '15W',
        lumens: 1500,
        colorTemperature: '6500K (Cool Daylight)',
        shape: 'Round',
        mounting: 'Surface',
        cutoutDiameter: '170mm',
        lifespan: '25000 hours',
        standard: 'IS 16102',
      }),
      certifications: ['BIS', 'BEE 5-Star'],
      warrantyYears: 2,
    },
    {
      name: 'Crompton 9W LED Bulb',
      sku: 'CRM-LED-BULB-9W',
      brandSlug: 'crompton',
      productTypeSlug: 'led-bulbs',
      typeMap: ledTypes,
      description: 'Crompton Star 9W B22 LED bulb. Cool daylight, high lumen output for everyday use.',
      specifications: JSON.stringify({
        mrp: 120,
        wattage: '9W',
        lumens: 900,
        colorTemperature: '6500K (Cool Daylight)',
        base: 'B22',
        lifespan: '25000 hours',
        standard: 'IS 16102',
      }),
      certifications: ['BIS', 'BEE 3-Star'],
      warrantyYears: 2,
    },
    {
      name: 'Havells Pacer Fan 1200mm',
      sku: 'HAV-FAN-PACER-1200',
      brandSlug: 'havells',
      productTypeSlug: 'standard-ceiling-fans',
      typeMap: fanTypes,
      description: 'Havells Pacer 1200mm ceiling fan. High air delivery with aerodynamic blades.',
      specifications: JSON.stringify({
        mrp: 2850,
        sweepSize: '1200mm',
        speed: 380,
        airDelivery: '230 cmm',
        power: '75W',
        bladeCount: 3,
        color: 'Brown',
        standard: 'IS 374',
      }),
      certifications: ['ISI', 'BIS', 'BEE 2-Star'],
      warrantyYears: 2,
    },
    {
      name: 'Orient Electric Ujala Fan 1200mm',
      sku: 'ORI-FAN-UJALA-1200',
      brandSlug: 'orient-electric',
      productTypeSlug: 'standard-ceiling-fans',
      typeMap: fanTypes,
      description: 'Orient Electric Ujala 1200mm ceiling fan. Budget-friendly with decent air delivery.',
      specifications: JSON.stringify({
        mrp: 1950,
        sweepSize: '1200mm',
        speed: 350,
        airDelivery: '210 cmm',
        power: '72W',
        bladeCount: 3,
        color: 'White',
        standard: 'IS 374',
      }),
      certifications: ['ISI', 'BIS'],
      warrantyYears: 2,
    },
    {
      name: 'Schneider 4-Way Distribution Board',
      sku: 'SCH-DB-4WAY',
      brandSlug: 'schneider',
      productTypeSlug: 'distribution-boards',
      typeMap: mcbTypes,
      description: 'Schneider Electric Easy9 4-way single-phase distribution board. Metal enclosure with DIN rail.',
      specifications: JSON.stringify({
        mrp: 1450,
        ways: 4,
        phase: 'Single',
        material: 'CRCA Steel',
        mounting: 'Surface/Flush',
        ipRating: 'IP30',
        standard: 'IS/IEC 61439',
      }),
      certifications: ['ISI', 'BIS', 'IEC'],
      warrantyYears: 3,
    },
    {
      name: 'Finolex FR PVC Wire 4mm 90m',
      sku: 'FIN-FR-4MM-90',
      brandSlug: 'finolex',
      productTypeSlug: 'frls-wires',
      typeMap: wireTypes,
      description: 'Finolex FR 4 sq mm single core PVC insulated wire, 90 meters. Suitable for AC and geyser circuits.',
      specifications: JSON.stringify({
        mrp: 5200,
        crossSection: '4 sq mm',
        length: '90 meters',
        material: 'Electrolytic copper',
        insulation: 'FR PVC',
        voltage: '1100V',
        currentRating: '32A',
        standard: 'IS 694:2010',
      }),
      certifications: ['ISI', 'BIS'],
      warrantyYears: 10,
    },
  ];

  let productCount = 0;
  for (const p of productData) {
    const brandId = brands[p.brandSlug];
    const productTypeId = p.typeMap[p.productTypeSlug];

    if (!brandId) {
      console.warn(`   Brand not found: ${p.brandSlug}`);
      continue;
    }
    if (!productTypeId) {
      console.warn(`   ProductType not found: ${p.productTypeSlug}`);
      continue;
    }

    try {
      await prisma.product.upsert({
        where: { sku: p.sku },
        update: {
          name: p.name,
          description: p.description,
          specifications: p.specifications,
          certifications: p.certifications,
          warrantyYears: p.warrantyYears,
          isActive: true,
        },
        create: {
          productTypeId,
          brandId,
          name: p.name,
          sku: p.sku,
          description: p.description,
          specifications: p.specifications,
          certifications: p.certifications,
          warrantyYears: p.warrantyYears,
          isActive: true,
        },
      });
      productCount++;
    } catch (err: any) {
      console.warn(`   Failed to create product: ${p.name} — ${err.message}`);
    }
  }
  console.log(`   Created ${productCount} products\n`);

  // ============================================
  // 6. SUBSCRIPTION PLANS
  // ============================================
  console.log('6. Creating subscription plans...');
  const planData = [
    {
      name: 'free',
      displayName: 'Free Plan',
      priceMonthlyPaise: 0,
      priceYearlyPaise: 0,
      leadsPerMonth: 5,
      quotesPerMonth: 5,
      features: ['5 leads/month', '5 quotes/month', 'Basic dashboard', 'Email support'],
      sortOrder: 1,
    },
    {
      name: 'silver',
      displayName: 'Silver Plan',
      priceMonthlyPaise: 99900, // Rs 999
      priceYearlyPaise: 999900, // Rs 9,999
      leadsPerMonth: 50,
      quotesPerMonth: 50,
      features: ['50 leads/month', '50 quotes/month', 'Priority support', 'Analytics dashboard', 'Lead notifications'],
      sortOrder: 2,
    },
    {
      name: 'gold',
      displayName: 'Gold Plan',
      priceMonthlyPaise: 299900, // Rs 2,999
      priceYearlyPaise: 2999900, // Rs 29,999
      leadsPerMonth: 200,
      quotesPerMonth: 200,
      features: ['200 leads/month', '200 quotes/month', 'All features', 'Dedicated account manager', 'API access', 'Custom branding'],
      sortOrder: 3,
    },
    {
      name: 'platinum',
      displayName: 'Platinum Plan',
      priceMonthlyPaise: 799900, // Rs 7,999
      priceYearlyPaise: 7999900, // Rs 79,999
      leadsPerMonth: 99999, // effectively unlimited
      quotesPerMonth: 99999,
      features: ['Unlimited leads', 'Unlimited quotes', 'All features', 'Dedicated support', 'White-label options', 'Priority bid placement', 'Custom integrations'],
      sortOrder: 4,
    },
  ];

  for (const plan of planData) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: {
        displayName: plan.displayName,
        priceMonthlyPaise: plan.priceMonthlyPaise,
        priceYearlyPaise: plan.priceYearlyPaise,
        leadsPerMonth: plan.leadsPerMonth,
        quotesPerMonth: plan.quotesPerMonth,
        features: plan.features,
        sortOrder: plan.sortOrder,
        isActive: true,
      },
      create: { ...plan, isActive: true },
    });
  }
  console.log(`   Created ${planData.length} subscription plans\n`);

  // ============================================
  // 7. PLATFORM SETTINGS
  // ============================================
  console.log('7. Creating platform settings...');
  const settingsData = [
    { key: 'platform_name', value: 'Hub4Estate', type: 'string', description: 'Platform display name' },
    { key: 'support_email', value: 'support@hub4estate.com', type: 'string', description: 'Customer support email address' },
    { key: 'support_phone', value: '+917690001999', type: 'string', description: 'Customer support phone number' },
    { key: 'commission_rate', value: '5', type: 'number', description: 'Platform commission rate in percent' },
    { key: 'gst_rate', value: '18', type: 'number', description: 'GST rate in percent for platform services' },
  ];

  for (const setting of settingsData) {
    await prisma.platformSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, type: setting.type, description: setting.description },
      create: setting,
    });
  }
  console.log(`   Created ${settingsData.length} platform settings\n`);

  // ============================================
  // 8. FEATURE FLAGS
  // ============================================
  console.log('8. Creating feature flags...');
  const flagData = [
    { key: 'ai_chat_enabled', name: 'AI Chat Assistant', description: 'Enable the AI-powered procurement chat assistant', isEnabled: true, rolloutPercent: 100 },
    { key: 'blind_bidding', name: 'Blind Bidding Engine', description: 'Enable the blind bidding system for RFQs', isEnabled: true, rolloutPercent: 100 },
    { key: 'price_prediction', name: 'Price Prediction', description: 'Enable AI-powered price prediction for products', isEnabled: false, rolloutPercent: 0 },
    { key: 'dealer_subscriptions', name: 'Dealer Subscriptions', description: 'Enable paid subscription plans for dealers', isEnabled: true, rolloutPercent: 100 },
  ];

  for (const flag of flagData) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: {
        name: flag.name,
        description: flag.description,
        isEnabled: flag.isEnabled,
        rolloutPercent: flag.rolloutPercent,
      },
      create: flag,
    });
  }
  console.log(`   Created ${flagData.length} feature flags\n`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log('='.repeat(50));
  console.log('Seeding completed successfully!');
  console.log('='.repeat(50));
  console.log(`  Admin:              admin@hub4estate.com / Admin@123456`);
  console.log(`  Categories:         ${categoryData.length}`);
  console.log(`  Brands:             ${brandData.length}`);
  console.log(`  Products:           ${productCount}`);
  console.log(`  Subscription Plans: ${planData.length}`);
  console.log(`  Platform Settings:  ${settingsData.length}`);
  console.log(`  Feature Flags:      ${flagData.length}`);
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
