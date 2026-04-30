import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Today's orders
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: todayStart },
        status: "PAID",
      },
      include: {
        items: {
          include: { product: true, variant: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate stats
    const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
    const totalTransactions = orders.length;
    const averageTransaction =
      totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Payment breakdown
    const paymentBreakdown = {
      CASH: orders.filter((o) => o.paymentMethod === "CASH").length,
      CARD: orders.filter((o) => o.paymentMethod === "CARD").length,
      QRIS: orders.filter((o) => o.paymentMethod === "QRIS").length,
    };

    const revenueByMethod = {
      CASH: orders
        .filter((o) => o.paymentMethod === "CASH")
        .reduce((s, o) => s + o.total, 0),
      CARD: orders
        .filter((o) => o.paymentMethod === "CARD")
        .reduce((s, o) => s + o.total, 0),
      QRIS: orders
        .filter((o) => o.paymentMethod === "QRIS")
        .reduce((s, o) => s + o.total, 0),
    };

    // Top products
    const productSales: Record<
      string,
      { name: string; quantity: number; revenue: number }
    > = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const key = item.productId;
        if (!productSales[key]) {
          productSales[key] = {
            name: item.product.name,
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[key].quantity += item.quantity;
        productSales[key].revenue += item.subtotal;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Hourly sales
    const hourlySales = Array.from({ length: 24 }, (_, i) => ({
      hour: `${String(i).padStart(2, "0")}:00`,
      sales: 0,
      revenue: 0,
    }));

    orders.forEach((order) => {
      const hour = new Date(order.createdAt).getHours();
      hourlySales[hour].sales += 1;
      hourlySales[hour].revenue += order.total;
    });

    // Low stock alerts
    const lowStockVariants = await prisma.productVariant.findMany({
      where: { stock: { lt: 5 } },
      include: { product: true },
      orderBy: { stock: "asc" },
      take: 20,
    });

    // Customer & Supplier stats
    const totalCustomers = await prisma.customer.count();
    const totalSuppliers = await prisma.supplier.count();

    return NextResponse.json({
      totalRevenue,
      totalTransactions,
      averageTransaction,
      paymentBreakdown,
      revenueByMethod,
      topProducts,
      hourlySales,
      lowStockVariants,
      totalCustomers,
      totalSuppliers,
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
