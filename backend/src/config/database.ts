import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        // Append connection pool params if not already present in DATABASE_URL.
        // connection_limit: max connections per Prisma instance (default is num_cpus * 2 + 1 = ~3 on small instances).
        // pool_timeout: seconds to wait for an available connection before erroring.
        url: appendPoolParams(process.env.DATABASE_URL || ''),
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Ensure the DATABASE_URL has proper connection pool settings.
 * In cluster mode (PM2), each worker gets its own pool — so we set a moderate limit
 * to avoid exhausting RDS max_connections (200) across all workers.
 */
function appendPoolParams(url: string): string {
  if (!url) return url;
  const hasPoolParams = url.includes('connection_limit') || url.includes('pool_timeout');
  if (hasPoolParams) return url;

  const separator = url.includes('?') ? '&' : '?';
  // 10 connections per worker × ~4 workers (PM2 cluster on t3.medium) = ~40 total
  // Leaves headroom for migrations, Prisma Studio, and monitoring
  return `${url}${separator}connection_limit=10&pool_timeout=10`;
}

export default prisma;
