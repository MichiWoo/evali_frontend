<template>
  <div class="exam-card" :class="cardClasses">
    <!-- Header con título y estado -->
    <div class="exam-header">
      <div class="exam-title-section">
        <h3 class="exam-title">{{ exam.title }}</h3>
        <div class="exam-badges">
          <Badge
            :value="examStatus.label"
            :severity="examStatus.severity"
            :icon="examStatus.icon"
          />
          <Badge
            v-if="exam.total_points"
            :value="`${exam.total_points} puntos`"
            severity="info"
            class="points-badge"
          />
          <Badge
            v-if="exam.duration"
            :value="formatDuration(exam.duration)"
            severity="secondary"
            icon="pi pi-clock"
            class="duration-badge"
          />
        </div>
      </div>
    </div>

    <!-- Descripción -->
    <div v-if="exam.description" class="exam-description">
      <p class="text-600">{{ exam.description }}</p>
    </div>

    <!-- Información del examen -->
    <div class="exam-info">
      <div class="info-item">
        <i class="pi pi-clock text-primary"></i>
        <span>Duración: {{ exam.duration ? formatDuration(exam.duration) : 'Sin límite' }}</span>
      </div>
      <div class="info-item" v-if="exam.start_date">
        <i class="pi pi-calendar text-primary"></i>
        <span>Inicia: {{ formatDate(exam.start_date) }}</span>
      </div>
      <div class="info-item" v-if="exam.end_date">
        <i class="pi pi-calendar-times text-primary"></i>
        <span>Vence: {{ formatDate(exam.end_date) }}</span>
      </div>
      <div class="info-item" v-if="exam.questions && exam.questions.length">
        <i class="pi pi-question-circle text-primary"></i>
        <span>{{ exam.questions.length }} preguntas</span>
      </div>
    </div>

    <!-- Resultado si está completado -->
    <div v-if="exam.score !== undefined" class="exam-result">
      <div class="result-score">
        <div class="score-circle" :class="scoreCircleClass">
          <span class="score-value">{{ Math.round(getPercentage()) }}%</span>
        </div>
        <div class="result-details">
          <div class="result-text">
            <strong>{{ exam.score }}</strong> / {{ getTotalPoints() }} puntos
          </div>
          <div v-if="exam.completed_at" class="result-date">
            Completado: {{ formatDate(exam.completed_at) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Acciones -->
    <div class="exam-actions">
      <Button
        v-if="canTakeExam"
        label="Tomar Examen"
        icon="pi pi-play"
        class="w-full"
        @click="$emit('take-exam', exam)"
      />
      <Button
        v-else-if="exam.score !== undefined"
        label="Ver Resultados"
        icon="pi pi-eye"
        severity="secondary"
        class="w-full"
        @click="$emit('view-results', exam)"
      />
      <div v-else class="disabled-message">
        <i class="pi pi-info-circle"></i>
        <span>Este examen ya no está disponible</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Badge from 'primevue/badge'
import Button from 'primevue/button'

const _props = defineProps<{
  exam: any
}>()

defineEmits<{
  'take-exam': [exam: any]
  'view-results': [exam: any]
}>()

const examStatus = computed(() => {
  if (props.exam.score !== undefined) {
    return {
      label: 'Completado',
      severity: 'success',
      icon: 'pi pi-check-circle',
    }
  }

  const now = new Date()
  const startDate = new Date(props.exam.start_date)
  const endDate = new Date(props.exam.end_date)

  if (endDate < now) {
    return {
      label: 'Expirado',
      severity: 'warning',
      icon: 'pi pi-clock',
    }
  }

  if (startDate > now) {
    return {
      label: 'Próximamente',
      severity: 'info',
      icon: 'pi pi-calendar',
    }
  }

  return {
    label: 'Disponible',
    severity: 'success',
    icon: 'pi pi-check',
  }
})

const canTakeExam = computed(() => {
  if (props.exam.score !== undefined) return false

  const now = new Date()
  const startDate = new Date(props.exam.start_date)
  const endDate = new Date(props.exam.end_date)

  return props.exam.is_active && startDate <= now && endDate >= now
})

const cardClasses = computed(() => {
  return {
    'exam-completed': props.exam.score !== undefined,
    'exam-expired': examStatus.value.severity === 'warning' && !props.exam.score,
    'exam-available': canTakeExam.value,
  }
})

const getTotalPoints = () => {
  // Priorizar total_points del intento (que es la suma real), luego del examen
  return (
    props.exam.total_points ||
    props.exam.attempt?.total_points ||
    props.exam.exam?.total_points ||
    0
  )
}

const getPercentage = () => {
  const totalPoints = getTotalPoints()
  if (!totalPoints || totalPoints === 0) return 0
  // Usar el porcentaje del backend si está disponible, sino calcularlo
  if (props.exam.percentage !== undefined) {
    return props.exam.percentage
  }
  return (props.exam.score / totalPoints) * 100
}

const scoreCircleClass = computed(() => {
  const percentage = getPercentage()
  if (percentage >= 90) return 'score-excellent'
  if (percentage >= 70) return 'score-good'
  if (percentage >= 50) return 'score-regular'
  return 'score-low'
})

const formatDuration = (minutes: number) => {
  if (!minutes) return 'Sin límite'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}h ${mins}min`
  }
  return `${mins} minutos`
}

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
</script>

<style scoped>
.exam-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.3s ease;
}

.exam-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color);
}

.exam-available {
  border-left: 4px solid var(--green-500);
}

.exam-completed {
  border-left: 4px solid var(--blue-500);
}

.exam-expired {
  border-left: 4px solid var(--orange-500);
  opacity: 0.8;
}

.exam-header {
  margin-bottom: 0.5rem;
}

.exam-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 0.75rem 0;
  line-height: 1.3;
}

.exam-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.points-badge,
.duration-badge {
  font-size: 0.75rem;
}

.exam-description {
  margin-bottom: 0.5rem;
}

.exam-description p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--text-color-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.exam-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-color-secondary);
}

.info-item i {
  font-size: 1rem;
}

.exam-result {
  background: var(--blue-50);
  border-radius: 8px;
  padding: 1rem;
  margin: 0.5rem 0;
}

.result-score {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.score-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  font-size: 1rem;
  flex-shrink: 0;
}

.score-circle.score-excellent {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 3px 12px rgba(16, 185, 129, 0.4);
}

.score-circle.score-good {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 0 3px 12px rgba(59, 130, 246, 0.4);
}

.score-circle.score-regular {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 3px 12px rgba(245, 158, 11, 0.4);
}

.score-circle.score-low {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 3px 12px rgba(239, 68, 68, 0.4);
}

.score-value {
  font-weight: 800;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.3px;
}

.result-details {
  flex: 1;
}

.result-text {
  font-size: 1rem;
  color: var(--text-color);
  margin-bottom: 0.25rem;
}

.result-date {
  font-size: 0.85rem;
  color: var(--text-color-secondary);
}

.exam-actions {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--surface-border);
}

.disabled-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--surface-50);
  border-radius: 6px;
  color: var(--text-color-secondary);
  font-size: 0.9rem;
  text-align: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .exam-card {
    padding: 1.25rem;
  }

  .result-score {
    flex-direction: column;
    text-align: center;
  }
}
</style>
