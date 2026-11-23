import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { readJsonBody } from "@/lib/readJsonBody";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/clientIp.mjs";
import { createIpRateLimitKey } from "@/lib/rateLimitKeys.mjs";

const registrationSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  mobile: z.string().trim().min(5).max(30),
  password: z.string().min(6).max(128),
});

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function POST(request: Request) {
  try {
    // Use the hosting platform's canonical client-IP header for rate limiting.
    const ip = getClientIp(request.headers);
    const rateKey = createIpRateLimitKey("register", ip);

    // Do not store raw IP addresses or group unknown callers into one bucket.
    if (rateKey) {
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
    }

    const body = await readJsonBody(request, 16 * 1024);
    if (!body.ok) {
      return NextResponse.json({ error: body.error }, { status: body.status });
    }

    const parsed = registrationSchema.safeParse(body.data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid registration details" },
        { status: 400 }
      );
    }

    const { name, email, mobile, password } = parsed.data;
    const cleanEmail = email.toLowerCase();

    const existing = await prisma.customer.findUnique({
      where: { email: cleanEmail },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const customer = await prisma.customer.create({
      data: {
        name,
        email: cleanEmail,
        mobile,
        password: hashedPassword,
      },
    });

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
    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    console.error("Register API error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
