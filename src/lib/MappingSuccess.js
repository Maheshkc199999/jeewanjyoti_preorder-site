import React, { useEffect, useState } from "react";
import { CheckCircle, Loader, XCircle, Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

function MappingSuccess() {
  const params = new URLSearchParams(window.location.search);

  const payment_ref = params.get("purchase_order_id");
  const pidx = params.get("pidx");
  const status = params.get("status");

  const [loading, setLoading] = useState(true);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState(null);

  const getAccessToken = () => {
    return localStorage.getItem("access_token");
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    if (status !== "Completed") {
      setError("Payment was not completed.");
      setLoading(false);
      return;
    }

    const verifyPayment = async () => {
      const accessToken = getAccessToken();
      
      if (!accessToken) {
        setError("Authentication required. Please login again.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "https://jeewanjyoti-backend.smart.org.np/api/user-mapping/verify/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              payment_ref,
              pidx,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || data.detail || "Something went wrong!");
        } else {
          setSuccessData(data);
        }
      } catch (err) {
        setError("Network error. Try again.");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [status, payment_ref, pidx]);

  return React.createElement(
    "div",
    { className: "flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4" },
    
    // Loading State
    loading && React.createElement(
      "div",
      { className: "text-center" },
      React.createElement(
        motion.div,
        {
          animate: { rotate: 360 },
          transition: { duration: 1, repeat: Infinity, ease: "linear" },
          className: "mx-auto mb-6"
        },
        React.createElement(Loader, { className: "w-16 h-16 text-violet-500" })
      ),
      React.createElement(
        "h1",
        { className: "text-2xl font-bold text-gray-800 mb-2" },
        "Verifying Payment"
      ),
      React.createElement(
        "p",
        { className: "text-gray-600" },
        "Please wait while we verify your payment..."
      )
    ),

    // Error State
    !loading && error && React.createElement(
      "div",
      { className: "text-center" },
      React.createElement(
        motion.div,
        {
          initial: { scale: 0 },
          animate: { scale: 1 },
          transition: { duration: 0.5, type: "spring" },
          className: "mx-auto mb-6 w-20 h-20 bg-red-500 rounded-full flex items-center justify-center"
        },
        React.createElement(XCircle, { className: "w-12 h-12 text-white", strokeWidth: 3 })
      ),
      React.createElement(
        "h1",
        { className: "text-2xl font-bold text-red-600 mb-2" },
        "Payment Verification Failed"
      ),
      React.createElement(
        "p",
        { className: "text-gray-700 mb-6" },
        error
      ),
      React.createElement(
        "button",
        {
          onClick: () => window.location.href = "/dashboard",
          className: "px-6 py-3 bg-red-600 text-white rounded-xl shadow-lg hover:bg-red-700 transition-colors flex items-center gap-2"
        },
        "Go to Dashboard",
        React.createElement(ArrowRight, { className: "w-4 h-4" })
      )
    ),

    // Success State with Green Tick Animation
    !loading && successData && React.createElement(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
        className: "text-center max-w-md w-full"
      },
      React.createElement(
        motion.div,
        {
          initial: { scale: 0 },
          animate: { scale: 1 },
          transition: { delay: 0.2, duration: 0.5, type: "spring" },
          className: "mx-auto mb-6 w-20 h-20 bg-green-500 rounded-full flex items-center justify-center"
        },
        React.createElement(Check, { className: "w-12 h-12 text-white", strokeWidth: 3 })
      ),
      React.createElement(
        motion.h1,
        {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.3 },
          className: "text-3xl font-bold text-green-600 mb-2"
        },
        "Payment Successful! 🎉"
      ),
      React.createElement(
        motion.p,
        {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.4 },
          className: "text-gray-700 text-lg mb-6"
        },
        successData.message
      ),
      React.createElement(
        motion.div,
        {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.5 },
          className: "bg-white p-4 rounded-xl shadow-lg mb-6 border border-green-200"
        },
        React.createElement(
          "div",
          { className: "space-y-2 text-sm" },
          React.createElement(
            "div",
            { className: "flex justify-between" },
            React.createElement("span", { className: "text-gray-600" }, "Mapping ID:"),
            React.createElement(
              "span",
              { className: "font-medium text-gray-800" },
              successData.mapping_id
            )
          ),
          React.createElement(
            "div",
            { className: "flex justify-between" },
            React.createElement("span", { className: "text-gray-600" }, "Valid Until:"),
            React.createElement(
              "span",
              { className: "font-medium text-gray-800" },
              formatDate(successData.valid_till)
            )
          )
        )
      ),
      React.createElement(
        motion.button,
        {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { delay: 0.6 },
          onClick: () => window.location.href = "/dashboard",
          className: "w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
        },
        "Go to Dashboard",
        React.createElement(ArrowRight, { className: "w-4 h-4" })
      ),
      React.createElement(
        motion.p,
        {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { delay: 0.7 },
          className: "text-sm text-gray-500 mt-4"
        },
        "You can now access the mapped user's data"
      )
    )
  );
}

export default MappingSuccess;
