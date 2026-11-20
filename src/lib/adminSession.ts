import { SessionOptions } from "iron-session";

export type AdminSessionData = {
  adminId?: string;
  email?: string;
  role?: string;
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
  cookieName: "a2z-admin-session", // <-- Alag cookie name
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/"
  },
};
