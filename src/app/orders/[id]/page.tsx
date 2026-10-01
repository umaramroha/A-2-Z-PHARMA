"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

type OrderItem = {
  id: string;
  quantity: number;
  price: string;
  product: {
    id: string;
    name: string;
    image: string | null;
    slug: string;
  };
};

type Order = {
  id: string;
  customerName: string;
  customerMobile: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  subtotal: string;
  deliveryFee: string;
  total: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
};

const STATUS_STEPS = [
  { key: "PENDING", label: "Order Placed", icon: "📝" },
  { key: "CONFIRMED", label: "Confirmed", icon: "✅" },
  { key: "PROCESSING", label: "Processing", icon: "📦" },
  { key: "SHIPPED", label: "Shipped", icon: "🚚" },
  { key: "DELIVERED", label: "Delivered", icon: "🏠" },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  PROCESSING: "bg-purple-100 text-purple-800 border-purple-200",
  SHIPPED: "bg-indigo-100 text-indigo-800 border-indigo-200",
  DELIVERED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

export default function OrderTrackingPage() {
  const router = useRouter();
  const params = useParams();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/login");
      return;
    }
    if (isLoggedIn && params?.id) {
      fetchOrder();
    }
  }, [isLoggedIn, authLoading, params, router]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${params.id}`);
      if (!res.ok) throw new Error("Order not found");
      const data = await res.json();
      setOrder(data.order);
    } catch (err: any) {
      setError(err.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="section-shell py-16 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="section-shell py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-3xl">
          ⚠️
        </div>
        <h1 className="mt-5 text-2xl font-extrabold text-gray-900">
          Order not found
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {error || "This order does not exist."}
        </p>
        <Link href="/orders" className="btn-primary mt-6 inline-block">
          Back to My Orders
        </Link>
      </div>
    );
  }

  const isCancelled = order.status === "CANCELLED";
  const currentIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="page-shell">
      <div className="section-shell py-6 pb-28 sm:py-10 sm:pb-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Order Details</p>
            <h1 className="mt-1 text-xl font-extrabold text-gray-900 sm:text-2xl">
              #{order.id.slice(-8).toUpperCase()}
            </h1>
            <p className="mt-1 text-xs text-gray-500">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold ${
              STATUS_COLORS[order.status] ||
              "bg-gray-100 text-gray-800 border-gray-200"
            }`}
          >
            {order.status}
          </span>
        </div>

        {/* Tracking Timeline */}
        <div className="surface p-5 sm:p-6">
          <h2 className="text-base font-extrabold text-gray-900">
            {isCancelled ? "Order Cancelled" : "Track Your Order"}
          </h2>

          {isCancelled ? (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              This order was cancelled. If you have questions, please contact
              support.
            </div>
          ) : (
            <ol className="mt-5 space-y-0">
              {STATUS_STEPS.map((step, i) => {
                const isDone = i <= currentIndex;
                const isCurrent = i === currentIndex;
                return (
                  <li key={step.key} className="relative flex gap-3 pb-5 last:pb-0">
                    {/* Line */}
                    {i < STATUS_STEPS.length - 1 && (
                      <span
                        className={`absolute left-[15px] top-8 h-full w-0.5 ${
                          i < currentIndex ? "bg-primary" : "bg-gray-200"
                        }`}
                        aria-hidden
                      />
                    )}
                    {/* Dot */}
                    <span
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
                        isDone
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-400"
                      } ${isCurrent ? "ring-4 ring-primary/15" : ""}`}
                    >
                      {isDone ? step.icon : "○"}
                    </span>
                    {/* Label */}
                    <div className="pt-1">
                      <p
                        className={`text-sm font-bold ${
                          isDone ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {step.label}
                        {isCurrent && (
                          <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                            Current
                          </span>
                        )}
                      </p>
                      {isCurrent && (
                        <p className="mt-1 text-xs text-gray-500">
                          Your order is currently at this stage.
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Items */}
        <div className="surface mt-4 p-5 sm:p-6">
          <h2 className="text-base font-extrabold text-gray-900">
            Items ({order.items.length})
          </h2>
          <div className="mt-4 space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
              >
                {item.product.image ? (
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-2xl">
                    🌿
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="line-clamp-1 text-sm font-bold text-gray-900 hover:text-primary"
                  >
                    {item.product.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Qty {item.quantity} × ₹{item.price}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-extrabold text-gray-900">
                  ₹{parseFloat(item.price) * item.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address */}
        <div className="surface mt-4 p-5 sm:p-6">
          <h2 className="text-base font-extrabold text-gray-900">
            Delivery Address
          </h2>
          <div className="mt-3 text-sm leading-6 text-gray-600">
            <p className="font-bold text-gray-900">{order.customerName}</p>
            <p>{order.customerMobile}</p>
            <p className="mt-1">
              {order.address}, {order.city}, {order.state} - {order.pincode}
            </p>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="surface mt-4 p-5 sm:p-6">
          <h2 className="text-base font-extrabold text-gray-900">
            Payment Summary
          </h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <b>₹{order.subtotal}</b>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery</span>
              <b className={parseFloat(order.deliveryFee) === 0 ? "text-green-600" : ""}>
                {parseFloat(order.deliveryFee) === 0
                  ? "FREE"
                  : `₹${order.deliveryFee}`}
              </b>
            </div>
            <div className="mt-3 flex justify-between border-t border-gray-100 pt-3">
              <span className="font-bold">Total</span>
              <span className="text-xl font-extrabold text-primary">
                ₹{order.total}
              </span>
            </div>
            <p className="pt-2 text-xs text-gray-500">
              Payment:{" "}
              {order.paymentMethod === "cod" ? "Cash on Delivery" : "UPI"} •{" "}
              <span
                className={
                  order.paymentStatus === "PAID"
                    ? "text-green-600 font-bold"
                    : "text-yellow-600 font-bold"
                }
              >
                {order.paymentStatus}
              </span>
            </p>
          </div>
        </div>

        {/* Help */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <a
            href={`https://wa.me/918077988509?text=${encodeURIComponent(
              `Hi, I need help with order #${order.id.slice(-8).toUpperCase()}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white"
          >
            Need Help? Chat on WhatsApp
          </a>
          <Link
            href="/orders"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
          >
            ← All Orders
          </Link>
        </div>
      </div>

      {/* Sticky mobile bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-6px_24px_rgba(20,50,36,0.08)] backdrop-blur-xl md:hidden">
        <a
          href={`https://wa.me/918077988509?text=${encodeURIComponent(
            `Hi, I need help with order #${order.id.slice(-8).toUpperCase()}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white"
        >
          Chat about this order
        </a>
      </div>
    </div>
  );
}
