// Authentication utilities
export const authUtils = {
  // Get token from localStorage
  getToken(): string | null {
    return localStorage.getItem('token')
  },

  // Set token in localStorage
  setToken(token: string): void {
    localStorage.setItem('token', token)
  },

  // Remove token from localStorage
  removeToken(): void {
    localStorage.removeItem('token')
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken()
  },

  // Login function
  async login(
    email: string,
    password: string,
  ): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { success: false, error: errorData.errors?.[0]?.title || 'Error de autenticación' }
      }

      const result = await response.json()
      const token = result.data?.token

      if (token) {
        this.setToken(token)
        return { success: true, token }
      }

      return { success: false, error: 'No se recibió token de autenticación' }
    } catch (error) {
      return { success: false, error: 'Error de conexión' }
    }
  },

  // Logout function
  async logout(): Promise<void> {
    const token = this.getToken()
    if (token) {
      try {
        await fetch('http://localhost:8000/api/v1/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        })
      } catch (error) {
        console.error('Error during logout:', error)
      }
    }
    this.removeToken()
  },
}

export default authUtils
