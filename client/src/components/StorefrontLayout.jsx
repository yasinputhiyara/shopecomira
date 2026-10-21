import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import CartDrawer from "../components/CartDrawer.jsx";
import OrderLookupModal from "../components/OrderLookupModal.jsx";
import GstInvoiceModal from "../components/GstInvoiceModal.jsx";
import WhatsAppWidget from "../components/WhatsAppWidget.jsx";
import MobileBottomNav from "../components/MobileBottomNav.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { loginPath } from "../utils/authRedirect.js";
import { api } from "../services/api.js";

export default function StorefrontLayout() {
  const { cartItems, couponCode, setCouponCode, toastMessage, showToast, updateQuantity, removeFromCart } = useCart();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState(null);

  useEffect(() => {
    async function loadSharedData() {
      try {
        const [catsRes, setsRes] = await Promise.all([
          api.getCategories(),
          api.getPublicSettings(),
        ]);
        setCategories(catsRes.data || []);
        setSettings(setsRes || null);
      } catch (err) {
        console.error("Failed to load layout data:", err);
      }
    }
    loadSharedData();
  }, []);

  const handleApplyCoupon = (code) => {
    setCouponCode(code);
    showToast(`Coupon <strong>${code}</strong> ready to apply!`);
    setIsCartOpen(true);
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            top: "80px",
            right: "24px",
            zIndex: 110,
            background: "rgba(16, 185, 129, 0.95)",
            color: "#ffffff",
            padding: "0.75rem 1.25rem",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-lg)",
            backdropFilter: "blur(10px)",
            fontWeight: 600,
            fontSize: "0.88rem",
            animation: "fadeIn 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            maxWidth: 340,
          }}
        >
          <Sparkles size={16} />
          <span dangerouslySetInnerHTML={{ __html: toastMessage }} />
        </div>
      )}

      {/* Navigation */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={categories}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
      />

      {/* Page Content via Outlet */}
      <Outlet
        context={{
          categories,
          settings,
          searchQuery,
          setSearchQuery,
          setIsCartOpen,
          setIsTrackOrderOpen,
          setViewingInvoice,
          showToast,
          handleApplyCoupon,
        }}
      />

      {/* Footer */}
      <Footer />

      {/* Floating WhatsApp Widget */}
      <WhatsAppWidget
        whatsappNumber={settings?.whatsappNumber || "919876543210"}
        defaultMessage="Hello Shopecomira team! I am browsing your trending store and have an inquiry."
      />

      {/* Mobile Sticky Bottom Navigation (Home | Explore | Cart | Orders) */}
      <MobileBottomNav />

      {/* SHARED MODALS */}
      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        couponCode={couponCode}
        onApplyCoupon={setCouponCode}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          if (authLoading) return;
          if (!isAuthenticated) {
            navigate(loginPath("/checkout"));
            return;
          }
          navigate("/checkout");
        }}
        freeShippingThreshold={(settings?.freeShippingThresholdPaise || 99900) / 100}
      />

      {/* Order Tracking Modal */}
      <OrderLookupModal
        isOpen={isTrackOrderOpen}
        onClose={() => setIsTrackOrderOpen(false)}
        onViewInvoice={(ord) => setViewingInvoice(ord)}
      />

      {/* GST Invoice Modal */}
      {viewingInvoice && (
        <GstInvoiceModal
          invoiceData={viewingInvoice}
          onClose={() => setViewingInvoice(null)}
        />
      )}
    </>
  );
}
