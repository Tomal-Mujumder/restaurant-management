import PurchaseOrder from "../models/purchaseOrder.model.js";
import Stock from "../models/stock.model.js";
import StockTransaction from "../models/stockTransaction.model.js";
import { errorHandler } from "../utils/error.js";

// 1. Create Purchase Order
export const createPurchaseOrder = async (req, res, next) => {
  if (req.user.role !== "Manager") {
    return next(errorHandler(403, "You are not allowed to create orders"));
  }

  try {
    const newOrder = new PurchaseOrder({
      ...req.body,
      orderedBy: req.user.id,
    });
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    next(error);
  }
};

// 2. Get All Orders
export const getAllOrders = async (req, res, next) => {
  if (req.user.role !== "Manager") {
    return next(errorHandler(403, "Access denied"));
  }
  try {
    const orders = await PurchaseOrder.find()
      .populate("supplierId")
      .populate("items.foodId")
      .populate("orderedBy", "username"); // Populate orderedBy with username
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

// 3. Get Order By ID
export const getOrderById = async (req, res, next) => {
  if (req.user.role !== "Manager") {
    return next(errorHandler(403, "Access denied"));
  }
  try {
    const order = await PurchaseOrder.findById(req.params.id)
      .populate("supplierId")
      .populate("items.foodId")
      .populate("orderedBy", "username");
    if (!order) {
      return next(errorHandler(404, "Order not found"));
    }
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

// 4. Receive Order (Mark received, update stock, log transaction)
export const receiveOrder = async (req, res, next) => {
  if (req.user.role !== "Manager") {
    return next(errorHandler(403, "You are not allowed to receive orders"));
  }

  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      return next(errorHandler(404, "Order not found"));
    }

    if (order.status !== "pending") {
      return next(errorHandler(400, "Order is not in pending status"));
    }

    // Update order status
    order.status = "received";
    order.receivedDate = Date.now();
    await order.save();

    // Update stock and log transactions for each item
    for (const item of order.items) {
      let stock = await Stock.findOne({ foodId: item.foodId });

      // If stock doesn't exist, create it
      if (!stock) {
        stock = new Stock({
          foodId: item.foodId,
          quantity: 0,
          costPerUnit: item.unitCost, // Initialize cost
        });
      }

      const previousQty = stock.quantity;
      stock.quantity += item.quantity;
      stock.lastRestocked = Date.now();
      stock.costPerUnit = item.unitCost; // Update latest cost
      await stock.save();

      // Log transaction
      const transaction = new StockTransaction({
        foodId: item.foodId,
        transactionType: "restock", // or 'purchase'
        quantity: item.quantity,
        previousQty: previousQty,
        newQty: stock.quantity,
        reason: `Purchase Order ${order.orderId}`,
        performedBy: req.user.id,
      });
      await transaction.save();
    }

    res
      .status(200)
      .json({ message: "Order received and stock updated", order });
  } catch (error) {
    next(error);
  }
};

// 5. Cancel Order
export const cancelOrder = async (req, res, next) => {
  if (req.user.role !== "Manager") {
    return next(errorHandler(403, "You are not allowed to cancel orders"));
  }

  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      return next(errorHandler(404, "Order not found"));
    }

    if (order.status !== "pending") {
      return next(errorHandler(400, "Can only cancel pending orders"));
    }

    order.status = "cancelled";
    await order.save();
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};
