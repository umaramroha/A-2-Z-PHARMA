import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { adminSessionOptions } from "@/lib/adminSession";

type AdminSessionData = {
  adminId?: string;
  email?: string;
  role?: string;
  isAdminLoggedIn: boolean;
};

async function getAdminSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<AdminSessionData>(
    cookieStore,
    adminSessionOptions
  );
  return session;
}

const settingsSchema = z.object({
  currentPassword: z.string().min(1).max(1024),
  newEmail: z.string().trim().email().max(254),
  newPassword: z
    .string()
    .max(1024)
    .optional()
    .refine((value) => value === undefined || value.length >= 6, {
      message: "New password must be at least 6 characters",
    }),
});

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

// GET current admin info
export async function GET() {
  try {
    const session = await getAdminSession();

    if (!session.isAdminLoggedIn || !session.adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: session.adminId },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    if (!admin) {
      session.destroy();
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({ admin });
  } catch (error) {
    console.error("Get admin settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin" },
      { status: 500 }
    );
  }
}

// PATCH — update email and/or password
export async function PATCH(request: Request) {
  try {
    const session = await getAdminSession();

    if (!session.isAdminLoggedIn || !session.adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid settings" },
        { status: 400 }
      );
    }

    const { currentPassword, newEmail, newPassword } = parsed.data;

    const admin = await prisma.adminUser.findUnique({
      where: { id: session.adminId },
    });

    if (!admin) {
      session.destroy();
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      admin.password
    );

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    const cleanEmail = newEmail.toLowerCase();
    const updateData: { email?: string; password?: string } = {};

    if (cleanEmail !== admin.email) {
      updateData.email = cleanEmail;
    }

    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Nothing to update" },
        { status: 400 }
      );
    }

    const updated = await prisma.adminUser.update({
      where: { id: admin.id },
      data: updateData,
      select: { id: true, email: true, role: true },
    });

    if (updateData.email) {
      session.email = updated.email;
      await session.save();
    }

    return NextResponse.json({ success: true, admin: updated });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    console.error("Update admin settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
