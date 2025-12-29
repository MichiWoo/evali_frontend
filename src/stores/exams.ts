import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Exam,
  CreateExamRequest,
  UpdateExamRequest,
  CreateExamBackendRequest,
  UpdateExamBackendRequest,
  PaginatedResponse,
} from '@/types'
import api from '@/services/api'

export const useExamStore = defineStore('exams', () => {
  // State
  const exams = ref<Exam[]>([])
  const currentExam = ref<Exam | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const examCount = computed(() => exams.value.length)
  const activeExams = computed(() =>
    exams.value.filter((exam) => exam.shuffle_questions !== undefined),
  )
  const examById = computed(() => (id: number) => exams.value.find((exam) => exam.id === id))

  // Actions
  const fetchExams = async () => {
    try {
      isLoading.value = true
      error.value = null
      const response = (await api.getExams()) as any
      // api.getExams() retorna { data: PaginatedResponse<Exam> }, los exámenes están en response.data.data
      exams.value = response?.data?.data || []
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error fetching exams'
      exams.value = []
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchExam = async (id: number) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.getExam(id)
      currentExam.value = response.data

      // Update in exams array if exists
      const index = exams.value.findIndex((exam) => exam.id === id)
      if (index !== -1) {
        exams.value[index] = response.data
      }

      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error fetching exam'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createExam = async (examData: CreateExamRequest | CreateExamBackendRequest) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.createExam(examData)
      const newExam = response.data
      exams.value.unshift(newExam)
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error creating exam'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateExam = async (id: number, examData: UpdateExamRequest | UpdateExamBackendRequest) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.updateExam(id, examData)

      // Update in exams array
      const index = exams.value.findIndex((exam) => exam.id === id)
      if (index !== -1) {
        exams.value[index] = response.data
      }

      // Update current exam if it's the same
      if (currentExam.value?.id === id) {
        currentExam.value = response.data
      }

      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error updating exam'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteExam = async (id: number) => {
    try {
      isLoading.value = true
      error.value = null
      await api.deleteExam(id)

      // Remove from exams array
      const index = exams.value.findIndex((exam) => exam.id === id)
      if (index !== -1) {
        exams.value.splice(index, 1)
      }

      // Clear current exam if it's the same
      if (currentExam.value?.id === id) {
        currentExam.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error deleting exam'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const assignGroupsToExam = async (examId: number, groupIds: number[]) => {
    try {
      isLoading.value = true
      error.value = null

      // El backend ahora usa sync() para reemplazar todos los grupos
      const response = await api.post(`/exams/${examId}/groups`, {
        group_ids: groupIds,
      })

      // Update current exam if it's the same
      if (currentExam.value?.id === examId) {
        currentExam.value = response.data.data
      }

      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error assigning groups to exam'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const unassignGroupFromExam = async (examId: number, groupId: number) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.delete(`/exams/${examId}/groups/${groupId}`)

      // Update current exam if it's the same
      if (currentExam.value?.id === examId) {
        currentExam.value = response.data.data
      }

      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error unassigning group from exam'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const setCurrentExam = (exam: Exam | null) => {
    currentExam.value = exam
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    exams.value = []
    currentExam.value = null
    isLoading.value = false
    error.value = null
  }

  return {
    // State
    exams,
    currentExam,
    isLoading,
    error,

    // Getters
    examCount,
    activeExams,
    examById,

    // Actions
    fetchExams,
    fetchExam,
    createExam,
    updateExam,
    deleteExam,
    assignGroupsToExam,
    unassignGroupFromExam,
    setCurrentExam,
    clearError,
    reset,
  }
})
