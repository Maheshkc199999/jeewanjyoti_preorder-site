import React, { useState, useEffect } from 'react';
import { Edit3, Mail, Phone, MapPin, Calendar, Users, Award, Star, Heart, Camera, Trash2, AlertTriangle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clearTokens } from '../../lib/tokenManager';
import { getSleepData, getSpO2Data, getHeartRateData, getBloodPressureData, getStressData, getHRVData, getUserEmailProfile } from '../../lib/api';

const ProfileTab = ({ darkMode }) => {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [sleepData, setSleepData] = useState(null);
  const [spo2Data, setSpO2Data] = useState(null);
  const [heartRateData, setHeartRateData] = useState(null);
  const [bloodPressureData, setBloodPressureData] = useState(null);
  const [stressData, setStressData] = useState(null);
  const [hrvData, setHrvData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  
  // Check if user is admin/superuser
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const isAdmin = userData.is_superuser || userData.role === 'ADMIN';

  // Calculate BMI
  const calculateBMI = (height, weight) => {
    if (!height || !weight || height === 0 || weight === 0) return null;
    const heightInMeters = parseFloat(height) / 100; // Convert cm to meters
    const weightInKg = parseFloat(weight);
    return (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
  };

  // Get BMI category
  const getBMICategory = (bmi) => {
    if (!bmi) return 'N/A';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  // Calculate sleep score based on data (same as SleepDataComponent)
  const calculateSleepScore = (data) => {
    if (!data) return 0;
    
    let score = 0;
    
    // Duration score (optimal: 7-9 hours)
    const duration = data.duration;
    if (duration >= 7 && duration <= 9) {
      score += 30;
    } else if (duration >= 6 && duration <= 10) {
      score += 20;
    } else {
      score += 10;
    }
    
    // Deep sleep percentage (optimal: 15-20%)
    const deepSleep = data.deep_sleep_percentage;
    if (deepSleep >= 15 && deepSleep <= 20) {
      score += 25;
    } else if (deepSleep >= 10 && deepSleep <= 25) {
      score += 15;
    } else {
      score += 5;
    }
    
    // Light sleep percentage (optimal: 45-55%)
    const lightSleep = data.light_sleep_percentage;
    if (lightSleep >= 45 && lightSleep <= 55) {
      score += 25;
    } else if (lightSleep >= 40 && lightSleep <= 60) {
      score += 15;
    } else {
      score += 5;
    }
    
    // Awake percentage (optimal: <5%)
    const awake = data.awake_percentage;
    if (awake < 5) {
      score += 20;
    } else if (awake < 10) {
      score += 10;
    } else {
      score += 5;
    }
    
    return Math.min(score, 100);
  };

  // Fetch health data for health statistics
  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        const [sleepDataResult, spo2DataResult, heartRateDataResult, bloodPressureDataResult, stressDataResult, hrvDataResult, userProfileResult] = await Promise.all([
          getSleepData(),
          getSpO2Data(),
          getHeartRateData(),
          getBloodPressureData(),
          getStressData(),
          getHRVData(),
          getUserEmailProfile()
        ]);
        setSleepData(sleepDataResult);
        setSpO2Data(spo2DataResult);
        setHeartRateData(heartRateDataResult);
        setBloodPressureData(bloodPressureDataResult);
        setStressData(stressDataResult);
        setHrvData(hrvDataResult);
        setUserProfile(userProfileResult);
      } catch (error) {
        console.error('Error fetching health data for profile:', error);
      }
    };
    fetchHealthData();
  }, []);

  // Handle delete account
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    
    try {
      const token = localStorage.getItem('access_token');
      
      // Prepare request based on user type
      let requestBody = {};
      if (isAdmin) {
        // Admin users: send user ID in payload to delete specific account
        requestBody = { id: userData.id };
      }
      // Regular users: send empty body (will delete their own account)
      
      const response = await fetch('https://jeewanjyoti-backend.smart.org.np/api/delete-account/', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: Object.keys(requestBody).length > 0 ? JSON.stringify(requestBody) : undefined
      });

      if (response.ok) {
        // Account deleted successfully
        clearTokens();
        navigate('/login');
        alert('Your account has been deleted successfully.');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setDeleteError(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Profile</h2>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors text-sm md:text-base">
          <Edit3 className="w-4 h-4" />
          <span className="hidden md:inline">Edit Profile</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="text-center mb-6">
              <div className="relative mx-auto w-16 h-16 md:w-24 md:h-24 mb-4">
                {userProfile && userProfile.profile_image ? (
                  <img 
                    src={userProfile.profile_image} 
                    alt="Profile" 
                    className="w-16 h-16 md:w-24 md:h-24 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-lg md:text-2xl font-bold">
                    {userProfile ? `${userProfile.first_name?.[0] || ''}${userProfile.last_name?.[0] || ''}` : 'JD'}
                  </div>
                )}
                <button className={`absolute bottom-0 right-0 border-2 rounded-full p-1 md:p-2 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                } transition-colors`}>
                  <Camera className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />
                </button>
              </div>
              <h3 className={`text-lg md:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {userProfile ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'User' : 'John Doe'}
              </h3>
              <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {userProfile ? `ID: #${userProfile.id}` : 'Patient ID: #12345'}
              </p>
              {userProfile && userProfile.role === 'DOCTOR' && (
                <p className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'} font-medium mt-1`}>
                  {userProfile.specialization || 'Doctor'}
                </p>
              )}
            </div>

            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <span className={`text-xs md:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {userProfile?.email || 'john.doe@email.com'}
                </span>
              </div>
              {userProfile?.phone_number && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                  <span className={`text-xs md:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {userProfile.phone_number}
                  </span>
                </div>
              )}
              {userProfile?.hospital_name && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                  <span className={`text-xs md:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {userProfile.hospital_name}
                  </span>
                </div>
              )}
              {userProfile?.birthdate && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                  <span className={`text-xs md:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Born: {new Date(userProfile.birthdate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {userProfile?.gender && (
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                  <span className={`text-xs md:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {userProfile.gender}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Health Stats & Achievements */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Health Stats */}
          <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <h3 className={`text-base md:text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>Health Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-blue-600">
                  {heartRateData && heartRateData.length > 0 
                    ? heartRateData[heartRateData.length - 1].once_heart_value
                    : '72'
                  }
                </div>
                <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Heart Rate</div>
              </div>
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-green-600">
                  {sleepData && sleepData.length > 0 
                    ? calculateSleepScore(sleepData[0])
                    : '85'
                  }/100
                </div>
                <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sleep Score</div>
              </div>
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-purple-600">12,340</div>
                <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Daily Steps</div>
              </div>
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-orange-600">
                  {spo2Data && spo2Data.length > 0 
                    ? spo2Data[spo2Data.length - 1].Blood_oxygen
                    : '98'
                  }%
                </div>
                <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Blood Oxygen</div>
              </div>
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-red-600">
                  {bloodPressureData && bloodPressureData.length > 0 
                    ? `${bloodPressureData[bloodPressureData.length - 1].sbp}/${bloodPressureData[bloodPressureData.length - 1].dbp}`
                    : '120/80'
                  }
                </div>
                <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>SBP/DBP</div>
              </div>
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-purple-600">
                  {stressData && stressData.length > 0 
                    ? stressData[stressData.length - 1].stress
                    : '45'
                  }
                </div>
                <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Stress Level</div>
              </div>
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-teal-600">
                  {hrvData && hrvData.length > 0 
                    ? hrvData[hrvData.length - 1].hrv
                    : '45'
                  }
                </div>
                <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>HRV Score</div>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <h3 className={`text-base md:text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>Medical Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <h4 className={`font-semibold text-sm md:text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Basic Info</h4>
                <div className="space-y-2 text-xs md:text-sm">
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Height:</span>
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-800'}>
                      {userProfile?.height && userProfile.height !== '0.00' 
                        ? `${userProfile.height} cm` 
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Weight:</span>
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-800'}>
                      {userProfile?.weight && userProfile.weight !== '0.00' 
                        ? `${userProfile.weight} kg` 
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Blood Type:</span>
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-800'}>
                      {userProfile?.blood_group || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>BMI:</span>
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-800'}>
                      {userProfile?.height && userProfile?.weight && 
                       userProfile.height !== '0.00' && userProfile.weight !== '0.00' 
                        ? `${calculateBMI(userProfile.height, userProfile.weight)} (${getBMICategory(calculateBMI(userProfile.height, userProfile.weight))})`
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className={`font-semibold text-sm md:text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  {userProfile?.role === 'DOCTOR' ? 'Professional Info' : 'Conditions'}
                </h4>
                {userProfile?.role === 'DOCTOR' ? (
                  <div className="space-y-2 text-xs md:text-sm">
                    {userProfile?.specialization && (
                      <div className="flex justify-between">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Specialization:</span>
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-800'}>{userProfile.specialization}</span>
                      </div>
                    )}
                    {userProfile?.license_number && (
                      <div className="flex justify-between">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>License:</span>
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-800'}>{userProfile.license_number}</span>
                      </div>
                    )}
                    {userProfile?.experience && (
                      <div className="flex justify-between">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Experience:</span>
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-800'}>{userProfile.experience} years</span>
                      </div>
                    )}
                    {userProfile?.education && (
                      <div className="flex justify-between">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Education:</span>
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-800'}>{userProfile.education}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs md:text-sm">
                      Mild Hypertension
                    </span>
                    <br />
                    <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs md:text-sm mt-2">
                      Seasonal Allergies
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <h3 className={`text-base md:text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>Health Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <div className={`flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl ${
                darkMode 
                  ? 'bg-gradient-to-r from-yellow-900 to-yellow-800' 
                  : 'bg-gradient-to-r from-yellow-100 to-yellow-50'
              }`}>
                <Award className="w-6 h-6 md:w-8 md:h-8 text-yellow-600" />
                <div>
                  <div className={`font-semibold text-sm md:text-base ${darkMode ? 'text-white' : 'text-gray-800'}`}>7-Day Streak</div>
                  <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Daily step goal</div>
                </div>
              </div>
              <div className={`flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl ${
                darkMode 
                  ? 'bg-gradient-to-r from-green-900 to-green-800' 
                  : 'bg-gradient-to-r from-green-100 to-emerald-100'
              }`}>
                <Star className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
                <div>
                  <div className={`font-semibold text-sm md:text-base ${darkMode ? 'text-white' : 'text-gray-800'}`}>Sleep Champion</div>
                  <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>30 days good sleep</div>
                </div>
              </div>
              <div className={`flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl ${
                darkMode 
                  ? 'bg-gradient-to-r from-blue-900 to-blue-800' 
                  : 'bg-gradient-to-r from-blue-100 to-cyan-100'
              }`}>
                <Heart className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                <div>
                  <div className={`font-semibold text-sm md:text-base ${darkMode ? 'text-white' : 'text-gray-800'}`}>Heart Health</div>
                  <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Optimal HR zone</div>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <h3 className={`text-base md:text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>Emergency Contacts</h3>
            <div className="space-y-3 md:space-y-4">
              <div className={`flex items-center justify-between p-3 md:p-4 rounded-xl ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                  <div>
                    <div className={`font-semibold text-sm md:text-base ${darkMode ? 'text-white' : 'text-gray-800'}`}>Sarah Doe</div>
                    <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Spouse</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs md:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>+1 (555) 987-6543</span>
                  <Phone className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                </div>
              </div>
              <div className={`flex items-center justify-between p-3 md:p-4 rounded-xl ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                  <div>
                    <div className={`font-semibold text-sm md:text-base ${darkMode ? 'text-white' : 'text-gray-800'}`}>Dr. Sarah Smith</div>
                    <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Primary Care</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs md:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>+1 (555) 246-8102</span>
                  <Phone className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Settings Section */}
          <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <h3 className={`text-base md:text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>Account Settings</h3>
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border ${
                darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-red-800' : 'bg-red-100'}`}>
                      <Trash2 className={`w-5 h-5 ${darkMode ? 'text-red-300' : 'text-red-600'}`} />
                    </div>
                    <div>
                      <h4 className={`font-semibold text-sm md:text-base ${darkMode ? 'text-red-200' : 'text-red-800'}`}>
                        Delete Account
                      </h4>
                      <p className={`text-xs md:text-sm ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                        {isAdmin 
                          ? 'Permanently delete your account and all associated data' 
                          : 'Permanently delete your own account and all associated data'
                        }
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      darkMode 
                        ? 'bg-red-800 text-red-200 hover:bg-red-700' 
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Delete Account
              </h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteError(null);
                }}
                className={`p-2 rounded-lg hover:bg-gray-100 ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className={`flex items-center gap-3 p-4 rounded-xl mb-4 ${
                darkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
              }`}>
                <AlertTriangle className={`w-6 h-6 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                <div>
                  <h4 className={`font-semibold ${darkMode ? 'text-red-200' : 'text-red-800'}`}>
                    Warning: This action cannot be undone
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                    All your data, appointments, and account information will be permanently deleted.
                  </p>
                </div>
              </div>

              {deleteError && (
                <div className={`p-3 rounded-lg mb-4 ${darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'}`}>
                  {deleteError}
                </div>
              )}

              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Are you sure you want to delete your account? This action is irreversible and will remove all your data from our system.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteError(null);
                }}
                className={`flex-1 px-4 py-2 rounded-lg ${
                  darkMode 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                  isDeleting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isDeleting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </div>
                ) : (
                  'Delete Account'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileTab;