<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <div class="flex align-items-center justify-content-between">
          <div class="mr-2">
            <h1 class="text-3xl font-bold text-900 mb-2">Calificaciones</h1>
            <p class="text-600 m-0">Resumen y detalle de resultados</p>
          </div>
          <div class="flex gap-2">
            <Button
              class="p-button-outlined p-button-success"
              label="Exportar Excel"
              icon="pi pi-file-excel"
              :loading="isExporting"
              @click="onExport('excel')"
              severity="success"
            />
            <Button
              class="p-button-outlined p-button-danger"
              label="Exportar PDF"
              icon="pi pi-file-pdf"
              severity="danger"
              :loading="isExporting"
              @click="onExport('pdf')"
            />
            <Button
              class="p-button-outlined p-button-secondary"
              label="Actualizar"
              icon="pi pi-refresh"
              :loading="isLoading"
              @click="refresh"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="col-12">
      <div class="card">
        <div class="grid grid-cols-12 gap-6 mb-8">
          <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <label class="block text-700 mb-2">Grupo</label>
            <Dropdown
              v-model="filters.groupId"
              :options="groupOptions"
              optionLabel="name"
              optionValue="id"
              placeholder="Todos"
              class="w-full"
            />
          </div>
          <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <label class="block text-700 mb-2">Examen</label>
            <Dropdown
              v-model="filters.examId"
              :options="examOptions"
              optionLabel="title"
              optionValue="id"
              placeholder="Todos"
              class="w-full"
            />
          </div>
          <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <label class="block text-700 mb-2">Desde</label>
            <Calendar v-model="filters.startDate" showIcon dateFormat="yy-mm-dd" class="w-full" />
          </div>
          <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <label class="block text-700 mb-2">Hasta</label>
            <Calendar v-model="filters.endDate" showIcon dateFormat="yy-mm-dd" class="w-full" />
          </div>
        </div>
        <div class="flex justify-content-end gap-2">
          <Button label="Limpiar" severity="secondary" @click="clearFilters" />
          <Button label="Aplicar" @click="refresh" />
        </div>
      </div>
    </div>

    <!-- Resumen -->
    <div class="col-12">
      <div class="card">
        <div class="grid grid-cols-12 gap-6 mb-8">
          <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card text-center">
              <h3 class="text-2xl font-bold text-900 mb-1">{{ stats.total_exams }}</h3>
              <p class="text-600 mb-0">Exámenes</p>
            </div>
          </div>
          <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card text-center">
              <h3 class="text-2xl font-bold text-900 mb-1">{{ stats.total_students }}</h3>
              <p class="text-600 mb-0">Estudiantes</p>
            </div>
          </div>
          <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card text-center">
              <h3 class="text-2xl font-bold text-900 mb-1">{{ stats.total_attempts }}</h3>
              <p class="text-600 mb-0">Intentos</p>
            </div>
          </div>
          <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card text-center">
              <h3 class="text-2xl font-bold text-900 mb-1">{{ stats.average_score }}%</h3>
              <p class="text-600 mb-0">Promedio</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de resultados recientes -->
    <div class="col-12">
      <div class="card">
        <h3 class="text-xl font-semibold text-900 mb-4">Resultados Recientes</h3>
        <DataTable :value="recentResults" :loading="isLoading" class="p-datatable-sm">
          <Column field="student_name" header="Estudiante" />
          <Column field="exam_title" header="Examen" />
          <Column field="group_name" header="Grupo" />
          <Column field="score" header="Puntuación" />
          <Column field="attempts" header="Intentos" />
          <Column field="time_spent" header="Tiempo (min)" />
          <Column field="completed_at" header="Fecha" />
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import apiService from '@/services/api'

const toast = useToast()

const isLoading = ref(false)
const isExporting = ref(false)

const filters = reactive({
  groupId: null as number | null,
  examId: null as number | null,
  startDate: null as Date | null,
  endDate: null as Date | null,
})

const groupOptions = ref<any[]>([])
const examOptions = ref<any[]>([])

const stats = reactive({
  total_exams: 0,
  total_students: 0,
  total_attempts: 0,
  average_score: 0,
  pass_rate: 0,
})

const recentResults = ref<any[]>([])

function paramsFromFilters() {
  const p: Record<string, any> = {}
  if (filters.groupId) p.group_id = filters.groupId
  if (filters.examId) p.exam_id = filters.examId
  if (filters.startDate) p.start_date = filters.startDate.toISOString().slice(0, 10)
  if (filters.endDate) p.end_date = filters.endDate.toISOString().slice(0, 10)
  return p
}

async function loadOptions() {
  try {
    // Reuse existing endpoints
    const [groups, exams] = await Promise.all([apiService.getGroups(), apiService.getExams()])
    // Normalize possible paginated shapes -> array
    const groupsArray =
      (groups as any)?.data?.data || (groups as any)?.data || (Array.isArray(groups) ? groups : [])
    const examsArray =
      (exams as any)?.data?.data || (exams as any)?.data || (Array.isArray(exams) ? exams : [])
    groupOptions.value = groupsArray
    examOptions.value = examsArray
  } catch (e) {
    // ignore silently for now
  }
}

async function loadData() {
  isLoading.value = true
  try {
    const { data } = await apiService.getResultsStatistics(paramsFromFilters())
    const s = data.statistics || {}
    stats.total_exams = s.total_exams || 0
    stats.total_students = s.total_students || 0
    stats.total_attempts = s.total_attempts || 0
    stats.average_score = s.average_score || 0
    stats.pass_rate = s.pass_rate || 0
    recentResults.value = (data.recent_results || []).map((r: any) => ({
      ...r,
      completed_at: r.completed_at ? new Date(r.completed_at).toLocaleString() : '',
    }))
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar datos',
      life: 3000,
    })
  } finally {
    isLoading.value = false
  }
}

function clearFilters() {
  filters.groupId = null
  filters.examId = null
  filters.startDate = null
  filters.endDate = null
}

async function onExport(type: 'excel' | 'pdf') {
  isExporting.value = true
  try {
    const blob = await apiService.exportResults(type, paramsFromFilters())
    const url = window.URL.createObjectURL(new Blob([blob]))
    const link = document.createElement('a')
    link.href = url
    link.download = type === 'pdf' ? 'resultados.pdf' : 'resultados.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo exportar', life: 3000 })
  } finally {
    isExporting.value = false
  }
}

async function refresh() {
  await loadData()
}

onMounted(async () => {
  await loadOptions()
  await loadData()
})
</script>

<style scoped>
.card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
