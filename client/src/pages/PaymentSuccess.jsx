import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaCheckCircle, FaSpinner, FaDownload, FaHome } from "react-icons/fa";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { useSelector } from "react-redux";

// PDF Styles
const styles = StyleSheet.create({
  page: { padding: 30, backgroundColor: "#ffffff" },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center", color: "green", fontWeight: "bold" },
  section: { marginBottom: 12 },
  heading: { fontSize: 18, fontWeight: "bold", marginBottom: 6 },
  text: { fontSize: 14, marginBottom: 4 },
  list: { marginLeft: 10, marginBottom: 6 },
  table: { display: "table", width: "auto", marginVertical: 10 },
  tableRow: { margin: "auto", flexDirection: "row" },
  tableCol: { width: "33%", borderStyle: "solid", borderWidth: 1, padding: 5 },
  tableCell: { margin: "auto", marginTop: 5, fontSize: 10 },
  token: { fontSize: 18, fontWeight: "bold", textAlign: "center", marginTop: 20 },
  footer: { textAlign: "center", marginTop: 30, fontSize: 14, color: "#555" },
});

// PDF Component
const ReceiptPDF = ({ orderData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Payment Receipt</Text>
      <Text style={styles.text}>Date: {new Date(orderData.createdAt).toLocaleDateString()}</Text>
      <Text style={styles.text}>Transaction ID: {orderData.paymentInfo?.cardNumber || orderData.tokenNumber}</Text>
      
      <View style={styles.section}>
        <Text style={styles.heading}>Order Summary</Text>
        <View style={styles.table}>
            <View style={styles.tableRow}>
                <View style={styles.tableCol}><Text style={styles.tableCell}>Item</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>Quantity</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>Price</Text></View>
            </View>
            {orderData.cartItems.map((item, index) => (
                <View style={styles.tableRow} key={index}>
                    <View style={styles.tableCol}><Text style={styles.tableCell}>{item.foodName}</Text></View>
                    <View style={styles.tableCol}><Text style={styles.tableCell}>{item.quantity}</Text></View>
                    <View style={styles.tableCol}><Text style={styles.tableCell}>{item.price}</Text></View>
                </View>
            ))}
        </View>
        <Text style={{...styles.text, marginTop: 10, fontWeight: 'bold'}}>Total Amount: {orderData.totalPrice}</Text>
      </View>

      <Text style={styles.footer}>Thank you for dining with us!</Text>
    </Page>
  </Document>
);

const PaymentSuccess = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const tranId = searchParams.get("tranId");
    
    // Use Redux to access current user for cart clearing key
    const { currentUser } = useSelector((state) => state.user);

    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!tranId) {
            setError("No transaction ID found.");
            setLoading(false);
            return;
        }

        const fetchOrderAndClearCart = async () => {
            try {
                // 1. Fetch Order Details
                const res = await fetch(`/api/payment/order/${tranId}`);
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || "Failed to fetch order details.");
                }

                setOrderData(data);

                // 2. Clear Cart (Backend & Frontend)
                // Call backend clear
                await fetch('/api/cart/clear', { method: 'DELETE' });

                // Clear Frontend Storage
                if (currentUser?._id) {
                    localStorage.removeItem(`cart_${currentUser._id}`);
                    // Dispatch event to update navbar cart icon if it listens to storage
                    window.dispatchEvent(new Event('cartUpdated')); 
                }

            } catch (err) {
                console.error("Error processing payment success:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderAndClearCart();
    }, [tranId, currentUser]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-4xl text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">Verifying payment...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                 <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center max-w-md w-full">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
                    <Link to="/" className="text-blue-500 hover:underline">Return Home</Link>
                 </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <div className="max-w-xl w-full bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
                <div className="bg-green-600 p-6 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-sm">
                        <FaCheckCircle className="text-green-600 text-5xl" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
                    <p className="text-green-100">Thank you for your order.</p>
                </div>

                <div className="p-8">
                    {/* Order Summary */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2">Order Summary</h2>
                        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex justify-between">
                                <span className="font-medium">Transaction ID:</span>
                                <span>{orderData?.tokenNumber}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="font-medium">Date:</span>
                                <span>{new Date(orderData?.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between text-base font-bold text-gray-800 dark:text-white pt-2 border-t">
                                <span>Total Amount:</span>
                                <span>{orderData?.totalPrice}</span>
                            </div>
                        </div>
                         {/* Item List Preview (Optional, first few items) */}
                         <div className="mt-4">
                            <p className="font-medium text-gray-700 dark:text-gray-200 mb-2">Items:</p>
                            <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400">
                                {orderData?.cartItems?.map((item, idx) => (
                                    <li key={idx}>{item.foodName} (x{item.quantity}) - {item.price}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <PDFDownloadLink
                            document={<ReceiptPDF orderData={orderData} />}
                            fileName={`Receipt_${orderData?.tokenNumber}.pdf`}
                            className="flex-1"
                        >
                            {({ loading }) => (
                                <button
                                    disabled={loading}
                                    className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold transition-all ${
                                        loading 
                                        ? "bg-gray-400 cursor-not-allowed" 
                                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                                    }`}
                                >
                                    {loading ? <FaSpinner className="animate-spin" /> : <FaDownload />}
                                    {loading ? "Generating Receipt..." : "Download Receipt"}
                                </button>
                            )}
                        </PDFDownloadLink>

                        <Link 
                            to="/"
                            className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white rounded-xl font-semibold transition-colors"
                        >
                            <FaHome />
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
