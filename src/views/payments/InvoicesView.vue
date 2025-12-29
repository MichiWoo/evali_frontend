<template>
  <div class="invoices-view">
    <div class="container mx-auto px-4 py-6">
      <!-- Header -->
      <div class="mb-6">
        <nav class="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <router-link to="/dashboard" class="hover:text-gray-700">Dashboard</router-link>
          <i class="pi pi-chevron-right text-xs"></i>
          <router-link to="/payments" class="hover:text-gray-700">Pagos</router-link>
          <i class="pi pi-chevron-right text-xs"></i>
          <span class="text-gray-900">Facturas</span>
        </nav>

        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Facturas</h1>
            <p class="text-gray-600 mt-1">Gestiona y descarga tus facturas de Stripe</p>
          </div>
        </div>
      </div>

      <!-- Invoice Management Component -->
      <InvoiceManagement />
    </div>
  </div>
</template>

<script setup lang="ts">
import InvoiceManagement from '@/components/payments/InvoiceManagement.vue'
</script>

<style scoped>
.invoices-view {
  min-height: 100vh;
  background-color: #f8fafc;
}

.container {
  max-width: 1200px;
}
</style>
