<template>
  <Toast />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import { useNotificationsStore } from '@/stores/notifications'
import type { Notification } from '@/stores/notifications'

const toast = useToast()
const notificationsStore = useNotificationsStore()

let intervalId: number | null = null

const checkForNewNotifications = async () => {
  try {
    const previousCount = notificationsStore.unreadCount
    await notificationsStore.fetchUnreadCount()

    const currentCount = notificationsStore.unreadCount
    if (currentCount > previousCount) {
      // Hay nuevas notificaciones
      await notificationsStore.fetchNotifications(1, 5)
      const newNotifications = notificationsStore.recentNotifications.slice(
        0,
        currentCount - previousCount,
      )

      newNotifications.forEach((notification) => {
        showNotificationToast(notification)
      })
    }
  } catch (error) {
    console.error('Error al verificar notificaciones:', error)
  }
}

const showNotificationToast = (notification: Notification) => {
  const severity = getNotificationSeverity(notification.type)
  const icon = getNotificationIcon(notification.type)

  toast.add({
    severity,
    summary: notification.title,
    detail: notification.message,
    life: 5000,
  })
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

onMounted(() => {
  // Verificar notificaciones cada 30 segundos
  intervalId = window.setInterval(checkForNewNotifications, 30000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>
