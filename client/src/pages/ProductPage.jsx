import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext, Link } from "react-router-dom";
import {
  ArrowLeft,
  Home,
  ShoppingBag,
  Heart,
  Star,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Zap,
  Shield,
  Truck,
  RefreshCw,
  Share2,
  Package,
  Tag,
  AlertCircle,
} from "lucide-react";
import CheckoutModal from "../components/CheckoutModal.jsx";
import OrderConfirmationModal from "../components/OrderConfirmationModal.jsx";
import GstInvoiceModal from "../components/GstInvoiceModal.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { loginPath } from "../utils/authRedirect.js";
import { api } from "../services/api.js";

const formatPrice = (paise) => `₹${((paise || 0) / 100).toLocaleString("en-IN")}`;
const discountPercent = (mrp, sell) => mrp > sell ? Math.round(((mrp - sell) / mrp) * 100) : 0;

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const outletCtx = useOutletContext() || {};
  const { settings, setIsCartOpen, showToast } = outletCtx;

  const { cartItems, addToCart, couponCode, clearCart } = useCart();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError("");
      try {
        const res = await api.getProductBySlug(slug);
        const prod = res.data || res;
        setProduct(prod);
        setSelectedVariant(prod.variants?.[0] || null);
        setSelectedImageIndex(0);
      } catch (err) {
        setError("Product not found or is unavailable.");
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    addToCart(product, selectedVariant, qty);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleBuyNow = () => {
    if (!product || !selectedVariant) return;
    addToCart(product, selectedVariant, qty);
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

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem", color: "var(--text-muted)" }}>
        <RefreshCw size={36} className="spin" />
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem", textAlign: "center", padding: "2rem" }}>
        <AlertCircle size={48} style={{ color: "var(--accent-rose)", opacity: 0.7 }} />
        <h2>Product Not Found</h2>
        <p style={{ color: "var(--text-secondary)" }}>{error}</p>
        <Link to="/" className="btn-primary">Back to Store</Link>
      </div>
    );
  }

  const images = product.images || [];
  const variants = product.variants || [];
  const currentVariant = selectedVariant || variants[0] || {};
  const inStock = (currentVariant.stockQuantity || 0) > 0;
  const discount = discountPercent(currentVariant.mrpPaise, currentVariant.sellingPricePaise);

  return (
    <>
      {/* Breadcrumb */}
      <div style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)", padding: "0.75rem 1.25rem" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <Link to="/" style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Home size={14} /> Home
          </Link>
          <span>/</span>
          {product.category && (
            <>
              <Link to={`/category/${product.category.slug}`} style={{ color: "var(--text-muted)" }}>
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span style={{ color: "var(--text-primary)" }}>{product.name}</span>
        </div>
      </div>

      <main className="container" style={{ padding: "2rem 1.25rem 4rem" }}>
        <div className="product-page-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "start" }}>

          {/* LEFT: Image Gallery */}
          <div>
            {/* Main Image */}
            <div style={{
              position: "relative",
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              aspectRatio: "1",
              marginBottom: "0.75rem",
              border: "1px solid var(--border-subtle)",
            }}>
              {images[selectedImageIndex] ? (
                <img
                  src={images[selectedImageIndex].url}
                  alt={product.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                  <Package size={64} style={{ opacity: 0.3 }} />
                </div>
              )}

              {/* Discount Badge */}
              {discount > 0 && (
                <div style={{
                  position: "absolute",
                  top: "1rem",
                  left: "1rem",
                  background: "var(--accent-rose)",
                  color: "#fff",
                  padding: "0.3rem 0.6rem",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                }}>
                  -{discount}% OFF
                </div>
              )}

              {/* Image navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                    disabled={selectedImageIndex === 0}
                    style={{
                      position: "absolute",
                      left: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.5)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "none",
                      cursor: "pointer",
                      opacity: selectedImageIndex === 0 ? 0.3 : 1,
                    }}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex(Math.min(images.length - 1, selectedImageIndex + 1))}
                    disabled={selectedImageIndex === images.length - 1}
                    style={{
                      position: "absolute",
                      right: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.5)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "none",
                      cursor: "pointer",
                      opacity: selectedImageIndex === images.length - 1 ? 0.3 : 1,
                    }}
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto" }}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    style={{
                      flexShrink: 0,
                      width: 68,
                      height: 68,
                      borderRadius: "var(--radius-sm)",
                      overflow: "hidden",
                      border: `2px solid ${idx === selectedImageIndex ? "var(--accent-indigo)" : "var(--border-subtle)"}`,
                      cursor: "pointer",
                      background: "var(--bg-surface)",
                      padding: 0,
                    }}
                  >
                    <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Signals */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "1.5rem" }}>
              {[
                { icon: <Shield size={16} />, text: "Authentic Product Guarantee" },
                { icon: <Truck size={16} />, text: "Free Shipping over ₹999" },
                { icon: <RefreshCw size={16} />, text: `${product.returnWindowDays || 7}-Day Easy Returns` },
                { icon: <Zap size={16} />, text: "5% Off on Prepaid Orders" },
              ].map((trust, idx) => (
                <div key={idx} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.6rem 0.75rem",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.78rem",
                  color: "var(--text-secondary)",
                }}>
                  <span style={{ color: "var(--accent-emerald)" }}>{trust.icon}</span>
                  {trust.text}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Product Details */}
          <div>
            {/* Category & Brand Tags */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
              {product.category && (
                <Link to={`/category/${product.category.slug}`} style={{
                  padding: "0.2rem 0.6rem",
                  borderRadius: "var(--radius-full)",
                  background: "var(--accent-indigo-bg)",
                  color: "var(--accent-indigo)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  textDecoration: "none",
                }}>
                  {product.category.name}
                </Link>
              )}
              {product.isTrending && (
                <span style={{ padding: "0.2rem 0.6rem", borderRadius: "var(--radius-full)", background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: "0.75rem", fontWeight: 600 }}>
                  🔥 Trending
                </span>
              )}
              {product.isBestSeller && (
                <span style={{ padding: "0.2rem 0.6rem", borderRadius: "var(--radius-full)", background: "rgba(245,158,11,0.1)", color: "#f59e0b", fontSize: "0.75rem", fontWeight: 600 }}>
                  ⭐ Best Seller
                </span>
              )}
            </div>

            {/* Product Name */}
            <h1 style={{ fontSize: "1.75rem", fontWeight: 700, lineHeight: 1.3, marginBottom: "0.5rem" }}>
              {product.name}
            </h1>

            {/* Brand */}
            {product.brand && (
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                Brand: <strong style={{ color: "var(--text-secondary)" }}>{product.brand}</strong>
              </p>
            )}

            {/* Rating */}
            {product.rating > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <div style={{ display: "flex", gap: "0.15rem" }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={16} fill={s <= Math.round(product.rating) ? "#f59e0b" : "none"} stroke={s <= Math.round(product.rating) ? "#f59e0b" : "var(--border-medium)"} />
                  ))}
                </div>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  {product.rating.toFixed(1)} ({product.reviewCount || 0} reviews)
                </span>
              </div>
            )}

            {/* Price Block */}
            <div style={{ padding: "1.25rem", background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "0.35rem" }}>
                <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-emerald)" }}>
                  {formatPrice(currentVariant.sellingPricePaise)}
                </span>
                {currentVariant.mrpPaise > currentVariant.sellingPricePaise && (
                  <>
                    <span style={{ fontSize: "1.1rem", color: "var(--text-muted)", textDecoration: "line-through" }}>
                      {formatPrice(currentVariant.mrpPaise)}
                    </span>
                    <span style={{ fontSize: "0.9rem", color: "var(--accent-rose)", fontWeight: 700 }}>
                      {discount}% OFF
                    </span>
                  </>
                )}
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Inclusive of all taxes (GST {product.gstRate}%) • {inStock ? `${currentVariant.stockQuantity} units in stock` : "Out of Stock"}
              </p>
              {inStock && (
                <p style={{ fontSize: "0.78rem", color: "var(--accent-emerald)", marginTop: "0.35rem", fontWeight: 500 }}>
                  💸 Extra 5% OFF when you pay online
                </p>
              )}
            </div>

            {/* Variant Selector */}
            {variants.length > 1 && (
              <div style={{ marginBottom: "1.25rem" }}>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.6rem", color: "var(--text-secondary)" }}>
                  Choose Variant:
                </p>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {variants.map((v) => (
                    <button
                      key={v.sku}
                      onClick={() => setSelectedVariant(v)}
                      style={{
                        padding: "0.4rem 1rem",
                        borderRadius: "var(--radius-md)",
                        border: `2px solid ${v.sku === currentVariant.sku ? "var(--accent-indigo)" : "var(--border-subtle)"}`,
                        background: v.sku === currentVariant.sku ? "var(--accent-indigo-bg)" : "var(--bg-surface)",
                        color: v.sku === currentVariant.sku ? "var(--accent-indigo)" : "var(--text-secondary)",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        opacity: v.stockQuantity === 0 ? 0.4 : 1,
                        position: "relative",
                      }}
                      disabled={v.stockQuantity === 0}
                      title={v.stockQuantity === 0 ? "Out of stock" : ""}
                    >
                      {v.options?.map((o) => o.value).join(" / ") || v.sku}
                      {v.stockQuantity === 0 && (
                        <span style={{ display: "block", fontSize: "0.65rem", color: "var(--accent-rose)" }}>Out of Stock</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty Selector */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>Qty:</span>
              <div style={{ display: "flex", alignItems: "center", gap: "0", border: "1px solid var(--border-medium)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-surface)", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "var(--text-secondary)" }}
                >
                  −
                </button>
                <span style={{ width: 44, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1rem", background: "var(--bg-main)" }}>
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min((currentVariant.stockQuantity || 10), q + 1))}
                  style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-surface)", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "var(--text-secondary)" }}
                >
                  +
                </button>
              </div>
              {currentVariant.stockQuantity <= 5 && currentVariant.stockQuantity > 0 && (
                <span style={{ fontSize: "0.78rem", color: "var(--accent-rose)", fontWeight: 600 }}>
                  Only {currentVariant.stockQuantity} left!
                </span>
              )}
            </div>

            {/* CTA Buttons */}
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="btn-secondary"
                style={{ flex: 1, height: 48, fontSize: "0.95rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
              >
                <ShoppingBag size={18} />
                {addedToCart ? "✓ Added to Cart!" : "Add to Cart"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!inStock}
                className="btn-primary"
                style={{ flex: 1, height: 48, fontSize: "0.95rem" }}
              >
                {inStock ? "Buy Now" : "Out of Stock"}
              </button>
            </div>

            {/* WhatsApp Enquiry */}
            <a
              href={`https://wa.me/${settings?.whatsappNumber || "919876543210"}?text=Hi! I'm interested in *${product.name}* (${currentVariant.options?.map(o => o.value).join("/")}). Is it available?`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp-enquire"
              style={{ width: "100%", justifyContent: "center", marginBottom: "1.5rem" }}
            >
              <MessageCircle size={18} />
              Enquire on WhatsApp
            </a>

            {/* Description */}
            {product.shortDescription && (
              <div style={{ marginBottom: "1.25rem" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.5rem" }}>About this Product</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.7 }}>{product.shortDescription}</p>
              </div>
            )}

            {/* Highlights */}
            {product.highlights?.length > 0 && (
              <div style={{ marginBottom: "1.25rem" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.6rem" }}>Key Highlights</h3>
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {product.highlights.map((h, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      <span style={{ color: "var(--accent-emerald)", marginTop: "0.1rem", flexShrink: 0 }}>✓</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specifications */}
            {product.specifications?.length > 0 && (
              <div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.6rem" }}>Specifications</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.83rem" }}>
                  <tbody>
                    {product.specifications.map((spec, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td style={{ padding: "0.5rem 0.75rem", fontWeight: 600, color: "var(--text-secondary)", background: "var(--bg-surface)", width: "40%" }}>{spec.label || spec.name}</td>
                        <td style={{ padding: "0.5rem 0.75rem", color: "var(--text-primary)" }}>{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
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
