<template>
  <div class="grid">
    <div class="col-12">
      <!-- Header -->
      <div class="flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="text-3xl font-bold text-900 mb-2">Historial de Pagos</h1>
          <p class="text-600 m-0">Gestiona y revisa todos tus pagos y transacciones</p>
        </div>
        <div class="flex gap-2">
          <Button
            label="Métodos de Pago"
            icon="pi pi-credit-card"
            severity="secondary"
            outlined
            @click="showPaymentMethods = true"
          />
          <Button
            label="Descargar Factura"
            icon="pi pi-download"
            severity="primary"
            outlined
            @click="() => downloadInvoice()"
            :disabled="!selectedPayment"
          />
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-12 gap-6 mb-8">
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="pi pi-credit-card"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatPrice(stats?.total_amount_cents || 0) }}</div>
              <div class="stat-label">Total Pagado</div>
            </div>
          </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
          <div class="stat-card">
            <div class="stat-icon success">
              <i class="pi pi-check-circle"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats?.successful_payments || 0 }}</div>
              <div class="stat-label">Pagos Exitosos</div>
            </div>
          </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
          <div class="stat-card">
            <div class="stat-icon warning">
              <i class="pi pi-clock"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats?.pending_payments || 0 }}</div>
              <div class="stat-label">Pendientes</div>
            </div>
          </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
          <div class="stat-card">
            <div class="stat-icon danger">
              <i class="pi pi-times-circle"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats?.failed_payments || 0 }}</div>
              <div class="stat-label">Fallidos</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="grid grid-cols-12 gap-6 mb-8">
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
          <label class="block text-900 font-medium mb-2">Método de Pago</label>
          <Select
            v-model="filters.payment_method"
            :options="paymentMethodOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Todos los métodos"
            class="w-full"
            @change="applyFilters"
          />
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
          <label class="block text-900 font-medium mb-2">Fecha Hasta</label>
          <Calendar
            v-model="filters.date_to"
            placeholder="Seleccionar fecha"
            class="w-full"
            @date-select="applyFilters"
          />
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
          <label class="block text-900 font-medium mb-2">Buscar</label>
          <IconField iconPosition="left">
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText
              type="text"
              placeholder="Buscar"
              v-model="filters.search"
              @input="onSearchInput"
            />
          </IconField>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
          <Button
            label="Limpiar"
            icon="pi pi-filter-slash"
            severity="secondary"
            outlined
            @click="clearFilters"
          />
        </div>
      </div>

      <!-- Payments Table -->
      <div class="card">
        <DataTable
          :value="payments"
          :loading="loading"
          :paginator="true"
          :rows="10"
          :rowsPerPageOptions="[10, 25, 50]"
          :totalRecords="totalPayments"
          :lazy="true"
          @page="onPageChange"
          @sort="onSort"
          :sortField="sortField"
          :sortOrder="sortOrder"
          selectionMode="single"
          v-model:selection="selectedPayment"
          class="payments-table"
          :emptyMessage="loading ? 'Cargando...' : 'No se encontraron pagos'"
        >
          <Column field="id" header="ID" sortable>
            <template #body="{ data }">
              <span class="font-mono text-sm">#{{ data.id }}</span>
            </template>
          </Column>

          <Column field="amount_cents" header="Monto" sortable>
            <template #body="{ data }">
              <div class="flex flex-column">
                <span class="font-semibold">{{
                  formatPrice(data.amount_cents, data.currency)
                }}</span>
                <span class="text-xs text-600">{{ data.currency.toUpperCase() }}</span>
              </div>
            </template>
          </Column>

          <Column field="status" header="Estado" sortable>
            <template #body="{ data }">
              <Tag
                :value="getStatusLabel(data.status)"
                :severity="getStatusSeverity(data.status)"
                :icon="getStatusIcon(data.status)"
              />
            </template>
          </Column>

          <Column field="payment_method" header="Método de Pago">
            <template #body="{ data }">
              <div class="flex align-items-center gap-2">
                <i :class="getPaymentMethodIcon(data.payment_method)"></i>
                <span>{{ getPaymentMethodLabel(data.payment_method) }}</span>
              </div>
            </template>
          </Column>

          <Column field="description" header="Descripción">
            <template #body="{ data }">
              <span class="text-sm">{{ data.description || 'Pago de suscripción' }}</span>
            </template>
          </Column>

          <Column field="created_at" header="Fecha" sortable>
            <template #body="{ data }">
              <div class="flex flex-column">
                <span class="text-sm">{{ formatDate(data.created_at) }}</span>
                <span class="text-xs text-600">{{ formatTime(data.created_at) }}</span>
              </div>
            </template>
          </Column>

          <Column field="paid_at" header="Pagado">
            <template #body="{ data }">
              <span v-if="data.paid_at" class="text-sm">{{ formatDate(data.paid_at) }}</span>
              <span v-else class="text-600">-</span>
            </template>
          </Column>

          <Column header="Acciones" :exportable="false">
            <template #body="{ data }">
              <div class="flex gap-1">
                <Button
                  icon="pi pi-eye"
                  severity="secondary"
                  size="small"
                  outlined
                  @click="viewPayment(data)"
                  v-tooltip.top="'Ver detalles'"
                />
                <Button
                  v-if="data.status === 'succeeded'"
                  icon="pi pi-download"
                  severity="primary"
                  size="small"
                  outlined
                  @click="downloadInvoice(data)"
                  v-tooltip.top="'Descargar factura'"
                />
                <Button
                  v-if="data.status === 'failed'"
                  icon="pi pi-refresh"
                  severity="warning"
                  size="small"
                  outlined
                  @click="retryPayment(data)"
                  v-tooltip.top="'Reintentar pago'"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Payment Details Dialog -->
    <Dialog
      v-model:visible="showPaymentDetails"
      :header="`Detalles del Pago #${selectedPayment?.id}`"
      :modal="true"
      :style="{ width: '600px' }"
    >
      <div v-if="selectedPayment" class="payment-details">
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">ID del Pago</span>
            <span class="detail-value font-mono">#{{ selectedPayment.id }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Monto</span>
            <span class="detail-value">{{
              formatPrice(selectedPayment.amount_cents, selectedPayment.currency)
            }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Estado</span>
            <Tag
              :value="getStatusLabel(selectedPayment.status)"
              :severity="getStatusSeverity(selectedPayment.status)"
              :icon="getStatusIcon(selectedPayment.status)"
            />
          </div>
          <div class="detail-item">
            <span class="detail-label">Método de Pago</span>
            <span class="detail-value">{{
              getPaymentMethodLabel(selectedPayment.payment_method)
            }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Gateway</span>
            <span class="detail-value">{{ selectedPayment.gateway.toUpperCase() }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Fecha de Creación</span>
            <span class="detail-value">{{ formatDateTime(selectedPayment.created_at) }}</span>
          </div>
          <div class="detail-item" v-if="selectedPayment.paid_at">
            <span class="detail-label">Fecha de Pago</span>
            <span class="detail-value">{{ formatDateTime(selectedPayment.paid_at) }}</span>
          </div>
          <div class="detail-item" v-if="selectedPayment.external_id">
            <span class="detail-label">ID Externo</span>
            <span class="detail-value font-mono text-sm">{{ selectedPayment.external_id }}</span>
          </div>
        </div>

        <div v-if="selectedPayment.description" class="mt-4">
          <h4 class="text-lg font-semibold mb-2">Descripción</h4>
          <p class="text-600">{{ selectedPayment.description }}</p>
        </div>

        <div
          v-if="selectedPayment.metadata && Object.keys(selectedPayment.metadata).length > 0"
          class="mt-4"
        >
          <h4 class="text-lg font-semibold mb-2">Metadatos</h4>
          <div class="metadata-container">
            <div v-for="(value, key) in selectedPayment.metadata" :key="key" class="metadata-item">
              <span class="metadata-key">{{ key }}:</span>
              <span class="metadata-value">{{ value }}</span>
            </div>
          </div>
        </div>
      </div>
    </Dialog>

    <!-- Payment Methods Dialog -->
    <Dialog
      v-model:visible="showPaymentMethods"
      header="Métodos de Pago"
      :modal="true"
      :style="{ width: '700px' }"
    >
      <PaymentMethodsManagement @close="showPaymentMethods = false" />
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSubscriptionStore } from '@/stores/subscriptions'
import { useToast } from 'primevue/usetoast'
import type { Payment, PaymentStats } from '@/types'

// Components
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import Calendar from 'primevue/calendar'
import InputText from 'primevue/inputtext'
import PaymentMethodsManagement from '@/components/payments/PaymentMethodsManagement.vue'

// Stores
const subscriptionStore = useSubscriptionStore()
const toast = useToast()

// State
const payments = ref<Payment[]>([])
const stats = ref<PaymentStats | null>(null)
const loading = ref(false)
const selectedPayment = ref<Payment | null>(null)
const showPaymentDetails = ref(false)
const showPaymentMethods = ref(false)

// Pagination
const totalPayments = ref(0)
const currentPage = ref(1)
const sortField = ref('created_at')
const sortOrder = ref(-1) // -1 for desc, 1 for asc

// Filters
const filters = ref({
  status: null,
  payment_method: null,
  date_from: null,
  date_to: null,
  search: '',
})

// Options
const _statusOptions = [
  { label: 'Todos', value: null },
  { label: 'Exitoso', value: 'succeeded' },
  { label: 'Pendiente', value: 'pending' },
  { label: 'Fallido', value: 'failed' },
  { label: 'Cancelado', value: 'cancelled' },
  { label: 'Reembolsado', value: 'refunded' },
]

const paymentMethodOptions = [
  { label: 'Todos', value: null },
  { label: 'Tarjeta de Crédito', value: 'card' },
  { label: 'Transferencia Bancaria', value: 'bank_transfer' },
  { label: 'PayPal', value: 'paypal' },
]

// Computed
const formatPrice = computed(() => subscriptionStore.formatPrice)

// Methods
const fetchPayments = async () => {
  try {
    loading.value = true
    const response = await subscriptionStore.getPaymentHistory({
      ...filters.value,
      per_page: 10,
      page: currentPage.value,
    })
    payments.value = response || []
    totalPayments.value = payments.value.length
  } catch (_error) {
    console.error('Error fetching payments:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los pagos',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    stats.value = await subscriptionStore.getPaymentStats()
  } catch (_error) {
    console.error('Error fetching stats:', error)
    // Fallback to local calculation
    stats.value = {
      total_payments: payments.value.length,
      total_amount_cents: payments.value.reduce((sum, p) => sum + p.amount_cents, 0),
      successful_payments: payments.value.filter((p) => p.status === 'succeeded').length,
      failed_payments: payments.value.filter((p) => p.status === 'failed').length,
      pending_payments: payments.value.filter((p) => p.status === 'pending').length,
      this_month_amount_cents: 0,
      last_month_amount_cents: 0,
    }
  }
}

const applyFilters = () => {
  currentPage.value = 1
  fetchPayments()
}

const clearFilters = () => {
  filters.value = {
    status: null,
    payment_method: null,
    date_from: null,
    date_to: null,
    search: '',
  }
  applyFilters()
}

const onSearchInput = () => {
  // Debounce search
  clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => {
    applyFilters()
  }, 500)
}

const onPageChange = (event: any) => {
  currentPage.value = event.page + 1
  fetchPayments()
}

const onSort = (event: any) => {
  sortField.value = event.sortField
  sortOrder.value = event.sortOrder
  fetchPayments()
}

const viewPayment = (payment: Payment) => {
  selectedPayment.value = payment
  showPaymentDetails.value = true
}

const downloadInvoice = (payment?: Payment) => {
  const targetPayment = payment || selectedPayment.value
  if (!targetPayment) return

  // TODO: Implement invoice download
  toast.add({
    severity: 'info',
    summary: 'Próximamente',
    detail: 'La descarga de facturas estará disponible pronto',
    life: 3000,
  })
}

const retryPayment = (_payment: Payment) => {
  // TODO: Implement payment retry
  toast.add({
    severity: 'info',
    summary: 'Próximamente',
    detail: 'La funcionalidad de reintento estará disponible pronto',
    life: 3000,
  })
}

// Utility functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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

const getStatusIcon = (status: string) => {
  const icons: Record<string, string> = {
    succeeded: 'pi pi-check',
    pending: 'pi pi-clock',
    failed: 'pi pi-times',
    cancelled: 'pi pi-ban',
    refunded: 'pi pi-refresh',
  }
  return icons[status] || 'pi pi-circle'
}

const getPaymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    card: 'Tarjeta de Crédito',
    bank_transfer: 'Transferencia Bancaria',
    paypal: 'PayPal',
    manual: 'Manual',
  }
  return labels[method] || method
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

// Search debounce
const searchTimeout = ref<NodeJS.Timeout | null>(null)

// Lifecycle
onMounted(() => {
  fetchPayments()
  fetchStats()
})
</script>

<style scoped>
.stat-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.stat-icon.success {
  background: var(--green-500);
}

.stat-icon.warning {
  background: var(--orange-500);
}

.stat-icon.danger {
  background: var(--red-500);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  font-weight: 500;
}

.payments-table {
  background: var(--surface-card);
  border-radius: 12px;
  overflow: hidden;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
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

.metadata-container {
  background: var(--surface-50);
  border-radius: 8px;
  padding: 1rem;
  max-height: 200px;
  overflow-y: auto;
}

.metadata-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--surface-border);
}

.metadata-item:last-child {
  border-bottom: none;
}

.metadata-key {
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.875rem;
}

.metadata-value {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
  font-family: monospace;
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
    font-size: 1.25rem;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
