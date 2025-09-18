import React, { useState, useCallback, memo } from 'react'
import { Mail, Lock, LogIn, Eye, EyeOff, Building, User, X, ArrowLeft, CheckCircle } from 'lucide-react'
import logo from '../assets/logo.png'
import { useNavigate } from 'react-router-dom'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'

// Memoize the InputField component to prevent unnecessary re-renders
const InputField = memo(({ icon: Icon, label, error, children, required = false }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
      <Icon className="w-4 h-4 text-violet-600" />
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className="relative">
      {children}
    </div>
    {error && (
      <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
        This field is required
      </p>
    )}
  </div>
))

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loginType, setLoginType] = useState('individual')
  const navigate = useNavigate()

  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1) // 1: email, 2: OTP, 3: new password
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '',
    email_otp: '',
    new_password: '',
    confirm_password: ''
  })
  const [forgotPasswordErrors, setForgotPasswordErrors] = useState({})
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // Use useCallback to memoize the change handler
  const handleInputChange = useCallback((field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }, [])

  // Forgot password input change handler
  const handleForgotPasswordInputChange = useCallback((field) => (e) => {
    setForgotPasswordData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
    // Clear error when user starts typing
    if (forgotPasswordErrors[field]) {
      setForgotPasswordErrors(prev => ({
        ...prev,
        [field]: false
      }))
    }
  }, [forgotPasswordErrors])

  // Reset forgot password popup
  const resetForgotPassword = () => {
    setShowForgotPassword(false)
    setForgotPasswordStep(1)
    setForgotPasswordData({
      email: '',
      email_otp: '',
      new_password: '',
      confirm_password: ''
    })
    setForgotPasswordErrors({})
    setForgotPasswordLoading(false)
  }

  // Step 1: Send email for OTP
  const handleSendOTP = async () => {
    const newErrors = {}
    if (!forgotPasswordData.email) newErrors.email = true
    
    setForgotPasswordErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setForgotPasswordLoading(true)
    try {
      const apiUrl = loginType === 'individual' 
        ? 'https://jeewanjyoti-backend.smart.org.np/api/forgot-password/'
        : 'https://jeewanjyoti-backend.smart.org.np/api/ins/forgot-password/'
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: forgotPasswordData.email
        })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to send OTP: ${response.status}`)
      }
      
      setForgotPasswordStep(2)
      alert('OTP sent to your email successfully!')
      
    } catch (error) {
      console.error('Send OTP error:', error)
      alert('Failed to send OTP. Please check your email and try again.')
    } finally {
      setForgotPasswordLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    const newErrors = {}
    if (!forgotPasswordData.email_otp) newErrors.email_otp = true
    
    setForgotPasswordErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setForgotPasswordLoading(true)
    try {
      const apiUrl = loginType === 'individual' 
        ? 'https://jeewanjyoti-backend.smart.org.np/api/verify-otp/'
        : 'https://jeewanjyoti-backend.smart.org.np/api/ins/verify-otp/'
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: forgotPasswordData.email,
          email_otp: forgotPasswordData.email_otp
        })
      })
      
      if (!response.ok) {
        throw new Error(`OTP verification failed: ${response.status}`)
      }
      
      setForgotPasswordStep(3)
      alert('OTP verified successfully!')
      
    } catch (error) {
      console.error('OTP verification error:', error)
      alert('Invalid OTP. Please try again.')
    } finally {
      setForgotPasswordLoading(false)
    }
  }

  // Step 3: Reset password
  const handleResetPassword = async () => {
    const newErrors = {}
    if (!forgotPasswordData.new_password) newErrors.new_password = true
    if (!forgotPasswordData.confirm_password) newErrors.confirm_password = true
    if (forgotPasswordData.new_password !== forgotPasswordData.confirm_password) {
      newErrors.confirm_password = true
    }
    
    setForgotPasswordErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setForgotPasswordLoading(true)
    try {
      const apiUrl = loginType === 'individual' 
        ? 'https://jeewanjyoti-backend.smart.org.np/api/reset-password/'
        : 'https://jeewanjyoti-backend.smart.org.np/api/ins/reset-password/'
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: forgotPasswordData.email,
          new_password: forgotPasswordData.new_password,
          confirm_password: forgotPasswordData.confirm_password
        })
      })
      
      if (!response.ok) {
        throw new Error(`Password reset failed: ${response.status}`)
      }
      
      alert('Password reset successfully! You can now login with your new password.')
      resetForgotPassword()
      
    } catch (error) {
      console.error('Password reset error:', error)
      alert('Failed to reset password. Please try again.')
    } finally {
      setForgotPasswordLoading(false)
    }
  }

  // Google Sign-In handler
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      
      // Get the ID token
      const idToken = await user.getIdToken()
      
      // Send to your backend
      const apiUrl = loginType === 'individual' 
        ? 'https://jeewanjyoti-backend.smart.org.np/api/firebase-login/'
        : 'https://jeewanjyoti-backend.smart.org.np/api/ins/firebase-login/'
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_token: idToken
        })
      })
      
      if (!response.ok) {
        throw new Error(`Google login failed with status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Google login successful:', data)
      
      // Store tokens if provided
      if (data.access) {
        localStorage.setItem('access_token', data.access)
      }
      if (data.refresh) {
        localStorage.setItem('refresh_token', data.refresh)
      }
      
      alert('Google login successful!')
      navigate('/dashboard')
      
    } catch (error) {
      console.error('Google login error:', error)
      console.error('Error details:', error.message)
      console.error('Error code:', error.code)
      alert(`Google login failed: ${error.message}. Please check the console for more details.`)
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}
    
    if (!formData.email) newErrors.email = true
    if (!formData.password) newErrors.password = true
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) return

    setIsLoading(true)
    try {
      const apiUrl = loginType === 'individual' 
        ? 'https://jeewanjyoti-backend.smart.org.np/api/login/'
        : 'https://jeewanjyoti-backend.smart.org.np/api/ins/login/'
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      })
      
      if (!response.ok) {
        throw new Error(`Login failed with status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Login successful:', data)
      navigate('/dashboard')
      
    } catch (error) {
      console.error('Login error:', error)
      alert('Login failed. Please check your credentials and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated background elements - Reduced animation intensity */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-violet-400/30 to-purple-600/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-br from-pink-400/30 to-violet-600/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/3 w-48 h-48 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-gradient-to-br from-pink-300/25 to-violet-500/25 rounded-full blur-2xl"></div>
      </div>

      {/* Main container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Header section */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <img src={logo} alt="Jeewan Jyoti" className="h-16 w-auto" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              LOG IN
            </h1>
            <p className="text-gray-600 text-base font-medium">
              Sign in to access your healthcare dashboard
            </p>
          </div>

          {/* Login type selector */}
          <div className="flex bg-white/80 backdrop-blur-sm rounded-xl p-1 mb-6 border border-white/30">
            <button
              onClick={() => setLoginType('individual')}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                loginType === 'individual'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-violet-700'
              }`}
            >
              <User className="w-4 h-4" />
              Individual
            </button>
            <button
              onClick={() => setLoginType('institutional')}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                loginType === 'institutional'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-violet-700'
              }`}
            >
              <Building className="w-4 h-4" />
              Institution
            </button>
          </div>

          {/* Main form container */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 md:p-8">
            <div className="space-y-5">
              {/* Email field */}
              <InputField icon={Mail} label="Email Address" error={errors.email} required>
                <input
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 bg-white/90 backdrop-blur-sm placeholder-gray-400 text-gray-800 font-medium"
                  placeholder="your.email@example.com"
                />
              </InputField>

              {/* Password field with show/hide toggle */}
              <InputField icon={Lock} label="Password" error={errors.password} required>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 bg-white/90 backdrop-blur-sm placeholder-gray-400 text-gray-800 font-medium"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-violet-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </InputField>

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`w-full py-3 px-8 rounded-xl font-bold text-lg shadow-xl transition-all duration-300 ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:via-purple-700 hover:to-pink-700 text-white hover:shadow-2xl'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </div>
                )}
              </button>

              {/* Forgot password link */}
              <div className="flex justify-center mt-3">
                <button 
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-violet-600 hover:text-violet-800 font-semibold transition-colors hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-gray-500 text-sm font-medium bg-white rounded-full">or continue with</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Social login buttons */}
            <div className="flex justify-center gap-4">
              <button 
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className={`flex items-center justify-center w-12 h-12 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 ${
                  googleLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">G</span>
                </div>
              </button>
              
              <button className="flex items-center justify-center w-12 h-12 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">f</span>
                </div>
              </button>

              <button className="flex items-center justify-center w-12 h-12 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">in</span>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="text-center mt-6 pt-5 border-t border-gray-100">
              <p className="text-gray-600 text-sm">
                Don't have an account?{' '}
                <a 
                  href="/register" 
                  className="text-violet-600 hover:text-violet-800 font-semibold transition-colors hover:underline"
                >
                  Sign up
                </a>
              </p>
            </div>
          </div>

          {/* Security badge */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-white/40 text-xs text-gray-600">
              <Lock className="w-3 h-3 text-violet-600" />
              Secure healthcare login
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Popup */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 w-full max-w-md p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {forgotPasswordStep > 1 && (
                  <button
                    onClick={() => setForgotPasswordStep(forgotPasswordStep - 1)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                )}
                <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {forgotPasswordStep === 1 && 'Reset Password'}
                  {forgotPasswordStep === 2 && 'Verify OTP'}
                  {forgotPasswordStep === 3 && 'New Password'}
                </h2>
              </div>
              <button
                onClick={resetForgotPassword}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step <= forgotPasswordStep
                        ? 'bg-violet-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step < forgotPasswordStep ? <CheckCircle className="w-4 h-4" /> : step}
                    </div>
                    {step < 3 && (
                      <div className={`w-8 h-0.5 ${
                        step < forgotPasswordStep ? 'bg-violet-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1: Email */}
            {forgotPasswordStep === 1 && (
              <div className="space-y-5">
                <p className="text-gray-600 text-center">
                  Enter your email address and we'll send you an OTP to reset your password.
                </p>
                
                <InputField icon={Mail} label="Email Address" error={forgotPasswordErrors.email} required>
                  <input
                    type="email"
                    value={forgotPasswordData.email}
                    onChange={handleForgotPasswordInputChange('email')}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 bg-white/90 backdrop-blur-sm placeholder-gray-400 text-gray-800 font-medium"
                    placeholder="your.email@example.com"
                  />
                </InputField>

                <button
                  onClick={handleSendOTP}
                  disabled={forgotPasswordLoading}
                  className={`w-full py-3 px-8 rounded-xl font-bold text-lg shadow-xl transition-all duration-300 ${
                    forgotPasswordLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:via-purple-700 hover:to-pink-700 text-white hover:shadow-2xl'
                  }`}
                >
                  {forgotPasswordLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending OTP...
                    </div>
                  ) : (
                    'Send OTP'
                  )}
                </button>
              </div>
            )}

            {/* Step 2: OTP Verification */}
            {forgotPasswordStep === 2 && (
              <div className="space-y-5">
                <p className="text-gray-600 text-center">
                  We've sent a 6-digit OTP to <strong>{forgotPasswordData.email}</strong>. Please enter it below.
                </p>
                
                <InputField icon={Mail} label="OTP Code" error={forgotPasswordErrors.email_otp} required>
                  <input
                    type="text"
                    value={forgotPasswordData.email_otp}
                    onChange={handleForgotPasswordInputChange('email_otp')}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 bg-white/90 backdrop-blur-sm placeholder-gray-400 text-gray-800 font-medium text-center text-lg tracking-widest"
                    placeholder="123456"
                    maxLength="6"
                  />
                </InputField>

                <button
                  onClick={handleVerifyOTP}
                  disabled={forgotPasswordLoading}
                  className={`w-full py-3 px-8 rounded-xl font-bold text-lg shadow-xl transition-all duration-300 ${
                    forgotPasswordLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:via-purple-700 hover:to-pink-700 text-white hover:shadow-2xl'
                  }`}
                >
                  {forgotPasswordLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Verifying...
                    </div>
                  ) : (
                    'Verify OTP'
                  )}
                </button>

                <div className="text-center">
                  <button
                    onClick={handleSendOTP}
                    className="text-sm text-violet-600 hover:text-violet-800 font-semibold transition-colors hover:underline"
                  >
                    Resend OTP
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: New Password */}
            {forgotPasswordStep === 3 && (
              <div className="space-y-5">
                <p className="text-gray-600 text-center">
                  Create a new password for your account.
                </p>
                
                <InputField icon={Lock} label="New Password" error={forgotPasswordErrors.new_password} required>
                  <input
                    type="password"
                    value={forgotPasswordData.new_password}
                    onChange={handleForgotPasswordInputChange('new_password')}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 bg-white/90 backdrop-blur-sm placeholder-gray-400 text-gray-800 font-medium"
                    placeholder="Enter new password"
                  />
                </InputField>

                <InputField icon={Lock} label="Confirm Password" error={forgotPasswordErrors.confirm_password} required>
                  <input
                    type="password"
                    value={forgotPasswordData.confirm_password}
                    onChange={handleForgotPasswordInputChange('confirm_password')}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 bg-white/90 backdrop-blur-sm placeholder-gray-400 text-gray-800 font-medium"
                    placeholder="Confirm new password"
                  />
                </InputField>

                {forgotPasswordErrors.confirm_password && forgotPasswordData.new_password !== forgotPasswordData.confirm_password && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
                    Passwords do not match
                  </p>
                )}

                <button
                  onClick={handleResetPassword}
                  disabled={forgotPasswordLoading}
                  className={`w-full py-3 px-8 rounded-xl font-bold text-lg shadow-xl transition-all duration-300 ${
                    forgotPasswordLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:via-purple-700 hover:to-pink-700 text-white hover:shadow-2xl'
                  }`}
                >
                  {forgotPasswordLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Resetting...
                    </div>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Login