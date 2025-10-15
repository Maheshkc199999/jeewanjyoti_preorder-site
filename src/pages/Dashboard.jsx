import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Home, Calendar, MessageCircle, User, Moon, Sun, Bell, Settings, Menu, X, LogOut, Filter, SlidersHorizontal } from 'lucide-react';
import jjlogo from '../assets/jjlogo.png';
import HomeTab from './dashboard/Home';
import AppointmentsTab from './dashboard/Appointments';
import ErrorBoundary from '../components/ErrorBoundary';
import ChatTab from './dashboard/Chat';
import ProfileTab from './dashboard/Profile';
import SettingsTab from './dashboard/Settings';
import { auth } from '../lib/firebase';
import { isAuthenticated, getUserData, clearTokens } from '../lib/tokenManager';
import { logoutUser } from '../lib/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [darkMode, setDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [isChatRoomOpen, setIsChatRoomOpen] = useState(false);
  const [backendUser, setBackendUser] = useState(null);

  // Check authentication status
  useEffect(() => {
    const checkAuthentication = () => {
      // Check if user has valid tokens
      if (isAuthenticated()) {
        const userData = getUserData();
        setBackendUser(userData);
        setLoading(false);
      } else {
        // Check Firebase auth as fallback
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            setUser(firebaseUser);
            setLoading(false);
          } else {
            setUser(null);
            setLoading(false);
            navigate('/login');
          }
        });
        return unsubscribe;
      }
    };

    const unsubscribe = checkAuthentication();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [navigate]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilterDropdown && !event.target.closest('.filter-dropdown')) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterDropdown]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Show logout confirmation
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  // Handle logout confirmation
  const handleLogoutConfirm = async () => {
    try {
      // Try to logout from backend first
      await logoutUser();
      
      // Also sign out from Firebase if user is signed in
      if (user) {
        await signOut(auth);
      }
      
      // Clear all tokens and redirect
      clearTokens();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if logout fails, clear tokens and redirect
      clearTokens();
      navigate('/login');
    }
  };

  // Handle chat room state change
  const handleChatRoomStateChange = (isOpen) => {
    setIsChatRoomOpen(isOpen);
  };

  // Cancel logout
  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const renderContent = () => {
    console.log('Dashboard renderContent - activeTab:', activeTab, 'user:', !!user, 'backendUser:', !!backendUser);
    
    switch (activeTab) {
      case 'home':
        return <HomeTab darkMode={darkMode} selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} />;
      case 'appointments':
        console.log('Rendering AppointmentsTab with ErrorBoundary...');
        return (
          <ErrorBoundary>
            <AppointmentsTab darkMode={darkMode} />
          </ErrorBoundary>
        );
      case 'chat':
        return <ChatTab darkMode={darkMode} onChatRoomStateChange={handleChatRoomStateChange} />;
      case 'profile':
        return <ProfileTab darkMode={darkMode} />;
      case 'settings':
        return <SettingsTab darkMode={darkMode} />;
      default:
        return <HomeTab darkMode={darkMode} selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} />;
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user && !backendUser) {
    return null;
  }

  return (
    <div className={`${activeTab === 'chat' ? 'h-screen overflow-hidden flex flex-col' : 'min-h-screen pb-20 md:pb-0'} ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Navigation */}
      <nav className={`shadow-lg border-b sticky top-0 z-10 ${
        darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
      } ${isChatRoomOpen ? 'md:block hidden' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4 md:gap-8">
              <button 
                onClick={() => setActiveTab('home')}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200"
              >
                <img src={jjlogo} alt="JJ Logo" className="w-8 h-8" />
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DIGITAL CARE
                </h1>
              </button>
              <div className={`hidden md:flex items-center gap-1 rounded-xl p-1 ${
                darkMode ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                <button
                  onClick={() => setActiveTab('home')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === 'home' 
                      ? darkMode 
                        ? 'bg-gray-700 shadow-md text-blue-400' 
                        : 'bg-white shadow-md text-blue-600' 
                      : darkMode 
                        ? 'text-gray-400 hover:text-gray-200' 
                        : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span className="font-medium">Home</span>
                </button>
                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === 'appointments' 
                      ? darkMode 
                        ? 'bg-gray-700 shadow-md text-blue-400' 
                        : 'bg-white shadow-md text-blue-600' 
                      : darkMode 
                        ? 'text-gray-400 hover:text-gray-200' 
                        : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">Appointments</span>
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === 'chat' 
                      ? darkMode 
                        ? 'bg-gray-700 shadow-md text-blue-400' 
                        : 'bg-white shadow-md text-blue-600' 
                      : darkMode 
                        ? 'text-gray-400 hover:text-gray-200' 
                        : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">Chat</span>
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-1">3</span>
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === 'profile' 
                      ? darkMode 
                        ? 'bg-gray-700 shadow-md text-blue-400' 
                        : 'bg-white shadow-md text-blue-600' 
                      : darkMode 
                        ? 'text-gray-400 hover:text-gray-200' 
                        : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Profile</span>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg ${
                darkMode 
                  ? 'bg-gray-800 text-gray-300' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium truncate max-w-32">
                  {backendUser?.first_name || user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}
                </span>
              </div>
              
              {/* Date Display */}
              <div className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-lg ${
                darkMode 
                  ? 'bg-gray-800 text-gray-300' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>

              {/* Period Filter - Hidden by default, show as popup button */}
              {activeTab === 'home' && (
                <div className="hidden lg:block relative filter-dropdown">
                  <button
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      showFilterDropdown
                        ? darkMode 
                          ? 'bg-purple-600 hover:bg-purple-700' 
                          : 'bg-purple-500 hover:bg-purple-600'
                        : darkMode 
                          ? 'bg-gray-800 hover:bg-purple-600/20 border border-purple-500/30' 
                          : 'bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border border-purple-200'
                    }`}
                    title={`Filter: ${selectedPeriod === 'today' ? 'Today' : selectedPeriod === 'week' ? 'This Week' : 'This Month'}`}
                  >
                    <SlidersHorizontal className={`w-5 h-5 transition-colors ${
                      showFilterDropdown
                        ? 'text-white'
                        : 'text-purple-600'
                    }`} />
                  </button>
                  
                  {/* Filter Dropdown */}
                  {showFilterDropdown && (
                    <div className={`absolute top-full right-0 mt-2 w-40 rounded-lg shadow-xl border z-10 ${
                      darkMode 
                        ? 'bg-gray-800 border-purple-500/30 shadow-purple-500/20' 
                        : 'bg-white border-purple-200 shadow-purple-100'
                    }`}>
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setSelectedPeriod('today');
                            setShowFilterDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                            selectedPeriod === 'today'
                              ? darkMode 
                                ? 'bg-purple-600/20 text-purple-400' 
                                : 'bg-purple-50 text-purple-600'
                              : darkMode 
                                ? 'text-gray-300 hover:bg-purple-600/10' 
                                : 'text-gray-700 hover:bg-purple-50'
                          }`}
                        >
                          Today
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPeriod('week');
                            setShowFilterDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                            selectedPeriod === 'week'
                              ? darkMode 
                                ? 'bg-purple-600/20 text-purple-400' 
                                : 'bg-purple-50 text-purple-600'
                              : darkMode 
                                ? 'text-gray-300 hover:bg-purple-600/10' 
                                : 'text-gray-700 hover:bg-purple-50'
                          }`}
                        >
                          This Week
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPeriod('month');
                            setShowFilterDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                            selectedPeriod === 'month'
                              ? darkMode 
                                ? 'bg-purple-600/20 text-purple-400' 
                                : 'bg-purple-50 text-purple-600'
                              : darkMode 
                                ? 'text-gray-300 hover:bg-purple-600/10' 
                                : 'text-gray-700 hover:bg-purple-50'
                          }`}
                        >
                          This Month
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <button 
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode 
                      ? 'text-yellow-400 hover:bg-gray-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
                <div className="hidden md:flex items-center gap-1">
                  <button className={`p-2 rounded-lg transition-colors ${
                    darkMode 
                      ? 'hover:bg-gray-700' 
                      : 'hover:bg-gray-100'
                  }`}>
                    <Bell className="w-5 h-5 text-gray-500" />
                  </button>
                  <button 
                    onClick={() => setActiveTab('settings')}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode 
                        ? 'hover:bg-gray-700' 
                        : 'hover:bg-gray-100'
                    }`}>
                    <Settings className="w-5 h-5 text-gray-500" />
                  </button>
                  <button 
                    onClick={handleLogoutClick}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode 
                        ? 'hover:bg-red-700' 
                        : 'hover:bg-red-50'
                    }`}
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5 text-red-500" />
                  </button>
                </div>
                <button 
                  className={`md:hidden p-2 rounded-lg transition-colors ${
                    darkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={`md:hidden fixed inset-0 z-20 ${darkMode ? 'bg-gray-900' : 'bg-white'} pt-16`}>
          <div className="p-4 space-y-4">
            <button
              onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 w-full p-4 rounded-xl text-left ${
                activeTab === 'home' 
                  ? darkMode 
                    ? 'bg-gray-800 text-blue-400' 
                    : 'bg-blue-50 text-blue-600' 
                  : darkMode 
                    ? 'text-gray-300' 
                    : 'text-gray-700'
              }`}
            >
              <Home className="w-6 h-6" />
              <span className="font-medium">Home</span>
            </button>
            <button
              onClick={() => { setActiveTab('appointments'); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 w-full p-4 rounded-xl text-left ${
                activeTab === 'appointments' 
                  ? darkMode 
                    ? 'bg-gray-800 text-blue-400' 
                    : 'bg-blue-50 text-blue-600' 
                  : darkMode 
                    ? 'text-gray-300' 
                    : 'text-gray-700'
              }`}
            >
              <Calendar className="w-6 h-6" />
              <span className="font-medium">Appointments</span>
            </button>
            <button
              onClick={() => { setActiveTab('chat'); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 w-full p-4 rounded-xl text-left ${
                activeTab === 'chat' 
                  ? darkMode 
                    ? 'bg-gray-800 text-blue-400' 
                    : 'bg-blue-50 text-blue-600' 
                  : darkMode 
                    ? 'text-gray-300' 
                    : 'text-gray-700'
              }`}
            >
              <MessageCircle className="w-6 h-6" />
              <span className="font-medium">Chat</span>
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-auto">3</span>
            </button>
            <button
              onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 w-full p-4 rounded-xl text-left ${
                activeTab === 'profile' 
                  ? darkMode 
                    ? 'bg-gray-800 text-blue-400' 
                    : 'bg-blue-50 text-blue-600' 
                  : darkMode 
                    ? 'text-gray-300' 
                    : 'text-gray-700'
              }`}
            >
              <User className="w-6 h-6" />
              <span className="font-medium">Profile</span>
            </button>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
              <button
                onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3 w-full p-4 rounded-xl text-left ${
                  darkMode 
                    ? 'text-gray-300 hover:bg-gray-800' 
                    : 'text-gray-700 hover:bg-gray-100'
                } transition-colors`}
              >
                <Settings className="w-6 h-6" />
                <span className="font-medium">Settings</span>
              </button>
              <button
                onClick={() => { handleLogoutClick(); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-3 w-full p-4 rounded-xl text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-6 h-6" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20">
                <LogOut className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Logout
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Are you sure you want to logout?
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleLogoutCancel}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`${activeTab === 'chat' ? `flex-1 min-h-0 h-full ${isChatRoomOpen ? 'pb-0' : 'pb-16'} md:pb-0` : 'max-w-7xl mx-auto p-4 md:p-6'}`}>
        {renderContent()}
      </main>

      {/* Bottom Navigation for Mobile */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-10 border-t bg-white dark:bg-gray-900 dark:border-gray-800 ${isChatRoomOpen ? 'hidden' : ''}`}>
          <div className="grid grid-cols-4 h-16">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center justify-center p-2 transition-colors ${
                activeTab === 'home' 
                  ? darkMode 
                    ? 'text-blue-400' 
                    : 'text-blue-600' 
                  : darkMode 
                    ? 'text-gray-400' 
                    : 'text-gray-500'
              }`}
            >
              <Home className="w-6 h-6" />
              <span className="text-xs mt-1">Home</span>
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex flex-col items-center justify-center p-2 transition-colors ${
                activeTab === 'appointments' 
                  ? darkMode 
                    ? 'text-blue-400' 
                    : 'text-blue-600' 
                  : darkMode 
                    ? 'text-gray-400' 
                    : 'text-gray-500'
              }`}
            >
              <Calendar className="w-6 h-6" />
              <span className="text-xs mt-1">Appointments</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex flex-col items-center justify-center p-2 transition-colors relative ${
                activeTab === 'chat' 
                  ? darkMode 
                    ? 'text-blue-400' 
                    : 'text-blue-600' 
                  : darkMode 
                    ? 'text-gray-400' 
                    : 'text-gray-500'
              }`}
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs mt-1">Chat</span>
              <span className="absolute top-1 right-4 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center justify-center p-2 transition-colors ${
                activeTab === 'profile' 
                  ? darkMode 
                    ? 'text-blue-400' 
                    : 'text-blue-600' 
                  : darkMode 
                    ? 'text-gray-400' 
                    : 'text-gray-500'
              }`}
            >
              <User className="w-6 h-6" />
              <span className="text-xs mt-1">Profile</span>
            </button>
          </div>
        </div>
    </div>
  );
};

export default Dashboard;