import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import Components from 'unplugin-vue-components/vite'
import { PrimeVueResolver } from '@primevue/auto-import-resolver'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [PrimeVueResolver()]
    }),
    // Solo habilitar devtools en desarrollo
    ...(process.env.NODE_ENV === 'development' ? [vueDevTools()] : []),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    conditions: ['module', 'import', 'browser', 'default'],
  },
  optimizeDeps: {
    include: ['@stripe/stripe-js']
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // Asegurar que los assets se generen correctamente
    rollupOptions: {
      output: {
        manualChunks: undefined,
        dedupe: ['@stripe/stripe-js']
      },
    },
  },
})
