"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Skeleton from "@/components/Skeleton";

const ROWS = Array(6).fill(null);

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try { setProducts(await api.getProducts()); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id, name) {
    if (!confirm(`Delete "${name}"?`)) return;
    await api.deleteProduct(id);
    setProducts(p => p.filter(x => x.id !== id));
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold tracking-wide">Products</h1>
        <Link href="/dashboard/products/new"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium"
          style={{ background: "var(--dune)", color: "#0f0f0f" }}
        >
          <Plus size={16} /> New Product
        </Link>
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Name", "Collection", "Price (GHS)", "Category", "Resolution", "In Stock", "Featured", ""].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && ROWS.map((_, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="px-6 py-4"><Skeleton w="140px" /></td>
                <td className="px-6 py-4"><Skeleton w="100px" /></td>
                <td className="px-6 py-4"><Skeleton w="60px" /></td>
                <td className="px-6 py-4"><Skeleton w="70px" /></td>
                <td className="px-6 py-4"><Skeleton w="50px" /></td>
                <td className="px-6 py-4"><Skeleton w="20px" /></td>
                <td className="px-6 py-4"><Skeleton w="20px" /></td>
                <td className="px-6 py-4"><Skeleton w="50px" /></td>
              </tr>
            ))}
            {!loading && products.map(p => (
              <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="px-6 py-3 font-medium">{p.name}</td>
                <td className="px-6 py-3" style={{ color: "var(--text-secondary)" }}>{p.collection}</td>
                <td className="px-6 py-3">GHS {p.price_ghs}</td>
                <td className="px-6 py-3" style={{ color: "var(--text-secondary)" }}>{p.category}</td>
                <td className="px-6 py-3" style={{ color: "var(--text-secondary)" }}>{p.resolution || "—"}</td>
                <td className="px-6 py-3">{p.in_stock !== false ? "✓" : "✗"}</td>
                <td className="px-6 py-3">{p.featured ? "✓" : "—"}</td>
                <td className="px-6 py-3">
                  <div className="flex gap-3 justify-end">
                    <Link href={`/dashboard/products/${p.id}/edit`} style={{ color: "var(--text-muted)" }}><Pencil size={15} /></Link>
                    <button onClick={() => handleDelete(p.id, p.name)} style={{ color: "var(--danger)" }}><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && products.length === 0 && (
              <tr><td colSpan={8} className="px-6 py-8 text-center" style={{ color: "var(--text-muted)" }}>No products</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
