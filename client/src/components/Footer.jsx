import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, MessageCircle } from "lucide-react";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Col */}
          <div>
            <Link to="/" className="brand-logo" style={{ marginBottom: "0.75rem", textDecoration: "none" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #6366f1 0%, #10b981 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                }}
              >
                <Sparkles size={18} />
              </div>
              <span>Shopecom<span className="brand-highlight">ira</span></span>
            </Link>
            <p style={{ fontSize: "0.85rem", lineHeight: 1.6, marginBottom: "1rem" }}>
              Your destination for India's most innovative trending products. Enjoy transparent pricing, instant prepaid discounts, reliable Cash on Delivery, and hassle-free 7-day returns.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
              <span>GSTIN: 27AABCU9603R1ZM</span>
              <span>&bull;</span>
              <span>Mumbai, India</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-heading">Shop Collections</h4>
            <ul className="footer-links">
              <li>
                <Link to="/?filter=trending">🔥 Trending Innovations</Link>
              </li>
              <li>
                <Link to="/?filter=bestseller">⭐ Best Sellers</Link>
              </li>
              <li>
                <Link to="/?filter=new">✨ New Arrivals</Link>
              </li>
              <li>
                <Link to="/categories">📂 All Categories</Link>
              </li>
              <li>
                <Link to="/offers">🏷️ Deals &amp; Coupons</Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="footer-heading">Help &amp; Policies</h4>
            <ul className="footer-links">
              <li>
                <Link to="/track-order">Track Order Status</Link>
              </li>
              <li>
                <Link to="/shipping-policy">Shipping &amp; Delivery Policy</Link>
              </li>
              <li>
                <Link to="/return-policy">7-Day Return &amp; Refund</Link>
              </li>
              <li>
                <Link to="/faq">Frequently Asked Questions</Link>
              </li>
              <li>
                <Link to="/contact">Contact Support</Link>
              </li>
            </ul>
          </div>

          {/* WhatsApp Support Box */}
          <div>
            <h4 className="footer-heading">Customer Helpline</h4>
            <p style={{ fontSize: "0.82rem", marginBottom: "0.75rem", lineHeight: 1.5 }}>
              Have questions about product availability or order updates? Speak to our customer specialist directly.
            </p>
            <a
              href="https://wa.me/919876543210?text=Hello%20Shopecomira%2C%20I%20need%20help%20with%20an%20order"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp-enquire"
              style={{ marginTop: 0 }}
            >
              <MessageCircle size={18} />
              <span>Chat on WhatsApp</span>
            </a>
            <div style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Mon – Sat: 9:30 AM to 7:00 PM IST
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <div>
            &copy; {new Date().getFullYear()} Shopecomira Retail Enterprises Pvt Ltd.
          </div>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.78rem" }}>
            <Link to="/about" style={{ color: "var(--text-muted)", textDecoration: "none" }}>About Us</Link>
            <span>&bull;</span>
            <Link to="/privacy-policy" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Privacy Policy</Link>
            <span>&bull;</span>
            <Link to="/terms" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Terms of Sale</Link>
            <span>&bull;</span>
            <Link to="/admin/login" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Staff Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
