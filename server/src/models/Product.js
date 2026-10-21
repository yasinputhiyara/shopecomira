import mongoose from "mongoose";

const optionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },  // e.g. Color, Size
    value: { type: String, required: true, trim: true }, // e.g. Midnight Black, 128GB
  },
  { _id: false }
);

const variantSchema = new mongoose.Schema({
  sku: { type: String, required: true, trim: true, uppercase: true },
  options: { type: [optionSchema], default: [] },
  mrpPaise: { type: Number, required: true, min: 0 },
  sellingPricePaise: { type: Number, required: true, min: 1 },
  stockQuantity: { type: Number, default: 0, min: 0 },
});

const specificationSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    brand: { type: String, trim: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    shortDescription: { type: String, trim: true, maxlength: 300 },
    description: { type: String, trim: true },
    highlights: [{ type: String, trim: true }],
    specifications: [specificationSchema],
    images: [{ url: { type: String, required: true }, altText: String, publicId: String }],

    hsnCode: { type: String, required: true, trim: true },
    gstRate: { type: Number, required: true, enum: [0, 5, 12, 18, 28] },
    gstExempt: { type: Boolean, default: false },
    priceIncludesGst: { type: Boolean, default: true },

    codEligible: { type: Boolean, default: true },
    returnWindowDays: { type: Number, default: 7 },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 35 },

    variants: {
      type: [variantSchema],
      validate: {
        validator: (items) => items.length > 0,
        message: "Add at least one product variant.",
      },
    },

    status: {
      type: String,
      enum: ["draft", "active", "archived", "blocked"],
      default: "active",
    },
    isTrending: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Helpful virtuals
productSchema.virtual("defaultVariant").get(function () {
  return this.variants && this.variants.length > 0 ? this.variants[0] : null;
});

const Product = mongoose.model("Product", productSchema);

export default Product;