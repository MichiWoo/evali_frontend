<template>
  <div class="app-layout">
    <!-- Top Navigation -->
    <header class="app-header">
      <div class="header-content">
        <div class="logo">
          <h1>Evali</h1>
        </div>

        <nav class="main-nav">
          <!-- Student Navigation -->
          <template v-if="isStudent">
            <router-link to="/student/dashboard" class="nav-link">
              <i class="pi pi-home"></i>
              Mi Dashboard
            </router-link>
            <router-link to="/student/exams" class="nav-link">
              <i class="pi pi-graduation-cap"></i>
              Mis Exámenes
            </router-link>
            <router-link to="/student/results" class="nav-link">
              <i class="pi pi-chart-bar"></i>
              Mis Resultados
            </router-link>
            <router-link to="/plans" class="nav-link">
              <i class="pi pi-credit-card"></i>
              Planes
            </router-link>
          </template>

          <!-- Teacher/Admin Navigation -->
          <template v-else-if="isTeacher || isAdmin">
            <router-link to="/dashboard" class="nav-link">
              <i class="pi pi-home"></i>
              Dashboard
            </router-link>
            <router-link to="/exams" class="nav-link">
              <i class="pi pi-file-edit"></i>
              Exámenes
            </router-link>
            <router-link to="/questions" class="nav-link">
              <i class="pi pi-question-circle"></i>
              Preguntas
            </router-link>
            <router-link to="/groups" class="nav-link">
              <i class="pi pi-users"></i>
              Grupos
            </router-link>
            <router-link to="/students" class="nav-link">
              <i class="pi pi-user-plus"></i>
              Estudiantes
            </router-link>
            <router-link to="/teacher/results" class="nav-link">
              <i class="pi pi-chart-line"></i>
              Resultados
            </router-link>
            <router-link to="/subscriptions" class="nav-link">
              <i class="pi pi-credit-card"></i>
              Suscripciones
            </router-link>
          </template>
        </nav>

        <div class="header-actions">
          <!-- Notificaciones -->
          <NotificationBell />

          <!-- Menú de usuario -->
          <div class="user-menu">
            <Button
              :label="user?.name || 'Usuario'"
              icon="pi pi-user"
              text
              severity="secondary"
              @click="toggleUserMenu"
            />
            <Menu ref="userMenu" :model="userMenuItems" :popup="true" />
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="app-main">
      <div class="main-content">
        <slot />
      </div>
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="footer-content">
        <p>&copy; 2025 Evali. Todos los derechos reservados.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePermissions } from '@/composables/usePermissions'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import NotificationBell from '@/components/notifications/NotificationBell.vue'

const router = useRouter()
const authStore = useAuthStore()
const { isStudent, isTeacher, isAdmin } = usePermissions()

const userMenu = ref()
const user = computed(() => authStore.user)

const userMenuItems = computed(() => [
  {
    label: 'Notificaciones',
    icon: 'pi pi-bell',
    command: () => router.push('/notifications'),
  },
  {
    label: 'Perfil',
    icon: 'pi pi-user',
    command: () => router.push('/profile'),
  },
  {
    label: 'Configuración',
    icon: 'pi pi-cog',
    command: () => router.push('/settings'),
  },
  {
    separator: true,
  },
  {
    label: 'Cerrar Sesión',
    icon: 'pi pi-sign-out',
    command: handleLogout,
  },
])

const toggleUserMenu = (event: Event) => {
  userMenu.value.toggle(event)
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Error during logout:', error)
  }
}

onMounted(() => {
  authStore.initializeAuth()
})
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  --header-height: 4rem;
}

.app-header {
  background: var(--p-color-surface-0);
  border-bottom: 1px solid var(--p-color-surface-200);
  padding: 0 1rem;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  height: 4rem;
}

.logo h1 {
  margin: 0;
  color: var(--p-color-primary);
  font-size: 1.5rem;
  font-weight: 600;
}

.main-nav {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: var(--p-color-text);
  border-radius: var(--p-border-radius);
  transition: all 0.2s;
}

.nav-link:hover {
  background: var(--p-color-surface-100);
  color: var(--p-color-primary);
}

.nav-link.router-link-active {
  background: var(--p-color-primary);
  color: var(--p-color-primary-contrast);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.app-main {
  flex: 1;
  background: var(--p-color-surface-50);
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.app-footer {
  background: var(--p-color-surface-0);
  border-top: 1px solid var(--p-color-surface-200);
  padding: 1rem;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
  color: var(--p-color-text-secondary);
}

@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    height: auto;
    padding: 1rem 0;
  }

  .main-nav {
    order: 3;
    width: 100%;
    justify-content: center;
    margin-top: 1rem;
  }

  .user-menu {
    order: 2;
  }
}
</style>
