import React, { useState } from "react";
import {
  X,
  Star,
  ShoppingBag,
  Zap,
  ShieldCheck,
  RotateCcw,
  Truck,
  CheckCircle2,
  MessageCircle,
  HelpCircle,
  AlertCircle,
} from "lucide-react";

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  whatsappNumber = "919876543210",
}) {
  if (!product) return null;

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState(null);

  const variant = product.variants?.[selectedVariantIndex] || product.variants?.[0] || {};
  const sellingPrice = (variant.sellingPricePaise || 0) / 100;
  const mrp = (variant.mrpPaise || 0) / 100;
  const savings = mrp - sellingPrice;
  const discountPercent = mrp > 0 ? Math.round((savings / mrp) * 100) : 0;
  const prepaidPrice = Math.round(sellingPrice * 0.95);

  const images = product.images && product.images.length > 0 ? product.images : [{ url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80" }];
  const currentImage = images[selectedImageIndex]?.url || images[0]?.url;

  const isLowStock = variant.stockQuantity > 0 && variant.stockQuantity <= 5;
  const isOutOfStock = variant.stockQuantity <= 0;

  // Check pincode logic
  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode.trim())) {
      setPincodeStatus({
        valid: false,
        message: "Please enter a valid 6-digit Indian pincode.",
      });
      return;
    }

    const today = new Date();
    const deliveryDate = new Date(today.setDate(today.getDate() + 3));
    const formattedDate = deliveryDate.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

    setPincodeStatus({
      valid: true,
      message: `Delivery available by ${formattedDate}. Cash on Delivery available.`,
    });
  };

  // WhatsApp Enquiry Link
  const productUrl = window.location.href;
  const waMessage = `Hello Shopecomira team, I am interested in "${product.name}" (${variant.sku || ""}) listed at ₹${sellingPrice.toLocaleString("en-IN")}. Could you please share more details?`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="product-detail-grid">
          {/* Left: Gallery */}
          <div className="gallery-column">
            <img
              src={currentImage}
              alt={product.name}
              className="gallery-main-img"
            />
            {images.length > 1 && (
              <div className="gallery-thumbnails">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`gallery-thumb-btn ${idx === selectedImageIndex ? "active" : ""}`}
                    onClick={() => setSelectedImageIndex(idx)}
                  >
                    <img src={img.url} alt={`Thumbnail ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}

            {/* WhatsApp Direct Enquiry */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp-enquire"
              title="Chat with our specialist about this product"
            >
              <MessageCircle size={20} />
              <span>Ask a Question on WhatsApp</span>
            </a>
          </div>

          {/* Right: Details & Buying Box */}
          <div className="details-column">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span className="product-brand" style={{ fontSize: "0.85rem", color: "var(--accent-indigo)" }}>
                {product.brand || "Shopecomira"}
              </span>
              <div className="product-rating" style={{ fontSize: "0.85rem" }}>
                <Star size={15} fill="#f59e0b" color="#f59e0b" />
                <span>{product.rating || 4.8}</span>
                <span style={{ color: "var(--text-muted)" }}>({product.reviewCount || 35} verified reviews)</span>
              </div>
            </div>

            <h2 className="detail-title">{product.name}</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1rem" }}>
              {product.shortDescription}
            </p>

            {/* Pricing Box */}
            <div className="detail-pricing-box">
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", flexWrap: "wrap" }}>
                <span className="price-current" style={{ fontSize: "1.75rem" }}>
                  ₹{sellingPrice.toLocaleString("en-IN")}
                </span>
                {mrp > sellingPrice && (
                  <>
                    <span className="price-mrp" style={{ fontSize: "1.1rem" }}>
                      ₹{mrp.toLocaleString("en-IN")}
                    </span>
                    <span className="savings-chip">Save {discountPercent}%</span>
                  </>
                )}
              </div>

              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginTop: "0.5rem" }}>
                <span className="prepaid-tag" style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem" }}>
                  Pay ₹{prepaidPrice.toLocaleString("en-IN")} with Prepaid (Extra 5% OFF)
                </span>
              </div>

              <div className="tax-note">
                ✓ Inclusive of all taxes (GST {product.gstRate}%) | HSN: {product.hsnCode}
              </div>
            </div>

            {/* Variant selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="variant-selector">
                <div className="variant-label">
                  Select Option: <strong>{variant.options?.map((o) => `${o.name}: ${o.value}`).join(", ") || variant.sku}</strong>
                </div>
                <div className="variant-options-list">
                  {product.variants.map((v, i) => (
                    <button
                      key={v.sku}
                      className={`variant-option-chip ${i === selectedVariantIndex ? "selected" : ""}`}
                      onClick={() => setSelectedVariantIndex(i)}
                    >
                      {v.options?.map((o) => o.value).join(" / ") || v.sku}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock indicator */}
            <div style={{ margin: "0.75rem 0", fontSize: "0.85rem", fontWeight: 600 }}>
              {isOutOfStock ? (
                <span style={{ color: "var(--accent-rose)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <AlertCircle size={16} /> Out of Stock
                </span>
              ) : isLowStock ? (
                <span style={{ color: "var(--accent-amber)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <AlertCircle size={16} /> Only {variant.stockQuantity} left in stock - order soon!
                </span>
              ) : (
                <span style={{ color: "var(--accent-emerald)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <CheckCircle2 size={16} /> In Stock ({variant.stockQuantity} units available)
                </span>
              )}
            </div>

            {/* Quantity and Action Buttons */}
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", margin: "1rem 0" }}>
              <div className="cart-qty-stepper" style={{ height: 44 }}>
                <button
                  className="stepper-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                >
                  -
                </button>
                <span className="stepper-count">{quantity}</span>
                <button
                  className="stepper-btn"
                  onClick={() => setQuantity(Math.min(variant.stockQuantity || 10, quantity + 1))}
                  disabled={quantity >= variant.stockQuantity || isOutOfStock}
                >
                  +
                </button>
              </div>

              <button
                className="btn-secondary"
                style={{ flex: 1, height: 44 }}
                onClick={() => onAddToCart(product, variant, quantity)}
                disabled={isOutOfStock}
              >
                <ShoppingBag size={18} />
                <span>Add to Cart</span>
              </button>

              <button
                className="btn-primary"
                style={{ flex: 1, height: 44 }}
                onClick={() => onBuyNow(product, variant, quantity)}
                disabled={isOutOfStock}
              >
                <Zap size={18} />
                <span>Buy Now</span>
              </button>
            </div>

            {/* Pincode checker */}
            <div className="pincode-box">
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", fontWeight: 600 }}>
                <Truck size={16} color="var(--accent-indigo)" />
                <span>Check Delivery & COD Availability</span>
              </div>
              <form onSubmit={handleCheckPincode} className="pincode-input-row">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit Pincode (e.g. 400001)"
                  className="pincode-input"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                />
                <button type="submit" className="btn-secondary" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}>
                  Check
                </button>
              </form>
              {pincodeStatus && (
                <div className={`pincode-result ${pincodeStatus.valid ? "available" : "unavailable"}`} style={{ color: pincodeStatus.valid ? "var(--accent-emerald)" : "var(--accent-rose)" }}>
                  {pincodeStatus.message}
                </div>
              )}
            </div>

            {/* Highlights */}
            {product.highlights && product.highlights.length > 0 && (
              <div style={{ margin: "1.25rem 0" }}>
                <h4 style={{ fontSize: "0.95rem", marginBottom: "0.6rem" }}>Key Highlights</h4>
                <ul style={{ paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.88rem", color: "var(--text-secondary)" }}>
                  {product.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specifications Table */}
            {product.specifications && product.specifications.length > 0 && (
              <div style={{ margin: "1.25rem 0" }}>
                <h4 style={{ fontSize: "0.95rem", marginBottom: "0.6rem" }}>Product Specifications</h4>
                <div style={{ background: "var(--bg-main)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                  {product.specifications.map((s, i) => (
                    <div
                      key={i}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1.5fr",
                        padding: "0.55rem 0.85rem",
                        fontSize: "0.82rem",
                        borderBottom: i < product.specifications.length - 1 ? "1px solid var(--border-subtle)" : "none",
                      }}
                    >
                      <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>{s.label}</span>
                      <span style={{ color: "var(--text-primary)" }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
