"use client";

import Link from "next/link";

export default function AdminDashboard() {
  const stats = [
    { label: "Total Orders", value: "0", color: "text-primary", bg: "bg-primary/10", icon: "📦" },
    { label: "Pending Orders", value: "0", color: "text-orange-600", bg: "bg-orange-100", icon: "⏳" },
    { label: "Total Products", value: "0", color: "text-blue-600", bg: "bg-blue-100", icon: "💊" },
    { label: "Revenue", value: "₹0", color: "text-green-600", bg: "bg-green-100", icon: "💰" },
  ];

  const menuItems = [
    { label: "Orders", href: "/admin/orders", icon: "📦", desc: "Manage customer orders" },
    { label: "Products", href: "/admin/products", icon: "💊", desc: "Add, edit, delete products" },
    { label: "Customers", href: "/admin/customers", icon: "👥", desc: "View customer list" },
    { label: "Payments", href: "/admin/payments", icon: "💳", desc: "Track payments" },
    { label: "Inventory", href: "/admin/inventory", icon: "📊", desc: "Stock management" },
    { label: "Reports", href: "/admin/reports", icon: "📈", desc: "Sales & analytics" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-gray-600 text-sm mt-1">Welcome back, Admin</p>
        </div>
        <Link
          href="/"
          className="text-sm text-primary hover:underline"
        >
          ← Back to Website
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg shadow-sm border p-4 md:p-6"
          >
            <div className={`w-12 h-12 ${stat.bg} rounded-full flex items-center justify-center mb-3`}>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className="text-xs md:text-sm text-gray-600 mb-1">{stat.label}</p>
            <p className={`text-2xl md:text-3xl font-bold ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-bold mb-4 text-primary">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="bg-white rounded-lg shadow-sm border p-5 hover:shadow-md hover:border-primary transition group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0 group-hover:bg-primary transition">
                <span className="text-2xl group-hover:scale-110 transition">
                  {item.icon}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition">
                  {item.label}
                </h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Info */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Ye dashboard abhi demo hai. Phase 11-15 me real data,
          authentication aur CRUD operations add karenge.
        </p>
      </div>
    </div>
  );
}
