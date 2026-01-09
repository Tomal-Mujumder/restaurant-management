// payment.routes.js
import express from "express";
import {
  savePayment,
  getAllPayments,
  getPaymentByTokenNumber,
  updatePayment,
  deleteOldPayments,
  getPaymentDetailsByToken,
  getPaymentsByUserId,
} from "../controllers/payment.controller.js";
import { verifyToken, verifyAdmin } from "../utils/verifyUser.js";

const router = express.Router();

// Route to save a payment
router.post("/savepayment", savePayment);

// Route to get all payments (Admin use only)
router.get("/getallpayment", getAllPayments);

// Route to search payment by token number
router.get("/search/:tokenNumber", getPaymentByTokenNumber);

// Route to update payment status
router.put("/update/:paymentId", verifyToken, updatePayment);

// Route to delete payments older than a specified number of days
router.post("/delete-old", verifyToken, verifyAdmin, deleteOldPayments);
router.get("/order/:token", getPaymentDetailsByToken);
router.get("/user/:userId", verifyToken, getPaymentsByUserId);

export default router;
