<script setup>
import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'

// Router y stores
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

// Estado del formulario
const formData = reactive({
  email: '',
  password: '',
  remember: false,
})

const isLoading = ref(false)
const _showPassword = ref(false)

// Validaciones
const emailError = ref('')
const passwordError = ref('')

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
  } else if (formData.password.length < 6) {
    passwordError.value = 'La contraseña debe tener al menos 6 caracteres'
    isValid = false
  } else {
    passwordError.value = ''
  }

  return isValid
}

const handleLogin = async () => {
  if (!validateForm()) {
    return
  }

  // Limpiar errores previos
  emailError.value = ''
  passwordError.value = ''

  try {
    isLoading.value = true

    const result = await authStore.login({
      email: formData.email,
      password: formData.password,
    })

    if (result && result.data) {
      toast.add({
        severity: 'success',
        summary: '¡Bienvenido!',
        detail: 'Has iniciado sesión correctamente',
        life: 3000,
      })

      // Verificar si hay una ruta de redirección en los query params
      const redirectPath = route.query.redirect;

      if (redirectPath && typeof redirectPath === 'string') {
        // Si hay una ruta de redirección, ir a esa ruta
        router.push(redirectPath);
        return;
      }

      // Si no hay redirección, redirigir al dashboard basado en el rol del usuario
      const userRole = result.data.user.roles?.[0]?.name
      console.log('Login successful, user role:', userRole)

      if (userRole === 'student') {
        router.push('/student/dashboard')
      } else if (userRole === 'teacher' || userRole === 'admin') {
        router.push('/dashboard')
      } else {
        router.push('/')
      }
    } else {
      // Si no hay resultado pero no hay error, mostrar mensaje genérico
      toast.add({
        severity: 'error',
        summary: 'Error de autenticación',
        detail: 'Credenciales incorrectas',
        life: 5000,
      })
      passwordError.value = 'Credenciales incorrectas'
    }
  } catch (error) {
    console.error('Login error:', error)

    let errorMessage = 'Ha ocurrido un error al iniciar sesión'

    // Extraer el mensaje de error del backend
    if (error.response) {
      const status = error.response.status
      const responseData = error.response.data

      // Error 422: Credenciales incorrectas o validación
      if (status === 422) {
        // Formato: { errors: [{ title: 'Invalid credentials' }] }
        if (
          responseData.errors &&
          Array.isArray(responseData.errors) &&
          responseData.errors.length > 0
        ) {
          errorMessage =
            responseData.errors[0].title ||
            responseData.errors[0].message ||
            'Credenciales incorrectas'
        }
        // Formato alternativo: { errors: { email: [...], password: [...] } }
        else if (responseData.errors) {
          const firstError = Object.values(responseData.errors)[0]
          if (Array.isArray(firstError) && firstError.length > 0) {
            errorMessage = firstError[0]
          }
        }
        // Formato: { message: '...' }
        else if (responseData.message) {
          errorMessage = responseData.message
        }

        // Traducir mensajes comunes al español
        if (errorMessage.toLowerCase().includes('invalid credentials')) {
          errorMessage = 'Las credenciales son incorrectas'
        }

        passwordError.value = errorMessage
      }
      // Error 429: Demasiados intentos
      else if (status === 429) {
        if (
          responseData.errors &&
          Array.isArray(responseData.errors) &&
          responseData.errors.length > 0
        ) {
          errorMessage =
            responseData.errors[0].title || 'Demasiados intentos. Por favor intenta más tarde.'
        } else {
          errorMessage = 'Demasiados intentos. Por favor intenta más tarde.'
        }
      }
      // Error 500: Error del servidor
      else if (status >= 500) {
        errorMessage = 'Error del servidor. Por favor intenta más tarde.'
      }
      // Error de red o sin conexión
      else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        errorMessage = 'Error de conexión. Verifica tu internet.'
      }
    }

    // Mostrar toast con el mensaje de error
    console.log('Mostrando toast con mensaje:', errorMessage)
    toast.add({
      severity: 'error',
      summary: 'Error de autenticación',
      detail: errorMessage,
      life: 5000,
    })
    console.log('Toast agregado')
  } finally {
    isLoading.value = false
  }
}

const handleForgotPassword = () => {
  router.push('/forgot-password')
}

const handleRegister = () => {
  router.push('/register')
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Header -->
      <div class="text-center mb-6">
        <div class="logo-container mb-4">
          <i class="pi pi-graduation-cap text-6xl text-primary"></i>
        </div>
        <h1 class="text-3xl font-bold text-900 mb-2">Evali</h1>
        <p class="text-600 text-lg">Plataforma de Evaluaciones Online</p>
      </div>

      <!-- Formulario de login -->
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="field mb-4">
          <label for="email" class="block text-900 font-medium mb-2">Email</label>
          <InputText
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="tu@email.com"
            class="w-full"
            :class="{ 'p-invalid': emailError }"
            @blur="validateForm"
          />
          <small v-if="emailError" class="p-error">{{ emailError }}</small>
        </div>

        <div class="field mb-4">
          <label for="password" class="block text-900 font-medium mb-2">Contraseña</label>
          <Password
            id="password"
            v-model="formData.password"
            placeholder="Tu contraseña"
            class="w-full"
            :class="{ 'p-invalid': passwordError }"
            :feedback="false"
            toggleMask
            @blur="validateForm"
          />
          <small v-if="passwordError" class="p-error">{{ passwordError }}</small>
        </div>

        <div class="flex align-items-center justify-content-between mb-4">
          <div class="flex align-items-center">
            <Checkbox id="remember" v-model="formData.remember" binary />
            <label for="remember" class="ml-2 text-600">Recordarme</label>
          </div>
          <Button
            type="button"
            label="¿Olvidaste tu contraseña?"
            class="p-button-link p-0"
            @click="handleForgotPassword"
          />
        </div>

        <Button
          type="submit"
          label="Iniciar Sesión"
          class="w-full"
          :loading="isLoading"
          :disabled="isLoading"
        />
      </form>

      <!-- Enlaces adicionales -->
      <div class="text-center mt-4">
        <p class="text-600 mb-2">¿No tienes una cuenta?</p>
        <Button label="Registrarse" class="p-button-outlined w-full" @click="handleRegister" />
      </div>

      <!-- Información adicional -->
      <div class="text-center mt-6">
        <div class="flex justify-content-center gap-4 text-600 text-sm">
          <a href="/help" class="text-primary no-underline">Ayuda</a>
          <a href="/privacy" class="text-primary no-underline">Privacidad</a>
          <a href="/terms" class="text-primary no-underline">Términos</a>
        </div>
      </div>
    </div>
    <Toast />
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.login-card {
  background: var(--surface-card);
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
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

.login-form {
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
  .login-container {
    padding: 1rem;
  }

  .login-card {
    padding: 2rem;
  }
}
</style>
