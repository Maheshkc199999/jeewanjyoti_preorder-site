import React, { createContext, useContext, useState, useEffect } from 'react';
import { isAuthenticated, getUserData, clearTokens, getAccessToken, getRefreshToken } from '../lib/tokenManager';
import { logoutUser } from '../lib/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const hasValidTokens = isAuthenticated();
        setIsAuthenticatedState(hasValidTokens);
        
        if (hasValidTokens) {
          const userData = getUserData();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setUser(null);
        setIsAuthenticatedState(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (accessToken, refreshToken, userData) => {
    try {
      // Store tokens and user data
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      if (userData) {
        localStorage.setItem('user_data', JSON.stringify(userData));
      }
      
      setUser(userData);
      setIsAuthenticatedState(true);
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const logout = async () => {
    try {
      // Call backend logout
      await logoutUser();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear local state and tokens
      clearTokens();
      setUser(null);
      setIsAuthenticatedState(false);
    }
  };

  const getAuthHeaders = () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      return {};
    }
    
    return {
      'Authorization': `Bearer ${accessToken}`
    };
  };

  const value = {
    user,
    loading,
    isAuthenticated: isAuthenticatedState,
    login,
    logout,
    getAuthHeaders,
    getAccessToken,
    getRefreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
