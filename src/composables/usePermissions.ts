import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export function usePermissions() {
  const authStore = useAuthStore()

  // Computed properties for role checks
  const isAdmin = computed(() => authStore.isAdmin)
  const isTeacher = computed(() => authStore.isTeacher)
  const isStudent = computed(() => authStore.isStudent)

  // Permission checks
  const canManageExams = computed(() => authStore.hasPermission('manage_exams') || isAdmin.value)

  const canManageQuestions = computed(
    () => authStore.hasPermission('manage_questions') || isAdmin.value,
  )

  const canManageGroups = computed(() => authStore.hasPermission('manage_groups') || isAdmin.value)

  const canManageUsers = computed(() => authStore.hasPermission('manage_users') || isAdmin.value)

  const canViewReports = computed(() => authStore.hasPermission('view_reports') || isAdmin.value)

  const canTakeExams = computed(() => authStore.hasPermission('take_exams') || isStudent.value)

  const canViewOwnData = computed(() => authStore.hasPermission('view_own_data') || isAdmin.value)

  // Navigation permissions
  const canAccessTeacherDashboard = computed(() => isTeacher.value || isAdmin.value)

  const canAccessStudentDashboard = computed(() => isStudent.value || isAdmin.value)

  const canAccessAdminPanel = computed(() => isAdmin.value)

  // Specific view permissions
  const canViewTeacherResults = computed(
    () => canViewReports.value && (isTeacher.value || isAdmin.value),
  )

  const canViewStudentResults = computed(
    () => canViewOwnData.value && (isStudent.value || isAdmin.value),
  )

  const canCreateExams = computed(() => canManageExams.value && (isTeacher.value || isAdmin.value))

  const canCreateQuestions = computed(
    () => canManageQuestions.value && (isTeacher.value || isAdmin.value),
  )

  const canCreateGroups = computed(
    () => canManageGroups.value && (isTeacher.value || isAdmin.value),
  )

  const canManageGroupUsers = computed(
    () => canManageGroups.value && (isTeacher.value || isAdmin.value),
  )

  // Helper function to check multiple permissions
  const hasAnyPermission = (permissions: string[]) => {
    return permissions.some((permission) => authStore.hasPermission(permission)) || isAdmin.value
  }

  const hasAllPermissions = (permissions: string[]) => {
    return permissions.every((permission) => authStore.hasPermission(permission)) || isAdmin.value
  }

  return {
    // Role checks
    isAdmin,
    isTeacher,
    isStudent,

    // Permission checks
    canManageExams,
    canManageQuestions,
    canManageGroups,
    canManageUsers,
    canViewReports,
    canTakeExams,
    canViewOwnData,

    // Navigation permissions
    canAccessTeacherDashboard,
    canAccessStudentDashboard,
    canAccessAdminPanel,

    // Specific view permissions
    canViewTeacherResults,
    canViewStudentResults,
    canCreateExams,
    canCreateQuestions,
    canCreateGroups,
    canManageGroupUsers,

    // Helper functions
    hasAnyPermission,
    hasAllPermissions,
  }
}
