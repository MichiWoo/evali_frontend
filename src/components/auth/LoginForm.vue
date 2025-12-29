<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>Evali</h1>
        <p>Inicia sesión en tu cuenta</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
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
            :feedback="false"
            toggleMask
            required
          />
          <small v-if="errors.password" class="error-message">{{ errors.password }}</small>
        </div>

        <div class="form-actions">
          <Button
            type="submit"
            label="Iniciar Sesión"
            :loading="isLoading"
            :disabled="!isFormValid"
            class="login-button"
          />
        </div>

        <div class="form-footer">
          <p>
            <router-link to="/forgot-password" class="link">¿Olvidaste tu contraseña?</router-link>
          </p>
          <p>
            ¿No tienes cuenta?
            <router-link to="/register" class="link">Regístrate aquí</router-link>
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
import type { LoginRequest } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive<LoginRequest>({
  email: '',
  password: '',
})

const errors = reactive({
  email: '',
  password: '',
})

const isLoading = computed(() => authStore.isLoading)

const isFormValid = computed(() => {
  return form.email && form.password && !errors.email && !errors.password
})

const validateForm = () => {
  errors.email = ''
  errors.password = ''

  if (!form.email) {
    errors.email = 'El correo electrónico es requerido'
    return false
  }

  if (!form.password) {
    errors.password = 'La contraseña es requerida'
    return false
  }

  return true
}

const handleLogin = async () => {
  console.log('handleLogin called with form:', form)
  if (!validateForm()) {
    console.log('Form validation failed')
    return
  }

  try {
    console.log('Attempting login...')
    const result = await authStore.login(form)
    console.log('Login successful, result:', result)
    console.log('User after login:', authStore.user)
    console.log('Is authenticated:', authStore.isAuthenticated)

    // Redirect based on user role
    console.log('Login successful, redirecting based on role...')
    console.log('User role:', authStore.userRole)
    console.log('Is student:', authStore.isStudent)
    console.log('Is teacher:', authStore.isTeacher)
    console.log('Is admin:', authStore.isAdmin)

    if (authStore.isStudent) {
      console.log('Redirecting student to student dashboard')
      router.push('/student/dashboard')
    } else if (authStore.isTeacher || authStore.isAdmin) {
      console.log('Redirecting teacher/admin to dashboard')
      router.push('/dashboard')
    } else {
      console.log('No valid role found, redirecting to home')
      router.push('/')
    }
  } catch (error: any) {
    console.error('Login error:', error)

    if (error.response?.status === 401) {
      errors.password = 'Credenciales incorrectas'
    } else if (error.response?.status === 422) {
      const validationErrors = error.response.data.errors
      if (validationErrors.email) {
        errors.email = validationErrors.email[0]
      }
      if (validationErrors.password) {
        errors.password = validationErrors.password[0]
      }
    } else {
      errors.password = 'Error al iniciar sesión. Inténtalo de nuevo.'
    }
  }
}
</script>

<style scoped>
.login-container {
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

.login-card {
  background: var(--p-color-surface-0);
  border-radius: var(--p-border-radius-lg);
  box-shadow: var(--p-shadow-lg);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  color: var(--p-color-primary);
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 600;
}

.login-header p {
  color: var(--p-color-text-secondary);
  margin: 0;
}

.login-form {
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

.login-button {
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
  .login-card {
    padding: 1.5rem;
  }

  .login-header h1 {
    font-size: 1.75rem;
  }
}
</style>
