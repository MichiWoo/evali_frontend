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
          <h1 class="text-3xl font-bold m-0">Análisis de Respuestas Abiertas con IA</h1>
        </div>
        <p class="text-muted-color mb-6">
          Analiza respuestas abiertas de estudiantes con inteligencia artificial para obtener
          feedback y sugerencias de calificación
        </p>

        <div v-if="loadingExam" class="text-center py-4">
          <ProgressSpinner />
          <p class="mt-3">Cargando examen...</p>
        </div>

        <div v-else-if="exam">
          <Card class="mb-4">
            <template #title>
              <div class="flex align-items-center justify-content-between">
                <span>{{ exam.title }}</span>
                <Button
                  label="Ver Examen"
                  icon="pi pi-external-link"
                  text
                  size="small"
                  @click="viewExam"
                />
              </div>
            </template>
            <template #content>
              <p v-if="exam.description">{{ exam.description }}</p>
            </template>
          </Card>

          <div v-if="loadingAnswers" class="text-center py-4">
            <ProgressSpinner />
            <p class="mt-3">Cargando respuestas...</p>
          </div>

          <div v-else-if="openAnswers.length === 0" class="text-center py-8">
            <i class="pi pi-inbox text-6xl text-muted-color mb-4"></i>
            <p class="text-lg text-muted-color">No hay respuestas abiertas para este examen</p>
          </div>

          <div v-else class="grid">
            <div v-for="answer in openAnswers" :key="answer.id" class="col-12">
              <Card class="mb-4">
                <template #title>
                  <div class="flex align-items-center justify-content-between">
                    <div>
                      <span
                        >Respuesta de
                        {{
                          answer.user?.name || answer.exam_user?.user?.name || 'Estudiante'
                        }}</span
                      >
                      <Tag
                        v-if="answer.ai_analysis"
                        :value="getAnalysisStatusLabel(answer.ai_analysis.status)"
                        :severity="getAnalysisStatusSeverity(answer.ai_analysis.status)"
                        class="ml-2"
                      />
                    </div>
                    <Button
                      v-if="!answer.ai_analysis || answer.ai_analysis.status === 'failed'"
                      label="Analizar con IA"
                      icon="pi pi-sparkles"
                      :loading="analyzingAnswerId === answer.id"
                      @click="analyzeAnswer(answer)"
                      :disabled="!canAnalyze"
                    />
                  </div>
                </template>
                <template #content>
                  <div class="grid">
                    <div class="col-12">
                      <h4 class="mb-2">Pregunta</h4>
                      <p class="p-3 bg-surface-100 border-round mb-3">
                        {{ answer.question?.text }}
                      </p>
                    </div>

                    <div class="col-12">
                      <h4 class="mb-2">Respuesta del Estudiante</h4>
                      <p class="p-3 bg-surface-50 border-round mb-3">
                        {{ answer.response_text || answer.text_answer || 'Sin respuesta' }}
                      </p>
                    </div>

                    <div v-if="answer.ai_analysis" class="col-12">
                      <AnalysisResult :analysis="answer.ai_analysis" />
                    </div>

                    <div v-else-if="analyzingAnswerId === answer.id" class="col-12">
                      <div class="text-center py-4">
                        <ProgressSpinner />
                        <p class="mt-3">Analizando respuesta...</p>
                      </div>
                    </div>
                  </div>
                </template>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import AnalysisResult from '@/components/exams/ai/AnalysisResult.vue'
import { useAnswerAnalysisStore } from '@/stores/answerAnalysis'
import { useAIExamGenerationStore } from '@/stores/aiExamGeneration'
import { useExamStore } from '@/stores/exams'
import api from '@/services/api'
import type { Answer, Exam, AIAnswerAnalysis } from '@/types'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const answerAnalysisStore = useAnswerAnalysisStore()
const aiStore = useAIExamGenerationStore()
const examStore = useExamStore()

const examId = computed(() => parseInt(route.params.id as string))
const exam = ref<Exam | null>(null)
const openAnswers = ref<(Answer & { ai_analysis?: AIAnswerAnalysis })[]>([])
const loadingExam = ref(false)
const loadingAnswers = ref(false)
const analyzingAnswerId = ref<number | null>(null)
const canAnalyze = ref(true)

const getAnalysisStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    processing: 'Procesando',
    completed: 'Completado',
    failed: 'Fallido',
  }
  return labels[status] || status
}

const getAnalysisStatusSeverity = (status: string): string => {
  const severities: Record<string, string> = {
    pending: 'warning',
    processing: 'info',
    completed: 'success',
    failed: 'danger',
  }
  return severities[status] || 'secondary'
}

const loadExam = async () => {
  try {
    loadingExam.value = true
    const response = await examStore.fetchExam(examId.value)
    exam.value = response.data
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo cargar el examen',
      life: 5000,
    })
  } finally {
    loadingExam.value = false
  }
}

const loadAnswers = async () => {
  try {
    loadingAnswers.value = true

    // Obtener preguntas abiertas del examen
    const questionsResponse = await api.getExamQuestions(examId.value)
    const openQuestions = questionsResponse.data.filter((q: any) => q.type === 'open')

    if (openQuestions.length === 0) {
      openAnswers.value = []
      return
    }

    // Obtener respuestas para estas preguntas
    // Nota: Necesitamos un endpoint que devuelva respuestas abiertas de un examen
    // Por ahora, usaremos el endpoint de análisis que lista todas las respuestas
    const analysesResponse = await answerAnalysisStore.fetchAnalyses(examId.value)

    // Mapear análisis a respuestas (esto es una aproximación)
    // En producción, necesitarías un endpoint específico para obtener respuestas abiertas
    openAnswers.value = [] // Se completará cuando tengamos el endpoint correcto
  } catch (err: any) {
    console.error('Error loading answers:', err)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las respuestas',
      life: 5000,
    })
  } finally {
    loadingAnswers.value = false
  }
}

const analyzeAnswer = async (answer: Answer) => {
  try {
    analyzingAnswerId.value = answer.id
    canAnalyze.value = false

    await answerAnalysisStore.analyzeAnswer(examId.value, answer.id, {
      include_feedback: true,
      include_score_suggestion: true,
    })

    toast.add({
      severity: 'success',
      summary: 'Análisis iniciado',
      detail: 'El análisis está en proceso. Recibirás una notificación cuando esté listo.',
      life: 5000,
    })

    // Poll for analysis status
    const analysis = await answerAnalysisStore.pollAnalysisStatus(examId.value, answer.id)

    if (analysis) {
      // Actualizar la respuesta con el análisis
      const answerIndex = openAnswers.value.findIndex((a) => a.id === answer.id)
      if (answerIndex !== -1) {
        openAnswers.value[answerIndex] = {
          ...openAnswers.value[answerIndex],
          ai_analysis: analysis,
        }
      }
    }
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.message || 'Error al analizar la respuesta',
      life: 5000,
    })
  } finally {
    analyzingAnswerId.value = null
    canAnalyze.value = true
  }
}

const viewExam = () => {
  router.push(`/exams/${examId.value}`)
}

const goBack = () => {
  router.push(`/exams/${examId.value}`)
}

onMounted(async () => {
  await loadExam()
  await loadAnswers()
  await aiStore.fetchUsage()

  // Verificar límites
  if (aiStore.usage) {
    const remaining = aiStore.usage.remaining.answer_analyses
    if (remaining !== null && remaining <= 0) {
      canAnalyze.value = false
      toast.add({
        severity: 'warn',
        summary: 'Límite alcanzado',
        detail: 'Has alcanzado tu límite mensual de análisis de respuestas',
        life: 5000,
      })
    }
  }
})
</script>

<style scoped>
.answer-card {
  margin-bottom: 1.5rem;
}
</style>
