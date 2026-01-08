import Stock from "../models/stock.model.js";
import StockTransaction from "../models/stockTransaction.model.js";
import { errorHandler } from "../utils/error.js";

export const getDashboardStats = async (req, res, next) => {
  if (req.user.role !== "Manager" && !req.user.isAdmin) {
    return next(errorHandler(403, "Access denied"));
  }

  try {
    const { timeRange } = req.query; // '7days', '30days', '3months' (default 7days)
    let dateLimit = new Date();

    if (timeRange === "30days") {
      dateLimit.setDate(dateLimit.getDate() - 30);
    } else if (timeRange === "3months") {
      dateLimit.setMonth(dateLimit.getMonth() - 3);
    } else {
      dateLimit.setDate(dateLimit.getDate() - 7);
    }

    // 1. Basic Counts
    const allStocks = await Stock.find().populate("foodId", "category price");
    const totalItems = allStocks.length;
    let totalStockValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    const categoryDistribution = {};

    allStocks.forEach((item) => {
      totalStockValue += item.quantity * (item.foodId?.price || 0);

      if (item.quantity === 0) {
        outOfStockCount++;
      } else if (item.quantity < item.minThreshold) {
        lowStockCount++;
      }

      // Category Distribution
      const category = item.foodId?.category || "Uncategorized";
      if (!categoryDistribution[category]) {
        categoryDistribution[category] = 0;
      }
      categoryDistribution[category] += item.quantity;
    });

    const categoryData = Object.keys(categoryDistribution).map((key) => ({
      name: key,
      value: categoryDistribution[key],
    }));

    // 2. Recent Transactions (Last 50)
    const recentTransactions = await StockTransaction.find()
      .sort({ timestamp: -1 })
      .limit(50)
      .populate("foodId", "foodName")
      .populate("performedBy", "username");

    // 3. Transactions Chart Data (Over time)
    const transactionsChart = await StockTransaction.aggregate([
      { $match: { timestamp: { $gte: dateLimit } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          purchases: {
            $sum: {
              $cond: [
                { $in: ["$transactionType", ["purchase", "restock"]] },
                "$quantity",
                0,
              ],
            },
          },
          sales: {
            $sum: {
              $cond: [{ $eq: ["$transactionType", "sale"] }, "$quantity", 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 4. Top 5 Selling Items (Based on 'sale' transactions ever or in recent valid period? Let's do all time for now or restricted by same dateLimit)
    // The prompt asks for Top 5 most sold items (from StockTransaction where type='sale')
    const topSelling = await StockTransaction.aggregate([
      { $match: { transactionType: "sale" } },
      { $group: { _id: "$foodId", totalSold: { $sum: "$quantity" } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "fooditems", // Confirm collection name lowercase plural
          localField: "_id",
          foreignField: "_id",
          as: "foodDetails",
        },
      },
      { $unwind: "$foodDetails" },
      { $project: { name: "$foodDetails.foodName", value: "$totalSold" } },
    ]);

    res.status(200).json({
      totalItems,
      totalStockValue,
      lowStockCount,
      outOfStockCount,
      recentTransactions,
      categoryData,
      transactionsChart: transactionsChart.map((t) => ({
        date: t._id,
        purchases: t.purchases,
        sales: t.sales,
      })),
      topSelling,
    });
  } catch (error) {
    next(error);
  }
};

export const downloadTransactionsByDate = async (req, res, next) => {
  try {
    // Check if Manager OR Admin
    if (req.user.role !== "Manager" && !req.user.isAdmin) {
      return next(errorHandler(403, "Access denied"));
    }

    const { date } = req.query; // Format: YYYY-MM-DD

    if (!date) {
      return next(errorHandler(400, { message: "Date parameter is required" }));
    }

    // Parse date to get start and end of day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    console.log(`Fetching ALL transactions for date: ${date}`);

    // Fetch ALL transactions for this date (NO LIMIT)
    const transactions = await StockTransaction.find({
      timestamp: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .populate("foodId", "foodName")
      .sort({ timestamp: -1 });

    console.log(`Found ${transactions.length} transactions for ${date}`);

    res.status(200).json({
      success: true,
      date: date,
      count: transactions.length,
      transactions: transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions by date:", error);
    next(errorHandler(500, { message: "Failed to fetch transactions" }));
  }
};
