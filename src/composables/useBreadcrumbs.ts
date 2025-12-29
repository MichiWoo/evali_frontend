import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { BreadcrumbItem } from '@/types'

/**
 * Composable para generar breadcrumbs automáticamente basándose en la ruta actual
 *
 * Genera breadcrumbs inteligentes desde la ruta, incluyendo:
 * - Home/Dashboard según el rol
 * - Rutas anidadas
 * - Nombres legibles de las rutas
 *
 * @example
 * ```typescript
 * const { breadcrumbs } = useBreadcrumbs()
 * ```
 */
export function useBreadcrumbs() {
  const route = useRoute()

  /**
   * Mapeo de rutas a etiquetas legibles
   */
  const routeLabels: Record<string, string> = {
    // Dashboards
    dashboard: 'Dashboard',
    'student-dashboard': 'Mi Dashboard',

    // Exámenes
    exams: 'Exámenes',
    'exam-create': 'Crear Examen',
    'exam-detail': 'Detalle de Examen',
    'exam-edit': 'Editar Examen',
    'student-exams': 'Mis Exámenes',

    // Preguntas
    questions: 'Preguntas',
    'question-create': 'Crear Pregunta',
    'question-detail': 'Detalle de Pregunta',
    'question-edit': 'Editar Pregunta',

    // Grupos
    groups: 'Grupos',
    'group-create': 'Crear Grupo',
    'group-detail': 'Detalle de Grupo',
    'group-edit': 'Editar Grupo',
    'groups-manage': 'Gestionar Grupos',

    // Estudiantes
    students: 'Estudiantes',
    'student-create': 'Crear Estudiante',
    'student-detail': 'Detalle de Estudiante',
    'student-edit': 'Editar Estudiante',

    // Resultados
    results: 'Resultados',
    'results-groups': 'Resultados por Grupo',
    'results-exams': 'Resultados por Examen',
    'student-results': 'Mis Resultados',
    'student-result-detail': 'Detalle de Resultado',
    'teacher-results': 'Análisis de Exámenes',
    'exam-analysis': 'Análisis de Examen',

    // Calificaciones
    grades: 'Calificaciones',

    // Perfil
    profile: 'Mi Perfil',
    'profile-settings': 'Configuración',
    'profile-security': 'Seguridad',

    // Administración
    'admin-users': 'Usuarios',
    'admin-user-create': 'Crear Usuario',
    'admin-user-detail': 'Detalle de Usuario',
    'admin-user-edit': 'Editar Usuario',
    'admin-settings': 'Configuración del Sistema',
    'admin-reports': 'Reportes',

    // Pagos
    payments: 'Dashboard de Pagos',
    'payment-history': 'Historial de Pagos',
    'payment-methods': 'Métodos de Pago',
    invoices: 'Facturas',
    subscriptions: 'Suscripciones',
    plans: 'Planes',

    // Notificaciones
    notifications: 'Notificaciones',

    // Ayuda
    help: 'Documentación',
    support: 'Soporte',
    about: 'Acerca de',
    settings: 'Configuración',
  }

  /**
   * Genera breadcrumbs basándose en la ruta actual
   */
  const breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const items: BreadcrumbItem[] = []
    const pathSegments = route.path.split('/').filter(Boolean)

    // Si no hay segmentos, estamos en home
    if (pathSegments.length === 0) {
      return [{ label: 'Dashboard', to: '/' }]
    }

    // Construir breadcrumbs acumulativamente
    let currentPath = ''

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === pathSegments.length - 1

      // Buscar el nombre de la ruta en el router
      const routeName = route.name as string

      // Si tenemos un nombre de ruta, usar su etiqueta
      if (routeName && routeLabels[routeName]) {
        if (isLast) {
          items.push({
            label: routeLabels[routeName],
          })
        }
      } else {
        // Generar etiqueta desde el segmento de la ruta
        let label = segment

        // Convertir segmentos de ruta a etiquetas legibles
        label = label
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')

        // Casos especiales
        if (segment === 'admin') {
          label = 'Administración'
        } else if (segment === 'student') {
          label = 'Estudiante'
        } else if (segment === 'teacher') {
          label = 'Profesor'
        } else if (segment === 'payments') {
          label = 'Pagos'
        } else if (segment === 'results') {
          label = 'Resultados'
        }

        items.push({
          label,
          to: isLast ? undefined : currentPath,
        })
      }
    })

    // Si el primer breadcrumb no es dashboard/home, agregarlo
    if (items.length > 0 && items[0].label !== 'Dashboard' && items[0].label !== 'Inicio') {
      // Determinar el dashboard según el rol (esto se puede mejorar con el authStore)
      const homeLabel = pathSegments[0] === 'student' ? 'Mi Dashboard' : 'Dashboard'
      const homePath = pathSegments[0] === 'student' ? '/student/dashboard' : '/dashboard'

      items.unshift({
        label: homeLabel,
        to: homePath,
      })
    }

    return items
  })

  /**
   * Breadcrumb simplificado (sin home, solo la ruta actual)
   */
  const simpleBreadcrumbs = computed<BreadcrumbItem[]>(() => {
    return breadcrumbs.value.slice(1) // Remover el home
  })

  return {
    breadcrumbs,
    simpleBreadcrumbs,
  }
}
