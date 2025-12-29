<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    header="Seleccionar Plan"
    :modal="true"
    :style="{ width: '90vw', maxWidth: '1000px' }"
    :closable="!loading"
    class="plan-selection-modal"
  >
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
      <p>Cargando planes...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <i class="pi pi-exclamation-triangle text-4xl text-red-500 mb-3"></i>
      <p class="text-600 mb-3">{{ error }}</p>
      <Button label="Reintentar" @click="fetchPlans" />
    </div>

    <!-- Content -->
    <div v-else class="modal-content">
      <!-- Billing Toggle -->
      <div class="billing-toggle-container">
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

      <!-- Free Plan Warning -->
      <div v-if="selectedPlan?.slug === 'free'" class="free-plan-warning">
        <div class="warning-content">
          <i class="pi pi-exclamation-triangle warning-icon"></i>
          <div class="warning-text">
            <h4>Cambio al Plan Gratuito</h4>
            <p>Al cambiar al plan gratuito, se aplicarán los siguientes límites:</p>
            <ul>
              <li>
                <strong>Máximo {{ selectedPlan?.max_groups || 0 }} grupos</strong>
              </li>
              <li>
                <strong>Máximo {{ selectedPlan?.max_exams || 0 }} exámenes</strong>
              </li>
              <li>
                <strong>Máximo {{ selectedPlan?.max_students || 0 }} estudiantes</strong>
              </li>
            </ul>
            <p class="warning-note">
              <i class="pi pi-info-circle"></i>
              Si actualmente tienes más elementos que los permitidos, los más antiguos serán
              deshabilitados automáticamente.
            </p>
          </div>
        </div>
      </div>

      <!-- Plans List -->
      <div class="plans-list">
        <!-- No Plans Message -->
        <div v-if="filteredPlans.length === 0" class="no-plans-message">
          <i class="pi pi-info-circle text-4xl text-400 mb-3"></i>
          <p class="text-600">
            No hay planes disponibles para el ciclo de facturación seleccionado.
          </p>
        </div>

        <!-- Plans Grid - Show all plans when no selection -->
        <div v-else-if="!selectedPlan" class="plans-grid">
          <PlanCard
            v-for="plan in filteredPlans"
            :key="plan.id"
            :plan="plan"
            :current-plan="currentPlan"
            :is-selected="false"
            :show-yearly-savings="true"
            :button-size="'small'"
            :loading="loading"
            @select="selectPlan"
            @action="handlePlanAction"
          />
        </div>

        <!-- Selected Plan Details -->
        <div v-else class="selected-plan-details">
          <div class="selected-plan-card">
            <div class="plan-header">
              <div class="plan-name">
                <h3>{{ selectedPlan.name }}</h3>
                <p class="plan-description">{{ selectedPlan.features.description }}</p>
              </div>
              <div class="plan-price">
                <div class="price-amount">
                  <span v-if="selectedPlan.price_cents === 0" class="free-price">Gratis</span>
                  <span v-else class="paid-price">{{
                    formatPrice(selectedPlan.price_cents, selectedPlan.currency)
                  }}</span>
                </div>
                <div v-if="selectedPlan.price_cents > 0" class="price-period">
                  /{{ selectedPlan.interval === 'monthly' ? 'mes' : 'año' }}
                </div>
                <div
                  v-if="selectedPlan.interval === 'yearly' && selectedPlan.price_cents > 0"
                  class="yearly-savings"
                >
                  Ahorra {{ calculateYearlySavings(selectedPlan) }}% vs mensual
                </div>
              </div>
            </div>

            <div class="plan-features">
              <div class="feature-section">
                <h4 class="feature-section-title">Límites</h4>
                <div class="feature-item">
                  <i class="pi pi-users"></i>
                  <span>{{ getPlanLimits(selectedPlan).groups }} grupos</span>
                </div>
                <div class="feature-item">
                  <i class="pi pi-file-edit"></i>
                  <span>{{ getPlanLimits(selectedPlan).exams }} exámenes</span>
                </div>
                <div class="feature-item">
                  <i class="pi pi-user"></i>
                  <span>{{ getPlanLimits(selectedPlan).students }} estudiantes</span>
                </div>
              </div>

              <div class="feature-section">
                <h4 class="feature-section-title">Características</h4>
                <div
                  v-for="feature in getPlanFeatures(selectedPlan)"
                  :key="feature"
                  class="feature-item"
                >
                  <i class="pi pi-check"></i>
                  <span>{{ feature }}</span>
                </div>
              </div>
            </div>

            <!-- Change Plan Button -->
            <div class="change-plan-section">
              <Button
                label="Cambiar Plan"
                icon="pi pi-arrow-left"
                severity="secondary"
                outlined
                @click="selectedPlan = null"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="modal-footer">
        <Button label="Cancelar" @click="$emit('close')" severity="secondary" outlined />
        <Button
          v-if="selectedPlan"
          label="Confirmar Selección"
          @click="confirmSelection"
          :disabled="selectedPlan.id === currentPlan?.id"
          :loading="loading"
          icon="pi pi-check"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useSubscriptionStore } from '@/stores/subscriptions'
import type { Plan } from '@/types'

// Components
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import ToggleSwitch from 'primevue/inputswitch'
import Tag from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'
import PlanCard from './PlanCard.vue'

// Props
const _props = defineProps<{
  visible: boolean
}>()

// Emits
const _emit = defineEmits<{
  'update:visible': [value: boolean]
  close: []
  planSelected: [plan: Plan]
}>()

// Store
const subscriptionStore = useSubscriptionStore()

// State
const selectedPlan = ref<Plan | null>(null)
const billingCycleInternal = ref<'monthly' | 'yearly'>('monthly')

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
const loading = computed(() => subscriptionStore.loading)
const error = computed(() => subscriptionStore.error)

const availablePlans = computed(() => {
  return plans.value?.filter((plan) => plan.slug !== 'free') || []
})

const filteredPlans = computed(() => {
  const filtered = availablePlans.value.filter(
    (plan) => plan.interval === billingCycleInternal.value,
  )

  // Si no hay planes para el ciclo seleccionado, mostrar todos los planes disponibles
  if (filtered.length === 0 && availablePlans.value.length > 0) {
    return availablePlans.value
  }

  return filtered
})

// Methods
const fetchPlans = async () => {
  await subscriptionStore.fetchPlans()
}

const selectPlan = (plan: Plan) => {
  if (plan.id !== currentPlan.value?.id) {
    selectedPlan.value = plan
  }
}

const handlePlanAction = (plan: Plan) => {
  selectPlan(plan)
}

const confirmSelection = () => {
  if (selectedPlan.value) {
    emit('planSelected', selectedPlan.value)
  }
}

const formatPrice = (priceCents: number, currency: string = 'USD') => {
  const price = priceCents / 100
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
  }).format(price)
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

const calculateYearlySavings = (plan: Plan) => {
  if (plan.interval !== 'yearly') return 0

  const monthlyPlan = plans.value?.find((p) => p.slug === plan.slug && p.interval === 'monthly')
  if (!monthlyPlan) return 0

  const monthlyCost = monthlyPlan.price_cents * 12
  const yearlyCost = plan.price_cents
  const savings = Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100)

  return savings
}

// Watch for visible changes
watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible) {
      selectedPlan.value = null
      fetchPlans()
    }
  },
)

// Lifecycle
onMounted(() => {
  if (props.visible) {
    fetchPlans()
  }
})
</script>

<style scoped>
.modal-content {
  padding: 1rem 0;
}

.billing-toggle-container {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
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
  display: flex;
  align-items: center;
}

.toggle-label.active {
  color: var(--text-color);
  font-weight: 600;
}

.free-plan-warning {
  background: var(--orange-50);
  border: 1px solid var(--orange-200);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.warning-content {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.warning-icon {
  color: var(--orange-500);
  font-size: 1.5rem;
  margin-top: 0.25rem;
}

.warning-text h4 {
  margin: 0 0 0.5rem 0;
  color: var(--orange-700);
  font-size: 1.125rem;
  font-weight: 600;
}

.warning-text p {
  margin: 0 0 1rem 0;
  color: var(--orange-600);
}

.warning-text ul {
  margin: 0 0 1rem 0;
  padding-left: 1.5rem;
  color: var(--orange-600);
}

.warning-text li {
  margin-bottom: 0.25rem;
}

.warning-note {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--orange-600);
  background: var(--orange-100);
  padding: 0.75rem;
  border-radius: 8px;
  margin: 0;
}

.warning-note i {
  color: var(--orange-500);
  margin-top: 0.125rem;
}

.plans-list {
  margin-bottom: 2rem;
}

.no-plans-message {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-color-secondary);
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.selected-plan-details {
  display: flex;
  justify-content: center;
  padding: 1rem 0;
}

.selected-plan-card {
  background: var(--surface-card);
  border: 2px solid var(--primary-color);
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.selected-plan-card .plan-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--surface-border);
}

.selected-plan-card .plan-name h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0 0 0.5rem 0;
}

.selected-plan-card .plan-description {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
  margin: 0;
}

.selected-plan-card .plan-price {
  margin-top: 1rem;
}

.selected-plan-card .price-amount {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.selected-plan-card .free-price {
  color: var(--green-600);
}

.selected-plan-card .price-period {
  font-size: 1rem;
  color: var(--text-color-secondary);
  margin-left: 0.5rem;
}

.selected-plan-card .yearly-savings {
  font-size: 0.875rem;
  color: var(--green-600);
  font-weight: 600;
  margin-top: 0.5rem;
}

.selected-plan-card .plan-features {
  margin-bottom: 2rem;
}

.selected-plan-card .feature-section {
  margin-bottom: 1.5rem;
}

.selected-plan-card .feature-section:last-child {
  margin-bottom: 0;
}

.selected-plan-card .feature-section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--surface-border);
}

.selected-plan-card .feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: var(--text-color);
}

.selected-plan-card .feature-item i {
  color: var(--green-500);
  font-size: 0.875rem;
}

.change-plan-section {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid var(--surface-border);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--surface-border);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 1rem;
  text-align: center;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 1rem;
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .plans-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .warning-content {
    flex-direction: column;
    gap: 0.75rem;
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-footer .p-button {
    width: 100%;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .free-plan-warning {
    background: rgba(251, 146, 60, 0.1);
    border-color: rgba(251, 146, 60, 0.3);
  }

  .warning-text h4 {
    color: var(--orange-300);
  }

  .warning-text p,
  .warning-text ul,
  .warning-text li {
    color: var(--orange-200);
  }

  .warning-note {
    background: rgba(251, 146, 60, 0.1);
    color: var(--orange-200);
  }
}
</style>
