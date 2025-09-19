import React from 'react';
import { Edit3, Mail, Phone, MapPin, Calendar, Users, Award, Star, Heart, Camera } from 'lucide-react';

const ProfileTab = ({ darkMode }) => {
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
                <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-lg md:text-2xl font-bold">
                  JD
                </div>
                <button className={`absolute bottom-0 right-0 border-2 rounded-full p-1 md:p-2 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                } transition-colors`}>
                  <Camera className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />
                </button>
              </div>
              <h3 className={`text-lg md:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>John Doe</h3>
              <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Patient ID: #12345</p>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <span className={`text-xs md:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>john.doe@email.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <span className={`text-xs md:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <span className={`text-xs md:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>New York, NY</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <span className={`text-xs md:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Born: Jan 15, 1990</span>
              </div>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-blue-600">72</div>
                <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Heart Rate</div>
              </div>
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-green-600">85</div>
                <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sleep Score</div>
              </div>
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-purple-600">12,340</div>
                <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Daily Steps</div>
              </div>
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-orange-600">98%</div>
                <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Blood Oxygen</div>
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
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-800'}>5'10" (178 cm)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Weight:</span>
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-800'}>175 lbs (79 kg)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Blood Type:</span>
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-800'}>O+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>BMI:</span>
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-800'}>25.1</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className={`font-semibold text-sm md:text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Conditions</h4>
                <div className="space-y-2">
                  <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs md:text-sm">
                    Mild Hypertension
                  </span>
                  <br />
                  <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs md:text-sm mt-2">
                    Seasonal Allergies
                  </span>
                </div>
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
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;