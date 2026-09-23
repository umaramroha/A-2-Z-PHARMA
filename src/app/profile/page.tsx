"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoggedIn, loading, logout } = useAuth();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, loading, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">
          <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-48 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-primary">
        My Account
      </h1>

      {saved && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          ✓ Profile updated successfully
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
            <p className="text-gray-600 text-sm">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Full Name</p>
            <p className="font-medium">{user.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Mobile</p>
            <p className="font-medium">{user.mobile}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Member Since</p>
            <p className="font-medium">
              {new Date(user.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
          <strong>Note:</strong> Profile editing Phase 11-2 me aayega. Abhi ye read-only hai.
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Link
          href="/orders"
          className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md hover:border-primary transition group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary transition">
              <span className="text-2xl">📦</span>
            </div>
            <div>
              <h3 className="font-bold text-lg group-hover:text-primary transition">
                My Orders
              </h3>
              <p className="text-sm text-gray-600">View order history</p>
            </div>
          </div>
        </Link>

        <Link
          href="/products"
          className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md hover:border-primary transition group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center group-hover:bg-secondary transition">
              <span className="text-2xl">🛍️</span>
            </div>
            <div>
              <h3 className="font-bold text-lg group-hover:text-secondary transition">
                Continue Shopping
              </h3>
              <p className="text-sm text-gray-600">Browse products</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-semibold transition"
      >
        Logout
      </button>
    </div>
  );
}
