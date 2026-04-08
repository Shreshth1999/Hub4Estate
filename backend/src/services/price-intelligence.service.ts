import prisma from '../config/database';

// ────────────────────────────────────────────────────────────────────────────
// Linear Regression Helper
// ────────────────────────────────────────────────────────────────────────────

function linearRegression(
  points: { x: number; y: number }[]
): { slope: number; intercept: number; r2: number } {
  const n = points.length;
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) {
    return { slope: 0, intercept: n > 0 ? sumY / n : 0, r2: 0 };
  }

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  // R-squared
  const meanY = sumY / n;
  const ssRes = points.reduce(
    (s, p) => s + (p.y - (slope * p.x + intercept)) ** 2,
    0
  );
  const ssTot = points.reduce((s, p) => s + (p.y - meanY) ** 2, 0);
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  return { slope, intercept, r2 };
}

// ────────────────────────────────────────────────────────────────────────────
// Helper: period string to days
// ────────────────────────────────────────────────────────────────────────────

function periodToDays(period: 'week' | 'month' | 'quarter'): number {
  switch (period) {
    case 'week':
      return 7;
    case 'month':
      return 30;
    case 'quarter':
      return 90;
  }
}

function periodToLabel(period: 'week' | 'month' | 'quarter'): string {
  switch (period) {
    case 'week':
      return 'weekly';
    case 'month':
      return 'monthly';
    case 'quarter':
      return 'quarterly';
  }
}

// ────────────────────────────────────────────────────────────────────────────
// 1. recordPrice
// ────────────────────────────────────────────────────────────────────────────

export async function recordPrice(data: {
  productId: string;
  dealerId?: string;
  price: number;
  source: string;
  city: string;
}): Promise<{ id: string; pricePaise: number; createdAt: Date }> {
  const pricePaise = Math.round(data.price * 100);

  const point = await prisma.priceDataPoint.create({
    data: {
      productId: data.productId,
      dealerId: data.dealerId ?? null,
      pricePaise,
      source: data.source,
      city: data.city,
    },
  });

  return { id: point.id, pricePaise: point.pricePaise, createdAt: point.createdAt };
}

// ────────────────────────────────────────────────────────────────────────────
// 2. getPriceHistory
// ────────────────────────────────────────────────────────────────────────────

export async function getPriceHistory(
  productId: string,
  city?: string,
  days: number = 90
): Promise<
  Array<{ price: number; date: Date; dealer: string | null; source: string }>
> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const where: Record<string, unknown> = {
    productId,
    createdAt: { gte: since },
  };
  if (city) {
    where.city = city;
  }

  const points = await prisma.priceDataPoint.findMany({
    where,
    orderBy: { createdAt: 'asc' },
  });

  return points.map((p) => ({
    price: p.pricePaise / 100,
    date: p.createdAt,
    dealer: p.dealerId,
    source: p.source,
  }));
}

// ────────────────────────────────────────────────────────────────────────────
// 3. calculateTrend
// ────────────────────────────────────────────────────────────────────────────

export async function calculateTrend(
  productId: string,
  city?: string,
  period: 'week' | 'month' | 'quarter' = 'month'
): Promise<{
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  medianPrice: number;
  trendDirection: 'up' | 'down' | 'stable';
  changePercent: number;
  quoteCount: number;
} | null> {
  const days = periodToDays(period);
  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - days);
  const periodEnd = new Date();

  const where: Record<string, unknown> = {
    productId,
    createdAt: { gte: periodStart, lte: periodEnd },
  };
  if (city) {
    where.city = city;
  }

  const points = await prisma.priceDataPoint.findMany({
    where,
    orderBy: { createdAt: 'asc' },
  });

  if (points.length === 0) {
    return null;
  }

  const prices = points.map((p) => p.pricePaise);
  const sorted = [...prices].sort((a, b) => a - b);

  const avg = Math.round(prices.reduce((s, p) => s + p, 0) / prices.length);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  // Median
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
      : sorted[mid];

  // Percentiles
  const p25Idx = Math.floor(sorted.length * 0.25);
  const p75Idx = Math.floor(sorted.length * 0.75);
  const p25 = sorted[p25Idx];
  const p75 = sorted[Math.min(p75Idx, sorted.length - 1)];

  // Trend direction: compare first half average to second half average
  const halfLen = Math.floor(prices.length / 2);
  const firstHalf = prices.slice(0, Math.max(halfLen, 1));
  const secondHalf = prices.slice(Math.max(halfLen, 1));

  const firstAvg =
    firstHalf.reduce((s, p) => s + p, 0) / firstHalf.length;
  const secondAvg =
    secondHalf.length > 0
      ? secondHalf.reduce((s, p) => s + p, 0) / secondHalf.length
      : firstAvg;

  const changePct =
    firstAvg === 0 ? 0 : ((secondAvg - firstAvg) / firstAvg) * 100;

  let trendDirection: 'up' | 'down' | 'stable';
  if (changePct > 2) {
    trendDirection = 'up';
  } else if (changePct < -2) {
    trendDirection = 'down';
  } else {
    trendDirection = 'stable';
  }

  // Upsert PriceTrend record
  const periodLabel = periodToLabel(period);
  await prisma.priceTrend.upsert({
    where: {
      productId_city_period_periodStart: {
        productId,
        city: city ?? '',
        period: periodLabel,
        periodStart,
      },
    },
    create: {
      productId,
      city: city ?? null,
      period: periodLabel,
      avgPricePaise: avg,
      minPricePaise: min,
      maxPricePaise: max,
      medianPricePaise: median,
      p25PricePaise: p25,
      p75PricePaise: p75,
      quoteCount: prices.length,
      trendDirection,
      changePercent: Math.round(changePct * 100) / 100,
      periodStart,
      periodEnd,
    },
    update: {
      avgPricePaise: avg,
      minPricePaise: min,
      maxPricePaise: max,
      medianPricePaise: median,
      p25PricePaise: p25,
      p75PricePaise: p75,
      quoteCount: prices.length,
      trendDirection,
      changePercent: Math.round(changePct * 100) / 100,
      periodEnd,
    },
  });

  return {
    avgPrice: avg / 100,
    minPrice: min / 100,
    maxPrice: max / 100,
    medianPrice: median / 100,
    trendDirection,
    changePercent: Math.round(changePct * 100) / 100,
    quoteCount: prices.length,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// 4. getPriceSummary
// ────────────────────────────────────────────────────────────────────────────

export async function getPriceSummary(productId: string): Promise<{
  currentAvg: number;
  lowestAvailable: number;
  highestQuoted: number;
  trendDirection: 'up' | 'down' | 'stable';
  priceRange: { min: number; max: number };
  numDealers: number;
} | null> {
  // Use last 30 days of data for "current" market
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const points = await prisma.priceDataPoint.findMany({
    where: {
      productId,
      createdAt: { gte: since },
    },
  });

  if (points.length === 0) {
    return null;
  }

  const prices = points.map((p) => p.pricePaise);
  const avg = Math.round(prices.reduce((s, p) => s + p, 0) / prices.length);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  // Count unique dealers
  const uniqueDealers = new Set(
    points.filter((p) => p.dealerId).map((p) => p.dealerId)
  );

  // Trend: compare first half to second half
  const sorted = [...points].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );
  const halfLen = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, Math.max(halfLen, 1));
  const secondHalf = sorted.slice(Math.max(halfLen, 1));

  const firstAvg =
    firstHalf.reduce((s, p) => s + p.pricePaise, 0) / firstHalf.length;
  const secondAvg =
    secondHalf.length > 0
      ? secondHalf.reduce((s, p) => s + p.pricePaise, 0) / secondHalf.length
      : firstAvg;

  const changePct =
    firstAvg === 0 ? 0 : ((secondAvg - firstAvg) / firstAvg) * 100;

  let trendDirection: 'up' | 'down' | 'stable';
  if (changePct > 2) {
    trendDirection = 'up';
  } else if (changePct < -2) {
    trendDirection = 'down';
  } else {
    trendDirection = 'stable';
  }

  return {
    currentAvg: avg / 100,
    lowestAvailable: min / 100,
    highestQuoted: max / 100,
    trendDirection,
    priceRange: { min: min / 100, max: max / 100 },
    numDealers: uniqueDealers.size,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// 5. predictPrice
// ────────────────────────────────────────────────────────────────────────────

export async function predictPrice(
  productId: string,
  city?: string,
  daysAhead: number = 30
): Promise<{
  predictedPrice: number;
  confidence: number;
  predictedFor: Date;
} | null> {
  // Gather historical data (last 180 days)
  const since = new Date();
  since.setDate(since.getDate() - 180);

  const where: Record<string, unknown> = {
    productId,
    createdAt: { gte: since },
  };
  if (city) {
    where.city = city;
  }

  const points = await prisma.priceDataPoint.findMany({
    where,
    orderBy: { createdAt: 'asc' },
  });

  // Need at least 5 data points for meaningful regression
  if (points.length < 5) {
    return null;
  }

  // Convert to x (days since first point), y (price in paise)
  const t0 = points[0].createdAt.getTime();
  const regressionPoints = points.map((p) => ({
    x: (p.createdAt.getTime() - t0) / (1000 * 60 * 60 * 24), // days
    y: p.pricePaise,
  }));

  const { slope, intercept, r2 } = linearRegression(regressionPoints);

  // Predict for daysAhead from the last data point
  const lastX = regressionPoints[regressionPoints.length - 1].x;
  const predictX = lastX + daysAhead;
  const predictedPaise = Math.round(slope * predictX + intercept);

  // Ensure predicted price is non-negative
  const finalPaise = Math.max(0, predictedPaise);

  // Confidence is based on R-squared and data quantity
  // More data + better fit = higher confidence
  const dataQualityFactor = Math.min(1, points.length / 30); // max out at 30 points
  const confidence = Math.round(Math.max(0, Math.min(1, r2 * 0.7 + dataQualityFactor * 0.3)) * 100) / 100;

  // Confidence interval: +/- based on residual standard error
  const meanY = points.reduce((s, p) => s + p.pricePaise, 0) / points.length;
  const residualStdErr = Math.sqrt(
    regressionPoints.reduce(
      (s, p) => s + (p.y - (slope * p.x + intercept)) ** 2,
      0
    ) / Math.max(1, regressionPoints.length - 2)
  );
  const confidenceLow = Math.max(0, Math.round(finalPaise - 1.96 * residualStdErr));
  const confidenceHigh = Math.round(finalPaise + 1.96 * residualStdErr);

  const predictedFor = new Date();
  predictedFor.setDate(predictedFor.getDate() + daysAhead);

  // Determine recommendation
  let recommendation: string;
  if (slope < -0.5 && r2 > 0.3) {
    recommendation = 'wait'; // price is trending down with decent fit
  } else if (slope > 0.5 && r2 > 0.3) {
    recommendation = 'buy_now'; // price is trending up
  } else {
    recommendation = 'neutral';
  }

  // Store prediction
  await prisma.predictedPrice.create({
    data: {
      productId,
      city: city ?? 'all',
      predictedPaise: finalPaise,
      confidenceLow,
      confidenceHigh,
      confidenceScore: confidence,
      model: 'linear_regression_v1',
      features: JSON.stringify({
        dataPoints: points.length,
        daysOfHistory: lastX,
        slope,
        intercept,
        r2,
        daysAhead,
      }),
      recommendation,
      validUntil: predictedFor,
    },
  });

  return {
    predictedPrice: finalPaise / 100,
    confidence,
    predictedFor,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// 6. getCategoryPriceIndex
// ────────────────────────────────────────────────────────────────────────────

export async function getCategoryPriceIndex(
  categoryId: string,
  city?: string
): Promise<{
  categoryId: string;
  categoryName: string;
  avgPrice: number;
  productCount: number;
  trends: Array<{
    productId: string;
    productName: string;
    avgPrice: number;
    trendDirection: string;
    changePercent: number;
  }>;
  topMovers: Array<{
    productId: string;
    productName: string;
    changePercent: number;
    direction: string;
  }>;
} | null> {
  // Get category with its products via SubCategory -> ProductType -> Product
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      subCategories: {
        include: {
          productTypes: {
            include: {
              products: {
                where: { isActive: true },
                select: { id: true, name: true },
              },
            },
          },
        },
      },
    },
  });

  if (!category) {
    return null;
  }

  // Flatten all product IDs in this category
  const products: Array<{ id: string; name: string }> = [];
  for (const sub of category.subCategories) {
    for (const pt of sub.productTypes) {
      for (const prod of pt.products) {
        products.push({ id: prod.id, name: prod.name });
      }
    }
  }

  if (products.length === 0) {
    return {
      categoryId,
      categoryName: category.name,
      avgPrice: 0,
      productCount: 0,
      trends: [],
      topMovers: [],
    };
  }

  const productIds = products.map((p) => p.id);
  const productNameMap = new Map(products.map((p) => [p.id, p.name]));

  // Get last 30 days of price data for all products in category
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const where: Record<string, unknown> = {
    productId: { in: productIds },
    createdAt: { gte: since },
  };
  if (city) {
    where.city = city;
  }

  const allPoints = await prisma.priceDataPoint.findMany({
    where,
    orderBy: { createdAt: 'asc' },
  });

  // Group by productId
  const byProduct = new Map<string, typeof allPoints>();
  for (const p of allPoints) {
    if (!p.productId) continue;
    const arr = byProduct.get(p.productId) ?? [];
    arr.push(p);
    byProduct.set(p.productId, arr);
  }

  // Compute per-product trends
  const trends: Array<{
    productId: string;
    productName: string;
    avgPrice: number;
    trendDirection: string;
    changePercent: number;
  }> = [];

  let totalPriceSum = 0;
  let totalPriceCount = 0;

  for (const [prodId, pts] of byProduct.entries()) {
    const prices = pts.map((p) => p.pricePaise);
    const avg = prices.reduce((s, p) => s + p, 0) / prices.length;

    const halfLen = Math.floor(pts.length / 2);
    const firstHalf = pts.slice(0, Math.max(halfLen, 1));
    const secondHalf = pts.slice(Math.max(halfLen, 1));

    const firstAvg =
      firstHalf.reduce((s, p) => s + p.pricePaise, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.length > 0
        ? secondHalf.reduce((s, p) => s + p.pricePaise, 0) /
          secondHalf.length
        : firstAvg;

    const changePct =
      firstAvg === 0 ? 0 : ((secondAvg - firstAvg) / firstAvg) * 100;
    const direction =
      changePct > 2 ? 'up' : changePct < -2 ? 'down' : 'stable';

    trends.push({
      productId: prodId,
      productName: productNameMap.get(prodId) ?? 'Unknown',
      avgPrice: Math.round(avg) / 100,
      trendDirection: direction,
      changePercent: Math.round(changePct * 100) / 100,
    });

    totalPriceSum += avg;
    totalPriceCount++;
  }

  // Top movers: sorted by absolute change percent
  const topMovers = [...trends]
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
    .slice(0, 10)
    .map((t) => ({
      productId: t.productId,
      productName: t.productName,
      changePercent: t.changePercent,
      direction: t.trendDirection,
    }));

  const categoryAvg =
    totalPriceCount > 0
      ? Math.round(totalPriceSum / totalPriceCount) / 100
      : 0;

  return {
    categoryId,
    categoryName: category.name,
    avgPrice: categoryAvg,
    productCount: products.length,
    trends,
    topMovers,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// 7. getPriceAlerts
// ────────────────────────────────────────────────────────────────────────────

/**
 * Returns price alerts for a user.
 * Since there is no dedicated PriceAlert model, this checks the user's
 * saved products and compares the current lowest price against the price
 * at the time they saved it. If the price has dropped, it is returned
 * as an alert.
 */
export async function getPriceAlerts(userId: string): Promise<
  Array<{
    productId: string;
    productName: string;
    savedAt: Date;
    currentLowest: number;
    previousAvg: number;
    dropPercent: number;
  }>
> {
  const savedProducts = await prisma.savedProduct.findMany({
    where: { userId },
    include: {
      product: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (savedProducts.length === 0) {
    return [];
  }

  const alerts: Array<{
    productId: string;
    productName: string;
    savedAt: Date;
    currentLowest: number;
    previousAvg: number;
    dropPercent: number;
  }> = [];

  for (const saved of savedProducts) {
    const productId = saved.productId;

    // Price at time of save: average of points in 7 days before save
    const saveDateStart = new Date(saved.createdAt);
    saveDateStart.setDate(saveDateStart.getDate() - 7);

    const beforeSave = await prisma.priceDataPoint.findMany({
      where: {
        productId,
        createdAt: { gte: saveDateStart, lte: saved.createdAt },
      },
    });

    // Current price: last 7 days
    const recentStart = new Date();
    recentStart.setDate(recentStart.getDate() - 7);

    const recent = await prisma.priceDataPoint.findMany({
      where: {
        productId,
        createdAt: { gte: recentStart },
      },
    });

    if (beforeSave.length === 0 || recent.length === 0) {
      continue;
    }

    const previousAvg =
      beforeSave.reduce((s, p) => s + p.pricePaise, 0) / beforeSave.length;
    const currentLowest = Math.min(...recent.map((p) => p.pricePaise));

    const dropPercent =
      previousAvg === 0
        ? 0
        : ((previousAvg - currentLowest) / previousAvg) * 100;

    // Only alert if price dropped by at least 3%
    if (dropPercent >= 3) {
      alerts.push({
        productId,
        productName: saved.product.name,
        savedAt: saved.createdAt,
        currentLowest: currentLowest / 100,
        previousAvg: Math.round(previousAvg) / 100,
        dropPercent: Math.round(dropPercent * 100) / 100,
      });
    }
  }

  return alerts;
}

// ────────────────────────────────────────────────────────────────────────────
// 8. comparePrices
// ────────────────────────────────────────────────────────────────────────────

export async function comparePrices(
  productId: string,
  cities: string[]
): Promise<
  Array<{
    city: string;
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    numQuotes: number;
  }>
> {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const results: Array<{
    city: string;
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    numQuotes: number;
  }> = [];

  for (const city of cities) {
    const points = await prisma.priceDataPoint.findMany({
      where: {
        productId,
        city,
        createdAt: { gte: since },
      },
    });

    if (points.length === 0) {
      results.push({
        city,
        avgPrice: 0,
        minPrice: 0,
        maxPrice: 0,
        numQuotes: 0,
      });
      continue;
    }

    const prices = points.map((p) => p.pricePaise);
    const avg = Math.round(prices.reduce((s, p) => s + p, 0) / prices.length);

    results.push({
      city,
      avgPrice: avg / 100,
      minPrice: Math.min(...prices) / 100,
      maxPrice: Math.max(...prices) / 100,
      numQuotes: prices.length,
    });
  }

  return results;
}

// ────────────────────────────────────────────────────────────────────────────
// 9. getMarketReport
// ────────────────────────────────────────────────────────────────────────────

export async function getMarketReport(
  categoryId: string,
  period: 'week' | 'month' = 'month'
): Promise<{
  categoryId: string;
  categoryName: string;
  period: string;
  totalDataPoints: number;
  avgPrice: number;
  trends: Array<{
    productId: string;
    productName: string;
    avgPrice: number;
    changePercent: number;
    direction: string;
  }>;
  biggestMovers: {
    up: Array<{ productId: string; productName: string; changePercent: number }>;
    down: Array<{ productId: string; productName: string; changePercent: number }>;
  };
  avgSavingsPercent: number;
} | null> {
  const days = periodToDays(period);
  const since = new Date();
  since.setDate(since.getDate() - days);

  // Get category and its products
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      subCategories: {
        include: {
          productTypes: {
            include: {
              products: {
                where: { isActive: true },
                select: { id: true, name: true },
              },
            },
          },
        },
      },
    },
  });

  if (!category) {
    return null;
  }

  const products: Array<{ id: string; name: string }> = [];
  for (const sub of category.subCategories) {
    for (const pt of sub.productTypes) {
      for (const prod of pt.products) {
        products.push({ id: prod.id, name: prod.name });
      }
    }
  }

  if (products.length === 0) {
    return {
      categoryId,
      categoryName: category.name,
      period: periodToLabel(period),
      totalDataPoints: 0,
      avgPrice: 0,
      trends: [],
      biggestMovers: { up: [], down: [] },
      avgSavingsPercent: 0,
    };
  }

  const productIds = products.map((p) => p.id);
  const productNameMap = new Map(products.map((p) => [p.id, p.name]));

  const allPoints = await prisma.priceDataPoint.findMany({
    where: {
      productId: { in: productIds },
      createdAt: { gte: since },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Group by product
  const byProduct = new Map<string, typeof allPoints>();
  for (const p of allPoints) {
    if (!p.productId) continue;
    const arr = byProduct.get(p.productId) ?? [];
    arr.push(p);
    byProduct.set(p.productId, arr);
  }

  const trends: Array<{
    productId: string;
    productName: string;
    avgPrice: number;
    changePercent: number;
    direction: string;
  }> = [];

  let totalPriceSum = 0;
  let totalCount = 0;
  let totalSavingsPercent = 0;
  let savingsCount = 0;

  for (const [prodId, pts] of byProduct.entries()) {
    const prices = pts.map((p) => p.pricePaise);
    const avg = prices.reduce((s, p) => s + p, 0) / prices.length;

    const halfLen = Math.floor(pts.length / 2);
    const firstHalf = pts.slice(0, Math.max(halfLen, 1));
    const secondHalf = pts.slice(Math.max(halfLen, 1));

    const firstAvg =
      firstHalf.reduce((s, p) => s + p.pricePaise, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.length > 0
        ? secondHalf.reduce((s, p) => s + p.pricePaise, 0) /
          secondHalf.length
        : firstAvg;

    const changePct =
      firstAvg === 0 ? 0 : ((secondAvg - firstAvg) / firstAvg) * 100;
    const direction =
      changePct > 2 ? 'up' : changePct < -2 ? 'down' : 'stable';

    trends.push({
      productId: prodId,
      productName: productNameMap.get(prodId) ?? 'Unknown',
      avgPrice: Math.round(avg) / 100,
      changePercent: Math.round(changePct * 100) / 100,
      direction,
    });

    totalPriceSum += avg;
    totalCount++;

    // Savings: difference between max and min price as % of max
    // This represents the max potential savings through the platform
    const maxP = Math.max(...prices);
    const minP = Math.min(...prices);
    if (maxP > 0) {
      totalSavingsPercent += ((maxP - minP) / maxP) * 100;
      savingsCount++;
    }
  }

  // Sort by absolute change to find biggest movers
  const sortedByChange = [...trends].sort(
    (a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent)
  );

  const moversUp = sortedByChange
    .filter((t) => t.direction === 'up')
    .slice(0, 5)
    .map((t) => ({
      productId: t.productId,
      productName: t.productName,
      changePercent: t.changePercent,
    }));

  const moversDown = sortedByChange
    .filter((t) => t.direction === 'down')
    .slice(0, 5)
    .map((t) => ({
      productId: t.productId,
      productName: t.productName,
      changePercent: t.changePercent,
    }));

  return {
    categoryId,
    categoryName: category.name,
    period: periodToLabel(period),
    totalDataPoints: allPoints.length,
    avgPrice: totalCount > 0 ? Math.round(totalPriceSum / totalCount) / 100 : 0,
    trends,
    biggestMovers: { up: moversUp, down: moversDown },
    avgSavingsPercent:
      savingsCount > 0
        ? Math.round((totalSavingsPercent / savingsCount) * 100) / 100
        : 0,
  };
}
