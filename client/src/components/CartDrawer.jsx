import React, { useState } from "react";
import {
  X,
  Trash2,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Check,
} from "lucide-react";

export default function CartDrawer({
  isOpen,
  onClose,
  items = [],
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  couponCode,
  onApplyCoupon,
  freeShippingThreshold = 999,
}) {
  if (!isOpen) return null;

  const [inputCoupon, setInputCoupon] = useState(couponCode || "");
  const [couponError, setCouponError] = useState("");

  const subtotal = items.reduce(
    (sum, item) => sum + ((item.sellingPricePaise || 0) * item.quantity) / 100,
    0
  );

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  // Multi-item discount calculation
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

  // Coupon discount calculation
  let couponDiscount = 0;
  if (couponCode && couponCode.toUpperCase() === "WELCOME10") {
    couponDiscount = Math.min(Math.round((subtotal - multiItemDiscount) * 0.1), 300);
  } else if (couponCode && couponCode.toUpperCase() === "TREND150" && subtotal >= 1500) {
    couponDiscount = 150;
  }

  // Shipping
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const shippingFee = isFreeShipping || items.length === 0 ? 0 : 70;
  const amountForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const total = Math.max(0, subtotal - multiItemDiscount - couponDiscount + shippingFee);
  const estimatedPrepaidSavings = Math.round((subtotal - multiItemDiscount - couponDiscount) * 0.05);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError("");
    const code = inputCoupon.trim().toUpperCase();
    if (!code) {
      onApplyCoupon("");
      return;
    }
    if (code === "WELCOME10" || code === "TREND150") {
      onApplyCoupon(code);
    } else {
      setCouponError("Invalid coupon code. Try WELCOME10");
    }
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div
        className="drawer-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="drawer-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShoppingBag size={20} color="var(--accent-indigo)" />
            <h3 style={{ fontSize: "1.1rem" }}>Your Cart ({totalQuantity})</h3>
          </div>
          <button className="modal-close-btn" style={{ position: "static" }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          {/* Free Shipping Progress */}
          {items.length > 0 && (
            <div className="free-shipping-bar">
              <div style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                {isFreeShipping ? (
                  <span style={{ color: "var(--accent-emerald)" }}>
                    🎉 Congratulations! You have unlocked <strong>FREE Shipping</strong>!
                  </span>
                ) : (
                  <span>
                    Add <strong>₹{amountForFreeShipping.toLocaleString("en-IN")}</strong> more to get <strong>FREE Shipping</strong>!
                  </span>
                )}
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${freeShippingProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Multi-Item Saver Banner */}
          {items.length > 0 && (
            <div
              style={{
                background: "var(--accent-amber-bg)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                color: "var(--accent-amber)",
                padding: "0.6rem 0.85rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.8rem",
                fontWeight: 600,
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <Sparkles size={16} />
              <span>{multiItemMsg}</span>
            </div>
          )}

          {/* Cart Items List */}
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--text-muted)" }}>
              <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: "1rem" }} />
              <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                Your cart is empty
              </p>
              <p style={{ fontSize: "0.85rem", marginTop: "0.4rem" }}>
                Explore our trending deals and add innovative products!
              </p>
            </div>
          ) : (
            <div className="cart-items-list">
              {items.map((item) => {
                const itemPrice = (item.sellingPricePaise || 0) / 100;
                return (
                  <div key={`${item.productId}-${item.variantSku}`} className="cart-item-card">
                    <img
                      src={item.imageUrl || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=200&q=80"}
                      alt={item.productName}
                      className="cart-item-img"
                    />
                    <div className="cart-item-details">
                      <h4 className="cart-item-title">{item.productName}</h4>
                      <div className="cart-item-variant">
                        {item.options?.map((o) => `${o.name}: ${o.value}`).join(", ") || item.variantSku}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#fff", marginBottom: "0.5rem" }}>
                        ₹{itemPrice.toLocaleString("en-IN")}
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div className="cart-qty-stepper">
                          <button
                            className="stepper-btn"
                            onClick={() => onUpdateQuantity(item.productId, item.variantSku, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="stepper-count">{item.quantity}</span>
                          <button
                            className="stepper-btn"
                            onClick={() => onUpdateQuantity(item.productId, item.variantSku, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.productId, item.variantSku)}
                          style={{ color: "var(--text-muted)", padding: "0.2rem" }}
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Coupon Code Section */}
          {items.length > 0 && (
            <div style={{ marginTop: "1.25rem" }}>
              <form onSubmit={handleApplyCoupon} style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  placeholder="Promo Code (e.g. WELCOME10)"
                  className="form-control"
                  style={{ textTransform: "uppercase", fontSize: "0.85rem" }}
                  value={inputCoupon}
                  onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                />
                <button
                  type="submit"
                  className="btn-secondary"
                  style={{ padding: "0.5rem 0.9rem", fontSize: "0.85rem", whiteSpace: "nowrap" }}
                >
                  {couponCode ? "Update" : "Apply"}
                </button>
              </form>

              {couponCode && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--accent-emerald)", fontSize: "0.78rem", marginTop: "0.4rem" }}>
                  <Check size={14} /> Coupon <strong>{couponCode}</strong> applied successfully!
                </div>
              )}
              {couponError && (
                <div style={{ color: "var(--accent-rose)", fontSize: "0.78rem", marginTop: "0.4rem" }}>
                  {couponError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer with Calculations */}
        {items.length > 0 && (
          <div className="drawer-footer">
            <div className="summary-row">
              <span>Item Subtotal</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>

            {multiItemDiscount > 0 && (
              <div className="summary-row savings">
                <span>Multi-Item Discount</span>
                <span>-₹{multiItemDiscount.toLocaleString("en-IN")}</span>
              </div>
            )}

            {couponDiscount > 0 && (
              <div className="summary-row savings">
                <span>Coupon ({couponCode})</span>
                <span>-₹{couponDiscount.toLocaleString("en-IN")}</span>
              </div>
            )}

            <div className="summary-row">
              <span>Shipping Charge</span>
              <span>{isFreeShipping ? "FREE" : `₹${shippingFee}`}</span>
            </div>

            <div
              style={{
                background: "var(--accent-emerald-bg)",
                border: "1px dashed var(--accent-emerald)",
                borderRadius: "var(--radius-sm)",
                padding: "0.5rem 0.75rem",
                fontSize: "0.78rem",
                color: "var(--accent-emerald)",
                margin: "0.6rem 0",
              }}
            >
              💡 Pay online at checkout to save an extra <strong>₹{estimatedPrepaidSavings.toLocaleString("en-IN")}</strong> (5% OFF)!
            </div>

            <div className="summary-row total">
              <span>Estimated Total</span>
              <span>₹{total.toLocaleString("en-IN")}</span>
            </div>

            <button
              className="btn-primary"
              style={{ width: "100%", marginTop: "1rem", height: 48, fontSize: "1rem" }}
              onClick={onProceedToCheckout}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
