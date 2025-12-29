<template>
  <div class="grid">
    <div class="col-12">
      <!-- Header -->
      <div class="flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="text-3xl font-bold text-900 mb-2">Dashboard de Pagos</h1>
          <p class="text-600 m-0">Resumen global de pagos y suscripciones del sistema</p>
        </div>
        <div class="flex gap-2 ml-2">
          <Button
            class="p-button-outlined p-button-success"
            label="Ver Historial"
            icon="pi pi-list"
            severity="success"
            outlined
            @click="goToHistory"
          />
          <Button
            class="p-button-outlined p-button-warning"
            label="Gestionar Métodos"
            icon="pi pi-credit-card"
            severity="warning"
            outlined
            @click="goToMethods"
          />
        </div>
      </div>

      <!-- Main Stats -->
      <div class="grid grid-cols-12 gap-6 mb-8">
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
          <div class="stat-card primary">
            <div class="stat-icon">
              <i class="pi pi-dollar"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatPrice(stats?.total_amount_cents || 0) }}</div>
              <div class="stat-label">Total Pagado</div>
              <div
                class="stat-change"
                :class="getChangeClass(stats?.total_amount_cents, stats?.last_month_amount_cents)"
              >
                <i
                  :class="getChangeIcon(stats?.total_amount_cents, stats?.last_month_amount_cents)"
                ></i>
                {{ getChangeText(stats?.total_amount_cents, stats?.last_month_amount_cents) }}
              </div>
            </div>
          </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
          <div class="stat-card success">
            <div class="stat-icon">
              <i class="pi pi-check-circle"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats?.successful_payments || 0 }}</div>
              <div class="stat-label">Pagos Exitosos</div>
              <div class="stat-subtitle">{{ getSuccessRate() }}% de éxito</div>
            </div>
          </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
          <div class="stat-card warning">
            <div class="stat-icon">
              <i class="pi pi-clock"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats?.pending_payments || 0 }}</div>
              <div class="stat-label">Pendientes</div>
              <div class="stat-subtitle">Requieren atención</div>
            </div>
          </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
          <div class="stat-card danger">
            <div class="stat-icon">
              <i class="pi pi-times-circle"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats?.failed_payments || 0 }}</div>
              <div class="stat-label">Fallidos</div>
              <div class="stat-subtitle">Necesitan revisión</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Monthly Payments Chart -->
        <div class="card">
          <div class="card-header flex justify-content-between align-items-center">
            <h3 class="text-lg font-semibold">Tendencia Mensual de Pagos</h3>
            <div class="flex gap-2">
              <Button
                icon="pi pi-filter"
                class="p-button-text p-button-sm"
                label="Filtrar"
                @click="showFilterDialog = true"
              />
            </div>
          </div>
          <div class="card-content">
            <PaymentChart
              type="bar"
              :data="monthlyData"
              :options="{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  tooltip: {
                    callbacks: {
                      label: (context: any) => {
                        const label = context.dataset?.label || ''
                        const value = context.raw || 0
                        return `${label}: $${value}`
                      },
                    },
                  },
                },
              }"
            />
          </div>
        </div>

        <!-- Payment Methods Distribution -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold">Distribución por Método de Pago</h3>
          </div>
          <div class="card-content">
            <PaymentChart type="doughnut" :data="paymentMethodsData" :options="pieOptions" />
          </div>
        </div>
      </div>

      <!-- Payment Methods List -->
      <div class="card mb-6">
        <div class="card-header flex justify-content-between align-items-center">
          <div>
            <h3 class="text-lg font-semibold m-0">Métodos de Pago</h3>
            <p class="text-600 text-sm m-0 mt-1">Distribución por tipo de pago</p>
          </div>
          <Button
            icon="pi pi-plus"
            label="Agregar Método"
            class="p-button-sm p-button-text"
            @click="goToMethods"
          />
        </div>
        <div class="card-content p-0">
          <div class="payment-methods-list">
            <div
              v-for="method in paymentMethods"
              :key="method.type"
              class="method-item p-4 border-bottom-1 border-200"
              @click="selectPaymentMethod(method.type)"
            >
              <div class="payment-method-grid">
                <!-- Column 1: Icon and Info -->
                <div class="method-info">
                  <div class="method-icon-container">
                    <div
                      class="method-icon flex align-items-center justify-content-center"
                      :class="`method-${method.type}`"
                    >
                      <i :class="getPaymentMethodIcon(method.type)"></i>
                    </div>
                  </div>
                  <div class="method-details">
                    <div class="method-name">
                      <span class="mr-2">{{ method.name }}</span>
                      <i :class="getPaymentMethodIcon(method.type) + ' text-400 text-sm'"></i>
                    </div>
                    <div class="method-description">{{ method.description }}</div>
                  </div>
                </div>

                <!-- Column 2: Progress Bar -->
                <div class="flex items-center">
                  <div
                    class="bg-surface-300 dark:bg-surface-500 rounded-border overflow-hidden w-40 lg:w-24"
                    style="height: 8px"
                  >
                    <div
                      class="h-full"
                      :style="{
                        width: `${getPaymentMethodPercentage(method.type)}%`,
                        'background-color': getProgressBarColor(method.type),
                      }"
                    ></div>
                  </div>
                  <span
                    class="ml-4 font-medium"
                    :style="{ color: getProgressBarColor(method.type) }"
                  >
                    {{ getPaymentMethodPercentage(method.type) }}%
                  </span>
                </div>

                <!-- Column 3: Stats -->
                <div class="method-stats">
                  <div class="usage-container">
                    <span class="usage-label">Uso</span>
                    <span class="usage-value">{{ getPaymentMethodPercentage(method.type) }}%</span>
                  </div>
                  <div class="transactions-count">
                    {{ getPaymentMethodCount(method.type) }} transacciones
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Payments -->
      <div class="grid">
        <div class="col-12 lg:col-8 mb-6">
          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold mb-2">Pagos Recientes</h3>
              <p class="text-600 text-sm">Últimas transacciones realizadas</p>
            </div>
            <div class="card-content">
              <DataTable
                :value="recentPayments"
                :paginator="true"
                :rows="5"
                :rowsPerPageOptions="[5, 10, 25]"
                :loading="loading"
                class="p-datatable-sm"
              >
                <Column field="created_at" header="Fecha" :sortable="true">
                  <template #body="{ data }">
                    {{ formatDate(data.created_at || data.date) }}
                  </template>
                </Column>
                <Column field="description" header="Descripción" :sortable="true">
                  <template #body="{ data }">
                    {{ data.description || 'Pago de suscripción' }}
                  </template>
                </Column>
                <Column field="amount_cents" header="Monto" :sortable="true">
                  <template #body="{ data }">
                    {{ formatPrice(data.amount_cents, data.currency) }}
                  </template>
                </Column>
                <Column field="status" header="Estado" :sortable="true">
                  <template #body="{ data }">
                    <Tag
                      :severity="getStatusSeverity(data.status)"
                      :value="getStatusLabel(data.status)"
                    />
                  </template>
                </Column>
                <Column field="payment_method" header="Método">
                  <template #body="{ data }">
                    <div class="flex align-items-center gap-2">
                      <i :class="getPaymentMethodIcon(data.payment_method) + ' mr-2'"></i>
                      {{ formatPaymentMethod(data.payment_method) }}
                    </div>
                  </template>
                </Column>
                <Column header="Acciones" style="width: 120px">
                  <template #body>
                    <Button
                      icon="pi pi-eye"
                      class="p-button-text p-button-sm"
                      v-tooltip.top="'Ver detalles'"
                    />
                  </template>
                </Column>
              </DataTable>
            </div>
          </div>
        </div>

        <div class="col-12 lg:col-4 mb-6">
          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold mb-2">Estadísticas de Pago</h3>
            </div>
            <div class="card-content">
              <PaymentChart type="doughnut" :data="paymentMethodsData" :options="pieOptions" />
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid mb-6">
        <div class="col-12">
          <div class="quick-actions-card">
            <div class="quick-actions-header">
              <h3 class="quick-actions-title">Acciones Rápidas</h3>
            </div>
            <div class="quick-actions-content">
              <Button
                icon="pi pi-list"
                label="Ver Historial"
                @click="goToHistory"
                class="quick-action-btn"
                size="small"
                outlined
              />
              <Button
                icon="pi pi-credit-card"
                label="Métodos de Pago"
                @click="goToMethods"
                class="quick-action-btn"
                size="small"
                outlined
              />
              <Button
                icon="pi pi-download"
                label="Descargar Reporte"
                @click="downloadReport"
                class="quick-action-btn"
                size="small"
                outlined
              />
              <Button
                icon="pi pi-bell"
                label="Configurar Alertas"
                @click="configureAlerts"
                class="quick-action-btn"
                size="small"
                outlined
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<!--
  Dashboard de Pagos (Administrador)
  
  RESTRICCIONES DE ACCESO:
  - Requiere autenticación: Sí
  - Roles permitidos: Solo 'admin'
  - Permisos requeridos: Rol de administrador
  
  RUTA: /payments
  META: { requiresAuth: true, requiresRole: ['admin'] }
  
  DESCRIPCIÓN:
  Vista que muestra el resumen global de pagos y suscripciones del sistema.
  Permite:
  - Ver estadísticas globales de pagos
  - Ver métricas de suscripciones
  - Analizar ingresos y transacciones
  
  NOTAS:
  - Solo administradores pueden acceder
  - Muestra datos globales del sistema, no datos personales
  - Los usuarios regulares (profesores y estudiantes) pueden ver su historial personal en /payments/history
-->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ProgressBar from 'primevue/progressbar'
import { useToast } from 'primevue/usetoast'
import { useRoleGuard } from '@/composables/useRoleGuard'
import PaymentChart from '@/components/charts/PaymentChart.vue'
import { useSubscriptionStore } from '@/stores/subscriptions'
import { useAuthStore } from '@/stores/auth'
import type { Payment, PaymentStats } from '@/types'

// Components
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

// Router and stores
const router = useRouter()
const subscriptionStore = useSubscriptionStore()
const authStore = useAuthStore()
const { requireAuth } = useRoleGuard()
const toast = useToast()

// Check if user is admin
const isAdmin = computed(() => authStore.isAdmin)

// Data
const stats = ref<PaymentStats | null>(null)
const recentPayments = ref<Payment[]>([])
const loading = ref(false)
const showFilterDialog = ref(false)

// Chart data
const monthlyData = ref({
  labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  datasets: [
    {
      label: 'Pagos Exitosos',
      backgroundColor: '#4CAF50',
      data: [65, 59, 80, 81, 56, 55, 40, 45, 60, 70, 55, 65],
    },
    {
      label: 'Pagos Fallidos',
      backgroundColor: '#F44336',
      data: [5, 8, 3, 4, 6, 3, 2, 3, 4, 2, 5, 3],
    },
  ],
})

const paymentMethodsData = ref({
  labels: ['Tarjeta de Crédito', 'Transferencia', 'PayPal', 'Otros'],
  datasets: [
    {
      data: [65, 25, 8, 2],
      backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#9E9E9E'],
    },
  ],
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value: any) => `$${value}`,
      },
    },
  },
}

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
      },
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const label = context.label || ''
          const value = context.raw || 0
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
          const percentage = Math.round((value / total) * 100)
          return `${label}: ${value} (${percentage}%)`
        },
      },
    },
  },
}

// Computed
const formatPrice = (priceCents: number, currency: string = 'MXN') => {
  return subscriptionStore.formatPrice(priceCents, currency)
}

// Methods
const fetchData = async () => {
  try {
    loading.value = true
    await Promise.all([fetchStats(), fetchRecentPayments()])
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los datos del dashboard',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    // Use admin dashboard if user is admin, otherwise redirect
    if (isAdmin.value) {
      stats.value = await subscriptionStore.getAdminPaymentDashboard()
    } else {
      // This should not happen if route is properly protected, but as fallback
      toast.add({
        severity: 'warn',
        summary: 'Acceso Restringido',
        detail: 'Solo los administradores pueden acceder al Dashboard de Pagos',
        life: 3000,
      })
      router.push('/dashboard')
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

const fetchRecentPayments = async () => {
  try {
    // For admin dashboard, we might want to show all recent payments
    // For now, we'll keep it as user's own payments or implement admin endpoint later
    if (isAdmin.value) {
      // TODO: Implement admin endpoint for all payments if needed
      const payments = await subscriptionStore.getPaymentHistory({ per_page: 5 })
      recentPayments.value = payments || []
    } else {
      const payments = await subscriptionStore.getPaymentHistory({ per_page: 5 })
      recentPayments.value = payments || []
    }
  } catch (error) {
    console.error('Error fetching recent payments:', error)
  }
}

const getSuccessRate = () => {
  if (!stats.value || stats.value.total_payments === 0) return 0
  return Math.round((stats.value.successful_payments / stats.value.total_payments) * 100)
}

const getPaymentMethodCount = (method: string) => {
  return recentPayments.value.filter((p) => p.payment_method === method).length
}

const getPaymentMethodPercentage = (method: string) => {
  if (recentPayments.value.length === 0) return 0
  return Math.round((getPaymentMethodCount(method) / recentPayments.value.length) * 100)
}

const getChangeClass = (current: number, previous: number) => {
  if (!current || !previous) return 'neutral'
  return current > previous ? 'positive' : current < previous ? 'negative' : 'neutral'
}

const getChangeIcon = (current: number, previous: number) => {
  if (!current || !previous) return 'pi pi-minus'
  return current > previous
    ? 'pi pi-arrow-up'
    : current < previous
      ? 'pi pi-arrow-down'
      : 'pi pi-minus'
}

const getChangeText = (current: number, previous: number) => {
  if (!current || !previous) return 'Sin datos previos'
  const change = current - previous
  const percentage = Math.round((change / previous) * 100)
  return `${percentage > 0 ? '+' : ''}${percentage}% vs mes anterior`
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    succeeded: 'Exitoso',
    pending: 'Pendiente',
    failed: 'Fallido',
    cancelled: 'Cancelado',
    refunded: 'Reembolsado',
  }
  return labels[status] || status
}

const getStatusSeverity = (status: string) => {
  const severities: Record<string, string> = {
    succeeded: 'success',
    pending: 'warning',
    failed: 'danger',
    cancelled: 'secondary',
    refunded: 'info',
  }
  return severities[status] || 'secondary'
}

const getPaymentMethodIcon = (method: string) => {
  const icons: Record<string, string> = {
    card: 'pi pi-credit-card',
    bank_transfer: 'pi pi-building',
    paypal: 'pi pi-paypal',
    manual: 'pi pi-user',
  }
  return icons[method] || 'pi pi-circle'
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatPaymentMethod = (method: string) => {
  const labels: Record<string, string> = {
    card: 'Tarjeta de Crédito',
    bank_transfer: 'Transferencia Bancaria',
    paypal: 'PayPal',
    manual: 'Manual',
  }
  return labels[method] || method
}

const goToHistory = () => {
  router.push('/payments/history')
}

const goToMethods = () => {
  router.push('/payments/methods')
}

const downloadReport = () => {
  toast.add({
    severity: 'info',
    summary: 'Próximamente',
    detail: 'La descarga de reportes estará disponible pronto',
    life: 3000,
  })
}

const configureAlerts = () => {
  toast.add({
    severity: 'info',
    summary: 'Próximamente',
    detail: 'La configuración de alertas estará disponible pronto',
    life: 3000,
  })
}

// Payment Methods Data
const paymentMethods = ref([
  {
    type: 'card',
    name: 'Tarjeta de Crédito',
    description: 'Terminación •••• 4242',
    icon: 'pi pi-credit-card',
    color: 'primary',
  },
  {
    type: 'bank_transfer',
    name: 'Transferencia Bancaria',
    description: 'Cuenta •••• 1234',
    icon: 'pi pi-building',
    color: 'success',
  },
  {
    type: 'paypal',
    name: 'PayPal',
    description: 'Pagos en línea',
    icon: 'pi pi-paypal',
    color: 'info',
  },
])

// Methods
const selectPaymentMethod = (methodType: string) => {
  // You can add navigation or any other action when a payment method is selected
  console.log('Selected payment method:', methodType)
  // Example: router.push(`/payments/methods/${methodType}`)
}

/**
 * Guard de seguridad: Verifica que el usuario esté autenticado
 * Las rutas de pagos están disponibles para todos los usuarios autenticados
 * (estudiantes, profesores y admins pueden gestionar sus propios pagos)
 *
 * @see useRoleGuard para más detalles sobre la validación
 */
onMounted(() => {
  // Verificar autenticación (las rutas de pagos están disponibles para todos los usuarios autenticados)
  if (!requireAuth()) {
    return // Ya redirigió y mostró mensaje de error
  }

  fetchData()
})

// Payment Methods List
const paymentMethodsList = ref([
  {
    id: 1,
    method: 'card',
    name: 'Tarjeta de Crédito',
    description: 'Terminación •••• 4242',
    icon: 'pi pi-credit-card',
    color: 'primary',
    count: getPaymentMethodCount('card'),
    percentage: getPaymentMethodPercentage('card'),
  },
  {
    id: 2,
    method: 'bank_transfer',
    name: 'Transferencia Bancaria',
    description: 'Cuenta •••• 1234',
    icon: 'pi pi-building',
    color: 'success',
    count: getPaymentMethodCount('bank_transfer'),
    percentage: getPaymentMethodPercentage('bank_transfer'),
  },
  {
    id: 3,
    method: 'paypal',
    name: 'PayPal',
    description: 'Pagos en línea',
    icon: 'pi pi-paypal',
    color: 'info',
    count: getPaymentMethodCount('paypal'),
    percentage: getPaymentMethodPercentage('paypal'),
  },
])

const getProgressBarFillWidth = (percentage: number) => {
  return `${percentage}%`
}

const getProgressBarColor = (methodType: string) => {
  const colors: Record<string, string> = {
    card: '#4F46E5', // Primary color
    bank_transfer: '#10B981', // Green
    paypal: '#3B82F6', // Blue
  }
  return colors[methodType] || 'primary' // Fallback to primary
}
</script>

<style scoped>
/* Custom ProgressBar Styles */
.p-progressbar {
  height: 0.5rem;
  border-radius: 3px;
  background: var(--surface-200);
}

.p-progressbar .p-progressbar-value {
  background: var(--progressbar-color);
  border-radius: 3px;
}

.stat-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card.primary {
  border-left: 4px solid var(--primary-color);
}

.stat-card.success {
  border-left: 4px solid var(--green-500);
}

.stat-card.warning {
  border-left: 4px solid var(--orange-500);
}

.stat-card.danger {
  border-left: 4px solid var(--red-500);
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
}

.stat-card.primary .stat-icon {
  background: var(--primary-color);
}

.stat-card.success .stat-icon {
  background: var(--green-500);
}

.stat-card.warning .stat-icon {
  background: var(--orange-500);
}

.stat-card.danger .stat-icon {
  background: var(--red-500);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.stat-subtitle {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
}

.stat-change {
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stat-change.positive {
  color: var(--green-600);
}

.stat-change.negative {
  color: var(--red-600);
}

.stat-change.neutral {
  color: var(--text-color-secondary);
}

.card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 1.5rem;
}

.card-header {
  margin-bottom: 1rem;
}

.card-content {
  min-height: 200px;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  background: var(--surface-50);
  border-radius: 8px;
  border: 2px dashed var(--surface-border);
}

.payment-methods-chart {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.payment-method-grid {
  display: grid;
  grid-template-columns: 1.5fr 2fr 1.5fr;
  gap: 1.5rem;
  align-items: center;
  width: 100%;
}

.method-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
}

.method-icon-container {
  flex-shrink: 0;
}

.method-details {
  min-width: 0;
}

.method-name {
  font-weight: 600;
  color: var(--text-color);
  display: flex;
  align-items: center;
  margin-bottom: 0.25rem;
}

.method-description {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.method-progress {
  width: 100%;
  padding: 0 0.5rem;
}

.method-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 120px;
}

.usage-container {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 0.25rem;
}

.usage-label {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.usage-value {
  font-weight: 600;
  color: var(--text-color);
}

.transactions-count {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
  text-align: right;
  width: 100%;
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .payment-method-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .method-progress,
  .method-stats {
    padding-left: 3.5rem; /* Align with method info */
  }
}

.method-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.method-icon {
  width: 3rem;
  height: 3rem;
  min-width: 3rem;
  min-height: 3rem;
  border-radius: 50%;
  font-size: 1.25rem;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.method-icon i {
  font-size: 1.25rem !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  line-height: 1 !important;
}

.method-icon.method-card {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
}

.method-icon.method-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(79, 70, 229, 0.2);
}

.method-icon.method-bank_transfer {
  background: linear-gradient(135deg, #10b981, #059669);
}

.method-icon.method-bank_transfer:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.2);
}

.method-icon.method-paypal {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.method-icon.method-paypal:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.2);
}

.method-name {
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.875rem;
}

.method-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  min-width: 80px;
}

.method-count {
  font-weight: 700;
  color: var(--text-color);
  font-size: 1rem;
}

.method-bar {
  width: 60px;
  height: 4px;
  background: var(--surface-200);
  border-radius: 2px;
  overflow: hidden;
}

.method-progress {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.3s ease;
}

.recent-payments {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.payment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--surface-50);
  border-radius: 8px;
  border: 1px solid var(--surface-border);
}

.payment-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.payment-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.payment-details {
  flex: 1;
}

.payment-description {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.25rem;
}

.payment-date {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.payment-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.amount {
  font-weight: 700;
  color: var(--text-color);
  font-size: 1rem;
}

.quick-actions-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  transition: all 0.3s ease;
}

.quick-actions-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.quick-actions-header {
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--surface-border);
}

.quick-actions-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color-secondary);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.quick-actions-content {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.quick-action-btn {
  flex: 1 1 auto;
  min-width: fit-content;
  padding: 0.5rem 1rem !important;
  font-size: 0.875rem !important;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0.5rem !important;
}

.quick-action-btn :deep(.p-button-icon) {
  font-size: 0.875rem !important;
  margin: 0 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: auto !important;
  height: auto !important;
}

.quick-action-btn :deep(.p-button-label) {
  line-height: 1.2 !important;
}

.quick-action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-color-secondary);
}

/* Responsive */
@media (max-width: 768px) {
  .stat-card {
    padding: 1rem;
  }

  .stat-icon {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .payment-item {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .payment-amount {
    align-items: flex-start;
  }

  .quick-actions-card {
    padding: 0.875rem 1rem;
  }

  .quick-actions-content {
    gap: 0.5rem;
  }

  .quick-action-btn {
    flex: 1 1 100%;
    font-size: 0.813rem !important;
    padding: 0.5rem 0.875rem !important;
  }

  .quick-action-btn :deep(.p-button-icon) {
    font-size: 0.813rem !important;
  }
}
</style>
