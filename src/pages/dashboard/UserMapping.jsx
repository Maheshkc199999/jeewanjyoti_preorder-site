
import React, { useState } from 'react';
import { UserPlus, Mail, X, Loader2, CheckCircle, XCircle, ArrowRight, Shield, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../lib/api';

const UserMappingTab = ({ darkMode }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [step, setStep] = useState(1); // 1: Email input, 2: OTP input, 3: Payment
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [paymentData, setPaymentData] = useState(null);

  const getAccessToken = () => {
    return localStorage.getItem('access_token');
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
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

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
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
        setPaymentData(result);
        setSubmitStatus('success');
        
        setTimeout(() => {
          setStep(3);
          setSubmitStatus(null);
        }, 1500);
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
      setPaymentData(null);
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          User Mapping
        </h2>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors text-sm md:text-base"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden md:inline">Add User Mapping</span>
          <span className="md:hidden">Add</span>
        </button>
      </div>

      {/* Empty State */}
      <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <UserPlus className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">No user mappings yet</p>
        <p className="text-sm">Click "Add User Mapping" to connect with family members or loved ones</p>
      </div>

      {/* Add User Mapping Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={handleCloseForm}
            />

            {/* Modal */}
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
                {/* Header */}
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
                      {step === 2 && "Verify OTP to continue"}
                      {step === 3 && "Complete payment to activate mapping"}
                    </p>
                  </motion.div>

                  {/* Progress Steps */}
                  <div className="flex items-center justify-center gap-2 mt-4">
                    {[1, 2, 3].map((s) => (
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
                        {s < 3 && (
                          <div className={`w-12 h-1 mx-1 rounded ${
                            s < step ? 'bg-green-400' : 'bg-white/20'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-xl mx-auto">
                    {/* Status Messages */}
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

                    {/* Step 1: Email Input */}
                    {step === 1 && (
                      <form onSubmit={handleEmailSubmit} className="space-y-6">
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
                            required
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
                          type="submit"
                          disabled={isLoading}
                          whileHover={!isLoading ? { scale: 1.02 } : {}}
                          whileTap={!isLoading ? { scale: 0.98 } : {}}
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
                      </form>
                    )}

                    {/* Step 2: OTP Input */}
                    {step === 2 && (
                      <form onSubmit={handleOtpSubmit} className="space-y-6">
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
                            required
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
                            type="button"
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
                            type="submit"
                            disabled={isLoading}
                            whileHover={!isLoading ? { scale: 1.02 } : {}}
                            whileTap={!isLoading ? { scale: 0.98 } : {}}
                            className="flex-1 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white font-bold py-3 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                Verifying...
                              </>
                            ) : (
                              <>
                                Verify OTP
                                <ArrowRight className="h-5 w-5 ml-2" />
                              </>
                            )}
                          </motion.button>
                        </div>
                      </form>
                    )}

                    {/* Step 3: Payment Information */}
                    {step === 3 && paymentData && (
                      <div className="space-y-6">
                        <div className={`p-6 rounded-xl border-2 ${
                          darkMode ? 'bg-gray-700 border-violet-500' : 'bg-violet-50 border-violet-200'
                        }`}>
                          <div className="flex items-center justify-center mb-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-violet-600 to-purple-700 rounded-full flex items-center justify-center">
                              <DollarSign className="w-8 h-8 text-white" />
                            </div>
                          </div>
                          
                          <h3 className={`text-xl font-bold text-center mb-6 ${
                            darkMode ? 'text-white' : 'text-gray-800'
                          }`}>
                            Payment Details
                          </h3>

                          <div className="space-y-4">
                            <div className={`flex justify-between p-3 rounded-lg ${
                              darkMode ? 'bg-gray-800' : 'bg-white'
                            }`}>
                              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                                Payment ID
                              </span>
                              <span className={`font-mono font-semibold ${
                                darkMode ? 'text-white' : 'text-gray-800'
                              }`}>
                                {paymentData.pidx}
                              </span>
                            </div>

                            <div className={`flex justify-between p-3 rounded-lg ${
                              darkMode ? 'bg-gray-800' : 'bg-white'
                            }`}>
                              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                                Mapping ID
                              </span>
                              <span className={`font-semibold ${
                                darkMode ? 'text-white' : 'text-gray-800'
                              }`}>
                                #{paymentData.mapping_id}
                              </span>
                            </div>

                            <div className={`flex justify-between p-3 rounded-lg ${
                              darkMode ? 'bg-gray-800' : 'bg-white'
                            }`}>
                              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                                Amount
                              </span>
                              <span className={`text-2xl font-bold ${
                                darkMode ? 'text-violet-400' : 'text-violet-600'
                              }`}>
                                Rs. {paymentData.amount}
                              </span>
                            </div>

                            <div className={`flex justify-between p-3 rounded-lg ${
                              darkMode ? 'bg-amber-900/30 border border-amber-700' : 'bg-amber-50 border border-amber-200'
                            }`}>
                              <span className={darkMode ? 'text-amber-300' : 'text-amber-700'}>
                                Valid For
                              </span>
                              <span className={`font-semibold ${
                                darkMode ? 'text-amber-300' : 'text-amber-700'
                              }`}>
                                {paymentData.valid_for}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className={`p-4 rounded-xl ${
                          darkMode ? 'bg-violet-900/20 border border-violet-700' : 'bg-violet-50'
                        }`}>
                          <p className={`text-sm text-center ${
                            darkMode ? 'text-violet-300' : 'text-violet-900'
                          }`}>
                            Please complete the payment within the time limit to activate the user mapping.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleCloseForm}
                          className={`w-full py-3 rounded-xl font-medium transition-all ${
                            darkMode 
                              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                          }`}
                        >
                          Close
                        </button>
                      </div>
                    )}

                    {/* Info Box */}
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
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMappingTab;
