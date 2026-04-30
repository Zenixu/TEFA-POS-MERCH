import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateFrom = searchParams.get("from");
    const dateTo = searchParams.get("to");
    const method = searchParams.get("method");
    const limit = parseInt(searchParams.get("limit") || "50");

    const orders = await prisma.order.findMany({
      where: {
        status: "PAID",
        ...(dateFrom || dateTo
          ? {
              createdAt: {
                ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
                ...(dateTo
                  ? { lte: new Date(dateTo + "T23:59:59.999Z") }
                  : {}),
              },
            }
          : {}),
        ...(method ? { paymentMethod: method as never } : {}),
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      paymentMethod,
      cashReceived,
      subtotal,
      discountValue,
      discountType,
      taxRate,
      taxAmount,
      total,
      note,
      cashierName,
      customerId,
      items,
    } = body;

    // Validate stock availability before transaction
    for (const item of items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
      });

      if (!variant) {
        return NextResponse.json(
          { error: `Variant ${item.variantId} not found` },
          { status: 400 }
        );
      }

      if (variant.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Stok tidak cukup untuk ${item.snapshot?.name || "item"} (${variant.color} ${variant.size}). Tersedia: ${variant.stock}, Diminta: ${item.quantity}`,
          },
          { status: 400 }
        );
      }
    }

    // Atomic transaction: create order + order items + decrement stock
    const order = await prisma.$transaction(async (tx) => {
      const changeAmount =
        paymentMethod === "CASH" && cashReceived
          ? cashReceived - total
          : undefined;

      const createdOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          status: "PAID",
          paymentMethod,
          subtotal,
          discountValue: discountValue || 0,
          discountType: discountType || null,
          taxRate: taxRate || 0,
          taxAmount: taxAmount || 0,
          total,
          cashReceived: cashReceived || null,
          changeAmount: changeAmount || null,
          note: note || null,
          cashierName: cashierName || "Kasir",
          customerId: customerId || null,
        },
      });

      // Create order items and decrement stock
      for (const item of items) {
        await tx.orderItem.create({
          data: {
            orderId: createdOrder.id,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            snapshot: item.snapshot || {},
          },
        });

        // Decrement variant stock
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      return createdOrder;
    });

    // Fetch complete order with items
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        customer: true,
        items: {
          include: { product: true, variant: true },
        },
      },
    });

    return NextResponse.json(completeOrder, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
