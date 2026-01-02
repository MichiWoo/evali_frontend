<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { RouterView } from 'vue-router'
import AppLayout from '@/layout/AppLayout.vue'

const route = useRoute()

const useLayout = computed(() => {
  return route.meta.layout === 'AppLayout'
})
</script>

<template>
  <div id="app">
    <AppLayout v-if="useLayout">
      <RouterView />
    </AppLayout>
    <RouterView v-else />
  </div>
</template>

<style>
#app {
  min-height: 100vh;
  background: var(--p-color-surface-50);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: var(--p-color-text);
}

h1, h2, h3, h4, h5, h6 {
  margin: 0;
  font-weight: 600;
  line-height: 1.2;
}

p {
  margin: 0;
}

a {
  color: var(--p-color-primary);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

button {
  font-family: inherit;
}

input, textarea, select {
  font-family: inherit;
}
</style>
