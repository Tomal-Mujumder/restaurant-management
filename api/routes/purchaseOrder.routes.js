import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  createPurchaseOrder,
  getAllOrders,
  getOrderById,
  receiveOrder,
  cancelOrder,
} from "../controllers/purchaseOrder.controller.js";

const router = express.Router();

router.post("/create", verifyToken, createPurchaseOrder);
router.get("/all", verifyToken, getAllOrders);
router.get("/:id", verifyToken, getOrderById);
router.put("/receive/:id", verifyToken, receiveOrder);
router.put("/cancel/:id", verifyToken, cancelOrder);

export default router;
