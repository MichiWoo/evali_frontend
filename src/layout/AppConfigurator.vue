<template>
  <div
    class="hidden absolute top-full right-0 mt-2 w-80 p-4 bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg shadow-lg z-50"
  >
    <div class="flex flex-col gap-4">
      <div>
        <h3 class="text-lg font-semibold mb-3 text-surface-900 dark:text-surface-0">
          Configuración
        </h3>
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-surface-700 dark:text-surface-300">
          Tema
        </label>
        <div class="flex gap-2">
          <Button
            label="Claro"
            :outlined="isDarkTheme"
            @click="setTheme('light')"
            size="small"
          />
          <Button
            label="Oscuro"
            :outlined="!isDarkTheme"
            @click="setTheme('dark')"
            size="small"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLayout } from './composables/layout'

const { isDarkTheme, toggleDarkMode } = useLayout()

const setTheme = (theme: 'light' | 'dark') => {
  if ((theme === 'dark' && !isDarkTheme.value) || (theme === 'light' && isDarkTheme.value)) {
    toggleDarkMode()
  }
}
</script>

