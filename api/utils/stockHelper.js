import Stock from "../models/stock.model.js";
import StockTransaction from "../models/stockTransaction.model.js";
import { errorHandler } from "./error.js";

/**
 * Deducts stock for each item in the cart and logs transactions.
 * @param {Array} cartItems - Array of items from the cart.
 * @param {String} userId - ID of the user performing the transaction.
 * @param {String} tokenNumber - Order/Payment token number for reference.
 * @param {String} performedByModel - 'User' or 'Employee'.
 */
export const deductStockFromCart = async (
  cartItems,
  userId,
  tokenNumber,
  performedByModel = "User"
) => {
  for (const item of cartItems) {
    // Find stock record - checking both foodId and id for compatibility
    const stock = await Stock.findOne({ foodId: item.foodId || item.id });

    if (!stock) {
      throw errorHandler(404, `Stock record not found for ${item.foodName}`);
    }

    if (stock.quantity < item.quantity) {
      throw errorHandler(
        400,
        `Insufficient stock for ${item.foodName}. Only ${stock.quantity} units available.`
      );
    }

    // Store previous quantity
    const previousQty = stock.quantity;

    // Deduct stock using $inc for atomicity
    await Stock.findByIdAndUpdate(stock._id, {
      $inc: { quantity: -item.quantity },
    });

    // Log transaction
    await StockTransaction.create({
      foodId: stock.foodId,
      transactionType: "sale",
      quantity: item.quantity,
      previousQty: previousQty,
      newQty: previousQty - item.quantity,
      performedBy: userId,
      performedByModel: performedByModel,
      reason: `Payment completed - Token: ${tokenNumber}`,
    });
  }
};
