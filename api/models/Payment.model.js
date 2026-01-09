// payment model
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cartItems: [
      {
        foodName: String,
        quantity: Number,
        price: Number,
      },
    ],
    totalPrice: Number,
    paymentInfo: {
      cardType: String, // Add cardType to store selected card type
      cardName: String,
      cardNumber: String,
      expirationDate: String,
      securityCode: String,
    },
    shipmentData: {
      fullName: String,
      mobileNumber: String,
      shippingAddress: String,
      deliveryType: String,
      specialInstructions: String,
    },
    tokenNumber: {
      type: Number,
      required: true,
    },
    isChecked: {
      type: Boolean,
      default: false, // Payments are incomplete by default
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
