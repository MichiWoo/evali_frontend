import { defineStore } from 'pinia'
import { ref, computed, nextTick } from 'vue'
import api from '@/services/api'

export interface Notification {
  id: number
  user_id: number
  type:
    | 'info'
    | 'success'
    | 'warning'
    | 'error'
    | 'exam_assigned'
    | 'exam_completed'
    | 'grade_available'
    | 'system'
  title: string
  message: string
  data: Record<string, any> | null
  is_read: boolean
  read_at: string | null
  created_at: string
  updated_at: string
}

export const useNotificationsStore = defineStore('notifications', () => {
  // State
  const notifications = ref<Notification[]>([])
  const unreadCount = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    current_page: 1,
    from: 0,
    last_page: 1,
    per_page: 20,
    to: 0,
    total: 0,
  })

  // Getters
  const unreadNotifications = computed(() =>
    notifications.value.filter((notification) => !notification.is_read),
  )

  const hasUnread = computed(() => unreadCount.value > 0)

  const recentNotifications = computed(() =>
    notifications.value
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10),
  )

  const notificationsByType = computed(() => {
    const grouped: Record<string, Notification[]> = {}
    notifications.value.forEach((notification) => {
      if (!grouped[notification.type]) {
        grouped[notification.type] = []
      }
      grouped[notification.type].push(notification)
    })
    return grouped
  })

  const getNotificationIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      info: 'pi pi-info-circle',
      success: 'pi pi-check-circle',
      warning: 'pi pi-exclamation-triangle',
      error: 'pi pi-times-circle',
      exam_assigned: 'pi pi-file-edit',
      exam_completed: 'pi pi-check',
      grade_available: 'pi pi-star',
      system: 'pi pi-cog',
    }
    return iconMap[type] || 'pi pi-bell'
  }

  const getNotificationSeverity = (type: string) => {
    const severityMap: Record<string, string> = {
      info: 'info',
      success: 'success',
      warning: 'warn',
      error: 'error',
      exam_assigned: 'info',
      exam_completed: 'success',
      grade_available: 'success',
      system: 'info',
    }
    return severityMap[type] || 'info'
  }

  // Actions
  const fetchNotifications = async (page: number = 1, limit: number = 20) => {
    try {
      // Check if user is authenticated before making the request
      const token = localStorage.getItem('auth_token')
      if (!token) {
        console.log('No auth token found, skipping notifications fetch')
        return
      }

      isLoading.value = true
      error.value = null

      const response = await api.get(`/notifications?page=${page}&limit=${limit}`)

      // Handle both array and paginated responses
      if (response.data && response.data.data) {
        // Paginated response
        notifications.value = response.data.data
        pagination.value = {
          current_page: response.data.current_page || 1,
          from: response.data.from || 0,
          last_page: response.data.last_page || 1,
          per_page: response.data.per_page || limit,
          to: response.data.to || 0,
          total: response.data.total || 0,
        }
      } else {
        // Simple array response (fallback)
        notifications.value = response.data || response
        pagination.value = {
          current_page: 1,
          from: 1,
          last_page: 1,
          per_page: limit,
          to: notifications.value.length,
          total: notifications.value.length,
        }
      }
    } catch (err: any) {
      // Only show error if it's not a 401 (unauthorized)
      if (err.response?.status !== 401) {
        error.value = err.response?.data?.message || 'Error al cargar notificaciones'
        console.error('Notifications fetch error:', err)
      }
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchUnreadCount = async () => {
    try {
      // Check if user is authenticated before making the request
      const token = localStorage.getItem('auth_token')
      if (!token) {
        console.log('No auth token found, skipping unread count fetch')
        return
      }

      const response = await api.get('/notifications/unread-count')
      unreadCount.value = response.data || 0
    } catch (err: any) {
      // Only show error if it's not a 401 (unauthorized)
      if (err.response?.status !== 401) {
        console.error('Error al cargar contador de notificaciones:', err)
      }
    }
  }

  const markAsRead = async (notificationId: number) => {
    try {
      await api.put(`/notifications/${notificationId}/read`)

      // Actualizar localmente
      const notification = notifications.value.find((n) => n.id === notificationId)
      if (notification) {
        notification.is_read = true
        notification.read_at = new Date().toISOString()
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }

      // Forzar actualización del contador desde el servidor
      await fetchUnreadCount()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al marcar notificación como leída'
      throw err
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read')

      // Actualizar localmente
      notifications.value.forEach((notification) => {
        notification.is_read = true
        notification.read_at = new Date().toISOString()
      })
      unreadCount.value = 0

      // Forzar actualización del contador desde el servidor
      await fetchUnreadCount()
    } catch (err: any) {
      error.value =
        err.response?.data?.message || 'Error al marcar todas las notificaciones como leídas'
      throw err
    }
  }

  const deleteNotification = async (notificationId: number) => {
    try {
      await api.delete(`/notifications/${notificationId}`)

      // Actualizar localmente
      const index = notifications.value.findIndex((n) => n.id === notificationId)
      if (index !== -1) {
        const notification = notifications.value[index]
        if (!notification.is_read) {
          unreadCount.value = Math.max(0, unreadCount.value - 1)
        }
        notifications.value.splice(index, 1)
      }

      // Esperar a que se actualice la UI y luego consultar el servidor
      await nextTick()
      await fetchUnreadCount()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al eliminar notificación'
      throw err
    }
  }

  const createNotification = async (notificationData: Partial<Notification>) => {
    try {
      const response = await api.post('/notifications', notificationData)
      const newNotification = response.data || response

      // Agregar al inicio de la lista
      notifications.value.unshift(newNotification)
      if (!newNotification.is_read) {
        unreadCount.value++
      }

      return newNotification
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al crear notificación'
      throw err
    }
  }

  const initialize = async () => {
    try {
      // Check if user is authenticated before initializing
      const token = localStorage.getItem('auth_token')
      if (!token) {
        console.log('No auth token found, skipping notifications initialization')
        return
      }

      // Fetch initial data
      await Promise.all([fetchNotifications(1, 10), fetchUnreadCount()])
    } catch (err) {
      console.error('Error initializing notifications:', err)
    }
  }

  const refreshNotifications = async () => {
    try {
      await Promise.all([fetchNotifications(1, 20), fetchUnreadCount()])
    } catch (err) {
      console.error('Error refreshing notifications:', err)
    }
  }

  const forceUpdateUnreadCount = async () => {
    try {
      await fetchUnreadCount()
    } catch (err) {
      console.error('Error forcing unread count update:', err)
    }
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    notifications.value = []
    unreadCount.value = 0
    error.value = null
  }

  return {
    // State
    notifications,
    unreadCount,
    pagination,
    isLoading,
    error,
    // Getters
    unreadNotifications,
    hasUnread,
    recentNotifications,
    notificationsByType,
    getNotificationIcon,
    getNotificationSeverity,
    // Actions
    initialize,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    refreshNotifications,
    forceUpdateUnreadCount,
    clearError,
    reset,
  }
})
