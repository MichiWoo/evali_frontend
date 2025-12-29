<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Checkbox from 'primevue/checkbox'

// Router y stores
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

// Estado del formulario
const formData = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  terms: false,
})

const isLoading = ref(false)
const registrationSuccess = ref(false)
const nameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const passwordConfirmationError = ref('')
const termsError = ref('')

// Validaciones
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

const validateForm = () => {
  let isValid = true

  // Validar nombre
  if (!formData.name.trim()) {
    nameError.value = 'El nombre es requerido'
    isValid = false
  } else if (formData.name.trim().length < 2) {
    nameError.value = 'El nombre debe tener al menos 2 caracteres'
    isValid = false
  } else {
    nameError.value = ''
  }

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

  // Validar términos
  if (!formData.terms) {
    termsError.value = 'Debes aceptar los términos y condiciones'
    isValid = false
  } else {
    termsError.value = ''
  }

  return isValid
}

const handleRegister = async () => {
  if (!validateForm()) {
    return
  }

  // Limpiar errores previos
  nameError.value = ''
  emailError.value = ''
  passwordError.value = ''
  passwordConfirmationError.value = ''
  termsError.value = ''

  try {
    isLoading.value = true

    const result = await authStore.register({
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      password_confirmation: formData.password_confirmation,
    })

    if (result && result.success) {
      registrationSuccess.value = true
      toast.add({
        severity: 'success',
        summary: '¡Registro exitoso!',
        detail:
          'Te hemos enviado un correo de verificación. Por favor revisa tu bandeja de entrada.',
        life: 5000,
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error en el registro',
        detail: result?.error || 'Error al registrarse',
        life: 5000,
      })
    }
  } catch (_error) {
    console.error('Register error:', error)

    let errorMessage = 'Ha ocurrido un error al registrarse'

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
        } else if (responseData.errors) {
          // Errores de validación por campo
          if (responseData.errors.name) {
            const nameErrors = Array.isArray(responseData.errors.name)
              ? responseData.errors.name
              : [responseData.errors.name]
            nameError.value = nameErrors[0]
          }
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
        } else if (responseData.message) {
          errorMessage = responseData.message
        }
      }
      // Error 409: Email ya existe
      else if (status === 409) {
        errorMessage = 'Este correo electrónico ya está registrado'
        emailError.value = 'Este correo electrónico ya está registrado'
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
      summary: 'Error en el registro',
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

const handleResendVerification = async () => {
  try {
    isLoading.value = true
    await authStore.sendVerificationEmail()
    toast.add({
      severity: 'success',
      summary: 'Correo enviado',
      detail: 'Se ha enviado un nuevo enlace de verificación a tu correo electrónico.',
      life: 5000,
    })
  } catch (_error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al enviar el correo de verificación. Por favor intenta más tarde.',
      life: 5000,
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="register-container">
    <div class="register-card">
      <!-- Header -->
      <div class="text-center mb-6">
        <div class="logo-container mb-4">
          <i class="pi pi-user-plus text-6xl text-primary"></i>
        </div>
        <h1 class="text-3xl font-bold text-900 mb-2">Crear Cuenta</h1>
        <p class="text-600 text-lg">Regístrate para comenzar a gestionar tus exámenes</p>
      </div>

      <!-- Mensaje de éxito -->
      <Message v-if="registrationSuccess" severity="success" :closable="false" class="mb-4">
        <div class="flex flex-column gap-2">
          <p class="m-0 font-semibold">¡Registro exitoso!</p>
          <p class="m-0 text-sm">
            Hemos enviado un correo de verificación a <strong>{{ formData.email }}</strong
            >. Por favor revisa tu bandeja de entrada y haz clic en el enlace para verificar tu
            cuenta.
          </p>
          <p class="m-0 text-sm text-600">
            Si no recibes el correo en unos minutos, revisa tu carpeta de spam o
            <Button
              label="solicita un nuevo enlace"
              class="p-button-link p-0 text-sm"
              @click="handleResendVerification"
              :disabled="isLoading"
            />.
          </p>
        </div>
      </Message>

      <!-- Formulario -->
      <form v-if="!registrationSuccess" @submit.prevent="handleRegister" class="register-form">
        <div class="field mb-4">
          <label for="name" class="block text-900 font-medium mb-2">Nombre Completo</label>
          <InputText
            id="name"
            v-model="formData.name"
            placeholder="Tu nombre completo"
            class="w-full"
            :class="{ 'p-invalid': nameError }"
            @blur="validateForm"
            :disabled="isLoading"
          />
          <small v-if="nameError" class="p-error">{{ nameError }}</small>
        </div>

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

        <div class="field mb-4">
          <label for="password" class="block text-900 font-medium mb-2">Contraseña</label>
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
            >Confirmar Contraseña</label
          >
          <Password
            id="password_confirmation"
            v-model="formData.password_confirmation"
            placeholder="Confirma tu contraseña"
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

        <div class="field mb-4">
          <div class="flex align-items-center">
            <Checkbox
              id="terms"
              v-model="formData.terms"
              binary
              :class="{ 'p-invalid': termsError }"
              :disabled="isLoading"
            />
            <label for="terms" class="ml-2 text-600">
              Acepto los
              <a href="/terms" target="_blank" class="text-primary no-underline"
                >términos y condiciones</a
              >
              y la
              <a href="/privacy" target="_blank" class="text-primary no-underline"
                >política de privacidad</a
              >
            </label>
          </div>
          <small v-if="termsError" class="p-error">{{ termsError }}</small>
        </div>

        <Button
          type="submit"
          label="Registrarse"
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

      <!-- Botón de volver después de registro -->
      <div v-if="registrationSuccess" class="text-center mt-4">
        <Button label="Ir al Login" class="w-full" @click="handleBackToLogin" />
      </div>

      <!-- Información adicional -->
      <div v-if="!registrationSuccess" class="text-center mt-6">
        <p class="text-600 text-sm mb-2">¿Ya tienes una cuenta?</p>
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
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.register-card {
  background: var(--surface-card);
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
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

.register-form {
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
  .register-container {
    padding: 1rem;
  }

  .register-card {
    padding: 2rem;
  }
}
</style>
