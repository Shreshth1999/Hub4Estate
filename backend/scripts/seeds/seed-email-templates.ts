/**
 * Hub4Estate B2B Email Templates Seeder
 * Run with: npx ts-node src/seed-email-templates.ts
 */

import prisma from './config/database';

const { emailTemplates } = require('../prisma/email-templates-data');

async function seedEmailTemplates() {
  console.log('📧 Seeding B2B Email Templates...\n');

  try {
    let created = 0;
    let updated = 0;

    for (const template of emailTemplates) {
      const existing = await prisma.emailTemplate.findUnique({
        where: { name: template.name },
      });

      if (existing) {
        await prisma.emailTemplate.update({
          where: { name: template.name },
          data: template,
        });
        console.log(`  ↻ Updated: ${template.name}`);
        updated++;
      } else {
        await prisma.emailTemplate.create({
          data: template,
        });
        console.log(`  ✓ Created: ${template.name}`);
        created++;
      }
    }

    console.log(`\n✅ Email Templates: ${created} created, ${updated} updated`);
    console.log('\n📊 Templates by Category:');

    const categories = await prisma.emailTemplate.groupBy({
      by: ['category'],
      _count: true,
    });

    categories.forEach((cat: any) => {
      console.log(`   ${cat.category}: ${cat._count}`);
    });

  } catch (error) {
    console.error('❌ Error seeding templates:', error);
    throw error;
  }
}

seedEmailTemplates()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
