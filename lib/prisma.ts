import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dns from "dns";

// Force Node.js to prefer IPv4 addresses — Supabase direct DB only
// resolves to IPv6, which may be unreachable from some networks.
dns.setDefaultResultOrder("ipv4first");

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  // Use DIRECT_URL (port 5432) for adapter-pg — PgBouncer on port 6543 is
  // incompatible with the adapter's prepared-statement flow.
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set in environment variables");
  }
  // Prisma v7 requires a driver adapter for the default "client" engine.
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter, log: ["error"] });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
