<template>
  <div class="payment-methods-management">
    <!-- Add Payment Method Button -->
    <div class="flex justify-content-between align-items-center mb-4">
      <h3 class="text-xl font-semibold m-0">Métodos de Pago</h3>
      <Button
        label="Agregar Método"
        icon="pi pi-plus"
        severity="primary"
        @click="showAddMethod = true"
      />
    </div>

    <!-- Payment Methods List -->
    <div v-if="loading" class="text-center py-4">
      <i class="pi pi-spin pi-spinner text-2xl"></i>
      <p class="text-600 mt-2">Cargando métodos de pago...</p>
    </div>

    <div v-else-if="paymentMethods.length === 0" class="empty-state">
      <i class="pi pi-credit-card text-6xl text-400 mb-4"></i>
      <h4 class="text-lg font-semibold mb-2">No tienes métodos de pago</h4>
      <p class="text-600 mb-4">Agrega un método de pago para facilitar tus futuras compras.</p>
      <Button
        label="Agregar Primer Método"
        icon="pi pi-plus"
        severity="primary"
        @click="showAddMethod = true"
      />
    </div>

    <div v-else class="payment-methods-list">
      <div
        v-for="method in paymentMethods"
        :key="method.id"
        class="payment-method-card"
        :class="{ 'is-default': method.is_default }"
      >
        <div class="method-info">
          <div class="method-icon">
            <i :class="getMethodIcon(method.type)"></i>
          </div>
          <div class="method-details">
            <div class="method-type">{{ getMethodLabel(method.type) }}</div>
            <div class="method-details-text">
              <span v-if="method.card">
                {{ method.card.brand.toUpperCase() }} •••• {{ method.card.last4 }}
                <span class="expiry"
                  >Expira {{ method.card.exp_month }}/{{ method.card.exp_year }}</span
                >
              </span>
              <span v-else-if="method.bank_account">
                {{ method.bank_account.bank_name }} •••• {{ method.bank_account.last4 }}
              </span>
              <span v-else>{{ method.id }}</span>
            </div>
          </div>
        </div>

        <div class="method-actions">
          <Tag v-if="method.is_default" value="Predeterminado" severity="success" size="small" />
          <div class="action-buttons">
            <Button
              v-if="!method.is_default"
              icon="pi pi-star"
              severity="secondary"
              size="small"
              outlined
              @click="setAsDefault(method.id)"
              v-tooltip.top="'Establecer como predeterminado'"
            />
            <Button
              icon="pi pi-trash"
              severity="danger"
              size="small"
              outlined
              @click="confirmDelete(method)"
              v-tooltip.top="'Eliminar método'"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Add Payment Method Dialog -->
    <Dialog
      v-model:visible="showAddMethod"
      header="Agregar Método de Pago"
      :modal="true"
      :style="{ width: '500px' }"
      :closable="false"
    >
      <div class="add-method-content">
        <div class="method-type-selection">
          <h4 class="text-lg font-semibold mb-3">Selecciona el tipo de método</h4>
          <div class="method-options">
            <div
              v-for="type in methodTypes"
              :key="type.value"
              class="method-option"
              :class="{ selected: selectedMethodType === type.value }"
              @click="selectedMethodType = type.value"
            >
              <i :class="type.icon"></i>
              <span>{{ type.label }}</span>
            </div>
          </div>
        </div>

        <div v-if="selectedMethodType" class="method-form mt-4">
          <div v-if="selectedMethodType === 'card'" class="card-form">
            <h5 class="text-md font-semibold mb-3">Información de la Tarjeta</h5>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Número de Tarjeta</label>
                <InputText
                  v-model="cardForm.number"
                  placeholder="1234 5678 9012 3456"
                  class="w-full"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Nombre del Titular</label>
                <InputText v-model="cardForm.holder" placeholder="Juan Pérez" class="w-full" />
              </div>
              <div class="form-group">
                <label class="form-label">Mes de Expiración</label>
                <Select
                  v-model="cardForm.expMonth"
                  :options="monthOptions"
                  placeholder="MM"
                  class="w-full"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Año de Expiración</label>
                <Select
                  v-model="cardForm.expYear"
                  :options="yearOptions"
                  placeholder="YYYY"
                  class="w-full"
                />
              </div>
              <div class="form-group">
                <label class="form-label">CVC</label>
                <InputText v-model="cardForm.cvc" placeholder="123" class="w-full" />
              </div>
            </div>
          </div>

          <div v-else-if="selectedMethodType === 'bank_account'" class="bank-form">
            <h5 class="text-md font-semibold mb-3">Información Bancaria</h5>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Nombre del Banco</label>
                <InputText
                  v-model="bankForm.bankName"
                  placeholder="Banco Nacional"
                  class="w-full"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Número de Cuenta</label>
                <InputText
                  v-model="bankForm.accountNumber"
                  placeholder="1234567890"
                  class="w-full"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Código de Enrutamiento</label>
                <InputText
                  v-model="bankForm.routingNumber"
                  placeholder="123456789"
                  class="w-full"
                />
              </div>
            </div>
          </div>

          <div class="form-actions mt-4">
            <Checkbox v-model="setAsDefaultMethod" :binary="true" inputId="set-default" />
            <label for="set-default" class="ml-2">Establecer como método predeterminado</label>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-content-end gap-2">
          <Button label="Cancelar" severity="secondary" outlined @click="cancelAddMethod" />
          <Button
            label="Agregar"
            severity="primary"
            @click="addPaymentMethod"
            :loading="addingMethod"
            :disabled="!canAddMethod"
          />
        </div>
      </template>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
      v-model:visible="showDeleteConfirm"
      header="Eliminar Método de Pago"
      :message="`¿Estás seguro de que quieres eliminar este método de pago? Esta acción no se puede deshacer.`"
      acceptLabel="Eliminar"
      rejectLabel="Cancelar"
      acceptClass="p-button-danger"
      @accept="deletePaymentMethod"
      @reject="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSubscriptionStore } from '@/stores/subscriptions'
import { useToast } from 'primevue/usetoast'
import type { PaymentMethod } from '@/types'

// Components
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
import Tag from 'primevue/tag'
import ConfirmDialog from 'primevue/confirmdialog'

// Emits
const _emit = defineEmits<{
  close: []
}>()

// Stores
const subscriptionStore = useSubscriptionStore()
const toast = useToast()

// State
const paymentMethods = ref<PaymentMethod[]>([])
const loading = ref(false)
const showAddMethod = ref(false)
const showDeleteConfirm = ref(false)
const selectedMethodType = ref<string | null>(null)
const setAsDefaultMethod = ref(false)
const addingMethod = ref(false)
const methodToDelete = ref<PaymentMethod | null>(null)

// Form data
const cardForm = ref({
  number: '',
  holder: '',
  expMonth: null,
  expYear: null,
  cvc: '',
})

const bankForm = ref({
  bankName: '',
  accountNumber: '',
  routingNumber: '',
})

// Options
const methodTypes = [
  { label: 'Tarjeta de Crédito', value: 'card', icon: 'pi pi-credit-card' },
  { label: 'Cuenta Bancaria', value: 'bank_account', icon: 'pi pi-building' },
]

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  label: String(i + 1).padStart(2, '0'),
  value: i + 1,
}))

const yearOptions = Array.from({ length: 10 }, (_, i) => {
  const year = new Date().getFullYear() + i
  return { label: String(year), value: year }
})

// Computed
const canAddMethod = computed(() => {
  if (!selectedMethodType.value) return false

  if (selectedMethodType.value === 'card') {
    return (
      cardForm.value.number &&
      cardForm.value.holder &&
      cardForm.value.expMonth &&
      cardForm.value.expYear &&
      cardForm.value.cvc
    )
  }

  if (selectedMethodType.value === 'bank_account') {
    return bankForm.value.bankName && bankForm.value.accountNumber && bankForm.value.routingNumber
  }

  return false
})

// Methods
const fetchPaymentMethods = async () => {
  try {
    loading.value = true
    const methods = await subscriptionStore.getPaymentMethods()
    paymentMethods.value = methods || []
  } catch (_error) {
    console.error('Error fetching payment methods:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los métodos de pago',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

const addPaymentMethod = async () => {
  try {
    addingMethod.value = true

    // Simulate adding payment method
    // In production, this would integrate with Stripe
    const newMethod: PaymentMethod = {
      id: `pm_${Date.now()}`,
      type: selectedMethodType.value as 'card' | 'bank_account',
      card:
        selectedMethodType.value === 'card'
          ? {
              brand: 'visa',
              last4: cardForm.value.number.slice(-4),
              exp_month: cardForm.value.expMonth!,
              exp_year: cardForm.value.expYear!,
            }
          : undefined,
      bank_account:
        selectedMethodType.value === 'bank_account'
          ? {
              bank_name: bankForm.value.bankName,
              last4: bankForm.value.accountNumber.slice(-4),
              routing_number: bankForm.value.routingNumber,
            }
          : undefined,
      is_default: setAsDefaultMethod.value || paymentMethods.value.length === 0,
      created_at: new Date().toISOString(),
    }

    // If setting as default, remove default from others
    if (setAsDefaultMethod.value) {
      paymentMethods.value.forEach((method) => {
        method.is_default = false
      })
    }

    paymentMethods.value.unshift(newMethod)

    toast.add({
      severity: 'success',
      summary: 'Método Agregado',
      detail: 'El método de pago ha sido agregado exitosamente',
      life: 3000,
    })

    cancelAddMethod()
  } catch (_error) {
    console.error('Error adding payment method:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo agregar el método de pago',
      life: 3000,
    })
  } finally {
    addingMethod.value = false
  }
}

const setAsDefault = async (methodId: string) => {
  try {
    // Remove default from all methods
    paymentMethods.value.forEach((method) => {
      method.is_default = method.id === methodId
    })

    toast.add({
      severity: 'success',
      summary: 'Método Actualizado',
      detail: 'El método de pago ha sido establecido como predeterminado',
      life: 3000,
    })
  } catch (_error) {
    console.error('Error setting default method:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo actualizar el método predeterminado',
      life: 3000,
    })
  }
}

const confirmDelete = (method: PaymentMethod) => {
  methodToDelete.value = method
  showDeleteConfirm.value = true
}

const deletePaymentMethod = async () => {
  if (!methodToDelete.value) return

  try {
    await subscriptionStore.removePaymentMethod(methodToDelete.value.id)

    paymentMethods.value = paymentMethods.value.filter(
      (method) => method.id !== methodToDelete.value!.id,
    )

    toast.add({
      severity: 'success',
      summary: 'Método Eliminado',
      detail: 'El método de pago ha sido eliminado exitosamente',
      life: 3000,
    })
  } catch (_error) {
    console.error('Error deleting payment method:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo eliminar el método de pago',
      life: 3000,
    })
  } finally {
    showDeleteConfirm.value = false
    methodToDelete.value = null
  }
}

const cancelAddMethod = () => {
  showAddMethod.value = false
  selectedMethodType.value = null
  setAsDefaultMethod.value = false
  cardForm.value = {
    number: '',
    holder: '',
    expMonth: null,
    expYear: null,
    cvc: '',
  }
  bankForm.value = {
    bankName: '',
    accountNumber: '',
    routingNumber: '',
  }
}

const getMethodLabel = (type: string) => {
  const labels: Record<string, string> = {
    card: 'Tarjeta de Crédito',
    bank_account: 'Cuenta Bancaria',
    paypal: 'PayPal',
  }
  return labels[type] || type
}

const getMethodIcon = (type: string) => {
  const icons: Record<string, string> = {
    card: 'pi pi-credit-card',
    bank_account: 'pi pi-building',
    paypal: 'pi pi-paypal',
  }
  return icons[type] || 'pi pi-circle'
}

// Lifecycle
onMounted(() => {
  fetchPaymentMethods()
})
</script>

<style scoped>
.payment-methods-management {
  padding: 1rem 0;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background: var(--surface-50);
  border-radius: 12px;
  border: 2px dashed var(--surface-border);
}

.payment-methods-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.payment-method-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.payment-method-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.payment-method-card.is-default {
  border-color: var(--green-500);
  background: var(--green-50);
}

.method-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.method-icon {
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

.method-details {
  flex: 1;
}

.method-type {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.25rem;
}

.method-details-text {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.expiry {
  margin-left: 0.5rem;
  color: var(--text-color-secondary);
}

.method-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.add-method-content {
  padding: 1rem 0;
}

.method-type-selection {
  margin-bottom: 1.5rem;
}

.method-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.method-option {
  padding: 1rem;
  border: 2px solid var(--surface-border);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.method-option:hover {
  border-color: var(--primary-color);
  background: var(--primary-50);
}

.method-option.selected {
  border-color: var(--primary-color);
  background: var(--primary-100);
}

.method-option i {
  font-size: 2rem;
  color: var(--primary-color);
}

.method-option span {
  font-weight: 600;
  color: var(--text-color);
}

.method-form {
  border-top: 1px solid var(--surface-border);
  padding-top: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .payment-method-card {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .method-actions {
    justify-content: space-between;
  }

  .method-options {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
