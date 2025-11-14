import React from "react";
import { CheckCircle } from "lucide-react";

function MappingSuccess() {
  const params = new URLSearchParams(window.location.search);

  const status = params.get("status");
  const amount = params.get("amount");
  const transactionId = params.get("transaction_id");

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <CheckCircle size={120} className="text-green-500 mb-6" />

      <h1 className="text-3xl font-bold text-green-600 mb-2">
        Payment Successful!
      </h1>

      {status === "Completed" ? (
        <p className="text-gray-700 text-lg">
          Your payment of <b>{amount / 100}</b> NPR was successfully completed.
        </p>
      ) : (
        <p className="text-red-500 text-lg">Invalid Transaction!</p>
      )}

      <p className="text-gray-500 mt-4">
        Transaction ID: <b>{transactionId}</b>
      </p>
    </div>
  );
}

export default MappingSuccess;
