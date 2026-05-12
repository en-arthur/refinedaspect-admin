"use client";
import { useEffect, useState } from "react";
import { api, apiRequest } from "@/lib/api";
import Link from "next/link";
import { Download } from "lucide-react";
import Skeleton from "@/components/Skeleton";

const ROWS = Array(8).fill(null);

function exportCSV(customers) {
  const headers = ["Name", "Email", "Phone", "City", "Region", "Orders", "Total Spent (GHS)", "Last Order"];
  const rows = customers.map(c => [
    c.name, c.email, c.phone, c.city, c.region,
    c.order_count, c.total_spent.toFixed(2),
    new Date(c.last_order_date).toLocaleDateString()
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v ?? ""}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "customers.csv"; a.click();
  URL.revokeObjectURL(url);
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiRequest("/api/customers").then(setCustomers).finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(c =>
    !search || [c.name, c.email, c.phone].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-wide">Customers</h1>
          {!loading && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{customers.length} total customers</p>}
        </div>
        <button onClick={() => exportCSV(filtered)} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider"
          style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
          <Download size={13} /> Export CSV
        </button>
      </div>

      <div className="mb-6">
        <input type="text" placeholder="Search by name, email or phone..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm px-4 py-2 text-sm outline-none"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }} />
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Name", "Email", "Phone", "Location", "Orders", "Total Spent", "Last Order"].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && ROWS.map((_, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="px-6 py-4"><Skeleton w="120px" /></td>
                <td className="px-6 py-4"><Skeleton w="160px" /></td>
                <td className="px-6 py-4"><Skeleton w="100px" /></td>
                <td className="px-6 py-4"><Skeleton w="120px" /></td>
                <td className="px-6 py-4"><Skeleton w="30px" /></td>
                <td className="px-6 py-4"><Skeleton w="80px" /></td>
                <td className="px-6 py-4"><Skeleton w="80px" /></td>
              </tr>
            ))}
            {!loading && filtered.map((c, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="px-6 py-3 font-medium">{c.name}</td>
                <td className="px-6 py-3" style={{ color: "var(--text-secondary)" }}>{c.email || "—"}</td>
                <td className="px-6 py-3" style={{ color: "var(--text-secondary)" }}>{c.phone || "—"}</td>
                <td className="px-6 py-3" style={{ color: "var(--text-secondary)" }}>
                  {c.city && c.region ? `${c.city}, ${c.region}` : c.city || c.region || "—"}
                </td>
                <td className="px-6 py-3">
                  <Link href={`/dashboard/orders?phone=${encodeURIComponent(c.phone || "")}`}
                    className="text-xs px-2 py-1" style={{ background: "var(--surface-2)", color: "var(--dune)" }}>
                    {c.order_count}
                  </Link>
                </td>
                <td className="px-6 py-3" style={{ color: "var(--dune)" }}>GHS {c.total_spent.toFixed(2)}</td>
                <td className="px-6 py-3" style={{ color: "var(--text-muted)" }}>
                  {new Date(c.last_order_date).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-8 text-center" style={{ color: "var(--text-muted)" }}>
                {search ? "No customers match your search" : "No customers yet"}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
