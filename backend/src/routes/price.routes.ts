import { Router, Request, Response } from 'express';
import {
  getPriceHistory,
  getPriceSummary,
  calculateTrend,
  predictPrice,
  comparePrices,
  getCategoryPriceIndex,
  getMarketReport,
} from '../services/price-intelligence.service';

const router = Router();

// GET /history/:productId — price history
// Query params: city (string), days (number)
router.get('/history/:productId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const city = req.query.city as string | undefined;
    const days = req.query.days ? parseInt(req.query.days as string, 10) : undefined;

    if (days !== undefined && (isNaN(days) || days < 1 || days > 365)) {
      res.status(400).json({ error: 'days must be between 1 and 365' });
      return;
    }

    const history = await getPriceHistory(productId, city, days);
    res.json({ productId, city: city ?? null, days: days ?? 90, history });
  } catch (error) {
    console.error('Price history error:', error);
    res.status(500).json({ error: 'Failed to fetch price history' });
  }
});

// GET /summary/:productId — price summary
router.get('/summary/:productId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const summary = await getPriceSummary(productId);

    if (!summary) {
      res.status(404).json({ error: 'No price data available for this product' });
      return;
    }

    res.json({ productId, ...summary });
  } catch (error) {
    console.error('Price summary error:', error);
    res.status(500).json({ error: 'Failed to fetch price summary' });
  }
});

// GET /trend/:productId — price trend
// Query params: city (string), period ('week' | 'month' | 'quarter')
router.get('/trend/:productId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const city = req.query.city as string | undefined;
    const period = (req.query.period as string) || 'month';

    if (!['week', 'month', 'quarter'].includes(period)) {
      res.status(400).json({ error: 'period must be one of: week, month, quarter' });
      return;
    }

    const trend = await calculateTrend(
      productId,
      city,
      period as 'week' | 'month' | 'quarter'
    );

    if (!trend) {
      res.status(404).json({ error: 'No price data available for trend calculation' });
      return;
    }

    res.json({ productId, city: city ?? null, period, ...trend });
  } catch (error) {
    console.error('Price trend error:', error);
    res.status(500).json({ error: 'Failed to calculate price trend' });
  }
});

// GET /predict/:productId — price prediction
// Query params: city (string), daysAhead (number)
router.get('/predict/:productId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const city = req.query.city as string | undefined;
    const daysAhead = req.query.daysAhead
      ? parseInt(req.query.daysAhead as string, 10)
      : undefined;

    if (daysAhead !== undefined && (isNaN(daysAhead) || daysAhead < 1 || daysAhead > 180)) {
      res.status(400).json({ error: 'daysAhead must be between 1 and 180' });
      return;
    }

    const prediction = await predictPrice(productId, city, daysAhead);

    if (!prediction) {
      res.status(404).json({
        error: 'Insufficient data for prediction (need at least 5 data points)',
      });
      return;
    }

    res.json({ productId, city: city ?? null, ...prediction });
  } catch (error) {
    console.error('Price prediction error:', error);
    res.status(500).json({ error: 'Failed to predict price' });
  }
});

// GET /compare/:productId — compare prices across cities
// Query params: cities (comma-separated string)
router.get('/compare/:productId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const citiesParam = req.query.cities as string | undefined;

    if (!citiesParam) {
      res.status(400).json({ error: 'cities query parameter is required (comma-separated)' });
      return;
    }

    const cities = citiesParam
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    if (cities.length === 0) {
      res.status(400).json({ error: 'At least one city is required' });
      return;
    }

    if (cities.length > 20) {
      res.status(400).json({ error: 'Maximum 20 cities allowed' });
      return;
    }

    const comparison = await comparePrices(productId, cities);
    res.json({ productId, comparison });
  } catch (error) {
    console.error('Price comparison error:', error);
    res.status(500).json({ error: 'Failed to compare prices' });
  }
});

// GET /category/:categoryId/index — category price index
// Query params: city (string)
router.get('/category/:categoryId/index', async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const city = req.query.city as string | undefined;

    const index = await getCategoryPriceIndex(categoryId, city);

    if (!index) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json(index);
  } catch (error) {
    console.error('Category price index error:', error);
    res.status(500).json({ error: 'Failed to fetch category price index' });
  }
});

// GET /market-report/:categoryId — market report
// Query params: period ('week' | 'month')
router.get('/market-report/:categoryId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const period = (req.query.period as string) || 'month';

    if (!['week', 'month'].includes(period)) {
      res.status(400).json({ error: 'period must be one of: week, month' });
      return;
    }

    const report = await getMarketReport(
      categoryId,
      period as 'week' | 'month'
    );

    if (!report) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json(report);
  } catch (error) {
    console.error('Market report error:', error);
    res.status(500).json({ error: 'Failed to generate market report' });
  }
});

export default router;
