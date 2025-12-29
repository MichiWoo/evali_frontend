<template>
  <div class="plan-comparison">
    <!-- Comparison Header -->
    <div class="comparison-header">
      <h2 class="comparison-title">Comparación de Planes</h2>
      <p class="comparison-subtitle">
        Compara todas las características y precios de nuestros planes
      </p>
    </div>

    <!-- Comparison Table -->
    <div class="comparison-table-container">
      <div class="comparison-table">
        <!-- Header Row -->
        <div class="comparison-row header-row">
          <div class="feature-column">
            <span class="feature-label">Características</span>
          </div>
          <div
            v-for="plan in plans"
            :key="plan.id"
            class="plan-column"
            :class="{
              'current-plan': currentPlan?.id === plan.id,
              'popular-plan': plan.slug === 'professional' && plan.interval === 'monthly',
            }"
          >
            <div class="plan-header">
              <div class="plan-name">
                <h3>{{ plan.name }}</h3>
                <div
                  v-if="plan.slug === 'professional' && plan.interval === 'monthly'"
                  class="popular-badge"
                >
                  <i class="pi pi-star-fill"></i>
                  <span>Popular</span>
                </div>
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
              </div>
              <div class="plan-description">
                <p>{{ plan.features.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Limits Section -->
        <div class="comparison-section">
          <div class="section-title">Límites</div>

          <div class="comparison-row">
            <div class="feature-column">
              <div class="feature-item">
                <i class="pi pi-users"></i>
                <span>Grupos</span>
              </div>
            </div>
            <div v-for="plan in plans" :key="`groups-${plan.id}`" class="plan-column">
              <div class="feature-value">
                {{ getPlanLimits(plan).groups }}
              </div>
            </div>
          </div>

          <div class="comparison-row">
            <div class="feature-column">
              <div class="feature-item">
                <i class="pi pi-file-edit"></i>
                <span>Exámenes</span>
              </div>
            </div>
            <div v-for="plan in plans" :key="`exams-${plan.id}`" class="plan-column">
              <div class="feature-value">
                {{ getPlanLimits(plan).exams }}
              </div>
            </div>
          </div>

          <div class="comparison-row">
            <div class="feature-column">
              <div class="feature-item">
                <i class="pi pi-user"></i>
                <span>Estudiantes</span>
              </div>
            </div>
            <div v-for="plan in plans" :key="`students-${plan.id}`" class="plan-column">
              <div class="feature-value">
                {{ getPlanLimits(plan).students }}
              </div>
            </div>
          </div>
        </div>

        <!-- Features Section -->
        <div class="comparison-section">
          <div class="section-title">Características</div>

          <div v-for="feature in allFeatures" :key="feature.key" class="comparison-row">
            <div class="feature-column">
              <div class="feature-item">
                <i :class="feature.icon"></i>
                <span>{{ feature.label }}</span>
              </div>
            </div>
            <div v-for="plan in plans" :key="`${feature.key}-${plan.id}`" class="plan-column">
              <div class="feature-value">
                <i v-if="hasFeature(plan, feature.key)" class="pi pi-check feature-check"></i>
                <i v-else class="pi pi-times feature-cross"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions Row -->
        <div class="comparison-row actions-row">
          <div class="feature-column">
            <span class="actions-label">Acciones</span>
          </div>
          <div v-for="plan in plans" :key="`actions-${plan.id}`" class="plan-column">
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
                size="small"
                class="w-full"
              />
              <Button
                v-else
                :label="getActionLabel(plan)"
                :icon="getActionIcon(plan)"
                :severity="getActionSeverity(plan)"
                size="small"
                class="w-full"
                @click="handlePlanAction(plan)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSubscriptionStore } from '@/stores/subscriptions'
import type { Plan } from '@/types'
import Button from 'primevue/button'

// Props
const props = defineProps<{
  plans: Plan[]
}>()

// Emits
const emit = defineEmits<{
  planSelected: [plan: Plan]
}>()

// Store
const subscriptionStore = useSubscriptionStore()

// Computed
const currentPlan = computed(() => subscriptionStore.currentPlan)

const allFeatures = computed(() => [
  {
    key: 'ai_evaluation',
    label: 'Evaluación con IA',
    icon: 'pi pi-robot',
  },
  {
    key: 'advanced_reports',
    label: 'Reportes avanzados',
    icon: 'pi pi-chart-bar',
  },
  {
    key: 'api_access',
    label: 'Acceso a API',
    icon: 'pi pi-code',
  },
  {
    key: 'priority_support',
    label: 'Soporte prioritario',
    icon: 'pi pi-headphones',
  },
  {
    key: 'custom_branding',
    label: 'Marca personalizada',
    icon: 'pi pi-palette',
  },
])

// Methods
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

const hasFeature = (plan: Plan, featureKey: string) => {
  return plan.features[featureKey as keyof typeof plan.features] === true
}

const getActionLabel = (plan: Plan) => {
  if (currentPlan.value?.id === plan.id) return 'Plan Actual'
  return 'Seleccionar'
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

  emit('planSelected', plan)
}
</script>

<style scoped>
.plan-comparison {
  width: 100%;
}

.comparison-header {
  text-align: center;
  margin-bottom: 2rem;
}

.comparison-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0 0 0.5rem 0;
}

.comparison-subtitle {
  color: var(--text-color-secondary);
  margin: 0;
}

.comparison-table-container {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid var(--surface-border);
}

.comparison-table {
  display: table;
  width: 100%;
  min-width: 800px;
  background: var(--surface-card);
}

.comparison-row {
  display: table-row;
  border-bottom: 1px solid var(--surface-border);
}

.comparison-row:last-child {
  border-bottom: none;
}

.header-row {
  background: var(--surface-50);
}

.comparison-section {
  background: var(--surface-100);
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-color);
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--surface-border);
  background: var(--surface-200);
}

.feature-column {
  display: table-cell;
  width: 200px;
  padding: 1rem 1.5rem;
  vertical-align: middle;
  background: var(--surface-50);
  border-right: 1px solid var(--surface-border);
}

.plan-column {
  display: table-cell;
  width: 200px;
  padding: 1rem 1.5rem;
  vertical-align: middle;
  text-align: center;
  position: relative;
}

.plan-column.current-plan {
  background: var(--green-50);
  border: 2px solid var(--green-200);
}

.plan-column.popular-plan {
  background: var(--primary-50);
  border: 2px solid var(--primary-200);
}

.feature-label {
  font-weight: 600;
  color: var(--text-color);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: var(--text-color);
}

.feature-item i {
  color: var(--primary-color);
  font-size: 0.875rem;
}

.feature-value {
  font-size: 0.875rem;
  color: var(--text-color);
  font-weight: 500;
}

.feature-check {
  color: var(--green-500);
  font-size: 1rem;
}

.feature-cross {
  color: var(--red-500);
  font-size: 1rem;
}

.plan-header {
  text-align: center;
}

.plan-name {
  margin-bottom: 0.75rem;
}

.plan-name h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 0.5rem 0;
}

.popular-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: var(--primary-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.plan-price {
  margin-bottom: 0.75rem;
}

.price-amount {
  font-size: 1.5rem;
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
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  margin-left: 0.25rem;
}

.plan-description p {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  margin: 0;
  line-height: 1.4;
}

.actions-row {
  background: var(--surface-50);
}

.actions-label {
  font-weight: 600;
  color: var(--text-color);
}

.plan-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.current-plan-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--green-100);
  color: var(--green-700);
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .comparison-table-container {
    font-size: 0.875rem;
  }

  .feature-column {
    width: 150px;
    padding: 0.75rem 1rem;
  }

  .plan-column {
    width: 150px;
    padding: 0.75rem 1rem;
  }

  .plan-name h3 {
    font-size: 1rem;
  }

  .price-amount {
    font-size: 1.25rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .plan-column.current-plan {
    background: rgba(34, 197, 94, 0.1);
    border-color: rgba(34, 197, 94, 0.3);
  }

  .plan-column.popular-plan {
    background: rgba(59, 130, 246, 0.1);
    border-color: rgba(59, 130, 246, 0.3);
  }
}
</style>
