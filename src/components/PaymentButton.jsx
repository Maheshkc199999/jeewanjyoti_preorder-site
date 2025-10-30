import React from "react";
import { initializePayment } from "../lib/api";

const PaymentButton = ({ token, invoiceNo, amount }) => {
  const handlePayment = async () => {
    try {
      const res = await initializePayment(token, invoiceNo, amount);
      let pidx;
      if (res.data && res.data.pidx) {
        pidx = res.data.pidx;
      } else if (res.pidx) {
        pidx = res.pidx;
      } else {
        throw new Error("No pidx found in payment response");
      }
      const paymentUrl = `https://a.khalti.com/?pidx=${pidx}`;
      window.location.href = paymentUrl;
    } catch (err) {
      console.error("Payment init error:", err.response?.data || err);
      alert("Payment initialization failed. Please try again.");
    }
  };
  return <button onClick={handlePayment}>Pay with Khalti</button>;
};

export default PaymentButton;
