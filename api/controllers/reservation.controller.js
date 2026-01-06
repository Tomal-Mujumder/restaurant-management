import Reservation from "../models/reservation.model.js";
import { errorHandler } from "../utils/error.js";

export const createReservation = async (req, res, next) => {
  try {
    const {
      customerName,
      email,
      phoneNumber,
      partySize,
      reservationDate,
      reservationTime,
      specialRequests,
    } = req.body;

    if (
      !customerName ||
      !email ||
      !phoneNumber ||
      !partySize ||
      !reservationDate ||
      !reservationTime
    ) {
      return next(errorHandler(400, "All fields are required"));
    }

    const selectedDate = new Date(reservationDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return next(errorHandler(400, "Reservation date cannot be in the past"));
    }

    const newReservation = new Reservation({
      customerName,
      email,
      phoneNumber,
      partySize,
      reservationDate,
      reservationTime,
      specialRequests,
    });

    await newReservation.save();
    res.status(201).json(newReservation);
  } catch (error) {
    next(error);
  }
};

export const getAllReservations = async (req, res, next) => {
  if (!req.user.isAdmin && req.user.role !== "Manager") {
    return next(
      errorHandler(403, "You are not allowed to view all reservations")
    );
  }
  try {
    const reservations = await Reservation.find().sort({ reservationDate: 1 });
    res.status(200).json(reservations);
  } catch (error) {
    next(error);
  }
};

export const getReservationByEmail = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({
      email: req.params.email,
    }).sort({ reservationDate: -1 });
    res.status(200).json(reservations);
  } catch (error) {
    next(error);
  }
};

export const updateReservationStatus = async (req, res, next) => {
  if (!req.user.isAdmin && req.user.role !== "Manager") {
    return next(
      errorHandler(403, "You are not allowed to update reservation status")
    );
  }
  try {
    const {
      customerName,
      email,
      phoneNumber,
      partySize,
      reservationDate,
      reservationTime,
      specialRequests,
      status,
    } = req.body;

    // Optional: Validate date if provided
    if (reservationDate) {
      const selectedDate = new Date(reservationDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        return next(
          errorHandler(400, "Reservation date cannot be in the past")
        );
      }
    }

    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          customerName,
          email,
          phoneNumber,
          partySize,
          reservationDate,
          reservationTime,
          specialRequests,
          status,
        },
      },
      { new: true }
    );
    res.status(200).json(updatedReservation);
  } catch (error) {
    next(error);
  }
};

export const deleteReservation = async (req, res, next) => {
  if (!req.user.isAdmin && req.user.role !== "Manager") {
    return next(
      errorHandler(403, "You are not allowed to delete reservations")
    );
  }
  try {
    await Reservation.findByIdAndDelete(req.params.id);
    res.status(200).json("The reservation has been deleted");
  } catch (error) {
    next(error);
  }
};
