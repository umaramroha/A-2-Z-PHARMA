import { SessionOptions } from "iron-session";

export type SessionData = {
  userId?: string;
  email?: string;
  name?: string;
  isLoggedIn: boolean;
};

export const defaultSession: SessionData = {
  isLoggedIn: false,
};

const sessionPassword = process.env.SESSION_PASSWORD;

if (!sessionPassword || sessionPassword.length < 32) {
  throw new Error("SESSION_PASSWORD must be configured with at least 32 characters");
}

export const sessionOptions: SessionOptions = {
  password: sessionPassword,
  cookieName: "a2z-session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  },
};
