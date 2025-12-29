<template>
  <div class="invoice-management">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Facturas</h2>
      <Button
        @click="fetchInvoices"
        :loading="loading"
        icon="pi pi-refresh"
        label="Actualizar"
        severity="secondary"
        size="small"
      />
    </div>

    <!-- Loading State -->
    <div v-if="loading && invoices.length === 0" class="flex justify-center py-8">
      <ProgressSpinner />
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && invoices.length === 0" class="text-center py-12">
      <i class="pi pi-file-pdf text-6xl text-gray-300 mb-4"></i>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No hay facturas</h3>
      <p class="text-gray-500">Aún no tienes facturas generadas.</p>
    </div>

    <!-- Invoices List -->
    <div v-else class="space-y-4">
      <Card v-for="invoice in invoices" :key="invoice.id" class="invoice-card">
        <template #content>
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <i class="pi pi-file-pdf text-red-500"></i>
                <h3 class="font-semibold text-gray-900">
                  Factura #{{ invoice.number || invoice.id.substring(0, 8) }}
                </h3>
                <Tag
                  :value="getStatusLabel(invoice.status)"
                  :severity="getStatusSeverity(invoice.status)"
                  size="small"
                />
              </div>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div>
                  <span class="font-medium">Fecha:</span>
                  <p>{{ formatDate(invoice.created) }}</p>
                </div>
                <div>
                  <span class="font-medium">Monto:</span>
                  <p class="font-semibold text-gray-900">
                    {{ formatCurrency(invoice.amount_paid, invoice.currency) }}
                  </p>
                </div>
                <div>
                  <span class="font-medium">Estado:</span>
                  <p>{{ getStatusLabel(invoice.status) }}</p>
                </div>
                <div v-if="invoice.due_date">
                  <span class="font-medium">Vencimiento:</span>
                  <p>{{ formatDate(invoice.due_date) }}</p>
                </div>
              </div>

              <div v-if="invoice.description" class="mt-2 text-sm text-gray-600">
                <span class="font-medium">Descripción:</span>
                <p>{{ invoice.description }}</p>
              </div>
            </div>

            <div class="flex gap-2 ml-4">
              <Button
                v-if="invoice.hosted_invoice_url"
                @click="viewInvoice(invoice.hosted_invoice_url)"
                icon="pi pi-eye"
                label="Ver"
                severity="secondary"
                size="small"
                outlined
              />
              <Button
                v-if="invoice.invoice_pdf"
                @click="downloadInvoice(invoice)"
                icon="pi pi-download"
                label="Descargar PDF"
                severity="primary"
                size="small"
                :loading="downloadingInvoice === invoice.id"
              />
            </div>
          </div>
        </template>
      </Card>

      <!-- Load More Button -->
      <div v-if="hasMore" class="text-center pt-4">
        <Button
          @click="loadMoreInvoices"
          :loading="loading"
          label="Cargar más facturas"
          severity="secondary"
          outlined
        />
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="mt-4">
      <Message severity="error" :closable="false">
        {{ error }}
      </Message>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSubscriptionStore } from '@/stores/subscriptions'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'

const subscriptionStore = useSubscriptionStore()
const toast = useToast()

// State
const loading = ref(false)
const error = ref<string | null>(null)
const invoices = ref<any[]>([])
const hasMore = ref(false)
const nextPage = ref<string | null>(null)
const downloadingInvoice = ref<string | null>(null)

// Methods
const fetchInvoices = async (loadMore = false) => {
  try {
    loading.value = true
    error.value = null

    const filters: any = { limit: 10 }
    if (loadMore && nextPage.value) {
      filters.starting_after = nextPage.value
    }

    const result = await subscriptionStore.getInvoices(filters)

    if (loadMore) {
      invoices.value = [...invoices.value, ...result.invoices]
    } else {
      invoices.value = result.invoices
    }

    hasMore.value = result.has_more
    nextPage.value = result.next_page
  } catch (err) {
    error.value = 'Error al cargar las facturas'
    console.error('Error fetching invoices:', err)
  } finally {
    loading.value = false
  }
}

const loadMoreInvoices = () => {
  fetchInvoices(true)
}

const downloadInvoice = async (invoice: any) => {
  try {
    downloadingInvoice.value = invoice.id

    const result = await subscriptionStore.downloadInvoice(invoice.id)

    if (result.pdf_url) {
      // Open PDF in new tab
      window.open(result.pdf_url, '_blank')
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No se pudo obtener la URL del PDF',
        life: 3000,
      })
    }
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo descargar la factura',
      life: 3000,
    })
    console.error('Error downloading invoice:', err)
  } finally {
    downloadingInvoice.value = null
  }
}

const viewInvoice = (url: string) => {
  window.open(url, '_blank')
}

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: 'Borrador',
    open: 'Abierta',
    paid: 'Pagada',
    void: 'Anulada',
    uncollectible: 'No cobrable',
  }
  return statusMap[status] || status
}

const getStatusSeverity = (status: string) => {
  const severityMap: Record<string, string> = {
    draft: 'secondary',
    open: 'warning',
    paid: 'success',
    void: 'danger',
    uncollectible: 'danger',
  }
  return severityMap[status] || 'secondary'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

// Lifecycle
onMounted(() => {
  fetchInvoices()
})
</script>

<style scoped>
.invoice-management {
  max-width: 100%;
}

.invoice-card {
  transition: all 0.2s ease;
}

.invoice-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
