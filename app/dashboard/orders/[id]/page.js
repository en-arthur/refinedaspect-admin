"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { use } from "react";

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "paid", "failed"];

export default function OrderDetailPage({ params }) {
  const { id } = use(params);
  const [order, setOrder] = useState(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => { api.getOrder(id).then(setOrder); }, [id]);

  async function updateStatus(status, payment_status) {
    setSaving(true);
    try {
      const updated = await api.updateOrderStatus(id, status, payment_status);
      setOrder(updated);
    } finally { setSaving(false); }
  }

  if (!order) return <p style={{ color: "var(--text-muted)" }}>Loading...</p>;

  return (
    <div className="max-w-2xl">
      <button onClick={() => router.back()} className="text-xs mb-6 block" style={{ color: "var(--text-muted)" }}>← Back to Orders</button>
      <h1 className="text-2xl font-semibold tracking-wide mb-8">Order Detail</h1>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "1.5rem" }}>
          <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "var(--text-muted)" }}>Customer</p>
          <p className="font-medium">{order.customer_name}</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{order.customer_email}</p>
          {order.customer_phone && <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{order.customer_phone}</p>}
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "1.5rem" }}>
          <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "var(--text-muted)" }}>Shipping</p>
          <p className="text-sm">{order.shipping_address?.line1}</p>
          {order.shipping_address?.line2 && <p className="text-sm">{order.shipping_address.line2}</p>}
          <p className="text-sm">{order.shipping_address?.city}, {order.shipping_address?.region}</p>
          <p className="text-sm">{order.shipping_address?.country}</p>
        </div>
      </div>

      <div className="mb-8" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <p className="px-6 py-4 text-xs tracking-widest uppercase" style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>Items</p>
        {order.items?.map((item, i) => (
          <div key={i} className="px-6 py-3 flex justify-between text-sm" style={{ borderBottom: "1px solid var(--border)" }}>
            <span>{item.name} — {item.size} / {item.color} × {item.quantity}</span>
            <span>GHS {(item.price_ghs * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="px-6 py-3 flex justify-between text-sm font-medium">
          <span>Total</span>
          <span>GHS {Number(order.total_ghs).toFixed(2)}</span>
        </div>
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "1.5rem" }}>
        <p className="text-xs tracking-widest uppercase mb-4" style={{ color: "var(--text-muted)" }}>Update Status</p>
        <div className="flex gap-3 mb-4 flex-wrap">
          {ORDER_STATUSES.map(s => (
            <button key={s} onClick={() => updateStatus(s, order.payment_status)} disabled={saving}
              className="px-3 py-1 text-xs uppercase tracking-wider"
              style={{
                border: "1px solid var(--border)",
                background: order.status === s ? "var(--dune)" : "var(--surface-2)",
                color: order.status === s ? "#0f0f0f" : "var(--text-secondary)"
              }}>{s}</button>
          ))}
        </div>
        <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "var(--text-muted)" }}>Payment</p>
        <div className="flex gap-3 flex-wrap">
          {PAYMENT_STATUSES.map(s => (
            <button key={s} onClick={() => updateStatus(order.status, s)} disabled={saving}
              className="px-3 py-1 text-xs uppercase tracking-wider"
              style={{
                border: "1px solid var(--border)",
                background: order.payment_status === s ? "var(--dune)" : "var(--surface-2)",
                color: order.payment_status === s ? "#0f0f0f" : "var(--text-secondary)"
              }}>{s}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
