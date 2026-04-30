import { prisma } from "../lib/prisma";

async function main() {
  console.log("Dropping ClothingSize enum if it exists...");
  try {
    await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "ClothingSize" CASCADE;`);
    console.log("Done.");
  } catch (err) {
    console.log("Error:", err);
  }
}

main().finally(() => prisma.$disconnect());
