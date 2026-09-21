"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      isLogin
        ? "Login functionality will be added in Phase 7 (backend integration)"
        : "Registration functionality will be added in Phase 7 (backend integration)"
    );
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8 bg-background">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          {/* Logo/Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-sm text-gray-600">
              {isLogin
                ? "Login to your A2Z Pharma account"
                : "Register to start shopping"}
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex mb-6 bg-gray-100 rounded-full p-1">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-full text-sm font-semibold transition ${
                isLogin
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:text-primary"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-full text-sm font-semibold transition ${
                !isLogin
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:text-primary"
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
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
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            {!isLogin && (
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
                  placeholder="+91 XXXXXXXXXX"
                  required
                />
              </div>
            )}

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
                placeholder="your@email.com"
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
                placeholder="Enter password"
                required
              />
            </div>

            {isLogin && (
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-full font-semibold transition"
            >
              {isLogin ? "Login" : "Create Account"}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800 text-center">
            Phase 7 me backend authentication add karenge
          </div>

          <p className="text-center text-sm text-gray-600 mt-6">
            {isLogin ? "New to A2Z Pharma? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-semibold hover:underline"
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}


