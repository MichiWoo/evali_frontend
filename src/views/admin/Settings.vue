<template>
  <div class="admin-settings">
    <div class="grid">
      <div class="col-12">
        <div class="card">
          <div class="flex align-items-center justify-content-between mb-4">
            <h1 class="text-3xl font-bold text-900 m-0">Configuración del Sistema</h1>
            <Button
              label="Guardar Cambios"
              icon="pi pi-save"
              @click="saveAllSettings"
              :loading="isSaving"
              :disabled="!hasChanges"
            />
          </div>
          <p class="text-600 mb-4">
            Configura las opciones generales del sistema, notificaciones, pagos y seguridad.
          </p>
        </div>
      </div>

      <!-- General Settings -->
      <div class="col-12 lg:col-6">
        <div class="card">
          <div class="flex align-items-center mb-3">
            <i class="pi pi-cog text-primary mr-2"></i>
            <h2 class="text-xl font-semibold text-900 m-0">Configuración General</h2>
          </div>

          <div class="field">
            <label for="appName" class="font-medium">Nombre de la Aplicación</label>
            <InputText
              id="appName"
              v-model="settings.general.appName"
              placeholder="Evali"
              class="w-full"
            />
          </div>

          <div class="field">
            <label for="appDescription" class="font-medium">Descripción</label>
            <Textarea
              id="appDescription"
              v-model="settings.general.appDescription"
              placeholder="Sistema de evaluación educativa"
              rows="3"
              class="w-full"
            />
          </div>

          <div class="field">
            <label for="appUrl" class="font-medium">URL de la Aplicación</label>
            <InputText
              id="appUrl"
              v-model="settings.general.appUrl"
              placeholder="https://evali.com"
              class="w-full"
            />
          </div>

          <div class="field">
            <label for="timezone" class="font-medium">Zona Horaria</label>
            <Dropdown
              id="timezone"
              v-model="settings.general.timezone"
              :options="timezoneOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccionar zona horaria"
              class="w-full"
            />
          </div>

          <div class="field">
            <label for="language" class="font-medium">Idioma por Defecto</label>
            <Dropdown
              id="language"
              v-model="settings.general.language"
              :options="languageOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccionar idioma"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <!-- Email Settings -->
      <div class="col-12 lg:col-6">
        <div class="card">
          <div class="flex align-items-center mb-3">
            <i class="pi pi-envelope text-primary mr-2"></i>
            <h2 class="text-xl font-semibold text-900 m-0">Configuración de Email</h2>
          </div>

          <div class="field">
            <label for="smtpHost" class="font-medium">Servidor SMTP</label>
            <InputText
              id="smtpHost"
              v-model="settings.email.smtpHost"
              placeholder="smtp.gmail.com"
              class="w-full"
            />
          </div>

          <div class="field">
            <label for="smtpPort" class="font-medium">Puerto SMTP</label>
            <InputNumber
              id="smtpPort"
              v-model="settings.email.smtpPort"
              placeholder="587"
              class="w-full"
            />
          </div>

          <div class="field">
            <label for="smtpUser" class="font-medium">Usuario SMTP</label>
            <InputText
              id="smtpUser"
              v-model="settings.email.smtpUser"
              placeholder="noreply@evali.com"
              class="w-full"
            />
          </div>

          <div class="field">
            <label for="smtpPassword" class="font-medium">Contraseña SMTP</label>
            <Password
              id="smtpPassword"
              v-model="settings.email.smtpPassword"
              placeholder="••••••••"
              :feedback="false"
              toggleMask
              class="w-full"
            />
          </div>

          <div class="field">
            <label for="fromEmail" class="font-medium">Email de Envío</label>
            <InputText
              id="fromEmail"
              v-model="settings.email.fromEmail"
              placeholder="noreply@evali.com"
              class="w-full"
            />
          </div>

          <div class="field">
            <label for="fromName" class="font-medium">Nombre del Remitente</label>
            <InputText
              id="fromName"
              v-model="settings.email.fromName"
              placeholder="Evali"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <!-- Payment Settings -->
      <div class="col-12 lg:col-6">
        <div class="card">
          <div class="flex align-items-center mb-3">
            <i class="pi pi-credit-card text-primary mr-2"></i>
            <h2 class="text-xl font-semibold text-900 m-0">Configuración de Pagos</h2>
          </div>

          <div class="field">
            <label for="stripePublicKey" class="font-medium">Clave Pública de Stripe</label>
            <InputText
              id="stripePublicKey"
              v-model="settings.payments.stripePublicKey"
              placeholder="pk_test_..."
              class="w-full"
            />
          </div>

          <div class="field">
            <label for="stripeSecretKey" class="font-medium">Clave Secreta de Stripe</label>
            <Password
              id="stripeSecretKey"
              v-model="settings.payments.stripeSecretKey"
              placeholder="sk_test_..."
              :feedback="false"
              toggleMask
              class="w-full"
            />
          </div>

          <div class="field">
            <label for="stripeWebhookSecret" class="font-medium">Secreto del Webhook</label>
            <Password
              id="stripeWebhookSecret"
              v-model="settings.payments.stripeWebhookSecret"
              placeholder="whsec_..."
              :feedback="false"
              toggleMask
              class="w-full"
            />
          </div>

          <div class="field">
            <label for="currency" class="font-medium">Moneda</label>
            <Dropdown
              id="currency"
              v-model="settings.payments.currency"
              :options="currencyOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccionar moneda"
              class="w-full"
            />
          </div>

          <div class="field">
            <label for="trialDays" class="font-medium">Días de Prueba Gratuita</label>
            <InputNumber
              id="trialDays"
              v-model="settings.payments.trialDays"
              placeholder="14"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <!-- Security Settings -->
      <div class="col-12 lg:col-6">
        <div class="card">
          <div class="flex align-items-center mb-3">
            <i class="pi pi-shield text-primary mr-2"></i>
            <h2 class="text-xl font-semibold text-900 m-0">Configuración de Seguridad</h2>
          </div>

          <div class="field">
            <label for="sessionTimeout" class="font-medium">Tiempo de Sesión (minutos)</label>
            <InputNumber
              id="sessionTimeout"
              v-model="settings.security.sessionTimeout"
              placeholder="120"
              class="w-full"
            />
          </div>

          <div class="field">
            <label for="maxLoginAttempts" class="font-medium">Intentos Máximos de Login</label>
            <InputNumber
              id="maxLoginAttempts"
              v-model="settings.security.maxLoginAttempts"
              placeholder="5"
              class="w-full"
            />
          </div>

          <div class="field">
            <label for="lockoutDuration" class="font-medium">Duración del Bloqueo (minutos)</label>
            <InputNumber
              id="lockoutDuration"
              v-model="settings.security.lockoutDuration"
              placeholder="15"
              class="w-full"
            />
          </div>

          <div class="field">
            <label for="requireEmailVerification" class="font-medium"
              >Verificación de Email Requerida</label
            >
            <div class="flex align-items-center">
              <InputSwitch
                id="requireEmailVerification"
                v-model="settings.security.requireEmailVerification"
              />
              <label for="requireEmailVerification" class="ml-2"
                >Activar verificación de email</label
              >
            </div>
          </div>

          <div class="field">
            <label for="requireStrongPasswords" class="font-medium">Contraseñas Fuertes</label>
            <div class="flex align-items-center">
              <InputSwitch
                id="requireStrongPasswords"
                v-model="settings.security.requireStrongPasswords"
              />
              <label for="requireStrongPasswords" class="ml-2">Requerir contraseñas seguras</label>
            </div>
          </div>
        </div>
      </div>

      <!-- Notification Settings -->
      <div class="col-12">
        <div class="card">
          <div class="flex align-items-center mb-3">
            <i class="pi pi-bell text-primary mr-2"></i>
            <h2 class="text-xl font-semibold text-900 m-0">Configuración de Notificaciones</h2>
          </div>

          <div class="grid">
            <div class="col-12 md:col-6">
              <h3 class="text-lg font-semibold text-900 mb-3">Notificaciones por Email</h3>

              <div class="field">
                <div class="flex align-items-center">
                  <InputSwitch
                    id="emailNotifications"
                    v-model="settings.notifications.email.enabled"
                  />
                  <label for="emailNotifications" class="ml-2"
                    >Activar notificaciones por email</label
                  >
                </div>
              </div>

              <div class="field">
                <div class="flex align-items-center">
                  <Checkbox
                    id="emailExamAssigned"
                    v-model="settings.notifications.email.types"
                    value="exam_assigned"
                  />
                  <label for="emailExamAssigned" class="ml-2">Exámenes asignados</label>
                </div>
              </div>

              <div class="field">
                <div class="flex align-items-center">
                  <Checkbox
                    id="emailExamCompleted"
                    v-model="settings.notifications.email.types"
                    value="exam_completed"
                  />
                  <label for="emailExamCompleted" class="ml-2">Exámenes completados</label>
                </div>
              </div>

              <div class="field">
                <div class="flex align-items-center">
                  <Checkbox
                    id="emailGradeAvailable"
                    v-model="settings.notifications.email.types"
                    value="grade_available"
                  />
                  <label for="emailGradeAvailable" class="ml-2">Calificaciones disponibles</label>
                </div>
              </div>
            </div>

            <div class="col-12 md:col-6">
              <h3 class="text-lg font-semibold text-900 mb-3">Notificaciones Push</h3>

              <div class="field">
                <div class="flex align-items-center">
                  <InputSwitch
                    id="pushNotifications"
                    v-model="settings.notifications.push.enabled"
                  />
                  <label for="pushNotifications" class="ml-2">Activar notificaciones push</label>
                </div>
              </div>

              <div class="field">
                <div class="flex align-items-center">
                  <Checkbox
                    id="pushExamAssigned"
                    v-model="settings.notifications.push.types"
                    value="exam_assigned"
                  />
                  <label for="pushExamAssigned" class="ml-2">Exámenes asignados</label>
                </div>
              </div>

              <div class="field">
                <div class="flex align-items-center">
                  <Checkbox
                    id="pushExamCompleted"
                    v-model="settings.notifications.push.types"
                    value="exam_completed"
                  />
                  <label for="pushExamCompleted" class="ml-2">Exámenes completados</label>
                </div>
              </div>

              <div class="field">
                <div class="flex align-items-center">
                  <Checkbox
                    id="pushGradeAvailable"
                    v-model="settings.notifications.push.types"
                    value="grade_available"
                  />
                  <label for="pushGradeAvailable" class="ml-2">Calificaciones disponibles</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- System Status -->
      <div class="col-12">
        <div class="card">
          <div class="flex align-items-center mb-3">
            <i class="pi pi-info-circle text-primary mr-2"></i>
            <h2 class="text-xl font-semibold text-900 m-0">Estado del Sistema</h2>
          </div>

          <div class="grid">
            <div class="col-12 md:col-3">
              <div class="status-card">
                <div class="flex align-items-center">
                  <i class="pi pi-database text-green-500 mr-2"></i>
                  <span class="font-medium">Base de Datos</span>
                </div>
                <div class="text-green-500 font-semibold">Conectada</div>
              </div>
            </div>

            <div class="col-12 md:col-3">
              <div class="status-card">
                <div class="flex align-items-center">
                  <i class="pi pi-envelope text-green-500 mr-2"></i>
                  <span class="font-medium">Email</span>
                </div>
                <div class="text-green-500 font-semibold">Configurado</div>
              </div>
            </div>

            <div class="col-12 md:col-3">
              <div class="status-card">
                <div class="flex align-items-center">
                  <i class="pi pi-credit-card text-green-500 mr-2"></i>
                  <span class="font-medium">Pagos</span>
                </div>
                <div class="text-green-500 font-semibold">Activo</div>
              </div>
            </div>

            <div class="col-12 md:col-3">
              <div class="status-card">
                <div class="flex align-items-center">
                  <i class="pi pi-bell text-green-500 mr-2"></i>
                  <span class="font-medium">Notificaciones</span>
                </div>
                <div class="text-green-500 font-semibold">Activo</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'
import { useRoleGuard } from '@/composables/useRoleGuard'
import apiService from '@/services/api'

// Components
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import Password from 'primevue/password'
import Dropdown from 'primevue/dropdown'
import InputSwitch from 'primevue/inputswitch'
import Checkbox from 'primevue/checkbox'

// Router and stores
const router = useRouter()
const authStore = useAuthStore()
const { requireRole } = useRoleGuard()
const toast = useToast()

// State
const isSaving = ref(false)
const originalSettings = ref({})

// Settings
const settings = reactive({
  general: {
    appName: 'Evali',
    appDescription: 'Sistema de evaluación educativa',
    appUrl: 'https://evali.com',
    timezone: 'America/Mexico_City',
    language: 'es',
  },
  email: {
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: 'Evali',
  },
  payments: {
    stripePublicKey: '',
    stripeSecretKey: '',
    stripeWebhookSecret: '',
    currency: 'MXN',
    trialDays: 14,
  },
  security: {
    sessionTimeout: 120,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    requireEmailVerification: true,
    requireStrongPasswords: true,
  },
  notifications: {
    email: {
      enabled: true,
      types: ['exam_assigned', 'exam_completed', 'grade_available'],
    },
    push: {
      enabled: true,
      types: ['exam_assigned', 'exam_completed', 'grade_available'],
    },
  },
})

// Options
const timezoneOptions = ref([
  { label: 'México (UTC-6)', value: 'America/Mexico_City' },
  { label: 'España (UTC+1)', value: 'Europe/Madrid' },
  { label: 'Argentina (UTC-3)', value: 'America/Argentina/Buenos_Aires' },
  { label: 'Colombia (UTC-5)', value: 'America/Bogota' },
  { label: 'Chile (UTC-3)', value: 'America/Santiago' },
])

const languageOptions = ref([
  { label: 'Español', value: 'es' },
  { label: 'English', value: 'en' },
  { label: 'Português', value: 'pt' },
])

const currencyOptions = ref([
  { label: 'Peso Mexicano (MXN)', value: 'MXN' },
  { label: 'Dólar Americano (USD)', value: 'USD' },
  { label: 'Euro (EUR)', value: 'EUR' },
  { label: 'Peso Argentino (ARS)', value: 'ARS' },
  { label: 'Peso Colombiano (COP)', value: 'COP' },
])

// Computed
const hasChanges = computed(() => {
  return JSON.stringify(settings) !== JSON.stringify(originalSettings.value)
})

// Methods
const saveAllSettings = async () => {
  try {
    isSaving.value = true

    // Convert nested structure to flat structure expected by API
    const apiData = {
      general: {
        appName: settings.general.appName,
        appDescription: settings.general.appDescription,
        appUrl: settings.general.appUrl,
        timezone: settings.general.timezone,
        language: settings.general.language,
      },
      email: {
        smtpHost: settings.email.smtpHost,
        smtpPort: settings.email.smtpPort,
        smtpUser: settings.email.smtpUser,
        smtpPassword: settings.email.smtpPassword,
        fromEmail: settings.email.fromEmail,
        fromName: settings.email.fromName,
      },
      payments: {
        stripePublicKey: settings.payments.stripePublicKey,
        stripeSecretKey: settings.payments.stripeSecretKey,
        stripeWebhookSecret: settings.payments.stripeWebhookSecret,
        currency: settings.payments.currency,
        trialDays: settings.payments.trialDays,
      },
      security: {
        sessionTimeout: settings.security.sessionTimeout,
        maxLoginAttempts: settings.security.maxLoginAttempts,
        lockoutDuration: settings.security.lockoutDuration,
        requireEmailVerification: settings.security.requireEmailVerification,
        requireStrongPasswords: settings.security.requireStrongPasswords,
      },
      notifications: {
        email: {
          enabled: settings.notifications.email.enabled,
          types: settings.notifications.email.types,
        },
        push: {
          enabled: settings.notifications.push.enabled,
          types: settings.notifications.push.types,
        },
      },
    }

    const result = await apiService.updateSystemSettings(apiData)

    // Update original settings to mark as saved
    originalSettings.value = JSON.parse(JSON.stringify(settings))

    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Configuración guardada correctamente',
      life: 3000,
    })
  } catch (error: any) {
    console.error('Error saving settings:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail:
        error.response?.data?.message || error.message || 'No se pudo guardar la configuración',
      life: 3000,
    })
  } finally {
    isSaving.value = false
  }
}

const loadSettings = async () => {
  try {
    // Check if user is authenticated
    const token = localStorage.getItem('auth_token')
    if (!token) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se encontró token de autenticación. Por favor, inicia sesión.',
        life: 3000,
      })
      return
    }

    const result = await apiService.getSystemSettings()

    // Update settings with data from API
    if (result.data) {
      // Map the flat structure from API to nested structure expected by component
      const apiData = result.data

      // General settings
      if (apiData.general) {
        settings.general = {
          appName: apiData.general['general.appName'] || 'Evali',
          appDescription:
            apiData.general['general.appDescription'] || 'Sistema de evaluación educativa',
          appUrl: apiData.general['general.appUrl'] || 'https://evali.com',
          timezone: apiData.general['general.timezone'] || 'America/Mexico_City',
          language: apiData.general['general.language'] || 'es',
        }
      }

      // Email settings
      if (apiData.email) {
        settings.email = {
          smtpHost: apiData.email['email.smtpHost'] || '',
          smtpPort: apiData.email['email.smtpPort'] || 587,
          smtpUser: apiData.email['email.smtpUser'] || '',
          smtpPassword: apiData.email['email.smtpPassword'] || '',
          fromEmail: apiData.email['email.fromEmail'] || '',
          fromName: apiData.email['email.fromName'] || 'Evali',
        }
      }

      // Payment settings
      if (apiData.payments) {
        settings.payments = {
          stripePublicKey: apiData.payments['payments.stripePublicKey'] || '',
          stripeSecretKey: apiData.payments['payments.stripeSecretKey'] || '',
          stripeWebhookSecret: apiData.payments['payments.stripeWebhookSecret'] || '',
          currency: apiData.payments['payments.currency'] || 'MXN',
          trialDays: apiData.payments['payments.trialDays'] || 14,
        }
      }

      // Security settings
      if (apiData.security) {
        settings.security = {
          sessionTimeout: apiData.security['security.sessionTimeout'] || 120,
          maxLoginAttempts: apiData.security['security.maxLoginAttempts'] || 5,
          lockoutDuration: apiData.security['security.lockoutDuration'] || 15,
          requireEmailVerification: apiData.security['security.requireEmailVerification'] || true,
          requireStrongPasswords: apiData.security['security.requireStrongPasswords'] || true,
        }
      }

      // Notification settings
      if (apiData.notifications) {
        settings.notifications = {
          email: {
            enabled: apiData.notifications['notifications.email.enabled'] || true,
            types: apiData.notifications['notifications.email.types'] || [
              'exam_assigned',
              'exam_completed',
              'grade_available',
            ],
          },
          push: {
            enabled: apiData.notifications['notifications.push.enabled'] || true,
            types: apiData.notifications['notifications.push.types'] || [
              'exam_assigned',
              'exam_completed',
              'grade_available',
            ],
          },
        }
      }
    }

    // Set original settings for change detection
    originalSettings.value = JSON.parse(JSON.stringify(settings))
  } catch (error: any) {
    console.error('Error loading settings:', error)

    let errorMessage = 'No se pudieron cargar la configuración'

    if (error.response) {
      const status = error.response.status
      const data = error.response.data

      if (status === 401) {
        errorMessage = 'No estás autenticado. Por favor, inicia sesión nuevamente.'
        // Redirect to login after showing error
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      } else if (status === 403) {
        errorMessage =
          'No tienes permisos para acceder a esta configuración. Se requiere rol de administrador.'
      } else if (data?.message) {
        errorMessage = data.message
      } else if (typeof data === 'string') {
        errorMessage = data
      }
    } else if (error.message) {
      errorMessage = error.message
    }

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
      life: 5000,
    })
  }
}

// Lifecycle
onMounted(async () => {
  // Verificar que el usuario tenga rol de admin
  if (
    !requireRole('admin', {
      customMessage: 'Solo los administradores pueden acceder a esta configuración',
    })
  ) {
    return // Ya redirigió y mostró mensaje de error
  }

  // User is authenticated and is admin, load settings
  await loadSettings()
})
</script>

<style scoped>
.admin-settings {
  padding: 1rem;
}

.card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.field {
  margin-bottom: 1rem;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.status-card {
  background: var(--surface-50);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.status-card .flex {
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 768px) {
  .admin-settings {
    padding: 0.5rem;
  }

  .card {
    padding: 1rem;
  }
}
</style>
