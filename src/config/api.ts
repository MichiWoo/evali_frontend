// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    settings: `${API_BASE_URL}/api/v1/admin/settings`,
    settingsStatus: `${API_BASE_URL}/api/v1/admin/settings/status`,
    auth: {
      login: `${API_BASE_URL}/api/v1/auth/login`,
      logout: `${API_BASE_URL}/api/v1/auth/logout`,
      me: `${API_BASE_URL}/api/v1/auth/me`,
    },
  },
}

// Development configuration override
if (import.meta.env.DEV) {
  import('./development').then(({ devConfig }) => {
    Object.assign(apiConfig, devConfig)
  })
}

export default apiConfig
