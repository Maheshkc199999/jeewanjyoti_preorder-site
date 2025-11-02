import React, { useState } from 'react';
import { User, Calendar, UserCircle, Ruler, Scale, Droplets, X } from 'lucide-react';
import { updateProfile } from '../lib/api';
import { getUserData } from '../lib/tokenManager';

const ProfileCompletionForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    birthdate: '',
    gender: '',
    height: '',
    weight: '',
    blood_group: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Pre-fill with existing user data if available
  React.useEffect(() => {
    const userData = getUserData();
    if (userData) {
      setFormData(prev => ({
        ...prev,
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        birthdate: userData.birthdate || '',
        gender: userData.gender || '',
        height: userData.height || '',
        weight: userData.weight || '',
        blood_group: userData.blood_group || ''
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Prepare payload - only include fields that have values
      const payload = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] && formData[key].trim() !== '') {
          payload[key] = formData[key].trim();
        }
      });

      // If no data to update, just close
      if (Object.keys(payload).length === 0) {
        onSuccess?.();
        onClose();
        return;
      }

      await updateProfile(payload);
      
      // Update user data in localStorage
      const userData = getUserData();
      if (userData) {
        const updatedUserData = { ...userData, ...payload };
        localStorage.setItem('user_data', JSON.stringify(updatedUserData));
      }

      onSuccess?.();
      onClose();
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.details) {
        setErrors(error.details);
      } else {
        alert(`Failed to update profile: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const InputField = ({ icon: Icon, label, name, type = 'text', required = false, error, children }) => (
    <div className="group relative">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
        <Icon className="w-4 h-4 text-violet-600" />
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {children || (
          <input
            type={type}
            name={name}
            value={formData[name] || ''}
            onChange={handleChange}
            className={`w-full p-4 border rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400 ${
              error ? 'border-red-500' : 'border-gray-200'
            }`}
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        )}
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1 animate-pulse flex items-center gap-1">
          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
          {typeof error === 'string' ? error : error[0]}
        </p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Complete Your Profile</h2>
              <p className="text-sm text-gray-600">Help us personalize your experience</p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <InputField
              icon={User}
              label="First Name"
              name="first_name"
              error={errors.first_name}
            />

            {/* Last Name */}
            <InputField
              icon={User}
              label="Last Name"
              name="last_name"
              error={errors.last_name}
            />

            {/* Birthdate */}
            <InputField
              icon={Calendar}
              label="Birthdate"
              name="birthdate"
              type="date"
              error={errors.birthdate}
            />

            {/* Gender */}
            <div className="group relative">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <UserCircle className="w-4 h-4 text-violet-600" />
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`w-full p-4 border rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 bg-white/80 backdrop-blur-sm ${
                  errors.gender ? 'border-red-500' : 'border-gray-200'
                }`}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && (
                <p className="text-red-500 text-xs mt-1 animate-pulse flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {typeof errors.gender === 'string' ? errors.gender : errors.gender[0]}
                </p>
              )}
            </div>

            {/* Height */}
            <InputField
              icon={Ruler}
              label="Height (cm)"
              name="height"
              type="number"
              error={errors.height}
            />

            {/* Weight */}
            <InputField
              icon={Scale}
              label="Weight (kg)"
              name="weight"
              type="number"
              error={errors.weight}
            />

            {/* Blood Group */}
            <div className="group relative md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Droplets className="w-4 h-4 text-violet-600" />
                Blood Group
              </label>
              <select
                name="blood_group"
                value={formData.blood_group}
                onChange={handleChange}
                className={`w-full p-4 border rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 bg-white/80 backdrop-blur-sm ${
                  errors.blood_group ? 'border-red-500' : 'border-gray-200'
                }`}
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
              {errors.blood_group && (
                <p className="text-red-500 text-xs mt-1 animate-pulse flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {typeof errors.blood_group === 'string' ? errors.blood_group : errors.blood_group[0]}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-2xl font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-300"
              disabled={isLoading}
            >
              Skip for Now
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl font-semibold text-white hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileCompletionForm;

