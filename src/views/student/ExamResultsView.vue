<template>
  <div class="exam-results-view">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <ProgressSpinner />
      <p class="text-600 mt-3">Cargando resultados...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="card">
        <Message severity="error" :closable="false">{{ error }}</Message>
        <div class="flex gap-2 mt-3">
          <Button label="Volver" icon="pi pi-arrow-left" @click="goBack" />
        </div>
      </div>
    </div>

    <!-- No Data State -->
    <div v-else-if="!attempt" class="no-data-container">
      <div class="card">
        <Message severity="warn" :closable="false">Intento no encontrado</Message>
        <div class="flex gap-2 mt-3">
          <Button label="Volver" icon="pi pi-arrow-left" @click="goBack" />
        </div>
      </div>
    </div>

    <!-- Results Content -->
    <div v-else class="results-content">
      <!-- Header Section -->
      <div class="header-card card">
        <div class="header-top">
          <div class="header-info">
            <h1 class="exam-title">{{ attempt.exam?.title || 'Examen' }}</h1>
            <p class="exam-subtitle">
              <i class="pi pi-calendar-check"></i>
              Completado el {{ formattedCompletedAt }}
            </p>
          </div>
          <div class="header-actions">
            <Button
              label="Volver"
              icon="pi pi-arrow-left"
              severity="secondary"
              outlined
              @click="goBack"
            />
            <Button
              label="Ver todos"
              icon="pi pi-list"
              severity="secondary"
              @click="$router.push('/student/results')"
            />
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="stat-item stat-score">
            <div class="stat-icon">
              <i class="pi pi-star"></i>
            </div>
            <div class="stat-content">
              <div class="stat-label">Puntuación</div>
              <div class="stat-value">{{ attempt.score ?? 0 }} / {{ getTotalPoints() }}</div>
            </div>
          </div>

          <div class="stat-item stat-percentage" :class="percentageClass">
            <div class="stat-icon">
              <i class="pi pi-percentage"></i>
            </div>
            <div class="stat-content">
              <div class="stat-label">Porcentaje</div>
              <div class="stat-value">{{ Math.round(attempt.percentage || 0) }}%</div>
            </div>
          </div>

          <div class="stat-item stat-correct">
            <div class="stat-icon">
              <i class="pi pi-check-circle"></i>
            </div>
            <div class="stat-content">
              <div class="stat-label">Correctas</div>
              <div class="stat-value">{{ correctCount }} / {{ attempt.total_questions || 0 }}</div>
            </div>
          </div>

          <div class="stat-item stat-questions">
            <div class="stat-icon">
              <i class="pi pi-question-circle"></i>
            </div>
            <div class="stat-content">
              <div class="stat-label">Total Preguntas</div>
              <div class="stat-value">{{ attempt.total_questions || 0 }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Questions Section -->
      <div class="questions-section">
        <div class="section-header">
          <h2 class="section-title">
            <i class="pi pi-list"></i>
            Revisión de Respuestas
          </h2>
          <div class="section-summary">
            <Badge :value="`${correctCount} correctas`" severity="success" class="summary-badge" />
            <Badge
              :value="`${incorrectCount} incorrectas`"
              severity="danger"
              class="summary-badge"
            />
          </div>
        </div>

        <div v-if="attempt.questions && attempt.questions.length > 0" class="questions-list">
          <QuestionResult
            v-for="(question, index) in attempt.questions"
            :key="question.id"
            :question="question"
            :question-number="index + 1"
          />
        </div>

        <div v-else class="no-questions">
          <Message severity="info" :closable="false">
            No se encontraron preguntas para este examen
          </Message>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import Badge from 'primevue/badge'
import QuestionResult from './components/QuestionResult.vue'

const route = useRoute()
const router = useRouter()

const attemptId = parseInt(route.params.id as string)
const isLoading = ref(false)
const error = ref<string | null>(null)
const attempt = ref<any | null>(null)

const formattedCompletedAt = computed(() => {
  if (!attempt.value?.submitted_at) return 'No completado'
  const date = new Date(attempt.value.submitted_at)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

const correctCount = computed(() => {
  if (!attempt.value?.questions) return 0
  return attempt.value.questions.filter((q: any) => q.is_correct).length
})

const incorrectCount = computed(() => {
  if (!attempt.value?.questions) return 0
  return attempt.value.questions.filter((q: any) => !q.is_correct).length
})

const getTotalPoints = () => {
  // Priorizar total_points del intento (que es la suma real calculada por el backend)
  return attempt.value?.total_points || attempt.value?.exam?.total_points || 0
}

const percentageClass = computed(() => {
  const percentage = attempt.value?.percentage || 0
  if (percentage >= 90) return 'stat-excellent'
  if (percentage >= 70) return 'stat-good'
  if (percentage >= 50) return 'stat-regular'
  return 'stat-low'
})

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/student/results')
  }
}

async function loadAttempt() {
  try {
    isLoading.value = true
    error.value = null

    console.log('Loading attempt details for ID:', attemptId)
    const res = await api.getAttemptDetails(attemptId)
    console.log('API response:', res)

    // El backend puede devolver: { success: true, data: {...} } o { data: {...} }
    if (res.success && res.data) {
      attempt.value = res.data
    } else if (res.data) {
      attempt.value = res.data
    } else {
      attempt.value = res
    }

    console.log('Loaded attempt:', attempt.value)
    console.log('Attempt questions:', attempt.value?.questions)
    console.log('Questions count:', attempt.value?.questions?.length)

    // Si no hay preguntas, intentar obtenerlas desde meta o answers
    if (!attempt.value?.questions || attempt.value.questions.length === 0) {
      console.warn('No questions found in attempt, checking meta...')
      if (attempt.value?.meta?.answers) {
        console.log('Found answers in meta:', attempt.value.meta.answers)
        // El backend podría tener las respuestas en meta.answers pero no las preguntas completas
        // Esto requeriría una llamada adicional al backend para obtener las preguntas
      }
    }
  } catch (e: any) {
    console.error('Error loading attempt:', e)
    error.value = e?.response?.data?.message || 'No se pudo cargar el intento'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadAttempt)
</script>

<style scoped>
.exam-results-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.loading-container,
.error-container,
.no-data-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-card {
  margin-bottom: 2rem;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-info {
  flex: 1;
}

.exam-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0 0 0.5rem 0;
}

.exam-subtitle {
  color: var(--text-color-secondary);
  font-size: 0.9rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--surface-ground);
  border-radius: 10px;
  border: 1px solid var(--surface-border);
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.stat-score .stat-icon {
  background: linear-gradient(135deg, var(--primary-100) 0%, var(--primary-200) 100%);
  color: var(--primary-600);
}

.stat-percentage.stat-excellent .stat-icon {
  background: linear-gradient(135deg, var(--green-100) 0%, var(--green-200) 100%);
  color: var(--green-600);
}

.stat-percentage.stat-good .stat-icon {
  background: linear-gradient(135deg, var(--blue-100) 0%, var(--blue-200) 100%);
  color: var(--blue-600);
}

.stat-percentage.stat-regular .stat-icon {
  background: linear-gradient(135deg, var(--orange-100) 0%, var(--orange-200) 100%);
  color: var(--orange-600);
}

.stat-percentage.stat-low .stat-icon {
  background: linear-gradient(135deg, var(--red-100) 0%, var(--red-200) 100%);
  color: var(--red-600);
}

.stat-correct .stat-icon {
  background: linear-gradient(135deg, var(--green-100) 0%, var(--green-200) 100%);
  color: var(--green-600);
}

.stat-questions .stat-icon {
  background: linear-gradient(135deg, var(--purple-100) 0%, var(--purple-200) 100%);
  color: var(--purple-600);
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
}

.questions-section {
  margin-top: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-summary {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.summary-badge {
  font-size: 0.875rem;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.no-questions {
  padding: 2rem;
}

@media (max-width: 768px) {
  .exam-results-view {
    padding: 1rem;
  }

  .header-top {
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
