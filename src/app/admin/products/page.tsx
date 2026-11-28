"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  mrp: string | null;
  image: string | null;
  category: string | null;
  stock: number;
  isActive: boolean;
};

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

const EMPTY_FORM = {
  name: "",
  slug: "",
  description: "",
  price: "",
  mrp: "",
  image: "",
  category: "general-problems",
  stock: "0",
};

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/products");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice({ ok: false, text: data.error || "Could not load products." });
        return;
      }
      setProducts(data.products || []);
    } catch (err) {
      console.error("Failed to fetch products", err);
      setNotice({ ok: false, text: "Network error. Could not load products." });
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setError("Choose a JPG, PNG, WebP, AVIF or GIF image.");
      return;
    }
    if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
      setError("Image must be larger than 0 bytes and no more than 5 MB.");
      return;
    }
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      setError("Cloudinary upload is not configured for this environment.");
      return;
    }

    setUploadingImage(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", UPLOAD_PRESET);
      form.append("folder", "a2z-products");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: form },
      );
      if (!response.ok) throw new Error("Cloudinary upload failed");

      const data: unknown = await response.json();
      const secureUrl =
        typeof data === "object" &&
        data !== null &&
        "secure_url" in data &&
        typeof data.secure_url === "string"
          ? data.secure_url
          : "";
      if (!secureUrl.startsWith("https://")) {
        throw new Error("Cloudinary returned an invalid image URL");
      }

      setFormData((current) => ({ ...current, image: secureUrl }));
    } catch (uploadError) {
      console.error("Product image upload error:", uploadError);
      setError("Image upload failed. Check the file and Cloudinary preset, then try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: product.price,
      mrp: product.mrp || "",
      image: product.image || "",
      category: product.category || "general-problems",
      stock: product.stock.toString(),
    });
    setShowForm(true);
    setError("");
    setNotice(null);
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setShowForm(true);
    setError("");
    setNotice(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = editingId
        ? `/api/admin/products/${editingId}`
        : "/api/admin/products";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save product");
        setSaving(false);
        return;
      }

      await fetchProducts();
      handleCancel();
    } catch (err) {
      console.error("Save error:", err);
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = window.confirm(
      `Remove "${name}"? If it has order history, it will be deactivated to preserve past orders. Otherwise, it will be permanently deleted.`,
    );
    if (!confirmed) return;

    setNotice(null);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice({ ok: false, text: data.error || "Could not remove this product." });
        return;
      }

      setNotice({ ok: true, text: data.message || "Product removed successfully." });
      await fetchProducts();
    } catch (err) {
      console.error("Delete error:", err);
      setNotice({ ok: false, text: "Network error. The product was not removed." });
    }
  };

  const handleToggleActive = async (product: Product) => {
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice({ ok: false, text: data.error || "Could not update product visibility." });
        return;
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, isActive: !product.isActive } : p
        )
      );
      setNotice({
        ok: true,
        text: product.isActive ? "Product hidden from the store." : "Product is now visible in the store.",
      });
    } catch (err) {
      console.error("Toggle error:", err);
      setNotice({ ok: false, text: "Network error. Product visibility was not changed." });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
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
            Products
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            {products.length} total product{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={handleNew}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-full font-semibold transition"
          >
            + Add Product
          </button>
        )}
      </div>

      {notice && (
        <div
          role={notice.ok ? "status" : "alert"}
          className={`mb-5 rounded-lg border p-3 text-sm ${notice.ok ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-700"}`}
        >
          {notice.text}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md border p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-primary">
            {editingId ? "Edit Product" : "Add New Product"}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-primary"
                  placeholder="e.g. Ayurvedic Capsule"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug * (URL name, lowercase)
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingId}
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slug: e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, "-"),
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-primary disabled:bg-gray-100"
                  placeholder="e.g. ayurvedic-capsule"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-primary"
                  placeholder="299"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  MRP (₹) — optional
                </label>
                <input
                  type="number"
                  value={formData.mrp}
                  onChange={(e) =>
                    setFormData({ ...formData, mrp: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-primary"
                  placeholder="399"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-primary bg-white"
                >
                  <option value="male-problems">Male Problems</option>
                  <option value="female-problems">Female Problems</option>
                  <option value="general-problems">General Problems</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock *
                </label>
                <input
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-primary"
                  placeholder="100"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Product Image
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    className="w-full flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                    placeholder="Paste an HTTPS image URL or upload a file"
                  />
                  <label className={`inline-flex cursor-pointer items-center justify-center rounded-md border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5 ${uploadingImage || saving ? "pointer-events-none opacity-50" : ""}`}>
                    {uploadingImage ? "Uploading..." : "Upload Image"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                      onChange={handleImageUpload}
                      disabled={uploadingImage || saving}
                      className="sr-only"
                    />
                  </label>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  JPG, PNG, WebP, AVIF or GIF · Maximum 5 MB. Uploads are saved in the A2Z products folder.
                </p>
                {formData.image && (
                  <div className="mt-2 w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-primary resize-none"
                  placeholder="Product description..."
                ></textarea>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving || uploadingImage}
                className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-full font-semibold transition disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Product"
                  : "Create Product"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving || uploadingImage}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2.5 rounded-full font-semibold transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border">
          <div className="text-6xl mb-4">💊</div>
          <h2 className="text-xl font-bold mb-2 text-gray-700">
            No products yet
          </h2>
          <p className="text-gray-500 mb-6">
            No products yet. Select &quot;Add Product&quot; to create your first product.
          </p>
          <button
            onClick={handleNew}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-full font-semibold transition"
          >
            + Add First Product
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className={`bg-white rounded-lg shadow-sm border p-4 flex items-center gap-4 flex-wrap ${
                !product.isActive ? "opacity-60" : ""
              }`}
            >
              <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden shrink-0">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300">
                    💊
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold">{product.name}</h3>
                  {!product.isActive && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 font-mono">
                  {product.slug}
                </p>
                <div className="flex items-center gap-3 mt-1 text-sm">
                  <span className="font-bold text-primary">
                    ₹{product.price}
                  </span>
                  {product.mrp && (
                    <span className="text-gray-400 line-through text-xs">
                      ₹{product.mrp}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    Stock: {product.stock}
                  </span>
                  <span className="text-xs text-gray-500">
                    {product.category}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleToggleActive(product)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
                    product.isActive
                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                      : "bg-green-100 text-green-800 hover:bg-green-200"
                  }`}
                >
                  {product.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => handleEdit(product)}
                  className="text-xs px-3 py-1.5 rounded-full font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id, product.name)}
                  className="text-xs px-3 py-1.5 rounded-full font-medium bg-red-100 text-red-800 hover:bg-red-200 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
