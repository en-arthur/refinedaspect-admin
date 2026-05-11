const API = process.env.NEXT_PUBLIC_API_URL;

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 401) {
    localStorage.removeItem("admin_token");
    window.location.href = "/login";
    return;
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || "Request failed");
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  login: (email, password) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  // Products
  getProducts: () => request("/api/products"),
  createProduct: (data) => request("/api/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/api/products/${id}`, { method: "DELETE" }),

  // Orders
  getOrders: (status) => request(`/api/orders${status ? `?status=${status}` : ""}`),
  getOrder: (id) => request(`/api/orders/${id}`),
  updateOrderStatus: (id, status, payment_status) =>
    request(`/api/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, payment_status }) }),

  // Inventory
  getInventory: (productId) => request(`/api/inventory${productId ? `?product_id=${productId}` : ""}`),
  updateInventory: (id, quantity) =>
    request(`/api/inventory/${id}`, { method: "PATCH", body: JSON.stringify({ quantity }) }),

  // Upload
  uploadImage: async (file) => {
    const token = getToken();
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API}/api/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  },
};
