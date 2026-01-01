import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";

const PaymentSuccess = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const tranId = searchParams.get("tranId") || "N/A";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500">
                    <FaCheckCircle size={32} />
                </div>
                <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Payment Successful!</h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Thank you for your payment. Your transaction was completed successfully.
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-900 mb-8">
                    <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                        Transaction ID: <span className="font-bold">{tranId}</span>
                    </p>
                </div>
                
                <div className="flex flex-col gap-3">
                    <Link 
                        to="/"
                        className="w-full py-3 px-4 bg-[#4c0000] hover:bg-[#7e1010] text-white rounded-xl font-semibold transition-colors"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
