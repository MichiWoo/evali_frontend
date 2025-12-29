<template>
  <div class="app-breadcrumb">
    <Breadcrumb :model="breadcrumbItems" :home="breadcrumbHome" class="app-breadcrumb-component" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBreadcrumbs } from '@/composables/useBreadcrumbs'
import Breadcrumb from 'primevue/breadcrumb'
import type { MenuItem } from 'primevue/menuitem'

const { breadcrumbs } = useBreadcrumbs()

/**
 * Configuración del home breadcrumb
 */
const breadcrumbHome = computed<MenuItem>(() => {
  return {
    icon: 'pi pi-home',
    to: '/',
  }
})

/**
 * Convertir breadcrumbs a formato de PrimeVue
 */
const breadcrumbItems = computed<MenuItem[]>(() => {
  return breadcrumbs.value.map((item) => ({
    label: item.label,
    to: item.to,
    disabled: !item.to, // Deshabilitar el último item (sin to)
  }))
})
</script>

<style scoped lang="scss">
.app-breadcrumb {
  padding: 0.75rem 1rem;
  background: var(--surface-ground);
  border-bottom: 1px solid var(--surface-border);

  :deep(.app-breadcrumb-component) {
    .p-breadcrumb {
      background: transparent;
      border: none;
      padding: 0;
    }

    .p-breadcrumb-list {
      margin: 0;
    }

    .p-breadcrumb-item {
      .p-menuitem-link {
        padding: 0.5rem;
        border-radius: 4px;
        transition: background-color 0.2s;

        &:hover {
          background: var(--surface-hover);
        }
      }
    }
  }
}

// Estilos para tema oscuro
:global(.app-dark) {
  .app-breadcrumb {
    background: var(--surface-section);
    border-bottom-color: var(--surface-border);
  }
}
</style>
