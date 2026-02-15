/**
 * One-time cleanup script to deactivate duplicate categories
 * from the old seed that overlap with comprehensive catalog categories.
 *
 * Run with: npx ts-node src/cleanup-duplicate-categories.ts
 */

import prisma from './config/database';

const DUPLICATE_SLUGS = [
  'electrical-wiring',    // duplicate of wires-cables
  'led-lighting',         // covered by lighting
  'mcbs-switchgear',      // duplicate of mcbs-distribution
  'fans',                 // duplicate of fans-ventilation
  'earthing-lightning',   // duplicate of earthing-safety-systems
  'smart-home',           // duplicate of smart-electrical-automation
  'solar-renewable',      // duplicate of power-backup-solar
  'ups-power-backup',     // duplicate of power-backup-solar
  'meters-instruments',   // duplicate of tools-testers
  'tools-safety',         // duplicate of tools-testers
];

async function cleanup() {
  console.log('Deactivating duplicate categories...\n');

  for (const slug of DUPLICATE_SLUGS) {
    try {
      const cat = await prisma.category.findUnique({ where: { slug } });
      if (!cat) {
        console.log(`  - ${slug}: not found (skipping)`);
        continue;
      }
      if (!cat.isActive) {
        console.log(`  - ${slug}: already inactive`);
        continue;
      }

      await prisma.category.update({
        where: { slug },
        data: { isActive: false },
      });
      console.log(`  ✓ ${slug}: deactivated`);
    } catch (err: any) {
      console.error(`  ✗ ${slug}: ${err.message}`);
    }
  }

  // Also fix sortOrder for remaining categories
  const keeperOrder: Record<string, number> = {
    'wires-cables': 1,
    'switches-sockets': 2,
    'mcbs-distribution': 3,
    'switchgear-protection': 4,
    'lighting': 5,
    'lighting-luminaires': 6,
    'fans-ventilation': 7,
    'water-heaters': 8,
    'earthing-safety-systems': 9,
    'power-backup-solar': 10,
    'doorbells-accessories': 11,
    'conduits-accessories': 12,
    'tools-testers': 13,
    'smart-electrical-automation': 14,
  };

  console.log('\nFixing sortOrder for active categories...\n');
  for (const [slug, order] of Object.entries(keeperOrder)) {
    try {
      await prisma.category.update({
        where: { slug },
        data: { sortOrder: order },
      });
      console.log(`  ✓ ${slug}: sortOrder = ${order}`);
    } catch (err: any) {
      console.error(`  ✗ ${slug}: ${err.message}`);
    }
  }

  const remaining = await prisma.category.count({ where: { isActive: true } });
  console.log(`\n✅ Done! ${remaining} active categories remaining.\n`);
}

cleanup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
