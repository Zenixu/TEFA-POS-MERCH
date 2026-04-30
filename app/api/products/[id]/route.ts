import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, basePrice, category, categoryId, brand, imageUrl, variants } = body;

    const catId = category || categoryId;

    let newVariantsData: any[] = [];
    if (Array.isArray(variants) && variants.length > 0) {
      newVariantsData = variants.map((v: any) => ({
        size: v.size || "ONE_SIZE",
        color: v.color,
        colorHex: v.colorHex || null,
        stock: v.stock || 0,
        sku: `${(name || "PROD").replace(/\s+/g, "").slice(0, 6).toUpperCase()}-${(v.color || "COL").replace(/\s+/g, "").slice(0, 4).toUpperCase()}-${v.size || "OS"}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      }));
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(basePrice !== undefined && { basePrice }),
        ...(catId && { categoryId: catId }),
        ...(brand !== undefined && { brand }),
        ...(imageUrl !== undefined && { imageUrl }),
        // If there are new variants, create them
        ...(newVariantsData.length > 0 && {
          variants: {
            create: newVariantsData
          }
        })
      },
      include: { variants: true },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("PUT /api/products/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
