<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <div class="flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="text-3xl font-bold text-900 mb-2">Configuración del Perfil</h1>
            <p class="text-600 m-0">Personaliza tu experiencia y preferencias</p>
          </div>
          <Button
            label="Volver al Perfil"
            icon="pi pi-arrow-left"
            severity="secondary"
            outlined
            @click="$router.push('/profile')"
          />
        </div>

        <ProfilePreferences />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import ProfilePreferences from '@/components/profile/ProfilePreferences.vue'
</script>

<style scoped>
.card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
