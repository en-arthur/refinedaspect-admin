"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import TopLoadingBar from "@/components/TopLoadingBar";

function DashboardShell({ children }) {
  const { isAuthed, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthed) router.push("/login");
  }, [isAuthed, loading, router]);

  if (loading || !isAuthed) return null;

  return (
    <div className="flex min-h-screen">
      <TopLoadingBar />
      <Sidebar />
      <main className="flex-1 p-8" style={{ background: "var(--bg)" }}>
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}
