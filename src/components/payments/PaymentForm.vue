<template>
  <div class="payment-form">
    <div class="payment-form__header">
      <h3>Información de Pago</h3>
      <p>Completa la información para procesar tu suscripción</p>
    </div>

    <div class="payment-form__content">
      <!-- Plan Summary -->
      <div class="plan-summary" v-if="plan">
        <div class="plan-summary__header">
          <h4>{{ plan.name }}</h4>
          <div class="plan-summary__price">
            <span class="price-amount">{{ formatPrice(plan.price_cents) }}</span>
            <span class="price-interval">/{{ plan.interval === 'monthly' ? 'mes' : 'año' }}</span>
          </div>
        </div>
        <div class="plan-summary__features">
          <div class="feature-item" v-for="feature in getPlanFeatures(plan)" :key="feature">
            <i class="pi pi-check"></i>
            <span>{{ feature }}</span>
          </div>
        </div>
      </div>

      <!-- Stripe Payment Element -->
      <div class="stripe-payment-section">
        <h4>Información de Pago</h4>
        <div class="form-group">
          <label for="cardholder-name">Nombre del Titular de la Tarjeta</label>
          <InputText
            id="cardholder-name"
            v-model="cardholderName"
            placeholder="Juan Pérez"
            required
          />
        </div>

        <!-- Stripe Payment Element will be mounted here -->
        <div id="payment-element" class="stripe-payment-element">
          <!-- Stripe Elements will create form fields here -->
        </div>

        <!-- Development Mode Message -->
        <div v-if="showDevelopmentMessage" class="development-message">
          <div class="p-4 border border-orange-200 bg-orange-50 rounded-lg">
            <div class="flex items-center mb-2">
              <i class="pi pi-info-circle text-orange-600 mr-2"></i>
              <h4 class="text-orange-800 font-semibold">Modo de Desarrollo</h4>
            </div>
            <p class="text-orange-700 text-sm mb-3">
              Estás en modo de desarrollo. Para probar pagos reales, configura las claves de Stripe
              en el backend.
            </p>
            <div class="bg-white p-3 rounded border">
              <p class="text-sm text-gray-600 mb-2"><strong>Datos de prueba:</strong></p>
              <ul class="text-xs text-gray-500 space-y-1">
                <li>• Tarjeta: 4242 4242 4242 4242</li>
                <li>• Fecha: 12/25</li>
                <li>• CVC: 123</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Billing Address -->
      <div class="billing-address-section">
        <h4>Dirección de Facturación</h4>
        <div class="form-group">
          <label for="address-line1">Dirección Línea 1</label>
          <InputText
            id="address-line1"
            v-model="billingAddress.line1"
            placeholder="Calle, Número, Colonia"
            required
          />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="address-city">Ciudad</label>
            <InputText
              id="address-city"
              v-model="billingAddress.city"
              placeholder="Ciudad"
              required
            />
          </div>
          <div class="form-group">
            <label for="address-state">Estado</label>
            <InputText
              id="address-state"
              v-model="billingAddress.state"
              placeholder="Estado"
              required
            />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="address-postal_code">Código Postal</label>
            <InputText
              id="address-postal_code"
              v-model="billingAddress.postal_code"
              placeholder="12345"
              required
            />
          </div>
          <div class="form-group">
            <label for="address-country">País</label>
            <Select
              id="address-country"
              v-model="billingAddress.country"
              :options="countryOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Selecciona un país"
              required
            />
          </div>
        </div>
      </div>
    </div>

    <div class="payment-form__footer">
      <Button label="Cancelar" severity="secondary" @click="emit('cancel')" />
      <Button
        v-if="!showDevelopmentMessage"
        label="Pagar"
        icon="pi pi-check"
        :loading="loading"
        @click="handleSubmit"
      />
      <Button
        v-else
        label="Simular Pago (Desarrollo)"
        icon="pi pi-check"
        severity="warning"
        :loading="loading"
        @click="simulatePayment"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSubscriptionStore } from '@/stores/subscriptions'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import type { Plan } from '@/types'

// Stripe imports
import { loadStripe, type Stripe } from '@stripe/stripe-js'

const props = defineProps<{
  plan: Plan
  visible: boolean
}>()

const emit = defineEmits<{
  success: [subscription: any]
  cancel: []
}>()

const subscriptionStore = useSubscriptionStore()
const toast = useToast()

const loading = ref(false)
const cardholderName = ref('')
const billingAddress = ref({
  line1: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'MX', // Default to Mexico
})
const showDevelopmentMessage = ref(false)

const countryOptions = [
  { label: 'México', value: 'MX' },
  { label: 'Estados Unidos', value: 'US' },
  { label: 'Canadá', value: 'CA' },
]

// Stripe variables
let stripe: Stripe | null = null
let elements: any = null
let paymentElement: any = null

// Computed
const formatPrice = computed(() => subscriptionStore.formatPrice)
const getPlanFeatures = computed(() => subscriptionStore.getPlanFeatures)

onMounted(async () => {
  // Load Stripe.js
  stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string)
  if (!stripe) {
    console.error('Failed to load Stripe.js')
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo cargar Stripe',
      life: 5000,
    })
    emit('cancel')
    return
  }

  // Create payment intent to get client_secret
  try {
    const paymentIntent = await subscriptionStore.createPaymentIntent(props.plan.id)
    if (!paymentIntent || !paymentIntent.client_secret) {
      throw new Error('Failed to create payment intent or client secret is missing.')
    }

    // Check if we're in development mode with simulated client_secret
    if (
      paymentIntent.client_secret.includes('_secret_') &&
      paymentIntent.client_secret.startsWith('pi_')
    ) {
      console.warn('Development mode detected: Using simulated payment intent')
      // For development, we'll show a message instead of Stripe Elements
      showDevelopmentMessage.value = true
      return
    }

    // Create Stripe Elements
    elements = stripe.elements({ clientSecret: paymentIntent.client_secret })
    paymentElement = elements.create('payment', {
      layout: 'tabs',
      defaultValues: {
        billingDetails: {
          name: cardholderName.value,
          address: {
            line1: billingAddress.value.line1,
            city: billingAddress.value.city,
            state: billingAddress.value.state,
            postal_code: billingAddress.value.postal_code,
            country: billingAddress.value.country,
          },
        },
      },
    })
    paymentElement.mount('#payment-element')
  } catch (err: any) {
    console.error('Error initializing Stripe Elements:', err)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.message || 'No se pudo inicializar el formulario de pago.',
      life: 5000,
    })
    emit('cancel')
  }
})

onUnmounted(() => {
  if (paymentElement) {
    paymentElement.destroy()
  }
})

const handleSubmit = async () => {
  if (!stripe || !elements || !paymentElement) {
    console.error('Stripe.js has not loaded or elements are not initialized.')
    return
  }

  if (!cardholderName.value.trim()) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'El nombre del titular es requerido',
      life: 3000,
    })
    return
  }

  loading.value = true
  try {
    // Submit the payment form
    const { error: submitError } = await elements.submit()

    if (submitError) {
      toast.add({
        severity: 'error',
        summary: 'Error de Validación',
        detail: submitError.message,
        life: 5000,
      })
      loading.value = false
      return
    }

    // Confirm payment with Stripe
    const { paymentIntent, error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
        payment_method_data: {
          billing_details: {
            name: cardholderName.value,
            address: {
              line1: billingAddress.value.line1,
              city: billingAddress.value.city,
              state: billingAddress.value.state,
              postal_code: billingAddress.value.postal_code,
              country: billingAddress.value.country,
            },
          },
        },
      },
      redirect: 'if_required',
    })

    if (error) {
      toast.add({ severity: 'error', summary: 'Error de Pago', detail: error.message, life: 5000 })
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Confirm the payment in your backend
      const subscription = await subscriptionStore.confirmPayment(paymentIntent.id, props.plan.id)
      emit('success', subscription)
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error de Pago',
        detail: 'El pago no se pudo procesar correctamente.',
        life: 5000,
      })
    }
  } catch (err: any) {
    console.error('Error during payment process:', err)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.message || 'Ocurrió un error inesperado durante el pago.',
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

// Simulate payment for development mode
const simulatePayment = async () => {
  try {
    loading.value = true

    // Simulate a successful payment
    const mockSubscription = {
      id: Date.now(),
      plan_id: props.plan.id,
      status: 'active',
      plan: props.plan,
      created_at: new Date().toISOString(),
    }

    toast.add({
      severity: 'success',
      summary: 'Pago Simulado',
      detail: 'Pago procesado exitosamente (modo desarrollo)',
      life: 5000,
    })

    emit('success', mockSubscription)
  } catch (err: any) {
    console.error('Error simulating payment:', err)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al simular el pago',
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.payment-form {
  max-width: 600px;
  margin: 0 auto;
}

.payment-form__header {
  text-align: center;
  margin-bottom: 2rem;
}

.payment-form__header h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
}

.payment-form__header p {
  margin: 0;
  color: var(--text-color-secondary);
}

.plan-summary {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.plan-summary__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.plan-summary__header h4 {
  margin: 0;
  color: var(--text-color);
}

.plan-summary__price {
  text-align: right;
}

.price-amount {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color);
}

.price-interval {
  color: var(--text-color-secondary);
  margin-left: 0.25rem;
}

.plan-summary__features {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.feature-item i {
  color: var(--green-500);
  font-size: 0.8rem;
}

.stripe-payment-section {
  margin-bottom: 2rem;
}

.stripe-payment-section h4 {
  margin: 0 0 1rem 0;
  color: var(--text-color);
}

.stripe-payment-element {
  margin: 1rem 0;
  padding: 1rem;
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  background: var(--surface-card);
}

.billing-address-section {
  margin-bottom: 2rem;
}

.billing-address-section h4 {
  margin: 0 0 1rem 0;
  color: var(--text-color);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.payment-form__footer {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--surface-border);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .payment-form__footer {
    flex-direction: column;
  }
}
</style>
