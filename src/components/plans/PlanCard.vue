<template>
  <div
    class="plan-card"
    :class="{
      'current-plan': isCurrentPlan,
      'popular-plan': isPopular,
      'free-plan': isFree,
      selected: isSelected,
    }"
    @click="handleCardClick"
  >
    <!-- Popular Badge -->
    <div v-if="isPopular" class="popular-badge">
      <i class="pi pi-star-fill"></i>
      <span>{{ popularText }}</span>
    </div>

    <!-- Plan Header -->
    <div class="plan-header">
      <div class="plan-name">
        <h3>{{ plan.name }}</h3>
        <p class="plan-description">{{ plan.features.description }}</p>
      </div>
      <div class="plan-price">
        <div class="price-amount">
          <span v-if="isFree" class="free-price">Gratis</span>
          <span v-else class="paid-price">{{ formatPrice(plan.price_cents, plan.currency) }}</span>
        </div>
        <div v-if="!isFree" class="price-period">
          /{{ plan.interval === 'monthly' ? 'mes' : 'año' }}
        </div>
        <div v-if="showYearlySavings && !isFree" class="yearly-savings">
          Ahorra {{ calculateYearlySavings() }}% vs mensual
        </div>
      </div>
    </div>

    <!-- Plan Features -->
    <div class="plan-features">
      <div class="feature-section">
        <h4 class="feature-section-title">Límites</h4>
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
      </div>

      <div class="feature-section">
        <h4 class="feature-section-title">Características</h4>
        <div v-for="feature in getPlanFeatures()" :key="feature" class="feature-item">
          <i class="pi pi-check"></i>
          <span>{{ feature }}</span>
        </div>
      </div>
    </div>

    <!-- Plan Actions -->
    <div class="plan-actions">
      <div v-if="isCurrentPlan" class="current-plan-badge">
        <i class="pi pi-check-circle"></i>
        <span>{{ currentPlanText }}</span>
      </div>
      <Button
        v-else-if="isFree"
        :label="freeButtonText"
        severity="secondary"
        disabled
        class="w-full"
        :size="buttonSize"
      />
      <Button
        v-else
        :label="getActionLabel()"
        :icon="getActionIcon()"
        :severity="getActionSeverity()"
        class="w-full"
        :size="buttonSize"
        @click="handleAction"
        :loading="loading"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Plan } from '@/types'
import Button from 'primevue/button'

// Props
const _props = defineProps<{
  plan: Plan
  currentPlan?: Plan | null
  isSelected?: boolean
  showYearlySavings?: boolean
  popularText?: string
  currentPlanText?: string
  freeButtonText?: string
  buttonSize?: 'small' | 'large'
  loading?: boolean
}>()

// Emits
const _emit = defineEmits<{
  select: [plan: Plan]
  action: [plan: Plan]
}>()

// Computed
const isCurrentPlan = computed(() => props.currentPlan?.id === props.plan.id)
const isPopular = computed(
  () => props.plan.slug === 'professional' && props.plan.interval === 'monthly',
)
const isFree = computed(() => props.plan.slug === 'free')

// Methods
const formatPrice = (priceCents: number, currency: string = 'USD') => {
  const price = priceCents / 100
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
  }).format(price)
}

const calculateYearlySavings = () => {
  if (props.plan.interval !== 'yearly') return 0

  // This would need access to monthly plans to calculate savings
  // For now, return a default value
  return 20
}

const getPlanLimits = () => {
  return {
    groups: props.plan.max_groups === null ? 'Ilimitados' : props.plan.max_groups.toString(),
    exams: props.plan.max_exams === null ? 'Ilimitados' : props.plan.max_exams.toString(),
    students: props.plan.max_students === null ? 'Ilimitados' : props.plan.max_students.toString(),
  }
}

const getPlanFeatures = () => {
  const features = []

  if (props.plan.features.ai_evaluation) features.push('Evaluación con IA')
  if (props.plan.features.advanced_reports) features.push('Reportes avanzados')
  if (props.plan.features.api_access) features.push('Acceso a API')
  if (props.plan.features.priority_support) features.push('Soporte prioritario')
  if (props.plan.features.custom_branding) features.push('Marca personalizada')

  return features
}

const getActionLabel = () => {
  if (isCurrentPlan.value) return props.currentPlanText || 'Plan Actual'
  return 'Seleccionar Plan'
}

const getActionIcon = () => {
  if (isCurrentPlan.value) return 'pi pi-check'
  return 'pi pi-arrow-right'
}

const getActionSeverity = () => {
  if (isCurrentPlan.value) return 'secondary'
  if (props.plan.slug === 'professional') return 'primary'
  return 'secondary'
}

const handleCardClick = () => {
  if (!isCurrentPlan.value && !isFree.value) {
    emit('select', props.plan)
  }
}

const handleAction = (event: Event) => {
  event.stopPropagation()
  emit('action', props.plan)
}
</script>

<style scoped>
.plan-card {
  position: relative;
  background: var(--surface-card);
  border: 2px solid var(--surface-border);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
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

.plan-card.selected {
  border-color: var(--primary-color);
  background: var(--primary-50);
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
  flex-grow: 1;
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

/* Responsive */
@media (max-width: 768px) {
  .plan-card {
    padding: 1.5rem;
  }

  .plan-card.popular-plan {
    transform: none;
  }

  .plan-name h3 {
    font-size: 1.25rem;
  }

  .price-amount {
    font-size: 2rem;
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

  .plan-card.selected {
    background: rgba(59, 130, 246, 0.1);
  }
}
</style>
