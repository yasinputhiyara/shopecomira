import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'

// Context
import { CartProvider } from './context/CartContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

// Storefront Layout & Pages
import StorefrontLayout from './components/StorefrontLayout.jsx'
import HomePage from './pages/HomePage.jsx'
import CategoryPage from './pages/CategoryPage.jsx'
import CategoriesPage from './pages/CategoriesPage.jsx'
import ProductPage from './pages/ProductPage.jsx'
import SearchPage from './pages/SearchPage.jsx'
import OffersPage from './pages/OffersPage.jsx'
import CartPage from './pages/CartPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import AccountPage from './pages/AccountPage.jsx'
import OrderSuccessPage from './pages/OrderSuccessPage.jsx'
import OrderTrackingPage from './pages/OrderTrackingPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import FaqPage from './pages/FaqPage.jsx'
import ShippingPolicyPage from './pages/ShippingPolicyPage.jsx'
import ReturnPolicyPage from './pages/ReturnPolicyPage.jsx'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.jsx'
import TermsPage from './pages/TermsPage.jsx'

// Admin Pages
import AdminLoginPage from './pages/AdminLoginPage.jsx'
import AdminDashboardPage from './pages/AdminDashboardPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/*
           * ─── CUSTOMER / USER STOREFRONT ROUTES ───────────────────────────────
           *   All wrapped in StorefrontLayout (Navbar + Footer + shared modals)
           */}
          <Route element={<StorefrontLayout />}>
            {/* Home – Product Catalogue */}
            <Route path="/" element={<HomePage />} />

            {/* Catalogue & Collections */}
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/deals" element={<Navigate to="/offers" replace />} />

            {/* Cart & Checkout Funnel */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success/:orderNumber" element={<OrderSuccessPage />} />

            {/* Order Tracking & Lookup */}
            <Route path="/track-order" element={<OrderTrackingPage />} />
            <Route path="/track-order/:orderNumber" element={<OrderTrackingPage />} />

            {/* Customer Care, Support & Policy Pages */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
            <Route path="/return-policy" element={<ReturnPolicyPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />

            {/* Legacy URL Aliases */}
            <Route path="/shop" element={<Navigate to="/" replace />} />
            <Route path="/products" element={<Navigate to="/" replace />} />
          </Route>

          {/*
           * ─── ADMIN PORTAL ROUTES ──────────────────────────────────────────────
           *   Separate from storefront layout (own dark UI)
           */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/orders" element={<AdminDashboardPage defaultTab="orders" />} />
          <Route path="/admin/products" element={<AdminDashboardPage defaultTab="products" />} />
          <Route path="/admin/categories" element={<AdminDashboardPage defaultTab="categories" />} />
          <Route path="/admin/offers" element={<AdminDashboardPage defaultTab="offers" />} />
          <Route path="/admin/settings" element={<AdminDashboardPage defaultTab="settings" />} />

          {/* Catch-all → Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
    </AuthProvider>
  </StrictMode>,
)
