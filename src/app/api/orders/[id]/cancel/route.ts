import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";
import { checkRateLimit } from "@/lib/rateLimit";
import { canTransitionStatus, VALID_STATUSES } from "@/lib/orderTransitions.mjs";

export async function POST(
  _request: Request,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;

  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rate = await checkRateLimit(`cancel-order:${session.userId}`, 10);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many cancellation requests. Please try again later or contact support." },
        { status: 429 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({
        where: { id },
        include: { items: { select: { productId: true, quantity: true } } },
      });

      if (!current || current.customerId !== session.userId) {
        return { kind: "NOT_FOUND" as const };
      }

      if (!VALID_STATUSES.includes(current.status as (typeof VALID_STATUSES)[number])) {
        return { kind: "INVALID_STATUS" as const };
      }

      if (!canTransitionStatus(current.status as (typeof VALID_STATUSES)[number], "CANCELLED")) {
        return {
          kind: current.status === "CANCELLED" ? "ALREADY_CANCELLED" as const : "NOT_CANCELLABLE" as const,
        };
      }

      // Compare-and-set makes cancellation and stock restoration a single-winner operation.
      const updated = await tx.order.updateMany({
        where: {
          id: current.id,
          customerId: session.userId,
          status: current.status,
          paymentStatus: current.paymentStatus,
        },
        data: { status: "CANCELLED" },
      });

      if (updated.count !== 1) return { kind: "CONFLICT" as const };

      for (const item of current.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return {
        kind: "SUCCESS" as const,
        paymentStatus: current.paymentStatus,
        paymentMethod: current.paymentMethod,
      };
    });

    if (result.kind === "NOT_FOUND") {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    if (result.kind === "ALREADY_CANCELLED") {
      return NextResponse.json({ error: "This order has already been cancelled." }, { status: 409 });
    }
    if (result.kind === "NOT_CANCELLABLE") {
      return NextResponse.json({ error: "This order can no longer be cancelled." }, { status: 409 });
    }
    if (result.kind === "INVALID_STATUS") {
      return NextResponse.json({ error: "This order has an unsupported status and needs support review." }, { status: 409 });
    }
    if (result.kind === "CONFLICT") {
      return NextResponse.json({ error: "This order was updated at the same time. Refresh the page and try again." }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully.",
      paymentStatus: result.paymentStatus,
      paymentMethod: result.paymentMethod,
      refundNeedsManualHandling: result.paymentStatus === "PAID",
    });
  } catch (error) {
    console.error("Customer order cancellation error:", error);
    return NextResponse.json(
      { error: "Could not cancel this order. Please try again or contact support." },
      { status: 500 },
    );
  }
}
