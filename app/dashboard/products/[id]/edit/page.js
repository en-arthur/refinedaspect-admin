"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import ProductForm from "@/components/ProductForm";
import { use } from "react";

export default function EditProductPage({ params }) {
  const { id } = use(params);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    api.getProducts().then(products => {
      const p = products.find(x => x.id === id);
      if (p) setProduct(p);
    });
  }, [id]);

  if (!product) return <p style={{ color: "var(--text-muted)" }}>Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-wide mb-8">Edit Product</h1>
      <ProductForm initial={product} productId={id} />
    </div>
  );
}
