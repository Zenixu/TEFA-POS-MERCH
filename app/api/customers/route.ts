import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const customers = await prisma.customer.findMany({
      where: search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
      include: {
        _count: { select: { orders: true } },
      },
      orderBy: { firstName: "asc" },
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error("GET /api/customers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
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
      if (existing) {
        return NextResponse.json(
          { error: "Phone number already registered" },
          { status: 409 }
        );
      }
    }

    const customer = await prisma.customer.create({
      data: {
        firstName,
        lastName,
        phone,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("POST /api/customers error:", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}
