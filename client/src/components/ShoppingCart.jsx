import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import PaymentMethodModal from "./PaymentMethodModal";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import { formatCurrencyWithCode } from "../utils/currency";
import { Label, TextInput, Textarea, Select } from "flowbite-react";

const ShoppingCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stockErrors, setStockErrors] = useState({});
  const [availabilityChecked, setAvailabilityChecked] = useState(false);

  // Shipment form data
  const [shipmentData, setShipmentData] = useState({
    fullName: "",
    mobileNumber: "",
    shippingAddress: "",
    deliveryType: "",
    specialInstructions: "",
  });

  // Validation errors
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

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

  // Auto-fill shipment data from user profile
  useEffect(() => {
    if (currentUser) {
      setShipmentData({
        fullName: currentUser.name || currentUser.username || "",
        mobileNumber: currentUser.contactNumber || "",
        shippingAddress:
          currentUser.shippingAddress || currentUser.address || "",
        deliveryType: currentUser.deliveryType || "",
        specialInstructions: "",
      });
    }
  }, [currentUser]);

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

  // Handle form input changes
  const handleShipmentChange = (e) => {
    const { name, value } = e.target;
    setShipmentData({
      ...shipmentData,
      [name]: value,
    });

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Handle field blur (when user leaves the field)
  const handleBlur = (fieldName) => {
    setTouched({ ...touched, [fieldName]: true });
    validateField(fieldName, shipmentData[fieldName]);
  };

  // Validate individual field
  const validateField = (fieldName, value) => {
    let error = "";

    switch (fieldName) {
      case "fullName":
        if (!value.trim()) {
          error = "Name is required";
        }
        break;
      case "mobileNumber":
        if (!value.trim()) {
          error = "Mobile number is required";
        } else if (!/^\d{11}$/.test(value)) {
          error = "Mobile number must be exactly 11 digits";
        }
        break;
      case "shippingAddress":
        if (!value.trim()) {
          error = "Shipping address is required";
        }
        break;
      case "deliveryType":
        if (!value) {
          error = "Please select a delivery type";
        }
        break;
    }

    setErrors((prev) => ({ ...prev, [fieldName]: error }));
    return error === "";
  };

  // Validate all fields
  const validateAllFields = () => {
    const newErrors = {};

    if (!shipmentData.fullName.trim()) {
      newErrors.fullName = "Name is required";
    }

    if (!shipmentData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^\d{11}$/.test(shipmentData.mobileNumber)) {
      newErrors.mobileNumber = "Mobile number must be exactly 11 digits";
    }

    if (!shipmentData.shippingAddress.trim()) {
      newErrors.shippingAddress = "Shipping address is required";
    }

    if (!shipmentData.deliveryType) {
      newErrors.deliveryType = "Please select a delivery type";
    }

    setErrors(newErrors);
    setTouched({
      fullName: true,
      mobileNumber: true,
      shippingAddress: true,
      deliveryType: true,
    });

    return Object.keys(newErrors).length === 0;
  };

  // Check if form is valid (for enabling Order Now button)
  const isFormValid = () => {
    return (
      shipmentData.fullName.trim() !== "" &&
      shipmentData.mobileNumber.trim() !== "" &&
      /^\d{11}$/.test(shipmentData.mobileNumber) &&
      shipmentData.shippingAddress.trim() !== "" &&
      shipmentData.deliveryType !== ""
    );
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

    if (!validateAllFields()) {
      Toastify({
        text: "Please fill all required fields correctly!",
        style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" },
        duration: 3000,
        gravity: "top",
        position: "right",
      }).showToast();
      return;
    }

    setShowPaymentModal(true);
  };

  const handlePaymentMethodSelect = async (method) => {
    setShowPaymentModal(false);

    if (method === "cod") {
      navigate("/checkout/cod", {
        state: { cartItems, totalPrice, userId, shipmentData },
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
            shipmentData, // Include shipment data
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
        <div className="flex flex-col gap-8">
          {/* Cart Items Section */}
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
              <span className="text-xl font-bold text-gray-800">
                Order Total
              </span>
              <span className="text-2xl font-black text-[#e93b92]">
                {formatCurrencyWithCode(totalPrice)}
              </span>
            </div>
          </div>

          {/* Shipment Information Form */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Delivery Information
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please fill in all required fields marked with *
            </p>

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <Label htmlFor="fullName" className="text-gray-700 font-medium">
                  Full Name <span className="text-red-600">*</span>
                </Label>
                <TextInput
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={shipmentData.fullName}
                  onChange={handleShipmentChange}
                  onBlur={() => handleBlur("fullName")}
                  color={
                    touched.fullName && errors.fullName ? "failure" : "gray"
                  }
                  helperText={
                    touched.fullName && errors.fullName ? (
                      <span className="font-medium">{errors.fullName}</span>
                    ) : null
                  }
                  className="mt-1"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <Label
                  htmlFor="mobileNumber"
                  className="text-gray-700 font-medium"
                >
                  Mobile Number (11 digits){" "}
                  <span className="text-red-600">*</span>
                </Label>
                <TextInput
                  id="mobileNumber"
                  name="mobileNumber"
                  type="text"
                  placeholder="e.g., 01712345678"
                  value={shipmentData.mobileNumber}
                  onChange={handleShipmentChange}
                  onBlur={() => handleBlur("mobileNumber")}
                  maxLength={11}
                  color={
                    touched.mobileNumber && errors.mobileNumber
                      ? "failure"
                      : "gray"
                  }
                  helperText={
                    touched.mobileNumber && errors.mobileNumber ? (
                      <span className="font-medium">{errors.mobileNumber}</span>
                    ) : null
                  }
                  className="mt-1"
                />
              </div>

              {/* Shipping Address */}
              <div>
                <Label
                  htmlFor="shippingAddress"
                  className="text-gray-700 font-medium"
                >
                  Shipping Address <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  id="shippingAddress"
                  name="shippingAddress"
                  placeholder="Enter your complete address (House/Flat, Street, Area, City)"
                  value={shipmentData.shippingAddress}
                  onChange={handleShipmentChange}
                  onBlur={() => handleBlur("shippingAddress")}
                  rows={3}
                  color={
                    touched.shippingAddress && errors.shippingAddress
                      ? "failure"
                      : "gray"
                  }
                  helperText={
                    touched.shippingAddress && errors.shippingAddress ? (
                      <span className="font-medium">
                        {errors.shippingAddress}
                      </span>
                    ) : null
                  }
                  className="mt-1"
                />
              </div>

              {/* Delivery Type */}
              <div>
                <Label
                  htmlFor="deliveryType"
                  className="text-gray-700 font-medium"
                >
                  Delivery Type <span className="text-red-600">*</span>
                </Label>
                <Select
                  id="deliveryType"
                  name="deliveryType"
                  value={shipmentData.deliveryType}
                  onChange={handleShipmentChange}
                  onBlur={() => handleBlur("deliveryType")}
                  color={
                    touched.deliveryType && errors.deliveryType
                      ? "failure"
                      : "gray"
                  }
                  helperText={
                    touched.deliveryType && errors.deliveryType ? (
                      <span className="font-medium">{errors.deliveryType}</span>
                    ) : null
                  }
                  className="mt-1"
                >
                  <option value="">-- Select Delivery Location --</option>
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="School">School</option>
                </Select>
              </div>

              {/* Special Instructions */}
              <div>
                <Label
                  htmlFor="specialInstructions"
                  className="text-gray-700 font-medium"
                >
                  Special Instructions (Optional)
                </Label>
                <Textarea
                  id="specialInstructions"
                  name="specialInstructions"
                  placeholder="Any special delivery instructions? (e.g., Call before delivery, Ring the doorbell)"
                  value={shipmentData.specialInstructions}
                  onChange={handleShipmentChange}
                  rows={2}
                  className="mt-1"
                />
              </div>
            </div>
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
                (availabilityChecked && Object.keys(stockErrors).length > 0) ||
                !isFormValid()
              }
              className={`py-3 px-10 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
                isProcessing ||
                (availabilityChecked && Object.keys(stockErrors).length > 0) ||
                !isFormValid()
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-[#4c0000] text-white hover:bg-[#7e1010] hover:shadow-red-200"
              }`}
            >
              {!isFormValid() ? "Fill Required Fields" : "Order Now"}
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
