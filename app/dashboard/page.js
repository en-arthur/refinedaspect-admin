"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import Skeleton from "@/components/Skeleton";

function StatCard({ label, value, sub, loading }) {
  return (
    <div className="p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "var(--text-muted)" }}>{label}</p>
      {loading ? <Skeleton h="2rem" w="60%" /> : <p className="text-3xl font-semibold">{value}</p>}
      {sub && !loading && <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{sub}</p>}
    </div>
  );
}

const SKELETON_ROWS = Array(5).fill(null);

export default function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getOrders(), api.getProducts()])
      .then(([o, p]) => { setOrders(o); setProducts(p); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = orders.filter(o => o.payment_status === "paid").reduce((s, o) => s + Number(o.total_ghs), 0);
  const pending = orders.filter(o => o.status === "pending").length;
  const recentOrders = [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-wide mb-8">Dashboard</h1>

      <div className="grid grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Orders" value={orders.length} loading={loading} />
        <StatCard label="Pending" value={pending} loading={loading} />
        <StatCard label="Revenue" value={`GHS ${totalRevenue.toFixed(2)}`} sub="paid orders only" loading={loading} />
        <StatCard label="Products" value={products.length} loading={loading} />
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-sm font-medium tracking-widest uppercase">Recent Orders</h2>
          <Link href="/dashboard/orders" className="text-xs" style={{ color: "var(--dune)" }}>View all</Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Customer", "Items", "Total", "Status", "Date"].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && SKELETON_ROWS.map((_, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="px-6 py-4"><Skeleton w="120px" /></td>
                <td className="px-6 py-4"><Skeleton w="30px" /></td>
                <td className="px-6 py-4"><Skeleton w="80px" /></td>
                <td className="px-6 py-4"><Skeleton w="70px" /></td>
                <td className="px-6 py-4"><Skeleton w="80px" /></td>
              </tr>
            ))}
            {!loading && recentOrders.map(o => (
              <tr key={o.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="px-6 py-3">{o.customer_name}</td>
                <td className="px-6 py-3">{o.items?.length}</td>
                <td className="px-6 py-3">GHS {Number(o.total_ghs).toFixed(2)}</td>
                <td className="px-6 py-3">
                  <span className="px-2 py-1 text-xs uppercase tracking-wider" style={{
                    background: o.status === "delivered" ? "#1a3a1a" : o.status === "pending" ? "#2a2a1a" : "var(--surface-2)",
                    color: o.status === "delivered" ? "#6fcf6f" : o.status === "pending" ? "var(--dune)" : "var(--text-secondary)"
                  }}>{o.status}</span>
                </td>
                <td className="px-6 py-3" style={{ color: "var(--text-muted)" }}>{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {!loading && recentOrders.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-8 text-center" style={{ color: "var(--text-muted)" }}>No orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
