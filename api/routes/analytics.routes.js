import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { getDashboardStats } from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/dashboard", verifyToken, getDashboardStats);

export default router;
