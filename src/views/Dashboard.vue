<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Dashboard</h1>
      <p>Bienvenido, {{ user?.name }}</p>
    </div>

    <div class="dashboard-content">
      <!-- Stats Cards -->
      <div class="grid grid-cols-12 gap-6 mb-8">
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
          <div class="card mb-0">
            <div class="flex justify-between mb-4">
              <div>
                <span class="block text-muted-color font-medium mb-4">Exámenes</span>
                <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                  {{ examCount }}
                </div>
              </div>
              <div
                class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border"
                style="width: 2.5rem; height: 2.5rem"
              >
                <i class="pi pi-file-edit text-blue-500 !text-xl"></i>
              </div>
            </div>
            <span class="text-primary font-medium">{{ recentExams.length }} recientes </span>
            <span class="text-muted-color">desde la última semana</span>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
          <div class="card mb-0">
            <div class="flex justify-between mb-4">
              <div>
                <span class="block text-muted-color font-medium mb-4">Preguntas</span>
                <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                  {{ questionCount }}
                </div>
              </div>
              <div
                class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border"
                style="width: 2.5rem; height: 2.5rem"
              >
                <i class="pi pi-question-circle text-orange-500 !text-xl"></i>
              </div>
            </div>
            <span class="text-primary font-medium">+8% </span>
            <span class="text-muted-color">este mes</span>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
          <div class="card mb-0">
            <div class="flex justify-between mb-4">
              <div>
                <span class="block text-muted-color font-medium mb-4">Grupos</span>
                <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                  {{ groupCount }}
                </div>
              </div>
              <div
                class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border"
                style="width: 2.5rem; height: 2.5rem"
              >
                <i class="pi pi-users text-cyan-500 !text-xl"></i>
              </div>
            </div>
            <span class="text-primary font-medium">{{ activeGroups }} activos </span>
            <span class="text-muted-color">de {{ groupCount }} totales</span>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
          <div class="card mb-0">
            <div class="flex justify-between mb-4">
              <div>
                <span class="block text-muted-color font-medium mb-4">Estudiantes</span>
                <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                  {{ totalStudents }}
                </div>
              </div>
              <div
                class="flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-border"
                style="width: 2.5rem; height: 2.5rem"
              >
                <i class="pi pi-user text-green-500 !text-xl"></i>
              </div>
            </div>
            <span class="text-primary font-medium">{{ totalStudents }} estudiantes </span>
            <span class="text-muted-color">{{ isAdmin ? 'en total' : 'en tus grupos' }}</span>
          </div>
        </div>
      </div>

      <!-- Recent Exams and Recent Activity Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Exams -->
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <div class="font-semibold text-xl">Exámenes Recientes</div>
            <Button
              label="Ver Todos"
              icon="pi pi-arrow-right"
              text
              @click="$router.push('/exams')"
            />
          </div>

          <div v-if="isLoading" class="flex justify-center py-8">
            <ProgressSpinner />
          </div>

          <div v-else-if="recentExams.length === 0" class="text-center py-8">
            <i class="pi pi-file-edit text-4xl text-muted-color mb-4"></i>
            <h3 class="text-xl font-medium mb-2">No hay exámenes</h3>
            <p class="text-muted-color mb-4">Crea tu primer examen para comenzar</p>
            <Button label="Crear Examen" icon="pi pi-plus" @click="$router.push('/exams/create')" />
          </div>

          <DataTable
            v-else
            :value="recentExams"
            :rows="5"
            :paginator="true"
            responsiveLayout="scroll"
            class="recent-exams-table"
          >
            <Column header="Examen" style="width: 45%">
              <template #body="slotProps">
                <div class="flex flex-col">
                  <span class="font-medium text-surface-900 dark:text-surface-0">{{
                    slotProps.data.title
                  }}</span>
                  <span class="text-sm text-muted-color">{{
                    slotProps.data.description || 'Sin descripción'
                  }}</span>
                </div>
              </template>
            </Column>

            <Column header="Preguntas" style="width: 20%" :sortable="true">
              <template #body="slotProps">
                <Tag
                  :value="slotProps.data.questions?.length || 0"
                  severity="info"
                  icon="pi pi-question-circle"
                />
              </template>
            </Column>

            <Column header="Acciones" style="width: 35%">
              <template #body="slotProps">
                <div class="flex gap-2">
                  <Button
                    icon="pi pi-eye"
                    size="small"
                    text
                    @click="$router.push(`/exams/${slotProps.data.id}`)"
                    v-tooltip.top="'Ver examen'"
                  />
                  <Button
                    icon="pi pi-pencil"
                    size="small"
                    text
                    @click="$router.push(`/exams/${slotProps.data.id}/edit`)"
                    v-tooltip.top="'Editar examen'"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>

        <!-- Recent Activity -->
        <div class="card">
          <div class="flex items-center justify-between mb-6">
            <div class="font-semibold text-xl">Actividad Reciente</div>
            <div>
              <Button
                icon="pi pi-ellipsis-v"
                class="p-button-text p-button-plain p-button-rounded"
                @click="activityMenu.toggle($event)"
              />
              <Menu ref="activityMenu" popup :model="activityMenuItems" class="!min-w-40" />
            </div>
          </div>

          <div v-if="recentActivity.length === 0" class="text-center py-8">
            <i class="pi pi-clock text-4xl text-muted-color mb-4"></i>
            <p class="text-muted-color">No hay actividad reciente</p>
          </div>

          <div v-else>
            <!-- Actividades de Hoy -->
            <span class="block text-muted-color font-medium mb-4">HOY</span>
            <ul class="p-0 mx-0 mt-0 mb-6 list-none">
              <li
                v-for="activity in getTodayActivities()"
                :key="activity.id"
                class="flex items-center py-2 border-b border-surface cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800 rounded-lg transition-colors"
              >
                <div
                  class="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-full mr-4 shrink-0"
                >
                  <i :class="getActivityIcon(activity)" class="!text-xl text-blue-500"></i>
                </div>
                <div class="flex-1">
                  <span class="text-surface-900 dark:text-surface-0 leading-normal font-medium">
                    {{ activity.title }}
                  </span>
                  <div class="text-surface-700 dark:text-surface-100 text-sm mt-1">
                    {{ activity.description }}
                  </div>
                  <div class="text-muted-color text-xs mt-1">
                    {{ formatTime(activity.timestamp) }}
                  </div>
                </div>
              </li>
            </ul>

            <!-- Actividades de Ayer (si hay) -->
            <template v-if="getYesterdayActivities().length > 0">
              <span class="block text-muted-color font-medium mb-4">AYER</span>
              <ul class="p-0 mx-0 mt-0 mb-6 list-none">
                <li
                  v-for="activity in getYesterdayActivities()"
                  :key="activity.id"
                  class="flex items-center py-2 border-b border-surface cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800 rounded-lg transition-colors"
                >
                  <div
                    class="w-12 h-12 flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-full mr-4 shrink-0"
                  >
                    <i :class="getActivityIcon(activity)" class="!text-xl text-orange-500"></i>
                  </div>
                  <div class="flex-1">
                    <span class="text-surface-900 dark:text-surface-0 leading-normal font-medium">
                      {{ activity.title }}
                    </span>
                    <div class="text-surface-700 dark:text-surface-100 text-sm mt-1">
                      {{ activity.description }}
                    </div>
                    <div class="text-muted-color text-xs mt-1">
                      {{ formatTime(activity.timestamp) }}
                    </div>
                  </div>
                </li>
              </ul>
            </template>

            <!-- Actividades Más Antiguas (si hay) -->
            <template v-if="getOlderActivities().length > 0">
              <span class="block text-muted-color font-medium mb-4">ANTERIOR</span>
              <ul class="p-0 m-0 list-none">
                <li
                  v-for="activity in getOlderActivities().slice(0, 2)"
                  :key="activity.id"
                  class="flex items-center py-2 border-b border-surface cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800 rounded-lg transition-colors"
                >
                  <div
                    class="w-12 h-12 flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-full mr-4 shrink-0"
                  >
                    <i :class="getActivityIcon(activity)" class="!text-xl text-green-500"></i>
                  </div>
                  <div class="flex-1">
                    <span class="text-surface-900 dark:text-surface-0 leading-normal font-medium">
                      {{ activity.title }}
                    </span>
                    <div class="text-surface-700 dark:text-surface-100 text-sm mt-1">
                      {{ activity.description }}
                    </div>
                    <div class="text-muted-color text-xs mt-1">
                      {{ formatTime(activity.timestamp) }}
                    </div>
                  </div>
                </li>
              </ul>
            </template>
          </div>
        </div>
      </div>

      <!-- Notifications -->
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <div class="font-semibold text-xl">Notificaciones</div>
          <div>
            <Button
              icon="pi pi-ellipsis-v"
              class="p-button-text p-button-plain p-button-rounded"
              @click="notificationsMenu.toggle($event)"
            />
            <Menu ref="notificationsMenu" popup :model="notificationMenuItems" class="!min-w-40" />
          </div>
        </div>

        <div v-if="notifications.length === 0" class="text-center py-8">
          <i class="pi pi-bell text-4xl text-muted-color mb-4"></i>
          <p class="text-muted-color">No hay notificaciones</p>
        </div>

        <div v-else>
          <!-- Notificaciones de Hoy -->
          <span class="block text-muted-color font-medium mb-4">HOY</span>
          <ul class="p-0 mx-0 mt-0 mb-6 list-none">
            <li
              v-for="notification in getTodayNotifications()"
              :key="notification.id"
              class="flex items-center py-2 border-b border-surface cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800 rounded-lg transition-colors"
              @click="markAsRead(notification.id)"
            >
              <div
                class="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-full mr-4 shrink-0"
              >
                <i :class="getNotificationIcon(notification)" class="!text-xl text-blue-500"></i>
              </div>
              <div class="flex-1">
                <span class="text-surface-900 dark:text-surface-0 leading-normal font-medium">
                  {{ notification.title }}
                </span>
                <div class="text-surface-700 dark:text-surface-100 text-sm mt-1">
                  {{ notification.message }}
                </div>
                <div class="text-muted-color text-xs mt-1">
                  {{ formatTime(notification.created_at) }}
                </div>
              </div>
              <div v-if="!notification.is_read" class="w-2 h-2 bg-primary rounded-full mr-2"></div>
            </li>
          </ul>

          <!-- Notificaciones de Ayer (si hay) -->
          <template v-if="getYesterdayNotifications().length > 0">
            <span class="block text-muted-color font-medium mb-4">AYER</span>
            <ul class="p-0 mx-0 mt-0 mb-6 list-none">
              <li
                v-for="notification in getYesterdayNotifications()"
                :key="notification.id"
                class="flex items-center py-2 border-b border-surface cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800 rounded-lg transition-colors"
                @click="markAsRead(notification.id)"
              >
                <div
                  class="w-12 h-12 flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-full mr-4 shrink-0"
                >
                  <i
                    :class="getNotificationIcon(notification)"
                    class="!text-xl text-orange-500"
                  ></i>
                </div>
                <div class="flex-1">
                  <span class="text-surface-900 dark:text-surface-0 leading-normal font-medium">
                    {{ notification.title }}
                  </span>
                  <div class="text-surface-700 dark:text-surface-100 text-sm mt-1">
                    {{ notification.message }}
                  </div>
                  <div class="text-muted-color text-xs mt-1">
                    {{ formatTime(notification.created_at) }}
                  </div>
                </div>
                <div
                  v-if="!notification.is_read"
                  class="w-2 h-2 bg-primary rounded-full mr-2"
                ></div>
              </li>
            </ul>
          </template>

          <!-- Notificaciones Más Antiguas (si hay) -->
          <template v-if="getOlderNotifications().length > 0">
            <span class="block text-muted-color font-medium mb-4">ANTERIOR</span>
            <ul class="p-0 m-0 list-none">
              <li
                v-for="notification in getOlderNotifications().slice(0, 2)"
                :key="notification.id"
                class="flex items-center py-2 border-b border-surface cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800 rounded-lg transition-colors"
                @click="markAsRead(notification.id)"
              >
                <div
                  class="w-12 h-12 flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-full mr-4 shrink-0"
                >
                  <i :class="getNotificationIcon(notification)" class="!text-xl text-green-500"></i>
                </div>
                <div class="flex-1">
                  <span class="text-surface-900 dark:text-surface-0 leading-normal font-medium">
                    {{ notification.title }}
                  </span>
                  <div class="text-surface-700 dark:text-surface-100 text-sm mt-1">
                    {{ notification.message }}
                  </div>
                  <div class="text-muted-color text-xs mt-1">
                    {{ formatTime(notification.created_at) }}
                  </div>
                </div>
                <div
                  v-if="!notification.is_read"
                  class="w-2 h-2 bg-primary rounded-full mr-2"
                ></div>
              </li>
            </ul>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<!--
  Dashboard del Profesor

  RESTRICCIONES DE ACCESO:
  - Requiere autenticación: Sí
  - Roles permitidos: 'teacher', 'admin'
  - Permisos requeridos: Ninguno específico (solo rol)

  RUTA: /dashboard
  META: { requiresAuth: true, requiresRole: ['teacher', 'admin'] }

  DESCRIPCIÓN:
  Vista principal para profesores que muestra un resumen de:
  - Exámenes creados y recientes
  - Preguntas en el banco
  - Grupos gestionados
  - Estadísticas de calificaciones
  - Actividad reciente
  - Notificaciones

  NOTAS:
  - Los estudiantes tienen su propio dashboard en /student/dashboard
  - Los admins pueden acceder pero pueden preferir usar el dashboard principal
-->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useExamStore } from '@/stores/exams'
import { useQuestionStore } from '@/stores/questions'
import { useDashboardStore } from '@/stores/dashboard'
import { useGroupStore } from '@/stores/groups'
import { useRoleGuard } from '@/composables/useRoleGuard'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Menu from 'primevue/menu'

const _router = useRouter()
const authStore = useAuthStore()
const { requireRole } = useRoleGuard()
const examStore = useExamStore()
const questionStore = useQuestionStore()
const dashboardStore = useDashboardStore()
const groupStore = useGroupStore()

const user = computed(() => authStore.user)
const isAdmin = computed(() => authStore.isAdmin)
const examCount = computed(() => examStore.examCount)
const questionCount = computed(() => questionStore.questionCount)
const isLoading = computed(() => dashboardStore.isLoading)

const recentExams = computed(() => dashboardStore.recentExams)

// Dashboard data
const totalStudents = computed(() => dashboardStore.userStats?.total_students || 0)
const _totalAttempts = computed(() => dashboardStore.userStats?.total_attempts || 0)
const _averageScore = computed(() => dashboardStore.averageScore)
const _completionRate = computed(() => dashboardStore.completionRate)
const recentActivity = computed(() => dashboardStore.recentActivity)
const notifications = computed(() => dashboardStore.notifications)

// Groups data
const groupCount = computed(() => groupStore.groups?.length || 0)
const activeGroups = computed(
  () => groupStore.groups?.filter((group) => group.status === 'active')?.length || 0,
)

// State
const _showAllActivity = ref(false)
const _showAllNotifications = ref(false)
const notificationsMenu = ref(null)
const activityMenu = ref(null)

// Menu items for notifications
const notificationMenuItems = ref([
  { label: 'Marcar todas como leídas', icon: 'pi pi-fw pi-check' },
  { label: 'Ver todas las notificaciones', icon: 'pi pi-fw pi-arrow-right' },
])

// Menu items for activity
const activityMenuItems = ref([
  { label: 'Actualizar actividad', icon: 'pi pi-fw pi-refresh' },
  { label: 'Ver toda la actividad', icon: 'pi pi-fw pi-arrow-right' },
])

// Methods
const markAsRead = async (notificationId: number) => {
  try {
    await dashboardStore.markNotificationAsRead(notificationId)
  } catch (error) {
    console.error('Error marking notification as read:', error)
  }
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) {
    return `hace ${minutes} min`
  } else if (hours < 24) {
    return `hace ${hours}h`
  } else {
    return `hace ${days} días`
  }
}

// Notification helper methods
const getTodayNotifications = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return notifications.value.filter((notification) => {
    const notificationDate = new Date(notification.created_at)
    notificationDate.setHours(0, 0, 0, 0)
    return notificationDate.getTime() === today.getTime()
  })
}

const getYesterdayNotifications = () => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)

  return notifications.value.filter((notification) => {
    const notificationDate = new Date(notification.created_at)
    notificationDate.setHours(0, 0, 0, 0)
    return notificationDate.getTime() === yesterday.getTime()
  })
}

const getOlderNotifications = () => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)

  return notifications.value.filter((notification) => {
    const notificationDate = new Date(notification.created_at)
    return notificationDate.getTime() < yesterday.getTime()
  })
}

const getNotificationIcon = (notification: any) => {
  // Map notification types to icons
  const iconMap: Record<string, string> = {
    exam_created: 'pi pi-file-edit',
    exam_completed: 'pi pi-check-circle',
    exam_assigned: 'pi pi-send',
    student_joined: 'pi pi-user-plus',
    grade_available: 'pi pi-chart-line',
    system: 'pi pi-cog',
    default: 'pi pi-bell',
  }

  return notification.icon || iconMap[notification.type] || iconMap.default
}

// Activity helper methods
const getTodayActivities = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return recentActivity.value.filter((activity) => {
    const activityDate = new Date(activity.timestamp)
    activityDate.setHours(0, 0, 0, 0)
    return activityDate.getTime() === today.getTime()
  })
}

const getYesterdayActivities = () => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)

  return recentActivity.value.filter((activity) => {
    const activityDate = new Date(activity.timestamp)
    activityDate.setHours(0, 0, 0, 0)
    return activityDate.getTime() === yesterday.getTime()
  })
}

const getOlderActivities = () => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)

  return recentActivity.value.filter((activity) => {
    const activityDate = new Date(activity.timestamp)
    return activityDate.getTime() < yesterday.getTime()
  })
}

const getActivityIcon = (activity: any) => {
  // Map activity types to icons
  const iconMap: Record<string, string> = {
    exam_created: 'pi pi-file-edit',
    exam_submitted: 'pi pi-check',
    student_joined: 'pi pi-user-plus',
    question_added: 'pi pi-question-circle',
    group_created: 'pi pi-users',
    default: 'pi pi-clock',
  }

  return activity.icon || iconMap[activity.type] || iconMap.default
}

/**
 * Guard de seguridad: Verifica que el usuario tenga rol de profesor o admin
 * Si no tiene el rol requerido, redirige automáticamente y muestra mensaje de error
 *
 * @see useRoleGuard para más detalles sobre la validación
 */
onMounted(async () => {
  // Verificar que el usuario tenga rol de profesor o admin
  if (!requireRole(['teacher', 'admin'])) {
    return // Ya redirigió y mostró mensaje de error
  }

  console.log(
    'DashboardView onMounted - Token in localStorage:',
    localStorage.getItem('auth_token'),
  )
  console.log('DashboardView onMounted - User in authStore:', authStore.user)
  console.log('DashboardView onMounted - IsAuthenticated:', authStore.isAuthenticated)

  try {
    await Promise.all([
      examStore.fetchExams(),
      questionStore.fetchQuestions(),
      dashboardStore.fetchDashboardData(),
      groupStore.fetchGroups(),
    ])
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  margin: 0 0 0.5rem 0;
  color: var(--p-color-text);
  font-size: 2rem;
  font-weight: 600;
}

.dashboard-header p {
  margin: 0;
  color: var(--p-color-text-secondary);
  font-size: 1.1rem;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Stats styles are now handled by Tailwind CSS classes */

/* Recent exams table styles handled by PrimeVue and Tailwind */

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0;
  color: var(--p-color-text);
  font-size: 1.25rem;
  font-weight: 600;
}

/* Activity and notification styles now handled by Tailwind CSS classes */

/* Responsive styles handled by individual components */
</style>
