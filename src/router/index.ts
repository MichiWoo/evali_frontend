import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/pages/Landing.vue'),
      meta: {},
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/pages/auth/Login.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/auth/ForgotPasswordView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/views/auth/ResetPasswordView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/verify-email',
      name: 'verify-email',
      component: () => import('@/views/auth/VerifyEmailView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { requiresAuth: true, requiresRole: ['teacher', 'admin'], layout: 'AppLayout' },
    },
    {
      path: '/student/dashboard',
      name: 'student-dashboard',
      component: () => import('@/views/student/StudentDashboardView.vue'),
      meta: { requiresAuth: true, requiresRole: ['student', 'admin'], layout: 'AppLayout' },
    },
    {
      path: '/exams',
      name: 'exams',
      component: () => import('@/views/exams/ExamList.vue'),
      meta: { requiresAuth: true, requiresRole: ['teacher', 'admin'], layout: 'AppLayout' },
    },
    {
      path: '/exams/create',
      name: 'exam-create',
      component: () => import('@/views/exams/ExamCreate.vue'),
      meta: { requiresAuth: true, requiresRole: ['teacher', 'admin'], layout: 'AppLayout' },
    },
    {
      path: '/exams/:id',
      name: 'exam-detail',
      component: () => import('@/views/exams/ExamDetail.vue'),
      meta: { requiresAuth: true, requiresRole: ['teacher', 'admin'], layout: 'AppLayout' },
    },
    {
      path: '/exams/:id/edit',
      name: 'exam-edit',
      component: () => import('@/views/exams/ExamEdit.vue'),
      meta: { requiresAuth: true, requiresRole: ['teacher', 'admin'], layout: 'AppLayout' },
    },
    {
      path: '/exams/:id/questions/create',
      name: 'exam-question-create',
      component: () => import('@/views/exams/ExamQuestionCreate.vue'),
      meta: { requiresAuth: true, requiresRole: ['teacher', 'admin'], layout: 'AppLayout' },
    },
    {
      path: '/exams/ai/generate',
      name: 'ai-exam-generation',
      component: () => import('@/views/exams/AIExamGenerationView.vue'),
      meta: { requiresAuth: true, requiresRole: ['teacher', 'admin'], layout: 'AppLayout' },
    },
    {
      path: '/exams/:id/answers/analyze',
      name: 'answer-analysis',
      component: () => import('@/views/exams/AnswerAnalysisView.vue'),
      meta: { requiresAuth: true, requiresRole: ['teacher', 'admin'], layout: 'AppLayout' },
    },
    {
      path: '/questions',
      name: 'questions',
      component: () => import('@/views/questions/QuestionsView.vue'),
      meta: { requiresAuth: true, requiresRole: ['teacher', 'admin'], layout: 'AppLayout' },
    },
    {
      path: '/questions/create',
      name: 'question-create',
      component: () => import('@/views/questions/QuestionCreateView.vue'),
      meta: { requiresAuth: true, requiresRole: ['teacher', 'admin'], layout: 'AppLayout' },
    },
    {
      path: '/questions/:id',
      name: 'question-detail',
      component: () => import('@/views/questions/QuestionDetailView.vue'),
      meta: { requiresAuth: true, requiresRole: ['teacher', 'admin'], layout: 'AppLayout' },
    },
    {
      path: '/plans',
      name: 'plans',
      component: () => import('@/views/payments/PlanList.vue'),
      meta: { layout: 'AppLayout' },
    },
    {
      path: '/subscriptions',
      name: 'subscriptions',
      component: () => import('@/views/payments/Subscription.vue'),
      meta: { requiresAuth: true, layout: 'AppLayout' },
    },
    {
      path: '/payments',
      name: 'payments',
      component: () => import('@/views/payments/PaymentDashboard.vue'),
      meta: { requiresAuth: true, requiresRole: ['admin'], layout: 'AppLayout' },
    },
    {
      path: '/payments/history',
      name: 'payment-history',
      component: () => import('@/views/payments/PaymentList.vue'),
      meta: { requiresAuth: true, layout: 'AppLayout' },
    },
    {
      path: '/payments/methods',
      name: 'payment-methods',
      component: () => import('@/views/payments/PaymentMethodsView.vue'),
      meta: { requiresAuth: true, layout: 'AppLayout' },
    },
    {
      path: '/payments/invoices',
      name: 'invoices',
      component: () => import('@/views/payments/InvoicesView.vue'),
      meta: { requiresAuth: true, layout: 'AppLayout' },
    },
    {
      path: '/questions/:id/edit',
      name: 'question-edit',
      component: () => import('@/views/questions/QuestionEditView.vue'),
      meta: { requiresAuth: true, requiresRole: ['teacher', 'admin'], layout: 'AppLayout' },
    },
    {
      path: '/grades',
      name: 'grades',
      component: () => import('@/views/results/ResultsDashboard.vue'),
      meta: { requiresAuth: true, requiresRole: ['teacher', 'admin'], layout: 'AppLayout' },
    },
    {
      path: '/grades/groups',
      name: 'grades-groups',
      component: () => import('@/views/results/ResultsByGroup.vue'),
      meta: { requiresAuth: true, requiresRole: ['teacher', 'admin'], layout: 'AppLayout' },
    },
    {
      path: '/grades/exams',
      name: 'grades-exams',
      component: () => import('@/views/results/ResultsByExam.vue'),
      meta: { requiresAuth: true, requiresRole: ['teacher', 'admin'], layout: 'AppLayout' },
    },
    {
      path: '/groups',
      name: 'groups',
      component: () => import('@/views/groups/GroupsView.vue'),
      meta: { requiresAuth: true, requiresRole: ['teacher', 'admin'], layout: 'AppLayout' },
    },
    {
      path: '/groups/manage',
      name: 'groups-manage',
      component: () => import('@/views/groups/GroupsView.vue'),
      meta: { requiresAuth: true, requiresRole: ['teacher', 'admin'], layout: 'AppLayout' },
    },
    {
      path: '/groups/create',
      name: 'group-create',
      component: () => import('@/views/groups/GroupCreateView.vue'),
      meta: { requiresAuth: true, requiresRole: ['teacher', 'admin'], layout: 'AppLayout' },
    },
    {
      path: '/groups/:id',
      name: 'group-detail',
      component: () => import('@/views/groups/GroupDetailView.vue'),
      meta: { requiresAuth: true, requiresRole: ['teacher', 'admin'], layout: 'AppLayout' },
    },
    {
      path: '/groups/:id/edit',
      name: 'group-edit',
      component: () => import('@/views/groups/GroupEditView.vue'),
      meta: { requiresAuth: true, requiresRole: ['teacher', 'admin'], layout: 'AppLayout' },
    },
    // Students Management Routes
    {
      path: '/students',
      name: 'students',
      component: () => import('@/views/students/StudentList.vue'),
      meta: { requiresAuth: true, requiresRole: ['teacher', 'admin'], layout: 'AppLayout' },
    },
    {
      path: '/students/create',
      name: 'student-create',
      component: () => import('@/views/students/StudentCreate.vue'),
      meta: { requiresAuth: true, requiresRole: ['teacher', 'admin'], layout: 'AppLayout' },
    },
    {
      path: '/students/:id',
      name: 'student-detail',
      component: () => import('@/views/students/StudentDetail.vue'),
      meta: { requiresAuth: true, requiresRole: ['teacher', 'admin'], layout: 'AppLayout' },
    },
    {
      path: '/students/:id/edit',
      name: 'student-edit',
      component: () => import('@/views/students/StudentEdit.vue'),
      meta: { requiresAuth: true, requiresRole: ['teacher', 'admin'], layout: 'AppLayout' },
    },
    // Student Exam Routes
    {
      path: '/student/exams',
      name: 'student-exams',
      component: () => import('@/views/student/StudentExamsView.vue'),
      meta: { requiresAuth: true, requiresRole: ['student', 'admin'], layout: 'AppLayout' },
    },
    {
      path: '/student/exams/:id/take',
      name: 'take-exam',
      component: () => import('@/views/student/TakeExamView.vue'),
      meta: { requiresAuth: true, requiresRole: ['student', 'admin'], layout: 'AppLayout' },
    },
    {
      path: '/student/results/:id',
      name: 'exam-results',
      component: () => import('@/views/student/ExamResultsView.vue'),
      meta: { requiresAuth: true, requiresRole: ['student', 'admin'], layout: 'AppLayout' },
    },
    {
      path: '/student/results',
      name: 'student-results',
      component: () => import('@/views/student/StudentResultsView.vue'),
      meta: { requiresAuth: true, requiresRole: ['student', 'admin'], layout: 'AppLayout' },
    },
    // Teacher Results Routes
    {
      path: '/teacher/results',
      name: 'teacher-results',
      component: () => import('@/views/teacher/TeacherResultsView.vue'),
      meta: { requiresAuth: true, requiresRole: ['teacher', 'admin'], layout: 'AppLayout' },
    },
    {
      path: '/teacher/exams/:id/analysis',
      name: 'exam-analysis',
      component: () => import('@/views/teacher/ExamAnalysisView.vue'),
      meta: { requiresAuth: true, requiresRole: ['teacher', 'admin'], layout: 'AppLayout' },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/profile/Profile.vue'),
      meta: { requiresAuth: true, layout: 'AppLayout' },
    },
    {
      path: '/profile/settings',
      name: 'profile-settings',
      component: () => import('@/views/profile/Settings.vue'),
      meta: { requiresAuth: true, layout: 'AppLayout' },
    },
    {
      path: '/profile/security',
      name: 'profile-security',
      component: () => import('@/views/profile/Security.vue'),
      meta: { requiresAuth: true, layout: 'AppLayout' },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/settings/SettingsView.vue'),
      meta: { requiresAuth: true, layout: 'AppLayout' },
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('@/views/notifications/NotificationList.vue'),
      meta: { requiresAuth: true, layout: 'AppLayout' },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/help/About.vue'),
      meta: { layout: 'AppLayout' },
    },
    {
      path: '/support',
      name: 'support',
      component: () => import('@/views/help/Support.vue'),
      meta: { layout: 'AppLayout' },
    },
    {
      path: '/help',
      name: 'help',
      component: () => import('@/views/help/Help.vue'),
      meta: { layout: 'AppLayout' },
    },
    {
      path: '/terms',
      name: 'terms',
      component: () => import('@/views/legal/TermsView.vue'),
      meta: { layout: 'AppLayout' },
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('@/views/legal/PrivacyView.vue'),
      meta: { layout: 'AppLayout' },
    },
    // Admin Routes
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('@/views/admin/UsersManagement.vue'),
      meta: { requiresAuth: true, requiresRole: ['admin'], layout: 'AppLayout' },
    },
    {
      path: '/admin/users/create',
      name: 'admin-user-create',
      component: () => import('@/views/admin/UserCreate.vue'),
      meta: { requiresAuth: true, requiresRole: ['admin'], layout: 'AppLayout' },
    },
    {
      path: '/admin/users/:id',
      name: 'admin-user-detail',
      component: () => import('@/views/admin/UserDetail.vue'),
      meta: { requiresAuth: true, requiresRole: ['admin'], layout: 'AppLayout' },
    },
    {
      path: '/admin/users/:id/edit',
      name: 'admin-user-edit',
      component: () => import('@/views/admin/UserEdit.vue'),
      meta: { requiresAuth: true, requiresRole: ['admin'], layout: 'AppLayout' },
    },
    {
      path: '/admin/settings',
      name: 'admin-settings',
      component: () => import('@/views/admin/Settings.vue'),
      meta: { requiresAuth: true, requiresRole: ['admin'], layout: 'AppLayout' },
    },
    {
      path: '/admin/reports',
      name: 'admin-reports',
      component: () => import('@/views/admin/Reports.vue'),
      meta: { requiresAuth: true, requiresRole: ['admin'], layout: 'AppLayout' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/pages/NotFound.vue'),
    },
  ],
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Initialize auth if not already done
  if (!authStore.user && !authStore.token) {
    await authStore.initializeAuth()

    // Si después de inicializar aún no tiene roles, intentar obtener el perfil
    if (authStore.isAuthenticated && !authStore.userRole) {
      try {
        await authStore.getProfile()
      } catch (error) {
        console.error('Router guard - error fetching profile:', error)
      }
    }
  }

  // Add a small delay to ensure auth is properly initialized
  await new Promise((resolve) => setTimeout(resolve, 50))

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresGuest = to.matched.some((record) => record.meta.requiresGuest)
  const requiresRole = to.meta.requiresRole as string | string[] | undefined
  const isAuthenticated = authStore.isAuthenticated

  // Prevent infinite loops by checking if we're already on the target page
  if (to.path === from.path) {
    next()
    return
  }

  // Prevent auth/login loops
  if (
    to.path.includes('/auth/') &&
    !to.path.includes('/reset-password') &&
    !to.path.includes('/verify-email')
  ) {
    next(to.path.replace('/auth', ''))
    return
  }

  // Redirect authenticated users from landing page to their dashboard
  if (to.path === '/' && isAuthenticated) {
    if (authStore.isStudent) {
      next('/student/dashboard')
    } else if (authStore.isTeacher || authStore.isAdmin) {
      next('/dashboard')
    } else {
      next('/login')
    }
    return
  }

  // Check authentication
  if (requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }

  if (requiresGuest && isAuthenticated) {
    if (authStore.isStudent) {
      next('/student/dashboard')
    } else if (authStore.isTeacher || authStore.isAdmin) {
      next('/dashboard')
    } else {
      next('/')
    }
    return
  }

  // Check role-based permissions
  if (requiresRole && isAuthenticated) {
    const userRole = authStore.userRole
    const allowedRoles = Array.isArray(requiresRole) ? requiresRole : [requiresRole]

    // Check if user has the required role
    const hasRequiredRole = userRole ? allowedRoles.includes(userRole) : false

    if (!hasRequiredRole) {
      // If user has no role, clear auth and redirect to login
      if (!userRole) {
        authStore.clearAuth()
        next('/login')
        return
      }

      // Redirect based on user role
      if (authStore.isStudent) {
        next('/student/dashboard')
      } else if (authStore.isTeacher) {
        next('/dashboard')
      } else if (authStore.isAdmin) {
        next('/dashboard')
      } else {
        next('/login')
      }
      return
    }
  }

  next()
})

export default router
