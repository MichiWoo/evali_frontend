<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <!-- Header -->
        <div class="flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="text-3xl font-bold text-900 mb-2">Planes y Precios</h1>
            <p class="text-600 m-0">Elige el plan que mejor se adapte a tus necesidades</p>
          </div>
          <div class="flex gap-2">
            <Button
              label="Comparar Planes"
              icon="pi pi-chart-bar"
              severity="secondary"
              outlined
              @click="showComparison = true"
            />
            <Button
              label="Mis Suscripciones"
              icon="pi pi-credit-card"
              severity="primary"
              outlined
              @click="goToSubscriptions"
            />
          </div>
        </div>

        <!-- Billing Toggle -->
        <div class="billing-toggle-container mb-4">
          <div class="billing-toggle">
            <span class="toggle-label" :class="{ active: billingCycleInternal === 'monthly' }"
              >Mensual</span
            >
            <ToggleSwitch v-model="billingCycleSwitch" />
            <span class="toggle-label" :class="{ active: billingCycleInternal === 'yearly' }">
              Anual
              <Tag value="20% OFF" severity="success" size="small" class="ml-2" />
            </span>
          </div>
        </div>

        <!-- Plans Grid -->
        <div class="plans-grid">
          <div
            v-for="plan in filteredPlans"
            :key="plan.id"
            class="plan-card"
            :class="{
              'current-plan': currentPlan?.id === plan.id,
              'popular-plan': plan.slug === 'professional' && plan.interval === 'monthly',
              'free-plan': plan.slug === 'free',
            }"
          >
            <!-- Popular Badge -->
            <div
              v-if="plan.slug === 'professional' && plan.interval === 'monthly'"
              class="popular-badge"
            >
              <i class="pi pi-star-fill"></i>
              <span>Más Popular</span>
            </div>

            <!-- Plan Header -->
            <div class="plan-header">
              <div class="plan-name">
                <h3>{{ plan.name }}</h3>
                <p class="plan-description">{{ plan.features.description }}</p>
              </div>
              <div class="plan-price">
                <div class="price-amount">
                  <span v-if="plan.price_cents === 0" class="free-price">Gratis</span>
                  <span v-else class="paid-price">{{
                    formatPrice(plan.price_cents, plan.currency)
                  }}</span>
                </div>
                <div v-if="plan.price_cents > 0" class="price-period">
                  /{{ plan.interval === 'monthly' ? 'mes' : 'año' }}
                </div>
                <div
                  v-if="plan.interval === 'yearly' && plan.price_cents > 0"
                  class="yearly-savings"
                >
                  Ahorra {{ calculateYearlySavings(plan) }}% vs mensual
                </div>
              </div>
            </div>

            <!-- Plan Features -->
            <div class="plan-features">
              <div class="feature-section">
                <h4 class="feature-section-title">Límites</h4>
                <div class="feature-item">
                  <i class="pi pi-users"></i>
                  <span>{{ getPlanLimits(plan).groups }} grupos</span>
                </div>
                <div class="feature-item">
                  <i class="pi pi-file-edit"></i>
                  <span>{{ getPlanLimits(plan).exams }} exámenes</span>
                </div>
                <div class="feature-item">
                  <i class="pi pi-user"></i>
                  <span>{{ getPlanLimits(plan).students }} estudiantes</span>
                </div>
              </div>

              <div class="feature-section">
                <h4 class="feature-section-title">Características</h4>
                <div v-for="feature in getPlanFeatures(plan)" :key="feature" class="feature-item">
                  <i class="pi pi-check"></i>
                  <span>{{ feature }}</span>
                </div>
              </div>
            </div>

            <!-- Plan Actions -->
            <div class="plan-actions">
              <div v-if="currentPlan?.id === plan.id" class="current-plan-badge">
                <i class="pi pi-check-circle"></i>
                <span>Plan Actual</span>
              </div>
              <Button
                v-else-if="plan.slug === 'free'"
                label="Plan Actual"
                severity="secondary"
                disabled
                class="w-full"
              />
              <Button
                v-else
                :label="getActionLabel(plan)"
                :icon="getActionIcon(plan)"
                :severity="getActionSeverity(plan)"
                class="w-full"
                @click="handlePlanAction(plan)"
                :loading="loading"
              />
            </div>
          </div>
        </div>

        <!-- Current Plan Info -->
        <div v-if="currentSubscription" class="current-subscription-info">
          <div class="subscription-card">
            <div class="subscription-header">
              <h3>Tu Suscripción Actual</h3>
              <Tag
                :value="currentSubscription.status"
                :severity="getSubscriptionSeverity(currentSubscription.status)"
              />
            </div>
            <div class="subscription-details">
              <div class="detail-item">
                <span class="detail-label">Plan:</span>
                <span class="detail-value">{{ currentPlan?.name }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Precio:</span>
                <span class="detail-value"
                  >{{
                    formatPrice(currentPlan?.price_cents || 0, currentPlan?.currency || 'USD')
                  }}/{{ currentPlan?.interval === 'monthly' ? 'mes' : 'año' }}</span
                >
              </div>
              <div class="detail-item">
                <span class="detail-label">Próximo pago:</span>
                <span class="detail-value">{{ formatDate(currentSubscription.ends_at) }}</span>
              </div>
            </div>
            <div class="subscription-actions">
              <Button
                label="Gestionar Suscripción"
                icon="pi pi-cog"
                severity="secondary"
                outlined
                @click="goToSubscriptions"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Plan Comparison Modal -->
    <Dialog
      v-model:visible="showComparison"
      header="Comparar Planes"
      :modal="true"
      :style="{ width: '90vw', maxWidth: '1200px' }"
      class="comparison-modal"
    >
      <PlanComparison :plans="allPlans" />
    </Dialog>

    <!-- Plan Confirmation Modal -->
    <Dialog
      v-model:visible="showPlanConfirmation"
      header="Confirmar Selección de Plan"
      :modal="true"
      :style="{ width: '500px' }"
      :closable="false"
      class="plan-confirmation-modal"
    >
      <div v-if="selectedPlanForConfirmation" class="confirmation-content">
        <!-- Plan Header -->
        <div class="confirmation-header">
          <div class="plan-icon">
            <i class="pi pi-check-circle text-4xl text-primary"></i>
          </div>
          <div class="plan-info">
            <h3 class="plan-name">{{ selectedPlanForConfirmation.name }}</h3>
            <p class="plan-description">{{ selectedPlanForConfirmation.features.description }}</p>
          </div>
        </div>

        <!-- Plan Price -->
        <div class="plan-price-section">
          <div class="price-display">
            <span v-if="selectedPlanForConfirmation.price_cents === 0" class="price-amount free"
              >Gratis</span
            >
            <span v-else class="price-amount paid">{{
              formatPrice(
                selectedPlanForConfirmation.price_cents,
                selectedPlanForConfirmation.currency,
              )
            }}</span>
            <span v-if="selectedPlanForConfirmation.price_cents > 0" class="price-period">
              /{{ selectedPlanForConfirmation.interval === 'monthly' ? 'mes' : 'año' }}
            </span>
          </div>
          <div
            v-if="
              selectedPlanForConfirmation.interval === 'yearly' &&
              selectedPlanForConfirmation.price_cents > 0
            "
            class="yearly-savings"
          >
            <i class="pi pi-gift text-green-500"></i>
            <span
              >Ahorra {{ calculateYearlySavings(selectedPlanForConfirmation) }}% vs mensual</span
            >
          </div>
        </div>

        <!-- Plan Features -->
        <div class="plan-features-section">
          <h4 class="features-title">Lo que incluye este plan:</h4>

          <div class="limits-section">
            <div class="limit-item">
              <i class="pi pi-users text-primary"></i>
              <span>{{ getPlanLimits(selectedPlanForConfirmation).groups }} grupos</span>
            </div>
            <div class="limit-item">
              <i class="pi pi-file-edit text-primary"></i>
              <span>{{ getPlanLimits(selectedPlanForConfirmation).exams }} exámenes</span>
            </div>
            <div class="limit-item">
              <i class="pi pi-user text-primary"></i>
              <span>{{ getPlanLimits(selectedPlanForConfirmation).students }} estudiantes</span>
            </div>
          </div>

          <div class="features-list">
            <div
              v-for="feature in getPlanFeatures(selectedPlanForConfirmation)"
              :key="feature"
              class="feature-item"
            >
              <i class="pi pi-check text-green-500"></i>
              <span>{{ feature }}</span>
            </div>
          </div>
        </div>

        <!-- Current Plan Warning -->
        <div v-if="currentPlan" class="current-plan-warning">
          <i class="pi pi-info-circle text-blue-500"></i>
          <div class="warning-text">
            <strong>Plan actual:</strong> {{ currentPlan.name }}
            <br />
            <small>Este cambio será efectivo inmediatamente</small>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <template #footer>
        <div class="confirmation-footer">
          <Button
            label="Cancelar"
            severity="secondary"
            outlined
            @click="cancelPlanSelection"
            :disabled="loading"
          />
          <Button
            label="Confirmar Selección"
            severity="primary"
            icon="pi pi-check"
            @click="confirmPlanSelection"
            :loading="loading"
          />
        </div>
      </template>
    </Dialog>

    <!-- Payment Form Dialog -->
    <Dialog
      v-model:visible="showPaymentForm"
      :modal="true"
      :closable="false"
      :style="{ width: '90vw', maxWidth: '800px' }"
      header="Procesar Pago"
    >
      <!-- <PaymentForm 
        v-if="selectedPlanForPayment"
        :plan="selectedPlanForPayment"
        :visible="showPaymentForm"
        @success="handlePaymentSuccess"
        @cancel="cancelPayment"
      /> -->
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSubscriptionStore } from '@/stores/subscriptions'
import { useToast } from 'primevue/usetoast'
import type { Plan } from '@/types'
//import PaymentForm from '@/components/payments/PaymentForm.vue'

// Components
import Button from 'primevue/button'
import ToggleSwitch from 'primevue/inputswitch'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import ConfirmDialog from 'primevue/confirmdialog'
import PlanComparison from '@/components/plans/PlanComparison.vue'

// Router and stores
const router = useRouter()
const subscriptionStore = useSubscriptionStore()
const toast = useToast()

// State
const billingCycleInternal = ref<'monthly' | 'yearly'>('monthly')
const showComparison = ref(false)
const showPlanConfirmation = ref(false)
const selectedPlanForConfirmation = ref<Plan | null>(null)
const showPaymentForm = ref(false)
const selectedPlanForPayment = ref<Plan | null>(null)

// Computed for ToggleSwitch (converts boolean to string)
const billingCycleSwitch = computed({
  get: () => billingCycleInternal.value === 'yearly',
  set: (value: boolean) => {
    billingCycleInternal.value = value ? 'yearly' : 'monthly'
  },
})

// Computed
const plans = computed(() => subscriptionStore.plans)
const currentPlan = computed(() => subscriptionStore.currentPlan)
const currentSubscription = computed(() => subscriptionStore.currentSubscription)
const loading = computed(() => subscriptionStore.loading)

const allPlans = computed(() => plans.value || [])

const filteredPlans = computed(() => {
  const allPlans = plans.value || []

  // Si es el plan gratuito, siempre mostrarlo
  const freePlan = allPlans.find((plan) => plan.slug === 'free')
  const paidPlans = allPlans.filter(
    (plan) => plan.slug !== 'free' && plan.interval === billingCycleInternal.value,
  )

  return [freePlan, ...paidPlans].filter(Boolean)
})

// Methods
const fetchData = async () => {
  try {
    await Promise.all([
      subscriptionStore.fetchPlans(),
      subscriptionStore.fetchCurrentSubscription(),
    ])
  } catch (error) {
    console.error('Error loading plans:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los planes',
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
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const calculateYearlySavings = (plan: Plan) => {
  if (plan.interval !== 'yearly') return 0

  const monthlyPlan = plans.value?.find((p) => p.slug === plan.slug && p.interval === 'monthly')
  if (!monthlyPlan) return 0

  const monthlyCost = monthlyPlan.price_cents * 12
  const yearlyCost = plan.price_cents
  const savings = Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100)

  return savings
}

const getPlanLimits = (plan: Plan) => {
  return {
    groups: plan.max_groups === null ? 'Ilimitados' : plan.max_groups.toString(),
    exams: plan.max_exams === null ? 'Ilimitados' : plan.max_exams.toString(),
    students: plan.max_students === null ? 'Ilimitados' : plan.max_students.toString(),
  }
}

const getPlanFeatures = (plan: Plan) => {
  const features = []

  if (plan.features.ai_evaluation) features.push('Evaluación con IA')
  if (plan.features.advanced_reports) features.push('Reportes avanzados')
  if (plan.features.api_access) features.push('Acceso a API')
  if (plan.features.priority_support) features.push('Soporte prioritario')
  if (plan.features.custom_branding) features.push('Marca personalizada')

  return features
}

const getActionLabel = (plan: Plan) => {
  if (currentPlan.value?.id === plan.id) return 'Plan Actual'
  return 'Seleccionar Plan'
}

const getActionIcon = (plan: Plan) => {
  if (currentPlan.value?.id === plan.id) return 'pi pi-check'
  return 'pi pi-arrow-right'
}

const getActionSeverity = (plan: Plan) => {
  if (currentPlan.value?.id === plan.id) return 'secondary'
  if (plan.slug === 'professional') return 'primary'
  return 'secondary'
}

const handlePlanAction = (plan: Plan) => {
  if (currentPlan.value?.id === plan.id) return

  if (plan.slug === 'free') {
    // For free plan, show confirmation directly
    selectedPlanForConfirmation.value = plan
    showPlanConfirmation.value = true
  } else {
    // For paid plans, show payment form
    selectedPlanForPayment.value = plan
    showPaymentForm.value = true
  }
}

const confirmPlanSelection = async () => {
  if (!selectedPlanForConfirmation.value) return

  try {
    // Ejecutar la suscripción
    await subscriptionStore.subscribeToPlan(selectedPlanForConfirmation.value.id)

    toast.add({
      severity: 'success',
      summary: 'Plan Actualizado',
      detail: `Te has suscrito al plan ${selectedPlanForConfirmation.value.name}`,
      life: 3000,
    })

    // Cerrar modal y recargar datos
    showPlanConfirmation.value = false
    selectedPlanForConfirmation.value = null
    await fetchData()
  } catch (error) {
    console.error('Error subscribing to plan:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo cambiar el plan. Inténtalo de nuevo.',
      life: 3000,
    })
  }
}

const cancelPlanSelection = () => {
  showPlanConfirmation.value = false
  selectedPlanForConfirmation.value = null
}

const handlePaymentSuccess = (subscription: any) => {
  showPaymentForm.value = false
  selectedPlanForPayment.value = null
  toast.add({
    severity: 'success',
    summary: 'Pago Exitoso',
    detail: 'Tu suscripción ha sido activada',
    life: 3000,
  })
  fetchData()
}

const cancelPayment = () => {
  showPaymentForm.value = false
  selectedPlanForPayment.value = null
}

const getSubscriptionSeverity = (status: string) => {
  const statusMap: Record<string, string> = {
    active: 'success',
    pending: 'warning',
    cancelled: 'danger',
    expired: 'secondary',
  }
  return statusMap[status] || 'secondary'
}

const goToSubscriptions = () => {
  router.push('/subscriptions')
}

// Lifecycle
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.plan-card {
  position: relative;
  background: var(--surface-card);
  border: 2px solid var(--surface-border);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color);
}

.plan-card.current-plan {
  border-color: var(--green-500);
  background: var(--green-50);
}

.plan-card.popular-plan {
  border-color: var(--primary-color);
  background: var(--primary-50);
  transform: scale(1.05);
}

.plan-card.free-plan {
  border-color: var(--surface-300);
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.plan-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.plan-name h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-color);
}

.plan-description {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.plan-price {
  margin-top: 1rem;
}

.price-amount {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
}

.free-price {
  color: var(--green-600);
}

.paid-price {
  color: var(--primary-color);
}

.price-period {
  font-size: 1rem;
  color: var(--text-color-secondary);
  margin-left: 0.5rem;
}

.yearly-savings {
  font-size: 0.875rem;
  color: var(--green-600);
  font-weight: 600;
  margin-top: 0.5rem;
}

.plan-features {
  margin-bottom: 1.5rem;
}

.feature-section {
  margin-bottom: 1rem;
}

.feature-section:last-child {
  margin-bottom: 0;
}

.feature-section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--surface-border);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-color);
}

.feature-item i {
  color: var(--green-500);
  font-size: 0.75rem;
}

.plan-actions {
  margin-top: auto;
}

.current-plan-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--green-100);
  color: var(--green-700);
  border-radius: 8px;
  font-weight: 600;
}

.current-subscription-info {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--surface-border);
}

.subscription-card {
  background: var(--surface-50);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 1.5rem;
}

.subscription-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.subscription-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
}

.subscription-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
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

.subscription-actions {
  display: flex;
  justify-content: flex-end;
}

.billing-toggle-container {
  display: flex;
  justify-content: center;
  margin: 2rem 0;
}

.billing-toggle {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--surface-100);
  padding: 0.5rem;
  border-radius: 12px;
}

.toggle-label {
  font-weight: 500;
  color: var(--text-color-secondary);
  transition: color 0.3s ease;
}

.toggle-label.active {
  color: var(--text-color);
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .plans-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .plan-card {
    padding: 1rem;
  }

  .plan-card.popular-plan {
    transform: none;
  }

  .subscription-details {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 1200px) {
  .plans-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

/* Plan Confirmation Modal Styles */
.confirmation-content {
  padding: 1rem 0;
}

.confirmation-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--surface-border);
}

.plan-icon {
  flex-shrink: 0;
}

.plan-info {
  flex: 1;
}

.plan-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0 0 0.5rem 0;
}

.plan-description {
  color: var(--text-color-secondary);
  margin: 0;
  font-size: 0.875rem;
}

.plan-price-section {
  text-align: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--surface-50);
  border-radius: 8px;
}

.price-display {
  margin-bottom: 0.5rem;
}

.price-amount {
  font-size: 2rem;
  font-weight: 700;
  margin-right: 0.5rem;
}

.price-amount.free {
  color: var(--green-600);
}

.price-amount.paid {
  color: var(--primary-color);
}

.price-period {
  font-size: 1rem;
  color: var(--text-color-secondary);
}

.yearly-savings {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--green-600);
  font-weight: 600;
}

.plan-features-section {
  margin-bottom: 1.5rem;
}

.features-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 1rem 0;
}

.limits-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.limit-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem;
  background: var(--surface-100);
  border-radius: 8px;
  text-align: center;
}

.limit-item i {
  font-size: 1.25rem;
}

.limit-item span {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-color);
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: var(--text-color);
}

.feature-item i {
  font-size: 0.875rem;
}

.current-plan-warning {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--blue-50);
  border: 1px solid var(--blue-200);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.warning-text {
  font-size: 0.875rem;
  color: var(--blue-700);
}

.warning-text strong {
  font-weight: 600;
}

.warning-text small {
  color: var(--blue-600);
}

.confirmation-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--surface-border);
}

/* Responsive */
@media (max-width: 768px) {
  .confirmation-header {
    flex-direction: column;
    text-align: center;
  }

  .limits-section {
    grid-template-columns: 1fr;
  }

  .confirmation-footer {
    flex-direction: column;
  }

  .confirmation-footer .p-button {
    width: 100%;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .plan-card.current-plan {
    background: rgba(34, 197, 94, 0.1);
  }

  .plan-card.popular-plan {
    background: rgba(59, 130, 246, 0.1);
  }

  .current-plan-warning {
    background: rgba(59, 130, 246, 0.1);
    border-color: rgba(59, 130, 246, 0.3);
  }

  .warning-text {
    color: var(--blue-300);
  }
}
</style>
