<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <!-- Header -->
        <div class="flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="text-3xl font-bold text-900 mb-2">Mi Suscripción</h1>
            <p class="text-600 m-0">Gestiona tu plan y consulta tu uso actual</p>
          </div>
          <div class="flex gap-2">
            <Button
              label="Ver Planes"
              icon="pi pi-list"
              severity="primary"
              outlined
              @click="goToPlans"
            />
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
          <ProgressSpinner />
          <p class="text-600 mt-3">Cargando información de suscripción...</p>
        </div>

        <!-- Current Subscription -->
        <div v-else-if="currentSubscription" class="current-subscription-section">
          <div class="subscription-card">
            <div class="subscription-header">
              <div class="subscription-info">
                <h3 class="subscription-title">Suscripción Actual</h3>
                <Tag
                  :value="getStatusText(currentSubscription.status)"
                  :severity="getSubscriptionSeverity(currentSubscription.status)"
                  class="status-tag"
                />
              </div>
              <div class="subscription-actions">
                <Button
                  v-if="currentSubscription.status === 'active' && currentPlan?.slug !== 'free'"
                  label="Cancelar Suscripción"
                  icon="pi pi-times"
                  severity="danger"
                  outlined
                  @click="showCancelDialog = true"
                />
              </div>
            </div>

            <div class="subscription-details">
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Plan</span>
                  <span class="detail-value">{{ currentPlan?.name || 'No disponible' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Precio</span>
                  <span class="detail-value">
                    {{
                      currentPlan?.price_cents === 0
                        ? 'Gratis'
                        : formatPrice(currentPlan?.price_cents || 0, currentPlan?.currency || 'USD')
                    }}
                    <span v-if="currentPlan?.price_cents && currentPlan.price_cents > 0">
                      /{{ currentPlan?.interval === 'monthly' ? 'mes' : 'año' }}
                    </span>
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Fecha de inicio</span>
                  <span class="detail-value">{{ formatDate(currentSubscription.starts_at) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Próxima renovación</span>
                  <span class="detail-value">
                    {{
                      currentSubscription.ends_at ? formatDate(currentSubscription.ends_at) : 'N/A'
                    }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Plan Features -->
            <div class="plan-features-section">
              <h4 class="features-title">Características del Plan</h4>
              <div class="features-grid">
                <div class="feature-item">
                  <i class="pi pi-users"></i>
                  <span>{{ getPlanLimits().groups }} grupos</span>
                </div>
                <div class="feature-item">
                  <i class="pi pi-file-edit"></i>
                  <span>{{ getPlanLimits().exams }} exámenes</span>
                </div>
                <div class="feature-item">
                  <i class="pi pi-user"></i>
                  <span>{{ getPlanLimits().students }} estudiantes</span>
                </div>
                <div v-for="feature in getPlanFeatures()" :key="feature" class="feature-item">
                  <i class="pi pi-check"></i>
                  <span>{{ feature }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Subscription -->
        <div v-else class="no-subscription-section">
          <div class="no-subscription-card">
            <div class="no-subscription-content">
              <i class="pi pi-credit-card text-6xl text-400 mb-4"></i>
              <h3 class="text-2xl font-bold text-900 mb-2">No tienes una suscripción activa</h3>
              <p class="text-600 mb-4">
                Actualmente estás usando el plan gratuito. Actualiza a un plan de pago para acceder
                a más características.
              </p>
              <Button
                label="Ver Planes Disponibles"
                icon="pi pi-arrow-right"
                severity="primary"
                @click="goToPlans"
              />
            </div>
          </div>
        </div>

        <!-- Usage Statistics -->
        <div v-if="usage && usage.current_usage" class="usage-section">
          <h3 class="section-title">Uso Actual</h3>
          <div class="usage-grid">
            <div class="usage-card">
              <div class="usage-header">
                <i class="pi pi-users usage-icon"></i>
                <span class="usage-label">Grupos</span>
              </div>
              <div class="usage-stats">
                <span class="usage-current">{{ usage.current_usage.groups || 0 }}</span>
                <span class="usage-limit">/ {{ getPlanLimits().groups }}</span>
              </div>
              <div class="usage-bar">
                <div
                  class="usage-progress"
                  :class="{
                    'usage-warning': getUsagePercentage('groups') > 80,
                    'usage-danger': getUsagePercentage('groups') === 100,
                  }"
                  :style="{ width: getUsagePercentage('groups') + '%' }"
                ></div>
              </div>
            </div>

            <div class="usage-card">
              <div class="usage-header">
                <i class="pi pi-file-edit usage-icon"></i>
                <span class="usage-label">Exámenes</span>
              </div>
              <div class="usage-stats">
                <span class="usage-current">{{ usage.current_usage.exams || 0 }}</span>
                <span class="usage-limit">/ {{ getPlanLimits().exams }}</span>
              </div>
              <div class="usage-bar">
                <div
                  class="usage-progress"
                  :class="{
                    'usage-warning': getUsagePercentage('exams') > 80,
                    'usage-danger': getUsagePercentage('exams') === 100,
                  }"
                  :style="{ width: getUsagePercentage('exams') + '%' }"
                ></div>
              </div>
            </div>

            <div class="usage-card">
              <div class="usage-header">
                <i class="pi pi-user usage-icon"></i>
                <span class="usage-label">Estudiantes</span>
              </div>
              <div class="usage-stats">
                <span class="usage-current">{{ usage.current_usage.students || 0 }}</span>
                <span class="usage-limit">/ {{ getPlanLimits().students }}</span>
              </div>
              <div class="usage-bar">
                <div
                  class="usage-progress"
                  :class="{
                    'usage-warning': getUsagePercentage('students') > 80,
                    'usage-danger': getUsagePercentage('students') === 100,
                  }"
                  :style="{ width: getUsagePercentage('students') + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Subscription History -->
        <div v-if="subscriptionHistory && subscriptionHistory.length > 0" class="history-section">
          <h3 class="section-title">Historial de Suscripciones</h3>
          <DataTable
            :value="subscriptionHistory"
            :paginator="true"
            :rows="10"
            class="history-table"
            :loading="loading"
            responsiveLayout="scroll"
          >
            <Column field="plan.name" header="Plan" sortable>
              <template #body="{ data }">
                <div class="plan-info">
                  <span class="plan-name">{{ data.plan?.name || 'Plan desconocido' }}</span>
                  <Tag
                    :value="getStatusText(data.status)"
                    :severity="getSubscriptionSeverity(data.status)"
                    size="small"
                  />
                </div>
              </template>
            </Column>
            <Column field="starts_at" header="Fecha de Inicio" sortable>
              <template #body="{ data }">
                {{ formatDate(data.starts_at) }}
              </template>
            </Column>
            <Column field="ends_at" header="Fecha de Fin">
              <template #body="{ data }">
                {{ data.ends_at ? formatDate(data.ends_at) : '-' }}
              </template>
            </Column>
            <Column field="plan.price_cents" header="Precio" sortable>
              <template #body="{ data }">
                {{
                  data.plan?.price_cents === 0
                    ? 'Gratis'
                    : formatPrice(data.plan?.price_cents || 0, data.plan?.currency || 'USD')
                }}
                <span v-if="data.plan?.price_cents && data.plan.price_cents > 0">
                  /{{ data.plan?.interval === 'monthly' ? 'mes' : 'año' }}
                </span>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>

    <!-- Cancel Subscription Dialog -->
    <Dialog
      v-model:visible="showCancelDialog"
      header="Cancelar Suscripción"
      :modal="true"
      :style="{ width: '500px' }"
    >
      <div class="cancel-dialog-content">
        <div class="cancel-warning">
          <i class="pi pi-exclamation-triangle text-4xl text-orange-500 mb-3"></i>
          <h4 class="text-lg font-semibold mb-2">
            ¿Estás seguro de que quieres cancelar tu suscripción?
          </h4>
          <p class="text-600 mb-4">
            Tu suscripción seguirá activa hasta el final del período de facturación actual. Después
            de eso, volverás al plan gratuito.
          </p>
        </div>

        <div class="cancel-details">
          <div class="detail-row">
            <span class="detail-label">Plan actual:</span>
            <span class="detail-value">{{ currentPlan?.name }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Acceso hasta:</span>
            <span class="detail-value">
              {{ currentSubscription?.ends_at ? formatDate(currentSubscription.ends_at) : 'N/A' }}
            </span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-content-end gap-2">
          <Button
            label="Mantener Suscripción"
            severity="secondary"
            outlined
            @click="showCancelDialog = false"
          />
          <Button
            label="Cancelar Suscripción"
            severity="danger"
            @click="handleCancelSubscription"
            :loading="loading"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSubscriptionStore } from '@/stores/subscriptions'
import { useToast } from 'primevue/usetoast'

// Components
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ProgressSpinner from 'primevue/progressspinner'

// Router and stores
const router = useRouter()
const subscriptionStore = useSubscriptionStore()
const toast = useToast()

// State
const showCancelDialog = ref(false)

// Computed
const currentSubscription = computed(() => subscriptionStore.currentSubscription)
const currentPlan = computed(() => subscriptionStore.currentPlan)
const subscriptionHistory = computed(() => subscriptionStore.subscriptionHistory)
const usage = computed(() => subscriptionStore.usage)
const loading = computed(() => subscriptionStore.loading)

// Methods
const fetchData = async () => {
  try {
    await Promise.all([
      subscriptionStore.fetchCurrentSubscription(),
      subscriptionStore.fetchSubscriptionHistory(),
      subscriptionStore.fetchUsage(),
    ])
  } catch (_error) {
    console.error('Error loading subscription data:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los datos de suscripción',
      life: 3000,
    })
  }
}

const formatPrice = (priceCents: number, currency: string = 'USD') => {
  const price = priceCents / 100
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
  }).format(price)
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const getSubscriptionSeverity = (status: string) => {
  const statusMap: Record<string, string> = {
    active: 'success',
    pending: 'warning',
    cancelled: 'danger',
    canceled: 'danger',
    expired: 'secondary',
    past_due: 'warning',
  }
  return statusMap[status] || 'secondary'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    active: 'Activa',
    pending: 'Pendiente',
    cancelled: 'Cancelada',
    canceled: 'Cancelada',
    expired: 'Expirada',
    past_due: 'Pago Pendiente',
  }
  return statusMap[status] || status
}

const getPlanLimits = () => {
  const plan = currentPlan.value
  if (!plan) return { groups: '0', exams: '0', students: '0' }

  return {
    groups: plan.max_groups === null ? 'Ilimitados' : plan.max_groups.toString(),
    exams: plan.max_exams === null ? 'Ilimitados' : plan.max_exams.toString(),
    students: plan.max_students === null ? 'Ilimitados' : plan.max_students.toString(),
  }
}

const getPlanFeatures = () => {
  const plan = currentPlan.value
  if (!plan) return []

  const features = []

  if (plan.features.ai_evaluation) features.push('Evaluación con IA')
  if (plan.features.advanced_reports) features.push('Reportes avanzados')
  if (plan.features.api_access) features.push('Acceso a API')
  if (plan.features.priority_support) features.push('Soporte prioritario')
  if (plan.features.custom_branding) features.push('Marca personalizada')

  return features
}

const getUsagePercentage = (type: 'groups' | 'exams' | 'students') => {
  if (!usage.value || !usage.value.current_usage) return 0

  const current = usage.value.current_usage[type] || 0
  const limit = getPlanLimits()[type]

  if (limit === 'Ilimitados') return 0

  const limitNum = parseInt(limit)
  if (limitNum === 0) return 0

  return Math.min((current / limitNum) * 100, 100)
}

const handleCancelSubscription = async () => {
  if (!currentSubscription.value) return

  try {
    await subscriptionStore.cancelSubscription(currentSubscription.value.id)
    toast.add({
      severity: 'success',
      summary: 'Suscripción Cancelada',
      detail: 'Tu suscripción ha sido cancelada exitosamente',
      life: 3000,
    })
    showCancelDialog.value = false
    await fetchData()
  } catch (error: any) {
    console.error('Error cancelling subscription:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'No se pudo cancelar la suscripción',
      life: 3000,
    })
  }
}

const goToPlans = () => {
  router.push('/plans')
}

// Lifecycle
onMounted(() => {
  fetchData()
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

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.current-subscription-section {
  margin-bottom: 2rem;
}

.subscription-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 2rem;
}

.subscription-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
}

.subscription-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.subscription-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.status-tag {
  align-self: flex-start;
}

.subscription-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  font-weight: 500;
}

.detail-value {
  font-size: 1rem;
  color: var(--text-color);
  font-weight: 600;
}

.plan-features-section {
  border-top: 1px solid var(--surface-border);
  padding-top: 2rem;
}

.features-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 1rem 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: var(--text-color);
}

.feature-item i {
  color: var(--green-500);
  font-size: 0.875rem;
}

.no-subscription-section {
  margin-bottom: 2rem;
}

.no-subscription-card {
  background: var(--surface-50);
  border: 2px dashed var(--surface-border);
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
}

.no-subscription-content h3 {
  margin: 0 0 0.5rem 0;
}

.usage-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 1.5rem 0;
}

.usage-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.usage-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 1.5rem;
}

.usage-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.usage-icon {
  color: var(--primary-color);
  font-size: 1.25rem;
}

.usage-label {
  font-weight: 600;
  color: var(--text-color);
}

.usage-stats {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.usage-current {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
}

.usage-limit {
  font-size: 1rem;
  color: var(--text-color-secondary);
}

.usage-bar {
  height: 8px;
  background: var(--surface-200);
  border-radius: 4px;
  overflow: hidden;
}

.usage-progress {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.3s ease;
}

.usage-progress.usage-warning {
  background: var(--orange-500);
}

.usage-progress.usage-danger {
  background: var(--red-500);
}

.history-section {
  margin-bottom: 2rem;
}

.history-table {
  background: var(--surface-card);
  border-radius: 12px;
  overflow: hidden;
}

.plan-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.plan-name {
  font-weight: 600;
  color: var(--text-color);
}

.cancel-dialog-content {
  text-align: center;
}

.cancel-warning {
  margin-bottom: 1.5rem;
}

.cancel-details {
  background: var(--surface-50);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.detail-row:last-child {
  margin-bottom: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .subscription-header {
    flex-direction: column;
    align-items: stretch;
  }

  .subscription-actions {
    justify-content: stretch;
  }

  .subscription-actions .p-button {
    flex: 1;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .usage-grid {
    grid-template-columns: 1fr;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
