import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { MdOutlineShoppingCart } from "react-icons/md";
import { HiMenuAlt2, HiFilter } from "react-icons/hi";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import { formatCurrencyWithCode } from "../utils/currency";

import FeaturedFoodCard from "../components/FeaturedFoodCard";
import Sidebar from "../components/Sidebar";

export default function Item() {
  const [foodItems, setFoodItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  // Open sidebar by default on large screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Filter State
  const [filters, setFilters] = useState({
    search: "",
    category: "All",
    priceRange: [0, 5000], // Default range, will be updated after data load
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const navigate = useNavigate();

  // Fetch all food items initially
  const fetchFoodItems = async () => {
    try {
      const response = await fetch("/api/foods/getAllFoods");

      if (!response.ok) {
        throw new Error("Failed to fetch food items");
      }

      const data = await response.json();
      if (data.foodItems) {
        // Fetch stock for each item
        const itemsWithStock = await Promise.all(
          data.foodItems.map(async (item) => {
            try {
              const stockRes = await fetch(`/api/stock/${item._id}`);
              if (stockRes.ok) {
                const stockData = await stockRes.json();
                return { ...item, stock: stockData.quantity };
              }
              return { ...item, stock: 0 };
            } catch (err) {
              return { ...item, stock: 0 };
            }
          })
        );
        setFoodItems(itemsWithStock);
        setError(null);
      } else {
        setFoodItems([]);
        setError("No items found");
      }
    } catch (error) {
      setError(error.message);
      setFoodItems([]);
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

  // Update price range when items are loaded
  useEffect(() => {
    if (foodItems.length > 0) {
      const prices = foodItems.map((item) => item.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      // Only set if not already interacting? For now set initially to cover full range.
      setFilters((prev) => ({
        ...prev,
        priceRange: [0, max + 500],
      }));
    }
  }, [foodItems]);

  // Add food item to the cart (Code preserved)
  const addToCart = (item) => {
    const userId = currentUser?._id;
    if (!userId) {
      showToast("Please login first to add items to cart", "error");
      navigate("/signin");
      return;
    }
    const cartKey = `cart_${userId}`;
    const currentCartList = JSON.parse(localStorage.getItem(cartKey) || "[]");

    const existingItemIndex = currentCartList.findIndex(
      (cartItem) => cartItem.id === item._id
    );

    const availableStock = item.stock || 0;

    if (existingItemIndex > -1) {
      if (currentCartList[existingItemIndex].quantity + 1 > availableStock) {
        showToast(`Only ${availableStock} units available`, "error");
        return;
      }
      currentCartList[existingItemIndex].quantity += 1;
    } else {
      if (availableStock < 1) {
        showToast("Out of stock", "error");
        return;
      }
      currentCartList.push({
        id: item._id,
        quantity: 1,
        price: item.price,
        foodName: item.foodName,
        image: item.image,
      });
    }

    localStorage.setItem(cartKey, JSON.stringify(currentCartList));
    setCartCount(currentCartList.length);

    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(new Event("storage"));

    showToast("Item added to cart!");
  };

  const showToast = (message, type = "success") => {
    Toastify({
      text: message,
      duration: 3000,
      close: true,
      gravity: "top",
      position: "right",
      backgroundColor:
        type === "error"
          ? "linear-gradient(to right, #ff5f6d, #ffc371)"
          : "linear-gradient(to right, #4caf50, #81c784)",
    }).showToast();
  };

  useEffect(() => {
    fetchFoodItems();
    updateCartCount();
  }, []);

  const { currentUser } = useSelector((state) => state.user);

  // --- Derived State for Filters ---

  // 1. Dynamic Categories
  const categories = useMemo(() => {
    // Get unique categories from foodItems
    const uniqueCats = [...new Set(foodItems.map((item) => item.category))];
    // Filter out undefined/null if any
    return uniqueCats.filter(Boolean).sort();
  }, [foodItems]);

  // 2. Min/Max Price for Slider Bounds
  const { minPrice, maxPrice } = useMemo(() => {
    if (foodItems.length === 0) return { minPrice: 0, maxPrice: 1000 };
    const prices = foodItems.map((item) => item.price);
    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    };
  }, [foodItems]);

  // 3. Filtered Items Logic
  const filteredItems = useMemo(() => {
    return foodItems.filter((item) => {
      const matchesSearch = item.foodName
        .toLowerCase()
        .includes(filters.search.toLowerCase());
      const matchesCategory =
        filters.category === "All" || item.category === filters.category;
      const matchesPrice =
        item.price >= filters.priceRange[0] &&
        item.price <= filters.priceRange[1];

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [foodItems, filters]);

  // Pagination Logic
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = useMemo(() => {
    return filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredItems, indexOfFirstItem, indexOfLastItem]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={`px-3 py-1 mx-1 rounded-md transition-all ${
            currentPage === 1
              ? "bg-blue-600 text-white shadow-md"
              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
          }`}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="dots-start" className="px-2 text-gray-500">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded-md transition-all ${
            currentPage === i
              ? "bg-blue-600 text-white shadow-md"
              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="dots-end" className="px-2 text-gray-500">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`px-3 py-1 mx-1 rounded-md transition-all ${
            currentPage === totalPages
              ? "bg-blue-600 text-white shadow-md"
              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Sidebar Toggle - Visible on all devices */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex items-center gap-2 bg-[#e93b92] text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors shadow-sm"
            >
              <HiFilter /> {isSidebarOpen ? "Hide Filters" : "Show Filters"}
            </button>
            <h1 className="text-xl font-bold text-gray-800 hidden sm:block">
              Menu
            </h1>
          </div>

          <div className="relative flex items-center gap-4">
            <Link to={`/shoppingCart`} className="relative group">
              <span className="text-3xl text-gray-700 group-hover:text-[#e93b92] transition-colors">
                <MdOutlineShoppingCart />
              </span>
              {cartCount > 0 && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#e93b92] text-white text-xs font-bold flex items-center justify-center rounded-full">
                  {cartCount}
                </div>
              )}
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-1 max-w-[1400px] w-full mx-auto relative items-start">
        {/* Sidebar Component */}
        <Sidebar
          filters={filters}
          setFilters={setFilters}
          categories={categories}
          minPrice={minPrice}
          maxPrice={maxPrice}
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 w-full">
          {error ? (
            <div className="text-center py-10">
              <p className="text-red-500">{error}</p>
              <button
                onClick={fetchFoodItems}
                className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Retry
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <div className="mb-4 text-gray-300 text-6xl flex justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-24 w-24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900">
                No items found
              </h3>
              <p className="text-gray-500 mt-1">
                Try adjusting your filters to find what you're looking for.
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-semibold">
                    {Math.min(indexOfFirstItem + 1, totalItems)}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold">
                    {Math.min(indexOfLastItem, totalItems)}
                  </span>{" "}
                  of <span className="font-semibold">{totalItems}</span> items
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {currentItems.map((item) => (
                  <FeaturedFoodCard key={item._id} food={item} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="flex items-center">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm font-medium mr-2"
                    >
                      Previous
                    </button>

                    <div className="flex items-center">
                      {renderPageNumbers()}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm font-medium ml-2"
                    >
                      Next
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
