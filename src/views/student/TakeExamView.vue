<template>
  <div class="take-exam-view">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <ProgressSpinner />
      <p class="text-600 mt-3">Cargando examen...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <Card>
        <template #content>
          <div class="error-content">
            <i class="pi pi-exclamation-triangle text-4xl text-red-500 mb-3"></i>
            <h2 class="text-2xl font-bold text-900 mb-2">Error al cargar el examen</h2>
            <p class="text-600 mb-4">{{ error }}</p>
            <Button
              label="Volver a Exámenes"
              icon="pi pi-arrow-left"
              @click="$router.push('/student/exams')"
            />
          </div>
        </template>
      </Card>
    </div>

    <!-- Exam Introduction Screen -->
    <div v-else-if="exam && !examStarted" class="exam-intro-container">
      <Card class="intro-card">
        <template #content>
          <div class="intro-content">
            <!-- Exam Header -->
            <div class="intro-header">
              <div class="exam-icon">
                <i class="pi pi-file-edit text-6xl"></i>
              </div>
              <h1 class="intro-title">{{ exam.title }}</h1>
              <p v-if="exam.description" class="intro-description">{{ exam.description }}</p>
            </div>

            <!-- Exam Details -->
            <div class="exam-details-grid">
              <div class="detail-item">
                <div class="detail-icon">
                  <i class="pi pi-list"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">Total de preguntas</div>
                  <div class="detail-value">{{ questions.length }}</div>
                </div>
              </div>

              <div class="detail-item">
                <div class="detail-icon">
                  <i class="pi pi-star"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">Puntos totales</div>
                  <div class="detail-value">{{ exam.total_points }}</div>
                </div>
              </div>

              <div class="detail-item" v-if="exam.duration">
                <div class="detail-icon">
                  <i class="pi pi-clock"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">Duración</div>
                  <div class="detail-value">{{ formatDuration(exam.duration) }}</div>
                </div>
              </div>

              <div class="detail-item" v-if="exam.start_date">
                <div class="detail-icon">
                  <i class="pi pi-calendar"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">Fecha de inicio</div>
                  <div class="detail-value">{{ formatDate(exam.start_date) }}</div>
                </div>
              </div>

              <div class="detail-item" v-if="exam.end_date">
                <div class="detail-icon">
                  <i class="pi pi-calendar-times"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">Fecha límite</div>
                  <div class="detail-value">{{ formatDate(exam.end_date) }}</div>
                </div>
              </div>
            </div>

            <!-- Instructions -->
            <div class="instructions-section">
              <h3 class="instructions-title">
                <i class="pi pi-info-circle"></i>
                Instrucciones importantes
              </h3>
              <ul class="instructions-list">
                <li>
                  <i class="pi pi-check-circle"></i>
                  Lee cuidadosamente cada pregunta antes de responder
                </li>
                <li>
                  <i class="pi pi-check-circle"></i>
                  <span v-if="exam.duration"
                    >Tienes <strong>{{ formatDuration(exam.duration) }}</strong> para completar el
                    examen</span
                  >
                  <span v-else>No hay límite de tiempo para este examen</span>
                </li>
                <li>
                  <i class="pi pi-check-circle"></i>
                  Puedes navegar entre preguntas usando los botones o el panel lateral
                </li>
                <li>
                  <i class="pi pi-check-circle"></i>
                  Asegúrate de responder todas las preguntas antes de enviar
                </li>
                <li>
                  <i class="pi pi-exclamation-triangle"></i>
                  Una vez enviado, no podrás modificar tus respuestas
                </li>
              </ul>
            </div>

            <!-- Action Buttons -->
            <div class="intro-actions">
              <Button
                label="Volver"
                icon="pi pi-arrow-left"
                outlined
                severity="secondary"
                @click="$router.push('/student/exams')"
              />
              <Button
                label="Iniciar Examen"
                icon="pi pi-play"
                iconPos="right"
                size="large"
                @click="startExam"
                class="start-button"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Exam Interface -->
    <div v-else-if="exam && examStarted" class="exam-container">
      <!-- Header con Timer -->
      <div class="exam-header">
        <Card class="header-card">
          <template #content>
            <div class="header-content">
              <div class="exam-info">
                <h1 class="exam-title">{{ exam.title }}</h1>
                <p v-if="exam.description" class="exam-description">
                  <i class="pi pi-info-circle exam-desc-icon"></i>
                  {{ exam.description }}
                </p>
                <div class="exam-meta">
                  <span class="meta-item">
                    <i class="pi pi-list text-sm"></i>
                    {{ questions.length }} preguntas
                  </span>
                  <span class="meta-item">
                    <i class="pi pi-star text-sm"></i>
                    {{ exam.total_points }} puntos totales
                  </span>
                </div>
              </div>

              <!-- Timer Sutil -->
              <div
                v-if="exam.duration && timeRemaining > 0"
                class="timer-container"
                :class="timerClass"
              >
                <div class="timer-icon">
                  <i class="pi pi-clock"></i>
                </div>
                <div class="timer-content">
                  <div class="timer-label">Tiempo restante</div>
                  <div class="timer-display">{{ formattedTime }}</div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Progress Bar -->
      <div class="progress-section">
        <div class="progress-info">
          <span class="progress-text"
            >Progreso: {{ currentQuestionIndex + 1 }} de {{ questions.length }}</span
          >
          <span class="progress-percentage">{{ progressPercentage }}%</span>
        </div>
        <ProgressBar :value="progressPercentage" class="progress-bar" />
      </div>

      <!-- Questions Container -->
      <div class="questions-container">
        <Card class="question-card">
          <template #content>
            <div v-if="currentQuestion" class="question-content">
              <!-- Question Number and Text -->
              <div class="question-header-section">
                <div class="question-number-badge">
                  <span class="number">{{ currentQuestionIndex + 1 }}</span>
                  <span class="total">/ {{ questions.length }}</span>
                </div>
                <div class="question-text-container">
                  <div class="question-text" v-html="currentQuestion.text"></div>
                  <div class="question-points">
                    <Badge :value="`${currentQuestion.points} puntos`" severity="info" />
                  </div>
                </div>
              </div>

              <!-- Multiple Choice Options -->
              <div v-if="currentQuestion.type === 'multiple_choice'" class="options-section">
                <div
                  v-for="(option, index) in currentQuestion.options"
                  :key="option.id"
                  class="option-item"
                  :class="{ selected: isOptionSelected(option.id) }"
                  @click="toggleOption(option.id)"
                >
                  <div class="option-selector">
                    <i
                      v-if="isOptionSelected(option.id)"
                      class="pi pi-check-circle option-checked"
                    ></i>
                    <i v-else class="pi pi-circle option-unchecked"></i>
                  </div>
                  <div class="option-content">
                    <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                    <span class="option-text" v-html="option.text"></span>
                  </div>
                </div>
              </div>

              <!-- Text Input -->
              <div v-else-if="currentQuestion.type === 'text'" class="text-input-section">
                <Textarea
                  v-model="answers[currentQuestion.id].answer"
                  :rows="5"
                  :placeholder="'Escribe tu respuesta aquí...'"
                  class="answer-textarea"
                  :autoResize="true"
                />
              </div>

              <!-- Boolean (True/False) -->
              <div v-else-if="currentQuestion.type === 'boolean'" class="boolean-section">
                <div class="boolean-options">
                  <div
                    class="boolean-option"
                    :class="{ selected: answers[currentQuestion.id].answer === 'true' }"
                    @click="setBooleanAnswer('true')"
                  >
                    <i class="pi pi-check-circle boolean-icon"></i>
                    <span>Verdadero</span>
                  </div>
                  <div
                    class="boolean-option"
                    :class="{ selected: answers[currentQuestion.id].answer === 'false' }"
                    @click="setBooleanAnswer('false')"
                  >
                    <i class="pi pi-times-circle boolean-icon"></i>
                    <span>Falso</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Navigation and Submit -->
      <div class="action-bar">
        <div class="navigation-buttons">
          <Button
            label="Anterior"
            icon="pi pi-arrow-left"
            :disabled="currentQuestionIndex === 0"
            outlined
            @click="previousQuestion"
          />
          <Button
            label="Siguiente"
            icon="pi pi-arrow-right"
            iconPos="right"
            :disabled="currentQuestionIndex === questions.length - 1"
            @click="nextQuestion"
          />
        </div>

        <div class="submit-section">
          <div class="answered-count">
            <i class="pi pi-check text-sm"></i>
            {{ answeredCount }} de {{ questions.length }} respondidas
          </div>
          <Button
            label="Enviar Examen"
            icon="pi pi-check"
            severity="success"
            :disabled="!canSubmit"
            :loading="isSubmitting"
            @click="confirmSubmit"
          />
        </div>
      </div>

      <!-- Question Navigator (Sidebar) -->
      <div class="question-navigator">
        <Card class="navigator-card">
          <template #header>
            <div class="navigator-header">
              <div class="navigator-header-content">
                <div class="navigator-icon-wrapper">
                  <i class="pi pi-bars navigator-header-icon"></i>
                </div>
                <div class="navigator-title-wrapper">
                  <h3 class="navigator-title">Navegación</h3>
                  <div class="navigator-stats">
                    <i class="pi pi-check-circle stat-icon"></i>
                    <span class="stat-text">{{ answeredCount }} / {{ questions.length }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <template #content>
            <div class="navigator-grid">
              <button
                v-for="(question, index) in questions"
                :key="question.id"
                class="navigator-item"
                :class="{
                  current: index === currentQuestionIndex,
                  answered: isQuestionAnswered(question.id),
                  unanswered: !isQuestionAnswered(question.id),
                }"
                @click="goToQuestion(index)"
                :title="`Pregunta ${index + 1}${isQuestionAnswered(question.id) ? ' - Respondida' : ' - Sin responder'}`"
              >
                <div class="navigator-item-content">
                  <span class="navigator-number">{{ index + 1 }}</span>
                  <i v-if="isQuestionAnswered(question.id)" class="pi pi-check navigator-check"></i>
                </div>
              </button>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- Submit Confirmation Dialog -->
    <Dialog
      v-model:visible="showSubmitDialog"
      modal
      header="Confirmar Envío"
      :style="{ width: '450px' }"
    >
      <div class="submit-dialog-content">
        <p class="text-600 mb-3">¿Estás seguro de que deseas enviar tu examen?</p>
        <div class="submit-stats">
          <div class="stat-item">
            <span class="stat-label">Preguntas respondidas:</span>
            <span class="stat-value">{{ answeredCount }} / {{ questions.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Preguntas sin responder:</span>
            <span class="stat-value text-red-500">{{ unansweredCount }}</span>
          </div>
        </div>
        <p v-if="unansweredCount > 0" class="text-warning mt-3">
          <i class="pi pi-exclamation-triangle"></i>
          Tienes {{ unansweredCount }} pregunta(s) sin responder.
        </p>
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" outlined @click="showSubmitDialog = false" />
        <Button label="Enviar Examen" icon="pi pi-check" severity="success" @click="submitExam" />
      </template>
    </Dialog>

    <!-- Time Up Dialog -->
    <Dialog
      v-model:visible="showTimeUpDialog"
      modal
      :closable="false"
      header="Tiempo Agotado"
      :style="{ width: '450px' }"
    >
      <div class="time-up-content">
        <i class="pi pi-clock text-4xl text-red-500 mb-3"></i>
        <p class="text-600 mb-3">
          El tiempo del examen ha terminado. Tu examen será enviado automáticamente.
        </p>
      </div>
      <template #footer>
        <Button label="Entendido" icon="pi pi-check" @click="submitExam" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import api from '@/services/api'
import Card from 'primevue/card'
import Button from 'primevue/button'
import ProgressBar from 'primevue/progressbar'
import ProgressSpinner from 'primevue/progressspinner'
import Textarea from 'primevue/textarea'
import Badge from 'primevue/badge'
import Dialog from 'primevue/dialog'

const route = useRoute()
const router = useRouter()
const toast = useToast()

// State
const isLoading = ref(true)
const error = ref<string | null>(null)
const exam = ref<any>(null)
const questions = ref<any[]>([])
const examStarted = ref(false)
const currentQuestionIndex = ref(0)
const answers = ref<Record<number, { answer: string; options: number[] }>>({})
const timeRemaining = ref(0) // en segundos
const isSubmitting = ref(false)
const showSubmitDialog = ref(false)
const showTimeUpDialog = ref(false)
let timerInterval: NodeJS.Timeout | null = null

// Computed
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])

const progressPercentage = computed(() => {
  if (questions.value.length === 0) return 0
  return Math.round(((currentQuestionIndex.value + 1) / questions.value.length) * 100)
})

const formattedTime = computed(() => {
  if (timeRemaining.value <= 0) {
    return '0:00'
  }

  const hours = Math.floor(timeRemaining.value / 3600)
  const minutes = Math.floor((timeRemaining.value % 3600) / 60)
  const seconds = timeRemaining.value % 60

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const timerClass = computed(() => {
  if (timeRemaining.value <= 300) return 'timer-warning' // 5 minutos
  if (timeRemaining.value <= 600) return 'timer-caution' // 10 minutos
  return 'timer-normal'
})

const answeredCount = computed(() => {
  return questions.value.filter((q) => isQuestionAnswered(q.id)).length
})

const unansweredCount = computed(() => {
  return questions.value.length - answeredCount.value
})

const canSubmit = computed(() => {
  return answeredCount.value > 0 && !isSubmitting.value
})

// Methods
const loadExam = async () => {
  try {
    isLoading.value = true
    error.value = null

    const examId = route.params.id as string
    const response = await api.get(`/student/exams/${examId}`)

    if (response.success && response.data) {
      exam.value = response.data
      questions.value = response.data.questions || []

      // Inicializar respuestas
      questions.value.forEach((question) => {
        answers.value[question.id] = {
          answer: '',
          options: [],
        }
      })

      // Preparar timer (pero no iniciarlo hasta que el usuario empiece)
      if (exam.value.duration && exam.value.duration > 0) {
        // duration está en minutos, convertir a segundos
        timeRemaining.value = exam.value.duration * 60
      } else {
        // Si no hay duración, inicializar a 0 para que no se muestre
        timeRemaining.value = 0
      }

      // Verificar si ya hay un intento en progreso
      checkExistingAttempt()
    } else {
      error.value = response.message || 'Error al cargar el examen'
    }
  } catch (err: any) {
    console.error('Error loading exam:', err)
    error.value =
      err.response?.data?.message || 'Error al cargar el examen. Por favor, intenta nuevamente.'
  } finally {
    isLoading.value = false
  }
}

const checkExistingAttempt = async () => {
  // Verificar si hay un intento sin completar (opcional, para reanudar)
  // Por ahora, asumimos que cada vez que se carga es un nuevo intento
}

const startExam = () => {
  examStarted.value = true

  // Iniciar el timer si hay duración
  if (exam.value && exam.value.duration) {
    // Asegurar que el tiempo se inicializa correctamente
    if (timeRemaining.value === 0) {
      timeRemaining.value = exam.value.duration * 60
    }

    if (timeRemaining.value > 0) {
      startTimer()
    }
  }

  // Scroll al inicio
  scrollToTop()
}

const formatDuration = (minutes: number): string => {
  if (!minutes) return 'Sin límite'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0) {
    return `${hours} hora${hours > 1 ? 's' : ''} ${mins > 0 ? `${mins} minuto${mins > 1 ? 's' : ''}` : ''}`
  }
  return `${mins} minuto${mins > 1 ? 's' : ''}`
}

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'No especificada'

  try {
    // Las fechas vienen en formato 'Y-m-d H:i:s' desde el backend
    // Parsear correctamente considerando que puede venir sin timezone
    let date: Date

    // Si la fecha tiene formato ISO o incluye timezone, usar directamente
    if (dateString.includes('T') || dateString.includes('Z') || dateString.includes('+')) {
      date = new Date(dateString)
    } else {
      // Si viene en formato 'Y-m-d H:i:s', crear fecha manualmente
      const dateTime = dateString.split(' ')
      const dateParts = dateTime[0].split('-')
      const timeParts = dateTime[1] ? dateTime[1].split(':') : ['0', '0', '0']

      date = new Date(
        parseInt(dateParts[0], 10),
        parseInt(dateParts[1], 10) - 1, // Mes es 0-indexed
        parseInt(dateParts[2], 10),
        parseInt(timeParts[0] || '0', 10),
        parseInt(timeParts[1] || '0', 10),
        parseInt(timeParts[2] || '0', 10),
      )
    }

    if (isNaN(date.getTime())) {
      return 'Fecha inválida'
    }

    return date.toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (error) {
    console.error('Error formatting date:', error, dateString)
    return 'Fecha inválida'
  }
}

const startTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }

  timerInterval = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--

      // Mostrar advertencias sutiles
      if (timeRemaining.value === 300) {
        // 5 minutos
        toast.add({
          severity: 'warn',
          summary: 'Tiempo restante',
          detail: 'Te quedan 5 minutos',
          life: 5000,
        })
      } else if (timeRemaining.value === 60) {
        // 1 minuto
        toast.add({
          severity: 'warn',
          summary: 'Tiempo restante',
          detail: 'Te queda 1 minuto',
          life: 5000,
        })
      }
    } else {
      // Tiempo agotado
      clearInterval(timerInterval!)
      showTimeUpDialog.value = true
    }
  }, 1000)
}

const isOptionSelected = (optionId: number): boolean => {
  const questionId = currentQuestion.value?.id
  if (!questionId) return false
  return answers.value[questionId]?.options?.includes(optionId) || false
}

const toggleOption = (optionId: number) => {
  const questionId = currentQuestion.value?.id
  if (!questionId) return

  const currentOptions = answers.value[questionId].options || []
  const index = currentOptions.indexOf(optionId)

  if (index > -1) {
    // Deseleccionar si ya está seleccionada
    answers.value[questionId].options = []
  } else {
    // Seleccionar solo esta opción (reemplazar cualquier selección anterior)
    answers.value[questionId].options = [optionId]
  }
}

const setBooleanAnswer = (value: string) => {
  const questionId = currentQuestion.value?.id
  if (!questionId) return
  answers.value[questionId].answer = value
}

const isQuestionAnswered = (questionId: number): boolean => {
  const answer = answers.value[questionId]
  if (!answer) return false

  if (answer.answer) return true
  if (answer.options && answer.options.length > 0) return true
  return false
}

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    scrollToTop()
  }
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
    scrollToTop()
  }
}

const goToQuestion = (index: number) => {
  if (index >= 0 && index < questions.value.length) {
    currentQuestionIndex.value = index
    scrollToTop()
  }
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const confirmSubmit = () => {
  showSubmitDialog.value = true
}

const submitExam = async () => {
  try {
    isSubmitting.value = true
    showSubmitDialog.value = false
    showTimeUpDialog.value = false

    // Preparar respuestas en el formato esperado por el backend
    const formattedAnswers = questions.value.map((question) => {
      const answer = answers.value[question.id]
      return {
        question_id: question.id,
        answer: answer?.answer || '',
        options: answer?.options || [],
      }
    })

    const examId = route.params.id as string
    const response = await api.post(`/student/exams/${examId}/take`, {
      answers: formattedAnswers,
    })

    if (response.success) {
      toast.add({
        severity: 'success',
        summary: 'Examen enviado',
        detail: 'Tu examen ha sido enviado exitosamente',
        life: 5000,
      })

      // Redirigir a resultados después de un breve delay
      setTimeout(() => {
        router.push(`/student/results`)
      }, 1500)
    } else {
      throw new Error(response.message || 'Error al enviar el examen')
    }
  } catch (err: any) {
    console.error('Error submitting exam:', err)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail:
        err.response?.data?.message || 'Error al enviar el examen. Por favor, intenta nuevamente.',
      life: 5000,
    })
    isSubmitting.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadExam()
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})

// Watch para prevenir navegación accidental
watch(
  () => route.path,
  () => {
    if (timerInterval && timeRemaining.value > 0 && !isSubmitting.value) {
      // Mostrar confirmación antes de salir
      if (!confirm('¿Estás seguro de que deseas salir? Tu progreso se perderá.')) {
        router.go(-1)
      }
    }
  },
)
</script>

<style scoped>
.take-exam-view {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--surface-ground) 0%, var(--surface-50) 100%);
  padding: 2rem 1rem;
  position: relative;
}

/* Exam Introduction Styles */
.exam-intro-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 4rem);
  padding: 2rem 0;
}

.intro-card {
  max-width: 800px;
  width: 100%;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.intro-content {
  padding: 2rem;
}

.intro-header {
  text-align: center;
  margin-bottom: 3rem;
}

.exam-icon {
  color: var(--primary-color);
  margin-bottom: 1.5rem;
}

.intro-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0 0 1rem 0;
}

.intro-description {
  font-size: 1.2rem;
  color: var(--text-color-secondary);
  margin: 0;
  line-height: 1.6;
}

.exam-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--surface-50);
  border-radius: 12px;
  border: 1px solid var(--surface-border);
  transition: all 0.2s ease;
}

.detail-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color);
}

.detail-icon {
  font-size: 2rem;
  color: var(--primary-color);
  min-width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-content {
  flex: 1;
}

.detail-label {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
}

.instructions-section {
  background: var(--primary-50);
  border: 1px solid var(--primary-200);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.instructions-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-color);
  margin: 0 0 1.5rem 0;
}

.instructions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.instructions-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  color: var(--text-color);
  line-height: 1.6;
}

.instructions-list li i {
  color: var(--primary-color);
  margin-top: 0.25rem;
  flex-shrink: 0;
}

.instructions-list li i.pi-exclamation-triangle {
  color: var(--orange-500);
}

.intro-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 1px solid var(--surface-border);
}

.start-button {
  flex: 1;
  max-width: 300px;
}

@media (max-width: 768px) {
  .intro-title {
    font-size: 2rem;
  }

  .exam-details-grid {
    grid-template-columns: 1fr;
  }

  .intro-actions {
    flex-direction: column;
  }

  .start-button {
    max-width: 100%;
  }
}

.loading-container,
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.error-content {
  text-align: center;
  padding: 2rem;
}

.exam-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 220px;
  gap: 2rem;
  padding: 0 1rem;
}

.exam-header {
  grid-column: 1 / -1;
}

.header-card {
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  background: white;
}

.header-card :deep(.p-card) {
  background: white !important;
  border: none;
}

.header-card :deep(.p-card-body) {
  background: white !important;
  padding: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.exam-info {
  flex: 1;
}

.exam-title {
  font-size: 2.75rem;
  font-weight: 900;
  margin: 0 0 1rem 0;
  color: var(--primary-600) !important;
  text-shadow:
    0 4px 16px rgba(0, 0, 0, 0.25),
    0 2px 8px rgba(0, 0, 0, 0.15);
  letter-spacing: -0.5px;
  line-height: 1.2;
  position: relative;
  padding: 0.5rem 0;
}

.exam-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color) 0%, var(--primary-600) 100%);
  border-radius: 2px;
}

.exam-description {
  font-size: 1.5rem;
  margin: 0 0 1.5rem 0;
  font-weight: 800;
  line-height: 1.7;
  color: var(--primary-600) !important;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
  border-radius: 12px;
  border: 2px solid var(--primary-200);
}

.exam-desc-icon {
  color: var(--primary-600);
  font-size: 1.5rem;
  flex-shrink: 0;
  filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.2));
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.exam-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 0.95rem;
  color: var(--text-color) !important;
  font-weight: 600;
  background: var(--surface-50);
  padding: 0.625rem 1.25rem;
  border-radius: 10px;
  border: 2px solid var(--surface-border);
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.meta-item:hover {
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
  border-color: var(--primary-300);
  color: var(--primary-color) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.meta-item i {
  color: var(--primary-color);
  font-size: 1.1rem;
}

/* Timer Styles - Moderno y sutil */
.timer-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
  border-radius: 12px;
  border: 2px solid var(--primary-200);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  min-width: 160px;
}

.timer-container.timer-warning {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #f59e0b;
  color: #92400e;
  animation: pulse 2s infinite;
}

.timer-container.timer-warning .timer-label,
.timer-container.timer-warning .timer-display,
.timer-container.timer-warning .timer-icon {
  color: #92400e !important;
}

.timer-container.timer-caution {
  background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
  border-color: #f97316;
}

.timer-container.timer-caution .timer-label,
.timer-container.timer-caution .timer-display,
.timer-container.timer-caution .timer-icon {
  color: #9a3412 !important;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 4px 16px rgba(245, 158, 11, 0.3);
  }
}

.timer-icon {
  font-size: 1.5rem;
  color: var(--primary-color);
}

.timer-content {
  display: flex;
  flex-direction: column;
}

.timer-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-color-secondary);
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.timer-display {
  font-size: 1.5rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 1px;
  color: var(--primary-color);
  font-family: 'Courier New', monospace;
}

.progress-section {
  grid-column: 1 / -1;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--surface-border);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.progress-text {
  color: var(--text-color);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-percentage {
  color: var(--primary-color);
  font-weight: 700;
  font-size: 1.1rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-600) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.progress-bar {
  height: 10px;
  border-radius: 10px;
}

.progress-bar :deep(.p-progressbar-value) {
  background: linear-gradient(90deg, var(--primary-color) 0%, var(--primary-600) 100%);
  border-radius: 10px;
  transition: width 0.3s ease;
}

.questions-container {
  grid-column: 1;
}

.question-card {
  min-height: 450px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--surface-border);
  background: white;
}

.question-card :deep(.p-card-body) {
  padding: 2.5rem;
}

.question-content {
  padding: 0;
}

.question-header-section {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  align-items: flex-start;
  padding-bottom: 2rem;
  border-bottom: 2px solid var(--surface-200);
}

.question-number-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 100px;
  height: 100px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-600) 100%);
  border-radius: 20px;
  color: white;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.3),
    0 0 0 5px var(--primary-100),
    0 0 40px rgba(var(--primary-color-rgb, 59, 130, 246), 0.4);
  border: 5px solid var(--primary-400);
  position: relative;
  overflow: visible;
  transform: scale(1);
  transition: transform 0.3s ease;
}

.question-number-badge:hover {
  transform: scale(1.05);
}

.question-number-badge::before {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 24px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-600));
  opacity: 0.4;
  z-index: -1;
  filter: blur(12px);
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%,
  100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}

.question-number-badge::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 22px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-600));
  opacity: 0.2;
  z-index: -1;
  filter: blur(6px);
}

.number {
  font-size: 3.5rem;
  font-weight: 900;
  color: white;
  line-height: 1;
  text-shadow:
    0 4px 16px rgba(0, 0, 0, 0.5),
    0 0 30px rgba(255, 255, 255, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 1;
  position: relative;
  letter-spacing: -2px;
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));
}

.total {
  font-size: 1rem;
  color: white;
  font-weight: 800;
  margin-top: 0.25rem;
  text-shadow:
    0 3px 8px rgba(0, 0, 0, 0.4),
    0 0 15px rgba(255, 255, 255, 0.2);
  z-index: 1;
  position: relative;
  opacity: 1;
  letter-spacing: 0.5px;
}

.question-text-container {
  flex: 1;
  min-width: 0; /* Permite que el texto se ajuste correctamente */
}

.question-text {
  font-size: 1.4rem;
  line-height: 1.8;
  color: var(--text-color);
  margin-bottom: 1.5rem;
  font-weight: 500;
  word-wrap: break-word;
}

.question-text :deep(p) {
  margin: 0 0 0.75rem 0;
}

.question-text :deep(p:last-child) {
  margin-bottom: 0;
}

.question-points {
  display: inline-flex;
  align-items: center;
  margin-top: 0.5rem;
}

/* Options Styles - Mejorado */
.options-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem 1.5rem;
  border: 2px solid var(--surface-border);
  border-radius: 12px;
  background: var(--surface-card);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.option-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: transparent;
  transition: all 0.3s ease;
}

.option-item:hover {
  border-color: var(--primary-300);
  background: var(--primary-50);
  transform: translateX(6px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.option-item:hover::before {
  background: var(--primary-color);
}

.option-item.selected {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateX(0);
}

.option-item.selected::before {
  background: var(--primary-color);
  width: 4px;
}

.option-selector {
  font-size: 1.75rem;
  color: var(--text-color-secondary);
  min-width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.option-item.selected .option-selector {
  color: var(--primary-color);
  transform: scale(1.1);
}

.option-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex: 1;
}

.option-label {
  font-weight: 700;
  color: var(--primary-color);
  min-width: 28px;
  font-size: 1.1rem;
  padding-top: 0.125rem;
}

.option-text {
  flex: 1;
  line-height: 1.6;
  font-size: 1rem;
  color: var(--text-color);
}

/* Text Input - Mejorado */
.text-input-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: var(--surface-50);
  border-radius: 12px;
  border: 2px dashed var(--surface-border);
  transition: all 0.3s ease;
}

.text-input-section:focus-within {
  border-color: var(--primary-color);
  border-style: solid;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.answer-textarea {
  width: 100%;
  border-radius: 12px;
  border: 2px solid var(--surface-border);
  transition: all 0.3s ease;
  font-size: 1rem;
  line-height: 1.7;
  padding: 1.25rem;
  background: white;
  resize: vertical;
  min-height: 120px;
}

.answer-textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-100);
  outline: none;
}

.answer-textarea::placeholder {
  color: var(--text-color-secondary);
  opacity: 0.6;
}

/* Boolean Options - Mejorado */
.boolean-section {
  margin-top: 1rem;
}

.boolean-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.boolean-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem 1.5rem;
  border: 2px solid var(--surface-border);
  border-radius: 12px;
  background: var(--surface-card);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  font-weight: 600;
  position: relative;
  overflow: hidden;
}

.boolean-option::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: transparent;
  transition: all 0.3s ease;
}

.boolean-option:hover {
  border-color: var(--primary-300);
  background: var(--primary-50);
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.boolean-option:hover::before {
  background: var(--primary-color);
}

.boolean-option.selected {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
  color: var(--primary-color);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.boolean-option.selected::before {
  background: var(--primary-color);
}

.boolean-icon {
  font-size: 2.5rem;
  transition: all 0.3s ease;
}

.boolean-option.selected .boolean-icon {
  transform: scale(1.15);
}

/* Action Bar - Mejorado */
.action-bar {
  grid-column: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.75rem;
  margin-top: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--surface-border);
  gap: 1.5rem;
  flex-wrap: wrap;
}

.navigation-buttons {
  display: flex;
  gap: 1rem;
}

.submit-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.answered-count {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
  border-radius: 10px;
  color: var(--primary-color);
  font-size: 0.95rem;
  font-weight: 600;
  border: 2px solid var(--primary-200);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.answered-count i {
  color: var(--primary-color);
  font-size: 1.1rem;
}

/* Question Navigator */
.question-navigator {
  grid-column: 2;
  position: sticky;
  top: 2rem;
  height: fit-content;
  max-height: calc(100vh - 4rem);
}

.navigator-card {
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.navigator-header {
  padding: 1.5rem;
  border-bottom: none;
  background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
  position: relative;
  overflow: hidden;
}

.navigator-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
}

.navigator-header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.navigator-icon-wrapper {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.navigator-header-icon {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
}

.navigator-title-wrapper {
  flex: 1;
}

.navigator-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 900;
  color: white;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.navigator-stats {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: white;
}

.navigator-stats .stat-icon {
  font-size: 1rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.navigator-stats .stat-text {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.navigator-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.625rem;
  padding: 1.5rem;
  background: var(--surface-ground);
}

.navigator-item {
  aspect-ratio: 1;
  border: none;
  border-radius: 16px;
  background: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.navigator-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: transparent;
  transition: all 0.3s ease;
  border-radius: 16px;
}

.navigator-item-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  z-index: 1;
  position: relative;
}

.navigator-number {
  font-size: 1.1rem;
  font-weight: 800;
  line-height: 1;
  transition: all 0.3s ease;
}

.navigator-check {
  font-size: 0.75rem;
  opacity: 0;
  transform: scale(0);
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.navigator-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.navigator-item:hover::before {
  background: var(--primary-50);
}

.navigator-item.answered {
  background: white;
  border: 3px solid #10b981;
  color: #065f46;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.navigator-item.answered .navigator-number {
  color: #065f46;
  font-weight: 900;
}

.navigator-item.answered .navigator-check {
  opacity: 1;
  transform: scale(1);
  color: #10b981;
  font-weight: 900;
}

.navigator-item.answered:hover {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
  transform: translateY(-2px);
}

.navigator-item.current {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-600) 100%);
  color: white;
  box-shadow:
    0 6px 24px rgba(0, 0, 0, 0.25),
    0 0 0 4px var(--primary-100);
  transform: scale(1.12);
  z-index: 2;
  border: 4px solid var(--primary-400);
}

.navigator-item.current .navigator-number {
  font-size: 1.25rem;
  font-weight: 900;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  color: white;
}

.navigator-item.current::before {
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
}

.navigator-item.current::after {
  content: '';
  position: absolute;
  inset: -5px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-600));
  opacity: 0.3;
  z-index: -1;
  filter: blur(10px);
}

.navigator-item.unanswered {
  background: white;
  border: 2px dashed var(--surface-300);
  color: var(--text-color-secondary);
}

.navigator-item.unanswered:hover {
  border-style: solid;
  border-color: var(--primary-300);
  background: var(--primary-50);
  border-width: 3px;
}

.navigator-item.unanswered .navigator-number {
  color: var(--text-color-secondary);
  font-weight: 700;
}

/* Responsive improvements */
@media (max-width: 1024px) {
  .exam-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .question-navigator {
    grid-column: 1;
    position: relative;
    top: 0;
  }

  .navigator-grid {
    grid-template-columns: repeat(10, 1fr);
  }
}

@media (max-width: 768px) {
  .take-exam-view {
    padding: 1rem 0.5rem;
  }

  .exam-container {
    padding: 0;
    gap: 1rem;
  }

  .header-content {
    flex-direction: column;
    gap: 1.5rem;
  }

  .timer-container {
    width: 100%;
    min-width: auto;
  }

  .question-header-section {
    flex-direction: column;
    gap: 1rem;
  }

  .question-number-badge {
    align-self: flex-start;
  }

  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .submit-section {
    flex-direction: column;
    width: 100%;
  }

  .navigator-grid {
    grid-template-columns: repeat(5, 1fr);
  }

  .question-card :deep(.p-card-body) {
    padding: 1.5rem;
  }

  .question-text {
    font-size: 1.2rem;
  }
}

/* Submit Dialog */
.submit-dialog-content {
  padding: 0.5rem 0;
}

.submit-stats {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1rem 0;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: var(--surface-50);
  border-radius: 4px;
}

.stat-label {
  color: var(--text-color-secondary);
}

.stat-value {
  font-weight: 600;
}

.time-up-content {
  text-align: center;
  padding: 1rem 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .exam-container {
    grid-template-columns: 1fr;
  }

  .question-navigator {
    grid-column: 1;
    position: static;
    order: -1;
  }

  .navigator-grid {
    grid-template-columns: repeat(10, 1fr);
  }

  .header-content {
    flex-direction: column;
  }

  .action-bar {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .submit-section {
    flex-direction: column;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .take-exam-view {
    padding: 1rem;
  }

  .exam-title {
    font-size: 1.5rem;
  }

  .timer-container {
    width: 100%;
    justify-content: center;
  }

  .question-header-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .boolean-options {
    grid-template-columns: 1fr;
  }

  .navigator-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
</style>
