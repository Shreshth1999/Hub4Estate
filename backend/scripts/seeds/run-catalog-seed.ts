/**
 * Hub4Estate - Electrical Catalog Seed Runner
 *
 * This script imports the complete electrical product catalog into the database.
 * Run with: npx tsx prisma/run-catalog-seed.ts
 */

import { PrismaClient } from '@prisma/client';
import { brands, categories, sampleProducts, knowledgeArticles } from './electrical-catalog-seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Hub4Estate Electrical Catalog Seed...\n');

  // 1. Seed Brands
  console.log('📦 Seeding Brands...');
  const brandMap: Record<string, string> = {};

  for (const brand of brands) {
    // Check by both slug and name
    let existing = await prisma.brand.findUnique({
      where: { slug: brand.slug },
    });

    if (!existing) {
      existing = await prisma.brand.findUnique({
        where: { name: brand.name },
      });
    }

    if (existing) {
      brandMap[brand.slug] = existing.id;
      console.log(`  ⏭️  Brand "${brand.name}" already exists`);
    } else {
      try {
        const created = await prisma.brand.create({
          data: {
            name: brand.name,
            slug: brand.slug,
            logo: brand.logo,
            description: brand.description,
            website: brand.website,
            isPremium: brand.isPremium,
            priceSegment: brand.priceSegment,
            qualityRating: brand.qualityRating,
          },
        });
        brandMap[brand.slug] = created.id;
        console.log(`  ✅ Created brand: ${brand.name}`);
      } catch (err: any) {
        if (err.code === 'P2002') {
          // Handle unique constraint violation - fetch existing
          const existingBrand = await prisma.brand.findFirst({
            where: {
              OR: [{ slug: brand.slug }, { name: brand.name }],
            },
          });
          if (existingBrand) {
            brandMap[brand.slug] = existingBrand.id;
            console.log(`  ⏭️  Brand "${brand.name}" already exists (found by name)`);
          }
        } else {
          throw err;
        }
      }
    }
  }
  console.log(`\n  Total brands: ${Object.keys(brandMap).length}\n`);

  // 2. Seed Categories and Subcategories
  console.log('📂 Seeding Categories & Subcategories...');
  const categoryMap: Record<string, string> = {};
  const subCategoryMap: Record<string, string> = {};

  for (const category of categories) {
    // Check if category exists
    let existingCategory = await prisma.category.findUnique({
      where: { slug: category.slug },
    });

    let categoryId: string;

    if (!existingCategory) {
      // Also check by name
      existingCategory = await prisma.category.findUnique({
        where: { name: category.name },
      });
    }

    if (existingCategory) {
      categoryId = existingCategory.id;
      // Update existing category with new data
      await prisma.category.update({
        where: { id: categoryId },
        data: {
          description: category.description,
          icon: category.icon,
          sortOrder: category.sortOrder,
          whatIsIt: category.whatIsIt,
          whereUsed: category.whereUsed,
          whyQualityMatters: category.whyQualityMatters,
          commonMistakes: category.commonMistakes,
        },
      });
      console.log(`  ⏭️  Category "${category.name}" updated`);
    } else {
      try {
        const created = await prisma.category.create({
          data: {
            name: category.name,
            slug: category.slug,
            description: category.description,
            icon: category.icon,
            sortOrder: category.sortOrder,
            whatIsIt: category.whatIsIt,
            whereUsed: category.whereUsed,
            whyQualityMatters: category.whyQualityMatters,
            commonMistakes: category.commonMistakes,
          },
        });
        categoryId = created.id;
        console.log(`  ✅ Created category: ${category.name}`);
      } catch (err: any) {
        if (err.code === 'P2002') {
          const existing = await prisma.category.findFirst({
            where: { OR: [{ slug: category.slug }, { name: category.name }] },
          });
          if (existing) {
            categoryId = existing.id;
            console.log(`  ⏭️  Category "${category.name}" already exists (found by name)`);
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }
    }

    categoryMap[category.slug] = categoryId;

    // Seed subcategories
    for (const subCat of category.subCategories) {
      const subCatKey = `${category.slug}/${subCat.slug}`;

      const existingSub = await prisma.subCategory.findFirst({
        where: {
          categoryId,
          slug: subCat.slug,
        },
      });

      if (existingSub) {
        subCategoryMap[subCatKey] = existingSub.id;
        // Update existing
        await prisma.subCategory.update({
          where: { id: existingSub.id },
          data: {
            description: subCat.description,
            sortOrder: subCat.sortOrder,
          },
        });
      } else {
        const createdSub = await prisma.subCategory.create({
          data: {
            categoryId,
            name: subCat.name,
            slug: subCat.slug,
            description: subCat.description,
            sortOrder: subCat.sortOrder,
          },
        });
        subCategoryMap[subCatKey] = createdSub.id;
        console.log(`    ✅ Created subcategory: ${subCat.name}`);
      }
    }
  }

  console.log(`\n  Total categories: ${Object.keys(categoryMap).length}`);
  console.log(`  Total subcategories: ${Object.keys(subCategoryMap).length}\n`);

  // 3. Create Product Types (one per subcategory for simplicity)
  console.log('🏷️  Seeding Product Types...');
  const productTypeMap: Record<string, string> = {};

  for (const [subCatKey, subCatId] of Object.entries(subCategoryMap)) {
    const [catSlug, subCatSlug] = subCatKey.split('/');
    const ptSlug = `${subCatSlug}-products`;

    const existingPT = await prisma.productType.findFirst({
      where: {
        subCategoryId: subCatId,
        slug: ptSlug,
      },
    });

    if (existingPT) {
      productTypeMap[subCatKey] = existingPT.id;
    } else {
      const category = categories.find((c) => c.slug === catSlug);
      const subCat = category?.subCategories.find((s) => s.slug === subCatSlug);

      const createdPT = await prisma.productType.create({
        data: {
          subCategoryId: subCatId,
          name: `${subCat?.name || subCatSlug} Products`,
          slug: ptSlug,
          description: subCat?.description || '',
        },
      });
      productTypeMap[subCatKey] = createdPT.id;
    }
  }

  console.log(`  Total product types: ${Object.keys(productTypeMap).length}\n`);

  // 4. Seed Sample Products
  console.log('🛒 Seeding Sample Products...');
  let productCount = 0;

  for (const product of sampleProducts) {
    const subCatKey = `${product.category}/${product.subCategory}`;
    const productTypeId = productTypeMap[subCatKey];
    const brandId = brandMap[product.brand];

    if (!productTypeId) {
      console.log(`  ⚠️  Product type not found for: ${subCatKey}`);
      continue;
    }

    if (!brandId) {
      console.log(`  ⚠️  Brand not found: ${product.brand}`);
      continue;
    }

    // Check if product already exists by model number
    const existing = await prisma.product.findFirst({
      where: {
        modelNumber: product.modelNumber,
        brandId,
      },
    });

    if (existing) {
      console.log(`  ⏭️  Product "${product.name}" already exists`);
      continue;
    }

    await prisma.product.create({
      data: {
        productTypeId,
        brandId,
        name: product.name,
        modelNumber: product.modelNumber,
        description: product.description,
        specifications: product.specifications,
        certifications: product.certifications,
        warrantyYears: product.warrantyYears,
      },
    });

    productCount++;
    console.log(`  ✅ Created product: ${product.name}`);
  }

  console.log(`\n  Total products created: ${productCount}\n`);

  // 5. Seed Knowledge Articles
  console.log('📚 Seeding Knowledge Articles...');
  let articleCount = 0;

  // First, ensure we have an admin for authorId
  let admin = await prisma.admin.findFirst();
  if (!admin) {
    // Create a system admin for seeding
    const bcrypt = await import('bcrypt');
    admin = await prisma.admin.create({
      data: {
        email: 'system@hub4estate.com',
        password: await bcrypt.hash('system-admin-password', 10),
        name: 'System',
        role: 'super_admin',
      },
    });
    console.log('  ✅ Created system admin for articles');
  }

  for (const article of knowledgeArticles) {
    const existing = await prisma.knowledgeArticle.findUnique({
      where: { slug: article.slug },
    });

    if (existing) {
      console.log(`  ⏭️  Article "${article.title}" already exists`);
      continue;
    }

    await prisma.knowledgeArticle.create({
      data: {
        title: article.title,
        slug: article.slug,
        category: article.category,
        content: article.content,
        tags: article.tags,
        isPublished: article.isPublished,
        authorId: admin.id,
        publishedAt: article.isPublished ? new Date() : null,
      },
    });

    articleCount++;
    console.log(`  ✅ Created article: ${article.title}`);
  }

  console.log(`\n  Total articles created: ${articleCount}\n`);

  // Summary
  console.log('═'.repeat(50));
  console.log('✨ Seed Complete!');
  console.log('═'.repeat(50));
  console.log(`
  📦 Brands: ${Object.keys(brandMap).length}
  📂 Categories: ${Object.keys(categoryMap).length}
  📁 Subcategories: ${Object.keys(subCategoryMap).length}
  🏷️  Product Types: ${Object.keys(productTypeMap).length}
  🛒 Products: ${productCount} (new)
  📚 Articles: ${articleCount} (new)
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
