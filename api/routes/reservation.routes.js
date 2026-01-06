import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  createReservation,
  getAllReservations,
  getReservationByEmail,
  updateReservationStatus,
  deleteReservation,
} from "../controllers/reservation.controller.js";

const router = express.Router();

router.post("/create", createReservation);
router.get("/all", verifyToken, getAllReservations);
router.get("/email/:email", verifyToken, getReservationByEmail);
router.put("/update/:id", verifyToken, updateReservationStatus);
router.delete("/delete/:id", verifyToken, deleteReservation);

export default router;
