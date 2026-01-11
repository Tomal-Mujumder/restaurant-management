import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Modal, Button } from "flowbite-react";
import { HiEye, HiShoppingBag, HiPrinter } from "react-icons/hi";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

export default function UserOrders() {
  const { currentUser } = useSelector((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (currentUser?._id) {
      fetchUserOrders();
    }
  }, [currentUser]);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);

      // Get token from cookies or localStorage
      const token =
        localStorage.getItem("token") ||
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("access_token="))
          ?.split("=")[1];

      if (!token) {
        console.error("No authentication token found");
        Toastify({
          text: "Please login to view orders",
          style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" },
          duration: 3000,
          gravity: "top",
          position: "right",
        }).showToast();
        setLoading(false);
        return;
      }

      // Fetch from Payment collection by userId
      const response = await fetch(`/api/payment/user/${currentUser._id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include", // Include cookies
      });

      if (response.ok) {
        const data = await response.json();
        // Sort by createdAt descending (newest first)
        const sortedOrders = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedOrders);
      } else if (response.status === 401) {
        console.error("Unauthorized - please login again");
        Toastify({
          text: "Session expired. Please login again.",
          style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" },
          duration: 3000,
          gravity: "top",
          position: "right",
        }).showToast();
      } else {
        console.error("Failed to fetch orders:", response.status);
        Toastify({
          text: "Failed to load orders. Please try again.",
          style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" },
          duration: 3000,
          gravity: "top",
          position: "right",
        }).showToast();
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      Toastify({
        text: "Network error. Please check your connection.",
        style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" },
        duration: 3000,
        gravity: "top",
        position: "right",
      }).showToast();
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  // Get payment status color
  const getPaymentStatusColor = (isChecked) => {
    return isChecked
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-700">Loading your orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          My Orders
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your order history and payment details
        </p>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <HiShoppingBag className="mx-auto text-gray-400 text-6xl mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
            No orders found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            You haven't placed any orders yet
          </p>
          <button
            onClick={() => (window.location.href = "/item")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <div
              key={order._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition"
            >
              {/* Order Header */}
              <div className="flex flex-wrap justify-between items-start mb-4 gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                      Order #{orders.length - index}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(
                        order.isChecked
                      )}`}
                    >
                      {order.isChecked ? "Completed" : "Pending"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>
                      <span className="font-medium">Order Date:</span>{" "}
                      {formatDate(order.createdAt)}
                    </p>
                    <p>
                      <span className="font-medium">Token Number:</span>{" "}
                      <span className="text-blue-600 dark:text-blue-400 font-bold">
                        {order.tokenNumber}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Transaction ID:</span>{" "}
                      <span className="font-mono text-xs">
                        {order.transactionId || order.paymentInfo?.cardNumber}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    BDT {order.totalPrice?.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {order.cartItems?.length || 0} item
                    {order.cartItems?.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Items:
                </h4>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                  {order.cartItems?.slice(0, 4).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex-shrink-0 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 min-w-[200px]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate dark:text-gray-200">
                            {item.foodName}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Qty: {item.quantity} × BDT {item.price}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {order.cartItems?.length > 4 && (
                    <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 min-w-[100px] flex items-center justify-center">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">
                        +{order.cartItems.length - 4} more
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Payment Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Card Type
                    </p>
                    <p className="font-semibold">
                      {order.paymentInfo?.cardType || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Card Name
                    </p>
                    <p className="font-semibold">
                      {order.paymentInfo?.cardName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Card Number
                    </p>
                    <p className="font-semibold">
                      **** **** **** {order.paymentInfo?.cardNumber?.slice(-4)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Expiry Date
                    </p>
                    <p className="font-semibold">
                      {order.paymentInfo?.expirationDate || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              {order.shipmentData && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Delivery Information
                  </h4>
                  <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">
                          Recipient
                        </p>
                        <p className="font-semibold">
                          {order.shipmentData?.fullName || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">
                          Mobile Number
                        </p>
                        <p className="font-semibold">
                          {order.shipmentData?.mobileNumber || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">
                        Shipping Address
                      </p>
                      <p className="font-semibold">
                        {order.shipmentData?.shippingAddress || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">
                        Delivery Type
                      </p>
                      <p className="font-semibold">
                        {order.shipmentData?.deliveryType || "N/A"}
                      </p>
                    </div>
                    {order.shipmentData?.specialInstructions && (
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">
                          Special Instructions
                        </p>
                        <p className="font-semibold">
                          {order.shipmentData.specialInstructions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleViewDetails(order)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  <HiEye className="text-lg" />
                  View Full Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      <Modal
        show={showDetailsModal}
        size="3xl"
        onClose={() => setShowDetailsModal(false)}
      >
        <Modal.Header>Order Details</Modal.Header>
        <Modal.Body
          className="dark:bg-gray-800 dark:text-white"
          id="order-details-print"
        >
          {selectedOrder && (
            <div className="space-y-6">
              {/* Print Header (Visible only when printing) */}
              <div className="hidden print:block border-b-2 border-gray-200 pb-4 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      Order Invoice
                    </h1>
                    <p className="text-sm text-gray-500">
                      Banglar Heshel Restaurant
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-600">
                      Generated on: {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Token Number
                  </p>
                  <p className="font-bold text-blue-600 dark:text-blue-400 text-xl">
                    {selectedOrder.tokenNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Transaction ID
                  </p>
                  <p className="font-mono text-sm">
                    {selectedOrder.transactionId ||
                      selectedOrder.paymentInfo?.cardNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Order Date
                  </p>
                  <p className="font-semibold">
                    {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Status
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(
                      selectedOrder.isChecked
                    )}`}
                  >
                    {selectedOrder.isChecked ? "Completed" : "Pending"}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Total Amount
                  </p>
                  <p className="font-bold text-xl">
                    BDT {selectedOrder.totalPrice?.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.cartItems?.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.foodName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Quantity: {item.quantity} × BDT {item.price}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">
                          BDT {(item.quantity * item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Payment Details</h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      Card Type:
                    </span>
                    <span className="font-semibold">
                      {selectedOrder.paymentInfo?.cardType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      Card Name:
                    </span>
                    <span className="font-semibold">
                      {selectedOrder.paymentInfo?.cardName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      Card Number:
                    </span>
                    <span className="font-semibold">
                      **** **** ****{" "}
                      {selectedOrder.paymentInfo?.cardNumber?.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      Expiry:
                    </span>
                    <span className="font-semibold">
                      {selectedOrder.paymentInfo?.expirationDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Details */}
              {selectedOrder.shipmentData && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">
                    Delivery Information
                  </h3>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <p>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Name:
                      </span>{" "}
                      {selectedOrder.shipmentData?.fullName}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Phone:
                      </span>{" "}
                      {selectedOrder.shipmentData?.mobileNumber}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Address:
                      </span>{" "}
                      {selectedOrder.shipmentData?.shippingAddress}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Delivery Type:
                      </span>{" "}
                      {selectedOrder.shipmentData?.deliveryType}
                    </p>
                    {selectedOrder.shipmentData?.specialInstructions && (
                      <p>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Special Instructions:
                        </span>{" "}
                        {selectedOrder.shipmentData.specialInstructions}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="dark:bg-gray-800">
          <Button
            color="blue"
            onClick={() => window.print()}
            className="print:hidden"
          >
            <HiPrinter className="mr-2 h-5 w-5" />
            Print
          </Button>
          <Button
            color="gray"
            onClick={() => setShowDetailsModal(false)}
            className="print:hidden"
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
