import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import PaymentMethodModal from "./PaymentMethodModal";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import { formatCurrency, formatCurrencyWithCode } from "../utils/currency";

const ShoppingCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stockErrors, setStockErrors] = useState({});
  const [availabilityChecked, setAvailabilityChecked] = useState(false);

  // Get user ID from Redux
  const { currentUser } = useSelector((state) => state.user);
  const userId = currentUser?._id;
  const navigate = useNavigate();

  useEffect(() => {
    // Check for cancelled payment
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get("cancelled") === "true") {
      Toastify({
        text: "Payment cancelled.",
        duration: 3000,
        backgroundColor: "#f59e0b", // Warning color
      }).showToast();
      // Remove the query param to avoid showing toast on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const loadCart = () => {
    const cartKey = `cart_${userId}`;
    const currentCartList =
      JSON.parse(localStorage.getItem(cartKey) || "[]") || [];

    // Remove any duplicates (safety check)
    const uniqueCart = [];
    currentCartList.forEach((item) => {
      const existing = uniqueCart.find((c) => c.id === item.id);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        uniqueCart.push({ ...item });
      }
    });

    // If duplicates were found, save cleaned cart
    if (uniqueCart.length !== currentCartList.length) {
      localStorage.setItem(cartKey, JSON.stringify(uniqueCart));
    }

    setCartItems(uniqueCart);
    calculateTotal(uniqueCart);
  };

  useEffect(() => {
    if (userId) {
      loadCart();
    }
  }, [userId]);

  const calculateTotal = (items) => {
    // Calculate total price of items in the cart
    const total = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setTotalPrice(total);
  };

  const updateQuantity = (id, delta) => {
    const updatedCart = cartItems.map((item) => {
      if (item.id === id) {
        const newQuantity = item.quantity + delta;
        // Prevent quantity from going below 1
        return { ...item, quantity: Math.max(1, newQuantity) };
      }
      return item;
    });

    setCartItems(updatedCart);
    calculateTotal(updatedCart);
    updateLocalStorage(updatedCart);
    // Reset availability check on quantity change
    setAvailabilityChecked(false);
    setStockErrors({});
  };

  const updateLocalStorage = (updatedCart) => {
    localStorage.setItem(`cart_${userId}`, JSON.stringify(updatedCart));
    // Dispatch event to update header cart count
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const removeItem = (id) => {
    // Remove an item from the cart
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    calculateTotal(updatedCart);
    updateLocalStorage(updatedCart);
    window.dispatchEvent(new Event("cartUpdated"));
    // Reset check on item removal
    setAvailabilityChecked(false);
    setStockErrors({});
  };

  const checkAvailability = async () => {
    setIsProcessing(true);
    const errors = {};
    let hasError = false;

    try {
      await Promise.all(
        cartItems.map(async (item) => {
          const res = await fetch(`/api/stock/${item.id}`);
          if (res.ok) {
            const stockData = await res.json();
            if (stockData.quantity < item.quantity) {
              errors[item.id] = `Only ${stockData.quantity} available`;
              hasError = true;
            }
          }
        })
      );

      setStockErrors(errors);
      setAvailabilityChecked(true);
      setIsProcessing(false);

      if (hasError) {
        Toastify({
          text: "Some items have insufficient stock.",
          duration: 3000,
          backgroundColor: "#ef4444",
        }).showToast();
      } else {
        Toastify({
          text: "All items are available!",
          duration: 3000,
          backgroundColor: "#10b981",
        }).showToast();
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      setIsProcessing(false);
      Toastify({
        text: "Failed to check availability.",
        duration: 3000,
        backgroundColor: "#ef4444",
      }).showToast();
    }
  };

  const handleOrderNow = () => {
    if (cartItems.length === 0) {
      Toastify({
        text: "Cart is empty",
        duration: 3000,
        backgroundColor: "#ef4444",
      }).showToast();
      return;
    }

    if (!availabilityChecked) {
      Toastify({
        text: "Please check availability first.",
        duration: 3000,
        backgroundColor: "#f59e0b",
      }).showToast();
      return;
    }

    if (Object.keys(stockErrors).length > 0) {
      Toastify({
        text: "Please resolve stock issues before ordering.",
        duration: 3000,
        backgroundColor: "#ef4444",
      }).showToast();
      return;
    }

    setShowPaymentModal(true);
  };

  const handlePaymentMethodSelect = async (method) => {
    setShowPaymentModal(false);

    if (method === "manual") {
      navigate("/checkout/payment", {
        state: { cartItems, totalPrice, userId },
      });
    } else if (method === "sslcommerz") {
      setIsProcessing(true);
      Toastify({
        text: "Initializing payment...",
        duration: 3000,
        backgroundColor: "#3b82f6",
      }).showToast();

      try {
        const response = await fetch("/api/sslcommerz/init", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            cartItems,
            totalPrice,
          }),
        });

        const data = await response.json();

        if (data.success) {
          Toastify({
            text: "Redirecting to payment gateway...",
            duration: 3000,
            backgroundColor: "#10b981",
          }).showToast();
          window.location.href = data.gatewayUrl;
        } else {
          Toastify({
            text: data.message || "Failed to initialize payment",
            duration: 3000,
            backgroundColor: "#ef4444",
          }).showToast();
          setIsProcessing(false);
        }
      } catch (error) {
        console.error("Payment Init Error:", error);
        Toastify({
          text: "Server error occurred",
          duration: 3000,
          backgroundColor: "#ef4444",
        }).showToast();
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="container py-12 mx-auto">
      <h2 className="mb-8 text-2xl font-semibold">Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <div>Your cart is currently empty.</div>
      ) : (
        <div className="flex flex-col">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center mb-6 p-4 rounded-xl transition-all ${
                stockErrors[item.id]
                  ? "bg-red-50 border border-red-200 shadow-sm"
                  : "bg-gray-50"
              }`}
            >
              <img
                className="object-cover w-20 h-20 mr-4 rounded-lg shadow-sm"
                src={
                  item.image ||
                  "https://i.pinimg.com/originals/2b/f0/e0/2bf0e06f26135c159a64591c817f639e.jpg"
                }
                alt={item.foodName}
                onError={(e) => {
                  e.target.src =
                    "https://i.pinimg.com/originals/2b/f0/e0/2bf0e06f26135c159a64591c817f639e.jpg";
                }}
              />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-800">
                  {item.foodName}
                </span>
                <span className="text-lg font-semibold text-[#e93b92]">
                  {" "}
                  {formatCurrencyWithCode(item.price)}
                </span>
                <div className="flex items-center gap-4 mt-1">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-sm font-medium text-red-500 hover:text-red-700 underline transition-colors"
                  >
                    Remove
                  </button>
                  {stockErrors[item.id] && (
                    <span className="text-red-600 text-xs font-bold bg-white px-2 py-1 rounded border border-red-200 shadow-sm animate-pulse uppercase">
                      {stockErrors[item.id]}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center ml-auto bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  disabled={item.quantity <= 1}
                  className="px-4 py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors border-r"
                >
                  -
                </button>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => {
                    const newQty = parseInt(e.target.value) || 1;
                    if (newQty >= 1) {
                      const updatedCart = cartItems.map((cartItem) =>
                        cartItem.id === item.id
                          ? { ...cartItem, quantity: newQty }
                          : cartItem
                      );
                      setCartItems(updatedCart);
                      calculateTotal(updatedCart);
                      updateLocalStorage(updatedCart);
                      setAvailabilityChecked(false);
                      setStockErrors({});
                    }
                  }}
                  min="1"
                  className="w-14 text-center border-none focus:ring-0 font-semibold text-gray-700"
                />
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="px-4 py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors border-l"
                >
                  +
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center py-6 border-t border-gray-200 mt-4">
            <span className="text-xl font-bold text-gray-800">Order Total</span>
            <span className="text-2xl font-black text-[#e93b92]">
              {formatCurrencyWithCode(totalPrice)}
            </span>
          </div>
          <div className="flex justify-end mt-6 gap-4">
            <button
              onClick={checkAvailability}
              disabled={isProcessing}
              className={`py-3 px-6 rounded-xl font-bold transition-all shadow-md ${
                isProcessing
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-teal-600 text-white hover:bg-teal-700 hover:shadow-teal-200"
              }`}
            >
              {isProcessing ? "Checking Availability..." : "Check Availability"}
            </button>
            <button
              onClick={handleOrderNow}
              disabled={
                isProcessing ||
                (availabilityChecked && Object.keys(stockErrors).length > 0)
              }
              className={`py-3 px-10 rounded-xl font-bold transition-all shadow-md ${
                isProcessing ||
                (availabilityChecked && Object.keys(stockErrors).length > 0)
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-[#4c0000] text-white hover:bg-[#7e1010] hover:shadow-red-200"
              }`}
            >
              Order Now
            </button>
          </div>
        </div>
      )}

      {/* Payment Method Selection Modal */}
      <PaymentMethodModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSelectMethod={handlePaymentMethodSelect}
        cartItems={cartItems}
        totalPrice={totalPrice}
      />
    </div>
  );
};

export default ShoppingCart;
