import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // Estado
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => {
    const role = user.value?.roles?.[0]?.name || null
    console.log('userRole computed - user:', user.value)
    console.log('userRole computed - roles:', user.value?.roles)
    console.log('userRole computed - role name:', role)
    return role
  })
  const isAdmin = computed(() => userRole.value === 'admin')
  const isTeacher = computed(() => userRole.value === 'teacher')
  const isStudent = computed(() => userRole.value === 'student')
  const userName = computed(() => user.value?.name || 'Usuario')
  const userEmail = computed(() => user.value?.email || '')

  // Acciones
  const setUser = (userData: User | null) => {
    user.value = userData
    // Actualizar también en localStorage si hay token
    if (token.value && userData) {
      localStorage.setItem('user', JSON.stringify(userData))
      console.log('setUser - user updated in store and localStorage')
      console.log('setUser - user roles:', userData?.roles)
    }
  }

  const setToken = (tokenValue: string | null) => {
    token.value = tokenValue
    if (tokenValue) {
      localStorage.setItem('auth_token', tokenValue)
    } else {
      localStorage.removeItem('auth_token')
    }
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = null
  }

  const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      console.log('Auth store login called with:', credentials)
      isLoading.value = true
      clearError()

      const response = await api.login(credentials)
      console.log('API login response:', response)

      user.value = response.data.user
      token.value = response.data.token

      console.log('User set to:', user.value)
      console.log('Token set to:', token.value)

      // Store in localStorage
      localStorage.setItem('auth_token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))

      console.log('Data stored in localStorage')
      return response
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const register = async (
    userData: RegisterRequest,
  ): Promise<{ success: boolean; data?: { user: User; message: string }; error?: string }> => {
    try {
      isLoading.value = true
      clearError()

      const response = await api.register(userData)

      // El backend devuelve: { data: { user, message } } (sin token hasta verificar email)
      if (response && response.data) {
        // NO guardar token ni usuario después del registro
        // El usuario debe verificar su email primero antes de poder iniciar sesión
        // El token se generará y guardará solo después de hacer login (que verifica el email)

        return {
          success: true,
          data: {
            user: response.data.user,
            message: response.data.message,
          },
        }
      } else {
        setError('Error al registrarse')
        return { success: false, error: 'Error al registrarse' }
      }
    } catch (err: any) {
      console.error('Register error:', err)

      let errorMessage = 'Error de conexión'

      if (err.response?.data) {
        // Formato: { errors: [{ title: '...' }] }
        if (
          err.response.data.errors &&
          Array.isArray(err.response.data.errors) &&
          err.response.data.errors.length > 0
        ) {
          errorMessage =
            err.response.data.errors[0].title ||
            err.response.data.errors[0].message ||
            'Error al registrarse'
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message
        }
      }

      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      if (token.value) {
        await api.logout()
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear state and localStorage
      user.value = null
      token.value = null
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }
  }

  const refreshToken = async (): Promise<boolean> => {
    try {
      if (!token.value) return false

      const response = await api.refreshToken()

      if (response.success) {
        setToken(response.data.token)
        return true
      } else {
        logout()
        return false
      }
    } catch {
      logout()
      return false
    }
  }

  const getProfile = async (): Promise<{ success: boolean; data?: User; error?: string }> => {
    try {
      if (!token.value) return { success: false, error: 'No token' }

      isLoading.value = true
      const response = await api.getProfile()

      if (response.success) {
        setUser(response.data)
        return { success: true, data: response.data }
      } else {
        setError(response.message || 'Error al obtener perfil')
        return { success: false, error: response.message }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error de conexión'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const updateProfile = async (
    userData: Partial<User>,
  ): Promise<{ success: boolean; data?: User; error?: string }> => {
    try {
      isLoading.value = true
      clearError()

      const response = await api.updateProfile(userData)

      if (response.success) {
        setUser(response.data)
        return { success: true, data: response.data }
      } else {
        setError(response.message || 'Error al actualizar perfil')
        return { success: false, error: response.message }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error de conexión'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const changePassword = async (passwordData: {
    current_password: string
    new_password: string
    new_password_confirmation: string
  }): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      isLoading.value = true
      clearError()

      const response = await api.changePassword(passwordData)

      if (response.success) {
        return { success: true, data: response.data }
      } else {
        setError(response.message || 'Error al cambiar contraseña')
        return { success: false, error: response.message }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error de conexión'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const forgotPassword = async (
    email: string,
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      isLoading.value = true
      clearError()

      const response = await api.forgotPassword(email)

      // La API devuelve { data: { message: string } }
      if (response && response.data) {
        return { success: true, data: response.data }
      } else {
        setError('Error al enviar email')
        return { success: false, error: 'Error al enviar email' }
      }
    } catch (err: any) {
      // Manejar errores de la API
      let errorMessage = 'Error de conexión'

      if (err.response?.data) {
        // Formato: { errors: [{ title: '...' }] }
        if (
          err.response.data.errors &&
          Array.isArray(err.response.data.errors) &&
          err.response.data.errors.length > 0
        ) {
          errorMessage =
            err.response.data.errors[0].title ||
            err.response.data.errors[0].message ||
            'Error al enviar email'
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message
        }
      }

      setError(errorMessage)
      throw err // Re-lanzar para que la vista pueda manejarlo
    } finally {
      isLoading.value = false
    }
  }

  const resetPassword = async (resetData: {
    token: string
    email: string
    password: string
    password_confirmation: string
  }): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      isLoading.value = true
      clearError()

      // La API espera parámetros individuales
      const response = await api.resetPassword(
        resetData.token,
        resetData.email,
        resetData.password,
        resetData.password_confirmation,
      )

      // La API devuelve { data: { message: string } }
      if (response && response.data) {
        return { success: true, data: response.data }
      } else {
        setError('Error al restablecer contraseña')
        return { success: false, error: 'Error al restablecer contraseña' }
      }
    } catch (err: any) {
      // Manejar errores de la API
      let errorMessage = 'Error de conexión'

      if (err.response?.data) {
        // Formato: { errors: [{ title: '...' }] }
        if (
          err.response.data.errors &&
          Array.isArray(err.response.data.errors) &&
          err.response.data.errors.length > 0
        ) {
          errorMessage =
            err.response.data.errors[0].title ||
            err.response.data.errors[0].message ||
            'Error al restablecer contraseña'
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message
        }
      }

      setError(errorMessage)
      throw err // Re-lanzar para que la vista pueda manejarlo
    } finally {
      isLoading.value = false
    }
  }

  const checkAuth = async (): Promise<{ success: boolean; data?: User; error?: string }> => {
    if (token.value && !user.value) {
      return await getProfile()
    }
    return { success: true }
  }

  const initializeAuth = async () => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user')

    console.log('initializeAuth - storedToken:', storedToken)
    console.log('initializeAuth - storedUser:', storedUser)

    if (storedToken && storedUser) {
      try {
        token.value = storedToken
        user.value = JSON.parse(storedUser) as User
        console.log('initializeAuth - auth restored successfully')
        console.log('initializeAuth - user loaded:', user.value)
        console.log('initializeAuth - userRole:', user.value?.roles?.[0]?.name)
        console.log('initializeAuth - isAuthenticated:', !!token.value && !!user.value)

        // Si el usuario no tiene roles, refrescar desde el servidor
        if (!user.value?.roles || user.value.roles.length === 0) {
          console.log('initializeAuth - user has no roles, fetching profile...')
          try {
            const profileResponse = await getProfile()
            if (profileResponse.success && profileResponse.data) {
              console.log(
                'initializeAuth - profile refreshed with roles:',
                profileResponse.data?.roles,
              )
            }
          } catch (error) {
            console.error('initializeAuth - error fetching profile:', error)
            // Si falla obtener el perfil, podría ser que el token expiró
            clearAuth()
          }
        }
      } catch (error) {
        console.error('Error parsing stored user:', error)
        clearAuth()
      }
    } else {
      console.log('initializeAuth - no stored data found')
      console.log('initializeAuth - localStorage keys:', Object.keys(localStorage))
    }
  }

  const clearAuth = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }

  const hasPermission = (permission: string): boolean => {
    if (!user.value?.roles) return false

    return user.value.roles.some((role) =>
      role.permissions?.some((perm) => perm.name === permission),
    )
  }

  const hasRole = (roleName: string): boolean => {
    if (!user.value?.roles) return false

    return user.value.roles.some((role) => role.name === roleName)
  }

  const getMe = async () => {
    try {
      isLoading.value = true
      const response = await api.getMe()
      user.value = response.data
      return response
    } catch (error) {
      console.error('Get me error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const sendVerificationEmail = async (): Promise<{
    success: boolean
    data?: any
    error?: string
  }> => {
    try {
      isLoading.value = true
      clearError()

      const response = await api.sendVerificationEmail()

      if (response && response.data) {
        return { success: true, data: response.data }
      } else {
        setError('Error al enviar email de verificación')
        return { success: false, error: 'Error al enviar email de verificación' }
      }
    } catch (err: any) {
      let errorMessage = 'Error de conexión'

      if (err.response?.data) {
        if (
          err.response.data.errors &&
          Array.isArray(err.response.data.errors) &&
          err.response.data.errors.length > 0
        ) {
          errorMessage =
            err.response.data.errors[0].title ||
            err.response.data.errors[0].message ||
            'Error al enviar email de verificación'
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message
        } else if (err.response.data.data?.message) {
          errorMessage = err.response.data.data.message
        }
      }

      setError(errorMessage)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const verifyEmail = async (
    id: string,
    hash: string,
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      isLoading.value = true
      clearError()

      const response = await api.verifyEmail(id, hash)

      if (response && response.data) {
        return { success: true, data: response.data }
      } else {
        setError('Error al verificar email')
        return { success: false, error: 'Error al verificar email' }
      }
    } catch (err: any) {
      let errorMessage = 'Error de conexión'

      if (err.response?.data) {
        if (err.response.data.error?.message) {
          errorMessage = err.response.data.error.message
        } else if (
          err.response.data.errors &&
          Array.isArray(err.response.data.errors) &&
          err.response.data.errors.length > 0
        ) {
          errorMessage =
            err.response.data.errors[0].title ||
            err.response.data.errors[0].message ||
            'Error al verificar email'
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message
        } else if (err.response.data.data?.message) {
          errorMessage = err.response.data.data.message
        }
      }

      setError(errorMessage)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    // Estado
    user,
    token,
    isLoading,
    error,

    // Getters
    isAuthenticated,
    isAdmin,
    isTeacher,
    isStudent,
    userRole,
    userName,
    userEmail,

    // Acciones
    setUser,
    setToken,
    setError,
    clearError,
    login,
    register,
    logout,
    refreshToken,
    getProfile,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    checkAuth,
    initializeAuth,
    clearAuth,
    hasPermission,
    hasRole,
    getMe,
    sendVerificationEmail,
    verifyEmail,
  }
})
