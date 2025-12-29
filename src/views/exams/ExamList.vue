<!--
  Lista de Exámenes
  
  RESTRICCIONES DE ACCESO:
  - Requiere autenticación: Sí
  - Roles permitidos: 'teacher', 'admin'
  - Permisos requeridos: Ninguno específico (solo rol)
  
  RUTA: /exams
  META: { requiresAuth: true, requiresRole: ['teacher', 'admin'] }
  
  DESCRIPCIÓN:
  Vista que muestra todos los exámenes creados por el profesor.
  Permite:
  - Ver lista de exámenes
  - Crear nuevos exámenes
  - Editar exámenes existentes
  - Eliminar exámenes
  - Filtrar y buscar exámenes
  
  NOTAS:
  - Los estudiantes ven sus exámenes disponibles en /student/exams
  - Los profesores solo ven sus propios exámenes
  - Los admins pueden ver todos los exámenes
-->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useExamStore } from '@/stores/exams'
import { useSubscriptionStore } from '@/stores/subscriptions'
import { useRoleGuard } from '@/composables/useRoleGuard'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import type { Exam } from '@/types'

// Components
import ConfirmDialog from 'primevue/confirmdialog'
import PlanLimitModal from '@/components/plans/PlanLimitModal.vue'

// Router
const router = useRouter()

// Store
const examStore = useExamStore()
const subscriptionStore = useSubscriptionStore()
const { requireRole } = useRoleGuard()
const confirm = useConfirm()
const toast = useToast()

// Estado local del componente
const selectedExams = ref([])
const filters = ref({
  search: '',
})
const showPlanLimitModal = ref(false)

// Computed
const filteredExams = computed(() => {
  let filtered = examStore.exams

  // Filtro de búsqueda general (busca en todos los campos)
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(
      (exam) =>
        (exam.title && exam.title.toLowerCase().includes(search)) ||
        (exam.description && exam.description.toLowerCase().includes(search)) ||
        (exam.duration && exam.duration.toString().includes(search)) ||
        (exam.max_attempts && exam.max_attempts.toString().includes(search)),
    )
  }

  return filtered
})

// Computed para filtros activos
const hasActiveFilters = computed(() => {
  return !!filters.value.search
})

const activeFiltersCount = computed(() => {
  return filters.value.search ? 1 : 0
})

// Métodos
const loadExams = async () => {
  try {
    await examStore.fetchExams()
  } catch (err) {
    console.error('Error loading exams:', err)
    // El store maneja el error internamente
  }
}

const goToCreateExam = async () => {
  // Verificar límites del plan antes de permitir crear examen
  await subscriptionStore.fetchUsage()

  if (!subscriptionStore.canCreateExam) {
    // Mostrar modal de advertencia
    showPlanLimitModal.value = true
    return
  }

  router.push('/exams/create')
}

const viewExam = (exam) => {
  router.push(`/exams/${exam.id}`)
}

const editExam = (exam) => {
  router.push(`/exams/${exam.id}/edit`)
}

const deleteExam = (exam: Exam) => {
  confirm.require({
    message: `¿Estás seguro de que quieres eliminar el examen "${exam.title}"? Esta acción no se puede deshacer.`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await examStore.deleteExam(exam.id)
        toast.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Examen eliminado correctamente',
        })
      } catch (err) {
        console.error('Error deleting exam:', err)
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar el examen',
        })
      }
    },
  })
}

// Helper functions
const getStatusColor = (status: string) => {
  switch (status) {
    case 'published':
      return 'success'
    case 'draft':
      return 'warning'
    case 'closed':
      return 'danger'
    case 'archived':
      return 'secondary'
    default:
      return 'secondary'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'published':
      return 'Publicado'
    case 'draft':
      return 'Borrador'
    case 'closed':
      return 'Cerrado'
    case 'archived':
      return 'Archivado'
    default:
      return status
  }
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'quiz':
      return 'Quiz'
    case 'exam':
      return 'Examen'
    case 'assignment':
      return 'Tarea'
    default:
      return type
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Función para obtener el estado del examen
const getExamStatus = (exam: Exam | any) => {
  const now = new Date()

  // Si el examen no está activo, no está disponible
  if (exam.is_active === false) {
    return {
      label: 'Inactivo',
      severity: 'secondary',
      icon: 'pi pi-ban',
    }
  }

  // Si no hay fechas definidas, asumir disponible
  if (!exam.start_date && !exam.end_date) {
    return {
      label: 'Disponible',
      severity: 'success',
      icon: 'pi pi-check-circle',
    }
  }

  // Verificar si expiró
  if (exam.end_date) {
    const endDate = new Date(exam.end_date)
    if (endDate < now) {
      return {
        label: 'Expirado',
        severity: 'danger',
        icon: 'pi pi-clock',
      }
    }
  }

  // Verificar si aún no está disponible
  if (exam.start_date) {
    const startDate = new Date(exam.start_date)
    if (startDate > now) {
      return {
        label: 'Próximamente',
        severity: 'info',
        icon: 'pi pi-calendar',
      }
    }
  }

  // Si está dentro del rango de fechas, está disponible
  return {
    label: 'Disponible',
    severity: 'success',
    icon: 'pi pi-check-circle',
  }
}

const clearFilters = () => {
  // Limpiar búsqueda general
  filters.value.search = ''
}

// Función para obtener el total de exámenes filtrados
const getFilteredCount = () => {
  return filteredExams.value.length
}

// Función para obtener el total de exámenes
const getTotalCount = () => {
  return examStore.exams.length
}

/**
 * Guard de seguridad: Verifica que el usuario tenga rol de profesor o admin
 * Si no tiene el rol requerido, redirige automáticamente y muestra mensaje de error
 *
 * @see useRoleGuard para más detalles sobre la validación
 */
onMounted(async () => {
  // Verificar que el usuario tenga rol de profesor o admin
  if (
    !requireRole(['teacher', 'admin'], {
      customMessage: 'Solo los profesores pueden gestionar exámenes',
    })
  ) {
    return // Ya redirigió y mostró mensaje de error
  }

  await loadExams()
  // Cargar información de uso del plan
  try {
    await subscriptionStore.fetchUsage()
  } catch (error) {
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
            <h1 class="text-3xl font-bold text-900 mb-2 mr-2">Mis Exámenes</h1>
          </div>
          <Button icon="pi pi-plus" @click="goToCreateExam" severity="success" rounded />
        </div>
        <div>
          <p class="text-600">Gestiona todos tus exámenes y evaluaciones</p>
        </div>
      </div>
    </div>

    <!-- Filtros Simplificados -->
    <div class="col-12">
      <div class="card">
        <div class="flex justify-content-between align-items-center mb-3">
          <h5 class="text-900 font-semibold mb-0">Filtering</h5>
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
              Mostrando {{ getFilteredCount() }} de {{ getTotalCount() }} exámenes
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

    <!-- Tabla de Exámenes -->
    <div class="col-12">
      <div class="card">
        <DataTable
          :value="filteredExams"
          :loading="examStore.isLoading"
          :selection="selectedExams"
          selectionMode="multiple"
          responsiveLayout="scroll"
          :paginator="true"
          :rows="10"
          :rowsPerPageOptions="[5, 10, 25, 50]"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} exámenes"
          :emptyMessage="
            examStore.error ? 'Error al cargar exámenes' : 'No se encontraron exámenes'
          "
          class="p-datatable-sm"
        >
          <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

          <!-- Título -->
          <Column field="title" header="Título" sortable>
            <template #body="slotProps">
              <div class="font-medium text-900">{{ slotProps.data.title }}</div>
              <div class="text-600 text-sm">{{ slotProps.data.description }}</div>
            </template>
          </Column>

          <!-- Preguntas Mezcladas -->
          <Column field="shuffle_questions" header="Preguntas" sortable>
            <template #body="slotProps">
              <Tag
                :value="slotProps.data.shuffle_questions ? 'Mezcladas' : 'Ordenadas'"
                :severity="slotProps.data.shuffle_questions ? 'info' : 'secondary'"
                class="text-xs"
              />
            </template>
          </Column>

          <!-- Opciones Mezcladas -->
          <Column field="shuffle_options" header="Opciones" sortable>
            <template #body="slotProps">
              <Tag
                :value="slotProps.data.shuffle_options ? 'Mezcladas' : 'Ordenadas'"
                :severity="slotProps.data.shuffle_options ? 'info' : 'secondary'"
                class="text-xs"
              />
            </template>
          </Column>

          <!-- Duración -->
          <Column field="duration" header="Duración" sortable>
            <template #body="slotProps">
              <div class="text-center">
                <div class="font-medium">{{ slotProps.data.duration || 'Sin límite' }}</div>
                <div class="text-600 text-xs">min</div>
              </div>
            </template>
          </Column>

          <!-- Intentos -->
          <Column field="max_attempts" header="Intentos" sortable>
            <template #body="slotProps">
              <div class="text-center">
                <div class="font-medium">{{ slotProps.data.max_attempts }}</div>
                <div class="text-600 text-xs">máx</div>
              </div>
            </template>
          </Column>

          <!-- Fecha -->
          <Column field="created_at" header="Creado" sortable>
            <template #body="slotProps">
              <div class="text-center">
                <div class="font-medium">{{ formatDate(slotProps.data.created_at) }}</div>
              </div>
            </template>
          </Column>

          <!-- Estatus -->
          <Column field="status" header="Estatus" sortable>
            <template #body="slotProps">
              <Tag
                :value="getExamStatus(slotProps.data).label"
                :severity="getExamStatus(slotProps.data).severity"
                :icon="getExamStatus(slotProps.data).icon"
                class="text-xs"
              />
            </template>
          </Column>

          <!-- Acciones -->
          <Column header="Acciones" style="min-width: 12rem">
            <template #body="slotProps">
              <div class="flex gap-2 justify-content-center">
                <Button
                  icon="pi pi-eye"
                  class="p-button-text p-button-sm"
                  @click="viewExam(slotProps.data)"
                  v-tooltip.top="'Ver detalles'"
                />
                <Button
                  icon="pi pi-pencil"
                  class="p-button-text p-button-sm"
                  @click="editExam(slotProps.data)"
                  v-tooltip.top="'Editar'"
                />
                <Button
                  icon="pi pi-trash"
                  class="p-button-text p-button-sm p-button-danger"
                  @click="deleteExam(slotProps.data)"
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
      title="Límite de Exámenes Alcanzado"
      message="Has alcanzado el límite de exámenes de tu plan actual"
      description="Tu plan actual solo permite crear un número limitado de exámenes. Actualiza tu plan para crear más exámenes."
      resource-type="exámenes"
      :limit-info="
        subscriptionStore.usage && subscriptionStore.currentPlan
          ? {
              current: subscriptionStore.usage.current_usage?.exams || 0,
              limit: subscriptionStore.currentPlan.max_exams || 0,
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

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  opacity: 0.8;
}

/* Estilos para la tabla */
:deep(.p-datatable) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.p-datatable-header) {
  background: var(--surface-50);
  border-bottom: 1px solid var(--surface-border);
}

:deep(.p-datatable-thead > tr > th) {
  background: var(--surface-50);
  border-bottom: 1px solid var(--surface-border);
  font-weight: 600;
  color: var(--text-color);
}

:deep(.p-datatable-tbody > tr) {
  border-bottom: 1px solid var(--surface-border);
}

:deep(.p-datatable-tbody > tr:hover) {
  background: var(--surface-50);
}

/* Estilos para los filtros */
:deep(.p-inputtext) {
  border-radius: 6px;
}

:deep(.p-dropdown) {
  border-radius: 6px;
}

:deep(.p-calendar) {
  border-radius: 6px;
}

/* Estilos para los tags */
:deep(.p-tag) {
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
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
