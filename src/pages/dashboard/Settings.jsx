import React, { useState } from 'react'
import { Trash2, AlertTriangle, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { clearTokens } from '../../lib/tokenManager'

const SettingsTab = ({ darkMode }) => {
  const navigate = useNavigate()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
  const isAdmin = userData.is_superuser || userData.role === 'ADMIN'

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


