// Development Configuration
export const devConfig = {
  apiBaseUrl: 'http://localhost:8000',
  endpoints: {
    settings: 'http://localhost:8000/api/v1/admin/settings',
    settingsStatus: 'http://localhost:8000/api/v1/admin/settings/status',
    auth: {
      login: 'http://localhost:8000/api/v1/auth/login',
      logout: 'http://localhost:8000/api/v1/auth/logout',
      me: 'http://localhost:8000/api/v1/auth/me',
    },
  },
}

export default devConfig
