import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import type { Exam, ExamAttempt } from '@/types'

export const useDashboardStore = defineStore('dashboard', () => {
  // State
  const userStats = ref<any>(null)
  const recentExams = ref<Exam[]>([])
  const recentAttempts = ref<ExamAttempt[]>([])
  const upcomingExams = ref<Exam[]>([])
  const performanceData = ref<any[]>([])
  const notifications = ref<any[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const totalExams = computed(() => recentExams.value.length)
  const totalAttempts = computed(() => {
    // Contar solo intentos completados válidos
    return recentAttempts.value.filter(
      (attempt) => attempt.submitted_at && attempt.score !== null && attempt.score !== undefined,
    ).length
  })
  const averageScore = computed(() => {
    if (recentAttempts.value.length === 0) return 0

    const validAttempts = recentAttempts.value.filter((attempt) => {
      // Filtrar solo intentos completados con datos válidos
      return attempt.submitted_at && attempt.score !== null && attempt.score !== undefined
    })

    if (validAttempts.length === 0) return 0

    const totalScore = validAttempts.reduce((sum, attempt) => {
      // Usar percentage si está disponible, sino calcularlo desde score y total_points
      let percentage = attempt.percentage

      if (percentage === null || percentage === undefined) {
        // Calcular porcentaje si no está disponible
        if (attempt.total_points && attempt.total_points > 0 && attempt.score !== null) {
          percentage = (attempt.score / attempt.total_points) * 100
        } else {
          percentage = 0
        }
      }

      return sum + percentage
    }, 0)

    return Math.round(totalScore / validAttempts.length)
  })
  const completionRate = computed(() => {
    if (recentExams.value.length === 0) return 0
    const completedExams = recentExams.value.filter((exam) =>
      recentAttempts.value.some(
        (attempt) => attempt.exam_id === exam.id && attempt.status === 'completed',
      ),
    ).length
    return Math.round((completedExams / recentExams.value.length) * 100)
  })

  const performanceTrend = computed(() => {
    // Agrupar intentos por semana
    const weeklyData = new Map<string, { score: number; count: number }>()

    recentAttempts.value.forEach((attempt) => {
      if (attempt.completed_at) {
        const date = new Date(attempt.completed_at)
        const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
        const weekKey = weekStart.toISOString().split('T')[0]

        if (!weeklyData.has(weekKey)) {
          weeklyData.set(weekKey, { score: 0, count: 0 })
        }

        const weekData = weeklyData.get(weekKey)!
        weekData.score += attempt.percentage || 0
        weekData.count += 1
      }
    })

    return Array.from(weeklyData.entries())
      .map(([week, data]) => ({
        week,
        averageScore: Math.round(data.score / data.count),
        attempts: data.count,
      }))
      .sort((a, b) => a.week.localeCompare(b.week))
  })

  const examDifficulty = computed(() => {
    const difficultyMap = new Map<string, { count: number; totalScore: number }>()

    recentExams.value.forEach((exam) => {
      const examAttempts = recentAttempts.value.filter((attempt) => attempt.exam_id === exam.id)
      if (examAttempts.length > 0) {
        const averageScore =
          examAttempts.reduce((sum, attempt) => sum + (attempt.percentage || 0), 0) /
          examAttempts.length

        let difficulty = 'easy'
        if (averageScore < 60) difficulty = 'hard'
        else if (averageScore < 80) difficulty = 'medium'

        if (!difficultyMap.has(difficulty)) {
          difficultyMap.set(difficulty, { count: 0, totalScore: 0 })
        }

        const diffData = difficultyMap.get(difficulty)!
        diffData.count += 1
        diffData.totalScore += averageScore
      }
    })

    return Array.from(difficultyMap.entries()).map(([difficulty, data]) => ({
      difficulty,
      count: data.count,
      averageScore: Math.round(data.totalScore / data.count),
    }))
  })

  const recentActivity = computed(() => {
    const activities: any[] = []

    // Agregar exámenes completados
    recentAttempts.value
      .filter((attempt) => attempt.status === 'completed')
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
      .slice(0, 5)
      .forEach((attempt) => {
        activities.push({
          id: `attempt-${attempt.id}`,
          type: 'exam_completed',
          title: `Examen completado: ${attempt.exam?.title}`,
          description: `Calificación: ${attempt.percentage}%`,
          timestamp: attempt.completed_at,
          icon: 'pi pi-check-circle',
          color: 'success',
        })
      })

    // Agregar exámenes creados
    recentExams.value
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3)
      .forEach((exam) => {
        activities.push({
          id: `exam-${exam.id}`,
          type: 'exam_created',
          title: `Nuevo examen: ${exam.title}`,
          description: exam.description || 'Sin descripción',
          timestamp: exam.created_at,
          icon: 'pi pi-file-edit',
          color: 'primary',
        })
      })

    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
  })

  // Actions
  const fetchDashboardData = async (userId?: number) => {
    try {
      isLoading.value = true
      error.value = null

      console.log(
        'DASHBOARD STORE: Fetching dashboard data - token exists:',
        !!localStorage.getItem('auth_token'),
      )

      const endpoint = userId ? `/users/${userId}/dashboard` : '/dashboard'
      console.log('DASHBOARD STORE: Making API call to:', endpoint)
      const response = await api.get(endpoint)

      // El backend devuelve { data: { data: { ... } } }
      const data = response.data?.data || response.data || response

      // Mapear los datos del backend a nuestro estado
      userStats.value = data.stats
      recentExams.value = data.recent_exams || []
      recentAttempts.value = data.recent_attempts || []
      upcomingExams.value = data.available_exams || []
      performanceData.value = data.performanceData || []
      notifications.value = data.recent_notifications || []

      // Debug: Log para verificar los datos recibidos
      console.log('DASHBOARD STORE: Full response data:', data)
      console.log('DASHBOARD STORE: Stats received:', data.stats)
      console.log('DASHBOARD STORE: Average score from backend:', data.stats?.average_score)
      console.log('DASHBOARD STORE: Recent attempts loaded:', recentAttempts.value.length)
      if (recentAttempts.value.length > 0) {
        console.log('DASHBOARD STORE: First attempt sample:', {
          id: recentAttempts.value[0].id,
          percentage: recentAttempts.value[0].percentage,
          score: recentAttempts.value[0].score,
          total_points: recentAttempts.value[0].total_points,
          submitted_at: recentAttempts.value[0].submitted_at,
        })
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar datos del dashboard'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchUserStats = async (userId: number) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await api.get(`/users/${userId}/stats`)
      userStats.value = response.data || response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar estadísticas del usuario'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchRecentExams = async (limit: number = 5) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await api.get(`/exams?limit=${limit}&sort=created_at&order=desc`)
      recentExams.value = response.data || response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar exámenes recientes'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchRecentAttempts = async (limit: number = 10) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await api.get(
        `/student/exam-attempts?limit=${limit}&sort=completed_at&order=desc`,
      )
      recentAttempts.value = response.data || response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar intentos recientes'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchUpcomingExams = async () => {
    try {
      isLoading.value = true
      error.value = null

      const response = await api.get('/student/exams?upcoming=true')
      upcomingExams.value = response.data || response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar exámenes próximos'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchNotifications = async () => {
    try {
      isLoading.value = true
      error.value = null

      const response = await api.get('/notifications')
      notifications.value = response.data || response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar notificaciones'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const markNotificationAsRead = async (notificationId: number) => {
    try {
      await api.put(`/notifications/${notificationId}/read`)
      notifications.value = notifications.value.map((notification) =>
        notification.id === notificationId ? { ...notification, is_read: true } : notification,
      )
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al marcar notificación como leída'
      throw err
    }
  }

  const totalTimeSpent = computed(() => {
    // TODO: Implementar cálculo real de tiempo total
    return '2h 30m'
  })

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    userStats.value = null
    recentExams.value = []
    recentAttempts.value = []
    upcomingExams.value = []
    performanceData.value = []
    notifications.value = []
    error.value = null
  }

  return {
    // State
    userStats,
    recentExams,
    recentAttempts,
    upcomingExams,
    performanceData,
    notifications,
    isLoading,
    error,
    // Getters
    totalExams,
    totalAttempts,
    averageScore,
    completionRate,
    performanceTrend,
    examDifficulty,
    recentActivity,
    totalTimeSpent,
    // Actions
    fetchDashboardData,
    fetchUserStats,
    fetchRecentExams,
    fetchRecentAttempts,
    fetchUpcomingExams,
    fetchNotifications,
    markNotificationAsRead,
    clearError,
    reset,
  }
})
