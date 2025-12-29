<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <div class="flex items-center gap-2 mb-4">
          <Button
            icon="pi pi-arrow-left"
            text
            @click="goBack"
            class="p-button-sm"
            v-tooltip.top="'Volver'"
          />
          <h1 class="text-3xl font-bold m-0">Generar Examen con IA</h1>
        </div>
        <p class="text-muted-color mb-6">
          Sube un documento PDF y genera un examen automáticamente usando inteligencia artificial
        </p>

        <!-- Uso y Límites -->
        <Card v-if="usage" class="mb-4">
          <template #content>
            <div class="grid">
              <div class="col-12 md:col-6">
                <div class="flex flex-column gap-2">
                  <span class="text-sm text-muted-color">Generaciones de Exámenes</span>
                  <div class="flex align-items-center gap-2">
                    <ProgressBar
                      :value="getUsagePercentage('exam_generations')"
                      :showValue="false"
                      class="flex-1"
                    />
                    <span class="text-sm font-semibold">
                      {{ usage.current_usage.exam_generations }} /
                      {{ usage.limits.exam_generations ?? '∞' }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="col-12 md:col-6">
                <div class="flex flex-column gap-2">
                  <span class="text-sm text-muted-color">Análisis de Respuestas</span>
                  <div class="flex align-items-center gap-2">
                    <ProgressBar
                      :value="getUsagePercentage('answer_analyses')"
                      :showValue="false"
                      class="flex-1"
                    />
                    <span class="text-sm font-semibold">
                      {{ usage.current_usage.answer_analyses }} /
                      {{ usage.limits.answer_analyses ?? '∞' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <TabView>
          <TabPanel header="Generar Nuevo Examen" value="generate">
            <div class="grid">
              <div class="col-12">
                <Steps :model="steps" :activeIndex="currentStep" />
              </div>

              <!-- Paso 1: Subir Documento -->
              <div v-if="currentStep === 0" class="col-12">
                <Card>
                  <template #title>Paso 1: Subir Documento PDF</template>
                  <template #content>
                    <DocumentUploader @uploaded="handleDocumentUploaded" />
                  </template>
                </Card>
              </div>

              <!-- Paso 2: Configurar Parámetros -->
              <div v-if="currentStep === 1" class="col-12">
                <Card>
                  <template #title>Paso 2: Configurar Parámetros</template>
                  <template #content>
                    <div class="field mb-4">
                      <label for="title" class="block font-medium mb-2">
                        Título del Examen <span class="text-red-500">*</span>
                      </label>
                      <InputText
                        id="title"
                        v-model="formData.title"
                        placeholder="Ej: Examen de Matemáticas - Capítulo 3"
                        class="w-full"
                        :class="{ 'p-invalid': !formData.title }"
                      />
                    </div>

                    <div class="field mb-4">
                      <label for="description" class="block font-medium mb-2"> Descripción </label>
                      <Textarea
                        id="description"
                        v-model="formData.description"
                        placeholder="Descripción opcional del examen..."
                        rows="3"
                        class="w-full"
                      />
                    </div>

                    <GenerationParameters v-model="formData" />
                  </template>
                </Card>
              </div>

              <!-- Paso 3: Revisar y Generar -->
              <div v-if="currentStep === 2" class="col-12">
                <Card>
                  <template #title>Paso 3: Revisar y Generar</template>
                  <template #content>
                    <div class="review-section">
                      <h4 class="mb-3">Resumen</h4>
                      <div class="grid">
                        <div class="col-12 md:col-6">
                          <p>
                            <strong>Documento:</strong> {{ uploadedDocument?.original_filename }}
                          </p>
                          <p><strong>Título:</strong> {{ formData.title }}</p>
                          <p><strong>Preguntas:</strong> {{ formData.parameters.num_questions }}</p>
                        </div>
                        <div class="col-12 md:col-6">
                          <p>
                            <strong>Tipos:</strong>
                            {{ formData.parameters.question_types.join(', ') }}
                          </p>
                          <p>
                            <strong>Dificultad:</strong>
                            {{ getDifficultyLabel(formData.parameters.difficulty) }}
                          </p>
                          <p v-if="formData.exam_settings.time_limit_minutes">
                            <strong>Tiempo:</strong>
                            {{ formData.exam_settings.time_limit_minutes }} minutos
                          </p>
                        </div>
                      </div>
                    </div>
                  </template>
                </Card>
              </div>

              <!-- Navegación -->
              <div class="col-12 flex justify-content-between mt-4">
                <Button
                  label="Anterior"
                  icon="pi pi-arrow-left"
                  :disabled="currentStep === 0"
                  @click="currentStep--"
                />
                <Button
                  v-if="currentStep < 2"
                  label="Siguiente"
                  icon="pi pi-arrow-right"
                  iconPos="right"
                  :disabled="!canProceed"
                  @click="currentStep++"
                />
                <Button
                  v-else
                  label="Generar Examen"
                  icon="pi pi-sparkles"
                  :loading="generating"
                  :disabled="!canGenerate"
                  @click="handleGenerate"
                />
              </div>
            </div>
          </TabPanel>

          <TabPanel header="Historial" value="history">
            <GenerationHistory
              :generations="aiStore.generations"
              :loading="aiStore.isLoading"
              @view="handleViewGeneration"
              @view-exam="handleViewExam"
            />
          </TabPanel>
        </TabView>
      </div>
    </div>
  </div>

  <!-- Dialog de Detalles de Generación -->
  <Dialog
    v-model:visible="showGenerationDialog"
    :header="selectedGeneration ? `Generación #${selectedGeneration.id}` : ''"
    :style="{ width: '600px' }"
    :modal="true"
  >
    <div v-if="selectedGeneration">
      <div class="grid">
        <div class="col-12">
          <p>
            <strong>Estado:</strong>
            <Tag
              :value="getStatusLabel(selectedGeneration.status)"
              :severity="getStatusSeverity(selectedGeneration.status)"
            />
          </p>
        </div>
        <div class="col-12" v-if="selectedGeneration.exam">
          <p><strong>Examen Generado:</strong> {{ selectedGeneration.exam.title }}</p>
        </div>
        <div class="col-12" v-if="selectedGeneration.processing_time_seconds">
          <p>
            <strong>Tiempo de Procesamiento:</strong>
            {{ selectedGeneration.processing_time_seconds }}s
          </p>
        </div>
        <div class="col-12" v-if="selectedGeneration.error_message">
          <Message severity="error">{{ selectedGeneration.error_message }}</Message>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Steps from 'primevue/steps'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import ProgressBar from 'primevue/progressbar'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import Message from 'primevue/message'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import DocumentUploader from '@/components/exams/ai/DocumentUploader.vue'
import GenerationParameters from '@/components/exams/ai/GenerationParameters.vue'
import GenerationHistory from '@/components/exams/ai/GenerationHistory.vue'
import { useAIExamGenerationStore } from '@/stores/aiExamGeneration'
import type { DocumentUpload, AIExamGeneration, GenerateExamParams, AIUsage } from '@/types'

const router = useRouter()
const toast = useToast()
const aiStore = useAIExamGenerationStore()

const currentStep = ref(0)
const uploadedDocument = ref<DocumentUpload | null>(null)
const generating = ref(false)
const showGenerationDialog = ref(false)
const selectedGeneration = ref<AIExamGeneration | null>(null)
const usage = ref<AIUsage | null>(null)

const formData = ref<GenerateExamParams>({
  document_upload_id: 0,
  title: '',
  description: '',
  parameters: {
    num_questions: 10,
    question_types: ['multiple_choice'],
    difficulty: 'medium',
    include_answer_key: true,
  },
  exam_settings: {
    max_attempts: 1,
    shuffle_questions: false,
    shuffle_options: false,
  },
})

const steps = [{ label: 'Subir PDF' }, { label: 'Configurar' }, { label: 'Revisar' }]

const canProceed = computed(() => {
  if (currentStep.value === 0) {
    return uploadedDocument.value !== null && uploadedDocument.value.status === 'completed'
  }
  if (currentStep.value === 1) {
    return formData.value.title.length > 0 && formData.value.parameters.question_types.length > 0
  }
  return true
})

const canGenerate = computed(() => {
  return canProceed.value && formData.value.document_upload_id > 0
})

const getUsagePercentage = (type: 'exam_generations' | 'answer_analyses'): number => {
  if (!usage.value) return 0
  const limit = usage.value.limits[type]
  if (limit === null) return 0 // Ilimitado
  const current = usage.value.current_usage[type]
  return (current / limit) * 100
}

const getDifficultyLabel = (difficulty?: string): string => {
  const labels: Record<string, string> = {
    easy: 'Fácil',
    medium: 'Media',
    hard: 'Difícil',
  }
  return labels[difficulty || 'medium'] || 'Media'
}

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    processing: 'Procesando',
    completed: 'Completado',
    failed: 'Fallido',
  }
  return labels[status] || status
}

const getStatusSeverity = (status: string): string => {
  const severities: Record<string, string> = {
    pending: 'warning',
    processing: 'info',
    completed: 'success',
    failed: 'danger',
  }
  return severities[status] || 'secondary'
}

const handleDocumentUploaded = async (document: DocumentUpload) => {
  uploadedDocument.value = document
  formData.value.document_upload_id = document.id

  // Poll for document processing status
  if (document.status === 'pending' || document.status === 'processing') {
    toast.add({
      severity: 'info',
      summary: 'Procesando documento',
      detail: 'El documento se está procesando. Por favor espera...',
      life: 3000,
    })

    const processedDocument = await pollDocumentStatus(document.id)

    if (processedDocument) {
      uploadedDocument.value = processedDocument

      if (processedDocument.status === 'completed') {
        currentStep.value = 1
        toast.add({
          severity: 'success',
          summary: 'Documento procesado',
          detail: `El documento se ha procesado correctamente. ${processedDocument.pages_count ? processedDocument.pages_count + ' páginas extraídas.' : ''}`,
          life: 5000,
        })
      } else if (processedDocument.status === 'failed') {
        toast.add({
          severity: 'error',
          summary: 'Error al procesar',
          detail: processedDocument.error_message || 'Error al procesar el documento',
          life: 5000,
        })
      }
    }
  } else if (document.status === 'completed') {
    currentStep.value = 1
    toast.add({
      severity: 'success',
      summary: 'Documento procesado',
      detail: 'El documento se ha procesado correctamente',
      life: 3000,
    })
  }
}

const pollDocumentStatus = async (documentId: number) => {
  try {
    const document = await aiStore.pollDocumentStatus(documentId)
    return document
  } catch (err: any) {
    console.error('Error polling document status:', err)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al verificar el estado del documento',
      life: 3000,
    })
    return null
  }
}

const handleGenerate = async () => {
  try {
    generating.value = true

    await aiStore.generateExam(formData.value)

    toast.add({
      severity: 'success',
      summary: 'Generación iniciada',
      detail: 'El examen se está generando. Recibirás una notificación cuando esté listo.',
      life: 5000,
    })

    // Poll for generation status
    const generation = await aiStore.pollGenerationStatus(aiStore.generations[0]?.id || 0)

    if (generation?.status === 'completed' && generation.exam_id) {
      router.push(`/exams/${generation.exam_id}`)
    } else {
      // Mostrar historial
      currentStep.value = 0
      await aiStore.fetchGenerations()
    }
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.message || 'Error al generar el examen',
      life: 5000,
    })
  } finally {
    generating.value = false
  }
}

const handleViewGeneration = (generation: AIExamGeneration) => {
  selectedGeneration.value = generation
  showGenerationDialog.value = true
}

const handleViewExam = (examId: number) => {
  router.push(`/exams/${examId}`)
}

const goBack = () => {
  router.push('/exams')
}

onMounted(async () => {
  await aiStore.fetchGenerations()
  await aiStore.fetchUsage()
  usage.value = aiStore.usage
})
</script>

<style scoped>
.review-section {
  padding: 1rem;
  background: var(--p-color-surface-50);
  border-radius: 8px;
}
</style>
