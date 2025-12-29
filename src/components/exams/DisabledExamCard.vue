<template>
  <div class="disabled-exam-card">
    <div class="disabled-overlay">
      <i class="pi pi-lock"></i>
      <span>Deshabilitado</span>
    </div>
    <div class="exam-content">
      <h3>{{ exam.title }}</h3>
      <p v-if="exam.description">{{ exam.description }}</p>
      <div class="exam-stats">
        <span class="stat" v-if="exam.duration">
          <i class="pi pi-clock"></i>
          {{ exam.duration }} min
        </span>
        <span class="stat">
          <i class="pi pi-question-circle"></i>
          {{ exam.questions_count || 0 }} preguntas
        </span>
        <span class="stat" v-if="exam.max_attempts">
          <i class="pi pi-refresh"></i>
          {{ exam.max_attempts }} intentos
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
interface Exam {
  id: number
  title: string
  description?: string | null
  duration?: number | null
  max_attempts?: number
  questions_count?: number
}

defineProps<{
  exam: Exam
}>()
</script>

<style scoped>
.disabled-exam-card {
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

.exam-content {
  position: relative;
  z-index: 1;
}

.exam-content h3 {
  margin: 0 0 0.5rem 0;
  color: var(--p-color-text-secondary);
  font-size: 1.1rem;
}

.exam-content p {
  margin: 0 0 1rem 0;
  color: var(--p-color-text-secondary);
  font-size: 0.9rem;
  line-height: 1.4;
}

.exam-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
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
