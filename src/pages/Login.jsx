import { useForm } from 'react-hook-form'
import axios from 'axios'
import { useState } from 'react'
import { Mail, Lock, Heart, LogIn } from 'lucide-react'
import logo from '../assets/logo.png'

function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const url = '/api/user/login/'
      const response = await axios.post(url, data)
      console.log(response.data)
      alert('Login success!')
    } catch (error) {
      console.error(error.response?.data || error.message)
      alert(error.response?.data?.detail || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const InputField = ({ icon: Icon, label, error, children, required = false }) => (
    <div className="group relative">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
        <Icon className="w-4 h-4 text-violet-600" />
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {children}
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1 animate-pulse flex items-center gap-1">
          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
          This field is required
        </p>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-violet-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-md mx-auto py-16 px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <img src={logo} alt="Jeewan Jyoti" className="h-16 w-auto" />
            </div>
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Sign In
          </h1>
          <p className="text-gray-600 text-lg">Access your healthcare dashboard</p>
        </div>

        {/* Main Form Container */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl transition-all duration-500">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <InputField icon={Mail} label="Email Address" error={errors.email} required>
              <input
                type="email"
                {...register('email', { required: true })}
                className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400"
                placeholder="your.email@example.com"
              />
            </InputField>

            <InputField icon={Lock} label="Password" error={errors.password} required>
              <input
                type="password"
                {...register('password', { required: true })}
                className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400"
                placeholder="••••••••"
              />
            </InputField>

            {/* Forgot Password Link */}
            <div className="text-right">
              <a 
                href="/forgot-password" 
                className="text-sm text-violet-600 hover:text-violet-800 font-semibold transition-colors hover:underline"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 px-8 rounded-2xl font-bold text-lg shadow-2xl transition-all duration-300 transform ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:via-purple-700 hover:to-pink-700 text-white hover:shadow-3xl hover:scale-105 active:scale-95'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing you in...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <LogIn className="w-5 h-5" />
                  Sign In
                </div>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-8">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-gray-500 text-sm font-medium">or</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Social Login Buttons (placeholder) */}
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-semibold text-gray-700">
              <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">G</span>
              </div>
              Continue with Google
            </button>
            <button className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-semibold text-gray-700">
              <div className="w-5 h-5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">f</span>
              </div>
              Continue with Facebook
            </button>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-gray-500 text-sm">
            <p>
              Don't have an account?{' '}
              <a 
                href="/register" 
                className="text-violet-600 hover:text-violet-800 font-semibold transition-colors hover:underline"
              >
                Create account
              </a>
            </p>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/40 text-sm text-gray-600">
            <Heart className="w-4 h-4 text-red-500" />
            Secure healthcare login
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login