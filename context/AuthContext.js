"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem("admin_token");
    setToken(t);
    setLoading(false);
  }, []);

  async function login(email, password) {
    const data = await api.login(email, password);
    localStorage.setItem("admin_token", data.access_token);
    setToken(data.access_token);
    router.push("/dashboard");
  }

  function logout() {
    localStorage.removeItem("admin_token");
    setToken(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ token, loading, login, logout, isAuthed: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
