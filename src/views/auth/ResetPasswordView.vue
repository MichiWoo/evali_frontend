<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'

// Router y stores
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

// Estado del formulario
const formData = reactive({
  email: '',
  password: '',
  password_confirmation: '',
})

const isLoading = ref(false)
const passwordReset = ref(false)
const emailError = ref('')
const passwordError = ref('')
const passwordConfirmationError = ref('')
const tokenError = ref('')

// Obtener token y email de la URL
const resetToken = ref('')
const emailFromUrl = ref('')

onMounted(() => {
  // Obtener token y email de los query parameters
  resetToken.value = route.query.token?.toString() || ''
  emailFromUrl.value = route.query.email?.toString() || ''

  if (emailFromUrl.value) {
    formData.email = decodeURIComponent(emailFromUrl.value)
  }

  // Validar que tenemos token y email
  if (!resetToken.value || !emailFromUrl.value) {
    tokenError.value = 'El enlace de recuperación no es válido o ha expirado.'
    toast.add({
      severity: 'error',
      summary: 'Enlace inválido',
      detail: 'Por favor solicita un nuevo enlace de recuperación.',
      life: 5000,
    })
  }
})

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

  // Validar contraseña
  if (!formData.password) {
    passwordError.value = 'La contraseña es requerida'
    isValid = false
  } else if (formData.password.length < 8) {
    passwordError.value = 'La contraseña debe tener al menos 8 caracteres'
    isValid = false
  } else {
    passwordError.value = ''
  }

  // Validar confirmación de contraseña
  if (!formData.password_confirmation) {
    passwordConfirmationError.value = 'La confirmación de contraseña es requerida'
    isValid = false
  } else if (formData.password !== formData.password_confirmation) {
    passwordConfirmationError.value = 'Las contraseñas no coinciden'
    isValid = false
  } else {
    passwordConfirmationError.value = ''
  }

  return isValid
}

const handleResetPassword = async () => {
  if (!validateForm()) {
    return
  }

  // Validar que tenemos token
  if (!resetToken.value) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'El token de recuperación no es válido. Por favor solicita un nuevo enlace.',
      life: 5000,
    })
    return
  }

  // Limpiar errores previos
  emailError.value = ''
  passwordError.value = ''
  passwordConfirmationError.value = ''

  try {
    isLoading.value = true

    const result = await authStore.resetPassword({
      token: resetToken.value,
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.password_confirmation,
    })

    if (result && result.success) {
      passwordReset.value = true
      toast.add({
        severity: 'success',
        summary: '¡Contraseña restablecida!',
        detail: result.data?.message || 'Tu contraseña ha sido restablecida exitosamente.',
        life: 5000,
      })

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: result?.error || 'Error al restablecer la contraseña',
        life: 5000,
      })
    }
  } catch (_error) {
    console.error('Reset password error:', error)

    let errorMessage = 'Ha ocurrido un error al restablecer la contraseña'

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
          const firstError = responseData.errors[0]
          errorMessage = firstError.title || firstError.message || 'Error de validación'

          // Si el error es sobre el token, indicarlo
          if (
            firstError.title?.toLowerCase().includes('token') ||
            firstError.message?.toLowerCase().includes('token')
          ) {
            tokenError.value = errorMessage
          }
        } else if (responseData.errors) {
          // Errores de validación por campo
          if (responseData.errors.email) {
            const emailErrors = Array.isArray(responseData.errors.email)
              ? responseData.errors.email
              : [responseData.errors.email]
            emailError.value = emailErrors[0]
          }
          if (responseData.errors.password) {
            const passwordErrors = Array.isArray(responseData.errors.password)
              ? responseData.errors.password
              : [responseData.errors.password]
            passwordError.value = passwordErrors[0]
          }
          if (responseData.errors.token) {
            const tokenErrors = Array.isArray(responseData.errors.token)
              ? responseData.errors.token
              : [responseData.errors.token]
            tokenError.value = tokenErrors[0]
          }
        } else if (responseData.message) {
          errorMessage = responseData.message
        }
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

const handleRequestNewLink = () => {
  router.push('/forgot-password')
}
</script>

<template>
  <div class="reset-password-container">
    <div class="reset-password-card">
      <!-- Header -->
      <div class="text-center mb-6">
        <div class="logo-container mb-4">
          <i class="pi pi-lock text-6xl text-primary"></i>
        </div>
        <h1 class="text-3xl font-bold text-900 mb-2">Restablecer Contraseña</h1>
        <p class="text-600 text-lg">Ingresa tu nueva contraseña</p>
      </div>

      <!-- Error de token -->
      <Message v-if="tokenError" severity="error" :closable="false" class="mb-4">
        <div class="flex flex-column gap-2">
          <p class="m-0 font-semibold">{{ tokenError }}</p>
          <Button
            label="Solicitar nuevo enlace"
            class="p-button-sm p-button-outlined mt-2"
            @click="handleRequestNewLink"
          />
        </div>
      </Message>

      <!-- Mensaje de éxito -->
      <Message v-if="passwordReset" severity="success" :closable="false" class="mb-4">
        <div class="flex flex-column gap-2">
          <p class="m-0 font-semibold">¡Contraseña restablecida!</p>
          <p class="m-0 text-sm">
            Tu contraseña ha sido restablecida exitosamente. Serás redirigido al login en unos
            segundos.
          </p>
        </div>
      </Message>

      <!-- Formulario -->
      <form
        v-if="!passwordReset && !tokenError"
        @submit.prevent="handleResetPassword"
        class="reset-password-form"
      >
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
            :disabled="isLoading || !!emailFromUrl"
          />
          <small v-if="emailError" class="p-error">{{ emailError }}</small>
        </div>

        <div class="field mb-4">
          <label for="password" class="block text-900 font-medium mb-2">Nueva Contraseña</label>
          <Password
            id="password"
            v-model="formData.password"
            placeholder="Mínimo 8 caracteres"
            class="w-full"
            :class="{ 'p-invalid': passwordError }"
            :feedback="true"
            toggleMask
            @blur="validateForm"
            :disabled="isLoading"
          />
          <small v-if="passwordError" class="p-error">{{ passwordError }}</small>
        </div>

        <div class="field mb-4">
          <label for="password_confirmation" class="block text-900 font-medium mb-2"
            >Confirmar Nueva Contraseña</label
          >
          <Password
            id="password_confirmation"
            v-model="formData.password_confirmation"
            placeholder="Confirma tu nueva contraseña"
            class="w-full"
            :class="{ 'p-invalid': passwordConfirmationError }"
            :feedback="false"
            toggleMask
            @blur="validateForm"
            :disabled="isLoading"
          />
          <small v-if="passwordConfirmationError" class="p-error">{{
            passwordConfirmationError
          }}</small>
        </div>

        <Button
          type="submit"
          label="Restablecer Contraseña"
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

      <!-- Botón de volver después de restablecer -->
      <div v-if="passwordReset" class="text-center mt-4">
        <Button label="Ir al Login" class="w-full" @click="handleBackToLogin" />
      </div>

      <!-- Información adicional -->
      <div v-if="!passwordReset && !tokenError" class="text-center mt-6">
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
.reset-password-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.reset-password-card {
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

.reset-password-form {
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
  .reset-password-container {
    padding: 1rem;
  }

  .reset-password-card {
    padding: 2rem;
  }
}
</style>
