import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";
import { checkRateLimit } from "@/lib/rateLimit";

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
    // Rate limit based on the request IP (proxy configuration must be trusted).
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const rateKey = `register:${ip}`;
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

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const parsed = registrationSchema.safeParse(body);
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
