import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Lock, Eye, Home } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div style={{ minHeight: "80vh", background: "var(--bg-main)", paddingBottom: "5rem" }}>
      {/* Breadcrumb */}
      <div style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)", padding: "0.75rem 1.25rem" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <Link to="/" style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Home size={14} /> Home
          </Link>
          <span>/</span>
          <span style={{ color: "var(--text-primary)" }}>Privacy &amp; Data Protection Policy</span>
        </div>
      </div>

      <div className="container" style={{ paddingTop: "3rem", maxWidth: 800 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.35rem 0.85rem", background: "rgba(16, 185, 129, 0.12)", color: "var(--accent-emerald)", borderRadius: "var(--radius-full)", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.85rem" }}>
            <Lock size={14} />
            <span>256-Bit SSL Encrypted</span>
          </div>
          <h1 style={{ fontSize: "2.1rem", fontWeight: 800, marginBottom: "0.75rem" }}>
            Privacy Policy
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Effective: October 2026 &bull; Shopecomira Retail Enterprises Pvt Ltd
          </p>
        </div>

        {/* Content Body */}
        <div style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", padding: "2.5rem", display: "flex", flexDirection: "column", gap: "2rem", lineHeight: 1.7, fontSize: "0.92rem", color: "var(--text-secondary)" }}>
          <div>
            <h3 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              1. Information We Collect
            </h3>
            <p>
              When you browse or complete an order on Shopecomira, we collect the necessary customer details required to fulfill delivery and generate your legal GST tax invoice:
            </p>
            <ul style={{ paddingLeft: "1.25rem", marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <li><strong>Contact &amp; Identity:</strong> Name, phone number, and email address.</li>
              <li><strong>Delivery Information:</strong> Street address, city, state, and postal pincode.</li>
              <li><strong>Payment Metadata:</strong> Transaction reference IDs and payment verification signatures via Razorpay. We never see or store full credit card numbers or banking passwords.</li>
            </ul>
          </div>

          <div>
            <h3 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              2. How We Use Your Information
            </h3>
            <ul style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <li>To dispatch and deliver your ordered items via contracted courier logistics partners.</li>
              <li>To send automated order updates, AWB tracking numbers, and delivery notifications via WhatsApp/SMS.</li>
              <li>To generate statutory tax invoices complying with Indian GST laws.</li>
              <li>To handle return pickups, replacements, and customer support conversations.</li>
            </ul>
          </div>

          <div>
            <h3 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              3. Payment Security &amp; Encryption
            </h3>
            <p>
              Online transactions are processed securely through <strong>Razorpay Software Pvt Ltd</strong>, which is certified PCI-DSS Level 1 compliant (the highest industry standard for financial transactions). All session communication uses 256-bit TLS/SSL encryption.
            </p>
          </div>

          <div>
            <h3 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              4. Zero Data Selling Commitment
            </h3>
            <p>
              We adhere strictly to customer privacy. We do not sell, rent, or trade your personal information, phone number, or email address with third-party advertisers or telemarketers.
            </p>
          </div>

          <div>
            <h3 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              5. Grievance Officer &amp; Contact
            </h3>
            <p>
              For questions or data deletion requests, contact our designated Grievance Officer at <strong>privacy@shopecomira.com</strong> or write to: Shopecomira Retail Enterprises Pvt Ltd, Suite 402, Commerce Hub, Bandra West, Mumbai 400050.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
