import { prisma } from "../lib/prisma";

async function main() {
  console.log("Seeding started...");

  // 1. Membersihkan data lama
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.supplier.deleteMany();

  // 2. Buat User Admin (karena force reset menghapus seluruh table)
  const bcrypt = require("bcryptjs");
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: {
      email: "admin@tefamerch.com",
      passwordHash: hashedPassword,
      firstName: "Super",
      lastName: "Admin",
      role: "SUPERADMIN",
    }
  });

  // 3. Buat Kategori
  const catApparel = await prisma.category.create({ data: { name: "Apparel" } });
  const catAccessory = await prisma.category.create({ data: { name: "Accessories" } });
  const catBags = await prisma.category.create({ data: { name: "Bags" } });

  // 4. Buat Produk Dummy dengan Gambar
  const tShirt = await prisma.product.create({
    data: {
      name: "T-Shirt Classic Logo",
      description: "Kaos berbahan katun lembut dengan logo bordir.",
      basePrice: 150000,
      categoryId: catApparel.id,
      brand: "TEFA Original",
      imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop",
      variants: {
        create: [
          { sku: "TSHIRT-BLK-M-1", color: "Hitam", colorHex: "#000000", size: "M", stock: 15 },
          { sku: "TSHIRT-BLK-L-1", color: "Hitam", colorHex: "#000000", size: "L", stock: 20 },
          { sku: "TSHIRT-WHT-L-1", color: "Putih", colorHex: "#FFFFFF", size: "L", stock: 10 }
        ]
      }
    }
  });

  const hoodie = await prisma.product.create({
    data: {
      name: "Essential Oversized Hoodie",
      description: "Hoodie tebal dengan potongan oversized yang nyaman.",
      basePrice: 350000,
      categoryId: catApparel.id,
      brand: "TEFA Origin",
      imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop",
      variants: {
        create: [
          { sku: "HOOD-GRY-L-1", color: "Abu-abu", colorHex: "#808080", size: "L", stock: 8 },
          { sku: "HOOD-GRY-XL-1", color: "Abu-abu", colorHex: "#808080", size: "XL", stock: 12 },
        ]
      }
    }
  });

  const cap = await prisma.product.create({
    data: {
      name: "Vintage Dad Cap",
      description: "Topi bergaya vintage dengan bordir rapi.",
      basePrice: 99000,
      categoryId: catAccessory.id,
      brand: "Lokal pride",
      imageUrl: "https://images.unsplash.com/photo-1521369909029-2afed882baee?q=80&w=600&auto=format&fit=crop",
      variants: {
        create: [
          { sku: "CAP-NAVY-OS", color: "Navy", colorHex: "#000080", size: "ONE_SIZE", stock: 30 },
          { sku: "CAP-OLIVE-OS", color: "Olive", colorHex: "#808000", size: "ONE_SIZE", stock: 25 },
        ]
      }
    }
  });
  
  const tote = await prisma.product.create({
    data: {
      name: "Signature Canvas Tote",
      description: "Tote bag kanvas super tebal, cocok untuk laptop.",
      basePrice: 120000,
      categoryId: catBags.id,
      brand: "TEFA Eco",
      imageUrl: "https://images.unsplash.com/photo-1597404294360-feeeda04612e?q=80&w=600&auto=format&fit=crop",
      variants: {
        create: [
          { sku: "TOTE-CRM-OS", color: "Cream", colorHex: "#FFFDD0", size: "ONE_SIZE", stock: 40 },
        ]
      }
    }
  });

  // 5. Buat Beberapa Customer dan Supplier dummy
  await prisma.customer.createMany({
    data: [
      { firstName: "Budi", lastName: "Santoso", phone: "081234567890" },
      { firstName: "Siti", lastName: "Aminah", phone: "081987654321" },
      { firstName: "Reza", lastName: "Rahadian", phone: "085612344321" },
    ]
  });

  await prisma.supplier.createMany({
    data: [
      { name: "Vendor Kain Bandung", contactName: "Mang Oleh", phone: "081324121212" },
      { name: "Pabrik Bordir Jaya", contactName: "Pak Jaya", phone: "087788998899" },
    ]
  });

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
