import { NextResponse } from "next/server";
import { getValidAdminSession } from "@/lib/adminSession";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getValidAdminSession();

    if (!session?.adminId) {
      return NextResponse.json({ admin: null });
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: session.adminId },
      select: { id: true, email: true, role: true },
    });

    if (!admin) {
      session.destroy();
      return NextResponse.json({ admin: null });
    }

    return NextResponse.json({ admin });
  } catch (error) {
    console.error("Admin me error:", error);
    return NextResponse.json({ admin: null }, { status: 500 });
  }
}
