const API_BASE = 'http://103.118.16.251/api'; // Use HTTP

export const paymentService = {
  // Initialize payment with backend
  initializePayment: async (invoiceNo, amount, token) => {
    try {
      const response = await fetch(`${API_BASE}/initialize_payment/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice_no: invoiceNo,
          amount: amount,
        }),
        // Add this for development (remove in production)
        mode: 'cors',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to initialize payment');
      }

      return await response.json();
    } catch (error) {
      console.error('Error initializing payment:', error);
      throw error;
    }
  },

  // Verify payment with backend
  verifyPayment: async (invoiceNo, pidx, token) => {
    try {
      const response = await fetch(`${API_BASE}/verify_payment/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice_no: invoiceNo,
          pidx: pidx,
        }),
        // Add this for development (remove in production)
        mode: 'cors',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Payment verification failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  },

  // Load Khalti script dynamically
  loadKhaltiScript: () => {
    return new Promise((resolve, reject) => {
      if (window.KhaltiCheckout) {
        resolve(window.KhaltiCheckout);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://khalti.s3.ap-south-1.amazonaws.com/KhaltiCheckout.js';
      script.onload = () => resolve(window.KhaltiCheckout);
      script.onerror = () => reject(new Error('Failed to load Khalti script'));
      document.head.appendChild(script);
    });
  },
};