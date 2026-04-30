import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, contactName, phone } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Supplier name is required" },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name,
        contactName,
        phone,
      },
    });

    return NextResponse.json(supplier);
  } catch (error) {
    console.error("PUT /api/suppliers/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update supplier" },
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

    const count = await prisma.purchaseOrder.count({
      where: { supplierId: id },
    });

    if (count > 0) {
      return NextResponse.json(
        { error: "Cannot delete supplier with existing purchase history" },
        { status: 400 }
      );
    }

    await prisma.supplier.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/suppliers/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete supplier" },
      { status: 500 }
    );
  }
}
