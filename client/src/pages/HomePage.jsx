import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useOutletContext, useSearchParams, Link } from "react-router-dom";
import { Sparkles, Search, RefreshCw, Flame, Star, Tag, TrendingUp } from "lucide-react";
import ProductCard from "../components/ProductCard.jsx";
import HeroBanner from "../components/HeroBanner.jsx";
import OfferStrip from "../components/OfferStrip.jsx";
import ProductDetailModal from "../components/ProductDetailModal.jsx";
import CheckoutModal from "../components/CheckoutModal.jsx";
import OrderConfirmationModal from "../components/OrderConfirmationModal.jsx";
import GstInvoiceModal from "../components/GstInvoiceModal.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { loginPath } from "../utils/authRedirect.js";
import { api } from "../services/api.js";

export default function HomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const outletCtx = useOutletContext() || {};
  const {
    categories = [],
    settings,
    setIsCartOpen,
    setIsTrackOrderOpen,
    showToast,
    handleApplyCoupon,
  } = outletCtx;

  const { cartItems, addToCart, couponCode, setCouponCode, clearCart } = useCart();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Products state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter from URL params
  const filterParam = searchParams.get("filter") || "all";
  const searchParam = searchParams.get("search") || "";
  const [sortBy, setSortBy] = useState("popular");

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);

  // Load products
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const res = await api.getProducts({ limit: 48 });
        setProducts(res.data || []);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Handle add to cart
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

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (filterParam === "trending") result = result.filter((p) => p.isTrending);
    else if (filterParam === "bestseller") result = result.filter((p) => p.isBestSeller);
    else if (filterParam === "new") result = result.filter((p) => p.isNewArrival);

    if (searchParam.trim()) {
      const q = searchParam.toLowerCase().trim();
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
  }, [products, filterParam, searchParam, sortBy]);

  const featuredProduct = products.find((p) => p.isTrending) || products[0];

  const getSectionTitle = () => {
    if (filterParam === "trending") return "⚡ Trending Viral Deals";
    if (filterParam === "bestseller") return "⭐ Customer Best Sellers";
    if (filterParam === "new") return "✨ Fresh New Arrivals";
    return "🔥 All Trending Innovations";
  };

  return (
    <>
      {/* Hero Banner */}
      <HeroBanner
        onExploreDeals={() => {
          navigate("/?filter=trending");
          setTimeout(() => {
            document.getElementById("products-catalogue")?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }}
        featuredProduct={featuredProduct}
        onSelectProduct={setSelectedProduct}
      />

      {/* Offer Strip */}
      <OfferStrip
        onApplyCoupon={(code) => {
          if (handleApplyCoupon) handleApplyCoupon(code);
          else {
            setCouponCode(code);
            setIsCartOpen?.(true);
          }
        }}
      />

      {/* Quick Category Filter Badges */}
      <div style={{ background: "var(--bg-main)", padding: "1rem 1.25rem 0" }}>
        <div className="container" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {[
            { label: "All Products", filter: "all", icon: "🛍️" },
            { label: "Trending", filter: "trending", icon: "🔥" },
            { label: "Best Sellers", filter: "bestseller", icon: "⭐" },
            { label: "New Arrivals", filter: "new", icon: "✨" },
          ].map((tab) => (
            <Link
              key={tab.filter}
              to={tab.filter === "all" ? "/" : `/?filter=${tab.filter}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                padding: "0.4rem 0.9rem",
                borderRadius: "var(--radius-full)",
                border: `1px solid ${filterParam === tab.filter || (tab.filter === "all" && filterParam === "all" && !searchParam) ? "var(--accent-indigo)" : "var(--border-subtle)"}`,
                background: filterParam === tab.filter || (tab.filter === "all" && filterParam === "all" && !searchParam) ? "var(--accent-indigo-bg)" : "transparent",
                color: filterParam === tab.filter || (tab.filter === "all" && filterParam === "all" && !searchParam) ? "var(--accent-indigo)" : "var(--text-secondary)",
                fontSize: "0.82rem",
                fontWeight: 500,
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Products Catalogue */}
      <main id="products-catalogue" className="container" style={{ padding: "1.5rem 1.25rem 3rem" }}>
        {/* Section Header */}
        <div className="section-header">
          <div>
            <h2 className="section-title">{getSectionTitle()}</h2>
            <div className="section-subtitle">
              Showing {filteredProducts.length} fast-moving products &bull; Extra 5% OFF on Online Payment
            </div>
          </div>

          {/* Sort */}
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

        {/* Products Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>
            <RefreshCw size={36} className="spin" style={{ marginBottom: "1rem" }} />
            <p>Loading catalogue products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 1rem", background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
            <Search size={44} style={{ opacity: 0.3, marginBottom: "1rem" }} />
            <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>No matching products found</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
              Try adjusting your search query or browse all products.
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

      {/* MODALS */}
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
