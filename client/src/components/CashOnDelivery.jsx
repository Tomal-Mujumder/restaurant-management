import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import { formatCurrencyWithCode } from "../utils/currency"; // Ensure this utility exists or import correctly
import {
  FaMoneyBillWave,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaInfoCircle,
} from "react-icons/fa";

const CashOnDelivery = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    cartItems = [],
    totalPrice = 0,
    shipmentData = {},
  } = location.state || {};

  const currentUser = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    if (!location.state) {
      navigate("/cart");
    }
  }, [location.state, navigate]);

  const handleConfirmOrder = async () => {
    if (!isConfirmed) {
      Toastify({
        text: "Please confirm that you agree to pay cash on delivery.",
        duration: 3000,
        backgroundColor: "#f59e0b",
      }).showToast();
      return;
    }

    setIsProcessing(true);
    const userId = currentUser?._id;

    if (!userId) {
      Toastify({
        text: "You must be logged in to place an order.",
        duration: 3000,
        backgroundColor: "#ef4444",
      }).showToast();
      setIsProcessing(false);
      return;
    }

    const tokenNumber = Math.floor(Math.random() * 1000) + 1;
    const timestamp = Date.now();

    const paymentDetails = {
      userId,
      cartItems,
      totalPrice,
      paymentInfo: {
        cardType: "Cash on Delivery",
        cardName: "COD",
        cardNumber: "COD-" + timestamp,
        expirationDate: new Date().toISOString(),
        securityCode: "COD",
      },
      shipmentData,
      tokenNumber,
      transactionId: `COD-${timestamp}-${userId.substring(0, 4)}`,
    };

    try {
      const response = await fetch("/api/payment/savepayment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentDetails),
      });

      if (response.ok) {
        const result = await response.json();

        // Clear local storage cart
        const cartKey = `cart_${userId}`;
        localStorage.removeItem(cartKey);
        window.dispatchEvent(new Event("cartUpdated"));

        Toastify({
          text: "Order confirmed successfully!",
          duration: 3000,
          backgroundColor: "#10b981",
        }).showToast();

        navigate(`/payment-success?tranId=${tokenNumber}`, {
          state: { order: result.payment },
        });
      } else {
        const errData = await response.json();
        Toastify({
          text: errData.message || "Failed to place order.",
          duration: 3000,
          backgroundColor: "#ef4444",
        }).showToast();
      }
    } catch (error) {
      console.error("Order processing error:", error);
      Toastify({
        text: "An error occurred while processing your order.",
        duration: 3000,
        backgroundColor: "#ef4444",
      }).showToast();
    } finally {
      setIsProcessing(false);
    }
  };

  if (!location.state) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-800 p-6 text-white text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                <FaMoneyBillWave size={40} className="text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold">
              Cash on Delivery Confirmation
            </h1>
            <p className="mt-2 text-teal-100">
              Pay securely when your order arrives
            </p>
          </div>

          <div className="p-8">
            {/* Delivery Charge Alert */}
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
              <div className="flex items-start">
                <FaInfoCircle className="text-yellow-600 text-xl mr-3 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-yellow-800 mb-2">
                    Delivery Charges
                  </h3>
                  <p className="text-yellow-700">
                    • Inside Dhaka City:{" "}
                    <span className="font-semibold">80 BDT</span>
                    <br />• Outside Dhaka City:{" "}
                    <span className="font-semibold">120 BDT</span>
                  </p>
                  <p className="text-sm text-yellow-600 mt-2">
                    Delivery charges will be added to your total amount and
                    collected upon delivery.
                  </p>
                </div>
              </div>
            </div>
            {/* Shipment Summary */}
            <div className="mb-8 bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <FaMapMarkerAlt className="text-teal-600" /> Delivery Details
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Recipient Name</p>
                  <p className="font-medium text-gray-800 flex items-center gap-2">
                    <FaUser className="text-gray-400 text-xs" />{" "}
                    {shipmentData.fullName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Contact Number</p>
                  <p className="font-medium text-gray-800 flex items-center gap-2">
                    <FaPhone className="text-gray-400 text-xs" />{" "}
                    {shipmentData.mobileNumber}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Delivery Address</p>
                  <p className="font-medium text-gray-800">
                    {shipmentData.shippingAddress}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Delivery Type</p>
                  <span className="inline-block px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-bold">
                    {shipmentData.deliveryType}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Order Summary
              </h2>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                {cartItems.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-sm font-bold text-gray-600">
                        {item.quantity}x
                      </span>
                      <span className="font-medium text-gray-700">
                        {item.foodName}
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {formatCurrencyWithCode(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
                <div className="p-4 bg-gray-50 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">
                    Total Amount to Pay
                  </span>
                  <span className="text-2xl font-bold text-teal-600">
                    {formatCurrencyWithCode(totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Confirmation Area */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <label className="flex items-start gap-3 p-4 border border-teal-100 bg-teal-50 rounded-xl cursor-pointer hover:bg-teal-100 transition-colors">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mt-1"
                    checked={isConfirmed}
                    onChange={(e) => setIsConfirmed(e.target.checked)}
                  />
                </div>
                <div>
                  <span className="font-bold text-gray-800">
                    I confirm this order and agree to pay upon delivery
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    By checking this box, you agree to receive the order at the
                    specified address and pay payment of{" "}
                    <span className="font-bold">
                      {formatCurrencyWithCode(totalPrice)}
                    </span>{" "}
                    in cash.
                  </p>
                </div>
              </label>

              <button
                onClick={handleConfirmOrder}
                disabled={!isConfirmed || isProcessing}
                className={`mt-6 w-full py-4 text-lg font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 ${
                  !isConfirmed || isProcessing
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#AC5180] to-[#ca8a04] text-white hover:shadow-xl"
                }`}
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <FaCheckCircle /> Confirm Order
                  </>
                )}
              </button>

              <button
                onClick={() => navigate(-1)}
                className="mt-4 w-full py-3 text-gray-500 font-medium hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel and Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashOnDelivery;
