import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Mail, Phone, MapPin, Clock, Send, CheckCircle2, Home } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", orderNumber: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ minHeight: "80vh", background: "var(--bg-main)", paddingBottom: "5rem" }}>
      {/* Breadcrumb */}
      <div style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)", padding: "0.75rem 1.25rem" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <Link to="/" style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Home size={14} /> Home
          </Link>
          <span>/</span>
          <span style={{ color: "var(--text-primary)" }}>Contact Support</span>
        </div>
      </div>

      <div className="container" style={{ paddingTop: "3rem", maxWidth: 960 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: "0.75rem" }}>
            We&apos;re Here to Help You
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: 600, margin: "0 auto" }}>
            Have a question about tracking your order, return requests, or product availability? Reach out through our dedicated channels.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "2.5rem", alignItems: "start" }} className="product-page-grid">
          {/* Left Column: Direct Helplines */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* WhatsApp Box */}
            <div style={{ background: "linear-gradient(135deg, rgba(37, 211, 102, 0.15), rgba(16, 185, 129, 0.08))", border: "1px solid rgba(37, 211, 102, 0.3)", borderRadius: "var(--radius-lg)", padding: "1.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <div style={{ width: 44, height: 44, borderRadius: "12px", background: "#25D366", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#fff" }}>WhatsApp Specialist</h3>
                  <span style={{ fontSize: "0.75rem", color: "#25D366", fontWeight: 600 }}>Fastest Response (&lt;10 mins)</span>
                </div>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "1.25rem" }}>
                Connect directly with our customer support team for instant order status, shipment updates, or cancellation inquiries.
              </p>
              <a
                href="https://wa.me/919876543210?text=Hello%20Shopecomira%2C%20I%20have%20an%20inquiry%20regarding%20my%20order"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp-enquire"
                style={{ width: "100%", justifyContent: "center", marginTop: 0 }}
              >
                <MessageCircle size={18} />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            {/* Email & Phone Contact Cards */}
            <div style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <Mail size={20} color="var(--accent-indigo)" style={{ marginTop: "0.2rem" }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>Email Assistance</div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.15rem" }}>
                    support@shopecomira.com
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                    Replies within 1 business day
                  </div>
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <Phone size={20} color="var(--accent-emerald)" style={{ marginTop: "0.2rem" }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>Phone Support</div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.15rem" }}>
                    +91 98765 43210
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                    Toll-free across India
                  </div>
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <Clock size={20} color="var(--accent-amber)" style={{ marginTop: "0.2rem" }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>Operating Hours</div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.15rem" }}>
                    Monday – Saturday: 9:30 AM to 7:00 PM IST
                  </div>
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <MapPin size={20} color="var(--accent-rose)" style={{ marginTop: "0.2rem" }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>Corporate Office</div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.15rem" }}>
                    Suite 402, Commerce Hub, Bandra West, Mumbai, Maharashtra 400050
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Message Form */}
          <div style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", padding: "2rem" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              Send an Online Message
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
              Fill in your inquiry details below and our customer relationship desk will contact you.
            </p>

            {submitted ? (
              <div style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
                <CheckCircle2 size={54} color="var(--accent-emerald)" style={{ margin: "0 auto 1rem" }} />
                <h4 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Message Received!</h4>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                  Thank you for contacting Shopecomira. Our support executive will get back to you within 24 hours.
                </p>
                <button onClick={() => setSubmitted(false)} className="btn-secondary">
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    className="form-control"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="you@email.com"
                      className="form-control"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile"
                      className="form-control"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Order Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. SHO-782910"
                    className="form-control"
                    value={form.orderNumber}
                    onChange={(e) => setForm({ ...form, orderNumber: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">How can we help? *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your question, request, or feedback..."
                    className="form-control"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ height: 48, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  <Send size={18} />
                  <span>Send Customer Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
