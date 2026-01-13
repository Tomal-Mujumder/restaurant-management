import React from "react";
import {
  FaCreditCard,
  FaShieldAlt,
  FaTimes,
  FaMoneyBillWave,
} from "react-icons/fa";

const PaymentMethodModal = ({
  isOpen,
  onClose,
  onSelectMethod,
  cartItems,
  totalPrice,
}) => {
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

        <h2 className="mb-6 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#AC5180] to-[#ca8a04] text-center">
          Choose Payment Method
        </h2>

        <div className="space-y-4">
          {/* Cash on Delivery Option */}
          <div
            onClick={() => onSelectMethod("cod")}
            className="group relative p-4 border border-gray-600 rounded-xl cursor-pointer hover:border-[#AC5180] transition-all duration-300 hover:bg-[#2a2a2a]"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#AC5180]/30 rounded-full text-[#AC5180] group-hover:bg-[#AC5180] group-hover:text-white transition-colors">
                <FaMoneyBillWave size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Cash on Delivery
                </h3>
                <p className="text-sm text-gray-400">
                  Pay when you receive your order
                </p>
              </div>
            </div>
          </div>

          {/* SSLCommerz Option */}
          <div
            onClick={() => onSelectMethod("sslcommerz")}
            className="group relative p-4 border border-gray-600 rounded-xl cursor-pointer hover:border-green-500 transition-all duration-300 hover:bg-[#2a2a2a]"
          >
            {/* Recommended Badge */}
            <div className="absolute top-0 right-0 px-3 py-1 text-xs font-bold text-white transform translate-x-2 -translate-y-2 bg-green-600 rounded-bl-lg rounded-tr-lg shadow-lg">
              Recommended
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-900/30 rounded-full text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                <FaShieldAlt size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  SSLCommerz Gateway
                </h3>
                <p className="text-sm text-gray-400">
                  Pay securely via SSLCommerz
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          Total Amount:{" "}
          <span className="text-white font-semibold">BDT {totalPrice}</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodModal;
