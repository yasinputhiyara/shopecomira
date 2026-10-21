import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Sparkles, AlertCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { safeRedirectPath } from "../utils/authRedirect.js";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = safeRedirectPath(searchParams.get("redirect") || "/");
  const { sendRegisterOtp, verifyRegisterOtp, resendRegisterOtp, isAuthenticated, loading: authLoading } = useAuth();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [retryAfter, setRetryAfter] = useState(0);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, redirectTo]);

  useEffect(() => {
    if (retryAfter <= 0) return undefined;
    const timer = setInterval(() => {
      setRetryAfter((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [retryAfter]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const res = await sendRegisterOtp(form);
      setStep(2);
      setRetryAfter(res.retryAfterSeconds || 60);
      setInfo(
        res.delivered
          ? `We sent a 6-digit code to ${form.email}.`
          : `Code generated for ${form.email}. Check the server console if the email did not arrive.`
      );
    } catch (err) {
      setError(err.message || "Could not send verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await verifyRegisterOtp({ email: form.email, otp });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (retryAfter > 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await resendRegisterOtp(form.email);
      setRetryAfter(res.retryAfterSeconds || 60);
      setInfo(
        res.delivered
          ? "A new code was sent to your email."
          : "A new code was generated. Check the server console if the email did not arrive."
      );
    } catch (err) {
      setError(err.message || "Could not resend code.");
      if (err.message?.includes("wait")) {
        const seconds = Number(err.message.match(/\d+/)?.[0]);
        if (seconds) setRetryAfter(seconds);
      }
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
          maxWidth: 440,
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
            <Mail size={26} />
          </div>
          <h2 style={{ fontSize: "1.45rem", marginBottom: "0.35rem" }}>
            {step === 1 ? "Create your account" : "Verify your email"}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            {step === 1 ? "You will receive a 6-digit OTP to confirm your email." : `Enter the code sent to ${form.email}`}
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

        {info && !error && (
          <div
            style={{
              background: "var(--accent-emerald-bg)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "var(--accent-emerald)",
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.82rem",
              marginBottom: "1.25rem",
            }}
          >
            {info}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input
                type="text"
                required
                className="form-control"
                placeholder="Your full name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                required
                className="form-control"
                placeholder="you@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                required
                maxLength={10}
                className="form-control"
                placeholder="10-digit mobile"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label className="form-label">Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="form-control"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ width: "100%", height: 46 }} disabled={loading}>
              {loading ? "Sending code..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <div className="form-group" style={{ marginBottom: "1.25rem" }}>
              <label className="form-label">6-digit code</label>
              <input
                type="text"
                required
                inputMode="numeric"
                maxLength={6}
                autoFocus
                className="form-control"
                placeholder="••••••"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                style={{ letterSpacing: "0.35em", fontWeight: 700, textAlign: "center", fontSize: "1.15rem" }}
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%", height: 46 }}
              disabled={loading || otp.length !== 6}
            >
              {loading ? "Verifying..." : "Verify & Create Account"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ width: "100%", height: 42, marginTop: "0.75rem" }}
              disabled={loading || retryAfter > 0}
              onClick={handleResend}
            >
              {retryAfter > 0 ? `Resend OTP in ${retryAfter}s` : "Resend OTP"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp("");
                setError("");
                setInfo("");
              }}
              style={{
                width: "100%",
                marginTop: "0.75rem",
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: "0.82rem",
              }}
            >
              Change email or details
            </button>
          </form>
        )}

        <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link to={`/login?redirect=${encodeURIComponent(redirectTo)}`} style={{ color: "var(--accent-indigo)" }}>
            Sign in
          </Link>
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.72rem", marginTop: "1rem" }}>
          <ShieldCheck size={14} color="var(--accent-emerald)" />
          <span>OTP expires in 10 minutes</span>
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
