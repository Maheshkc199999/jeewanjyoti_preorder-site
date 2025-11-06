import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Phone, Calendar, Users, UserCircle, User, X, Loader2, CheckCircle, XCircle, Edit2, Trash2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '../../lib/api';

const UserMappingTab = ({ darkMode }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [mappedUsers, setMappedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    birthdate: '',
    gender: '',
    relationship: ''
  });

  // Fetch mapped users on component mount
  useEffect(() => {
    fetchMappedUsers();
  }, []);

  const fetchMappedUsers = async () => {
    setIsFetching(true);
    try {
      const response = await apiRequest('/api/user-mapping/', {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        setMappedUsers(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch mapped users');
        setMappedUsers([]);
      }
    } catch (error) {
      console.error('Error fetching mapped users:', error);
      setMappedUsers([]);
    } finally {
      setIsFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (submitStatus === 'error') {
      setSubmitStatus(null);
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitStatus(null);
    setErrorMessage('');

    console.log('Submitting user mapping data:', formData);

    try {
      const response = await apiRequest('/api/user-mapping/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Success response:', result);
        setSubmitStatus('success');
        
        // Reset form and refresh list
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone_number: '',
          birthdate: '',
          gender: '',
          relationship: ''
        });
        
        // Refresh the user list
        await fetchMappedUsers();
        
        // Close form after success
        setTimeout(() => {
          setShowAddForm(false);
          setSubmitStatus(null);
        }, 1500);
      } else {
        let errorData;
        try {
          errorData = await response.json();
          console.log('Error response:', errorData);
        } catch (parseError) {
          console.log('Could not parse error response as JSON');
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        let errorMessage = 'Failed to add user';
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(err => `${err.loc?.[1] || 'Field'}: ${err.msg}`).join(', ');
          } else {
            errorMessage = errorData.detail;
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error adding user:', error);
      setSubmitStatus('error');
      setErrorMessage(error.message || 'Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this user mapping?')) {
      return;
    }

    try {
      const response = await apiRequest(`/api/user-mapping/${userId}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the list
        await fetchMappedUsers();
      } else {
        alert('Failed to delete user mapping');
      }
    } catch (error) {
      console.error('Error deleting user mapping:', error);
      alert('Error deleting user mapping');
    }
  };

  const handleCloseForm = () => {
    if (!isLoading) {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        birthdate: '',
        gender: '',
        relationship: ''
      });
      setSubmitStatus(null);
      setErrorMessage('');
      setShowAddForm(false);
    }
  };

  // Filter users based on search query
  const filteredUsers = mappedUsers.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.relationship?.toLowerCase().includes(searchLower)
    );
  });

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
          <span className="hidden md:inline">Add User</span>
        </button>
      </div>

      {/* Search Bar */}
      {mappedUsers.length > 0 && (
        <div className="mb-6">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300'
              }`}
            />
          </div>
        </div>
      )}

      {/* Users List */}
      {isFetching ? (
        <div className={`flex items-center justify-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading users...
        </div>
      ) : filteredUsers.length === 0 && !searchQuery ? (
        <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No mapped users yet</p>
          <p className="text-sm">Click "Add User" to start mapping family members or loved ones</p>
        </div>
      ) : filteredUsers.length === 0 && searchQuery ? (
        <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No users found</p>
          <p className="text-sm">Try adjusting your search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl p-6 shadow-lg border ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {user.first_name?.[0] || ''}{user.last_name?.[0] || ''}
                  </div>
                  <div>
                    <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {user.first_name} {user.last_name}
                    </h3>
                    {user.relationship && (
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {user.relationship}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(user.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode 
                      ? 'hover:bg-red-900/30 text-red-400' 
                      : 'hover:bg-red-50 text-red-600'
                  }`}
                  title="Remove user"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {user.email && (
                  <div className="flex items-center gap-2">
                    <Mail className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {user.email}
                    </span>
                  </div>
                )}
                {user.phone_number && (
                  <div className="flex items-center gap-2">
                    <Phone className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {user.phone_number}
                    </span>
                  </div>
                )}
                {user.birthdate && (
                  <div className="flex items-center gap-2">
                    <Calendar className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {new Date(user.birthdate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {user.gender && (
                  <div className="flex items-center gap-2">
                    <UserCircle className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {user.gender}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add User Form Modal */}
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
              className={`fixed inset-x-4 top-[10%] bottom-4 md:inset-x-8 md:top-[5%] md:bottom-auto md:max-h-[90vh] rounded-3xl shadow-2xl z-50 overflow-hidden ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className="h-full flex flex-col overflow-y-auto">
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
                    <h2 className="text-3xl font-bold mb-2">👥 Add User</h2>
                    <p className="text-violet-100">Map a family member or loved one to your account</p>
                  </motion.div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-2xl mx-auto">
                    {/* Status Messages */}
                    {submitStatus === 'success' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-6 p-4 rounded-xl flex items-center ${
                          darkMode ? 'bg-green-900/30 border border-green-700' : 'bg-green-100 border border-green-300'
                        }`}
                      >
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <p className={`font-medium ${darkMode ? 'text-green-300' : 'text-green-800'}`}>
                          User added successfully!
                        </p>
                      </motion.div>
                    )}

                    {submitStatus === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-6 p-4 rounded-xl flex items-center ${
                          darkMode ? 'bg-red-900/30 border border-red-700' : 'bg-red-100 border border-red-300'
                        }`}
                      >
                        <XCircle className="h-5 w-5 text-red-600 mr-2" />
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-red-300' : 'text-red-800'}`}>
                            Failed to add user
                          </p>
                          {errorMessage && (
                            <p className={`text-sm mt-1 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                              {errorMessage}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* First Name */}
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            <User className="inline h-4 w-4 mr-2" />
                            First Name
                          </label>
                          <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            required
                            disabled={isLoading}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300'
                            }`}
                            placeholder="First Name"
                          />
                        </div>

                        {/* Last Name */}
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            <User className="inline h-4 w-4 mr-2" />
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            required
                            disabled={isLoading}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300'
                            }`}
                            placeholder="Last Name"
                          />
                        </div>

                        {/* Email */}
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            <Mail className="inline h-4 w-4 mr-2" />
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            disabled={isLoading}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300'
                            }`}
                            placeholder="email@example.com"
                          />
                        </div>

                        {/* Phone Number */}
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            <Phone className="inline h-4 w-4 mr-2" />
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300'
                            }`}
                            placeholder="+977 98XXXXXXXX"
                          />
                        </div>

                        {/* Birthdate */}
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            <Calendar className="inline h-4 w-4 mr-2" />
                            Birthdate
                          </label>
                          <input
                            type="date"
                            name="birthdate"
                            value={formData.birthdate}
                            onChange={handleInputChange}
                            max={new Date().toISOString().split('T')[0]}
                            disabled={isLoading}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300'
                            }`}
                          />
                        </div>

                        {/* Gender */}
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            <UserCircle className="inline h-4 w-4 mr-2" />
                            Gender
                          </label>
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300'
                            }`}
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        {/* Relationship */}
                        <div className="md:col-span-2">
                          <label className={`block text-sm font-medium mb-2 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            <Users className="inline h-4 w-4 mr-2" />
                            Relationship
                          </label>
                          <select
                            name="relationship"
                            value={formData.relationship}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300'
                            }`}
                          >
                            <option value="">Select Relationship</option>
                            <option value="Spouse">Spouse</option>
                            <option value="Child">Child</option>
                            <option value="Parent">Parent</option>
                            <option value="Sibling">Sibling</option>
                            <option value="Friend">Friend</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={!isLoading ? { scale: 1.02 } : {}}
                        whileTap={!isLoading ? { scale: 0.98 } : {}}
                        className="w-full bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            Adding User...
                          </>
                        ) : (
                          'Add User'
                        )}
                      </motion.button>
                    </form>

                    {/* Info Box */}
                    <div className={`mt-8 p-4 rounded-xl ${
                      darkMode ? 'bg-violet-900/20 border border-violet-700' : 'bg-violet-50'
                    }`}>
                      <h4 className={`font-semibold mb-3 ${
                        darkMode ? 'text-violet-200' : 'text-gray-800'
                      }`}>
                        What you can do:
                      </h4>
                      <ul className={`text-sm space-y-1 ${
                        darkMode ? 'text-violet-300' : 'text-gray-600'
                      }`}>
                        <li>✅ Monitor family members' health data</li>
                        <li>✅ Manage appointments for loved ones</li>
                        <li>✅ Track medical history</li>
                        <li>✅ Receive important health notifications</li>
                      </ul>
                    </div>
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

