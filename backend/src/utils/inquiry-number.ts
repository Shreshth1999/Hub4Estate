import prisma from '../config/database';

/**
 * Generate a unique inquiry number in format: HUB-{BRAND}-{CATEGORY}-{NNNN}
 * Example: HUB-HAVELLS-MCB-0001
 *
 * Falls back to HUB-GEN-{NNNN} if brand/category not identified.
 */
export async function generateInquiryNumber(
  brandName?: string | null,
  categoryName?: string | null
): Promise<string> {
  const brandSlug = brandName
    ? brandName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)
    : 'GEN';

  const categorySlug = categoryName
    ? categoryName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
    : 'INQ';

  const prefix = `HUB-${brandSlug}-${categorySlug}`;

  // Find the latest inquiry number with this prefix
  const latest = await prisma.productInquiry.findFirst({
    where: {
      inquiryNumber: {
        startsWith: prefix,
      },
    },
    orderBy: { createdAt: 'desc' },
    select: { inquiryNumber: true },
  });

  let nextNumber = 1;
  if (latest?.inquiryNumber) {
    const match = latest.inquiryNumber.match(/-(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `${prefix}-${nextNumber.toString().padStart(4, '0')}`;
}
