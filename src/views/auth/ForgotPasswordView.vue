<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'

// Router y stores
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

// Estado del formulario
const formData = reactive({
  email: '',
})

const isLoading = ref(false)
const emailSent = ref(false)
const emailError = ref('')

// Validaciones
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

const validateForm = () => {
  let isValid = true

  // Validar email
  if (!formData.email) {
    emailError.value = 'El email es requerido'
    isValid = false
  } else if (!validateEmail(formData.email)) {
    emailError.value = 'El email no es válido'
    isValid = false
  } else {
    emailError.value = ''
  }

  return isValid
}

const handleForgotPassword = async () => {
  if (!validateForm()) {
    return
  }

  // Limpiar errores previos
  emailError.value = ''

  try {
    isLoading.value = true

    const result = await authStore.forgotPassword(formData.email)

    if (result && result.success) {
      emailSent.value = true
      toast.add({
        severity: 'success',
        summary: '¡Enlace enviado!',
        detail:
          result.data?.message ||
          'Se ha enviado un enlace de recuperación a tu correo electrónico.',
        life: 5000,
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: result?.error || 'Error al enviar el enlace de recuperación',
        life: 5000,
      })
    }
  } catch (_error) {
    console.error('Forgot password error:', error)

    let errorMessage = 'Ha ocurrido un error al enviar el enlace de recuperación'

    // Extraer el mensaje de error del backend
    if (error.response) {
      const status = error.response.status
      const responseData = error.response.data

      // Error 422: Validación
      if (status === 422) {
        if (
          responseData.errors &&
          Array.isArray(responseData.errors) &&
          responseData.errors.length > 0
        ) {
          errorMessage =
            responseData.errors[0].title ||
            responseData.errors[0].message ||
            'El email no está registrado'
        } else if (responseData.errors?.email) {
          const emailErrors = Array.isArray(responseData.errors.email)
            ? responseData.errors.email
            : [responseData.errors.email]
          errorMessage = emailErrors[0]
        } else if (responseData.message) {
          errorMessage = responseData.message
        }

        emailError.value = errorMessage
      }
      // Error 404: Usuario no encontrado
      else if (status === 404) {
        if (
          responseData.errors &&
          Array.isArray(responseData.errors) &&
          responseData.errors.length > 0
        ) {
          errorMessage = responseData.errors[0].title || 'Usuario no encontrado'
        } else {
          errorMessage = 'No se encontró un usuario con ese correo electrónico'
        }
        emailError.value = errorMessage
      }
      // Error 429: Demasiados intentos
      else if (status === 429) {
        errorMessage = 'Demasiados intentos. Por favor intenta más tarde.'
      }
      // Error 500: Error del servidor
      else if (status >= 500) {
        errorMessage = 'Error del servidor. Por favor intenta más tarde.'
      }
      // Error de red
      else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        errorMessage = 'Error de conexión. Verifica tu internet.'
      }
    }

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
      life: 5000,
    })
  } finally {
    isLoading.value = false
  }
}

const handleBackToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="forgot-password-container">
    <div class="forgot-password-card">
      <!-- Header -->
      <div class="text-center mb-6">
        <div class="logo-container mb-4">
          <i class="pi pi-key text-6xl text-primary"></i>
        </div>
        <h1 class="text-3xl font-bold text-900 mb-2">Recuperar Contraseña</h1>
        <p class="text-600 text-lg">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
        </p>
      </div>

      <!-- Mensaje de éxito -->
      <Message v-if="emailSent" severity="success" :closable="false" class="mb-4">
        <div class="flex flex-column gap-2">
          <p class="m-0 font-semibold">¡Enlace enviado!</p>
          <p class="m-0 text-sm">
            Se ha enviado un enlace de recuperación a tu correo electrónico. Por favor revisa tu
            bandeja de entrada y sigue las instrucciones.
          </p>
          <p class="m-0 text-sm text-600">
            Si no recibes el correo en unos minutos, revisa tu carpeta de spam.
          </p>
        </div>
      </Message>

      <!-- Formulario -->
      <form v-if="!emailSent" @submit.prevent="handleForgotPassword" class="forgot-password-form">
        <div class="field mb-4">
          <label for="email" class="block text-900 font-medium mb-2">Correo Electrónico</label>
          <InputText
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="tu@email.com"
            class="w-full"
            :class="{ 'p-invalid': emailError }"
            @blur="validateForm"
            :disabled="isLoading"
          />
          <small v-if="emailError" class="p-error">{{ emailError }}</small>
        </div>

        <Button
          type="submit"
          label="Enviar Enlace de Recuperación"
          class="w-full mb-3"
          :loading="isLoading"
          :disabled="isLoading"
        />

        <div class="text-center">
          <Button
            type="button"
            label="Volver al Login"
            class="p-button-link p-0"
            @click="handleBackToLogin"
          />
        </div>
      </form>

      <!-- Botón de volver después de enviar -->
      <div v-if="emailSent" class="text-center mt-4">
        <Button label="Volver al Login" class="w-full" @click="handleBackToLogin" />
      </div>

      <!-- Información adicional -->
      <div class="text-center mt-6">
        <p class="text-600 text-sm mb-2">¿Recordaste tu contraseña?</p>
        <Button
          label="Iniciar Sesión"
          class="p-button-outlined w-full"
          @click="handleBackToLogin"
        />
      </div>
    </div>
    <Toast />
  </div>
</template>

<style scoped>
.forgot-password-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.forgot-password-card {
  background: var(--surface-card);
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
  border: 1px solid var(--surface-border);
}

.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 80px;
  background: var(--primary-50);
  border-radius: 50%;
  margin: 0 auto;
}

.forgot-password-form {
  margin-bottom: 1rem;
}

.field {
  margin-bottom: 1.5rem;
}

.p-error {
  display: block;
  margin-top: 0.5rem;
}

/* Responsive */
@media (max-width: 480px) {
  .forgot-password-container {
    padding: 1rem;
  }

  .forgot-password-card {
    padding: 2rem;
  }
}
</style>
