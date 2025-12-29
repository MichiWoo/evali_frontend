<template>
  <div class="student-exams-view">
    <!-- Header -->
    <div class="header-section mb-4">
      <div class="flex align-items-center justify-content-between">
        <div>
          <h1 class="text-3xl font-bold text-900 mb-2">Mis Exámenes</h1>
          <p class="text-600 m-0">Gestiona tus exámenes asignados y revisa tus resultados</p>
        </div>
        <Button
          label="Ver Resultados"
          icon="pi pi-chart-bar"
          severity="secondary"
          outlined
          @click="$router.push('/student/results')"
        />
      </div>
    </div>

    <!-- Estadísticas rápidas -->
    <div class="stats-grid mb-4">
      <div class="stat-card stat-available">
        <div class="stat-icon">
          <i class="pi pi-file-edit text-3xl"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.available }}</div>
          <div class="stat-label">Disponibles</div>
        </div>
      </div>
      <div class="stat-card stat-completed">
        <div class="stat-icon">
          <i class="pi pi-check-circle text-3xl"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.completed }}</div>
          <div class="stat-label">Completados</div>
        </div>
      </div>
      <div class="stat-card stat-expired">
        <div class="stat-icon">
          <i class="pi pi-clock text-3xl"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.expired }}</div>
          <div class="stat-label">Expirados</div>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-container mb-4">
      <div class="filter-buttons">
        <Button
          :label="`Disponibles (${availableExams.length})`"
          :icon="'pi pi-file-edit'"
          :class="{ 'p-button-primary': activeTab === 0, 'p-button-outlined': activeTab !== 0 }"
          @click="activeTab = 0"
        />
        <Button
          :label="`Completados (${completedExams.length})`"
          :icon="'pi pi-check-circle'"
          :class="{ 'p-button-primary': activeTab === 1, 'p-button-outlined': activeTab !== 1 }"
          @click="activeTab = 1"
        />
        <Button
          :label="`Expirados (${expiredExams.length})`"
          :icon="'pi pi-clock'"
          :class="{ 'p-button-primary': activeTab === 2, 'p-button-outlined': activeTab !== 2 }"
          @click="activeTab = 2"
        />
      </div>
    </div>

    <!-- Contenido según tab activo -->
    <div class="content-container">
      <ExamList
        v-if="activeTab === 0"
        :exams="availableExams"
        :isLoading="isLoading"
        :emptyMessage="'No tienes exámenes disponibles en este momento'"
        @take-exam="handleTakeExam"
      />
      <ExamList
        v-else-if="activeTab === 1"
        :exams="completedExams"
        :isLoading="isLoading"
        :emptyMessage="'No has completado ningún examen aún'"
        @view-results="handleViewResults"
      />
      <ExamList
        v-else
        :exams="expiredExams"
        :isLoading="isLoading"
        :emptyMessage="'No tienes exámenes expirados'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import api from '@/services/api'
import Button from 'primevue/button'
import ExamList from './components/ExamList.vue'

const router = useRouter()
const toast = useToast()

// State
const isLoading = ref(false)
const activeTab = ref(0)
const exams = ref<any[]>([])
const attempts = ref<any[]>([])

// Computed
const availableExams = computed(() => {
  return exams.value.filter((exam) => {
    if (!exam) return false

    const now = new Date()
    const startDate = new Date(exam.start_date)
    const endDate = new Date(exam.end_date)

    // Verificar si hay un intento completado
    const hasAttempt = attempts.value.some((attempt) => {
      const examId = attempt.exam_id || (attempt.exam && attempt.exam.id)
      return examId === exam.id && attempt.submitted_at
    })

    return exam.is_active && startDate <= now && endDate >= now && !hasAttempt
  })
})

const completedExams = computed(() => {
  const completedAttempts = attempts.value.filter((attempt) => attempt.submitted_at)

  return completedAttempts
    .map((attempt) => {
      // El intento puede tener exam_id o exam como objeto relacionado
      const examId = attempt.exam_id || (attempt.exam && attempt.exam.id)
      const exam = exams.value.find((e) => e.id === examId) || attempt.exam

      if (!exam) return null

      return {
        ...exam,
        attempt: attempt,
        score: attempt.score,
        total_points: attempt.total_points || exam.total_points,
        completed_at: attempt.submitted_at,
      }
    })
    .filter((exam) => exam && exam.id)
})

const expiredExams = computed(() => {
  return exams.value.filter((exam) => {
    if (!exam) return false

    const now = new Date()
    const endDate = new Date(exam.end_date)

    // Verificar si hay un intento completado
    const hasAttempt = attempts.value.some((attempt) => {
      const examId = attempt.exam_id || (attempt.exam && attempt.exam.id)
      return examId === exam.id && attempt.submitted_at
    })

    return exam.is_active && endDate < now && !hasAttempt
  })
})

const stats = computed(() => {
  return {
    available: availableExams.value.length,
    completed: completedExams.value.length,
    expired: expiredExams.value.length,
  }
})

// Methods
const loadExams = async () => {
  try {
    isLoading.value = true

    console.log('Loading exams and attempts...')

    // Cargar TODOS los exámenes asignados al estudiante (no solo disponibles)
    const allExamsResponse: any = await api.getStudentExamsList(true)
    console.log('All exams response:', allExamsResponse)

    if (allExamsResponse) {
      if (allExamsResponse.success && allExamsResponse.data) {
        // El backend devuelve paginación: { success: true, data: { data: [...], current_page: ..., total: ... } }
        const paginatedData = allExamsResponse.data
        if (paginatedData.data && Array.isArray(paginatedData.data)) {
          exams.value = paginatedData.data
        } else if (Array.isArray(paginatedData)) {
          exams.value = paginatedData
        }
      } else if (allExamsResponse.data) {
        const responseData = allExamsResponse.data
        if (responseData.data && Array.isArray(responseData.data)) {
          exams.value = responseData.data
        } else if (Array.isArray(responseData)) {
          exams.value = responseData
        }
      } else if (Array.isArray(allExamsResponse)) {
        exams.value = allExamsResponse
      }
    }

    console.log('Loaded exams:', exams.value.length, exams.value)

    // Cargar intentos de examen (incluye completados y en progreso)
    const attemptsResponse: any = await api.getStudentAttempts()
    console.log('Attempts response:', attemptsResponse)

    if (attemptsResponse) {
      if (attemptsResponse.success && attemptsResponse.data) {
        // El backend devuelve paginación: { success: true, data: { data: [...], current_page: ..., total: ... } }
        const paginatedData = attemptsResponse.data
        if (paginatedData.data && Array.isArray(paginatedData.data)) {
          attempts.value = paginatedData.data
        } else if (Array.isArray(paginatedData)) {
          attempts.value = paginatedData
        }
      } else if (attemptsResponse.data) {
        const responseData = attemptsResponse.data
        if (responseData.data && Array.isArray(responseData.data)) {
          attempts.value = responseData.data
        } else if (Array.isArray(responseData)) {
          attempts.value = responseData
        }
      } else if (Array.isArray(attemptsResponse)) {
        attempts.value = attemptsResponse
      }
    }

    console.log('Loaded attempts:', attempts.value.length, attempts.value)
  } catch (error: any) {
    console.error('Error loading exams:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los exámenes. Intenta nuevamente.',
      life: 5000,
    })
  } finally {
    isLoading.value = false
  }
}

const handleTakeExam = (exam: any) => {
  router.push(`/student/exams/${exam.id}/take`)
}

const handleViewResults = (exam: any) => {
  if (exam.attempt?.id) {
    router.push(`/student/results/${exam.attempt.id}`)
  } else {
    toast.add({
      severity: 'warn',
      summary: 'Aviso',
      detail: 'No hay resultados disponibles para este examen',
      life: 3000,
    })
  }
}

// Load data on mount
onMounted(() => {
  loadExams()
})
</script>

<style scoped>
.student-exams-view {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.header-section {
  background: var(--surface-card);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--surface-border);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: var(--surface-card);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--surface-border);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-available .stat-icon {
  background: var(--blue-50);
  color: var(--blue-600);
}

.stat-completed .stat-icon {
  background: var(--green-50);
  color: var(--green-600);
}

.stat-expired .stat-icon {
  background: var(--orange-50);
  color: var(--orange-600);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
  font-weight: 500;
}

.filters-container {
  background: var(--surface-card);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid var(--surface-border);
}

.filter-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.content-container {
  background: var(--surface-card);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--surface-border);
  min-height: 400px;
}

@media (max-width: 768px) {
  .student-exams-view {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .header-section .flex {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
