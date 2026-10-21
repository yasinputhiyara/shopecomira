import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HelpCircle, ChevronDown, Home, MessageCircle, ArrowRight } from "lucide-react";

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      category: "Orders & Tracking",
      q: "How do I track my order once placed?",
      a: "As soon as your order is dispatched, you will receive an AWB tracking number via WhatsApp and SMS. You can also visit our Track Order page (/track-order) and enter your Order ID (e.g. SHO-1001) along with your mobile number to view live courier status.",
    },
    {
      category: "Orders & Tracking",
      q: "How long does dispatch and delivery take?",
      a: "Orders placed before 2:00 PM are dispatched on the same business day. Standard delivery takes 2 to 4 business days for metro cities (Delhi, Mumbai, Bengaluru, Hyderabad, Chennai) and 3 to 6 business days for the rest of India.",
    },
    {
      category: "Payment & Discounts",
      q: "How does the 5% Prepaid Instant Discount work?",
      a: "When you select Online Payment (via Razorpay) during checkout, an extra 5% discount is automatically deducted from your order total. This applies to UPI (Google Pay, PhonePe, Paytm), credit/debit cards, Net Banking, and digital wallets. It stacks with any coupon codes you enter!",
    },
    {
      category: "Payment & Discounts",
      q: "Is Cash on Delivery (COD) available?",
      a: "Yes! Cash on Delivery is available across 98% of Indian pin codes. A small convenience handling fee of ₹50 is applied to cover courier cash-handling expenses. You can inspect the outer packaging and pay the delivery executive when the parcel arrives.",
    },
    {
      category: "Shipping & Delivery",
      q: "What is the Free Shipping threshold?",
      a: "All orders with a basket value of ₹999 or more qualify for FREE doorstep delivery across India. For orders below ₹999, a nominal flat shipping fee of ₹70 is applied.",
    },
    {
      category: "Returns & Refunds",
      q: "What is your 7-Day Return Policy?",
      a: "We offer a 7-day hassle-free replacement or return window starting from the day your package is marked as Delivered. If an item arrives damaged, defective, or not as described, simply connect with our WhatsApp support or email support@shopecomira.com with photos of the product and we will arrange a return pickup.",
    },
    {
      category: "Returns & Refunds",
      q: "How are refunds processed for COD orders?",
      a: "For COD orders, refunds are transferred directly to your bank account via UPI or IMPS within 24 to 48 hours after our warehouse receives and inspects the returned package. For prepaid orders, the refund is credited back to the original payment source.",
    },
    {
      category: "GST & Tax Invoicing",
      q: "Will I get a GST Tax Invoice with my purchase?",
      a: "Yes, every customer receives a full GST-compliant tax invoice showing the HSN code, CGST/SGST breakdown, and seller GSTIN. You can view and download your invoice anytime from the Track Order page or your order confirmation screen.",
    },
  ];

  return (
    <div style={{ minHeight: "80vh", background: "var(--bg-main)", paddingBottom: "5rem" }}>
      {/* Breadcrumb */}
      <div style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)", padding: "0.75rem 1.25rem" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <Link to="/" style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Home size={14} /> Home
          </Link>
          <span>/</span>
          <span style={{ color: "var(--text-primary)" }}>Frequently Asked Questions</span>
        </div>
      </div>

      <div className="container" style={{ paddingTop: "3rem", maxWidth: 760 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.35rem 0.85rem", background: "rgba(99, 102, 241, 0.12)", color: "var(--accent-indigo)", borderRadius: "var(--radius-full)", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.85rem" }}>
            <HelpCircle size={14} />
            <span>Customer Knowledge Base</span>
          </div>
          <h1 style={{ fontSize: "2.1rem", fontWeight: 800, marginBottom: "0.75rem" }}>
            Frequently Asked Questions
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Everything you need to know about purchasing, shipping, returns, and payment options.
          </p>
        </div>

        {/* Accordion */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginBottom: "3.5rem" }}>
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                style={{
                  background: "var(--bg-surface)",
                  borderRadius: "var(--radius-md)",
                  border: `1px solid ${isOpen ? "var(--accent-indigo)" : "var(--border-subtle)"}`,
                  overflow: "hidden",
                  transition: "all 0.2s ease",
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : i)}
                  style={{
                    width: "100%",
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    textAlign: "left",
                    background: isOpen ? "var(--bg-surface-elevated)" : "transparent",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent-indigo)", fontWeight: 700, display: "block", marginBottom: "0.25rem" }}>
                      {faq.category}
                    </span>
                    <span style={{ fontSize: "1rem", fontWeight: 600 }}>{faq.q}</span>
                  </div>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.25s ease",
                      flexShrink: 0,
                      color: isOpen ? "var(--accent-indigo)" : "var(--text-muted)",
                    }}
                  />
                </button>

                {isOpen && (
                  <div style={{ padding: "0 1.5rem 1.25rem", color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* WhatsApp Help CTA */}
        <div style={{ textAlign: "center", background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", padding: "2.5rem 1.5rem" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Still Have Questions?</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            Our customer support specialists are available on WhatsApp to assist you immediately.
          </p>
          <a
            href="https://wa.me/919876543210?text=Hello%20Shopecomira%2C%20I%20have%20a%20question%20not%20covered%20in%20the%20FAQ"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp-enquire"
            style={{ display: "inline-flex", marginTop: 0 }}
          >
            <MessageCircle size={18} />
            <span>Ask on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
