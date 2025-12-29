import '@/assets/styles.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import StyleClass from 'primevue/styleclass'
import Tooltip from 'primevue/tooltip'

// Initialize API service FIRST to ensure interceptors are configured
import '@/services/api.ts'

import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: 'system',
      cssLayer: false,
    },
  },
})

app.use(ToastService)
app.use(ConfirmationService)

// Register directives
app.directive('styleclass', StyleClass)
app.directive('tooltip', Tooltip)

// Global error handler
app.config.errorHandler = (err, instance, info) => {
  // Log the error but don't crash the app
  console.error('Vue Error:', err)
  console.error('Component:', instance)
  console.error('Info:', info)

  // Ignore StyleClass errors specifically
  if (err instanceof TypeError && err.message.includes('offsetParent')) {
    console.warn('StyleClass DOM error ignored:', err.message)
    return
  }
}

// Initialize auth after Pinia is set up
const authStore = useAuthStore()
authStore.initializeAuth()

app.mount('#app')
