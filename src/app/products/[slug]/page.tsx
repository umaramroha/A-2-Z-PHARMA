"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

const productData: any = {
  "ayurvedic-capsule": {
    id: "1",
    name: "Ayurvedic Capsule",
    price: 299,
    mrp: 399,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800",
    category: "General Problems",
    description: "Premium Ayurvedic capsule for overall wellness. Made with 100% natural herbs.",
    benefits: ["Boosts immunity", "Improves digestion", "Natural ingredients"],
  },
  "herbal-safoof": {
    id: "2",
    name: "Herbal Safoof",
    price: 199,
    mrp: 249,
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800",
    category: "General Problems",
    description: "Traditional Unani Safoof for daily health maintenance.",
    benefits: ["Pure herbal", "No side effects", "Traditional formula"],
  },
  "majoon-special": {
    id: "3",
    name: "Majoon Special",
    price: 499,
    mrp: 599,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
    category: "Male Problems",
    description: "Special Majoon for men's health and vitality.",
    benefits: ["Boosts energy", "Improves strength", "Ayurvedic formula"],
  },
  "women-wellness-tonic": {
    id: "4",
    name: "Women Wellness Tonic",
    price: 349,
    mrp: 449,
    image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=800",
    category: "Female Problems",
    description: "Specially formulated tonic for women's health and wellness.",
    benefits: ["Hormonal balance", "Overall wellness", "Natural herbs"],
  },
  "unani-pills": {
    id: "5",
    name: "Unani Pills",
    price: 249,
    mrp: 299,
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800",
    category: "General Problems",
    description: "Authentic Unani pills for common health issues.",
    benefits: ["Fast acting", "Pure Unani", "Trusted formula"],
  },
  "herbal-oil": {
    id: "6",
    name: "Herbal Oil",
    price: 399,
    mrp: 499,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800",
    category: "General Problems",
    description: "Pure herbal oil for massage and pain relief.",
    benefits: ["Pain relief", "Pure herbs", "Multi-purpose"],
  },
};

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  const product = productData[params.slug];

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <Link href="/products" className="text-primary hover:underline">
          ← Back to Products
        </Link>
      </div>
    );
  }

  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-primary">Products</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm border">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-auto object-cover aspect-square"
          />
        </div>

        {/* Details */}
        <div>
          <span className="text-sm text-secondary font-semibold uppercase tracking-wide">
            {product.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-gray-800">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-bold text-primary">₹{product.price}</span>
            <span className="text-xl text-gray-400 line-through">₹{product.mrp}</span>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
              {discount}% OFF
            </span>
          </div>

          <p className="text-gray-600 mb-6 leading-relaxed">
            {product.description}
          </p>

          {/* Benefits */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Key Benefits:</h3>
            <ul className="space-y-1">
              {product.benefits.map((b: string, i: number) => (
                <li key={i} className="text-gray-600 text-sm flex items-center gap-2">
                  <span className="text-green-600">✓</span> {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <label className="block font-semibold mb-2">Quantity:</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border border-gray-300 rounded-md hover:bg-gray-100 font-bold"
              >
                −
              </button>
              <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 border border-gray-300 rounded-md hover:bg-gray-100 font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-3 rounded-full font-semibold transition ${
                added
                  ? "bg-green-600 text-white"
                  : "bg-primary hover:bg-primary-dark text-white"
              }`}
            >
              {added ? "✓ Added to Cart" : "Add to Cart"}
            </button>
            <Link
              href="/cart"
              className="flex-1 py-3 rounded-full font-semibold text-center border-2 border-primary text-primary hover:bg-primary hover:text-white transition"
            >
              View Cart
            </Link>
          </div>

          {/* Delivery Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm">
            <p className="mb-1">🚚 <strong>Fast Delivery</strong> all over India</p>
            <p className="mb-1">💵 <strong>Cash on Delivery</strong> available</p>
            <p>📱 <strong>UPI Payment</strong> accepted</p>
          </div>
        </div>
      </div>
    </div>
  );
}
