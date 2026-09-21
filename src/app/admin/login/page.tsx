"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Phase 11 me real authentication add karenge
    if (formData.email && formData.password) {
      // Temporary: Save cookie to bypass middleware
      document.cookie = "admin-session=demo; path=/; max-age=86400";
      alert("Login successful! Redirecting to dashboard...");
      window.location.href = "/admin/dashboard";
    } else {
      setError("Please enter email and password");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8 bg-gray-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">🔐</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
              Admin Login
            </h1>
            <p className="text-sm text-gray-600">
              A2Z Pharma Management Panel
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-primary"
                placeholder="admin@a2zpharma.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-primary"
                placeholder="Enter admin password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-full font-semibold transition"
            >
              Login to Dashboard
            </button>
          </form>

          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800 text-center">
            Demo: koi bhi email/password daalo, dashboard khul jayega
          </div>
        </div>
      </div>
    </div>
  );
}
