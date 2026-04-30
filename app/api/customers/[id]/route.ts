import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { firstName, lastName, phone } = await req.json();

    if (!firstName) {
      return NextResponse.json(
        { error: "First name is required" },
        { status: 400 }
      );
    }

    if (phone) {
      const existing = await prisma.customer.findUnique({
        where: { phone },
      });
      if (existing && existing.id !== id) {
        return NextResponse.json(
          { error: "Phone number already registered to another customer" },
          { status: 409 }
        );
      }
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        firstName,
        lastName,
        phone,
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error("PUT /api/customers/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
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

    // Check if customer has orders
    const count = await prisma.order.count({
      where: { customerId: id },
    });

    if (count > 0) {
      return NextResponse.json(
        { error: "Cannot delete customer with existing transaction history" },
        { status: 400 }
      );
    }

    await prisma.customer.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/customers/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}
