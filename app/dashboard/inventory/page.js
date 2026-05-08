"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getInventory(), api.getProducts()])
      .then(([inv, prods]) => { setInventory(inv); setProducts(prods); })
      .finally(() => setLoading(false));
  }, []);

  function getProductName(productId) {
    return products.find(p => p.id === productId)?.name || productId;
  }

  async function saveQty(id) {
    const qty = editing[id];
    if (qty === undefined) return;
    await api.updateInventory(id, Number(qty));
    setInventory(inv => inv.map(i => i.id === id ? { ...i, quantity: Number(qty) } : i));
    setEditing(e => { const n = { ...e }; delete n[id]; return n; });
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-wide mb-8">Inventory</h1>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Product", "Size", "Color", "Quantity", ""].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="px-6 py-8 text-center" style={{ color: "var(--text-muted)" }}>Loading...</td></tr>}
            {!loading && inventory.map(item => (
              <tr key={item.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="px-6 py-3">{getProductName(item.product_id)}</td>
                <td className="px-6 py-3">{item.size}</td>
                <td className="px-6 py-3" style={{ color: "var(--text-secondary)" }}>{item.color}</td>
                <td className="px-6 py-3">
                  <input
                    type="number" min="0"
                    value={editing[item.id] !== undefined ? editing[item.id] : item.quantity}
                    onChange={e => setEditing(ed => ({ ...ed, [item.id]: e.target.value }))}
                    className="w-20 px-2 py-1 text-sm outline-none"
                    style={{
                      background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)",
                      ...(item.quantity === 0 ? { color: "var(--danger)" } : {})
                    }}
                  />
                </td>
                <td className="px-6 py-3">
                  {editing[item.id] !== undefined && (
                    <button onClick={() => saveQty(item.id)} className="text-xs px-3 py-1"
                      style={{ background: "var(--dune)", color: "#0f0f0f" }}>Save</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
