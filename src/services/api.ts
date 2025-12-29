import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  Exam,
  Question,
  Option,
  Group,
  Plan,
  Subscription,
  CreateExamRequest,
  UpdateExamRequest,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  CreateOptionRequest,
  UpdateOptionRequest,
  PaginatedResponse,
  Student,
} from '@/types'

class ApiService {
  private api: AxiosInstance

  constructor() {
    console.log('ApiService constructor called - initializing interceptors')
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)
    console.log('Final API Base URL:', apiBaseUrl)
    this.api = axios.create({
      baseURL: `${apiBaseUrl}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token')
        console.log('API Request interceptor - URL:', config.url)
        console.log('API Request interceptor - token exists:', !!token)
        if (token) {
          console.log('API Request interceptor - token value:', token.substring(0, 10) + '...')
          config.headers.Authorization = `Bearer ${token}`
          console.log('API Request interceptor - Authorization header set')
        } else {
          console.log('API Request interceptor - NO TOKEN FOUND!')
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      },
    )

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
          window.location.href = '/auth/login'
        }
        return Promise.reject(error)
      },
    )

    console.log('ApiService constructor completed - interceptors configured')
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', credentials)
    return response.data
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register', userData)
    return response.data
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout')
  }

  async getMe(): Promise<{ data: User }> {
    const response: AxiosResponse<{ data: User }> = await this.api.get('/auth/me')
    return response.data
  }

  // Password reset endpoints
  async forgotPassword(email: string): Promise<{ data: { message: string } }> {
    const response: AxiosResponse<{ data: { message: string } }> = await this.api.post(
      '/auth/forgot-password',
      { email },
    )
    return response.data
  }

  async resetPassword(
    token: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ): Promise<{ data: { message: string } }> {
    const response: AxiosResponse<{ data: { message: string } }> = await this.api.post(
      '/auth/reset-password',
      {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      },
    )
    return response.data
  }

  // Email verification endpoints
  async sendVerificationEmail(): Promise<{ data: { message: string } }> {
    const response: AxiosResponse<{ data: { message: string } }> = await this.api.post(
      '/auth/send-verification-email',
    )
    return response.data
  }

  async verifyEmail(id: string, hash: string): Promise<{ data: { message: string } }> {
    const response: AxiosResponse<{ data: { message: string } }> = await this.api.post(
      '/auth/verify-email',
      {
        id,
        hash,
      },
    )
    return response.data
  }

  // Profile endpoints
  async getProfile(): Promise<{ data: User; success?: boolean }> {
    const response: AxiosResponse<{ data: User }> = await this.api.get('/profile')
    return { ...response.data, success: true }
  }

  async updateProfile(
    userData: Partial<User>,
  ): Promise<{ data: User; success?: boolean; message?: string }> {
    const response: AxiosResponse<{ data: User; message?: string }> = await this.api.put(
      '/profile',
      userData,
    )
    return { ...response.data, success: true }
  }

  async changePassword(passwordData: {
    current_password: string
    new_password: string
    new_password_confirmation: string
  }): Promise<{ success: boolean; message?: string; data?: any }> {
    try {
      const response: AxiosResponse<{ message: string }> = await this.api.put('/profile/password', {
        current_password: passwordData.current_password,
        password: passwordData.new_password,
        password_confirmation: passwordData.new_password_confirmation,
      })
      return { ...response.data, success: true }
    } catch (error: unknown) {
      // Re-throw to let the caller handle it
      throw error
    }
  }

  // User endpoints
  async getUsers(): Promise<PaginatedResponse<User>> {
    const response: AxiosResponse<PaginatedResponse<User>> = await this.api.get('/users')
    return response.data
  }

  async getUser(id: number): Promise<{ data: User }> {
    const response: AxiosResponse<{ data: User }> = await this.api.get(`/users/${id}`)
    return response.data
  }

  async updateUser(id: number, userData: Partial<User>): Promise<{ data: User }> {
    const response: AxiosResponse<{ data: User }> = await this.api.put(`/users/${id}`, userData)
    return response.data
  }

  async deleteUser(id: number): Promise<void> {
    await this.api.delete(`/users/${id}`)
  }

  // Student endpoints
  async getStudents(): Promise<PaginatedResponse<Student>> {
    const response: AxiosResponse<{ success: boolean; data: PaginatedResponse<Student> }> =
      await this.api.get('/students')
    return response.data.data
  }

  async getStudent(id: number): Promise<{ data: Student }> {
    const response: AxiosResponse<{ success: boolean; data: Student }> = await this.api.get(
      `/students/${id}`,
    )
    return { data: response.data.data }
  }

  async createStudent(studentData: Partial<Student>): Promise<{ data: Student }> {
    const response: AxiosResponse<{ data: Student }> = await this.api.post('/students', studentData)
    return response.data
  }

  async updateStudent(id: number, studentData: Partial<Student>): Promise<{ data: Student }> {
    const response: AxiosResponse<{ data: Student }> = await this.api.put(
      `/students/${id}`,
      studentData,
    )
    return response.data
  }

  async deleteStudent(id: number): Promise<void> {
    await this.api.delete(`/students/${id}`)
  }

  async searchStudents(query: string): Promise<{ data: Student[] }> {
    const response: AxiosResponse<{ data: Student[] }> = await this.api.get('/students/search', {
      params: { q: query },
    })
    return response.data
  }

  async assignStudentToGroup(studentId: number, groupId: number): Promise<void> {
    await this.api.post(`/students/${studentId}/groups`, { group_id: groupId })
  }

  async removeStudentFromGroup(studentId: number, groupId: number): Promise<void> {
    await this.api.delete(`/students/${studentId}/groups/${groupId}`)
  }

  async getStudentExams(studentId: number): Promise<PaginatedResponse<Exam>> {
    const response: AxiosResponse<{ success: boolean; data: PaginatedResponse<Exam> }> =
      await this.api.get(`/students/${studentId}/exams`)
    return response.data.data
  }

  async getStudentExamAttempts(studentId: number): Promise<{ data: any[] }> {
    const response: AxiosResponse<{ success: boolean; data: { data: any[] } }> = await this.api.get(
      `/students/${studentId}/exam-attempts`,
    )
    return { data: response.data.data.data }
  }

  // Group endpoints
  async getGroups(): Promise<PaginatedResponse<Group>> {
    const response: AxiosResponse<PaginatedResponse<Group>> = await this.api.get('/groups')
    return response.data
  }

  async getGroup(id: number): Promise<{ data: Group }> {
    const response: AxiosResponse<{ data: Group }> = await this.api.get(`/groups/${id}`)
    return response.data
  }

  async createGroup(groupData: Partial<Group>): Promise<{ data: Group }> {
    const response: AxiosResponse<{ data: Group }> = await this.api.post('/groups', groupData)
    return response.data
  }

  async updateGroup(id: number, groupData: Partial<Group>): Promise<{ data: Group }> {
    const response: AxiosResponse<{ data: Group }> = await this.api.put(`/groups/${id}`, groupData)
    return response.data
  }

  async deleteGroup(id: number): Promise<void> {
    await this.api.delete(`/groups/${id}`)
  }

  async addUserToGroup(groupId: number, userId: number): Promise<void> {
    await this.api.post(`/groups/${groupId}/users`, { user_id: userId })
  }

  async removeUserFromGroup(groupId: number, userId: number): Promise<void> {
    await this.api.delete(`/groups/${groupId}/users/${userId}`)
  }

  async getGroupUsers(groupId: number): Promise<{ data: User[] }> {
    const response: AxiosResponse<{ data: User[] }> = await this.api.get(`/groups/${groupId}/users`)
    return response.data
  }

  async getAllStudents(): Promise<{ data: Student[] }> {
    const response: AxiosResponse<{ data: Student[] }> = await this.api.get('/groups/students')
    return response.data
  }

  async getInactiveStudents(): Promise<{ data: Student[] }> {
    const response: AxiosResponse<{ data: Student[] }> = await this.api.get(
      '/groups/students/inactive',
    )
    return response.data
  }

  // Dashboard endpoints
  async getDashboard(userId?: number): Promise<{ data: any }> {
    const endpoint = userId ? `/users/${userId}/dashboard` : '/dashboard'
    const response = await this.api.get(endpoint)
    return response.data
  }

  async getUserStats(userId: number): Promise<{ data: any }> {
    const response = await this.api.get(`/users/${userId}/stats`)
    return response.data
  }

  async getNotifications(): Promise<{ data: any[] }> {
    const response = await this.api.get('/notifications')
    return response.data
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    await this.api.put(`/notifications/${notificationId}/read`)
  }

  async getUnreadNotificationCount(): Promise<{ data: { count: number } }> {
    const response = await this.api.get('/notifications/unread-count')
    return response.data
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await this.api.put('/notifications/mark-all-read')
  }

  // Exam endpoints
  async getExams(): Promise<PaginatedResponse<Exam>> {
    const response: AxiosResponse<PaginatedResponse<Exam>> = await this.api.get('/exams')
    return response.data
  }

  async getExam(id: number): Promise<{ data: Exam }> {
    const response: AxiosResponse<{ data: Exam }> = await this.api.get(`/exams/${id}`)
    return response.data
  }

  async createExam(examData: CreateExamRequest): Promise<{ data: Exam }> {
    const response: AxiosResponse<{ data: Exam }> = await this.api.post('/exams', examData)
    return response.data
  }

  async updateExam(id: number, examData: UpdateExamRequest): Promise<{ data: Exam }> {
    const response: AxiosResponse<{ data: Exam }> = await this.api.put(`/exams/${id}`, examData)
    return response.data
  }

  async deleteExam(id: number): Promise<void> {
    await this.api.delete(`/exams/${id}`)
  }

  async getExamQuestions(examId: number): Promise<{ data: Question[] }> {
    const response = await this.api.get(`/exams/${examId}/questions`)
    return response.data
  }

  async getExamStats(examId: number): Promise<{ data: any }> {
    const response = await this.api.get(`/exams/${examId}/stats`)
    return response.data
  }

  async assignGroupsToExam(examId: number, groupIds: number[]): Promise<{ data: any }> {
    const response = await this.api.post(`/exams/${examId}/groups`, {
      group_ids: groupIds,
    })
    return response.data
  }

  async unassignGroupFromExam(examId: number, groupId: number): Promise<{ data: any }> {
    const response = await this.api.delete(`/exams/${examId}/groups/${groupId}`)
    return response.data
  }

  // Question endpoints
  async getQuestions(examId?: number): Promise<PaginatedResponse<Question>> {
    const params = examId ? { exam_id: examId } : {}
    const response: AxiosResponse<PaginatedResponse<Question>> = await this.api.get('/questions', {
      params,
    })
    return response.data
  }

  async getQuestion(id: number): Promise<{ data: Question }> {
    const response: AxiosResponse<{ data: Question }> = await this.api.get(`/questions/${id}`)
    return response.data
  }

  async createQuestion(questionData: CreateQuestionRequest): Promise<{ data: Question }> {
    const response: AxiosResponse<{ data: Question }> = await this.api.post(
      '/questions',
      questionData,
    )
    return response.data
  }

  async updateQuestion(
    id: number,
    questionData: UpdateQuestionRequest,
  ): Promise<{ data: Question }> {
    const response: AxiosResponse<{ data: Question }> = await this.api.put(
      `/questions/${id}`,
      questionData,
    )
    return response.data
  }

  async deleteQuestion(id: number): Promise<void> {
    await this.api.delete(`/questions/${id}`)
  }

  // Option endpoints
  async getOptions(questionId?: number): Promise<PaginatedResponse<Option>> {
    const params = questionId ? { question_id: questionId } : {}
    const response: AxiosResponse<PaginatedResponse<Option>> = await this.api.get('/options', {
      params,
    })
    return response.data
  }

  async getOption(id: number): Promise<{ data: Option }> {
    const response: AxiosResponse<{ data: Option }> = await this.api.get(`/options/${id}`)
    return response.data
  }

  async createOption(optionData: CreateOptionRequest): Promise<{ data: Option }> {
    const response: AxiosResponse<{ data: Option }> = await this.api.post('/options', optionData)
    return response.data
  }

  async updateOption(id: number, optionData: UpdateOptionRequest): Promise<{ data: Option }> {
    const response: AxiosResponse<{ data: Option }> = await this.api.put(
      `/options/${id}`,
      optionData,
    )
    return response.data
  }

  async deleteOption(id: number): Promise<void> {
    await this.api.delete(`/options/${id}`)
  }

  // Plan endpoints
  async getPlans(): Promise<PaginatedResponse<Plan>> {
    const response: AxiosResponse<PaginatedResponse<Plan>> = await this.api.get('/plans')
    return response.data
  }

  async getPlan(id: number): Promise<{ data: Plan }> {
    const response: AxiosResponse<{ data: Plan }> = await this.api.get(`/plans/${id}`)
    return response.data
  }

  // Subscription endpoints
  async getSubscriptions(): Promise<PaginatedResponse<Subscription>> {
    const response: AxiosResponse<PaginatedResponse<Subscription>> =
      await this.api.get('/subscriptions')
    return response.data
  }

  async getSubscription(id: number): Promise<{ data: Subscription }> {
    const response: AxiosResponse<{ data: Subscription }> = await this.api.get(
      `/subscriptions/${id}`,
    )
    return response.data
  }

  // Student Exam endpoints
  async createExamAttempt(examId: number, data: any): Promise<{ data: any }> {
    const response = await this.api.post(`/exams/${examId}/attempts`, data)
    return response.data
  }

  async submitExamAttempt(attemptId: number, data: any): Promise<{ data: any }> {
    const response = await this.api.post(`/exam-attempts/${attemptId}/submit`, data)
    return response.data
  }

  async getStudentExamsList(all: boolean = false): Promise<{ data: Exam[] }> {
    const response = await this.api.get('/student/exams', {
      params: all ? { all: true, limit: 1000 } : {},
    })
    return response.data
  }

  async getStudentAttempts(): Promise<{ data: any[] }> {
    const response = await this.api.get('/student/exam-attempts', {
      params: { limit: 1000 },
    })
    return response.data
  }

  async getStudentResults(): Promise<{ data: any[] }> {
    const response = await this.api.get('/student/results', {
      params: { limit: 1000 },
    })
    return response.data
  }

  async getUserAttempts(userId?: number): Promise<PaginatedResponse<any>> {
    const endpoint = userId ? `/students/${userId}/exam-attempts` : '/student/exam-attempts'
    const response = await this.api.get(endpoint)
    return response.data
  }

  async getAttemptDetails(attemptId: number): Promise<{ data: any }> {
    const response = await this.api.get(`/exam-attempts/${attemptId}`)
    return response.data
  }

  // Generic methods for custom endpoints
  async get(endpoint: string, config?: any): Promise<any> {
    const response = await this.api.get(endpoint, config)
    return response.data
  }

  async post(endpoint: string, data?: any, config?: any): Promise<any> {
    const response = await this.api.post(endpoint, data, config)
    return response.data
  }

  async put(endpoint: string, data?: any, config?: any): Promise<any> {
    const response = await this.api.put(endpoint, data, config)
    return response.data
  }

  async delete(endpoint: string, config?: any): Promise<any> {
    const response = await this.api.delete(endpoint, config)
    return response.data
  }

  // Generic method for custom endpoints with query parameters
  async getWithParams(endpoint: string, params?: Record<string, any>): Promise<{ data: any }> {
    const response = await this.api.get(endpoint, { params })
    return response.data
  }

  async getBlob(endpoint: string, config?: any): Promise<any> {
    const response = await this.api.get(endpoint, { ...config, responseType: 'blob' })
    return response
  }

  // Admin Settings endpoints
  async getSystemSettings(): Promise<{ data: any }> {
    const response = await this.api.get('/admin/settings')
    return response.data
  }

  async updateSystemSettings(settings: any): Promise<{ data: any }> {
    const response = await this.api.put('/admin/settings', settings)
    return response.data
  }

  async getSystemStatus(): Promise<{ data: any }> {
    const response = await this.api.get('/admin/settings/status')
    return response.data
  }

  // Admin Reports endpoints
  async getAdminOverviewStats(): Promise<{ data: any }> {
    const response = await this.api.get('/admin/reports/overview')
    return response.data
  }

  async getAdminUserAnalytics(period: string = '6months'): Promise<{ data: any }> {
    const response = await this.api.get(`/admin/reports/users?period=${period}`)
    return response.data
  }

  async getAdminExamAnalytics(period: string = '6months'): Promise<{ data: any }> {
    const response = await this.api.get(`/admin/reports/exams?period=${period}`)
    return response.data
  }

  async getAdminPaymentAnalytics(period: string = '6months'): Promise<{ data: any }> {
    const response = await this.api.get(`/admin/reports/payments?period=${period}`)
    return response.data
  }

  async getAdminSystemAnalytics(): Promise<{ data: any }> {
    const response = await this.api.get('/admin/reports/system')
    return response.data
  }

  async exportAdminReports(): Promise<Blob> {
    const response = await this.api.get('/admin/reports/export', { responseType: 'blob' })
    return response.data as Blob
  }

  // Results endpoints for Grades page
  async getResultsStatistics(params?: Record<string, any>): Promise<{ data: any }> {
    const response = await this.api.get('/results/statistics', { params })
    return response.data
  }

  async getResultsByGroup(groupId: number, params?: Record<string, any>): Promise<{ data: any }> {
    const response = await this.api.get(`/results/groups/${groupId}`, { params })
    return response.data
  }

  async getResultsByExam(examId: number, params?: Record<string, any>): Promise<{ data: any }> {
    const response = await this.api.get(`/results/exams/${examId}`, { params })
    return response.data
  }

  async exportResults(
    type: 'excel' | 'pdf' = 'excel',
    params?: Record<string, any>,
  ): Promise<Blob> {
    const response = await this.api.get(`/results/export/${type}`, { params, responseType: 'blob' })
    return response.data as Blob
  }

  // AI Exam Generation endpoints
  async uploadDocument(file: File): Promise<{ success: boolean; data: any }> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await this.api.post('/exams/ai/upload-document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async generateExam(params: any): Promise<{ success: boolean; data: any }> {
    const response = await this.api.post('/exams/ai/generate', params)
    return response.data
  }

  async getGenerations(
    params?: Record<string, any>,
  ): Promise<{ success: boolean; data: any[]; meta: any }> {
    const response = await this.api.get('/exams/ai/generations', { params })
    return response.data
  }

  async getGeneration(id: number): Promise<{ success: boolean; data: any }> {
    const response = await this.api.get(`/exams/ai/generations/${id}`)
    return response.data
  }

  async getAIUsage(): Promise<{ success: boolean; data: any }> {
    const response = await this.api.get('/exams/ai/usage')
    return response.data
  }

  // AI Answer Analysis endpoints
  async analyzeAnswer(
    examId: number,
    answerId: number,
    params?: any,
  ): Promise<{ success: boolean; data: any }> {
    const response = await this.api.post(`/exams/${examId}/answers/${answerId}/analyze`, params)
    return response.data
  }

  async getAnalysis(examId: number, answerId: number): Promise<{ success: boolean; data: any }> {
    const response = await this.api.get(`/exams/${examId}/answers/${answerId}/analysis`)
    return response.data
  }

  async getAnalyses(
    examId: number,
    params?: Record<string, any>,
  ): Promise<{ success: boolean; data: any[]; meta: any }> {
    const response = await this.api.get(`/exams/${examId}/answers/analyses`, { params })
    return response.data
  }
}

export default new ApiService()
