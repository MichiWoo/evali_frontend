<script setup>
import { onBeforeUnmount, ref } from 'vue'
import AppConfigurator from '@/layout/AppConfigurator.vue'
import { useLayout } from '@/layout/composables/layout'

const { toggleDarkMode, isDarkTheme } = useLayout()

// Add ref to ensure proper cleanup
const configuratorButton = ref(null)

// Cleanup on unmount to prevent StyleClass errors
onBeforeUnmount(() => {
  if (configuratorButton.value) {
    // Remove any pending StyleClass operations
    configuratorButton.value = null
  }
})
</script>

<template>
  <div class="fixed flex gap-4 top-8 right-8">
    <Button
      type="button"
      @click="toggleDarkMode"
      rounded
      :icon="isDarkTheme ? 'pi pi-moon' : 'pi pi-sun'"
      severity="secondary"
    />
    <div class="relative">
      <Button
        ref="configuratorButton"
        icon="pi pi-palette"
        v-styleclass="{
          selector: '@next',
          enterFromClass: 'hidden',
          enterActiveClass: 'animate-scalein',
          leaveToClass: 'hidden',
          leaveActiveClass: 'animate-fadeout',
          hideOnOutsideClick: true,
        }"
        type="button"
        rounded
      />
      <AppConfigurator />
    </div>
  </div>
</template>
