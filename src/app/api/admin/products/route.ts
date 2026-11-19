import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { adminSessionOptions } from "@/lib/adminSession";

type AdminSessionData = {
  adminId?: string;
  email?: string;
  role?: string;
  isAdminLoggedIn: boolean;
};

async function isAdmin() {
  const session = await getIronSession<AdminSessionData>(
    cookies(),
    adminSessionOptions
  );
  return session.isAdminLoggedIn && session.adminId;
}

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

const productSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    slug: z
      .string()
      .trim()
      .min(1)
      .max(200)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug can contain lowercase letters, numbers and hyphens only"),
    description: optionalText(10000),
    price: positivePrice,
    mrp: z
      .union([z.string(), z.number(), z.null()])
      .transform((value) =>
        value === null || value === "" ? null : Number(value)
      )
      .refine(
        (value) => value === null || (Number.isFinite(value) && value > 0),
        { message: "MRP must be a valid positive amount" }
      ),
    image: optionalText(2048),
    category: optionalText(100),
    stock: z
      .union([z.string(), z.number()])
      .transform((value) => (value === "" ? 0 : Number(value)))
      .refine(
        (value) => Number.isSafeInteger(value) && value >= 0 && value <= 10000000,
        { message: "Stock must be a whole number between 0 and 10000000" }
      ),
  })
  .refine((data) => data.mrp === null || data.mrp >= data.price, {
    message: "MRP cannot be lower than selling price",
    path: ["mrp"],
  });

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

// GET all products (admin — includes inactive)
export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Admin get products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST — create new product
export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid product details" },
        { status: 400 }
      );
    }

    const input = parsed.data;
    const existing = await prisma.product.findUnique({
      where: { slug: input.slug },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 409 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description || null,
        price: input.price,
        mrp: input.mrp,
        image: input.image || null,
        category: input.category || null,
        stock: input.stock,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 409 }
      );
    }

    console.error("Admin create product error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
