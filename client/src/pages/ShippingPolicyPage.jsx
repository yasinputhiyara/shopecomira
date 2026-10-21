import React from "react";
import { Link } from "react-router-dom";
import { Truck, Clock, ShieldCheck, MapPin, Home, CheckCircle2 } from "lucide-react";

export default function ShippingPolicyPage() {
  return (
    <div style={{ minHeight: "80vh", background: "var(--bg-main)", paddingBottom: "5rem" }}>
      {/* Breadcrumb */}
      <div style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)", padding: "0.75rem 1.25rem" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <Link to="/" style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Home size={14} /> Home
          </Link>
          <span>/</span>
          <span style={{ color: "var(--text-primary)" }}>Shipping &amp; Delivery Policy</span>
        </div>
      </div>

      <div className="container" style={{ paddingTop: "3rem", maxWidth: 800 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.35rem 0.85rem", background: "rgba(16, 185, 129, 0.12)", color: "var(--accent-emerald)", borderRadius: "var(--radius-full)", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.85rem" }}>
            <Truck size={14} />
            <span>Pan-India Logistics</span>
          </div>
          <h1 style={{ fontSize: "2.1rem", fontWeight: 800, marginBottom: "0.75rem" }}>
            Shipping &amp; Delivery Policy
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Last updated: October 2026 &bull; Shopecomira Retail Enterprises Pvt Ltd
          </p>
        </div>

        {/* Content Body */}
        <div style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", padding: "2.5rem", display: "flex", flexDirection: "column", gap: "2rem", lineHeight: 1.7, fontSize: "0.92rem", color: "var(--text-secondary)" }}>
          <div>
            <h3 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              1. Delivery Coverage &amp; Courier Partners
            </h3>
            <p>
              Shopecomira delivers to over 19,000+ pin codes across India. We partner exclusively with tier-1 national logistics providers including <strong>Delhivery, BlueDart, Shadowfax, and Xpressbees</strong> to guarantee prompt and secure handling.
            </p>
          </div>

          <div>
            <h3 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              2. Shipping Charges &amp; Free Delivery
            </h3>
            <div style={{ background: "var(--bg-main)", borderRadius: "var(--radius-md)", padding: "1.25rem", border: "1px solid var(--border-subtle)", marginTop: "0.5rem" }}>
              <ul style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <li>
                  <strong style={{ color: "var(--accent-emerald)" }}>Orders of ₹999 or more:</strong> FREE Doorstep Shipping nationwide.
                </li>
                <li>
                  <strong>Orders below ₹999:</strong> A standard flat shipping charge of ₹70 is applied.
                </li>
                <li>
                  <strong>Cash on Delivery (COD):</strong> An optional convenience fee of ₹50 is added to cover cash handling expenses.
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h3 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              3. Processing &amp; Dispatch Timeline
            </h3>
            <p>
              All orders are processed and dispatched within <strong>24 to 48 hours</strong> (excluding national holidays and Sundays). Once handed over to the courier, an automated WhatsApp and SMS notification with your Air Waybill (AWB) number and direct tracking URL is generated.
            </p>
          </div>

          <div>
            <h3 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              4. Estimated Delivery Timelines
            </h3>
            <ul style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <li><strong>Tier 1 Metros:</strong> 2 to 4 business days (Mumbai, Delhi-NCR, Bengaluru, Pune, Hyderabad, Chennai, Kolkata).</li>
              <li><strong>Tier 2 &amp; Tier 3 Cities:</strong> 3 to 5 business days.</li>
              <li><strong>North-East, J&amp;K, and Remote Locations:</strong> 5 to 7 business days.</li>
            </ul>
          </div>

          <div>
            <h3 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              5. Order Tracking Assistance
            </h3>
            <p>
              You can track your package 24/7 on our <Link to="/track-order" style={{ color: "var(--accent-indigo)" }}>Order Tracking Portal</Link> or connect with our logistics coordinator via WhatsApp at <strong>+91 98765 43210</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
