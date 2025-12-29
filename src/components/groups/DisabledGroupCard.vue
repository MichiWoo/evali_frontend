<template>
  <div class="disabled-group-card">
    <div class="disabled-overlay">
      <i class="pi pi-lock"></i>
      <span>Deshabilitado</span>
    </div>
    <div class="group-content">
      <h3>{{ group.name }}</h3>
      <p v-if="group.description">{{ group.description }}</p>
      <div class="group-stats">
        <span class="stat">
          <i class="pi pi-users"></i>
          {{ group.students_count || 0 }} estudiantes
        </span>
        <span class="stat">
          <i class="pi pi-file"></i>
          {{ group.exams_count || 0 }} exámenes
        </span>
      </div>
    </div>
    <div class="disabled-reason">
      <i class="pi pi-info-circle"></i>
      <span>Deshabilitado por límites del plan gratuito</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Group {
  id: number
  name: string
  description?: string | null
  students_count?: number
  exams_count?: number
}

defineProps<{
  group: Group
}>()
</script>

<style scoped>
.disabled-group-card {
  position: relative;
  background: var(--p-color-surface-100);
  border: 1px solid var(--p-color-surface-300);
  border-radius: 8px;
  padding: 1rem;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.disabled-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  z-index: 2;
}

.disabled-overlay i {
  font-size: 2rem;
  color: var(--p-color-text-secondary);
  margin-bottom: 0.5rem;
}

.disabled-overlay span {
  color: var(--p-color-text-secondary);
  font-weight: 600;
  font-size: 0.9rem;
}

.group-content {
  position: relative;
  z-index: 1;
}

.group-content h3 {
  margin: 0 0 0.5rem 0;
  color: var(--p-color-text-secondary);
  font-size: 1.1rem;
}

.group-content p {
  margin: 0 0 1rem 0;
  color: var(--p-color-text-secondary);
  font-size: 0.9rem;
  line-height: 1.4;
}

.group-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--p-color-text-secondary);
  font-size: 0.8rem;
}

.stat i {
  font-size: 0.8rem;
}

.disabled-reason {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  right: 0.5rem;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.7rem;
  color: #856404;
  z-index: 3;
}

.disabled-reason i {
  font-size: 0.7rem;
}
</style>
