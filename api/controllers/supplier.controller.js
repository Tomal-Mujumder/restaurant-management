import Supplier from "../models/supplier.model.js";
import PurchaseOrder from "../models/purchaseOrder.model.js";
import { errorHandler } from "../utils/error.js";

// 1. Create Supplier
export const createSupplier = async (req, res, next) => {
  if (req.user.role !== "Manager" && !req.user.isAdmin) {
    return next(errorHandler(403, "You are not allowed to add suppliers"));
  }

  try {
    const newSupplier = new Supplier(req.body);
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
    const suppliers = await Supplier.find().populate("itemsSupplied");
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
    const supplier = await Supplier.findById(req.params.id).populate(
      "itemsSupplied"
    );
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
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedSupplier);
  } catch (error) {
    next(error);
  }
};

// 5. Delete Supplier (check for pending orders)
export const deleteSupplier = async (req, res, next) => {
  if (req.user.role !== "Manager" && !req.user.isAdmin) {
    return next(errorHandler(403, "You are not allowed to delete suppliers"));
  }

  try {
    // Check for pending orders
    const pendingOrders = await PurchaseOrder.findOne({
      supplierId: req.params.id,
      status: "pending",
    });

    if (pendingOrders) {
      return next(
        errorHandler(400, "Cannot delete supplier with pending orders")
      );
    }

    await Supplier.findByIdAndDelete(req.params.id);
    res.status(200).json("Supplier has been deleted");
  } catch (error) {
    next(error);
  }
};
