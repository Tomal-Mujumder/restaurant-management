import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  getDashboardStats,
  downloadTransactionsByDate,
} from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/dashboard", verifyToken, getDashboardStats);
router.get("/download-by-date", verifyToken, downloadTransactionsByDate);

export default router;
