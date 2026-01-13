import React, { useRef } from "react";
import { FaPrint, FaTimes } from "react-icons/fa";
import { useReactToPrint } from "react-to-print";
import { formatCurrencyWithCode } from "../utils/currency";

const OrderDetailsModal = ({ order, isOpen, onClose }) => {
  const contentRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Order_${order?.tokenNumber}`,
  });

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] p-6 mx-4 bg-white rounded-lg shadow-xl overflow-y-auto">
        {/* Header with Close & Print */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
          <div className="flex gap-4">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPrint /> Print
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-red-500 transition-colors"
            >
              <FaTimes size={24} />
            </button>
          </div>
        </div>

        {/* Printable Content Area */}
        <div ref={contentRef} className="p-4 print-container">
          {/* Restaurant Header - Visible during print only */}
          <div className="hidden print-header text-center mb-8 border-b-2 border-gray-100 pb-4">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              Banglar Heshel Restaurant
            </h1>
            <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-semibold">
              Quality Food & Traditional Taste
            </p>
          </div>

          {/* Header Section */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Token #{order.tokenNumber}
              </h1>
              <p className="text-sm text-gray-500">
                Placed on: {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <div
              className={`px-4 py-1 rounded-full text-sm font-semibold ${
                order.isChecked
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {order.isChecked ? "Completed" : "Pending"}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Customer Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                Customer Info
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {order.userId?.name || order.userId?.username || "Guest"}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {order.userId?.email || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Contact:</span>{" "}
                  {order.userId?.contactNumber || "N/A"}
                </p>
              </div>
            </div>

            {/* Shipment Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                Delivery Details
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                {order.shipmentData ? (
                  <>
                    <p>
                      <span className="font-medium">Recipient:</span>{" "}
                      {order.shipmentData.fullName}
                    </p>
                    <p>
                      <span className="font-medium">Mobile:</span>{" "}
                      {order.shipmentData.mobileNumber}
                    </p>
                    <p>
                      <span className="font-medium">Address:</span>{" "}
                      {order.shipmentData.shippingAddress}
                    </p>
                    <p>
                      <span className="font-medium">Type:</span>{" "}
                      {order.shipmentData.deliveryType}
                    </p>
                  </>
                ) : (
                  <p className="italic text-gray-400">
                    No shipment data available
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mb-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              Payment Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <p>
                <span className="font-medium">Method:</span>{" "}
                {order.paymentInfo?.cardType || "N/A"}
              </p>
              <p>
                <span className="font-medium">Transaction ID:</span>{" "}
                {order.paymentInfo?.cardNumber || order.transactionId || "N/A"}
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                {order.isChecked ? "Paid & Verified" : "Pending Verification"}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Order Items
            </h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm">
                  <th className="p-3 border-b">Item Name</th>
                  <th className="p-3 border-b text-center">Qty</th>
                  <th className="p-3 border-b text-right">Unit Price</th>
                  <th className="p-3 border-b text-right">Total</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-600">
                {order.cartItems.map((item, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-3">{item.foodName}</td>
                    <td className="p-3 text-center">{item.quantity}</td>
                    <td className="p-3 text-right">{item.price}</td>
                    <td className="p-3 text-right font-medium">
                      {(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="flex justify-end">
            <div className="w-full md:w-1/2 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  {formatCurrencyWithCode(order.totalPrice)}
                </span>
              </div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-gray-600">Delivery Charge (Est.)</span>
                {/* Logic to display delivery charge if needed, specifically for COD based on user prompt logic or existing data. 
                     Since we don't store delivery charge separately in the model (based on previous files), we might just show Total Price as stored. 
                     User prompt showed "Delivery charges will be added...", implying it might be extra or part of total. 
                     However, the backend save logic just saved `totalPrice`. 
                     Let's verify if `totalPrice` included delivery. 
                     If not, just showing Total Price as per DB record is safest. 
                 */}
                <span className="font-medium text-gray-500">
                  Included/Collect on Delivery
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200 text-lg font-bold text-gray-800">
                <span>Grand Total</span>
                <span className="text-teal-600">
                  {formatCurrencyWithCode(order.totalPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Print Footer */}
          <div className="hidden print-footer mt-10 pt-10 border-t text-center text-xs text-gray-400">
            <p>Thank you for dining with us!</p>
            <p>For any queries, please contact support.</p>
          </div>
        </div>

        {/* Style for Print */}
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-container, .print-container * {
              visibility: visible;
            }
            .print-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20px;
            }
            .print-header, .print-footer {
               display: block !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
