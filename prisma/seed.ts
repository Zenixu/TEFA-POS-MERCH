import "dotenv/config";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🚀 Seeding started...");

  // 1. Cleanup old data
  console.log("🧹 Cleaning up old data...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.supplier.deleteMany();
  // Don't delete users to avoid locking yourself out, but upsert the admin

  // 2. Admin User
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@tefamerch.com" },
    update: { passwordHash: hashedPassword },
    create: {
      email: "admin@tefamerch.com",
      passwordHash: hashedPassword,
      firstName: "Super",
      lastName: "Admin",
      role: "SUPERADMIN",
    }
  });
  console.log("👤 Admin user ready (admin@tefamerch.com / admin123)");

  // 3. Categories
  const categories = [
    { name: "Apparel" },
    { name: "Accessories" },
    { name: "Bags" },
    { name: "Headwear" },
    { name: "Stationery" }
  ];

  const createdCategories = [];
  for (const cat of categories) {
    const c = await prisma.category.create({ data: cat });
    createdCategories.push(c);
  }
  console.log(`📂 Created ${createdCategories.length} categories`);

  const [catApparel, catAccessory, catBags, catHeadwear, catStationery] = createdCategories;

  // 4. Products & Variants
  const products = [
    // Apparel
    {
      name: "T-Shirt Classic Logo",
      description: "Kaos premium 100% Cotton Combed 30s.",
      basePrice: 150000,
      categoryId: catApparel.id,
      brand: "TEFA Origin",
      imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600",
      variants: [
        { sku: "TS-BLK-S", color: "Hitam", colorHex: "#000000", size: "S", stock: 20 },
        { sku: "TS-BLK-M", color: "Hitam", colorHex: "#000000", size: "M", stock: 25 },
        { sku: "TS-BLK-L", color: "Hitam", colorHex: "#000000", size: "L", stock: 15 },
        { sku: "TS-WHT-M", color: "Putih", colorHex: "#FFFFFF", size: "M", stock: 30 },
      ]
    },
    {
      name: "Essential Oversized Hoodie",
      description: "Hoodie fleece tebal dengan potongan oversized.",
      basePrice: 350000,
      categoryId: catApparel.id,
      brand: "TEFA Origin",
      imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600",
      variants: [
        { sku: "HD-GRY-L", color: "Grey", colorHex: "#808080", size: "L", stock: 10 },
        { sku: "HD-GRY-XL", color: "Grey", colorHex: "#808080", size: "XL", stock: 5 },
        { sku: "HD-BLK-L", color: "Black", colorHex: "#000000", size: "L", stock: 12 },
      ]
    },
    // Headwear
    {
      name: "Vintage Dad Cap",
      description: "Topi baseball dengan finishing washed vintage.",
      basePrice: 125000,
      categoryId: catHeadwear.id,
      brand: "TEFA Headwear",
      imageUrl: "https://images.unsplash.com/photo-1588850567047-3806b81f577a?q=80&w=600",
      variants: [
        { sku: "CP-NVY-OS", color: "Navy", colorHex: "#000080", size: "All Size", stock: 40 },
        { sku: "CP-KHK-OS", color: "Khaki", colorHex: "#C3B091", size: "All Size", stock: 35 },
      ]
    },
    {
      name: "Beanie Knit Soft",
      description: "Beanie rajut lembut untuk cuaca dingin.",
      basePrice: 85000,
      categoryId: catHeadwear.id,
      brand: "TEFA Headwear",
      imageUrl: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?q=80&w=600",
      variants: [
        { sku: "BN-BLK-OS", color: "Black", colorHex: "#000000", size: "All Size", stock: 50 },
      ]
    },
    // Bags
    {
      name: "Canvas Tote Bag XL",
      description: "Tote bag kanvas super kuat untuk belanja atau laptop.",
      basePrice: 95000,
      categoryId: catBags.id,
      brand: "TEFA Eco",
      imageUrl: "https://images.unsplash.com/photo-1597404294360-feeeda04612e?q=80&w=600",
      variants: [
        { sku: "TB-CRM-OS", color: "Cream", colorHex: "#F5F5DC", size: "OS", stock: 100 },
      ]
    },
    {
      name: "Urban Backpack 20L",
      description: "Backpack minimalis dengan kompartemen laptop.",
      basePrice: 450000,
      categoryId: catBags.id,
      brand: "TEFA Travel",
      imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600",
      variants: [
        { sku: "BP-BLK-OS", color: "Matte Black", colorHex: "#1A1A1A", size: "OS", stock: 15 },
      ]
    },
    // Stationery
    {
      name: "Notebook Dot Matrix",
      description: "Buku catatan hardcover dengan kertas 100gsm.",
      basePrice: 75000,
      categoryId: catStationery.id,
      brand: "TEFA Write",
      imageUrl: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?q=80&w=600",
      variants: [
        { sku: "NB-BLU-A5", color: "Blue", colorHex: "#0000FF", size: "A5", stock: 60 },
      ]
    }
  ];

  for (const p of products) {
    const { variants, ...prodData } = p;
    await prisma.product.create({
      data: {
        ...prodData,
        variants: {
          create: variants
        }
      }
    });
  }
  console.log(`👕 Created ${products.length} products with variants`);

  // 5. Customers & Suppliers
  await prisma.customer.createMany({
    data: [
      { firstName: "Ahmad", lastName: "Fauzi", phone: "081211112222" },
      { firstName: "Siska", lastName: "Putri", phone: "081333334444" },
      { firstName: "Bambang", lastName: "Pamungkas", phone: "081999998888" },
      { firstName: "Dewi", lastName: "Sartika", phone: "085777776666" },
      { firstName: "Rian", lastName: "Hidayat", phone: "081288887777" },
    ]
  });

  await prisma.supplier.createMany({
    data: [
      { name: "Vendor Garmen Bandung", contactName: "Pak Haji", phone: "081122334455" },
      { name: "Percetakan Jaya", contactName: "Ibu Ani", phone: "087766554433" },
      { name: "Suplier Tas Impor", contactName: "Mr. Chen", phone: "089988776655" },
    ]
  });
  console.log("👥 Created customers and suppliers");

  // 6. Generate random orders for historical data (last 7 days)
  console.log("📊 Generating historical orders for dashboard...");
  const allVariants = await prisma.productVariant.findMany({
    include: { product: true }
  });

  const paymentMethods: any[] = ["CASH", "CARD", "QRIS"];
  
  for (let i = 0; i < 50; i++) {
    const randomVariant = allVariants[Math.floor(Math.random() * allVariants.length)];
    const quantity = Math.floor(Math.random() * 3) + 1;
    const unitPrice = randomVariant.price || randomVariant.product.basePrice;
    const subtotal = unitPrice * quantity;
    const taxAmount = subtotal * 0.11;
    const total = subtotal + taxAmount;
    
    // Random date in the last 7 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 7));
    date.setHours(Math.floor(Math.random() * 12) + 9); // Business hours 09:00 - 21:00

    await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}-${i}`,
        status: "PAID",
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        subtotal,
        taxAmount,
        total,
        cashierName: "Super Admin",
        createdAt: date,
        items: {
          create: {
            productId: randomVariant.productId,
            variantId: randomVariant.id,
            quantity,
            unitPrice,
            subtotal,
            snapshot: {
              name: randomVariant.product.name,
              size: randomVariant.size,
              color: randomVariant.color
            } as any
          }
        }
      }
    });
  }

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
