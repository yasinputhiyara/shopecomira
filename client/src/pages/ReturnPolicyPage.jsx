import React from "react";
import { Link } from "react-router-dom";
import { RotateCcw, ShieldCheck, CheckCircle2, MessageCircle, Home, AlertCircle } from "lucide-react";

export default function ReturnPolicyPage() {
  return (
    <div style={{ minHeight: "80vh", background: "var(--bg-main)", paddingBottom: "5rem" }}>
      {/* Breadcrumb */}
      <div style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)", padding: "0.75rem 1.25rem" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <Link to="/" style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Home size={14} /> Home
          </Link>
          <span>/</span>
          <span style={{ color: "var(--text-primary)" }}>7-Day Return &amp; Refund Policy</span>
        </div>
      </div>

      <div className="container" style={{ paddingTop: "3rem", maxWidth: 800 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.35rem 0.85rem", background: "rgba(99, 102, 241, 0.12)", color: "var(--accent-indigo)", borderRadius: "var(--radius-full)", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.85rem" }}>
            <RotateCcw size={14} />
            <span>Buyer Protection Guarantee</span>
          </div>
          <h1 style={{ fontSize: "2.1rem", fontWeight: 800, marginBottom: "0.75rem" }}>
            7-Day Hassle-Free Return Policy
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Last updated: October 2026 &bull; Shopecomira Customer Care
          </p>
        </div>

        {/* 3 Step Visual */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
          {[
            { step: "1", title: "Notify Us on WhatsApp", desc: "Share your Order ID and photos or a video showing the issue within 7 days." },
            { step: "2", title: "Free Reverse Pickup", desc: "Our courier partner arranges a pickup from your doorstep at zero extra cost." },
            { step: "3", title: "Prompt Replacement / Refund", desc: "Instant replacement dispatch or full refund credited to your account within 48h." },
          ].map((item, i) => (
            <div key={i} style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "1.5rem" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent-indigo)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.9rem", marginBottom: "0.75rem" }}>
                {item.step}
              </div>
              <h4 style={{ fontSize: "0.98rem", fontWeight: 700, marginBottom: "0.35rem" }}>{item.title}</h4>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Content Body */}
        <div style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", padding: "2.5rem", display: "flex", flexDirection: "column", gap: "2rem", lineHeight: 1.7, fontSize: "0.92rem", color: "var(--text-secondary)" }}>
          <div>
            <h3 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              1. Return Window &amp; Eligibility
            </h3>
            <p>
              Shopecomira provides a <strong>7-calendar-day return and replacement window</strong> starting from the timestamp your delivery partner records the package as delivered. An item is eligible for replacement or return under the following circumstances:
            </p>
            <ul style={{ paddingLeft: "1.25rem", marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <li>The item arrived physically damaged or cracked in transit.</li>
              <li>The item is defective, dead-on-arrival, or fails to power on.</li>
              <li>The item received is different from what was ordered (wrong variant, color, or model).</li>
              <li>Missing essential attachments, cables, or accessories.</li>
            </ul>
          </div>

          <div>
            <h3 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              2. Return Process
            </h3>
            <p>
              To initiate a request, simply click on our <a href="https://wa.me/919876543210?text=Hello%20Shopecomira%2C%20I%20would%20like%20to%20request%20a%20return%20for%20my%20order" target="_blank" rel="noopener noreferrer" style={{ color: "#25D366", fontWeight: 600 }}>WhatsApp Support Link</a> or email <strong>support@shopecomira.com</strong>. Include your Order ID and a 10-second video or photo showing the product fault.
            </p>
          </div>

          <div>
            <h3 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              3. Refund Turnaround &amp; Payment Methods
            </h3>
            <p>
              Once the return parcel arrives at our fulfillment hub, it is inspected within 24 hours:
            </p>
            <ul style={{ paddingLeft: "1.25rem", marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <li><strong>Prepaid Orders (Cards/UPI/Net Banking):</strong> Full refund credited directly back to the original source method within 3 to 5 banking days.</li>
              <li><strong>Cash on Delivery (COD) Orders:</strong> Refund credited directly to your bank account or UPI VPA (Google Pay / PhonePe) within 24 to 48 hours of return confirmation.</li>
            </ul>
          </div>

          <div style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.25)", borderRadius: "var(--radius-md)", padding: "1.25rem", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
            <AlertCircle size={20} color="var(--accent-amber)" style={{ flexShrink: 0, marginTop: "0.15rem" }} />
            <div style={{ fontSize: "0.85rem" }}>
              <strong style={{ color: "var(--accent-amber)" }}>Note on Product Condition:</strong> Please retain the original manufacturer box, manuals, and accessories. Items returned damaged due to customer misuse or altered intentionally are ineligible for refund.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
