"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoggedIn, updateProfile, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (user) {
      setFormData({
        name: user.name,
        mobile: user.mobile,
        email: user.email,
      });
    }
  }, [isLoggedIn, user, router]);

  if (!user) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: formData.name,
      mobile: formData.mobile,
    });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    logout();
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
          <button
            onClick={() => setEditing(!editing)}
            className="text-sm text-primary hover:underline font-medium"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (cannot be changed)
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-100 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-primary"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-full font-semibold transition"
            >
              Save Changes
            </button>
          </form>
        ) : (
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
                {new Date(user.createdAt).toLocaleDateString("en-IN")}
              </p>
            </div>
          </div>
        )}
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
