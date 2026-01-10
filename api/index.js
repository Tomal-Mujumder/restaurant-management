import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import foodRoutes from "./routes/foodCategory.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import authEmployeeRoutes from "./routes/authEmployee.routes.js";
import cookieParser from "cookie-parser";

import employeeRoutes from "./routes/employee.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

import checkoutShopRoutes from "./routes/checkoutShop.routes.js";
import sslcommerzRoutes from "./routes/sslcommerz.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import reservationRoutes from "./routes/reservation.routes.js";
import stockRoutes from "./routes/stock.routes.js";
import supplierRoutes from "./routes/supplier.routes.js";
import purchaseOrderRoutes from "./routes/purchaseOrder.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

// import shippingRoutes from "./routes/shipping.routes.js";

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

dotenv.config();

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("MongoDB is Connected");
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.listen(3000, () => {
  console.log("Server is running on port 3000!!");
});

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/employee", employeeRoutes);
app.use("/api/authEmployee", authEmployeeRoutes);

app.use("/api/foods", foodRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payment", paymentRoutes);

app.use("/api/pay", checkoutShopRoutes);
app.use("/api/sslcommerz", sslcommerzRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/reservation", reservationRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/supplier", supplierRoutes);
app.use("/api/purchaseorder", purchaseOrderRoutes);
app.use("/api/analytics", analyticsRoutes);
// app.use("/api/shipping", shippingRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "ValidationError") {
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
