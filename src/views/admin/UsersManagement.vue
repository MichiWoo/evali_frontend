<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <!-- Header -->
        <div class="flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="text-3xl font-bold text-900 mb-2">Gestión de Usuarios</h1>
            <p class="text-600 m-0">Administra todos los usuarios del sistema</p>
          </div>
          <div class="flex gap-2">
            <Button
              icon="pi pi-download"
              severity="secondary"
              rounded
              @click="exportUsers"
              :loading="isExporting"
            />
            <Button icon="pi pi-plus" severity="success" rounded @click="goToCreateUser" />
          </div>
        </div>

        <!-- Statistics Cards -->
        <div class="flex flex-wrap gap-4 justify-content-center mb-4">
          <!-- Tarjeta 1: Total de Usuarios -->
          <div class="stats-card-horizontal">
            <div class="flex align-items-center gap-3 p-4">
              <div class="stats-icon bg-blue-100 text-blue-600 border-round">
                <i class="pi pi-users text-xl"></i>
              </div>
              <div class="flex flex-column">
                <div class="text-2xl font-bold text-900">{{ pagination.total }}</div>
                <div class="text-600 font-medium text-sm">Total Usuarios</div>
              </div>
            </div>
          </div>

          <!-- Tarjeta 2: Usuarios Activos -->
          <div class="stats-card-horizontal">
            <div class="flex align-items-center gap-3 p-4">
              <div class="stats-icon bg-green-100 text-green-600 border-round">
                <i class="pi pi-check-circle text-xl"></i>
              </div>
              <div class="flex flex-column">
                <div class="text-2xl font-bold text-900">{{ activeUsersCount }}</div>
                <div class="text-600 font-medium text-sm">Usuarios Activos</div>
              </div>
            </div>
          </div>

          <!-- Tarjeta 3: Usuarios Pendientes -->
          <div class="stats-card-horizontal">
            <div class="flex align-items-center gap-3 p-4">
              <div class="stats-icon bg-yellow-100 text-yellow-600 border-round">
                <i class="pi pi-clock text-xl"></i>
              </div>
              <div class="flex flex-column">
                <div class="text-2xl font-bold text-900">{{ inactiveUsersCount }}</div>
                <div class="text-600 font-medium text-sm">Pendientes</div>
              </div>
            </div>
          </div>

          <!-- Tarjeta 4: Administradores -->
          <div class="stats-card-horizontal">
            <div class="flex align-items-center gap-3 p-4">
              <div class="stats-icon bg-purple-100 text-purple-600 border-round">
                <i class="pi pi-shield text-xl"></i>
              </div>
              <div class="flex flex-column">
                <div class="text-2xl font-bold text-900">{{ adminUsersCount }}</div>
                <div class="text-600 font-medium text-sm">Administradores</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters and Search -->
        <div class="card mb-4">
          <div class="flex flex-column md:flex-row gap-3">
            <div class="flex-1">
              <div class="p-input-icon-left">
                <i class="pi pi-search"></i>
                <InputText
                  v-model="filters.search"
                  placeholder="Buscar usuarios..."
                  class="w-full"
                  @input="debouncedSearch"
                />
              </div>
            </div>
            <div class="flex gap-2">
              <Select
                v-model="filters.role"
                :options="roleOptions"
                placeholder="Rol"
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

        <!-- Bulk Actions -->
        <div v-if="selectedUsers.length > 0" class="card mb-4">
          <div class="flex align-items-center gap-3">
            <span class="text-600">{{ selectedUsers.length }} usuarios seleccionados</span>
            <Button
              label="Asignar Rol"
              icon="pi pi-user-plus"
              severity="secondary"
              outlined
              @click="showBulkRoleDialog = true"
            />
            <Button
              label="Cambiar Estado"
              icon="pi pi-cog"
              severity="secondary"
              outlined
              @click="showBulkStatusDialog = true"
            />
            <Button
              label="Eliminar"
              icon="pi pi-trash"
              severity="danger"
              outlined
              @click="confirmBulkDelete"
            />
          </div>
        </div>

        <!-- Users Table -->
        <div class="card">
          <DataTable
            v-model:selection="selectedUsers"
            :value="safeUsers"
            :loading="isLoading"
            :paginator="true"
            :rows="pagination.per_page"
            :totalRecords="pagination.total"
            :lazy="true"
            @page="onPageChange"
            @sort="onSort"
            sortField="created_at"
            :sortOrder="-1"
            selectionMode="multiple"
            dataKey="id"
            class="p-datatable-sm"
            :rowsPerPageOptions="[10, 25, 50, 100]"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
          >
            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

            <Column field="name" header="Usuario" sortable>
              <template #body="{ data }">
                <div class="flex align-items-center gap-2">
                  <Avatar
                    :image="data.avatar"
                    :label="data.name.charAt(0).toUpperCase()"
                    shape="circle"
                    size="large"
                  />
                  <div>
                    <div class="font-semibold">{{ data.name }}</div>
                    <div class="text-sm text-600">{{ data.email }}</div>
                  </div>
                </div>
              </template>
            </Column>

            <Column field="roles" header="Roles" sortable>
              <template #body="{ data }">
                <div class="flex gap-1">
                  <Tag
                    v-for="role in data.roles"
                    :key="role.id"
                    :value="role.meta.display_name"
                    :severity="getRoleSeverity(role.name)"
                  />
                </div>
              </template>
            </Column>

            <Column field="email_verified_at" header="Estado" sortable>
              <template #body="{ data }">
                <Tag
                  :value="data.email_verified_at ? 'Verificado' : 'Pendiente'"
                  :severity="data.email_verified_at ? 'success' : 'warning'"
                />
              </template>
            </Column>

            <Column field="created_at" header="Registro" sortable>
              <template #body="{ data }">
                <div class="text-sm">
                  {{ formatDate(data.created_at) }}
                </div>
              </template>
            </Column>

            <Column field="last_login" header="Último Acceso" sortable>
              <template #body="{ data }">
                <div class="text-sm">
                  {{ data.last_login ? formatDate(data.last_login) : 'Nunca' }}
                </div>
              </template>
            </Column>

            <Column header="Acciones" headerStyle="width: 8rem">
              <template #body="{ data }">
                <div class="flex gap-1">
                  <Button
                    icon="pi pi-eye"
                    severity="secondary"
                    size="small"
                    outlined
                    @click="viewUser(data)"
                    v-tooltip.top="'Ver detalles'"
                  />
                  <Button
                    icon="pi pi-pencil"
                    severity="secondary"
                    size="small"
                    outlined
                    @click="editUser(data)"
                    v-tooltip.top="'Editar'"
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

    <!-- Bulk Role Assignment Dialog -->
    <Dialog
      v-model:visible="showBulkRoleDialog"
      header="Asignar Rol"
      :modal="true"
      :style="{ width: '400px' }"
    >
      <div class="flex flex-column gap-3">
        <label for="bulk-role">Seleccionar Rol:</label>
        <Select
          id="bulk-role"
          v-model="bulkRoleId"
          :options="roleOptions"
          option-label="label"
          option-value="value"
          placeholder="Seleccionar rol"
        />
      </div>
      <template #footer>
        <Button
          label="Cancelar"
          severity="secondary"
          outlined
          @click="showBulkRoleDialog = false"
        />
        <Button label="Asignar" @click="assignBulkRole" :loading="isLoading" />
      </template>
    </Dialog>

    <!-- Bulk Status Change Dialog -->
    <Dialog
      v-model:visible="showBulkStatusDialog"
      header="Cambiar Estado"
      :modal="true"
      :style="{ width: '400px' }"
    >
      <div class="flex flex-column gap-3">
        <label for="bulk-status">Seleccionar Estado:</label>
        <Dropdown
          id="bulk-status"
          v-model="bulkStatus"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          placeholder="Seleccionar estado"
        />
      </div>
      <template #footer>
        <Button
          label="Cancelar"
          severity="secondary"
          outlined
          @click="showBulkStatusDialog = false"
        />
        <Button label="Cambiar" @click="changeBulkStatus" :loading="isLoading" />
      </template>
    </Dialog>

    <!-- Export Users Modal -->
    <ExportUsersModal
      v-model:visible="showExportDialog"
      :is-exporting="isExporting"
      :current-filters="filters"
      @export="handleExport"
    />

    <!-- Confirmation Dialog -->
    <ConfirmDialog />
  </div>
</template>

<!--
  Gestión de Usuarios (Admin)

  RESTRICCIONES DE ACCESO:
  - Requiere autenticación: Sí
  - Roles permitidos: 'admin' únicamente
  - Permisos requeridos: Ninguno específico (solo rol admin)

  RUTA: /admin/users
  META: { requiresAuth: true, requiresRole: ['admin'] }

  DESCRIPCIÓN:
  Vista administrativa para gestionar todos los usuarios del sistema.
  Permite:
  - Ver lista completa de usuarios
  - Crear nuevos usuarios
  - Editar usuarios existentes
  - Eliminar usuarios
  - Filtrar y buscar usuarios
  - Asignar roles masivamente

  NOTAS:
  - Solo administradores pueden acceder
  - Los profesores no tienen acceso a esta vista
  - Los estudiantes no pueden gestionar usuarios
-->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import { useRoleGuard } from '@/composables/useRoleGuard'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
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

// Components
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import Avatar from 'primevue/avatar'
import ConfirmDialog from 'primevue/confirmdialog'
import ExportUsersModal from '@/components/users/ExportUsersModal.vue'

// Router and stores
const router = useRouter()
const userStore = useUserStore()
const _authStore = useAuthStore()
const { requireRole } = useRoleGuard()
const confirm = useConfirm()
const toast = useToast()

// State
const selectedUsers = ref([])
const showBulkRoleDialog = ref(false)
const showBulkStatusDialog = ref(false)
const showExportDialog = ref(false)
const bulkRoleId = ref(null)
const bulkStatus = ref(null)
const isExporting = ref(false)

// Filters
const filters = ref({
  search: '',
  role: null,
  status: null,
})

// Options
const roleOptions = ref([
  { label: 'Administrador', value: 'admin' },
  { label: 'Profesor', value: 'teacher' },
  { label: 'Estudiante', value: 'student' },
])

const statusOptions = ref([
  { label: 'Verificado', value: 'verified' },
  { label: 'Pendiente', value: 'pending' },
])

// Computed
const users = computed(() => userStore.users)
const isLoading = computed(() => userStore.isLoading)
const pagination = computed(() => userStore.pagination)

// Ensure users is always an array
const safeUsers = computed(() => users.value || [])

const activeUsersCount = computed(
  () => safeUsers.value.filter((user) => user.email_verified_at !== null).length,
)

const inactiveUsersCount = computed(
  () => safeUsers.value.filter((user) => user.email_verified_at === null).length,
)

const adminUsersCount = computed(
  () => safeUsers.value.filter((user) => user.roles?.some((role) => role.name === 'admin')).length,
)

// Methods
const loadUsers = async () => {
  try {
    await userStore.fetchUsers({
      page: pagination.value.current_page,
      per_page: pagination.value.per_page,
      search: filters.value.search,
      role: filters.value.role,
      status: filters.value.status,
    })
  } catch (_error) {
    console.error('Error loading users:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los usuarios',
      life: 3000,
    })
  }
}

const debouncedSearch = debounce(() => {
  applyFilters()
}, 500)

const applyFilters = () => {
  userStore.pagination.current_page = 1
  loadUsers()
}

const clearFilters = () => {
  filters.value = {
    search: '',
    role: null,
    status: null,
  }
  applyFilters()
}

const onPageChange = (event: any) => {
  userStore.pagination.current_page = event.page + 1
  userStore.pagination.per_page = event.rows
  loadUsers()
}

const onSort = (_event: any) => {
  // Handle sorting
  loadUsers()
}

const goToCreateUser = () => {
  router.push('/admin/users/create')
}

const viewUser = (user: any) => {
  router.push(`/admin/users/${user.id}`)
}

const editUser = (user: any) => {
  router.push(`/admin/users/${user.id}/edit`)
}

const confirmDelete = (user: any) => {
  confirm.require({
    message: `¿Estás seguro de que quieres eliminar al usuario "${user.name}"?`,
    header: 'Confirmar Eliminación',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancelar',
    acceptLabel: 'Eliminar',
    accept: () => deleteUser(user),
  })
}

const deleteUser = async (user: any) => {
  try {
    await userStore.deleteUser(user.id)
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Usuario eliminado correctamente',
      life: 3000,
    })
    loadUsers()
  } catch (_error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo eliminar el usuario',
      life: 3000,
    })
  }
}

const confirmBulkDelete = () => {
  confirm.require({
    message: `¿Estás seguro de que quieres eliminar ${selectedUsers.value.length} usuarios?`,
    header: 'Confirmar Eliminación Masiva',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancelar',
    acceptLabel: 'Eliminar',
    accept: () => bulkDeleteUsers(),
  })
}

const bulkDeleteUsers = async () => {
  try {
    const userIds = selectedUsers.value.map((user: any) => user.id)
    await userStore.bulkDeleteUsers(userIds)
    selectedUsers.value = []
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Usuarios eliminados correctamente',
      life: 3000,
    })
    loadUsers()
  } catch (_error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron eliminar los usuarios',
      life: 3000,
    })
  }
}

const assignBulkRole = async () => {
  if (!bulkRoleId.value) return

  try {
    const userIds = selectedUsers.value.map((user: any) => user.id)
    await userStore.bulkUpdateUsers(userIds, { role_ids: [bulkRoleId.value] })
    selectedUsers.value = []
    showBulkRoleDialog.value = false
    bulkRoleId.value = null
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Rol asignado correctamente',
      life: 3000,
    })
    loadUsers()
  } catch (_error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo asignar el rol',
      life: 3000,
    })
  }
}

const changeBulkStatus = async () => {
  if (!bulkStatus.value) return

  try {
    const userIds = selectedUsers.value.map((user: any) => user.id)
    await userStore.bulkUpdateUsers(userIds, { status: bulkStatus.value })
    selectedUsers.value = []
    showBulkStatusDialog.value = false
    bulkStatus.value = null
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Estado actualizado correctamente',
      life: 3000,
    })
    loadUsers()
  } catch (_error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo actualizar el estado',
      life: 3000,
    })
  }
}

const exportUsers = () => {
  showExportDialog.value = true
}

const handleExport = async (exportFilters: any) => {
  try {
    isExporting.value = true

    await userStore.exportUsers(exportFilters)

    // Cerrar modal solo después de éxito
    showExportDialog.value = false

    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Usuarios exportados correctamente',
      life: 3000,
    })
  } catch (_error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo exportar los usuarios',
      life: 3000,
    })
  } finally {
    isExporting.value = false
  }
}

const getRoleSeverity = (roleName: string) => {
  switch (roleName) {
    case 'admin':
      return 'danger'
    case 'teacher':
      return 'info'
    case 'student':
      return 'success'
    default:
      return 'secondary'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Guard de seguridad: Verifica que el usuario sea administrador
 * Si no es admin, redirige automáticamente y muestra mensaje de error
 *
 * @see useRoleGuard para más detalles sobre la validación
 */
onMounted(() => {
  // Verificar que el usuario tenga rol de admin
  if (
    !requireRole('admin', {
      customMessage: 'Solo los administradores pueden gestionar usuarios',
    })
  ) {
    return // Ya redirigió y mostró mensaje de error
  }

  loadUsers()
})
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  margin-top: 0.25rem;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.75rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  padding: 0.75rem;
  background: var(--surface-50);
  font-weight: 600;
}

/* Estilos para las tarjetas horizontales */
.stats-card-horizontal {
  flex: 1;
  min-width: 200px;
  max-width: 300px;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.stats-card-horizontal:hover {
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

/* Colores personalizados */
.bg-blue-100 {
  background-color: #dbeafe;
}

.text-blue-600 {
  color: #2563eb;
}

.bg-green-100 {
  background-color: #dcfce7;
}

.text-green-600 {
  color: #16a34a;
}

.bg-yellow-100 {
  background-color: #fef3c7;
}

.text-yellow-600 {
  color: #d97706;
}

.bg-purple-100 {
  background-color: #f3e8ff;
}

.text-purple-600 {
  color: #9333ea;
}
</style>
