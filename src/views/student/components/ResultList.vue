<template>
  <div class="result-list">
    <div v-if="isLoading" class="loading-container">
      <ProgressSpinner />
      <p class="text-600 mt-3">Cargando resultados...</p>
    </div>

    <div v-else-if="!results || results.length === 0" class="empty-state">
      <i class="pi pi-inbox text-4xl text-400 mb-3"></i>
      <p class="text-600 text-lg">{{ emptyMessage }}</p>
    </div>

    <div v-else class="results-grid">
      <ResultCard
        v-for="result in results"
        :key="result.id"
        :result="result"
        @view-details="handleViewDetails"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ProgressSpinner from 'primevue/progressspinner'
import ResultCard from './ResultCard.vue'

const props = defineProps<{
  results: any[]
  isLoading?: boolean
  emptyMessage?: string
}>()

const emit = defineEmits<{
  'view-details': [result: any]
}>()

const handleViewDetails = (result: any) => {
  emit('view-details', result)
}
</script>

<style scoped>
.result-list {
  min-height: 200px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .results-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
