import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Package, Mail, Phone, User } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { loginPath } from "../utils/authRedirect.js";

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate(loginPath("/account"), { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading || !user) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
        Loading account...
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="container" style={{ padding: "2rem 1.25rem 4rem", maxWidth: 640 }}>
      <h1 style={{ fontSize: "1.6rem", marginBottom: "0.35rem" }}>My Account</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>Signed in as a Shopecomira customer</p>

      <section
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          padding: "1.5rem",
          marginBottom: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "var(--accent-indigo)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <User size={22} />
          </div>
          <div>
            <p style={{ fontWeight: 700 }}>{user.fullName}</p>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Member since {new Date(user.createdAt).toLocaleDateString("en-IN")}</p>
          </div>
        </div>
        <p style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
          <Mail size={16} /> {user.email}
        </p>
        <p style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)" }}>
          <Phone size={16} /> {user.phone}
        </p>
      </section>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <Link to="/track-order" className="btn-secondary" style={{ height: 46, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", textDecoration: "none" }}>
          <Package size={18} /> Track orders
        </Link>
        <button type="button" className="btn-primary" style={{ height: 46 }} onClick={handleLogout}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <LogOut size={18} /> Log out
          </span>
        </button>
      </div>
    </div>
  );
}
