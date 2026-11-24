import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseProductListingParams } from "@/lib/productListing.mjs";

export async function GET(request: Request) {
  try {
    const params = parseProductListingParams(new URL(request.url).searchParams);
    if (!params) {
      return NextResponse.json(
        { error: "Invalid product listing filters" },
        { status: 400 }
      );
    }

    const where: {
      isActive: boolean;
      category?: string;
      OR?: Array<Record<string, unknown>>;
      price?: { gte?: number; lte?: number };
    } = { isActive: true };

    if (params.category) where.category = params.category;
    if (params.q) {
      where.OR = [
        { name: { contains: params.q, mode: "insensitive" } },
        { description: { contains: params.q, mode: "insensitive" } },
      ];
    }
    if (params.minPrice !== null || params.maxPrice !== null) {
      where.price = {};
      if (params.minPrice !== null) where.price.gte = params.minPrice;
      if (params.maxPrice !== null) where.price.lte = params.maxPrice;
    }

    const orderBy =
      params.sort === "price-asc" ? { price: "asc" as const } :
      params.sort === "price-desc" ? { price: "desc" as const } :
      params.sort === "name" ? { name: "asc" as const } :
      { createdAt: "desc" as const };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page: params.page,
        pageSize: params.pageSize,
        total,
        totalPages: Math.ceil(total / params.pageSize),
      },
    });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
