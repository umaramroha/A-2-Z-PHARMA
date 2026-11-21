import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getValidAdminSession } from "@/lib/adminSession";

const VALID_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

const VALID_PAYMENT_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const;

const patchSchema = z
  .object({
    status: z.enum(VALID_STATUSES).optional(),
    paymentStatus: z.enum(VALID_PAYMENT_STATUSES).optional(),
  })
  .refine((data) => data.status !== undefined || data.paymentStatus !== undefined, {
    message: "Nothing to update",
  });

const STATUS_ORDER: Record<(typeof VALID_STATUSES)[number], number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  DELIVERED: 4,
  CANCELLED: -1,
};

function canTransitionStatus(
  current: (typeof VALID_STATUSES)[number],
  next: (typeof VALID_STATUSES)[number]
) {
  if (current === next || current === "CANCELLED" || current === "DELIVERED") {
    return false;
  }

  if (next === "CANCELLED") {
    return ["PENDING", "CONFIRMED", "PROCESSING"].includes(current);
  }

  return STATUS_ORDER[next] > STATUS_ORDER[current];
}

function canTransitionPayment(
  current: (typeof VALID_PAYMENT_STATUSES)[number],
  next: (typeof VALID_PAYMENT_STATUSES)[number]
) {
  if (current === next || current === "REFUNDED") return false;
  if (current === "PENDING") return next === "PAID" || next === "FAILED";
  if (current === "FAILED") return next === "PENDING";
  return current === "PAID" && next === "REFUNDED";
}

// GET single order
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    if (!(await getValidAdminSession())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: {
          select: { id: true, name: true, email: true, mobile: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Admin get order error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// PATCH — update order/payment status with guarded transitions
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    if (!(await getValidAdminSession())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid update" },
        { status: 400 }
      );
    }

    const input = parsed.data;

    const updated = await prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({
        where: { id: id },
        include: { items: { select: { productId: true, quantity: true } } },
      });

      if (!current) throw new Error("ORDER_NOT_FOUND");

      const updateData: { status?: string; paymentStatus?: string } = {};

      if (input.status) {
        if (!VALID_STATUSES.includes(current.status as (typeof VALID_STATUSES)[number])) {
          throw new Error("INVALID_CURRENT_STATUS");
        }

        if (
          !canTransitionStatus(
            current.status as (typeof VALID_STATUSES)[number],
            input.status
          )
        ) {
          throw new Error("INVALID_STATUS_TRANSITION");
        }

        updateData.status = input.status;
      }

      if (input.paymentStatus) {
        if (
          !VALID_PAYMENT_STATUSES.includes(
            current.paymentStatus as (typeof VALID_PAYMENT_STATUSES)[number]
          )
        ) {
          throw new Error("INVALID_CURRENT_PAYMENT_STATUS");
        }

        if (
          !canTransitionPayment(
            current.paymentStatus as (typeof VALID_PAYMENT_STATUSES)[number],
            input.paymentStatus
          )
        ) {
          throw new Error("INVALID_PAYMENT_TRANSITION");
        }

        updateData.paymentStatus = input.paymentStatus;
      }

      // Compare-and-set prevents two concurrent admin updates from restoring stock twice.
      const result = await tx.order.updateMany({
        where: {
          id: current.id,
          status: current.status,
          paymentStatus: current.paymentStatus,
        },
        data: updateData,
      });

      if (result.count !== 1) throw new Error("ORDER_UPDATE_CONFLICT");

      if (input.status === "CANCELLED") {
        for (const item of current.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      return tx.order.findUnique({
        where: { id: current.id },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, image: true, slug: true },
              },
            },
          },
        },
      });
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "ORDER_NOT_FOUND") {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      if (
        error.message === "INVALID_STATUS_TRANSITION" ||
        error.message === "INVALID_PAYMENT_TRANSITION"
      ) {
        return NextResponse.json(
          { error: "This status change is not allowed" },
          { status: 409 }
        );
      }

      if (error.message === "ORDER_UPDATE_CONFLICT") {
        return NextResponse.json(
          { error: "Order was updated by another request. Please refresh and try again." },
          { status: 409 }
        );
      }

      if (
        error.message === "INVALID_CURRENT_STATUS" ||
        error.message === "INVALID_CURRENT_PAYMENT_STATUS"
      ) {
        return NextResponse.json(
          { error: "Order has an unsupported current status and needs review" },
          { status: 409 }
        );
      }
    }

    console.error("Admin update order error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
