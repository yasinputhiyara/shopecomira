import React, { useState } from "react";
import {
  X,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  FileText,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { api } from "../services/api.js";

export default function OrderLookupModal({
  isOpen,
  onClose,
  onViewInvoice,
}) {
  if (!isOpen) return null;

  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      setError("Please enter your Order Number (e.g. ORD-20261016-1234)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await api.lookupOrder(orderNumber.trim(), phone.trim());
      setOrder(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message || "Order not found. Please verify the order number.");
      setOrder(null);
    }
  };

  const steps = [
    { key: "confirmed", label: "Order Confirmed" },
    { key: "processing", label: "Processing & Packed" },
    { key: "shipped", label: "Shipped / Dispatched" },
    { key: "out_for_delivery", label: "Out for Delivery" },
    { key: "delivered", label: "Delivered" },
  ];

  const getStepStatus = (stepKey) => {
    const statusOrder = ["pending_payment", "confirmed", "processing", "shipped", "out_for_delivery", "delivered"];
    const currentIdx = statusOrder.indexOf(order?.orderStatus || "");
    const stepIdx = statusOrder.indexOf(stepKey);

    if (currentIdx >= stepIdx) return "completed";
    return "pending";
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 640, padding: "2rem" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Close track order">
          <X size={18} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
          <Truck size={22} color="var(--accent-indigo)" />
          <h3 style={{ fontSize: "1.3rem" }}>Track Your Order</h3>
        </div>

        {/* Lookup Search Form */}
        <form onSubmit={handleLookup} style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr auto", gap: "0.75rem" }}>
            <input
              type="text"
              required
              placeholder="Order ID (e.g. ORD-20261016-1234)"
              className="form-control"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
            />
            <input
              type="tel"
              placeholder="Phone (Optional)"
              maxLength={10}
              className="form-control"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: "0.6rem 1.25rem" }}
              disabled={loading}
            >
              {loading ? "Searching..." : <Search size={18} />}
            </button>
          </div>
        </form>

        {error && (
          <div
            style={{
              background: "var(--accent-rose-bg)",
              border: "1px solid rgba(244, 63, 94, 0.3)",
              color: "var(--accent-rose)",
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.85rem",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Order Result View */}
        {order && (
          <div style={{ background: "var(--bg-main)", borderRadius: "var(--radius-md)", padding: "1.25rem", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.75rem" }}>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Order Reference</div>
                <strong style={{ fontSize: "1.1rem", color: "#fff" }}>{order.orderNumber}</strong>
                <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                  Placed on: {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "0.3rem 0.75rem",
                    borderRadius: "var(--radius-full)",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    background: order.orderStatus === "delivered" ? "var(--accent-emerald-bg)" : "rgba(99, 102, 241, 0.15)",
                    color: order.orderStatus === "delivered" ? "var(--accent-emerald)" : "var(--accent-indigo)",
                    border: "1px solid currentColor",
                  }}
                >
                  {order.orderStatus?.replace("_", " ")}
                </span>
                <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#fff", marginTop: "0.4rem" }}>
                  ₹{((order.pricing?.totalPaise || 0) / 100).toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            {/* Tracking Details if available */}
            {order.tracking && order.tracking.trackingNumber && (
              <div
                style={{
                  background: "var(--bg-surface-elevated)",
                  borderRadius: "var(--radius-sm)",
                  padding: "0.75rem 1rem",
                  marginBottom: "1rem",
                  fontSize: "0.82rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ color: "var(--text-muted)" }}>Courier Partner</div>
                  <strong style={{ color: "#fff" }}>{order.tracking.courierName || "Express Courier"}</strong>
                  <div style={{ color: "var(--text-secondary)" }}>AWB: {order.tracking.trackingNumber}</div>
                </div>
                {order.tracking.trackingUrl && (
                  <a
                    href={order.tracking.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{ fontSize: "0.78rem", padding: "0.4rem 0.8rem", display: "flex", alignItems: "center", gap: "0.3rem" }}
                  >
                    <span>Track on Courier Site</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            )}

            {/* Status Timeline */}
            <div style={{ margin: "1.25rem 0" }}>
              <h4 style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "0.75rem", textTransform: "uppercase" }}>
                Delivery Progress
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {steps.map((st, i) => {
                  const isDone = getStepStatus(st.key) === "completed";
                  return (
                    <div key={st.key} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          background: isDone ? "var(--accent-emerald)" : "var(--bg-surface-elevated)",
                          color: isDone ? "#fff" : "var(--text-muted)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {isDone ? "✓" : i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.85rem", fontWeight: isDone ? 600 : 400, color: isDone ? "#fff" : "var(--text-muted)" }}>
                          {st.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Items summary */}
            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "0.75rem", marginTop: "1rem" }}>
              <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                <strong>Delivery Address:</strong> {order.shippingAddress?.fullName}, {order.shippingAddress?.street}, {order.shippingAddress?.city} - {order.shippingAddress?.pincode}
              </div>

              <button
                className="btn-secondary"
                onClick={() => onViewInvoice(order)}
                style={{ width: "100%", marginTop: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
              >
                <FileText size={16} />
                <span>Download Official GST Tax Invoice</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
