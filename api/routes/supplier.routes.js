import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} from "../controllers/supplier.controller.js";

const router = express.Router();

router.post("/create", verifyToken, createSupplier);
router.get("/all", verifyToken, getAllSuppliers);
router.get("/:id", verifyToken, getSupplierById);
router.put("/update/:id", verifyToken, updateSupplier);
router.delete("/delete/:id", verifyToken, deleteSupplier);

export default router;
