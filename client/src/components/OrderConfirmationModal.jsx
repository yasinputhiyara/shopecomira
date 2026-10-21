import React from "react";
import {
  CheckCircle2,
  X,
  FileText,
  MessageCircle,
  Truck,
  ArrowRight,
  Package,
} from "lucide-react";

export default function OrderConfirmationModal({
  order,
  onClose,
  onViewInvoice,
  onTrackOrder,
}) {
  if (!order) return null;

  const totalRs = (order.pricing?.totalPaise || 0) / 100;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 600, textAlign: "center", padding: "2.5rem 2rem" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Close confirmation">
          <X size={18} />
        </button>

        {/* Success Icon */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(16, 185, 129, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--accent-emerald)",
            margin: "0 auto 1.25rem",
          }}
        >
          <CheckCircle2 size={44} />
        </div>

        <h2 style={{ fontSize: "1.7rem", marginBottom: "0.5rem" }}>
          Order Confirmed!
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
          Thank you for shopping with Shopecomira. We are preparing your order for dispatch.
        </p>

        {/* Order Details Card */}
        <div
          style={{
            background: "var(--bg-main)",
            border: "1px solid var(--border-medium)",
            borderRadius: "var(--radius-md)",
            padding: "1.25rem",
            textAlign: "left",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.6rem" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Order Reference</div>
              <strong style={{ fontSize: "1rem", color: "var(--accent-indigo)" }}>
                {order.orderNumber}
              </strong>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Paid / Due</div>
              <strong style={{ fontSize: "1rem", color: "#fff" }}>
                ₹{totalRs.toLocaleString("en-IN")}
              </strong>
            </div>
          </div>

          <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
            <strong>Payment Mode:</strong> {order.paymentMethod === "prepaid" ? "Online Prepaid (Verified)" : "Cash on Delivery (Pending)"}
          </div>
          <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
            <strong>Deliver To:</strong> {order.shippingAddress?.fullName}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
          </div>
          {order.invoiceNumber && (
            <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              <strong>Tax Invoice No:</strong> {order.invoiceNumber}
            </div>
          )}
        </div>

        {/* WhatsApp Notification Cue */}
        <div
          style={{
            background: "rgba(37, 211, 102, 0.1)",
            border: "1px solid rgba(37, 211, 102, 0.3)",
            borderRadius: "var(--radius-sm)",
            padding: "0.75rem 1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1.75rem",
            textAlign: "left",
          }}
        >
          <MessageCircle size={24} color="var(--accent-whatsapp)" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: "0.82rem", color: "#fff" }}>
            <strong>WhatsApp Notifications Active:</strong> Live tracking updates and dispatch notifications will be sent to <strong>+91 {order.shippingAddress?.phone}</strong>.
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            className="btn-secondary"
            onClick={() => onViewInvoice(order)}
            style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            <FileText size={16} />
            <span>View Tax Invoice</span>
          </button>

          <button
            className="btn-primary"
            onClick={onClose}
          >
            <span>Continue Shopping</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
