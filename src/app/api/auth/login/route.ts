import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";
import { checkRateLimit, resetRateLimit } from "@/lib/rateLimit";

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
    const rateKey = `login:${cleanEmail}`;
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

    const session = await getIronSession<SessionData>(
      cookies(),
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
