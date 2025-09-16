
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { useState } from 'react'
import { User, Building2, Mail, Lock, Phone, MapPin, Globe, FileText, Heart, Stethoscope, UserCheck, Briefcase, GraduationCap, Calendar, Upload } from 'lucide-react'
import logo from '../assets/logo.png'

// Custom CSS for range sliders
const sliderStyles = `
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 24px;
    width: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8b5cf6, #a855f7);
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
    transition: all 0.2s ease;
  }
  
  .slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 6px 16px rgba(139, 92, 246, 0.6);
  }
  
  .slider::-moz-range-thumb {
    height: 24px;
    width: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8b5cf6, #a855f7);
    cursor: pointer;
    border: none;
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
  }
`

function Register() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const [type, setType] = useState('individual') // 'individual' | 'institution'
  const [role, setRole] = useState('USER')
  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const url = type === 'individual' ? '/api/user/register/' : '/api/institution/register/'
      const response = await axios.post(url, data)
      console.log(response.data)
      alert('Registered successfully!')
    } catch (error) {
      console.error(error.response?.data || error.message)
      alert(error.response?.data?.detail || 'Registration failed')
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
    <>
      <style>{sliderStyles}</style>
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-violet-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto py-8 px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <img src={logo} alt="Jeewan Jyoti" className="h-16 w-auto" />
              </div>
            </div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Create Account
            </h1>
            <p className="text-gray-600 text-lg">Join our healthcare community</p>
          </div>

          {/* Main Form Container */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl transition-all duration-500">
            {/* Type Selector */}
            <div className="flex justify-center mb-8">
              <div className="bg-gray-100/80 backdrop-blur-sm p-1 rounded-2xl shadow-inner flex flex-row items-center gap-2 whitespace-nowrap">
                <button
                  type="button"
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    type === 'individual'
                      ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  onClick={() => setType('individual')}
                >
                  <User className="w-4 h-4" />
                  Individual
                </button>
                <button
                  type="button"
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    type === 'institution'
                      ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  onClick={() => setType('institution')}
                >
                  <Building2 className="w-4 h-4" />
                  Institution
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Individual Form */}
              {type === 'individual' && (
                <>
                  {/* Roles - centered buttons (no label) */}
                  <div className="mb-4">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setRole('USER')}
                        className={`px-4 py-2 rounded-2xl border transition-all duration-300 ${role === 'USER' ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-lg' : 'bg-white/80 border-gray-200 text-gray-700 hover:border-violet-300'}`}
                      >
                        <span className="mr-1">👤</span>
                        User
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('DOCTOR')}
                        className={`px-4 py-2 rounded-2xl border transition-all duration-300 ${role === 'DOCTOR' ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-lg' : 'bg-white/80 border-gray-200 text-gray-700 hover:border-violet-300'}`}
                      >
                        <span className="mr-1">👨‍⚕️</span>
                        Doctor
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('NURSE')}
                        className={`px-4 py-2 rounded-2xl border transition-all duration-300 ${role === 'NURSE' ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-lg' : 'bg-white/80 border-gray-200 text-gray-700 hover:border-violet-300'}`}
                      >
                        <span className="mr-1">👩‍⚕️</span>
                        Nurse
                      </button>
                    </div>
                    <input type="hidden" value={role} {...register('role')} readOnly />
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField icon={User} label="First Name" error={errors.first_name} required>
                      <input
                        {...register('first_name', { required: true })}
                        className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400"
                        placeholder="Enter your first name"
                      />
                    </InputField>
                    <InputField icon={User} label="Last Name" error={errors.last_name} required>
                      <input
                        {...register('last_name', { required: true })}
                        className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400"
                        placeholder="Enter your last name"
                      />
                    </InputField>
                  </div>

                  {/* Email & Password */}
                  <div className="space-y-6">
                    <InputField icon={Mail} label="Email Address" error={errors.email} required>
                      <input
                        type="email"
                        {...register('email', { required: true })}
                        className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400"
                        placeholder="your.email@example.com"
                      />
                    </InputField>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField icon={Lock} label="Password" error={errors.password} required>
                        <input
                          type="password"
                          {...register('password', { required: true })}
                          className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400"
                          placeholder="••••••••"
                        />
                      </InputField>
                      <InputField icon={Lock} label="Confirm Password" error={errors.confirm_password} required>
                        <input
                          type="password"
                          {...register('confirm_password', { required: true })}
                          className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400"
                          placeholder="••••••••"
                        />
                      </InputField>
                    </div>
                  </div>

                  {/* Role-specific fields */}
                  {role === 'USER' && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-500" />
                        Health Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InputField icon={User} label="Height (cm)" required>
                          <input
                            type="number"
                            step="0.01"
                            {...register('height', { required: true })}
                            className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400"
                            placeholder="170"
                          />
                        </InputField>
                        <InputField icon={User} label="Weight (kg)" required>
                          <input
                            type="number"
                            step="0.01"
                            {...register('weight', { required: true })}
                            className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400"
                            placeholder="65"
                          />
                        </InputField>
                        <InputField icon={Heart} label="Blood Group" required>
                          <input
                            {...register('blood_group', { required: true })}
                            className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400"
                            placeholder="A+"
                          />
                        </InputField>
                      </div>
                    </div>
                  )}

                  {(role === 'DOCTOR' || role === 'NURSE') && (
                    <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6 border border-green-100">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Stethoscope className="w-5 h-5 text-green-600" />
                        Professional Information
                      </h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InputField icon={FileText} label="License Number" error={errors.license_number} required>
                            <input
                              {...register('license_number', { required: true })}
                              className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400"
                              placeholder="LIC123456"
                            />
                          </InputField>
                          <InputField icon={Building2} label="Hospital Name" error={errors.hospital_name} required>
                            <input
                              {...register('hospital_name', { required: true })}
                              className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400"
                              placeholder="City Hospital"
                            />
                          </InputField>
                          <InputField icon={Calendar} label="Experience (years)" error={errors.experience} required>
                            <input
                              type="number"
                              {...register('experience', { required: true })}
                              className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400"
                              placeholder="5"
                            />
                          </InputField>
                          <InputField icon={Phone} label="Phone Number" error={errors.phone_number} required>
                            <input
                              {...register('phone_number', { required: true })}
                              className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400"
                              placeholder="+977-98xxxxxxxx"
                            />
                          </InputField>
                        </div>

                        {role === 'DOCTOR' && (
                          <div className="space-y-4">
                            <InputField icon={Stethoscope} label="Specialization" error={errors.specialization} required>
                              <input
                                {...register('specialization', { required: true })}
                                className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400"
                                placeholder="Cardiology"
                              />
                            </InputField>
                            <InputField icon={GraduationCap} label="Education">
                              <textarea
                                {...register('education')}
                                className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400 resize-none"
                                rows="3"
                                placeholder="MBBS, MD - Cardiology"
                              />
                            </InputField>
                          </div>
                        )}

                        <InputField icon={FileText} label="Description" error={errors.description} required>
                          <textarea
                            {...register('description', { required: true })}
                            className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400 resize-none"
                            rows="4"
                            placeholder="Tell us about yourself and your professional background..."
                          />
                        </InputField>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Institution Form */}
              {type === 'institution' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-indigo-600" />
                      Institution Details
                    </h3>
                    
                    <div className="space-y-4">
                      <InputField icon={Mail} label="Email Address" error={errors.email} required>
                        <input
                          type="email"
                          {...register('email', { required: true })}
                          className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400"
                          placeholder="contact@institution.com"
                        />
                      </InputField>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField icon={Lock} label="Password" error={errors.password} required>
                          <input
                            type="password"
                            {...register('password', { required: true })}
                            className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400"
                            placeholder="••••••••"
                          />
                        </InputField>
                        <InputField icon={Lock} label="Confirm Password" error={errors.confirm_password} required>
                          <input
                            type="password"
                            {...register('confirm_password', { required: true })}
                            className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400"
                            placeholder="••••••••"
                          />
                        </InputField>
                      </div>

                      <InputField icon={Building2} label="Institution Name" error={errors.name} required>
                        <input
                          {...register('name', { required: true })}
                          className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400"
                          placeholder="City General Hospital"
                        />
                      </InputField>

                      <InputField icon={Briefcase} label="Institution Type" required>
                        <select
                          {...register('institution_type')}
                          className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                        >
                          <option value="hospital">🏥 Hospital</option>
                          <option value="clinic">🏥 Clinic</option>
                          <option value="school">🏫 School</option>
                          <option value="ngo">🤝 NGO</option>
                          <option value="university">🎓 University</option>
                          <option value="government">🏛️ Government Office</option>
                          <option value="company">🏢 Company</option>
                          <option value="other">📋 Other</option>
                        </select>
                      </InputField>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField icon={MapPin} label="Address" error={errors.address} required>
                          <input
                            {...register('address', { required: true })}
                            className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400"
                            placeholder="123 Main Street, City"
                          />
                        </InputField>
                        <InputField icon={Phone} label="Phone Number">
                          <input
                            {...register('phone')}
                            className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400"
                            placeholder="+977-1-4xxxxxx"
                          />
                        </InputField>
                      </div>

                      <InputField icon={Globe} label="Website">
                        <input
                          {...register('website')}
                          className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400"
                          placeholder="https://www.institution.com"
                        />
                      </InputField>

                      <InputField icon={FileText} label="Description">
                        <textarea
                          {...register('description')}
                          className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400 resize-none"
                          rows="4"
                          placeholder="Describe your institution and services..."
                        />
                      </InputField>

                      <InputField icon={Upload} label="Logo">
                        <input
                          type="file"
                          {...register('logo')}
                          className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white/80 backdrop-blur-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                      </InputField>
                    </div>
                  </div>
                </div>
              )}

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
                    Creating your account...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Heart className="w-5 h-5" />
                    Register
                  </div>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="text-center mt-8 text-gray-500 text-sm">
              <p>Already have an account? <a href="/login" className="text-violet-600 hover:text-violet-800 font-semibold transition-colors">Sign in</a></p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Register