import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, size, color, colorHex, sku, stock, price } = body;

    const variant = await prisma.productVariant.create({
      data: {
        productId,
        size,
        color,
        colorHex,
        sku,
        stock: stock || 0,
        price: price || null,
      },
    });

    return NextResponse.json(variant, { status: 201 });
  } catch (error) {
    console.error("POST /api/variants error:", error);
    return NextResponse.json(
      { error: "Failed to create variant" },
      { status: 500 }
    );
  }
}
