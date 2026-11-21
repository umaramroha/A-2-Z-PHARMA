import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getValidAdminSession } from "@/lib/adminSession";

export async function GET() {
  try {
    if (!(await getValidAdminSession())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [totalOrders, pendingOrders, totalProducts, totalCustomers, revenueResult] =
      await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: "PENDING" } }),
        prisma.product.count({ where: { isActive: true } }),
        prisma.customer.count(),
        prisma.order.aggregate({
          _sum: { total: true },
          where: { status: { not: "CANCELLED" } },
        }),
      ]);

    return NextResponse.json({
      totalOrders,
      pendingOrders,
      totalProducts,
      totalCustomers,
      revenue: revenueResult._sum.total || 0,
    });
  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
