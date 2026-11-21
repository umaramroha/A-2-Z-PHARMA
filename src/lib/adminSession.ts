import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionOptions } from "iron-session";
import { prisma } from "@/lib/prisma";

export type AdminSessionData = {
  adminId?: string;
  email?: string;
  role?: string;
  passwordHash?: string;
  isAdminLoggedIn: boolean;
};

export const defaultAdminSession: AdminSessionData = {
  isAdminLoggedIn: false,
};

const sessionPassword = process.env.SESSION_PASSWORD;

if (!sessionPassword || sessionPassword.length < 32) {
  throw new Error("SESSION_PASSWORD must be configured with at least 32 characters");
}

export const adminSessionOptions: SessionOptions = {
  password: sessionPassword,
  cookieName: "a2z-admin-session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  },
};

/**
 * Validates an admin cookie against the currently stored password hash.
 * Changing an admin password invalidates every older session automatically.
 * The hash remains inside the encrypted, HTTP-only iron-session cookie.
 */
export async function getValidAdminSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<AdminSessionData>(
    cookieStore,
    adminSessionOptions
  );

  if (
    !session.isAdminLoggedIn ||
    !session.adminId ||
    !session.passwordHash
  ) {
    session.destroy();
    return null;
  }

  const admin = await prisma.adminUser.findUnique({
    where: { id: session.adminId },
    select: { password: true },
  });

  if (!admin || admin.password !== session.passwordHash) {
    session.destroy();
    return null;
  }

  return session;
}
