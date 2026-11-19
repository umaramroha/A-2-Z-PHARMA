import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { adminSessionOptions } from "@/lib/adminSession";
import { checkRateLimit, resetRateLimit } from "@/lib/rateLimit";

type AdminSessionData = {
  adminId?: string;
  email?: string;
  role?: string;
  isAdminLoggedIn: boolean;
};

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
});

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Valid email and password are required" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const cleanEmail = email.toLowerCase();
    const rateKey = `admin-login:${cleanEmail}`;
    const rateCheck = await checkRateLimit(rateKey);

    if (!rateCheck.allowed) {
      const minutes = Math.ceil(rateCheck.resetIn / 60000);
      return NextResponse.json(
        {
          error: `Too many attempts. Please try again in ${minutes} minute${minutes > 1 ? "s" : ""}.`,
        },
        { status: 429 }
      );
    }

    const admin = await prisma.adminUser.findUnique({
      where: { email: cleanEmail },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    await resetRateLimit(rateKey);

    const session = await getIronSession<AdminSessionData>(
      cookies(),
      adminSessionOptions
    );
    session.adminId = admin.id;
    session.email = admin.email;
    session.role = admin.role;
    session.isAdminLoggedIn = true;
    await session.save();

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
