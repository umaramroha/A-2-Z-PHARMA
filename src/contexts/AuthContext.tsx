"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type User = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  createdAt: string;
};

type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  register: (
    name: string,
    email: string,
    mobile: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount
  useEffect(() => {
    refreshUser();
  }, []);

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.user || null);
    } catch (err) {
      console.error("Failed to fetch user", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    mobile: string,
    password: string
  ) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, mobile, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.error || "Registration failed" };
      }

      setUser(data.user);
      return { success: true, message: "Registration successful" };
    } catch (err) {
      console.error("Register error:", err);
      return { success: false, message: "Network error. Try again." };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.error || "Login failed" };
      }

      setUser(data.user);
      return { success: true, message: "Login successful" };
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, message: "Network error. Try again." };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        loading,
        register,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
