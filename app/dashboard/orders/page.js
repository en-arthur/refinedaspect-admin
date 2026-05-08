"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

const STATUSES = ["", "pending", "processing", "shipped", "delivered", "cancelled"];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getOrders(filter || undefined).then(setOrders).finally(() => setLoading(false));
  }, [filter]);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-wide mb-8">Orders</h1>

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
              {["Customer", "Email", "Items", "Total", "Status", "Payment", "Date", ""].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="px-6 py-8 text-center" style={{ color: "var(--text-muted)" }}>Loading...</td></tr>}
            {!loading && orders.map(o => (
              <tr key={o.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="px-6 py-3">{o.customer_name}</td>
                <td className="px-6 py-3" style={{ color: "var(--text-secondary)" }}>{o.customer_email}</td>
                <td className="px-6 py-3">{o.items?.length}</td>
                <td className="px-6 py-3">GHS {Number(o.total_ghs).toFixed(2)}</td>
                <td className="px-6 py-3">
                  <span className="px-2 py-1 text-xs uppercase" style={{ background: "var(--surface-2)" }}>{o.status}</span>
                </td>
                <td className="px-6 py-3">
                  <span className="px-2 py-1 text-xs uppercase" style={{
                    background: o.payment_status === "paid" ? "#1a3a1a" : "var(--surface-2)",
                    color: o.payment_status === "paid" ? "#6fcf6f" : "var(--text-secondary)"
                  }}>{o.payment_status}</span>
                </td>
                <td className="px-6 py-3" style={{ color: "var(--text-muted)" }}>{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-3">
                  <Link href={`/dashboard/orders/${o.id}`} className="text-xs" style={{ color: "var(--dune)" }}>View</Link>
                </td>
              </tr>
            ))}
            {!loading && orders.length === 0 && (
              <tr><td colSpan={8} className="px-6 py-8 text-center" style={{ color: "var(--text-muted)" }}>No orders</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
