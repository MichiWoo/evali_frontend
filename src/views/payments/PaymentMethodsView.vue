<template>
  <div class="grid">
    <div class="col-12">
      <!-- Header -->
      <div class="flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="text-3xl font-bold text-900 mb-2">Métodos de Pago</h1>
          <p class="text-600 m-0">Gestiona tus métodos de pago y facturación</p>
        </div>
        <div class="flex gap-2">
          <Button
            label="Volver al Dashboard"
            icon="pi pi-arrow-left"
            severity="secondary"
            outlined
            @click="goToDashboard"
          />
          <Button
            label="Agregar Método"
            icon="pi pi-plus"
            severity="primary"
            @click="showAddMethod = true"
          />
        </div>
      </div>

      <!-- Payment Methods Management -->
      <PaymentMethodsManagement @close="showAddMethod = false" />
    </div>

    <!-- Add Payment Method Dialog -->
    <Dialog
      v-model:visible="showAddMethod"
      header="Agregar Método de Pago"
      :modal="true"
      :style="{ width: '500px' }"
      :closable="false"
    >
      <PaymentMethodsManagement @close="showAddMethod = false" />
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import PaymentMethodsManagement from '@/components/payments/PaymentMethodsManagement.vue'

// Components
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'

// Router
const router = useRouter()

// State
const showAddMethod = ref(false)

// Methods
const goToDashboard = () => {
  router.push('/payments')
}
</script>

<style scoped>
/* Add any specific styles if needed */
</style>
