<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h1>Evali</h1>
        <p>Crea tu cuenta</p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="name">Nombre completo</label>
          <InputText
            id="name"
            v-model="form.name"
            placeholder="Tu nombre completo"
            :class="{ 'p-invalid': errors.name }"
            required
          />
          <small v-if="errors.name" class="error-message">{{ errors.name }}</small>
        </div>

        <div class="form-group">
          <label for="email">Correo electrónico</label>
          <InputText
            id="email"
            v-model="form.email"
            type="email"
            placeholder="tu@email.com"
            :class="{ 'p-invalid': errors.email }"
            required
          />
          <small v-if="errors.email" class="error-message">{{ errors.email }}</small>
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <Password
            id="password"
            v-model="form.password"
            placeholder="Tu contraseña"
            :class="{ 'p-invalid': errors.password }"
            :feedback="true"
            toggleMask
            required
          />
          <small v-if="errors.password" class="error-message">{{ errors.password }}</small>
        </div>

        <div class="form-group">
          <label for="password_confirmation">Confirmar contraseña</label>
          <Password
            id="password_confirmation"
            v-model="form.password_confirmation"
            placeholder="Confirma tu contraseña"
            :class="{ 'p-invalid': errors.password_confirmation }"
            :feedback="false"
            toggleMask
            required
          />
          <small v-if="errors.password_confirmation" class="error-message">{{
            errors.password_confirmation
          }}</small>
        </div>

        <div class="form-actions">
          <Button
            type="submit"
            label="Crear Cuenta"
            :loading="isLoading"
            :disabled="!isFormValid"
            class="register-button"
          />
        </div>

        <div class="form-footer">
          <p>
            ¿Ya tienes cuenta?
            <router-link to="/login" class="link">Inicia sesión aquí</router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import type { RegisterRequest } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive<RegisterRequest>({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const errors = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const isLoading = computed(() => authStore.isLoading)

const isFormValid = computed(() => {
  return (
    form.name &&
    form.email &&
    form.password &&
    form.password_confirmation &&
    !errors.name &&
    !errors.email &&
    !errors.password &&
    !errors.password_confirmation
  )
})

const validateForm = () => {
  errors.name = ''
  errors.email = ''
  errors.password = ''
  errors.password_confirmation = ''

  if (!form.name) {
    errors.name = 'El nombre es requerido'
    return false
  }

  if (!form.email) {
    errors.email = 'El correo electrónico es requerido'
    return false
  }

  if (!form.password) {
    errors.password = 'La contraseña es requerida'
    return false
  }

  if (form.password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres'
    return false
  }

  if (!form.password_confirmation) {
    errors.password_confirmation = 'La confirmación de contraseña es requerida'
    return false
  }

  if (form.password !== form.password_confirmation) {
    errors.password_confirmation = 'Las contraseñas no coinciden'
    return false
  }

  return true
}

const handleRegister = async () => {
  if (!validateForm()) return

  try {
    await authStore.register(form)
    router.push('/dashboard')
  } catch (error: any) {
    console.error('Register error:', error)

    if (error.response?.status === 422) {
      const validationErrors = error.response.data.errors
      if (validationErrors.name) {
        errors.name = validationErrors.name[0]
      }
      if (validationErrors.email) {
        errors.email = validationErrors.email[0]
      }
      if (validationErrors.password) {
        errors.password = validationErrors.password[0]
      }
      if (validationErrors.password_confirmation) {
        errors.password_confirmation = validationErrors.password_confirmation[0]
      }
    } else {
      errors.email = 'Error al crear la cuenta. Inténtalo de nuevo.'
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    var(--p-color-primary-50) 0%,
    var(--p-color-primary-100) 100%
  );
  padding: 1rem;
}

.register-card {
  background: var(--p-color-surface-0);
  border-radius: var(--p-border-radius-lg);
  box-shadow: var(--p-shadow-lg);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-header h1 {
  color: var(--p-color-primary);
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 600;
}

.register-header p {
  color: var(--p-color-text-secondary);
  margin: 0;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: var(--p-color-text);
}

.error-message {
  color: var(--p-color-red-500);
  font-size: 0.875rem;
}

.form-actions {
  margin-top: 1rem;
}

.register-button {
  width: 100%;
  height: 3rem;
  font-size: 1rem;
  font-weight: 500;
}

.form-footer {
  text-align: center;
  margin-top: 1rem;
}

.form-footer p {
  margin: 0;
  color: var(--p-color-text-secondary);
}

.link {
  color: var(--p-color-primary);
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .register-card {
    padding: 1.5rem;
  }

  .register-header h1 {
    font-size: 1.75rem;
  }
}
</style>
