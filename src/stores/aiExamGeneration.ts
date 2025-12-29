import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DocumentUpload, AIExamGeneration, AIUsage, GenerateExamParams } from '@/types'
import api from '@/services/api'

export const useAIExamGenerationStore = defineStore('aiExamGeneration', () => {
  // State
  const documentUploads = ref<DocumentUpload[]>([])
  const generations = ref<AIExamGeneration[]>([])
  const currentGeneration = ref<AIExamGeneration | null>(null)
  const usage = ref<AIUsage | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const completedGenerations = computed(() =>
    generations.value.filter((g) => g.status === 'completed'),
  )
  const processingGenerations = computed(() =>
    generations.value.filter((g) => g.status === 'processing'),
  )
  const failedGenerations = computed(() => generations.value.filter((g) => g.status === 'failed'))

  // Actions
  const uploadDocument = async (file: File) => {
    try {
      isLoading.value = true
      error.value = null

      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post('/exams/ai/upload-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.success && response.data) {
        documentUploads.value.push(response.data)
        return response.data
      }

      throw new Error('Error al subir el documento')
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al subir el documento'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const generateExam = async (params: GenerateExamParams) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await api.post('/exams/ai/generate', params)

      if (response.success && response.data) {
        const generation = await fetchGenerationStatus(response.data.generation_id)
        if (generation) {
          generations.value.unshift(generation)
        }
        return response.data
      }

      throw new Error('Error al generar el examen')
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al generar el examen'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchGenerations = async (status?: string) => {
    try {
      isLoading.value = true
      error.value = null

      const params = status ? { status } : {}
      const response = await api.get('/exams/ai/generations', { params })

      if (response.success && response.data) {
        generations.value = response.data
        return response
      }

      throw new Error('Error al obtener generaciones')
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al obtener generaciones'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchGenerationStatus = async (id: number) => {
    try {
      const response = await api.get(`/exams/ai/generations/${id}`)

      if (response.success && response.data) {
        const index = generations.value.findIndex((g) => g.id === id)
        if (index !== -1) {
          generations.value[index] = response.data
        } else {
          generations.value.push(response.data)
        }

        if (currentGeneration.value?.id === id) {
          currentGeneration.value = response.data
        }

        return response.data
      }

      return null
    } catch (err: any) {
      console.error('Error fetching generation status:', err)
      return null
    }
  }

  const fetchUsage = async () => {
    try {
      const response = await api.get('/exams/ai/usage')

      if (response.success && response.data) {
        usage.value = response.data
        return response.data
      }

      throw new Error('Error al obtener uso')
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al obtener uso'
      throw err
    }
  }

  const fetchDocumentStatus = async (id: number) => {
    try {
      const response = await api.get(`/exams/ai/documents/${id}`)

      if (response.success && response.data) {
        const index = documentUploads.value.findIndex((d) => d.id === id)
        if (index !== -1) {
          documentUploads.value[index] = response.data
        } else {
          documentUploads.value.push(response.data)
        }

        return response.data
      }

      return null
    } catch (err: any) {
      console.error('Error fetching document status:', err)
      return null
    }
  }

  const pollDocumentStatus = async (id: number, maxAttempts = 60, interval = 2000) => {
    let attempts = 0

    const poll = async (): Promise<DocumentUpload | null> => {
      attempts++
      const document = await fetchDocumentStatus(id)

      if (!document) {
        return null
      }

      if (document.status === 'completed' || document.status === 'failed') {
        return document
      }

      if (attempts >= maxAttempts) {
        return document
      }

      await new Promise((resolve) => setTimeout(resolve, interval))
      return poll()
    }

    return poll()
  }

  const pollGenerationStatus = async (id: number, maxAttempts = 30, interval = 2000) => {
    let attempts = 0

    const poll = async (): Promise<AIExamGeneration | null> => {
      attempts++
      const generation = await fetchGenerationStatus(id)

      if (!generation) {
        return null
      }

      if (generation.status === 'completed' || generation.status === 'failed') {
        return generation
      }

      if (attempts >= maxAttempts) {
        return generation
      }

      await new Promise((resolve) => setTimeout(resolve, interval))
      return poll()
    }

    return poll()
  }

  return {
    // State
    documentUploads,
    generations,
    currentGeneration,
    usage,
    isLoading,
    error,
    // Getters
    completedGenerations,
    processingGenerations,
    failedGenerations,
    // Actions
    uploadDocument,
    generateExam,
    fetchGenerations,
    fetchGenerationStatus,
    fetchDocumentStatus,
    fetchUsage,
    pollDocumentStatus,
    pollGenerationStatus,
  }
})
