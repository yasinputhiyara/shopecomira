import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Tag,
  Gift,
  CreditCard,
  Truck,
  Copy,
  Check,
  Home,
  ArrowRight,
  Sparkles,
  Zap,
  ShoppingBag,
} from "lucide-react";
import { api } from "../services/api.js";
import { useCart } from "../context/CartContext.jsx";

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState("");
  const { setCouponCode, showToast } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadOffers() {
      try {
        const res = await api.getActiveOffers();
        setOffers(res.data || []);
      } catch (err) {
        console.error("Failed to load offers:", err);
      } finally {
        setLoading(false);
      }
    }
    loadOffers();
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setCouponCode(code);
    showToast?.(`Coupon <strong>${code}</strong> copied & applied!`);
    setTimeout(() => setCopiedCode(""), 2500);
  };

  const handleApplyAndShop = (code) => {
    setCouponCode(code);
    showToast?.(`Coupon <strong>${code}</strong> applied! Start adding items to cart.`);
    navigate("/");
  };

  return (
    <div style={{ minHeight: "80vh", background: "var(--bg-main)", paddingBottom: "4rem" }}>
      {/* Breadcrumb */}
      <div style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)", padding: "0.75rem 1.25rem" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <Link to="/" style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Home size={14} /> Home
          </Link>
          <span>/</span>
          <span style={{ color: "var(--text-primary)" }}>Offers &amp; Coupons</span>
        </div>
      </div>

      <div className="container" style={{ paddingTop: "2.5rem" }}>
        {/* Page Header */}
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 3rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.35rem 0.85rem", background: "rgba(245, 158, 11, 0.12)", color: "var(--accent-amber)", borderRadius: "var(--radius-full)", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.85rem" }}>
            <Sparkles size={14} />
            <span>Exclusive Savings Hub</span>
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.75rem" }}>
            Today&apos;s Deals, Coupons &amp; Offers
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>
            Maximize your savings at Shopecomira with instant coupon codes, multi-item basket discounts, and online payment rewards.
          </p>
        </div>

        {/* Feature Offer Highlights 3-Card Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem", marginBottom: "3rem" }}>
          {/* Offer 1: Prepaid 5% */}
          <div style={{ background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(16, 185, 129, 0.1))", border: "1px solid rgba(99, 102, 241, 0.3)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div style={{ width: 40, height: 40, borderRadius: "10px", background: "var(--accent-indigo)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <CreditCard size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Extra 5% Instant Off</h3>
                <span style={{ fontSize: "0.75rem", color: "var(--accent-emerald)", fontWeight: 600 }}>Auto-applied on Prepaid</span>
              </div>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "1rem" }}>
              Pay via any UPI App (GPay, PhonePe, Paytm), RuPay, Visa, Mastercard, or Net Banking and receive an instant 5% discount at checkout.
            </p>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              &bull; No coupon required &bull; Combines with coupon codes
            </div>
          </div>

          {/* Offer 2: Free Shipping */}
          <div style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.1))", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div style={{ width: 40, height: 40, borderRadius: "10px", background: "var(--accent-emerald)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <Truck size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Free Pan-India Delivery</h3>
                <span style={{ fontSize: "0.75rem", color: "var(--accent-emerald)", fontWeight: 600 }}>Orders Above ₹999</span>
              </div>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "1rem" }}>
              Add ₹999 or more to your cart and enjoy free express doorstep delivery with full courier tracking across all Indian pin codes.
            </p>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              &bull; Fast 24-48h dispatch &bull; Reputable courier partners
            </div>
          </div>

          {/* Offer 3: Multi-item */}
          <div style={{ background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.1))", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div style={{ width: 40, height: 40, borderRadius: "10px", background: "var(--accent-amber)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <Zap size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Multi-Item Savings</h3>
                <span style={{ fontSize: "0.75rem", color: "var(--accent-amber)", fontWeight: 600 }}>Up to 15% Extra Off</span>
              </div>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "1rem" }}>
              Buy 2 items to get 10% off your entire basket. Buy 3 or more items to unlock the maximum 15% bundle discount automatically.
            </p>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              &bull; Automatically calculated in cart &bull; Mix &amp; match any item
            </div>
          </div>
        </div>

        {/* Coupon Codes Section */}
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Tag size={20} style={{ color: "var(--accent-indigo)" }} />
            <span>Active Coupon Codes</span>
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.25rem" }}>
            {[
              {
                code: "WELCOME10",
                discount: "10% OFF",
                desc: "10% off your entire cart with no minimum spend limit.",
                minSpend: "No minimum",
                badge: "Popular",
              },
              {
                code: "SAVE15",
                discount: "15% OFF",
                desc: "Get 15% instant discount on orders of ₹1,500 or more.",
                minSpend: "Min spend ₹1,500",
                badge: "High Value",
              },
              {
                code: "FIRST5",
                discount: "5% OFF",
                desc: "Special extra discount on any trending lifestyle gadget.",
                minSpend: "No minimum",
                badge: "Storewide",
              },
            ].map((coupon) => (
              <div
                key={coupon.code}
                style={{
                  background: "var(--bg-surface)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px dashed var(--border-medium)",
                  padding: "1.5rem",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--accent-emerald)" }}>
                      {coupon.discount}
                    </span>
                    <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.72rem", fontWeight: 600, background: "rgba(99, 102, 241, 0.15)", color: "var(--accent-indigo)" }}>
                      {coupon.badge}
                    </span>
                  </div>

                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "1rem" }}>
                    {coupon.desc}
                  </p>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
                    Conditions: {coupon.minSpend}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <div
                    style={{
                      flex: 1,
                      background: "var(--bg-main)",
                      padding: "0.55rem 0.85rem",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-subtle)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontFamily: "monospace",
                      fontWeight: 700,
                      color: "var(--accent-indigo)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    <span>{coupon.code}</span>
                    <button
                      onClick={() => handleCopy(coupon.code)}
                      style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center" }}
                      title="Copy code"
                    >
                      {copiedCode === coupon.code ? <Check size={16} color="var(--accent-emerald)" /> : <Copy size={16} />}
                    </button>
                  </div>

                  <button
                    onClick={() => handleApplyAndShop(coupon.code)}
                    className="btn-primary"
                    style={{ padding: "0.55rem 0.85rem", fontSize: "0.82rem", whiteSpace: "nowrap" }}
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div style={{ textAlign: "center", padding: "2.5rem 1.5rem", background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", marginTop: "3rem" }}>
          <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.5rem" }}>Ready to Start Shopping?</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            All coupons and automatic discounts can be reviewed in your cart before final payment.
          </p>
          <Link to="/" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <ShoppingBag size={18} />
            <span>Explore Trending Catalogue</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
