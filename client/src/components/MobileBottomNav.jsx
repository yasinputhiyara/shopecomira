import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, LayoutGrid, ShoppingBag, User } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function MobileBottomNav() {
  const location = useLocation();
  const { cartCount } = useCart();
  const { isAuthenticated } = useAuth();
  const pathname = location.pathname;

  // Active route checks
  const isHomeActive = pathname === "/" && !location.search.includes("filter");
  const isExploreActive =
    pathname === "/categories" ||
    pathname.startsWith("/category/") ||
    pathname === "/search" ||
    location.search.includes("filter");
  const isCartActive = pathname === "/cart" || pathname === "/checkout";
  const isOrdersActive =
    pathname.startsWith("/track-order") ||
    pathname.startsWith("/order-success") ||
    pathname === "/account" ||
    pathname === "/login" ||
    pathname === "/register";

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation Bar">
      {/* 1. Home */}
      <Link
        to="/"
        className={`mobile-nav-item ${isHomeActive ? "active" : ""}`}
        aria-label="Home"
      >
        <div className="mobile-nav-icon-wrapper">
          <Home size={22} strokeWidth={isHomeActive ? 2.3 : 1.8} />
        </div>
        <span className="mobile-nav-label">Home</span>
      </Link>

      {/* 2. Explore */}
      <Link
        to="/categories"
        className={`mobile-nav-item ${isExploreActive ? "active" : ""}`}
        aria-label="Explore Categories"
      >
        <div className="mobile-nav-icon-wrapper">
          <LayoutGrid size={22} strokeWidth={isExploreActive ? 2.3 : 1.8} />
        </div>
        <span className="mobile-nav-label">Explore</span>
      </Link>

      {/* 3. Cart with Badge */}
      <Link
        to="/cart"
        className={`mobile-nav-item ${isCartActive ? "active" : ""}`}
        aria-label={`Shopping Cart with ${cartCount} items`}
      >
        <div className="mobile-nav-icon-wrapper">
          <ShoppingBag size={22} strokeWidth={isCartActive ? 2.3 : 1.8} />
          {cartCount > 0 && (
            <span className="mobile-cart-badge" aria-label={`${cartCount} items in cart`}>
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </div>
        <span className="mobile-nav-label">Cart</span>
      </Link>

      {/* 4. Orders */}
      <Link
        to={isAuthenticated ? "/account" : "/login?redirect=/account"}
        className={`mobile-nav-item ${isOrdersActive ? "active" : ""}`}
        aria-label={isAuthenticated ? "Account" : "Login"}
      >
        <div className="mobile-nav-icon-wrapper">
          <User size={22} strokeWidth={isOrdersActive ? 2.3 : 1.8} />
        </div>
        <span className="mobile-nav-label">{isAuthenticated ? "Account" : "Login"}</span>
      </Link>
    </nav>
  );
}
