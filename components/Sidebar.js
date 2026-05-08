"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, Boxes, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/inventory", label: "Inventory", icon: Boxes },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="w-56 min-h-screen flex flex-col" style={{ background: "var(--surface)", borderRight: "1px solid var(--border)" }}>
      <div className="px-6 py-5 text-xs tracking-widest uppercase font-semibold" style={{ color: "var(--dune)", borderBottom: "1px solid var(--border)" }}>
        Refined Aspect
      </div>
      <nav className="flex-1 py-4">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-6 py-3 text-sm transition-colors"
              style={{ color: active ? "var(--dune)" : "var(--text-secondary)", background: active ? "var(--surface-2)" : "transparent" }}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
      <button onClick={logout}
        className="flex items-center gap-3 px-6 py-4 text-sm"
        style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border)" }}
      >
        <LogOut size={16} /> Logout
      </button>
    </aside>
  );
}
