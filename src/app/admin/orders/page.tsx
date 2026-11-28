"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  canMoveOrderWithPayment,
  canSetPaymentStatusForOrder,
  canTransitionStatus,
  VALID_STATUSES,
} from "@/lib/orderTransitions.mjs";

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
  customerEmail: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  total: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
  customer: {
    id: string;
    name: string;
    email: string;
    mobile: string | null;
  } | null;
};

const STATUS_OPTIONS = [...VALID_STATUSES];

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    if (newStatus === "CANCELLED") {
      const confirmed = window.confirm(
        "Cancel this order? Reserved stock will be restored. This action cannot be undone.",
      );
      if (!confirmed) return;
    }

    setUpdating(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        window.alert(data.error || "Order status update failed. Please refresh and try again.");
        return;
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, status: data.order?.status || newStatus }
            : order
        )
      );
    } catch (err) {
      console.error("Update error:", err);
    } finally {
      setUpdating(null);
    }
  };

  const updatePaymentStatus = async (orderId: string, paymentStatus: string) => {
    if (paymentStatus === "REFUNDED") {
      const confirmed = window.confirm(
        "Confirm that the refund has actually been sent to the customer before marking this order as refunded.",
      );
      if (!confirmed) return;
    }

    setUpdating(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        window.alert(data.error || "Payment status update failed. Please refresh and try again.");
        return;
      }
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, paymentStatus: data.order?.paymentStatus || paymentStatus }
            : order
        )
      );
    } catch (err) {
      console.error("Payment status update error:", err);
      window.alert("Could not update payment status. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  const filteredOrders =
    filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    PROCESSING: "bg-purple-100 text-purple-800",
    SHIPPED: "bg-indigo-100 text-indigo-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <Link
            href="/admin/dashboard"
            className="text-sm text-primary hover:underline"
          >
            ← Dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mt-2">
            Orders
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            {orders.length} total order{orders.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["ALL", ...STATUS_OPTIONS].map((status) => {
          const count =
            status === "ALL"
              ? orders.length
              : orders.filter((o) => o.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                filter === status
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {status} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-xl font-bold mb-2 text-gray-700">
            No orders found
          </h2>
          <p className="text-gray-500">
            {filter === "ALL"
              ? "No orders have been received yet."
              : `No orders with ${filter.toLowerCase()} status were found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-sm border overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gray-50 px-5 py-3 flex flex-wrap justify-between items-center gap-3 border-b">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Order ID</p>
                    <p className="font-mono text-sm font-semibold">
                      #{order.id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Customer</p>
                    <p className="text-sm font-medium">{order.customerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="text-sm">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      statusColors[order.status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.status}
                  </span>
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === order.id ? null : order.id)
                    }
                    className="text-xs text-primary hover:underline font-medium px-2"
                  >
                    {expandedId === order.id ? "Hide" : "Details"}
                  </button>
                </div>
              </div>

              {/* Quick Summary */}
              <div className="px-5 py-4 flex flex-wrap justify-between items-center gap-3">
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="text-gray-600">
                    📱 {order.customerMobile}
                  </span>
                  <span className="text-gray-600">
                    📍 {order.city}, {order.state}
                  </span>
                  <span className="text-gray-600">
                    💵{" "}
                    {order.paymentMethod === "cod"
                      ? "Cash on Delivery"
                      : "UPI"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-primary text-lg">
                    ₹{order.total}
                  </span>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === order.id && (
                <div className="border-t bg-gray-50 px-5 py-4 space-y-4">
                  {/* Items */}
                  <div>
                    <h3 className="font-semibold text-sm mb-2">
                      Items ({order.items.length})
                    </h3>
                    <div className="space-y-2 bg-white rounded-md p-3 border">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 text-sm"
                        >
                          {item.product.image && (
                            <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden shrink-0">
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-xs text-gray-500">
                              Qty: {item.quantity} × ₹{item.price}
                            </p>
                          </div>
                          <span className="font-semibold">
                            ₹{parseFloat(item.price) * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <h3 className="font-semibold text-sm mb-2">
                      Delivery Address
                    </h3>
                    <div className="bg-white rounded-md p-3 border text-sm text-gray-700">
                      <p>{order.address}</p>
                      <p>
                        {order.city}, {order.state} - {order.pincode}
                      </p>
                    </div>
                  </div>

                  {/* Contact */}
                  <div>
                    <h3 className="font-semibold text-sm mb-2">Contact</h3>
                    <div className="bg-white rounded-md p-3 border text-sm">
                      <p>
                        <strong>Name:</strong> {order.customerName}
                      </p>
                      <p>
                        <strong>Mobile:</strong> {order.customerMobile}
                      </p>
                      {order.customerEmail && (
                        <p>
                          <strong>Email:</strong> {order.customerEmail}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status Update */}
                  <div>
                    <h3 className="font-semibold text-sm mb-2">
                      Update Status
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPTIONS.filter((status) =>
                        status === order.status ||
                        (canTransitionStatus(
                          order.status as (typeof VALID_STATUSES)[number],
                          status as (typeof VALID_STATUSES)[number],
                        ) &&
                          canMoveOrderWithPayment(
                            status,
                            order.paymentMethod,
                            order.paymentStatus,
                          ))
                      ).map((status) => (
                        <button
                          key={status}
                          onClick={() => updateStatus(order.id, status)}
                          disabled={updating === order.id || order.status === status}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                            order.status === status
                              ? "bg-primary text-white"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-primary hover:text-white"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {updating === order.id && order.status !== status
                            ? "..."
                            : status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="rounded-md border bg-white p-3">
                    <div className="text-sm text-gray-600">
                      Payment Status:{" "}
                      <span className="font-semibold text-gray-900">{order.paymentStatus}</span>
                      {order.paymentMethod === "upi" && order.paymentStatus !== "PAID" && order.status !== "CANCELLED" && (
                        <p className="mt-1 text-xs text-amber-700">
                          Verify the manual UPI payment before shipping this order.
                        </p>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {order.paymentStatus === "PENDING" &&
                        canSetPaymentStatusForOrder(
                          order.status as (typeof VALID_STATUSES)[number],
                          order.paymentMethod,
                          "PAID",
                        ) && (
                        <button
                          onClick={() => updatePaymentStatus(order.id, "PAID")}
                          disabled={updating === order.id}
                          className="rounded-full bg-green-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                        >
                          {updating === order.id ? "Updating..." : "Mark Paid"}
                        </button>
                      )}
                      {order.paymentMethod === "upi" &&
                        order.paymentStatus === "PENDING" &&
                        canMoveOrderWithPayment(order.status, order.paymentMethod, "FAILED") && (
                        <button
                          onClick={() => updatePaymentStatus(order.id, "FAILED")}
                          disabled={updating === order.id}
                          className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 disabled:opacity-50"
                        >
                          Mark Failed
                        </button>
                      )}
                      {order.paymentStatus === "FAILED" &&
                        canMoveOrderWithPayment(order.status, order.paymentMethod, "PENDING") && (
                        <button
                          onClick={() => updatePaymentStatus(order.id, "PENDING")}
                          disabled={updating === order.id}
                          className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 disabled:opacity-50"
                        >
                          Reset to Pending
                        </button>
                      )}
                      {order.paymentStatus === "PAID" &&
                        (order.status === "CANCELLED" || order.status === "DELIVERED") && (
                        <button
                          onClick={() => updatePaymentStatus(order.id, "REFUNDED")}
                          disabled={updating === order.id}
                          className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 disabled:opacity-50"
                        >
                          Mark Refunded
                        </button>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Verify UPI before shipping. Mark COD as paid only after delivery and collection.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
