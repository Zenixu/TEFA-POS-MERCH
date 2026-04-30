import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(category ? { categoryId: category } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { brand: { contains: search, mode: "insensitive" } },
                {
                  variants: {
                    some: {
                      sku: { contains: search, mode: "insensitive" },
                    },
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        category: true,
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, basePrice, category, brand, imageUrl, variants } = body;
    const catId = category || body.categoryId;

    // variants is an array of { size, color, colorHex, stock }
    // For backwards compat, also handle old format
    let variantData: { size: string; color: string; colorHex: string | null; stock: number; sku: string }[] = [];

    if (Array.isArray(variants) && variants.length > 0) {
      variantData = variants.map((v: { size: string; color: string; colorHex?: string | null; stock: number }) => ({
        size: v.size || "ONE_SIZE",
        color: v.color,
        colorHex: v.colorHex || null,
        stock: v.stock || 0,
        sku: `${name.replace(/\s+/g, "").slice(0, 6).toUpperCase()}-${v.color.replace(/\s+/g, "").slice(0, 4).toUpperCase()}-${v.size || "OS"}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      }));
    } else if (body.initialColor) {
      // Legacy single variant support
      variantData = [{
        size: body.initialSize || "ONE_SIZE",
        color: body.initialColor,
        colorHex: null,
        stock: parseInt(body.initialStock) || 0,
        sku: `${name.replace(/\s+/g, "").slice(0, 6).toUpperCase()}-${body.initialColor.replace(/\s+/g, "").slice(0, 4).toUpperCase()}-${body.initialSize || "OS"}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      }];
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        basePrice,
        categoryId: category,
        brand,
        imageUrl,
        variants: variantData.length > 0 ? { create: variantData } : undefined,
      },
      include: { variants: true, category: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
