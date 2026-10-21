import mongoose from "mongoose";

const inventoryMovementSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    sku: { type: String, required: true },
    quantityChange: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    reason: {
      type: String,
      enum: ["order_placed", "order_cancelled", "restock", "manual_adjustment", "return_restocked"],
      required: true,
    },
    referenceId: { type: String },
    performedBy: { type: String, default: "system" },
  },
  { timestamps: true }
);

const InventoryMovement = mongoose.model(
  "InventoryMovement",
  inventoryMovementSchema
);

export default InventoryMovement;
