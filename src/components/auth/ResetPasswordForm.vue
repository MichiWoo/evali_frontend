<template>
  <div class="reset-password-form">
    <div class="form-header">
      <h2>Restablecer Contraseña</h2>
      <p>Ingresa tu nueva contraseña para completar el proceso de recuperación.</p>
    </div>

    <form @submit.prevent="handleResetPassword" class="form">
      <div class="field">
        <label for="password" class="label">Nueva Contraseña</label>
        <Password
          id="password"
          v-model="form.password"
          :class="{ 'p-invalid': errors.password }"
          placeholder="Ingresa tu nueva contraseña"
          :disabled="isLoading"
          toggleMask
          :feedback="false"
        />
        <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
      </div>

      <div class="field">
        <label for="passwordConfirmation" class="label">Confirmar Contraseña</label>
        <Password
          id="passwordConfirmation"
          v-model="form.passwordConfirmation"
          :class="{ 'p-invalid': errors.passwordConfirmation }"
          placeholder="Confirma tu nueva contraseña"
          :disabled="isLoading"
          toggleMask
          :feedback="false"
        />
        <small v-if="errors.passwordConfirmation" class="p-error">{{
          errors.passwordConfirmation
        }}</small>
      </div>

      <Button
        type="submit"
        label="Restablecer Contraseña"
        :loading="isLoading"
        :disabled="!isFormValid"
        class="w-full"
      />

      <div class="form-footer">
        <p>
          ¿Recordaste tu contraseña?
          <router-link to="/login" class="link">Iniciar Sesión</router-link>
        </p>
      </div>
    </form>

    <!-- Success message -->
    <Message v-if="successMessage" severity="success" :closable="false" class="mt-4">
      {{ successMessage }}
    </Message>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = reactive({
  password: '',
  passwordConfirmation: '',
})

const errors = reactive({
  password: '',
  passwordConfirmation: '',
})

const successMessage = ref('')
const isLoading = computed(() => authStore.isLoading)

const isFormValid = computed(() => {
  return (
    form.password && form.passwordConfirmation && !errors.password && !errors.passwordConfirmation
  )
})

const validateForm = () => {
  errors.password = ''
  errors.passwordConfirmation = ''

  if (!form.password) {
    errors.password = 'La contraseña es requerida'
    return false
  }

  if (form.password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres'
    return false
  }

  if (!form.passwordConfirmation) {
    errors.passwordConfirmation = 'La confirmación de contraseña es requerida'
    return false
  }

  if (form.password !== form.passwordConfirmation) {
    errors.passwordConfirmation = 'Las contraseñas no coinciden'
    return false
  }

  return true
}

const handleResetPassword = async () => {
  if (!validateForm()) {
    return
  }

  const token = route.query.token as string
  const email = route.query.email as string

  if (!token || !email) {
    errors.password = 'Token o email inválido'
    return
  }

  try {
    const response = await authStore.resetPassword(
      token,
      email,
      form.password,
      form.passwordConfirmation,
    )
    successMessage.value = response.data.message

    // Redirect to login after 3 seconds
    setTimeout(() => {
      router.push('/login?reset=success')
    }, 3000)
  } catch (error: any) {
    console.error('Reset password error:', error)

    if (error.response?.data?.errors) {
      const firstError = error.response.data.errors[0]
      if (firstError.title) {
        errors.password = firstError.title
      }
    } else {
      errors.password = 'Error al restablecer la contraseña'
    }
  }
}

onMounted(() => {
  // Check if token and email are present
  if (!route.query.token || !route.query.email) {
    router.push('/forgot-password')
  }
})
</script>

<style scoped>
.reset-password-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-header h2 {
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
}

.form-header p {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: 0.9rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  font-weight: 500;
  color: var(--text-color);
}

.form-footer {
  text-align: center;
  margin-top: 1rem;
}

.form-footer p {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: 0.9rem;
}

.link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}
</style>
