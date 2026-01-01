import express from "express";
import {
  initPayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  paymentIPN,
} from "../controllers/sslcommerz.controller.js";

const router = express.Router();

// Initialize payment (could add auth middleware here if needed, but usually userId is passed from frontend)
router.post("/init", initPayment);

// Callbacks (Public because they are called by SSLCommerz server/browser redirect)
router.post("/success", paymentSuccess);
router.post("/fail", paymentFail);
router.post("/cancel", paymentCancel);
router.post("/ipn", paymentIPN);

export default router;
