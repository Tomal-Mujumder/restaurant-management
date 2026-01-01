import React from "react";
import { FaCreditCard, FaShieldAlt, FaTimes } from "react-icons/fa";

const PaymentMethodModal = ({ isOpen, onClose, onSelectMethod, cartItems, totalPrice }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg p-6 mx-4 bg-[#1f1f1f] border border-gray-700 rounded-2xl shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <FaTimes size={20} />
        </button>

        <h2 className="mb-6 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 text-center">
          Choose Payment Method
        </h2>

        <div className="space-y-4">
          {/* Manual Payment Option */}
          <div
            onClick={() => onSelectMethod("manual")}
            className="group relative p-4 border border-gray-600 rounded-xl cursor-pointer hover:border-pink-500 transition-all duration-300 hover:bg-[#2a2a2a]"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-pink-900/30 rounded-full text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                <FaCreditCard size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Manual Payment</h3>
                <p className="text-sm text-gray-400">Enter card details securely</p>
              </div>
            </div>
          </div>

          {/* SSLCommerz Option */}
          <div
            onClick={() => onSelectMethod("sslcommerz")}
            className="group relative p-4 border border-gray-600 rounded-xl cursor-pointer hover:border-purple-500 transition-all duration-300 hover:bg-[#2a2a2a]"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-900/30 rounded-full text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <FaShieldAlt size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">SSLCommerz Gateway</h3>
                <p className="text-sm text-gray-400">Pay securely via SSLCommerz</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          Total Amount: <span className="text-white font-semibold">BDT {totalPrice}</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodModal;
