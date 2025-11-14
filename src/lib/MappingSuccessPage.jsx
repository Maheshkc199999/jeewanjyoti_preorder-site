import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, Calendar, Shield, Home, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from './api';

const MappingSuccessPage = () => {
  const [verificationStatus, setVerificationStatus] = useState('loading'); // loading, success, error
  const [paymentData, setPaymentData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [urlParams, setUrlParams] = useState(null);

  useEffect(() => {
    const params = getUrlParams();
    setUrlParams(params);
    verifyPayment(params);
  }, []);

  const getAccessToken = () => {
    return localStorage.getItem('access_token');
  };

  const getUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      pidx: params.get('pidx'),
      transaction_id: params.get('transaction_id'),
      tidx: params.get('tidx'),
      txnId: params.get('txnId'),
      purchase_order_id: params.get('purchase_order_id'),
      purchase_order_name: params.get('purchase_order_name'),
      amount: params.get('amount'),
      total_amount: params.get('total_amount'),
      mobile: params.get('mobile'),
      status: params.get('status')
    };
  };

  const verifyPayment = async (params) => {
    // Check if payment was completed
    if (params.status !== 'Completed') {
      setVerificationStatus('error');
      setErrorMessage('Payment was not completed successfully.');
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setVerificationStatus('error');
      setErrorMessage('Authentication required. Please login again.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/user-mapping/verify/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          payment_ref: params.purchase_order_id,
          pidx: params.pidx
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setPaymentData(result);
        setVerificationStatus('success');
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        let errorMessage = 'Failed to verify payment';
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setVerificationStatus('error');
      setErrorMessage(error.message || 'Network error. Please check your connection and try again.');
    }
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

  const handleReturnHome = () => {
    window.location.href = '/dashboard'; // Adjust to your dashboard route
  };

  const handleRetry = () => {
    if (urlParams) {
      setVerificationStatus('loading');
      verifyPayment(urlParams);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden"
      >
        {/* Loading State */}
        {verificationStatus === 'loading' && (
          <div className="p-12 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <Loader2 className="w-20 h-20 text-violet-600 mb-6" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Verifying Payment...
            </h2>
            <p className="text-gray-600 mb-2">
              Please wait while we confirm your payment with the bank.
            </p>
            <p className="text-sm text-gray-500">
              This may take a few moments.
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                className="w-3 h-3 bg-violet-600 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                className="w-3 h-3 bg-violet-600 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                className="w-3 h-3 bg-violet-600 rounded-full"
              />
            </div>
          </div>
        )}

        {/* Success State */}
        {verificationStatus === 'success' && paymentData && (
          <div>
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <CheckCircle className="w-24 h-24 mx-auto mb-4" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold mb-2"
              >
                Payment Successful! 🎉
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-green-100 text-lg"
              >
                Your user mapping has been activated successfully
              </motion.p>
            </div>

            {/* Payment Details */}
            <div className="p-8">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-violet-600" />
                  Mapping Details
                </h3>
                <div className="space-y-3">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex justify-between items-center p-4 bg-violet-50 rounded-xl border border-violet-200"
                  >
                    <span className="text-gray-600 font-medium">Mapping ID</span>
                    <span className="font-bold text-violet-700">{paymentData.mapping_id}</span>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-between items-center p-4 bg-green-50 rounded-xl border border-green-200"
                  >
                    <span className="text-gray-600 font-medium flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Valid Until
                    </span>
                    <span className="font-semibold text-green-700">
                      {formatDate(paymentData.valid_till)}
                    </span>
                  </motion.div>

                  {urlParams && urlParams.transaction_id && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      <span className="text-gray-600 font-medium">Transaction ID</span>
                      <span className="font-mono text-sm text-gray-700">{urlParams.transaction_id}</span>
                    </motion.div>
                  )}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-violet-50 border-2 border-violet-200 rounded-xl p-6 mb-6"
              >
                <p className="text-violet-900 text-center font-medium">
                  ✅ {paymentData.message}
                </p>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReturnHome}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Return to Dashboard
              </motion.button>
            </div>
          </div>
        )}

        {/* Error State */}
        {verificationStatus === 'error' && (
          <div>
            {/* Error Header */}
            <div className="bg-gradient-to-r from-red-500 to-rose-600 p-8 text-white text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <XCircle className="w-24 h-24 mx-auto mb-4" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold mb-2"
              >
                Payment Verification Failed
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-red-100 text-lg"
              >
                We couldn't verify your payment
              </motion.p>
            </div>

            {/* Error Details */}
            <div className="p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6"
              >
                <p className="text-red-900 font-medium mb-2">❌ Error Details:</p>
                <p className="text-red-700">{errorMessage}</p>
              </motion.div>

              {urlParams && urlParams.transaction_id && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6"
                >
                  <p className="text-gray-700 text-sm mb-2">
                    <strong>Transaction ID:</strong> {urlParams.transaction_id}
                  </p>
                  <p className="text-gray-700 text-sm">
                    <strong>Payment Status:</strong> {urlParams.status}
                  </p>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6"
              >
                <p className="text-yellow-900 text-sm">
                  <strong>💡 What to do next:</strong>
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-yellow-800 text-sm">
                  <li>Check your payment status in your Khalti account or bank</li>
                  <li>If the amount was deducted, contact support with your transaction ID</li>
                  <li>Try the payment process again if the amount wasn't deducted</li>
                  <li>Keep this page for reference</li>
                </ul>
              </motion.div>

              <div className="flex gap-3">
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRetry}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry Verification
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReturnHome}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Return Home
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MappingSuccessPage;