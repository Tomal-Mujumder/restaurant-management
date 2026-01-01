import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";

const PaymentFailed = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const reason = searchParams.get("reason") || "Unknown Error";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500">
                    <FaExclamationTriangle size={32} />
                </div>
                <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Payment Failed</h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Unfortunately, your payment could not be processed.
                </p>
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900 mb-8">
                    <p className="text-sm text-red-800 dark:text-red-300 font-medium">
                        Reason: {reason}
                    </p>
                </div>
                
                <div className="flex flex-col gap-3">
                    <Link 
                        to="/shoppingCart"
                        className="w-full py-3 px-4 bg-[#4c0000] hover:bg-[#7e1010] text-white rounded-xl font-semibold transition-colors"
                    >
                        Try Again
                    </Link>
                    <Link 
                        to="/"
                        className="w-full py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailed;
