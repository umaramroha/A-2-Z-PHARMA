"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

type Banner = {
  id: string;
  title: string | null;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  ctaText: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
};

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    linkUrl: "",
    ctaText: "",
    order: "0",
    isActive: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/admin/banners");
      const data = await res.json();
      setBanners(data.banners || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      subtitle: "",
      imageUrl: "",
      linkUrl: "",
      ctaText: "",
      order: "0",
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      setMessage("❌ Cloudinary config missing on Vercel");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", UPLOAD_PRESET);
      fd.append("folder", "a2z-banners");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: fd }
      );

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setForm((f) => ({ ...f, imageUrl: data.secure_url }));
      setMessage("✅ Image uploaded");
    } catch (err: any) {
      console.error(err);
      setMessage("❌ Upload failed. Check preset is Unsigned.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.imageUrl) {
      setMessage("❌ Please upload an image first");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const url = editingId
        ? `/api/admin/banners/${editingId}`
        : "/api/admin/banners";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          order: parseInt(form.order) || 0,
        }),
      });

      if (!res.ok) throw new Error("Save failed");

      setMessage(editingId ? "✅ Banner updated" : "✅ Banner created");
      resetForm();
      fetchBanners();
    } catch (err) {
      console.error(err);
      setMessage("❌ Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (b: Banner) => {
    setForm({
      title: b.title || "",
      subtitle: b.subtitle || "",
      imageUrl: b.imageUrl,
      linkUrl: b.linkUrl || "",
      ctaText: b.ctaText || "",
      order: String(b.order),
      isActive: b.isActive,
    });
    setEditingId(b.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setBanners((prev) => prev.filter((b) => b.id !== id));
      setMessage("✅ Banner deleted");
    } catch {
      setMessage("❌ Delete failed");
    }
  };

  const handleToggle = async (b: Banner) => {
    try {
      const res = await fetch(`/api/admin/banners/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !b.isActive }),
      });
      if (!res.ok) throw new Error();
      setBanners((prev) =>
        prev.map((x) => (x.id === b.id ? { ...x, isActive: !b.isActive } : x))
      );
    } catch {
      setMessage("❌ Toggle failed");
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-sm text-gray-500">Loading...</div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-4 pb-24 sm:p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 sm:text-2xl">
            Banners
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Homepage slider ke banners manage karo.
          </p>
        </div>
        <Link
          href="/admin/dashboard"
          className="text-xs font-bold text-primary"
        >
          ← Dashboard
        </Link>
      </div>

      {message && (
        <div className="mb-4 rounded-xl bg-gray-50 p-3 text-sm">{message}</div>
      )}

      {/* Add button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-4 w-full rounded-xl bg-primary py-3 text-sm font-bold text-white"
        >
          + Add New Banner
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-extrabold text-gray-900">
            {editingId ? "Edit Banner" : "New Banner"}
          </h2>

          {/* Image upload */}
          <div className="mb-3">
            <label className="mb-1.5 block text-xs font-bold text-gray-600">
              Banner Image *
            </label>
            {form.imageUrl && (
              <img
                src={form.imageUrl}
                alt="preview"
                className="mb-2 aspect-[3/1] w-full rounded-xl object-cover"
              />
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 py-3 text-sm font-bold text-primary disabled:opacity-50"
            >
              {uploading
                ? "Uploading..."
                : form.imageUrl
                ? "Change Image"
                : "Choose Image"}
            </button>
          </div>

          <Field
            label="Title"
            value={form.title}
            onChange={(v) => setForm({ ...form, title: v })}
            placeholder="e.g. Flat 40% Off"
          />
          <Field
            label="Subtitle"
            value={form.subtitle}
            onChange={(v) => setForm({ ...form, subtitle: v })}
            placeholder="e.g. On all Ayurvedic products"
          />
          <Field
            label="Link URL (click karne pe kahan jaye)"
            value={form.linkUrl}
            onChange={(v) => setForm({ ...form, linkUrl: v })}
            placeholder="/products ya /products?category=male-problems"
          />
          <Field
            label="Button Text (optional)"
            value={form.ctaText}
            onChange={(v) => setForm({ ...form, ctaText: v })}
            placeholder="e.g. Shop Now"
          />
          <Field
            label="Order (chhota number pehle dikhega)"
            value={form.order}
            onChange={(v) => setForm({ ...form, order: v })}
            placeholder="0"
            type="number"
          />

          <label className="mt-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm({ ...form, isActive: e.target.checked })
              }
              className="h-4 w-4"
            />
            <span className="font-semibold text-gray-700">Active</span>
          </label>

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={saving || uploading}
              className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </button>
            <button
              onClick={resetForm}
              className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-bold text-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Banner list */}
      <div className="space-y-3">
        {banners.length === 0 && !showForm && (
          <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
            Abhi koi banner nahi hai. Upar "+ Add New Banner" click karo.
          </div>
        )}

        {banners.map((b) => (
          <div
            key={b.id}
            className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
          >
            <img
              src={b.imageUrl}
              alt={b.title || "Banner"}
              className="aspect-[3/1] w-full object-cover"
            />
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-gray-900">
                    {b.title || "(no title)"}
                  </p>
                  {b.subtitle && (
                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      {b.subtitle}
                    </p>
                  )}
                  <p className="mt-1 text-[10px] text-gray-400">
                    Order: {b.order} • {b.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    b.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {b.isActive ? "ON" : "OFF"}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => handleToggle(b)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-600"
                >
                  {b.isActive ? "Disable" : "Enable"}
                </button>
                <button
                  onClick={() => handleEdit(b)}
                  className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="mb-3">
      <label className="mb-1.5 block text-xs font-bold text-gray-600">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
      />
    </div>
  );
}
