<template>
  <div class="exam-list">
    <div v-if="isLoading" class="loading-container">
      <ProgressSpinner />
      <p class="text-600 mt-3">Cargando exámenes...</p>
    </div>

    <div v-else-if="exams.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="pi pi-inbox text-6xl text-400"></i>
      </div>
      <h3 class="text-900 font-semibold mb-2">{{ emptyMessage }}</h3>
      <p class="text-600">Vuelve más tarde para ver nuevos exámenes asignados.</p>
    </div>

    <div v-else class="exams-grid">
      <ExamCard
        v-for="exam in exams"
        :key="exam.id"
        :exam="exam"
        @take-exam="$emit('take-exam', exam)"
        @view-results="$emit('view-results', exam)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ProgressSpinner from 'primevue/progressspinner'
import ExamCard from './ExamCard.vue'

defineProps<{
  exams: any[]
  isLoading: boolean
  emptyMessage: string
}>()

defineEmits<{
  'take-exam': [exam: any]
  'view-results': [exam: any]
}>()
</script>

<style scoped>
.exam-list {
  min-height: 400px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.exams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .exams-grid {
    grid-template-columns: 1fr;
  }
}
</style>
