import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";

export default function WhatsAppWidget({
  whatsappNumber = "919876543210",
  defaultMessage = "Hello Shopecomira team! I have a question about trending products on your store.",
}) {
  const [showTooltip, setShowTooltip] = useState(true);

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <>
      {showTooltip && (
        <div
          className="whatsapp-tooltip"
          style={{
            position: "fixed",
            bottom: "90px",
            right: "24px",
            zIndex: 70,
            background: "rgba(17, 24, 39, 0.95)",
            border: "1px solid var(--border-medium)",
            borderRadius: "var(--radius-md)",
            padding: "0.6rem 0.9rem",
            boxShadow: "var(--shadow-lg)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            maxWidth: 220,
            fontSize: "0.78rem",
            color: "#fff",
            animation: "fadeIn 0.3s ease",
          }}
        >
          <span>Need help? Chat with our support team on WhatsApp!</span>
          <button
            onClick={() => setShowTooltip(false)}
            style={{ color: "var(--text-muted)", padding: "0.1rem" }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp"
        title="Chat on WhatsApp"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={28} />
      </a>
    </>
  );
}
