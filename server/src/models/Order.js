import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantSku: { type: String, required: true },
    productName: { type: String, required: true },
    options: [{ name: String, value: String }],
    imageUrl: { type: String },
    mrpPaise: { type: Number, required: true },
    sellingPricePaise: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    hsnCode: { type: String, required: true },
    gstRate: { type: Number, required: true },
    lineTotalPaise: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    customer: {
      fullName: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, required: true, trim: true },
    },
    shippingAddress: {
      fullName: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      street: { type: String, required: true, trim: true },
      landmark: { type: String, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      pincode: { type: String, required: true, trim: true },
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (items) => items.length > 0,
        message: "Order must have at least one item.",
      },
    },
    pricing: {
      subtotalPaise: { type: Number, required: true },
      multiItemDiscountPaise: { type: Number, default: 0 },
      couponCode: { type: String, uppercase: true, trim: true },
      couponDiscountPaise: { type: Number, default: 0 },
      prepaidDiscountPaise: { type: Number, default: 0 },
      shippingFeePaise: { type: Number, default: 0 },
      codFeePaise: { type: Number, default: 0 },
      taxAmountPaise: { type: Number, default: 0 },
      totalPaise: { type: Number, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ["prepaid", "cod"],
      required: true,
    },
    paymentDetails: {
      gateway: { type: String, default: "razorpay" },
      razorpayOrderId: { type: String },
      razorpayPaymentId: { type: String },
      razorpaySignature: { type: String },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
      paidAt: { type: Date },
      failedAt: { type: Date },
      failureReason: { type: String },
      errorCode: { type: String },
      errorDescription: { type: String },
    },
    orderStatus: {
      type: String,
      enum: [
        "pending_payment",
        "confirmed",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "return_requested",
        "returned",
        "refunded",
      ],
      default: "confirmed",
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        note: { type: String },
        changedBy: { type: String, default: "system" },
      },
    ],
    tracking: {
      courierName: { type: String, trim: true },
      trackingNumber: { type: String, trim: true },
      trackingUrl: { type: String, trim: true },
      dispatchedAt: { type: Date },
    },
    invoiceNumber: { type: String, trim: true },
    invoiceDate: { type: Date },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
