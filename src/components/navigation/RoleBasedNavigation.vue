<template>
  <div class="role-based-navigation">
    <!-- Student Navigation -->
    <div v-if="isStudent" class="student-nav">
      <h3 class="nav-title">Estudiante</h3>
      <nav class="nav-menu">
        <router-link to="/student/dashboard" class="nav-item">
          <i class="pi pi-home"></i>
          <span>Mi Dashboard</span>
        </router-link>
        <router-link to="/student/exams" class="nav-item">
          <i class="pi pi-file-edit"></i>
          <span>Mis Exámenes</span>
        </router-link>
        <router-link to="/student/results" class="nav-item">
          <i class="pi pi-chart-bar"></i>
          <span>Mis Resultados</span>
        </router-link>
      </nav>
    </div>

    <!-- Teacher Navigation -->
    <div v-else-if="isTeacher" class="teacher-nav">
      <h3 class="nav-title">Profesor</h3>
      <nav class="nav-menu">
        <router-link to="/dashboard" class="nav-item">
          <i class="pi pi-home"></i>
          <span>Dashboard</span>
        </router-link>
        <router-link to="/exams" class="nav-item">
          <i class="pi pi-file-edit"></i>
          <span>Exámenes</span>
        </router-link>
        <router-link to="/questions" class="nav-item">
          <i class="pi pi-question-circle"></i>
          <span>Preguntas</span>
        </router-link>
        <router-link to="/groups" class="nav-item">
          <i class="pi pi-users"></i>
          <span>Grupos</span>
        </router-link>
        <router-link to="/teacher/results" class="nav-item">
          <i class="pi pi-chart-bar"></i>
          <span>Resultados</span>
        </router-link>
      </nav>
    </div>

    <!-- Admin Navigation -->
    <div v-else-if="isAdmin" class="admin-nav">
      <h3 class="nav-title">Administrador</h3>
      <nav class="nav-menu">
        <router-link to="/dashboard" class="nav-item">
          <i class="pi pi-home"></i>
          <span>Dashboard</span>
        </router-link>
        <router-link to="/exams" class="nav-item">
          <i class="pi pi-file-edit"></i>
          <span>Exámenes</span>
        </router-link>
        <router-link to="/questions" class="nav-item">
          <i class="pi pi-question-circle"></i>
          <span>Preguntas</span>
        </router-link>
        <router-link to="/groups" class="nav-item">
          <i class="pi pi-users"></i>
          <span>Grupos</span>
        </router-link>
        <router-link to="/teacher/results" class="nav-item">
          <i class="pi pi-chart-bar"></i>
          <span>Resultados</span>
        </router-link>
        <router-link to="/student/dashboard" class="nav-item">
          <i class="pi pi-user"></i>
          <span>Vista Estudiante</span>
        </router-link>
      </nav>
    </div>

    <!-- Common Navigation -->
    <div class="common-nav">
      <h3 class="nav-title">General</h3>
      <nav class="nav-menu">
        <router-link to="/profile" class="nav-item">
          <i class="pi pi-user"></i>
          <span>Perfil</span>
        </router-link>
        <router-link to="/settings" class="nav-item">
          <i class="pi pi-cog"></i>
          <span>Configuración</span>
        </router-link>
        <router-link to="/notifications" class="nav-item">
          <i class="pi pi-bell"></i>
          <span>Notificaciones</span>
        </router-link>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePermissions } from '@/composables/usePermissions'

const { isStudent, isTeacher, isAdmin } = usePermissions()
</script>

<style scoped>
.role-based-navigation {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1rem;
}

.nav-title {
  margin: 0 0 1rem 0;
  color: var(--p-color-text);
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--p-color-text-secondary);
  text-decoration: none;
  border-radius: var(--p-border-radius);
  transition: all 0.2s;
  font-size: 0.9rem;
}

.nav-item:hover {
  background: var(--p-color-surface-100);
  color: var(--p-color-text);
}

.nav-item.router-link-active {
  background: var(--p-color-primary-100);
  color: var(--p-color-primary-700);
  font-weight: 500;
}

.nav-item i {
  font-size: 1rem;
  width: 16px;
  text-align: center;
}

/* Role-specific styling */
.student-nav .nav-item.router-link-active {
  background: var(--p-color-green-100);
  color: var(--p-color-green-700);
}

.teacher-nav .nav-item.router-link-active {
  background: var(--p-color-blue-100);
  color: var(--p-color-blue-700);
}

.admin-nav .nav-item.router-link-active {
  background: var(--p-color-purple-100);
  color: var(--p-color-purple-700);
}

@media (max-width: 768px) {
  .role-based-navigation {
    padding: 0.5rem;
  }

  .nav-item {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }
}
</style>
