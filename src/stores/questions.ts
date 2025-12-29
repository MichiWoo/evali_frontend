import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Question, CreateQuestionRequest, UpdateQuestionRequest } from '@/types'
import api from '@/services/api.ts'

export const useQuestionStore = defineStore('questions', () => {
  // State
  const questions = ref<Question[]>([])
  const currentQuestion = ref<Question | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const questionCount = computed(() => questions.value.length)
  const questionsByType = computed(
    () => (type: string) => questions.value.filter((question) => question.type === type),
  )
  const questionById = computed(
    () => (id: number) => questions.value.find((question) => question.id === id),
  )
  const totalPoints = computed(() =>
    questions.value.reduce((total, question) => total + question.points, 0),
  )

  // Actions
  const fetchQuestions = async (examId?: number) => {
    try {
      isLoading.value = true
      error.value = null
      const url = examId ? `/questions?exam_id=${examId}` : '/questions'
      console.log('QUESTIONS STORE: Making API call to:', url)
      const response = await api.get(url)
      questions.value = response?.data?.data || []
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error fetching questions'
      questions.value = []
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchQuestion = async (id: number) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.get(`/questions/${id}`)
      currentQuestion.value = response.data

      // Update in questions array if exists
      const index = questions.value.findIndex((question) => question.id === id)
      if (index !== -1) {
        questions.value[index] = response.data
      }

      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error fetching question'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createQuestion = async (questionData: CreateQuestionRequest) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.post('/questions', questionData)
      const newQuestion = response.data
      questions.value.unshift(newQuestion)
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error creating question'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateQuestion = async (id: number, questionData: UpdateQuestionRequest) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.put(`/questions/${id}`, questionData)

      // Update in questions array
      const index = questions.value.findIndex((question) => question.id === id)
      if (index !== -1) {
        questions.value[index] = response.data
      }

      // Update current question if it's the same
      if (currentQuestion.value?.id === id) {
        currentQuestion.value = response.data
      }

      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error updating question'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteQuestion = async (id: number) => {
    try {
      isLoading.value = true
      error.value = null
      await api.delete(`/questions/${id}`)

      // Remove from questions array
      const index = questions.value.findIndex((question) => question.id === id)
      if (index !== -1) {
        questions.value.splice(index, 1)
      }

      // Clear current question if it's the same
      if (currentQuestion.value?.id === id) {
        currentQuestion.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error deleting question'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const setCurrentQuestion = (question: Question | null) => {
    currentQuestion.value = question
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    questions.value = []
    currentQuestion.value = null
    isLoading.value = false
    error.value = null
  }

  return {
    // State
    questions,
    currentQuestion,
    isLoading,
    error,

    // Getters
    questionCount,
    questionsByType,
    questionById,
    totalPoints,

    // Actions
    fetchQuestions,
    fetchQuestion,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    setCurrentQuestion,
    clearError,
    reset,
  }
})
