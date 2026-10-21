import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Sparkles, AlertCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { safeRedirectPath } from "../utils/authRedirect.js";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = safeRedirectPath(searchParams.get("redirect") || "/");
  const { login, isAuthenticated, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, redirectTo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login({ email, password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
        Checking session...
      </div>
    );
  }

  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1.25rem" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--bg-surface)",
          border: "1px solid var(--border-medium)",
          borderRadius: "var(--radius-lg)",
          padding: "2.25rem 2rem",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "linear-gradient(135deg, #6366f1 0%, #10b981 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              margin: "0 auto 1rem",
            }}
          >
            <Lock size={26} />
          </div>
          <h2 style={{ fontSize: "1.45rem", marginBottom: "0.35rem" }}>Sign in to Shopecomira</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            Log in to complete your purchase
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
            <label className="form-label">Email</label>
            <input
              type="email"
              required
              autoFocus
              className="form-control"
              placeholder="you@email.com"
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
          <button type="submit" className="btn-primary" style={{ width: "100%", height: 46 }} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          New here?{" "}
          <Link to={`/register?redirect=${encodeURIComponent(redirectTo)}`} style={{ color: "var(--accent-indigo)" }}>
            Create an account
          </Link>
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.72rem", marginTop: "1rem" }}>
          <ShieldCheck size={14} color="var(--accent-emerald)" />
          <span>Secure customer login</span>
        </div>
        <p style={{ textAlign: "center", marginTop: "0.75rem" }}>
          <Link to="/" style={{ color: "var(--text-muted)", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
            <Sparkles size={14} /> Continue browsing
          </Link>
        </p>
      </div>
    </div>
  );
}
