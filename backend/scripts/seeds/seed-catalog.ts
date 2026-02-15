/**
 * Hub4Estate Comprehensive Catalog Seeder
 *
 * This script seeds the database with:
 * - 12 Categories with detailed subcategories
 * - 30+ Premium, Mid-range, and Budget brands
 * - 100+ Products with full specifications
 *
 * Run with: npx ts-node src/seed-catalog.ts
 */

import prisma from './config/database';

// Import comprehensive catalog data
const catalogData = require('../prisma/comprehensive-catalog');
const { categories, brands, products } = catalogData;

async function seedCatalog() {
  console.log('🌱 Starting Hub4Estate Comprehensive Catalog Seeding...\n');

  try {
    // ============================================
    // 1. SEED CATEGORIES
    // ============================================
    console.log('📁 Creating Categories and Subcategories...');

    const categoryMap = new Map<string, string>(); // slug -> id
    const subCategoryMap = new Map<string, string>(); // slug -> id
    const productTypeMap = new Map<string, string>(); // slug -> id

    for (const cat of categories) {
      const category = await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {
          name: cat.name,
          description: cat.description,
          icon: cat.icon,
          sortOrder: cat.sortOrder,
          whatIsIt: cat.whatIsIt,
          whereUsed: cat.whereUsed,
          whyQualityMatters: cat.whyQualityMatters,
          commonMistakes: cat.commonMistakes,
          isActive: true,
        },
        create: {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          icon: cat.icon,
          sortOrder: cat.sortOrder,
          whatIsIt: cat.whatIsIt,
          whereUsed: cat.whereUsed,
          whyQualityMatters: cat.whyQualityMatters,
          commonMistakes: cat.commonMistakes,
          isActive: true,
        },
      });

      categoryMap.set(cat.slug, category.id);
      console.log(`  ✓ Category: ${cat.name}`);

      // Create subcategories
      if (cat.subCategories) {
        for (const subCat of cat.subCategories) {
          const subCategory = await prisma.subCategory.upsert({
            where: {
              categoryId_slug: {
                categoryId: category.id,
                slug: subCat.slug,
              },
            },
            update: {
              name: subCat.name,
              description: subCat.description,
              isActive: true,
            },
            create: {
              categoryId: category.id,
              name: subCat.name,
              slug: subCat.slug,
              description: subCat.description,
              isActive: true,
            },
          });

          subCategoryMap.set(subCat.slug, subCategory.id);
          console.log(`    ↳ SubCategory: ${subCat.name}`);

          // Create product types
          if (subCat.productTypes) {
            for (const pt of subCat.productTypes) {
              const productType = await prisma.productType.upsert({
                where: {
                  subCategoryId_slug: {
                    subCategoryId: subCategory.id,
                    slug: pt.slug,
                  },
                },
                update: {
                  name: pt.name,
                  description: pt.description,
                  isActive: true,
                },
                create: {
                  subCategoryId: subCategory.id,
                  name: pt.name,
                  slug: pt.slug,
                  description: pt.description,
                  isActive: true,
                },
              });

              productTypeMap.set(pt.slug, productType.id);
            }
          }
        }
      }
    }

    console.log(`\n✅ Created ${categories.length} Categories with ${subCategoryMap.size} SubCategories and ${productTypeMap.size} ProductTypes\n`);

    // ============================================
    // 2. SEED BRANDS
    // ============================================
    console.log('🏭 Creating Brands...');

    const brandMap = new Map<string, string>(); // slug -> id

    for (const b of brands) {
      const brand = await prisma.brand.upsert({
        where: { slug: b.slug },
        update: {
          name: b.name,
          description: b.description,
          website: b.website,
          logo: b.logo,
          isPremium: b.isPremium,
          priceSegment: b.priceSegment,
          qualityRating: b.qualityRating,
          isActive: true,
        },
        create: {
          name: b.name,
          slug: b.slug,
          description: b.description,
          website: b.website,
          logo: b.logo,
          isPremium: b.isPremium,
          priceSegment: b.priceSegment,
          qualityRating: b.qualityRating,
          isActive: true,
        },
      });

      brandMap.set(b.slug, brand.id);

      const segment = b.priceSegment.padEnd(10);
      console.log(`  ✓ [${segment}] ${b.name}`);
    }

    console.log(`\n✅ Created ${brands.length} Brands\n`);

    // ============================================
    // 3. SEED PRODUCTS
    // ============================================
    console.log('📦 Creating Products...');

    let productCount = 0;
    let skippedCount = 0;

    for (const p of products) {
      const brandId = brandMap.get(p.brand);
      const productTypeId = productTypeMap.get(p.productType);

      if (!brandId) {
        console.log(`  ⚠ Skipping product ${p.name}: Brand "${p.brand}" not found`);
        skippedCount++;
        continue;
      }

      if (!productTypeId) {
        console.log(`  ⚠ Skipping product ${p.name}: ProductType "${p.productType}" not found`);
        skippedCount++;
        continue;
      }

      await prisma.product.upsert({
        where: { sku: p.sku },
        update: {
          name: p.name,
          modelNumber: p.modelNumber,
          description: p.description,
          specifications: p.specifications,
          images: p.images || [],
          certifications: p.certifications || [],
          warrantyYears: p.warrantyYears,
          datasheetUrl: p.datasheetUrl,
          isActive: true,
        },
        create: {
          productTypeId,
          brandId,
          name: p.name,
          modelNumber: p.modelNumber,
          sku: p.sku,
          description: p.description,
          specifications: p.specifications,
          images: p.images || [],
          certifications: p.certifications || [],
          warrantyYears: p.warrantyYears,
          datasheetUrl: p.datasheetUrl,
          isActive: true,
        },
      });

      productCount++;
      if (productCount % 10 === 0) {
        console.log(`  ✓ Created ${productCount} products...`);
      }
    }

    console.log(`\n✅ Created ${productCount} Products (${skippedCount} skipped)\n`);

    // ============================================
    // 4. SUMMARY
    // ============================================
    const finalCounts = await Promise.all([
      prisma.category.count(),
      prisma.subCategory.count(),
      prisma.productType.count(),
      prisma.brand.count(),
      prisma.product.count(),
    ]);

    console.log('═'.repeat(50));
    console.log('📊 DATABASE SUMMARY');
    console.log('═'.repeat(50));
    console.log(`  Categories:     ${finalCounts[0]}`);
    console.log(`  SubCategories:  ${finalCounts[1]}`);
    console.log(`  ProductTypes:   ${finalCounts[2]}`);
    console.log(`  Brands:         ${finalCounts[3]}`);
    console.log(`  Products:       ${finalCounts[4]}`);
    console.log('═'.repeat(50));
    console.log('\n🎉 Catalog seeding completed successfully!\n');

  } catch (error) {
    console.error('❌ Error seeding catalog:', error);
    throw error;
  }
}

// Run the seeder
seedCatalog()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
