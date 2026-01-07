import Stock from "../models/stock.model.js";
import StockTransaction from "../models/stockTransaction.model.js";
import { errorHandler } from "../utils/error.js";

// 1. Get all food items with their stock levels (populate foodId details)
export const getAllStocks = async (req, res, next) => {
  try {
    const stocks = await Stock.find().populate("foodId");
    res.status(200).json(stocks);
  } catch (error) {
    next(error);
  }
};

// 2. Manual stock adjustment (Manager only)
export const updateStock = async (req, res, next) => {
  if (req.user.role !== "Manager") {
    return next(errorHandler(403, "You are not allowed to update stock"));
  }

  const { foodId } = req.params;
  const { quantity, reason } = req.body;

  if (quantity === undefined || quantity === null) {
    return next(errorHandler(400, "Quantity is required"));
  }

  try {
    let stock = await Stock.findOne({ foodId });

    // If stock record doesn't exist, create it (assuming 0 previous quantity)
    if (!stock) {
      stock = new Stock({
        foodId,
        quantity: 0,
      });
    }

    const previousQty = stock.quantity;
    const newQty = Number(quantity);
    const diff = newQty - previousQty;

    // Update stock
    stock.quantity = newQty;
    stock.lastRestocked = Date.now();
    await stock.save();

    // Log transaction
    const transaction = new StockTransaction({
      foodId,
      transactionType: "adjustment",
      quantity: Math.abs(diff),
      previousQty,
      newQty,
      reason: reason || "Manual adjustment",
      performedBy: req.user.id,
    });
    await transaction.save();

    res.status(200).json(stock);
  } catch (error) {
    next(error);
  }
};

// 3. Get stock details for a specific food item
export const getStockById = async (req, res, next) => {
  const { foodId } = req.params;

  try {
    const stock = await Stock.findOne({ foodId }).populate("foodId");
    if (!stock) {
      return next(errorHandler(404, "Stock nout found for this item"));
    }
    res.status(200).json(stock);
  } catch (error) {
    next(error);
  }
};

// 4. Update min/max thresholds for a food item
export const setThresholds = async (req, res, next) => {
  if (req.user.role !== "Manager") {
    return next(errorHandler(403, "You are not allowed to set thresholds"));
  }

  const { foodId } = req.params;
  const { minThreshold, maxThreshold } = req.body;

  try {
    const stock = await Stock.findOne({ foodId });
    if (!stock) {
      return next(errorHandler(404, "Stock record not found"));
    }

    if (minThreshold !== undefined) stock.minThreshold = minThreshold;
    if (maxThreshold !== undefined) stock.maxThreshold = maxThreshold;

    await stock.save();
    res.status(200).json(stock);
  } catch (error) {
    next(error);
  }
};

// 5. Get items where quantity < minThreshold
export const getLowStockItems = async (req, res, next) => {
  if (req.user.role !== "Manager") {
    return next(errorHandler(403, "Access denied"));
  }

  try {
    // MongoDB aggregation or find with $expr to compare fields
    // Since minThreshold is a field in the document, we use $expr with $lt
    const lowStockItems = await Stock.find({
      $expr: { $lt: ["$quantity", "$minThreshold"] },
    }).populate("foodId");

    res.status(200).json(lowStockItems);
  } catch (error) {
    next(error);
  }
};
