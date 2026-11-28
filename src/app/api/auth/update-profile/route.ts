import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/readJsonBody";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";
import { isValidIndianMobile } from "@/lib/phoneValidation.mjs";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  mobile: z.string().trim().max(20).refine(isValidIndianMobile, "Enter a valid 10-digit Indian mobile number"),
});

function isPrismaRecordNotFound(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2025"
  );
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(
      cookieStore,
      sessionOptions
    );

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bodyResult = await readJsonBody(request, 4096);
    if (!bodyResult.ok) {
      return NextResponse.json(
        { error: bodyResult.error },
        { status: bodyResult.status }
      );
    }
    const body: unknown = bodyResult.data;

    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid profile details" },
        { status: 400 }
      );
    }

    const updated = await prisma.customer.update({
      where: { id: session.userId },
      data: parsed.data,
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        createdAt: true,
      },
    });

    // Update session
    session.name = updated.name;
    await session.save();

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    if (isPrismaRecordNotFound(error)) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
