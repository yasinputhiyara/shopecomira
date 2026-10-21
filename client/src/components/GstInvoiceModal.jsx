import React from "react";
import { X, Printer, Download } from "lucide-react";

export default function GstInvoiceModal({ invoiceData, onClose }) {
  if (!invoiceData) return null;

  const inv = invoiceData.invoice || invoiceData;
  const seller = inv.seller || {
    name: "Shopecomira Retail Enterprises Pvt Ltd",
    gstin: "27AABCU9603R1ZM",
    pan: "AABCU9603R",
    address: "Suite 402, Commerce Hub, Bandra West, Mumbai, Maharashtra 400050",
    state: "Maharashtra",
    stateCode: "27",
  };

  const buyer = inv.buyer || {
    name: inv.shippingAddress?.fullName,
    phone: inv.shippingAddress?.phone,
    address: `${inv.shippingAddress?.street}, ${inv.shippingAddress?.city}, ${inv.shippingAddress?.state} - ${inv.shippingAddress?.pincode}`,
    state: inv.shippingAddress?.state,
  };

  const items = inv.items || [];
  const pricing = inv.pricing || {};
  const isIntraState = inv.isIntraState !== undefined ? inv.isIntraState : true;

  const totalAmountRs = (pricing.totalPaise || 0) / 100;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 880, background: "#fff", color: "#111827", padding: "2rem" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        {/* Modal Top Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }} className="no-print">
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={handlePrint}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                background: "#4f46e5",
                color: "#fff",
                fontWeight: 600,
                fontSize: "0.85rem",
              }}
            >
              <Printer size={16} />
              <span>Print Invoice</span>
            </button>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f3f4f6",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={18} color="#374151" />
          </button>
        </div>

        {/* Printable Tax Invoice Container */}
        <div className="invoice-container" style={{ padding: 0 }}>
          {/* Header */}
          <div className="invoice-header">
            <div>
              <h1 className="invoice-title" style={{ fontSize: "1.6rem", color: "#111827" }}>
                TAX INVOICE
              </h1>
              <div style={{ fontSize: "0.82rem", color: "#6b7280", marginTop: "0.2rem" }}>
                (Original for Recipient)
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#111827" }}>
                {seller.name}
              </div>
              <div style={{ fontSize: "0.82rem", color: "#4b5563" }}>
                GSTIN: <strong>{seller.gstin}</strong> | PAN: {seller.pan}
              </div>
              <div style={{ fontSize: "0.78rem", color: "#6b7280", maxWidth: 300, marginLeft: "auto" }}>
                {seller.address}
              </div>
            </div>
          </div>

          {/* Reference Meta Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1.5rem",
              background: "#f9fafb",
              padding: "1rem",
              borderRadius: "6px",
              border: "1px solid #e5e7eb",
              marginBottom: "1.5rem",
              fontSize: "0.85rem",
            }}
          >
            <div>
              <div style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 600 }}>
                Invoice Details
              </div>
              <div style={{ marginTop: "0.25rem" }}>
                Invoice Number: <strong>{inv.invoiceNumber}</strong>
              </div>
              <div>
                Invoice Date: <strong>{new Date(inv.invoiceDate || Date.now()).toLocaleDateString("en-IN")}</strong>
              </div>
              <div>
                Order ID: <strong>{inv.orderNumber}</strong>
              </div>
              <div>
                Payment Status: <strong>{(inv.paymentStatus || inv.paymentDetails?.status || "pending").toUpperCase()} ({inv.paymentMethod?.toUpperCase()})</strong>
              </div>
              {inv.paymentDetails?.razorpayPaymentId && (
                <div style={{ fontSize: "0.8rem", color: "#4b5563" }}>
                  Razorpay Txn Ref: <strong style={{ fontFamily: "monospace" }}>{inv.paymentDetails.razorpayPaymentId}</strong>
                </div>
              )}
            </div>

            <div>
              <div style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 600 }}>
                Billed / Shipped To
              </div>
              <div style={{ fontWeight: 700, marginTop: "0.25rem" }}>{buyer.name}</div>
              <div>{buyer.address}</div>
              <div>Mobile: +91 {buyer.phone}</div>
              <div>Place of Supply: {buyer.state}</div>
            </div>
          </div>

          {/* Items Table */}
          <table className="invoice-table">
            <thead>
              <tr>
                <th style={{ width: "35%" }}>Description of Goods</th>
                <th>HSN</th>
                <th>Qty</th>
                <th>Rate (₹)</th>
                <th>Taxable Val (₹)</th>
                {isIntraState ? (
                  <>
                    <th>CGST (₹)</th>
                    <th>SGST (₹)</th>
                  </>
                ) : (
                  <th>IGST (₹)</th>
                )}
                <th>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const taxRate = item.gstRate || 18;
                const lineTotalRs = (item.lineTotalPaise || 0) / 100;
                const taxableValRs = item.taxableValuePaise
                  ? item.taxableValuePaise / 100
                  : Math.round(lineTotalRs / (1 + taxRate / 100));
                const totalTaxRs = lineTotalRs - taxableValRs;

                return (
                  <tr key={idx}>
                    <td>
                      <strong>{item.productName}</strong>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                        SKU: {item.variantSku}
                      </div>
                    </td>
                    <td>{item.hsnCode || "8518"}</td>
                    <td>{item.quantity}</td>
                    <td>{((item.sellingPricePaise || 0) / 100).toFixed(2)}</td>
                    <td>{taxableValRs.toFixed(2)}</td>
                    {isIntraState ? (
                      <>
                        <td>{(totalTaxRs / 2).toFixed(2)} ({taxRate / 2}%)</td>
                        <td>{(totalTaxRs / 2).toFixed(2)} ({taxRate / 2}%)</td>
                      </>
                    ) : (
                      <td>{totalTaxRs.toFixed(2)} ({taxRate}%)</td>
                    )}
                    <td style={{ fontWeight: 600 }}>{lineTotalRs.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Financial Totals */}
          <div style={{ display: "flex", justifyContent: "flex-end", margin: "1rem 0" }}>
            <div style={{ width: 320, fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0" }}>
                <span>Subtotal (MRP/Gross):</span>
                <span>₹{((pricing.subtotalPaise || 0) / 100).toFixed(2)}</span>
              </div>
              {pricing.multiItemDiscountPaise > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0", color: "#059669" }}>
                  <span>Multi-Item Discount:</span>
                  <span>-₹{(pricing.multiItemDiscountPaise / 100).toFixed(2)}</span>
                </div>
              )}
              {pricing.couponDiscountPaise > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0", color: "#059669" }}>
                  <span>Coupon Discount:</span>
                  <span>-₹{(pricing.couponDiscountPaise / 100).toFixed(2)}</span>
                </div>
              )}
              {pricing.prepaidDiscountPaise > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0", color: "#059669" }}>
                  <span>Prepaid 5% Online Discount:</span>
                  <span>-₹{(pricing.prepaidDiscountPaise / 100).toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0" }}>
                <span>Shipping & Delivery:</span>
                <span>{pricing.shippingFeePaise === 0 ? "FREE" : `₹${(pricing.shippingFeePaise / 100).toFixed(2)}`}</span>
              </div>
              {pricing.codFeePaise > 0 && inv.paymentMethod === "cod" && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0" }}>
                  <span>COD Handling Fee:</span>
                  <span>₹{(pricing.codFeePaise / 100).toFixed(2)}</span>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.6rem 0",
                  borderTop: "2px solid #111827",
                  borderBottom: "2px solid #111827",
                  fontWeight: 800,
                  fontSize: "1.05rem",
                  marginTop: "0.5rem",
                }}
              >
                <span>Total Invoice Value:</span>
                <span>₹{totalAmountRs.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Declaration */}
          <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1rem", marginTop: "2rem", fontSize: "0.75rem", color: "#6b7280", display: "flex", justifyContent: "space-between" }}>
            <div>
              <strong>Declaration:</strong>
              <div>This is a computer-generated GST tax invoice and does not require a physical signature.</div>
              <div>Goods once sold can be returned within 7 days in accordance with the store return policy.</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <strong>For {seller.name}</strong>
              <div style={{ marginTop: "2rem" }}>Authorized Signatory</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
