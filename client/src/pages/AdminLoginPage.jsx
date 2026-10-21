import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, Sparkles, ArrowLeft, AlertCircle, ShieldCheck } from "lucide-react";
import { api } from "../services/api.js";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@shopecomira.com");
  const [password, setPassword] = useState("Admin@12345");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  // Check if admin is already logged in
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await api.adminMe();
        if (res?.admin) {
          navigate("/admin", { replace: true });
          return;
        }
      } catch {
        // Not logged in
      } finally {
        setChecking(false);
      }
    }
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.adminLogin(email, password);
      if (res?.admin) {
        navigate("/admin", { replace: true });
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || "Invalid email or password. Please try again.");
    }
  };

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-main)" }}>
        <div style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Verifying session...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at 50% 20%, #151d30 0%, #090d16 100%)",
        padding: "1.5rem",
        position: "relative",
      }}
    >
      {/* Return to Storefront button */}
      <Link
        to="/"
        style={{
          position: "absolute",
          top: "24px",
          left: "24px",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          color: "var(--text-secondary)",
          fontSize: "0.85rem",
          fontWeight: 500,
          padding: "0.5rem 0.9rem",
          borderRadius: "var(--radius-md)",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <ArrowLeft size={16} />
        <span>Return to Storefront</span>
      </Link>

      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-medium)",
          borderRadius: "var(--radius-lg)",
          padding: "2.5rem 2rem",
          boxShadow: "var(--shadow-lg)",
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Brand & Lock Badge */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "14px",
              background: "linear-gradient(135deg, #6366f1 0%, #10b981 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              margin: "0 auto 1rem",
              boxShadow: "0 4px 16px var(--accent-indigo-glow)",
            }}
          >
            <Lock size={26} />
          </div>

          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.35rem" }}>
            Admin Portal Sign In
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            Shopecomira Commerce Operations
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "var(--accent-rose-bg)",
              border: "1px solid rgba(244, 63, 94, 0.3)",
              color: "var(--accent-rose)",
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.82rem",
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <input
              type="email"
              required
              autoFocus
              className="form-control"
              placeholder="admin@shopecomira.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: "1.5rem" }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%", height: 46, fontSize: "0.95rem" }}
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign In to Admin"}
          </button>
        </form>

        {/* Credentials Reminder */}
        <div
          style={{
            background: "var(--bg-main)",
            border: "1px dashed var(--border-medium)",
            borderRadius: "var(--radius-sm)",
            padding: "0.85rem",
            marginTop: "1.75rem",
            fontSize: "0.78rem",
            color: "var(--text-muted)",
          }}
        >
          <strong style={{ color: "var(--text-secondary)" }}>Default Admin Credentials:</strong>
          <div style={{ marginTop: "0.35rem" }}>Email: <code style={{ color: "#fff" }}>admin@shopecomira.com</code></div>
          <div style={{ marginTop: "0.2rem" }}>Password: <code style={{ color: "#fff" }}>Admin@12345</code></div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.72rem", marginTop: "1.25rem" }}>
          <ShieldCheck size={14} color="var(--accent-emerald)" />
          <span>Restricted Store Staff Access</span>
        </div>
      </div>
    </div>
  );
}
