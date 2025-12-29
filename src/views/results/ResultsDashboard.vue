<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <div class="flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 mb-2">
              Dashboard de Resultados
            </h1>
            <p class="text-muted-color">
              Estadísticas generales y análisis de rendimiento de exámenes
            </p>
          </div>
          <div class="flex gap-2">
            <Button
              label="Exportar Excel"
              icon="pi pi-file-excel"
              class="p-button-outlined p-button-success"
              @click="exportResults('excel')"
              :loading="isExporting"
            />
            <Button
              label="Exportar PDF"
              icon="pi pi-file-pdf"
              class="p-button-outlined p-button-warning"
              @click="exportResults('pdf')"
              :loading="isExporting"
            />
          </div>
        </div>

        <!-- Filtros -->

        <div class="grid grid-cols-12 gap-6 mb-8">
          <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <h3 class="text-lg font-semibold mb-3">Grupo</h3>
            <Select
              v-model="filters.groupId"
              :options="groups"
              option-label="name"
              option-value="id"
              placeholder="Todos los grupos"
              class="w-full"
              @change="loadResults"
            />
          </div>
          <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <h3 class="text-lg font-semibold mb-3">Examen</h3>
            <Select
              v-model="filters.examId"
              :options="exams"
              option-label="title"
              option-value="id"
              placeholder="Todos los exámenes"
              class="w-full"
              @change="loadResults"
            />
          </div>
          <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <h3 class="text-lg font-semibold mb-3">Fecha Inicio</h3>
            <DatePicker
              v-model="filters.startDate"
              placeholder="Seleccionar fecha"
              class="w-full"
              @date-select="loadResults"
            />
          </div>
          <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <h3 class="text-lg font-semibold mb-3">Fecha Fin</h3>
            <DatePicker
              v-model="filters.endDate"
              placeholder="Seleccionar fecha"
              class="w-full"
              @date-select="loadResults"
            />
          </div>
        </div>

        <!-- Estadísticas Generales -->
        <div class="grid grid-cols-12 gap-6 mb-8">
          <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="stats-card">
              <div class="stats-icon">
                <i class="pi pi-list text-blue-500"></i>
              </div>
              <div class="stats-content">
                <h3 class="text-2xl font-bold text-surface-900 dark:text-surface-0">
                  {{ statistics.totalExams }}
                </h3>
                <p class="text-muted-color">Total Exámenes</p>
              </div>
            </div>
          </div>
          <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="stats-card">
              <div class="stats-icon">
                <i class="pi pi-users text-green-500"></i>
              </div>
              <div class="stats-content">
                <h3 class="text-2xl font-bold text-surface-900 dark:text-surface-0">
                  {{ statistics.totalStudents }}
                </h3>
                <p class="text-muted-color">Estudiantes Evaluados</p>
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
                  {{ statistics.averageScore }}%
                </h3>
                <p class="text-muted-color">Promedio General</p>
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
                  {{ statistics.passRate }}%
                </h3>
                <p class="text-muted-color">Tasa de Aprobación</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gráficos de Rendimiento -->
      <div class="grid">
        <div class="col-12 lg:col-6">
          <div class="card">
            <h3 class="text-lg font-semibold mb-4">Distribución de Calificaciones</h3>
            <div class="chart-container">
              <canvas ref="gradesChart" width="400" height="300"></canvas>
              <div v-if="isLoading" class="chart-loading">
                <i class="pi pi-spin pi-spinner"></i>
                <span>Cargando datos...</span>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 lg:col-6">
          <div class="card">
            <h3 class="text-lg font-semibold mb-4">Rendimiento por Grupo</h3>
            <div class="chart-container">
              <canvas ref="groupsChart" width="400" height="300"></canvas>
              <div v-if="isLoading" class="chart-loading">
                <i class="pi pi-spin pi-spinner"></i>
                <span>Cargando datos...</span>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 lg:col-6">
          <div class="card">
            <h3 class="text-lg font-semibold mb-4">Tendencia Temporal</h3>
            <div class="chart-container">
              <canvas ref="trendChart" width="400" height="300"></canvas>
              <div v-if="isLoading" class="chart-loading">
                <i class="pi pi-spin pi-spinner"></i>
                <span>Cargando datos...</span>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 lg:col-6">
          <div class="card">
            <h3 class="text-lg font-semibold mb-4">Top Exámenes</h3>
            <div class="chart-container">
              <canvas ref="examsChart" width="400" height="300"></canvas>
              <div v-if="isLoading" class="chart-loading">
                <i class="pi pi-spin pi-spinner"></i>
                <span>Cargando datos...</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabla de Resultados Recientes -->
        <div class="card mt-4">
          <h3 class="text-lg font-semibold mb-4">Resultados Recientes</h3>
          <DataTable
            :value="recentResults"
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
            <Column field="group_name" header="Grupo" sortable></Column>
            <Column field="score" header="Calificación" sortable>
              <template #body="slotProps">
                <Tag
                  :value="slotProps.data.score + '%'"
                  :severity="getScoreSeverity(slotProps.data.score)"
                />
              </template>
            </Column>
            <Column field="attempts" header="Intentos" sortable></Column>
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
                  @click="viewResultDetails(slotProps.data)"
                  v-tooltip.top="'Ver detalles'"
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
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import api from '@/services/api'
import axios from 'axios'
import type { Group, Exam } from '@/types'
import { Chart, registerables } from 'chart.js'

// Components
import Button from 'primevue/button'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'

// Toast
const toast = useToast()

// Register Chart.js components
Chart.register(...registerables)

// Router
const router = useRouter()

// Refs
const gradesChart = ref<HTMLCanvasElement>()
const groupsChart = ref<HTMLCanvasElement>()
const trendChart = ref<HTMLCanvasElement>()
const examsChart = ref<HTMLCanvasElement>()

// State
const isLoading = ref(false)
const isExporting = ref(false)
const groups = ref<Group[]>([])
const exams = ref<Exam[]>([])
const recentResults = ref<any[]>([])

// Filters
const filters = ref({
  groupId: null,
  examId: null,
  startDate: null,
  endDate: null,
})

// Statistics
const statistics = ref({
  totalExams: 0,
  totalStudents: 0,
  averageScore: 0,
  passRate: 0,
})

// Methods
const loadGroups = async () => {
  try {
    const response = await api.getGroups()
    groups.value = (response.data as any).data || response.data // Handle both paginated and non-paginated responses
  } catch (error) {
    console.error('Error loading groups:', error)
  }
}

const loadExams = async () => {
  try {
    const response = await api.getExams()
    exams.value = (response.data as any).data || response.data // Handle both paginated and non-paginated responses
  } catch (error) {
    console.error('Error loading exams:', error)
  }
}

const loadResults = async () => {
  try {
    isLoading.value = true

    const params = new URLSearchParams()
    if (filters.value.groupId) params.append('group_id', filters.value.groupId)
    if (filters.value.examId) params.append('exam_id', filters.value.examId)
    if (filters.value.startDate) params.append('start_date', formatDate(filters.value.startDate))
    if (filters.value.endDate) params.append('end_date', formatDate(filters.value.endDate))

    const response = await api.get(`/results/statistics?${params.toString()}`)

    if (response.success) {
      const data = response.data

      // Update statistics object properties individually for reactivity
      statistics.value.totalExams = data.statistics.total_exams
      statistics.value.totalStudents = data.statistics.total_students
      statistics.value.averageScore = data.statistics.average_score
      statistics.value.passRate = data.statistics.pass_rate

      recentResults.value = data.recent_results

      // Update charts with real data
      updateChartsWithRealData(data)
    } else {
      console.error('API returned success: false', response)
    }
  } catch (error) {
    console.error('Error loading results:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los resultados',
    })
  } finally {
    isLoading.value = false
  }
}

const exportResults = async (type: 'pdf' | 'excel') => {
  try {
    isExporting.value = true
    // TODO: Implement export functionality
    console.log('Exporting results as:', type)
  } catch (error) {
    console.error('Error exporting results:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo exportar los resultados',
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

const viewResultDetails = (result: any) => {
  router.push(`/student/results/${result.id}`)
}

// Update charts with real data
const updateChartsWithRealData = (data: any) => {
  // Update grades chart
  if (gradesChart.value) {
    const chart = Chart.getChart(gradesChart.value)
    if (chart) {
      const gradeData = [
        data.grade_distribution?.excellent || 0,
        data.grade_distribution?.good || 0,
        data.grade_distribution?.regular || 0,
        data.grade_distribution?.deficient || 0,
        data.grade_distribution?.failed || 0,
      ]
      chart.data.datasets[0].data = gradeData
      chart.update()
    }
  }

  // Update groups chart
  if (groupsChart.value) {
    const chart = Chart.getChart(groupsChart.value)
    if (chart) {
      const groups = data.performance_by_group || []
      chart.data.labels = groups.map((group: any) => group.name)
      chart.data.datasets[0].data = groups.map((group: any) => group.average_score)
      chart.update()
    }
  }

  // Update trend chart
  if (trendChart.value) {
    const chart = Chart.getChart(trendChart.value)
    if (chart) {
      const trendData = data.trend_data || []
      chart.data.labels = trendData.map((item: any) => item.month)
      chart.data.datasets[0].data = trendData.map((item: any) => item.average_score)
      chart.update()
    }
  }

  // Update exams chart (using performance by group data)
  if (examsChart.value) {
    const chart = Chart.getChart(examsChart.value)
    if (chart) {
      const groups = data.performance_by_group || []
      chart.data.labels = groups.map((group: any) => group.name)
      chart.data.datasets[0].data = groups.map((group: any) => group.total_attempts)
      chart.update()
    }
  }
}

// Chart methods
const createGradesChart = () => {
  if (!gradesChart.value) return

  const ctx = gradesChart.value.getContext('2d')
  if (!ctx) return

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [
        'Excelente (90-100)',
        'Bueno (80-89)',
        'Regular (70-79)',
        'Deficiente (60-69)',
        'Reprobado (<60)',
      ],
      datasets: [
        {
          data: [0, 0, 0, 0, 0], // Start with empty data
          backgroundColor: [
            '#10B981', // emerald-500
            '#3B82F6', // blue-500
            '#F59E0B', // amber-500
            '#EF4444', // red-500
            '#6B7280', // gray-500
          ],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
          },
        },
      },
    },
  })
}

const createGroupsChart = () => {
  if (!groupsChart.value) return

  const ctx = groupsChart.value.getContext('2d')
  if (!ctx) return

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [], // Start with empty labels
      datasets: [
        {
          label: 'Promedio de Calificaciones',
          data: [], // Start with empty data
          backgroundColor: '#3B82F6',
          borderColor: '#1D4ED8',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function (value) {
              return value + '%'
            },
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  })
}

const createTrendChart = () => {
  if (!trendChart.value) return

  const ctx = trendChart.value.getContext('2d')
  if (!ctx) return

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: [], // Start with empty labels
      datasets: [
        {
          label: 'Promedio General',
          data: [], // Start with empty data
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function (value) {
              return value + '%'
            },
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  })
}

const createExamsChart = () => {
  if (!examsChart.value) return

  const ctx = examsChart.value.getContext('2d')
  if (!ctx) return

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [], // Start with empty labels
      datasets: [
        {
          label: 'Número de Intentos',
          data: [], // Start with empty data
          backgroundColor: '#10B981',
          borderColor: '#059669',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      scales: {
        x: {
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  })
}

// Lifecycle
onMounted(async () => {
  await loadGroups()
  await loadExams()

  // Create charts first
  await nextTick()
  createGradesChart()
  createGroupsChart()
  createTrendChart()
  createExamsChart()

  // Then load results and update charts
  await loadResults()
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

.chart-container {
  @apply relative w-full h-80;
}

.chart-loading {
  @apply absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-surface-800/80;
  @apply text-muted-color;
}

.chart-loading i {
  @apply text-2xl mb-2;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  @apply py-2;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  @apply py-3 bg-surface-50 dark:bg-surface-700;
}
</style>
