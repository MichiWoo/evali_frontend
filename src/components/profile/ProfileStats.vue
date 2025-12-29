<template>
  <div class="profile-stats">
    <div class="stats-grid">
      <!-- Estadísticas Generales -->
      <div class="stat-card">
        <div class="stat-icon">
          <i class="pi pi-graduation-cap"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.examsCompleted || 0 }}</h3>
          <p>Exámenes Completados</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="pi pi-star"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.averageScore || 0 }}%</h3>
          <p>Calificación Promedio</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="pi pi-clock"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.timeSpent || '0h' }}</h3>
          <p>Tiempo Total</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="pi pi-trophy"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.rank || 'N/A' }}</h3>
          <p>Posición Global</p>
        </div>
      </div>
    </div>

    <!-- Progreso del Perfil -->
    <div class="profile-completion">
      <div class="completion-header">
        <h3>Completitud del Perfil</h3>
        <span class="completion-percentage">{{ profileCompletionPercentage }}%</span>
      </div>
      <ProgressBar
        :value="profileCompletionPercentage"
        :show-value="false"
        class="completion-bar"
      />
      <div class="completion-items">
        <div class="completion-item" :class="{ completed: user?.name }">
          <i class="pi pi-check" v-if="user?.name"></i>
          <i class="pi pi-times" v-else></i>
          <span>Nombre completo</span>
        </div>
        <div class="completion-item" :class="{ completed: user?.email }">
          <i class="pi pi-check" v-if="user?.email"></i>
          <i class="pi pi-times" v-else></i>
          <span>Correo electrónico</span>
        </div>
        <div class="completion-item" :class="{ completed: user?.avatar }">
          <i class="pi pi-check" v-if="user?.avatar"></i>
          <i class="pi pi-times" v-else></i>
          <span>Foto de perfil</span>
        </div>
        <div class="completion-item" :class="{ completed: user?.bio }">
          <i class="pi pi-check" v-if="user?.bio"></i>
          <i class="pi pi-times" v-else></i>
          <span>Biografía</span>
        </div>
      </div>
    </div>

    <!-- Actividad Reciente -->
    <div class="recent-activity">
      <h3>Actividad Reciente</h3>
      <div class="activity-list">
        <div v-if="isLoading" class="loading-state">
          <ProgressSpinner size="small" />
          <span>Cargando actividad...</span>
        </div>

        <div v-else-if="recentActivity.length === 0" class="empty-state">
          <i class="pi pi-history text-4xl text-400"></i>
          <p>No hay actividad reciente</p>
        </div>

        <div v-else class="activities">
          <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
            <div class="activity-icon">
              <i :class="getActivityIcon(activity.type)"></i>
            </div>
            <div class="activity-content">
              <h4>{{ activity.title }}</h4>
              <p>{{ activity.description }}</p>
              <span class="activity-time">{{ formatTime(activity.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Logros -->
    <div class="achievements">
      <h3>Logros</h3>
      <div class="achievements-grid">
        <div
          v-for="achievement in achievements"
          :key="achievement.id"
          class="achievement-card"
          :class="{ unlocked: achievement.unlocked }"
        >
          <div class="achievement-icon">
            <i :class="achievement.icon"></i>
          </div>
          <div class="achievement-content">
            <h4>{{ achievement.title }}</h4>
            <p>{{ achievement.description }}</p>
            <div v-if="!achievement.unlocked" class="achievement-progress">
              <ProgressBar :value="achievement.progress" :show-value="false" size="small" />
              <span class="progress-text">{{ achievement.progress }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProfileStore } from '@/stores/profile'
import { useDashboardStore } from '@/stores/dashboard'

const profileStore = useProfileStore()
const dashboardStore = useDashboardStore()

// State
const stats = ref({
  examsCompleted: 0,
  averageScore: 0,
  timeSpent: '0h',
  rank: 'N/A',
})

const recentActivity = ref<any[]>([])
const achievements = ref([
  {
    id: 1,
    title: 'Primer Examen',
    description: 'Completa tu primer examen',
    icon: 'pi pi-graduation-cap',
    unlocked: false,
    progress: 0,
  },
  {
    id: 2,
    title: 'Estudiante Dedicado',
    description: 'Completa 10 exámenes',
    icon: 'pi pi-star',
    unlocked: false,
    progress: 0,
  },
  {
    id: 3,
    title: 'Excelencia Académica',
    description: 'Obtén una calificación promedio de 90% o más',
    icon: 'pi pi-trophy',
    unlocked: false,
    progress: 0,
  },
  {
    id: 4,
    title: 'Maratón de Estudio',
    description: 'Estudia por más de 10 horas',
    icon: 'pi pi-clock',
    unlocked: false,
    progress: 0,
  },
])

const isLoading = ref(false)

// Computed
const user = computed(() => profileStore.user)
const profileCompletionPercentage = computed(() => profileStore.profileCompletionPercentage)

// Methods
const loadStats = async () => {
  try {
    isLoading.value = true

    // Load dashboard data to get stats
    await dashboardStore.fetchDashboardData()

    // Update stats based on dashboard data
    if (dashboardStore.userStats) {
      stats.value = {
        examsCompleted: dashboardStore.userStats.exams_completed || 0,
        averageScore: dashboardStore.userStats.average_score || 0,
        timeSpent: dashboardStore.userStats.time_spent || '0h',
        rank: dashboardStore.userStats.rank || 'N/A',
      }
    }

    // Load recent activity
    recentActivity.value = dashboardStore.recentActivity || []

    // Update achievements based on stats
    updateAchievements()
  } catch (_error) {
    console.error('Error loading stats:', error)
  } finally {
    isLoading.value = false
  }
}

const updateAchievements = () => {
  achievements.value.forEach((achievement) => {
    switch (achievement.id) {
      case 1: // Primer Examen
        achievement.unlocked = stats.value.examsCompleted >= 1
        achievement.progress = Math.min(100, (stats.value.examsCompleted / 1) * 100)
        break
      case 2: // Estudiante Dedicado
        achievement.unlocked = stats.value.examsCompleted >= 10
        achievement.progress = Math.min(100, (stats.value.examsCompleted / 10) * 100)
        break
      case 3: // Excelencia Académica
        achievement.unlocked = stats.value.averageScore >= 90
        achievement.progress = Math.min(100, stats.value.averageScore)
        break
      case 4: // Maratón de Estudio
        const hours = parseFloat(stats.value.timeSpent.replace('h', '')) || 0
        achievement.unlocked = hours >= 10
        achievement.progress = Math.min(100, (hours / 10) * 100)
        break
    }
  })
}

const getActivityIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    exam_completed: 'pi pi-check-circle',
    exam_started: 'pi pi-play-circle',
    grade_received: 'pi pi-star',
    profile_updated: 'pi pi-user-edit',
    login: 'pi pi-sign-in',
    logout: 'pi pi-sign-out',
  }
  return iconMap[type] || 'pi pi-info-circle'
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Ahora'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  if (days < 7) return `${days}d`

  return date.toLocaleDateString()
}

// Lifecycle
onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.profile-stats {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: var(--surface-card);
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid var(--surface-border);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: var(--primary-100);
  color: var(--primary-600);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-content h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
}

.stat-content p {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: 0.9rem;
}

.profile-completion {
  background: var(--surface-card);
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid var(--surface-border);
}

.completion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.completion-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
}

.completion-percentage {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary-600);
}

.completion-bar {
  margin-bottom: 1rem;
}

.completion-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.completion-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background: var(--surface-50);
}

.completion-item.completed {
  background: var(--green-50);
  color: var(--green-700);
}

.completion-item i {
  font-size: 0.9rem;
}

.completion-item.completed i.pi-check {
  color: var(--green-600);
}

.completion-item i.pi-times {
  color: var(--red-500);
}

.recent-activity {
  background: var(--surface-card);
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid var(--surface-border);
}

.recent-activity h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;
  color: var(--text-color-secondary);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;
  color: var(--text-color-secondary);
}

.activities {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface-50);
  border-radius: 0.5rem;
  border: 1px solid var(--surface-border);
}

.activity-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--primary-100);
  color: var(--primary-600);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-content h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-color);
}

.activity-content p {
  margin: 0 0 0.5rem 0;
  font-size: 0.8rem;
  color: var(--text-color-secondary);
  line-height: 1.4;
}

.activity-time {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
}

.achievements {
  background: var(--surface-card);
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid var(--surface-border);
}

.achievements h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.achievement-card {
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--surface-border);
  background: var(--surface-50);
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  transition: all 0.2s ease;
}

.achievement-card.unlocked {
  background: var(--green-50);
  border-color: var(--green-200);
}

.achievement-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--surface-100);
  color: var(--text-color-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.achievement-card.unlocked .achievement-icon {
  background: var(--green-100);
  color: var(--green-600);
}

.achievement-content {
  flex: 1;
}

.achievement-content h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-color);
}

.achievement-content p {
  margin: 0 0 0.5rem 0;
  font-size: 0.8rem;
  color: var(--text-color-secondary);
  line-height: 1.4;
}

.achievement-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-text {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  font-weight: 600;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .completion-items {
    grid-template-columns: 1fr;
  }

  .achievements-grid {
    grid-template-columns: 1fr;
  }
}
</style>
