import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { adminSessionOptions } from "@/lib/adminSession";

export const dynamic = "force-dynamic";

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

// GET all banners
export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const banners = await prisma.banner.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ banners });
  } catch (error: any) {
    console.error("Admin get banners error:", error);
    return NextResponse.json(
      { error: "Failed to fetch banners" },
      { status: 500 }
    );
  }
}

// POST — create banner
export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, subtitle, imageUrl, linkUrl, ctaText, order, isActive } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.create({
      data: {
        title: title?.trim() || null,
        subtitle: subtitle?.trim() || null,
        imageUrl: imageUrl.trim(),
        linkUrl: linkUrl?.trim() || null,
        ctaText: ctaText?.trim() || null,
        order: parseInt(order) || 0,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ success: true, banner });
  } catch (error: any) {
    console.error("Admin create banner error:", error);
    return NextResponse.json(
      { error: "Failed to create banner" },
      { status: 500 }
    );
  }
}
