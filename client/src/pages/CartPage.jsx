import React, { useState } from "react";
import { useNavigate, useOutletContext, Link } from "react-router-dom";
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  Check,
  Home,
  ArrowLeft,
  Package,
} from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { loginPath } from "../utils/authRedirect.js";
import CheckoutModal from "../components/CheckoutModal.jsx";
import OrderConfirmationModal from "../components/OrderConfirmationModal.jsx";
import GstInvoiceModal from "../components/GstInvoiceModal.jsx";

const formatPrice = (paise) => `₹${((paise || 0) / 100).toLocaleString("en-IN")}`;

const VALID_COUPONS = {
  WELCOME10: { discountPercent: 10, minCartValue: 0 },
  SAVE15: { discountPercent: 15, minCartValue: 1500 },
  FIRST5: { discountPercent: 5, minCartValue: 0 },
};

export default function CartPage() {
  const navigate = useNavigate();
  const outletCtx = useOutletContext() || {};
  const { settings } = outletCtx;

  const { cartItems, updateQuantity, removeFromCart, couponCode, setCouponCode, clearCart } = useCart();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [inputCoupon, setInputCoupon] = useState(couponCode || "");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);

  const freeShippingThreshold = (settings?.freeShippingThresholdPaise || 99900) / 100;

  const subtotal = cartItems.reduce((sum, item) => sum + ((item.sellingPricePaise || 0) * item.quantity) / 100, 0);
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Multi-item discount
  let multiItemDiscount = 0;
  let multiItemMsg = "";
  if (totalQuantity === 1) {
    multiItemMsg = "Add 1 more item to save an extra 10%!";
  } else if (totalQuantity === 2) {
    multiItemDiscount = Math.round(subtotal * 0.1);
    multiItemMsg = "🎉 10% Multi-item discount applied! Add 1 more for 15% OFF!";
  } else if (totalQuantity >= 3) {
    multiItemDiscount = Math.round(subtotal * 0.15);
    multiItemMsg = "🔥 Maximum 15% Multi-item discount applied!";
  }

  // Coupon discount
  let couponDiscount = 0;
  const couponData = VALID_COUPONS[couponCode?.toUpperCase()];
  if (couponData) {
    const afterMulti = subtotal - multiItemDiscount;
    couponDiscount = Math.round((afterMulti * couponData.discountPercent) / 100);
  }

  const shipping = subtotal >= freeShippingThreshold ? 0 : 99;
  const total = subtotal - multiItemDiscount - couponDiscount + shipping;

  const handleApplyCoupon = () => {
    const upper = inputCoupon.trim().toUpperCase();
    if (!upper) {
      setCouponCode("");
      setCouponError("Coupon removed");
      setCouponSuccess("");
      setTimeout(() => setCouponError(""), 2000);
      return;
    }
    const data = VALID_COUPONS[upper];
    if (!data) {
      setCouponError("Invalid coupon code");
      setCouponSuccess("");
      return;
    }
    if (subtotal < data.minCartValue) {
      setCouponError(`Min cart value ₹${data.minCartValue} required`);
      setCouponSuccess("");
      return;
    }
    setCouponCode(upper);
    setCouponSuccess(`✓ ${data.discountPercent}% discount applied!`);
    setCouponError("");
  };

  const handleOrderSuccess = (order) => {
    setIsCheckoutOpen(false);
    clearCart();
    setConfirmedOrder(order);
  };

  if (cartItems.length === 0 && !confirmedOrder) {
    return (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
          }}>
            <ShoppingBag size={36} style={{ color: "var(--text-muted)", opacity: 0.5 }} />
          </div>
          <h2 style={{ fontSize: "1.4rem", marginBottom: "0.5rem" }}>Your cart is empty</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
            Discover our trending products and add something you love!
          </p>
          <Link to="/" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <Package size={18} />
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumb Header */}
      <div style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)", padding: "0.75rem 1.25rem" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <Link to="/" style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Home size={14} /> Home
          </Link>
          <span>/</span>
          <span style={{ color: "var(--text-primary)" }}>Shopping Cart</span>
        </div>
      </div>

      <main className="container" style={{ padding: "2rem 1.25rem 4rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            🛒 Shopping Cart <span style={{ color: "var(--text-muted)", fontSize: "1rem", fontWeight: 400 }}>({totalQuantity} items)</span>
          </h1>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--accent-indigo)", fontSize: "0.85rem", textDecoration: "none" }}>
            <ArrowLeft size={16} />
            Continue Shopping
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem", alignItems: "start" }}>

          {/* Left: Cart Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {/* Multi-item offer banner */}
            {multiItemMsg && (
              <div style={{
                padding: "0.75rem 1rem",
                background: totalQuantity >= 2 ? "rgba(16,185,129,0.08)" : "var(--bg-surface)",
                border: `1px solid ${totalQuantity >= 2 ? "rgba(16,185,129,0.3)" : "var(--border-subtle)"}`,
                borderRadius: "var(--radius-md)",
                fontSize: "0.83rem",
                color: totalQuantity >= 2 ? "var(--accent-emerald)" : "var(--text-muted)",
                fontWeight: 500,
              }}>
                {multiItemMsg}
              </div>
            )}

            {cartItems.map((item) => (
              <div
                key={`${item.productId}-${item.variantSku}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1fr auto",
                  gap: "1rem",
                  padding: "1rem",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-lg)",
                  alignItems: "center",
                }}
              >
                {/* Image */}
                <div style={{ width: 80, height: 80, borderRadius: "var(--radius-md)", overflow: "hidden", background: "var(--bg-main)", flexShrink: 0 }}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Package size={28} style={{ opacity: 0.3 }} />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.25rem" }}>{item.productName}</p>
                  {item.options?.length > 0 && (
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
                      {item.options.map((o) => `${o.name}: ${o.value}`).join(" • ")}
                    </p>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontWeight: 700, color: "var(--accent-emerald)", fontSize: "1rem" }}>
                      {formatPrice(item.sellingPricePaise)}
                    </span>
                    {item.mrpPaise > item.sellingPricePaise && (
                      <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", textDecoration: "line-through" }}>
                        {formatPrice(item.mrpPaise)}
                      </span>
                    )}
                  </div>
                  {/* Qty controls */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.6rem" }}>
                    <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border-medium)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantSku, item.quantity - 1)}
                        style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-main)", border: "none", cursor: "pointer", fontSize: "1rem", color: "var(--text-secondary)" }}
                      >
                        −
                      </button>
                      <span style={{ width: 38, height: 30, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", fontWeight: 600 }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantSku, item.quantity + 1)}
                        style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-main)", border: "none", cursor: "pointer", fontSize: "1rem", color: "var(--text-secondary)" }}
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId, item.variantSku)}
                      style={{ padding: "0.3rem", color: "var(--accent-rose)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.78rem" }}
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                </div>

                {/* Line total */}
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontWeight: 700, fontSize: "1rem" }}>
                    {formatPrice(item.sellingPricePaise * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Order Summary */}
          <div style={{ position: "sticky", top: 100 }}>
            <div style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "1.5rem",
            }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1.25rem" }}>Order Summary</h2>

              {/* Coupon Input */}
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem", display: "block", color: "var(--text-secondary)" }}>
                  <Tag size={14} style={{ verticalAlign: "middle", marginRight: "0.3rem" }} />
                  Apply Coupon
                </label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. WELCOME10"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    style={{ flex: 1, height: 36, fontSize: "0.82rem" }}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="btn-secondary"
                    style={{ height: 36, padding: "0 0.75rem", fontSize: "0.82rem", flexShrink: 0 }}
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p style={{ fontSize: "0.75rem", color: "var(--accent-rose)", marginTop: "0.35rem" }}>{couponError}</p>}
                {couponSuccess && <p style={{ fontSize: "0.75rem", color: "var(--accent-emerald)", marginTop: "0.35rem" }}>{couponSuccess}</p>}
              </div>

              {/* Price Breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.85rem", marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Subtotal ({totalQuantity} items)</span>
                  <span>{formatPrice(subtotal * 100)}</span>
                </div>
                {multiItemDiscount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--accent-emerald)" }}>
                    <span>Multi-item Discount</span>
                    <span>-{formatPrice(multiItemDiscount * 100)}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--accent-emerald)" }}>
                    <span>Coupon ({couponCode})</span>
                    <span>-{formatPrice(couponDiscount * 100)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Shipping</span>
                  <span style={{ color: shipping === 0 ? "var(--accent-emerald)" : "inherit" }}>
                    {shipping === 0 ? "FREE 🎉" : formatPrice(shipping * 100)}
                  </span>
                </div>
                {shipping > 0 && (
                  <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    Add ₹{(freeShippingThreshold - subtotal).toFixed(0)} more for free shipping
                  </p>
                )}
              </div>

              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "0.75rem", display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "1.1rem", marginBottom: "1.25rem" }}>
                <span>Total</span>
                <span style={{ color: "var(--accent-emerald)" }}>{formatPrice(total * 100)}</span>
              </div>

              <button
                className="btn-primary"
                style={{ width: "100%", height: 48, fontSize: "0.95rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                onClick={() => {
                  if (authLoading) return;
                  if (!isAuthenticated) {
                    navigate(loginPath("/checkout"));
                    return;
                  }
                  navigate("/checkout");
                }}
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </button>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", marginTop: "0.75rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                <ShieldCheck size={14} style={{ color: "var(--accent-emerald)" }} />
                Secure SSL Checkout
              </div>

              {/* Coupon hints */}
              <div style={{ marginTop: "1rem", padding: "0.75rem", background: "var(--bg-main)", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                <strong style={{ color: "var(--text-secondary)" }}>Available Coupons:</strong>
                <div style={{ marginTop: "0.3rem", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                  <span><code style={{ color: "#a5f3fc" }}>WELCOME10</code> – 10% off any order</span>
                  <span><code style={{ color: "#a5f3fc" }}>SAVE15</code> – 15% off (min ₹1500)</span>
                  <span><code style={{ color: "#a5f3fc" }}>FIRST5</code> – Extra 5% off</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Checkout Modal */}
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
          onClose={() => {
            setConfirmedOrder(null);
            navigate("/");
          }}
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
