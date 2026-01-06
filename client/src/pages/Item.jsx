import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { MdOutlineShoppingCart } from "react-icons/md";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import { formatCurrencyWithCode } from "../utils/currency";

import FeaturedFoodCard from "../components/FeaturedFoodCard";

export default function Item() {
  const [foodItems, setFoodItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [error, setError] = useState(null); // State for handling errors
  const navigate = useNavigate();

  // Fetch all food items based on search
  const fetchFoodItems = async () => {
    try {
      const response = await fetch(
        `/api/foods/getAllFoods?search=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch food items");
      }

      const data = await response.json();
      if (data.foodItems) {
        setFoodItems(data.foodItems);
        setError(null);
      } else {
        setFoodItems([]); // Set empty if no items found
        setError("No items found");
      }
    } catch (error) {
      setError(error.message);
      setFoodItems([]); // Handle error by resetting the foodItems
    }
  };

  // Update cart count
  const updateCartCount = () => {
    const userId = currentUser?._id;
    if (userId) {
      const userCart = JSON.parse(
        localStorage.getItem(`cart_${userId}`) || "[]"
      );
      setCartCount(userCart.length);
    }
  };

  // Add food item to the cart
  const addToCart = (item) => {
    const userId = currentUser?._id;
    if (!userId) {
      showToast("Please login first to add items to cart");
      navigate("/signin");
      return;
    }
    const cartKey = `cart_${userId}`;
    const currentCartList = JSON.parse(localStorage.getItem(cartKey) || "[]");

    // Check if item exists using consistent ID property
    const existingItemIndex = currentCartList.findIndex(
      (cartItem) => cartItem.id === item._id
    );

    if (existingItemIndex > -1) {
      currentCartList[existingItemIndex].quantity += 1;
    } else {
      currentCartList.push({
        id: item._id,
        quantity: 1,
        price: item.price,
        foodName: item.foodName,
        image: item.image,
      });
    }

    localStorage.setItem(cartKey, JSON.stringify(currentCartList));
    setCartCount(currentCartList.length); // This might be redundant if the header handles it, but keeps local state in sync if used

    // Dispatch event AFTER localStorage update
    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(new Event("storage"));

    showToast("Item added to cart!");
  };

  // Handle "Buy Now" button click
  const handleBuyNow = (item) => {
    if (!currentUser?._id) {
      showToast("Please login first to add items to cart");
      navigate("/signin");
      return;
    }
    addToCart(item);
    window.dispatchEvent(new Event("cartUpdated"));
    navigate(`/shoppingCart`);
  };

  // Show toast notification
  const showToast = (message) => {
    Toastify({
      text: message,
      duration: 3000,
      close: true,
      gravity: "top",
      position: "right",
      backgroundColor: "linear-gradient(to right, #4caf50, #81c784)",
    }).showToast();
  };

  useEffect(() => {
    fetchFoodItems();
    updateCartCount();
  }, [searchTerm]); // Re-fetch food items on search term change

  const { currentUser } = useSelector((state) => state.user);

  return (
    <div className="min-h-screen">
      {/* Top bar with "Add Your Item", Cart and Search */}
      <div className="flex items-center justify-between p-4 bg-gray-100">
        {/* <h1 className="text-2xl font-bold text-gray-700">Add Your Item</h1> */}
        <div className="flex items-center gap-4"></div>
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search Food..."
            className="block w-full pl-20 pr-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-blue-500 focus:border-blue-500 focus:bg-white focus:shadow-lg transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative flex items-center">
          <Link to={`/shoppingCart`}>
            <span className="text-3xl text-black">
              <MdOutlineShoppingCart />
            </span>
          </Link>
          <div className="absolute flex items-center justify-center w-5 h-5 p-1 text-white bg-black rounded-full -top-2 -right-2">
            <p className="text-sm">{cartCount}</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex items-center justify-center pb-20">
        <div className="max-w-[1200px] mx-auto">
          {error ? (
            <p className="text-red-600 dark:text-red-400">{error}</p>
          ) : foodItems.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">
              No items available
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {foodItems.map((item) => (
                <FeaturedFoodCard key={item._id} food={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
