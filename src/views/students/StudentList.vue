<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStudentStore } from '@/stores/students'
import { useSubscriptionStore } from '@/stores/subscriptions'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Tag from 'primevue/tag'
import Message from 'primevue/message'
import ConfirmDialog from 'primevue/confirmdialog'
import PlanLimitModal from '@/components/plans/PlanLimitModal.vue'

// Router
const router = useRouter()

// Store
const studentStore = useStudentStore()
const subscriptionStore = useSubscriptionStore()
const confirm = useConfirm()
const toast = useToast()

// Estado reactivo
const selectedStudents = ref([])
const filters = ref({
  search: '',
})
const showPlanLimitModal = ref(false)

// Computed properties
const students = computed(() => studentStore.students)
const isLoading = computed(() => studentStore.isLoading)
const error = computed(() => studentStore.error)

// Computed para filtros
const filteredStudents = computed(() => {
  let filtered = students.value

  // Filtro de búsqueda general
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(
      (student) =>
        (student.name && student.name.toLowerCase().includes(search)) ||
        (student.email && student.email.toLowerCase().includes(search)) ||
        (student.status && student.status.toLowerCase().includes(search)),
    )
  }

  return filtered
})

// Computed para filtros activos
const hasActiveFilters = computed(() => {
  return !!filters.value.search
})

const _activeFiltersCount = computed(() => {
  return filters.value.search ? 1 : 0
})

// Métodos
const loadStudents = async () => {
  try {
    await studentStore.fetchStudents()
  } catch (_err) {
    console.error('Error loading students:', err)
  }
}

const goToCreateStudent = async () => {
  // Verificar límites del plan antes de permitir crear estudiante
  await subscriptionStore.fetchUsage()

  if (!subscriptionStore.canAddStudent) {
    // Mostrar modal de advertencia
    showPlanLimitModal.value = true
    return
  }

  router.push('/students/create')
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

const clearFilters = () => {
  filters.value.search = ''
}

// Función para obtener el total de estudiantes filtrados
const getFilteredCount = () => {
  return filteredStudents.value.length
}

const getTotalCount = () => {
  return students.value.length
}

// Funciones para obtener labels y colores
const getStatusLabel = (status) => {
  const statusMap = {
    active: 'Activo',
    inactive: 'Inactivo',
    suspended: 'Suspendido',
    graduated: 'Graduado',
  }
  return statusMap[status] || status
}

const getStatusColor = (status) => {
  const colorMap = {
    active: 'success',
    inactive: 'secondary',
    suspended: 'warning',
    graduated: 'info',
  }
  return colorMap[status] || 'secondary'
}

// Acciones de estudiante
const viewStudent = (student) => {
  router.push(`/students/${student.id}`)
}

const editStudent = (student) => {
  router.push(`/students/${student.id}/edit`)
}

const deleteStudent = (student) => {
  confirm.require({
    message: `¿Estás seguro de que quieres eliminar al estudiante "${student.name}"? Esta acción no se puede deshacer.`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await studentStore.deleteStudent(student.id)
        await loadStudents() // Recargar la lista
        toast.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Estudiante eliminado correctamente',
        })
      } catch (_err) {
        console.error('Error deleting student:', err)
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar el estudiante',
        })
      }
    },
  })
}

// Lifecycle
onMounted(async () => {
  await loadStudents()
  // Cargar información de uso del plan
  try {
    await subscriptionStore.fetchUsage()
  } catch (_error) {
    console.error('Error loading subscription usage:', error)
  }
})
</script>

<template>
  <div class="grid">
    <!-- Header -->
    <div class="col-12">
      <div class="card">
        <div class="flex justify-content-between align-items-center">
          <div>
            <h1 class="text-3xl font-bold text-900 mb-2 mr-2">Mis Estudiantes</h1>
          </div>
          <Button icon="pi pi-plus" @click="goToCreateStudent" severity="success" rounded />
        </div>
        <div>
          <p class="text-600">Gestiona todos tus estudiantes y su progreso académico</p>
        </div>
      </div>
    </div>

    <!-- Filtros Simplificados -->
    <div class="col-12">
      <div class="card">
        <div class="flex justify-content-between align-items-center mb-3">
          <h5 class="text-900 font-semibold mb-0">Filtro</h5>
        </div>

        <div class="flex justify-content-end align-items-center gap-3 mt-4">
          <IconField iconPosition="left">
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText type="text" placeholder="Buscar" v-model="filters.search" />
          </IconField>
          <Button
            v-if="hasActiveFilters"
            label="Clear"
            icon="pi pi-filter-slash"
            class="p-button-outlined p-button-success"
            @click="clearFilters"
          />
          <div v-if="hasActiveFilters" class="flex align-items-center" style="gap: 1rem">
            <span class="text-600 text-sm font-medium">
              Mostrando {{ getFilteredCount() }} de {{ getTotalCount() }} estudiantes
            </span>
            <Tag
              v-if="getFilteredCount() !== getTotalCount()"
              :value="`${getTotalCount() - getFilteredCount()} ocultos`"
              severity="info"
              class="text-xs"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div class="col-12" v-if="error">
      <Message severity="error" :closable="false">{{ error }}</Message>
    </div>

    <!-- Tabla de Estudiantes -->
    <div class="col-12">
      <div class="card">
        <DataTable
          :value="filteredStudents"
          :loading="isLoading"
          :selection="selectedStudents"
          selectionMode="multiple"
          responsiveLayout="scroll"
          :paginator="true"
          :rows="10"
          :rowsPerPageOptions="[5, 10, 25, 50]"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} estudiantes"
          :emptyMessage="error ? 'Error al cargar estudiantes' : 'No se encontraron estudiantes'"
          class="p-datatable-sm"
        >
          <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

          <!-- Nombre -->
          <Column field="name" header="Nombre" sortable>
            <template #body="slotProps">
              <div class="font-medium text-900">{{ slotProps.data.name }}</div>
              <div class="text-600 text-sm">{{ slotProps.data.email }}</div>
            </template>
          </Column>

          <!-- ID Estudiante -->
          <Column field="id" header="ID" sortable>
            <template #body="slotProps">
              <div class="font-medium">{{ slotProps.data.id }}</div>
            </template>
          </Column>

          <!-- Grupos -->
          <Column field="groups" header="Grupos" sortable>
            <template #body="slotProps">
              <div class="flex flex-wrap gap-1">
                <Tag
                  v-for="group in slotProps.data.user_groups"
                  :key="group.id"
                  :value="group.name"
                  severity="info"
                  class="text-xs"
                />
                <span
                  v-if="!slotProps.data.user_groups || slotProps.data.user_groups.length === 0"
                  class="text-muted-color text-sm"
                >
                  Sin grupos
                </span>
              </div>
            </template>
          </Column>

          <!-- Estado -->
          <Column field="status" header="Estado" sortable>
            <template #body="slotProps">
              <Tag
                :value="getStatusLabel(slotProps.data.status)"
                :severity="getStatusColor(slotProps.data.status)"
                class="text-xs"
              />
            </template>
          </Column>

          <!-- Fecha de Registro -->
          <Column field="created_at" header="Registro" sortable>
            <template #body="slotProps">
              <div class="text-center">
                <div class="font-medium">{{ formatDate(slotProps.data.created_at) }}</div>
              </div>
            </template>
          </Column>

          <!-- Último Acceso -->
          <Column field="last_login" header="Último Acceso" sortable>
            <template #body="slotProps">
              <div class="text-center">
                <div class="font-medium">
                  {{ slotProps.data.last_login ? formatDate(slotProps.data.last_login) : 'Nunca' }}
                </div>
              </div>
            </template>
          </Column>

          <!-- Acciones -->
          <Column header="Acciones" style="min-width: 12rem">
            <template #body="slotProps">
              <div class="flex gap-2 justify-content-center">
                <Button
                  icon="pi pi-eye"
                  class="p-button-text p-button-sm"
                  @click="viewStudent(slotProps.data)"
                  v-tooltip.top="'Ver detalles'"
                />
                <Button
                  icon="pi pi-pencil"
                  class="p-button-text p-button-sm"
                  @click="editStudent(slotProps.data)"
                  v-tooltip.top="'Editar'"
                />
                <Button
                  icon="pi pi-trash"
                  class="p-button-text p-button-sm p-button-danger"
                  @click="deleteStudent(slotProps.data)"
                  v-tooltip.top="'Eliminar'"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Confirm Dialog -->
    <ConfirmDialog />

    <!-- Modal de límite de plan -->
    <PlanLimitModal
      v-model="showPlanLimitModal"
      title="Límite de Estudiantes Alcanzado"
      message="Has alcanzado el límite de estudiantes de tu plan actual"
      description="Tu plan actual solo permite agregar un número limitado de estudiantes. Actualiza tu plan para agregar más estudiantes."
      resource-type="estudiantes"
      :limit-info="
        subscriptionStore.usage && subscriptionStore.currentPlan
          ? {
              current: subscriptionStore.usage.current_usage?.students || 0,
              limit: subscriptionStore.currentPlan.max_students || 0,
            }
          : undefined
      "
    />
  </div>
</template>

<style scoped>
.card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transition: box-shadow 0.2s;
}

/* Estilos para la tabla */
:deep(.p-datatable) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.p-datatable .p-datatable-header) {
  background: var(--surface-card);
  border-bottom: 1px solid var(--surface-border);
  padding: 1rem 1.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-color);
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: var(--surface-ground);
  color: var(--text-color-secondary);
  font-weight: 600;
  padding: 1rem 1rem;
  border-color: var(--surface-border);
  text-align: left;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 1rem 1rem;
  border-color: var(--surface-border);
}

:deep(.p-datatable .p-datatable-tfoot > tr > td) {
  padding: 1rem 1rem;
  border-color: var(--surface-border);
}

:deep(.p-datatable .p-sortable-column .p-sortable-column-icon) {
  color: var(--text-color-secondary);
  font-size: 0.8rem;
}

:deep(.p-datatable .p-sortable-column:not(.p-highlight):hover) {
  background: var(--surface-hover);
}

:deep(.p-datatable .p-column-header-content) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Estilos para los tags */
:deep(.p-tag) {
  border-radius: 1rem;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Estilos para la paginación */
:deep(.p-paginator) {
  background: var(--surface-card);
  border-top: 1px solid var(--surface-border);
  border-radius: 0 0 8px 8px;
}

:deep(.p-paginator .p-paginator-page) {
  border-radius: 6px;
}

:deep(.p-paginator .p-paginator-page.p-highlight) {
  background: var(--primary-color);
  color: var(--primary-color-text);
}
</style>
