import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/readJsonBody";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getValidAdminSession } from "@/lib/adminSession";

const optionalText = (max: number) =>
  z.preprocess(
    (value) => (value === "" ? null : value),
    z.string().trim().max(max).nullable().optional()
  );

const positivePrice = z
  .union([z.string(), z.number()])
  .transform((value) => Number(value))
  .refine((value) => Number.isFinite(value) && value > 0, {
    message: "Price must be a valid positive amount",
  });

const optionalMrp = z
  .union([z.string(), z.number(), z.null()])
  .transform((value) =>
    value === null || value === "" ? null : Number(value)
  )
  .refine(
    (value) => value === null || (Number.isFinite(value) && value > 0),
    { message: "MRP must be a valid positive amount" }
  );

const optionalStock = z
  .union([z.string(), z.number()])
  .transform((value) => (value === "" ? 0 : Number(value)))
  .refine(
    (value) => Number.isSafeInteger(value) && value >= 0 && value <= 10000000,
    { message: "Stock must be a whole number between 0 and 10000000" }
  );

const patchSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    description: optionalText(10000),
    price: positivePrice.optional(),
    mrp: optionalMrp.optional(),
    image: optionalText(2048),
    category: optionalText(100),
    stock: optionalStock.optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    { message: "No valid product fields supplied" }
  );

function isPrismaRecordNotFound(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2025"
  );
}

// GET single product
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    if (!(await getValidAdminSession())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const product = await prisma.product.findUnique({
      where: { id: id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Admin get product error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PATCH — update only validated product fields
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    if (!(await getValidAdminSession())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bodyResult = await readJsonBody(request, 16384);
    if (!bodyResult.ok) {
      return NextResponse.json(
        { error: bodyResult.error },
        { status: bodyResult.status }
      );
    }
    const body: unknown = bodyResult.data;

    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid product details" },
        { status: 400 }
      );
    }

    const input = parsed.data;
    const current = await prisma.product.findUnique({
      where: { id: id },
      select: { id: true, price: true, mrp: true },
    });

    if (!current) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const nextPrice = input.price ?? Number(current.price);
    const nextMrp =
      input.mrp === undefined
        ? current.mrp === null
          ? null
          : Number(current.mrp)
        : input.mrp;

    if (nextMrp !== null && nextMrp < nextPrice) {
      return NextResponse.json(
        { error: "MRP cannot be lower than selling price" },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id: id },
      data: input,
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    if (isPrismaRecordNotFound(error)) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    console.error("Admin update product error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE — preserve existing soft-delete behavior for products in orders
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    if (!(await getValidAdminSession())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const product = await prisma.product.findUnique({
      where: { id: id },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if product is used in any order
    const orderItemCount = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (orderItemCount > 0) {
      // Soft delete — just mark inactive
      await prisma.product.update({
        where: { id: id },
        data: { isActive: false },
      });
      return NextResponse.json({
        success: true,
        message: "Product deactivated (used in existing orders)",
      });
    }

    await prisma.product.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("Admin delete product error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
