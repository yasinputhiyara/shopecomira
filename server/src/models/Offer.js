import mongoose from "mongoose";

const tierSchema = new mongoose.Schema(
  {
    minQuantity: { type: Number, required: true, min: 2 },
    discountPercent: { type: Number, required: true, min: 1, max: 100 },
  },
  { _id: false }
);

const offerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: {
      type: String,
      enum: ["prepaid", "multi_item", "cart_value", "coupon"],
      required: true,
    },
    code: {
      type: String,
      uppercase: true,
      trim: true,
      sparse: true,
    },
    discountPercent: { type: Number, min: 0, max: 100, default: 0 },
    discountPaise: { type: Number, min: 0, default: 0 },
    minCartPaise: { type: Number, min: 0, default: 0 },
    maxDiscountPaise: { type: Number, min: 0 },
    tiers: [tierSchema],
    isActive: { type: Boolean, default: true },
    usageCount: { type: Number, default: 0 },
    usageLimit: { type: Number },
    startsAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

const Offer = mongoose.model("Offer", offerSchema);

export default Offer;
