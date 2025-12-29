<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <div class="flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 mb-2">
              Resultados por Examen
            </h1>
            <p class="text-muted-color">Análisis detallado del rendimiento por examen</p>
          </div>
          <div class="flex gap-2 ml-2">
            <Button
              label="Exportar Excel"
              icon="pi pi-file-excel"
              class="p-button-outlined p-button-success"
              @click="exportExamResults('excel')"
              severity="success"
              :loading="isExporting"
            />
            <Button
              label="Exportar PDF"
              icon="pi pi-file-pdf"
              class="p-button-outlined p-button-warning"
              @click="exportExamResults('pdf')"
              severity="warning"
              :loading="isExporting"
            />
          </div>
        </div>

        <!-- Filtros -->
        <div class="card mb-4">
          <h3 class="text-lg font-semibold mb-3">Filtros</h3>
          <div class="grid grid-cols-12 gap-6 mb-8">
            <div class="col-span-12 lg:col-span-6 xl:col-span-3">
              <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">
                Examen
              </label>
              <Select
                v-model="selectedExam"
                :options="exams"
                option-label="title"
                option-value="id"
                placeholder="Seleccionar examen"
                class="w-full"
                @change="
                  (event) => {
                    console.log('Exam selection changed:', event.value)
                    loadExamResults()
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
                @date-select="loadExamResults"
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
                @date-select="loadExamResults"
              />
            </div>
          </div>
        </div>

        <!-- Estadísticas del Examen Seleccionado -->
        <div v-if="selectedExam && examStats" class="grid grid-cols-12 gap-6 mb-8">
          <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="stats-card">
              <div class="stats-icon">
                <i class="pi pi-users text-blue-500"></i>
              </div>
              <div class="stats-content">
                <h3 class="text-2xl font-bold text-surface-900 dark:text-surface-0">
                  {{ examStats.total_attempts }}
                </h3>
                <p class="text-muted-color">Intentos</p>
              </div>
            </div>
          </div>
          <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="stats-card">
              <div class="stats-icon">
                <i class="pi pi-user text-green-500"></i>
              </div>
              <div class="stats-content">
                <h3 class="text-2xl font-bold text-surface-900 dark:text-surface-0">
                  {{ examStats.unique_students }}
                </h3>
                <p class="text-muted-color">Estudiantes</p>
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
                  {{ examStats.average_score }}%
                </h3>
                <p class="text-muted-color">Promedio</p>
              </div>
            </div>
          </div>
          <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="stats-card">
              <div class="stats-icon">
                <i class="pi pi-clock text-purple-500"></i>
              </div>
              <div class="stats-content">
                <h3 class="text-2xl font-bold text-surface-900 dark:text-surface-0">
                  {{ examStats.average_time }}
                </h3>
                <p class="text-muted-color">Tiempo Promedio</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabla de Resultados por Examen -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Resultados del Examen</h3>
          <DataTable
            :value="examResults"
            :paginator="true"
            :rows="10"
            :loading="isLoading"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} resultados"
            class="p-datatable-sm"
          >
            <Column field="student_name" header="Estudiante" sortable></Column>
            <Column field="group_name" header="Grupo" sortable></Column>
            <Column field="score" header="Calificación" sortable>
              <template #body="slotProps">
                <Tag
                  :value="slotProps.data.score + '%'"
                  :severity="getScoreSeverity(slotProps.data.score)"
                />
              </template>
            </Column>
            <Column field="attempt_number" header="Intento" sortable></Column>
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
                  @click="viewExamAttempt(slotProps.data)"
                  v-tooltip.top="'Ver intento del examen'"
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
import type { Exam } from '@/types'

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
const exams = ref<Exam[]>([])
const selectedExam = ref<number | null>(null)
const examResults = ref<any[]>([])
const examStats = ref<any>({
  total_attempts: 0,
  unique_students: 0,
  average_score: 0,
  average_time: 0,
})

// Filters
const filters = ref({
  startDate: null,
  endDate: null,
})

// Methods
const loadExams = async () => {
  try {
    const response = await api.get('/exams')
    exams.value = response.data.data || response.data // Handle both paginated and non-paginated responses
    console.log('Exams loaded:', exams.value)
  } catch (error) {
    console.error('Error loading exams:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los exámenes',
    })
  }
}

const loadExamResults = async () => {
  if (!selectedExam.value) {
    console.log('No exam selected, skipping loadExamResults')
    return
  }

  console.log('Loading results for exam:', selectedExam.value)

  try {
    isLoading.value = true

    const params = new URLSearchParams()
    if (filters.value.startDate) params.append('start_date', filters.value.startDate)
    if (filters.value.endDate) params.append('end_date', filters.value.endDate)

    const url = `/results/exams/${selectedExam.value}?${params.toString()}`
    console.log('Making request to:', url)

    const response = await api.get(url)
    console.log('API Response:', response)

    if (response.success) {
      const data = response.data

      console.log('Exam results data:', data)

      // Update examStats object properties individually for reactivity
      examStats.value.total_attempts = data.statistics.total_attempts
      examStats.value.unique_students = data.statistics.unique_students
      examStats.value.average_score = data.statistics.average_score
      examStats.value.average_time = data.statistics.average_time

      examResults.value = data.results
      console.log('Exam results loaded:', examResults.value)
      console.log('Exam stats updated:', examStats.value)
    } else {
      console.error('API returned success: false', response)
    }
  } catch (error) {
    console.error('Error loading exam results:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los resultados del examen',
    })
  } finally {
    isLoading.value = false
  }
}

const exportExamResults = async (type: 'pdf' | 'excel') => {
  if (!selectedExam.value) {
    toast.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'Por favor selecciona un examen para exportar',
    })
    return
  }

  try {
    isExporting.value = true

    // Build query parameters
    const params = new URLSearchParams()
    params.append('exam_id', selectedExam.value.toString())

    if (filters.value.startDate) {
      params.append('start_date', filters.value.startDate)
    }
    if (filters.value.endDate) {
      params.append('end_date', filters.value.endDate)
    }

    // Create the export URL
    const exportUrl = `/results/export/${type}?${params.toString()}`

    // Use the existing API service getBlob method
    const response = await api.getBlob(exportUrl)

    // Create blob from response data
    const blob = new Blob([response.data], {
      type:
        type === 'excel'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'application/pdf',
    })

    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `resultados_examen_${selectedExam.value}_${new Date().toISOString().split('T')[0]}.${type === 'excel' ? 'xlsx' : 'pdf'}`

    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `Resultados exportados como ${type.toUpperCase()} correctamente`,
    })
  } catch (error) {
    console.error('Error exporting exam results:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `No se pudo exportar los resultados: ${error.message || 'Error desconocido'}`,
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

const viewExamAttempt = (result: any) => {
  // TODO: Implement exam attempt view
  console.log('Viewing exam attempt:', result)
}

// Lifecycle
onMounted(async () => {
  await loadExams()
})
</script>

<style scoped>
@reference "tailwindcss";

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
