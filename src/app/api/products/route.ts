import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawCategory = searchParams.get("category");
    const rawQuery = searchParams.get("q");
    const category = rawCategory?.trim() || null;
    const q = rawQuery?.trim() || null;

    // Bound user-controlled filters before sending them to the database.
    if ((category && category.length > 100) || (q && q.length > 100)) {
      return NextResponse.json(
        { error: "Search filters must be 100 characters or fewer" },
        { status: 400 }
      );
    }

    const where: any = { isActive: true };

    if (category) {
      where.category = category;
    }

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
