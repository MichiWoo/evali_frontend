<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <!-- Header -->
        <div class="flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="text-3xl font-bold text-900 mb-2">Configuración de Notificaciones</h1>
            <p class="text-600 m-0">Personaliza cómo y cuándo recibir notificaciones</p>
          </div>
          <Button
            label="Guardar Cambios"
            icon="pi pi-save"
            @click="saveSettings"
            :loading="isSaving"
          />
        </div>

        <!-- Notification Preferences -->
        <div class="settings-section">
          <h3 class="section-title">Preferencias de Notificaciones</h3>

          <div class="preferences-grid">
            <!-- Email Notifications -->
            <div class="preference-card">
              <div class="preference-header">
                <div class="preference-icon">
                  <i class="pi pi-envelope text-2xl"></i>
                </div>
                <div class="preference-info">
                  <h4>Notificaciones por Email</h4>
                  <p>Recibe notificaciones importantes por correo electrónico</p>
                </div>
                <ToggleSwitch v-model="settings.email.enabled" />
              </div>

              <div v-if="settings.email.enabled" class="preference-options">
                <div class="option-group">
                  <label class="option-label">Tipos de notificaciones por email:</label>
                  <div class="checkbox-group">
                    <div v-for="type in emailTypes" :key="type.value" class="checkbox-item">
                      <Checkbox
                        v-model="settings.email.types"
                        :value="type.value"
                        :inputId="`email-${type.value}`"
                      />
                      <label :for="`email-${type.value}`" class="checkbox-label">
                        {{ type.label }}
                      </label>
                    </div>
                  </div>
                </div>

                <div class="option-group">
                  <label class="option-label">Frecuencia:</label>
                  <Select
                    v-model="settings.email.frequency"
                    :options="frequencyOptions"
                    option-label="label"
                    option-value="value"
                    placeholder="Seleccionar frecuencia"
                    class="w-full"
                  />
                </div>
              </div>
            </div>

            <!-- Push Notifications -->
            <div class="preference-card">
              <div class="preference-header">
                <div class="preference-icon">
                  <i class="pi pi-bell text-2xl"></i>
                </div>
                <div class="preference-info">
                  <h4>Notificaciones Push</h4>
                  <p>Recibe notificaciones instantáneas en el navegador</p>
                </div>
                <ToggleSwitch v-model="settings.push.enabled" />
              </div>

              <div v-if="settings.push.enabled" class="preference-options">
                <div class="option-group">
                  <label class="option-label">Tipos de notificaciones push:</label>
                  <div class="checkbox-group">
                    <div v-for="type in pushTypes" :key="type.value" class="checkbox-item">
                      <Checkbox
                        v-model="settings.push.types"
                        :value="type.value"
                        :inputId="`push-${type.value}`"
                      />
                      <label :for="`push-${type.value}`" class="checkbox-label">
                        {{ type.label }}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- In-App Notifications -->
            <div class="preference-card">
              <div class="preference-header">
                <div class="preference-icon">
                  <i class="pi pi-home text-2xl"></i>
                </div>
                <div class="preference-info">
                  <h4>Notificaciones en la Aplicación</h4>
                  <p>Muestra notificaciones dentro de la aplicación</p>
                </div>
                <ToggleSwitch v-model="settings.inApp.enabled" />
              </div>

              <div v-if="settings.inApp.enabled" class="preference-options">
                <div class="option-group">
                  <label class="option-label">Tipos de notificaciones en la app:</label>
                  <div class="checkbox-group">
                    <div v-for="type in inAppTypes" :key="type.value" class="checkbox-item">
                      <Checkbox
                        v-model="settings.inApp.types"
                        :value="type.value"
                        :inputId="`inapp-${type.value}`"
                      />
                      <label :for="`inapp-${type.value}`" class="checkbox-label">
                        {{ type.label }}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notification Types Configuration -->
        <div class="settings-section">
          <h3 class="section-title">Configuración por Tipo</h3>

          <div class="types-grid">
            <div v-for="type in notificationTypes" :key="type.value" class="type-card">
              <div class="type-header">
                <div class="type-icon">
                  <i
                    :class="getNotificationIcon(type.value)"
                    :style="{ color: getNotificationColor(type.value) }"
                  ></i>
                </div>
                <div class="type-info">
                  <h4>{{ type.label }}</h4>
                  <p>{{ type.description }}</p>
                </div>
              </div>

              <div class="type-settings">
                <div class="setting-item">
                  <label class="setting-label">Email</label>
                  <ToggleSwitch v-model="settings.types[type.value].email" />
                </div>
                <div class="setting-item">
                  <label class="setting-label">Push</label>
                  <ToggleSwitch v-model="settings.types[type.value].push" />
                </div>
                <div class="setting-item">
                  <label class="setting-label">En la App</label>
                  <ToggleSwitch v-model="settings.types[type.value].inApp" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quiet Hours -->
        <div class="settings-section">
          <h3 class="section-title">Horarios de Silencio</h3>

          <div class="quiet-hours-card">
            <div class="quiet-hours-header">
              <div class="quiet-hours-info">
                <h4>Activar Horarios de Silencio</h4>
                <p>No recibir notificaciones durante ciertos horarios</p>
              </div>
              <ToggleSwitch v-model="settings.quietHours.enabled" />
            </div>

            <div v-if="settings.quietHours.enabled" class="quiet-hours-options">
              <div class="time-range">
                <div class="time-input">
                  <label class="time-label">Desde:</label>
                  <Calendar
                    v-model="settings.quietHours.startTime"
                    timeOnly
                    hourFormat="24"
                    placeholder="HH:MM"
                  />
                </div>
                <div class="time-input">
                  <label class="time-label">Hasta:</label>
                  <Calendar
                    v-model="settings.quietHours.endTime"
                    timeOnly
                    hourFormat="24"
                    placeholder="HH:MM"
                  />
                </div>
              </div>

              <div class="days-selection">
                <label class="days-label">Días de la semana:</label>
                <div class="days-grid">
                  <div v-for="day in weekDays" :key="day.value" class="day-item">
                    <Checkbox
                      v-model="settings.quietHours.days"
                      :value="day.value"
                      :inputId="`day-${day.value}`"
                    />
                    <label :for="`day-${day.value}`" class="day-label">
                      {{ day.label }}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useNotificationsStore } from '@/stores/notifications'

// Components
import Button from 'primevue/button'
import ToggleSwitch from 'primevue/inputswitch'
import Checkbox from 'primevue/checkbox'
import Select from 'primevue/select'
import Calendar from 'primevue/calendar'

// Store
const notificationsStore = useNotificationsStore()
const toast = useToast()

// State
const isSaving = ref(false)

// Settings
const settings = ref({
  email: {
    enabled: true,
    types: ['exam_assigned', 'exam_completed', 'grade_available'],
    frequency: 'immediate',
  },
  push: {
    enabled: true,
    types: ['exam_assigned', 'exam_completed', 'grade_available', 'system'],
  },
  inApp: {
    enabled: true,
    types: [
      'info',
      'success',
      'warning',
      'error',
      'exam_assigned',
      'exam_completed',
      'grade_available',
      'system',
    ],
  },
  types: {
    info: { email: false, push: true, inApp: true },
    success: { email: false, push: true, inApp: true },
    warning: { email: true, push: true, inApp: true },
    error: { email: true, push: true, inApp: true },
    exam_assigned: { email: true, push: true, inApp: true },
    exam_completed: { email: true, push: true, inApp: true },
    grade_available: { email: true, push: true, inApp: true },
    system: { email: false, push: true, inApp: true },
  },
  quietHours: {
    enabled: false,
    startTime: null,
    endTime: null,
    days: [],
  },
})

// Options
const emailTypes = ref([
  { label: 'Exámenes Asignados', value: 'exam_assigned' },
  { label: 'Exámenes Completados', value: 'exam_completed' },
  { label: 'Calificaciones Disponibles', value: 'grade_available' },
  { label: 'Advertencias del Sistema', value: 'warning' },
  { label: 'Errores del Sistema', value: 'error' },
])

const pushTypes = ref([
  { label: 'Información', value: 'info' },
  { label: 'Éxito', value: 'success' },
  { label: 'Advertencias', value: 'warning' },
  { label: 'Errores', value: 'error' },
  { label: 'Exámenes Asignados', value: 'exam_assigned' },
  { label: 'Exámenes Completados', value: 'exam_completed' },
  { label: 'Calificaciones', value: 'grade_available' },
  { label: 'Sistema', value: 'system' },
])

const inAppTypes = ref([
  { label: 'Información', value: 'info' },
  { label: 'Éxito', value: 'success' },
  { label: 'Advertencias', value: 'warning' },
  { label: 'Errores', value: 'error' },
  { label: 'Exámenes Asignados', value: 'exam_assigned' },
  { label: 'Exámenes Completados', value: 'exam_completed' },
  { label: 'Calificaciones', value: 'grade_available' },
  { label: 'Sistema', value: 'system' },
])

const frequencyOptions = ref([
  { label: 'Inmediatamente', value: 'immediate' },
  { label: 'Cada hora', value: 'hourly' },
  { label: 'Diariamente', value: 'daily' },
  { label: 'Semanalmente', value: 'weekly' },
])

const notificationTypes = ref([
  {
    value: 'info',
    label: 'Información',
    description: 'Notificaciones informativas generales',
  },
  {
    value: 'success',
    label: 'Éxito',
    description: 'Confirmaciones de acciones exitosas',
  },
  {
    value: 'warning',
    label: 'Advertencia',
    description: 'Alertas importantes que requieren atención',
  },
  {
    value: 'error',
    label: 'Error',
    description: 'Notificaciones de errores críticos',
  },
  {
    value: 'exam_assigned',
    label: 'Examen Asignado',
    description: 'Cuando se te asigna un nuevo examen',
  },
  {
    value: 'exam_completed',
    label: 'Examen Completado',
    description: 'Cuando completas un examen',
  },
  {
    value: 'grade_available',
    label: 'Calificación Disponible',
    description: 'Cuando están disponibles tus calificaciones',
  },
  {
    value: 'system',
    label: 'Sistema',
    description: 'Notificaciones del sistema y mantenimiento',
  },
])

const weekDays = ref([
  { label: 'Lunes', value: 'monday' },
  { label: 'Martes', value: 'tuesday' },
  { label: 'Miércoles', value: 'wednesday' },
  { label: 'Jueves', value: 'thursday' },
  { label: 'Viernes', value: 'friday' },
  { label: 'Sábado', value: 'saturday' },
  { label: 'Domingo', value: 'sunday' },
])

// Methods
const getNotificationIcon = (type: string) => {
  return notificationsStore.getNotificationIcon(type)
}

const getNotificationColor = (type: string) => {
  const colorMap: Record<string, string> = {
    info: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    exam_assigned: '#8b5cf6',
    exam_completed: '#06b6d4',
    grade_available: '#f97316',
    system: '#6b7280',
  }
  return colorMap[type] || '#6b7280'
}

const saveSettings = async () => {
  try {
    isSaving.value = true

    // TODO: Implement API call to save settings
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Configuración guardada correctamente',
      life: 3000,
    })
  } catch (_error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo guardar la configuración',
      life: 3000,
    })
  } finally {
    isSaving.value = false
  }
}

const loadSettings = async () => {
  try {
    // TODO: Implement API call to load settings
    console.log('Loading notification settings...')
  } catch (_error) {
    console.error('Error loading settings:', error)
  }
}

// Lifecycle
onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.settings-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--surface-border);
}

.preferences-grid {
  display: grid;
  gap: 1.5rem;
}

.preference-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.preference-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.preference-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.preference-icon {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-50);
  border-radius: 50%;
  color: var(--primary-600);
}

.preference-info {
  flex: 1;
}

.preference-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-color);
}

.preference-info p {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.preference-options {
  padding-top: 1rem;
  border-top: 1px solid var(--surface-border);
}

.option-group {
  margin-bottom: 1.5rem;
}

.option-group:last-child {
  margin-bottom: 0;
}

.option-label {
  display: block;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 0.75rem;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-label {
  font-size: 0.875rem;
  color: var(--text-color);
  cursor: pointer;
}

.types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.type-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.type-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.type-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.type-icon {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-100);
  border-radius: 50%;
  font-size: 1.25rem;
}

.type-info {
  flex: 1;
}

.type-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
}

.type-info p {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.type-settings {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--surface-border);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  font-size: 0.875rem;
  color: var(--text-color);
}

.quiet-hours-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 1.5rem;
}

.quiet-hours-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.quiet-hours-info {
  flex: 1;
}

.quiet-hours-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-color);
}

.quiet-hours-info p {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.quiet-hours-options {
  padding-top: 1rem;
  border-top: 1px solid var(--surface-border);
}

.time-range {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.time-input {
  flex: 1;
}

.time-label {
  display: block;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.days-selection {
  margin-bottom: 1rem;
}

.days-label {
  display: block;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.day-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.day-label {
  font-size: 0.875rem;
  color: var(--text-color);
  cursor: pointer;
}

/* Responsive */
@media (max-width: 768px) {
  .preference-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .checkbox-group {
    grid-template-columns: 1fr;
  }

  .types-grid {
    grid-template-columns: 1fr;
  }

  .time-range {
    flex-direction: column;
  }

  .days-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
