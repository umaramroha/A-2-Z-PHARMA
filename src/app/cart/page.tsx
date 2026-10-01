"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { getCartOrderMessage, getWhatsAppLink } from "@/lib/whatsapp";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const deliveryFee = totalPrice >= 500 || totalPrice === 0 ? 0 : 50;
  const finalTotal = totalPrice + deliveryFee;

  if (!items.length)
    return (
      <div className="page-shell section-shell flex min-h-[55vh] items-center justify-center py-16">
        <div className="surface w-full max-w-lg p-8 text-center sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
            🛒
          </div>
          <h1 className="mt-5 text-2xl font-extrabold text-gray-900">
            Your cart is empty
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Browse the catalog and add products you’d like to order.
          </p>
          <Link href="/products" className="btn-primary mt-6">
            Explore Products
          </Link>
        </div>
      </div>
    );

  return (
    <div className="page-shell">
      <div className="section-shell py-8 pb-32 sm:py-10 lg:pb-10">
        <div className="mb-7">
          <p className="eyebrow">Your selection</p>
          <h1 className="section-title mt-2">Shopping Cart</h1>
          <p className="mt-2 text-sm text-gray-500">
            {totalItems} item{totalItems === 1 ? "" : "s"} ready for checkout.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="surface flex gap-3 p-3 sm:gap-4 sm:p-4"
              >
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-28 sm:w-28">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl text-primary/20">
                      🌿
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="line-clamp-2 text-sm font-bold text-gray-800 sm:text-base">
                    {item.name}
                  </h2>
                  <p className="mt-1 text-base font-extrabold text-primary">
                    ₹{item.price}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center rounded-xl border border-gray-200">
                      <button
                        aria-label="Decrease quantity"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="h-9 w-9 font-bold text-gray-500 hover:bg-gray-50"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-bold">
                        {item.quantity}
                      </span>
                      <button
                        aria-label="Increase quantity"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="h-9 w-9 font-bold text-gray-500 hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-xs font-bold text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-xs text-gray-400">Subtotal</p>
                  <p className="mt-1 font-extrabold text-gray-800">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              </div>
            ))}
            <button
              onClick={clearCart}
              className="text-xs font-bold text-red-500 hover:text-red-700"
            >
              Clear cart
            </button>
          </div>

          <aside className="surface p-5 lg:sticky lg:top-24">
            <h2 className="text-lg font-extrabold text-gray-900">
              Order Summary
            </h2>
            <div className="mt-5 space-y-3 border-b border-gray-100 pb-5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <b>₹{totalPrice}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery</span>
                <b className={deliveryFee === 0 ? "text-green-600" : ""}>
                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                </b>
              </div>
              {deliveryFee > 0 && (
                <p className="rounded-xl bg-secondary/10 p-3 text-xs font-medium text-gray-600">
                  Add ₹{500 - totalPrice} more for free delivery.
                </p>
              )}
            </div>
            <div className="flex items-center justify-between py-5">
              <span className="font-bold">Total</span>
              <span className="text-2xl font-extrabold text-primary">
                ₹{finalTotal}
              </span>
            </div>
            <Link href="/checkout" className="btn-primary w-full">
              Proceed to Checkout
            </Link>
            <a
              href={getWhatsAppLink(getCartOrderMessage(items))}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex min-h-11 w-full items-center justify-center rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white transition hover:brightness-95"
            >
              Order on WhatsApp
            </a>
            <Link
              href="/products"
              className="mt-4 block text-center text-xs font-bold text-primary"
            >
              ← Continue shopping
            </Link>
          </aside>
        </div>
      </div>

      {/* Mobile sticky checkout bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-6px_24px_rgba(20,50,36,0.08)] backdrop-blur-xl md:hidden">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              Total
            </p>
            <p className="text-lg font-extrabold text-primary">
              ₹{finalTotal}
            </p>
          </div>
          <Link
            href="/checkout"
            className="btn-primary flex-1 max-w-[60%] py-3 text-sm"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
