<template>
  <div v-if="isLoading" class="flex justify-center items-center min-h-96">
    <ProgressSpinner />
  </div>

  <div v-else-if="error" class="card">
    <Message severity="error" :closable="false">{{ error }}</Message>
  </div>

  <div v-else-if="!exam" class="card">
    <Message severity="warn" :closable="false">Examen no encontrado</Message>
  </div>

  <div v-else class="grid">
    <!-- Header Section -->
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
                v-tooltip.top="'Volver a la lista'"
              />
              <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0 m-0">
                {{ exam.title }}
              </h1>
            </div>
            <p class="text-muted-color text-lg mb-4 max-w-2xl">
              {{ exam.description || 'Sin descripción' }}
            </p>

            <!-- Status Badge -->
            <div class="flex items-center gap-3 mb-4">
              <Tag value="Activo" severity="success" icon="pi pi-circle-fill" />
              <span class="text-muted-color">
                <i class="pi pi-calendar mr-2"></i>
                Creado {{ formatDate(exam.created_at) }}
              </span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-row justify-center items-center gap-2">
            <Button icon="pi pi-pencil" label="Editar" @click="editExam" class="p-button-primary" />
            <Button
              icon="pi pi-copy"
              label="Duplicar"
              @click="duplicateExam"
              class="p-button-help"
              outlined
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

    <!-- Statistics Cards -->
    <div class="col-12">
      <div class="grid grid-cols-12 gap-6 mb-8">
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
          <div class="card mb-0">
            <div class="flex justify-between mb-4">
              <div>
                <span class="block text-muted-color font-medium mb-4">Preguntas</span>
                <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                  {{ exam.questions?.length || 0 }}
                </div>
              </div>
              <div
                class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border"
                style="width: 2.5rem; height: 2.5rem"
              >
                <i class="pi pi-question-circle text-blue-500 !text-xl"></i>
              </div>
            </div>
            <span class="text-primary font-medium">{{ totalPoints }} puntos </span>
            <span class="text-muted-color">total</span>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
          <div class="card mb-0">
            <div class="flex justify-between mb-4">
              <div>
                <span class="block text-muted-color font-medium mb-4">Duración</span>
                <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                  {{ exam.duration || '∞' }}
                </div>
              </div>
              <div
                class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border"
                style="width: 2.5rem; height: 2.5rem"
              >
                <i class="pi pi-clock text-orange-500 !text-xl"></i>
              </div>
            </div>
            <span class="text-primary font-medium">{{ exam.duration || 'Sin límite' }} </span>
            <span class="text-muted-color">{{ exam.duration ? ' minutos' : '' }}</span>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
          <div class="card mb-0">
            <div class="flex justify-between mb-4">
              <div>
                <span class="block text-muted-color font-medium mb-4">Intentos</span>
                <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                  {{ exam.max_attempts || '∞' }}
                </div>
              </div>
              <div
                class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border"
                style="width: 2.5rem; height: 2.5rem"
              >
                <i class="pi pi-refresh text-cyan-500 !text-xl"></i>
              </div>
            </div>
            <span class="text-primary font-medium">{{ exam.max_attempts || 'Ilimitados' }} </span>
            <span class="text-muted-color">{{ exam.max_attempts ? ' intentos' : '' }}</span>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
          <div class="card mb-0">
            <div class="flex justify-between mb-4">
              <div>
                <span class="block text-muted-color font-medium mb-4">Grupos</span>
                <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                  {{ exam.groups?.length || 0 }}
                </div>
              </div>
              <div
                class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border"
                style="width: 2.5rem; height: 2.5rem"
              >
                <i class="pi pi-users text-purple-500 !text-xl"></i>
              </div>
            </div>
            <span class="text-primary font-medium">{{ exam.groups?.length || 0 }} </span>
            <span class="text-muted-color"> grupos asignados</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Configuration Details -->
    <div class="col-12 lg:col-6">
      <div class="card">
        <div class="font-semibold text-xl mb-4">Configuración del Examen</div>

        <div class="flex flex-col gap-4">
          <div
            class="flex items-center justify-between py-2 border-b border-surface-200 dark:border-surface-700"
          >
            <span class="font-medium text-muted-color">Preguntas mezcladas</span>
            <Tag
              :value="exam.shuffle_questions ? 'Sí' : 'No'"
              :severity="exam.shuffle_questions ? 'success' : 'secondary'"
            />
          </div>

          <div
            class="flex items-center justify-between py-2 border-b border-surface-200 dark:border-surface-700"
          >
            <span class="font-medium text-muted-color">Opciones mezcladas</span>
            <Tag
              :value="exam.shuffle_options ? 'Sí' : 'No'"
              :severity="exam.shuffle_options ? 'success' : 'secondary'"
            />
          </div>

          <div
            class="flex items-center justify-between py-2 border-b border-surface-200 dark:border-surface-700"
          >
            <span class="font-medium text-muted-color">Límite de tiempo</span>
            <Tag
              :value="exam.duration ? `${exam.duration} min` : 'Sin límite'"
              :severity="exam.duration ? 'warning' : 'success'"
            />
          </div>

          <div
            class="flex items-center justify-between py-2 border-b border-surface-200 dark:border-surface-700"
          >
            <span class="font-medium text-muted-color">Máximo de intentos</span>
            <Tag
              :value="exam.max_attempts || 'Ilimitados'"
              :severity="exam.max_attempts ? 'info' : 'success'"
            />
          </div>

          <div
            class="flex items-center justify-between py-2 border-b border-surface-200 dark:border-surface-700"
          >
            <span class="font-medium text-muted-color">Total de preguntas</span>
            <Tag :value="exam.questions?.length || 0" severity="primary" />
          </div>

          <div
            class="flex items-center justify-between py-2 border-b border-surface-200 dark:border-surface-700"
          >
            <span class="font-medium text-muted-color">Fecha de inicio</span>
            <Tag
              :value="formatDate(exam.start_date, true) || 'Inmediata'"
              :severity="exam.start_date ? 'info' : 'success'"
            />
          </div>

          <div class="flex items-center justify-between py-2">
            <span class="font-medium text-muted-color">Fecha de finalización</span>
            <Tag
              :value="formatDate(exam.end_date, true) || 'Indefinida'"
              :severity="exam.end_date ? 'warning' : 'success'"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="col-12 lg:col-6">
      <div class="card">
        <div class="font-semibold text-xl mb-4">Acciones Rápidas</div>

        <div class="flex gap-3">
          <Button
            icon="pi pi-plus"
            label="Agregar Preguntas"
            @click="addQuestions"
            class="p-button-outlined w-full justify-start"
          />
          <Button
            icon="pi pi-eye"
            label="Vista Previa"
            @click="previewExam"
            class="p-button-outlined w-full justify-start"
          />
          <Button
            icon="pi pi-chart-bar"
            label="Ver Resultados"
            @click="viewResults"
            class="p-button-outlined w-full justify-start"
          />
          <Button
            icon="pi pi-share-alt"
            label="Compartir Examen"
            @click="shareExam"
            class="p-button-outlined w-full justify-start"
          />
        </div>
      </div>
    </div>

    <!-- Questions Preview -->
    <div class="col-12" v-if="exam.questions && exam.questions.length > 0">
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <div class="font-semibold text-xl">Preguntas del Examen</div>
          <Button
            icon="pi pi-plus"
            label="Agregar Pregunta"
            @click="addQuestions"
            class="p-button-sm"
          />
        </div>

        <DataTable
          :value="exam.questions"
          :paginator="true"
          :rows="10"
          :rowsPerPageOptions="[5, 10, 20]"
          responsiveLayout="scroll"
          :loading="isLoading"
          stripedRows
        >
          <Column field="id" header="ID" style="width: 5%">
            <template #body="slotProps">
              <Tag :value="slotProps.data.id" severity="secondary" />
            </template>
          </Column>

          <Column field="text" header="Pregunta" style="width: 45%">
            <template #body="slotProps">
              <div
                class="question-text-preview"
                v-html="slotProps.data.text"
                :title="stripHtml(slotProps.data.text)"
              ></div>
            </template>
          </Column>

          <Column field="type" header="Tipo" style="width: 15%">
            <template #body="slotProps">
              <Tag
                :value="getQuestionTypeLabel(slotProps.data.type)"
                :severity="getQuestionTypeSeverity(slotProps.data.type)"
              />
            </template>
          </Column>

          <Column field="points" header="Puntos" style="width: 10%">
            <template #body="slotProps">
              <span class="font-semibold">{{ slotProps.data.points }}</span>
            </template>
          </Column>

          <Column field="meta" header="Dificultad" style="width: 15%">
            <template #body="slotProps">
              <Tag
                :value="getDifficultyLabel(slotProps.data.meta?.difficulty)"
                :severity="getDifficultySeverity(slotProps.data.meta?.difficulty)"
              />
            </template>
          </Column>

          <Column header="Acciones" style="width: 10%">
            <template #body="slotProps">
              <div class="flex gap-1">
                <Button
                  icon="pi pi-eye"
                  @click="viewQuestion(slotProps.data.id)"
                  class="p-button-rounded p-button-text p-button-sm"
                  v-tooltip.top="'Ver pregunta'"
                />
                <Button
                  icon="pi pi-pencil"
                  @click="editQuestion(slotProps.data.id)"
                  class="p-button-rounded p-button-text p-button-sm"
                  v-tooltip.top="'Editar pregunta'"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Empty State for Questions -->
    <div class="col-12" v-else>
      <div class="card text-center py-8">
        <i class="pi pi-question-circle text-6xl text-muted-color mb-4"></i>
        <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-2">
          No hay preguntas en este examen
        </h3>
        <p class="text-muted-color mb-4">
          Agrega preguntas para que los estudiantes puedan realizar el examen
        </p>
        <Button
          icon="pi pi-plus"
          label="Agregar Primera Pregunta"
          @click="addQuestions"
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
import { useExamStore } from '@/stores/exams'
import { useQuestionStore } from '@/stores/questions'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'

// Components
import ProgressSpinner from 'primevue/progressspinner'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Message from 'primevue/message'
import ConfirmDialog from 'primevue/confirmdialog'

// Composables
const route = useRoute()
const router = useRouter()
const examStore = useExamStore()
const questionStore = useQuestionStore()
const confirm = useConfirm()
const toast = useToast()

// State
const examId = ref<number>(parseInt(route.params.id as string))
const isLoading = ref(false)
const error = ref<string | null>(null)

// Computed
const exam = computed(() => examStore.currentExam)

const totalPoints = computed(() => {
  if (!exam.value?.questions) return 0
  return exam.value.questions.reduce(
    (total: number, question: any) => total + (question.points || 0),
    0,
  )
})

// Methods
const loadExam = async () => {
  try {
    isLoading.value = true
    error.value = null
    await examStore.fetchExam(examId.value)

    // Load questions for this exam
    if (exam.value?.id) {
      await questionStore.fetchQuestions(exam.value.id)
    }
  } catch (err: any) {
    error.value = err.message || 'Error al cargar el examen'
    console.error('Error loading exam:', err)
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  router.push('/exams')
}

const editExam = () => {
  router.push(`/exams/${examId.value}/edit`)
}

const duplicateExam = async () => {
  try {
    // TODO: Implementar duplicación
    toast.add({
      severity: 'info',
      summary: 'Función pendiente',
      detail: 'La duplicación de exámenes estará disponible pronto',
    })
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.message || 'Error al duplicar el examen',
    })
  }
}

const confirmDelete = () => {
  confirm.require({
    message: '¿Estás seguro de que quieres eliminar este examen? Esta acción no se puede deshacer.',
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await examStore.deleteExam(examId.value)
        toast.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Examen eliminado correctamente',
        })
        router.push('/exams')
      } catch (err: any) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'Error al eliminar el examen',
        })
      }
    },
  })
}

const addQuestions = () => {
  router.push(`/exams/${examId.value}/questions/create`)
}

const previewExam = () => {
  // TODO: Implementar vista previa
  toast.add({
    severity: 'info',
    summary: 'Función pendiente',
    detail: 'La vista previa estará disponible pronto',
  })
}

const viewResults = () => {
  router.push(`/exams/${examId.value}/results`)
}

const shareExam = () => {
  // TODO: Implementar compartir
  toast.add({
    severity: 'info',
    summary: 'Función pendiente',
    detail: 'Compartir examen estará disponible pronto',
  })
}

const viewQuestion = (questionId: number) => {
  router.push(`/questions/${questionId}`)
}

const editQuestion = (questionId: number) => {
  router.push(`/questions/${questionId}/edit`)
}

// Utility functions
const formatDate = (dateString: string, includeTime: boolean = false) => {
  if (!dateString) return null

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }

  if (includeTime) {
    options.hour = '2-digit'
    options.minute = '2-digit'
  }

  return new Date(dateString).toLocaleDateString('es-ES', options)
}

const _getStatusLabel = (isActive: boolean) => {
  return isActive ? 'Activo' : 'Inactivo'
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

const stripHtml = (html: string): string => {
  if (!html) return ''
  const tmp = document.createElement('DIV')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

// Lifecycle
onMounted(() => {
  loadExam()
})
</script>

<style scoped>
.question-text-preview {
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
}

.question-text-preview :deep(p) {
  margin: 0.5em 0;
  display: block;
}

.question-text-preview :deep(p:first-child) {
  margin-top: 0;
}

.question-text-preview :deep(p:last-child) {
  margin-bottom: 0;
}

.question-text-preview :deep(strong) {
  font-weight: 600;
}

/* Limitar el tamaño de las imágenes en la vista previa de preguntas */
.question-text-preview :deep(img) {
  max-width: 300px !important;
  max-height: 250px !important;
  width: auto !important;
  height: auto !important;
  object-fit: contain;
  display: block;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px;
  margin: 8px 0;
}

/* Hacer que las imágenes se vean mejor al pasar el mouse */
.question-text-preview :deep(img:hover) {
  border-color: #06c;
  box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.1);
}
</style>
