/**
 * Prisma Client Singleton
 * =======================
 * In development, Next.js hot-reloads create new PrismaClient instances
 * on every reload, exhausting the database connection pool. This pattern
 * stores the client on `globalThis` so it persists across hot reloads.
 *
 * In production, a single instance is created per process as normal.
 *
 * Prisma v7: The database URL is passed directly to the PrismaClient
 * constructor since it's no longer in schema.prisma.
 *
 * IMPORTANT: Always import from this file, never from @prisma/client directly.
 */
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
