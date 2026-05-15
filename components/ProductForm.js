"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const CATEGORIES = ["Indoor", "Outdoor", "Business", "Kit"];

function TagInput({ label, value, onChange }) {
  const [input, setInput] = useState("");
  function add(e) {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      onChange([...value, input.trim()]);
      setInput("");
    }
  }
  return (
    <div className="mb-4">
      <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>{label} (press Enter to add)</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((v, i) => (
          <span key={i} className="flex items-center gap-1 px-2 py-1 text-xs" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            {v}
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} style={{ color: "var(--text-muted)" }}>×</button>
          </span>
        ))}
      </div>
      <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={add}
        className="w-full px-3 py-2 text-sm outline-none"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
      />
    </div>
  );
}

export default function ProductForm({ initial, productId }) {
  const router = useRouter();
  const [form, setForm] = useState(initial || {
    slug: "", name: "", price_ghs: "", price_usd: "", collection: "",
    resolution: "", connectivity: "", features: [],
    description: "", specs: [],
    images: [], category: "", featured: false, in_stock: true,
  });
  const [uploading, setUploading] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  async function handleImageUpload(e, slot) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(slot);
    try {
      const { url } = await api.uploadImage(file);
      const imgs = [...(form.images || []), ""].slice(0, 2);
      if (slot === 0) { imgs[0] = url; if (form.images?.[1]) imgs[1] = form.images[1]; }
      if (slot === 1) { imgs[1] = url; if (form.images?.[0]) imgs[0] = form.images[0]; }
      set("images", imgs.filter(Boolean));
    } catch { setError("Image upload failed"); }
    finally { setUploading(null); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const data = { ...form, price_ghs: Number(form.price_ghs), price_usd: Number(form.price_usd) };
      if (productId) await api.updateProduct(productId, data);
      else await api.createProduct(data);
      router.push("/dashboard/products");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const field = (label, key, type = "text") => (
    <div className="mb-4">
      <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>{label}</label>
      <input type={type} value={form[key]} onChange={e => set(key, e.target.value)} required={["slug","name","price_ghs","price_usd"].includes(key)}
        className="w-full px-3 py-2 text-sm outline-none"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      {error && <p className="mb-4 text-sm" style={{ color: "var(--danger)" }}>{error}</p>}

      <div className="grid grid-cols-2 gap-4">
        {field("Name", "name")}
        {field("Slug", "slug")}
        {field("Price (GHS)", "price_ghs", "number")}
        {field("Price (USD)", "price_usd", "number")}
        {field("Collection / Series", "collection")}
        {field("Resolution (e.g. 1080p, 4K)", "resolution")}
        {field("Connectivity (e.g. Wi-Fi, PoE)", "connectivity")}
      </div>

      {/* Category */}
      <div className="mb-4">
        <label className="block text-xs mb-2" style={{ color: "var(--text-muted)" }}>Category</label>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} type="button"
              onClick={() => set("category", c)}
              className="px-3 py-1 text-xs"
              style={{
                border: "1px solid var(--border)",
                background: form.category === c ? "var(--dune)" : "var(--surface-2)",
                color: form.category === c ? "#0f0f0f" : "var(--text)"
              }}
            >{c}</button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>Description</label>
        <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3}
          className="w-full px-3 py-2 text-sm outline-none resize-none"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
        />
      </div>

      <TagInput label="Key Features" value={form.features} onChange={v => set("features", v)} />
      <TagInput label="Technical Specs" value={form.specs} onChange={v => set("specs", v)} />

      {/* Images */}
      <div className="mb-4">
        <label className="block text-xs mb-2" style={{ color: "var(--text-muted)" }}>Images</label>
        <div className="grid grid-cols-2 gap-4">
          {[{ label: "Main Image", slot: 0 }, { label: "Secondary Image", slot: 1 }].map(({ label, slot }) => (
            <div key={slot}>
              <p className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>{label}</p>
              <div className="relative aspect-square flex items-center justify-center overflow-hidden"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                {form.images?.[slot] ? (
                  <>
                    <img src={form.images[slot]} alt={label} className="w-full h-full object-cover" />
                    <button type="button"
                      onClick={() => {
                        const imgs = [...(form.images || [])];
                        imgs[slot] = "";
                        set("images", imgs.filter(Boolean));
                      }}
                      className="absolute top-1 right-1 w-5 h-5 text-xs flex items-center justify-center"
                      style={{ background: "var(--danger)", color: "#fff" }}>×</button>
                  </>
                ) : (
                  <label className="flex flex-col items-center gap-2 cursor-pointer p-4 text-center">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {uploading === slot ? "Uploading..." : `Upload ${label}`}
                    </span>
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => handleImageUpload(e, slot)} disabled={uploading !== null} />
                  </label>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4 flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.featured} onChange={e => set("featured", e.target.checked)} />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.in_stock} onChange={e => set("in_stock", e.target.checked)} />
          In Stock
        </label>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="px-6 py-2 text-sm font-medium"
          style={{ background: "var(--dune)", color: "#0f0f0f" }}>
          {saving ? "Saving..." : productId ? "Update Product" : "Create Product"}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-6 py-2 text-sm"
          style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
          Cancel
        </button>
      </div>
    </form>
  );
}
