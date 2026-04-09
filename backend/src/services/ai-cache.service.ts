import crypto from 'crypto';
import { getRedis } from '../config/redis';

// ============================================
// AI CACHE SERVICE
// Reduces redundant AI calls by caching responses.
// Falls back gracefully when Redis is unavailable.
// ============================================

const CACHE_PREFIX = 'ai:cache:';
const TOKEN_PREFIX = 'ai:tokens:';

// TTL by response type (seconds)
const TTL = {
  productExplanation: 24 * 60 * 60,   // 24 hours — product info rarely changes
  productSearch: 60 * 60,              // 1 hour — catalog updates occasionally
  productComparison: 12 * 60 * 60,     // 12 hours
  rfqSuggestion: 30 * 60,             // 30 min — depends on current catalog
  adminInsights: 10 * 60,             // 10 min — should reflect recent data
  dealerPerformance: 60 * 60,         // 1 hour
  quoteParser: 0,                     // Never cache — each input is unique
  chatResponse: 0,                    // Never cache — conversational context matters
} as const;

type CacheCategory = keyof typeof TTL;

/**
 * Generate a deterministic cache key from the input parameters.
 */
function buildCacheKey(category: CacheCategory, params: Record<string, unknown>): string {
  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(params, Object.keys(params).sort()))
    .digest('hex')
    .slice(0, 16);
  return `${CACHE_PREFIX}${category}:${hash}`;
}

/**
 * Try to get a cached AI response. Returns null on miss or error.
 */
export async function getCachedResponse<T>(
  category: CacheCategory,
  params: Record<string, unknown>
): Promise<T | null> {
  if (TTL[category] === 0) return null; // Skip cache for non-cacheable categories

  const redis = getRedis();
  if (!redis) return null;

  try {
    const key = buildCacheKey(category, params);
    const cached = await redis.get(key);
    if (cached) {
      // Track cache hit for monitoring
      await redis.hincrby(`${CACHE_PREFIX}stats`, 'hits', 1).catch(() => {});
      return JSON.parse(cached) as T;
    }
    await redis.hincrby(`${CACHE_PREFIX}stats`, 'misses', 1).catch(() => {});
  } catch {
    // Silent fail — cache miss
  }
  return null;
}

/**
 * Store an AI response in cache.
 */
export async function setCachedResponse(
  category: CacheCategory,
  params: Record<string, unknown>,
  data: unknown
): Promise<void> {
  if (TTL[category] === 0) return;

  const redis = getRedis();
  if (!redis) return;

  try {
    const key = buildCacheKey(category, params);
    await redis.set(key, JSON.stringify(data), 'EX', TTL[category]);
  } catch {
    // Silent fail
  }
}

// ============================================
// TOKEN BUDGET TRACKING
// Tracks daily AI API token usage per model tier.
// ============================================

interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  model: string;
}

const DAILY_TOKEN_LIMITS: Record<string, number> = {
  'claude-opus-4-6': 500_000,      // Premium model — strict budget
  'claude-sonnet-4-6': 2_000_000,  // Mid-tier — moderate budget
  'claude-haiku-4-5-20251001': 10_000_000, // Fast/cheap — generous budget
};

/**
 * Record token usage for a model. Returns remaining budget.
 */
export async function recordTokenUsage(usage: TokenUsage): Promise<{
  totalUsed: number;
  limit: number;
  remaining: number;
  isOverBudget: boolean;
}> {
  const redis = getRedis();
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const key = `${TOKEN_PREFIX}${usage.model}:${today}`;
  const totalTokens = usage.inputTokens + usage.outputTokens;
  const limit = DAILY_TOKEN_LIMITS[usage.model] || 5_000_000;

  if (!redis) {
    return { totalUsed: totalTokens, limit, remaining: limit - totalTokens, isOverBudget: false };
  }

  try {
    const current = await redis.incrby(key, totalTokens);
    // Set expiry to 48 hours (covers timezone edge cases)
    if (current === totalTokens) {
      await redis.expire(key, 48 * 60 * 60);
    }
    const remaining = Math.max(0, limit - current);
    return { totalUsed: current, limit, remaining, isOverBudget: current > limit };
  } catch {
    return { totalUsed: totalTokens, limit, remaining: limit, isOverBudget: false };
  }
}

/**
 * Check if we're within budget for a model before making an API call.
 */
export async function checkTokenBudget(model: string): Promise<{
  withinBudget: boolean;
  percentUsed: number;
  shouldDowngrade: boolean;
}> {
  const redis = getRedis();
  const today = new Date().toISOString().slice(0, 10);
  const key = `${TOKEN_PREFIX}${model}:${today}`;
  const limit = DAILY_TOKEN_LIMITS[model] || 5_000_000;

  if (!redis) {
    return { withinBudget: true, percentUsed: 0, shouldDowngrade: false };
  }

  try {
    const used = parseInt(await redis.get(key) || '0', 10);
    const percentUsed = (used / limit) * 100;
    return {
      withinBudget: used < limit,
      percentUsed,
      shouldDowngrade: percentUsed > 80, // Suggest downgrade at 80% usage
    };
  } catch {
    return { withinBudget: true, percentUsed: 0, shouldDowngrade: false };
  }
}

/**
 * Select the optimal model based on budget and task complexity.
 * Auto-downgrades from Opus to Sonnet to Haiku as budgets deplete.
 */
export async function selectModel(preferredModel: string, taskComplexity: 'low' | 'medium' | 'high' = 'medium'): Promise<string> {
  const MODEL_TIERS = [
    'claude-opus-4-6',
    'claude-sonnet-4-6',
    'claude-haiku-4-5-20251001',
  ];

  // Low complexity tasks always use Haiku
  if (taskComplexity === 'low') {
    return 'claude-haiku-4-5-20251001';
  }

  const preferredIdx = MODEL_TIERS.indexOf(preferredModel);
  const startIdx = preferredIdx >= 0 ? preferredIdx : (taskComplexity === 'high' ? 0 : 1);

  // Try each tier starting from preferred, downgrade if over budget
  for (let i = startIdx; i < MODEL_TIERS.length; i++) {
    const budget = await checkTokenBudget(MODEL_TIERS[i]);
    if (budget.withinBudget && !budget.shouldDowngrade) {
      return MODEL_TIERS[i];
    }
    // If we're at >80% but still within budget, only downgrade if not the last tier
    if (budget.withinBudget && i < MODEL_TIERS.length - 1) {
      continue;
    }
  }

  // Fallback to cheapest tier
  return 'claude-haiku-4-5-20251001';
}

// ============================================
// CACHE STATS (for admin dashboard)
// ============================================

export async function getCacheStats(): Promise<{
  hits: number;
  misses: number;
  hitRate: string;
  tokenUsage: Record<string, { used: number; limit: number; percent: string }>;
}> {
  const redis = getRedis();
  if (!redis) {
    return { hits: 0, misses: 0, hitRate: 'N/A', tokenUsage: {} };
  }

  try {
    const stats = await redis.hgetall(`${CACHE_PREFIX}stats`);
    const hits = parseInt(stats.hits || '0', 10);
    const misses = parseInt(stats.misses || '0', 10);
    const total = hits + misses;
    const hitRate = total > 0 ? `${((hits / total) * 100).toFixed(1)}%` : 'N/A';

    const today = new Date().toISOString().slice(0, 10);
    const tokenUsage: Record<string, { used: number; limit: number; percent: string }> = {};

    for (const [model, limit] of Object.entries(DAILY_TOKEN_LIMITS)) {
      const used = parseInt(await redis.get(`${TOKEN_PREFIX}${model}:${today}`) || '0', 10);
      tokenUsage[model] = {
        used,
        limit,
        percent: `${((used / limit) * 100).toFixed(1)}%`,
      };
    }

    return { hits, misses, hitRate, tokenUsage };
  } catch {
    return { hits: 0, misses: 0, hitRate: 'N/A', tokenUsage: {} };
  }
}
