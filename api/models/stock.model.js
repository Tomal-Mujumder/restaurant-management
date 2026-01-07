import mongoose from "mongoose";

const stockSchema = new mongoose.Schema(
  {
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodItem",
      required: true,
      unique: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    minThreshold: {
      type: Number,
      default: 10,
    },
    maxThreshold: {
      type: Number,
      default: 100,
    },
    costPerUnit: {
      type: Number,
      default: 0,
    },
    lastRestocked: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Stock = mongoose.model("Stock", stockSchema);

export default Stock;
