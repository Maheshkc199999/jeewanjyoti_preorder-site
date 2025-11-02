import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Calendar, Loader } from 'lucide-react';
import { API_BASE_URL } from '../lib/api';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verified, setVerified] = useState(false);

  // Extract invoice_no and pidx from URL parameters
  const pidx = searchParams.get('pidx');
  const purchaseOrderId = searchParams.get('purchase_order_id');
  // Extract invoice_no from purchase_order_id (format: INV-20251102-000046)
  const invoiceNo = purchaseOrderId || searchParams.get('invoice_no');

  // Get API base URL (following same pattern as Appointments.jsx)
  const getApiBase = () => {
    if (import.meta.env.DEV) {
      return '/api';
    }
    const base = import.meta.env.VITE_API_BASE_URL || API_BASE_URL;
    return base.includes('/api') ? base : `${base}/api`;
  };

  useEffect(() => {
    const verifyPayment = async () => {
      if (!pidx || !invoiceNo) {
        setError('Missing payment information. Please contact support.');
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('Please log in to verify payment.');
          setLoading(false);
          return;
        }

        const base = getApiBase().endsWith('/') ? getApiBase().slice(0, -1) : getApiBase();
        const endpoint = 'verify_payment/';
        const url = `${base}/${endpoint}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            invoice_no: invoiceNo,
            pidx: pidx,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Payment verified:', data);
          setVerified(true);
        } else {
          const errorData = await response.json();
          setError(errorData.detail || 'Payment verification failed. Please contact support.');
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError('Failed to verify payment. Please contact support.');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [pidx, invoiceNo]);

  const handleGoToAppointments = () => {
    navigate('/dashboard#appointments');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
        {loading ? (
          <>
            <div className="flex justify-center mb-6">
              <Loader className="w-20 h-20 animate-spin text-blue-500" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Verifying Payment...
            </h2>
            <p className="text-gray-600">
              Please wait while we confirm your payment.
            </p>
          </>
        ) : error ? (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Payment Verification Failed
            </h2>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={handleGoToAppointments}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors inline-flex items-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              Go to Appointments
            </button>
          </>
        ) : verified ? (
          <>
            {/* Big Green Tick */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                <CheckCircle className="w-16 h-16 md:w-20 md:h-20 text-green-500" strokeWidth={2.5} />
              </div>
            </div>

            {/* Payment Successful Message */}
            <h1 className="text-3xl md:text-4xl font-bold text-green-600 mb-4">
              Payment Successful!
            </h1>
            <p className="text-lg text-gray-700 mb-2">
              Your payment has been verified and your appointment has been confirmed.
            </p>
            {invoiceNo && (
              <p className="text-sm text-gray-500 mb-8">
                Invoice: <span className="font-semibold">{invoiceNo}</span>
              </p>
            )}

            {/* Go to Appointments Button */}
            <button
              onClick={handleGoToAppointments}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center justify-center gap-3"
            >
              <Calendar className="w-6 h-6" />
              Go to Appointments
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default PaymentSuccess;

