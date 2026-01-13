import Payment from "../models/Payment.model.js";
import { errorHandler } from "../utils/error.js";

// Get all orders (Admin/Manager only)
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Payment.find()
      .populate("userId", "username email contactNumber name")
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching all orders:", error);
    next(errorHandler(500, "Failed to retrieve orders"));
  }
};

// Get single order details (Admin/Manager only)
export const getOrderById = async (req, res, next) => {
  const { orderId } = req.params;

  try {
    const order = await Payment.findById(orderId).populate(
      "userId",
      "username email contactNumber name"
    );

    if (!order) {
      return next(errorHandler(404, "Order not found"));
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order details:", error);
    next(errorHandler(500, "Failed to retrieve order details"));
  }
};
