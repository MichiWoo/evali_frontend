import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Plan, Subscription } from '@/types'
import api from '@/services/api'

export const useSubscriptionStore = defineStore('subscriptions', () => {
  // State
  const plans = ref<Plan[]>([])
  const currentSubscription = ref<Subscription | null>(null)
  const subscriptionHistory = ref<Subscription[]>([])
  const usage = ref<any>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Disabled items state
  const disabledGroups = ref<number[]>([])
  const disabledExams = ref<number[]>([])
  const disabledStudents = ref<number[]>([])

  // Getters
  const freePlan = computed(() => plans.value?.find((plan) => plan.slug === 'free') || null)
  const paidPlans = computed(() => plans.value?.filter((plan) => plan.price_cents > 0) || [])
  const monthlyPlans = computed(
    () => paidPlans.value?.filter((plan) => plan.interval === 'monthly') || [],
  )
  const yearlyPlans = computed(
    () => paidPlans.value?.filter((plan) => plan.interval === 'yearly') || [],
  )
  const isSubscribed = computed(() => currentSubscription.value !== null)
  const currentPlan = computed(() => {
    // Si hay suscripción activa, usar el plan de la suscripción
    if (currentSubscription.value?.plan) {
      return currentSubscription.value.plan
    }

    // Si no hay suscripción pero hay datos de usage con plan, usar ese plan
    if (usage.value?.plan) {
      return usage.value.plan
    }

    // Fallback al plan gratuito
    return freePlan.value
  })

  // Actions
  const fetchPlans = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await api.get('/plans')
      plans.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar los planes'
      console.error('Error fetching plans:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchCurrentSubscription = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await api.get('/subscriptions/me')
      console.log('Raw subscription response:', response.data)

      // Handle different possible response structures
      let subscription = null
      if (response.data.subscription) {
        subscription = response.data.subscription
      } else if (response.data.data && response.data.data.subscription) {
        subscription = response.data.data.subscription
      } else if (response.data.data) {
        subscription = response.data.data
      } else if (response.data) {
        subscription = response.data
      }

      currentSubscription.value = subscription
      console.log('Current subscription fetched:', currentSubscription.value)

      // Si no hay suscripción, crear una gratuita por defecto
      if (!currentSubscription.value) {
        console.log('No subscription found, creating free subscription')
        await createFreeSubscription()
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar la suscripción'
      console.error('Error fetching current subscription:', err)

      // Si hay error, intentar crear suscripción gratuita
      try {
        console.log('Error fetching subscription, creating free subscription')
        await createFreeSubscription()
      } catch (createError) {
        console.error('Error creating free subscription:', createError)
      }
    } finally {
      loading.value = false
    }
  }

  const createFreeSubscription = async () => {
    try {
      // Obtener el plan gratuito
      const freePlan = await api.get('/plans/free')
      console.log('Free plan found:', freePlan.data)

      // Crear suscripción gratuita
      const response = await api.post('/subscriptions', {
        plan_id: freePlan.data.id,
        status: 'active',
      })

      console.log('Raw create subscription response:', response.data)

      // Handle different possible response structures
      let subscription = null
      if (response.data.data) {
        subscription = response.data.data
      } else if (response.data) {
        subscription = response.data
      }

      currentSubscription.value = subscription
      console.log('Free subscription created:', currentSubscription.value)
    } catch (error) {
      console.error('Error creating free subscription:', error)
    }
  }

  const fetchSubscriptionHistory = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await api.get('/subscriptions/history')
      subscriptionHistory.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar el historial'
      console.error('Error fetching subscription history:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchUsage = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await api.get('/subscriptions/usage')
      console.log('Raw usage response:', response.data)

      // Handle different possible response structures
      let usageData = null
      if (response.data.data && response.data.data.current_usage) {
        usageData = response.data.data
      } else if (response.data.current_usage) {
        usageData = response.data
      } else if (response.data.data) {
        usageData = response.data.data
      } else if (response.data) {
        usageData = response.data
      }

      usage.value = usageData
      console.log('Usage fetched:', usage.value)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar el uso'
      console.error('Error fetching usage:', err)
    } finally {
      loading.value = false
    }
  }

  const subscribeToPlan = async (planId: number, paymentMethod?: string) => {
    try {
      loading.value = true
      error.value = null

      // First, create a payment intent
      const paymentIntentResponse = await api.post('/payments/create-intent', {
        plan_id: planId,
      })

      const paymentIntent = paymentIntentResponse.data.payment_intent

      // For now, we'll simulate a successful payment
      // In production, this would integrate with Stripe Elements
      const confirmResponse = await api.post('/payments/confirm', {
        payment_intent_id: paymentIntent.id,
        plan_id: planId,
      })

      const subscription = confirmResponse.data.subscription

      // Update local state
      currentSubscription.value = subscription

      // Obtener el plan objetivo
      const targetPlan = plans.value.find((plan) => plan.id === planId)

      // Verificar si es un downgrade al plan gratuito DESPUÉS de cambiar el plan
      if (targetPlan?.slug === 'free' && currentPlan.value?.slug !== 'free') {
        console.log('Plan changed to free, checking limits...')
        await handleDowngradeToFree()
      }

      // Actualizar elementos deshabilitados después de cambiar el plan
      await fetchDisabledItems()

      return subscription
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al suscribirse al plan'
      console.error('Error subscribing to plan:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const cancelSubscription = async (subscriptionId?: number) => {
    try {
      loading.value = true
      error.value = null
      const id = subscriptionId || currentSubscription.value?.id
      if (!id) throw new Error('No subscription ID provided')

      const response = await api.post(`/subscriptions/${id}/cancel`)
      currentSubscription.value = null
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cancelar la suscripción'
      console.error('Error canceling subscription:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const formatPrice = (priceCents: number, currency: string = 'USD') => {
    const price = priceCents / 100
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
    }).format(price)
  }

  const getPlanFeatures = (plan: Plan) => {
    const features = []

    if (plan.features.ai_evaluation) {
      features.push('Evaluación con IA')
    }
    if (plan.features.advanced_reports) {
      features.push('Reportes avanzados')
    }
    if (plan.features.api_access) {
      features.push('Acceso a API')
    }
    if (plan.features.priority_support) {
      features.push('Soporte prioritario')
    }
    if (plan.features.custom_branding) {
      features.push('Marca personalizada')
    }

    return features
  }

  const getPlanLimits = (plan: Plan) => {
    return {
      groups: plan.max_groups === null ? 'Ilimitados' : plan.max_groups,
      exams: plan.max_exams === null ? 'Ilimitados' : plan.max_exams,
      students: plan.max_students === null ? 'Ilimitados' : plan.max_students,
    }
  }

  const isPlanUpgrade = (targetPlan: Plan) => {
    if (!currentPlan.value) return true
    return targetPlan.price_cents > currentPlan.value.price_cents
  }

  const isPlanDowngrade = (targetPlan: Plan) => {
    if (!currentPlan.value) return false
    return targetPlan.price_cents < currentPlan.value.price_cents
  }

  const canUpgradeToPlan = (targetPlan: Plan) => {
    if (!currentSubscription.value) return true
    return targetPlan.price_cents > (currentPlan.value?.price_cents || 0)
  }

  // Manejar downgrade al plan gratuito
  const handleDowngradeToFree = async () => {
    try {
      console.log('Handling downgrade to free plan...')

      // Obtener el plan gratuito
      const freePlanData = freePlan.value
      if (!freePlanData) {
        throw new Error('Plan gratuito no encontrado')
      }

      // Verificar y manejar límites
      await checkAndEnforceLimits(freePlanData)
    } catch (err: any) {
      console.error('Error handling downgrade to free:', err)
      throw err
    }
  }

  // Verificar y aplicar límites del plan
  const checkAndEnforceLimits = async (plan: Plan) => {
    try {
      // Obtener el uso actual
      await fetchUsage()

      if (!usage.value || !plan) return

      const limits = {
        maxGroups: plan.max_groups || 0,
        maxExams: plan.max_exams || 0,
        maxStudents: plan.max_students || 0,
      }

      const currentUsage = {
        groups: usage.value.current_usage?.groups || 0,
        exams: usage.value.current_usage?.exams || 0,
        students: usage.value.current_usage?.students || 0,
      }

      console.log('Checking limits:', { limits, currentUsage })

      // Verificar si se exceden los límites
      const exceedsLimits = {
        groups: currentUsage.groups > limits.maxGroups,
        exams: currentUsage.exams > limits.maxExams,
        students: currentUsage.students > limits.maxStudents,
      }

      // Si se exceden los límites, deshabilitar elementos
      if (exceedsLimits.groups || exceedsLimits.exams || exceedsLimits.students) {
        await disableExcessItems(exceedsLimits, limits)
      }
    } catch (err: any) {
      console.error('Error checking and enforcing limits:', err)
      throw err
    }
  }

  // Deshabilitar elementos que excedan los límites
  const disableExcessItems = async (exceedsLimits: any, limits: any) => {
    try {
      const promises = []

      // Deshabilitar grupos excedentes
      if (exceedsLimits.groups) {
        promises.push(disableExcessGroups(limits.maxGroups))
      }

      // Deshabilitar exámenes excedentes
      if (exceedsLimits.exams) {
        promises.push(disableExcessExams(limits.maxExams))
      }

      // Deshabilitar estudiantes excedentes
      if (exceedsLimits.students) {
        promises.push(disableExcessStudents(limits.maxStudents))
      }

      await Promise.all(promises)

      console.log('Excess items disabled successfully')
    } catch (err: any) {
      console.error('Error disabling excess items:', err)
      throw err
    }
  }

  // Deshabilitar grupos excedentes (más antiguos primero)
  const disableExcessGroups = async (maxGroups: number) => {
    try {
      const response = await api.get('/groups?per_page=1000&sort=created_at&order=asc')
      const groups = response.data.data || response.data

      if (groups.length > maxGroups) {
        const groupsToDisable = groups.slice(maxGroups)
        const groupIds = groupsToDisable.map((group: any) => group.id)

        if (groupIds.length > 0) {
          await api.post('/groups/disable-batch', { group_ids: groupIds })
          // Marcar como deshabilitados localmente
          disabledGroups.value.push(...groupIds)
          console.log(`Disabled ${groupIds.length} excess groups`)
        }
      }
    } catch (err: any) {
      console.error('Error disabling excess groups:', err)
      throw err
    }
  }

  // Deshabilitar exámenes excedentes (más antiguos primero)
  const disableExcessExams = async (maxExams: number) => {
    try {
      const response = await api.get('/exams?per_page=1000&sort=created_at&order=asc')
      const exams = response.data.data || response.data

      if (exams.length > maxExams) {
        const examsToDisable = exams.slice(maxExams)
        const examIds = examsToDisable.map((exam: any) => exam.id)

        if (examIds.length > 0) {
          await api.post('/exams/disable-batch', { exam_ids: examIds })
          // Marcar como deshabilitados localmente
          disabledExams.value.push(...examIds)
          console.log(`Disabled ${examIds.length} excess exams`)
        }
      }
    } catch (err: any) {
      console.error('Error disabling excess exams:', err)
      throw err
    }
  }

  // Deshabilitar estudiantes excedentes (más antiguos primero)
  const disableExcessStudents = async (maxStudents: number) => {
    try {
      // Obtener estudiantes de todos los grupos del usuario
      const response = await api.get('/groups/students?per_page=1000&sort=created_at&order=asc')
      const students = response.data.data || response.data

      if (students.length > maxStudents) {
        const studentsToDisable = students.slice(maxStudents)
        const studentIds = studentsToDisable.map((student: any) => student.id)

        if (studentIds.length > 0) {
          await api.post('/groups/students/disable-batch', { student_ids: studentIds })
          // Marcar como deshabilitados localmente
          disabledStudents.value.push(...studentIds)
          console.log(`Disabled ${studentIds.length} excess students`)
        }
      }
    } catch (err: any) {
      console.error('Error disabling excess students:', err)
      throw err
    }
  }

  // Métodos para manejar elementos deshabilitados
  const markGroupsAsDisabled = (groupIds: number[]) => {
    disabledGroups.value.push(...groupIds)
  }

  const markExamsAsDisabled = (examIds: number[]) => {
    disabledExams.value.push(...examIds)
  }

  const markStudentsAsDisabled = (studentIds: number[]) => {
    disabledStudents.value.push(...studentIds)
  }

  const isGroupDisabled = (groupId: number) => disabledGroups.value.includes(groupId)
  const isExamDisabled = (examId: number) => disabledExams.value.includes(examId)
  const isStudentDisabled = (studentId: number) => disabledStudents.value.includes(studentId)

  // Verificar si se puede crear un nuevo grupo
  const canCreateGroup = computed(() => {
    const plan = currentPlan.value
    if (!plan) return true // Si no hay plan, permitir crear (fallback)

    const maxGroups = plan.max_groups
    if (maxGroups === null || maxGroups === undefined) return true // Límite ilimitado

    const currentGroups = usage.value?.current_usage?.groups || 0
    return currentGroups < maxGroups
  })

  // Verificar si se puede crear un nuevo examen
  const canCreateExam = computed(() => {
    const plan = currentPlan.value
    if (!plan) return true

    const maxExams = plan.max_exams
    if (maxExams === null || maxExams === undefined) return true

    const currentExams = usage.value?.current_usage?.exams || 0
    return currentExams < maxExams
  })

  // Verificar si se puede agregar un nuevo estudiante
  const canAddStudent = computed(() => {
    const plan = currentPlan.value
    if (!plan) return true

    const maxStudents = plan.max_students
    if (maxStudents === null || maxStudents === undefined) return true

    const currentStudents = usage.value?.current_usage?.students || 0
    return currentStudents < maxStudents
  })

  const fetchDisabledItems = async () => {
    try {
      const currentPlanData = currentPlan.value
      console.log('fetchDisabledItems - currentPlanData:', currentPlanData)

      if (!currentPlanData || currentPlanData.slug !== 'free') {
        // Si no es plan gratuito, limpiar elementos deshabilitados
        console.log('Not free plan, clearing disabled items')
        disabledGroups.value = []
        disabledExams.value = []
        disabledStudents.value = []
        return
      }

      // Obtener todos los grupos del usuario
      const groupsResponse = await api.get('/groups?per_page=1000&sort=created_at&order=asc')
      const allGroups = groupsResponse.data.data || groupsResponse.data
      console.log('fetchDisabledItems - allGroups:', allGroups)

      // Obtener todos los exámenes del usuario
      const examsResponse = await api.get('/exams?per_page=1000&sort=created_at&order=asc')
      const allExams = examsResponse.data.data || examsResponse.data

      // Obtener todos los estudiantes de los grupos del usuario
      const studentsResponse = await api.get(
        '/groups/students?per_page=1000&sort=created_at&order=asc',
      )
      const allStudents = studentsResponse.data.data || studentsResponse.data

      // Calcular cuáles elementos deben estar deshabilitados basándose en los límites del plan
      const maxGroups = currentPlanData.max_groups || 0
      const maxExams = currentPlanData.max_exams || 0
      const maxStudents = currentPlanData.max_students || 0

      // Deshabilitar grupos excedentes (más antiguos primero)
      if (allGroups.length > maxGroups) {
        const groupsToDisable = allGroups.slice(maxGroups)
        disabledGroups.value = groupsToDisable.map((group: any) => group.id)
      } else {
        disabledGroups.value = []
      }

      // Deshabilitar exámenes excedentes (más antiguos primero)
      if (allExams.length > maxExams) {
        const examsToDisable = allExams.slice(maxExams)
        disabledExams.value = examsToDisable.map((exam: any) => exam.id)
      } else {
        disabledExams.value = []
      }

      // Deshabilitar estudiantes excedentes (más antiguos primero)
      if (allStudents.length > maxStudents) {
        const studentsToDisable = allStudents.slice(maxStudents)
        disabledStudents.value = studentsToDisable.map((student: any) => student.id)
      } else {
        disabledStudents.value = []
      }

      console.log('Disabled items calculated based on plan limits:', {
        plan: currentPlanData.name,
        limits: { maxGroups, maxExams, maxStudents },
        current: { groups: allGroups.length, exams: allExams.length, students: allStudents.length },
        disabled: {
          groups: disabledGroups.value,
          exams: disabledExams.value,
          students: disabledStudents.value,
        },
      })
    } catch (error) {
      console.error('Error calculating disabled items:', error)
    }
  }

  const createPaymentIntent = async (planId: number) => {
    try {
      loading.value = true
      error.value = null

      const response = await api.post('/payments/create-intent', {
        plan_id: planId,
      })

      console.log('Payment intent response:', response)
      console.log('Payment intent:', response?.payment_intent)

      return response.payment_intent
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al crear intención de pago'
      console.error('Error creating payment intent:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const confirmPayment = async (paymentIntentId: string, planId: number) => {
    try {
      loading.value = true
      error.value = null

      const response = await api.post('/payments/confirm', {
        payment_intent_id: paymentIntentId,
        plan_id: planId,
      })

      const subscription = response.data.subscription
      currentSubscription.value = subscription

      // Update elements deshabilitados después de cambiar el plan
      await fetchDisabledItems()

      return subscription
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al confirmar pago'
      console.error('Error confirming payment:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getPaymentMethods = async () => {
    try {
      const response = await api.get('/payments/methods')
      // Ensure we have a valid response and return payment_methods array
      if (response && typeof response === 'object' && 'payment_methods' in response) {
        return response.payment_methods || []
      }
      console.warn('Unexpected response structure:', response)
      return []
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al obtener métodos de pago'
      console.error('Error fetching payment methods:', err)
      throw err
    }
  }

  const addPaymentMethod = async (paymentMethodId: string) => {
    try {
      const response = await api.post('/payments/methods', {
        payment_method_id: paymentMethodId,
      })
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al agregar método de pago'
      console.error('Error adding payment method:', err)
      throw err
    }
  }

  const removePaymentMethod = async (paymentMethodId: string) => {
    try {
      const response = await api.delete(`/payments/methods/${paymentMethodId}`)
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al eliminar método de pago'
      console.error('Error removing payment method:', err)
      throw err
    }
  }

  const getPaymentHistory = async (filters?: any) => {
    try {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.payment_method) params.append('payment_method', filters.payment_method)
      if (filters?.date_from) params.append('date_from', filters.date_from)
      if (filters?.date_to) params.append('date_to', filters.date_to)
      if (filters?.search) params.append('search', filters.search)
      if (filters?.per_page) params.append('per_page', filters.per_page.toString())

      const response = await api.get(`/payments/history?${params.toString()}`)
      return response.payments
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al obtener historial de pagos'
      console.error('Error fetching payment history:', err)
      throw err
    }
  }

  const getPaymentStats = async () => {
    try {
      const response = await api.get('/payments/stats')
      return response.stats
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al obtener estadísticas de pagos'
      console.error('Error fetching payment stats:', err)
      throw err
    }
  }

  const getAdminPaymentDashboard = async () => {
    try {
      const response = await api.get('/admin/payments/dashboard')
      return response.stats
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al obtener dashboard de pagos'
      console.error('Error fetching admin payment dashboard:', err)
      throw err
    }
  }

  const getAdminPaymentStats = async () => {
    try {
      const response = await api.get('/admin/payments/stats')
      return response.stats
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al obtener estadísticas de pagos'
      console.error('Error fetching admin payment stats:', err)
      throw err
    }
  }

  const getInvoices = async (filters?: any) => {
    try {
      const params = new URLSearchParams()
      if (filters?.limit) params.append('limit', filters.limit.toString())
      if (filters?.starting_after) params.append('starting_after', filters.starting_after)

      const response = await api.get(`/payments/invoices?${params.toString()}`)
      return {
        invoices: response.invoices || [],
        has_more: response.has_more || false,
        next_page: response.next_page || null,
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al obtener facturas'
      console.error('Error fetching invoices:', err)
      throw err
    }
  }

  const downloadInvoice = async (invoiceId: string) => {
    try {
      const response = await api.post('/payments/invoices/download', {
        invoice_id: invoiceId,
      })
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al descargar la factura'
      console.error('Error downloading invoice:', err)
      throw err
    }
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    plans.value = []
    currentSubscription.value = null
    subscriptionHistory.value = []
    usage.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    plans,
    currentSubscription,
    subscriptionHistory,
    usage,
    loading,
    error,
    disabledGroups,
    disabledExams,
    disabledStudents,

    // Getters
    freePlan,
    paidPlans,
    monthlyPlans,
    yearlyPlans,
    isSubscribed,
    currentPlan,

    // Actions
    fetchPlans,
    fetchCurrentSubscription,
    fetchSubscriptionHistory,
    fetchUsage,
    subscribeToPlan,
    cancelSubscription,
    formatPrice,
    getPlanFeatures,
    getPlanLimits,
    isPlanUpgrade,
    isPlanDowngrade,
    canUpgradeToPlan,
    handleDowngradeToFree,
    checkAndEnforceLimits,
    disableExcessItems,
    disableExcessGroups,
    disableExcessExams,
    disableExcessStudents,
    markGroupsAsDisabled,
    markExamsAsDisabled,
    markStudentsAsDisabled,
    isGroupDisabled,
    isExamDisabled,
    isStudentDisabled,
    canCreateGroup,
    canCreateExam,
    canAddStudent,
    fetchDisabledItems,
    createPaymentIntent,
    confirmPayment,
    getPaymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    getPaymentHistory,
    getPaymentStats,
    getAdminPaymentDashboard,
    getAdminPaymentStats,
    getInvoices,
    downloadInvoice,
    clearError,
    reset,
  }
})
