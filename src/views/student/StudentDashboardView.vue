<template>
  <div class="student-dashboard-view">
    <!-- Header -->
    <div class="header-section mb-4">
      <div class="flex align-items-center justify-content-between">
        <div>
          <h1 class="text-3xl font-bold text-900 mb-2">Dashboard</h1>
          <p class="text-600 m-0">
            Bienvenido, aquí puedes ver tu progreso y actividades recientes
          </p>
        </div>
        <div class="flex gap-2">
          <Button
            label="Ver Exámenes"
            icon="pi pi-file-edit"
            severity="success"
            outlined
            @click="$router.push('/student/exams')"
          />
          <Button
            label="Ver Resultados"
            icon="pi pi-chart-bar"
            severity="info"
            outlined
            @click="$router.push('/student/results')"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="flex justify-content-center align-items-center"
      style="min-height: 400px"
    >
      <ProgressSpinner />
    </div>

    <!-- Error State -->
    <Message v-if="error && !isLoading" severity="error" :closable="false" class="mb-4">
      {{ error }}
    </Message>

    <!-- Dashboard Content -->
    <div v-if="!isLoading && !error">
      <!-- Statistics Cards -->
      <div class="stats-grid mb-4">
        <div class="stat-card stat-primary">
          <div class="stat-icon">
            <i class="pi pi-file-edit text-4xl"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats?.total_exams || 0 }}</div>
            <div class="stat-label">Exámenes Disponibles</div>
            <div class="stat-action" @click="$router.push('/student/exams')">
              Ver todos <i class="pi pi-arrow-right ml-1"></i>
            </div>
          </div>
        </div>

        <div class="stat-card stat-success">
          <div class="stat-icon">
            <i class="pi pi-check-circle text-4xl"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats?.completed_exams || 0 }}</div>
            <div class="stat-label">Exámenes Completados</div>
            <div class="stat-action" @click="$router.push('/student/results')">
              Ver resultados <i class="pi pi-arrow-right ml-1"></i>
            </div>
          </div>
        </div>

        <div class="stat-card stat-info">
          <div class="stat-icon">
            <i class="pi pi-star text-4xl"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats?.average_score || 0 }}%</div>
            <div class="stat-label">Promedio de Calificaciones</div>
            <div class="stat-progress">
              <ProgressBar :value="stats?.average_score || 0" :showValue="false" />
            </div>
          </div>
        </div>

        <div class="stat-card stat-warning">
          <div class="stat-icon">
            <i class="pi pi-bell text-4xl"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats?.unread_notifications || 0 }}</div>
            <div class="stat-label">Notificaciones No Leídas</div>
            <Badge
              v-if="stats?.unread_notifications > 0"
              :value="stats.unread_notifications"
              severity="danger"
            />
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="dashboard-grid">
        <!-- Available Exams Section -->
        <div class="dashboard-section">
          <div class="section-header">
            <div class="flex align-items-center gap-2">
              <i class="pi pi-file-edit text-2xl text-primary"></i>
              <h2 class="text-xl font-semibold m-0">Exámenes Disponibles</h2>
            </div>
            <Button
              label="Ver todos"
              icon="pi pi-arrow-right"
              text
              @click="$router.push('/student/exams')"
              class="p-button-sm"
            />
          </div>

          <div v-if="availableExams.length === 0" class="empty-state">
            <i class="pi pi-inbox text-5xl text-400 mb-3"></i>
            <p class="text-600">No hay exámenes disponibles en este momento</p>
          </div>

          <div v-else class="exams-list">
            <div
              v-for="exam in availableExams.slice(0, 5)"
              :key="exam.id"
              class="exam-card"
              @click="handleTakeExam(exam)"
            >
              <div class="exam-card-header">
                <div class="exam-title">{{ exam.title }}</div>
                <Badge value="Disponible" severity="success" />
              </div>
              <div class="exam-details">
                <div class="exam-detail-item" v-if="exam.description">
                  <i class="pi pi-info-circle"></i>
                  <span
                    >{{ exam.description.substring(0, 60)
                    }}{{ exam.description.length > 60 ? '...' : '' }}</span
                  >
                </div>
                <div class="exam-detail-item" v-if="exam.duration">
                  <i class="pi pi-clock"></i>
                  <span>{{ exam.duration }} minutos</span>
                </div>
                <div class="exam-detail-item" v-if="exam.end_date">
                  <i class="pi pi-calendar"></i>
                  <span>Vence: {{ formatDate(exam.end_date) }}</span>
                </div>
              </div>
              <div class="exam-card-footer">
                <Button
                  label="Realizar Examen"
                  icon="pi pi-play"
                  severity="success"
                  class="p-button-sm"
                  @click.stop="handleTakeExam(exam)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Attempts Section -->
        <div class="dashboard-section">
          <div class="section-header">
            <div class="flex align-items-center gap-2">
              <i class="pi pi-history text-2xl text-info"></i>
              <h2 class="text-xl font-semibold m-0">Intentos Recientes</h2>
            </div>
            <Button
              label="Ver todos"
              icon="pi pi-arrow-right"
              text
              @click="$router.push('/student/results')"
              class="p-button-sm"
            />
          </div>

          <div v-if="recentAttempts.length === 0" class="empty-state">
            <i class="pi pi-inbox text-5xl text-400 mb-3"></i>
            <p class="text-600">No has realizado ningún examen aún</p>
          </div>

          <div v-else class="attempts-list">
            <div
              v-for="attempt in recentAttempts.slice(0, 5)"
              :key="attempt.id"
              class="attempt-card"
              @click="handleViewAttempt(attempt)"
            >
              <div class="attempt-header">
                <div class="attempt-title">
                  {{ (attempt as any).exam_title || attempt.exam?.title || 'Examen' }}
                </div>
                <Tag
                  :value="getStatusLabel(attempt.status)"
                  :severity="getStatusSeverity(attempt.status)"
                />
              </div>
              <div class="attempt-stats">
                <div
                  class="attempt-stat"
                  v-if="attempt.percentage !== null || attempt.score !== null"
                >
                  <div class="stat-label-small">Puntuación</div>
                  <div class="stat-value">{{ attempt.percentage || attempt.score || 0 }}%</div>
                </div>
                <div class="attempt-stat" v-if="attempt.submitted_at || attempt.completed_at">
                  <div class="stat-label-small">Fecha</div>
                  <div class="stat-value-small">
                    {{ formatDate(attempt.submitted_at || attempt.completed_at) }}
                  </div>
                </div>
              </div>
              <div
                v-if="attempt.percentage !== null || attempt.score !== null"
                class="attempt-progress"
              >
                <ProgressBar :value="attempt.percentage || attempt.score || 0" :showValue="false" />
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Notifications Section -->
        <div class="dashboard-section notifications-section">
          <div class="section-header">
            <div class="flex align-items-center gap-2">
              <i class="pi pi-bell text-2xl text-warning"></i>
              <h2 class="text-xl font-semibold m-0">Notificaciones Recientes</h2>
            </div>
            <Button
              label="Ver todas"
              icon="pi pi-arrow-right"
              text
              @click="$router.push('/notifications')"
              class="p-button-sm"
            />
          </div>

          <div v-if="notifications.length === 0" class="empty-state">
            <i class="pi pi-inbox text-5xl text-400 mb-3"></i>
            <p class="text-600">No tienes notificaciones</p>
          </div>

          <div v-else class="notifications-list">
            <div
              v-for="notification in notifications.slice(0, 5)"
              :key="notification.id"
              class="notification-item"
              :class="{ unread: !notification.is_read }"
              @click="handleNotificationClick(notification)"
            >
              <div class="notification-icon">
                <i :class="getNotificationIcon(notification.type)"></i>
              </div>
              <div class="notification-content">
                <div class="notification-title">{{ notification.title }}</div>
                <div class="notification-message">{{ notification.message }}</div>
                <div class="notification-time">{{ formatTimeAgo(notification.created_at) }}</div>
              </div>
              <Badge
                v-if="!notification.is_read"
                value=""
                severity="danger"
                class="notification-badge"
              />
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="dashboard-section quick-actions-section">
          <div class="section-header">
            <div class="flex align-items-center gap-2">
              <i class="pi pi-bolt text-2xl text-primary"></i>
              <h2 class="text-xl font-semibold m-0">Acciones Rápidas</h2>
            </div>
          </div>
          <div class="quick-actions-grid">
            <Button
              label="Ver Exámenes"
              icon="pi pi-file-edit"
              severity="success"
              outlined
              class="quick-action-btn"
              @click="$router.push('/student/exams')"
            />
            <Button
              label="Ver Resultados"
              icon="pi pi-chart-bar"
              severity="info"
              outlined
              class="quick-action-btn"
              @click="$router.push('/student/results')"
            />
            <Button
              label="Notificaciones"
              icon="pi pi-bell"
              severity="warning"
              outlined
              class="quick-action-btn"
              @click="$router.push('/notifications')"
            />
            <Button
              label="Perfil"
              icon="pi pi-user"
              severity="secondary"
              outlined
              class="quick-action-btn"
              @click="$router.push('/profile')"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useDashboardStore } from '@/stores/dashboard'
import Button from 'primevue/button'
import Badge from 'primevue/badge'
import Tag from 'primevue/tag'
import ProgressBar from 'primevue/progressbar'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'

const router = useRouter()
const toast = useToast()
const dashboardStore = useDashboardStore()

// Computed properties
const isLoading = computed(() => dashboardStore.isLoading)
const error = computed(() => dashboardStore.error)
const stats = computed(() => dashboardStore.userStats)
const availableExams = computed(
  () => dashboardStore.upcomingExams || dashboardStore.recentExams || [],
)
const recentAttempts = computed(() => dashboardStore.recentAttempts || [])
const notifications = computed(() => dashboardStore.notifications || [])

// Methods
const loadDashboardData = async () => {
  try {
    await dashboardStore.fetchDashboardData()
  } catch (err: any) {
    console.error('Error loading dashboard:', err)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los datos del dashboard',
      life: 5000,
    })
  }
}

const handleTakeExam = (exam: any) => {
  router.push(`/student/exams/${exam.id}/take`)
}

const handleViewAttempt = (attempt: any) => {
  if (attempt.id) {
    router.push(`/student/results/${attempt.id}`)
  } else {
    toast.add({
      severity: 'warn',
      summary: 'Aviso',
      detail: 'No hay resultados disponibles para este intento',
      life: 3000,
    })
  }
}

const handleNotificationClick = (notification: any) => {
  if (!notification.is_read) {
    dashboardStore.markNotificationAsRead(notification.id)
  }
  // Navigate based on notification type
  if (notification.type === 'exam_assigned') {
    router.push('/student/exams')
  } else if (notification.type === 'exam_result') {
    router.push('/student/results')
  }
}

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    in_progress: 'En Progreso',
    completed: 'Completado',
    submitted: 'Enviado',
    pending: 'Pendiente',
  }
  return statusMap[status] || status
}

const getStatusSeverity = (status: string) => {
  const severityMap: Record<string, string> = {
    in_progress: 'warning',
    completed: 'success',
    submitted: 'info',
    pending: 'secondary',
  }
  return severityMap[status] || 'secondary'
}

const getNotificationIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    exam_assigned: 'pi pi-file-edit',
    exam_result: 'pi pi-chart-bar',
    exam_reminder: 'pi pi-clock',
    general: 'pi pi-info-circle',
  }
  return iconMap[type] || 'pi pi-bell'
}

const formatDate = (date: string) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatTimeAgo = (date: string) => {
  if (!date) return ''
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Hace unos momentos'
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`
  if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`
  return formatDate(date)
}

// Lifecycle
onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.student-dashboard-view {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.header-section {
  background: var(--surface-card);
  border-radius: 12px;
  padding: 1.5rem 2rem;
  border: 1px solid var(--surface-border);
}

/* Statistics Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--surface-card);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--surface-border);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-primary .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-success .stat-icon {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.stat-info .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-warning .stat-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
  margin-bottom: 0.5rem;
}

.stat-action {
  font-size: 0.85rem;
  color: var(--primary-color);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  font-weight: 500;
  transition: color 0.2s;
}

.stat-action:hover {
  color: var(--primary-color-text);
}

.stat-progress {
  margin-top: 0.5rem;
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.dashboard-section {
  background: var(--surface-card);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--surface-border);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--surface-border);
}

/* Exams List */
.exams-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.exam-card {
  padding: 1.25rem;
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.exam-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.exam-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.exam-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
}

.exam-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.exam-detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-color-secondary);
}

.exam-detail-item i {
  color: var(--primary-color);
}

.exam-card-footer {
  display: flex;
  justify-content: flex-end;
}

/* Attempts List */
.attempts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.attempt-card {
  padding: 1.25rem;
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.attempt-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.attempt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.attempt-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
}

.attempt-stats {
  display: flex;
  gap: 2rem;
  margin-bottom: 0.75rem;
}

.attempt-stat {
  display: flex;
  flex-direction: column;
}

.stat-label-small {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
}

.stat-value-small {
  font-size: 0.9rem;
  color: var(--text-color);
}

.attempt-progress {
  margin-top: 0.5rem;
}

/* Notifications List */
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.notification-item:hover {
  background: var(--surface-hover);
}

.notification-item.unread {
  background: var(--primary-50);
  border-color: var(--primary-200);
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--surface-ground);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--primary-color);
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.25rem;
}

.notification-message {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
  margin-bottom: 0.25rem;
}

.notification-time {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
}

.notification-badge {
  align-self: flex-start;
  margin-top: 0.5rem;
}

/* Quick Actions */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.quick-action-btn {
  width: 100%;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-color-secondary);
}

/* Responsive */
@media (max-width: 768px) {
  .student-dashboard-view {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .header-section .flex {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .quick-actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
