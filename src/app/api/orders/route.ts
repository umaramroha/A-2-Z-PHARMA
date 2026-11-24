import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/readJsonBody";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";
import { calculateDeliveryFee } from "@/lib/deliveryRules.mjs";
import {
  aggregateOrderItems,
  hasExcessOrderQuantity,
} from "@/lib/orderQuantities.mjs";

const orderInputSchema = z.object({
  customerName: z.string().trim().min(1).max(100),
  customerMobile: z
    .string()
    .trim()
    .min(10)
    .max(20)
    .regex(/^[+0-9()\s-]+$/, "Enter a valid mobile number"),
  customerEmail: z.union([z.string().trim().email().max(254), z.literal("")]).optional(),
  address: z.string().trim().min(1).max(500),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  paymentMethod: z.enum(["cod", "upi"]),
  items: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(100),
        quantity: z.number().int().min(1).max(100),
      })
    )
    .min(1)
    .max(50),
});

// GET — fetch logged-in user's orders
export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { customerId: session.userId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, image: true, slug: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST — create an order using prices and stock verified on the server
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: "Please login to place an order" },
        { status: 401 }
      );
    }

    const bodyResult = await readJsonBody(request, 32768);
    if (!bodyResult.ok) {
      return NextResponse.json(
        { error: bodyResult.error },
        { status: bodyResult.status }
      );
    }
    const body: unknown = bodyResult.data;

    const parsed = orderInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid order details" },
        { status: 400 }
      );
    }

    const input = parsed.data;

    // Merge duplicate IDs before stock checks and persistence.
    const quantityEntries = aggregateOrderItems(input.items);
    if (hasExcessOrderQuantity(quantityEntries)) {
      return NextResponse.json(
        { error: "Maximum quantity per product is 100" },
        { status: 400 }
      );
    }

    const order = await prisma.$transaction(async (tx) => {
      const productIds = quantityEntries.map(([productId]) => productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, isActive: true },
        select: { id: true, price: true, stock: true },
      });

      if (products.length !== productIds.length) {
        throw new Error("PRODUCT_UNAVAILABLE");
      }

      const productsById = new Map(products.map((product) => [product.id, product]));
      let subtotal = new Prisma.Decimal(0);

      for (const [productId, quantity] of quantityEntries) {
        const product = productsById.get(productId);
        if (!product) throw new Error("PRODUCT_UNAVAILABLE");

        if (product.stock < quantity) {
          throw new Error("INSUFFICIENT_STOCK");
        }

        subtotal = subtotal.add(product.price.mul(quantity));
      }

      // Reuse the shared exact-decimal delivery rule; never trust client totals.
      const deliveryFee = new Prisma.Decimal(
        calculateDeliveryFee(subtotal.toString()),
      );
      const total = subtotal.add(deliveryFee);

      // Reserve stock atomically. Any failure rolls back the entire transaction.
      for (const [productId, quantity] of quantityEntries) {
        const updated = await tx.product.updateMany({
          where: {
            id: productId,
            isActive: true,
            stock: { gte: quantity },
          },
          data: { stock: { decrement: quantity } },
        });

        if (updated.count !== 1) {
          throw new Error("INSUFFICIENT_STOCK");
        }
      }

      return tx.order.create({
        data: {
          customerId: session.userId,
          customerName: input.customerName,
          customerMobile: input.customerMobile,
          customerEmail: input.customerEmail || null,
          address: input.address,
          city: input.city,
          state: input.state,
          pincode: input.pincode,
          subtotal,
          deliveryFee,
          total,
          status: "PENDING",
          paymentMethod: input.paymentMethod,
          // UPI is not gateway-verified in this project yet; never mark it paid here.
          paymentStatus: "PENDING",
          items: {
            create: quantityEntries.map(([productId, quantity]) => ({
              productId,
              quantity,
              price: productsById.get(productId)!.price,
            })),
          },
        },
        include: { items: true },
      });
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    if (error instanceof Error && error.message === "PRODUCT_UNAVAILABLE") {
      return NextResponse.json(
        { error: "One or more products are unavailable. Please refresh your cart." },
        { status: 409 }
      );
    }

    if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") {
      return NextResponse.json(
        { error: "Some products do not have enough stock. Please update your cart." },
        { status: 409 }
      );
    }

    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Failed to create order. Please try again." },
      { status: 500 }
    );
  }
}
