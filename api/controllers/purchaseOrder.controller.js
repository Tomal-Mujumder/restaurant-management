import PurchaseOrder from "../models/purchaseOrder.model.js";
import { errorHandler } from "../utils/error.js";

// Create new purchase order
export const createPurchaseOrder = async (req, res, next) => {
  try {
    console.log("createPurchaseOrder started. Body:", req.body);
    console.log("createPurchaseOrder User:", req.user);

    const {
      supplierId,
      supplierName,
      items,
      expectedDeliveryDate,
      notes,
      tax,
    } = req.body;

    // Validation
    if (
      !supplierId ||
      !supplierName ||
      !items ||
      items.length === 0 ||
      !expectedDeliveryDate
    ) {
      console.log("Validation failed: Missing required fields");
      return next(errorHandler(400, "All required fields must be provided"));
    }

    if (!req.user || (!req.user.id && !req.user._id)) {
      console.log("Authentication failed: User ID missing in request");
      return next(errorHandler(401, "User not authenticated correctly"));
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => {
      // Ensure unitPrice is used (handles frontend sending unitCost as unitPrice)
      const price = item.unitPrice || item.unitCost || 0;
      item.unitPrice = price; // standardize to unitPrice
      item.totalPrice = item.quantity * price;
      return sum + item.totalPrice;
    }, 0);

    const taxAmount = tax || 0;
    const totalAmount = subtotal + taxAmount;

    const newOrder = new PurchaseOrder({
      supplierId,
      supplierName,
      items,
      subtotal,
      tax: taxAmount,
      totalAmount,
      expectedDeliveryDate,
      notes: notes || "",
      orderedBy: req.user.id || req.user._id, // Handle both id and _id
    });

    const savedOrder = await newOrder.save();
    console.log("Purchase Order saved successfully:", savedOrder._id);
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Error in createPurchaseOrder:", error);
    next(error);
  }
};

// Get all purchase orders
export const getAllPurchaseOrders = async (req, res, next) => {
  try {
    const { status, supplierId } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (supplierId) filter.supplierId = supplierId;

    const orders = await PurchaseOrder.find(filter)
      .sort({ createdAt: -1 })
      .populate("supplierId", "companyName contactPerson phone email")
      .populate("orderedBy", "username email"); // Populate user details

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

// Get single purchase order by ID
export const getPurchaseOrderById = async (req, res, next) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id).populate(
      "supplierId",
      "companyName contactPerson phone email address"
    );

    if (!order) {
      return next(errorHandler(404, "Purchase order not found"));
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

// Update purchase order
export const updatePurchaseOrder = async (req, res, next) => {
  try {
    const { items, expectedDeliveryDate, status, paymentStatus, notes, tax } =
      req.body;

    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      return next(errorHandler(404, "Purchase order not found"));
    }

    // Recalculate totals if items changed
    if (items) {
      const subtotal = items.reduce((sum, item) => {
        item.totalPrice = item.quantity * item.unitPrice;
        return sum + item.totalPrice;
      }, 0);

      const taxAmount = tax || order.tax;
      const totalAmount = subtotal + taxAmount;

      order.items = items;
      order.subtotal = subtotal;
      order.tax = taxAmount;
      order.totalAmount = totalAmount;
    }

    if (expectedDeliveryDate) order.expectedDeliveryDate = expectedDeliveryDate;
    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (notes !== undefined) order.notes = notes;

    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

// Delete purchase order
export const deletePurchaseOrder = async (req, res, next) => {
  try {
    const order = await PurchaseOrder.findByIdAndDelete(req.params.id);

    if (!order) {
      return next(errorHandler(404, "Purchase order not found"));
    }

    res.status(200).json({ message: "Purchase order deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Update order status
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (
      !["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"].includes(
        status
      )
    ) {
      return next(errorHandler(400, "Invalid status"));
    }

    const order = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return next(errorHandler(404, "Purchase order not found"));
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};
