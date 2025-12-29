<template>
  <div class="result-card" :class="cardClasses">
    <!-- Header con título y porcentaje -->
    <div class="result-header">
      <div class="result-title-section">
        <h3 class="result-title">{{ result.exam?.title || 'Examen' }}</h3>
        <div class="result-badges">
          <Badge :value="percentageLabel" :severity="percentageSeverity" :icon="percentageIcon" />
          <Badge
            v-if="result.exam?.total_points"
            :value="`${result.exam.total_points} puntos`"
            severity="info"
            class="points-badge"
          />
        </div>
      </div>
    </div>

    <!-- Descripción del examen -->
    <div v-if="result.exam?.description" class="result-description">
      <p class="text-600">{{ result.exam.description }}</p>
    </div>

    <!-- Información del examen -->
    <div class="result-info">
      <div class="info-item" v-if="result.exam?.duration">
        <i class="pi pi-clock text-primary"></i>
        <span>Duración: {{ formatDuration(result.exam.duration) }}</span>
      </div>
      <div class="info-item" v-if="result.submitted_at">
        <i class="pi pi-calendar-check text-primary"></i>
        <span>Completado: {{ formatDate(result.submitted_at) }}</span>
      </div>
      <div class="info-item" v-if="result.total_questions">
        <i class="pi pi-question-circle text-primary"></i>
        <span>{{ result.total_questions }} preguntas</span>
      </div>
    </div>

    <!-- Resultado destacado -->
    <div class="result-score-section">
      <div class="score-display">
        <div class="score-circle" :class="scoreCircleClass">
          <span class="score-value">{{ Math.round(result.percentage || 0) }}%</span>
        </div>
        <div class="score-details">
          <div class="score-text">
            <strong>{{ result.score || 0 }}</strong> / {{ getTotalPoints() }} puntos
          </div>
          <div v-if="result.correct_answers !== null" class="correct-answers">
            {{ result.correct_answers }} respuestas correctas
          </div>
        </div>
      </div>
    </div>

    <!-- Acciones -->
    <div class="result-actions">
      <Button
        label="Ver Detalles"
        icon="pi pi-eye"
        severity="secondary"
        class="w-full"
        @click="$emit('view-details', result)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'
import Badge from 'primevue/badge'

const _props = defineProps<{
  result: any
}>()

const _emit = defineEmits<{
  'view-details': [result: any]
}>()

const percentageLabel = computed(() => {
  const percentage = props.result.percentage || 0
  if (percentage >= 90) return 'Excelente'
  if (percentage >= 70) return 'Bueno'
  if (percentage >= 50) return 'Regular'
  return 'Necesita mejorar'
})

const percentageSeverity = computed(() => {
  const percentage = props.result.percentage || 0
  if (percentage >= 90) return 'success'
  if (percentage >= 70) return 'info'
  if (percentage >= 50) return 'warning'
  return 'danger'
})

const percentageIcon = computed(() => {
  const percentage = props.result.percentage || 0
  if (percentage >= 90) return 'pi pi-check-circle'
  if (percentage >= 70) return 'pi pi-thumbs-up'
  if (percentage >= 50) return 'pi pi-exclamation-circle'
  return 'pi pi-times-circle'
})

const scoreCircleClass = computed(() => {
  const percentage = props.result.percentage || 0
  if (percentage >= 90) return 'score-excellent'
  if (percentage >= 70) return 'score-good'
  if (percentage >= 50) return 'score-regular'
  return 'score-low'
})

const getTotalPoints = () => {
  // Priorizar total_points del resultado (que es la suma real calculada por el backend)
  return props.result.total_points || props.result.exam?.total_points || 0
}

const cardClasses = computed(() => {
  return {
    'result-excellent': props.result.percentage >= 90,
    'result-good': props.result.percentage >= 70 && props.result.percentage < 90,
    'result-regular': props.result.percentage >= 50 && props.result.percentage < 70,
    'result-low': props.result.percentage < 50,
  }
})

const formatDate = (date: string | Date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatDuration = (minutes: number) => {
  if (!minutes) return ''
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
}
</script>

<style scoped>
.result-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.result-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.result-card.result-excellent {
  border-left: 4px solid var(--green-500);
}

.result-card.result-good {
  border-left: 4px solid var(--blue-500);
}

.result-card.result-regular {
  border-left: 4px solid var(--orange-500);
}

.result-card.result-low {
  border-left: 4px solid var(--red-500);
}

.result-header {
  margin-bottom: 1rem;
}

.result-title-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.result-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
  line-height: 1.4;
}

.result-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.points-badge {
  font-size: 0.875rem;
}

.result-description {
  margin-bottom: 1rem;
  color: var(--text-color-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
}

.result-info {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: var(--surface-ground);
  border-radius: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.info-item i {
  font-size: 1rem;
}

.result-score-section {
  margin-bottom: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, var(--surface-ground) 0%, var(--surface-card) 100%);
  border-radius: 8px;
}

.score-display {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.score-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.5rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.score-circle.score-excellent {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
}

.score-circle.score-good {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
}

.score-circle.score-regular {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.4);
}

.score-circle.score-low {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
}

.score-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  letter-spacing: -0.5px;
}

.score-details {
  flex: 1;
}

.score-text {
  font-size: 1.125rem;
  color: var(--text-color);
  margin-bottom: 0.25rem;
}

.correct-answers {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.result-actions {
  margin-top: 1rem;
}

.w-full {
  width: 100%;
}

@media (max-width: 768px) {
  .result-card {
    padding: 1rem;
  }

  .score-display {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .result-info {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
