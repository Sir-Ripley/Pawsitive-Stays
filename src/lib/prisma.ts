// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Neon connections on Vercel inject DATABASE_URL-style env names (possibly
// with a custom prefix) rather than POSTGRES_PRISMA_URL. Resolve the pooled
// connection string from whichever name exists and hand it to the client.
function resolveDatabaseUrl(): string | undefined {
  if (process.env.POSTGRES_PRISMA_URL) return process.env.POSTGRES_PRISMA_URL;
  const keys = Object.keys(process.env).filter(
    (k) => process.env[k] && /(DATABASE_URL|POSTGRES_URL|PRISMA_URL)/.test(k)
  );
  const pooled = keys.filter((k) => !/UNPOOLED|NON_POOLING|DIRECT/.test(k)).sort();
  return pooled.length ? process.env[pooled[0]] : undefined;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const databaseUrl = resolveDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(databaseUrl ? { datasourceUrl: databaseUrl } : {}),
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
