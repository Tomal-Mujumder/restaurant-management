import express from "express";
import { verifyToken, verifyAdmin } from "../utils/verifyUser.js";
import {
  getAllOrders,
  getOrderById,
} from "../controllers/orders.controller.js";

const router = express.Router();

// Get all orders (Admin/Manager only, verifyToken implies internal check, but let's assume verifyToken is enough for now based on user request)
// User request said: router.get('/all', verifyToken, getAllOrders);
router.get("/all", verifyToken, getAllOrders);
router.get("/:orderId", verifyToken, getOrderById);

export default router;
