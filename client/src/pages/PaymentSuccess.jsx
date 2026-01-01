import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";

const PaymentSuccess = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const tranId = searchParams.get("tranId") || "Unknown";
    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        // Clear cart on successful payment page load
        if (currentUser?._id) {
            localStorage.removeItem(`cart_${currentUser._id}`);
            window.dispatchEvent(new Event('cartUpdated'));
        }
    }, [currentUser]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 animate-bounce">
                    <FaCheckCircle size={40} />
                </div>
                <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">Payment Successful!</h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Thank you for your purchase. Your order has been placed successfully.
                </p>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-900 mb-8">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Transaction ID</p>
                    <p className="text-lg text-green-800 dark:text-green-300 font-mono font-bold tracking-wide break-all">
                        {tranId}
                    </p>
                </div>
                
                <div className="flex flex-col gap-3">
                    <Link 
                        to="/"
                        className="w-full py-3 px-4 bg-[#4c0000] hover:bg-[#7e1010] text-white rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg transform active:scale-95 duration-200"
                    >
                        Go to Home
                    </Link>
                    <Link 
                        to="/dashboard?tab=orders"
                        className="w-full py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        View Orders
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
