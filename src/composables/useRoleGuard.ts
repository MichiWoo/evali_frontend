import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'

/**
 * Tipo para roles de usuario
 */
type Role = 'admin' | 'teacher' | 'student'

/**
 * Composable para validación de roles y permisos con mensajes claros al usuario
 *
 * @example
 * ```typescript
 * const { requireRole, requireAuth } = useRoleGuard()
 *
 * onMounted(() => {
 *   if (!requireRole('admin')) {
 *     return // Ya redirigió y mostró mensaje
 *   }
 *   // Continuar con la lógica del componente
 * })
 * ```
 */
export function useRoleGuard() {
  const router = useRouter()
  const toast = useToast()
  const authStore = useAuthStore()

  /**
   * Mensajes personalizados por rol
   */
  const roleMessages: Record<Role, string> = {
    admin: 'Solo los administradores pueden acceder a esta sección',
    teacher: 'Solo los profesores pueden acceder a esta sección',
    student: 'Solo los estudiantes pueden acceder a esta sección',
  }

  /**
   * Rutas de redirección por rol
   */
  const roleRedirects: Record<Role, string> = {
    admin: '/dashboard',
    teacher: '/dashboard',
    student: '/student/dashboard',
  }

  /**
   * Verifica si el usuario está autenticado
   * Si no lo está, muestra mensaje y redirige al login
   */
  const requireAuth = (): boolean => {
    if (!authStore.isAuthenticated) {
      toast.add({
        severity: 'warn',
        summary: 'Acceso Denegado',
        detail: 'Debes iniciar sesión para acceder a esta página',
        life: 3000,
      })
      router.push('/login')
      return false
    }
    return true
  }

  /**
   * Verifica si el usuario tiene un rol específico
   * Si no lo tiene, muestra mensaje y redirige según su rol
   */
  const requireRole = (
    role: Role | Role[],
    options?: {
      redirectTo?: string
      customMessage?: string
      showToast?: boolean
    },
  ): boolean => {
    // Primero verificar autenticación
    if (!requireAuth()) {
      return false
    }

    const roles = Array.isArray(role) ? role : [role]
    const userRole = authStore.userRole

    // Si el usuario es admin, siempre permitir acceso
    if (authStore.isAdmin) {
      return true
    }

    // Verificar si el usuario tiene alguno de los roles requeridos
    const hasRequiredRole = roles.includes(userRole as Role)

    if (!hasRequiredRole) {
      const message =
        options?.customMessage ||
        (roles.length === 1
          ? roleMessages[roles[0]]
          : `Esta sección requiere uno de los siguientes roles: ${roles.join(', ')}`)

      if (options?.showToast !== false) {
        toast.add({
          severity: 'error',
          summary: 'Acceso Denegado',
          detail: message,
          life: 4000,
        })
      }

      // Redirigir según el rol del usuario o la ruta personalizada
      const redirectPath = options?.redirectTo || roleRedirects[userRole as Role] || '/dashboard'
      router.push(redirectPath)

      return false
    }

    return true
  }

  /**
   * Verifica si el usuario tiene algún permiso específico
   */
  const requirePermission = (
    permission: string | string[],
    options?: {
      redirectTo?: string
      customMessage?: string
      showToast?: boolean
    },
  ): boolean => {
    if (!requireAuth()) {
      return false
    }

    // Admins siempre tienen todos los permisos
    if (authStore.isAdmin) {
      return true
    }

    const permissions = Array.isArray(permission) ? permission : [permission]
    const hasPermission = permissions.some((perm) => authStore.hasPermission(perm))

    if (!hasPermission) {
      const message =
        options?.customMessage ||
        `No tienes permisos para realizar esta acción. Se requiere: ${permissions.join(' o ')}`

      if (options?.showToast !== false) {
        toast.add({
          severity: 'error',
          summary: 'Permisos Insuficientes',
          detail: message,
          life: 4000,
        })
      }

      const redirectPath =
        options?.redirectTo || roleRedirects[authStore.userRole as Role] || '/dashboard'
      router.push(redirectPath)

      return false
    }

    return true
  }

  /**
   * Verifica múltiples condiciones (rol Y permisos)
   */
  const requireAll = (conditions: {
    roles?: Role | Role[]
    permissions?: string | string[]
    customMessage?: string
    redirectTo?: string
  }): boolean => {
    if (!requireAuth()) {
      return false
    }

    // Verificar roles
    if (conditions.roles) {
      const roles = Array.isArray(conditions.roles) ? conditions.roles : [conditions.roles]
      const userRole = authStore.userRole

      if (!authStore.isAdmin && !roles.includes(userRole as Role)) {
        const message =
          conditions.customMessage ||
          `Esta acción requiere uno de los siguientes roles: ${roles.join(', ')}`

        toast.add({
          severity: 'error',
          summary: 'Acceso Denegado',
          detail: message,
          life: 4000,
        })

        const redirectPath =
          conditions.redirectTo || roleRedirects[userRole as Role] || '/dashboard'
        router.push(redirectPath)
        return false
      }
    }

    // Verificar permisos
    if (conditions.permissions) {
      const permissions = Array.isArray(conditions.permissions)
        ? conditions.permissions
        : [conditions.permissions]
      const hasPermission = permissions.some((perm) => authStore.hasPermission(perm))

      if (!authStore.isAdmin && !hasPermission) {
        const message =
          conditions.customMessage ||
          `No tienes permisos para realizar esta acción. Se requiere: ${permissions.join(' o ')}`

        toast.add({
          severity: 'error',
          summary: 'Permisos Insuficientes',
          detail: message,
          life: 4000,
        })

        const redirectPath =
          conditions.redirectTo || roleRedirects[authStore.userRole as Role] || '/dashboard'
        router.push(redirectPath)
        return false
      }
    }

    return true
  }

  /**
   * Verifica si el usuario puede acceder a una vista específica
   * Útil para mostrar/ocultar elementos en lugar de redirigir
   */
  const canAccess = (role?: Role | Role[], permission?: string | string[]): boolean => {
    if (!authStore.isAuthenticated) {
      return false
    }

    // Admins siempre pueden acceder
    if (authStore.isAdmin) {
      return true
    }

    // Verificar rol
    if (role) {
      const roles = Array.isArray(role) ? role : [role]
      if (!roles.includes(authStore.userRole as Role)) {
        return false
      }
    }

    // Verificar permisos
    if (permission) {
      const permissions = Array.isArray(permission) ? permission : [permission]
      if (!permissions.some((perm) => authStore.hasPermission(perm))) {
        return false
      }
    }

    return true
  }

  return {
    requireAuth,
    requireRole,
    requirePermission,
    requireAll,
    canAccess,
  }
}
