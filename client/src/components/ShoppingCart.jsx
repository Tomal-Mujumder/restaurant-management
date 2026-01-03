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
    const currentCartList = JSON.parse(localStorage.getItem(cartKey) || "[]") || [];
    
    // Remove any duplicates (safety check)
    const uniqueCart = [];
    currentCartList.forEach(item => {
      const existing = uniqueCart.find(c => c.id === item.id);
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
    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
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
  };

  const updateLocalStorage = (updatedCart) => {
    localStorage.setItem(`cart_${userId}`, JSON.stringify(updatedCart));
    // Dispatch event to update header cart count
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (id) => {
    // Remove an item from the cart
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    calculateTotal(updatedCart);
    updateLocalStorage(updatedCart);
    window.dispatchEvent(new Event('cartUpdated'));
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
    setShowPaymentModal(true);
  };

  const handlePaymentMethodSelect = async (method) => {
    setShowPaymentModal(false);

    if (method === "manual") {
      navigate("/checkout/payment", { state: { cartItems, totalPrice, userId } });
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
            <div key={item.id} className="flex items-center mb-6">
              <img
                className="object-cover w-20 h-20 mr-4 rounded-lg"
                src={item.image || 'https://i.pinimg.com/originals/2b/f0/e0/2bf0e06f26135c159a64591c817f639e.jpg'}
                alt={item.foodName}
                onError={(e) => {
                  e.target.src = 'https://i.pinimg.com/originals/2b/f0/e0/2bf0e06f26135c159a64591c817f639e.jpg';
                }}
              />
              <div className="flex flex-col">
                <span className="text-lg font-medium">{item.foodName}</span>
                <span className="text-lg font-semibold"> {formatCurrencyWithCode(item.price)}</span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="ml-4 font-medium text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
              <div className="flex items-center ml-auto">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  disabled={item.quantity <= 1}
                  className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => {
                    const newQty = parseInt(e.target.value) || 1;
                    if (newQty >= 1) {
                      const updatedCart = cartItems.map(cartItem =>
                        cartItem.id === item.id ? { ...cartItem, quantity: newQty } : cartItem
                      );
                      setCartItems(updatedCart);
                      calculateTotal(updatedCart);
                      updateLocalStorage(updatedCart);
                    }
                  }}
                  min="1"
                  className="w-16 mx-2 text-center border border-gray-300 rounded"
                />
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  +
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-between pt-6 border-t">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-lg font-semibold">{formatCurrencyWithCode(totalPrice)}</span>
          </div>
          <div className="flex justify-end mt-4">
            <button 
              onClick={handleOrderNow} 
              disabled={isProcessing}
              className={`text-white py-2 px-4 rounded-md ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#4c0000] hover:bg-[#7e1010]'}`}
            >
              {isProcessing ? 'Processing...' : 'Order Now'}
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
