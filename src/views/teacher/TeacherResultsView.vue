<template>
  <div class="teacher-results-view">
    <!-- Header -->
    <div class="card mb-4">
      <div class="flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0 mb-2">
            Análisis de Resultados
          </h1>
          <p class="text-muted-color text-lg">
            Visualiza y analiza el rendimiento de tus estudiantes de manera detallada
          </p>
        </div>
        <div class="flex gap-2 flex-wrap">
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
          <Button
            label="Actualizar"
            icon="pi pi-refresh"
            class="p-button-outlined"
            @click="loadResults"
            :loading="isLoading"
          />
        </div>
      </div>
    </div>

    <!-- Filtros Avanzados -->
    <div class="card mb-4">
      <div class="flex align-items-center justify-content-between mb-3">
        <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0">
          Filtros de Análisis
        </h3>
        <Button
          label="Limpiar Filtros"
          icon="pi pi-filter-slash"
          text
          size="small"
          @click="clearFilters"
        />
      </div>
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12 md:col-span-6 lg:col-span-3">
          <label class="block text-sm font-medium mb-2 text-surface-700 dark:text-surface-300">
            Período Predefinido
          </label>
          <Select
            v-model="filters.period"
            :options="periodOptions"
            option-label="label"
            option-value="value"
            placeholder="Seleccionar período"
            class="w-full"
            @change="onPeriodChange"
          />
        </div>
        <div class="col-span-12 md:col-span-6 lg:col-span-3">
          <label class="block text-sm font-medium mb-2 text-surface-700 dark:text-surface-300">
            Grupo
          </label>
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
        <div class="col-span-12 md:col-span-6 lg:col-span-3">
          <label class="block text-sm font-medium mb-2 text-surface-700 dark:text-surface-300">
            Examen
          </label>
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
        <div class="col-span-12 md:col-span-6 lg:col-span-3">
          <label class="block text-sm font-medium mb-2 text-surface-700 dark:text-surface-300">
            Rango de Fechas
          </label>
          <div class="flex gap-2">
            <DatePicker
              v-model="filters.startDate"
              placeholder="Desde"
              class="flex-1"
              @date-select="loadResults"
            />
            <DatePicker
              v-model="filters.endDate"
              placeholder="Hasta"
              class="flex-1"
              @date-select="loadResults"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- KPIs Principales -->
    <div class="grid grid-cols-12 gap-4 mb-4">
      <div class="col-span-12 sm:col-span-6 lg:col-span-3">
        <div class="stats-card stats-card-primary">
          <div class="stats-icon">
            <i class="pi pi-file-edit text-2xl"></i>
          </div>
          <div class="stats-content">
            <h3 class="text-3xl font-bold mb-1">{{ statistics.totalExams }}</h3>
            <p class="text-muted-color">Exámenes Evaluados</p>
            <div class="stats-trend mt-2">
              <i class="pi pi-arrow-up text-xs"></i>
              <span class="text-xs">Último mes</span>
            </div>
          </div>
        </div>
      </div>
      <div class="col-span-12 sm:col-span-6 lg:col-span-3">
        <div class="stats-card stats-card-success">
          <div class="stats-icon">
            <i class="pi pi-users text-2xl"></i>
          </div>
          <div class="stats-content">
            <h3 class="text-3xl font-bold mb-1">{{ statistics.totalStudents }}</h3>
            <p class="text-muted-color">Estudiantes Evaluados</p>
            <div class="stats-trend mt-2">
              <i class="pi pi-arrow-up text-xs"></i>
              <span class="text-xs">Activos</span>
            </div>
          </div>
        </div>
      </div>
      <div class="col-span-12 sm:col-span-6 lg:col-span-3">
        <div class="stats-card stats-card-info">
          <div class="stats-icon">
            <i class="pi pi-chart-line text-2xl"></i>
          </div>
          <div class="stats-content">
            <h3 class="text-3xl font-bold mb-1">{{ statistics.averageScore }}%</h3>
            <p class="text-muted-color">Promedio General</p>
            <div class="stats-trend mt-2" :class="getScoreTrendClass(statistics.averageScore)">
              <i :class="getScoreTrendIcon(statistics.averageScore)" class="text-xs"></i>
              <span class="text-xs">{{ getScoreTrendText(statistics.averageScore) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="col-span-12 sm:col-span-6 lg:col-span-3">
        <div class="stats-card stats-card-warning">
          <div class="stats-icon">
            <i class="pi pi-check-circle text-2xl"></i>
          </div>
          <div class="stats-content">
            <h3 class="text-3xl font-bold mb-1">{{ statistics.passRate }}%</h3>
            <p class="text-muted-color">Tasa de Aprobación</p>
            <div class="stats-trend mt-2">
              <i class="pi pi-info-circle text-xs"></i>
              <span class="text-xs">≥ 60%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Insights y Alertas -->
    <div v-if="insights.length > 0" class="card mb-4">
      <h3 class="text-xl font-semibold mb-3 text-surface-900 dark:text-surface-0">
        <i class="pi pi-lightbulb mr-2 text-yellow-500"></i>
        Insights y Recomendaciones
      </h3>
      <div class="grid grid-cols-12 gap-3">
        <div
          v-for="(insight, index) in insights"
          :key="index"
          class="col-span-12 md:col-span-6 lg:col-span-4"
        >
          <Message :severity="insight.severity" :closable="false" class="insight-message">
            <div class="flex align-items-start gap-2">
              <i :class="insight.icon" class="text-lg"></i>
              <div>
                <strong>{{ insight.title }}</strong>
                <p class="mt-1 mb-0">{{ insight.message }}</p>
              </div>
            </div>
          </Message>
        </div>
      </div>
    </div>

    <!-- Visualizaciones -->
    <div class="grid grid-cols-12 gap-4 mb-4">
      <!-- Distribución de Calificaciones -->
      <div class="col-span-12 lg:col-span-6">
        <div class="card">
          <div class="flex justify-content-between align-items-center mb-4">
            <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-0">
              Distribución de Calificaciones
            </h3>
            <Button
              icon="pi pi-info-circle"
              text
              rounded
              v-tooltip.top="'Distribución porcentual de calificaciones por rango'"
            />
          </div>
          <div class="chart-container">
            <canvas ref="gradesChart" width="400" height="300"></canvas>
            <div v-if="isLoading" class="chart-loading">
              <ProgressSpinner />
              <span class="mt-2">Cargando datos...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Rendimiento por Grupo -->
      <div class="col-span-12 lg:col-span-6">
        <div class="card">
          <div class="flex justify-content-between align-items-center mb-4">
            <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-0">
              Rendimiento por Grupo
            </h3>
            <Button
              icon="pi pi-info-circle"
              text
              rounded
              v-tooltip.top="'Promedio de calificaciones por grupo'"
            />
          </div>
          <div class="chart-container">
            <canvas ref="groupsChart" width="400" height="300"></canvas>
            <div v-if="isLoading" class="chart-loading">
              <ProgressSpinner />
              <span class="mt-2">Cargando datos...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tendencia Temporal -->
      <div class="col-span-12 lg:col-span-6">
        <div class="card">
          <div class="flex justify-content-between align-items-center mb-4">
            <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-0">
              Tendencia Temporal
            </h3>
            <Button
              icon="pi pi-info-circle"
              text
              rounded
              v-tooltip.top="'Evolución del promedio general a lo largo del tiempo'"
            />
          </div>
          <div class="chart-container">
            <canvas ref="trendChart" width="400" height="300"></canvas>
            <div v-if="isLoading" class="chart-loading">
              <ProgressSpinner />
              <span class="mt-2">Cargando datos...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Comparación de Exámenes -->
      <div class="col-span-12 lg:col-span-6">
        <div class="card">
          <div class="flex justify-content-between align-items-center mb-4">
            <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-0">
              Top Exámenes por Intentos
            </h3>
            <Button
              icon="pi pi-info-circle"
              text
              rounded
              v-tooltip.top="'Exámenes con mayor número de intentos'"
            />
          </div>
          <div class="chart-container">
            <canvas ref="examsChart" width="400" height="300"></canvas>
            <div v-if="isLoading" class="chart-loading">
              <ProgressSpinner />
              <span class="mt-2">Cargando datos...</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Análisis Detallado -->
    <div class="grid grid-cols-12 gap-4 mb-4">
      <!-- Tabla de Resultados -->
      <div class="col-span-12 lg:col-span-8">
        <div class="card">
          <div class="flex justify-content-between align-items-center mb-4">
            <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-0">
              Resultados Detallados
            </h3>
            <div class="flex gap-2">
              <InputText
                v-model="searchQuery"
                placeholder="Buscar estudiante o examen..."
                class="w-64"
                @input="filterResults"
              />
              <Button icon="pi pi-filter" text rounded v-tooltip.top="'Filtros avanzados'" />
            </div>
          </div>
          <DataTable
            :value="filteredResults"
            :paginator="true"
            :rows="10"
            :loading="isLoading"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25, 50]"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} resultados"
            class="p-datatable-sm"
            stripedRows
            responsiveLayout="scroll"
          >
            <Column field="student_name" header="Estudiante" sortable>
              <template #body="slotProps">
                <div class="flex align-items-center gap-2">
                  <Avatar
                    :label="slotProps.data.student_name?.charAt(0) || 'E'"
                    shape="circle"
                    size="small"
                  />
                  <span>{{ slotProps.data.student_name }}</span>
                </div>
              </template>
            </Column>
            <Column field="exam_title" header="Examen" sortable></Column>
            <Column field="group_name" header="Grupo" sortable>
              <template #body="slotProps">
                <Tag :value="slotProps.data.group_name" severity="info" />
              </template>
            </Column>
            <Column field="score" header="Calificación" sortable>
              <template #body="slotProps">
                <div class="flex align-items-center gap-2">
                  <ProgressBar
                    :value="slotProps.data.score"
                    :showValue="false"
                    class="flex-1"
                    :class="getScoreBarClass(slotProps.data.score)"
                  />
                  <Tag
                    :value="slotProps.data.score + '%'"
                    :severity="getScoreSeverity(slotProps.data.score)"
                  />
                </div>
              </template>
            </Column>
            <Column field="attempts" header="Intentos" sortable>
              <template #body="slotProps">
                <Badge :value="slotProps.data.attempts" severity="info" />
              </template>
            </Column>
            <Column field="completed_at" header="Completado" sortable>
              <template #body="slotProps">
                <div class="flex flex-column">
                  <span>{{ formatDate(slotProps.data.completed_at) }}</span>
                  <span class="text-xs text-muted-color">{{
                    formatTime(slotProps.data.completed_at)
                  }}</span>
                </div>
              </template>
            </Column>
            <Column header="Acciones" :exportable="false">
              <template #body="slotProps">
                <div class="flex gap-1">
                  <Button
                    icon="pi pi-eye"
                    class="p-button-text p-button-sm"
                    @click="viewResultDetails(slotProps.data)"
                    v-tooltip.top="'Ver detalles'"
                  />
                  <Button
                    icon="pi pi-download"
                    class="p-button-text p-button-sm"
                    @click="downloadResult(slotProps.data)"
                    v-tooltip.top="'Descargar resultado'"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>

      <!-- Análisis Rápido -->
      <div class="col-span-12 lg:col-span-4">
        <!-- Top Estudiantes -->
        <div class="card mb-4">
          <h3 class="text-lg font-semibold mb-3 text-surface-900 dark:text-surface-0">
            <i class="pi pi-trophy mr-2 text-yellow-500"></i>
            Top Estudiantes
          </h3>
          <div v-if="topStudents.length === 0" class="text-center py-4">
            <p class="text-muted-color">No hay datos disponibles</p>
          </div>
          <div v-else>
            <div
              v-for="(student, index) in topStudents"
              :key="index"
              class="flex align-items-center justify-content-between p-3 mb-2 border-round surface-border"
              :class="index === 0 ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''"
            >
              <div class="flex align-items-center gap-2">
                <Badge :value="index + 1" severity="info" />
                <div>
                  <div class="font-semibold">{{ student.name }}</div>
                  <div class="text-sm text-muted-color">{{ student.exam }}</div>
                </div>
              </div>
              <Tag :value="student.score + '%'" :severity="getScoreSeverity(student.score)" />
            </div>
          </div>
        </div>

        <!-- Estudiantes con Bajo Rendimiento -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-3 text-surface-900 dark:text-surface-0">
            <i class="pi pi-exclamation-triangle mr-2 text-orange-500"></i>
            Necesitan Atención
          </h3>
          <div v-if="lowPerformers.length === 0" class="text-center py-4">
            <p class="text-muted-color">No hay estudiantes con bajo rendimiento</p>
          </div>
          <div v-else>
            <div
              v-for="(student, index) in lowPerformers"
              :key="index"
              class="flex align-items-center justify-content-between p-3 mb-2 border-round surface-border bg-orange-50 dark:bg-orange-900/20"
            >
              <div class="flex align-items-center gap-2">
                <Avatar
                  :label="student.name?.charAt(0) || 'E'"
                  shape="circle"
                  size="small"
                  severity="warning"
                />
                <div>
                  <div class="font-semibold">{{ student.name }}</div>
                  <div class="text-sm text-muted-color">{{ student.exam }}</div>
                </div>
              </div>
              <Tag :value="student.score + '%'" severity="danger" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Acciones Rápidas -->
    <div class="card">
      <h3 class="text-lg font-semibold mb-3 text-surface-900 dark:text-surface-0">
        Acciones Rápidas
      </h3>
      <div class="grid grid-cols-12 gap-3">
        <div class="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3">
          <Button
            label="Ver por Grupo"
            icon="pi pi-sitemap"
            class="w-full p-button-outlined"
            @click="$router.push('/grades/groups')"
          />
        </div>
        <div class="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3">
          <Button
            label="Ver por Examen"
            icon="pi pi-file"
            class="w-full p-button-outlined"
            @click="$router.push('/grades/exams')"
          />
        </div>
        <div class="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3">
          <Button
            label="Dashboard General"
            icon="pi pi-chart-bar"
            class="w-full p-button-outlined"
            @click="$router.push('/grades')"
          />
        </div>
        <div class="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3">
          <Button
            label="Análisis de Examen"
            icon="pi pi-chart-line"
            class="w-full p-button-outlined"
            @click="goToExamAnalysis"
          />
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
import type { Group, Exam } from '@/types'
import { Chart, registerables } from 'chart.js'

// Components
import Button from 'primevue/button'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import ProgressBar from 'primevue/progressbar'
import Badge from 'primevue/badge'
import Avatar from 'primevue/avatar'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'

// Register Chart.js components
Chart.register(...registerables)

// Toast
const toast = useToast()

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
const searchQuery = ref('')

// Filters
const filters = ref({
  groupId: null as number | null,
  examId: null as number | null,
  startDate: null as Date | null,
  endDate: null as Date | null,
  period: null as string | null,
})

// Period options
const periodOptions = [
  { label: 'Última semana', value: 'week' },
  { label: 'Último mes', value: 'month' },
  { label: 'Últimos 3 meses', value: '3months' },
  { label: 'Últimos 6 meses', value: '6months' },
  { label: 'Último año', value: 'year' },
  { label: 'Todo el tiempo', value: 'all' },
]

// Statistics
const statistics = ref({
  totalExams: 0,
  totalStudents: 0,
  averageScore: 0,
  passRate: 0,
})

// Computed
const filteredResults = computed(() => {
  if (!searchQuery.value) return recentResults.value

  const query = searchQuery.value.toLowerCase()
  return recentResults.value.filter(
    (result) =>
      result.student_name?.toLowerCase().includes(query) ||
      result.exam_title?.toLowerCase().includes(query) ||
      result.group_name?.toLowerCase().includes(query),
  )
})

const topStudents = computed(() => {
  return recentResults.value
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((r) => ({
      name: r.student_name,
      exam: r.exam_title,
      score: r.score,
    }))
})

const lowPerformers = computed(() => {
  return recentResults.value
    .filter((r) => r.score < 60)
    .sort((a, b) => a.score - b.score)
    .slice(0, 5)
    .map((r) => ({
      name: r.student_name,
      exam: r.exam_title,
      score: r.score,
    }))
})

const insights = computed(() => {
  const result: any[] = []

  if (statistics.value.averageScore < 60) {
    result.push({
      severity: 'warn',
      icon: 'pi pi-exclamation-triangle',
      title: 'Promedio Bajo',
      message: `El promedio general (${statistics.value.averageScore}%) está por debajo del estándar. Considera revisar el contenido del examen.`,
    })
  }

  if (statistics.value.passRate < 50) {
    result.push({
      severity: 'error',
      icon: 'pi pi-times-circle',
      title: 'Tasa de Aprobación Crítica',
      message: `Solo el ${statistics.value.passRate}% de los estudiantes aprobaron. Es recomendable revisar la dificultad del examen.`,
    })
  }

  if (statistics.value.averageScore >= 80) {
    result.push({
      severity: 'success',
      icon: 'pi pi-check-circle',
      title: 'Excelente Rendimiento',
      message: `El promedio general (${statistics.value.averageScore}%) indica un buen desempeño del grupo.`,
    })
  }

  return result
})

// Methods
const loadGroups = async () => {
  try {
    const response = await api.getGroups()
    groups.value = (response.data as any)?.data || response.data || []
  } catch (error) {
    console.error('Error loading groups:', error)
  }
}

const loadExams = async () => {
  try {
    const response = await api.getExams()
    exams.value = (response.data as any)?.data || response.data || []
  } catch (error) {
    console.error('Error loading exams:', error)
  }
}

const onPeriodChange = () => {
  if (!filters.value.period) return

  const now = new Date()
  const start = new Date()

  switch (filters.value.period) {
    case 'week':
      start.setDate(now.getDate() - 7)
      break
    case 'month':
      start.setMonth(now.getMonth() - 1)
      break
    case '3months':
      start.setMonth(now.getMonth() - 3)
      break
    case '6months':
      start.setMonth(now.getMonth() - 6)
      break
    case 'year':
      start.setFullYear(now.getFullYear() - 1)
      break
    case 'all':
      filters.value.startDate = null
      filters.value.endDate = null
      loadResults()
      return
  }

  filters.value.startDate = start
  filters.value.endDate = now
  loadResults()
}

const clearFilters = () => {
  filters.value = {
    groupId: null,
    examId: null,
    startDate: null,
    endDate: null,
    period: null,
  }
  searchQuery.value = ''
  loadResults()
}

const loadResults = async () => {
  try {
    isLoading.value = true

    const params = new URLSearchParams()
    if (filters.value.groupId) params.append('group_id', filters.value.groupId.toString())
    if (filters.value.examId) params.append('exam_id', filters.value.examId.toString())
    if (filters.value.startDate)
      params.append('start_date', formatDateForAPI(filters.value.startDate))
    if (filters.value.endDate) params.append('end_date', formatDateForAPI(filters.value.endDate))

    const response = await api.getResultsStatistics(Object.fromEntries(params))

    if (response.success) {
      const data = response.data

      statistics.value.totalExams = data.statistics.total_exams
      statistics.value.totalStudents = data.statistics.total_students
      statistics.value.averageScore = Math.round(data.statistics.average_score)
      statistics.value.passRate = Math.round(data.statistics.pass_rate)

      recentResults.value = data.recent_results || []

      await nextTick()
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

    const params: any = {}
    if (filters.value.groupId) params.group_id = filters.value.groupId
    if (filters.value.examId) params.exam_id = filters.value.examId
    if (filters.value.startDate) params.start_date = formatDateForAPI(filters.value.startDate)
    if (filters.value.endDate) params.end_date = formatDateForAPI(filters.value.endDate)

    const blob = await api.exportResults(type, params)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `resultados_${new Date().getTime()}.${type === 'excel' ? 'xlsx' : 'pdf'}`
    link.click()
    window.URL.revokeObjectURL(url)

    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `Resultados exportados como ${type.toUpperCase()}`,
    })
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

const filterResults = () => {
  // Filtering is handled by computed property
}

const getScoreSeverity = (score: number) => {
  if (score >= 80) return 'success'
  if (score >= 60) return 'warning'
  return 'danger'
}

const getScoreBarClass = (score: number) => {
  if (score >= 80) return 'p-progressbar-success'
  if (score >= 60) return 'p-progressbar-warning'
  return 'p-progressbar-danger'
}

const getScoreTrendClass = (score: number) => {
  if (score >= 80) return 'text-green-500'
  if (score >= 60) return 'text-yellow-500'
  return 'text-red-500'
}

const getScoreTrendIcon = (score: number) => {
  if (score >= 80) return 'pi pi-arrow-up'
  if (score >= 60) return 'pi pi-minus'
  return 'pi pi-arrow-down'
}

const getScoreTrendText = (score: number) => {
  if (score >= 80) return 'Excelente'
  if (score >= 60) return 'Aceptable'
  return 'Necesita mejora'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatDateForAPI = (date: Date) => {
  return date.toISOString().split('T')[0]
}

const viewResultDetails = (result: any) => {
  router.push(`/student/results/${result.id}`)
}

const downloadResult = (result: any) => {
  // TODO: Implement download functionality
  toast.add({
    severity: 'info',
    summary: 'Próximamente',
    detail: 'La descarga de resultados individuales estará disponible pronto',
  })
}

const goToExamAnalysis = () => {
  if (filters.value.examId) {
    router.push(`/teacher/exams/${filters.value.examId}/analysis`)
  } else {
    toast.add({
      severity: 'warn',
      summary: 'Selecciona un examen',
      detail: 'Por favor selecciona un examen para ver su análisis detallado',
    })
  }
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

  // Update exams chart
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
          data: [0, 0, 0, 0, 0],
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
            padding: 15,
            usePointStyle: true,
            font: {
              size: 11,
            },
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
              const percentage =
                total > 0 ? (((context.parsed as number) / total) * 100).toFixed(1) : 0
              return `${context.label}: ${context.parsed} (${percentage}%)`
            },
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
      labels: [],
      datasets: [
        {
          label: 'Promedio de Calificaciones',
          data: [],
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
      labels: [],
      datasets: [
        {
          label: 'Promedio General',
          data: [],
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
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
      labels: [],
      datasets: [
        {
          label: 'Número de Intentos',
          data: [],
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

  await nextTick()
  createGradesChart()
  createGroupsChart()
  createTrendChart()
  createExamsChart()

  await loadResults()
})
</script>

<style scoped>
@reference "tailwindcss";

.teacher-results-view {
  padding: 1.5rem;
}

.stats-card {
  @apply bg-white dark:bg-surface-800 p-4 rounded-lg border border-surface-200 dark:border-surface-700;
  @apply flex items-center gap-4;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stats-card-primary .stats-icon {
  @apply w-14 h-14 rounded-full flex items-center justify-center;
  @apply bg-blue-50 dark:bg-blue-900/20;
}

.stats-card-primary .stats-icon i {
  @apply text-blue-500;
}

.stats-card-success .stats-icon {
  @apply w-14 h-14 rounded-full flex items-center justify-center;
  @apply bg-green-50 dark:bg-green-900/20;
}

.stats-card-success .stats-icon i {
  @apply text-green-500;
}

.stats-card-info .stats-icon {
  @apply w-14 h-14 rounded-full flex items-center justify-center;
  @apply bg-cyan-50 dark:bg-cyan-900/20;
}

.stats-card-info .stats-icon i {
  @apply text-cyan-500;
}

.stats-card-warning .stats-icon {
  @apply w-14 h-14 rounded-full flex items-center justify-center;
  @apply bg-orange-50 dark:bg-orange-900/20;
}

.stats-card-warning .stats-icon i {
  @apply text-orange-500;
}

.stats-content h3 {
  @apply text-3xl font-bold text-surface-900 dark:text-surface-0 mb-1;
}

.stats-content p {
  @apply text-sm text-muted-color;
}

.stats-trend {
  @apply flex items-center gap-1 text-xs;
}

.chart-container {
  @apply relative w-full;
  height: 300px;
}

.chart-loading {
  @apply absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-surface-800/80 rounded-lg;
  @apply text-muted-color;
}

.insight-message {
  @apply mb-0;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  @apply py-3;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  @apply py-3 bg-surface-50 dark:bg-surface-700;
}

:deep(.p-progressbar) {
  height: 0.5rem;
}

:deep(.p-progressbar-success .p-progressbar-value) {
  background: #10b981;
}

:deep(.p-progressbar-warning .p-progressbar-value) {
  background: #f59e0b;
}

:deep(.p-progressbar-danger .p-progressbar-value) {
  background: #ef4444;
}
</style>
