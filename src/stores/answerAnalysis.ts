import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AIAnswerAnalysis, AnalyzeAnswerParams } from '@/types'
import api from '@/services/api'

export const useAnswerAnalysisStore = defineStore('answerAnalysis', () => {
  // State
  const analyses = ref<AIAnswerAnalysis[]>([])
  const currentAnalysis = ref<AIAnswerAnalysis | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const completedAnalyses = computed(() => analyses.value.filter((a) => a.status === 'completed'))
  const processingAnalyses = computed(() => analyses.value.filter((a) => a.status === 'processing'))

  // Actions
  const analyzeAnswer = async (
    examId: number,
    answerId: number,
    params: AnalyzeAnswerParams = {},
  ) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await api.post(`/exams/${examId}/answers/${answerId}/analyze`, params)

      if (response.success) {
        // Poll for status
        await pollAnalysisStatus(examId, answerId)
        return response.data
      }

      throw new Error('Error al analizar la respuesta')
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al analizar la respuesta'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchAnalysis = async (examId: number, answerId: number) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await api.get(`/exams/${examId}/answers/${answerId}/analysis`)

      if (response.success && response.data) {
        currentAnalysis.value = response.data

        const index = analyses.value.findIndex((a) => a.answer_id === answerId)
        if (index !== -1) {
          analyses.value[index] = response.data
        } else {
          analyses.value.push(response.data)
        }

        return response.data
      }

      throw new Error('Error al obtener análisis')
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al obtener análisis'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchAnalyses = async (examId: number) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await api.getAnalyses(examId)

      if (response.success && response.data) {
        analyses.value = response.data
        return response
      }

      throw new Error('Error al obtener análisis')
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al obtener análisis'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const pollAnalysisStatus = async (
    examId: number,
    answerId: number,
    maxAttempts = 20,
    interval = 2000,
  ) => {
    let attempts = 0

    const poll = async (): Promise<AIAnswerAnalysis | null> => {
      attempts++

      try {
        const analysis = await fetchAnalysis(examId, answerId)

        if (!analysis) {
          return null
        }

        if (analysis.status === 'completed' || analysis.status === 'failed') {
          return analysis
        }

        if (attempts >= maxAttempts) {
          return analysis
        }

        await new Promise((resolve) => setTimeout(resolve, interval))
        return poll()
      } catch {
        // Si no existe aún, esperar y reintentar
        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, interval))
          return poll()
        }
        return null
      }
    }

    return poll()
  }

  return {
    // State
    analyses,
    currentAnalysis,
    isLoading,
    error,
    // Getters
    completedAnalyses,
    processingAnalyses,
    // Actions
    analyzeAnswer,
    fetchAnalysis,
    fetchAnalyses,
    pollAnalysisStatus,
  }
})
