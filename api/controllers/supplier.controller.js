import Supplier from "../models/supplier.model.js";
import PurchaseOrder from "../models/purchaseOrder.model.js";
import { errorHandler } from "../utils/error.js";

// 1. Create Supplier
export const createSupplier = async (req, res, next) => {
  if (req.user.role !== "Manager" && !req.user.isAdmin) {
    return next(errorHandler(403, "You are not allowed to add suppliers"));
  }

  try {
    const {
      companyName,
      contactPerson,
      phone,
      email,
      address,
      itemsSupplied,
      rating,
    } = req.body;

    // Validation
    if (
      !companyName ||
      !contactPerson ||
      !phone ||
      !email ||
      !address ||
      !itemsSupplied ||
      itemsSupplied.length === 0
    ) {
      return next(errorHandler(400, "All fields are required"));
    }

    // Phone validation
    if (!/^\d{11}$/.test(phone)) {
      return next(errorHandler(400, "Phone number must be exactly 11 digits"));
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return next(errorHandler(400, "Invalid email format"));
    }

    const newSupplier = new Supplier({
      companyName,
      contactPerson,
      phone,
      email,
      address,
      itemsSupplied,
      rating,
    });

    const savedSupplier = await newSupplier.save();
    res.status(201).json(savedSupplier);
  } catch (error) {
    next(error);
  }
};

// 2. Get All Suppliers
export const getAllSuppliers = async (req, res, next) => {
  if (req.user.role !== "Manager" && !req.user.isAdmin) {
    return next(errorHandler(403, "Access denied"));
  }
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.status(200).json(suppliers);
  } catch (error) {
    next(error);
  }
};

// 3. Get Supplier By ID
export const getSupplierById = async (req, res, next) => {
  if (req.user.role !== "Manager" && !req.user.isAdmin) {
    return next(errorHandler(403, "Access denied"));
  }
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return next(errorHandler(404, "Supplier not found"));
    }
    res.status(200).json(supplier);
  } catch (error) {
    next(error);
  }
};

// 4. Update Supplier
export const updateSupplier = async (req, res, next) => {
  if (req.user.role !== "Manager" && !req.user.isAdmin) {
    return next(errorHandler(403, "You are not allowed to update suppliers"));
  }

  try {
    const {
      companyName,
      contactPerson,
      phone,
      email,
      address,
      itemsSupplied,
      rating,
    } = req.body;

    // Phone validation if provided
    if (phone && !/^\d{11}$/.test(phone)) {
      return next(errorHandler(400, "Phone number must be exactly 11 digits"));
    }

    // Email validation if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return next(errorHandler(400, "Invalid email format"));
    }

    const updatedSupplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          companyName,
          contactPerson,
          phone,
          email,
          address,
          itemsSupplied,
          rating,
        },
      },
      { new: true }
    );

    if (!updatedSupplier) {
      return next(errorHandler(404, "Supplier not found"));
    }

    res.status(200).json(updatedSupplier);
  } catch (error) {
    next(error);
  }
};

// 5. Delete Supplier
export const deleteSupplier = async (req, res, next) => {
  if (req.user.role !== "Manager" && !req.user.isAdmin) {
    return next(errorHandler(403, "You are not allowed to delete suppliers"));
  }

  try {
    const deletedSupplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!deletedSupplier) {
      return next(errorHandler(404, "Supplier not found"));
    }
    res.status(200).json({ message: "Supplier deleted successfully" });
  } catch (error) {
    next(error);
  }
};
