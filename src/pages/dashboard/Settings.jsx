import React, { useState } from 'react'
import { Trash2, AlertTriangle, X, Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { clearTokens } from '../../lib/tokenManager'
import { getFcmToken } from '../../lib/firebase'

const SettingsTab = ({ darkMode }) => {
  const navigate = useNavigate()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [isTestingFCM, setIsTestingFCM] = useState(false)

  const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
  const isAdmin = userData.is_superuser || userData.role === 'ADMIN'

  const handleTestFCMToken = async () => {
    setIsTestingFCM(true)
    try {
      // Check browser support
      if (typeof window === 'undefined') {
        alert('❌ ERROR: Window object is undefined. This code must run in a browser environment.')
        return
      }

      if (!('Notification' in window)) {
        alert('❌ ERROR: Notifications are not supported in this browser.\n\nReason: The Notification API is not available.')
        return
      }

      if (!('serviceWorker' in navigator)) {
        alert('❌ ERROR: Service Workers are not supported in this browser.\n\nReason: Service Workers API is required for FCM but is not available.')
        return
      }

      // Check notification permission
      const permission = Notification.permission
      let permissionStatus = `Current permission: ${permission}`
      
      if (permission === 'denied') {
        alert(`❌ ERROR: Notification permission is denied.\n\nReason: User has previously denied notification permissions.\n\nSolution: Please enable notifications in your browser settings.\n\n${permissionStatus}`)
        return
      }

      if (permission !== 'granted') {
        const newPermission = await Notification.requestPermission()
        if (newPermission !== 'granted') {
          alert(`❌ ERROR: Notification permission was not granted.\n\nReason: User denied permission when prompted.\n\nPermission status: ${newPermission}\n\nSolution: Please allow notifications when prompted.`)
          return
        }
      }

      // Check service worker registration
      let serviceWorkerRegistered = false
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (!registration) {
          // Try to register
          try {
            await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' })
            serviceWorkerRegistered = true
          } catch (swError) {
            alert(`❌ ERROR: Service Worker registration failed.\n\nReason: ${swError.message}\n\nDetails: ${swError.stack || 'No stack trace available'}\n\nSolution: Check if the service worker file exists at /firebase-messaging-sw.js`)
            return
          }
        } else {
          serviceWorkerRegistered = true
        }
      } catch (swError) {
        alert(`❌ ERROR: Could not check Service Worker.\n\nReason: ${swError.message}\n\nDetails: ${swError.stack || 'No stack trace available'}`)
        return
      }

      // Get VAPID key
      const vapidKey = import.meta.env?.VITE_FIREBASE_VAPID_KEY || 'BHTwQ-UBls33YCkR3lVR6GsK68zccOJ8p93yVEPcJbMsDh71eW66o_-An1y9so19KWeROurFR-kZbEIRtRhWv-g'
      if (!vapidKey) {
        alert('❌ ERROR: VAPID key is missing.\n\nReason: VAPID key is required for FCM token generation.\n\nSolution: Set VITE_FIREBASE_VAPID_KEY in your .env file or configure it in firebase.js')
        return
      }

      // Attempt to get FCM token
      try {
        console.log('🔍 Attempting to get FCM token...')
        const token = await getFcmToken(vapidKey)
        
        if (token) {
          // Store token
          localStorage.setItem('fcm_token', token)
          
          // Show success alert with token
          alert(`✅ SUCCESS: FCM Token Retrieved!\n\nToken: ${token}\n\nToken Length: ${token.length} characters\n\nThis token has been stored in localStorage.\n\nCheck console for more details.`)
        } else {
          alert('❌ ERROR: FCM token is null or undefined.\n\nReason: getFcmToken() returned null.\n\nPossible causes:\n1. Messaging service not initialized\n2. Service worker not active\n3. Browser not supported\n4. Firebase configuration issue\n\nCheck console for detailed error logs.')
        }
      } catch (fcmError) {
        let errorMessage = `❌ ERROR: Failed to get FCM token.\n\nError: ${fcmError.message || 'Unknown error'}\n\n`
        
        // Add specific error details
        if (fcmError.code) {
          errorMessage += `Error Code: ${fcmError.code}\n\n`
        }
        
        if (fcmError.message) {
          errorMessage += `Error Message: ${fcmError.message}\n\n`
        }

        // Check for common error patterns
        if (fcmError.message?.includes('messaging/invalid-vapid-key')) {
          errorMessage += 'Possible Cause: Invalid VAPID key.\n\nSolution: Verify your VAPID key in Firebase Console.'
        } else if (fcmError.message?.includes('messaging/unsupported-browser')) {
          errorMessage += 'Possible Cause: Browser not supported for FCM.\n\nSolution: Use a modern browser (Chrome, Firefox, Edge).'
        } else if (fcmError.message?.includes('messaging/registration-token-not-registered')) {
          errorMessage += 'Possible Cause: Token registration failed.\n\nSolution: Check Firebase configuration and service worker.'
        } else if (fcmError.message?.includes('messaging/permission-blocked')) {
          errorMessage += 'Possible Cause: Notification permission blocked.\n\nSolution: Enable notifications in browser settings.'
        } else {
          errorMessage += 'Possible Causes:\n1. Service worker not registered\n2. Firebase messaging not initialized\n3. Network connectivity issues\n4. Firebase configuration error'
        }

        errorMessage += `\n\nStack Trace: ${fcmError.stack || 'Not available'}`
        
        alert(errorMessage)
      }
    } catch (error) {
      alert(`❌ CRITICAL ERROR: Unexpected error during FCM token extraction.\n\nError: ${error.message}\n\nStack: ${error.stack || 'Not available'}\n\nCheck console for more details.`)
    } finally {
      setIsTestingFCM(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    setDeleteError(null)
    try {
      const token = localStorage.getItem('access_token')
      let requestBody = {}
      if (isAdmin) {
        requestBody = { id: userData.id }
      }

      const response = await fetch('https://jeewanjyoti-backend.smart.org.np/api/delete-account/', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: Object.keys(requestBody).length > 0 ? JSON.stringify(requestBody) : undefined
      })

      if (response.ok) {
        clearTokens()
        navigate('/login')
        alert('Your account has been deleted successfully.')
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Failed to delete account')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      setDeleteError(error.message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
    }`}>
      <h3 className={`text-base md:text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>Account Settings</h3>
      
      {/* FCM Token Test Section */}
      <div className={`p-4 rounded-xl border mb-4 ${
        darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${darkMode ? 'bg-blue-800' : 'bg-blue-100'} p-2 rounded-lg`}>
              <Bell className={`${darkMode ? 'text-blue-300' : 'text-blue-600'} w-5 h-5`} />
            </div>
            <div>
              <h4 className={`${darkMode ? 'text-blue-200' : 'text-blue-800'} font-semibold text-sm md:text-base`}>Test FCM Token</h4>
              <p className={`${darkMode ? 'text-blue-300' : 'text-blue-600'} text-xs md:text-sm`}>
                Check if FCM token extraction is working and view the token or error details
              </p>
            </div>
          </div>
          <button
            onClick={handleTestFCMToken}
            disabled={isTestingFCM}
            className={`${darkMode ? 'bg-blue-800 text-blue-200 hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'} px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isTestingFCM ? 'Testing...' : 'Test FCM Token'}
          </button>
        </div>
      </div>

      <div className={`p-4 rounded-xl border ${
        darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${darkMode ? 'bg-red-800' : 'bg-red-100'} p-2 rounded-lg`}>
              <Trash2 className={`${darkMode ? 'text-red-300' : 'text-red-600'} w-5 h-5`} />
            </div>
            <div>
              <h4 className={`${darkMode ? 'text-red-200' : 'text-red-800'} font-semibold text-sm md:text-base`}>Delete Account</h4>
              <p className={`${darkMode ? 'text-red-300' : 'text-red-600'} text-xs md:text-sm`}>
                {isAdmin ? 'Permanently delete your account and all associated data' : 'Permanently delete your own account and all associated data'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className={`${darkMode ? 'bg-red-800 text-red-200 hover:bg-red-700' : 'bg-red-600 text-white hover:bg-red-700'} px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
          >
            Delete Account
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Delete Account</h3>
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteError(null) }}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`flex items-center gap-3 p-4 rounded-xl mb-4 ${darkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
              <AlertTriangle className={`${darkMode ? 'text-red-400' : 'text-red-600'} w-6 h-6`} />
              <div>
                <h4 className={`${darkMode ? 'text-red-200' : 'text-red-800'} font-semibold`}>Warning: This action cannot be undone</h4>
                <p className={`${darkMode ? 'text-red-300' : 'text-red-600'} text-sm`}>All your data, appointments, and account information will be permanently deleted.</p>
              </div>
            </div>

            {deleteError && (
              <div className={`${darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'} p-3 rounded-lg mb-4`}>
                {deleteError}
              </div>
            )}

            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm mb-6`}>
              Are you sure you want to delete your account? This action is irreversible and will remove all your data from our system.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteError(null) }}
                className={`${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} flex-1 px-4 py-2 rounded-lg`}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className={`flex-1 px-4 py-2 rounded-lg text-white font-medium ${isDeleting ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SettingsTab


