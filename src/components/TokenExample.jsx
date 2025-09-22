import React, { useState, useEffect } from 'react';
import { getUserData, getAccessToken, isAuthenticated, clearTokens } from '../lib/tokenManager';
import { apiRequest } from '../lib/api';

const TokenExample = () => {
  const [userData, setUserData] = useState(null);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load user data and token info on component mount
    const loadData = () => {
      const user = getUserData();
      const token = getAccessToken();
      const isAuth = isAuthenticated();
      
      setUserData(user);
      setTokenInfo({
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        isAuthenticated: isAuth
      });
    };

    loadData();
  }, []);

  const handleApiCall = async () => {
    setLoading(true);
    try {
      // Example API call using the authenticated fetch
      const response = await apiRequest('/api/profile/');
      const data = await response.json();
      setApiResponse(data);
    } catch (error) {
      console.error('API call failed:', error);
      setApiResponse({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearTokens();
    setUserData(null);
    setTokenInfo(null);
    setApiResponse(null);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Token Management Example</h2>
      
      {/* User Data Display */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">User Data:</h3>
        {userData ? (
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="text-sm text-gray-600 overflow-auto">
              {JSON.stringify(userData, null, 2)}
            </pre>
          </div>
        ) : (
          <p className="text-gray-500">No user data found</p>
        )}
      </div>

      {/* Token Information */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Token Status:</h3>
        {tokenInfo ? (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <p><span className="font-medium">Authenticated:</span> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  tokenInfo.isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {tokenInfo.isAuthenticated ? 'Yes' : 'No'}
                </span>
              </p>
              <p><span className="font-medium">Has Token:</span> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  tokenInfo.hasToken ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {tokenInfo.hasToken ? 'Yes' : 'No'}
                </span>
              </p>
              <p><span className="font-medium">Token Length:</span> {tokenInfo.tokenLength} characters</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No token information available</p>
        )}
      </div>

      {/* API Test */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">API Test:</h3>
        <button
          onClick={handleApiCall}
          disabled={loading || !isAuthenticated()}
          className={`px-4 py-2 rounded-lg font-medium ${
            loading || !isAuthenticated()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? 'Loading...' : 'Test API Call'}
        </button>
        
        {apiResponse && (
          <div className="mt-4 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">API Response:</h4>
            <pre className="text-sm text-gray-600 overflow-auto">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Logout Button */}
      <div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
        >
          Clear Tokens (Logout)
        </button>
      </div>
    </div>
  );
};

export default TokenExample;
