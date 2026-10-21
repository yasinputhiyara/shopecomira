import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  Search,
  Truck,
  Sparkles,
  X,
  Home,
  Tag,
  Star,
  Flame,
  User,
  LogIn,
} from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { loginPath } from "../utils/authRedirect.js";

export default function Navbar({
  searchQuery = "",
  onSearchChange,
  categories = [],
  onOpenCart,
  onOpenTrackOrder,
}) {
  const { cartCount } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleLogoClick = (e) => {
    e.preventDefault();
    navigate("/");
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    if (onSearchChange) onSearchChange(val);
    // Navigate to home with search query if not already there
    if (val && location.pathname !== "/") {
      navigate(`/?search=${encodeURIComponent(val)}`);
    }
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="announcement-bar">
        <span>
          ✨ <strong>PREPAID SPECIAL:</strong> Extra 5% Instant Discount on UPI &amp; Cards | Free Shipping over ₹999 | COD Available
        </span>
      </div>

      {/* Main Navbar */}
      <header className="navbar">
        <div className="container nav-container">
          {/* Logo */}
          <a href="/" onClick={handleLogoClick} className="brand-logo">
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "linear-gradient(135deg, #6366f1 0%, #10b981 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <Sparkles size={22} />
            </div>
            <div>
              <span>Shopecom<span className="brand-highlight">ira</span></span>
              <span className="brand-tagline">Trending Innovations</span>
            </div>
          </a>

          {/* Search bar */}
          <div className="nav-search">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              className="search-input-wrapper"
            >
              <Search className="search-icon" size={18} />
              <input
                type="text"
                className="search-input"
                placeholder="Search trending earbuds, scrubbers, gadgets..."
                value={searchQuery}
                onChange={handleSearch}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange?.("")}
                  style={{
                    position: "absolute",
                    right: "0.8rem",
                    color: "var(--text-muted)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </form>
          </div>

          {/* Action buttons */}
          <div className="nav-actions">
            <Link
              to="/offers"
              className="btn-nav-action"
              title="Deals & Offers"
              style={{ textDecoration: "none" }}
            >
              <Sparkles size={18} color="var(--accent-amber)" />
              <span>Offers</span>
            </Link>

            <Link
              to="/track-order"
              className="btn-nav-action"
              title="Track Order Status"
              style={{ textDecoration: "none" }}
            >
              <Truck size={18} />
              <span>Track Order</span>
            </Link>

            {isAuthenticated ? (
              <Link
                to="/account"
                className="btn-nav-action"
                title="My Account"
                style={{ textDecoration: "none" }}
              >
                <User size={18} />
                <span>{user?.fullName?.split(" ")[0] || "Account"}</span>
              </Link>
            ) : (
              <>
                <Link
                  to={loginPath(location.pathname === "/checkout" ? "/checkout" : "/account")}
                  className="btn-nav-action"
                  title="Sign in"
                  style={{ textDecoration: "none" }}
                >
                  <LogIn size={18} />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="btn-nav-action"
                  title="Create account"
                  style={{ textDecoration: "none" }}
                >
                  <span>Register</span>
                </Link>
              </>
            )}

            <Link
              to="/cart"
              className="cart-btn"
              aria-label="Shopping Cart"
              style={{ textDecoration: "none" }}
            >
              <ShoppingBag size={18} />
              <span>Cart</span>
              <span className="cart-badge">{cartCount}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Category Navigation Strip (secondary nav) */}
      <nav className="category-nav" style={{
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border-subtle)",
        overflowX: "auto",
        scrollbarWidth: "none",
      }}>
        <div className="container" style={{ display: "flex", gap: "0.35rem", padding: "0.4rem 1.25rem", flexWrap: "nowrap", alignItems: "center" }}>
          <Link
            to="/"
            className="category-pill"
            style={{ whiteSpace: "nowrap" }}
          >
            <Home size={14} />
            <span>Home</span>
          </Link>
          <Link to="/?filter=trending" className="category-pill" style={{ whiteSpace: "nowrap" }}>
            <Flame size={14} color="#f59e0b" />
            <span>Trending</span>
          </Link>
          <Link to="/?filter=bestseller" className="category-pill" style={{ whiteSpace: "nowrap" }}>
            <Star size={14} color="#10b981" />
            <span>Best Sellers</span>
          </Link>
          <Link to="/?filter=new" className="category-pill" style={{ whiteSpace: "nowrap" }}>
            <Tag size={14} />
            <span>New Arrivals</span>
          </Link>
          <Link to="/categories" className="category-pill" style={{ whiteSpace: "nowrap", background: "rgba(99, 102, 241, 0.1)", borderColor: "var(--accent-indigo)", color: "var(--accent-indigo)" }}>
            <span>All Categories &rarr;</span>
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/category/${cat.slug}`}
              className="category-pill"
              style={{ whiteSpace: "nowrap" }}
            >
              <span>{cat.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
