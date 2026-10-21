import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, ShieldCheck, Zap, RotateCcw, Award, CheckCircle, Home, Users, HeartHandshake } from "lucide-react";

export default function AboutPage() {
  return (
    <div style={{ minHeight: "80vh", background: "var(--bg-main)", paddingBottom: "5rem" }}>
      {/* Breadcrumb */}
      <div style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)", padding: "0.75rem 1.25rem" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <Link to="/" style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Home size={14} /> Home
          </Link>
          <span>/</span>
          <span style={{ color: "var(--text-primary)" }}>About Us</span>
        </div>
      </div>

      <div className="container" style={{ paddingTop: "3rem", maxWidth: 860 }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.35rem 0.85rem", background: "rgba(99, 102, 241, 0.12)", color: "var(--accent-indigo)", borderRadius: "var(--radius-full)", fontSize: "0.8rem", fontWeight: 600, marginBottom: "1rem" }}>
            <Sparkles size={14} />
            <span>Trending Innovations &bull; Verified Quality</span>
          </div>
          <h1 style={{ fontSize: "2.3rem", fontWeight: 800, marginBottom: "1rem", lineHeight: 1.25 }}>
            Empowering Modern Living with Next-Gen Viral Products
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: 1.7, maxWidth: 700, margin: "0 auto" }}>
            Shopecomira is India&apos;s direct-to-consumer destination for high-utility, viral lifestyle gadgets, smart electronics, home care solutions, and wellness accessories.
          </p>
        </div>

        {/* Our Story & Values */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "3.5rem" }} className="product-page-grid">
          <div style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", padding: "2rem" }}>
            <div style={{ width: 44, height: 44, borderRadius: "10px", background: "rgba(99, 102, 241, 0.15)", color: "var(--accent-indigo)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
              <Users size={22} />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem" }}>Our Mission</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>
              We scour global design hubs to identify genuine trendsetters — products that solve real day-to-day hassles and bring joy, convenience, and modern aesthetic value to Indian households.
            </p>
          </div>

          <div style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", padding: "2rem" }}>
            <div style={{ width: 44, height: 44, borderRadius: "10px", background: "rgba(16, 185, 129, 0.15)", color: "var(--accent-emerald)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
              <HeartHandshake size={22} />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem" }}>Transparency First</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>
              No hidden delivery surprises. Every order receives a certified GST tax invoice, upfront pricing, guaranteed 7-day returns, and round-the-clock WhatsApp support for total peace of mind.
            </p>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, textAlign: "center", marginBottom: "1.75rem" }}>
          Why Millions Choose Shopecomira
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem", marginBottom: "3.5rem" }}>
          {[
            {
              icon: <Zap size={22} color="var(--accent-amber)" />,
              title: "24-48h Fast Dispatch",
              desc: "Processed in our automated fulfilment hubs and shipped with leading logistics carriers.",
            },
            {
              icon: <ShieldCheck size={22} color="var(--accent-emerald)" />,
              title: "100% Quality Tested",
              desc: "Every batch is inspected for safety, build quality, and battery/motor integrity before shipping.",
            },
            {
              icon: <RotateCcw size={22} color="var(--accent-indigo)" />,
              title: "7-Day Easy Returns",
              desc: "Hassle-free replacement or refund guarantee if an item arrives damaged or defective.",
            },
            {
              icon: <Award size={22} color="#a855f7" />,
              title: "GST Tax Compliant",
              desc: "Legally registered Indian enterprise providing certified input tax credit (ITC) invoices.",
            },
          ].map((pillar, i) => (
            <div key={i} style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", padding: "1.5rem" }}>
              <div style={{ marginBottom: "0.75rem" }}>{pillar.icon}</div>
              <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.4rem" }}>{pillar.title}</h4>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{pillar.desc}</p>
            </div>
          ))}
        </div>

        {/* Legal & Corporate Info Box */}
        <div style={{ background: "var(--bg-surface-elevated)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-medium)", padding: "2rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", color: "#fff" }}>
            Enterprise Information
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.85rem" }}>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Legal Entity Name:</span>
              <div style={{ fontWeight: 600, color: "#fff", marginTop: "0.15rem" }}>
                Shopecomira Retail Enterprises Pvt Ltd
              </div>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Goods &amp; Services Tax (GSTIN):</span>
              <div style={{ fontWeight: 600, color: "#fff", marginTop: "0.15rem" }}>
                27AABCU9603R1ZM
              </div>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Registered Corporate Office:</span>
              <div style={{ fontWeight: 600, color: "#fff", marginTop: "0.15rem" }}>
                Suite 402, Commerce Hub, Bandra West, Mumbai, Maharashtra 400050
              </div>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Customer Support Helpline:</span>
              <div style={{ fontWeight: 600, color: "#fff", marginTop: "0.15rem" }}>
                +91 98765 43210 &bull; support@shopecomira.com
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
