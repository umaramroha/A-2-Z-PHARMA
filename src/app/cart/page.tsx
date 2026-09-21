"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart } = useCart();

  const deliveryFee = totalPrice >= 500 || totalPrice === 0 ? 0 : 50;
  const finalTotal = totalPrice + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-primary">
          Your Cart is Empty
        </h1>
        <p className="text-gray-600 mb-8">
          Add some products to get started!
        </p>
        <Link
          href="/products"
          className="inline-block bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full font-semibold transition"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-2 text-primary">Shopping Cart</h1>
      <p className="text-gray-600 mb-8">{totalItems} item{totalItems > 1 ? "s" : ""} in your cart</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm border p-4 flex gap-4"
            >
              {item.image && (
                <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 bg-gray-100 rounded-md overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base md:text-lg mb-1 line-clamp-2">
                  {item.name}
                </h3>
                <p className="text-primary font-bold mb-3">₹{item.price}</p>

                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 border border-gray-300 rounded-md hover:bg-gray-100 font-bold"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 border border-gray-300 rounded-md hover:bg-gray-100 font-bold"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    🗑 Remove
                  </button>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500">Subtotal</p>
                <p className="font-bold text-lg text-primary">
                  ₹{item.price * item.quantity}
                </p>
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-sm text-red-500 hover:text-red-700 font-medium"
          >
            Clear Cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4 text-primary">Order Summary</h2>

            <div className="space-y-3 mb-4 pb-4 border-b">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">₹{totalPrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-semibold">
                  {deliveryFee === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>
              {deliveryFee > 0 && (
                <p className="text-xs text-gray-500">
                  Add ₹{500 - totalPrice} more for free delivery
                </p>
              )}
            </div>

            <div className="flex justify-between mb-6">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-2xl text-primary">₹{finalTotal}</span>
            </div>

            <Link
              href="/checkout"
              className="block w-full bg-primary hover:bg-primary-dark text-white text-center py-3 rounded-full font-semibold transition"
            >
              Proceed to Checkout
            </Link>

            <Link
              href="/products"
              className="block w-full text-center mt-3 text-sm text-primary hover:underline"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

