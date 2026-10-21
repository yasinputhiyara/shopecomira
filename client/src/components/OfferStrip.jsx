import React from "react";
import { CreditCard, PackageCheck, Percent, Zap } from "lucide-react";

export default function OfferStrip({ onApplyCoupon }) {
  return (
    <div className="container">
      <div className="offers-banner-strip">
        <div className="offer-feature-card">
          <div className="offer-card-icon prepaid">
            <CreditCard size={22} />
          </div>
          <div className="offer-card-text">
            <h4>5% Instant Prepaid Discount</h4>
            <p>Applied automatically when you choose UPI, Cards or Netbanking at checkout.</p>
          </div>
        </div>

        <div className="offer-feature-card">
          <div className="offer-card-icon multi">
            <PackageCheck size={22} />
          </div>
          <div className="offer-card-text">
            <h4>Multi-Buy Super Saver</h4>
            <p>Buy 2 items save 10%, buy 3 or more save 15% across all trending products.</p>
          </div>
        </div>

        <div
          className="offer-feature-card"
          style={{ cursor: "pointer" }}
          onClick={() => onApplyCoupon && onApplyCoupon("WELCOME10")}
          title="Click to copy WELCOME10"
        >
          <div className="offer-card-icon coupon">
            <Percent size={22} />
          </div>
          <div className="offer-card-text">
            <h4>10% Off: Code WELCOME10</h4>
            <p>Save 10% on your order above ₹499. Click to auto-apply in your cart.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
