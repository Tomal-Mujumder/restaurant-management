import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  getAllStocks,
  updateStock,
  getStockById,
  setThresholds,
  getLowStockItems,
} from "../controllers/stock.controller.js";

const router = express.Router();

router.get("/all", verifyToken, getAllStocks);
router.put("/update/:foodId", verifyToken, updateStock);
router.get("/low-stock", verifyToken, getLowStockItems); // Define this before /:foodId to avoid conflict
router.get("/:foodId", verifyToken, getStockById);
router.put("/threshold/:foodId", verifyToken, setThresholds);

export default router;
