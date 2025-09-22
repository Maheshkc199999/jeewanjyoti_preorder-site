// Token management utilities for handling JWT tokens
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data'
};

/**
 * Store tokens and user data in localStorage
 * @param {string} accessToken - JWT access token
 * @param {string} refreshToken - JWT refresh token
 * @param {object} userData - User information from login/register response
 */
export const storeTokens = (accessToken, refreshToken, userData = null) => {
  try {
    if (accessToken) {
      localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
    }
    if (refreshToken) {
      localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
    }
    if (userData) {
      localStorage.setItem(TOKEN_KEYS.USER_DATA, JSON.stringify(userData));
    }
    console.log('Tokens stored successfully');
  } catch (error) {
    console.error('Error storing tokens:', error);
  }
};

/**
 * Get access token from localStorage
 * @returns {string|null} Access token or null if not found
 */
export const getAccessToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

/**
 * Get refresh token from localStorage
 * @returns {string|null} Refresh token or null if not found
 */
export const getRefreshToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

/**
 * Get user data from localStorage
 * @returns {object|null} User data or null if not found
 */
export const getUserData = () => {
  try {
    const userData = localStorage.getItem(TOKEN_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Check if user is authenticated (has valid tokens)
 * @returns {boolean} True if user has both access and refresh tokens
 */
export const isAuthenticated = () => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  return !!(accessToken && refreshToken);
};

/**
 * Clear all tokens and user data from localStorage
 */
export const clearTokens = () => {
  try {
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.USER_DATA);
    console.log('Tokens cleared successfully');
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

/**
 * Check if access token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} True if token is expired
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Refresh access token using refresh token
 * @returns {Promise<boolean>} True if token refresh was successful
 */
export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    console.error('No refresh token available');
    return false;
  }

  try {
    const response = await fetch('https://jeewanjyoti-backend.smart.org.np/api/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: refreshToken
      })
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.access) {
      // Store the new access token
      localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, data.access);
      console.log('Access token refreshed successfully');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error refreshing token:', error);
    // If refresh fails, clear all tokens
    clearTokens();
    return false;
  }
};

/**
 * Get authorization header for API requests
 * @returns {object} Headers object with Authorization header
 */
export const getAuthHeaders = () => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return {};
  }
  
  return {
    'Authorization': `Bearer ${accessToken}`
  };
};

/**
 * Make authenticated API request with automatic token refresh
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
export const authenticatedFetch = async (url, options = {}) => {
  const accessToken = getAccessToken();
  
  // Add authorization header if token exists
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers
  };

  let response = await fetch(url, {
    ...options,
    headers
  });

  // If request fails with 401, try to refresh token
  if (response.status === 401 && accessToken) {
    console.log('Access token expired, attempting refresh...');
    const refreshSuccess = await refreshAccessToken();
    
    if (refreshSuccess) {
      // Retry the request with new token
      const newHeaders = {
        ...headers,
        ...getAuthHeaders()
      };
      
      response = await fetch(url, {
        ...options,
        headers: newHeaders
      });
    } else {
      // Refresh failed, redirect to login
      clearTokens();
      window.location.href = '/login';
      throw new Error('Authentication failed');
    }
  }

  return response;
};
