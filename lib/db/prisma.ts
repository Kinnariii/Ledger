/**
 * Prisma Client Singleton with Driver Adapter (v7)
 * ===============================================
 * In Prisma v7, the database connection URL is managed via the driver adapter.
 * We use `@prisma/adapter-pg` with the `pg` package to handle PostgreSQL connections.
 * 
 * In development, Next.js hot-reloads create new PrismaClient instances
 * on every reload, exhausting the database connection pool. This pattern
 * stores the client on `globalThis` so it persists across hot reloads.
 *
 * In production, a single instance is created per process as normal.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

const connectionString = process.env.DATABASE_URL;

// Ensure pool is also a singleton in development to prevent connection leaks
const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pool = pool;
}

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
