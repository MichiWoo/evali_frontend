<template>
  <div class="profile-preferences">
    <form @submit.prevent="handleSubmit" class="form">
      <!-- Preferencias de Apariencia -->
      <div class="form-section">
        <h3>Apariencia</h3>

        <div class="form-row">
          <div class="form-group">
            <label for="theme">Tema</label>
            <Select
              id="theme"
              v-model="form.theme"
              :options="themeOptions"
              option-label="label"
              option-value="value"
              placeholder="Selecciona un tema"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="language">Idioma</label>
            <Select
              id="language"
              v-model="form.language"
              :options="languageOptions"
              option-label="label"
              option-value="value"
              placeholder="Selecciona un idioma"
            />
          </div>
        </div>
      </div>

      <!-- Notificaciones -->
      <div class="form-section">
        <h3>Notificaciones</h3>

        <div class="preference-group">
          <div class="preference-item">
            <div class="preference-info">
              <h4>Notificaciones por correo</h4>
              <p>Recibir notificaciones importantes por correo electrónico</p>
            </div>
            <InputSwitch v-model="form.notifications.email" />
          </div>

          <div class="preference-item">
            <div class="preference-info">
              <h4>Notificaciones push</h4>
              <p>Recibir notificaciones en tiempo real en el navegador</p>
            </div>
            <InputSwitch v-model="form.notifications.push" />
          </div>

          <div class="preference-item">
            <div class="preference-info">
              <h4>Recordatorios de exámenes</h4>
              <p>Notificaciones antes de que venzan los exámenes</p>
            </div>
            <InputSwitch v-model="form.notifications.exam_reminders" />
          </div>

          <div class="preference-item">
            <div class="preference-info">
              <h4>Notificaciones de calificaciones</h4>
              <p>Recibir notificaciones cuando estén disponibles las calificaciones</p>
            </div>
            <InputSwitch v-model="form.notifications.grade_notifications" />
          </div>

          <div class="preference-item">
            <div class="preference-info">
              <h4>Actualizaciones del sistema</h4>
              <p>Notificaciones sobre actualizaciones y mejoras del sistema</p>
            </div>
            <InputSwitch v-model="form.notifications.system_updates" />
          </div>
        </div>
      </div>

      <!-- Privacidad -->
      <div class="form-section">
        <h3>Privacidad</h3>

        <div class="preference-group">
          <div class="preference-item">
            <div class="preference-info">
              <h4>Mostrar correo electrónico</h4>
              <p>Permitir que otros usuarios vean tu correo electrónico</p>
            </div>
            <InputSwitch v-model="form.privacy.show_email" />
          </div>

          <div class="preference-item">
            <div class="preference-info">
              <h4>Mostrar perfil público</h4>
              <p>Hacer tu perfil visible para otros usuarios</p>
            </div>
            <InputSwitch v-model="form.privacy.show_profile" />
          </div>

          <div class="preference-item">
            <div class="preference-info">
              <h4>Permitir contacto</h4>
              <p>Permitir que otros usuarios te contacten</p>
            </div>
            <InputSwitch v-model="form.privacy.allow_contact" />
          </div>
        </div>
      </div>

      <!-- Botones de Acción -->
      <div class="form-actions">
        <Button type="button" label="Restablecer" severity="secondary" @click="resetForm" />
        <Button
          type="submit"
          label="Guardar Preferencias"
          icon="pi pi-save"
          :loading="isUpdating"
        />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

// Components
import Button from 'primevue/button'
import Select from 'primevue/select'
import InputSwitch from 'primevue/inputswitch'

// Types
interface ProfilePreferences {
  theme: string
  language: string
  notifications: {
    email: boolean
    push: boolean
    exam_reminders: boolean
    grade_notifications: boolean
    system_updates: boolean
  }
  privacy: {
    show_email: boolean
    show_profile: boolean
    allow_contact: boolean
  }
}

const toast = useToast()
const authStore = useAuthStore()

// State
const isUpdating = ref(false)

// Form data
const form = ref<ProfilePreferences>({
  theme: 'light',
  language: 'es',
  notifications: {
    email: true,
    push: true,
    exam_reminders: true,
    grade_notifications: true,
    system_updates: true,
  },
  privacy: {
    show_email: false,
    show_profile: true,
    allow_contact: true,
  },
})

// Options
const themeOptions = [
  { label: 'Claro', value: 'light' },
  { label: 'Oscuro', value: 'dark' },
  { label: 'Automático', value: 'auto' },
]

const languageOptions = [
  { label: 'Español', value: 'es' },
  { label: 'English', value: 'en' },
]

// Methods
const loadPreferences = async () => {
  try {
    // Get user profile which includes preferences in meta
    const user = authStore.user
    if (user?.meta?.preferences) {
      form.value = { ...form.value, ...user.meta.preferences }
    }
  } catch (error) {
    console.error('Error loading preferences:', error)
  }
}

const handleSubmit = async () => {
  try {
    isUpdating.value = true
    await api.put('/profile/preferences', form.value)

    // Update user in auth store if preferences are stored there
    if (authStore.user) {
      authStore.user.meta = {
        ...authStore.user.meta,
        preferences: form.value,
      }
    }

    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Preferencias actualizadas correctamente',
      life: 3000,
    })
  } catch (error: any) {
    console.error('Error updating preferences:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'No se pudieron actualizar las preferencias',
      life: 3000,
    })
  } finally {
    isUpdating.value = false
  }
}

const resetForm = () => {
  form.value = {
    theme: 'light',
    language: 'es',
    notifications: {
      email: true,
      push: true,
      exam_reminders: true,
      grade_notifications: true,
      system_updates: true,
    },
    privacy: {
      show_email: false,
      show_profile: true,
      allow_contact: true,
    },
  }
}

// Load initial data
onMounted(() => {
  loadPreferences()
})
</script>

<style scoped>
.profile-preferences {
  max-width: 800px;
  margin: 0 auto;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  background: var(--surface-card);
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid var(--surface-border);
}

.form-section h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-row:last-child {
  margin-bottom: 0;
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

.preference-group {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.preference-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--surface-50);
  border-radius: 0.5rem;
  border: 1px solid var(--surface-border);
}

.preference-info {
  flex: 1;
}

.preference-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
}

.preference-info p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-color-secondary);
  line-height: 1.4;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--surface-border);
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }

  .preference-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
