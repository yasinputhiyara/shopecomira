import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Search, Home, ArrowLeft, RefreshCw, AlertCircle, Sparkles, Filter } from "lucide-react";
import ProductCard from "../components/ProductCard.jsx";
import { useCart } from "../context/CartContext.jsx";
import { api } from "../services/api.js";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(query);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const { addToCart, showToast } = useCart();

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          api.getProducts({ limit: 50 }),
          api.getCategories(),
        ]);
        setProducts(prodRes.data || []);
        setCategories(catRes.data || []);
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter((p) => {
        const matchName = p.name?.toLowerCase().includes(q);
        const matchBrand = p.brand?.toLowerCase().includes(q);
        const matchDesc = p.shortDescription?.toLowerCase().includes(q);
        const matchCat = p.category?.name?.toLowerCase().includes(q);
        return matchName || matchBrand || matchDesc || matchCat;
      });
    }

    if (selectedCategory !== "all") {
      list = list.filter((p) => p.category?.slug === selectedCategory || p.category?._id === selectedCategory);
    }

    if (sortBy === "price_asc") {
      list.sort((a, b) => (a.variants?.[0]?.sellingPricePaise || 0) - (b.variants?.[0]?.sellingPricePaise || 0));
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => (b.variants?.[0]?.sellingPricePaise || 0) - (a.variants?.[0]?.sellingPricePaise || 0));
    }

    return list;
  }, [products, query, selectedCategory, sortBy]);

  const popularSearches = ["Earbuds", "Scrubber", "Neck Massager", "Projector", "Wireless Charger", "Bottle"];

  return (
    <div style={{ minHeight: "80vh", background: "var(--bg-main)", paddingBottom: "4rem" }}>
      {/* Breadcrumb */}
      <div style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)", padding: "0.75rem 1.25rem" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <Link to="/" style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Home size={14} /> Home
          </Link>
          <span>/</span>
          <span style={{ color: "var(--text-primary)" }}>Search Results</span>
          {query && (
            <>
              <span>/</span>
              <span style={{ color: "var(--accent-indigo)" }}>&ldquo;{query}&rdquo;</span>
            </>
          )}
        </div>
      </div>

      <div className="container" style={{ paddingTop: "2rem" }}>
        {/* Search Input Box */}
        <div style={{ maxWidth: 640, margin: "0 auto 2rem" }}>
          <form onSubmit={handleSearchSubmit} style={{ position: "relative" }}>
            <Search size={20} style={{ position: "absolute", left: "1.2rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search trending products, categories, brands..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="form-control"
              style={{
                height: 52,
                paddingLeft: "3.2rem",
                paddingRight: "6.5rem",
                borderRadius: "var(--radius-full)",
                fontSize: "1rem",
                background: "var(--bg-surface)",
                borderColor: "var(--border-medium)",
              }}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{
                position: "absolute",
                right: "6px",
                top: "6px",
                bottom: "6px",
                padding: "0 1.25rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.85rem",
              }}
            >
              Search
            </button>
          </form>

          {/* Popular Search Suggestions */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap", fontSize: "0.78rem" }}>
            <span style={{ color: "var(--text-muted)" }}>Trending searches:</span>
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => setSearchParams({ q: term })}
                style={{
                  background: "var(--bg-surface-elevated)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                  borderRadius: "var(--radius-full)",
                  padding: "0.2rem 0.65rem",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                }}
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Results Header and Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.35rem", fontWeight: 700 }}>
              {query ? `Search Results for "${query}"` : "Catalogue Search"}
            </h1>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
              Found {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-control"
              style={{ width: "auto", minWidth: 150, height: 38, fontSize: "0.82rem" }}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c.slug}>{c.name}</option>
              ))}
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-control"
              style={{ width: "auto", minWidth: 150, height: 38, fontSize: "0.82rem" }}
            >
              <option value="popular">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>
            <RefreshCw size={36} className="spin" style={{ margin: "0 auto 1rem" }} />
            <p>Searching trending items...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", maxWidth: 500, margin: "2rem auto" }}>
            <AlertCircle size={48} style={{ color: "var(--accent-amber)", opacity: 0.8, margin: "0 auto 1rem" }} />
            <h3 style={{ marginBottom: "0.5rem" }}>No matching products found</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "1.5rem" }}>
              We couldn&apos;t find any trending items matching &ldquo;{query}&rdquo;. Try checking the spelling or browse our trending catalogue.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button onClick={() => setSearchParams({})} className="btn-secondary">Clear Search</button>
              <Link to="/" className="btn-primary">Browse All</Link>
            </div>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                onSelectProduct={(prod) => navigate(`/product/${prod.slug}`)}
                onAddToCart={(prod, v, q) => {
                  addToCart(prod, v, q);
                  showToast?.(`Added <strong>${prod.name}</strong> to cart!`);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
