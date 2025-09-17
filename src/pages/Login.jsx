import React, { useState } from 'react'
import { Mail, Lock, LogIn, Eye, EyeOff, Building, User } from 'lucide-react'
import logo from '../assets/logo.png'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loginType, setLoginType] = useState('individual') // 'individual' or 'institutional'
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}
    
    if (!email) newErrors.email = true
    if (!password) newErrors.password = true
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) return

    setIsLoading(true)
    try {
      // Determine the API endpoint based on login type
      const apiUrl = loginType === 'individual' 
        ? 'https://jeewanjyoti-backend.smart.org.np/api/login/'
        : 'https://jeewanjyoti-backend.smart.org.np/api/ins/login/'
      
      // Make the API call
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      })
      
      if (!response.ok) {
        throw new Error(`Login failed with status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Login successful:', data)
      navigate('/dashboard')
      
      // You might want to redirect or store the authentication token here
      // For example: localStorage.setItem('authToken', data.token)
      
    } catch (error) {
      console.error('Login error:', error)
      alert('Login failed. Please check your credentials and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const InputField = ({ icon: Icon, label, error, children, required = false }) => (
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
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-violet-400/30 to-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-br from-pink-400/30 to-violet-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 left-1/3 w-48 h-48 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-gradient-to-br from-pink-300/25 to-violet-500/25 rounded-full blur-2xl animate-pulse"></div>
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
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 md:p-8 hover:shadow-3xl transition-all duration-500">
            <div className="space-y-5">
              {/* Email field */}
              <InputField icon={Mail} label="Email Address" error={errors.email} required>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 bg-white/90 backdrop-blur-sm placeholder-gray-400 text-gray-800 font-medium"
                  placeholder="your.email@example.com"
                />
              </InputField>

              {/* Password field with show/hide toggle */}
              <InputField icon={Lock} label="Password" error={errors.password} required>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                className={`w-full py-3 px-8 rounded-xl font-bold text-lg shadow-xl transition-all duration-300 transform ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed scale-95'
                    : 'bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:via-purple-700 hover:to-pink-700 text-white hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] shadow-violet-500/25'
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
                <a 
                  href="/forgot-password" 
                  className="text-sm text-violet-600 hover:text-violet-800 font-semibold transition-colors hover:underline"
                >
                  Forgot password?
                </a>
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
              <button className="flex items-center justify-center w-12 h-12 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300">
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
    </div>
  )
}

export default Login