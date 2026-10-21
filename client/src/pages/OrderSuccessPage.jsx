import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  Download,
  Home,
  MessageCircle,
  FileText,
  ShieldCheck,
  RefreshCw,
  Clock,
} from "lucide-react";
import { api } from "../services/api.js";
import GstInvoiceModal from "../components/GstInvoiceModal.jsx";

const formatPrice = (paise) => `₹${((paise || 0) / 100).toLocaleString("en-IN")}`;

export default function OrderSuccessPage() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewingInvoice, setViewingInvoice] = useState(null);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderNumber) return;
      try {
        setLoading(true);
        const res = await api.lookupOrder(orderNumber);
        setOrder(res?.order || res?.data || res);
      } catch (err) {
        setError(err.message || "Could not retrieve order details.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem", color: "var(--text-muted)" }}>
        <RefreshCw size={36} className="spin" />
        <p>Retrieving order confirmation...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ textAlign: "center", maxWidth: 440, background: "var(--bg-surface)", padding: "2.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
          <h2>Order Not Found</h2>
          <p style={{ color: "var(--text-secondary)", margin: "1rem 0 1.5rem" }}>
            We could not find order &ldquo;{orderNumber}&rdquo;. Please verify your order number or check your tracking details.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <Link to="/track-order" className="btn-secondary">Track Order</Link>
            <Link to="/" className="btn-primary">Return Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "80vh", background: "var(--bg-main)", paddingBottom: "4rem" }}>
      {/* Breadcrumb */}
      <div style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)", padding: "0.75rem 1.25rem" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <Link to="/" style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Home size={14} /> Home
          </Link>
          <span>/</span>
          <span style={{ color: "var(--text-primary)" }}>Order Confirmed</span>
          <span>/</span>
          <span style={{ color: "var(--accent-indigo)" }}>{order.orderNumber}</span>
        </div>
      </div>

      <div className="container" style={{ paddingTop: "2.5rem", maxWidth: 780 }}>
        {/* Success Banner */}
        <div style={{ textAlign: "center", background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(99, 102, 241, 0.1))", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "var(--radius-lg)", padding: "2.5rem 1.5rem", marginBottom: "2rem" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--accent-emerald)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem", color: "#fff" }}>
            <CheckCircle2 size={36} />
          </div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.5rem", color: "#fff" }}>
            Thank You! Your Order is Confirmed
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Order ID: <strong style={{ color: "var(--accent-indigo)" }}>{order.orderNumber}</strong>
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", marginTop: "1rem", padding: "0.35rem 0.85rem", background: "rgba(16, 185, 129, 0.2)", color: "var(--accent-emerald)", borderRadius: "var(--radius-full)", fontSize: "0.8rem", fontWeight: 600 }}>
            <Clock size={14} />
            <span>Estimated Dispatch within 24-48 Hours</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginBottom: "2.5rem", flexWrap: "wrap" }}>
          <Link to={`/track-order/${order.orderNumber}`} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Truck size={16} />
            <span>Track Order Status</span>
          </Link>
          <button
            onClick={() => setViewingInvoice(order)}
            className="btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            <FileText size={16} />
            <span>View GST Invoice</span>
          </button>
          <a
            href={`https://wa.me/919876543210?text=Hi%20Shopecomira%2C%20I%20have%20an%20inquiry%20regarding%20my%20Order%20${order.orderNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#25D366" }}
          >
            <MessageCircle size={16} />
            <span>WhatsApp Support</span>
          </a>
        </div>

        {/* Order Details Card */}
        <div style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", padding: "1.75rem", marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.25rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.75rem" }}>
            Order Summary
          </h3>

          {/* Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
            {order.items?.map((item, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "8px", background: "var(--bg-surface-elevated)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Package size={20} color="var(--text-muted)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{item.productName}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Qty: {item.quantity} &bull; {item.variantSku}
                    </div>
                  </div>
                </div>
                <div style={{ fontWeight: 700 }}>
                  {formatPrice((item.sellingPricePaise || 0) * (item.quantity || 1))}
                </div>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
              <span>Subtotal</span>
              <span>{formatPrice(order.pricing?.subtotalPaise)}</span>
            </div>
            {order.pricing?.discountPaise > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--accent-emerald)" }}>
                <span>Discounts Applied</span>
                <span>-{formatPrice(order.pricing.discountPaise)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
              <span>Delivery Fee</span>
              <span>{order.pricing?.shippingFeePaise === 0 ? "FREE" : formatPrice(order.pricing?.shippingFeePaise)}</span>
            </div>
            {order.pricing?.codFeePaise > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                <span>COD Handling</span>
                <span>{formatPrice(order.pricing.codFeePaise)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "1.1rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "0.75rem", marginTop: "0.5rem" }}>
              <span>Total Paid / Payable</span>
              <span style={{ color: "var(--accent-emerald)" }}>{formatPrice(order.pricing?.totalPaise)}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Meta */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "3rem" }}>
          <div style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", padding: "1.25rem" }}>
            <h4 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.5rem", color: "var(--text-muted)" }}>Shipping Address</h4>
            <div style={{ fontWeight: 600 }}>{order.customer?.fullName}</div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
              {order.shippingAddress?.addressLine1}<br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
              Phone: +91 {order.customer?.phone}
            </div>
          </div>

          <div style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", padding: "1.25rem" }}>
            <h4 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.5rem", color: "var(--text-muted)" }}>Payment Method & Status</h4>
            <div style={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.95rem" }}>
              {order.paymentMethod === "prepaid" ? "Online Payment (Razorpay)" : "Cash on Delivery (COD)"}
            </div>

            <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              {order.paymentDetails?.status === "paid" ? (
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "var(--radius-full)",
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "var(--accent-emerald)",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                }}>
                  <CheckCircle2 size={13} />
                  PAID VIA RAZORPAY
                </span>
              ) : order.paymentDetails?.status === "failed" ? (
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "var(--radius-full)",
                  background: "rgba(244, 63, 94, 0.15)",
                  color: "var(--accent-rose)",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                }}>
                  <AlertCircle size={13} />
                  PAYMENT FAILED
                </span>
              ) : (
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "var(--radius-full)",
                  background: "rgba(245, 158, 11, 0.15)",
                  color: "var(--accent-amber)",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                }}>
                  <Clock size={13} />
                  {order.paymentMethod === "cod" ? "PAYABLE ON DELIVERY" : "PAYMENT PENDING"}
                </span>
              )}
            </div>

            {order.paymentDetails?.razorpayPaymentId && (
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.4rem" }}>
                Transaction Ref: <strong style={{ color: "var(--text-primary)", fontFamily: "monospace" }}>{order.paymentDetails.razorpayPaymentId}</strong>
              </div>
            )}

            {order.paymentDetails?.failureReason && (
              <div style={{ fontSize: "0.75rem", color: "var(--accent-rose)", marginTop: "0.3rem" }}>
                Reason: {order.paymentDetails.failureReason}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.6rem" }}>
              <ShieldCheck size={14} color="var(--accent-emerald)" />
              <span>Tax Invoice Generated & Recorded</span>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: "center" }}>
          <Link to="/" className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <ArrowRight size={16} />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>

      {viewingInvoice && (
        <GstInvoiceModal
          invoiceData={viewingInvoice}
          onClose={() => setViewingInvoice(null)}
        />
      )}
    </div>
  );
}
