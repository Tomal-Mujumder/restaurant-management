import React, { useEffect, useState } from "react";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import { formatCurrencyWithCode } from "../utils/currency";
import { HiSearch, HiPencilAlt, HiCog } from "react-icons/hi";

export default function StockManagement() {
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);

  // Form States
  const [adjustFormData, setAdjustFormData] = useState({
    quantity: 0,
    type: "increase", // 'increase' or 'decrease'
    reason: "",
  });

  const [thresholdFormData, setThresholdFormData] = useState({
    minThreshold: 0,
    maxThreshold: 0,
  });

  // Fetch Stocks
  const fetchStocks = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stock/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setStocks(data);
        setFilteredStocks(data);
      } else {
        throw new Error(data.message || "Failed to fetch stocks");
      }
    } catch (error) {
      console.error("Error fetching stocks:", error);
      Toastify({
        text: "Error fetching stock data!",
        backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        duration: 3000,
        gravity: "top",
        position: "right",
      }).showToast();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  // Search Logic
  useEffect(() => {
    if (searchQuery) {
      const filtered = stocks.filter((stock) =>
        stock.foodId.foodName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStocks(filtered);
    } else {
      setFilteredStocks(stocks);
    }
  }, [searchQuery, stocks]);

  // Open Modals
  const openAdjustModal = (stock) => {
    setSelectedStock(stock);
    setAdjustFormData({ quantity: 0, type: "increase", reason: "" });
    setShowAdjustModal(true);
  };

  const openThresholdModal = (stock) => {
    setSelectedStock(stock);
    setThresholdFormData({
      minThreshold: stock.minThreshold,
      maxThreshold: stock.maxThreshold,
    });
    setShowThresholdModal(true);
  };

  // Handle Adjust Submit
  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStock) return;

    // Calculate actual adjustment
    // If 'decrease', we send negative quantity or the backend handles math?
    // The backend updateStock takes 'quantity' (new total) OR 'adjustment'?
    // Checking backend... updateStock logic: newQty = Number(quantity).
    // Wait, the backend logic I wrote says:
    // const newQty = Number(quantity); stock.quantity = newQty;
    // It sets the absolute quantity, not relative!
    // Wait, let me re-read the backend requirement/implementation in Part 2.
    // "updateStock - Manual stock adjustment... inputs: quantity, reason".
    // Implementation: stock.quantity = newQty.
    // So I need to calculate the new total here on frontend.

    let newQuantity = selectedStock.quantity;
    const adjustAmount = Number(adjustFormData.quantity);

    if (adjustFormData.type === "increase") {
      newQuantity += adjustAmount;
    } else {
      newQuantity -= adjustAmount;
    }

    if (newQuantity < 0) {
      Toastify({
        text: "Stock cannot be negative!",
        backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        duration: 3000,
      }).showToast();
      return;
    }

    try {
      const response = await fetch(
        `/api/stock/update/${selectedStock.foodId._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            quantity: newQuantity,
            reason: adjustFormData.reason || `Manual ${adjustFormData.type}`,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        Toastify({
          text: "Stock updated successfully!",
          backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
          duration: 3000,
        }).showToast();
        fetchStocks(); // Refresh data
        setShowAdjustModal(false);
      } else {
        throw new Error(data.message || "Failed to update stock");
      }
    } catch (error) {
      Toastify({
        text: error.message,
        backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        duration: 3000,
      }).showToast();
    }
  };

  // Handle Threshold Submit
  const handleThresholdSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStock) return;

    try {
      const response = await fetch(
        `/api/stock/threshold/${selectedStock.foodId._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(thresholdFormData),
        }
      );

      const data = await response.json();
      if (response.ok) {
        Toastify({
          text: "Thresholds updated successfully!",
          backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
          duration: 3000,
        }).showToast();
        fetchStocks();
        setShowThresholdModal(false);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      Toastify({
        text: error.message,
        backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        duration: 3000,
      }).showToast();
    }
  };

  // Badge Logic
  const getStockBadge = (stock) => {
    if (stock.quantity < stock.minThreshold) {
      return (
        <span className="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">
          Low Stock
        </span>
      );
    } else if (stock.quantity < stock.maxThreshold) {
      return (
        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">
          Medium Stock
        </span>
      );
    } else {
      return (
        <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
          Good Stock
        </span>
      );
    }
  };

  const getImageSrc = (item) => {
    if (item.images && item.images.length > 0) return item.images[0];
    return item.image; // Fallback
  };

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg p-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Stock Management
        </h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <HiSearch className="w-5 h-5 text-gray-500" />
          </div>
          <input
            type="text"
            className="block p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search food items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading stock data...</div>
      ) : filteredStocks.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400 text-center py-4">
          No stock records found.
        </p>
      ) : (
        <table className="w-full text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Image
              </th>
              <th scope="col" className="px-6 py-3">
                Food Name
              </th>
              <th scope="col" className="px-6 py-3">
                Stock Level
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              <th scope="col" className="px-6 py-3">
                Thresholds (Min/Max)
              </th>
              <th scope="col" className="px-6 py-3">
                Last Restocked
              </th>
              <th scope="col" className="px-6 py-3">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.map((stock) => (
              <tr
                key={stock._id}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <td className="p-4">
                  <img
                    src={getImageSrc(stock.foodId)}
                    className="w-12 h-12 object-cover rounded"
                    alt={stock.foodId.foodName}
                  />
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {stock.foodId.foodName}
                </td>
                <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                  {stock.quantity} {stock.unit}
                </td>
                <td className="px-6 py-4">{getStockBadge(stock)}</td>
                <td className="px-6 py-4 text-gray-700">
                  {stock.minThreshold} / {stock.maxThreshold}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(stock.lastRestocked).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button
                    onClick={() => openAdjustModal(stock)}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200"
                    title="Adjust Stock"
                  >
                    <HiPencilAlt /> Adjust
                  </button>
                  <button
                    onClick={() => openThresholdModal(stock)}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-purple-600 bg-purple-100 rounded-lg hover:bg-purple-200"
                    title="Set Thresholds"
                  >
                    <HiCog /> Set
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Adjust Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6 dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Adjust Stock: {selectedStock?.foodId.foodName}
            </h3>
            <form onSubmit={handleAdjustSubmit}>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Action
                </label>
                <select
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={adjustFormData.type}
                  onChange={(e) =>
                    setAdjustFormData({
                      ...adjustFormData,
                      type: e.target.value,
                    })
                  }
                >
                  <option value="increase">Increase Stock (+)</option>
                  <option value="decrease">Decrease Stock (-)</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg"
                  value={adjustFormData.quantity}
                  onChange={(e) =>
                    setAdjustFormData({
                      ...adjustFormData,
                      quantity: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Reason
                </label>
                <textarea
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg"
                  rows="3"
                  placeholder="e.g. Broken items, New shipment..."
                  value={adjustFormData.reason}
                  onChange={(e) =>
                    setAdjustFormData({
                      ...adjustFormData,
                      reason: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Threshold Modal */}
      {showThresholdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6 dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Set Thresholds: {selectedStock?.foodId.foodName}
            </h3>
            <form onSubmit={handleThresholdSubmit}>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Min Threshold (Low Stock Alert)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg"
                  value={thresholdFormData.minThreshold}
                  onChange={(e) =>
                    setThresholdFormData({
                      ...thresholdFormData,
                      minThreshold: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Max Threshold (Target Stock)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg"
                  value={thresholdFormData.maxThreshold}
                  onChange={(e) =>
                    setThresholdFormData({
                      ...thresholdFormData,
                      maxThreshold: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowThresholdModal(false)}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
