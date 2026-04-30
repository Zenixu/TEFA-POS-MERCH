import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const adapter = new PrismaPg(new pg.Pool({ connectionString: process.env.DATABASE_URL! }));
const prisma = new PrismaClient({ adapter, log: ["error"] });

async function main() {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("✅ Connection successful:", result);
  } catch (e) {
    console.error("❌ Connection failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
