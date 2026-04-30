import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Prevent deletion if products exist
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    if (category._count.products > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with associated products" },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/categories/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
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
    const { name } = await req.json();
    
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Check unique constraint
    const existing = await prisma.category.findFirst({
      where: {
        name: name.trim(),
        NOT: { id }
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Category name already exists" }, { status: 400 });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: { name: name.trim() }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/categories/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}
