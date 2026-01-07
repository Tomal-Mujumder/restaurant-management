import mongoose from "mongoose";

const purchaseOrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    items: [
      {
        foodId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "FoodItem",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        unitCost: {
          type: Number,
          required: true,
        },
      },
    ],
    orderedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "received", "cancelled"],
      default: "pending",
    },
    totalCost: {
      type: Number,
    },
    receivedDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

const PurchaseOrder = mongoose.model("PurchaseOrder", purchaseOrderSchema);

export default PurchaseOrder;
