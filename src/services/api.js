export const API_BASE_URL = import.meta.env.DEV
  ? import.meta.env.VITE_API_URL || 'http://localhost:3000'
  : import.meta.env.VITE_API_URL || ''

export function apiUrl(path) {
  return `${API_BASE_URL}${path}`
}

export function clearAuthSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('name')
}

export async function authFetch(path, options = {}) {
  const headers = new Headers(options.headers || {})
  const token = localStorage.getItem('token')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(apiUrl(path), { ...options, headers })

  // Only clear the session for authentication failures. A normal user receiving
  // an admin-only 403 should see the API error rather than being logged out.
  let shouldExpireSession = response.status === 401
  if (response.status === 403) {
    try {
      const data = await response.clone().json()
      const message = String(data.message || '').toLowerCase()
      shouldExpireSession = message.includes('token') || message.includes('session expired')
    } catch {
      shouldExpireSession = false
    }
  }

  if (shouldExpireSession) {
    clearAuthSession()
    const returnTo = encodeURIComponent(window.location.pathname + window.location.search)
    window.location.assign(`/login?reason=session-expired&redirect=${returnTo}`)
  }
  return response
}
