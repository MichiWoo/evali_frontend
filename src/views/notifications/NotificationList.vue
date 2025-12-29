<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <!-- Header -->
        <div class="flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="text-3xl font-bold text-900 mb-2">Notificaciones</h1>
            <p class="text-600 m-0">Gestiona todas tus notificaciones</p>
          </div>
          <div class="flex gap-2">
            <Button
              v-if="selectedNotifications.length > 0"
              label="Marcar como leídas"
              icon="pi pi-check"
              severity="secondary"
              outlined
              @click="markSelectedAsRead"
              :loading="isLoading"
            />
            <Button
              v-if="selectedNotifications.length > 0"
              label="Eliminar"
              icon="pi pi-trash"
              severity="danger"
              outlined
              @click="confirmDeleteSelected"
            />
            <Button
              label="Marcar todas como leídas"
              icon="pi pi-check-circle"
              severity="success"
              outlined
              @click="markAllAsRead"
              :loading="isLoading"
            />
          </div>
        </div>

        <!-- Statistics Cards -->
        <div class="flex flex-wrap gap-4 justify-content-center mb-4">
          <div class="stats-card">
            <div class="flex align-items-center gap-3 p-4">
              <div class="stats-icon bg-blue-100 text-blue-600 border-round">
                <i class="pi pi-bell text-xl"></i>
              </div>
              <div class="flex flex-column">
                <div class="text-2xl font-bold text-900">{{ pagination.total }}</div>
                <div class="text-600 font-medium text-sm">Total Notificaciones</div>
              </div>
            </div>
          </div>

          <div class="stats-card">
            <div class="flex align-items-center gap-3 p-4">
              <div class="stats-icon bg-orange-100 text-orange-600 border-round">
                <i class="pi pi-exclamation-circle text-xl"></i>
              </div>
              <div class="flex flex-column">
                <div class="text-2xl font-bold text-900">{{ unreadCount }}</div>
                <div class="text-600 font-medium text-sm">Sin Leer</div>
              </div>
            </div>
          </div>

          <div class="stats-card">
            <div class="flex align-items-center gap-3 p-4">
              <div class="stats-icon bg-green-100 text-green-600 border-round">
                <i class="pi pi-check-circle text-xl"></i>
              </div>
              <div class="flex flex-column">
                <div class="text-2xl font-bold text-900">{{ readCount }}</div>
                <div class="text-600 font-medium text-sm">Leídas</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters and Search -->
        <div class="card mb-4">
          <div class="flex flex-column md:flex-row gap-3">
            <IconField iconPosition="left">
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText type="text" placeholder="Buscar" v-model="filters.search" />
            </IconField>
            <div class="flex gap-2">
              <Select
                v-model="filters.type"
                :options="typeOptions"
                placeholder="Tipo"
                option-label="label"
                option-value="value"
                show-clear
                @change="applyFilters"
              />
              <Select
                v-model="filters.status"
                :options="statusOptions"
                placeholder="Estado"
                option-label="label"
                option-value="value"
                show-clear
                @change="applyFilters"
              />
              <Button
                icon="pi pi-filter-slash"
                label="Limpiar"
                severity="secondary"
                outlined
                @click="clearFilters"
              />
            </div>
          </div>
        </div>

        <!-- Notifications List -->
        <div class="card">
          <DataTable
            v-model:selection="selectedNotifications"
            :value="safeNotifications"
            :loading="isLoading"
            :paginator="true"
            :rows="pagination.per_page"
            :totalRecords="pagination.total"
            :lazy="true"
            @page="onPageChange"
            selectionMode="multiple"
            dataKey="id"
            class="p-datatable-sm"
            :rowsPerPageOptions="[10, 25, 50, 100]"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} notificaciones"
          >
            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

            <Column field="type" header="Tipo" sortable>
              <template #body="{ data }">
                <div class="flex align-items-center gap-2">
                  <i
                    :class="getNotificationIcon(data.type)"
                    :style="{ color: getNotificationColor(data.type) }"
                  ></i>
                  <Tag
                    :value="getTypeLabel(data.type)"
                    :severity="getNotificationSeverity(data.type)"
                  />
                </div>
              </template>
            </Column>

            <Column field="title" header="Título" sortable>
              <template #body="{ data }">
                <div class="flex align-items-center gap-2">
                  <div class="font-semibold" :class="{ 'text-600': data.is_read }">
                    {{ data.title }}
                  </div>
                  <div v-if="!data.is_read" class="unread-indicator"></div>
                </div>
              </template>
            </Column>

            <Column field="message" header="Mensaje">
              <template #body="{ data }">
                <div class="notification-message" :class="{ 'text-600': data.is_read }">
                  {{ truncateMessage(data.message, 100) }}
                </div>
              </template>
            </Column>

            <Column field="is_read" header="Estado" sortable>
              <template #body="{ data }">
                <Tag
                  :value="data.is_read ? 'Leída' : 'Sin leer'"
                  :severity="data.is_read ? 'success' : 'warning'"
                />
              </template>
            </Column>

            <Column field="created_at" header="Fecha" sortable>
              <template #body="{ data }">
                <div class="text-sm">
                  {{ formatDate(data.created_at) }}
                </div>
              </template>
            </Column>

            <Column header="Acciones" headerStyle="width: 8rem">
              <template #body="{ data }">
                <div class="flex gap-1">
                  <Button
                    v-if="!data.is_read"
                    icon="pi pi-check"
                    severity="success"
                    size="small"
                    outlined
                    @click="markAsRead(data.id)"
                    v-tooltip.top="'Marcar como leída'"
                  />
                  <Button
                    icon="pi pi-eye"
                    severity="secondary"
                    size="small"
                    outlined
                    @click="viewNotification(data)"
                    v-tooltip.top="'Ver detalles'"
                  />
                  <Button
                    icon="pi pi-trash"
                    severity="danger"
                    size="small"
                    outlined
                    @click="confirmDelete(data)"
                    v-tooltip.top="'Eliminar'"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>

    <!-- Notification Detail Dialog -->
    <Dialog
      v-model:visible="showDetailDialog"
      :header="selectedNotification?.title"
      :modal="true"
      :style="{ width: '600px' }"
    >
      <div v-if="selectedNotification" class="notification-detail">
        <div class="flex align-items-center gap-3 mb-4">
          <i
            :class="getNotificationIcon(selectedNotification.type)"
            :style="{ color: getNotificationColor(selectedNotification.type), fontSize: '1.5rem' }"
          ></i>
          <div>
            <Tag
              :value="getTypeLabel(selectedNotification.type)"
              :severity="getNotificationSeverity(selectedNotification.type)"
            />
            <div class="text-sm text-600 mt-1">
              {{ formatDate(selectedNotification.created_at) }}
            </div>
          </div>
        </div>

        <div class="notification-content">
          <h4 class="mb-3">Mensaje:</h4>
          <p class="text-900 line-height-3">{{ selectedNotification.message }}</p>
        </div>

        <div v-if="selectedNotification.data" class="notification-data mt-4">
          <h4 class="mb-3">Datos adicionales:</h4>
          <pre class="bg-gray-50 p-3 border-round text-sm">{{
            JSON.stringify(selectedNotification.data, null, 2)
          }}</pre>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-content-between w-full">
          <Button
            v-if="selectedNotification && !selectedNotification.is_read"
            label="Marcar como leída"
            icon="pi pi-check"
            @click="markAsRead(selectedNotification.id)"
            :loading="isLoading"
          />
          <Button label="Cerrar" severity="secondary" outlined @click="showDetailDialog = false" />
        </div>
      </template>
    </Dialog>

    <!-- Confirmation Dialog -->
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useNotificationsStore } from '@/stores/notifications'
import type { Notification } from '@/types'

// PrimeVue Components
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import ConfirmDialog from 'primevue/confirmdialog'

const router = useRouter()
const notificationsStore = useNotificationsStore()
const confirm = useConfirm()
const toast = useToast()

// State
const selectedNotifications = ref<Notification[]>([])
const showDetailDialog = ref(false)
const selectedNotification = ref<Notification | null>(null)
const filters = ref({
  search: '',
  type: null as string | null,
  status: null as string | null,
})

// Computed
const pagination = computed(() => notificationsStore.pagination)
const isLoading = computed(() => notificationsStore.isLoading)
const safeNotifications = computed(() => notificationsStore.notifications || [])
const unreadCount = computed(() => notificationsStore.unreadCount)

// Filter options
const typeOptions = [
  { label: 'Información', value: 'info' },
  { label: 'Éxito', value: 'success' },
  { label: 'Advertencia', value: 'warning' },
  { label: 'Error', value: 'error' },
  { label: 'Examen Asignado', value: 'exam_assigned' },
  { label: 'Examen Completado', value: 'exam_completed' },
  { label: 'Calificación Disponible', value: 'grade_available' },
  { label: 'Sistema', value: 'system' },
]

const statusOptions = [
  { label: 'Leídas', value: 'read' },
  { label: 'No leídas', value: 'unread' },
]

// Custom debounce function
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

const readCount = computed(
  () => safeNotifications.value.filter((notification) => notification.is_read).length,
)

// Methods
const loadNotifications = async () => {
  try {
    await notificationsStore.fetchNotifications(
      pagination.value.current_page,
      pagination.value.per_page,
    )
  } catch (error) {
    console.error('Error loading notifications:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las notificaciones',
      life: 3000,
    })
  }
}

const debouncedSearch = debounce(() => {
  applyFilters()
}, 500)

const applyFilters = () => {
  // TODO: Implement filtering logic
  loadNotifications()
}

const clearFilters = () => {
  filters.value = {
    search: '',
    type: null,
    status: null,
  }
  applyFilters()
}

const onPageChange = (event: any) => {
  // Update local pagination state
  pagination.value.current_page = event.page + 1
  pagination.value.per_page = event.rows

  // Fetch notifications with new pagination
  loadNotifications()
}

const markAsRead = async (id: number) => {
  try {
    await notificationsStore.markAsRead(id)
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Notificación marcada como leída',
      life: 3000,
    })
    loadNotifications()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo marcar la notificación',
      life: 3000,
    })
  }
}

const markSelectedAsRead = async () => {
  try {
    for (const notification of selectedNotifications.value) {
      await notificationsStore.markAsRead(notification.id)
    }
    selectedNotifications.value = []
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Notificaciones marcadas como leídas',
      life: 3000,
    })
    loadNotifications()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron marcar las notificaciones',
      life: 3000,
    })
  }
}

const markAllAsRead = async () => {
  try {
    await notificationsStore.markAllAsRead()
    await loadNotifications() // Refresh the list
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Todas las notificaciones marcadas como leídas',
      life: 3000,
    })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron marcar todas las notificaciones como leídas',
      life: 3000,
    })
  }
}

const confirmDelete = (notification: Notification) => {
  confirm.require({
    message: `¿Estás seguro de que quieres eliminar la notificación "${notification.title}"?`,
    header: 'Confirmar Eliminación',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancelar',
    acceptLabel: 'Eliminar',
    accept: () => deleteNotification(notification.id),
  })
}

const confirmDeleteSelected = () => {
  confirm.require({
    message: `¿Estás seguro de que quieres eliminar ${selectedNotifications.value.length} notificaciones?`,
    header: 'Confirmar Eliminación Masiva',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancelar',
    acceptLabel: 'Eliminar',
    accept: () => deleteSelectedNotifications(),
  })
}

const deleteNotification = async (id: number) => {
  try {
    await notificationsStore.deleteNotification(id)
    await loadNotifications() // Refresh the list
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Notificación eliminada',
      life: 3000,
    })
  } catch (error) {
    console.error('Error deleting notification:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo eliminar la notificación',
      life: 3000,
    })
  }
}

const deleteSelectedNotifications = async () => {
  try {
    for (const notification of selectedNotifications.value) {
      await notificationsStore.deleteNotification(notification.id)
    }
    selectedNotifications.value = []
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Notificaciones eliminadas',
      life: 3000,
    })
    loadNotifications()
  } catch (error) {
    console.error('Error deleting notifications:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron eliminar las notificaciones',
      life: 3000,
    })
  }
}

const viewNotification = (notification: Notification) => {
  selectedNotification.value = notification
  showDetailDialog.value = true
}

const getNotificationIcon = (type: string) => {
  return notificationsStore.getNotificationIcon(type)
}

const getNotificationSeverity = (type: string) => {
  return notificationsStore.getNotificationSeverity(type)
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
  const option = typeOptions.value.find((opt) => opt.value === type)
  return option?.label || type
}

const truncateMessage = (message: string, length: number) => {
  return message.length > length ? message.substring(0, length) + '...' : message
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Lifecycle
onMounted(() => {
  loadNotifications()
})
</script>

<style scoped>
.stats-card {
  flex: 1;
  min-width: 200px;
  max-width: 300px;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color);
}

.stats-icon {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-message {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unread-indicator {
  width: 8px;
  height: 8px;
  background: var(--orange-500);
  border-radius: 50%;
}

.notification-detail {
  line-height: 1.6;
}

.notification-content {
  background: var(--surface-50);
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid var(--primary-color);
}

.notification-data {
  background: var(--surface-100);
  padding: 1rem;
  border-radius: 8px;
}

/* Colores personalizados */
.bg-blue-100 {
  background-color: #dbeafe;
}
.text-blue-600 {
  color: #2563eb;
}
.bg-orange-100 {
  background-color: #fed7aa;
}
.text-orange-600 {
  color: #ea580c;
}
.bg-green-100 {
  background-color: #dcfce7;
}
.text-green-600 {
  color: #16a34a;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.75rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  padding: 0.75rem;
  background: var(--surface-50);
  font-weight: 600;
}
</style>
