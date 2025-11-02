import { authenticatedFetch, getAuthHeaders, refreshAccessToken, clearTokens } from './tokenManager'

export const API_BASE_URL = 'https://jeewanjyoti-backend.smart.org.np'

// Adjust this path to match your Django route
export const REGISTER_ENDPOINT = '/api/register/'

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  return await authenticatedFetch(url, options)
}

/**
 * Register a new user
 * @param {object} payload - Registration data
 * @returns {Promise<object>} Registration response
 */
export async function registerUser(payload) {
  const response = await apiRequest(REGISTER_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error('Registration failed')
    error.details = data
    throw error
  }
  return data
}

/**
 * Login user
 * @param {object} credentials - Login credentials
 * @param {string} userType - 'individual' or 'institutional'
 * @returns {Promise<object>} Login response
 */
export async function loginUser(credentials, userType = 'individual') {
  const endpoint = userType === 'individual' ? '/api/login/' : '/api/ins/login/'
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })
  
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error('Login failed')
    error.details = data
    throw error
  }
  return data
}

/**
 * Get user profile
 * @returns {Promise<object>} User profile data
 */
export async function getUserProfile() {
  const response = await apiRequest('/api/profile/')
  
  if (!response.ok) {
    throw new Error('Failed to fetch user profile')
  }
  
  return await response.json()
}

/**
 * Update user profile
 * @param {object} profileData - Profile data to update
 * @returns {Promise<object>} Updated profile data
 */
export async function updateUserProfile(profileData) {
  const response = await apiRequest('/api/profile/', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  })
  
  if (!response.ok) {
    throw new Error('Failed to update user profile')
  }
  
  return await response.json()
}

/**
 * Update user profile using profile-update endpoint
 * @param {object} profileData - Profile data to update (first_name, last_name, birthdate, gender, height, weight, blood_group)
 * @returns {Promise<object>} Updated profile data
 */
export async function updateProfile(profileData) {
  const response = await apiRequest('/api/profile-update/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const error = new Error(errorData.detail || 'Failed to update profile')
    error.details = errorData
    throw error
  }
  
  return await response.json()
}

/**
 * Get appointments
 * @returns {Promise<Array>} List of appointments
 */
export async function getAppointments() {
  const response = await apiRequest('/api/appointments/')
  
  if (!response.ok) {
    throw new Error('Failed to fetch appointments')
  }
  
  return await response.json()
}

/**
 * Create a new appointment
 * @param {object} appointmentData - Appointment data
 * @returns {Promise<object>} Created appointment
 */
export async function createAppointment(appointmentData) {
  const response = await apiRequest('/api/appointments/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(appointmentData),
  })
  
  if (!response.ok) {
    throw new Error('Failed to create appointment')
  }
  
  return await response.json()
}

/**
 * Get doctor list
 * @returns {Promise<Array>} List of doctors
 */
export async function getDoctorList() {
  const response = await apiRequest('/api/doctorlist/')
  
  if (!response.ok) {
    throw new Error('Failed to fetch doctor list')
  }
  
  return await response.json()
}

/**
 * Get sleep data
 * @returns {Promise<Array>} List of sleep data records
 */
export async function getSleepData() {
  const response = await apiRequest('/api/sleep-data/')
  
  if (!response.ok) {
    throw new Error('Failed to fetch sleep data')
  }
  
  return await response.json()
}

/**
 * Get SpO2/Blood Oxygen data
 * @returns {Promise<Array>} List of SpO2 data records
 */
export async function getSpO2Data() {
  const response = await apiRequest('/api/Spo2-data/')
  
  if (!response.ok) {
    throw new Error('Failed to fetch SpO2 data')
  }
  
  return await response.json()
}

/**
 * Get Heart Rate data
 * @returns {Promise<Array>} List of Heart Rate data records
 */
export async function getHeartRateData() {
  const response = await apiRequest('/api/HeartRate_Data/')
  
  if (!response.ok) {
    throw new Error('Failed to fetch Heart Rate data')
  }
  
  return await response.json()
}

/**
 * Get Blood Pressure data
 * @returns {Promise<Array>} List of Blood Pressure data records
 */
export async function getBloodPressureData() {
  const response = await apiRequest('/api/BloodPressure_Data/')
  
  if (!response.ok) {
    throw new Error('Failed to fetch Blood Pressure data')
  }
  
  return await response.json()
}

/**
 * Get Stress data
 * @returns {Promise<Array>} List of Stress data records
 */
export async function getStressData() {
  const response = await apiRequest('/api/Stress_Data/')
  
  if (!response.ok) {
    throw new Error('Failed to fetch Stress data')
  }
  
  return await response.json()
}

/**
 * Get HRV (Heart Rate Variability) data
 * @returns {Promise<Array>} List of HRV data records
 */
export async function getHRVData() {
  const response = await apiRequest('/api/HRV_Iso_Data/')
  
  if (!response.ok) {
    throw new Error('Failed to fetch HRV data')
  }
  
  return await response.json()
}

/**
 * Get user profile data
 * @returns {Promise<object>} User profile data
 */
export async function getUserEmailProfile() {
  const response = await apiRequest('/api/useremailprofile/')
  
  if (!response.ok) {
    throw new Error('Failed to fetch user profile')
  }
  
  return await response.json()
}

/**
 * Logout user
 * @returns {Promise<void>}
 */
export async function logoutUser() {
  try {
    // Call logout endpoint if available
    await apiRequest('/api/logout/', {
      method: 'POST',
    })
  } catch (error) {
    console.warn('Logout endpoint failed:', error)
  } finally {
    // Always clear local tokens
    clearTokens()
  }
} 

export const initializePayment = async (token, invoiceNo, amount) => {
  return await apiRequest('/initialize_payment/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ invoice_no: invoiceNo, amount })
  });
}; 