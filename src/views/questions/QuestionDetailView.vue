<template>
  <div class="grid">
    <div class="col-12">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center min-h-96">
        <ProgressSpinner />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="card">
        <Message severity="error" :closable="false">{{ error }}</Message>
        <div class="flex justify-center mt-4">
          <Button
            label="Volver a Preguntas"
            icon="pi pi-arrow-left"
            @click="goBack"
            severity="secondary"
          />
        </div>
      </div>

      <!-- Question Detail -->
      <div v-else-if="question" class="grid">
        <!-- Header -->
        <div class="col-12 mb-4">
          <div class="card mb-0">
            <div class="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-3">
                  <Button
                    icon="pi pi-arrow-left"
                    text
                    @click="goBack"
                    class="p-button-sm"
                    v-tooltip.top="'Volver a preguntas'"
                  />
                  <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0 m-0">
                    Detalle de Pregunta
                  </h1>
                </div>
                <div class="flex items-center gap-3 flex-wrap">
                  <Tag
                    :value="getQuestionTypeLabel(question.type)"
                    :severity="getQuestionTypeSeverity(question.type)"
                    icon="pi pi-question-circle"
                  />
                  <Tag :value="`${question.points} puntos`" severity="info" icon="pi pi-star" />
                  <Tag
                    v-if="question.meta?.difficulty"
                    :value="getDifficultyLabel(question.meta.difficulty)"
                    :severity="getDifficultySeverity(question.meta.difficulty)"
                  />
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-row justify-center items-center gap-2">
                <Button
                  icon="pi pi-pencil"
                  label="Editar"
                  @click="editQuestion"
                  class="p-button-primary"
                />
                <Button
                  icon="pi pi-trash"
                  label="Eliminar"
                  @click="confirmDelete"
                  class="p-button-danger"
                  outlined
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Question Content -->
        <div class="col-12 lg:col-8">
          <div class="card">
            <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-4">
              Texto de la Pregunta
            </h3>
            <div class="question-text-content" v-html="question.text"></div>
          </div>

          <!-- Multiple Choice Options -->
          <div v-if="question.type === 'multiple_choice'" class="card mt-4">
            <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-4">
              Opciones de Respuesta
            </h3>
            <div
              v-if="question.meta?.options && question.meta.options.length > 0"
              class="flex flex-col gap-3"
            >
              <div
                v-for="(option, index) in question.meta.options"
                :key="index"
                class="p-4 border rounded-lg transition-all"
                :class="
                  option.is_correct
                    ? 'border-primary bg-primary-50 dark:bg-primary-900/20'
                    : 'border-surface-200 dark:border-surface-700'
                "
              >
                <div class="flex items-start gap-3">
                  <div
                    class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold"
                    :class="
                      option.is_correct
                        ? 'bg-primary text-primary-contrast'
                        : 'bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-400'
                    "
                  >
                    {{ index + 1 }}
                  </div>
                  <div class="flex-1">
                    <div class="font-medium text-surface-900 dark:text-surface-0 mb-1">
                      {{ option.text }}
                    </div>
                  </div>
                  <Tag
                    v-if="option.is_correct"
                    value="Correcta"
                    severity="success"
                    icon="pi pi-check-circle"
                  />
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-muted-color">No hay opciones configuradas</div>
          </div>

          <!-- True/False Answer -->
          <div v-else-if="question.type === 'true_false'" class="card mt-4">
            <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-4">
              Respuesta Correcta
            </h3>
            <div class="flex gap-4">
              <div
                class="flex-1 p-6 border rounded-lg text-center"
                :class="
                  question.meta?.correct_answer === true
                    ? 'border-primary bg-primary-50 dark:bg-primary-900/20'
                    : 'border-surface-200 dark:border-surface-700 opacity-50'
                "
              >
                <i
                  class="pi pi-check-circle text-4xl mb-3"
                  :class="
                    question.meta?.correct_answer === true ? 'text-primary' : 'text-muted-color'
                  "
                ></i>
                <div class="font-semibold text-lg text-surface-900 dark:text-surface-0">
                  Verdadero
                </div>
              </div>
              <div
                class="flex-1 p-6 border rounded-lg text-center"
                :class="
                  question.meta?.correct_answer === false
                    ? 'border-primary bg-primary-50 dark:bg-primary-900/20'
                    : 'border-surface-200 dark:border-surface-700 opacity-50'
                "
              >
                <i
                  class="pi pi-times-circle text-4xl mb-3"
                  :class="
                    question.meta?.correct_answer === false ? 'text-primary' : 'text-muted-color'
                  "
                ></i>
                <div class="font-semibold text-lg text-surface-900 dark:text-surface-0">Falso</div>
              </div>
            </div>
          </div>

          <!-- Open Answer -->
          <div v-else-if="question.type === 'open'" class="card mt-4">
            <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-4">
              Tipo de Respuesta
            </h3>
            <div
              class="flex items-center gap-3 p-4 border border-surface-200 dark:border-surface-700 rounded-lg"
            >
              <i class="pi pi-file-edit text-3xl text-primary"></i>
              <div>
                <div class="font-semibold text-surface-900 dark:text-surface-0">
                  Respuesta Abierta
                </div>
                <div class="text-sm text-muted-color">
                  Esta pregunta requiere una respuesta escrita por el estudiante
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Info -->
        <div class="col-12 lg:col-4">
          <!-- Exam Info -->
          <div class="card mb-4">
            <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-4">
              Información del Examen
            </h3>
            <div v-if="question.exam" class="flex flex-col gap-3">
              <div>
                <div class="text-sm text-muted-color mb-1">Examen</div>
                <div class="font-semibold text-surface-900 dark:text-surface-0">
                  {{ question.exam.title }}
                </div>
              </div>
              <Button
                label="Ver Examen"
                icon="pi pi-external-link"
                @click="viewExam"
                class="p-button-outlined w-full"
                severity="secondary"
              />
            </div>
            <div v-else class="text-muted-color">No asignado a ningún examen</div>
          </div>

          <!-- Additional Info -->
          <div class="card">
            <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-4">
              Información Adicional
            </h3>
            <div class="flex flex-col gap-4">
              <div v-if="question.meta?.hint">
                <div class="text-sm text-muted-color mb-2 flex items-center gap-2">
                  <i class="pi pi-lightbulb"></i>
                  <span>Pista</span>
                </div>
                <div
                  class="p-3 bg-surface-100 dark:bg-surface-800 rounded-lg text-surface-900 dark:text-surface-0"
                >
                  {{ question.meta.hint }}
                </div>
              </div>

              <div v-if="question.meta?.explanation">
                <div class="text-sm text-muted-color mb-2 flex items-center gap-2">
                  <i class="pi pi-info-circle"></i>
                  <span>Explicación</span>
                </div>
                <div
                  class="p-3 bg-surface-100 dark:bg-surface-800 rounded-lg text-surface-900 dark:text-surface-0"
                  v-html="question.meta.explanation"
                ></div>
              </div>

              <div class="pt-4 border-t border-surface-200 dark:border-surface-700">
                <div class="text-sm text-muted-color mb-2">Creado</div>
                <div class="text-surface-900 dark:text-surface-0">
                  {{ formatDate(question.created_at) }}
                </div>
              </div>

              <div>
                <div class="text-sm text-muted-color mb-2">Última actualización</div>
                <div class="text-surface-900 dark:text-surface-0">
                  {{ formatDate(question.updated_at) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Not Found State -->
      <div v-else class="card text-center py-8">
        <i class="pi pi-question-circle text-6xl text-muted-color mb-4"></i>
        <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-2">
          Pregunta no encontrada
        </h3>
        <p class="text-muted-color mb-4">La pregunta que buscas no existe o ha sido eliminada</p>
        <Button
          label="Volver a Preguntas"
          icon="pi pi-arrow-left"
          @click="goBack"
          class="p-button-primary"
        />
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Dialog -->
  <ConfirmDialog />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuestionStore } from '@/stores/questions'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import type { Question } from '@/types'

// Components
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import ConfirmDialog from 'primevue/confirmdialog'

// Composables
const route = useRoute()
const router = useRouter()
const questionStore = useQuestionStore()
const confirm = useConfirm()
const toast = useToast()

// State
const questionId = ref<number>(parseInt(route.params.id as string))
const isLoading = ref(false)
const error = ref<string | null>(null)

// Computed
const question = computed(() => questionStore.currentQuestion)

// Methods
const loadQuestion = async () => {
  try {
    isLoading.value = true
    error.value = null
    await questionStore.fetchQuestion(questionId.value)
  } catch (err: any) {
    error.value = err.message || 'Error al cargar la pregunta'
    console.error('Error loading question:', err)
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  router.push('/questions')
}

const editQuestion = () => {
  router.push(`/questions/${questionId.value}/edit`)
}

const viewExam = () => {
  if (question.value?.exam_id) {
    router.push(`/exams/${question.value.exam_id}`)
  }
}

const confirmDelete = () => {
  confirm.require({
    message:
      '¿Estás seguro de que quieres eliminar esta pregunta? Esta acción no se puede deshacer.',
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await questionStore.deleteQuestion(questionId.value)
        toast.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Pregunta eliminada correctamente',
        })
        router.push('/questions')
      } catch (err: any) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'Error al eliminar la pregunta',
        })
      }
    },
  })
}

// Utility functions
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getQuestionTypeLabel = (type: string) => {
  const types: Record<string, string> = {
    multiple_choice: 'Opción múltiple',
    true_false: 'Verdadero/Falso',
    open: 'Respuesta abierta',
  }
  return types[type] || type
}

const getQuestionTypeSeverity = (type: string) => {
  const severities: Record<string, string> = {
    multiple_choice: 'info',
    true_false: 'success',
    open: 'warning',
  }
  return severities[type] || 'secondary'
}

const getDifficultyLabel = (difficulty?: string) => {
  if (!difficulty) return 'No especificada'
  const labels: Record<string, string> = {
    easy: 'Fácil',
    medium: 'Medio',
    hard: 'Difícil',
  }
  return labels[difficulty] || difficulty
}

const getDifficultySeverity = (difficulty?: string) => {
  if (!difficulty) return 'secondary'
  const severities: Record<string, string> = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger',
  }
  return severities[difficulty] || 'secondary'
}

// Lifecycle
onMounted(() => {
  loadQuestion()
})
</script>

<style scoped>
.question-text-content {
  line-height: 1.6;
  color: var(--p-color-text);
}

.question-text-content :deep(p) {
  margin-bottom: 1rem;
}

.question-text-content :deep(ul),
.question-text-content :deep(ol) {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.question-text-content :deep(strong) {
  font-weight: 600;
}

.question-text-content :deep(em) {
  font-style: italic;
}
</style>
