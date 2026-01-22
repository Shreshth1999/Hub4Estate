import bcrypt from 'bcrypt';
import prisma from './config/database';
import { comprehensiveCategories, comprehensiveBrands, comprehensiveProducts, dummyDealers } from '../prisma/comprehensive-products';

async function main() {
  console.log('🌱 Starting comprehensive database seeding...\n');

  // ============ ADMIN USER ============
  console.log('Creating admin user...');
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

  // ============ CATEGORIES ============
  console.log('\nCreating categories...');
  for (const cat of comprehensiveCategories) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        whatIsIt: cat.whatIsIt,
        whereUsed: cat.whereUsed,
        whyQualityMatters: cat.whyQualityMatters,
        commonMistakes: cat.commonMistakes,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        whatIsIt: cat.whatIsIt,
        whereUsed: cat.whereUsed,
        whyQualityMatters: cat.whyQualityMatters,
        commonMistakes: cat.commonMistakes,
        sortOrder: comprehensiveCategories.indexOf(cat) + 1,
      },
    });

    // Create subcategories
    if (cat.subcategories) {
      for (const sub of cat.subcategories) {
        await prisma.subCategory.upsert({
          where: {
            categoryId_slug: {
              categoryId: category.id,
              slug: sub.slug,
            },
          },
          update: {
            name: sub.name,
            description: sub.description,
          },
          create: {
            name: sub.name,
            slug: sub.slug,
            description: sub.description,
            categoryId: category.id,
            sortOrder: cat.subcategories.indexOf(sub) + 1,
          },
        });
      }
    }
  }
  console.log(`✅ Created ${comprehensiveCategories.length} categories with subcategories`);

  // ============ BRANDS ============
  console.log('\nCreating brands...');
  for (const brand of comprehensiveBrands) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {
        name: brand.name,
        website: brand.website,
        description: brand.description,
        priceSegment: brand.priceSegment,
        qualityRating: brand.qualityRating,
        isPremium: brand.isPremium,
      },
      create: {
        name: brand.name,
        slug: brand.slug,
        website: brand.website,
        description: brand.description,
        priceSegment: brand.priceSegment,
        qualityRating: brand.qualityRating,
        isPremium: brand.isPremium,
      },
    });
  }
  console.log(`✅ Created ${comprehensiveBrands.length} brands`);

  // ============ PRODUCTS ============
  console.log('\nCreating products...');
  let productCount = 0;

  for (const product of comprehensiveProducts) {
    // Find category
    const category = await prisma.category.findFirst({
      where: { slug: product.category },
    });
    if (!category) {
      console.warn(`  ⚠️ Category not found: ${product.category}`);
      continue;
    }

    // Find subcategory
    const subCategory = await prisma.subCategory.findFirst({
      where: {
        slug: product.subcategory,
        categoryId: category.id,
      },
    });

    // Find brand
    const brand = await prisma.brand.findFirst({
      where: { slug: product.brand },
    });
    if (!brand) {
      console.warn(`  ⚠️ Brand not found: ${product.brand}`);
      continue;
    }

    // Create or find product type
    let productType;
    if (subCategory) {
      productType = await prisma.productType.upsert({
        where: {
          subCategoryId_slug: {
            subCategoryId: subCategory.id,
            slug: product.subcategory,
          },
        },
        update: {},
        create: {
          name: subCategory.name,
          slug: product.subcategory,
          description: subCategory.description || '',
          subCategoryId: subCategory.id,
        },
      });
    }

    if (!productType) {
      // Create a default product type
      const defaultSubCat = await prisma.subCategory.findFirst({
        where: { categoryId: category.id },
      });
      if (defaultSubCat) {
        productType = await prisma.productType.upsert({
          where: {
            subCategoryId_slug: {
              subCategoryId: defaultSubCat.id,
              slug: 'general',
            },
          },
          update: {},
          create: {
            name: 'General',
            slug: 'general',
            subCategoryId: defaultSubCat.id,
          },
        });
      }
    }

    if (!productType) {
      console.warn(`  ⚠️ Could not create product type for: ${product.name}`);
      continue;
    }

    // Create product
    try {
      await prisma.product.upsert({
        where: { sku: product.sku },
        update: {
          name: product.name,
          description: `${product.name} - ${brand.name}. Premium quality electrical product.`,
          specifications: JSON.stringify({
            ...product.specs,
            priceRange: product.price,
            unit: product.unit,
          }),
          isActive: true,
        },
        create: {
          productTypeId: productType.id,
          brandId: brand.id,
          name: product.name,
          sku: product.sku,
          description: `${product.name} - ${brand.name}. Premium quality electrical product.`,
          specifications: JSON.stringify({
            ...product.specs,
            priceRange: product.price,
            unit: product.unit,
          }),
          certifications: ['ISI', 'BIS'],
          warrantyYears: 2,
          isActive: true,
        },
      });
      productCount++;
    } catch (err) {
      console.warn(`  ⚠️ Failed to create product: ${product.name}`);
    }
  }
  console.log(`✅ Created ${productCount} products`);

  // ============ DUMMY DEALERS ============
  console.log('\nCreating dummy dealers...');
  for (const dealer of dummyDealers) {
    const hashedPassword = await bcrypt.hash(dealer.password, 12);

    try {
      const createdDealer = await prisma.dealer.upsert({
        where: { email: dealer.email },
        update: {},
        create: {
          email: dealer.email,
          password: hashedPassword,
          businessName: dealer.businessName,
          ownerName: dealer.ownerName,
          phone: dealer.phone,
          gstNumber: dealer.gstNumber,
          panNumber: dealer.panNumber,
          shopAddress: dealer.shopAddress,
          city: dealer.city,
          state: dealer.state,
          pincode: dealer.pincode,
          status: 'VERIFIED',
          verifiedAt: new Date(),
          verifiedBy: admin.id,
        },
      });

      // Add brand mappings
      for (const brandSlug of dealer.brands) {
        const brand = await prisma.brand.findFirst({ where: { slug: brandSlug } });
        if (brand) {
          await prisma.dealerBrandMapping.upsert({
            where: {
              dealerId_brandId: {
                dealerId: createdDealer.id,
                brandId: brand.id,
              },
            },
            update: {},
            create: {
              dealerId: createdDealer.id,
              brandId: brand.id,
              isVerified: true,
            },
          });
        }
      }

      // Add category mappings
      for (const catSlug of dealer.categories) {
        const cat = await prisma.category.findFirst({ where: { slug: catSlug } });
        if (cat) {
          await prisma.dealerCategoryMapping.upsert({
            where: {
              dealerId_categoryId: {
                dealerId: createdDealer.id,
                categoryId: cat.id,
              },
            },
            update: {},
            create: {
              dealerId: createdDealer.id,
              categoryId: cat.id,
            },
          });
        }
      }

      // Add service areas
      for (const pincode of dealer.serviceAreas) {
        await prisma.dealerServiceArea.upsert({
          where: {
            dealerId_pincode: {
              dealerId: createdDealer.id,
              pincode,
            },
          },
          update: {},
          create: {
            dealerId: createdDealer.id,
            pincode,
          },
        });
      }

      console.log(`  ✅ Dealer created: ${dealer.businessName} (${dealer.email})`);
    } catch (err) {
      console.warn(`  ⚠️ Failed to create dealer: ${dealer.email}`);
    }
  }

  // ============ KNOWLEDGE ARTICLES ============
  console.log('\nCreating knowledge articles...');
  await prisma.knowledgeArticle.upsert({
    where: { slug: 'electrical-wiring-guide' },
    update: {},
    create: {
      title: 'Complete Guide to Electrical Wiring for Indian Homes',
      slug: 'electrical-wiring-guide',
      content: `# Complete Guide to Electrical Wiring for Indian Homes

## Why Quality Wiring is Non-Negotiable

In India, electrical fires cause over 25,000 incidents annually. **70% of these fires trace back to poor quality wiring or improper installation.** This guide will help you make the right choices.

## Understanding Wire Sizes

### For Lighting Circuits (1.5 sq mm)
- Use for all light points, fan points, and small appliances
- Can handle up to 15A current
- Color code: Red/Black for live, Blue for neutral, Green for earth

### For Power Sockets (2.5 sq mm)
- Use for all 3-pin sockets, TV points, computer points
- Can handle up to 25A current
- Essential for refrigerators, washing machines, microwaves

### For AC & Geyser (4 sq mm)
- Mandatory for air conditioners, geysers, heavy appliances
- Can handle up to 32A current
- Each AC should have a dedicated circuit

### For Mains (6 sq mm or higher)
- Used for main supply from meter to DB
- Size depends on total connected load
- Always consult a licensed electrician

## Top Brands Comparison

| Brand | Quality | Price | Best For |
|-------|---------|-------|----------|
| Polycab | ⭐⭐⭐⭐ | Mid | All-around choice |
| Havells | ⭐⭐⭐⭐⭐ | Mid-High | Premium homes |
| Finolex | ⭐⭐⭐⭐ | Budget | Cost-conscious |
| RR Kabel | ⭐⭐⭐⭐ | Mid | Industrial use |

## Common Mistakes to Avoid

1. **Using undersized wires** - Causes overheating and fire risk
2. **Skipping FRLS wires** - Non-FRLS wires emit toxic smoke
3. **No color coding** - Makes future maintenance dangerous
4. **Ignoring earthing** - Can be fatal during faults
5. **Buying based on price alone** - Cheap wires cost more in repairs

## Cost Estimation for a 2BHK (1000 sq ft)

- **Budget setup**: ₹15,000 - 20,000
- **Standard setup**: ₹25,000 - 35,000
- **Premium setup**: ₹45,000 - 60,000

*Includes wiring, conduits, and basic accessories*
`,
      category: 'Electrical Guide',
      tags: ['wiring', 'electrical', 'safety', 'guide'],
      authorId: admin.id,
      isPublished: true,
      publishedAt: new Date(),
    },
  });
  console.log('✅ Knowledge articles created');

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📋 Summary:');
  console.log(`   - Categories: ${comprehensiveCategories.length}`);
  console.log(`   - Brands: ${comprehensiveBrands.length}`);
  console.log(`   - Products: ${productCount}`);
  console.log(`   - Dealers: ${dummyDealers.length}`);
  console.log('\n🔐 Test Credentials:');
  console.log('   Admin: admin@hub4estate.com / admin123');
  console.log('   Dealer 1: dealer1@test.com / password123');
  console.log('   Dealer 2: dealer2@test.com / password123');
  console.log('   Dealer 3: dealer3@test.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
