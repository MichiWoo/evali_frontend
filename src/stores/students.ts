import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import type { Student, Exam, ExamAttempt } from '@/types'

export const useStudentStore = defineStore('students', () => {
  // State
  const students = ref<Student[]>([])
  const currentStudent = ref<Student | null>(null)
  const studentExams = ref<Exam[]>([])
  const studentAttempts = ref<ExamAttempt[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const getStudentById = computed(
    () => (id: number) => students.value.find((student) => student.id === id),
  )

  const getStudentsByGroup = computed(
    () => (groupId: number) =>
      students.value.filter((student) => student.groups?.some((group) => group.id === groupId)),
  )

  const getStudentStats = computed(() => {
    if (!currentStudent.value) return null

    const attempts = Array.isArray(studentAttempts.value) ? studentAttempts.value : []
    const completedAttempts = attempts.filter((attempt) => attempt.status === 'completed')
    const totalScore = completedAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0)
    const averageScore = completedAttempts.length > 0 ? totalScore / completedAttempts.length : 0

    return {
      totalExams: studentExams.value.length,
      completedExams: completedAttempts.length,
      averageScore: Math.round(averageScore * 100) / 100,
      totalAttempts: attempts.length,
      lastActivity:
        attempts.length > 0
          ? Math.max(...attempts.map((a) => new Date(a.created_at).getTime()))
          : null,
    }
  })

  // Actions
  const fetchStudents = async () => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.getStudents()
      // La respuesta es PaginatedResponse<Student> que tiene la estructura: { data: [...], current_page: 1, ... }
      students.value = response.data || []
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar estudiantes'
      students.value = []
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchStudent = async (id: number) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.getStudent(id)
      currentStudent.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar estudiante'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchStudentExams = async (studentId: number) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.getStudentExams(studentId)
      studentExams.value = response.data || []
      return studentExams.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar exámenes del estudiante'
      studentExams.value = []
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchStudentAttempts = async (studentId: number) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.getStudentExamAttempts(studentId)
      studentAttempts.value = response?.data || []
      return studentAttempts.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar intentos del estudiante'
      studentAttempts.value = []
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createStudent = async (studentData: Partial<Student>) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.post('/students', studentData)
      const newStudent = response.data

      // Add to students array
      students.value.unshift(newStudent)

      return newStudent
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al crear estudiante'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateStudent = async (id: number, studentData: Partial<Student>) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await api.put(`/students/${id}`, studentData)
      const updatedStudent = response.data

      // Update in students array
      const index = students.value.findIndex((s) => s.id === id)
      if (index !== -1) {
        students.value[index] = updatedStudent
      }

      // Update current student if it's the same
      if (currentStudent.value?.id === id) {
        currentStudent.value = updatedStudent
      }

      return updatedStudent
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al actualizar estudiante'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteStudent = async (id: number) => {
    try {
      isLoading.value = true
      error.value = null
      await api.delete(`/students/${id}`)

      // Remove from students array
      students.value = students.value.filter((s) => s.id !== id)

      // Clear current student if it's the same
      if (currentStudent.value?.id === id) {
        currentStudent.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al eliminar estudiante'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const addStudentToGroup = async (studentId: number, groupId: number) => {
    try {
      isLoading.value = true
      error.value = null
      await api.post(`/students/${studentId}/groups`, { group_id: groupId })

      // Refresh student data
      if (currentStudent.value?.id === studentId) {
        await fetchStudent(studentId)
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al agregar estudiante al grupo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const removeStudentFromGroup = async (studentId: number, groupId: number) => {
    try {
      isLoading.value = true
      error.value = null
      await api.delete(`/students/${studentId}/groups/${groupId}`)

      // Refresh student data
      if (currentStudent.value?.id === studentId) {
        await fetchStudent(studentId)
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al remover estudiante del grupo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    students.value = []
    currentStudent.value = null
    studentExams.value = []
    studentAttempts.value = []
    error.value = null
  }

  return {
    // State
    students,
    currentStudent,
    studentExams,
    studentAttempts,
    isLoading,
    error,

    // Getters
    getStudentById,
    getStudentsByGroup,
    getStudentStats,

    // Actions
    fetchStudents,
    fetchStudent,
    fetchStudentExams,
    fetchStudentAttempts,
    createStudent,
    updateStudent,
    deleteStudent,
    addStudentToGroup,
    removeStudentFromGroup,
    clearError,
    reset,
  }
})
