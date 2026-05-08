"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

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
    colors: [], color_hex: [], description: "", care: [],
    sizes: [], sold_out: [], images: [], category: "", featured: false,
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await api.uploadImage(file);
      set("images", [...form.images, url]);
    } catch { setError("Image upload failed"); }
    finally { setUploading(false); }
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
        {field("Collection", "collection")}
        {field("Category", "category")}
      </div>

      <div className="mb-4">
        <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>Description</label>
        <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3}
          className="w-full px-3 py-2 text-sm outline-none resize-none"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
        />
      </div>

      <TagInput label="Colors" value={form.colors} onChange={v => set("colors", v)} />
      <TagInput label="Color Hex" value={form.color_hex} onChange={v => set("color_hex", v)} />
      <TagInput label="Care Instructions" value={form.care} onChange={v => set("care", v)} />

      <div className="mb-4">
        <label className="block text-xs mb-2" style={{ color: "var(--text-muted)" }}>Sizes</label>
        <div className="flex gap-2 flex-wrap">
          {SIZES.map(s => (
            <button key={s} type="button"
              onClick={() => set("sizes", form.sizes.includes(s) ? form.sizes.filter(x => x !== s) : [...form.sizes, s])}
              className="px-3 py-1 text-xs"
              style={{
                border: "1px solid var(--border)",
                background: form.sizes.includes(s) ? "var(--dune)" : "var(--surface-2)",
                color: form.sizes.includes(s) ? "#0f0f0f" : "var(--text)"
              }}
            >{s}</button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs mb-2" style={{ color: "var(--text-muted)" }}>Sold Out Sizes</label>
        <div className="flex gap-2 flex-wrap">
          {form.sizes.map(s => (
            <button key={s} type="button"
              onClick={() => set("sold_out", form.sold_out.includes(s) ? form.sold_out.filter(x => x !== s) : [...form.sold_out, s])}
              className="px-3 py-1 text-xs"
              style={{
                border: "1px solid var(--border)",
                background: form.sold_out.includes(s) ? "var(--danger)" : "var(--surface-2)",
                color: form.sold_out.includes(s) ? "#fff" : "var(--text)"
              }}
            >{s}</button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs mb-2" style={{ color: "var(--text-muted)" }}>Images</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {form.images.map((img, i) => (
            <div key={i} className="relative">
              <img src={img} alt="" className="w-20 h-20 object-cover" style={{ border: "1px solid var(--border)" }} />
              <button type="button" onClick={() => set("images", form.images.filter((_, j) => j !== i))}
                className="absolute top-0 right-0 w-5 h-5 text-xs flex items-center justify-center"
                style={{ background: "var(--danger)", color: "#fff" }}>×</button>
            </div>
          ))}
        </div>
        <label className="inline-block px-4 py-2 text-xs cursor-pointer"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
          {uploading ? "Uploading..." : "Upload Image"}
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
        </label>
      </div>

      <div className="mb-6 flex items-center gap-2">
        <input type="checkbox" id="featured" checked={form.featured} onChange={e => set("featured", e.target.checked)} />
        <label htmlFor="featured" className="text-sm">Featured</label>
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
