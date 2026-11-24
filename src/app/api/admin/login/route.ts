import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { readJsonBody } from "@/lib/readJsonBody";
import { prisma } from "@/lib/prisma";
import { adminSessionOptions, type AdminSessionData } from "@/lib/adminSession";
import { checkRateLimit, resetRateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/clientIp.mjs";
import { createEmailRateLimitKey, createIpRateLimitKey } from "@/lib/rateLimitKeys.mjs";

const IP_MAX_ATTEMPTS = 30;

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
});

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request, 8 * 1024);
    if (!body.ok) {
      return NextResponse.json({ error: body.error }, { status: body.status });
    }

    const parsed = loginSchema.safeParse(body.data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Valid email and password are required" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const cleanEmail = email.toLowerCase();

    // Keep the administrator bucket separate from customer login traffic.
    const clientIp = getClientIp(request.headers);
    const ipRateKey = createIpRateLimitKey("admin-login", clientIp);
    if (ipRateKey) {
      const ipRateCheck = await checkRateLimit(ipRateKey, IP_MAX_ATTEMPTS);
      if (!ipRateCheck.allowed) {
        const minutes = Math.ceil(ipRateCheck.resetIn / 60000);
        return NextResponse.json(
          {
            error: `Too many attempts from this network. Please try again in ${minutes} minute${minutes > 1 ? "s" : ""}.`,
          },
          { status: 429 }
        );
      }
    }

    const rateKey = createEmailRateLimitKey("admin-login", cleanEmail);
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

    const cookieStore = await cookies();
    const session = await getIronSession<AdminSessionData>(
      cookieStore,
      adminSessionOptions
    );
    session.adminId = admin.id;
    session.email = admin.email;
    session.role = admin.role;
    session.passwordHash = admin.password;
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
