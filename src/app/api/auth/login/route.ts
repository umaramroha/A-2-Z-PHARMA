import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { readJsonBody } from "@/lib/readJsonBody";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";
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

    // Apply the broader IP bucket first, then retain the stricter per-email limit.
    const clientIp = getClientIp(request.headers);
    const ipRateKey = createIpRateLimitKey("login", clientIp);
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

    const rateKey = createEmailRateLimitKey("login", cleanEmail);
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

    const customer = await prisma.customer.findUnique({
      where: { email: cleanEmail },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Invalid Email or password" },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, customer.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid Email or password" },
        { status: 401 }
      );
    }

    await resetRateLimit(rateKey);

    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(
      cookieStore,
      sessionOptions
    );
    session.userId = customer.id;
    session.email = customer.email;
    session.name = customer.name;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({
      success: true,
      user: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        mobile: customer.mobile,
        createdAt: customer.createdAt,
      },
    });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
