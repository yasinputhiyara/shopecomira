import React, { useState, useEffect } from "react";
import {
  X,
  CreditCard,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
  Truck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import { launchRazorpayCheckout } from "../services/razorpayCheckout.js";
import { useAuth } from "../context/AuthContext.jsx";
import { loginPath } from "../utils/authRedirect.js";

export default function CheckoutModal({
  isOpen,
  onClose,
  items = [],
  couponCode = "",
  onOrderSuccess,
}) {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState("prepaid");
  const [loading, setLoading] = useState(false);
  const [calculation, setCalculation] = useState(null);
  const [error, setError] = useState("");

  const [customer, setCustomer] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const [address, setAddress] = useState({
    street: "",
    landmark: "",
    city: "",
    state: "Maharashtra",
    pincode: "",
  });

  useEffect(() => {
    if (isOpen && !authLoading && !isAuthenticated) {
      onClose?.();
      navigate(loginPath("/checkout"));
    }
  }, [isOpen, authLoading, isAuthenticated, navigate, onClose]);

  useEffect(() => {
    if (!user) return;
    setCustomer({
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
    });
    const defaultAddress = (user.addresses || []).find((addr) => addr.isDefault) || user.addresses?.[0];
    if (defaultAddress) {
      setAddress({
        street: defaultAddress.street || "",
        landmark: defaultAddress.landmark || "",
        city: defaultAddress.city || "",
        state: defaultAddress.state || "Maharashtra",
        pincode: defaultAddress.pincode || "",
      });
    }
  }, [user]);

  useEffect(() => {
    async function loadSummary() {
      try {
        setError("");
        const res = await api.calculateSummary(items, paymentMethod, couponCode);
        setCalculation(res);
      } catch (err) {
        setError(err.message || "Failed to calculate order summary");
      }
    }
    if (isOpen && items.length > 0) {
      loadSummary();
    }
  }, [isOpen, items, paymentMethod, couponCode]);

  if (!isOpen) return null;

  const pricing = calculation?.pricing || {};
  const totalAmountRs = (pricing.totalPaise || 0) / 100;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError("");

    if (!isAuthenticated) {
      onClose?.();
      navigate(loginPath("/checkout"));
      return;
    }

    // Validate form
    if (!customer.fullName || !customer.email || !customer.phone) {
      setError("Please complete all customer contact fields.");
      return;
    }
    if (!/^\d{10}$/.test(customer.phone.replace(/\D/g, ""))) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!address.street || !address.city || !address.pincode) {
      setError("Please provide your delivery street, city, and 6-digit pincode.");
      return;
    }

    setLoading(true);

    try {
      if (paymentMethod === "cod") {
        // Direct COD checkout
        const result = await api.placeCodOrder({
          items,
          customer,
          shippingAddress: {
            fullName: customer.fullName,
            phone: customer.phone,
            ...address,
          },
          couponCode,
        });

        setLoading(false);
        onOrderSuccess(result.order);
      } else {
        // Real Razorpay online payment flow
        const prepOrder = await api.createRazorpayOrder({
          items,
          customer,
          shippingAddress: {
            fullName: customer.fullName,
            phone: customer.phone,
            ...address,
          },
          couponCode,
        });

        await launchRazorpayCheckout({
          orderData: prepOrder,
          customer,
          onSuccess: (confirmedOrder) => {
            setLoading(false);
            onOrderSuccess(confirmedOrder);
          },
          onFailure: (err) => {
            setLoading(false);
            setError(
              err.description ||
                "Payment was declined or cancelled. Please retry or choose Cash on Delivery."
            );
          },
          onDismiss: () => {
            setLoading(false);
            setError("Payment was cancelled. You can retry payment anytime or switch to Cash on Delivery.");
          },
        });
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || "An error occurred placing your order");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content checkout-modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Close checkout">
          <X size={20} />
        </button>

        {/* Main Checkout Form */}
        <form onSubmit={handleSubmitOrder}>
            <div className="checkout-grid">
              {/* Left Column: Customer & Delivery Details */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
                  <Lock size={18} color="var(--accent-emerald)" />
                  <h3 style={{ fontSize: "1.2rem" }}>Secure Checkout</h3>
                </div>

                {error && (
                  <div
                    style={{
                      background: "var(--accent-rose-bg)",
                      border: "1px solid rgba(244, 63, 94, 0.3)",
                      color: "var(--accent-rose)",
                      padding: "0.65rem 0.9rem",
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

                {/* Section 1: Contact Info */}
                <h4 style={{ fontSize: "0.95rem", marginBottom: "0.75rem", color: "#fff" }}>
                  1. Contact Information
                </h4>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    className="form-control"
                    value={customer.fullName}
                    readOnly
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit number"
                      maxLength={10}
                      className="form-control"
                      value={customer.phone}
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@domain.com"
                      className="form-control"
                      value={customer.email}
                      readOnly
                    />
                  </div>
                </div>

                {/* Section 2: Delivery Address */}
                <h4 style={{ fontSize: "0.95rem", margin: "1.25rem 0 0.75rem", color: "#fff" }}>
                  2. Shipping Address
                </h4>
                <div className="form-group">
                  <label className="form-label">Street Address / House / Flat No. *</label>
                  <input
                    type="text"
                    required
                    placeholder="House/Flat number, Street name"
                    className="form-control"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Landmark (Optional)</label>
                  <input
                    type="text"
                    placeholder="Near City Mall, Opposite Metro station"
                    className="form-control"
                    value={address.landmark}
                    onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                  />
                </div>

                <div className="form-row-3">
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="Mumbai"
                      className="form-control"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State *</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pincode *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="400001"
                      className="form-control"
                      value={address.pincode}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, "") })}
                    />
                  </div>
                </div>

                {/* Section 3: Payment Method Selection */}
                <h4 style={{ fontSize: "0.95rem", margin: "1.25rem 0 0.75rem", color: "#fff" }}>
                  3. Select Payment Method
                </h4>

                {/* Prepaid Option */}
                <div
                  className={`payment-choice-card prepaid ${paymentMethod === "prepaid" ? "selected" : ""}`}
                  onClick={() => setPaymentMethod("prepaid")}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "prepaid"}
                    onChange={() => setPaymentMethod("prepaid")}
                    style={{ marginTop: "0.2rem" }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ fontSize: "0.95rem", color: "#fff" }}>
                        Online Payment (UPI, Cards, Netbanking)
                      </strong>
                      <span className="savings-chip" style={{ background: "var(--accent-emerald)" }}>
                        EXTRA 5% OFF
                      </span>
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>
                      Instant confirmation via Razorpay. Zero transaction fees.
                    </p>
                  </div>
                </div>

                {/* COD Option */}
                <div
                  className={`payment-choice-card ${paymentMethod === "cod" ? "selected" : ""}`}
                  onClick={() => setPaymentMethod("cod")}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    style={{ marginTop: "0.2rem" }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ fontSize: "0.95rem", color: "#fff" }}>
                        Cash on Delivery (COD)
                      </strong>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        +₹50 handling fee
                      </span>
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>
                      Pay in cash or UPI to the delivery courier upon receiving your parcel.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Review & Pricing Breakdown */}
              <div style={{ background: "var(--bg-main)", borderRadius: "var(--radius-md)", padding: "1.5rem", border: "1px solid var(--border-subtle)" }}>
                <h4 style={{ fontSize: "1rem", marginBottom: "1rem", color: "#fff" }}>
                  Order Summary ({items.length} items)
                </h4>

                <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: "1rem" }}>
                  {items.map((it) => (
                    <div
                      key={`${it.productId}-${it.variantSku}`}
                      style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "0.5rem" }}
                    >
                      <span style={{ color: "var(--text-secondary)", maxWidth: "70%" }}>
                        {it.productName} ({it.options?.map((o) => o.value).join("/") || it.variantSku}) &times; {it.quantity}
                      </span>
                      <span style={{ fontWeight: 600, color: "#fff" }}>
                        ₹{(((it.sellingPricePaise || 0) * it.quantity) / 100).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "0.75rem" }}>
                  <div className="summary-row">
                    <span>Items Subtotal</span>
                    <span>₹{((pricing.subtotalPaise || 0) / 100).toLocaleString("en-IN")}</span>
                  </div>

                  {pricing.multiItemDiscountPaise > 0 && (
                    <div className="summary-row savings">
                      <span>Multi-Item Discount</span>
                      <span>-₹{(pricing.multiItemDiscountPaise / 100).toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  {pricing.couponDiscountPaise > 0 && (
                    <div className="summary-row savings">
                      <span>Coupon Discount</span>
                      <span>-₹{(pricing.couponDiscountPaise / 100).toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  {paymentMethod === "prepaid" && pricing.prepaidDiscountPaise > 0 && (
                    <div className="summary-row savings">
                      <span>Prepaid 5% Online Discount</span>
                      <span>-₹{(pricing.prepaidDiscountPaise / 100).toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="summary-row">
                    <span>Shipping Fee</span>
                    <span>{pricing.shippingFeePaise === 0 ? "FREE" : `₹${pricing.shippingFeePaise / 100}`}</span>
                  </div>

                  {paymentMethod === "cod" && (
                    <div className="summary-row">
                      <span>COD Handling Fee</span>
                      <span>₹{(pricing.codFeePaise / 100) || 50}</span>
                    </div>
                  )}

                  <div className="summary-row" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    <span>Included Taxes (GST)</span>
                    <span>₹{((pricing.taxAmountPaise || 0) / 100).toFixed(2)}</span>
                  </div>

                  <div className="summary-row total">
                    <span>Amount Payable</span>
                    <span>₹{totalAmountRs.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: "100%", marginTop: "1.25rem", height: 48 }}
                  disabled={loading}
                >
                  {loading ? (
                    <span>Processing Order...</span>
                  ) : paymentMethod === "prepaid" ? (
                    <>
                      <span>Pay Online ₹{totalAmountRs.toLocaleString("en-IN")}</span>
                      <ArrowRight size={18} />
                    </>
                  ) : (
                    <>
                      <span>Place Cash on Delivery Order</span>
                      <Truck size={18} />
                    </>
                  )}
                </button>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.75rem" }}>
                  <ShieldCheck size={14} color="var(--accent-emerald)" />
                  <span>256-bit Encrypted & Verified Commerce</span>
                </div>
              </div>
            </div>
          </form>
      </div>
    </div>
  );
}
