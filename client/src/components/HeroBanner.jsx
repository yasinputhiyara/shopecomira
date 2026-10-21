import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  RotateCcw,
  CreditCard,
} from "lucide-react";

export default function HeroBanner({ onExploreDeals, featuredProduct, onSelectProduct }) {
  const productUrl = featuredProduct?.slug ? `/product/${featuredProduct.slug}` : "/";

  return (
    <section className="hero-section">
      <div className="hero-glow-1"></div>
      <div className="hero-glow-2"></div>

      <div className="container">
        <div className="hero-card">
          <div className="hero-content">
            <div className="hero-badge-deal">
              <Sparkles size={14} />
              <span>Viral & Trending On Social Media</span>
            </div>

            <h1 className="hero-title">
              Next-Gen Products <br />
              <span className="gradient-text">Designed for Smarter Living</span>
            </h1>

            <p className="hero-description">
              Carefully curated, premium quality viral gadgets and home innovations. Enjoy an extra <strong>5% instant discount</strong> on UPI/Online payments, or pay safely via Cash on Delivery.
            </p>

            <div className="hero-cta-group">
              <button className="btn-primary" onClick={onExploreDeals}>
                <span>Explore Trending Deals</span>
                <ArrowRight size={18} />
              </button>

              {featuredProduct && (
                <Link
                  to={productUrl}
                  className="btn-secondary"
                  style={{ textDecoration: "none" }}
                >
                  <span>Featured: {featuredProduct.brand || featuredProduct.name}</span>
                </Link>
              )}
            </div>

            <div className="hero-trust-badges">
              <div className="trust-item">
                <Zap size={16} />
                <span>24h Dispatch</span>
              </div>
              <div className="trust-item">
                <CreditCard size={16} />
                <span>Extra 5% Online Off</span>
              </div>
              <div className="trust-item">
                <ShieldCheck size={16} />
                <span>GST Compliant Invoices</span>
              </div>
              <div className="trust-item">
                <RotateCcw size={16} />
                <span>7-Day Return Window</span>
              </div>
            </div>
          </div>

          <div className="hero-media-wrapper">
            <Link to={productUrl} style={{ display: "block", textDecoration: "none" }}>
              <img
                src={
                  featuredProduct?.images?.[0]?.url ||
                  "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=900&q=80"
                }
                alt={featuredProduct?.name || "Featured trending item"}
                className="hero-image-featured"
              />
            </Link>
            <div className="hero-floating-pill">
              <span style={{ fontSize: "1.2rem" }}>🔥</span>
              <div>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff" }}>
                  Save up to 62%
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--accent-emerald)" }}>
                  Extra 5% off at Checkout
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
