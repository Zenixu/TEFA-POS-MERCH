import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const variant = await prisma.productVariant.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(variant);
  } catch (error) {
    console.error("PUT /api/variants/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update variant" },
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
    await prisma.productVariant.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/variants/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete variant" },
      { status: 500 }
    );
  }
}
