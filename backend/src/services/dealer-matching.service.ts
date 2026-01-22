import prisma from '../config/database';

interface RFQWithItems {
  id: string;
  deliveryPincode: string;
  items: Array<{
    product: {
      brandId: string;
      productType: {
        subCategory: {
          categoryId: string;
        };
      };
    };
  }>;
}

export async function matchDealersForRFQ(rfq: RFQWithItems): Promise<string[]> {
  try {
    // Extract unique brand IDs and category IDs from RFQ
    const brandIds = Array.from(
      new Set(rfq.items.map((item) => item.product.brandId))
    );
    const categoryIds = Array.from(
      new Set(rfq.items.map((item) => item.product.productType.subCategory.categoryId))
    );

    // Find dealers that match criteria
    const dealers = await prisma.dealer.findMany({
      where: {
        status: 'VERIFIED',
        brandMappings: {
          some: {
            brandId: { in: brandIds },
            isVerified: true,
          },
        },
        categoryMappings: {
          some: {
            categoryId: { in: categoryIds },
          },
        },
        serviceAreas: {
          some: {
            pincode: rfq.deliveryPincode,
          },
        },
      },
      select: {
        id: true,
      },
    });

    return dealers.map((d) => d.id);
  } catch (error) {
    console.error('Dealer matching error:', error);
    return [];
  }
}

export async function updateDealerPerformanceMetrics(dealerId: string) {
  try {
    const dealer = await prisma.dealer.findUnique({
      where: { id: dealerId },
      include: {
        quotes: {
          select: {
            status: true,
            submittedAt: true,
          },
        },
      },
    });

    if (!dealer) {
      return;
    }

    const totalQuotes = dealer.quotes.length;
    const conversions = dealer.quotes.filter((q) => q.status === 'SELECTED').length;
    const conversionRate = totalQuotes > 0 ? conversions / totalQuotes : 0;

    await prisma.dealer.update({
      where: { id: dealerId },
      data: {
        totalQuotesSubmitted: totalQuotes,
        totalConversions: conversions,
        conversionRate,
      },
    });
  } catch (error) {
    console.error('Update dealer metrics error:', error);
  }
}
