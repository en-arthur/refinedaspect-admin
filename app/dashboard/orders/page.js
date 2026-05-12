"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { Trash2 } from "lucide-react";

const STATUSES = ["", "pending", "processing", "shipped", "delivered", "cancelled"];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setSelected(new Set());
    setLoading(true);
    api.getOrders(filter || undefined).then(setOrders).finally(() => setLoading(false));
  }, [filter]);

  function toggleOne(id) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(prev => prev.size === orders.length ? new Set() : new Set(orders.map(o => o.id)));
  }

  async function deleteOne(id, name) {
    if (!confirm(`Delete order from "${name}"? This cannot be undone.`)) return;
    await api.deleteOrder(id);
    setOrders(prev => prev.filter(o => o.id !== id));
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
  }

  async function deleteSelected() {
    if (!confirm(`Delete ${selected.size} selected order(s)? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await Promise.all([...selected].map(id => api.deleteOrder(id)));
      setOrders(prev => prev.filter(o => !selected.has(o.id)));
      setSelected(new Set());
    } finally {
      setDeleting(false);
    }
  }

  const allChecked = orders.length > 0 && selected.size === orders.length;
  const someChecked = selected.size > 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold tracking-wide">Orders</h1>
        {someChecked && (
          <button onClick={deleteSelected} disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider"
            style={{ background: "var(--danger)", color: "#fff", opacity: deleting ? 0.6 : 1 }}>
            <Trash2 size={13} />
            {deleting ? "Deleting..." : `Delete ${selected.size} selected`}
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className="px-3 py-1 text-xs uppercase tracking-wider"
            style={{
              border: "1px solid var(--border)",
              background: filter === s ? "var(--dune)" : "var(--surface)",
              color: filter === s ? "#0f0f0f" : "var(--text-secondary)"
            }}>
            {s || "All"}
          </button>
        ))}
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={allChecked} onChange={toggleAll}
                  className="cursor-pointer" style={{ accentColor: "var(--dune)" }} />
              </th>
              {["Customer", "Email", "Items", "Total", "Status", "Payment", "Date", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={9} className="px-6 py-8 text-center" style={{ color: "var(--text-muted)" }}>Loading...</td></tr>}
            {!loading && orders.map(o => (
              <tr key={o.id} style={{
                borderBottom: "1px solid var(--border)",
                background: selected.has(o.id) ? "rgba(200,169,110,0.04)" : "transparent"
              }}>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.has(o.id)} onChange={() => toggleOne(o.id)}
                    className="cursor-pointer" style={{ accentColor: "var(--dune)" }} />
                </td>
                <td className="px-4 py-3">{o.customer_name}</td>
                <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{o.customer_email}</td>
                <td className="px-4 py-3">{o.items?.length}</td>
                <td className="px-4 py-3">GHS {Number(o.total_ghs).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 text-xs uppercase" style={{ background: "var(--surface-2)" }}>{o.status}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 text-xs uppercase" style={{
                    background: o.payment_status === "paid" ? "#1a3a1a" : "var(--surface-2)",
                    color: o.payment_status === "paid" ? "#6fcf6f" : "var(--text-secondary)"
                  }}>{o.payment_status}</span>
                </td>
                <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 justify-end">
                    <Link href={`/dashboard/orders/${o.id}`} className="text-xs" style={{ color: "var(--dune)" }}>View</Link>
                    <button onClick={() => deleteOne(o.id, o.customer_name)} style={{ color: "var(--danger)" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && orders.length === 0 && (
              <tr><td colSpan={9} className="px-6 py-8 text-center" style={{ color: "var(--text-muted)" }}>No orders</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
