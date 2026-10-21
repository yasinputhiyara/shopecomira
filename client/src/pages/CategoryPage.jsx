import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useOutletContext, Link } from "react-router-dom";
import { RefreshCw, ArrowLeft, Search, Home } from "lucide-react";
import ProductCard from "../components/ProductCard.jsx";
import ProductDetailModal from "../components/ProductDetailModal.jsx";
import CheckoutModal from "../components/CheckoutModal.jsx";
import OrderConfirmationModal from "../components/OrderConfirmationModal.jsx";
import GstInvoiceModal from "../components/GstInvoiceModal.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { loginPath } from "../utils/authRedirect.js";
import { api } from "../services/api.js";

export default function CategoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const outletCtx = useOutletContext() || {};
  const { categories = [], settings, setIsCartOpen } = outletCtx;

  const { cartItems, addToCart, couponCode, clearCart } = useCart();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("popular");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);

  const currentCategory = categories.find((c) => c.slug === slug);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const res = await api.getProducts({ category: slug, limit: 48 });
        setProducts(res.data || []);
      } catch (err) {
        console.error("Failed to load category products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [slug]);

  const handleAddToCart = (product, variant, qty = 1) => {
    addToCart(product, variant, qty);
  };

  const handleBuyNow = (product, variant, qty = 1) => {
    handleAddToCart(product, variant, qty);
    setSelectedProduct(null);
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate(loginPath("/checkout"));
      return;
    }
    navigate("/checkout");
  };

  const handleOrderSuccess = (order) => {
    setIsCheckoutOpen(false);
    clearCart();
    setConfirmedOrder(order);
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.shortDescription?.toLowerCase().includes(q)
      );
    }

    if (sortBy === "price_asc") {
      result.sort((a, b) => (a.variants?.[0]?.sellingPricePaise || 0) - (b.variants?.[0]?.sellingPricePaise || 0));
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => (b.variants?.[0]?.sellingPricePaise || 0) - (a.variants?.[0]?.sellingPricePaise || 0));
    }

    return result;
  }, [products, searchQuery, sortBy]);

  return (
    <>
      {/* Page Header */}
      <div style={{
        background: "linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-main) 100%)",
        borderBottom: "1px solid var(--border-subtle)",
        padding: "2rem 1.25rem",
      }}>
        <div className="container">
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
            <Link to="/" style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <Home size={14} />
              Home
            </Link>
            <span>/</span>
            <span style={{ color: "var(--text-primary)" }}>{currentCategory?.name || slug}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                {currentCategory?.name || slug}
              </h1>
              {currentCategory?.description && (
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  {currentCategory.description}
                </p>
              )}
              <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: "0.35rem" }}>
                {filteredProducts.length} products available
              </p>
            </div>

            <Link
              to="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
                textDecoration: "none",
              }}
            >
              <ArrowLeft size={16} />
              All Products
            </Link>
          </div>
        </div>
      </div>

      {/* Category quick nav */}
      {categories.length > 0 && (
        <div style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)", padding: "0.6rem 1.25rem", overflowX: "auto" }}>
          <div className="container" style={{ display: "flex", gap: "0.4rem", flexWrap: "nowrap" }}>
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/category/${cat.slug}`}
                style={{
                  padding: "0.3rem 0.8rem",
                  borderRadius: "var(--radius-full)",
                  border: `1px solid ${cat.slug === slug ? "var(--accent-indigo)" : "var(--border-subtle)"}`,
                  background: cat.slug === slug ? "var(--accent-indigo-bg)" : "transparent",
                  color: cat.slug === slug ? "var(--accent-indigo)" : "var(--text-muted)",
                  fontSize: "0.8rem",
                  fontWeight: cat.slug === slug ? 600 : 400,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                }}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Products Section */}
      <main className="container" style={{ padding: "1.5rem 1.25rem 3rem" }}>
        {/* Controls */}
        <div className="section-header" style={{ marginBottom: "1.5rem" }}>
          <div style={{ position: "relative", maxWidth: 280 }}>
            <Search size={16} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search in this category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: "2rem", height: 36, fontSize: "0.82rem" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Sort by:</span>
            <select
              className="form-control"
              style={{ width: "auto", height: 36, fontSize: "0.82rem", padding: "0.2rem 0.6rem" }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="popular">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>
            <RefreshCw size={36} className="spin" style={{ marginBottom: "1rem" }} />
            <p>Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 1rem", background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
            <Search size={44} style={{ opacity: 0.3, marginBottom: "1rem" }} />
            <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>No products found in this category</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
              Try browsing other categories or view all products.
            </p>
            <Link to="/" className="btn-secondary">View All Products</Link>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((prod) => (
              <ProductCard
                key={prod._id}
                product={prod}
                onSelectProduct={setSelectedProduct}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          whatsappNumber={settings?.whatsappNumber || "919876543210"}
        />
      )}

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        couponCode={couponCode}
        onOrderSuccess={handleOrderSuccess}
      />

      {confirmedOrder && (
        <OrderConfirmationModal
          order={confirmedOrder}
          onClose={() => setConfirmedOrder(null)}
          onViewInvoice={(ord) => setViewingInvoice(ord)}
          onTrackOrder={() => {
            setConfirmedOrder(null);
            navigate("/track-order");
          }}
        />
      )}

      {viewingInvoice && (
        <GstInvoiceModal
          invoiceData={viewingInvoice}
          onClose={() => setViewingInvoice(null)}
        />
      )}
    </>
  );
}
