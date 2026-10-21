import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Home, ArrowRight, RefreshCw, Layers, Sparkles } from "lucide-react";
import { api } from "../services/api.js";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.getCategories();
        setCategories(res.data || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  return (
    <div style={{ minHeight: "80vh", background: "var(--bg-main)", paddingBottom: "4rem" }}>
      {/* Breadcrumb */}
      <div style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)", padding: "0.75rem 1.25rem" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <Link to="/" style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Home size={14} /> Home
          </Link>
          <span>/</span>
          <span style={{ color: "var(--text-primary)" }}>All Collections</span>
        </div>
      </div>

      <div className="container" style={{ paddingTop: "2.5rem" }}>
        {/* Header */}
        <div style={{ marginBottom: "2.5rem", textAlign: "center", maxWidth: 640, margin: "0 auto 3rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.35rem 0.85rem", background: "rgba(99, 102, 241, 0.12)", color: "var(--accent-indigo)", borderRadius: "var(--radius-full)", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.85rem" }}>
            <Layers size={14} />
            <span>Curated Collections</span>
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.75rem" }}>
            Browse All Product Categories
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>
            Discover India&apos;s fastest-moving lifestyle innovations, electronics, wellness tech, and home essentials.
          </p>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>
            <RefreshCw size={36} className="spin" style={{ margin: "0 auto 1rem" }} />
            <p>Loading collections...</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/category/${cat.slug}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  display: "flex",
                  flexDirection: "column",
                  background: "var(--bg-surface)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-subtle)",
                  overflow: "hidden",
                  transition: "all 0.25s ease",
                }}
                className="category-card-hover"
              >
                <div style={{ height: 180, position: "relative", overflow: "hidden" }}>
                  <img
                    src={cat.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"}
                    alt={cat.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.1) 60%)" }} />
                  <div style={{ position: "absolute", bottom: "1rem", left: "1rem", right: "1rem" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.2rem" }}>
                      {cat.name}
                    </h3>
                  </div>
                </div>

                <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "1.25rem" }}>
                    {cat.description || "Explore curated innovations and viral bestsellers in this collection."}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--accent-indigo)", fontSize: "0.85rem", fontWeight: 600 }}>
                    <span>Explore Products</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
