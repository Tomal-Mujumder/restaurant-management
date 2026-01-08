import express from "express";
import {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrder,
  deletePurchaseOrder,
  updateOrderStatus,
} from "../controllers/purchaseOrder.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/create", verifyToken, createPurchaseOrder);
router.get("/getAll", verifyToken, getAllPurchaseOrders);
router.get("/:id", verifyToken, getPurchaseOrderById);
router.put("/update/:id", verifyToken, updatePurchaseOrder);
router.delete("/delete/:id", verifyToken, deletePurchaseOrder);
router.patch("/status/:id", verifyToken, updateOrderStatus);

export default router;
