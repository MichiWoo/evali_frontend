<template>
  <div class="settings-view">
    <div class="card">
      <h1>Configuración</h1>
      <p>Configuraciones del sistema en desarrollo</p>
      <Button label="Ir al Dashboard" @click="$router.push('/dashboard')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
</script>

<style scoped>
.settings-view {
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
