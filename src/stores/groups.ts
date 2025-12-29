import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import type { Group, CreateGroupRequest, UpdateGroupRequest } from '@/types'

export const useGroupStore = defineStore('groups', () => {
  // State
  const groups = ref<Group[]>([])
  const currentGroup = ref<Group | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const getGroupById = computed(() => (id: number) => groups.value.find((group) => group.id === id))

  const getGroupsByUser = computed(
    () => (userId: number) => groups.value.filter((group) => group.user_id === userId),
  )

  // Actions
  const fetchGroups = async () => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.get('/groups')
      groups.value = response?.data?.data || []
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar grupos'
      groups.value = []
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchGroup = async (id: number) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.get(`/groups/${id}`)
      currentGroup.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar grupo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createGroup = async (groupData: CreateGroupRequest) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.post('/groups', groupData)
      const newGroup = response.data
      groups.value.push(newGroup)
      return newGroup
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al crear grupo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateGroup = async (id: number, groupData: UpdateGroupRequest) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.put(`/groups/${id}`, groupData)
      const updatedGroup = response.data
      const index = groups.value.findIndex((group) => group.id === id)
      if (index !== -1) {
        groups.value[index] = updatedGroup
      }
      if (currentGroup.value?.id === id) {
        currentGroup.value = updatedGroup
      }
      return updatedGroup
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al actualizar grupo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteGroup = async (id: number) => {
    try {
      isLoading.value = true
      error.value = null
      await api.delete(`/groups/${id}`)
      groups.value = groups.value.filter((group) => group.id !== id)
      if (currentGroup.value?.id === id) {
        currentGroup.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al eliminar grupo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const addUserToGroup = async (groupId: number, userId: number) => {
    try {
      isLoading.value = true
      error.value = null
      await api.post(`/groups/${groupId}/users`, { user_id: userId })
      // Refresh group data
      await fetchGroup(groupId)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al agregar usuario al grupo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const removeUserFromGroup = async (groupId: number, userId: number) => {
    try {
      isLoading.value = true
      error.value = null
      await api.delete(`/groups/${groupId}/users/${userId}`)
      // Refresh group data
      await fetchGroup(groupId)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al remover usuario del grupo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const assignExamsToGroup = async (groupId: number, examIds: number[]) => {
    try {
      isLoading.value = true
      error.value = null
      await api.post(`/groups/${groupId}/exams`, { exam_ids: examIds })
      // Refresh group data
      await fetchGroup(groupId)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al asignar exámenes al grupo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const searchUsers = async (query: string, role: string = 'student') => {
    try {
      console.log(
        'API call to search users:',
        `/users/search?q=${encodeURIComponent(query)}&role=${role}`,
      )
      const response = await api.get(`/users/search?q=${encodeURIComponent(query)}&role=${role}`)
      console.log('API response:', response.data)
      return response.data
    } catch (err: any) {
      console.error('API error:', err)
      error.value = err.response?.data?.message || 'Error al buscar usuarios'
      throw err
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    groups,
    currentGroup,
    isLoading,
    error,
    // Getters
    getGroupById,
    getGroupsByUser,
    // Actions
    fetchGroups,
    fetchGroup,
    createGroup,
    updateGroup,
    deleteGroup,
    addUserToGroup,
    removeUserFromGroup,
    assignExamsToGroup,
    searchUsers,
    clearError,
  }
})
