import mongoose from "mongoose";

const stockTransactionSchema = new mongoose.Schema({
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FoodItem",
    required: true,
  },
  transactionType: {
    type: String,
    enum: ["purchase", "sale", "adjustment", "waste", "restock"],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  previousQty: {
    type: Number,
    required: true,
  },
  newQty: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "performedByModel",
  },
  performedByModel: {
    type: String,
    required: true,
    enum: ["User", "Employee"],
    default: "Employee",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const StockTransaction = mongoose.model(
  "StockTransaction",
  stockTransactionSchema
);

export default StockTransaction;
