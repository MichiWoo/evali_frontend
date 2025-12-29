<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <div class="flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="text-3xl font-bold text-900 mb-2">Seguridad</h1>
            <p class="text-600 m-0">Administra la seguridad de tu cuenta</p>
          </div>
          <Button
            label="Volver al Perfil"
            icon="pi pi-arrow-left"
            severity="secondary"
            outlined
            @click="$router.push('/profile')"
          />
        </div>

        <!-- Cambio de Contraseña -->
        <div class="form-section mb-4">
          <div class="flex align-items-center mb-3">
            <i class="pi pi-key text-primary mr-2"></i>
            <h3 class="m-0">Cambiar Contraseña</h3>
          </div>

          <form @submit.prevent="handlePasswordChange" class="password-form">
            <div class="form-row">
              <div class="form-group">
                <label for="currentPassword">Contraseña Actual</label>
                <Password
                  id="currentPassword"
                  v-model="passwordForm.currentPassword"
                  placeholder="Ingresa tu contraseña actual"
                  :class="{ 'p-invalid': errors.currentPassword }"
                  :feedback="false"
                  toggleMask
                  class="w-full"
                />
                <small v-if="errors.currentPassword" class="p-error">{{
                  errors.currentPassword
                }}</small>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="newPassword">Nueva Contraseña</label>
                <Password
                  id="newPassword"
                  v-model="passwordForm.newPassword"
                  placeholder="Ingresa tu nueva contraseña"
                  :class="{ 'p-invalid': errors.newPassword }"
                  :feedback="true"
                  toggleMask
                  class="w-full"
                />
                <small v-if="errors.newPassword" class="p-error">{{ errors.newPassword }}</small>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="confirmPassword">Confirmar Nueva Contraseña</label>
                <Password
                  id="confirmPassword"
                  v-model="passwordForm.confirmPassword"
                  placeholder="Confirma tu nueva contraseña"
                  :class="{ 'p-invalid': errors.confirmPassword }"
                  :feedback="false"
                  toggleMask
                  class="w-full"
                />
                <small v-if="errors.confirmPassword" class="p-error">{{
                  errors.confirmPassword
                }}</small>
              </div>
            </div>

            <div class="form-actions">
              <Button
                type="button"
                label="Cancelar"
                severity="secondary"
                outlined
                @click="resetPasswordForm"
                :disabled="isChangingPassword"
              />
              <Button
                type="submit"
                label="Cambiar Contraseña"
                icon="pi pi-save"
                :loading="isChangingPassword"
              />
            </div>
          </form>
        </div>

        <!-- Verificación de Email -->
        <div class="form-section mb-4">
          <div class="flex align-items-center mb-3">
            <i class="pi pi-envelope text-primary mr-2"></i>
            <h3 class="m-0">Verificación de Email</h3>
          </div>

          <div class="verification-status">
            <div class="status-item">
              <div class="status-info">
                <div class="flex align-items-center gap-2">
                  <i
                    :class="
                      isEmailVerified
                        ? 'pi pi-check-circle text-green-500'
                        : 'pi pi-times-circle text-red-500'
                    "
                    class="text-xl"
                  ></i>
                  <div>
                    <h4 class="m-0 mb-1">Estado de Verificación</h4>
                    <p class="m-0 text-600">
                      {{
                        isEmailVerified
                          ? 'Tu correo electrónico está verificado'
                          : 'Tu correo electrónico no está verificado'
                      }}
                    </p>
                    <p v-if="authStore.userEmail" class="m-0 mt-1 text-sm text-500">
                      {{ authStore.userEmail }}
                    </p>
                  </div>
                </div>
              </div>
              <Button
                v-if="!isEmailVerified"
                label="Enviar Email de Verificación"
                icon="pi pi-send"
                severity="warning"
                outlined
                @click="sendVerificationEmail"
                :loading="isSendingVerification"
              />
            </div>
          </div>
        </div>

        <!-- Información de Seguridad -->
        <div class="form-section">
          <div class="flex align-items-center mb-3">
            <i class="pi pi-shield text-primary mr-2"></i>
            <h3 class="m-0">Información de Seguridad</h3>
          </div>

          <div class="security-info">
            <div class="info-item">
              <div class="info-label">
                <i class="pi pi-calendar mr-2"></i>
                <span>Última Actualización de Contraseña</span>
              </div>
              <div class="info-value">
                {{ lastPasswordUpdate || 'Nunca' }}
              </div>
            </div>

            <div class="info-item">
              <div class="info-label">
                <i class="pi pi-user-edit mr-2"></i>
                <span>Último Acceso</span>
              </div>
              <div class="info-value">
                {{ lastLogin || 'N/A' }}
              </div>
            </div>

            <div class="info-item">
              <div class="info-label">
                <i class="pi pi-lock mr-2"></i>
                <span>Cuenta Creada</span>
              </div>
              <div class="info-value">
                {{ accountCreated || 'N/A' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

// Components
import Button from 'primevue/button'
import Password from 'primevue/password'

const toast = useToast()
const authStore = useAuthStore()

// State
const isChangingPassword = ref(false)
const isSendingVerification = ref(false)
const errors = ref<{
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}>({})

// Form data
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// User info
const lastPasswordUpdate = ref<string | null>(null)
const lastLogin = ref<string | null>(null)
const accountCreated = ref<string | null>(null)

// Computed
const isEmailVerified = computed(() => {
  return (
    authStore.user?.email_verified_at !== null && authStore.user?.email_verified_at !== undefined
  )
})

// Methods
const validatePasswordForm = () => {
  errors.value = {}
  let isValid = true

  if (!passwordForm.value.currentPassword.trim()) {
    errors.value.currentPassword = 'La contraseña actual es requerida'
    isValid = false
  }

  if (!passwordForm.value.newPassword.trim()) {
    errors.value.newPassword = 'La nueva contraseña es requerida'
    isValid = false
  } else if (passwordForm.value.newPassword.length < 8) {
    errors.value.newPassword = 'La contraseña debe tener al menos 8 caracteres'
    isValid = false
  }

  if (!passwordForm.value.confirmPassword.trim()) {
    errors.value.confirmPassword = 'Por favor confirma tu nueva contraseña'
    isValid = false
  } else if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    errors.value.confirmPassword = 'Las contraseñas no coinciden'
    isValid = false
  }

  if (passwordForm.value.currentPassword === passwordForm.value.newPassword) {
    errors.value.newPassword = 'La nueva contraseña debe ser diferente a la actual'
    isValid = false
  }

  return isValid
}

const handlePasswordChange = async () => {
  if (!validatePasswordForm()) {
    return
  }

  try {
    isChangingPassword.value = true
    errors.value = {}

    const result = await authStore.changePassword({
      current_password: passwordForm.value.currentPassword,
      new_password: passwordForm.value.newPassword,
      new_password_confirmation: passwordForm.value.confirmPassword,
    })

    if (result.success) {
      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Contraseña actualizada correctamente',
        life: 3000,
      })

      resetPasswordForm()

      // Update last password change date
      lastPasswordUpdate.value = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } else {
      const errorMessage = result.error || 'No se pudo cambiar la contraseña'

      // Check if error is about current password
      if (
        errorMessage.toLowerCase().includes('actual') ||
        errorMessage.toLowerCase().includes('incorrecta')
      ) {
        errors.value.currentPassword = errorMessage
      } else {
        errors.value.newPassword = errorMessage
      }

      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,
        life: 5000,
      })
    }
  } catch (error: any) {
    console.error('Error changing password:', error)

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.errors?.current_password?.[0] ||
      'Ha ocurrido un error al cambiar la contraseña'

    if (
      errorMessage.toLowerCase().includes('actual') ||
      errorMessage.toLowerCase().includes('incorrecta')
    ) {
      errors.value.currentPassword = errorMessage
    } else {
      errors.value.newPassword = errorMessage
    }

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
      life: 5000,
    })
  } finally {
    isChangingPassword.value = false
  }
}

const resetPasswordForm = () => {
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  }
  errors.value = {}
}

const sendVerificationEmail = async () => {
  try {
    isSendingVerification.value = true

    await api.sendVerificationEmail()

    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Se ha enviado un email de verificación. Por favor revisa tu bandeja de entrada.',
      life: 5000,
    })
  } catch (error: any) {
    console.error('Error sending verification email:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'No se pudo enviar el email de verificación',
      life: 5000,
    })
  } finally {
    isSendingVerification.value = false
  }
}

const loadUserInfo = async () => {
  try {
    // Try to get profile info
    if (authStore.user) {
      // Format dates if available
      if (authStore.user.created_at) {
        accountCreated.value = new Date(authStore.user.created_at).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      }

      // Try to get fresh profile data
      const profileResponse = await api.getProfile()
      if (profileResponse.data) {
        const user = profileResponse.data

        // Update auth store with fresh data
        authStore.setUser(user)
      }
    }
  } catch (error) {
    console.error('Error loading user info:', error)
  }
}

// Load initial data
onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-section {
  background: var(--surface-50);
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid var(--surface-border);
}

.form-section h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--surface-border);
}

.verification-status {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--surface-card);
  border-radius: 0.5rem;
  border: 1px solid var(--surface-border);
}

.status-info {
  flex: 1;
}

.status-info h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
}

.status-info p {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
  line-height: 1.4;
}

.security-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--surface-card);
  border-radius: 0.5rem;
  border: 1px solid var(--surface-border);
}

.info-label {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: var(--text-color);
}

.info-value {
  color: var(--text-color-secondary);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }

  .form-actions {
    flex-direction: column;
  }

  .status-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
