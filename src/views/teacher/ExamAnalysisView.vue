<template>
  <div class="exam-analysis-view">
    <div class="card">
      <h1>Análisis del Examen</h1>
      <p>Herramientas de análisis y estadísticas de exámenes en desarrollo</p>
      <div class="flex gap-3 justify-content-center">
        <Button label="Ver Resultados" @click="$router.push('/teacher/results')" />
        <Button label="Ver Exámenes" @click="$router.push('/exams')" severity="secondary" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
</script>

<style scoped>
.exam-analysis-view {
  padding: 2rem;
}

.card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
}
</style>
