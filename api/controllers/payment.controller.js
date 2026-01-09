import Payment from "../models/Payment.model.js";
import User from "../models/user.model.js";
import Employee from "../models/employee.model.js";
import { errorHandler } from "../utils/error.js";
import Stock from "../models/stock.model.js";
import StockTransaction from "../models/stockTransaction.model.js";
import mongoose from "mongoose";

// Save payment details to database
export const savePayment = async (req, res, next) => {
  const {
    userId,
    cartItems,
    totalPrice,
    paymentInfo,
    tokenNumber,
    shipmentData,
  } = req.body;

  try {
    const payment = new Payment({
      userId,
      cartItems,
      totalPrice,
      paymentInfo: {
        ...paymentInfo, // Include cardType from paymentInfo
      },
      shipmentData, // Save shipment data
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

    // DEBUG: Log req.user to see what's available
    console.log("=== DEBUG: req.user contents ===");
    console.log("Full req.user:", JSON.stringify(req.user, null, 2));
    console.log("req.user.username:", req.user?.username);
    console.log("req.user.email:", req.user?.email);
    console.log("req.user.empId:", req.user?.empId);
    console.log("req.user.name:", req.user?.name);
    console.log("req.user.role:", req.user?.role);
    console.log("================================");

    // Extract manager info with multiple fallbacks
    let managerInfo = "Unknown";

    if (req.user) {
      managerInfo =
        req.user.username || req.user.name || req.user.email || "Manager";

      console.log(`Manager performing action: ${managerInfo}`);
    } else {
      console.log(
        "WARNING: req.user is undefined! Check verifyToken middleware."
      );
    }

    // ========== MARKING AS COMPLETE (Deduct Stock) ==========
    if (isChecked === true && payment.isChecked === false) {
      console.log(
        `✓ Processing payment completion for Token: ${payment.tokenNumber}`
      );

      try {
        for (const item of payment.cartItems) {
          console.log(
            `Processing item: ${item.foodName}, Quantity: ${item.quantity}`
          );

          // Find stock record
          let stock = null;

          if (item.foodId) {
            stock = await Stock.findOne({ foodId: item.foodId });
          }

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

          // DEDUCT stock
          await Stock.findByIdAndUpdate(stock._id, {
            $inc: { quantity: -item.quantity },
          });

          // Before creating transaction, log what will be saved
          console.log("=== About to create StockTransaction ===");
          console.log("performedBy value:", managerInfo);
          console.log("foodId:", stock.foodId);
          console.log("transactionType:", "sale");
          console.log("======================================");

          // Create transaction log
          await StockTransaction.create({
            foodId: stock.foodId,
            transactionType: "sale",
            quantity: item.quantity,
            previousQty: previousQty,
            newQty: previousQty - item.quantity,
            performedBy: managerInfo,
            reason: `Order confirmed - Token: ${payment.tokenNumber}`,
          });

          console.log("✓ StockTransaction created successfully");

          console.log(
            `✓ Stock deducted: ${item.foodName} (${previousQty} → ${
              previousQty - item.quantity
            })`
          );
        }

        console.log(
          `✓ Payment completed and stock deducted for Token: ${payment.tokenNumber}`
        );
      } catch (stockError) {
        console.error("Stock deduction error:", stockError);
        return res.status(500).json({
          message: `Failed to deduct stock: ${stockError.message}`,
        });
      }
    }

    // ========== UNCHECKING / CANCELLING (Restore Stock) ==========
    if (isChecked === false && payment.isChecked === true) {
      console.log(
        `✓ Processing order cancellation/return for Token: ${payment.tokenNumber}`
      );

      try {
        for (const item of payment.cartItems) {
          console.log(
            `Restoring item: ${item.foodName}, Quantity: ${item.quantity}`
          );

          // Find stock record
          let stock = null;

          if (item.foodId) {
            stock = await Stock.findOne({ foodId: item.foodId });
          }

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
              message: `Stock record not found for ${item.foodName}.`,
            });
          }

          console.log(`Current stock for ${item.foodName}: ${stock.quantity}`);

          // Store previous quantity
          const previousQty = stock.quantity;

          // RESTORE stock (add back)
          await Stock.findByIdAndUpdate(stock._id, {
            $inc: { quantity: item.quantity },
          });

          console.log(
            "=== About to create StockTransaction (cancellation) ==="
          );
          console.log("performedBy value:", managerInfo);
          console.log("======================================");

          // Create transaction log
          await StockTransaction.create({
            foodId: stock.foodId,
            transactionType: "adjustment",
            quantity: item.quantity,
            previousQty: previousQty,
            newQty: previousQty + item.quantity,
            performedBy: managerInfo,
            reason: `Order cancelled - Token: ${payment.tokenNumber}`,
          });

          console.log("✓ StockTransaction (cancellation) created successfully");

          console.log(
            `✓ Stock restored: ${item.foodName} (${previousQty} → ${
              previousQty + item.quantity
            })`
          );
        }

        console.log(
          `✓ Order cancelled and stock restored for Token: ${payment.tokenNumber}`
        );
      } catch (stockError) {
        console.error("Stock restoration error:", stockError);
        return res.status(500).json({
          message: `Failed to restore stock: ${stockError.message}`,
        });
      }
    }

    // Update payment status
    payment.isChecked = isChecked;
    const updatedPayment = await payment.save();

    // Response message based on action
    let message = "Payment status updated";
    if (isChecked === true && payment.isChecked === false) {
      message = "Payment completed and stock deducted";
    } else if (isChecked === false && payment.isChecked === true) {
      message = "Order cancelled and stock restored";
    }

    res.status(200).json({
      message: message,
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

  try {
    // 1. Fetch payment WITHOUT populate first to get the raw userId
    const payment = await Payment.findOne({ tokenNumber: token });

    if (!payment) {
      return next(errorHandler(404, "No order found with this token."));
    }

    // 2. (Optional) Security Check:
    // Since this is now a "public" receipt page accessed via a specific token,
    // we can skip the strict user ownership check. The token acts as the key.
    // However, we should still populate user details for the receipt.

    // 3. Manually populate user details (could be User OR Employee)
    let paymentUser = null;
    if (payment.userId) {
      paymentUser = await User.findById(payment.userId).select(
        "username email"
      );

      // If not found in User collection, check Employee collection
      if (!paymentUser) {
        const employeeUser = await Employee.findById(payment.userId).select(
          "firstname lastname email phone"
        );
        // Normalize employee object to look like user object for frontend consistency if needed
        if (employeeUser) {
          paymentUser = {
            _id: employeeUser._id,
            name: `${employeeUser.firstname} ${employeeUser.lastname}`,
            email: employeeUser.email,
            contactNumber: employeeUser.phone,
          };
        }
      } else {
        // Normalize User object
        paymentUser = {
          _id: paymentUser._id,
          name: paymentUser.username,
          email: paymentUser.email,
          contactNumber: "N/A",
        };
      }
    }

    // 4. Construct response
    const paymentWithUser = {
      ...payment.toObject(),
      userId: paymentUser || { name: "Guest/Unknown", email: "N/A" },
    };

    res.status(200).json(paymentWithUser);
  } catch (error) {
    console.error("Error retrieving payment by token:", error);
    next(errorHandler(500, "Failed to retrieve order details."));
  }
};

// Get payments by user ID
export const getPaymentsByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Verify the requesting user is the same as the userId or is admin
    // Note: req.user comes from verifyToken middleware
    if (req.user.id !== userId && !req.user.isAdmin) {
      return next(errorHandler(403, "Access denied"));
    }

    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .populate("userId", "username email name");

    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching user payments:", error);
    next(errorHandler(500, "Failed to retrieve user payments"));
  }
};
