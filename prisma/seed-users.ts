import { config as loadEnv } from "dotenv";
loadEnv();

async function seedUsers() {
  // Dynamic import so dotenv runs first
  const { prisma } = await import("../lib/prisma");
  const bcrypt = await import("bcryptjs");

  console.log("👤 Seeding default users...");

  const existingManager = await prisma.user.findUnique({
    where: { email: "manager@tefa.com" },
  });

  if (!existingManager) {
    await prisma.user.create({
      data: {
        email: "manager@tefa.com",
        passwordHash: await bcrypt.hash("manager123", 12),
        firstName: "Admin",
        lastName: "Manager",
        role: "MANAGER",
      },
    });
    console.log("  ✅ manager@tefa.com / manager123 (MANAGER)");
  } else {
    console.log("  ⏭️  manager@tefa.com already exists");
  }

  const existingCashier = await prisma.user.findUnique({
    where: { email: "kasir@tefa.com" },
  });

  if (!existingCashier) {
    await prisma.user.create({
      data: {
        email: "kasir@tefa.com",
        passwordHash: await bcrypt.hash("kasir123", 12),
        firstName: "Kasir",
        lastName: "Utama",
        role: "CASHIER",
      },
    });
    console.log("  ✅ kasir@tefa.com / kasir123 (CASHIER)");
  } else {
    console.log("  ⏭️  kasir@tefa.com already exists");
  }

  await prisma.$disconnect();
}

seedUsers()
  .then(() => {
    console.log("\n🎉 User seeding complete!");
  })
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  });
