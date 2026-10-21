import React from "react";
import { Link } from "react-router-dom";
import { FileText, Shield, Scale, Home } from "lucide-react";

export default function TermsPage() {
  return (
    <div style={{ minHeight: "80vh", background: "var(--bg-main)", paddingBottom: "5rem" }}>
      {/* Breadcrumb */}
      <div style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)", padding: "0.75rem 1.25rem" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <Link to="/" style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Home size={14} /> Home
          </Link>
          <span>/</span>
          <span style={{ color: "var(--text-primary)" }}>Terms &amp; Conditions of Sale</span>
        </div>
      </div>

      <div className="container" style={{ paddingTop: "3rem", maxWidth: 800 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.35rem 0.85rem", background: "rgba(99, 102, 241, 0.12)", color: "var(--accent-indigo)", borderRadius: "var(--radius-full)", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.85rem" }}>
            <Scale size={14} />
            <span>Commercial Terms of Service</span>
          </div>
          <h1 style={{ fontSize: "2.1rem", fontWeight: 800, marginBottom: "0.75rem" }}>
            Terms &amp; Conditions
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Shopecomira Retail Enterprises Pvt Ltd &bull; Corporate Identification
          </p>
        </div>

        {/* Content Body */}
        <div style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", padding: "2.5rem", display: "flex", flexDirection: "column", gap: "2rem", lineHeight: 1.7, fontSize: "0.92rem", color: "var(--text-secondary)" }}>
          <div>
            <h3 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              1. Commercial Relationship
            </h3>
            <p>
              By accessing, browsing, or completing an order on Shopecomira (the &ldquo;Platform&rdquo;), you agree to be bound by these Terms &amp; Conditions. The platform is owned and operated by <strong>Shopecomira Retail Enterprises Pvt Ltd</strong>, a registered company under the Companies Act, 2013, with GSTIN: <strong>27AABCU9603R1ZM</strong>.
            </p>
          </div>

          <div>
            <h3 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              2. Pricing, Currencies &amp; GST Invoicing
            </h3>
            <p>
              All prices displayed on the store are stated in Indian National Rupees (INR) and are inclusive of Goods &amp; Services Tax (GST) at statutory rates (typically 18% for electronics and lifestyle gadgets). A tax invoice displaying the HSN code and CGST/SGST amounts is issued with every successful purchase.
            </p>
          </div>

          <div>
            <h3 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              3. Order Acceptance &amp; Cancellation
            </h3>
            <p>
              Shopecomira reserves the right to accept or cancel orders in cases of stock exhaustion, pricing discrepancies, or unserviceable pin codes. Customers may cancel an order free of penalty anytime prior to courier dispatch by contacting WhatsApp support or emailing <strong>support@shopecomira.com</strong>.
            </p>
          </div>

          <div>
            <h3 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              4. Payment &amp; COD Terms
            </h3>
            <p>
              Online orders are processed via Razorpay. For Cash on Delivery (COD) orders, customers agree to pay the delivery executive in full prior to opening the manufacturer sealed package. Frequent unwarranted COD rejections may result in restriction of COD payment eligibility on future sessions.
            </p>
          </div>

          <div>
            <h3 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              5. Governing Law &amp; Jurisdiction
            </h3>
            <p>
              These terms are governed by the laws of India. Any disputes arising out of or in connection with transactions on this platform shall be subject to the exclusive jurisdiction of the competent courts in <strong>Mumbai, Maharashtra</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
