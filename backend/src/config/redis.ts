import Redis from 'ioredis';
import { env } from './env';

let redis: Redis | null = null;

/**
 * Get Redis client instance (lazy singleton).
 * Returns null if REDIS_URL is not configured — all cache calls gracefully skip.
 */
export function getRedis(): Redis | null {
  if (redis) return redis;

  const url = env.REDIS_URL;
  if (!url) {
    const log = { level: 'warn', event: 'redis_skip', reason: 'REDIS_URL not set — caching disabled' };
    process.stdout.write(JSON.stringify(log) + '\n');
    return null;
  }

  redis = new Redis(url, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 5) return null; // Stop retrying after 5 attempts
      return Math.min(times * 200, 2000);
    },
    lazyConnect: false,
    enableReadyCheck: true,
    connectTimeout: 5000,
  });

  redis.on('connect', () => {
    const log = { level: 'info', event: 'redis_connected' };
    process.stdout.write(JSON.stringify(log) + '\n');
  });

  redis.on('error', (err) => {
    const log = { level: 'error', event: 'redis_error', error: err.message };
    process.stdout.write(JSON.stringify(log) + '\n');
  });

  return redis;
}

/**
 * Cache helper — get cached value or compute and store it.
 * Falls back to direct computation if Redis is unavailable.
 */
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  compute: () => Promise<T>
): Promise<T> {
  const client = getRedis();

  if (client) {
    try {
      const hit = await client.get(key);
      if (hit) {
        return JSON.parse(hit) as T;
      }
    } catch {
      // Redis read failed — fall through to compute
    }
  }

  const result = await compute();

  if (client) {
    try {
      await client.set(key, JSON.stringify(result), 'EX', ttlSeconds);
    } catch {
      // Redis write failed — result is still returned
    }
  }

  return result;
}

/**
 * Invalidate a specific cache key or pattern.
 */
export async function invalidateCache(pattern: string): Promise<void> {
  const client = getRedis();
  if (!client) return;

  try {
    if (pattern.includes('*')) {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } else {
      await client.del(pattern);
    }
  } catch {
    // Silent fail — cache invalidation is best-effort
  }
}

/**
 * Disconnect Redis on shutdown.
 */
export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
