<template>
  <div
    class="notification-card"
    :class="{
      unread: !notification.is_read,
      selected: isSelected,
      clickable: clickable,
    }"
    @click="handleClick"
  >
    <div class="notification-header">
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
          {{ truncateMessage(notification.message, maxMessageLength) }}
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
          v-if="showActions"
          icon="pi pi-ellipsis-v"
          severity="secondary"
          text
          size="small"
          @click.stop="toggleActions"
        />
      </div>
    </div>

    <!-- Action Menu -->
    <div v-if="showActionMenu" class="action-menu">
      <Button
        v-if="!notification.is_read"
        label="Marcar como leída"
        icon="pi pi-check"
        severity="success"
        size="small"
        text
        @click="markAsRead"
      />
      <Button
        label="Ver detalles"
        icon="pi pi-eye"
        severity="secondary"
        size="small"
        text
        @click="viewDetails"
      />
      <Button
        label="Eliminar"
        icon="pi pi-trash"
        severity="danger"
        size="small"
        text
        @click="deleteNotification"
      />
    </div>

    <!-- Selection Checkbox -->
    <div v-if="showSelection" class="selection-checkbox">
      <Checkbox
        :model-value="isSelected"
        @update:model-value="$emit('select', notification.id, $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useNotificationsStore } from '@/stores/notifications'
import type { Notification } from '@/stores/notifications'

// Components
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Checkbox from 'primevue/checkbox'

// Props
interface Props {
  notification: Notification
  clickable?: boolean
  showActions?: boolean
  showSelection?: boolean
  isSelected?: boolean
  maxMessageLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  clickable: true,
  showActions: true,
  showSelection: false,
  isSelected: false,
  maxMessageLength: 150,
})

// Emits
const _emit = defineEmits<{
  click: [notification: Notification]
  select: [id: number, selected: boolean]
  'mark-read': [id: number]
  view: [notification: Notification]
  delete: [id: number]
}>()

// Store
const notificationsStore = useNotificationsStore()

// State
const showActionMenu = ref(false)

// Computed
const getNotificationIcon = computed(() => notificationsStore.getNotificationIcon)
const getNotificationSeverity = computed(() => notificationsStore.getNotificationSeverity)

// Methods
const handleClick = () => {
  if (props.clickable) {
    emit('click', props.notification)
  }
}

const toggleActions = () => {
  showActionMenu.value = !showActionMenu.value
}

const markAsRead = async () => {
  try {
    await notificationsStore.markAsRead(props.notification.id)
    emit('mark-read', props.notification.id)
    showActionMenu.value = false
  } catch (_error) {
    console.error('Error marking notification as read:', error)
  }
}

const viewDetails = () => {
  emit('view', props.notification)
  showActionMenu.value = false
}

const deleteNotification = () => {
  emit('delete', props.notification.id)
  showActionMenu.value = false
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
    info: 'Información',
    success: 'Éxito',
    warning: 'Advertencia',
    error: 'Error',
    exam_assigned: 'Examen Asignado',
    exam_completed: 'Examen Completado',
    grade_available: 'Calificación Disponible',
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
</script>

<style scoped>
.notification-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
}

.notification-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color);
}

.notification-card.unread {
  border-left: 4px solid var(--orange-500);
  background: var(--orange-50);
}

.notification-card.selected {
  border-color: var(--primary-color);
  background: var(--primary-50);
}

.notification-card.clickable:hover {
  cursor: pointer;
}

.notification-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.notification-icon {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-100);
  border-radius: 50%;
  font-size: 1.25rem;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.unread-indicator {
  width: 8px;
  height: 8px;
  background: var(--orange-500);
  border-radius: 50%;
  flex-shrink: 0;
}

.notification-message {
  color: var(--text-color-secondary);
  line-height: 1.5;
  margin-bottom: 0.75rem;
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.notification-time {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.notification-actions {
  flex-shrink: 0;
}

.action-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 200px;
  padding: 0.5rem;
  margin-top: 0.25rem;
}

.action-menu .p-button {
  width: 100%;
  justify-content: flex-start;
  margin-bottom: 0.25rem;
}

.action-menu .p-button:last-child {
  margin-bottom: 0;
}

.selection-checkbox {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 10;
}

/* Responsive */
@media (max-width: 768px) {
  .notification-card {
    padding: 0.75rem;
  }

  .notification-header {
    gap: 0.75rem;
  }

  .notification-icon {
    width: 2rem;
    height: 2rem;
    font-size: 1rem;
  }

  .notification-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .notification-card.unread {
    background: rgba(251, 146, 60, 0.1);
  }

  .notification-card.selected {
    background: rgba(59, 130, 246, 0.1);
  }
}
</style>
