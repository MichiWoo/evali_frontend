import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import type { User, PaginatedResponse, Role } from '@/types'

export const useUserStore = defineStore('users', () => {
  // State
  const users = ref<User[]>([])
  const currentUser = ref<User | null>(null)
  const roles = ref<Role[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
  })

  // Getters
  const getUsersByRole = computed(() => {
    return (role: string) => users.value.filter((user) => user.roles?.some((r) => r.name === role))
  })

  const getActiveUsers = computed(() => {
    return users.value.filter((user) => user.email_verified_at !== null)
  })

  const getInactiveUsers = computed(() => {
    return users.value.filter((user) => user.email_verified_at === null)
  })

  const getUserById = computed(() => {
    return (id: number) => users.value.find((user) => user.id === id)
  })

  // Actions
  const fetchUsers = async (
    params: {
      page?: number
      per_page?: number
      search?: string
      role?: string
      status?: string
      sort?: string
      order?: 'asc' | 'desc'
    } = {},
  ) => {
    try {
      isLoading.value = true
      error.value = null

      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.per_page) queryParams.append('per_page', params.per_page.toString())
      if (params.search) queryParams.append('search', params.search)
      if (params.role) queryParams.append('role', params.role)
      if (params.status) queryParams.append('status', params.status)
      if (params.sort) queryParams.append('sort', params.sort)
      if (params.order) queryParams.append('order', params.order)

      const response = await api.get(`/users?${queryParams.toString()}`)

      // The response is already the paginated data
      const paginatedData = response.data as PaginatedResponse<User>

      users.value = paginatedData.data
      pagination.value = {
        current_page: paginatedData.current_page,
        last_page: paginatedData.last_page,
        per_page: paginatedData.per_page,
        total: paginatedData.total,
        from: paginatedData.from,
        to: paginatedData.to,
      }

      return paginatedData
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar usuarios'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchUser = async (id: number) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.get(`/users/${id}`)
      const user = response.data.data as User

      // Update in users array if exists
      const index = users.value.findIndex((u) => u.id === id)
      if (index !== -1) {
        users.value[index] = user
      } else {
        users.value.push(user)
      }

      currentUser.value = user
      return user
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar usuario'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createUser = async (userData: {
    name: string
    email: string
    password: string
    role_ids?: number[]
  }) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.post('/users', userData)
      const newUser = response.data.data as User

      users.value.unshift(newUser)
      return newUser
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al crear usuario'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateUser = async (
    id: number,
    userData: {
      name?: string
      email?: string
      password?: string
      role_ids?: number[]
    },
  ) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.put(`/users/${id}`, userData)
      const updatedUser = response.data.data as User

      // Update in users array
      const index = users.value.findIndex((u) => u.id === id)
      if (index !== -1) {
        users.value[index] = updatedUser
      }

      // Update current user if it's the same
      if (currentUser.value?.id === id) {
        currentUser.value = updatedUser
      }

      return updatedUser
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al actualizar usuario'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteUser = async (id: number) => {
    try {
      isLoading.value = true
      error.value = null
      await api.delete(`/users/${id}`)

      // Remove from users array
      users.value = users.value.filter((u) => u.id !== id)

      // Clear current user if it's the same
      if (currentUser.value?.id === id) {
        currentUser.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al eliminar usuario'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const searchUsers = async (query: string, role?: string) => {
    try {
      isLoading.value = true
      error.value = null

      const params = new URLSearchParams()
      params.append('q', query)
      if (role) params.append('role', role)

      const response = await api.get(`/users/search?${params.toString()}`)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al buscar usuarios'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchRoles = async () => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.get('/roles')
      roles.value = response.data.data
      return roles.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar roles'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const assignRole = async (userId: number, roleId: number) => {
    try {
      isLoading.value = true
      error.value = null
      await api.post(`/users/${userId}/roles`, { role_id: roleId })

      // Refresh user data
      await fetchUser(userId)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al asignar rol'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const removeRole = async (userId: number, roleId: number) => {
    try {
      isLoading.value = true
      error.value = null
      await api.delete(`/users/${userId}/roles/${roleId}`)

      // Refresh user data
      await fetchUser(userId)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al remover rol'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const bulkUpdateUsers = async (
    userIds: number[],
    updates: {
      status?: string
      role_ids?: number[]
    },
  ) => {
    try {
      isLoading.value = true
      error.value = null
      await api.post('/users/bulk-update', {
        user_ids: userIds,
        updates,
      })

      // Refresh users data
      await fetchUsers()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al actualizar usuarios'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const bulkDeleteUsers = async (userIds: number[]) => {
    try {
      isLoading.value = true
      error.value = null
      await api.post('/users/bulk-delete', { user_ids: userIds })

      // Remove from users array
      users.value = users.value.filter((u) => !userIds.includes(u.id))
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al eliminar usuarios'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearCurrentUser = () => {
    currentUser.value = null
  }

  const exportUsers = async (filters: {
    format: string
    role?: string
    status?: string
    search?: string
    sort?: string
    order?: string
  }) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await api.post('/users/export', filters, {
        responseType: 'blob',
      })

      if (!response || response.size === 0) {
        throw new Error('No se recibieron datos del servidor')
      }

      // Use the response directly as it's already a blob
      const blob = response

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      // Create filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `usuarios_${timestamp}.${filters.format}`

      link.setAttribute('download', filename)
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al exportar usuarios'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    users,
    currentUser,
    roles,
    isLoading,
    error,
    pagination,

    // Getters
    getUsersByRole,
    getActiveUsers,
    getInactiveUsers,
    getUserById,

    // Actions
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
    searchUsers,
    fetchRoles,
    assignRole,
    removeRole,
    bulkUpdateUsers,
    bulkDeleteUsers,
    exportUsers,
    clearError,
    clearCurrentUser,
  }
})
