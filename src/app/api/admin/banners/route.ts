import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/readJsonBody";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getValidAdminSession } from "@/lib/adminSession";

export const dynamic = "force-dynamic";

const optionalText = (max: number) =>
  z.string().trim().max(max).transform((value) => value || null).nullable().optional();

const bannerSchema = z.object({
  title: optionalText(150),
  subtitle: optionalText(300),
  imageUrl: z.string().trim().url().max(2048).refine((value) => value.startsWith("https://"), "Image URL must use HTTPS"),
  linkUrl: optionalText(2048).refine(
    (value) => value === undefined || value === null || (value.startsWith("/") && !value.startsWith("//")) || /^https?:\/\//i.test(value),
    "Link must be a relative path or valid web URL"
  ),
  ctaText: optionalText(50),
  order: z.number().int().min(0).max(100000).default(0),
  isActive: z.boolean().default(true),
});

export async function GET() {
  try {
    if (!(await getValidAdminSession())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const banners = await prisma.banner.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ banners });
  } catch (error) {
    console.error("Admin get banners error:", error);
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await getValidAdminSession())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bodyResult = await readJsonBody(request, 8192);
    if (!bodyResult.ok) {
      return NextResponse.json(
        { error: bodyResult.error },
        { status: bodyResult.status }
      );
    }
    const body: unknown = bodyResult.data;

    const parsed = bannerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid banner details" },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.create({ data: parsed.data });
    return NextResponse.json({ success: true, banner });
  } catch (error) {
    console.error("Admin create banner error:", error);
    return NextResponse.json({ error: "Failed to create banner" }, { status: 500 });
  }
}
