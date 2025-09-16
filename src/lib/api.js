export const API_BASE_URL = 'http://103.118.16.251:8002'

// Adjust this path to match your Django route
export const REGISTER_ENDPOINT = '/auth/register/'

export async function registerUser(payload) {
  const response = await fetch(`${API_BASE_URL}${REGISTER_ENDPOINT}`, {
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