import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, XCircle, Loader } from 'lucide-react';

const KhaltiPayment = ({ 
  invoiceNo, 
  amount, 
  onPaymentSuccess, 
  onPaymentError, 
  onCancel,
  darkMode = false 
}) => {
  const [paymentStatus, setPaymentStatus] = useState('initializing'); // initializing, ready, processing, success, failed
  const [pidx, setPidx] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://103.118.16.251/api';

  // Initialize payment when component mounts
  useEffect(() => {
    initializePayment();
  }, []);

  const initializePayment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/initialize_payment/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          invoice_no: invoiceNo,
          amount: amount
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPidx(data.pidx);
        setPaymentStatus('ready');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to initialize payment');
        setPaymentStatus('failed');
      }
    } catch (err) {
      console.error('Error initializing payment:', err);
      setError('Failed to initialize payment. Please try again.');
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKhaltiPayment = () => {
    if (!pidx) {
      setError('Payment not initialized properly');
      return;
    }

    setPaymentStatus('processing');
    
    // Create Khalti payment configuration
    const config = {
      publicKey: import.meta.env.VITE_KHALTI_PUBLIC_KEY || "test_public_key_dc74e0fd57cb46cd93832aee0a390234",
      productIdentity: invoiceNo,
      productName: `Appointment - ${invoiceNo}`,
      productUrl: window.location.origin,
      eventHandler: {
        onSuccess(payload) {
          console.log('Payment successful:', payload);
          verifyPayment(payload);
        },
        onError(error) {
          console.error('Payment error:', error);
          setError('Payment failed. Please try again.');
          setPaymentStatus('failed');
          onPaymentError && onPaymentError(error);
        },
        onClose() {
          console.log('Payment window closed');
          setPaymentStatus('ready');
        }
      },
      paymentPreference: ["KHALTI", "EBANKING", "MOBILE_BANKING", "CONNECT_IPS", "SCT"],
    };

    // Load Khalti script dynamically
    const script = document.createElement('script');
    script.src = 'https://khalti.s3.ap-south-1.amazonaws.com/KPG/dist/2020.12.17.0.0.0/khalti-checkout.iffe.js';
    script.onload = () => {
      if (window.KhaltiCheckout) {
        const checkout = new window.KhaltiCheckout(config);
        checkout.show({ amount: amount * 100 }); // Amount in paisa
      } else {
        setError('Khalti payment system not available');
        setPaymentStatus('failed');
      }
    };
    script.onerror = () => {
      setError('Failed to load payment system');
      setPaymentStatus('failed');
    };
    document.body.appendChild(script);
  };

  const verifyPayment = async (payload) => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/verify_payment/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          invoice_no: invoiceNo,
          pidx: payload.pidx
        })
      });

      if (response.ok) {
        setPaymentStatus('success');
        onPaymentSuccess && onPaymentSuccess(payload);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Payment verification failed');
        setPaymentStatus('failed');
        onPaymentError && onPaymentError(errorData);
      }
    } catch (err) {
      console.error('Error verifying payment:', err);
      setError('Payment verification failed. Please contact support.');
      setPaymentStatus('failed');
      onPaymentError && onPaymentError(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'initializing':
      case 'processing':
        return <Loader className="w-6 h-6 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <CreditCard className="w-6 h-6 text-blue-500" />;
    }
  };

  const getStatusText = () => {
    switch (paymentStatus) {
      case 'initializing':
        return 'Initializing payment...';
      case 'ready':
        return 'Ready to pay';
      case 'processing':
        return 'Processing payment...';
      case 'success':
        return 'Payment successful!';
      case 'failed':
        return 'Payment failed';
      default:
        return 'Payment';
    }
  };

  return (
    <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="text-center">
        <div className="flex justify-center mb-4">
          {getStatusIcon()}
        </div>
        
        <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Payment Required
        </h3>
        
        <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Complete your payment to confirm the appointment
        </p>
        
        <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Invoice Number:
            </span>
            <span className={`font-mono text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {invoiceNo}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Amount:
            </span>
            <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              NPR {amount}
            </span>
          </div>
        </div>

        {error && (
          <div className={`p-3 mb-4 rounded-lg ${darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'}`}>
            {error}
          </div>
        )}

        <div className="space-y-3">
          {paymentStatus === 'ready' && (
            <button
              onClick={handleKhaltiPayment}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              Pay with Khalti
            </button>
          )}
          
          {paymentStatus === 'success' && (
            <div className="text-center">
              <p className={`text-green-600 font-semibold mb-4 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                Payment completed successfully!
              </p>
              <button
                onClick={onPaymentSuccess}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg font-semibold transition-colors"
              >
                Continue
              </button>
            </div>
          )}
          
          {paymentStatus === 'failed' && (
            <div className="space-y-3">
              <button
                onClick={initializePayment}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? 'Retrying...' : 'Try Again'}
              </button>
              <button
                onClick={onCancel}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
          
          {paymentStatus === 'initializing' && (
            <div className="text-center">
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Setting up payment...
              </p>
            </div>
          )}
          
          {paymentStatus === 'processing' && (
            <div className="text-center">
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Processing your payment...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KhaltiPayment;
