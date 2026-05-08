"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { AuthProvider } from "@/context/AuthContext";

function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <form onSubmit={handleSubmit} className="w-full max-w-sm p-8" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h1 className="text-xl font-semibold mb-6 tracking-widest uppercase">Admin</h1>
        {error && <p className="text-sm mb-4" style={{ color: "var(--danger)" }}>{error}</p>}
        <div className="mb-4">
          <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>Email</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full px-3 py-2 text-sm outline-none"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
          />
        </div>
        <div className="mb-6">
          <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>Password</label>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)} required
            className="w-full px-3 py-2 text-sm outline-none"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
          />
        </div>
        <button
          type="submit" disabled={loading}
          className="w-full py-2 text-sm font-medium tracking-widest uppercase"
          style={{ background: "var(--dune)", color: "#0f0f0f" }}
        >
          {loading ? "..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
