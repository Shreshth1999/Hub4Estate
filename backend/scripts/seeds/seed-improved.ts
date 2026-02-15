import bcrypt from 'bcrypt';
import prisma from './config/database';
import { realisticProducts, productCategories, trustedBrands } from '../prisma/realistic-products';

async function main() {
  console.log('🌱 Starting improved database seeding with realistic products...\n');

  // 1. Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@hub4estate.com' },
    update: {},
    create: {
      email: 'admin@hub4estate.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'super_admin',
      isActive: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // 2. Create all brands
  console.log('\n📦 Creating brands...');
  const brandMap = new Map();

  for (const brandData of trustedBrands) {
    const brand = await prisma.brand.upsert({
      where: { slug: brandData.name.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: {
        name: brandData.name,
        slug: brandData.name.toLowerCase().replace(/\s+/g, '-'),
        priceSegment: brandData.tier === 'Premium' ? 'Premium' : 'Mid-range',
        qualityRating: brandData.tier === 'Premium' ? 4.5 : 4.0,
        isPremium: brandData.tier === 'Premium',
      },
    });
    brandMap.set(brandData.name, brand);
    console.log(`  ✓ ${brandData.name}`);
  }

  // 3. Create all categories
  console.log('\n📁 Creating categories...');
  const categoryMap = new Map();

  for (const catData of productCategories) {
    const category = await prisma.category.upsert({
      where: { slug: catData.id.toLowerCase().replace(/_/g, '-') },
      update: {},
      create: {
        name: catData.name,
        slug: catData.id.toLowerCase().replace(/_/g, '-'),
        description: catData.description,
        whatIsIt: catData.description,
        whereUsed: `Essential for modern Indian homes`,
        whyQualityMatters: `Quality ensures safety, durability, and energy efficiency`,
        commonMistakes: `Not consulting experts, choosing based on price alone`,
        sortOrder: Object.keys(productCategories).indexOf(catData) + 1,
      },
    });
    categoryMap.set(catData.id, category);
    console.log(`  ✓ ${catData.name}`);
  }

  // 4. Create realistic products
  console.log('\n🏗️  Creating realistic products...\n');
  let productCount = 0;

  for (const prodData of realisticProducts) {
    const category = categoryMap.get(prodData.category);
    const brand = brandMap.get(prodData.brand);

    if (!category || !brand) {
      console.log(`  ⚠️  Skipping ${prodData.name} - missing category or brand`);
      continue;
    }

    // Create a subcategory if it doesn't exist
    const subCatSlug = `${category.slug}-items`;
    let subCategory = await prisma.subCategory.findFirst({
      where: {
        categoryId: category.id,
        slug: subCatSlug,
      },
    });

    if (!subCategory) {
      subCategory = await prisma.subCategory.create({
        data: {
          name: `${category.name} Products`,
          slug: subCatSlug,
          description: `All ${category.name.toLowerCase()} products`,
          categoryId: category.id,
        },
      });
    }

    // Create a product type if it doesn't exist
    const typeSlug = prodData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    let productType = await prisma.productType.findFirst({
      where: {
        subCategoryId: subCategory.id,
        slug: typeSlug,
      },
    });

    if (!productType) {
      productType = await prisma.productType.create({
        data: {
          name: prodData.name,
          slug: typeSlug,
          description: prodData.description,
          technicalInfo: JSON.stringify(prodData.specifications),
          useCases: JSON.stringify(['Residential', 'Commercial']),
          subCategoryId: subCategory.id,
        },
      });
    }

    // Create the actual product
    const sku = `${brand.slug.toUpperCase().slice(0, 4)}-${typeSlug.slice(0, 15)}`.toUpperCase();

    await prisma.product.upsert({
      where: { sku },
      update: {},
      create: {
        productTypeId: productType.id,
        brandId: brand.id,
        name: prodData.name,
        modelNumber: prodData.name.split(' ').slice(-2).join('-'),
        sku,
        description: prodData.description,
        specifications: JSON.stringify(prodData.specifications),
        certifications: ['ISI', 'BIS'],
        warrantyYears: brand.isPremium ? 5 : 3,
        isActive: true,
      },
    });

    productCount++;
    console.log(`  ✓ [${productCount}] ${prodData.name}`);
  }

  console.log(`\n✅ Created ${productCount} realistic products!\n`);

  // 5. Create sample knowledge articles
  console.log('📚 Creating knowledge articles...');

  await prisma.knowledgeArticle.upsert({
    where: { slug: 'electrical-wiring-guide' },
    update: {},
    create: {
      title: 'Complete Guide to Electrical Wiring for Indian Homes 2026',
      slug: 'electrical-wiring-guide',
      authorId: admin.id,
      content: `# Complete Guide to Electrical Wiring for Indian Homes 2026

## Understanding Wire Sizes

### 1.5 sq mm Wires
- **Use for**: Lights, fans, and small appliances
- **Maximum Load**: 15 Amps
- **Cost per meter**: ₹28-35

### 2.5 sq mm Wires
- **Use for**: Power sockets, ACs, geysers
- **Maximum Load**: 25 Amps
- **Cost per meter**: ₹45-55

### 4 sq mm Wires
- **Use for**: Main distribution, heavy appliances
- **Maximum Load**: 35-40 Amps
- **Cost per meter**: ₹80-100

## Top Brands Comparison

### Premium Tier
1. **Polycab** - Most trusted, best quality
2. **Havells** - Great after-sales service
3. **Schneider** - International quality standards

### Budget-Friendly Options
1. **KEI** - Good value for money
2. **Finolex** - Reliable budget option

## Safety Tips

✅ Always use ISI-marked products
✅ Follow color coding: Red (Live), Black (Neutral), Green (Earth)
✅ Never overload circuits
✅ Get annual safety inspections

## Common Mistakes to Avoid

❌ Using undersized wires to save money
❌ Mixing copper and aluminum wires
❌ Skipping earthing/grounding
❌ Not leaving service loops
❌ Using cheap, non-ISI products

## Cost Estimation (2026)

**For a 2 BHK apartment:**
- Total wiring length: 350-450 meters
- Estimated cost: ₹18,000 - ₹35,000
- Labor cost: ₹12,000 - ₹20,000
- **Total**: ₹30,000 - ₹55,000

*Prices vary by brand and location*`,
      category: 'TECHNICAL_GUIDES',
      author: 'Hub4Estate Technical Team',
      tags: ['wiring', 'electrical', 'safety', 'home-building'],
      viewCount: 1250,
      helpfulCount: 890,
      status: 'PUBLISHED',
    },
  });

  await prisma.knowledgeArticle.upsert({
    where: { slug: 'led-lighting-guide' },
    update: {},
    create: {
      title: 'How to Choose LED Lights for Your Home - 2026 Guide',
      slug: 'led-lighting-guide',
      authorId: admin.id,
      content: `# LED Lighting Guide for Indian Homes

## Understanding Key Terms

### Lumens (Brightness)
- 400-600 lm: Bedrooms, ambient lighting
- 800-1000 lm: Living rooms, kitchens
- 1200+ lm: Work areas, outdoor

### Color Temperature
- **2700K-3000K (Warm White)**: Bedrooms, living rooms
- **4000K (Natural White)**: Kitchens, bathrooms
- **6000K+ (Cool White)**: Study rooms, garages

## Room-by-Room Guide

### Living Room
- 4-5 LED bulbs of 9W each
- 1 ceiling light 20W
- **Total**: ~60-70W
- **Old equivalent**: 300W+ with incandescent

### Bedroom
- 2-3 LED bulbs of 9W
- 1 reading light 12W
- **Total**: ~30-40W

### Kitchen
- 2-3 battens 18-20W each
- Under-cabinet lights
- **Total**: ~50-60W

## Top LED Brands 2026

1. **Philips** - Best quality, longest life
2. **Syska** - Great value for money
3. **Havells** - Reliable, good warranty
4. **Wipro** - Budget-friendly

## Cost Savings Example

**Replacing 10 bulbs in your home:**

| Type | Wattage | Monthly Cost | Yearly Cost |
|------|---------|--------------|-------------|
| Incandescent | 60W x 10 | ₹432 | ₹5,184 |
| LED | 9W x 10 | ₹65 | ₹780 |
| **Savings** | | **₹367/mo** | **₹4,404/year** |

*Assuming 6 hours daily usage @ ₹8/unit*

## Warranty Comparison

- Philips: 3-5 years
- Syska: 2-3 years
- Havells: 2-3 years
- Local brands: 1 year or less

## Pro Tips

✅ Buy LED lights with at least 2-year warranty
✅ Check lumens, not just wattage
✅ Match color temperature to room purpose
✅ Keep bills and warranty cards safe`,
      category: 'TECHNICAL_GUIDES',
      author: 'Hub4Estate Technical Team',
      tags: ['lighting', 'LED', 'energy-saving', 'home-design'],
      viewCount: 980,
      helpfulCount: 720,
      status: 'PUBLISHED',
    },
  });

  console.log('✅ Knowledge articles created\n');

  console.log('═══════════════════════════════════════════');
  console.log('🎉 Database seeding completed successfully!');
  console.log('═══════════════════════════════════════════\n');
  console.log('📊 Summary:');
  console.log(`   - Admin users: 1`);
  console.log(`   - Brands: ${trustedBrands.length}`);
  console.log(`   - Categories: ${productCategories.length}`);
  console.log(`   - Products: ${productCount}`);
  console.log(`   - Knowledge articles: 2`);
  console.log('\n✅ Ready to use!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
