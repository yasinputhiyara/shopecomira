import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext, Link } from "react-router-dom";
import {
  ShoppingBag,
  Home,
  ArrowLeft,
  CreditCard,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
  Truck,
  RefreshCw,
} from "lucide-react";
import GstInvoiceModal from "../components/GstInvoiceModal.jsx";
import OrderConfirmationModal from "../components/OrderConfirmationModal.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../services/api.js";
import { launchRazorpayCheckout } from "../services/razorpayCheckout.js";
import { loginPath } from "../utils/authRedirect.js";

const formatPrice = (paise) => `₹${((paise || 0) / 100).toLocaleString("en-IN")}`;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const outletCtx = useOutletContext() || {};

  const { cartItems, couponCode, clearCart } = useCart();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState("prepaid");
  const [loading, setLoading] = useState(false);
  const [calculation, setCalculation] = useState(null);
  const [error, setError] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);

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

  const [paymentFailedDetails, setPaymentFailedDetails] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate(loginPath("/checkout"), { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

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
        const res = await api.calculateSummary(cartItems, paymentMethod, couponCode);
        setCalculation(res);
      } catch (err) {
        setError(err.message || "Failed to calculate order summary");
      }
    }
    if (cartItems.length > 0) {
      loadSummary();
    }
  }, [paymentMethod, cartItems, couponCode]);

  const pricing = calculation?.pricing || calculation || {};
  const totalAmountRs = (pricing.totalPaise || 0) / 100;

  const handlePlaceOrder = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    setPaymentFailedDetails(null);

    // Form validations
    if (!customer.fullName?.trim() || !customer.email?.trim() || !customer.phone?.trim()) {
      setError("Please complete all contact details (Full Name, Email, and 10-digit Mobile Number).");
      return;
    }
    const cleanPhone = customer.phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!address.street?.trim() || !address.city?.trim() || !address.pincode?.trim()) {
      setError("Please provide a complete delivery address with Street, City, and PIN code.");
      return;
    }
    const cleanPincode = address.pincode.replace(/\D/g, "");
    if (cleanPincode.length !== 6) {
      setError("Please enter a valid 6-digit PIN code.");
      return;
    }

    setLoading(true);

    const orderPayload = {
      items: cartItems,
      customer: {
        fullName: customer.fullName.trim(),
        email: customer.email.trim(),
        phone: cleanPhone,
      },
      shippingAddress: {
        fullName: customer.fullName.trim(),
        phone: cleanPhone,
        street: address.street.trim(),
        landmark: address.landmark?.trim() || "",
        city: address.city.trim(),
        state: address.state,
        pincode: cleanPincode,
      },
      paymentMethod,
      couponCode,
    };

    try {
      if (paymentMethod === "cod") {
        const res = await api.placeCodOrder(orderPayload);
        clearCart();
        navigate(`/order-success/${res.order.orderNumber}`);
      } else {
        // Real Razorpay online payment flow
        const rzpOrderData = await api.createRazorpayOrder(orderPayload);

        await launchRazorpayCheckout({
          orderData: rzpOrderData,
          customer: {
            fullName: customer.fullName.trim(),
            email: customer.email.trim(),
            phone: cleanPhone,
          },
          onSuccess: (confirmedOrder) => {
            clearCart();
            navigate(`/order-success/${confirmedOrder.orderNumber}`);
          },
          onFailure: (err) => {
            setLoading(false);
            setPaymentFailedDetails(err);
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
      setError(err.message || "Could not place order. Please try again.");
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
        Checking your account...
      </div>
    );
  }

  if (cartItems.length === 0 && !confirmedOrder) {
    return (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <ShoppingBag size={52} style={{ opacity: 0.3, marginBottom: "1rem" }} />
          <h2>Your cart is empty</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>Add items to your cart before checking out.</p>
          <Link to="/" className="btn-primary">Shop Now</Link>
        </div>
      </div>
    );
  }

  if (confirmedOrder) {
    return (
      <OrderConfirmationModal
        order={confirmedOrder}
        onClose={() => navigate("/")}
        onViewInvoice={(ord) => setViewingInvoice(ord)}
        onTrackOrder={() => navigate("/track-order")}
        inline={true}
      />
    );
  }

  return (
    <>
      {/* Breadcrumb */}
      <div style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)", padding: "0.75rem 1.25rem" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <Link to="/" style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Home size={14} /> Home
          </Link>
          <span>/</span>
          <Link to="/cart" style={{ color: "var(--text-muted)" }}>Cart</Link>
          <span>/</span>
          <span style={{ color: "var(--text-primary)" }}>Checkout</span>
        </div>
      </div>

      <main className="container" style={{ padding: "2rem 1.25rem 4rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Secure Checkout</h1>
          <Link to="/cart" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--accent-indigo)", fontSize: "0.85rem", textDecoration: "none" }}>
            <ArrowLeft size={16} />
            Back to Cart
          </Link>
        </div>

        {/* Payment Error / Failure Alert Banner */}
        {error && (
          <div
            style={{
              background: "rgba(244, 63, 94, 0.1)",
              border: "1px solid rgba(244, 63, 94, 0.3)",
              borderRadius: "var(--radius-md)",
              padding: "1rem 1.25rem",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
            }}
          >
            <AlertCircle size={20} color="var(--accent-rose)" style={{ flexShrink: 0, marginTop: "0.15rem" }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "var(--accent-rose)", fontSize: "0.9rem" }}>
                Payment Update
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                {error}
              </div>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  className="btn-primary"
                  style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem", height: 32 }}
                  disabled={loading}
                >
                  <RefreshCw size={13} className={loading ? "spin" : ""} />
                  <span>Retry Razorpay Payment</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("cod");
                    setError("");
                    setPaymentFailedDetails(null);
                  }}
                  className="btn-secondary"
                  style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem", height: 32 }}
                >
                  <Banknote size={14} />
                  <span>Switch to Cash on Delivery</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div className="checkout-grid" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem", alignItems: "start" }}>

            {/* Left: Form */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

              {/* Customer Details */}
              <section style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
                <h2 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--accent-indigo)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800 }}>1</span>
                  Contact Information
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div className="form-group" style={{ gridColumn: "1/-1", marginBottom: 0 }}>
                    <label className="form-label">Full Name *</label>
                    <input type="text" className="form-control" required placeholder="Your full name" readOnly
                      value={customer.fullName} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Email *</label>
                    <input type="email" className="form-control" required placeholder="you@email.com" readOnly
                      value={customer.email} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Phone *</label>
                    <input type="tel" className="form-control" required placeholder="10-digit mobile"
                      maxLength={10} value={customer.phone} readOnly />
                  </div>
                </div>
              </section>

              {/* Shipping Address */}
              <section style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
                <h2 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--accent-indigo)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800 }}>2</span>
                  Delivery Address
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Street Address *</label>
                    <input type="text" className="form-control" required placeholder="House no., Street, Area"
                      value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Landmark (optional)</label>
                    <input type="text" className="form-control" placeholder="Near landmark"
                      value={address.landmark} onChange={(e) => setAddress({ ...address, landmark: e.target.value })} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">City *</label>
                      <input type="text" className="form-control" required placeholder="City"
                        value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">State *</label>
                      <select className="form-control" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })}>
                        {["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Gujarat", "Rajasthan", "West Bengal", "Uttar Pradesh", "Telangana", "Kerala", "Madhya Pradesh", "Haryana", "Bihar", "Andhra Pradesh", "Other"].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Pincode *</label>
                      <input type="text" className="form-control" required placeholder="6-digit PIN"
                        maxLength={6} value={address.pincode}
                        onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, "") })} />
                    </div>
                  </div>
                </div>
              </section>

              {/* Payment Method */}
              <section style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
                <h2 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--accent-indigo)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800 }}>3</span>
                  Payment Method
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {[
                    {
                      value: "prepaid",
                      icon: <CreditCard size={20} />,
                      title: "Online Payment (UPI / Card)",
                      desc: "🎉 Extra 5% instant discount — best value!",
                      savings: pricing.prepaidDiscountPaise
                        ? `Save ₹${((pricing.prepaidDiscountPaise || 0) / 100).toLocaleString("en-IN")} extra`
                        : pricing.potentialPrepaidSavingsPaise
                        ? `Save ₹${((pricing.potentialPrepaidSavingsPaise || 0) / 100).toLocaleString("en-IN")} extra`
                        : "",
                    },
                    {
                      value: "cod",
                      icon: <Banknote size={20} />,
                      title: "Cash on Delivery",
                      desc: pricing.codFeePaise
                        ? `COD charge: ₹${((pricing.codFeePaise || 0) / 100).toLocaleString("en-IN")} applies`
                        : "Pay cash or UPI to courier on delivery",
                      savings: "",
                    },
                  ].map((pm) => (
                    <label
                      key={pm.value}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.75rem",
                        padding: "1rem",
                        border: `2px solid ${paymentMethod === pm.value ? "var(--accent-indigo)" : "var(--border-subtle)"}`,
                        borderRadius: "var(--radius-md)",
                        cursor: "pointer",
                        background: paymentMethod === pm.value ? "var(--accent-indigo-bg)" : "transparent",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <input type="radio" name="payment" value={pm.value}
                        checked={paymentMethod === pm.value} onChange={() => setPaymentMethod(pm.value)}
                        style={{ marginTop: "0.15rem" }} />
                      <span style={{ color: paymentMethod === pm.value ? "var(--accent-indigo)" : "var(--text-secondary)" }}>{pm.icon}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.2rem" }}>{pm.title}</p>
                        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{pm.desc}</p>
                        {pm.savings && <p style={{ fontSize: "0.75rem", color: "var(--accent-emerald)", marginTop: "0.2rem", fontWeight: 600 }}>{pm.savings}</p>}
                      </div>
                    </label>
                  ))}
                </div>
              </section>
            </div>

            {/* Right: Order Summary */}
            <div style={{ position: "sticky", top: 100 }}>
              <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1.25rem" }}>
                  Order Summary ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)
                </h2>

                {/* Items */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.25rem", maxHeight: 200, overflowY: "auto" }}>
                  {cartItems.map((item) => (
                    <div key={`${item.productId}-${item.variantSku}`} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                      <span style={{ color: "var(--text-secondary)", flex: 1 }}>{item.productName} × {item.quantity}</span>
                      <span style={{ fontWeight: 600, flexShrink: 0, marginLeft: "0.5rem" }}>
                        {formatPrice(item.sellingPricePaise * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price breakdown */}
                {calculation && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.83rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-subtle)", marginBottom: "0.75rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
                      <span>{formatPrice(pricing.subtotalPaise)}</span>
                    </div>
                    {pricing.multiItemDiscountPaise > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--accent-emerald)" }}>
                        <span>Multi-item Discount</span>
                        <span>-{formatPrice(pricing.multiItemDiscountPaise)}</span>
                      </div>
                    )}
                    {pricing.couponDiscountPaise > 0 ? (
                      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--accent-emerald)" }}>
                        <span>Coupon ({pricing.couponCode || couponCode})</span>
                        <span>-{formatPrice(pricing.couponDiscountPaise)}</span>
                      </div>
                    ) : (
                      pricing.couponMessage && couponCode && (
                        <div style={{ fontSize: "0.74rem", color: "var(--accent-amber, #d97706)", background: "rgba(245, 158, 11, 0.08)", padding: "0.35rem 0.5rem", borderRadius: "var(--radius-sm)" }}>
                          ⚠️ {pricing.couponMessage}
                        </div>
                      )
                    )}
                    {pricing.prepaidDiscountPaise > 0 && paymentMethod === "prepaid" && (
                      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--accent-emerald)" }}>
                        <span>Prepaid 5% Online Discount</span>
                        <span>-{formatPrice(pricing.prepaidDiscountPaise)}</span>
                      </div>
                    )}
                    {pricing.codFeePaise > 0 && paymentMethod === "cod" && (
                      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--accent-rose)" }}>
                        <span>COD Charge</span>
                        <span>+{formatPrice(pricing.codFeePaise)}</span>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Shipping</span>
                      <span style={{ color: pricing.shippingFeePaise === 0 ? "var(--accent-emerald)" : "inherit" }}>
                        {pricing.shippingFeePaise === 0 ? "FREE" : formatPrice(pricing.shippingFeePaise)}
                      </span>
                    </div>
                    {pricing.taxAmountPaise > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.76rem", color: "var(--text-muted)" }}>
                        <span>Included GST</span>
                        <span>₹{((pricing.taxAmountPaise || 0) / 100).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ paddingTop: "0.75rem", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "1.1rem", marginBottom: "1.25rem" }}>
                  <span>Total</span>
                  <span style={{ color: "var(--accent-emerald)" }}>{formatPrice(pricing.totalPaise || 0)}</span>
                </div>

                {error && (
                  <div style={{ padding: "0.75rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", color: "var(--accent-rose)", borderRadius: "var(--radius-sm)", fontSize: "0.8rem", marginBottom: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: "100%", height: 48, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontSize: "0.95rem" }}
                  disabled={loading || !calculation}
                >
                  {loading ? (
                    <><RefreshCw size={18} className="spin" /><span>Processing...</span></>
                  ) : paymentMethod === "prepaid" ? (
                    <><span>Pay Online ₹{totalAmountRs.toLocaleString("en-IN")}</span><ArrowRight size={18} /></>
                  ) : (
                    <><span>Place COD Order (₹{totalAmountRs.toLocaleString("en-IN")})</span><Truck size={18} /></>
                  )}
                </button>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.75rem" }}>
                  <ShieldCheck size={14} color="var(--accent-emerald)" />
                  <span>256-bit SSL Encrypted Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </form>
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
