import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { z } from "zod";
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

const optionalText = (max: number) =>
  z.string().trim().max(max).transform((value) => value || null).nullable().optional();

const bannerPatchSchema = z.object({
  title: optionalText(150),
  subtitle: optionalText(300),
  imageUrl: z.string().trim().url().max(2048).refine((value) => value.startsWith("https://"), "Image URL must use HTTPS").optional(),
  linkUrl: optionalText(2048).refine(
    (value) => value === undefined || value === null || (value.startsWith("/") && !value.startsWith("//")) || /^https?:\/\//i.test(value),
    "Link must be a relative path or valid web URL"
  ),
  ctaText: optionalText(50),
  order: z.number().int().min(0).max(100000).optional(),
  isActive: z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "At least one field is required");

function isNotFoundError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2025";
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const parsed = bannerPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid banner details" },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.update({
      where: { id: id },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, banner });
  } catch (error) {
    if (isNotFoundError(error)) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }
    console.error("Admin update banner error:", error);
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.banner.delete({ where: { id: id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (isNotFoundError(error)) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }
    console.error("Admin delete banner error:", error);
    return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 });
  }
}
