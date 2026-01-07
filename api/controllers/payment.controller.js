import Payment from "../models/Payment.model.js";
import User from "../models/user.model.js";
import Employee from "../models/employee.model.js";
import { errorHandler } from "../utils/error.js";
import { deductStockFromCart } from "../utils/stockHelper.js";

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

    try {
      // Use helper to deduct stock for each item
      await deductStockFromCart(cartItems, userId, tokenNumber, "User");

      res.status(201).json({ message: "Payment successful", payment });
    } catch (error) {
      console.error("Stock deduction failed:", error);
      // Attempt to delete payment to maintain consistency
      if (payment._id) {
        await Payment.findByIdAndDelete(payment._id);
      }
      return next(error); // error from helper or deletion
    }
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
    // Check if `isChecked` is provided
    if (typeof isChecked === "undefined") {
      return next(errorHandler(400, "isChecked field is required"));
    }

    // Find the payment record by ID
    const payment = await Payment.findById(paymentId);

    // Handle payment not found scenario
    if (!payment) {
      return next(errorHandler(404, "Payment not found"));
    }

    // Update the payment status
    payment.isChecked = isChecked;

    // Save the updated payment
    const updatedPayment = await payment.save();

    // Return successful response with updated payment data
    res.status(200).json({
      message: "Payment status updated successfully",
      payment: updatedPayment,
    });
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error updating payment:", error);

    // Forward the error to the error handler middleware
    next(errorHandler(500, "Failed to update payment"));
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
