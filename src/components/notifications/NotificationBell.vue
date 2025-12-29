<template>
  <div class="notification-bell">
    <Button
      icon="pi pi-bell"
      severity="secondary"
      text
      rounded
      :badge="unreadCount > 0 ? unreadCount.toString() : undefined"
      badge-severity="danger"
      @click="toggleDropdown"
      aria-label="Notificaciones"
      :class="{ 'has-unread': unreadCount > 0 }"
    />

    <div v-if="showNotificationPanel" class="notification-panel" :style="{ width: '420px' }">
      <!-- Header -->
      <div class="notification-header">
        <div class="header-info">
          <h3>Notificaciones</h3>
          <div v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }} sin leer</div>
        </div>
        <div class="notification-actions">
          <Button
            v-if="unreadCount > 0"
            icon="pi pi-check-circle"
            size="small"
            severity="success"
            text
            @click="markAllAsRead"
            v-tooltip.top="'Marcar todas como leídas'"
            :loading="isLoading"
          />
          <Button
            icon="pi pi-refresh"
            size="small"
            severity="secondary"
            text
            @click="refreshNotifications"
            v-tooltip.top="'Actualizar'"
            :loading="isLoading"
          />
          <Button
            icon="pi pi-cog"
            size="small"
            severity="secondary"
            text
            @click="goToSettings"
            v-tooltip.top="'Configuración'"
          />
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="notification-tabs">
        <Button
          v-for="tab in tabs"
          :key="tab.value"
          :label="tab.label"
          :icon="tab.icon"
          size="small"
          :severity="activeTab === tab.value ? 'primary' : 'secondary'"
          :text="activeTab !== tab.value"
          @click="activeTab = tab.value"
          class="tab-button"
        />
      </div>

      <!-- Notification List -->
      <div class="notification-list">
        <div v-if="isLoading" class="loading-state">
          <ProgressSpinner size="small" />
          <span>Cargando notificaciones...</span>
        </div>

        <div v-else-if="filteredNotifications.length === 0" class="empty-state">
          <i class="pi pi-bell-slash text-4xl text-400"></i>
          <p>{{ getEmptyMessage() }}</p>
        </div>

        <div v-else class="notifications">
          <div
            v-for="notification in filteredNotifications"
            :key="notification.id"
            class="notification-item"
            :class="{
              unread: !notification.is_read,
              clickable: true,
            }"
            @click="handleNotificationClick(notification)"
          >
            <div class="notification-icon">
              <i
                :class="getNotificationIcon(notification.type)"
                :style="{ color: getNotificationColor(notification.type) }"
              ></i>
            </div>
            <div class="notification-content">
              <div class="notification-title">
                {{ notification.title }}
                <div v-if="!notification.is_read" class="unread-indicator"></div>
              </div>
              <div class="notification-message">
                {{ truncateMessage(notification.message, 80) }}
              </div>
              <div class="notification-meta">
                <Tag
                  :value="getTypeLabel(notification.type)"
                  :severity="getNotificationSeverity(notification.type)"
                  size="small"
                />
                <span class="notification-time">
                  {{ formatTime(notification.created_at) }}
                </span>
              </div>
            </div>
            <div class="notification-actions">
              <Button
                v-if="!notification.is_read"
                icon="pi pi-check"
                size="small"
                severity="success"
                text
                @click.stop="markAsRead(notification.id)"
                v-tooltip.top="'Marcar como leída'"
              />
              <Button
                icon="pi pi-eye"
                size="small"
                severity="secondary"
                text
                @click.stop="viewNotification(notification)"
                v-tooltip.top="'Ver detalles'"
              />
              <Button
                icon="pi pi-times"
                size="small"
                severity="danger"
                text
                @click.stop="deleteNotification(notification.id)"
                v-tooltip.top="'Eliminar'"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="notification-footer">
        <div class="footer-actions">
          <Button
            label="Ver todas"
            icon="pi pi-list"
            severity="secondary"
            text
            @click="goToNotifications"
          />
          <Button
            label="Configuración"
            icon="pi pi-cog"
            severity="secondary"
            text
            @click="goToSettings"
          />
        </div>
        <div class="footer-info">
          <small class="text-600"> {{ pagination.total }} notificaciones total </small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationsStore } from '@/stores/notifications'
import { useToast } from 'primevue/usetoast'
import type { Notification } from '@/stores/notifications'

// Components
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'

// Router and stores
const router = useRouter()
const notificationsStore = useNotificationsStore()
const toast = useToast()

// Refs
const showNotificationPanel = ref(false)
const activeTab = ref('all')

// Tabs configuration
const tabs = ref([
  { value: 'all', label: 'Todas', icon: 'pi pi-list' },
  { value: 'unread', label: 'Sin leer', icon: 'pi pi-exclamation-circle' },
  { value: 'read', label: 'Leídas', icon: 'pi pi-check-circle' },
])

// Computed
const notifications = computed(() => notificationsStore.notifications)
const unreadCount = computed(() => notificationsStore.unreadCount)
const recentNotifications = computed(() => notificationsStore.recentNotifications)
const isLoading = computed(() => notificationsStore.isLoading)
const getNotificationIcon = computed(() => notificationsStore.getNotificationIcon)
const getNotificationSeverity = computed(() => notificationsStore.getNotificationSeverity)
const pagination = computed(() => ({ total: notifications.value?.length || 0 }))

// Filter notifications based on active tab
const filteredNotifications = computed(() => {
  const allNotifications = notifications.value || []

  switch (activeTab.value) {
    case 'unread':
      return allNotifications.filter((n) => !n.is_read)
    case 'read':
      return allNotifications.filter((n) => n.is_read)
    default:
      return allNotifications
  }
})

// Methods
const toggleDropdown = () => {
  showNotificationPanel.value = !showNotificationPanel.value
}

const refreshNotifications = async () => {
  try {
    await notificationsStore.fetchNotifications()
    await notificationsStore.fetchUnreadCount()
    toast.add({
      severity: 'success',
      summary: 'Actualizado',
      detail: 'Notificaciones actualizadas',
      life: 2000,
    })
  } catch (error) {
    console.error('Error al actualizar notificaciones:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron actualizar las notificaciones',
      life: 3000,
    })
  }
}

const markAsRead = async (notificationId: number) => {
  try {
    await notificationsStore.markAsRead(notificationId)
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Notificación marcada como leída',
      life: 2000,
    })
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo marcar la notificación',
      life: 3000,
    })
  }
}

const markAllAsRead = async () => {
  try {
    await notificationsStore.markAllAsRead()
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Todas las notificaciones marcadas como leídas',
      life: 2000,
    })
  } catch (error) {
    console.error('Error al marcar todas como leídas:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron marcar todas las notificaciones',
      life: 3000,
    })
  }
}

const deleteNotification = async (notificationId: number) => {
  try {
    await notificationsStore.deleteNotification(notificationId)
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Notificación eliminada',
      life: 2000,
    })
  } catch (error) {
    console.error('Error al eliminar notificación:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo eliminar la notificación',
      life: 3000,
    })
  }
}

const viewNotification = (notification: Notification) => {
  // TODO: Implement notification detail view
  console.log('View notification:', notification)
  toast.add({
    severity: 'info',
    summary: 'Vista de detalle',
    detail: 'Funcionalidad en desarrollo',
    life: 2000,
  })
}

const handleNotificationClick = (notification: Notification) => {
  // Marcar como leída si no lo está
  if (!notification.is_read) {
    markAsRead(notification.id)
  }

  // Navegar según el tipo de notificación
  if (notification.data?.exam_id) {
    router.push(`/exams/${notification.data.exam_id}`)
  } else if (notification.data?.group_id) {
    router.push(`/groups/${notification.data.group_id}`)
  } else if (notification.data?.attempt_id) {
    router.push(`/student/results/${notification.data.attempt_id}`)
  }

  // Cerrar el panel
  showNotificationPanel.value = false
}

const goToNotifications = () => {
  router.push('/notifications')
  showNotificationPanel.value = false
}

const goToSettings = () => {
  router.push('/notifications/settings')
  showNotificationPanel.value = false
}

const getEmptyMessage = () => {
  switch (activeTab.value) {
    case 'unread':
      return 'No hay notificaciones sin leer'
    case 'read':
      return 'No hay notificaciones leídas'
    default:
      return 'No hay notificaciones'
  }
}

const getNotificationColor = (type: string) => {
  const colorMap: Record<string, string> = {
    info: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    exam_assigned: '#8b5cf6',
    exam_completed: '#06b6d4',
    grade_available: '#f97316',
    system: '#6b7280',
  }
  return colorMap[type] || '#6b7280'
}

const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    info: 'Info',
    success: 'Éxito',
    warning: 'Advertencia',
    error: 'Error',
    exam_assigned: 'Examen',
    exam_completed: 'Completado',
    grade_available: 'Calificación',
    system: 'Sistema',
  }
  return typeMap[type] || type
}

const truncateMessage = (message: string, length: number) => {
  return message.length > length ? message.substring(0, length) + '...' : message
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) {
    return 'Ahora'
  } else if (diffInMinutes < 60) {
    return `Hace ${diffInMinutes} min`
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60)
    return `Hace ${hours}h`
  } else {
    return date.toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
}

// Click outside handler
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  const notificationBell = document.querySelector('.notification-bell')

  if (notificationBell && !notificationBell.contains(target)) {
    showNotificationPanel.value = false
  }
}

// Lifecycle
onMounted(async () => {
  try {
    await notificationsStore.fetchNotifications()
    await notificationsStore.fetchUnreadCount()
    document.addEventListener('click', handleClickOutside)
  } catch (error) {
    console.error('Error initializing notifications:', error)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.notification-bell {
  position: relative;
}

.notification-bell .p-button.has-unread {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.notification-panel {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1000;
  max-height: 600px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  margin-top: 0.5rem;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--surface-border);
  background: var(--surface-50);
  border-radius: 12px 12px 0 0;
}

.header-info h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
}

.unread-badge {
  font-size: 0.75rem;
  color: var(--orange-600);
  background: var(--orange-100);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
  margin-top: 0.25rem;
}

.notification-actions {
  display: flex;
  gap: 0.5rem;
}

.notification-tabs {
  display: flex;
  padding: 0.5rem;
  background: var(--surface-50);
  border-bottom: 1px solid var(--surface-border);
  gap: 0.25rem;
}

.tab-button {
  flex: 1;
  font-size: 0.75rem;
}

.notification-list {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;
  color: var(--text-color-secondary);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;
  color: var(--text-color-secondary);
}

.notifications {
  padding: 0.5rem;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  margin-bottom: 0.5rem;
  position: relative;
}

.notification-item:hover {
  background-color: var(--surface-hover);
  border-color: var(--surface-border);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.notification-item.unread {
  background-color: var(--primary-50);
  border-color: var(--primary-200);
  border-left: 3px solid var(--primary-500);
}

.notification-item.unread::before {
  content: '';
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 8px;
  height: 8px;
  background: var(--primary-500);
  border-radius: 50%;
}

.notification-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: var(--surface-100);
  color: var(--text-color-secondary);
  flex-shrink: 0;
  font-size: 1rem;
}

.notification-item.unread .notification-icon {
  background-color: var(--primary-100);
  color: var(--primary-600);
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.unread-indicator {
  width: 6px;
  height: 6px;
  background: var(--primary-500);
  border-radius: 50%;
  flex-shrink: 0;
}

.notification-message {
  font-size: 0.8rem;
  color: var(--text-color-secondary);
  line-height: 1.4;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.notification-time {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
}

.notification-actions {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.notification-item:hover .notification-actions {
  opacity: 1;
}

.notification-footer {
  padding: 1rem;
  border-top: 1px solid var(--surface-border);
  background: var(--surface-50);
  border-radius: 0 0 12px 12px;
}

.footer-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.footer-info {
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .notification-panel {
    width: 100vw !important;
    max-width: 100vw;
    margin: 0;
    border-radius: 0;
  }

  .notification-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .notification-actions {
    width: 100%;
    justify-content: space-between;
  }

  .notification-tabs {
    flex-direction: column;
    gap: 0.5rem;
  }

  .tab-button {
    flex: none;
  }

  .notification-item {
    flex-direction: column;
    gap: 0.5rem;
  }

  .notification-actions {
    flex-direction: row;
    justify-content: flex-end;
    opacity: 1;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .notification-item.unread {
    background: rgba(59, 130, 246, 0.1);
  }

  .notification-panel {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }
}
</style>
