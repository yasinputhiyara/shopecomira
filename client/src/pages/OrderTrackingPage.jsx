import React, { useState } from "react";
import { useNavigate, useOutletContext, Link } from "react-router-dom";
import { Search, Truck, Package, Home, FileText, CheckCircle, Clock, AlertCircle, RefreshCw } from "lucide-react";
import GstInvoiceModal from "../components/GstInvoiceModal.jsx";
import { api } from "../services/api.js";

const STATUS_CONFIG = {
  pending: { label: "Order Placed", color: "#f59e0b", icon: Clock },
  confirmed: { label: "Confirmed", color: "#6366f1", icon: CheckCircle },
  processing: { label: "Processing", color: "#8b5cf6", icon: RefreshCw },
  shipped: { label: "Shipped", color: "#0ea5e9", icon: Truck },
  delivered: { label: "Delivered", color: "#10b981", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "#ef4444", icon: AlertCircle },
  refunded: { label: "Refunded", color: "#6b7280", icon: RefreshCw },
};

const STATUS_STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default function OrderTrackingPage() {
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      setError("Please enter your order number.");
      return;
    }
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await api.lookupOrder(orderNumber.trim(), phone.trim());
      setOrder(res.data || res);
    } catch (err) {
      setError(err.message || "Order not found. Please check the order number and try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (paise) => `₹${((paise || 0) / 100).toLocaleString("en-IN")}`;
  const formatDate = (dt) => new Date(dt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const getStepIndex = (status) => STATUS_STEPS.indexOf(status);
  const currentStepIdx = order ? getStepIndex(order.orderStatus) : -1;

  return (
    <>
      {/* Breadcrumb */}
      <div style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)", padding: "0.75rem 1.25rem" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <Link to="/" style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Home size={14} /> Home
          </Link>
          <span>/</span>
          <span style={{ color: "var(--text-primary)" }}>Track Order</span>
        </div>
      </div>

      <main className="container" style={{ padding: "2.5rem 1.25rem 4rem", maxWidth: 700 }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #10b981)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem",
          }}>
            <Truck size={32} style={{ color: "#fff" }} />
          </div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>Track Your Order</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Enter your order number to get real-time tracking updates
          </p>
        </div>

        {/* Search Form */}
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "1.75rem", marginBottom: "2rem" }}>
          <form onSubmit={handleSearch}>
            <div className="form-group">
              <label className="form-label">Order Number <span style={{ color: "var(--accent-rose)" }}>*</span></label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. ORD-1234567890"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                autoFocus
              />
            </div>
            <div className="form-group" style={{ marginBottom: "1.25rem" }}>
              <label className="form-label">Phone Number (optional)</label>
              <input
                type="tel"
                className="form-control"
                placeholder="10-digit mobile number"
                value={phone}
                maxLength={10}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              />
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
                Adding your phone helps verify the order securely
              </p>
            </div>
            {error && (
              <div style={{ padding: "0.75rem 1rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", color: "var(--accent-rose)", borderRadius: "var(--radius-sm)", fontSize: "0.82rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%", height: 46, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
              disabled={loading}
            >
              {loading ? <RefreshCw size={18} className="spin" /> : <Search size={18} />}
              {loading ? "Searching..." : "Track My Order"}
            </button>
          </form>
        </div>

        {/* Order Result */}
        {order && (
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
            {/* Order Header */}
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
              <div>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Order Number</p>
                <p style={{ fontSize: "1rem", fontWeight: 700, fontFamily: "monospace" }}>{order.orderNumber}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Placed On</p>
                <p style={{ fontSize: "0.85rem", fontWeight: 500 }}>{formatDate(order.createdAt)}</p>
              </div>
              <div>
                {(() => {
                  const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.pending;
                  const Icon = cfg.icon;
                  return (
                    <div style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      padding: "0.4rem 0.9rem",
                      borderRadius: "var(--radius-full)",
                      background: `${cfg.color}15`,
                      color: cfg.color,
                      fontSize: "0.82rem",
                      fontWeight: 700,
                    }}>
                      <Icon size={15} />
                      {cfg.label}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Progress Tracker */}
            {order.orderStatus !== "cancelled" && order.orderStatus !== "refunded" && (
              <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-subtle)" }}>
                <div style={{ position: "relative" }}>
                  {/* Progress line */}
                  <div style={{ position: "absolute", top: 14, left: "10%", right: "10%", height: 3, background: "var(--border-subtle)", borderRadius: 4 }} />
                  <div style={{
                    position: "absolute",
                    top: 14,
                    left: "10%",
                    height: 3,
                    background: "linear-gradient(90deg, #6366f1, #10b981)",
                    borderRadius: 4,
                    width: `${Math.min(100, currentStepIdx >= 0 ? (currentStepIdx / (STATUS_STEPS.length - 1)) * 80 : 0)}%`,
                    transition: "width 0.5s ease",
                  }} />

                  {/* Steps */}
                  <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
                    {STATUS_STEPS.map((step, idx) => {
                      const cfg = STATUS_CONFIG[step];
                      const Icon = cfg.icon;
                      const done = currentStepIdx >= idx;
                      const current = currentStepIdx === idx;
                      return (
                        <div key={step} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
                          <div style={{
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            background: done ? "linear-gradient(135deg, #6366f1, #10b981)" : "var(--bg-surface)",
                            border: `2px solid ${done ? "transparent" : "var(--border-medium)"}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: done ? "#fff" : "var(--text-muted)",
                            boxShadow: current ? "0 0 0 4px rgba(99,102,241,0.2)" : "none",
                            transition: "all 0.3s ease",
                          }}>
                            <Icon size={14} />
                          </div>
                          <span style={{ fontSize: "0.7rem", color: done ? "var(--text-primary)" : "var(--text-muted)", fontWeight: done ? 600 : 400, textAlign: "center", maxWidth: 60 }}>
                            {cfg.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Tracking Info */}
            {order.tracking?.trackingNumber && (
              <div style={{ padding: "1rem 1.5rem", background: "rgba(99,102,241,0.05)", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Truck size={20} style={{ color: "var(--accent-indigo)", flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.15rem" }}>
                    {order.tracking.courierName} · {order.tracking.trackingNumber}
                  </p>
                  {order.tracking.trackingUrl && (
                    <a
                      href={order.tracking.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "0.78rem", color: "var(--accent-indigo)" }}
                    >
                      Track on courier website →
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Order Items */}
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-subtle)" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "1rem" }}>Order Items</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {order.items?.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.productName} style={{ width: 50, height: 50, borderRadius: "var(--radius-sm)", objectFit: "cover", flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 50, height: 50, borderRadius: "var(--radius-sm)", background: "var(--bg-main)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Package size={20} style={{ opacity: 0.3 }} />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: "0.88rem" }}>{item.productName}</p>
                      {item.options?.length > 0 && (
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{item.options.map((o) => `${o.name}: ${o.value}`).join(" • ")}</p>
                      )}
                      <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Qty: {item.quantity}</p>
                    </div>
                    <p style={{ fontWeight: 700, fontSize: "0.88rem" }}>
                      {formatPrice(item.sellingPricePaise * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Details */}
            <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border-subtle)", background: "rgba(255,255,255,0.01)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <h3 style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.25rem" }}>Payment Details</h3>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                    Mode: <strong style={{ textTransform: "uppercase", color: "#fff" }}>{order.paymentMethod === "prepaid" ? "Online (Razorpay)" : "Cash on Delivery"}</strong>
                  </div>
                </div>
                <div>
                  {order.paymentDetails?.status === "paid" || order.paymentStatus === "paid" ? (
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      padding: "0.25rem 0.65rem",
                      borderRadius: "var(--radius-full)",
                      background: "rgba(16, 185, 129, 0.15)",
                      color: "var(--accent-emerald)",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                    }}>
                      ✓ PAID
                    </span>
                  ) : order.paymentDetails?.status === "failed" || order.paymentStatus === "failed" ? (
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      padding: "0.25rem 0.65rem",
                      borderRadius: "var(--radius-full)",
                      background: "rgba(244, 63, 94, 0.15)",
                      color: "var(--accent-rose)",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                    }}>
                      ✕ FAILED
                    </span>
                  ) : (
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      padding: "0.25rem 0.65rem",
                      borderRadius: "var(--radius-full)",
                      background: "rgba(245, 158, 11, 0.15)",
                      color: "var(--accent-amber)",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                    }}>
                      ⏳ PENDING
                    </span>
                  )}
                </div>
              </div>

              {order.paymentDetails?.razorpayPaymentId && (
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
                  Razorpay Payment ID: <span style={{ fontFamily: "monospace", color: "var(--text-primary)" }}>{order.paymentDetails.razorpayPaymentId}</span>
                </div>
              )}
              {order.paymentDetails?.failureReason && (
                <div style={{ fontSize: "0.75rem", color: "var(--accent-rose)", marginTop: "0.25rem" }}>
                  Reason: {order.paymentDetails.failureReason}
                </div>
              )}
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border-subtle)" }}>
                <h3 style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.4rem" }}>Delivery Address</h3>
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {order.shippingAddress.name || order.customerName} · {order.shippingAddress.phone}<br />
                  {order.shippingAddress.street}{order.shippingAddress.landmark ? `, ${order.shippingAddress.landmark}` : ""}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}
                </p>
              </div>
            )}

            {/* Order Total & Invoice */}
            <div style={{ padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Order Total</p>
                <p style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--accent-emerald)" }}>
                  {formatPrice(order.totalAmountPaise)}
                </p>
              </div>
              <button
                onClick={() => setViewingInvoice(order)}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", background: "var(--bg-surface)", border: "1px solid var(--border-medium)", borderRadius: "var(--radius-md)", fontSize: "0.82rem", cursor: "pointer", color: "var(--text-secondary)" }}
              >
                <FileText size={16} />
                View Invoice
              </button>
            </div>
          </div>
        )}
      </main>

      {viewingInvoice && (
        <GstInvoiceModal
          invoiceData={viewingInvoice}
          onClose={() => setViewingInvoice(null)}
        />
      )}
    </>
  );
}
