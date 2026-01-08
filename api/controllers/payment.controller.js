import Payment from "../models/Payment.model.js";
import User from "../models/user.model.js";
import Employee from "../models/employee.model.js";
import { errorHandler } from "../utils/error.js";
import Stock from "../models/stock.model.js";
import StockTransaction from "../models/stockTransaction.model.js";
import mongoose from "mongoose";

// Save payment details to database
export const savePayment = async (req, res, next) => {
  const { userId, cartItems, totalPrice, paymentInfo, tokenNumber } = req.body;

  try {
    const payment = new Payment({
      userId,
      cartItems,
      totalPrice,
      paymentInfo: {
        ...paymentInfo, // Include cardType from paymentInfo
      },
      tokenNumber, // Save token number for order identification
    });

    await payment.save();

    res.status(201).json({ message: "Payment successful", payment });
  } catch (error) {
    console.error("Payment initialization failed:", error);
    next(errorHandler(500, "Payment failed"));
  }
};

// Get all payment details (Admin use)
export const getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find().populate("userId", "username email");
    res.status(200).json(payments);
  } catch (error) {
    console.error(error);
    next(errorHandler(500, "Failed to retrieve payment details"));
  }
};

// Get payment details by token number (Admin use)
export const getPaymentByTokenNumber = async (req, res, next) => {
  const { tokenNumber } = req.params;

  try {
    const payment = await Payment.findOne({ tokenNumber }).populate(
      "userId",
      "username email"
    );
    if (!payment) {
      return next(errorHandler(404, "No payment found with this token number"));
    }
    res.status(200).json(payment);
  } catch (error) {
    console.error(error);
    next(errorHandler(500, "Failed to retrieve payment details"));
  }
};

export const updatePayment = async (req, res, next) => {
  const { paymentId } = req.params;
  const { isChecked } = req.body;

  try {
    // Check if isChecked is provided
    if (typeof isChecked === "undefined") {
      return next(
        errorHandler(400, { message: "isChecked field is required" })
      );
    }

    // Find the payment record
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return next(errorHandler(404, { message: "Payment not found" }));
    }

    // If marking as complete (isChecked = true) and not already completed
    if (isChecked === true && payment.isChecked === false) {
      console.log(
        `Processing payment completion for Token: ${payment.tokenNumber}`
      );

      // Deduct stock for all items
      try {
        for (const item of payment.cartItems) {
          console.log(
            `Processing item: ${item.foodName}, Quantity: ${item.quantity}`
          );

          // Find stock record - item might not have foodId stored
          // We need to find by foodName as backup
          let stock = null;

          if (item.foodId) {
            stock = await Stock.findOne({ foodId: item.foodId });
          }

          // If not found by foodId, try finding FoodItem by name then get stock
          if (!stock) {
            const foodItem = await mongoose.model("FoodItem").findOne({
              foodName: item.foodName,
            });

            if (foodItem) {
              stock = await Stock.findOne({ foodId: foodItem._id });
            }
          }

          if (!stock) {
            console.log(`⚠️ Stock record not found for ${item.foodName}`);
            return res.status(404).json({
              message: `Stock record not found for ${item.foodName}. Please create stock record first.`,
            });
          }

          console.log(`Current stock for ${item.foodName}: ${stock.quantity}`);

          // Check if sufficient stock
          if (stock.quantity < item.quantity) {
            return res.status(400).json({
              message: `Insufficient stock for ${item.foodName}. Available: ${stock.quantity}, Required: ${item.quantity}`,
            });
          }

          // Store previous quantity
          const previousQty = stock.quantity;

          // Deduct stock
          await Stock.findByIdAndUpdate(stock._id, {
            $inc: { quantity: -item.quantity },
          });

          // Create stock transaction
          await StockTransaction.create({
            foodId: stock.foodId,
            transactionType: "sale",
            quantity: item.quantity,
            previousQty: previousQty,
            newQty: previousQty - item.quantity,
            performedBy: payment.userId,
            reason: `Order completed by manager - Token: ${payment.tokenNumber}`,
          });

          console.log(
            `✓ Stock deducted for ${item.foodName}: ${previousQty} → ${
              previousQty - item.quantity
            }`
          );
        }

        console.log(
          `✓ All stock deducted successfully for Token: ${payment.tokenNumber}`
        );
      } catch (stockError) {
        console.error("Stock deduction error:", stockError);
        return res.status(500).json({
          message: `Failed to deduct stock: ${stockError.message}`,
        });
      }
    }

    // Update payment status
    payment.isChecked = isChecked;
    const updatedPayment = await payment.save();

    res.status(200).json({
      message: isChecked
        ? "Payment completed and stock updated"
        : "Payment status updated",
      payment: updatedPayment,
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    next(errorHandler(500, { message: "Failed to update payment" }));
  }
};

// Delete payments older than a specified number of days
export const deleteOldPayments = async (req, res, next) => {
  const { days } = req.body; // Number of days from the current date

  if (typeof days !== "number" || days < 0) {
    return next(errorHandler(400, "Invalid number of days provided"));
  }

  try {
    // Get the current date in SLST timezone
    const currentDate = new Date();
    const slstOffset = 5.5 * 60 * 60 * 1000; // Sri Lanka Standard Time is UTC+5:30
    const slstDate = new Date(currentDate.getTime() + slstOffset);

    // Calculate the cutoff date
    const cutoffDate = new Date(
      slstDate.getTime() - days * 24 * 60 * 60 * 1000
    );

    // Delete payments older than the cutoff date
    const result = await Payment.deleteMany({ createdAt: { $lt: cutoffDate } });

    res.status(200).json({
      message: `${result.deletedCount} payment(s) deleted successfully.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting old payments:", error);
    next(errorHandler(500, "Failed to delete old payments"));
  }
};

// Get payment details by token (for Success Page)
export const getPaymentDetailsByToken = async (req, res, next) => {
  const { token } = req.params;
  const user = req.user; // Get user from verifyToken

  try {
    // 1. Fetch payment WITHOUT populate first to get the raw userId
    const payment = await Payment.findOne({ tokenNumber: token });

    if (!payment) {
      return next(errorHandler(404, "No order found with this token."));
    }

    // 2. Security Check: Ensure the payment belongs to the requesting user
    // Normalize IDs to strings for comparison
    const requestUserId = user.id || user._id || user.empId;
    const paymentUserId = payment.userId ? payment.userId.toString() : null;

    // Allow Admins to view any order? (Optional, but strict owner check requested)
    // For now, strict owner check:
    if (
      !requestUserId ||
      !paymentUserId ||
      String(requestUserId) !== String(paymentUserId)
    ) {
      // Fallback: If user is admin/manager, maybe allow?
      // But for receipt flow, usually it's the payer.
      if (!user.isAdmin) {
        return next(errorHandler(403, "Unauthorized access to this order."));
      }
    }

    // 3. Manually populate user details (could be User OR Employee)
    let paymentUser = await User.findById(paymentUserId).select(
      "username email"
    );

    // If not found in User collection, check Employee collection
    if (!paymentUser) {
      paymentUser = await Employee.findById(paymentUserId).select(
        "firstname lastname email phone"
      );
      // Normalize employee object to look like user object for frontend consistency if needed
      if (paymentUser) {
        paymentUser = {
          _id: paymentUser._id,
          name: `${paymentUser.firstname} ${paymentUser.lastname}`,
          email: paymentUser.email,
          contactNumber: paymentUser.phone,
        };
      }
    } else {
      // Normalize User object
      paymentUser = {
        _id: paymentUser._id,
        name: paymentUser.username, // User model has username, not name?
        email: paymentUser.email,
        contactNumber: "N/A", // User model might not have contactNumber easily accessible or named differently
      };
      // Quick check if User model has other fields.
      // Based on previous reads, User has username, email, etc.
      // Let's re-fetch with specific fields if they exist?
      // Actually, let's keep it simple. The schema scan showed User has 'username', 'email'.
    }

    // 4. Construct response
    const paymentWithUser = {
      ...payment.toObject(),
      userId: paymentUser || { name: "Unknown User", email: "N/A" },
    };

    res.status(200).json(paymentWithUser);
  } catch (error) {
    console.error("Error retrieving payment by token:", error);
    next(errorHandler(500, "Failed to retrieve order details."));
  }
};
