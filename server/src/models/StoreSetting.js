import mongoose from "mongoose";

const storeSettingSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "Shopecomira" },
    tagline: { type: String, default: "Fast-Moving & Trending Products" },
    legalBusinessName: { type: String, default: "Shopecomira Retail Enterprises Pvt Ltd" },
    gstin: { type: String, default: "27AABCU9603R1ZM" },
    pan: { type: String, default: "AABCU9603R" },
    registeredAddress: {
      type: String,
      default: "Suite 402, Commerce Hub, Bandra West, Mumbai, Maharashtra 400050",
    },
    state: { type: String, default: "Maharashtra" },
    stateCode: { type: String, default: "27" },
    supportEmail: { type: String, default: "support@shopecomira.com" },
    supportPhone: { type: String, default: "+91 98765 43210" },
    whatsappNumber: { type: String, default: "919876543210" }, // standard international format without plus
    whatsappDefaultMessage: {
      type: String,
      default: "Hello, I am interested in this product on Shopecomira:",
    },
    freeShippingThresholdPaise: { type: Number, default: 99900 }, // Free shipping above ₹999
    standardShippingFeePaise: { type: Number, default: 7000 },    // ₹70 shipping
    codFeePaise: { type: Number, default: 5000 },                 // ₹50 COD fee
    prepaidDiscountPercent: { type: Number, default: 5 },         // 5% extra discount for online payments
    invoicePrefix: { type: String, default: "INV" },
    currentInvoiceSequence: { type: Number, default: 1000 },
  },
  { timestamps: true }
);

const StoreSetting = mongoose.model("StoreSetting", storeSettingSchema);

export default StoreSetting;
