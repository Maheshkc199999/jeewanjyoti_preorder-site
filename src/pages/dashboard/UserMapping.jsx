import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, X, Loader2, CheckCircle, XCircle, ArrowRight, Shield, Check, Users, Calendar, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = 'https://jeewanjyoti-backend.smart.org.np'; // Use direct URL for production

const UserMappingTab = ({ darkMode }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [paymentVerifying, setPaymentVerifying] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [mappingDetails, setMappingDetails] = useState(null);
  const [paymentError, setPaymentError] = useState('');

  const [mappings, setMappings] = useState([]);
  const [loadingMappings, setLoadingMappings] = useState(true);

  const getAccessToken = () => {
    // Try multiple possible token keys
    const token = localStorage.getItem('access_token') || 
                  localStorage.getItem('accessToken') || 
                  localStorage.getItem('token') ||
                  localStorage.getItem('authToken');
    console.log('Retrieved token:', token ? 'Token found' : 'No token found');
    console.log('Token starts with:', token ? token.substring(0, 20) + '...' : 'N/A');
    return token;
  };

  const fetchMappings = async () => {
    setLoadingMappings(true);
    const token = getAccessToken();
    
    if (!token) {
      console.error('No access token found');
      setLoadingMappings(false);
      return;
    }

    try {
      console.log('Fetching mappings from:', `${API_BASE_URL}/api/user-mapping/list/`);
      const response = await fetch(`${API_BASE_URL}/api/user-mapping/list/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Mappings data:', data);
        setMappings(data);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch mappings:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error fetching mappings:', error);
    } finally {
      setLoadingMappings(false);
    }
  };

  useEffect(() => {
    fetchMappings();
  }, []);

  const handleEmailSubmit = async () => {
    setIsLoading(true);
    setSubmitStatus(null);
    setErrorMessage('');

    const token = getAccessToken();
    if (!token) {
      setSubmitStatus('error');
      setErrorMessage('Authentication required. Please login again.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/user-mapping/request/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const result = await response.json();
        setSubmitStatus('success');
        setErrorMessage(result.message || 'OTP sent successfully!');
        
        setTimeout(() => {
          setStep(2);
          setSubmitStatus(null);
          setErrorMessage('');
        }, 1500);
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        let errorMessage = 'Failed to send OTP';
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setSubmitStatus('error');
      setErrorMessage(error.message || 'Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    setIsLoading(true);
    setSubmitStatus(null);
    setErrorMessage('');

    const token = getAccessToken();
    if (!token) {
      setSubmitStatus('error');
      setErrorMessage('Authentication required. Please login again.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/user-mapping/payment_initiate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email, otp }),
      });

      if (response.ok) {
        const result = await response.json();
        setSubmitStatus('success');
        setErrorMessage('OTP verified! Redirecting to payment...');
        
        if (result.pidx) {
          const successUrl = `${window.location.origin}/mapping-success`;
          window.location.href = `https://test-pay.khalti.com/?pidx=${result.pidx}&purchase_order_id=${result.payment_ref}&success_url=${encodeURIComponent(successUrl)}`;
        } else {
          throw new Error('Invalid payment initialization response');
        }
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        let errorMessage = 'Failed to verify OTP';
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setSubmitStatus('error');
      setErrorMessage(error.message || 'Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseForm = () => {
    if (!isLoading) {
      setEmail('');
      setOtp('');
      setStep(1);
      setSubmitStatus(null);
      setErrorMessage('');
      setShowAddForm(false);
    }
  };

  const handleBack = () => {
    if (step > 1 && !isLoading) {
      setStep(step - 1);
      setSubmitStatus(null);
      setErrorMessage('');
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

  const formatShortDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  const handleEmailKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading && email) {
      handleEmailSubmit();
    }
  };

  const handleOtpKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading && otp) {
      handleOtpSubmit();
    }
  };

  const handleAddSuccess = () => {
    fetchMappings();
    handleCloseForm();
  };

  return (
    <div className="relative">
      <div className="mb-6">
        <h2 className={`text-xl md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          User Mapping
        </h2>
      </div>

      {loadingMappings ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className={`w-8 h-8 animate-spin ${darkMode ? 'text-violet-400' : 'text-violet-600'}`} />
        </div>
      ) : mappings.length === 0 ? (
        <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <UserPlus className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No user mappings yet</p>
          <p className="text-sm">Click the + button to connect with family members or loved ones</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mappings.map((mapping) => (
            <motion.div
              key={mapping.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl p-6 shadow-lg ${
                darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <img
                    src={mapping.mapped_user.profile_image || 'https://via.placeholder.com/100'}
                    alt={mapping.mapped_user.full_name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-violet-500"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100?text=' + mapping.mapped_user.full_name.charAt(0);
                    }}
                  />
                  {mapping.is_verified && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-lg truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {mapping.nickname || mapping.mapped_user.full_name}
                  </h3>
                  <p className={`text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {mapping.mapped_user.email}
                  </p>
                </div>
              </div>

              <div className={`space-y-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Created
                  </span>
                  <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {formatShortDate(mapping.created_at)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Expires
                  </span>
                  <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {formatShortDate(mapping.expires_at)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Amount
                  </span>
                  <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    NPR {mapping.amount}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700/50 flex gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  mapping.is_verified 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {mapping.is_verified ? '✓ Verified' : '⏳ Pending'}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  mapping.is_paid 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {mapping.is_paid ? '✓ Paid' : '✗ Unpaid'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showPaymentSuccess && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, type: "spring" }}
              className={`fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md rounded-3xl shadow-2xl z-50 overflow-hidden ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className="p-8">
                {paymentVerifying ? (
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mx-auto mb-6"
                    >
                      <Loader2 className="w-16 h-16 text-violet-500" />
                    </motion.div>
                    <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Verifying Payment
                    </h3>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Please wait while we verify your payment...
                    </p>
                  </div>
                ) : paymentVerified ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                      className="mx-auto mb-6 w-20 h-20 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <Check className="w-12 h-12 text-white" strokeWidth={3} />
                    </motion.div>
                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}
                    >
                      Payment Successful! 🎉
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      {mappingDetails?.message || 'Your user mapping has been activated successfully'}
                    </motion.p>
                    
                    {mappingDetails && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className={`p-4 rounded-xl mb-6 ${
                          darkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}
                      >
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Mapping ID:</span>
                            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {mappingDetails.mapping_id}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Valid Until:</span>
                            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {formatDate(mappingDetails.valid_till)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}
                    >
                      Redirecting in a moment...
                    </motion.p>
                  </motion.div>
                ) : paymentError ? (
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, type: "spring" }}
                      className="mx-auto mb-6 w-20 h-20 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <XCircle className="w-12 h-12 text-white" strokeWidth={3} />
                    </motion.div>
                    <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Verification Failed
                    </h3>
                    <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {paymentError}
                    </p>
                    <button
                      onClick={() => setShowPaymentSuccess(false)}
                      className="bg-violet-500 hover:bg-violet-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                    >
                      Close
                    </button>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={handleCloseForm}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className={`fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:top-[5%] md:w-full md:max-w-2xl rounded-3xl shadow-2xl z-50 overflow-hidden ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className="flex flex-col max-h-[85vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-violet-600 to-purple-700 text-white p-6 relative flex flex-col items-center justify-center flex-shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCloseForm}
                    disabled={isLoading}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50"
                  >
                    <X className="h-6 w-6" />
                  </motion.button>
                  
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center"
                  >
                    <h2 className="text-3xl font-bold mb-2">👥 User Mapping</h2>
                    <p className="text-violet-100">
                      {step === 1 && "Enter the user's email to send OTP"}
                      {step === 2 && "Verify OTP to proceed to payment"}
                    </p>
                  </motion.div>

                  <div className="flex items-center justify-center gap-2 mt-4">
                    {[1, 2].map((s) => (
                      <div key={s} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                          s === step 
                            ? 'bg-white text-violet-600 scale-110' 
                            : s < step 
                            ? 'bg-green-400 text-white' 
                            : 'bg-white/20 text-white'
                        }`}>
                          {s < step ? '✓' : s}
                        </div>
                        {s < 2 && (
                          <div className={`w-12 h-1 mx-1 rounded ${
                            s < step ? 'bg-green-400' : 'bg-white/20'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-xl mx-auto">
                    {submitStatus === 'success' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-6 p-4 rounded-xl flex items-start ${
                          darkMode ? 'bg-green-900/30 border border-green-700' : 'bg-green-100 border border-green-300'
                        }`}
                      >
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-green-300' : 'text-green-800'}`}>
                            Success!
                          </p>
                          {errorMessage && (
                            <p className={`text-sm mt-1 ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                              {errorMessage}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {submitStatus === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-6 p-4 rounded-xl flex items-start ${
                          darkMode ? 'bg-red-900/30 border border-red-700' : 'bg-red-100 border border-red-300'
                        }`}
                      >
                        <XCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-red-300' : 'text-red-800'}`}>
                            Error
                          </p>
                          {errorMessage && (
                            <p className={`text-sm mt-1 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                              {errorMessage}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {step === 1 && (
                      <div className="space-y-6">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            <Mail className="inline h-4 w-4 mr-2" />
                            User Email Address
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyPress={handleEmailKeyPress}
                            disabled={isLoading}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300'
                            }`}
                            placeholder="user@example.com"
                          />
                        </div>

                        <motion.button
                          onClick={handleEmailSubmit}
                          disabled={isLoading || !email}
                          whileHover={!isLoading && email ? { scale: 1.02 } : {}}
                          whileTap={!isLoading && email ? { scale: 0.98 } : {}}
                          className="w-full bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin mr-2" />
                              Sending OTP...
                            </>
                          ) : (
                            <>
                              Send OTP
                              <ArrowRight className="h-5 w-5 ml-2" />
                            </>
                          )}
                        </motion.button>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-6">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            <Shield className="inline h-4 w-4 mr-2" />
                            Enter OTP
                          </label>
                          <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            onKeyPress={handleOtpKeyPress}
                            disabled={isLoading}
                            maxLength={6}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-center text-2xl tracking-widest ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300'
                            }`}
                            placeholder="000000"
                          />
                          <p className={`text-sm mt-2 text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            OTP sent to {email}
                          </p>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={handleBack}
                            disabled={isLoading}
                            className={`flex-1 py-3 rounded-xl font-medium transition-all disabled:opacity-50 ${
                              darkMode 
                                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                            }`}
                          >
                            Back
                          </button>
                          <motion.button
                            onClick={handleOtpSubmit}
                            disabled={isLoading || !otp}
                            whileHover={!isLoading && otp ? { scale: 1.02 } : {}}
                            whileTap={!isLoading && otp ? { scale: 0.98 } : {}}
                            className="flex-1 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white font-bold py-3 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                Verifying...
                              </>
                            ) : (
                              <>
                                Verify & Pay
                                <ArrowRight className="h-5 w-5 ml-2" />
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>
                    )}

                    {step === 1 && (
                      <div className={`mt-8 p-4 rounded-xl ${
                        darkMode ? 'bg-violet-900/20 border border-violet-700' : 'bg-violet-50'
                      }`}>
                        <h4 className={`font-semibold mb-3 ${
                          darkMode ? 'text-violet-200' : 'text-gray-800'
                        }`}>
                          How it works:
                        </h4>
                        <ul className={`text-sm space-y-2 ${
                          darkMode ? 'text-violet-300' : 'text-gray-600'
                        }`}>
                          <li className="flex items-start">
                            <span className="mr-2">1️⃣</span>
                            <span>Enter the email of the user you want to map</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2">2️⃣</span>
                            <span>User receives an OTP for verification</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2">3️⃣</span>
                            <span>Complete payment to activate the mapping</span>
                          </li>
                        </ul>
                      </div>
                    )}

                    {step === 2 && (
                      <div className={`mt-8 p-4 rounded-xl ${
                        darkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50'
                      }`}>
                        <p className={`text-sm ${
                          darkMode ? 'text-blue-300' : 'text-blue-800'
                        }`}>
                          💡 After verification, you'll be redirected to the payment gateway to complete the transaction.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Floating Add Button */}
      <motion.button
        onClick={() => setShowAddForm(true)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`absolute bottom-4 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-40 ${
          darkMode 
            ? 'bg-violet-600 hover:bg-violet-700 text-white' 
            : 'bg-violet-500 hover:bg-violet-600 text-white'
        }`}
      >
        <UserPlus className="w-6 h-6" />
      </motion.button>
    </div>
  );
};

export default UserMappingTab;
