<template>
  <div class="forgot-password-form">
    <div class="form-header">
      <h2>Recuperar Contraseña</h2>
      <p>Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>
    </div>

    <form @submit.prevent="handleForgotPassword" class="form">
      <div class="field">
        <label for="email" class="label">Correo Electrónico</label>
        <InputText
          id="email"
          v-model="form.email"
          type="email"
          :class="{ 'p-invalid': errors.email }"
          placeholder="tu@email.com"
          :disabled="isLoading"
        />
        <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
      </div>

      <Button
        type="submit"
        label="Enviar Enlace"
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
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useAuthStore } from '@/stores/auth'

const _router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  email: '',
})

const errors = reactive({
  email: '',
})

const successMessage = ref('')
const isLoading = computed(() => authStore.isLoading)

const isFormValid = computed(() => {
  return form.email && !errors.email
})

const validateForm = () => {
  errors.email = ''

  if (!form.email) {
    errors.email = 'El correo electrónico es requerido'
    return false
  }

  if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Ingresa un correo electrónico válido'
    return false
  }

  return true
}

const handleForgotPassword = async () => {
  if (!validateForm()) {
    return
  }

  try {
    const response = await authStore.forgotPassword(form.email)
    successMessage.value = response.data.message
    form.email = ''
  } catch (error: any) {
    console.error('Forgot password error:', error)

    if (error.response?.data?.errors) {
      const firstError = error.response.data.errors[0]
      if (firstError.title) {
        errors.email = firstError.title
      }
    } else {
      errors.email = 'Error al enviar el enlace de recuperación'
    }
  }
}
</script>

<style scoped>
.forgot-password-form {
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
