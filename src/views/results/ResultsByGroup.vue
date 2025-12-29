<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <div class="flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 mb-2">
              Resultados por Grupo
            </h1>
            <p class="text-muted-color">Análisis detallado del rendimiento por grupo</p>
          </div>
          <div class="flex gap-2">
            <Button
              label="Exportar Excel"
              icon="pi pi-file-excel"
              class="p-button-outlined p-button-success"
              @click="exportGroupResults('excel')"
              :loading="isExporting"
            />
            <Button
              label="Exportar PDF"
              icon="pi pi-file-pdf"
              class="p-button-outlined p-button-warning"
              @click="exportGroupResults('pdf')"
              :loading="isExporting"
            />
          </div>
        </div>

        <!-- Filtros -->
        <h3 class="text-lg font-semibold mb-3">Filtros</h3>
        <div class="grid grid-cols-12 gap-6 mb-8">
          <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">
              Grupo
            </label>
            <Select
              v-model="selectedGroup"
              :options="groups"
              option-label="name"
              option-value="id"
              placeholder="Seleccionar grupo"
              class="w-full"
              @change="
                (event) => {
                  console.log('Group selection changed:', event.value)
                  loadGroupResults()
                }
              "
            />
          </div>
          <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">
              Fecha Inicio
            </label>
            <DatePicker
              v-model="filters.startDate"
              placeholder="Seleccionar fecha"
              class="w-full"
              @date-select="loadGroupResults"
            />
          </div>
          <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">
              Fecha Fin
            </label>
            <DatePicker
              v-model="filters.endDate"
              placeholder="Seleccionar fecha"
              class="w-full"
              @date-select="loadGroupResults"
            />
          </div>
        </div>

        <!-- Estadísticas del Grupo Seleccionado -->
        <div v-if="selectedGroup && groupStats" class="grid grid-cols-12 gap-6 mb-8">
          <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="stats-card">
              <div class="stats-icon">
                <i class="pi pi-users text-blue-500"></i>
              </div>
              <div class="stats-content">
                <h3 class="text-2xl font-bold text-surface-900 dark:text-surface-0">
                  {{ groupStats.total_students }}
                </h3>
                <p class="text-muted-color">Estudiantes</p>
              </div>
            </div>
          </div>
          <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="stats-card">
              <div class="stats-icon">
                <i class="pi pi-file text-green-500"></i>
              </div>
              <div class="stats-content">
                <h3 class="text-2xl font-bold text-surface-900 dark:text-surface-0">
                  {{ groupStats.total_exams }}
                </h3>
                <p class="text-muted-color">Exámenes</p>
              </div>
            </div>
          </div>
          <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="stats-card">
              <div class="stats-icon">
                <i class="pi pi-chart-line text-orange-500"></i>
              </div>
              <div class="stats-content">
                <h3 class="text-2xl font-bold text-surface-900 dark:text-surface-0">
                  {{ groupStats.average_score }}%
                </h3>
                <p class="text-muted-color">Promedio</p>
              </div>
            </div>
          </div>
          <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="stats-card">
              <div class="stats-icon">
                <i class="pi pi-check-circle text-emerald-500"></i>
              </div>
              <div class="stats-content">
                <h3 class="text-2xl font-bold text-surface-900 dark:text-surface-0">
                  {{ groupStats.pass_rate }}%
                </h3>
                <p class="text-muted-color">Aprobación</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabla de Resultados por Grupo -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Resultados del Grupo</h3>
          <DataTable
            :value="groupResults"
            :paginator="true"
            :rows="10"
            :loading="isLoading"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} resultados"
            class="p-datatable-sm"
          >
            <Column field="student_name" header="Estudiante" sortable></Column>
            <Column field="exam_title" header="Examen" sortable></Column>
            <Column field="score" header="Calificación" sortable>
              <template #body="slotProps">
                <Tag
                  :value="slotProps.data.score + '%'"
                  :severity="getScoreSeverity(slotProps.data.score)"
                />
              </template>
            </Column>
            <Column field="attempts" header="Intentos" sortable></Column>
            <Column field="time_spent" header="Tiempo" sortable>
              <template #body="slotProps">
                {{ formatTime(slotProps.data.time_spent) }}
              </template>
            </Column>
            <Column field="completed_at" header="Completado" sortable>
              <template #body="slotProps">
                {{ formatDate(slotProps.data.completed_at) }}
              </template>
            </Column>
            <Column header="Acciones">
              <template #body="slotProps">
                <Button
                  icon="pi pi-eye"
                  class="p-button-text p-button-sm"
                  @click="viewStudentDetails(slotProps.data)"
                  v-tooltip.top="'Ver detalles del estudiante'"
                />
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import api from '@/services/api'
import type { Group } from '@/types'

// Components
import Button from 'primevue/button'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'

// Toast
const toast = useToast()

// State
const isLoading = ref(false)
const isExporting = ref(false)
const groups = ref<Group[]>([])
const selectedGroup = ref<number | null>(null)
const groupResults = ref<any[]>([])
const groupStats = ref<any>({
  total_students: 0,
  total_exams: 0,
  total_attempts: 0,
  average_score: 0,
  pass_rate: 0,
})

// Filters
const filters = ref({
  startDate: null,
  endDate: null,
})

// Methods
const loadGroups = async () => {
  try {
    const response = await api.get('/groups')
    groups.value = response.data.data || response.data // Handle both paginated and non-paginated responses
    console.log('Groups loaded:', groups.value)
  } catch (error) {
    console.error('Error loading groups:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los grupos',
    })
  }
}

const loadGroupResults = async () => {
  if (!selectedGroup.value) {
    console.log('No group selected, skipping loadGroupResults')
    return
  }

  console.log('Loading results for group:', selectedGroup.value)

  try {
    isLoading.value = true

    const params = new URLSearchParams()
    if (filters.value.startDate) params.append('start_date', filters.value.startDate)
    if (filters.value.endDate) params.append('end_date', filters.value.endDate)

    const url = `/results/groups/${selectedGroup.value}?${params.toString()}`
    console.log('Making request to:', url)

    const response = await api.get(url)
    console.log('API Response:', response)

    if (response.success) {
      const data = response.data

      console.log('Group results data:', data)

      // Update groupStats object properties individually for reactivity
      groupStats.value.total_students = data.statistics.total_students
      groupStats.value.total_exams = data.statistics.total_exams
      groupStats.value.total_attempts = data.statistics.total_attempts
      groupStats.value.average_score = data.statistics.average_score
      groupStats.value.pass_rate = data.statistics.pass_rate

      groupResults.value = data.results
      console.log('Group results loaded:', groupResults.value)
      console.log('Group stats updated:', groupStats.value)
    } else {
      console.error('API returned success: false', response)
    }
  } catch (error) {
    console.error('Error loading group results:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los resultados del grupo',
    })
  } finally {
    isLoading.value = false
  }
}

const exportGroupResults = async (type: 'pdf' | 'excel') => {
  try {
    isExporting.value = true
    // TODO: Implement export functionality
    console.log('Exporting group results as:', type)
  } catch (error) {
    console.error('Error exporting group results:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo exportar los resultados del grupo',
    })
  } finally {
    isExporting.value = false
  }
}

const getScoreSeverity = (score: number) => {
  if (score >= 80) return 'success'
  if (score >= 60) return 'warning'
  return 'danger'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

const viewStudentDetails = (result: any) => {
  // TODO: Implement student details view
  console.log('Viewing student details:', result)
}

// Lifecycle
onMounted(async () => {
  await loadGroups()
})
</script>

<style scoped>
@import "tailwindcss";

.stats-card {
  @apply bg-white dark:bg-surface-800 p-4 rounded-lg border border-surface-200 dark:border-surface-700;
  @apply flex items-center gap-4;
}

.stats-icon {
  @apply w-12 h-12 rounded-full flex items-center justify-center;
  @apply bg-blue-50 dark:bg-blue-900/20;
}

.stats-content h3 {
  @apply text-2xl font-bold text-surface-900 dark:text-surface-0 mb-1;
}

.stats-content p {
  @apply text-sm text-muted-color;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  @apply py-2;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  @apply py-3 bg-surface-50 dark:bg-surface-700;
}
</style>
